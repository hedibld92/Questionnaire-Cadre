# Questionnaire de fin de stage — HGE Louis Mourier

Site anonyme pour que les stagiaires remplissent le questionnaire de fin de stage, et espace admin (`/admin`) avec statistiques, toutes les réponses et export Excel.

## Anonymat

- Aucun nom, e-mail, adresse IP, navigateur ni heure précise n'est enregistré.
- Seul le **mois** de dépôt est conservé (pour pouvoir filtrer par période).
- Les réponses ne contiennent que les champs du questionnaire ; tout le reste est ignoré par le serveur.

## Mise en ligne sur Vercel

1. Mettez ce dossier sur GitHub (ou utilisez `npx vercel` directement depuis le dossier).
2. Sur [vercel.com](https://vercel.com) : **Add New → Project** → importez le dépôt → **Deploy**.
3. Dans le projet Vercel, onglet **Storage** → **Create Database** / **Marketplace** → choisissez **Upstash for Redis** (offre gratuite) → connectez-la au projet.
   Les variables `KV_REST_API_URL` / `KV_REST_API_TOKEN` (ou `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) sont ajoutées automatiquement.
4. Onglet **Settings → Environment Variables** : ajoutez `ADMIN_PASSWORD` avec un mot de passe solide.
5. Onglet **Deployments** → **Redeploy** pour prendre en compte les variables.

C'est prêt :
- Questionnaire : `https://votre-projet.vercel.app/`
- Admin : `https://votre-projet.vercel.app/admin`

Astuce : générez un QR code de l'adresse du questionnaire et affichez-le dans le service.

## En local

```bash
npm install
echo "ADMIN_PASSWORD=test" > .env.local
npm run dev
```

Sans Redis configuré, les réponses sont enregistrées dans `.data/responses.json`.

## Modifier les questions

Toutes les questions sont définies dans `lib/questions.js` (formulaire, statistiques et export s'adaptent automatiquement).
