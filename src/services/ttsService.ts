export type DevotionalSectionKey = 'intro' | 'verse' | 'reflection' | 'prayer' | 'outro';

export type MaleVoicePersona = 'Charon' | 'Puck' | 'Fenrir';

export interface NarrationSection {
  key: DevotionalSectionKey;
  label: string;
  text: string;
}

export interface NarrationState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSection: DevotionalSectionKey;
  progressPercent: number;
  currentTimeFormatted: string;
  totalTimeFormatted: string;
  voiceGender: 'male' | 'female';
  malePersona: MaleVoicePersona;
  speed: number;
  volume: number;
  isAiAudio: boolean;
  audioVisualizerBars: number[];
}

export const MALE_VOICE_PERSONAS: { id: MaleVoicePersona; name: string; title: string; desc: string }[] = [
  {
    id: 'Charon',
    name: 'Pastor Davi',
    title: 'Voz Serena & Profunda',
    desc: 'Timbre aveludado, grave e acolhedor, ideal para momentos de paz e oração silenciosa.',
  },
  {
    id: 'Puck',
    name: 'Pastor Samuel',
    title: 'Voz Firme & Inspiradora',
    desc: 'Tom caloroso e edificante, trazendo renovo e força para a jornada da fé.',
  },
  {
    id: 'Fenrir',
    name: 'Irmão Lucas',
    title: 'Voz Nobre & Acolhedora',
    desc: 'Cadência tranquila e ponderada, excelente para reflexões e meditações bíblicas.',
  },
];

class NarrationService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map(); // cache base64 audio URLs

  private sections: NarrationSection[] = [];
  private currentSectionIndex: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private speed: number = 1.0;
  private volume: number = 0.95;
  private voiceGender: 'male' | 'female' = 'male'; // DEFAULT TO MALE VOICE
  private malePersona: MaleVoicePersona = 'Charon';
  private isAiAudio: boolean = false;

  private listeners: Set<(state: NarrationState) => void> = new Set();
  private timer: any = null;
  private visualizerTimer: any = null;
  private elapsedSeconds: number = 0;
  private estimatedTotalSeconds: number = 180;
  private visualizerBars: number[] = [40, 65, 30, 80, 55, 90, 45, 70];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(listener: (state: NarrationState) => void) {
    this.listeners.add(listener);
    this.emitState();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitState() {
    const state: NarrationState = {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentSection: this.sections[this.currentSectionIndex]?.key || 'intro',
      progressPercent: Math.min(100, (this.elapsedSeconds / (this.estimatedTotalSeconds || 1)) * 100),
      currentTimeFormatted: this.formatTime(this.elapsedSeconds),
      totalTimeFormatted: this.formatTime(this.estimatedTotalSeconds),
      voiceGender: this.voiceGender,
      malePersona: this.malePersona,
      speed: this.speed,
      volume: this.volume,
      isAiAudio: this.isAiAudio,
      audioVisualizerBars: this.isPlaying ? this.visualizerBars : [15, 15, 15, 15, 15, 15, 15, 15],
    };
    this.listeners.forEach(l => l(state));
  }

  private formatTime(secs: number) {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  }

  public loadDevotional(sections: NarrationSection[]) {
    this.stop();
    this.sections = sections;
    this.currentSectionIndex = 0;
    this.elapsedSeconds = 0;
    const totalWords = sections.reduce((acc, s) => acc + s.text.split(/\s+/).length, 0);
    this.estimatedTotalSeconds = Math.max(60, Math.round((totalWords / 125) * 60));
    this.emitState();
  }

  public async play() {
    if (this.isPaused) {
      if (this.currentAudioElement) {
        this.currentAudioElement.play();
        this.isPlaying = true;
        this.isPaused = false;
        this.startTimer();
        this.startVisualizer();
        this.emitState();
        return;
      }
      if (this.synth) {
        this.synth.resume();
        this.isPlaying = true;
        this.isPaused = false;
        this.startTimer();
        this.startVisualizer();
        this.emitState();
        return;
      }
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.startTimer();
    this.startVisualizer();
    await this.speakCurrentSection();
  }

  public pause() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
    }
    if (this.synth) {
      this.synth.pause();
    }
    this.isPlaying = false;
    this.isPaused = true;
    this.stopTimer();
    this.stopVisualizer();
    this.emitState();
  }

  public stop() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSectionIndex = 0;
    this.elapsedSeconds = 0;
    this.isAiAudio = false;
    this.stopTimer();
    this.stopVisualizer();
    this.emitState();
  }

  public skipForward15() {
    this.elapsedSeconds = Math.min(this.estimatedTotalSeconds, this.elapsedSeconds + 15);
    if (this.currentSectionIndex < this.sections.length - 1) {
      this.currentSectionIndex++;
      if (this.isPlaying) {
        this.cleanupCurrentPlayback();
        this.speakCurrentSection();
      }
    }
    this.emitState();
  }

  public skipBackward15() {
    this.elapsedSeconds = Math.max(0, this.elapsedSeconds - 15);
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
      if (this.isPlaying) {
        this.cleanupCurrentPlayback();
        this.speakCurrentSection();
      }
    }
    this.emitState();
  }

  public setSpeed(speed: number) {
    this.speed = speed;
    if (this.currentAudioElement) {
      this.currentAudioElement.playbackRate = speed;
    }
    if (this.isPlaying && this.synth) {
      this.synth.cancel();
      this.speakCurrentSection();
    }
    this.emitState();
  }

  public setVolume(vol: number) {
    this.volume = vol;
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = vol;
    }
    this.emitState();
  }

  public setVoiceGender(gender: 'male' | 'female') {
    this.voiceGender = gender;
    if (this.isPlaying) {
      this.cleanupCurrentPlayback();
      this.speakCurrentSection();
    }
    this.emitState();
  }

  public setMalePersona(persona: MaleVoicePersona) {
    this.malePersona = persona;
    this.voiceGender = 'male';
    if (this.isPlaying) {
      this.cleanupCurrentPlayback();
      this.speakCurrentSection();
    }
    this.emitState();
  }

  public jumpToSection(key: DevotionalSectionKey) {
    const idx = this.sections.findIndex(s => s.key === key);
    if (idx >= 0) {
      this.currentSectionIndex = idx;
      if (this.isPlaying) {
        this.cleanupCurrentPlayback();
        this.speakCurrentSection();
      } else {
        this.emitState();
      }
    }
  }

  private cleanupCurrentPlayback() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }

  private async speakCurrentSection() {
    if (this.currentSectionIndex >= this.sections.length) {
      this.stop();
      return;
    }

    const section = this.sections[this.currentSectionIndex];
    if (!section) return;

    this.cleanupCurrentPlayback();

    // 1. First attempt: High-fidelity AI speech from server endpoint
    const cacheKey = `${this.voiceGender}-${this.malePersona}-${section.key}-${section.text.slice(0, 40)}`;
    let audioUrl = this.audioCache.get(cacheKey);

    if (!audioUrl) {
      try {
        const response = await fetch('/api/tts/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: section.text,
            voiceGender: this.voiceGender,
            voiceName: this.voiceGender === 'male' ? this.malePersona : 'Kore',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audioBase64) {
            audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
            this.audioCache.set(cacheKey, audioUrl);
          }
        }
      } catch (err) {
        console.warn('AI TTS fetch fallback to client speech:', err);
      }
    }

    if (audioUrl) {
      this.isAiAudio = true;
      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;
      audio.playbackRate = this.speed;
      audio.volume = this.volume;

      audio.onended = () => {
        if (this.currentSectionIndex < this.sections.length - 1) {
          this.currentSectionIndex++;
          this.speakCurrentSection();
        } else {
          this.stop();
        }
      };

      audio.onerror = () => {
        // Fallback to client synthesis if audio playback failed
        this.isAiAudio = false;
        this.speakWithClientSpeech(section.text);
      };

      try {
        await audio.play();
        this.emitState();
        return;
      } catch (playErr) {
        console.warn('HTML Audio play error:', playErr);
      }
    }

    // 2. Fallback: High Quality Client-Side Web Speech with male voice optimization
    this.isAiAudio = false;
    this.speakWithClientSpeech(section.text);
  }

  private speakWithClientSpeech(text: string) {
    if (!this.synth) {
      this.simulatePlayback();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    const voices = this.synth.getVoices();
    const ptVoices = voices.filter(v => v.lang.startsWith('pt'));

    if (this.voiceGender === 'male') {
      // Prioritize deep, rich Portuguese male voices
      const maleVoice = ptVoices.find(v => {
        const n = v.name.toLowerCase();
        return (
          n.includes('male') ||
          n.includes('daniel') ||
          n.includes('jorge') ||
          n.includes('felipe') ||
          n.includes('luciano') ||
          n.includes('ricardo') ||
          n.includes('antonio')
        );
      }) || ptVoices[ptVoices.length - 1];

      utterance.voice = maleVoice || null;
      // Reverent deep pitch for devotional contemplation
      utterance.pitch = this.malePersona === 'Charon' ? 0.82 : this.malePersona === 'Fenrir' ? 0.86 : 0.90;
      utterance.rate = this.speed * 0.92; // Slightly more paced and peaceful
    } else {
      const femaleVoice = ptVoices.find(v => {
        const n = v.name.toLowerCase();
        return n.includes('female') || n.includes('luciana') || n.includes('maria') || n.includes('vitória');
      }) || ptVoices[0];

      utterance.voice = femaleVoice || null;
      utterance.pitch = 1.05;
      utterance.rate = this.speed;
    }

    utterance.volume = this.volume;

    utterance.onend = () => {
      if (this.currentSectionIndex < this.sections.length - 1) {
        this.currentSectionIndex++;
        this.speakCurrentSection();
      } else {
        this.stop();
      }
    };

    utterance.onerror = () => {
      this.simulatePlayback();
    };

    this.synth.speak(utterance);
    this.emitState();
  }

  private startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.elapsedSeconds += 1;
      if (this.elapsedSeconds >= this.estimatedTotalSeconds) {
        this.stop();
      } else {
        this.emitState();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private startVisualizer() {
    this.stopVisualizer();
    this.visualizerTimer = setInterval(() => {
      this.visualizerBars = this.visualizerBars.map(() => Math.floor(25 + Math.random() * 70));
      this.emitState();
    }, 120);
  }

  private stopVisualizer() {
    if (this.visualizerTimer) {
      clearInterval(this.visualizerTimer);
      this.visualizerTimer = null;
    }
    this.visualizerBars = [15, 15, 15, 15, 15, 15, 15, 15];
  }

  private simulatePlayback() {
    this.isPlaying = true;
    this.isPaused = false;
    this.startTimer();
    this.startVisualizer();
    this.emitState();
  }
}

export const ttsService = new NarrationService();
