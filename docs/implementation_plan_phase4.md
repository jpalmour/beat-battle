# Implementation Plan - Phase 4: 4-Bar Layout & Responsiveness

## Goal
Upgrade the `MusicStaff` component to render 4-bar exercises, mimicking the Faber Piano Adventures style. Ensure the layout is responsive and fills the iPad screen.

## User Review Required
> [!NOTE]
> I will implement a responsive resizing mechanism using `ResizeObserver`.
> The "Exercise" data structure will be defined to hold 4 measures of notes.

## Proposed Changes

### [MODIFY] src/components/MusicStaff.tsx
- **Props Update**:
    - Remove single `note` prop.
    - Add `exercise`: `Exercise` object.
- **Logic**:
    - Implement `ResizeObserver` to detect container width changes.
    - Calculate width per measure: `totalWidth / 4`.
    - Loop through 4 measures and render `Stave` and `StaveNote`s for each.
    - Add support for lyrics/text under notes (using `Annotation` or `TextNote`).
    - Ensure "Finger 1" hint is supported on specific notes.

### [NEW] src/types/music.ts
- Define `Note`: `{ keys: string[], duration: string, finger?: string, text?: string }`
- Define `Measure`: `Note[]`
- Define `Exercise`: `{ title: string, measures: Measure[] }`

### [MODIFY] src/App.tsx
- Define a sample "Level 1" exercise (4 bars).
- Pass it to `MusicStaff`.
- Update container styles to be full-width and responsive.

## Verification Plan

### Manual Verification
1.  Run `npm run dev`.
2.  Resize the browser window.
    - Verify the staff resizes to fit the width.
    - Verify 4 bars are always shown in a single row (or handle wrapping if too small? User asked for 4 bars, likely one row for iPad landscape).
3.  Check visual style against the Faber screenshot (large notes, clear text).
