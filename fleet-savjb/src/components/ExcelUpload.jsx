import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { UploadCloud, CheckCircle, XCircle } from 'lucide-react';

const ExcelUpload = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage('');
      setError('');
    }
  };

  const processFile = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          if (!json.length) {
            throw new Error("Le fichier est vide ou ne contient pas de données valides.");
          }

          const batch = writeBatch(db);
          const inventoryRef = collection(db, "inventory");
          let updateCount = 0;

          for (const row of json) {
            const ref = String(row['code Article']);
            const nom = row['CC article'];
            const stock = parseInt(row['Stock Réel'], 10);

            if (!ref || !nom || isNaN(stock)) {
              console.warn("Ligne ignorée en raison de données manquantes/invalides:", row);
              continue; // Skip invalid rows
            }

            const docRef = doc(inventoryRef, ref);
            batch.set(docRef, {
              ref: ref,
              nom: nom,
              stock: stock,
              lastUpdated: new Date()
            }, { merge: true }); // Use merge to update existing documents or create new ones
            updateCount++;
          }

          await batch.commit();
          setMessage(`Importation réussie ! ${updateCount} articles mis à jour.`);
          if (onUploadSuccess) {
            onUploadSuccess();
          }
          onClose(); // Close modal after success
        } catch (innerError) {
          setError(`Erreur lors du traitement du fichier: ${innerError.message}`);
          console.error("Error processing file:", innerError);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (outerError) {
      setError(`Erreur de lecture du fichier: ${outerError.message}`);
      console.error("Error reading file:", outerError);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Importer Inventaire Excel</h2>

        <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 mb-4 flex flex-col items-center justify-center">
          <input
            type="file"
            id="excel-file-upload"
            className="hidden"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
          />
          <label
            htmlFor="excel-file-upload"
            className="cursor-pointer flex flex-col items-center text-indigo-600 hover:text-indigo-800 transition"
          >
            <UploadCloud size={48} />
            <span className="mt-2 text-sm font-medium">
              {file ? file.name : "Cliquez pour sélectionner un fichier"}
            </span>
          </label>
        </div>

        {file && (
          <p className="text-sm text-slate-600 mb-4">Fichier sélectionné : <span className="font-semibold">{file.name}</span></p>
        )}

        {error && (
          <p className="text-red-600 text-sm mb-4 flex items-center justify-center gap-2">
            <XCircle size={18} /> {error}
          </p>
        )}

        {message && (
          <p className="text-emerald-600 text-sm mb-4 flex items-center justify-center gap-2">
            <CheckCircle size={18} /> {message}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-slate-100 font-medium hover:bg-slate-200 transition"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={processFile}
            className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !file}
          >
            {loading ? 'Importation...' : 'Importer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload;
