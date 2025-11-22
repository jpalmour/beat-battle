# Agent Guide

This document is designed to help AI agents quickly understand and contribute to the **Zora's Beat Battle** codebase.

## Project Overview

**Zora's Beat Battle** is a gamified sight-reading web application built with React and TypeScript. It uses VexFlow to render musical notation and provides an interactive, level-based experience for learning piano.


## UI Layouts & Validation

The application supports 3 distinct layout modes based on screen size and orientation. **ALL UI changes must be validated against these 3 layouts.**

## UI Layouts & Validation

The application implements a strict **4-State Layout System** to ensure quality across devices.

### 1. Not Supported
- **Condition**: `max(width, height) < 812px`
- **Description**: Device is too small (e.g., older phones). Displays "Device Not Supported" overlay.
- **Validation**: Test with window size ~600x400.

### 2. Rotate Required
- **Condition**: `max(width, height) >= 812px` AND `orientation: portrait`
- **Description**: Device is capable but in wrong orientation. Displays "Rotate Your Device" overlay.
- **Validation**: Test with window size ~400x850.

### 3. Compact Landscape (Phone)
- **Condition**: `orientation: landscape` AND `width <= 920px`
- **Description**: 
    - Title scaled down (0.8x) and positioned lower.
    - Reduced padding and gaps.
    - Smaller progress bar and score.
- **Validation**: 
    - **Critical**: Ensure the title logo does NOT overlap with the "Rec/Note" group (left) or "Score/Progress" group (right).
    - **Critical**: Ensure the "Street Score" remains centered under the progress bar.
    - Verify at widths ~812px (iPhone X) and ~850px.

### 4. Standard Landscape (Desktop/Tablet)
- **Condition**: `orientation: landscape` AND `width > 920px`
- **Description**: Full-size title, spacious padding, standard component sizes.
- **Validation**: Ensure no overlap between HUD elements. Title should be centered.

### Validation Procedure
When making UI changes:
1.  **Analyze** the impact on all 3 layouts.
2.  **Verify** visually (using browser tools or screenshots) that elements do not spill over or overlap in Compact Landscape mode.
3.  **Fix** any obvious alignment or spacing issues automatically.
4.  **Present** the results to the user if uncertain.

## Testing Strategy

### Unit Tests
- **Framework**: Vitest
- **Execution**: Runs on pre-commit hook (`.husky/pre-commit`).
- **Command**: `npm run test`

### End-to-End (E2E) Tests
- **Framework**: Playwright
- **Execution**: Runs in GitHub Actions on PRs to `main`.
- **Command**: `npx playwright test`
- **Configuration**: `playwright.config.ts` (includes auto-approved microphone permissions).

## CI/CD
- **Workflow**: `.github/workflows/ci.yml`
- **Jobs**:
    - `unit-tests`: Runs Vitest.
    - `e2e-tests`: Runs Playwright.

## Tech Stack

- **Core**: React 19, TypeScript, Vite
- **Music Logic**: VexFlow (rendering), Custom generators (`src/utils/generator.ts`)
- **Audio Detection**: Pitchy (Microphone pitch detection)
- **Styling**: Vanilla CSS (`src/index.css`, `src/App.css`, `src/styles/theme.css`). **NO Tailwind CSS.**
- **State Management**: React `useState` (Local state is sufficient for current complexity).

## Key Commands

- **Development**: `npm run dev` (Starts Vite server)
- **Build**: `npm run build` (Type-check and build for production)
- **Lint**: `npm run lint` (ESLint checks)

## Project Structure

- **`src/App.tsx`**: Main application logic, state management, and layout.
- **`src/components/MusicStaff.tsx`**: Wrapper around VexFlow to render the current exercise.
- **`src/data/levels.ts`**: Configuration for all game levels (clefs, ranges, intervals).
- **`src/utils/generator.ts`**: Logic to generate random musical exercises based on level config.
- **`src/assets/`**: Images and static assets.

## Design System

- **Theme**: Dark, "Cyber-Pop" aesthetic.
- **Colors**: Defined in `src/styles/theme.css` (e.g., `--color-primary`, `--color-accent`).
- **Typography**: 'Bangers' for headings, 'Inter' for UI text.
- **Layout**: Mobile-first landscape optimization.

## Development Rules

1.  **No Tailwind**: Do not introduce Tailwind CSS. Use standard CSS classes and variables.
2.  **Strict Types**: Maintain strict TypeScript usage. Avoid `any`.
3.  **Clean Code**: Keep components focused. `App.tsx` handles the main game loop; sub-components should be presentational where possible.
4.  **Assets**: Ensure any new assets are placed in `src/assets` and imported correctly.
