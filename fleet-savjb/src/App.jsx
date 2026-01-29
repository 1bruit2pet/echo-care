import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, orderBy, limit, getDoc, writeBatch } from 'firebase/firestore'; // Added getDoc, writeBatch
import {
  LayoutDashboard, Package, AlertTriangle, PlusCircle,
  Search, TrendingUp, DollarSign, Filter, Download, ArrowUpRight,
  FileText, Plus, MapPin, Bell, Wifi, WifiOff, X, Scan, History, Share2, Trash2, CheckCircle,
  Check, Minus
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import clsx from 'clsx';
import ExcelUpload from './components/ExcelUpload';
import KPICard from './components/KPICard';
import BLScanner from './components/BLScanner'; // Imported BLScanner
import { seedDatabase, clearDatabase } from './utils/seed';


function App() {
  // --- States ---
  const [view, setView] = useState('dashboard'); // 'dashboard', 'stock', 'history', 'scanner'
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemForInter, setSelectedItemForInter] = useState(null); // For decrementing
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); // For Rapport Rapide
  const [isBLScannerOpen, setIsBLScannerOpen] = useState(false); // For Entrée de Stock
  const [alertMessage, setAlertMessage] = useState(null); // For critical stock 0
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // --- Constants ---
  const CRITICAL_STOCK_THRESHOLD = 5; // Default threshold for 'seuil' if not defined per item

  // --- Effects ---
  // Online/Offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch Inventory
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ensure each item has a 'seuil' property, defaulting to CRITICAL_STOCK_THRESHOLD
      setInventory(items.map(item => ({ ...item, seuil: item.seuil || CRITICAL_STOCK_THRESHOLD })));
    });
    return () => unsub();
  }, []);

  // Fetch History
  useEffect(() => {
    const q = query(collection(db, "history"), orderBy("timestamp", "desc"), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(history);
    });
    return () => unsub();
  }, []);


  // --- Computed Values (useMemo for performance) ---
  const filteredItems = useMemo(() => {
    return inventory.filter(item =>
      item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ref.includes(searchTerm)
    );
  }, [inventory, searchTerm]);

  const stats = useMemo(() => {
    const totalStock = inventory.reduce((acc, item) => acc + (Number(item.stock) || 0), 0);
    const alerts = inventory.filter(item => Number(item.stock) <= Number(item.seuil)).length;
    const newItems = 0; // Placeholder for now, could be based on 'lastUpdated'

    return { totalStock, alerts, newItems };
  }, [inventory]);

  // --- Handlers ---
  const handleDecrement = async (item) => {
    if (Number(item.stock) <= 0) {
      setAlertMessage(`CRITIQUE: Stock déjà à 0 pour ${item.nom}`);
      return;
    }

    try {
      const newStock = Number(item.stock) - 1;
      await updateDoc(doc(db, "inventory", item.id), { stock: newStock });

      // Log history
      await addDoc(collection(db, "history"), {
        itemId: item.id,
        itemName: item.nom,
        action: 'decrement',
        timestamp: new Date(),
        details: 'Pose client'
      });

      if (newStock === 0) {
        setAlertMessage(`ALERTE STOCK: ${item.nom} est maintenant en rupture de stock !`);
      }

      setSelectedItemForInter(null); // Close modal after action
    } catch (e) {
      console.error("Error updating stock:", e);
      alert("Erreur lors de la mise à jour: " + e.message);
    }
  };

  const handleIncrement = async (item) => {
    try {
      const newStock = Number(item.stock) + 1;
      await updateDoc(doc(db, "inventory", item.id), { stock: newStock });
      // Log history
      await addDoc(collection(db, "history"), {
        itemId: item.id,
        itemName: item.nom,
        action: 'increment',
        timestamp: new Date(),
        details: 'Réapprovisionnement'
      });
    } catch (e) {
      console.error("Error updating stock:", e);
      alert("Erreur lors de l'incrémentation: " + e.message);
    }
  }


  const handleScanSuccess = (decodedText) => {
    // Attempt to find item by Ref
    const item = inventory.find(i => i.ref === decodedText);
    if (item) {
      setSelectedItemForInter(item); // Open intervention modal for scanned item
      setView('stock'); // Switch to stock view to show item highlighted
      // setBLScannerOpen(false); // Close BL scanner if open
      alert(`Article trouvé: ${item.nom}`);
    } else {
      alert(`Article non trouvé pour le code: ${decodedText}`);
    }
  };

  const shareMissingItems = () => {
    // Filter items below critical threshold, not just 0
    const needsRestock = inventory.filter(item => Number(item.stock) <= CRITICAL_STOCK_THRESHOLD);
    
    if (needsRestock.length === 0) {
      alert("Aucune pièce n'est sous le seuil critique.");
      return;
    }

    const date = new Date().toLocaleDateString();
    const text = `🚨 *DEMANDE EXPRESS PIÈCES* - ${date}\n\n` +
                 `Merci de préparer :\n\n` +
                 needsRestock.map(item => {
                   const missingQty = Math.max(0, CRITICAL_STOCK_THRESHOLD - Number(item.stock)); // Suggest quantity to reach threshold? Or just list them.
                   // Let's just list the item and current stock for clarity
                   return `📦 *${item.nom}*\n   Réf: ${item.ref}\n   Stock actuel: ${item.stock} (Seuil: ${item.seuil})`;
                 }).join('\n\n') +
                 `\n\n_Généré via MEDISTOCK Pro_`;
    
    // Fallback for non-WhatsApp/SMS environments
    if (navigator.share) {
      navigator.share({
        title: "Demande Express Pièces",
        text: text,
      }).catch(console.error);
    } else {
      // Direct WhatsApp link
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }
    setIsShareModalOpen(false);
  };

  const handleBLScanComplete = async (scannedItems) => {
    // This is where we update Firestore with the scanned items
    try {
      const batch = writeBatch(db);
      for (const scannedItem of scannedItems) {
        const itemRef = doc(db, "inventory", scannedItem.ref); // Use ref as ID
        // Fetch current item to update stock
        const itemDoc = await getDoc(itemRef);
        let newStock = scannedItem.quantity;
        let itemName = scannedItem.nom; // Fallback to scanned name

        if (itemDoc.exists()) {
            const currentData = itemDoc.data();
            newStock += Number(currentData.stock);
            itemName = currentData.nom; // Use existing name if found
        }
        
        // Update or create document in inventory
        batch.set(itemRef, {
            ref: scannedItem.ref,
            nom: itemName, // Update name if it changed or use placeholder
            stock: newStock,
            seuil: scannedItem.seuil || CRITICAL_STOCK_THRESHOLD, // Also set threshold for new items
            lastUpdated: new Date()
        }, { merge: true });

        // Log history for each item
        await addDoc(collection(db, "history"), {
            itemId: scannedItem.ref,
            itemName: itemName,
            action: 'reaprovisionnement',
            quantity: scannedItem.quantity,
            timestamp: new Date(),
            details: `Ajouté via BL, nouvelle quantité: ${newStock}`
        });
      }
      await batch.commit();
      alert(`Entrée de stock validée pour ${scannedItems.length} articles.`);
      setIsBLScannerOpen(false); // Close modal
    } catch (e) {
      console.error("Error processing BL scan:", e);
      alert("Erreur lors de l'entrée de stock: " + e.message);
    }
  };


  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Fleet SAVJB</h1>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-300 opacity-80" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-300 animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImportModal(true)} className="text-xs bg-indigo-800 px-2 py-1 rounded hover:bg-indigo-600 transition">
              Importer Excel
            </button>
            <button onClick={() => setShowSeedConfirm(true)} className="text-xs bg-indigo-800 px-2 py-1 rounded hover:bg-indigo-600 transition">
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-2xl mx-auto pb-24">

        {/* Alerts (Critical Stock 0) */}
        {alertMessage && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-bounce-in border-l-8 border-red-500">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertTriangle className="w-8 h-8" />
                <h2 className="text-xl font-bold">ATTENTION</h2>
              </div>
              <p className="text-lg font-medium text-slate-800 mb-6">{alertMessage}</p>
              <button
                onClick={() => setAlertMessage(null)}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Compris
              </button>
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <KPICard label="Pièces à Bord" value={stats.totalStock} icon={<Package />} color="blue" />
              <KPICard label="Alertes Stock" value={stats.alerts} icon={<AlertTriangle />} color="rose" />
              {/* <KPICard label="Nouveautés" value={stats.newItems} icon={<Bell />} color="purple" /> */}" {/* Removed for now, as 'newItems' logic is not yet implemented */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xl font-black mb-2 flex items-center gap-2 italic"><FileText /> Demande Express Pièce</h4>
                      <p className="text-blue-100 text-sm mb-8 opacity-90 leading-relaxed">Générez une commande pour toutes les pièces sous le seuil critique et envoyez-la au dépôt.</p>
                    </div>
                    <button onClick={() => setIsShareModalOpen(true)} className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all">
                      Préparer la demande
                    </button>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <h4 className="text-xl font-black mb-2 flex items-center gap-2"><Scan className="text-blue-500" /> Entrée de Stock</h4>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">Utilisez l'appareil photo pour scanner un bon de livraison et ajouter les pièces automatiquement.</p>
                    <button onClick={() => setIsBLScannerOpen(true)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                      Scanner un BL
                    </button>
                 </div>
              </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <h3 className="font-bold text-slate-800 mb-2">Dernières Poses</h3>
              <div className="divide-y divide-slate-100">
                {logs.slice(0, 5).map(log => (
                  <div key={log.id} className="py-2">
                    <p className="font-medium text-slate-800">{log.itemName}</p>
                    <p className="text-xs text-slate-500">
                      {log.action === 'decrement' ? 'Pose effectuée' : log.action} • {new Date(log.timestamp?.toDate()).toLocaleString()}
                    </p>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-slate-400 text-sm">Aucune pose enregistrée.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Stock Camion View */}
        {view === 'stock' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-black px-2 tracking-tight">Inventaire Roulant</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher (Nom ou Réf)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {filteredItems.map(item => {
                const isCritical = Number(item.stock) === 0;
                const isLow = Number(item.stock) <= Number(item.seuil);
                return (
                  <div key={item.id} className={clsx(
                    "bg-white p-5 rounded-[2rem] border-2 flex items-center gap-4 transition-all shadow-sm",
                    isCritical ? 'border-rose-500 shadow-lg shadow-rose-100 animate-pulse' :
                    isLow ? 'border-orange-200 bg-orange-50/10' :
                    'border-white'
                  )}>
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        "text-[10px] font-black uppercase mb-1",
                        isCritical ? 'text-rose-500' : 'text-slate-400'
                      )}>REF {item.ref}</p>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight uppercase truncate">{item.nom}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleIncrement(item)} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100"><Plus size={20} /></button>
                      <div className={clsx(
                        "px-4 py-2.5 rounded-2xl border-2 font-black text-xl w-14 text-center",
                        isCritical ? 'bg-rose-500 text-white' :
                        isLow ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-50 text-blue-600'
                      )}>
                        {item.stock}
                      </div>
                      <button onClick={() => setSelectedItemForInter(item)} disabled={isCritical} className={clsx(
                        "p-3 rounded-2xl shadow-lg transition-all",
                        isCritical ? 'bg-slate-100 text-slate-400' :
                        'bg-blue-600 text-white shadow-blue-200 active:scale-90 hover:bg-blue-700'
                      )}>
                        <MapPin size={20} /> {/* Used for decrement/intervention */}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  Aucun article trouvé.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scanner View */}
        {view === 'scanner' && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-center">Scanner un article</h2>
            <div id="reader" className="w-full bg-slate-100 rounded-lg overflow-hidden"></div>
            {/* We can potentially add controls for flashlight here */}
            <ScannerComponent onScan={handleScanSuccess} />
          </div>
        )}

        {/* History View */}
        {view === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Dernières Actions</h2>
              <button onClick={shareMissingItems} className="flex items-center gap-2 text-indigo-600 font-medium px-3 py-1 bg-indigo-50 rounded-lg">
                <Share2 className="w-4 h-4" /> Partager Rapport
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
              {logs.map(log => (
                <div key={log.id} className="p-4 flex gap-3">
                  <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{log.itemName}</p>
                    <p className="text-sm text-slate-500">
                      {log.action === 'decrement' ? 'Pose effectuée' : log.action} • {new Date(log.timestamp?.toDate()).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="p-4 text-slate-400 text-center">Aucun historique.</p>}
            </div>
          </div>
        )}
      </main>

      {/* Item Intervention Modal (replaces old selectedItem modal) */}
      {selectedItemForInter && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up sm:animate-zoom-in">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedItemForInter.nom}</h2>
                <p className="text-slate-500 font-mono">{selectedItemForInter.ref}</p>
              </div>
              <button onClick={() => setSelectedItemForInter(null)} className="p-1 bg-slate-100 rounded-full hover:bg-slate-200">
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl mb-6">
              <span className="text-slate-600 font-medium">Stock Actuel</span>
              <span className={clsx(
                "text-3xl font-bold",
                selectedItemForInter.stock === 0 ? "text-rose-600" : "text-blue-600"
              )}>{selectedItemForInter.stock}</span>
            </div>

            <button
              onClick={() => handleDecrement(selectedItemForInter)}
              disabled={selectedItemForInter.stock <= 0}
              className="w-full bg-blue-600 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Valider la pose (-1)
            </button>
          </div>
        </div>
      )}


      {/* Modals for Rapport Rapide / BL Scanner (placeholders) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
            <h3 className="font-bold text-lg mb-2">Demande Express</h3>
            <p className="text-sm text-slate-500 mb-6">Envoyer la liste des pièces à réapprovisionner (Stock &lt; {CRITICAL_STOCK_THRESHOLD}) ?</p>
            <div className="flex gap-2">
              <button onClick={() => setIsShareModalOpen(false)} className="flex-1 py-2 rounded-lg bg-slate-100 font-medium">Annuler</button>
              <button onClick={shareMissingItems} className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold">Envoyer</button>
            </div>
          </div>
        </div>
      )}

      {isBLScannerOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up sm:animate-zoom-in">
            <BLScanner onScanComplete={handleBLScanComplete} onClose={() => setIsBLScannerOpen(false)} />
          </div>
        </div>
      )}

      {/* Admin and Import Modals (existing) */}
      {showSeedConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
            <h3 className="font-bold text-lg mb-2">Administration BDD</h3>
            <p className="text-sm text-slate-500 mb-6">Gérez les données de l'inventaire.</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { seedDatabase(); setShowSeedConfirm(false); }}
                className="w-full py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Package size={18} />
                Réinitialiser (Défaut)
              </button>

              <button
                onClick={() => {
                  if(window.confirm("Êtes-vous sûr de vouloir tout supprimer ? Cette action est irréversible.")) {
                    clearDatabase();
                    setShowSeedConfirm(false);
                  }
                }}
                className="w-full py-3 rounded-lg bg-rose-100 text-rose-700 font-bold hover:bg-rose-200 transition flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Tout Effacer (Vider)
              </button>

              <button onClick={() => setShowSeedConfirm(false)} className="w-full py-2 rounded-lg text-slate-500 hover:bg-slate-100 font-medium mt-2">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <ExcelUpload onClose={() => setShowImportModal(false)} onUploadSuccess={() => console.log('Import finished')} />
      )}

      <footer className="p-4 text-center text-xs text-slate-400">
        MEDISTOCK Pro - Propulsé par Gemini & Firebase Cloud.
      </footer>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setView('dashboard')}
          className={clsx("flex flex-col items-center gap-1", view === 'dashboard' ? "text-blue-600" : "text-slate-400")}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-xs font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => setView('stock')}
          className={clsx("flex flex-col items-center gap-1", view === 'stock' ? "text-blue-600" : "text-slate-400")}
        >
          <Package className="w-6 h-6" />
          <span className="text-xs font-medium">Stock Camion</span>
        </button>

        <button
          onClick={() => setView('scanner')}
          className="bg-blue-600 text-white p-4 rounded-full -mt-8 shadow-xl shadow-blue-200 border-4 border-slate-50 active:scale-90 transition"
        >
          <Scan className="w-6 h-6" />
        </button>

        <button
          onClick={() => setView('history')}
          className={clsx("flex flex-col items-center gap-1", view === 'history' ? "text-blue-600" : "text-slate-400")}
        >
          <History className="w-6 h-6" />
          <span className="text-xs font-medium">Historique</span>
        </button>
      </nav>
    </div>
  );
}

// Simple wrapper for Html5QrcodeScanner
const ScannerComponent = ({ onScan }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    scanner.render((text) => {
      onScan(text);
      scanner.clear();
    }, (err) => {
      // console.warn(err);
    });

    return () => {
      scanner.clear().catch(e => console.error(e));
    };
  }, [onScan]);

  return null;
};

export default App;