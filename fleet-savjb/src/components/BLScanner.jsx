import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Check, X, Plus, Minus, Trash2 } from 'lucide-react';

const BLScanner = ({ onScanComplete, onClose }) => {
  const [scannedItems, setScannedItems] = useState([]); 
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "bl-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, disableFlip: false },
      /* verbose= */ false
    );
    scannerRef.current = scanner;

    const onScanSuccess = (decodedText) => {
      // We can't easily access the latest scannedItems state here inside the callback 
      // without adding it to dependency array, which re-inits scanner.
      // So we use the functional update form of setScannedItems which is safe.
      
      setScannedItems(prevItems => {
        if (prevItems.some(item => item.ref === decodedText)) {
           // duplicate
           return prevItems;
        }
        
        console.log(`Scan successful: ${decodedText}`);
        const newItem = {
          ref: decodedText,
          nom: `Article ${decodedText}`, 
          quantity: 1,
          id: decodedText 
        };
        return [...prevItems, newItem];
      });
    };

    scanner.render(onScanSuccess, (err) => { /* ignore errors */ });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, []); 

  const handleQuantityChange = (ref, delta) => {
    setScannedItems(prevItems =>
      prevItems.map(item =>
        item.ref === ref ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const handleRemoveItem = (ref) => {
    setScannedItems(prevItems => prevItems.filter(item => item.ref !== ref));
  };

  const handleConfirmEntry = () => {
    if (scannedItems.length === 0) {
      alert("Aucun article scanné à ajouter.");
      return;
    }
    onScanComplete(scannedItems);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-center">Scanner Bon de Livraison</h2>
      <div id="bl-reader" className="w-full bg-slate-100 rounded-lg overflow-hidden mb-4"></div>
      
      {scannedItems.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-700">Articles sur le BL :</h3>
          {scannedItems.map(item => (
            <div key={item.ref} className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{item.nom}</p>
                <p className="text-xs text-slate-500">Réf: {item.ref}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleQuantityChange(item.ref, -1)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"><Minus size={16} /></button>
                <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.ref, 1)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"><Plus size={16} /></button>
                <button onClick={() => handleRemoveItem(item.ref)} className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-slate-100 font-medium hover:bg-slate-200 transition flex items-center justify-center gap-2">
          <X size={20} /> Annuler
        </button>
        <button onClick={handleConfirmEntry} disabled={scannedItems.length === 0} className="flex-1 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <Check size={20} /> Valider Entrée
        </button>
      </div>
    </div>
  );
};

export default BLScanner;