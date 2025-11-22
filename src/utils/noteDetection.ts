import { PitchDetector } from 'pitchy';

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
    const octave = Math.floor(midiNote / 12) - 1;

    const noteName = NOTE_STRINGS[noteIndex];
    return `${noteName}${octave}`;
}

/**
 * Detects pitch from an audio buffer using Pitchy.
 */
export function detectPitch(
    analyserNode: AnalyserNode,
    detector: PitchDetector<Float32Array>,
    sampleRate: number
): DetectedNote | null {
    const input = new Float32Array(detector.inputLength);
    analyserNode.getFloatTimeDomainData(input);

    // 1. RMS Volume Threshold
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
        sum += input[i] * input[i];
    }
    const rms = Math.sqrt(sum / input.length);
    if (rms < 0.01) return null; // Silence threshold

    const [pitch, clarity] = detector.findPitch(input, sampleRate);

    // Thresholds can be tuned. 
    // Clarity is 0-1. Higher is better.
    if (clarity < 0.9 || pitch < 27.5 || pitch > 4186) {
        return null;
    }

    return {
        note: getNoteFromFrequency(pitch),
        frequency: pitch,
        clarity
    };
}
