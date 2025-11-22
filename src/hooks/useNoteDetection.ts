import { useEffect, useRef, useState } from "react";
import { PitchDetector } from "pitchy";
import { audioService } from "../utils/audio";
import {
  detectPitch,
  analyzeAudio,
  type DetectedNote,
  type AudioStats,
} from "../utils/noteDetection";

export function useNoteDetection(enabled: boolean = false) {
  const [note, setNote] = useState<DetectedNote | null>(null);
  const [stats, setStats] = useState<AudioStats | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null);

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

        const updatePitch = () => {
          if (analyserRef.current && detectorRef.current) {
            const currentStats = analyzeAudio(
              analyserRef.current,
              detectorRef.current,
              audioService.getSampleRate(),
            );
            setStats(currentStats);

            const detected = detectPitch(
              analyserRef.current,
              detectorRef.current,
              audioService.getSampleRate(),
            );

            // Only update if note changed or if we went from note -> no note
            setNote((prev) => {
              if (!detected) return null;
              if (!prev) return detected;
              if (prev.note !== detected.note) return detected;
              return prev; // Keep same object reference if note name hasn't changed
            });
          }
          requestRef.current = requestAnimationFrame(updatePitch);
        };

        updatePitch();
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
      // We don't necessarily want to close the audio context on unmount
      // if we want to keep it alive for other components, but for now it's fine.
    };
  }, [enabled]);

  return { note, stats, isListening, error };
}
