/**
 * Database schema and application data models for Maná Diário
 */

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  devotionalTimePreference: 'morning' | 'noon' | 'night';
  voicePreference: 'male' | 'female';
  preferredThemes: string[];
  isGuest: boolean;
  createdAt: string;
  isPremium?: boolean;
}

export interface Devotional {
  id: string;
  date: string; // YYYY-MM-DD
  theme: string;
  verseReference: string;
  verseText: string;
  translation: string; // 'Bíblia Livre'
  reflection: string; // 300 to 500 words
  prayer: string; // original prayer
  practicalApplication: string; // actionable step
  imageUrl: string;
  imageUrls: {
    '9:16': string;
    '1:1': string;
    '4:5': string;
    '16:9': string;
  };
  audioDurationSeconds: number;
  soundscapeCategory: SoundscapeCategory;
  tags: string[];
  isNightDevotional?: boolean;
  status: 'published' | 'scheduled' | 'draft' | 'archived';
  viewsCount?: number;
  likesCount?: number;
}

export type SoundscapeCategory =
  | 'Piano'
  | 'Chuva'
  | 'Natureza'
  | 'Água'
  | 'Pássaros'
  | 'Mar'
  | 'Floresta'
  | 'Noite'
  | 'Amanhecer';

export interface BibleBook {
  id: string;
  name: string;
  abbrev: string;
  testament: 'AT' | 'NT';
  chaptersCount: number;
  order: number;
  group: 'Lei' | 'História' | 'Poesia' | 'Profetas' | 'Evangelhos' | 'Cartas' | 'Profecia';
}

export interface BibleVerse {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  translation: 'Bíblia Livre';
}

export interface FavoriteItem {
  id: string;
  type: 'verse' | 'devotional' | 'prayer' | 'audio';
  targetId: string;
  title: string;
  reference?: string;
  textSnippet: string;
  savedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
}

export interface MomentOption {
  id: string;
  label: string;
  emoji: string;
  verseReference: string;
  verseText: string;
  translation: 'Bíblia Livre';
  encouragement: string;
  suggestedPrayer: string;
  suggestedTheme: string;
}

export interface NotificationSetting {
  id: 'morning' | 'noon' | 'night';
  title: string;
  time: string;
  message: string;
  enabled: boolean;
}

export interface UserProgress {
  streakDays: number;
  lastDevotionalDate: string;
  completedDevotionalsIds: string[];
  completedPracticesIds: string[];
  savedVersesCount: number;
  savedPrayersCount: number;
  listeningSeconds: number;
}

export interface Achievement {
  id: string;
  daysRequired: number;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface AppSettings {
  darkMode: boolean;
  highContrast: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  ambientSoundEnabled: boolean;
  ambientSoundCategory: SoundscapeCategory;
  ambientSoundVolume: number; // 0 to 1
  narrationVolume: number; // 0 to 1
  narrationSpeed: number; // 0.75, 1.0, 1.25, 1.5
  preferredVoice: 'male' | 'female';
  notifications: NotificationSetting[];
}
