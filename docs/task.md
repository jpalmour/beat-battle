# Zora's Piano Sight Reading App - Task List

- [x] **Phase 1: Planning and Setup**
    - [x] Create Product Requirements Document (PRD)
    - [x] Create Implementation Plan
    - [x] Initialize Project (Vite + React)
    - [x] Setup Basic Directory Structure

- [ ] **Phase 2: UI/UX Design & Theming**
    - [ ] Design Core Layout (Header, Main Stage, Footer)
    - [ ] Implement "Swiftie/Pink/Purple" Theme Variables
    - [ ] Create Reusable UI Components (Buttons, Cards, Badges)
    - [ ] Add Thematic Assets (Backgrounds, Icons based on interests)

- [x] **Phase 3: Core Engine - Music Notation**
    - [x] Research/Select Music Notation Library (VexFlow)
    - [x] Implement Basic Staff Rendering (Treble Clef)
    - [x] Implement Note Rendering (Middle C to High F)
    - [x] Create "Finger 1" Position Indicator

- [x] **Phase 4: Game Logic - Level 1**
    - [x] Define Level 1 Data Structure (Steps up/down)
    - [x] Implement "Next Note" Flow (Next Song)
    - [x] Add Simple Feedback (Correct/Try Again - Manual for now per user?)
        - *Note: User said "I'll be her guide for now (not need to try and be fancy and autodetect correctness... yet)". So maybe just a "Show Answer" or "Next" button?*

- [x] **Phase 5: Scalable Content Engine (The Generator)**
    - [x] Design `ExerciseGenerator` logic (intervals, rhythm, range constraints)
    - [x] Implement Level Configurations (Level 1: Repeats, Level 2: Steps, etc.)
    - [x] Generate 10+ exercises per level dynamically
    - [x] Update Level Selector to handle multiple levels

- [ ] **Phase 6: Expanded UI & Navigation**
    - [ ] Sidebar/Menu for Level Selection
    - [ ] "Level Complete" screen
    - [ ] Progress tracking (which levels are done?)

- [ ] **Phase 7: Gamification & Polish**
    - [ ] Add Progress Indicators (Stars, Hearts)
    - [ ] Add Thematic Rewards (Unlockable stickers/images of interests)
    - [ ] Polish Animations (Transitions, Sparkles)

- [ ] **Phase 8: Deployment Prep**
    - [ ] Create Dockerfile for k8s deployment
    - [ ] Final Review and Documentation
