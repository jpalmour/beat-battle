# Tuning & Sensitivity Walkthrough

I have tuned the note detection to match your setup and improve sensitivity.

## Changes

### Note Detection (`src/utils/noteDetection.ts`)
- **Octave Offset**: Adjusted the octave calculation by -1. This should align "C5" on your keyboard with "C5" in the game (previously it was showing C6).
- **Sensitivity**: Lowered the volume threshold (RMS) from 0.01 to 0.005. This makes the microphone twice as sensitive to quiet notes, so you shouldn't have to crank the volume as high.

## Verification

### Manual Verification Steps
1.  **Octave Check**: Play C5 on your keyboard. Verify the game now displays **C5** (not C6).
2.  **Sensitivity Check**: Play at a normal/comfortable volume. Verify the note is detected reliably.
3.  **Ghost Note Check**: Ensure that when you stop playing, the detected note still goes to `--` (no ghost notes from background noise).

## Next Steps
- If this feels good, we are ready to move on to the next feature!
