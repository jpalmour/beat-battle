import { PitchDetector } from "pitchy";

export const NOTE_STRINGS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export interface DetectedNote {
  note: string; // e.g., "C4"
  frequency: number;
  clarity: number;
}

/**
 * Converts a frequency in Hz to a note name (e.g., "A4").
 * Uses A4 = 440Hz standard.
 */
export function getNoteFromFrequency(frequency: number): string {
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  const midiNote = Math.round(noteNum) + 69;

  const noteIndex = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 2; // Adjusted for user's setup (was -1)

  const noteName = NOTE_STRINGS[noteIndex];
  return `${noteName}${octave}`;
}

/**
 * Detects pitch from an audio buffer using Pitchy.
 */
export interface AudioStats {
  frequency: number;
  clarity: number;
  volume: number;
}

/**
 * Analyzes the audio buffer to extract raw stats: frequency, clarity, and volume (RMS).
 */
export function analyzeAudio(
  analyserNode: AnalyserNode,
  detector: PitchDetector<Float32Array>,
  sampleRate: number,
): AudioStats {
  const input = new Float32Array(detector.inputLength);
  analyserNode.getFloatTimeDomainData(input);

  // 1. RMS Volume
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += input[i] * input[i];
  }
  const rms = Math.sqrt(sum / input.length);

  const [pitch, clarity] = detector.findPitch(input, sampleRate);

  return {
    frequency: pitch,
    clarity: clarity,
    volume: rms,
  };
}

/**
 * Detects pitch from an audio buffer using Pitchy.
 */
export function detectPitch(
  analyserNode: AnalyserNode,
  detector: PitchDetector<Float32Array>,
  sampleRate: number,
): DetectedNote | null {
  const stats = analyzeAudio(analyserNode, detector, sampleRate);

  // 1. RMS Volume Threshold
  if (stats.volume < 0.005) return null; // Lowered silence threshold for better sensitivity

  // Thresholds can be tuned.
  // Clarity is 0-1. Higher is better.
  if (stats.clarity < 0.9 || stats.frequency < 27.5 || stats.frequency > 4186) {
    return null;
  }

  return {
    note: getNoteFromFrequency(stats.frequency),
    frequency: stats.frequency,
    clarity: stats.clarity,
  };
}
