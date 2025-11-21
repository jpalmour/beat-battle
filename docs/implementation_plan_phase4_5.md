# Implementation Plan - Phase 4.5: Level 2 (Skips) & Level Selector

## Goal
Implement Level 2 exercises focusing on "Skips" (3rds) and add a UI to switch between levels.

## User Review Required
> [!NOTE]
> I will introduce a `LevelSelector` component.
> Level 2 will focus on skipping notes (e.g., C -> E, D -> F).

## Proposed Changes

### [NEW] src/data/level2.ts
- Define exercises for Skips (3rds).
- Example: C-E-G, D-F-A.

### [MODIFY] src/App.tsx
- Add state for `currentLevel` ('level1' | 'level2').
- Add a "Level Selector" in the header or a separate menu.
- Load exercises based on the selected level.

### [NEW] src/components/LevelSelector.tsx
- A simple dropdown or set of buttons to choose the level.
- Styled with the "Swiftie" theme (pills/badges).

## Verification Plan

### Manual Verification
1.  Run `npm run dev`.
2.  Verify "Level 1" is selected by default.
3.  Switch to "Level 2".
4.  Verify the exercises change to Skips.
5.  Play through a Level 2 exercise.
