# Product Requirements Document: Zora's Piano Adventure

## 1. Overview
**Goal**: Create a fun, gamified web application to help Zora (7 years old) practice piano sight-reading in small, manageable bites.
**Target Audience**: Zora.
**Key Themes**: Pink, Purple, Taylor Swift, Chappelle Roan, Beyoncé, Dance (Ballet, Hip Hop), Sparkles.

## 2. Core Features (MVP)
### 2.1 Sight Reading Engine
- **Scope**: Treble Clef (Middle C to Top Bar F).
- **Progression**:
    1.  Steps (Up/Down).
    2.  Skips (Up/Down).
    3.  Bass Clef integration.
    4.  Intervals (2nds, 3rds, 4ths, 5ths).
- **Guidance**: Always display a "Finger 1" position hint to establish hand placement.
- **Interaction**: Simple "Next" flow. No auto-detection of pitch initially (User/Dad guides correctness).

### 2.2 UI/UX & Theming
- **Visual Style**: "Swiftie" aesthetic. Pink, Purple, Sparkles, Dreamy.
- **Fonts**: Fun, readable, modern (e.g., similar to Taylor Swift album fonts or clean rounded sans-serif).
- **Music Notation**: Large, easy-to-read notes.

### 2.3 Gamification
- **Levels**: Content organized into bite-sized "Levels" or "Songs".
- **Rewards**: Visual rewards (stickers, animations) for completing sets.
- **References**: Sprinkle in lyrics/images from favorite artists/books (Little House, Front Desk, etc.).

## 3. Technical Architecture
- **Frontend**: React + Vite.
- **Styling**: CSS Modules / Vanilla CSS (Modern, Scoped).
- **State Management**: React Context (initially).
- **Deployment**: Docker container (Nginx serving static build) -> User's K8s cluster.

## 4. Roadmap
- **Phase 1 (Current)**: Project Setup, Basic UI, Treble Clef Steps (Level 1).
- **Phase 2**: Skips, Bass Clef, More Theming.
- **Phase 3**: Intervals, Advanced Gamification, Persistent State.
