import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { soundscape } from '../services/ambientAudio';
import { Moon, Sparkles, Volume2, VolumeX, X, Heart, Bookmark, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NightDevotionalModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isPlayingNightSound, setIsPlayingNightSound] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const nightDevotional = db.getNightDevotional();

  useEffect(() => {
    if (isOpen) {
      soundscape.play('Noite', 0.25);
      setIsPlayingNightSound(true);
    } else {
      soundscape.stop();
      setIsPlayingNightSound(false);
    }
    return () => {
      soundscape.stop();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSound = () => {
    if (isPlayingNightSound) {
      soundscape.stop();
      setIsPlayingNightSound(false);
    } else {
      soundscape.play('Noite', 0.3);
      setIsPlayingNightSound(true);
    }
  };

  const handleSaveNightPrayer = () => {
    db.toggleFavorite({
      type: 'prayer',
      targetId: 'night-prayer-today',
      title: 'Oração Noturna de Descanso',
      reference: nightDevotional.verseReference,
      textSnippet: nightDevotional.prayer,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto">
      {/* Night stars ambient atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/60 via-[#040914] to-black pointer-events-none" />

      <div className="relative w-full max-w-lg bg-[#060c1a] border border-blue-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200 my-8 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-950/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-950 text-amber-300 border border-blue-800/40">
              <Moon className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                Devocional da Noite
              </span>
              <h2 className="font-display text-xl font-bold text-slate-100">MANÁ NOTURNO</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isPlayingNightSound
                  ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title="Som ambiente noturno"
            >
              {isPlayingNightSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Devotional Content */}
        <div className="flex-1 overflow-y-auto subtle-scroll py-6 space-y-6">
          {/* Night Visual Header */}
          <div className="relative h-44 rounded-2xl overflow-hidden border border-blue-900/30">
            <img
              src={nightDevotional.imageUrl}
              alt="Maná Noturno"
              className="w-full h-full object-cover filter brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060c1a] via-[#060c1a]/40 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <span className="text-[11px] text-amber-300 font-medium">Tema da Noite</span>
              <h3 className="font-display text-lg font-bold text-white">{nightDevotional.theme}</h3>
            </div>
          </div>

          {/* Versículo de Descanso (Bíblia Livre) */}
          <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-800/30">
            <div className="flex items-center justify-between text-xs text-amber-300/90 font-semibold mb-2">
              <span>{nightDevotional.verseReference}</span>
              <span className="text-[10px] text-slate-400">Bíblia Livre</span>
            </div>
            <blockquote className="font-serif-reading italic text-base text-amber-100/90 leading-relaxed">
              "{nightDevotional.verseText}"
            </blockquote>
          </div>

          {/* Reflexão da Noite */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>REFLEXÃO DE ENTREGA</span>
            </h4>
            <div className="font-serif-reading text-sm text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
              {nightDevotional.reflection}
            </div>
          </div>

          {/* Oração da Noite */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-2">
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>ORAÇÃO ANTES DE DORMIR</span>
              </div>
            </div>
            <p className="font-serif-reading text-xs sm:text-sm text-slate-200 leading-relaxed italic">
              "{nightDevotional.prayer}"
            </p>

            <button
              onClick={handleSaveNightPrayer}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/40 text-amber-200 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Oração Salva nos Favoritos!' : 'Guardar Oração da Noite'}</span>
            </button>
          </div>

          {/* MENSAGEM FINAL EXATA DA SOLICITAÇÃO */}
          <div className="text-center py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-amber-400/10 to-blue-950/40 border border-amber-400/20">
            <p className="font-serif-reading italic text-base sm:text-lg text-amber-200 font-medium">
              "Descanse. Deus continua cuidando de você."
            </p>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="pt-3 border-t border-blue-950/60">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-sm transition-colors cursor-pointer"
          >
            Entregar o dia e descansar
          </button>
        </div>
      </div>
    </div>
  );
};
