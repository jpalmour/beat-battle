# Agent Guide

This document is designed to help AI agents quickly understand and contribute to the **Zora's Beat Battle** codebase.

## Project Overview

**Zora's Beat Battle** is a gamified sight-reading web application built with React and TypeScript. It uses VexFlow to render musical notation and provides an interactive, level-based experience for learning piano.


## UI Layouts & Validation

The application implements a strict **4-State Layout System** to ensure quality across devices.

### 1. Not Supported
- **Condition**: `max(width, height) < 812px`
- **Description**: Device is too small (e.g., older phones). Displays "Device Not Supported" overlay.

### 2. Rotate Required
- **Condition**: `max(width, height) >= 812px` AND `orientation: portrait`
- **Description**: Device is capable but in wrong orientation. Displays "Rotate Your Device" overlay.

### 3. Compact Landscape (Phone)
- **Condition**: `orientation: landscape` AND `width <= 920px`
- **Description**:
    - Title scaled down (0.8x) and positioned lower.
    - Reduced padding and gaps.
    - Smaller progress bar and score.
    - **Critical**: Title logo must NOT overlap with the "Rec/Note" group (left) or "Score/Progress" group (right).

### 4. Standard Landscape (Desktop/Tablet)
- **Condition**: `orientation: landscape` AND `width > 920px`
- **Description**: Full-size title, spacious padding, standard component sizes.

### Automated Validation
Layout validation is **fully automated** via Playwright E2E tests (`tests/layout.spec.ts`). These tests:
- Verify all 4 layout states render correctly
- Check for element overlaps in compact mode
- Test boundary conditions (812px height, 920px width thresholds)
- Run automatically in CI/CD on all PRs

**When making UI changes**: Simply run `npx playwright test` to validate all layouts. No manual testing required.

## Testing Strategy

### Unit Tests
- **Framework**: Vitest
- **Execution**: Runs on pre-commit hook (`.husky/pre-commit`).
- **Command**: `npm run test` (run as-is; no `--runInBand` or other flags needed)

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

## Git Workflow (CRITICAL)

**⚠️ MAIN BRANCH IS PROTECTED - NEVER COMMIT DIRECTLY TO MAIN ⚠️**

### Workflow Rules (MUST FOLLOW)

1.  **Always work on feature branches** - NEVER commit directly to `main`
2.  **Branch naming**: Use descriptive names with prefixes:
    - `feature/` - New features (e.g., `feature/add-bass-clef-support`)
    - `fix/` - Bug fixes (e.g., `fix/audio-detection-timeout`)
    - `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)
    - `docs/` - Documentation updates (e.g., `docs/update-readme`)
3.  **Create feature branches**: `git checkout -b feature/your-feature-name`
4.  **Commit to feature branch**: Make all commits on your feature branch
5.  **Create PR using gh CLI**: `gh pr create --title "Title" --body "Description"`
6.  **Never push to main**: If you accidentally commit to main, create a new branch from that commit and reset main

### Example Workflow

```bash
# 1. Create and switch to feature branch
git checkout -b feature/add-new-level

# 2. Make changes and commit
git add .
git commit -m "feat: add level 5 with ledger lines"

# 3. Push feature branch
git push -u origin feature/add-new-level

# 4. Create PR using gh CLI
gh pr create --title "Add Level 5 with Ledger Lines" --body "Description here"
```

### Why This Matters

- Main branch is protected and requires PR reviews
- CI/CD runs on PRs before merging
- Prevents broken code from reaching production
- Maintains clean git history

## Development Rules

1.  **No Tailwind**: Do not introduce Tailwind CSS. Use standard CSS classes and variables.
2.  **Strict Types**: Maintain strict TypeScript usage. Avoid `any`.
3.  **Clean Code**: Keep components focused. `App.tsx` handles the main game loop; sub-components should be presentational where possible.
4.  **Assets**: Ensure any new assets are placed in `src/assets` and imported correctly.
