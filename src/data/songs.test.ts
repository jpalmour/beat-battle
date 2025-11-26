import { describe, expect, it } from "vitest";
import { happyBirthdaySong } from "./songs";

const expectedSequence = [
  { key: "g/3", duration: "8" },
  { key: "g/3", duration: "8" },
  { key: "a/3", duration: "q" },
  { key: "g/3", duration: "q" },
  { key: "c/4", duration: "q" },
  { key: "b/3", duration: "h" },
  { key: "g/3", duration: "8" },
  { key: "g/3", duration: "8" },
  { key: "a/3", duration: "q" },
  { key: "g/3", duration: "q" },
  { key: "d/4", duration: "q" },
  { key: "c/4", duration: "h" },
  { key: "g/3", duration: "8" },
  { key: "g/3", duration: "8" },
  { key: "g/4", duration: "q" },
  { key: "e/4", duration: "q" },
  { key: "c/4", duration: "q" },
  { key: "b/3", duration: "q" },
  { key: "a/3", duration: "q" },
  { key: "f/4", duration: "8" },
  { key: "f/4", duration: "8" },
  { key: "e/4", duration: "q" },
  { key: "c/4", duration: "q" },
  { key: "d/4", duration: "q" },
  { key: "c/4", duration: "hd" },
];

describe("happyBirthdaySong", () => {
  it("encodes the correct layout and time signature", () => {
    expect(happyBirthdaySong.layout).toBe("grand");
    expect(happyBirthdaySong.timeSignature).toBe("3/4");
  });

  it("contains the expected measures and pickup", () => {
    expect(happyBirthdaySong.measures).toHaveLength(9);
    expect(happyBirthdaySong.measures[0]).toHaveLength(2);
    expect(
      happyBirthdaySong.measures[happyBirthdaySong.measures.length - 1],
    ).toHaveLength(1);
  });

  it("lists the Happy Birthday melody starting on G3", () => {
    const flattened = happyBirthdaySong.measures.flat();
    const keysAndDurations = flattened.map((note) => ({
      key: note.keys[0],
      duration: note.duration,
    }));
    expect(keysAndDurations).toEqual(expectedSequence);
  });

  it("assigns bass clef for octave < 4 and treble clef for octave >= 4", () => {
    const flattened = happyBirthdaySong.measures.flat();

    // Check some bass clef notes (octave 3)
    const bassNotes = flattened.filter((note) => note.keys[0].includes("/3"));
    bassNotes.forEach((note) => {
      expect(note.clef).toBe("bass");
    });

    // Check some treble clef notes (octave 4)
    const trebleNotes = flattened.filter((note) => note.keys[0].includes("/4"));
    trebleNotes.forEach((note) => {
      expect(note.clef).toBe("treble");
    });

    // Verify we have notes in both clefs
    expect(bassNotes.length).toBeGreaterThan(0);
    expect(trebleNotes.length).toBeGreaterThan(0);
  });
});
