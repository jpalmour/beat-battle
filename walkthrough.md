# Logic & Ghost Note Fixes Walkthrough

I have implemented a robust fix for the note matching logic and ghost notes.

## Changes

### Game Engine (`src/hooks/useExerciseEngine.ts`)
- **Debounce Logic**: Replaced the flawed "re-render based" stability check with a proper `setTimeout` debounce. This ensures that `stableNote` is only set after the note has been held consistently for 100ms, solving the issue where the timer wasn't firing.
- **State Cleanup**: Removed duplicate state declarations that were causing errors.

### Note Detection (`src/utils/noteDetection.ts`)
- **Volume Gate**: Added an RMS (Root Mean Square) volume threshold. Notes below a certain volume (silence/background noise) are now ignored *before* pitch detection even happens. This is the most effective way to stop ghost notes.
- **Clarity Threshold**: Increased clarity threshold to 0.9 for stricter detection.

## Verification

### Manual Verification Steps
1.  **Ghost Notes**: Ensure the "DETECTED" field in the overlay stays as `--` when the room is quiet.
2.  **Stability**: Play a note. Watch "STABLE" appear after a brief fraction of a second.
3.  **Matching**: Once "STABLE" matches "TARGET", the note should turn green immediately.
4.  **Locking**: "LOCKED" should show the note name, and "WAITING" should turn to "YES".
5.  **Release**: Release the note. "WAITING" should go to "NO", and you can play the next note.

## Next Steps
- If verified, we can remove the debug overlay.
