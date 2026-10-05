import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { FavoriteItem } from '../types';
import { Bookmark, Trash2, BookOpen, Heart, Sparkles, Volume2, Share2, Copy, Check } from 'lucide-react';

interface Props {
  onOpenDevotional: (devotionalId?: string) => void;
  onShareVerse: (verse: { reference: string; text: string }) => void;
}

export const FavoritesView: React.FC<Props> = ({ onOpenDevotional, onShareVerse }) => {
  const [activeTab, setActiveTab] = useState<'verse' | 'devotional' | 'prayer' | 'audio'>('verse');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadFavorites = () => {
    setFavorites(db.getFavorites());
  };

  useEffect(() => {
    loadFavorites();
    const unsub = db.subscribe(loadFavorites);
    return unsub;
  }, []);

  const filtered = favorites.filter(f => f.type === activeTab);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    db.removeFavorite(id);
  };

  const handleCopyText = (item: FavoriteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `"${item.textSnippet}"\n— ${item.reference || item.title} (Maná Diário)`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen pb-32 pt-4 px-4 sm:px-6 max-w-4xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-4">
        <Bookmark className="w-5 h-5 text-amber-400" />
        <h1 className="font-display text-xl font-bold tracking-wide text-amber-200">
          Meus Favoritos
        </h1>
      </div>

      {/* Tabs: Versículos | Devocionais | Orações | Áudios */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
        {[
          { id: 'verse', label: 'Versículos', icon: BookOpen },
          { id: 'devotional', label: 'Devocionais', icon: Sparkles },
          { id: 'prayer', label: 'Orações', icon: Heart },
          { id: 'audio', label: 'Áudios', icon: Volume2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl glass-panel border border-slate-800 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-display text-base font-semibold text-slate-300">
            Nenhum item salvo ainda
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Toque no ícone de marcador nos devocionais, versículos ou orações para guardar suas passagens queridas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => {
                if (item.type === 'devotional' || item.type === 'audio') {
                  onOpenDevotional(item.targetId);
                }
              }}
              className={`p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-400/30 transition-all space-y-2 ${
                item.type === 'devotional' || item.type === 'audio' ? 'cursor-pointer hover:bg-slate-800/60' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                <span className="truncate max-w-[80%]">{item.title}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(item.savedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <blockquote className="font-serif-reading italic text-sm text-slate-200 leading-relaxed">
                "{item.textSnippet}"
              </blockquote>

              {item.reference && (
                <div className="text-[11px] text-amber-400/80 font-medium">
                  Ref: {item.reference}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={e => handleCopyText(item, e)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  title="Copiar texto"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'Copiado' : 'Copiar'}</span>
                </button>

                {item.type === 'verse' && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onShareVerse({
                        reference: item.reference || item.title,
                        text: item.textSnippet,
                      });
                    }}
                    className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Compartilhar versículo"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartilhar</span>
                  </button>
                )}

                <button
                  onClick={e => handleRemove(item.id, e)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  title="Remover dos favoritos"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
