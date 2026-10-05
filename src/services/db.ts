import {
  User,
  Devotional,
  FavoriteItem,
  UserProgress,
  Achievement,
  AppSettings,
  BibleVerse,
} from '../types';
import { INITIAL_DEVOTIONALS } from '../data/devotionalsData';
import { BIBLE_VERSES_CATALOG } from '../data/bibleData';

const STORAGE_KEYS = {
  USER: 'mana_diario_user_v1',
  DEVOTIONALS: 'mana_diario_devotionals_v1',
  FAVORITES: 'mana_diario_favorites_v1',
  PROGRESS: 'mana_diario_progress_v1',
  SETTINGS: 'mana_diario_settings_v1',
  ONBOARDING_DONE: 'mana_diario_onboarding_done_v1',
};

const DEFAULT_USER: User = {
  id: 'guest-1',
  name: 'Viajante da Fé',
  email: 'visitante@manadiario.app',
  devotionalTimePreference: 'morning',
  voicePreference: 'male',
  preferredThemes: ['Fé', 'Esperança', 'Paz', 'Oração'],
  isGuest: true,
  createdAt: new Date().toISOString(),
  isPremium: false,
};

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  highContrast: false,
  fontSize: 'md',
  ambientSoundEnabled: false,
  ambientSoundCategory: 'Piano',
  ambientSoundVolume: 0.35,
  narrationVolume: 0.9,
  narrationSpeed: 1.0,
  preferredVoice: 'male',
  notifications: [
    {
      id: 'morning',
      title: 'Maná da Manhã',
      time: '07:00',
      message: 'Bom dia! Seu Maná Diário está esperando por você.',
      enabled: true,
    },
    {
      id: 'noon',
      title: 'Pausa da Esperança',
      time: '12:30',
      message: 'Pare alguns minutos. Respire. Deus continua cuidando de você.',
      enabled: true,
    },
    {
      id: 'night',
      title: 'Maná Noturno',
      time: '21:30',
      message: 'Antes de dormir, entregue seu dia nas mãos de Deus.',
      enabled: true,
    },
  ],
};

const DEFAULT_PROGRESS: UserProgress = {
  streakDays: 3,
  lastDevotionalDate: new Date().toISOString().split('T')[0],
  completedDevotionalsIds: ['mana-hoje-2', 'mana-hoje-3'],
  completedPracticesIds: ['mana-hoje-2'],
  savedVersesCount: 3,
  savedPrayersCount: 2,
  listeningSeconds: 780, // ~13 mins
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'ach-1',
    daysRequired: 1,
    title: 'Primeiro Passo com Deus',
    description: 'Completou seu primeiro devocional no Maná Diário.',
    icon: '🌱',
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'ach-7',
    daysRequired: 7,
    title: 'Raízes na Palavra',
    description: '7 dias consecutivos alimentando sua alma com o Maná Diário.',
    icon: '🌿',
  },
  {
    id: 'ach-30',
    daysRequired: 30,
    title: 'Caminho da Paz',
    description: '1 mês ininterrupto de comunhão diária com as Escrituras.',
    icon: '🕊️',
  },
  {
    id: 'ach-90',
    daysRequired: 90,
    title: 'Coração Frutífero',
    description: 'Uma estação inteira semeando no Reino de Deus.',
    icon: '🍇',
  },
  {
    id: 'ach-180',
    daysRequired: 180,
    title: 'Constância Espiritual',
    description: 'Meio ano de fidelidade no secreto com o Criador.',
    icon: '🛡️',
  },
  {
    id: 'ach-365',
    daysRequired: 365,
    title: 'Um Ano com o Maná',
    description: '365 dias transformados pela presença viva do Senhor.',
    icon: '👑',
  },
];

const INITIAL_FAVORITES: FavoriteItem[] = [
  {
    id: 'fav-1',
    type: 'verse',
    targetId: 'sl-23-1',
    title: 'Salmos 23:1-3',
    reference: 'Salmos 23:1-3',
    textSnippet: 'O SENHOR é o meu pastor; nada me faltará. Em verdes pastos me faz repousar...',
    savedAt: new Date().toISOString(),
  },
  {
    id: 'fav-2',
    type: 'devotional',
    targetId: 'mana-hoje-1',
    title: 'O Pão que Desce do Céu para a Sua Jornada',
    reference: 'Êxodo 16:4',
    textSnippet: 'A fidelidade do Criador não depende da fertilidade da terra, mas da abundância inesgotável da Sua graça...',
    savedAt: new Date().toISOString(),
  },
  {
    id: 'fav-3',
    type: 'prayer',
    targetId: 'mana-hoje-1-prayer',
    title: 'Oração da Manhã de Provisão',
    reference: 'Êxodo 16:4',
    textSnippet: 'Senhor Todo-Poderoso, Deus da provisão e Pai das luzes, reconheço que muitas vezes me inquieto com o amanhã...',
    savedAt: new Date().toISOString(),
  },
];

class DatabaseService {
  private listeners: Set<() => void> = new Set();

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // --- USER ---
  public getUser(): User {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return DEFAULT_USER;
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_USER;
    }
  }

  public saveUser(user: Partial<User>) {
    const current = this.getUser();
    const updated = { ...current, ...user };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- ONBOARDING ---
  public isOnboardingCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  }

  public setOnboardingCompleted() {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
    this.notify();
  }

  // --- DEVOTIONALS ---
  public getDevotionals(): Devotional[] {
    const data = localStorage.getItem(STORAGE_KEYS.DEVOTIONALS);
    if (!data) {
      this.saveDevotionals(INITIAL_DEVOTIONALS);
      return INITIAL_DEVOTIONALS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_DEVOTIONALS;
    }
  }

  public saveDevotionals(list: Devotional[]) {
    localStorage.setItem(STORAGE_KEYS.DEVOTIONALS, JSON.stringify(list));
    this.notify();
  }

  public getTodayDevotional(): Devotional {
    const list = this.getDevotionals();
    const today = new Date().toISOString().split('T')[0];
    const match = list.find(d => d.date === today && !d.isNightDevotional);
    return match || list[0];
  }

  public getNightDevotional(): Devotional {
    const list = this.getDevotionals();
    const match = list.find(d => d.isNightDevotional);
    return match || list[list.length - 1];
  }

  public addDevotional(item: Devotional) {
    const list = this.getDevotionals();
    const updated = [item, ...list];
    this.saveDevotionals(updated);
    return updated;
  }

  public updateDevotional(id: string, updates: Partial<Devotional>) {
    const list = this.getDevotionals();
    const updated = list.map(d => (d.id === id ? { ...d, ...updates } : d));
    this.saveDevotionals(updated);
    return updated;
  }

  // --- FAVORITES ---
  public getFavorites(): FavoriteItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(INITIAL_FAVORITES));
      return INITIAL_FAVORITES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_FAVORITES;
    }
  }

  public isFavorite(targetId: string, type: FavoriteItem['type']): boolean {
    const favs = this.getFavorites();
    return favs.some(f => f.targetId === targetId && f.type === type);
  }

  public toggleFavorite(item: Omit<FavoriteItem, 'id' | 'savedAt'>) {
    const favs = this.getFavorites();
    const existingIndex = favs.findIndex(f => f.targetId === item.targetId && f.type === item.type);

    let updated: FavoriteItem[];
    if (existingIndex >= 0) {
      updated = favs.filter((_, i) => i !== existingIndex);
    } else {
      const newItem: FavoriteItem = {
        ...item,
        id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        savedAt: new Date().toISOString(),
      };
      updated = [newItem, ...favs];
    }

    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  public removeFavorite(id: string) {
    const favs = this.getFavorites();
    const updated = favs.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- PROGRESS & STREAK ---
  public getProgress(): UserProgress {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!data) return DEFAULT_PROGRESS;
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_PROGRESS;
    }
  }

  public markDevotionalCompleted(devotionalId: string) {
    const progress = this.getProgress();
    if (!progress.completedDevotionalsIds.includes(devotionalId)) {
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = progress.lastDevotionalDate !== today;
      const updated: UserProgress = {
        ...progress,
        streakDays: isNewDay ? progress.streakDays + 1 : progress.streakDays,
        lastDevotionalDate: today,
        completedDevotionalsIds: [...progress.completedDevotionalsIds, devotionalId],
      };
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updated));
      this.notify();
      return updated;
    }
    return progress;
  }

  public markPracticeCompleted(devotionalId: string) {
    const progress = this.getProgress();
    if (!progress.completedPracticesIds.includes(devotionalId)) {
      const updated: UserProgress = {
        ...progress,
        completedPracticesIds: [...progress.completedPracticesIds, devotionalId],
      };
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updated));
      this.notify();
      return updated;
    }
    return progress;
  }

  public addListeningTime(seconds: number) {
    const progress = this.getProgress();
    const updated: UserProgress = {
      ...progress,
      listeningSeconds: (progress.listeningSeconds || 0) + seconds,
    };
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updated));
    this.notify();
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(settings: Partial<AppSettings>) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.notify();
    return updated;
  }
}

export const db = new DatabaseService();
