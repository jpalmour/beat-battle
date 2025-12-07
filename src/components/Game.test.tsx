import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { NoteStatus } from "../hooks/useExerciseEngine";

vi.mock("../hooks/useNoteDetection", () => ({
  useNoteDetection: vi.fn(),
}));

vi.mock("../utils/generator", () => ({
  generateExercise: vi.fn((level, id) => ({
    id: id ?? "generated",
    title: `${level.name} exercise`,
    clef: level.clef,
    measures: [[{ keys: ["c/4"], duration: "q" }]],
  })),
}));

vi.mock("../data/levels", () => ({
  levels: [
    {
      id: "lvl1",
      title: "Level 1",
      name: "Starter",
      description: "",
      clef: "treble" as const,
      range: { min: "c/4", max: "c/5" },
      intervals: ["repeat" as const],
      motion: "any" as const,
      rhythms: ["q" as const],
    },
    {
      id: "lvl2",
      title: "Level 2",
      name: "Next",
      description: "",
      clef: "treble" as const,
      range: { min: "d/4", max: "d/5" },
      intervals: ["repeat" as const],
      motion: "any" as const,
      rhythms: ["q" as const],
    },
  ],
}));

vi.mock("../hooks/useExerciseEngine", () => ({
  useExerciseEngine: vi.fn(),
}));

vi.mock("./MusicStaff", () => ({
  default: () => <div data-testid="music-staff" />,
}));

import { useNoteDetection } from "../hooks/useNoteDetection";
import { useExerciseEngine } from "../hooks/useExerciseEngine";
import { Game } from "./Game";

const createEngineState = () => ({
  currentNoteIndex: 0,
  noteStatuses: [] as NoteStatus[],
  feedback: "none" as const,
  reset: vi.fn(),
  score: 0,
  correctCount: 0,
  errorCount: 0,
  debug: {
    targetKey: "",
    isWaitingForRelease: false,
    lockedNote: null,
    stableNote: undefined,
  },
});

describe("Game", () => {
  const latestCallbacks: {
    onComplete?: () => void;
    onFail?: () => void;
    reset?: () => void;
  } = {};

  let engineState = createEngineState();

  beforeEach(() => {
    engineState = createEngineState();
    latestCallbacks.onComplete = undefined;
    latestCallbacks.onFail = undefined;
    latestCallbacks.reset = undefined;

    vi.mocked(useNoteDetection).mockReturnValue({
      note: null,
      stats: null,
      isListening: false,
      error: null,
    });

    vi.mocked(useExerciseEngine).mockImplementation((props) => {
      latestCallbacks.onComplete = props.onComplete;
      latestCallbacks.onFail = props.onFail;
      latestCallbacks.reset = engineState.reset;
      return engineState;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates score and progress when exercises complete", async () => {
    render(<Game />);

    act(() => latestCallbacks.onComplete?.());

    expect(await screen.findByText("20%")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("shows and hides the try-again overlay while resetting the engine", async () => {
    vi.useFakeTimers();
    const reset = vi.fn();
    engineState = { ...createEngineState(), reset };

    render(<Game />);

    act(() => latestCallbacks.onFail?.());

    expect(screen.getByText("TRY AGAIN")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText("TRY AGAIN")).not.toBeInTheDocument();
    expect(reset).toHaveBeenCalled();
  });

  it("levels up after five completions and resets counters", async () => {
    vi.useFakeTimers();
    render(<Game />);

    for (let i = 0; i < 5; i += 1) {
      act(() => latestCallbacks.onComplete?.());
    }

    expect(screen.getByText("LEVEL UP!")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText("LEVEL UP!")).not.toBeInTheDocument();
    expect(screen.getByText("Level 2")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText(/Ex #1/)).toBeInTheDocument();
  });

  it("toggles recording state from the drop button", () => {
    render(<Game />);

    const dropButtonImage = screen.getByAltText("Start Recording");
    fireEvent.click(dropButtonImage.closest("button")!);

    expect(screen.getByAltText("Stop Recording")).toBeInTheDocument();
  });

  it("initializes exercise engine with octave agnostic enabled", () => {
    render(<Game />);
    expect(vi.mocked(useExerciseEngine)).toHaveBeenCalledWith(
      expect.objectContaining({
        octaveAgnostic: true,
      })
    );
  });
});
