import { NextResponse } from "next/server";
import { sanitizeAnswers } from "@/lib/questions";
import { saveResponse } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Champ piège invisible : rempli uniquement par les robots.
  if (body?.website) return NextResponse.json({ ok: true });

  const result = sanitizeAnswers(body?.answers);
  if (result.error) return NextResponse.json(result, { status: 400 });

  try {
    await saveResponse(result.answers);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Enregistrement impossible pour le moment. Réessayez plus tard." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
