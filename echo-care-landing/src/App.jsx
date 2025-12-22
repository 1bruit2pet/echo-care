import React, { useState } from 'react';
import {
  Target,
  Building2,
  Landmark,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  FileText,
  Heart,
  Globe,
  Award,
  Check,
  Star,
  Play,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

// --- COMPOSANTS DE STRUCTURE ---
const MetricItem = ({ value, label }) => (
  <div className="text-center">
    <p className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">{value}</p>
    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2">{label}</p>
  </div>
);

const BenefitCheck = ({ text }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 bg-emerald-500/20 p-1 rounded-full">
      <Check className="text-emerald-400 w-4 h-4" />
    </div>
    <span className="font-medium italic text-slate-300 leading-relaxed">{text}</span>
  </div>
);

const SolutionCard = ({ icon, title, tag, variant, items }) => {
  // Mapping explicite pour garantir que Tailwind ne purge pas les classes
  const styles = {
    indigo: {
      border: "border-indigo-500/20 hover:border-indigo-500/50",
      iconBg: "bg-indigo-600",
      iconShadow: "shadow-indigo-600/20",
      textAccent: "text-indigo-400",
      bullet: "text-indigo-500"
    },
    emerald: {
      border: "border-emerald-500/20 hover:border-emerald-500/50",
      iconBg: "bg-emerald-600",
      iconShadow: "shadow-emerald-600/20",
      textAccent: "text-emerald-400",
      bullet: "text-emerald-500"
    },
    rose: {
      border: "border-rose-500/20 hover:border-rose-500/50",
      iconBg: "bg-rose-600",
      iconShadow: "shadow-rose-600/20",
      textAccent: "text-rose-400",
      bullet: "text-rose-500"
    }
  };
  const s = styles[variant] || styles.indigo;
  return (
    <div className={`bg-slate-900/80 border-2 rounded-[3rem] p-10 space-y-8 transition-all duration-500 group relative overflow-hidden ${s.border}`}>
      <div className="relative z-10 flex items-center gap-5">
        <div className={`p-4 rounded-2xl shadow-lg text-white group-hover:scale-110 transition-transform ${s.iconBg} ${s.iconShadow}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{title}</h3>
          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${s.textAccent}`}>{tag}</p>
        </div>
      </div>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-4 text-slate-400 font-medium text-lg italic">
            <span className={`text-2xl ${s.bullet}`}>&bull;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <button className="group relative h-12 w-full overflow-hidden rounded-full bg-white text-lg shadow">
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:bg-indigo-600">
          <span className="font-bold uppercase tracking-wide text-slate-900 group-hover:text-white transition-colors duration-300">
            En savoir plus
          </span>
          <ArrowRight className="absolute right-5 w-5 h-5 text-slate-900 group-hover:text-white transition-all duration-300 group-hover:translate-x-1" />
        </div>
      </button>
    </div>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-[url('https://picsum.photos/1920/1080')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-rose-400">Écho-Care</span>
            <br />
            L'Héritage Vocal.
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            La première plateforme vocale souveraine qui transforme l'héritage de vos aînés en une aventure interactive pour les générations futures.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
            <button className="group bg-indigo-600 hover:bg-indigo-500 px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-3">
              Lancer mon offre pilote
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-2xl font-bold uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-3 text-slate-300">
              <Play className="w-5 h-5" />
              Voir la vidéo
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 max-w-2xl mx-auto border-t border-white/5">
            <MetricItem value="+25%" label="Attractivité" />
            <MetricItem value="-15%" label="Agitation" />
            <MetricItem value="100%" label="Vocal" />
          </div>
        </div>
      </header>

      {/* SECTION VISION */}
      <section id="vision" className="bg-slate-900/50 border-y border-white/5 py-24 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-rose-600/20 border border-rose-500/30 rounded-full">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Le constat actuel</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight uppercase italic tracking-tight">
              Les seniors perdent leur âme dans la standardisation du soin.
            </h2>
            <div className="space-y-6 text-slate-400 text-lg italic">
              <p className="flex items-start gap-4">
                <span className="text-rose-400 font-black">×</span>
                <span>Les résidents sont réduits à des dossiers médicaux passifs et froids.</span>
              </p>
              <p className="flex items-start gap-4">
                <span className="text-rose-400 font-black">×</span>
                <span>La fracture numérique les exclut de la transmission familiale.</span>
              </p>
              <p className="flex items-start gap-4">
                <span className="text-rose-400 font-black">×</span>
                <span>Les familles s'éloignent sous le poids d'une culpabilité invisible.</span>
              </p>
            </div>
          </div>
          <div className="space-y-8 bg-[#020617] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
            <div className="inline-block px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-full">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">L'approche Echo-Care</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight uppercase italic tracking-tight">
              Devenez une <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Maison d'Édition de Vies.</span>
            </h2>
            <div className="space-y-6">
              <BenefitCheck text="Interface 100% vocale sans aucun écran pour le senior." />
              <BenefitCheck text="Valorisation immédiate du statut social et de la dignité." />
              <BenefitCheck text="Création d'un patrimoine familial pérenne et éternel." />
              <BenefitCheck text="Rapport de bien-être passif pour rassurer les aidants." />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION SOLUTIONS */}
      <section id="solutions" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 space-y-4">
          <div className="inline-block px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Nos Solutions</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight uppercase italic tracking-tight">
            Une approche humaine, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">technologique et bienveillante.</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto italic">
            Écho-Care transforme le quotidien en poésie et les souvenirs en trésors numériques.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <SolutionCard
            icon={<Building2 />}
            title="Pour les EHPAD"
            tag="Attractivité & Différenciation"
            variant="indigo"
            items={[
              "Réduction de l'agitation des résidents.",
              "Valorisation de l'image de l'établissement.",
              "Partenariat innovant avec les familles."
            ]}
          />
          <SolutionCard
            icon={<Users />}
            title="Pour les Familles"
            tag="Lien Intergénérationnel"
            variant="emerald"
            items={[
              "Accès simplifié à l'héritage vocal du senior.",
              "Création de souvenirs interactifs et ludiques.",
              "Réduction de la culpabilité et de la distance."
            ]}
          />
          <SolutionCard
            icon={<Landmark />}
            title="Pour les Seniors"
            tag="Dignité & Patrimoine"
            variant="rose"
            items={[
              "Maintien de l'autonomie cognitive et sociale.",
              "Reconnaissance de leur parcours de vie.",
              "Transmission de leur savoir et de leurs valeurs."
            ]}
          />
        </div>
      </section>

      {/* SECTION TEMOIGNAGES (simplifié) */}
      <section id="testimonials" className="bg-slate-900/50 border-y border-white/5 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-full">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Témoignages</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight uppercase italic tracking-tight">
            Ils nous font confiance.
          </h2>
          <p className="text-xl text-slate-300 font-bold italic">
            "Écho-Care a redonné vie aux souvenirs de ma grand-mère. C'est magique !"
          </p>
          <p className="text-slate-400">- Une famille reconnaissante</p>
        </div>
      </section>

      {/* SECTION FOOTER */}
      <footer className="py-16 px-4 text-center text-slate-500 text-sm">
        <p>&copy; 2024 Écho-Care. Tous droits réservés.</p>
        <div className="flex justify-center space-x-4 mt-4">
          <a href="#" className="hover:text-white transition-colors"><MessageSquare size={18} /></a>
          <a href="#" className="hover:text-white transition-colors"><FileText size={18} /></a>
          <a href="#" className="hover:text-white transition-colors"><Mail size={18} /></a>
        </div>
      </footer>
    </div>
  );
};

export default App;
