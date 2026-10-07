import { isAdmin } from "@/lib/auth";
import { ALL_QUESTIONS, optionLabel } from "@/lib/questions";
import { listResponses } from "@/lib/store";

export const dynamic = "force-dynamic";

function columns() {
  const cols = [{ key: "month", label: "Mois", get: (r) => r.month }];
  for (const q of ALL_QUESTIONS) {
    if (q.type === "grid") {
      for (const row of q.rows) {
        cols.push({
          key: row.id,
          label: `Acquis — ${row.label}`,
          get: (r) => (r.answers[row.id] ? q.columns.find((c) => c.value === r.answers[row.id])?.label : ""),
        });
      }
    } else {
      cols.push({
        key: q.id,
        label: q.adminLabel || q.label,
        get: (r) => {
          const v = r.answers[q.id];
          if (v == null) return "";
          if (Array.isArray(v)) return v.map((x) => optionLabel(q, x)).join(", ");
          if (q.type === "yesno" || q.type === "select") return optionLabel(q, v);
          return String(v);
        },
      });
    }
  }
  return cols;
}

function cell(v) {
  const s = String(v ?? "");
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Non autorisé", { status: 401 });
  const responses = await listResponses();
  const cols = columns();
  const lines = [cols.map((c) => cell(c.label)).join(";")];
  for (const r of responses) lines.push(cols.map((c) => cell(c.get(r))).join(";"));
  // BOM + point-virgule : s'ouvre correctement dans Excel (version française).
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="questionnaire-hge-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
