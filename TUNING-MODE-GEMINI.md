# Tuning Mode (Gemini 3 snapshot)

This document captures how the Gemini 3 implementation of **Tuning Mode** works before the Codex refinements. It is meant as historical reference so we can compare the original behavior with the updated flow.

## How it works
- Launch by adding `?tune=true` to the app URL. The app renders the `TuningMode` component instead of the game.
- A fixed sequence guides the user: silence to measure the noise floor, then individual notes (C3 → E3 → G3 → C4 → E4 → G4 → C5).
- During each step, the hook `useNoteDetection(true)` streams microphone stats and the active detected note.
- Every render tick, the component logs a JSON entry containing the timestamp, current step, target note (if any), raw audio stats, and the detected note.
- When the sequence ends, the UI tells the user to open the browser console. The collected JSON array is printed there for manual download/sharing.

## Parameters it touches
- Uses the **default detection thresholds** baked into `detectPitch` (volume threshold `0.005`, clarity cutoff `0.9`, frequency range `27.5–4186 Hz`).
- No tunable inputs are exposed to the user. The data is observational only; it does not attempt to evaluate different settings or change runtime behavior.

## How to collect data (iPhone/iPad in Safari)
1. Open the app with `?tune=true` in the query string.
2. Place the device on the music stand, approve microphone access, and ensure the room is quiet.
3. Follow the on-screen prompts: wait through the silence segment, then play each requested pitch at a steady volume.
4. After the final step, open the Safari console (via macOS Safari’s Web Inspector) to copy the printed JSON log.

## What is done with the data
- The Gemini 3 flow only **prints raw samples**. There is no scoring or automatic parameter selection.
- Developers must pull the JSON from the console, analyze it offline, and manually adjust code defaults to improve detection.
