import { useEffect, useMemo, useRef, useState } from "react";
import { PitchDetector } from "pitchy";
import { audioService } from "../utils/audio";
import {
  analyzeAudio,
  advanceDetectionState,
  createDetectionState,
  loadDetectionParams,
  type DetectedNote,
  type AudioStats,
  type DetectionParams,
} from "../utils/noteDetection";

export function useNoteDetection(
  enabled: boolean = false,
  paramsOverride?: Partial<DetectionParams>,
) {
  const [note, setNote] = useState<DetectedNote | null>(null);
  const [stats, setStats] = useState<AudioStats | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null);
  const detectionStateRef = useRef(createDetectionState());
  const lastTimestampRef = useRef<number | null>(null);

  const params = useMemo<DetectionParams>(() => {
    const base = loadDetectionParams();
    return { ...base, ...paramsOverride };
  }, [paramsOverride]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const startListening = async () => {
      try {
        const analyser = await audioService.initialize();
        analyserRef.current = analyser;

        // Initialize Pitchy detector
        // bufferSize must match analyser.fftSize
        detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);

        setIsListening(true);
        setError(null);

        const updatePitch = (timestamp: number) => {
          const previousTimestamp = lastTimestampRef.current;
          lastTimestampRef.current = timestamp;

          if (analyserRef.current && detectorRef.current) {
            const currentStats = analyzeAudio(
              analyserRef.current,
              detectorRef.current,
              audioService.getSampleRate(),
            );
            setStats(currentStats);

            const deltaMs = previousTimestamp
              ? timestamp - previousTimestamp
              : 0;

            const nextState = advanceDetectionState(
              detectionStateRef.current,
              currentStats,
              params,
              deltaMs,
            );

            detectionStateRef.current = nextState;

            const detected = nextState.activeNote;

            setNote((prev) => {
              if (!detected) return null;
              if (!prev) return detected;
              if (prev.note !== detected.note) return detected;
              return prev; // Keep same object reference if note name hasn't changed
            });
          }
          requestRef.current = requestAnimationFrame(updatePitch);
        };

        requestRef.current = requestAnimationFrame(updatePitch);
      } catch (err) {
        console.error("Failed to start note detection:", err);
        setError("Microphone access denied or not available.");
        setIsListening(false);
      }
    };

    startListening();

    return () => {
      setIsListening(false);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      detectionStateRef.current = createDetectionState();
      lastTimestampRef.current = null;
      // We don't necessarily want to close the audio context on unmount
      // if we want to keep it alive for other components, but for now it's fine.
    };
  }, [enabled, params]);

  return { note, stats, isListening, error };
}
