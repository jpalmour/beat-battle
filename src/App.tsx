import { useMemo, useState } from 'react'
import './App.css'
import MusicStaff from './components/MusicStaff'
import LevelSelector from './components/LevelSelector'
import { levels } from './data/levels'
import { generateExercise } from './utils/generator'
import type { Exercise } from './types/music'

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  const [currentExercise, setCurrentExercise] = useState<Exercise>(() =>
    generateExercise(levels[0], 'init')
  )
  const [exerciseCount, setExerciseCount] = useState(1)

  const streetScore = useMemo(() => 4850 + currentLevelIndex * 25, [currentLevelIndex])
  const progressValue = useMemo(() => Math.min(80 + currentLevelIndex * 2, 98), [currentLevelIndex])

  const handleNext = () => {
    const nextExercise = generateExercise(levels[currentLevelIndex], `ex-${Date.now()}`)
    setCurrentExercise(nextExercise)
    setExerciseCount(prev => prev + 1)
  }

  const handleLevelSelect = (index: number) => {
    setCurrentLevelIndex(index)
    const nextExercise = generateExercise(levels[index], `ex-${Date.now()}`)
    setCurrentExercise(nextExercise)
    setExerciseCount(1)
  }

  return (
    <div className="app-shell">
      <div className="graffiti-overlay" />
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
            <p className="eyebrow">Zora's Beat Battle</p>
            <h1 className="headline">Block {currentLevelIndex + 1}</h1>
          </div>

          <div className="score-card">
            <div className="score-header">
              <span className="score-label">Street Score</span>
              <span className="score-value">{streetScore}</span>
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
            <div>
              <p className="tagline">Zora's Beat Battle</p>
              <div className="block-label">Beat Pattern</div>
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
                <span>Combo: 12x</span>
              </div>
            </div>

            <div className="controls">
              <button className="ghost-button" onClick={() => handleLevelSelect(Math.max(currentLevelIndex - 1, 0))}>
                Back
              </button>
              <button className="ghost-button" onClick={handleNext}>
                Next Track
              </button>
              <button className="drop-button" onClick={handleNext}>
                Drop the Beat
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
