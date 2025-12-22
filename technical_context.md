# Contexte Technique : Echo-Care Infrastructure

## Stack Frontend
- **Framework :** React + Vite.
- **Styling :** Tailwind CSS (Design System "Indigo-Premium").
- **Icons :** Lucide-React.
- **Déploiement :** Vercel (Frontend) via GitHub CI/CD.

## Stack Backend & IA
- **IA Engine :** Gemini 2.5 Flash (Transcription & Transformation en JSON RPG).
- **Database :** Firebase Firestore (Silos par famille pour isolation RGPD).
- **Storage :** Scaleway Object Storage (Paris) pour les fichiers audio.

## Contraintes Critiques
- **Sécurité :** Chiffrement AES-256 au repos.
- **Performance :** Génération de quête < 5 secondes.
- **Architecture :** Serverless pour scalabilité Solo-Corp.
