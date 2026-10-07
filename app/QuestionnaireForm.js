"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SECTIONS, YES_NO, isVisible } from "@/lib/questions";

const DONE_KEY = "hge-questionnaire-envoye";

export default function QuestionnaireForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState({});
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);

  useEffect(() => {
    try {
      setAlreadySent(localStorage.getItem(DONE_KEY) === "1");
    } catch {}
  }, []);

  const set = (id, value) => setAnswers((a) => ({ ...a, [id]: value }));

  const toggleMulti = (id, value) =>
    setAnswers((a) => {
      const cur = a[id] || [];
      return { ...a, [id]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });

  const isMissing = (q) => {
    if (!q.required || !isVisible(q, answers)) return false;
    if (q.type === "grid") return q.rows.some((r) => !answers[r.id]);
    const v = answers[q.id];
    return v == null || v === "" || (Array.isArray(v) && v.length === 0);
  };

  const allQuestions = SECTIONS.flatMap((s) => s.questions);
  const required = allQuestions.filter((q) => q.required && isVisible(q, answers));
  const answered = required.filter((q) => !isMissing(q)).length;

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const firstMissing = allQuestions.find(isMissing);
    if (firstMissing) {
      setShowErrors(true);
      setError("Il manque des réponses obligatoires (signalées en rouge).");
      document.getElementById(`q-${firstMissing.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi.");
      try {
        localStorage.setItem(DONE_KEY, "1");
      } catch {}
      router.push("/merci");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {alreadySent && (
        <div className="notice">
          Vous avez déjà envoyé ce questionnaire depuis cet appareil. Vous pouvez tout de même en remplir un nouveau
          si une autre personne l'utilise.
        </div>
      )}

      {/* Champ piège anti-robots, invisible pour les humains */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hp"
        aria-hidden="true"
      />

      {SECTIONS.map((section) => (
        <section key={section.id} className="card">
          <h2>{section.title}</h2>
          {section.intro && <p className="intro">{section.intro}</p>}
          {section.questions
            .filter((q) => isVisible(q, answers))
            .map((q) => (
              <Question
                key={q.id}
                q={q}
                answers={answers}
                set={set}
                toggleMulti={toggleMulti}
                invalid={showErrors && isMissing(q)}
                compact={section.id === "informations"}
              />
            ))}
        </section>
      ))}

      <div className="submit-bar">
        <div className="progress" aria-live="polite">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(answered / Math.max(required.length, 1)) * 100}%` }} />
          </div>
          <span>
            {answered}/{required.length} questions obligatoires
          </span>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? "Envoi…" : "Envoyer mes réponses"}
        </button>
      </div>
    </form>
  );
}

function Question({ q, answers, set, toggleMulti, invalid, compact }) {
  const cls = `question${invalid ? " invalid" : ""}${compact ? " compact" : ""}`;
  const req = q.required ? <span className="req" aria-label="obligatoire">*</span> : null;

  if (q.type === "yesno") {
    return (
      <fieldset id={`q-${q.id}`} className={`${cls} row`}>
        <legend>
          {q.label} {req}
        </legend>
        <div className="pills">
          {YES_NO.map((o) => (
            <label key={o.value} className={`pill${answers[q.id] === o.value ? " on" : ""}`}>
              <input
                type="radio"
                name={q.id}
                value={o.value}
                checked={answers[q.id] === o.value}
                onChange={() => set(q.id, o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (q.type === "select") {
    return (
      <div id={`q-${q.id}`} className={cls}>
        <label htmlFor={`f-${q.id}`} className="qlabel">
          {q.label} {req}
        </label>
        <select id={`f-${q.id}`} value={answers[q.id] || ""} onChange={(e) => set(q.id, e.target.value)}>
          <option value="" disabled>
            Choisir…
          </option>
          {q.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (q.type === "text" || q.type === "textarea") {
    const Tag = q.type === "text" ? "input" : "textarea";
    return (
      <div id={`q-${q.id}`} className={`${cls}${q.showIf ? " sub" : ""}`}>
        <label htmlFor={`f-${q.id}`} className="qlabel">
          {q.label} {req}
        </label>
        <Tag
          id={`f-${q.id}`}
          rows={q.type === "textarea" ? 3 : undefined}
          maxLength={3000}
          value={answers[q.id] || ""}
          onChange={(e) => set(q.id, e.target.value)}
        />
      </div>
    );
  }

  if (q.type === "multi") {
    const cur = answers[q.id] || [];
    return (
      <fieldset id={`q-${q.id}`} className={cls}>
        <legend>
          {q.label} {req}
        </legend>
        {q.hint && <p className="hint">{q.hint}</p>}
        <div className="checks">
          {q.options.map((o) => (
            <label key={o.value} className={`check${cur.includes(o.value) ? " on" : ""}`}>
              <input type="checkbox" checked={cur.includes(o.value)} onChange={() => toggleMulti(q.id, o.value)} />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (q.type === "grid") {
    return (
      <fieldset id={`q-${q.id}`} className={cls}>
        <legend>
          {q.label} {req}
        </legend>
        <div className="grid-q">
          {q.rows.map((row) => (
            <div key={row.id} className={`grid-row${invalid && !answers[row.id] ? " missing" : ""}`}>
              <span className="grid-label">{row.label}</span>
              <div className="pills">
                {q.columns.map((c) => (
                  <label key={c.value} className={`pill${answers[row.id] === c.value ? " on" : ""}`}>
                    <input
                      type="radio"
                      name={row.id}
                      checked={answers[row.id] === c.value}
                      onChange={() => set(row.id, c.value)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    );
  }

  if (q.type === "scale") {
    const nums = Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i);
    return (
      <fieldset id={`q-${q.id}`} className={cls}>
        <legend>
          {q.label} {req}
        </legend>
        <div className="scale">
          {nums.map((n) => (
            <label key={n} className={`scale-btn${answers[q.id] === n ? " on" : ""}`}>
              <input type="radio" name={q.id} checked={answers[q.id] === n} onChange={() => set(q.id, n)} />
              {n}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return null;
}
