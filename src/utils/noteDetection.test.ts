import { describe, it, expect } from "vitest";
import { PitchDetector } from "pitchy";
import {
  analyzeAudio,
  detectPitch,
  getNoteFromFrequency,
} from "./noteDetection";

const createAnalyser = (data: number[]): AnalyserNode => {
  return {
    getFloatTimeDomainData: (array: Float32Array) => {
      data.forEach((value, index) => {
        array[index] = value;
      });
      for (let i = data.length; i < array.length; i++) {
        array[i] = 0;
      }
    },
  } as unknown as AnalyserNode;
};

describe("noteDetection", () => {
  describe("getNoteFromFrequency", () => {
    it("should detect A4 (mapped to A3) correctly", () => {
      const note = getNoteFromFrequency(440);
      expect(note).toBe("A3");
    });

    it("should detect C4 (mapped to C3) correctly", () => {
      const note = getNoteFromFrequency(261.63);
      expect(note).toBe("C3");
    });

    it("should handle slight detuning", () => {
      const note = getNoteFromFrequency(442); // Slightly sharp A4
      expect(note).toBe("A3");
    });
  });

  describe("analyzeAudio", () => {
    it("returns the RMS volume and detector results", () => {
      const sample = [0.5, -0.5, 0.5, -0.5];
      const analyser = createAnalyser(sample);
      const detector = {
        inputLength: sample.length,
        findPitch: () => [220, 0.97],
      } as unknown as PitchDetector<Float32Array>;

      const stats = analyzeAudio(analyser, detector, 44100);

      expect(stats.frequency).toBe(220);
      expect(stats.clarity).toBe(0.97);
      expect(stats.volume).toBeCloseTo(0.5, 5);
    });
  });

  describe("detectPitch", () => {
    it("filters out quiet input as silence", () => {
      const sample = [0.0001, -0.0001, 0.0001, -0.0001];
      const analyser = createAnalyser(sample);
      const detector = {
        inputLength: sample.length,
        findPitch: () => [440, 0.95],
      } as unknown as PitchDetector<Float32Array>;

      const result = detectPitch(analyser, detector, 44100);

      expect(result).toBeNull();
    });

    it("returns a detected note when clarity and volume are strong", () => {
      const sample = [0.2, -0.2, 0.2, -0.2];
      const analyser = createAnalyser(sample);
      const detector = {
        inputLength: sample.length,
        findPitch: () => [440, 0.95],
      } as unknown as PitchDetector<Float32Array>;

      const result = detectPitch(analyser, detector, 44100);

      expect(result).toEqual({
        note: "A3",
        frequency: 440,
        clarity: 0.95,
      });
    });
  });
});
