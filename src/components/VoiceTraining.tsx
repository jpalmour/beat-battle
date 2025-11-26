import { useMemo, useState } from "react";
import type React from "react";
import MusicStaff from "./MusicStaff";
import { RecordingLight } from "./RecordingLight";
import { useNoteDetection } from "../hooks/useNoteDetection";
import { useExerciseEngine } from "../hooks/useExerciseEngine";
import { happyBirthdaySong, songs } from "../data/songs";
import type { Exercise } from "../types/music";
import type { DetectedNote } from "../utils/noteDetection";

import titleImage from "../assets/TitleText-ZorasBeatBattle-Bordered-Transparent.png";
import streetScoreImage from "../assets/street-score-transparent.png";
import dropTheBeatImage from "../assets/drop-the-beat-button-transparent.png";
import backButtonImage from "../assets/step-back-button-transparent.png";

const MEASURES_PER_PAGE = 4;

const getMeasureIndexForNote = (exercise: Exercise, noteIndex: number) => {
  if (exercise.measures.length === 0) return null;
  let runningTotal = 0;
  for (let i = 0; i < exercise.measures.length; i++) {
    runningTotal += exercise.measures[i].length;
    if (noteIndex < runningTotal) {
      return i;
    }
  }
  return exercise.measures.length - 1;
};

export function VoiceTraining({ songId }: { songId: string }) {
  const song = useMemo(() => songs[songId] ?? happyBirthdaySong, [songId]);
  const totalNotes = useMemo(
    () =>
      song.measures.reduce(
        (total: number, measure) => total + measure.length,
        0,
      ),
    [song],
  );

  const totalPages = Math.ceil(song.measures.length / MEASURES_PER_PAGE);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const { note: detectedNote, error: audioError } =
    useNoteDetection(audioEnabled);
  const [isRecording, setIsRecording] = useState(false);
  const [songComplete, setSongComplete] = useState(false);

  const [simulatedNote, setSimulatedNote] = useState<{
    note: DetectedNote;
    id: number;
  } | null>(null);

  const handleInteraction = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!audioEnabled) {
      setAudioEnabled(true);
    }

    if (e.type === "keydown") {
      const kbEvent = e as React.KeyboardEvent;
      if (kbEvent.repeat) return;

      const key = kbEvent.key.toUpperCase();
      if (["A", "B", "C", "D", "E", "F", "G"].includes(key)) {
        setSimulatedNote({
          note: { note: `${key}4`, frequency: 440, clarity: 1 },
          id: Date.now(),
        });
        setTimeout(() => setSimulatedNote(null), 50);
      }
    }
  };

  const handleComplete = () => {
    setIsRecording(false);
    setSongComplete(true);
  };

  const {
    noteStatuses,
    feedback,
    reset,
    currentNoteIndex,
    score,
    correctCount,
    errorCount,
    debug,
  } = useExerciseEngine({
    exercise: song,
    detectedNote,
    simulatedNote,
    isRecording,
    onComplete: handleComplete,
    onFail: handleComplete,
    octaveAgnostic: true, // Voice mode: any octave of the correct note counts
  });

  const currentMeasureIndex = useMemo(
    () => getMeasureIndexForNote(song, currentNoteIndex),
    [song, currentNoteIndex],
  );

  const overridePageParam = new URLSearchParams(window.location.search).get(
    "page",
  );
  const overridePage = useMemo(() => {
    if (!overridePageParam) return null;
    const parsed = Number.parseInt(overridePageParam, 10);
    if (Number.isNaN(parsed)) return null;
    return Math.min(Math.max(parsed - 1, 0), Math.max(totalPages - 1, 0));
  }, [overridePageParam, totalPages]);

  const currentPage = useMemo(() => {
    if (overridePage !== null) return overridePage;
    if (currentMeasureIndex === null) return 0;
    return Math.min(
      Math.floor(currentMeasureIndex / MEASURES_PER_PAGE),
      totalPages - 1,
    );
  }, [currentMeasureIndex, totalPages, overridePage]);

  const handleDropTheBeat = () => {
    if (!audioEnabled) {
      setAudioEnabled(true);
    }
    setSongComplete(false);
    setIsRecording((prev) => !prev);
  };

  const handleRestart = () => {
    reset();
    setSongComplete(false);
    setIsRecording(false);
  };

  const showDebug =
    new URLSearchParams(window.location.search).get("debug") === "true";

  // Calculate progress values for the split progress bar
  const notesPlayed = correctCount + errorCount;
  const overallProgress = Math.min(
    (notesPlayed / Math.max(totalNotes, 1)) * 100,
    100,
  );
  // Within the played portion, calculate the correct vs error split
  const correctPercentOfPlayed =
    notesPlayed > 0 ? (correctCount / notesPlayed) * 100 : 100;
  const correctWidth = (overallProgress * correctPercentOfPlayed) / 100;
  const errorWidth = overallProgress - correctWidth;

  const startMeasure = currentPage * MEASURES_PER_PAGE;

  return (
    <div
      className="app-shell"
      onClick={handleInteraction}
      onKeyDown={handleInteraction}
    >
      <div className="graffiti-overlay" />

      {songComplete && (
        <div
          className="celebration-overlay"
          style={{ background: "rgba(14,22,30,0.9)" }}
        >
          <h1 className="level-up-text">SONG COMPLETE</h1>
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontFamily: "Bangers, cursive",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                color: "#f2ff5d",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              SCORE: {score}
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                color: "#fff",
                marginTop: "10px",
              }}
            >
              <span style={{ color: "#4caf50" }}>{correctCount} correct</span>
              {" • "}
              <span style={{ color: "#f44336" }}>{errorCount} missed</span>
            </div>
            <div
              style={{
                fontSize: "1.2rem",
                color: "#aaa",
                marginTop: "10px",
              }}
            >
              Accuracy:{" "}
              {totalNotes > 0
                ? Math.round((correctCount / totalNotes) * 100)
                : 0}
              %
            </div>
          </div>
        </div>
      )}

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

          <div className="hud-center">
            <img
              src={titleImage}
              alt="Zora's Beat Battle"
              className="title-image"
            />
          </div>

          <div className="hud-right">
            <div className="hud-progress">
              <div className="progress-track">
                {/* Green section for correct notes */}
                <div
                  className="progress-fill"
                  style={{
                    width: `${correctWidth}%`,
                    background: "#4caf50",
                    position: "absolute",
                    left: 0,
                    height: "100%",
                    borderRadius: correctWidth > 0 ? "8px 0 0 8px" : "0",
                  }}
                />
                {/* Red section for errors */}
                <div
                  style={{
                    width: `${errorWidth}%`,
                    background: "#f44336",
                    position: "absolute",
                    left: `${correctWidth}%`,
                    height: "100%",
                    borderRadius:
                      errorWidth > 0 && correctWidth + errorWidth >= 99
                        ? "0 8px 8px 0"
                        : "0",
                  }}
                />
                <span
                  className="progress-text"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    color: "#fff",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                  }}
                >
                  {notesPlayed}/{totalNotes}
                </span>
              </div>
            </div>
            <div className="hud-score-stacked">
              <img
                src={streetScoreImage}
                alt="Score"
                className="score-label-img"
              />
              <span className="score-value">{score}</span>
            </div>
          </div>
        </header>

        <section className="board">
          <div className="staff-panel">
            <MusicStaff
              exercise={song}
              noteStatuses={noteStatuses}
              startMeasure={startMeasure}
              measuresPerPage={MEASURES_PER_PAGE}
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
            <button
              className="image-button back-button"
              onClick={handleRestart}
            >
              <img src={backButtonImage} alt="Restart Song" />
            </button>

            <div className="level-info-container">
              <div className="level-nav" style={{ gap: "8px" }}>
                <div className="level-name-display">{song.title}</div>
              </div>
              <div className="exercise-meta-display">
                <span>Grand Staff</span>
                <span>•</span>
                <span>
                  Page {currentPage + 1}/{totalPages} • Measures{" "}
                  {startMeasure + 1}-
                  {Math.min(
                    startMeasure + MEASURES_PER_PAGE,
                    song.measures.length,
                  )}
                </span>
              </div>
            </div>

            <button
              className="image-button drop-button"
              onClick={handleDropTheBeat}
              style={{ filter: isRecording ? "hue-rotate(90deg)" : "none" }}
            >
              <img
                src={dropTheBeatImage}
                alt={isRecording ? "Stop Recording" : "Start Recording"}
              />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
