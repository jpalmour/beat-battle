# Agent Guide

This document is designed to help AI agents quickly understand and contribute to the **Zora's Beat Battle** codebase.

## Project Overview

**Zora's Beat Battle** is a gamified sight-reading web application built with React and TypeScript. It uses VexFlow to render musical notation and provides an interactive, level-based experience for learning piano.

## Tech Stack

- **Core**: React 19, TypeScript, Vite
- **Music Logic**: VexFlow (rendering), Custom generators (`src/utils/generator.ts`)
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
