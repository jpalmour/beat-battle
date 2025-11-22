import { useState } from 'react'
import './App.css'
import MusicStaff from './components/MusicStaff'
import { RecordingLight } from './components/RecordingLight'
import { useNoteDetection } from './hooks/useNoteDetection'
import { useExerciseEngine } from './hooks/useExerciseEngine'

import { levels } from './data/levels'
import { generateExercise } from './utils/generator'
import type { Exercise } from './types/music'

import titleImage from './assets/TitleText-ZorasBeatBattle-Bordered-Transparent.png'
import scoreLabelImage from './assets/street-score-transparent.png'
import dropButtonImage from './assets/drop-the-beat-button-transparent.png'
import backButtonImage from './assets/step-back-button-transparent.png'

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  const [currentExercise, setCurrentExercise] = useState<Exercise>(() =>
    generateExercise(levels[0], 'init')
  )
  const [exerciseCount, setExerciseCount] = useState(1)
  const [score, setScore] = useState(0)
  const [progressCount, setProgressCount] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)

  // Audio & Game Engine
  // Note detection starts on first interaction
  const [audioEnabled, setAudioEnabled] = useState(false)
  const { note: detectedNote, error: audioError } = useNoteDetection(audioEnabled)
  const [isRecording, setIsRecording] = useState(false)

  // Unlock audio on first interaction
  const handleInteraction = () => {
    if (!audioEnabled) {
      setAudioEnabled(true)
    }
  }

  const handleExerciseComplete = () => {
    // 1. Update Score & Progress
    setScore(prev => prev + 500)
    const newProgress = progressCount + 1
    setProgressCount(newProgress)

    // 2. Check for Level Completion
    if (newProgress >= 5) {
      // Level Complete!
      setShowLevelUp(true)
      setTimeout(() => {
        // Advance to next level
        const nextLevelIdx = (currentLevelIndex + 1) % levels.length
        setCurrentLevelIndex(nextLevelIdx)

        // Reset for new level
        setProgressCount(0)
        setExerciseCount(1)
        setShowLevelUp(false)

        // Generate first exercise of new level
        const nextExercise = generateExercise(levels[nextLevelIdx], `ex-${Date.now()}`)
        setCurrentExercise(nextExercise)
      }, 3000) // 3s celebration
    } else {
      // Just next exercise
      handleNextExercise()
    }
  }

  const { noteStatuses, feedback, debug } = useExerciseEngine({
    exercise: currentExercise,
    detectedNote,
    isRecording,
    onComplete: handleExerciseComplete
  })

  // Check for debug mode
  const showDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

  const progressValue = Math.min((progressCount / 5) * 100, 100)

  const handleNextExercise = () => {
    const nextExercise = generateExercise(levels[currentLevelIndex], `ex-${Date.now()}`)
    setCurrentExercise(nextExercise)
    setExerciseCount(prev => prev + 1)
  }

  const handleLevelSelect = (index: number) => {
    setCurrentLevelIndex(index)
    const nextExercise = generateExercise(levels[index], `ex-${Date.now()}`)
    setCurrentExercise(nextExercise)
    setExerciseCount(1)
    setProgressCount(0) // Reset progress on manual level switch
  }

  const handleDropTheBeat = () => {
    setIsRecording(!isRecording)
  }

  return (
    <div className="app-shell" onClick={handleInteraction} onKeyDown={handleInteraction}>
      <div className="portrait-lock">
        <div className="lock-content">
          <span className="rotate-icon">↻</span>
          <h2>Rotate Your Device</h2>
          <p>This game is best played in landscape mode!</p>
        </div>
      </div>
      <div className="graffiti-overlay" />
      {showLevelUp && (
        <div className="celebration-overlay">
          <h1 className="level-up-text">LEVEL UP!</h1>
          <div className="confetti">🎉 🎹 🚀</div>
        </div>
      )}

      {/* DEBUG OVERLAY */}
      {showDebug && (
        <div style={{ position: 'fixed', top: 10, left: 10, background: 'rgba(0,0,0,0.8)', color: 'lime', padding: '10px', zIndex: 9999, fontFamily: 'monospace', fontSize: '12px', pointerEvents: 'none' }}>
          <div>DETECTED: {detectedNote?.note || '--'}</div>
          <div>TARGET: {debug.targetKey}</div>
          <div>STABLE: {debug.stableNote || '--'}</div>
          <div>LOCKED: {debug.lockedNote || '--'}</div>
          <div>WAITING: {debug.isWaitingForRelease ? 'YES' : 'NO'}</div>
          <div>REC: {isRecording ? 'ON' : 'OFF'}</div>
        </div>
      )}

      <main className="battle-stage">
        <header className="hud">
          {/* Score (Left) */}
          <div className="hud-score">
            <RecordingLight isRecording={isRecording} />
            <div className="hud-note-display" style={{ fontSize: audioError ? '1rem' : '2.5rem', color: audioError ? 'red' : '#00ffff' }}>
              {audioError ? 'MIC ERROR' : (detectedNote ? detectedNote.note : '--')}
            </div>
            <img src={scoreLabelImage} alt="Street Score" className="score-label-img" />
            <span className="score-value">{score}</span>
          </div>

          {/* Title (Center) */}
          <div className="hud-title">
            <img src={titleImage} alt="Zora's Beat Battle" className="title-image" />
          </div>

          {/* Progress (Right) */}
          <div className="hud-progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressValue}%` }}>
                <span className="progress-text">{progressValue}%</span>
              </div>
            </div>
          </div>
        </header>

        <section className="board">
          <div className="staff-panel">
            <MusicStaff exercise={currentExercise} noteStatuses={noteStatuses} />
            {feedback === 'error' && <div style={{ position: 'absolute', top: 0, right: 0, color: 'red', fontSize: '2em' }}>❌</div>}
            {feedback === 'correct' && <div style={{ position: 'absolute', top: 0, right: 0, color: 'green', fontSize: '2em' }}>✅</div>}
          </div>

          <div className="board-footer">
            {/* Left: Back Button */}
            <button className="image-button back-button" onClick={() => handleLevelSelect(Math.max(currentLevelIndex - 1, 0))}>
              <img src={backButtonImage} alt="Back" />
            </button>

            {/* Center: Level Nav & Info */}
            <div className="level-info-container">
              <div className="level-nav">
                <button
                  className="nav-arrow"
                  onClick={() => handleLevelSelect((currentLevelIndex - 1 + levels.length) % levels.length)}
                >
                  &lt;
                </button>
                <div className="level-name-display">{levels[currentLevelIndex].name}</div>
                <button
                  className="nav-arrow"
                  onClick={() => handleLevelSelect((currentLevelIndex + 1) % levels.length)}
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
              style={{ filter: isRecording ? 'hue-rotate(90deg)' : 'none' }}
            >
              <img src={dropButtonImage} alt={isRecording ? "Stop Recording" : "Start Recording"} />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
