import React, { useEffect, useState, useRef } from "react";
import { useNoteDetection } from "../hooks/useNoteDetection";
import type { AudioStats, DetectedNote } from "../utils/noteDetection";

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

export const TuningMode: React.FC = () => {
  const { stats, note, error } = useNoteDetection(true);
  const [stepIndex, setStepIndex] = useState(-1); // -1 = Idle, 0+ = In Progress
  const [timeLeft, setTimeLeft] = useState(0);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentStep =
    stepIndex >= 0 && stepIndex < TUNING_SEQUENCE.length
      ? TUNING_SEQUENCE[stepIndex]
      : null;

  const startSequence = () => {
    setStepIndex(0);
    setLogs([]);
    setIsFinished(false);
    startStep(0);
  };

  const startStep = (index: number) => {
    if (index >= TUNING_SEQUENCE.length) {
      finishSequence();
      return;
    }
    const step = TUNING_SEQUENCE[index];
    setTimeLeft(step.duration);
    // eslint-disable-next-line react-hooks/purity
    startTimeRef.current = Date.now();

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
    console.log("=== TUNING DATA COLLECTION COMPLETE ===");
    console.log(JSON.stringify(logs, null, 2));
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
      setLogs((prev) => [...prev, logEntry]);
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
            Data Collection Complete!
          </h1>
          <p className="text-xl mb-8">
            Please check the browser console (F12) for the logged JSON data.
            Copy that data and send it to the developer.
          </p>
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
