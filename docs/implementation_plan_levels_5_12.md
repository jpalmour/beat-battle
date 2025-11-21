# Implementation Plan - Levels 5-12 & Generator Upgrade

## Goal
Implement Levels 5-12 as requested, adding support for mixed intervals, harmonic intervals (chords), and Bass Clef.

## User Review Required
> [!NOTE]
> Level 6 & 12 introduce "stacked intervals" (chords).
> I will assume "Thumb anchor" means:
> - **Treble (RH)**: Bottom note is fixed (Thumb), top note varies.
> - **Bass (LH)**: Top note is fixed (Thumb), bottom note varies.

## Proposed Changes

### [MODIFY] src/data/levels.ts
- Update `LevelConfig` interface:
    - Add `harmonicIntervals?: ('2nd' | '3rd' | '4th' | '5th')[]`.
- Add Levels 5-12 configurations.
    - **Level 5**: Treble, Mixed (Step, Skip, Repeat).
    - **Level 6**: Treble, Chords (Anchor Thumb).
    - **Level 7-12**: Bass Clef versions of 1-6.

### [MODIFY] src/utils/generator.ts
- **Expand `PITCHES`**: Add Bass Clef range (G2 - B3).
- **Update `generateExercise`**:
    - Handle `harmonicIntervals`.
    - Logic for "Thumb Anchor" chords:
        - If `harmonicIntervals` is present, occasionally generate a chord array `['c/4', 'e/4']` instead of single note.
        - Constraint: "No more than one stacked interval per bar".
        - Constraint: "Interval always involving thumb".

### [MODIFY] src/components/MusicStaff.tsx
- Ensure VexFlow handles chords correctly (it should automatically if `keys` has multiple notes).
- Verify Bass Clef rendering.

## Verification Plan

### Manual Verification
1.  **Level 5**: Check for mix of steps and skips.
2.  **Level 6**: Check for chords. Verify they involve the "thumb" (bottom note in RH).
3.  **Level 7**: Check Bass Clef rendering and range (G2-C4).
4.  **Level 12**: Check Bass Clef chords.
