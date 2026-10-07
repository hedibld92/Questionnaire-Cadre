import { Redis } from "@upstash/redis";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const KEY = "questionnaire-hge:responses";

// L'intégration Vercel peut ajouter un préfixe personnalisé (ex. STORAGE_KV_REST_API_URL) :
// on accepte donc toute variable se terminant par le nom attendu.
function findEnv(...suffixes) {
  for (const suffix of suffixes) {
    if (process.env[suffix]) return process.env[suffix];
    const key = Object.keys(process.env).find((k) => k.endsWith(`_${suffix}`) && process.env[k]);
    if (key) return process.env[key];
  }
}

const url = findEnv("UPSTASH_REDIS_REST_URL", "KV_REST_API_URL", "REST_API_URL");
const token = findEnv("UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN", "REST_API_TOKEN");
const redis = url && token ? new Redis({ url, token }) : null;

// Sans Redis (développement local), on stocke dans un fichier JSON.
const LOCAL_FILE = path.join(process.cwd(), ".data", "responses.json");

function assertStorage() {
  if (!redis && process.env.VERCEL) {
    throw new Error(
      "Base de données non configurée : ajoutez l'intégration Upstash Redis à votre projet Vercel (voir README)."
    );
  }
}

async function readLocal() {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeLocal(data) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(data, null, 2));
}

// Seul le mois de dépôt est conservé (pas d'heure précise) pour garantir l'anonymat.
export async function saveResponse(answers) {
  assertStorage();
  const now = new Date();
  const response = {
    id: crypto.randomUUID(),
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    answers,
  };
  if (redis) {
    await redis.hset(KEY, { [response.id]: JSON.stringify(response) });
  } else {
    const data = await readLocal();
    data[response.id] = response;
    await writeLocal(data);
  }
  return response.id;
}

export async function listResponses() {
  assertStorage();
  let values;
  if (redis) {
    const all = (await redis.hgetall(KEY)) || {};
    values = Object.values(all).map((v) => (typeof v === "string" ? JSON.parse(v) : v));
  } else {
    values = Object.values(await readLocal());
  }
  // Ordre : mois le plus récent d'abord (pas d'ordre d'arrivée précis, volontairement).
  return values.sort((a, b) => b.month.localeCompare(a.month));
}

export async function deleteResponse(id) {
  assertStorage();
  if (redis) {
    await redis.hdel(KEY, id);
  } else {
    const data = await readLocal();
    delete data[id];
    await writeLocal(data);
  }
}
