import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { CloudSync, ShieldCheck, Book, User, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'; // Assuming lucide-react is installed

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyADxXl7uUx9JRuFMtEezNuPD4U8rAxwONE",
  authDomain: "echo-care-legacy-v1.firebaseapp.com",
  projectId: "echo-care-legacy-v1",
  storageBucket: "echo-care-legacy-v1.firebasestorage.app",
  messagingSenderId: "300798243862",
  appId: "1:300798243862:web:6dd1dcb344fd8a71877137"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'echoquest-default';

const App = () => {
  // --- ÉTAT DU JEU & AUTH ---
  const [user, setUser] = useState(null);
  const [playerPos, setPlayerPos] = useState({ x: 2, y: 2 });
  const [gameState, setGameState] = useState('LOADING'); // LOADING, EXPLORE, DIALOGUE, ERROR
  const [inventory, setInventory] = useState([]);
  const [questIndex, setQuestIndex] = useState(0);
  const [syncStatus, setSyncStatus] = useState('synced'); // synced, saving, error
  const [loadingMessage, setLoadingMessage] = useState('Initialisation...');

  // --- CONFIGURATION ---
  const GRID_SIZE = 10;
  const COLORS = { darkest: '#0f380f', dark: '#306230', light: '#8bac0f', lightest: '#9bbc0f' };

  // Quêtes simulées
  const quests = [
    { id: "Q1", npc: "PAPI GEORGES", target: { x: 7, y: 3 }, msg: "Salut ! Mon école était ici. Retrouve mon vieux cartable !", item: "CARTABLE 1950" },
    { id: "Q2", npc: "MAMIE MARIE", target: { x: 1, y: 8 }, msg: "Bravo ! Maintenant, cherche mon premier vélo rouge.", item: "VÉLO 1954" },
    { id: "Q3", npc: "PAPI GEORGES", target: { x: 4, y: 5 }, msg: "Génial ! Peux-tu trouver ma vieille montre en or ?", item: "MONTRE 1962" }
  ];
  const currentQuest = quests[questIndex] || quests[0];

  // --- 1. AUTHENTIFICATION ---
  useEffect(() => {
    let authTimeout;

    const initAuth = async () => {
      setLoadingMessage('Connexion anonyme...');
      try {
        // Timeout de sécurité pour l'auth (10s)
        authTimeout = setTimeout(() => {
           if (!auth.currentUser) {
             console.warn("Auth Timeout - Passage en mode hors ligne");
             setGameState('EXPLORE'); 
             setSyncStatus('error');
           }
        }, 10000);

        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error:", err);
        setSyncStatus('error');
        // En cas d'erreur fatale d'auth, on laisse jouer en local
        setGameState('EXPLORE'); 
      } finally {
        clearTimeout(authTimeout);
      }
    };

    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
         setLoadingMessage('Attente utilisateur...');
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(authTimeout);
    };
  }, []);

  // --- 2. SYNCHRONISATION FIRESTORE ---
  useEffect(() => {
    if (!user) return;
    setLoadingMessage('Synchronisation des souvenirs...');

    // Récupération des données utilisateur
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'game_progress');

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPlayerPos(data.playerPos || { x: 2, y: 2 });
        setInventory(data.inventory || []);
        setQuestIndex(data.questIndex || 0);
      } else {
        // Initialisation si nouveau joueur
        setDoc(userDocRef, {
          playerPos: { x: 2, y: 2 },
          inventory: [],
          questIndex: 0,
          updatedAt: Date.now()
        }).catch(e => console.error("Create Profile Error:", e));
      }
      setGameState('EXPLORE');
    }, (err) => {
      console.error("Firestore Listen Error:", err);
      setSyncStatus('error');
      // On débloque le jeu même si la sync échoue
      setGameState('EXPLORE'); 
    });

    return () => unsubscribe();
  }, [user]);

  // --- 3. SAUVEGARDE DES ACTIONS ---
  const saveProgress = async (updates) => {
    if (!user || syncStatus === 'error') return;
    setSyncStatus('saving');
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'game_progress');
      await updateDoc(userDocRef, { ...updates, updatedAt: Date.now() });
      setSyncStatus('synced');
    } catch (err) {
      console.error("Save Error:", err);
      setSyncStatus('error');
    }
  };

  // --- 4. LOGIQUE DE MOUVEMENT ---
  const move = useCallback((dx, dy) => {
    if (gameState !== 'EXPLORE') return;
    const newX = Math.max(0, Math.min(GRID_SIZE - 1, playerPos.x + dx));
    const newY = Math.max(0, Math.min(GRID_SIZE - 1, playerPos.y + dy));

    const newPos = { x: newX, y: newY };
    setPlayerPos(newPos);

    // Interaction avec PNJ
    if (newX === currentQuest.target.x && newY === currentQuest.target.y) {
      setGameState('DIALOGUE');
    }

    // Sauvegarde auto de la position
    saveProgress({ playerPos: newPos });
  }, [gameState, playerPos, currentQuest, user]); // Added user dep for safety

  const completeQuest = () => {
    const newInventory = [...inventory, currentQuest.item];
    const newIndex = (questIndex + 1) % quests.length;

    setInventory(newInventory);
    setQuestIndex(newIndex);
    setGameState('EXPLORE');
    saveProgress({
      inventory: newInventory,
      questIndex: newIndex
    });
  };

  if (gameState === 'LOADING') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-mono">
         <div className="flex flex-col items-center gap-4">
            <CloudSync className="w-12 h-12 animate-spin text-indigo-400" />
            <p className="text-xs uppercase tracking-widest animate-pulse">{loadingMessage}</p>
            <button 
              onClick={() => setGameState('EXPLORE')} 
              className="mt-8 text-[10px] text-slate-500 underline hover:text-slate-300"
            >
              Passer l'initialisation (Mode Hors Ligne)
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-mono select-none">
            {/* INDICATEUR DE SYNC */}
      <div className="mb-4 flex items-center gap-2">
         {syncStatus === 'synced' && <ShieldCheck size={12} className="text-emerald-500" />}
         {syncStatus === 'saving' && <CloudSync size={12} className="text-indigo-400 animate-spin" />}
         {syncStatus === 'error' && <span className="text-rose-500 text-[8px] font-black animate-pulse uppercase">Erreur de Connexion</span>}
         <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">
           {syncStatus === 'synced' ? 'Sauvegardé' : syncStatus === 'saving' ? 'Enregistrement...' : 'Hors ligne'}
         </span>
      </div>
      {/* CONSOLE GAME BOY */}
      <div className="w-80 bg-slate-400 rounded-2xl rounded-br-[5rem] p-6 shadow-2xl border-t-4 border-slate-300 relative border-x-2 border-slate-500">
                {/* ECRAN */}
        <div className="bg-[#879172] p-4 rounded-md border-8 border-slate-600 shadow-inner mb-8">
          <div className="aspect-square w-full relative overflow-hidden" style={{ backgroundColor: COLORS.lightest }}>
                        {/* GRID WORLD */}
            <div className="grid grid-cols-10 h-full w-full">
              {[...Array(GRID_SIZE * GRID_SIZE)].map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const isPlayer = x === playerPos.x && y === playerPos.y;
                const isNPC = x === currentQuest.target.x && y === currentQuest.target.y;
                return (
                  <div key={i} className="flex items-center justify-center border-[0.5px] border-[#0f380f]/5">
                    {isPlayer && <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: COLORS.darkest }}></div>}
                    {isNPC && <div className="w-4 h-4 flex items-center justify-center animate-bounce" style={{ color: COLORS.dark }}><User size={12} /></div>}
                  </div>
                );
              })}
            </div>
            {/* DIALOGUE BOX */}
            {gameState === 'DIALOGUE' && (
              <div className="absolute bottom-0 left-0 right-0 bg-[#8bac0f] border-t-2 p-2 min-h-[60px] flex flex-col justify-between" style={{ borderColor: COLORS.darkest }}>
                <p className="text-[8px] font-black uppercase leading-tight" style={{ color: COLORS.darkest }}>
                   <span className="underline">{currentQuest.npc}</span> : {currentQuest.msg}
                </p>
                <div className="flex justify-end">
                   <button onClick={completeQuest} className="text-[7px] font-black bg-[#0f380f] text-[#9bbc0f] px-2 py-0.5 rounded-sm active:scale-95">RÉPARER (A)</button>
                </div>
              </div>
            )}
                        {/* TOP OVERLAY HUD */}
            <div className="absolute top-0 left-0 right-0 p-1 flex justify-between items-center text-[6px] font-black z-10" style={{ color: COLORS.darkest }}>
              <span>USER: {user?.uid.substring(0, 8)}...</span>
              <div className="flex items-center gap-1">
                 <Book size={8} />
                 <span>{inventory.length} OBJETS</span>
              </div>
            </div>
          </div>
        </div>
        {/* CONTROLES */}
        <div className="flex justify-between items-center px-2">
           <div className="grid grid-cols-3">
              <div />
              <button onClick={() => move(0, -1)} className="w-8 h-8 bg-slate-800 rounded-t-md shadow-inner flex items-center justify-center active:bg-slate-900"><ArrowUp size={14} className="text-slate-500" /></button>
              <div />
              <button onClick={() => move(-1, 0)} className="w-8 h-8 bg-slate-800 rounded-l-md shadow-inner flex items-center justify-center active:bg-slate-900"><ArrowLeft size={14} className="text-slate-500" /></button>
              <div className="w-8 h-8 bg-slate-800" />
              <button onClick={() => move(1, 0)} className="w-8 h-8 bg-slate-800 rounded-r-md shadow-inner flex items-center justify-center active:bg-slate-900"><ArrowRight size={14} className="text-slate-500" /></button>
              <div />
              <button onClick={() => move(0, 1)} className="w-8 h-8 bg-slate-800 rounded-b-md shadow-inner flex items-center justify-center active:bg-slate-900"><ArrowDown size={14} className="text-slate-500" /></button>
              <div />
           </div>
           <div className="flex gap-4 rotate-[-25deg]">
              <div className="flex flex-col items-center">
                 <button className="w-12 h-12 bg-rose-800 rounded-full border-b-4 border-rose-950 shadow-lg active:translate-y-1 active:border-b-0"></button>
                 <span className="text-[10px] font-black text-slate-600 mt-2">B</span>
              </div>
              <div className="flex flex-col items-center">
                 <button
                   onClick={() => gameState === 'DIALOGUE' && completeQuest()}
                  className="w-12 h-12 bg-rose-800 rounded-full border-b-4 border-rose-950 shadow-lg active:translate-y-1 active:border-b-0"
                 ></button>
                 <span className="text-[10px] font-black text-slate-600 mt-2">A</span>
              </div>
           </div>
        </div>
      </div>
            <p className="mt-8 text-slate-600 text-[8px] font-black tracking-widest uppercase italic">Persistance Firestore Active • Solo-Corp 2026</p>
    </div>
  );
};

export default App;
