import { useState } from 'react'
import './App.css'
import MusicStaff from './components/MusicStaff'

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

  return (
    <div className="app-shell">
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
      <main className="battle-stage">
        <header className="hud">
          {/* Score (Left) */}
          <div className="hud-score">
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
            <MusicStaff exercise={currentExercise} />
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

            {/* Right: Drop Button */}
            <button className="image-button drop-button" onClick={handleDropTheBeat}>
              <img src={dropButtonImage} alt="Drop the Beat" />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
