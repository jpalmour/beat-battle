import React, { useEffect, useState, useRef } from "react";
import { useNoteDetection } from "../hooks/useNoteDetection";
import {
  advanceDetectionState,
  createDetectionState,
  DEFAULT_DETECTION_PARAMS,
  persistDetectionParams,
  type AudioStats,
  type DetectedNote,
  type DetectionParams,
} from "../utils/noteDetection";

type TuningStep = {
  label: string;
  duration: number; // seconds
  targetNote?: string;
};

const TUNING_SEQUENCE: TuningStep[] = [
  { label: "Silence (Measure Noise Floor)", duration: 5 },
  { label: "Play C3", duration: 4, targetNote: "C3" },
  { label: "Play E3", duration: 4, targetNote: "E3" },
  { label: "Play G3", duration: 4, targetNote: "G3" },
  { label: "Play C4", duration: 4, targetNote: "C4" },
  { label: "Play E4", duration: 4, targetNote: "E4" },
  { label: "Play G4", duration: 4, targetNote: "G4" },
  { label: "Play C5", duration: 4, targetNote: "C5" },
];

interface LogData {
  timestamp: number;
  stepLabel: string;
  targetNote?: string;
  stats: AudioStats;
  detectedNote: DetectedNote | null;
}

type RankedConfig = SimulationMetrics & { params: DetectionParams };

interface SimulationMetrics {
  hits: number;
  misses: number;
  falsePositives: number;
  transitions: number;
  precision: number;
  recall: number;
  score: number;
}

interface EvaluationResult {
  best: RankedConfig | null;
  ranked: RankedConfig[];
}

const PARAMETER_SPACE = {
  volumeThreshold: [0.0025, 0.0035, 0.005, 0.0075, 0.01],
  clarityThreshold: [0.75, 0.82, 0.88, 0.92],
  minHoldMs: [80, 120, 170, 230],
  releaseMs: [70, 120, 180, 240],
};

function buildParameterGrid(base: DetectionParams): DetectionParams[] {
  const grid: DetectionParams[] = [];

  PARAMETER_SPACE.volumeThreshold.forEach((volumeThreshold) => {
    PARAMETER_SPACE.clarityThreshold.forEach((clarityThreshold) => {
      PARAMETER_SPACE.minHoldMs.forEach((minHoldMs) => {
        PARAMETER_SPACE.releaseMs.forEach((releaseMs) => {
          grid.push({
            ...base,
            volumeThreshold,
            clarityThreshold,
            minHoldMs,
            releaseMs,
          });
        });
      });
    });
  });

  // Ensure the exact defaults are included even if not in the grid lists
  grid.push(base);

  return grid;
}

function evaluateConfig(
  logs: LogData[],
  params: DetectionParams,
): RankedConfig {
  if (logs.length === 0) {
    return {
      params,
      hits: 0,
      misses: 0,
      falsePositives: 0,
      transitions: 0,
      precision: 0,
      recall: 0,
      score: 0,
    };
  }

  let state = createDetectionState();
  let lastTimestamp = logs[0].timestamp;
  let previousNote: string | null = null;
  let hits = 0;
  let misses = 0;
  let falsePositives = 0;
  let transitions = 0;

  logs.forEach((entry, index) => {
    const deltaMs = index === 0 ? 0 : entry.timestamp - lastTimestamp;
    lastTimestamp = entry.timestamp;

    state = advanceDetectionState(state, entry.stats, params, deltaMs);
    const detected = state.activeNote?.note ?? null;
    const expected = entry.targetNote ?? null;

    if (expected) {
      if (detected === expected) {
        hits += 1;
      } else {
        misses += 1;
      }
    } else if (detected) {
      falsePositives += 1;
    }

    if (detected && detected !== previousNote) {
      transitions += 1;
    }

    previousNote = detected;
  });

  const precision =
    hits + falsePositives > 0 ? hits / (hits + falsePositives) : 0;
  const recall = hits + misses > 0 ? hits / (hits + misses) : 0;
  const score = precision * 0.4 + recall * 0.6 - falsePositives * 0.01;

  return {
    params,
    hits,
    misses,
    falsePositives,
    transitions,
    precision,
    recall,
    score,
  };
}

function evaluateLogs(logs: LogData[]): EvaluationResult {
  const base = DEFAULT_DETECTION_PARAMS;
  const candidates = buildParameterGrid(base);

  const ranked = candidates
    .map((params) => evaluateConfig(logs, params))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    best: ranked[0] ?? null,
    ranked,
  };
}

export const TuningMode: React.FC = () => {
  const { stats, note, error } = useNoteDetection(true);
  const [stepIndex, setStepIndex] = useState(-1); // -1 = Idle, 0+ = In Progress
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const timerRef = useRef<number | null>(null);
  const logsRef = useRef<LogData[]>([]);

  const currentStep =
    stepIndex >= 0 && stepIndex < TUNING_SEQUENCE.length
      ? TUNING_SEQUENCE[stepIndex]
      : null;

  const startSequence = () => {
    setStepIndex(0);
    logsRef.current = [];
    setIsFinished(false);
    setEvaluation(null);
    startStep(0);
  };

  const startStep = (index: number) => {
    if (index >= TUNING_SEQUENCE.length) {
      finishSequence();
      return;
    }
    const step = TUNING_SEQUENCE[index];
    setTimeLeft(step.duration);
    // Start countdown
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Next step
          const nextIndex = index + 1;
          setStepIndex(nextIndex);
          startStep(nextIndex);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishSequence = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStepIndex(-1);
    setIsFinished(true);
    const evaluationResult = evaluateLogs(logsRef.current);
    setEvaluation(evaluationResult);
    if (evaluationResult.best) {
      persistDetectionParams(evaluationResult.best.params);
    }
    console.log("=== TUNING DATA COLLECTION COMPLETE ===");
    console.log(JSON.stringify(logsRef.current, null, 2));
    if (evaluationResult.best) {
      console.log("=== BEST DETECTION PARAMS ===");
      console.log(JSON.stringify(evaluationResult.best.params, null, 2));
    }
    console.log("=======================================");
  };

  // Data Collection Loop
  useEffect(() => {
    if (stepIndex >= 0 && stats) {
      const step = TUNING_SEQUENCE[stepIndex];
      const logEntry: LogData = {
        timestamp: Date.now(),
        stepLabel: step.label,
        targetNote: step.targetNote,
        stats: stats,
        detectedNote: note,
      };
      logsRef.current = [...logsRef.current, logEntry];
    }
  }, [stats, stepIndex, note]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-900 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-4xl font-bold mb-6 text-green-400">
            Calibration Complete
          </h1>
          <p className="text-xl mb-6 text-gray-200">
            Data has been analyzed and recommended detection parameters have
            been applied to this device.
          </p>

          {evaluation?.best ? (
            <div className="space-y-4 mb-8">
              <div className="bg-gray-800 p-6 rounded-xl text-left">
                <h2 className="text-2xl font-bold mb-4 text-blue-300">
                  Recommended Settings (auto-saved)
                </h2>
                <div className="grid grid-cols-2 gap-y-2 text-gray-300">
                  <span>Volume Threshold</span>
                  <span className="text-right">
                    {evaluation.best.params.volumeThreshold.toFixed(4)}
                  </span>
                  <span>Clarity Threshold</span>
                  <span className="text-right">
                    {evaluation.best.params.clarityThreshold.toFixed(2)}
                  </span>
                  <span>Min Hold (ms)</span>
                  <span className="text-right">
                    {evaluation.best.params.minHoldMs}
                  </span>
                  <span>Release (ms)</span>
                  <span className="text-right">
                    {evaluation.best.params.releaseMs}
                  </span>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Precision: {(evaluation.best.precision * 100).toFixed(1)}% ·
                  Recall: {(evaluation.best.recall * 100).toFixed(1)}% · False
                  Positives: {evaluation.best.falsePositives}
                </div>
              </div>

              {evaluation.ranked.length > 1 && (
                <div className="bg-gray-800 p-4 rounded-xl text-left">
                  <h3 className="text-lg font-semibold mb-2 text-gray-200">
                    Other Candidates
                  </h3>
                  <ul className="space-y-1 text-gray-400 text-sm">
                    {evaluation.ranked.slice(1, 4).map((entry, index) => (
                      <li key={index} className="flex justify-between">
                        <span>
                          #{index + 2} · Hold {entry.params.minHoldMs}ms ·
                          Release {entry.params.releaseMs}ms
                        </span>
                        <span>
                          Score {entry.score.toFixed(3)} / Prec{" "}
                          {(entry.precision * 100).toFixed(0)}% / Rec{" "}
                          {(entry.recall * 100).toFixed(0)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-gray-400">
                Full raw data and parameter tables are printed to the browser
                console for review.
              </p>
            </div>
          ) : (
            <p className="text-lg mb-8 text-gray-300">
              Not enough data was captured to suggest settings. Please run the
              calibration again.
            </p>
          )}
          <button
            onClick={startSequence}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition-colors"
          >
            Run Again
          </button>
        </div>
      </div>
    );
  }

  if (stepIndex === -1) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Tuning Mode
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            This mode will guide you through a sequence of notes to calibrate
            the detection engine. Please ensure your environment is quiet.
          </p>
          <div className="bg-gray-800 p-6 rounded-xl mb-8 text-left">
            <h3 className="text-lg font-bold mb-4 text-gray-200">Sequence:</h3>
            <ul className="space-y-2 text-gray-400">
              {TUNING_SEQUENCE.map((step, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {i + 1}. {step.label}
                  </span>
                  <span>{step.duration}s</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={startSequence}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition-colors shadow-lg shadow-blue-900/50"
          >
            Start Calibration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <div className="text-2xl text-gray-400 mb-4">
          Step {stepIndex + 1} / {TUNING_SEQUENCE.length}
        </div>
        <h1 className="text-6xl font-bold mb-8 text-white">
          {currentStep?.label}
        </h1>
        <div className="text-9xl font-mono font-bold text-blue-400 mb-12">
          {timeLeft}
        </div>

        {/* Live Debug Stats */}
        <div className="bg-gray-800 p-6 rounded-xl min-w-[300px]">
          <div className="grid grid-cols-2 gap-4 text-left text-sm font-mono">
            <div className="text-gray-400">Frequency:</div>
            <div className="text-right">
              {stats?.frequency.toFixed(1) || "---"} Hz
            </div>

            <div className="text-gray-400">Clarity:</div>
            <div className="text-right">
              {stats?.clarity.toFixed(3) || "---"}
            </div>

            <div className="text-gray-400">Volume:</div>
            <div className="text-right">
              {stats?.volume.toFixed(4) || "---"}
            </div>

            <div className="text-gray-400">Detected:</div>
            <div className="text-right text-green-400 font-bold">
              {note?.note || "---"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
