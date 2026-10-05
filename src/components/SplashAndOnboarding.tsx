import React, { useState } from 'react';
import { db } from '../services/db';
import { Sparkles, ArrowRight, Check, Heart, Shield, Sun, Volume2, Clock } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const SplashAndOnboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<'splash' | 'onboarding' | 'signup'>('splash');
  const [onboardingSlide, setOnboardingSlide] = useState(0);
  const [name, setName] = useState('');
  const [devotionalTime, setDevotionalTime] = useState<'morning' | 'noon' | 'night'>('morning');
  const [voicePreference, setVoicePreference] = useState<'male' | 'female'>('male');
  const [selectedThemes, setSelectedThemes] = useState<string[]>(['Fé', 'Paz', 'Esperança']);

  const onboardingSlides = [
    {
      title: 'Um momento com Deus pode transformar o seu dia.',
      subtitle: 'Comece ou termine cada dia alimentando o seu espírito com a Palavra viva e eficaz.',
      icon: Sun,
    },
    {
      title: 'Receba uma nova palavra todos os dias.',
      subtitle: 'Devocionais originais, bíblicos e profundos, com a tradução Bíblia Livre.',
      icon: Sparkles,
    },
    {
      title: 'Leia. Ouça. Ore. Viva.',
      subtitle: 'Narração serena, ambientes sonoros relaxantes e práticas simples para o seu cotidiano.',
      icon: Heart,
    },
    {
      title: 'Seu Maná Diário começa agora.',
      subtitle: 'Junte-se a milhares de cristãos que buscam paz, esperança e intimidade com Deus.',
      icon: Shield,
    },
  ];

  const handleNextSlide = () => {
    if (onboardingSlide < onboardingSlides.length - 1) {
      setOnboardingSlide(onboardingSlide + 1);
    } else {
      setStep('signup');
    }
  };

  const handleFinishSignup = (provider?: string) => {
    const userName = name.trim() || (provider ? `Amigo da Fé (${provider})` : 'Irmão em Cristo');
    db.saveUser({
      name: userName,
      devotionalTimePreference: devotionalTime,
      voicePreference: voicePreference,
      preferredThemes: selectedThemes,
      isGuest: !provider || provider === 'visitante',
    });
    db.setOnboardingCompleted();
    onComplete();
  };

  const toggleTheme = (theme: string) => {
    if (selectedThemes.includes(theme)) {
      setSelectedThemes(selectedThemes.filter(t => t !== theme));
    } else {
      setSelectedThemes([...selectedThemes, theme]);
    }
  };

  // SPLASH SCREEN
  if (step === 'splash') {
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-8 overflow-hidden bg-[#071126] text-white">
        {/* Cinematic sunrise background with soft golden light & mountains */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071126] via-[#071126]/75 to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top spacer */}
        <div className="relative z-10 pt-8 flex items-center gap-2 text-xs uppercase tracking-widest text-amber-300/80 font-medium">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Devocional Cristão Diário</span>
        </div>

        {/* Center Logo & Slogan */}
        <div className="relative z-10 text-center max-w-md my-auto flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl glass-panel-gold flex items-center justify-center mb-6 shadow-2xl gold-glow border border-amber-300/40">
            <span className="font-display text-4xl font-bold text-gold-gradient">M</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-wider text-slate-50 uppercase mb-3">
            MANÁ DIÁRIO
          </h1>

          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-4" />

          <p className="font-serif-reading italic text-lg sm:text-xl text-amber-100/90 font-normal">
            "Alimente sua alma todos os dias."
          </p>

          <p className="text-xs text-slate-400 mt-4 max-w-xs leading-relaxed">
            Palavra bíblica, oração, áudio reflexivo e comunhão com Deus no seu ritmo.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="relative z-10 w-full max-w-sm pb-6">
          <button
            onClick={() => setStep('onboarding')}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C59B27] text-slate-950 font-semibold shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>ENTRAR NA PRESENÇA</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-center text-[11px] text-slate-400/80 mt-3">
            Tradução Bíblia Livre (PORBLIVRE) • CC BY 3.0 BR
          </p>
        </div>
      </div>
    );
  }

  // ONBOARDING SLIDES (4 screens as requested)
  if (step === 'onboarding') {
    const slide = onboardingSlides[onboardingSlide];
    const IconComp = slide.icon;

    return (
      <div className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 bg-[#081226] text-white">
        {/* Background ambient aura */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-amber-400 text-lg tracking-wider">MANÁ DIÁRIO</span>
          </div>
          <button
            onClick={() => setStep('signup')}
            className="text-xs text-slate-400 hover:text-amber-200 transition-colors py-1 px-3 rounded-full border border-slate-700/60"
          >
            Pular
          </button>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-md mx-auto my-auto text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl glass-panel-gold flex items-center justify-center mb-8 text-amber-300 shadow-2xl border border-amber-400/20">
            <IconComp className="w-12 h-12" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-50 mb-4 leading-snug">
            {slide.title}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-sm">
            {slide.subtitle}
          </p>
        </div>

        {/* Bottom Pagination & Navigation */}
        <div className="relative z-10 max-w-sm mx-auto w-full pb-4">
          {/* Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {onboardingSlides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === onboardingSlide ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {onboardingSlide < onboardingSlides.length - 1 ? (
            <button
              onClick={handleNextSlide}
              className="w-full py-4 px-6 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setStep('signup')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B78A18] text-slate-950 font-bold shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>COMEÇAR</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // SIGNUP / SETUP PREFERENCES
  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 bg-[#081226] text-white overflow-y-auto subtle-scroll">
      <div className="max-w-md mx-auto w-full my-auto py-6">
        <div className="text-center mb-6">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">
            Personalize sua Experiência
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-1 text-slate-100">
            Boas-vindas ao Maná Diário
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Como você gostaria de ser chamado na sua caminhada com Deus?
          </p>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Seu Nome ou Como prefere ser chamado:
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Maria, João, Amigo da Fé"
              className="w-full py-3 px-4 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Devotional Time Preference */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Horário preferido para o seu devocional:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'morning', label: 'Manhã', sub: '07:00' },
                { id: 'noon', label: 'Meio-dia', sub: '12:30' },
                { id: 'night', label: 'Noite', sub: '21:30' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDevotionalTime(opt.id as any)}
                  className={`py-2.5 px-2 rounded-xl text-center border transition-all text-xs cursor-pointer ${
                    devotionalTime === opt.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Preference */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Voz preferida para a narração:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVoicePreference('female')}
                className={`py-2 px-3 rounded-xl border text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  voicePreference === 'female'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>Voz Suave Feminina</span>
              </button>
              <button
                type="button"
                onClick={() => setVoicePreference('male')}
                className={`py-2 px-3 rounded-xl border text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  voicePreference === 'male'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>Voz Serena Masculina</span>
              </button>
            </div>
          </div>

          {/* Preferred Themes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Temas prioritários para o seu coração:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Fé', 'Paz', 'Esperança', 'Oração', 'Força', 'Família', 'Gratidão', 'Perdão'].map(theme => {
                const active = selectedThemes.includes(theme);
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => toggleTheme(theme)}
                    className={`py-1 px-3 rounded-lg text-xs transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 font-medium'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {active ? `✓ ${theme}` : theme}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Authentication Choices */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5">
          <button
            type="button"
            onClick={() => handleFinishSignup('Google')}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-medium text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continuar com Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleFinishSignup('Apple')}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-medium text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.58-6.19-9.5-10.9-20.2-14.13-32.1-3.23-11.9-4.85-23.08-4.85-33.53 0-14.07 3.57-25.79 10.7-35.17 7.14-9.37 16.27-14.14 27.4-14.3 4.79 0 10.02 1.34 15.69 4.02 5.66 2.68 9.53 4.09 11.58 4.23 1.74-.14 5.75-1.63 12.04-4.48 6.29-2.84 11.75-4.11 16.39-3.8 12.22.63 21.75 5.17 28.58 13.62-10.84 6.53-16.14 15.54-15.9 27.02.24 9.17 3.69 16.89 10.36 23.16 6.66 6.27 14.53 9.77 23.59 10.5-2.23 6.78-4.82 13.52-7.79 20.21zM119.22 33.15c0-6.66 2.45-13.06 7.35-19.2 4.9-6.14 11.08-10.42 18.54-12.83.47 5.76-1.39 11.75-5.59 17.98-4.2 6.23-9.57 10.59-16.12 13.07-.63-.33-1.69-.67-3.18-1.02h-1z" />
            </svg>
            <span>Continuar com Apple</span>
          </button>

          <button
            type="button"
            onClick={() => handleFinishSignup('visitante')}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B78A18] text-slate-950 font-bold text-sm shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continuar no Modo Visitante</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
