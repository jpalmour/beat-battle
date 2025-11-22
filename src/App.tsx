import { useState, useEffect } from "react";
import "./App.css";
import MusicStaff from "./components/MusicStaff";
import { RecordingLight } from "./components/RecordingLight";
import { useNoteDetection } from "./hooks/useNoteDetection";
import { useExerciseEngine } from "./hooks/useExerciseEngine";

import { levels } from "./data/levels";
import { generateExercise } from "./utils/generator";
import type { Exercise } from "./types/music";
import type { DetectedNote } from "./utils/noteDetection";

import titleImage from "./assets/TitleText-ZorasBeatBattle-Bordered-Transparent.png";
import scoreLabelImage from "./assets/street-score-transparent.png";
import dropButtonImage from "./assets/drop-the-beat-button-transparent.png";
import backButtonImage from "./assets/step-back-button-transparent.png";

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<Exercise>(() =>
    generateExercise(levels[0], "init"),
  );
  const [exerciseCount, setExerciseCount] = useState(1);
  const [score, setScore] = useState(0);
  const [progressCount, setProgressCount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);

  // Audio & Game Engine
  // Note detection starts on first interaction
  const [audioEnabled, setAudioEnabled] = useState(false);
  const { note: detectedNote, error: audioError } =
    useNoteDetection(audioEnabled);
  const [isRecording, setIsRecording] = useState(false);

  // Cheats
  const [simulatedNote, setSimulatedNote] = useState<{
    note: DetectedNote;
    id: number;
  } | null>(null);

  // Layout State Logic
  const [layoutState, setLayoutState] = useState<
    "standard" | "compact" | "rotate" | "unsupported"
  >("standard");

  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const maxDim = Math.max(width, height);

      // Minimum supported "modern" phone length (iPhone X/11 Pro is 812px)
      const MIN_SUPPORTED_WIDTH = 812;

      // Check device capability
      let isCapable = maxDim >= MIN_SUPPORTED_WIDTH;

      // On touch devices (phones/tablets), use screen dimensions as fallback
      // This handles the case where browser bars reduce the viewport height in portrait
      // but the device is actually large enough.
      // We don't do this on desktop so that resizing the window can still simulate "Not Supported".
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
      if (isTouchDevice) {
        const maxScreenDim = Math.max(
          window.screen.width,
          window.screen.height,
        );
        if (maxScreenDim >= MIN_SUPPORTED_WIDTH) {
          isCapable = true;
        }
      }

      if (!isCapable) {
        setLayoutState("unsupported");
      } else if (!isLandscape) {
        setLayoutState("rotate");
      } else if (width <= 920) {
        setLayoutState("compact");
      } else {
        setLayoutState("standard");
      }
    };

    checkLayout();
    window.addEventListener("resize", checkLayout);
    return () => window.removeEventListener("resize", checkLayout);
  }, []);

  // Unlock audio on first interaction
  const handleInteraction = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!audioEnabled) {
      setAudioEnabled(true);
    }

    // Cheat Listener
    if (e.type === "keydown") {
      const kbEvent = e as React.KeyboardEvent;
      if (kbEvent.repeat) return; // Ignore hold-down repeats

      const key = kbEvent.key.toUpperCase();
      if (["A", "B", "C", "D", "E", "F", "G"].includes(key)) {
        // Simulate a note event
        // We use a generic octave (4) because the engine will ignore it for cheats
        setSimulatedNote({
          note: { note: `${key}4`, frequency: 440, clarity: 1 },
          id: Date.now(),
        });
        // Clear it immediately after render cycle so it doesn't stick
        setTimeout(() => setSimulatedNote(null), 50);
      }
    }
  };

  const handleExerciseComplete = () => {
    // 1. Update Score & Progress
    setScore((prev) => prev + 500);
    const newProgress = progressCount + 1;
    setProgressCount(newProgress);

    // 2. Check for Level Completion
    if (newProgress >= 5) {
      // Level Complete!
      setShowLevelUp(true);
      setTimeout(() => {
        // Advance to next level
        const nextLevelIdx = (currentLevelIndex + 1) % levels.length;
        setCurrentLevelIndex(nextLevelIdx);

        // Reset for new level
        setProgressCount(0);
        setExerciseCount(1);
        setShowLevelUp(false);

        // Generate first exercise of new level
        const nextExercise = generateExercise(
          levels[nextLevelIdx],
          `ex-${Date.now()}`,
        );
        setCurrentExercise(nextExercise);
      }, 3000); // 3s celebration
    } else {
      // Just next exercise
      handleNextExercise();
    }
  };

  const handleExerciseFail = () => {
    setShowTryAgain(true);
    setTimeout(() => {
      setShowTryAgain(false);
      resetEngine();
    }, 2000);
  };

  const {
    noteStatuses,
    feedback,
    reset: resetEngine,
    debug,
  } = useExerciseEngine({
    exercise: currentExercise,
    detectedNote,
    simulatedNote,
    isRecording,
    onComplete: handleExerciseComplete,
    onFail: handleExerciseFail,
  });

  // Check for debug mode
  const showDebug =
    new URLSearchParams(window.location.search).get("debug") === "true";

  const progressValue = Math.min((progressCount / 5) * 100, 100);

  const handleNextExercise = () => {
    const nextExercise = generateExercise(
      levels[currentLevelIndex],
      `ex-${Date.now()}`,
    );
    setCurrentExercise(nextExercise);
    setExerciseCount((prev) => prev + 1);
  };

  const handleLevelSelect = (index: number) => {
    setCurrentLevelIndex(index);
    const nextExercise = generateExercise(levels[index], `ex-${Date.now()}`);
    setCurrentExercise(nextExercise);
    setExerciseCount(1);
    setProgressCount(0); // Reset progress on manual level switch
  };

  const handleDropTheBeat = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div
      className="app-shell"
      onClick={handleInteraction}
      onKeyDown={handleInteraction}
    >
      {/* Layout Overlays */}
      {layoutState === "unsupported" && (
        <div className="portrait-lock" style={{ display: "flex" }}>
          <div className="lock-content">
            <span className="rotate-icon">⚠️</span>
            <h2>Device Not Supported</h2>
            <p>This device is too small for the battle!</p>
            <p style={{ fontSize: "0.8em", opacity: 0.7 }}>Min width: 812px</p>
          </div>
        </div>
      )}

      {layoutState === "rotate" && (
        <div className="portrait-lock" style={{ display: "flex" }}>
          <div className="lock-content">
            <span className="rotate-icon">↻</span>
            <h2>Rotate Your Device</h2>
            <p>This game is best played in landscape mode!</p>
          </div>
        </div>
      )}

      <div className="graffiti-overlay" />
      {showLevelUp && (
        <div className="celebration-overlay">
          <h1 className="level-up-text">LEVEL UP!</h1>
          <div className="confetti">🎉 🎹 🚀</div>
        </div>
      )}

      {showTryAgain && (
        <div
          className="celebration-overlay"
          style={{ background: "rgba(50, 0, 0, 0.8)" }}
        >
          <h1
            className="level-up-text"
            style={{ color: "#ff4444", textShadow: "0 0 10px red" }}
          >
            TRY AGAIN
          </h1>
        </div>
      )}

      {/* DEBUG OVERLAY */}
      {showDebug && (
        <div
          style={{
            position: "fixed",
            top: 10,
            left: 10,
            background: "rgba(0,0,0,0.8)",
            color: "lime",
            padding: "10px",
            zIndex: 9999,
            fontFamily: "monospace",
            fontSize: "12px",
            pointerEvents: "none",
          }}
        >
          <div>DETECTED: {detectedNote?.note || "--"}</div>
          <div>TARGET: {debug.targetKey}</div>
          <div>STABLE: {debug.stableNote || "--"}</div>
          <div>LOCKED: {debug.lockedNote || "--"}</div>
          <div>WAITING: {debug.isWaitingForRelease ? "YES" : "NO"}</div>
          <div>REC: {isRecording ? "ON" : "OFF"}</div>
        </div>
      )}

      <main className="battle-stage">
        <header className="hud">
          {/* Left: Recording & Note Display */}
          <div className="hud-left">
            <RecordingLight isRecording={isRecording} />
            <div
              className="hud-note-display"
              style={{
                fontSize: audioError ? "1rem" : "2.5rem",
                color: audioError ? "red" : "#00ffff",
              }}
            >
              {audioError
                ? "MIC ERROR"
                : detectedNote
                  ? detectedNote.note
                  : "--"}
            </div>
          </div>

          {/* Center: Title */}
          <div className="hud-center">
            <img
              src={titleImage}
              alt="Zora's Beat Battle"
              className="title-image"
            />
          </div>

          {/* Right: Progress & Score */}
          <div className="hud-right">
            <div className="hud-progress">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressValue}%` }}
                >
                  <span className="progress-text">{progressValue}%</span>
                </div>
              </div>
            </div>
            <div className="hud-score-stacked">
              <img
                src={scoreLabelImage}
                alt="Street Score"
                className="score-label-img"
              />
              <span className="score-value">{score}</span>
            </div>
          </div>
        </header>

        <section className="board">
          <div className="staff-panel">
            <MusicStaff
              exercise={currentExercise}
              noteStatuses={noteStatuses}
            />
            {feedback === "error" && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  color: "red",
                  fontSize: "2em",
                }}
              >
                ❌
              </div>
            )}
            {feedback === "correct" && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  color: "green",
                  fontSize: "2em",
                }}
              >
                ✅
              </div>
            )}
          </div>

          <div className="board-footer">
            {/* Left: Back Button */}
            <button
              className="image-button back-button"
              onClick={() =>
                handleLevelSelect(Math.max(currentLevelIndex - 1, 0))
              }
            >
              <img src={backButtonImage} alt="Back" />
            </button>

            {/* Center: Level Nav & Info */}
            <div className="level-info-container">
              <div className="level-nav">
                <button
                  className="nav-arrow"
                  onClick={() =>
                    handleLevelSelect(
                      (currentLevelIndex - 1 + levels.length) % levels.length,
                    )
                  }
                >
                  &lt;
                </button>
                <div className="level-name-display">
                  {levels[currentLevelIndex].name}
                </div>
                <button
                  className="nav-arrow"
                  onClick={() =>
                    handleLevelSelect((currentLevelIndex + 1) % levels.length)
                  }
                >
                  &gt;
                </button>
              </div>
              <div className="exercise-meta-display">
                <span>Level {currentLevelIndex + 1}</span>
                <span>•</span>
                <span>Ex #{exerciseCount}</span>
              </div>
            </div>

            {/* Right: Drop Button (Toggle Listening) */}
            <button
              className="image-button drop-button"
              onClick={handleDropTheBeat}
              style={{ filter: isRecording ? "hue-rotate(90deg)" : "none" }}
            >
              <img
                src={dropButtonImage}
                alt={isRecording ? "Stop Recording" : "Start Recording"}
              />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
