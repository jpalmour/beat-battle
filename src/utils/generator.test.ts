import { describe, expect, it, vi } from "vitest";
import { generateExercise } from "./generator";
import type { LevelConfig } from "../data/levels";

type RandomSpy = ReturnType<typeof vi.spyOn>;

const baseId = "exercise-test";

const trebleRepeats: LevelConfig = {
  id: "treble-repeats",
  title: "Treble Repeats",
  name: "Treble Repeats",
  description: "Repeat notes in treble clef",
  clef: "treble",
  range: { min: "c/4", max: "g/4" },
  intervals: ["repeat"],
  motion: "any",
  rhythms: ["w"],
};

const bassChords: LevelConfig = {
  id: "bass-chords",
  title: "Bass Chords",
  name: "Bass Chords",
  description: "Bass clef chords with repeats",
  clef: "bass",
  range: { min: "g/2", max: "c/4" },
  intervals: ["repeat"],
  motion: "any",
  rhythms: ["q"],
  harmonicIntervals: ["3rd"],
};

function mockRandomSequence(sequence: number[]): RandomSpy {
  let index = 0;
  return vi.spyOn(Math, "random").mockImplementation(() => {
    const value = sequence[index] ?? sequence[sequence.length - 1] ?? 0;
    index += 1;
    return value;
  });
}

describe("generateExercise", () => {
  it("generates repeat-only treble measures with a clear finger hint", () => {
    const randomSpy = mockRandomSequence([0]);

    const exercise = generateExercise(trebleRepeats, baseId);

    randomSpy.mockRestore();

    expect(exercise.clef).toBe("treble");
    expect(exercise.measures).toHaveLength(4);
    exercise.measures.forEach((measure) => {
      expect(measure).toHaveLength(1);
      const note = measure[0];
      expect(note.duration).toBe("w");
      expect(note.keys).toEqual(["c/4"]);
    });

    const firstNote = exercise.measures[0][0];
    expect(firstNote.fingers).toEqual(["1"]);

    const rest = exercise.measures.flat().slice(1);
    expect(rest.every((note) => note.fingers === undefined)).toBe(true);
  });

  it("adds bass chord finger hints while keeping chords inside the five-note window", () => {
    const randomSpy = mockRandomSequence([0.5, 0.5, ...Array(50).fill(0.6)]);

    const exercise = generateExercise(bassChords, baseId);

    randomSpy.mockRestore();

    const allowedKeys = ["c/3", "d/3", "e/3", "f/3", "g/3"];
    exercise.measures.flat().forEach((note) => {
      note.keys.forEach((key) => expect(allowedKeys).toContain(key));
    });

    const firstMeasure = exercise.measures[0];
    expect(firstMeasure[0].keys).toEqual(["c/3", "e/3"]);
    expect(firstMeasure[0].fingers).toEqual(["3", "1"]);

    expect(firstMeasure[1].fingers).toEqual(["3", "1"]);

    const laterChordHints = exercise.measures
      .flat()
      .slice(2)
      .filter((note) => note.keys.length > 1);
    expect(laterChordHints.every((note) => note.fingers === undefined)).toBe(
      true,
    );
  });
});
