import Link from "next/link";

export const metadata = { title: "Merci — Questionnaire de fin de stage" };

export default function Merci() {
  return (
    <main className="container narrow">
      <div className="card center">
        <div className="check-icon" aria-hidden="true">✓</div>
        <h1>Merci de votre participation !</h1>
        <p>Vos réponses ont bien été enregistrées, de façon anonyme.</p>
        <p className="muted">Bonne continuation dans votre formation.</p>
        <Link href="/" className="btn">
          Retour au questionnaire
        </Link>
      </div>
    </main>
  );
}
