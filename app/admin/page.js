import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { ALL_QUESTIONS, SECTIONS, SATISFACTION, optionLabel } from "@/lib/questions";
import { listResponses } from "@/lib/store";
import { logout, removeResponse } from "./actions";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Statistiques — Questionnaire HGE" };

const q = (id) => ALL_QUESTIONS.find((x) => x.id === id);
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

function monthLabel(m) {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export default async function AdminPage({ searchParams }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const params = await searchParams;
  const tab = params.onglet === "reponses" ? "reponses" : "stats";
  const filters = { formation: params.formation || "", annee: params.annee || "", mois: params.mois || "" };

  let all;
  let loadError = null;
  try {
    all = await listResponses();
  } catch (e) {
    all = [];
    loadError = e.message;
  }

  const months = [...new Set(all.map((r) => r.month))].sort().reverse();
  const responses = all.filter(
    (r) =>
      (!filters.formation || r.answers.formation === filters.formation) &&
      (!filters.annee || r.answers.annee === filters.annee) &&
      (!filters.mois || r.month === filters.mois)
  );

  const qs = (extra) => {
    const p = new URLSearchParams({ ...filters, ...extra });
    for (const [k, v] of [...p]) if (!v) p.delete(k);
    return `/admin?${p}`;
  };

  return (
    <main className="container wide">
      <header className="admin-head">
        <div>
          <p className="eyebrow">HGE Louis Mourier · Espace administrateur</p>
          <h1>Questionnaires de fin de stage</h1>
        </div>
        <div className="head-actions">
          <a href="/api/export" className="btn">
            Exporter (CSV / Excel)
          </a>
          <form action={logout}>
            <button className="btn ghost">Déconnexion</button>
          </form>
        </div>
      </header>

      {loadError && <p className="error card">{loadError}</p>}

      <form className="filters card" method="get" action="/admin">
        <input type="hidden" name="onglet" value={tab} />
        <FilterSelect name="formation" label="Formation" value={filters.formation} options={q("formation").options} />
        <FilterSelect name="annee" label="Année" value={filters.annee} options={q("annee").options} />
        <FilterSelect
          name="mois"
          label="Mois"
          value={filters.mois}
          options={months.map((m) => ({ value: m, label: monthLabel(m) }))}
        />
        <button className="btn primary small">Filtrer</button>
        {(filters.formation || filters.annee || filters.mois) && (
          <Link href={`/admin?onglet=${tab}`} className="btn ghost small">
            Réinitialiser
          </Link>
        )}
      </form>

      <nav className="tabs">
        <Link href={qs({ onglet: "stats" })} className={tab === "stats" ? "on" : ""}>
          Statistiques
        </Link>
        <Link href={qs({ onglet: "reponses" })} className={tab === "reponses" ? "on" : ""}>
          Toutes les réponses ({responses.length})
        </Link>
      </nav>

      {responses.length === 0 ? (
        <div className="card center muted">Aucune réponse pour le moment{all.length ? " avec ces filtres" : ""}.</div>
      ) : tab === "stats" ? (
        <Stats responses={responses} />
      ) : (
        <ResponsesList responses={responses} />
      )}
    </main>
  );
}

function FilterSelect({ name, label, value, options }) {
  return (
    <label className="filter">
      <span>{label}</span>
      <select name={name} defaultValue={value}>
        <option value="">Tous</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------- Statistiques ---------- */

function Stats({ responses }) {
  const n = responses.length;
  const notes = responses.map((r) => r.answers.note).filter((x) => typeof x === "number");
  const avg = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : null;
  const yesRate = (id) => {
    const ans = responses.map((r) => r.answers[id]).filter(Boolean);
    return { yes: ans.filter((v) => v === "oui").length, total: ans.length };
  };
  const obj = yesRate("objectifs_atteints");
  const diff = yesRate("difficultes");
  const tut = yesRate("tuteur");

  return (
    <div className="stats">
      <div className="kpis">
        <Kpi label="Réponses" value={n} />
        <Kpi label="Note globale moyenne" value={avg == null ? "—" : `${avg.toFixed(1).replace(".", ",")} / 10`} />
        <Kpi label="Objectifs atteints" value={`${pct(obj.yes, obj.total)} %`} sub={`${obj.yes} sur ${obj.total}`} />
        <Kpi label="Tuteur désigné" value={`${pct(tut.yes, tut.total)} %`} sub={`${tut.yes} sur ${tut.total}`} />
        <Kpi label="Ont rencontré des difficultés" value={`${pct(diff.yes, diff.total)} %`} sub={`${diff.yes} sur ${diff.total}`} />
      </div>

      <div className="two-col">
        <section className="card">
          <h2>Note globale</h2>
          <NoteHistogram notes={notes} />
        </section>
        <section className="card">
          <h2>Profil des répondants</h2>
          <h3>Formation</h3>
          <Distribution question={q("formation")} responses={responses} />
          <h3>Année d'étude</h3>
          <Distribution question={q("annee")} responses={responses} />
        </section>
      </div>

      <section className="card">
        <h2>Développement des acquis</h2>
        <SatisfactionChart question={q("acquis")} responses={responses} />
      </section>

      {SECTIONS.filter((s) => s.questions.some((x) => x.type === "yesno")).map((s) => (
        <section key={s.id} className="card">
          <h2>{s.title}</h2>
          {s.intro && <p className="intro">{s.intro}</p>}
          <div className="bars">
            {s.questions
              .filter((x) => x.type === "yesno")
              .map((x) => {
                const { yes, total } = yesRate(x.id);
                return (
                  <Bar
                    key={x.id}
                    label={x.label}
                    ratio={total ? yes / total : 0}
                    value={`${pct(yes, total)} % oui`}
                    detail={`${yes} oui · ${total - yes} non`}
                  />
                );
              })}
          </div>
          {s.id === "encadrement" && (
            <>
              <h3>Évaluation de mi-stage faite en présence de</h3>
              <Distribution question={q("evaluation_presence")} responses={responses} multi />
            </>
          )}
        </section>
      ))}

      <section className="card">
        <h2>Réponses libres</h2>
        <div className="free-grid">
          {ALL_QUESTIONS.filter((x) => x.type === "text" || x.type === "textarea").map((x) => {
            const texts = responses.map((r) => r.answers[x.id]).filter(Boolean);
            return (
              <details key={x.id} className="free" open={texts.length > 0 && texts.length <= 5}>
                <summary>
                  {x.adminLabel || x.label} <span className="count">{texts.length}</span>
                </summary>
                {texts.length ? (
                  <ul>
                    {texts.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Aucune réponse.</p>
                )}
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, sub }) {
  return (
    <div className="kpi card">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {sub && <span className="kpi-sub">{sub}</span>}
    </div>
  );
}

function Bar({ label, ratio, value, detail }) {
  return (
    <div className="bar-row" title={`${label} — ${value}${detail ? ` (${detail})` : ""}`}>
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${ratio * 100}%` }} />
      </div>
      <span className="bar-value">
        {value}
        {detail && <small>{detail}</small>}
      </span>
    </div>
  );
}

function Distribution({ question, responses, multi }) {
  const counts = Object.fromEntries(question.options.map((o) => [o.value, 0]));
  let total = 0;
  for (const r of responses) {
    const v = r.answers[question.id];
    if (v == null) continue;
    total++;
    for (const x of multi ? v : [v]) if (x in counts) counts[x]++;
  }
  const base = multi ? responses.length : total;
  return (
    <div className="bars">
      {question.options.map((o) => (
        <Bar
          key={o.value}
          label={o.label}
          ratio={base ? counts[o.value] / base : 0}
          value={`${pct(counts[o.value], base)} %`}
          detail={`${counts[o.value]} réponse${counts[o.value] > 1 ? "s" : ""}`}
        />
      ))}
    </div>
  );
}

function SatisfactionChart({ question, responses }) {
  return (
    <>
      <div className="legend">
        {SATISFACTION.map((c, i) => (
          <span key={c.value}>
            <i className={`sw s${i}`} /> {c.label}
          </span>
        ))}
      </div>
      <div className="bars">
        {question.rows.map((row) => {
          const vals = responses.map((r) => r.answers[row.id]).filter(Boolean);
          const total = vals.length;
          return (
            <div key={row.id} className="bar-row">
              <span className="bar-label">{row.label}</span>
              <div className="stack">
                {SATISFACTION.map((c, i) => {
                  const k = vals.filter((v) => v === c.value).length;
                  if (!k) return null;
                  return (
                    <div
                      key={c.value}
                      className={`seg s${i}`}
                      style={{ flexGrow: k }}
                      title={`${row.label} — ${c.label} : ${k} (${pct(k, total)} %)`}
                    >
                      {pct(k, total) >= 12 && `${pct(k, total)} %`}
                    </div>
                  );
                })}
              </div>
              <span className="bar-value">
                <small>{total} réponses</small>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function NoteHistogram({ notes }) {
  const counts = Array.from({ length: 10 }, (_, i) => notes.filter((n) => n === i + 1).length);
  const max = Math.max(...counts, 1);
  return (
    <div className="histo" role="img" aria-label={`Répartition des notes : ${counts.map((c, i) => `${i + 1}/10 : ${c}`).join(", ")}`}>
      {counts.map((c, i) => (
        <div key={i} className="histo-col" title={`Note ${i + 1} : ${c} réponse${c > 1 ? "s" : ""}`}>
          <span className="histo-count">{c || ""}</span>
          <div className="histo-bar" style={{ height: `${(c / max) * 100}%` }} />
          <span className="histo-label">{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Liste des réponses ---------- */

function formatAnswer(question, value) {
  if (Array.isArray(value)) return value.map((v) => optionLabel(question, v)).join(", ");
  if (question.type === "yesno" || question.type === "select") return optionLabel(question, value);
  if (question.type === "scale") return `${value} / 10`;
  return value;
}

function ResponsesList({ responses }) {
  return (
    <div className="responses">
      {responses.map((r, idx) => (
        <article key={r.id} className="card response">
          <header>
            <div>
              <strong>Réponse n°{responses.length - idx}</strong>
              <span className="muted"> · {monthLabel(r.month)}</span>
            </div>
            <div className="response-meta">
              {r.answers.note != null && <span className="badge">{r.answers.note}/10</span>}
              <form action={removeResponse}>
                <input type="hidden" name="id" value={r.id} />
                <DeleteButton />
              </form>
            </div>
          </header>
          {SECTIONS.map((s) => (
            <div key={s.id} className="resp-section">
              <h3>{s.title}</h3>
              <dl>
                {s.questions.flatMap((x) =>
                  x.type === "grid"
                    ? x.rows.map((row) => (
                        <Item key={row.id} label={`${x.label} — ${row.label}`} value={optionLabel({ options: x.columns }, r.answers[row.id])} />
                      ))
                    : r.answers[x.id] != null
                      ? [<Item key={x.id} label={x.adminLabel || x.label} value={formatAnswer(x, r.answers[x.id])} />]
                      : []
                )}
              </dl>
            </div>
          ))}
        </article>
      ))}
    </div>
  );
}

function Item({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
