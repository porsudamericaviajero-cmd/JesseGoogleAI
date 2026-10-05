import React, { useState, useEffect } from 'react';
import { db, ACHIEVEMENTS_LIST } from '../services/db';
import { UserProgress, Achievement } from '../types';
import { Flame, CheckCircle, Bookmark, Heart, Headphones, Award, Sparkles } from 'lucide-react';

export const JourneyView: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress>(db.getProgress());
  const user = db.getUser();

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setProgress(db.getProgress());
    });
    return unsub;
  }, []);

  const listeningMinutes = Math.round((progress.listeningSeconds || 0) / 60);

  return (
    <div className="min-h-screen pb-32 pt-4 px-4 sm:px-6 max-w-4xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-6">
        <Flame className="w-5 h-5 text-amber-400" />
        <h1 className="font-display text-xl font-bold tracking-wide text-amber-200">
          Minha Jornada Espiritual
        </h1>
      </div>

      {/* Encouragement Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-blue-900/30 to-[#081226] border border-amber-400/30 shadow-xl mb-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-amber-200">
            Paz e Constância, {user.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Sua comunhão com Deus não é uma corrida ou disputa com outros. Cada dia no secreto com o Pai é um tijolo eterno colocado na sua paz e intimidade com Ele.
          </p>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {/* Dias Consecutivos (Streak) */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-400/20 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-amber-300 font-display">
              {progress.streakDays} {progress.streakDays === 1 ? 'dia' : 'dias'}
            </div>
            <div className="text-[11px] text-slate-400">Dias Consecutivos</div>
          </div>
        </div>

        {/* Devocionais Concluídos */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100 font-display">
              {progress.completedDevotionalsIds.length}
            </div>
            <div className="text-[11px] text-slate-400">Devocionais Lidos</div>
          </div>
        </div>

        {/* Versículos Salvos */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100 font-display">
              {progress.savedVersesCount}
            </div>
            <div className="text-[11px] text-slate-400">Versículos Salvos</div>
          </div>
        </div>

        {/* Orações Salvas */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100 font-display">
              {progress.savedPrayersCount}
            </div>
            <div className="text-[11px] text-slate-400">Orações Salvas</div>
          </div>
        </div>

        {/* Tempo Ouvindo Conteúdo */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center gap-3 sm:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100 font-display">
              {listeningMinutes} minutos
            </div>
            <div className="text-[11px] text-slate-400">Tempo de Audição Devocional</div>
          </div>
        </div>
      </div>

      {/* CONQUISTAS PESSOAIS (1, 7, 30, 90, 180, 365 DIAS) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="font-display text-base font-bold text-slate-200">
            Marcos da Sua Jornada Pessoal
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Celebrando a fidelidade diária no seu relacionamento com o Criador.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS_LIST.map(ach => {
            const isUnlocked = progress.streakDays >= ach.daysRequired;
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-amber-400/40 shadow-lg'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked ? 'bg-amber-400/15 ring-2 ring-amber-400/30' : 'bg-slate-900'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold ${isUnlocked ? 'text-amber-200' : 'text-slate-400'}`}>
                      {ach.title}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold py-0.5 px-2 rounded-full ${
                        isUnlocked
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {ach.daysRequired} {ach.daysRequired === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {ach.description}
                  </p>

                  {isUnlocked && (
                    <div className="text-[10px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                      <span>✓ Conquista Alcançada</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
