/**
 * Exemple de script pour générer une image en utilisant une API d'IA.
 *
 * Instructions :
 * 1. Remplacez `VOTRE_CLE_API` par votre véritable clé API.
 * 2. Remplacez `URL_DE_L_API_IMAGE` par l'URL du point de terminaison de l'API que vous utilisez.
 * 3. Exécutez ce script avec Node.js : node image_generation_example.js
 * 4. Le script créera un fichier 'generated_image.png' dans le même répertoire.
 */

// Utilisez 'node-fetch' si vous exécutez ce script dans un environnement Node.js plus ancien.
// Pour les versions modernes, 'fetch' est global.
// Vous devrez peut-être installer 'node-fetch': npm install node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

const API_KEY = 'VOTRE_CLE_API'; // <-- METTEZ VOTRE CLÉ API ICI
const API_URL = 'URL_DE_L_API_IMAGE'; // <-- METTEZ L'URL DE L'API ICI
// Exemple pour Stability AI : https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image

async function generateImage(promptText) {
  if (API_KEY === 'VOTRE_CLE_API' || API_URL === 'URL_DE_L_API_IMAGE') {
    console.error('Erreur : Veuillez remplacer VOTRE_CLE_API et URL_DE_L_API_IMAGE dans le script.');
    return;
  }

  console.log('Envoi de la requête à l\'API...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: promptText,
          },
        ],
        cfg_scale: 7,
        height: 512,
        width: 512,
        samples: 1,
        steps: 30,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur de l\'API : ${response.status} ${await response.text()}`);
    }

    const data = await response.json();

    if (data.artifacts && data.artifacts.length > 0) {
      const imageArtifact = data.artifacts[0];
      if (imageArtifact.base64) {
        console.log('Image reçue, enregistrement dans le fichier...');
        fs.writeFileSync('generated_image.png', Buffer.from(imageArtifact.base64, 'base64'));
        console.log('Image enregistrée sous "generated_image.png"');
      }
    } else {
      console.error('Aucune image n\'a été retournée dans la réponse de l\'API.');
    }
  } catch (error) {
    console.error('Une erreur est survenue :', error.message);
  }
}

// -- MODIFIEZ LE PROMPT ICI --
const myPrompt = 'un chat robotique mignon dans un style cyberpunk, néon';
// -------------------------

generateImage(myPrompt);
