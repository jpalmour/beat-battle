import { useState } from 'react'
import './App.css'
import MusicStaff from './components/MusicStaff'
import LevelSelector from './components/LevelSelector'
import { levels } from './data/levels'
import { generateExercise } from './utils/generator'
import type { Exercise } from './types/music'

import titleImage from './assets/TitleText-ZorasBeatBattle-transparent.png'
import scoreLabelImage from './assets/street-score-transparent.png'
import dropButtonImage from './assets/drop-the-beat-button-transparent.png'

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
      <div className="graffiti-overlay" />
      {showLevelUp && (
        <div className="celebration-overlay">
          <h1 className="level-up-text">LEVEL UP!</h1>
          <div className="confetti">🎉 🎹 🚀</div>
        </div>
      )}
      <main className="battle-stage">
        <header className="hud">
          <div className="hud-left">
            <span className="spray-label">Levels</span>
            <LevelSelector
              levels={levels}
              currentLevelIndex={currentLevelIndex}
              onSelectLevel={handleLevelSelect}
            />
          </div>

          <div className="hud-title">
            <img src={titleImage} alt="Zora's Beat Battle" className="title-image" />
            <h1 className="headline">Block {currentLevelIndex + 1}</h1>
          </div>

          <div className="score-card">
            <div className="score-header">
              <img src={scoreLabelImage} alt="Street Score" className="score-label-img" />
              <span className="score-value">{score}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressValue}%` }}>
                <span className="progress-text">{progressValue}%</span>
              </div>
            </div>
          </div>
        </header>

        <section className="board">
          <div className="board-header">
            <div className="header-left">
              <div className="block-label">Beat Pattern</div>
            </div>
            <div className="level-name">
              {levels[currentLevelIndex].name}
            </div>
            <div className="exercise-meta">
              <span className="meta-chip">Level {currentLevelIndex + 1}</span>
              <span className="meta-chip ghost">Exercise #{exerciseCount}</span>
            </div>
          </div>

          <div className="staff-panel">
            <MusicStaff exercise={currentExercise} />
          </div>

          <div className="board-footer">
            <div className="user-plate">
              <div className="graffiti-tag">Zora Beats</div>
              <div className="user-details">
                <span>User: Zora</span>
                <span>Combo: {score > 0 ? Math.floor(score / 500) : 0}x</span>
              </div>
            </div>

            <div className="controls">
              <button className="ghost-button" onClick={() => handleLevelSelect(Math.max(currentLevelIndex - 1, 0))}>
                Back
              </button>
              {/* Removed redundant Next Track button */}
              <button className="drop-button" onClick={handleDropTheBeat}>
                <img src={dropButtonImage} alt="Drop the Beat" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
