import React from 'react';
import { Home, BookOpen, Sparkles, Bookmark, User } from 'lucide-react';

export type NavTab = 'inicio' | 'biblia' | 'mana' | 'favoritos' | 'perfil';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-2 px-3 sm:px-6">
      <div className="pointer-events-auto w-full max-w-lg bg-[#0a162e]/95 backdrop-blur-xl border border-amber-400/20 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/80 px-2 py-1.5 flex items-center justify-around">
        {/* INÍCIO */}
        <button
          onClick={() => onSelectTab('inicio')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'inicio' ? 'text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${currentTab === 'inicio' ? 'scale-110 text-amber-300' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Início</span>
        </button>

        {/* BÍBLIA */}
        <button
          onClick={() => onSelectTab('biblia')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'biblia' ? 'text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className={`w-5 h-5 transition-transform ${currentTab === 'biblia' ? 'scale-110 text-amber-300' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Bíblia</span>
        </button>

        {/* MANÁ - POSIÇÃO CENTRAL COM DESTAQUE VISUAL */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={() => onSelectTab('mana')}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer ${
              currentTab === 'mana'
                ? 'bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-slate-950 scale-110 ring-4 ring-amber-400/40 shadow-amber-400/30'
                : 'bg-gradient-to-tr from-[#0F2752] to-[#1A3A75] border-2 border-amber-400/50 text-amber-300 hover:scale-105'
            }`}
            title="Seu Maná de Hoje"
          >
            <Sparkles className={`w-7 h-7 ${currentTab === 'mana' ? 'text-slate-950' : 'text-amber-300 animate-pulse'}`} />
          </button>
          <span
            className={`text-[10px] font-bold tracking-wider mt-1 transition-colors ${
              currentTab === 'mana' ? 'text-amber-300' : 'text-slate-300'
            }`}
          >
            MANÁ
          </span>
        </div>

        {/* FAVORITOS */}
        <button
          onClick={() => onSelectTab('favoritos')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'favoritos' ? 'text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className={`w-5 h-5 transition-transform ${currentTab === 'favoritos' ? 'scale-110 text-amber-300' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Favoritos</span>
        </button>

        {/* PERFIL */}
        <button
          onClick={() => onSelectTab('perfil')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'perfil' ? 'text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className={`w-5 h-5 transition-transform ${currentTab === 'perfil' ? 'scale-110 text-amber-300' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Perfil</span>
        </button>
      </div>
    </nav>
  );
};
