/**
 * Exemple de script pour générer une image avec Google Imagen (Vertex AI).
 *
 * Pré-requis :
 * 1. Un projet Google Cloud avec l'API Vertex AI activée.
 * 2. Authentification configurée (gcloud auth application-default login ou variable d'environnement GOOGLE_APPLICATION_CREDENTIALS).
 * 3. Le paquet 'google-auth-library' peut être nécessaire pour gérer l'authentification automatiquement,
 *    mais cet exemple utilise une approche REST simple avec un Token d'accès manuel pour la clarté.
 *
 * Instructions :
 * 1. Remplacez `VOTRE_PROJET_ID` par l'ID de votre projet GCP.
 * 2. Obtenez un token d'accès (par ex: `gcloud auth print-access-token`) et remplacez `VOTRE_ACCESS_TOKEN`.
 * 3. Exécutez : node google_imagen_example.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

const PROJECT_ID = 'VOTRE_PROJET_ID';
const LOCATION = 'us-central1'; // Imagen est souvent disponible dans us-central1
const ACCESS_TOKEN = 'VOTRE_ACCESS_TOKEN'; // À récupérer via gcloud ou une librairie d'auth

// URL de l'API Vertex AI pour Imagen
const API_URL = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration:predict`;

async function generateImageImagen(promptText) {
  if (PROJECT_ID === 'VOTRE_PROJET_ID' || ACCESS_TOKEN === 'VOTRE_ACCESS_TOKEN') {
    console.error('Erreur : Veuillez configurer PROJECT_ID et ACCESS_TOKEN dans le script.');
    return;
  }

  console.log(`Génération de l'image pour : "${promptText}" avec Google Imagen...`);

  const requestBody = {
    instances: [
      {
        prompt: promptText
      }
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: "1:1" // Options: "1:1", "3:4", "4:3", "16:9", "9:16"
      // seed: 12345, // Optionnel
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Vertex AI (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (data.predictions && data.predictions.length > 0) {
      const base64Image = data.predictions[0].bytesBase64Encoded;
      
      if (base64Image) {
        const fileName = 'imagen_output.png';
        fs.writeFileSync(fileName, Buffer.from(base64Image, 'base64'));
        console.log(`Succès ! Image enregistrée sous "${fileName}"`);
      }
    } else {
      console.log('Aucune image retournée. Réponse complète :', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('Erreur lors de la génération :', error.message);
  }
}

// -- Prompt --
const prompt = 'un paysage futuriste avec des villes flottantes, style peinture à l\'huile détaillée';
generateImageImagen(prompt);
