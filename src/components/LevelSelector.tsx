import type { LevelConfig } from '../data/levels'

interface LevelSelectorProps {
    levels: LevelConfig[]
    currentLevelIndex: number
    onSelectLevel: (index: number) => void
}

export default function LevelSelector({ levels, currentLevelIndex, onSelectLevel }: LevelSelectorProps) {
    return (
        <div className="level-selector">
            <div className="level-pills" role="tablist" aria-label="Select level">
                {levels.map((level, index) => (
                    <button
                        key={level.id}
                        onClick={() => onSelectLevel(index)}
                        className={`level-pill ${index === currentLevelIndex ? 'active' : ''}`}
                        title={level.description}
                        role="tab"
                        aria-selected={index === currentLevelIndex}
                    >
                        <span className="pill-number">{index + 1}</span>
                        <span className="pill-name">{level.shortLabel ?? level.title}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
