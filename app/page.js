import QuestionnaireForm from "./QuestionnaireForm";

export default function Home() {
  return (
    <main className="container">
      <header className="hero">
        <p className="eyebrow">Hôpital Louis Mourier · Service d'Hépato-Gastro-Entérologie</p>
        <h1>Questionnaire de fin de stage</h1>
        <p className="lead">
          Votre avis nous aide à améliorer l'accueil et l'encadrement des stagiaires. Cela prend environ 5 minutes.
        </p>
        <p className="anon">
          <strong>100 % anonyme</strong> — aucun nom, e-mail, adresse IP ni date précise n'est enregistré.
          Évitez simplement d'écrire votre nom dans les champs libres.
        </p>
      </header>
      <QuestionnaireForm />
    </main>
  );
}
