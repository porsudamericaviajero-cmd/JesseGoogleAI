import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Devotional, MomentOption } from '../types';
import { MOMENT_OPTIONS } from '../data/momentsData';
import { CATEGORIES_LIST } from '../data/categoriesData';
import {
  Sparkles,
  Play,
  BookOpen,
  Moon,
  Flame,
  ArrowRight,
  Sun,
  Compass,
  CheckCircle,
} from 'lucide-react';

interface Props {
  onOpenDevotional: (devotionalId?: string) => void;
  onOpenNightDevotional: () => void;
  onOpenMoments: () => void;
  onSelectCategory: (categoryName: string) => void;
}

export const HomeView: React.FC<Props> = ({
  onOpenDevotional,
  onOpenNightDevotional,
  onOpenMoments,
  onSelectCategory,
}) => {
  const [user, setUser] = useState(db.getUser());
  const [progress, setProgress] = useState(db.getProgress());
  const [todayDevotional, setTodayDevotional] = useState<Devotional>(db.getTodayDevotional());

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setUser(db.getUser());
      setProgress(db.getProgress());
      setTodayDevotional(db.getTodayDevotional());
    });
    return unsub;
  }, []);

  // Greeting by hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="min-h-screen pb-32 pt-4 px-4 sm:px-6 max-w-4xl mx-auto text-slate-100">
      {/* Top Greeting */}
      <div className="flex items-center justify-between py-2 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Sun className="w-3.5 h-3.5" />
            <span>{greeting}, {user.name}</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-50 mt-0.5">
            "Deus tem uma palavra para você hoje."
          </h1>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>{progress.streakDays} {progress.streakDays === 1 ? 'dia' : 'dias'}</span>
        </div>
      </div>

      {/* CARD PRINCIPAL: SEU MANÁ DE HOJE */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-gold border border-amber-400/30 shadow-2xl mb-8 group">
        {/* Background Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-black">
          <img
            src={todayDevotional.imageUrls['16:9'] || todayDevotional.imageUrl}
            alt={todayDevotional.theme}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081226] via-[#081226]/50 to-transparent" />

          {/* Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 py-1 px-3 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/40 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SEU MANÁ DE HOJE</span>
          </div>

          {/* Date */}
          <div className="absolute top-4 right-4 text-xs text-amber-100 font-medium bg-black/50 backdrop-blur-md px-3 py-1 rounded-full">
            {new Date(todayDevotional.date + 'T12:00:00Z').toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
            })}
          </div>

          {/* Verse Text Overlay */}
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <div className="text-xs text-amber-300 font-semibold flex items-center gap-2">
              <span>{todayDevotional.verseReference}</span>
              <span className="text-[10px] text-slate-400">({todayDevotional.translation})</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white drop-shadow-md leading-snug">
              {todayDevotional.theme}
            </h2>
          </div>
        </div>

        {/* Card Body & Action Buttons */}
        <div className="p-5 sm:p-6 bg-[#09162e]/90 space-y-4">
          <blockquote className="font-serif-reading italic text-sm text-slate-200 line-clamp-2">
            "{todayDevotional.verseText}"
          </blockquote>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onOpenDevotional(todayDevotional.id)}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B78A18] text-slate-950 font-bold text-xs sm:text-sm shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>LER DEVOCIONAL</span>
            </button>

            <button
              onClick={() => onOpenDevotional(todayDevotional.id)}
              className="py-3 px-4 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>OUVIR ÁUDIO</span>
            </button>
          </div>
        </div>
      </div>

      {/* "COMO VOCÊ ESTÁ HOJE?" (Para o seu momento) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h3 className="font-display text-base font-bold text-slate-100">
              Como você está hoje?
            </h3>
          </div>
          <button
            onClick={onOpenMoments}
            className="text-xs text-amber-300/90 hover:text-amber-200 flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MOMENT_OPTIONS.slice(0, 4).map(m => (
            <button
              key={m.id}
              onClick={onOpenMoments}
              className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/40 text-left transition-all cursor-pointer group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform block mb-1">
                {m.emoji}
              </span>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-200">
                {m.label}
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{m.verseReference}</div>
            </button>
          ))}
        </div>
      </div>

      {/* MANÁ NOTURNO BANNER */}
      <div
        onClick={onOpenNightDevotional}
        className="p-5 rounded-3xl bg-gradient-to-r from-[#050b17] via-[#091733] to-[#040812] border border-blue-900/60 shadow-xl mb-8 flex items-center justify-between cursor-pointer hover:border-amber-400/40 transition-all group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-950/80 text-amber-300 flex items-center justify-center border border-blue-800/40 group-hover:scale-105 transition-transform">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Experiência da Noite
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-slate-100">
              MANÁ NOTURNO
            </h3>
            <p className="text-xs text-slate-400 italic">
              "Descanse. Deus continua cuidando de você."
            </p>
          </div>
        </div>

        <button className="py-2 px-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-amber-200 border border-blue-800/50 text-xs font-medium transition-colors">
          Entrar
        </button>
      </div>

      {/* PRÁTICA DO DIA RESUMO */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 mb-8 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Prática de Hoje</span>
          </span>
          <span className="text-slate-400">{todayDevotional.verseReference}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {todayDevotional.practicalApplication}
        </p>
      </div>

      {/* TEMAS DEVOCIONAIS (CARROSSEL) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-bold text-slate-100">
            Temas Bíblicos em Destaque
          </h3>
          <span className="text-xs text-slate-500">20 categorias</span>
        </div>

        <div className="flex gap-2 overflow-x-auto subtle-scroll pb-2">
          {CATEGORIES_LIST.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="py-2 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/40 text-xs font-semibold text-slate-200 hover:text-amber-200 whitespace-nowrap transition-all cursor-pointer"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
