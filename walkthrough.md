# Testing Strategy Implementation

I have implemented a consolidated testing strategy using **Playwright** for End-to-End (E2E) testing and **Vitest** for Unit testing.

## Changes

### 1. End-to-End Tests (Playwright)
- **Framework**: Standardized on Playwright.
- **Configuration**: `playwright.config.ts` configured to auto-approve microphone permissions.
- **Test**: `tests/game.spec.ts` implements the core game loop verification:
    - Loads app with `?debug=true`.
    - Starts game ("Drop the Beat").
    - Verifies recording state.
    - Simulates correct notes using the debug overlay target.
    - Verifies progress advancement.

### 2. Unit Tests (Vitest)
- **Framework**: Vitest (existing).
- **Configuration**: Updated `vite.config.ts` to exclude Playwright tests from Vitest execution.
- **Pre-commit**: Configured `.husky/pre-commit` to run `npm run test` before every commit.

### 3. CI/CD (GitHub Actions)
- **Workflow**: `.github/workflows/ci.yml`
- **Jobs**:
    - `unit-tests`: Runs `npm run test` (Vitest).
    - `e2e-tests`: Runs `npx playwright test` (Playwright).
- **Trigger**: Runs on Pull Requests to `main`.

### 4. Documentation
- Updated `README.md` with testing instructions.
- Updated `AGENTS.md` with the testing strategy details.

## Verification Results

### Automated Tests
- **Unit Tests**: Passed locally (`npm run test`).
- **E2E Tests**: Passed locally (`npx playwright test`).

### Manual Verification
- Verified that the Playwright test successfully interacts with the game loop and handles the microphone permission automatically.
