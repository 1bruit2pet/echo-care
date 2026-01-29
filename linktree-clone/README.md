# LinkTree Clone

Une application haute performance de partage de liens, construite avec la Jamstack moderne.

## Stack Technologique

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Langage:** TypeScript
- **Données:** Abstraction Mock (Prêt pour Supabase/PostgreSQL)
- **Icons:** Lucide React

## Démarrage Rapide

1.  Installation des dépendances :
    ```bash
    npm install
    ```

2.  Lancer le serveur de développement :
    ```bash
    npm run dev
    ```

3.  Ouvrir `http://localhost:3000` ou `http://localhost:3000/demo` pour voir un profil.

## Structure du Projet

- `app/`: Routes et pages (App Router).
- `components/`: Composants UI réutilisables (LinkCard, ProfileHeader).
- `lib/data.ts`: Couche de données. Actuellement simule une base de données. C'est ici que vous connecterez Supabase.

## Passage en Production (Supabase)

Pour connecter une vraie base de données :

1.  Créez un projet sur [Supabase](https://supabase.com).
2.  Créez les tables `profiles` et `links`.
3.  Installez le client : `npm install @supabase/supabase-js`.
4.  Créez `.env.local` avec vos clés API.
5.  Modifiez `lib/data.ts` pour utiliser le client Supabase au lieu de l'objet `MOCK_DB`.

## Déploiement

Ce projet est optimisé pour **Vercel**.

1.  Poussez le code sur GitHub.
2.  Importez le projet sur Vercel.
3.  Le déploiement se fera automatiquement avec des fonctions Serverless pour le rendu.

## Performance

- Utilisation de `next/image` pour l'optimisation automatique des assets.
- Rendu côté serveur (SSR) pour un SEO optimal et un chargement rapide (LCP).
- CSS minimal via Tailwind.

## Notes pour l'environnement local (Android/Termux)

Si vous rencontrez des erreurs liées à `swc-android-arm64`, un fichier `.babelrc` a été inclus pour utiliser Babel à la place du compilateur Rust SWC. Cela permet de faire fonctionner le projet localement sur des architectures mobiles. Pour le déploiement sur Vercel, vous pouvez supprimer `.babelrc` pour profiter des performances de SWC.
