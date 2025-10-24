import { QuizResult, OperationMode } from "../types";

const HISTORY_KEY = 'mathWhizHistory';
const STARS_KEY = 'mathWhizTotalStars';

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  return audioContext;
};

export const playSound = (type: 'correct' | 'incorrect') => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === 'correct') {
    // Cheerful, two-tone "power-up" chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(880, now); // A5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.50, now + 0.08); // C6
    gain2.gain.setValueAtTime(0.2, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.28);
  } else {
    // Gentle, descending "bonk"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(164.81, now); // E3
    osc.frequency.exponentialRampToValueAtTime(123.47, now + 0.2); // B2
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }
};

const playNote = (ctx: AudioContext, gainNode: GainNode, frequency: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    osc.connect(gainNode);
    osc.start(startTime);
    osc.stop(startTime + duration);
};

export const playResultsSound = (percentage: number) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    const now = ctx.currentTime;

    if (percentage >= 90) { // Triumphant "Level Clear!" fanfare
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
        playNote(ctx, gainNode, 523.25, now, 0.1, 'triangle'); // C5
        playNote(ctx, gainNode, 659.25, now + 0.15, 0.1, 'triangle'); // E5
        playNote(ctx, gainNode, 783.99, now + 0.3, 0.1, 'triangle'); // G5
        playNote(ctx, gainNode, 1046.50, now + 0.45, 0.25, 'triangle'); // C6
    } else if (percentage >= 50) { // Upbeat and encouraging jingle
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        playNote(ctx, gainNode, 659.25, now, 0.15, 'sine'); // E5
        playNote(ctx, gainNode, 880.00, now + 0.2, 0.2, 'sine'); // A5
    } else { // Soft, gentle melody
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        playNote(ctx, gainNode, 440.00, now, 0.15, 'sine'); // A4
        playNote(ctx, gainNode, 329.63, now + 0.2, 0.15, 'sine'); // E4
        playNote(ctx, gainNode, 261.63, now + 0.4, 0.3, 'sine'); // C4
    }
};


export const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const saveHistory = (history: QuizResult[]): void => {
  try {
    const historyString = JSON.stringify(history);
    localStorage.setItem(HISTORY_KEY, historyString);
  } catch (error) {
    console.error("Could not save history to localStorage", error);
  }
};

export const loadHistory = (): QuizResult[] => {
  try {
    const historyString = localStorage.getItem(HISTORY_KEY);
    if (historyString) {
      return JSON.parse(historyString);
    }
    return [];
  } catch (error) {
    console.error("Could not load history from localStorage", error);
    return [];
  }
};

export const saveStars = (stars: number): void => {
    try {
        localStorage.setItem(STARS_KEY, stars.toString());
    } catch (error) {
        console.error("Could not save stars to localStorage", error);
    }
};

export const loadStars = (): number => {
    try {
        const starsString = localStorage.getItem(STARS_KEY);
        return starsString ? parseInt(starsString, 10) : 0;
    } catch (error) {
        console.error("Could not load stars from localStorage", error);
        return 0;
    }
}

export const getOperationModeText = (mode: OperationMode): string => {
    switch (mode) {
        case 'add': return '加法';
        case 'subtract': return '减法';
        case 'add_subtract': return '加减混合';
        case 'multiply': return '乘法';
        case 'divide': return '除法';
        case 'multiply_divide': return '乘除混合';
        default: return '未知';
    }
};

// New Leveling System Constants
const STARS_PER_MOON = 100;
const MOONS_PER_SUN = 10;
const SUNS_PER_CROWN = 5;

const STARS_PER_SUN = STARS_PER_MOON * MOONS_PER_SUN; // 1000
const STARS_PER_CROWN = STARS_PER_SUN * SUNS_PER_CROWN; // 5000

export const calculateLevel = (totalStars: number) => {
  let remainingStars = totalStars;

  const crowns = Math.floor(remainingStars / STARS_PER_CROWN);
  remainingStars %= STARS_PER_CROWN;

  const suns = Math.floor(remainingStars / STARS_PER_SUN);
  remainingStars %= STARS_PER_SUN;

  const moons = Math.floor(remainingStars / STARS_PER_MOON);
  remainingStars %= STARS_PER_MOON;

  return { crowns, suns, moons, stars: remainingStars };
};

export const calculateProgress = (totalStars: number) => {
    const progressToMoon = {
        current: totalStars % STARS_PER_MOON,
        target: STARS_PER_MOON,
    };
    
    const totalMoons = Math.floor(totalStars / STARS_PER_MOON);
    const progressToSun = {
        current: totalMoons % MOONS_PER_SUN,
        target: MOONS_PER_SUN,
    };

    const totalSuns = Math.floor(totalStars / STARS_PER_SUN);
    const progressToCrown = {
        current: totalSuns % SUNS_PER_CROWN,
        target: SUNS_PER_CROWN,
    };

    return { progressToMoon, progressToSun, progressToCrown };
};


export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000;
  const numChannels = 1;
  
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}