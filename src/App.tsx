import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { NavTab, BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { DevotionalView } from './components/DevotionalView';
import { BibleReaderView } from './components/BibleReaderView';
import { FavoritesView } from './components/FavoritesView';
import { ProfileView } from './components/ProfileView';
import { SplashAndOnboarding } from './components/SplashAndOnboarding';
import { NightDevotionalModal } from './components/NightDevotionalModal';
import { MomentsModal } from './components/MomentsModal';
import { ShareModal } from './components/ShareModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { LegalModals } from './components/LegalModals';
import { Devotional } from './types';

export default function App() {
  const [isOnboardingDone, setIsOnboardingDone] = useState<boolean>(() => {
    return db.isOnboardingCompleted();
  });
  const [currentTab, setCurrentTab] = useState<NavTab>('inicio');
  const [activeDevotional, setActiveDevotional] = useState<Devotional>(() => {
    return db.getTodayDevotional();
  });

  // Modals state
  const [isNightModalOpen, setIsNightModalOpen] = useState(false);
  const [isMomentsModalOpen, setIsMomentsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'licenses' | 'premium' | null>(null);

  // Share Modal state
  const [shareData, setShareData] = useState<{
    isOpen: boolean;
    verseText: string;
    verseReference: string;
    reflectionSnippet: string;
    themeTitle?: string;
  }>({
    isOpen: false,
    verseText: '',
    verseReference: '',
    reflectionSnippet: '',
  });

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setIsOnboardingDone(db.isOnboardingCompleted());
    });
    return unsub;
  }, []);

  const handleOpenDevotional = (devotionalId?: string) => {
    if (devotionalId) {
      const list = db.getDevotionals();
      const match = list.find(d => d.id === devotionalId);
      if (match) setActiveDevotional(match);
    } else {
      setActiveDevotional(db.getTodayDevotional());
    }
    setCurrentTab('mana');
  };

  const handleOpenShare = (data: {
    verseText: string;
    verseReference: string;
    reflectionSnippet: string;
    themeTitle?: string;
  }) => {
    setShareData({
      isOpen: true,
      ...data,
    });
  };

  const handleShareVerseOnly = (verse: { reference: string; text: string }) => {
    setShareData({
      isOpen: true,
      verseText: verse.text,
      verseReference: verse.reference,
      reflectionSnippet: 'Medite na Palavra do Senhor todos os dias e encontre descanso para a sua alma.',
    });
  };

  // If user has not completed onboarding, show Splash & Onboarding
  if (!isOnboardingDone) {
    return <SplashAndOnboarding onComplete={() => setIsOnboardingDone(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#081226] text-slate-100 font-sans selection:bg-amber-400/30 selection:text-amber-200">
      {/* Top Main Navigation Bar for Branding */}
      <header className="sticky top-0 z-40 bg-[#081226]/90 backdrop-blur-md border-b border-amber-400/15 py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div
            onClick={() => setCurrentTab('inicio')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl glass-panel-gold flex items-center justify-center border border-amber-400/30 text-gold-gradient font-display font-bold text-lg">
              M
            </div>
            <div>
              <span className="font-display font-bold tracking-wider text-amber-200 text-sm sm:text-base group-hover:text-amber-100 transition-colors">
                MANÁ DIÁRIO
              </span>
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block italic font-serif-reading">
                Alimente sua alma todos os dias.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNightModalOpen(true)}
              className="py-1 px-3 rounded-full bg-blue-950/80 hover:bg-blue-900/80 border border-blue-800/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Abrir Maná Noturno"
            >
              <span>🌙 Noite</span>
            </button>
            <button
              onClick={() => setIsMomentsModalOpen(true)}
              className="py-1 px-3 rounded-full bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Como você está hoje?"
            >
              <span>Momento</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Views */}
      <main className="relative">
        {currentTab === 'inicio' && (
          <HomeView
            onOpenDevotional={handleOpenDevotional}
            onOpenNightDevotional={() => setIsNightModalOpen(true)}
            onOpenMoments={() => setIsMomentsModalOpen(true)}
            onSelectCategory={() => setCurrentTab('biblia')}
          />
        )}

        {currentTab === 'biblia' && (
          <BibleReaderView
            onShareVerse={handleShareVerseOnly}
            onOpenLicenses={() => setLegalModalType('licenses')}
          />
        )}

        {currentTab === 'mana' && (
          <DevotionalView
            devotional={activeDevotional}
            onShare={handleOpenShare}
          />
        )}

        {currentTab === 'favoritos' && (
          <FavoritesView
            onOpenDevotional={handleOpenDevotional}
            onShareVerse={handleShareVerseOnly}
          />
        )}

        {currentTab === 'perfil' && (
          <ProfileView
            onOpenAdmin={() => setIsAdminModalOpen(true)}
            onOpenLegal={type => setLegalModalType(type)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Modals */}
      <NightDevotionalModal
        isOpen={isNightModalOpen}
        onClose={() => setIsNightModalOpen(false)}
      />

      <MomentsModal
        isOpen={isMomentsModalOpen}
        onClose={() => setIsMomentsModalOpen(false)}
        onOpenDevotional={() => handleOpenDevotional()}
        onShareVerse={handleShareVerseOnly}
      />

      <ShareModal
        isOpen={shareData.isOpen}
        onClose={() => setShareData(prev => ({ ...prev, isOpen: false }))}
        data={{
          verseText: shareData.verseText,
          verseReference: shareData.verseReference,
          reflectionSnippet: shareData.reflectionSnippet,
          themeTitle: shareData.themeTitle,
        }}
      />

      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      <LegalModals
        activeModal={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
