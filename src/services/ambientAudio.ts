import { SoundscapeCategory } from '../types';

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentCategory: SoundscapeCategory | null = null;
  private isPlaying: boolean = false;
  private loopInterval: any = null;
  private activeNodes: (AudioNode | OscillatorNode)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    this.activeNodes.forEach(node => {
      try {
        if ('stop' in node) (node as OscillatorNode).stop();
        node.disconnect();
      } catch {
        // node already stopped
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentCategory = null;
  }

  public play(category: SoundscapeCategory, volume = 0.35) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.isPlaying) {
      this.stop();
    }

    this.initContext();
    this.setVolume(volume);
    this.isPlaying = true;
    this.currentCategory = category;

    switch (category) {
      case 'Piano':
        this.startPianoAmbient();
        break;
      case 'Chuva':
        this.startRainSound();
        break;
      case 'Mar':
        this.startOceanWaves();
        break;
      case 'Natureza':
      case 'Floresta':
        this.startForestAmbience();
        break;
      case 'Pássaros':
      case 'Amanhecer':
        this.startDawnChimes();
        break;
      case 'Água':
        this.startWaterStream();
        break;
      case 'Noite':
        this.startNightSerenity();
        break;
      default:
        this.startPianoAmbient();
    }
  }

  public toggle(category: SoundscapeCategory, volume = 0.35) {
    if (this.isPlaying && this.currentCategory === category) {
      this.stop();
      return false;
    } else {
      this.play(category, volume);
      return true;
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      category: this.currentCategory,
    };
  }

  // --- AMBIENT SOUND GENERATORS ---

  /** Gentle meditative piano chords with warm reverb resonance */
  private startPianoAmbient() {
    if (!this.ctx || !this.masterGain) return;
    const notes = [
      [261.63, 329.63, 392.0, 523.25], // C major 7
      [220.0, 261.63, 329.63, 392.0],  // A minor 7
      [174.61, 220.0, 261.63, 329.63], // F major 7
      [196.0, 246.94, 293.66, 392.0],  // G suspended
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const currentChord = notes[chordIdx % notes.length];
      chordIdx++;

      currentChord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx!.currentTime);

        const now = this.ctx!.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 6.0);
      });
    };

    playChord();
    this.loopInterval = setInterval(playChord, 5200);
  }

  /** Gentle rain soundscape with filtered white noise */
  private startRainSound() {
    if (!this.ctx || !this.masterGain) return;

    // Generate brown/pink noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, rainGain);
  }

  /** Ocean rolling waves with oscillating low-pass filter */
  private startOceanWaves() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12; // wave every ~8 seconds

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 300;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const oceanGain = this.ctx.createGain();
    oceanGain.gain.value = 0.25;

    noise.connect(filter);
    filter.connect(oceanGain);
    oceanGain.connect(this.masterGain);

    noise.start();
    lfo.start();
    this.activeNodes.push(noise, lfo, filter, lfoGain, oceanGain);
  }

  /** Peaceful forest breeze and crickets */
  private startForestAmbience() {
    if (!this.ctx || !this.masterGain) return;

    // Warm breeze pad
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.value = 164.81; // E3
    osc2.type = 'triangle';
    osc2.frequency.value = 246.94; // B3

    gain.gain.value = 0.05;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    this.activeNodes.push(osc1, osc2, gain);

    // Chirping chimes periodically
    const chirp = () => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return;
      const chOsc = this.ctx.createOscillator();
      const chGain = this.ctx.createGain();
      const baseFreq = 2800 + Math.random() * 800;

      chOsc.type = 'sine';
      chOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      chGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      chGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);

      chOsc.connect(chGain);
      chGain.connect(this.masterGain);
      chOsc.start();
      chOsc.stop(this.ctx.currentTime + 0.2);
    };

    this.loopInterval = setInterval(chirp, 2400);
  }

  /** Golden dawn harmonics and ethereal light chimes */
  private startDawnChimes() {
    if (!this.ctx || !this.masterGain) return;

    const baseFrequencies = [440, 554.37, 659.25, 880];
    const triggerChime = () => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return;
      const freq = baseFrequencies[Math.floor(Math.random() * baseFrequencies.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 3.8);
    };

    triggerChime();
    this.loopInterval = setInterval(triggerChime, 3200);
  }

  /** Soothing water stream */
  private startWaterStream() {
    this.startRainSound();
  }

  /** Night serenity with deep harmonic hum and peaceful pulse */
  private startNightSerenity() {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110.0, this.ctx.currentTime); // A2 deep warm tone

    filter.type = 'lowpass';
    filter.frequency.value = 220;

    gain.gain.value = 0.08;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    this.activeNodes.push(osc, filter, gain);
  }
}

export const soundscape = new SoundscapeEngine();
