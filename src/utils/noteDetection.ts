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

export interface DetectionParams {
  /** Minimum RMS volume required to consider the frame audible */
  volumeThreshold: number;
  /** Minimum clarity reported by Pitchy to accept a candidate */
  clarityThreshold: number;
  /** Clarity below which we consider the detector unsure during release */
  releaseClarityThreshold: number;
  /** Lowest frequency we consider valid (Hz) */
  minFrequency: number;
  /** Highest frequency we consider valid (Hz) */
  maxFrequency: number;
  /** Milliseconds a candidate must be stable before becoming active */
  minHoldMs: number;
  /** Milliseconds of silence/noise required to release an active note */
  releaseMs: number;
  /** Milliseconds of low clarity required to release an active note */
  minLowClarityMsForRelease: number;
}

export const DEFAULT_DETECTION_PARAMS: DetectionParams = {
  volumeThreshold: 0.005,
  clarityThreshold: 0.86,
  releaseClarityThreshold: 0.72,
  minFrequency: 27.5,
  maxFrequency: 4186,
  minHoldMs: 140,
  releaseMs: 120,
  minLowClarityMsForRelease: 160,
};

/**
 * Canonical built-in defaults for the detection pipeline. Auto- and manual-tune
 * both persist overrides to localStorage (note-detection-params), and normal
 * gameplay loads those values when present. Update these defaults when you want
 * to change the out-of-the-box behavior (e.g., after tuning on a reference
 * piano/mic setup).
 */

const STORAGE_KEY = "note-detection-params";

export function loadDetectionParams(): DetectionParams {
  if (typeof window === "undefined") {
    return DEFAULT_DETECTION_PARAMS;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_DETECTION_PARAMS;
    const parsed = JSON.parse(stored) as Partial<DetectionParams>;
    return {
      ...DEFAULT_DETECTION_PARAMS,
      ...parsed,
    };
  } catch (error) {
    console.warn("Failed to load detection params; using defaults", error);
    return DEFAULT_DETECTION_PARAMS;
  }
}

export function persistDetectionParams(params: DetectionParams) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch (error) {
    console.warn("Failed to persist detection params", error);
  }
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
  params: DetectionParams = DEFAULT_DETECTION_PARAMS,
): DetectedNote | null {
  const stats = analyzeAudio(analyserNode, detector, sampleRate);
  const note = getRawNote(stats, params);

  if (!note) return null;

  return {
    note,
    frequency: stats.frequency,
    clarity: stats.clarity,
  };
}

export interface DetectionState {
  activeNote: DetectedNote | null;
  candidateNote: string | null;
  candidateDuration: number;
  releaseDuration: number;
}

export const createDetectionState = (): DetectionState => ({
  activeNote: null,
  candidateNote: null,
  candidateDuration: 0,
  releaseDuration: 0,
});

function getRawNote(stats: AudioStats, params: DetectionParams): string | null {
  if (stats.volume < params.volumeThreshold) return null;
  if (stats.clarity < params.clarityThreshold) return null;
  if (
    stats.frequency < params.minFrequency ||
    stats.frequency > params.maxFrequency
  ) {
    return null;
  }
  return getNoteFromFrequency(stats.frequency);
}

export function advanceDetectionState(
  state: DetectionState,
  stats: AudioStats,
  params: DetectionParams,
  deltaMs: number,
): DetectionState {
  const rawNote = getRawNote(stats, params);
  const volumeBelowThreshold = stats.volume < params.volumeThreshold;
  const clarityBelowRelease =
    stats.clarity < params.releaseClarityThreshold ||
    Number.isNaN(stats.clarity);

  const next: DetectionState = {
    activeNote: state.activeNote,
    candidateNote: state.candidateNote,
    candidateDuration: state.candidateDuration,
    releaseDuration: state.releaseDuration,
  };

  if (rawNote) {
    if (state.candidateNote === rawNote) {
      next.candidateDuration = state.candidateDuration + deltaMs;
    } else {
      next.candidateNote = rawNote;
      next.candidateDuration = deltaMs;
    }

    next.releaseDuration = 0;

    const candidateReady = next.candidateDuration >= params.minHoldMs;

    if (!state.activeNote && candidateReady) {
      next.activeNote = {
        note: rawNote,
        frequency: stats.frequency,
        clarity: stats.clarity,
      };
    } else if (
      state.activeNote &&
      state.activeNote.note !== rawNote &&
      candidateReady
    ) {
      next.activeNote = {
        note: rawNote,
        frequency: stats.frequency,
        clarity: stats.clarity,
      };
    } else if (state.activeNote && state.activeNote.note === rawNote) {
      next.activeNote = {
        note: rawNote,
        frequency: stats.frequency,
        clarity: stats.clarity,
      };
    }
  } else {
    next.candidateNote = null;
    next.candidateDuration = 0;
  }

  const releasingBySilence =
    !!state.activeNote && (!rawNote || volumeBelowThreshold);
  const releasingByClarity = !!state.activeNote && clarityBelowRelease;

  if (releasingBySilence || releasingByClarity) {
    next.releaseDuration = state.releaseDuration + deltaMs;

    const reachedSilentRelease =
      releasingBySilence && next.releaseDuration >= params.releaseMs;
    const reachedClarityRelease =
      releasingByClarity &&
      next.releaseDuration >= params.minLowClarityMsForRelease;

    if (reachedSilentRelease || reachedClarityRelease) {
      next.activeNote = null;
      next.releaseDuration = 0;
    }
  } else {
    next.releaseDuration = 0;
  }

  return next;
}
