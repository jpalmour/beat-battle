# Implementation Plan - Phase 5: Scalable Content Engine

## Goal
Create a dynamic `ExerciseGenerator` to automatically create unlimited sight-reading exercises based on specific level configurations. This replaces hardcoded data and allows for easy scalability.

## User Review Required
> [!IMPORTANT]
> I will implement a **Generator Engine** instead of hardcoding 40+ exercises.
> This ensures "infinite" practice material and easier adjustments.

## Proposed Changes

### [NEW] src/utils/generator.ts
- **`generateExercise(config: LevelConfig): Exercise`**
- Logic:
    1.  Start at a random note within the allowed range.
    2.  Generate 4 measures.
    3.  For each note, choose the next note based on `intervalRules` (e.g., "repeats only", "steps only", "skips only").
    4.  Ensure notes stay within `range` (Treble: C4-F5, Bass: G2-C4).
    5.  Assign rhythms based on `rhythmRules` (Whole, Half, Quarter).
    6.  Ensure measures fill 4/4 time.

### [NEW] src/data/levels.ts
- Define `LevelConfig` interface:
    - `clef`: 'treble' | 'bass'
    - `range`: { min: string, max: string }
    - `intervals`: ('repeat' | 'step' | 'skip')[]
    - `direction`: 'any' | 'up' | 'down' (for Level 2/3 distinction)
    - `rhythms`: ('w' | 'h' | 'q' | 'hd')[]
- Export `levels`: Array of configs for the 4 requested levels:
    1.  **Level 1**: Treble, Repeats only.
    2.  **Level 2**: Treble, Steps (unidirectional per phrase).
    3.  **Level 3**: Treble, Steps (mixed direction).
    4.  **Level 4**: Treble, Skips & Repeats.

### [MODIFY] src/App.tsx
- Replace static `level1Exercises` with dynamic generation.
- Add `currentLevelIndex` state.
- On "Next Song", generate a NEW exercise using the current level's config.
- Add a "Level Selector" (Dropdown/Buttons) to change `currentLevelIndex`.

## Verification Plan

### Automated Tests
- Create a unit test (or simple script) to verify the generator produces valid VexFlow keys and correct measure durations.

### Manual Verification
1.  Select Level 1. Verify all notes are repeats.
2.  Select Level 2. Verify notes move in steps.
3.  Select Level 4. Verify skips appear.
4.  Click "Next Song" multiple times to ensure variety.
