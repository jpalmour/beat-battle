import type { LevelConfig } from '../data/levels';

interface LevelSelectorProps {
    levels: LevelConfig[];
    currentLevelIndex: number;
    onSelectLevel: (index: number) => void;
}

export default function LevelSelector({ levels, currentLevelIndex, onSelectLevel }: LevelSelectorProps) {
    return (
        <div className="level-selector">
            <h3 className="selector-title">Select Level:</h3>
            <div className="level-buttons">
                {levels.map((level, index) => (
                    <button
                        key={level.id}
                        onClick={() => onSelectLevel(index)}
                        className={`level-button ${index === currentLevelIndex ? 'active' : ''}`}
                        title={level.description}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}
