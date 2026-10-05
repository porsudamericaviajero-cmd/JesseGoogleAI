import React, { useState } from 'react';
import { MomentOption } from '../types';
import { MOMENT_OPTIONS } from '../data/momentsData';
import { db } from '../services/db';
import { soundscape } from '../services/ambientAudio';
import { X, Sparkles, Bookmark, Share2, Volume2, Check, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenDevotional: () => void;
  onShareVerse: (verse: { reference: string; text: string }) => void;
}

export const MomentsModal: React.FC<Props> = ({ isOpen, onClose, onOpenDevotional, onShareVerse }) => {
  const [selectedMoment, setSelectedMoment] = useState<MomentOption | null>(null);
  const [copied, setCopied] = useState(false);
  const [prayerSaved, setPrayerSaved] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (m: MomentOption) => {
    setSelectedMoment(m);
    setPrayerSaved(false);
    setCopied(false);
  };

  const handleSavePrayer = (m: MomentOption) => {
    db.toggleFavorite({
      type: 'prayer',
      targetId: `moment-prayer-${m.id}`,
      title: `Oração para Momento: ${m.label}`,
      reference: m.verseReference,
      textSnippet: m.suggestedPrayer,
    });
    setPrayerSaved(true);
    setTimeout(() => setPrayerSaved(false), 2500);
  };

  const handleSaveVerse = (m: MomentOption) => {
    db.toggleFavorite({
      type: 'verse',
      targetId: `moment-verse-${m.id}`,
      title: m.verseReference,
      reference: m.verseReference,
      textSnippet: m.verseText,
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0a162e] border border-amber-400/30 rounded-3xl p-6 shadow-2xl text-white my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400/10 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-amber-200">Para o Seu Momento</h3>
              <p className="text-xs text-slate-400">Como você está se sentindo hoje?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto subtle-scroll py-4 space-y-4">
          {!selectedMoment ? (
            <div>
              <p className="text-xs text-slate-300 mb-3">
                Selecione o estado do seu coração para receber consolo e direção bíblica imediata:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MOMENT_OPTIONS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleSelect(m)}
                    className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/40 text-left flex items-center gap-3 transition-all cursor-pointer group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{m.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-100 group-hover:text-amber-200">
                        {m.label}
                      </div>
                      <div className="text-[11px] text-slate-400">{m.verseReference}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedMoment(null)}
                className="text-xs text-amber-300/90 hover:text-amber-200 flex items-center gap-1.5 py-1 px-2 rounded-lg bg-amber-500/10 cursor-pointer w-fit"
              >
                ← Escolher outro momento
              </button>

              {/* Moment Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-blue-900/30 border border-amber-400/30 flex items-start gap-3">
                <span className="text-3xl">{selectedMoment.emoji}</span>
                <div>
                  <h4 className="font-display text-base font-bold text-amber-200">{selectedMoment.label}</h4>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">{selectedMoment.encouragement}</p>
                </div>
              </div>

              {/* Versículo Bíblico (Bíblia Livre) */}
              <div className="p-5 rounded-2xl glass-panel-gold border border-amber-400/30">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-300 mb-2">
                  <span>{selectedMoment.verseReference}</span>
                  <span className="text-[10px] text-slate-400">Bíblia Livre</span>
                </div>
                <blockquote className="font-serif-reading italic text-sm text-amber-100 leading-relaxed">
                  "{selectedMoment.verseText}"
                </blockquote>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-amber-400/15">
                  <button
                    onClick={() => handleSaveVerse(selectedMoment)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{copied ? 'Versículo Salvo!' : 'Salvar Versículo'}</span>
                  </button>
                  <button
                    onClick={() => {
                      onShareVerse({
                        reference: `${selectedMoment.verseReference} (Bíblia Livre)`,
                        text: selectedMoment.verseText,
                      });
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    title="Compartilhar versículo"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Oração Sugerida */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>UMA ORAÇÃO PARA O SEU CORAÇÃO</span>
                </div>
                <p className="font-serif-reading text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  "{selectedMoment.suggestedPrayer}"
                </p>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => handleSavePrayer(selectedMoment)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-400/30 text-amber-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {prayerSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4" />}
                    <span>{prayerSaved ? 'Oração Salva nos Favoritos!' : 'Salvar Oração'}</span>
                  </button>

                  <button
                    onClick={() => {
                      soundscape.play('Piano', 0.4);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Tocar música de fundo suave para orar"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Música de Oração</span>
                  </button>
                </div>
              </div>

              {/* Devocional Relacionado */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenDevotional();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B78A18] text-slate-950 font-bold text-sm shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>LER DEVOCIONAL COMPLETO DE HOJE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
