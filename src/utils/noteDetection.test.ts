import { describe, it, expect } from "vitest";
import { getNoteFromFrequency } from "./noteDetection";

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
});
