# Zora's Beat Battle

A gamified sight-reading practice app designed to make learning piano fun and engaging.

## Features

- **Progressive Curriculum**: Starts with simple rhythms and expands to steps, skips, and chords across both Treble and Bass clefs.
- **Interactive Gameplay**: "Drop the Beat" mechanic rewards progress with visual flair.
- **Responsive Design**: Optimized for landscape play on modern devices.
- **Instant Feedback**: Visual progress tracking and level completion celebrations.

## Layout Support

The app supports 4 distinct layout states:
1.  **Standard Landscape**: Desktop & Tablet (>920px width).
2.  **Compact Landscape**: Modern Phones (812px - 920px width).
3.  **Rotate Required**: Portrait mode on supported devices.
4.  **Not Supported**: Legacy devices smaller than iPhone X (max dimension < 812px).

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Music Rendering**: VexFlow
- **Audio Detection**: Pitchy (Microphone pitch detection)
- **Styling**: Vanilla CSS (Custom Design System)

## Testing

### Unit Tests
Unit tests are written using **Vitest**. They run automatically on pre-commit to ensure code quality.
```bash
npm run test
```

### End-to-End (E2E) Tests
E2E tests are written using **Playwright**. They run in CI on every Pull Request to `main`.
```bash
npx playwright test
```

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the development server**:
    ```bash
    npm run dev
    ```

3.  **Build for production**:
    ```bash
    npm run build
    ```

## Testing

- **Run unit tests**:
  ```bash
  npm run test:unit
  ```

- **Run unit tests with coverage output (text, HTML, and lcov in `coverage/`)**:
  ```bash
  npm run test:unit:coverage
  ```

## Project Structure

- `src/components`: UI components (MusicStaff, etc.)
- `src/data`: Level configurations and game data
- `src/utils`: Logic for generating musical exercises
- `src/assets`: Images and static resources
- `src/types`: TypeScript definitions
