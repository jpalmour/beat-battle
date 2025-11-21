# Implementation Plan - Phase 6: Expanded UI & Navigation

## Goal
Enhance the app's navigation and user experience by adding a persistent Sidebar for level selection, a "Level Complete" feedback screen, and tracking user progress.

## User Review Required
> [!NOTE]
> I will move the `LevelSelector` into a new `Sidebar` component.
> I will add a `ProgressContext` to save which levels/exercises are completed (using `localStorage` for persistence).

## Proposed Changes

### [NEW] src/context/ProgressContext.tsx
- React Context to store:
    - `completedLevels`: Record<string, boolean> (or number of stars?)
    - `completedExercises`: Record<string, number> (count of exercises done per level)
- Persist to `localStorage`.

### [NEW] src/components/Sidebar.tsx
- Replaces the top `LevelSelector`.
- Lists all levels vertically.
- Shows completion status (e.g., a checkmark or star next to the level).
- Collapsible on mobile (hamburger menu).

### [NEW] src/components/LevelCompleteModal.tsx
- Shown after completing a set number of exercises (e.g., 5) or manually triggered?
- For now, maybe show a mini-celebration after *each* exercise, and a big one after X exercises.
- Let's keep it simple: "Great Job!" overlay after clicking "Next Song" X times? Or just a visual flair?
- **Decision**: Let's add a "Complete Level" button or just track "Exercises Played".

### [MODIFY] src/App.tsx
- Wrap with `ProgressProvider`.
- Layout change: `flex-row` instead of column. Sidebar on left, Game Area on right.
- Update `handleNext` to increment progress.

## Verification Plan

### Manual Verification
1.  Verify Sidebar appears and works to switch levels.
2.  Complete an exercise (click Next). Refresh page. Verify progress is saved.
3.  Check mobile responsiveness (Sidebar should collapse or be distinct).
