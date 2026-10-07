import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "hge_admin";

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest();
}

function sessionToken() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return crypto.createHmac("sha256", pw).update("hge-admin-session-v1").digest("hex");
}

export function passwordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || typeof input !== "string") return false;
  return crypto.timingSafeEqual(sha256(input), sha256(pw));
}

export async function createSession() {
  (await cookies()).set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin() {
  const expected = sessionToken();
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!expected || !value) return false;
  return crypto.timingSafeEqual(sha256(value), sha256(expected));
}
