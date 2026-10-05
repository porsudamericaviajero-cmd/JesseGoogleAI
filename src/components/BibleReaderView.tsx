import React, { useState, useMemo } from 'react';
import { BIBLE_BOOKS, getVersesForChapter, searchBible } from '../data/bibleData';
import { BibleBook, BibleVerse } from '../types';
import { db } from '../services/db';
import { soundscape } from '../services/ambientAudio';
import {
  Search,
  BookOpen,
  Bookmark,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Type,
  ChevronDown,
  Info,
  Sparkles,
} from 'lucide-react';

interface Props {
  onShareVerse: (verse: { reference: string; text: string }) => void;
  onOpenLicenses: () => void;
}

export const BibleReaderView: React.FC<Props> = ({ onShareVerse, onOpenLicenses }) => {
  const [testament, setTestament] = useState<'AT' | 'NT'>('NT');
  const [selectedBook, setSelectedBook] = useState<BibleBook>(
    BIBLE_BOOKS.find(b => b.id === 'joao') || BIBLE_BOOKS[0]
  );
  const [currentChapter, setCurrentChapter] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);

  // Books filtered by testament
  const currentBooks = useMemo(() => {
    return BIBLE_BOOKS.filter(b => b.testament === testament);
  }, [testament]);

  // Verses for current chapter
  const currentVerses = useMemo(() => {
    return getVersesForChapter(selectedBook.id, currentChapter);
  }, [selectedBook, currentChapter]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchBible(searchQuery);
  }, [searchQuery]);

  const handleCopy = (verse: BibleVerse) => {
    const textToCopy = `"${verse.text}"\n— ${verse.bookName} ${verse.chapter}:${verse.verse} (Bíblia Livre)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(verse.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFavorite = (verse: BibleVerse) => {
    db.toggleFavorite({
      type: 'verse',
      targetId: verse.id,
      title: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
      reference: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
      textSnippet: verse.text,
    });
  };

  const handleAudioChapterToggle = () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      if ('speechSynthesis' in window) {
        const fullText = currentVerses.map(v => `Versículo ${v.verse}: ${v.text}`).join('. ');
        const utter = new SpeechSynthesisUtterance(
          `Leitura bíblica de ${selectedBook.name}, capítulo ${currentChapter}. Tradução Bíblia Livre. ${fullText}`
        );
        utter.lang = 'pt-BR';
        utter.rate = 0.90;
        utter.pitch = 0.85; // Deep, calm male pitch

        const voices = window.speechSynthesis.getVoices();
        const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
        if (ptVoices.length > 0) {
          const maleVoice = ptVoices.find(v => {
            const n = v.name.toLowerCase();
            return (
              n.includes('male') ||
              n.includes('daniel') ||
              n.includes('jorge') ||
              n.includes('felipe') ||
              n.includes('luciano') ||
              n.includes('ricardo')
            );
          }) || ptVoices[ptVoices.length - 1];

          if (maleVoice) {
            utter.voice = maleVoice;
          }
        }

        utter.onend = () => setIsPlayingAudio(false);
        utter.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utter);
        setIsPlayingAudio(true);
      }
    }
  };

  const fontClass = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  }[fontSize];

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 sm:px-6 max-w-4xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h1 className="font-display text-xl font-bold tracking-wide text-amber-200">
            Santa Bíblia
          </h1>
        </div>

        {/* Translation Attribution badge */}
        <button
          onClick={onOpenLicenses}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-[11px] text-amber-300 font-medium transition-colors cursor-pointer"
          title="Ver detalhes da licença Bíblia Livre"
        >
          <span>Bíblia Livre</span>
          <Info className="w-3 h-3 text-amber-400" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Pesquisar por palavra (ex: fé, paz, amor), livro ou versículo..."
          className="w-full py-2.5 pl-10 pr-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Limpar
          </button>
        )}
      </div>

      {/* SEARCH RESULTS VIEW */}
      {searchQuery.trim() ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Resultados encontrados para "{searchQuery}":</span>
            <span>{searchResults.length} versículos</span>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm glass-panel rounded-2xl p-6">
              Nenhum versículo encontrado para "{searchQuery}". Tente pesquisar por termos como "fé", "amor", "paz", "esperança", "graça" ou "refúgio".
            </div>
          ) : (
            <div className="space-y-2.5">
              {searchResults.map(verse => {
                const isFav = db.isFavorite(verse.id, 'verse');
                return (
                  <div
                    key={verse.id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-400/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                      <span>
                        {verse.bookName} {verse.chapter}:{verse.verse}
                      </span>
                      <span className="text-[10px] text-slate-400">Bíblia Livre</span>
                    </div>

                    <p className="font-serif-reading text-sm text-slate-200 leading-relaxed italic">
                      "{verse.text}"
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => handleCopy(verse)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
                        title="Copiar versículo"
                      >
                        {copiedId === verse.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === verse.id ? 'Copiado' : 'Copiar'}</span>
                      </button>

                      <button
                        onClick={() => handleFavorite(verse)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                          isFav
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                        title="Favoritar versículo"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{isFav ? 'Salvo' : 'Salvar'}</span>
                      </button>

                      <button
                        onClick={() =>
                          onShareVerse({
                            reference: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
                            text: verse.text,
                          })
                        }
                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 transition-colors cursor-pointer text-xs flex items-center gap-1"
                        title="Compartilhar versículo"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* STANDARD CHAPTER READER */
        <div className="space-y-5">
          {/* Testament & Book Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            {/* Testament Toggle */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => {
                  setTestament('AT');
                  setSelectedBook(BIBLE_BOOKS.find(b => b.testament === 'AT')!);
                  setCurrentChapter(1);
                }}
                className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  testament === 'AT' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Antigo Testamento
              </button>
              <button
                onClick={() => {
                  setTestament('NT');
                  setSelectedBook(BIBLE_BOOKS.find(b => b.testament === 'NT')!);
                  setCurrentChapter(1);
                }}
                className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  testament === 'NT' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Novo Testamento
              </button>
            </div>

            {/* Book picker dropdown toggle */}
            <button
              onClick={() => setShowBookSelector(!showBookSelector)}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-200 font-semibold text-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{selectedBook.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBookSelector ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Book selector drawer if expanded */}
          {showBookSelector && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-400/30 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto subtle-scroll">
              {currentBooks.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBook(b);
                    setCurrentChapter(1);
                    setShowBookSelector(false);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs text-center border transition-all cursor-pointer ${
                    selectedBook.id === b.id
                      ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-amber-400/40'
                  }`}
                >
                  <div className="truncate font-medium">{b.name}</div>
                  <div className="text-[10px] text-slate-400">{b.chaptersCount} caps</div>
                </button>
              ))}
            </div>
          )}

          {/* Chapters Carousel / Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto subtle-scroll pb-1">
            {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map(chap => (
              <button
                key={chap}
                onClick={() => {
                  setCurrentChapter(chap);
                  if (isPlayingAudio) {
                    window.speechSynthesis?.cancel();
                    setIsPlayingAudio(false);
                  }
                }}
                className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                  currentChapter === chap
                    ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {chap}
              </button>
            ))}
          </div>

          {/* Reader Top Controls (Font size +/- and Audio Recitation) */}
          <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border border-amber-400/20">
            <div>
              <h2 className="font-display text-lg font-bold text-amber-100">
                {selectedBook.name} {currentChapter}
              </h2>
              <span className="text-[11px] text-amber-300/80 font-medium">Bíblia Livre (PORBLIVRE)</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Audio recitation toggle */}
              <button
                onClick={handleAudioChapterToggle}
                className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
                title="Ouvir capítulo com narração"
              >
                {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Pausar Áudio' : 'Ouvir Capítulo'}</span>
              </button>

              {/* Font Size Selector */}
              <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
                {(['sm', 'md', 'lg', 'xl'] as const).map(sz => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className={`px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                      fontSize === sz ? 'bg-amber-400/20 text-amber-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    A{sz === 'sm' ? '-' : sz === 'xl' ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verses Container */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            {currentVerses.map(verse => {
              const isFav = db.isFavorite(verse.id, 'verse');
              return (
                <div
                  key={verse.id}
                  className="group relative rounded-xl p-2.5 transition-colors hover:bg-slate-800/40"
                >
                  <p className={`font-serif-reading ${fontClass} text-slate-200`}>
                    <sup className="font-sans font-bold text-amber-400 mr-2 text-xs">
                      {verse.verse}
                    </sup>
                    {verse.text}
                  </p>

                  {/* Actions on hover or focus */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="text-[10px] text-slate-400/80">
                      {verse.bookName} {verse.chapter}:{verse.verse} • Bíblia Livre
                    </span>

                    <button
                      onClick={() => handleCopy(verse)}
                      className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copiar"
                    >
                      {copiedId === verse.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === verse.id ? 'Copiado' : 'Copiar'}</span>
                    </button>

                    <button
                      onClick={() => handleFavorite(verse)}
                      className={`hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer ${
                        isFav ? 'text-amber-400 font-medium' : ''
                      }`}
                      title="Favoritar"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{isFav ? 'Salvo' : 'Salvar'}</span>
                    </button>

                    <button
                      onClick={() =>
                        onShareVerse({
                          reference: `${verse.bookName} ${verse.chapter}:{verse.verse}`,
                          text: verse.text,
                        })
                      }
                      className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Compartilhar"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Compartilhar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chapter Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentChapter <= 1}
              onClick={() => setCurrentChapter(currentChapter - 1)}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-xs font-semibold cursor-pointer"
            >
              ← Capítulo Anterior
            </button>

            <span className="text-xs text-slate-400">
              {selectedBook.name} {currentChapter} de {selectedBook.chaptersCount}
            </span>

            <button
              disabled={currentChapter >= selectedBook.chaptersCount}
              onClick={() => setCurrentChapter(currentChapter + 1)}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-xs font-semibold cursor-pointer"
            >
              Próximo Capítulo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
