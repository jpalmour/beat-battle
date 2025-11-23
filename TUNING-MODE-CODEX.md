# Tuning Mode (Codex)

This document explains the updated tuning workflow that ships with the Codex implementation. It is written for musicians using the feature on iPad/iPhone **and** for agents who may need to maintain or extend it.

## What changed
- Note detection now uses a **stateful hold/release gate** so repeated notes are handled as distinct on/off events instead of a single merged detection.
- All critical thresholds are **configurable** and can be auto-tuned per device/piano based on captured samples.
- Tuning mode **replays captured frames** against a parameter grid in-browser, scores each configuration, and auto-saves the winner to `localStorage`.

## Parameters that can be tuned
- `volumeThreshold` — RMS floor required before audio is considered audible.
- `clarityThreshold` — Minimum Pitchy clarity to trust a frame.
- `minFrequency` / `maxFrequency` — Bounds for valid pitches.
- `minHoldMs` — How long a candidate must remain stable before it becomes the active note.
- `releaseMs` — How long silence/noise must last before the active note is released (enables repeated notes).

Defaults live in `DEFAULT_DETECTION_PARAMS` (`src/utils/noteDetection.ts`). The most recent tuned set is stored under `note-detection-params` in `localStorage` and automatically applied by `useNoteDetection`.

## How to run tuning (iPad/iPhone, Safari)
1. Open the app with `?tune=true` in the query string.
2. Approve microphone access and place the device on the music stand near the piano.
3. The screen will guide you through: silence → C3 → E3 → G3 → C4 → E4 → G4 → C5. Play each note steadily at performance volume.
4. After the countdown finishes, the page will show the recommended parameters and automatically save them for this device. Raw logs and scoring tables are printed to the browser console (use macOS Safari Web Inspector for mobile Safari).

## What happens with the data
- Every animation frame during the guided sequence is logged with timestamp, step label, target note, raw audio stats, and the currently detected note.
- After collection, tuning mode runs a **grid search** across volume/clarity/hold/release combinations. Each candidate is evaluated with the same detection state machine used live, producing precision/recall/false-positive metrics.
- The highest-scoring configuration is persisted and displayed on the completion screen; the top contenders and full raw dataset are available in the console for deeper review.

## Overriding defaults
- To hardcode a baseline (e.g., Zora’s piano), update `DEFAULT_DETECTION_PARAMS` in `src/utils/noteDetection.ts`.
- Users can overwrite by rerunning tuning mode; the stored `localStorage` values take precedence over the defaults when the app starts.

## Developer pointers
- Detection pipeline: `advanceDetectionState` + `createDetectionState` (stateful gating) and `analyzeAudio` in `src/utils/noteDetection.ts`.
- Tuning logic: grid search + evaluation lives in `src/components/TuningMode.tsx` and prints detailed JSON/parameter tables to the console when finishing.
- The hook `useNoteDetection` consumes stored params automatically, so the tuned settings flow into gameplay without further wiring.
