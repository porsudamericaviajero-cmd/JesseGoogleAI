import React, { useState, useEffect } from 'react';
import { Devotional, SoundscapeCategory } from '../types';
import { db } from '../services/db';
import {
  ttsService,
  NarrationState,
  DevotionalSectionKey,
  MALE_VOICE_PERSONAS,
  MaleVoicePersona,
} from '../services/ttsService';
import { soundscape } from '../services/ambientAudio';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Bookmark,
  Share2,
  CheckCircle,
  Sparkles,
  Music,
  Sliders,
  Heart,
  ChevronDown,
  Mic,
  Activity,
} from 'lucide-react';

interface Props {
  devotional: Devotional;
  onShare: (data: {
    verseText: string;
    verseReference: string;
    reflectionSnippet: string;
    themeTitle: string;
  }) => void;
}

export const DevotionalView: React.FC<Props> = ({ devotional, onShare }) => {
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '4:5' | '16:9'>('16:9');
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [prayerSaved, setPrayerSaved] = useState(false);
  const [isFavoriteDevotional, setIsFavoriteDevotional] = useState(false);

  // Audio narration state
  const [narrationState, setNarrationState] = useState<NarrationState>({
    isPlaying: false,
    isPaused: false,
    currentSection: 'intro',
    progressPercent: 0,
    currentTimeFormatted: '0:00',
    totalTimeFormatted: '3:05',
    voiceGender: 'male',
    malePersona: 'Charon',
    speed: 1.0,
    volume: 0.95,
    isAiAudio: false,
    audioVisualizerBars: [15, 15, 15, 15, 15, 15, 15, 15],
  });

  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  // Soundscape ambient state
  const [ambientCategory, setAmbientCategory] = useState<SoundscapeCategory>(devotional.soundscapeCategory || 'Piano');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.35);
  const [showAmbientControls, setShowAmbientControls] = useState(false);

  useEffect(() => {
    // Check practice completion
    const progress = db.getProgress();
    setPracticeCompleted(progress.completedPracticesIds.includes(devotional.id));

    // Check favorite status
    setIsFavoriteDevotional(db.isFavorite(devotional.id, 'devotional'));

    // Prepare Narration Sections: Introdução, Versículo, Reflexão, Oração, Encerramento
    const sections = [
      {
        key: 'intro' as DevotionalSectionKey,
        label: 'Introdução',
        text: `Maná Diário. Alimente sua alma todos os dias. Devocional de hoje: ${devotional.theme}.`,
      },
      {
        key: 'verse' as DevotionalSectionKey,
        label: 'Versículo Bíblico',
        text: `Leitura bíblica em ${devotional.verseReference}, na tradução Bíblia Livre. ${devotional.verseText}`,
      },
      {
        key: 'reflection' as DevotionalSectionKey,
        label: 'Reflexão',
        text: devotional.reflection,
      },
      {
        key: 'prayer' as DevotionalSectionKey,
        label: 'Oração',
        text: `Vamos orar. ${devotional.prayer}`,
      },
      {
        key: 'outro' as DevotionalSectionKey,
        label: 'Encerramento',
        text: `Prática para o seu dia: ${devotional.practicalApplication}. Que a graça e a paz do Senhor Jesus estejam com você por todo este dia. Amém.`,
      },
    ];

    ttsService.loadDevotional(sections);

    const unsubscribe = ttsService.subscribe(state => {
      setNarrationState(state);
      if (state.isPlaying) {
        db.addListeningTime(1);
        db.markDevotionalCompleted(devotional.id);
      }
    });

    return () => {
      unsubscribe();
      ttsService.stop();
      soundscape.stop();
    };
  }, [devotional.id]);

  const handleToggleFavorite = () => {
    db.toggleFavorite({
      type: 'devotional',
      targetId: devotional.id,
      title: devotional.theme,
      reference: devotional.verseReference,
      textSnippet: devotional.reflection.substring(0, 160) + '...',
    });
    setIsFavoriteDevotional(!isFavoriteDevotional);
  };

  const handleSavePrayer = () => {
    db.toggleFavorite({
      type: 'prayer',
      targetId: `${devotional.id}-prayer`,
      title: `Oração: ${devotional.theme}`,
      reference: devotional.verseReference,
      textSnippet: devotional.prayer,
    });
    setPrayerSaved(true);
    setTimeout(() => setPrayerSaved(false), 2500);
  };

  const handleCompletePractice = () => {
    db.markPracticeCompleted(devotional.id);
    setPracticeCompleted(true);
  };

  const toggleSoundscape = (cat?: SoundscapeCategory) => {
    const targetCat = cat || ambientCategory;
    if (isAmbientPlaying && ambientCategory === targetCat && !cat) {
      soundscape.stop();
      setIsAmbientPlaying(false);
    } else {
      setAmbientCategory(targetCat);
      soundscape.play(targetCat, ambientVolume);
      setIsAmbientPlaying(true);
    }
  };

  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    soundscape.setVolume(vol);
  };

  const currentImage = devotional.imageUrls[aspectRatio] || devotional.imageUrl;

  return (
    <div className="min-h-screen pb-32 pt-2 px-4 sm:px-6 max-w-3xl mx-auto text-slate-100">
      {/* Top Bar with Date & Tags */}
      <div className="flex items-center justify-between py-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
            MANÁ DE HOJE
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-400">
            {new Date(devotional.date + 'T12:00:00Z').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isFavoriteDevotional
                ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Favoritar devocional"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              onShare({
                verseText: devotional.verseText,
                verseReference: devotional.verseReference,
                reflectionSnippet: devotional.reflection.substring(0, 150),
                themeTitle: devotional.theme,
              })
            }
            className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* DEVOTIONAL TITLE */}
      <div className="mb-4">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-slate-50 tracking-tight leading-tight mb-2">
          {devotional.theme}
        </h1>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {devotional.tags.map(tag => (
            <span
              key={tag}
              className="text-[11px] font-medium py-0.5 px-2.5 rounded-full bg-slate-900 text-amber-300/90 border border-slate-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* FEATURED CINEMATIC DEVOTIONAL IMAGE WITH ASPECT RATIO CONTROLS */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-400/20 shadow-2xl mb-6 group bg-black">
        <img
          src={currentImage}
          alt={devotional.theme}
          className={`w-full object-cover transition-all duration-500 ${
            aspectRatio === '9:16'
              ? 'aspect-[9/16] max-h-[500px]'
              : aspectRatio === '1:1'
              ? 'aspect-square max-h-[440px]'
              : aspectRatio === '4:5'
              ? 'aspect-[4/5] max-h-[460px]'
              : 'aspect-video max-h-[400px]'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081226] via-transparent to-transparent opacity-80" />

        {/* Aspect Ratio Switcher overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[10px] text-slate-300">
          {(['9:16', '1:1', '4:5', '16:9'] as const).map(ratio => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`py-1 px-2 rounded-lg transition-all cursor-pointer ${
                aspectRatio === ratio
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'hover:text-white'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>

        {/* Caption */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-amber-200/90">
          <span className="font-serif-reading italic font-medium drop-shadow-md">
            Arte Espiritual Exclusiva • Maná Diário
          </span>
          <span className="text-[10px] text-slate-300/80 bg-black/50 px-2 py-0.5 rounded-full">
            {aspectRatio}
          </span>
        </div>
      </div>

      {/* DEDICATED DEVOTIONAL AUDIO PLAYER (MALE VOICE HIGHLIGHT & SOUNDSCAPES) */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel-gold border border-amber-400/35 shadow-2xl mb-8 space-y-4 relative overflow-hidden">
        {/* Subtle glow backdrop */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header of Audio Player */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Mic className="w-5 h-5 text-amber-300" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                  Narração Devocional
                </span>
                <span className="py-0.5 px-2 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-semibold flex items-center gap-1 border border-amber-400/30">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Voz Masculina</span>
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-100 mt-0.5">
                {
                  narrationState.currentSection === 'intro' ? '1. Introdução' :
                  narrationState.currentSection === 'verse' ? '2. Versículo Bíblico' :
                  narrationState.currentSection === 'reflection' ? '3. Reflexão Original' :
                  narrationState.currentSection === 'prayer' ? '4. Oração Sincera' : '5. Encerramento'
                }
              </div>
            </div>
          </div>

          {/* Quick Voice & Speed Controls */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              className="py-1.5 px-3 rounded-xl bg-slate-900/90 border border-amber-400/40 text-amber-200 hover:border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
            >
              <span>
                {narrationState.voiceGender === 'male'
                  ? MALE_VOICE_PERSONAS.find(p => p.id === narrationState.malePersona)?.name || 'Voz Masculina'
                  : 'Voz Feminina'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showVoiceSelector ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => {
                const speeds = [0.75, 1.0, 1.25, 1.5];
                const nextIdx = (speeds.indexOf(narrationState.speed) + 1) % speeds.length;
                ttsService.setSpeed(speeds[nextIdx]);
              }}
              className="py-1.5 px-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white cursor-pointer font-mono text-xs"
              title="Velocidade de leitura"
            >
              {narrationState.speed}x
            </button>
          </div>
        </div>

        {/* Voice Selector Drawer */}
        {showVoiceSelector && (
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-400/30 space-y-2 relative z-10 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-200 pb-1 border-b border-slate-800">
              <span>Selecione a Voz Devocional:</span>
              <span className="text-[10px] text-slate-400">Timbre Sereno & Bíblico</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {MALE_VOICE_PERSONAS.map(persona => {
                const isSelected = narrationState.voiceGender === 'male' && narrationState.malePersona === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      ttsService.setMalePersona(persona.id);
                      setShowVoiceSelector(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/40'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{persona.name}</span>
                      {isSelected && <span className="text-[10px] text-amber-400">✓ Ativa</span>}
                    </div>
                    <div className="text-[10px] text-amber-300/80 font-medium mt-0.5">{persona.title}</div>
                    <div className="text-[9px] text-slate-400 mt-1 leading-snug line-clamp-2">{persona.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => {
                  ttsService.setVoiceGender('female');
                  setShowVoiceSelector(false);
                }}
                className={`py-1 px-3 rounded-lg text-xs transition-colors cursor-pointer ${
                  narrationState.voiceGender === 'female'
                    ? 'bg-amber-400/20 text-amber-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Preferir Voz Feminina Suave
              </button>

              <button
                onClick={() => setShowVoiceSelector(false)}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Acoustic Soundwave Visualizer & Timeline */}
        <div className="space-y-2 relative z-10">
          {/* Animated sound wave bars */}
          <div className="h-8 flex items-center justify-center gap-1.5 py-1">
            {narrationState.audioVisualizerBars.map((height, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-amber-500 to-amber-300 transition-all duration-150"
                style={{
                  height: `${narrationState.isPlaying ? height : 15}%`,
                  opacity: narrationState.isPlaying ? 0.9 : 0.25,
                }}
              />
            ))}
          </div>

          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 h-full transition-all duration-300"
              style={{ width: `${narrationState.progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{narrationState.currentTimeFormatted}</span>
            <div className="flex items-center gap-1 text-[10px] text-amber-300/80 font-sans">
              <Activity className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>{narrationState.isPlaying ? 'Reproduzindo em Áudio Acolhedor' : 'Pausado'}</span>
            </div>
            <span>{narrationState.totalTimeFormatted}</span>
          </div>
        </div>

        {/* Narration Controls (Play, Pause, Skip 15s) */}
        <div className="flex items-center justify-center gap-5 relative z-10 pt-1">
          <button
            onClick={() => ttsService.skipBackward15()}
            className="p-3 rounded-full hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Voltar 15 segundos"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              if (narrationState.isPlaying) {
                ttsService.pause();
              } else {
                ttsService.play();
              }
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#B78A18] text-slate-950 font-bold flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-amber-400/20"
          >
            {narrationState.isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-0.5" />}
          </button>

          <button
            onClick={() => ttsService.skipForward15()}
            className="p-3 rounded-full hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Avançar 15 segundos"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Soundscape Drawer Toggle */}
        <div className="pt-3 border-t border-amber-400/20 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => toggleSoundscape()}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-xl border transition-colors cursor-pointer ${
                isAmbientPlaying
                  ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Ambiente: {ambientCategory} ({isAmbientPlaying ? 'Ligado' : 'Desligado'})</span>
            </button>

            <button
              onClick={() => setShowAmbientControls(!showAmbientControls)}
              className="text-slate-400 hover:text-amber-200 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ajustar Sons</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showAmbientControls ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Soundscape Options & Volume slider */}
          {showAmbientControls && (
            <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Volume Ambiente: {Math.round(ambientVolume * 100)}%</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={e => handleAmbientVolumeChange(parseFloat(e.target.value))}
                  className="w-32 accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {(['Piano', 'Chuva', 'Natureza', 'Água', 'Pássaros', 'Mar', 'Floresta', 'Noite', 'Amanhecer'] as SoundscapeCategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleSoundscape(cat)}
                    className={`py-1.5 px-2 rounded-lg text-center text-[11px] border transition-all cursor-pointer ${
                      ambientCategory === cat && isAmbientPlaying
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VERSÍCULO BÍBLICO (BÍBLIA LIVRE - PORBLIVRE) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c1c3d] to-[#081226] border border-amber-400/30 shadow-xl mb-8 relative">
        <div className="flex items-center justify-between text-xs font-semibold text-amber-300 mb-2">
          <span className="font-display text-sm tracking-wide">{devotional.verseReference}</span>
          <span className="text-[11px] text-slate-400 font-medium">{devotional.translation}</span>
        </div>

        <blockquote className="font-serif-reading italic text-base sm:text-lg text-amber-100 leading-relaxed">
          "{devotional.verseText}"
        </blockquote>
      </div>

      {/* REFLEXÃO DEVOCIONAL ORIGINAL (300 A 500 PALAVRAS) */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest pb-1 border-b border-slate-800/80">
          <Sparkles className="w-4 h-4" />
          <span>REFLEXÃO</span>
        </div>

        <div className="font-serif-reading text-base sm:text-lg text-slate-200 leading-relaxed sm:leading-loose space-y-4 whitespace-pre-line">
          {devotional.reflection}
        </div>
      </div>

      {/* SEÇÃO: VAMOS ORAR */}
      <div className="p-6 rounded-3xl bg-[#091733] border border-amber-400/30 shadow-xl mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>VAMOS ORAR</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                ttsService.jumpToSection('prayer');
                ttsService.play();
              }}
              className="py-1.5 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>OUVIR ORAÇÃO</span>
            </button>

            <button
              onClick={handleSavePrayer}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{prayerSaved ? 'Salva!' : 'SALVAR ORAÇÃO'}</span>
            </button>
          </div>
        </div>

        <p className="font-serif-reading italic text-sm sm:text-base text-amber-100/95 leading-relaxed bg-black/25 p-4 rounded-2xl border border-white/5">
          "{devotional.prayer}"
        </p>
      </div>

      {/* SEÇÃO: PARA PRATICAR HOJE */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl mb-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          <span>PARA PRATICAR HOJE</span>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
          {devotional.practicalApplication}
        </p>

        <button
          onClick={handleCompletePractice}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            practiceCompleted
              ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300'
              : 'bg-gradient-to-r from-[#D4AF37] to-[#B78A18] text-slate-950 shadow-lg hover:brightness-110 active:scale-[0.98]'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{practiceCompleted ? 'PRÁTICA CONCLUÍDA HOJE! GLÓRIA A DEUS' : 'CONCLUÍ MINHA PRÁTICA'}</span>
        </button>
      </div>

      {/* Bottom Share Trigger */}
      <div className="text-center py-4">
        <button
          onClick={() =>
            onShare({
              verseText: devotional.verseText,
              verseReference: devotional.verseReference,
              reflectionSnippet: devotional.reflection.substring(0, 150),
              themeTitle: devotional.theme,
            })
          }
          className="py-3 px-6 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg"
        >
          <Share2 className="w-4 h-4" />
          <span>COMPARTILHAR ESTE MANÁ COM UM AMIGO</span>
        </button>
      </div>
    </div>
  );
};
