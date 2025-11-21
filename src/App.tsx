import { useState } from 'react'
import './App.css'
import MusicStaff from './components/MusicStaff'
import LevelSelector from './components/LevelSelector'
import { levels } from './data/levels'
import { generateExercise } from './utils/generator'
import type { Exercise } from './types/music'

function App() {
  const [started, setStarted] = useState(false)
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  // Initialize with a generated exercise
  const [currentExercise, setCurrentExercise] = useState<Exercise>(() =>
    generateExercise(levels[0], 'init')
  )
  const [exerciseCount, setExerciseCount] = useState(1)

  const handleNext = () => {
    const nextExercise = generateExercise(levels[currentLevelIndex], `ex-${Date.now()}`)
    setCurrentExercise(nextExercise)
    setExerciseCount(prev => prev + 1)
  }

  const handleLevelSelect = (index: number) => {
    setCurrentLevelIndex(index)
    // Generate new exercise for the new level immediately
    const nextExercise = generateExercise(levels[index], `ex-${Date.now()}`)
    setCurrentExercise(nextExercise)
    setExerciseCount(1) // Reset count for new level
  }

  const handleBack = () => {
    setStarted(false)
    // Optional: Reset level or keep it? Let's keep it.
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            Zora's Piano Adventure
          </h1>
          <p className="app-subtitle">
            Ready to play? 🎵🎹✨
          </p>
        </div>
      </header>

      <main className="main-stage">
        {!started ? (
          <div className="welcome-card glass-panel">
            <button
              onClick={() => setStarted(true)}
              className="primary-button"
            >
              Let's Go! 🚀
            </button>
          </div>
        ) : (
          <div className="game-area glass-panel">
            <LevelSelector
              levels={levels}
              currentLevelIndex={currentLevelIndex}
              onSelectLevel={handleLevelSelect}
            />

            <div className="level-header">
              <span className="level-badge">{levels[currentLevelIndex].title}</span>
              <h2>{currentExercise.title}</h2>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                Exercise #{exerciseCount}
              </p>
            </div>

            <div className="staff-wrapper">
              <MusicStaff exercise={currentExercise} />
            </div>

            <div className="controls">
              <button
                onClick={handleBack}
                className="secondary-button"
              >
                Back
              </button>

              <button
                onClick={handleNext}
                className="primary-button"
              >
                Next Song ➡️
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
