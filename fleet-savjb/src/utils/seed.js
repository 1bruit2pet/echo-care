import { db } from "../firebase";
import { collection, doc, setDoc, writeBatch, getDocs } from "firebase/firestore";
import nomenclature from "../data/nomenclature.json";

export const seedDatabase = async () => {
  try {
    const batch = writeBatch(db);
    const inventoryRef = collection(db, "inventory");

    console.log(`Starting seed of ${nomenclature.length} items...`);

    nomenclature.forEach((item) => {
      // Use 'ref' as the document ID for easy lookup
      const docRef = doc(inventoryRef, String(item.ref)); 
      batch.set(docRef, {
        ref: String(item.ref),
        nom: item.nom,
        stock: item.stock,
        lastUpdated: new Date()
      });
    });

    await batch.commit();
    console.log("Database seeded successfully!");
    alert("Base de données réinitialisée avec les données par défaut !");
  } catch (error) {
    console.error("Error seeding database:", error);
    alert("Erreur: " + error.message);
  }
};

export const clearDatabase = async () => {
  try {
    const inventoryRef = collection(db, "inventory");
    const snapshot = await getDocs(inventoryRef);
    
    if (snapshot.empty) {
      alert("La base est déjà vide.");
      return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("Database cleared successfully!");
    alert("Tout l'inventaire a été supprimé !");
  } catch (error) {
    console.error("Error clearing database:", error);
    alert("Erreur lors de la suppression: " + error.message);
  }
};