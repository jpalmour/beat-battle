# Tuning Mode improvement plan (Codex)

Goal: make tuning mode collect useful samples on real devices (iPad/iPhone + acoustic piano), automatically score candidate detection parameters, and persist the recommended settings so note detection behaves reliably in the production environment.

## Objectives
1. **Stabilize detection** so repeated notes are recognized as distinct events (explicit note on/off via hold and release timings).
2. **Capture replayable data** (timestamped stats + expected target note) to evaluate parameter grids offline in the browser.
3. **Auto-select parameters per device/piano** and persist them, surfacing the chosen values in console logs.
4. **Document** the Gemini behavior, the plan, and the Codex implementation for humans and agents.

## Work plan
1. **Parameterize detection logic**
   - Introduce configurable thresholds (volume, clarity, min/max frequency) plus `minHoldMs` and `releaseMs` for onset/offset gating.
   - Provide storage helpers to load/persist parameters (localStorage) so tuning results apply automatically later.
2. **Stateful detection pipeline**
   - Replace one-shot note detection with a hold/release state machine to prevent merging repeated notes and to avoid false positives on short blips.
   - Reuse this pipeline both live (in hooks) and during replay simulations.
3. **Enhanced tuning mode**
   - Log every frame with timestamp, step label, expected target, and raw audio stats.
   - After the guided sequence, run a parameter grid search in-browser using the recorded samples and the new state machine.
   - Score candidates (precision/recall/false positives), pick the best, persist it, and print summaries + raw data in the console.
4. **Docs**
   - Write historical reference (`TUNING-MODE-GEMINI.md`), this plan, and a new `TUNING-MODE-CODEX.md` describing the final feature for users and future contributors.
