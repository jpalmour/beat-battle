import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExerciseEngine } from "./useExerciseEngine";
import type { Exercise } from "../types/music";
import type { DetectedNote } from "../utils/noteDetection";

const detected = (note: string): DetectedNote => ({
  note,
  frequency: 0,
  clarity: 1,
});

const baseExercise: Exercise = {
  id: "ex-1",
  title: "Test",
  clef: "treble",
  measures: [
    [
      { keys: ["c/4"], duration: "q" },
      { keys: ["d/4"], duration: "q" },
    ],
  ],
};

const singleNoteExercise: Exercise = {
  id: "single",
  title: "Single",
  clef: "treble",
  measures: [[{ keys: ["e/4"], duration: "q" }]],
};

const renderEngine = (
  exercise: Exercise,
  overrides: Partial<{
    detectedNote: DetectedNote | null;
    simulatedNote: { note: DetectedNote; id: number } | null;
    isRecording: boolean;
    onComplete: () => void;
    onFail: () => void;
  }> = {},
) => {
  const initialProps = {
    exercise,
    detectedNote: null,
    simulatedNote: null,
    isRecording: true,
    onComplete: vi.fn(),
    onFail: vi.fn(),
    ...overrides,
  };

  const result = renderHook((props) => useExerciseEngine(props), {
    initialProps,
  });

  return { ...result, initialProps };
};

describe("useExerciseEngine", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const flushTimers = async () => {
    await act(async () => {
      vi.runAllTimers();
    });
  };

  it("advances through an exercise and calls onComplete after correct notes with release gating", async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { result, rerender, initialProps } = renderEngine(baseExercise, {
      onComplete,
    });

    await act(async () => {});
    expect(result.current.noteStatuses).toHaveLength(2);

    rerender({ ...initialProps, detectedNote: detected("C4") });
    await flushTimers();
    expect(result.current.noteStatuses[0]).toBe("correct");

    rerender({ ...initialProps, detectedNote: null });
    await flushTimers();

    rerender({ ...initialProps, detectedNote: detected("D4") });
    await flushTimers();
    expect(result.current.noteStatuses[1]).toBe("correct");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.feedback).toBe("correct");
  });

  it("invokes onFail when the final note is incorrect", async () => {
    vi.useFakeTimers();
    const onFail = vi.fn();
    const { result, rerender, initialProps } = renderEngine(
      singleNoteExercise,
      { onFail },
    );

    await act(async () => {});
    expect(result.current.noteStatuses).toHaveLength(1);

    rerender({ ...initialProps, detectedNote: detected("F4") });
    await flushTimers();

    expect(onFail).toHaveBeenCalledTimes(1);
    expect(result.current.feedback).toBe("error");
  });

  it("treats simulated notes by name and ignores repeated cheat IDs", async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { result, rerender, initialProps } = renderEngine(
      singleNoteExercise,
      { onComplete },
    );

    await act(async () => {});
    expect(result.current.noteStatuses).toHaveLength(1);

    const simulatedNote = { note: detected("E2"), id: 123 };

    rerender({ ...initialProps, simulatedNote });
    await flushTimers();
    expect(result.current.noteStatuses[0]).toBe("correct");
    expect(onComplete).toHaveBeenCalledTimes(1);

    rerender({ ...initialProps, simulatedNote });
    await flushTimers();

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
