// Définition unique du questionnaire : utilisée par le formulaire, la validation
// côté serveur, les statistiques de l'espace admin et l'export CSV.

export const YES_NO = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
];

export const SATISFACTION = [
  { value: "tres_satisfaisant", label: "Très satisfaisant" },
  { value: "satisfaisant", label: "Satisfaisant" },
  { value: "peu_satisfaisant", label: "Peu satisfaisant" },
];

export const SECTIONS = [
  {
    id: "profil",
    title: "Votre formation",
    questions: [
      {
        id: "formation",
        type: "select",
        label: "Formation",
        required: true,
        options: [
          { value: "ifsi", label: "Infirmier(e) — IFSI" },
          { value: "ifas", label: "Aide-soignant(e) — IFAS" },
          { value: "auxiliaire_puericulture", label: "Auxiliaire de puériculture" },
          { value: "medecine", label: "Étudiant(e) en médecine" },
          { value: "autre", label: "Autre" },
        ],
      },
      {
        id: "annee",
        type: "select",
        label: "Année d'étude",
        required: true,
        options: [
          { value: "1", label: "1re année" },
          { value: "2", label: "2e année" },
          { value: "3", label: "3e année" },
          { value: "autre", label: "Autre" },
        ],
      },
    ],
  },
  {
    id: "accueil",
    title: "L'accueil",
    questions: [
      { id: "accueil", type: "yesno", label: "Avez-vous bénéficié d'un accueil ?", required: true },
      {
        id: "accueil_par",
        type: "text",
        label: "Si oui, par qui ?",
        adminLabel: "Accueil réalisé par",
        showIf: { id: "accueil", value: "oui" },
      },
    ],
  },
  {
    id: "informations",
    title: "Les informations reçues",
    intro: "Avez-vous reçu les informations concernant :",
    questions: [
      { id: "info_organisation_etablissement", type: "yesno", label: "L'organisation de l'établissement", required: true },
      { id: "info_fonctionnement_service", type: "yesno", label: "Le fonctionnement du service", required: true },
      { id: "info_specificite_service", type: "yesno", label: "La spécificité du service", required: true },
      { id: "info_organisation_soins", type: "yesno", label: "L'organisation des soins", required: true },
      { id: "info_outils_protocoles", type: "yesno", label: "Les outils et protocoles de soins", required: true },
      { id: "info_composition_equipe", type: "yesno", label: "La composition de l'équipe", required: true },
      { id: "info_planning", type: "yesno", label: "Votre planning de stage (horaires, repas…)", required: true },
      { id: "info_badge", type: "yesno", label: "Un badge nominatif", required: true },
    ],
  },
  {
    id: "encadrement",
    title: "L'encadrement",
    questions: [
      {
        id: "tuteur",
        type: "yesno",
        label: "Un tuteur a-t-il été désigné pour vous accompagner au cours du stage ?",
        required: true,
      },
      { id: "objectifs", type: "yesno", label: "Avez-vous élaboré des objectifs de stage ?", required: true },
      {
        id: "objectifs_presentes",
        type: "text",
        label: "Si oui, ces objectifs ont-ils été présentés, et à qui ?",
        adminLabel: "Objectifs présentés à",
        showIf: { id: "objectifs", value: "oui" },
      },
      { id: "bilan_mi_stage", type: "yesno", label: "Le bilan de mi-stage a-t-il été effectué ?", required: true },
      {
        id: "bilan_mi_stage_par",
        type: "text",
        label: "Si oui, par qui ?",
        adminLabel: "Bilan de mi-stage effectué par",
        showIf: { id: "bilan_mi_stage", value: "oui" },
      },
      {
        id: "evaluation_presence",
        type: "multi",
        label: "L'évaluation de mi-stage a été faite en présence de :",
        hint: "Plusieurs réponses possibles",
        options: [
          { value: "cadre", label: "Cadre du service" },
          { value: "tuteur", label: "Tuteur" },
          { value: "equipe", label: "Équipe soignante" },
          { value: "etudiant", label: "Étudiant" },
        ],
      },
    ],
  },
  {
    id: "bilan",
    title: "Bilan d'apprentissage",
    questions: [
      {
        id: "acquis",
        type: "grid",
        label: "Le développement de vos acquis au cours du stage",
        required: true,
        columns: SATISFACTION,
        rows: [
          { id: "acquis_soins_base", label: "Des soins de base" },
          { id: "acquis_soins_techniques", label: "Des soins techniques" },
          { id: "acquis_soins_relationnels", label: "Des soins relationnels" },
          { id: "acquis_soins_educatifs", label: "Des soins éducatifs" },
        ],
      },
      {
        id: "competences",
        type: "textarea",
        label: "Quelles compétences particulières avez-vous pu acquérir ou développer pendant le stage ?",
      },
      { id: "objectifs_atteints", type: "yesno", label: "Avez-vous atteint vos objectifs ?", required: true },
      {
        id: "objectifs_non_pourquoi",
        type: "textarea",
        label: "Si non, pourquoi ?",
        adminLabel: "Objectifs non atteints : pourquoi ?",
        showIf: { id: "objectifs_atteints", value: "non" },
      },
      { id: "difficultes", type: "yesno", label: "Avez-vous rencontré des difficultés durant le stage ?", required: true },
      {
        id: "difficultes_lesquelles",
        type: "textarea",
        label: "Si oui, lesquelles ?",
        adminLabel: "Difficultés rencontrées",
        showIf: { id: "difficultes", value: "oui" },
      },
      {
        id: "suggestions",
        type: "textarea",
        label: "Avez-vous des suggestions ou des propositions à nous soumettre afin d'améliorer la prise en charge des stagiaires ?",
      },
      { id: "plus_apprecie", type: "textarea", label: "Qu'avez-vous le plus apprécié ?" },
      { id: "moins_apprecie", type: "textarea", label: "Qu'avez-vous le moins apprécié ?" },
      { id: "note", type: "scale", label: "Donnez une note globale entre 1 et 10", required: true, min: 1, max: 10 },
    ],
  },
];

export const ALL_QUESTIONS = SECTIONS.flatMap((s) => s.questions);

export const TEXT_MAX = 3000;

export function isVisible(question, answers) {
  if (!question.showIf) return true;
  return answers[question.showIf.id] === question.showIf.value;
}

export function optionLabel(question, value) {
  const opts = question.type === "yesno" ? YES_NO : question.options || [];
  return opts.find((o) => o.value === value)?.label ?? value;
}

// Valide et nettoie les réponses envoyées par le formulaire.
// Ne conserve que les champs connus : rien d'autre (IP, navigateur…) n'est stocké.
export function sanitizeAnswers(raw) {
  if (!raw || typeof raw !== "object") return { error: "Réponses invalides." };
  const clean = {};
  const missing = [];

  for (const q of ALL_QUESTIONS) {
    if (!isVisible(q, clean)) continue;

    if (q.type === "grid") {
      for (const row of q.rows) {
        const v = raw[row.id];
        if (q.columns.some((c) => c.value === v)) clean[row.id] = v;
        else if (q.required) missing.push(row.label);
      }
      continue;
    }

    const v = raw[q.id];
    switch (q.type) {
      case "yesno":
      case "select": {
        const opts = q.type === "yesno" ? YES_NO : q.options;
        if (opts.some((o) => o.value === v)) clean[q.id] = v;
        else if (q.required) missing.push(q.label);
        break;
      }
      case "multi": {
        const arr = Array.isArray(v) ? v : [];
        const vals = q.options.map((o) => o.value).filter((o) => arr.includes(o));
        if (vals.length) clean[q.id] = vals;
        else if (q.required) missing.push(q.label);
        break;
      }
      case "scale": {
        const n = Number(v);
        if (Number.isInteger(n) && n >= q.min && n <= q.max) clean[q.id] = n;
        else if (q.required) missing.push(q.label);
        break;
      }
      case "text":
      case "textarea": {
        const s = typeof v === "string" ? v.trim().slice(0, TEXT_MAX) : "";
        if (s) clean[q.id] = s;
        else if (q.required) missing.push(q.label);
        break;
      }
    }
  }

  if (missing.length) return { error: "Merci de répondre à toutes les questions obligatoires.", missing };
  return { answers: clean };
}
