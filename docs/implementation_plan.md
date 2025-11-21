# Implementation Plan - Phase 3: Music Notation Engine

## Goal
Implement the core music notation rendering using **Vite + React + VexFlow**. This will allow us to display the treble clef staff and notes for Zora to read.

## User Review Required
> [!NOTE]
> I will be using **VexFlow** (version 4.2.3 or latest) as it is the industry standard for web-based music notation.

## Proposed Changes

### Dependencies
- Install `vexflow`: `npm install vexflow`
- Install types (if needed, though VexFlow 4 usually includes them): `npm install --save-dev @types/vexflow`

### [NEW] src/components/MusicStaff.tsx
- Create a React component that wraps VexFlow.
- **Props**:
    - `note`: string (e.g., "c/4")
    - `clef`: "treble" | "bass"
    - `showFingerHint`: boolean
- **Logic**:
    - Use a `ref` to attach VexFlow's SVG renderer.
    - Render a single Stave.
    - Render a `StaveNote` based on the prop.
    - If `showFingerHint` is true, add a text annotation below the note.

### [MODIFY] src/App.tsx
- Import `MusicStaff`.
- In the "Game Area", replace the "Coming Soon" text with an instance of `MusicStaff` displaying Middle C.

## Verification Plan

### Automated Tests
- None for canvas rendering initially.

### Manual Verification
1.  Run `npm run dev`.
2.  Click "Let's Go!".
3.  Verify:
    -   A music staff appears.
    -   A Treble Clef is visible.
    -   Middle C is rendered.
    -   "Finger 1" hint is visible (if enabled).
4.  **Preview**: I will use the browser tool to take a screenshot of this state for you.
