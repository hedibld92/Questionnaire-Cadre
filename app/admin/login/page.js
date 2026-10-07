import { redirect } from "next/navigation";
import { isAdmin, passwordConfigured } from "@/lib/auth";
import { login } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Connexion admin — Questionnaire HGE" };

export default async function LoginPage({ searchParams }) {
  if (await isAdmin()) redirect("/admin");
  const { erreur } = await searchParams;

  return (
    <main className="container narrow">
      <form action={login} className="card login">
        <h1>Espace administrateur</h1>
        {!passwordConfigured() ? (
          <p className="error">
            Aucun mot de passe n'est configuré. Ajoutez la variable d'environnement <code>ADMIN_PASSWORD</code> dans
            Vercel puis redéployez.
          </p>
        ) : (
          <>
            <label htmlFor="password" className="qlabel">
              Mot de passe
            </label>
            <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
            {erreur && <p className="error">Mot de passe incorrect.</p>}
            <button type="submit" className="btn primary">
              Se connecter
            </button>
          </>
        )}
      </form>
    </main>
  );
}
