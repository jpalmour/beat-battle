import type { Exercise, Measure, Note } from '../types/music';
import type { LevelConfig } from '../data/levels';

// Simple note map for pitch calculations (C4 to A5 covers our needs)
const PITCHES = [
    'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4',
    'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5'
];

const RHYTHM_VALUES: Record<string, number> = {
    'w': 4,
    'h': 2,
    'q': 1,
    'hd': 3 // Dotted half, if we use it
};

export function generateExercise(config: LevelConfig, exerciseId: string): Exercise {
    const measures: Measure[] = [];
    let currentPitchIndex = getRandomStartIndex(config.range.min, config.range.max);

    // Determine global direction for Level 2 if needed (or per measure?)
    // User said "steps up only or down only" for the piece. 
    // Let's pick a direction for the whole exercise for Level 2.
    let forcedDirection: 'up' | 'down' | null = null;
    if (config.motion === 'unidirectional') {
        forcedDirection = Math.random() > 0.5 ? 'up' : 'down';
        // Adjust start index to allow room for movement
        if (forcedDirection === 'up') {
            currentPitchIndex = Math.max(0, Math.min(currentPitchIndex, PITCHES.length - 5));
        } else {
            currentPitchIndex = Math.min(PITCHES.length - 1, Math.max(currentPitchIndex, 4));
        }
    }

    const minIdx = PITCHES.indexOf(config.range.min);
    const maxIdx = PITCHES.indexOf(config.range.max);

    for (let m = 0; m < 4; m++) {
        const measure: Note[] = [];
        let beatsRemaining = 4;

        while (beatsRemaining > 0) {
            // Pick a rhythm that fits
            const validRhythms = config.rhythms.filter(r => RHYTHM_VALUES[r] <= beatsRemaining);
            const duration = validRhythms[Math.floor(Math.random() * validRhythms.length)];

            // Determine next pitch
            let nextPitchIndex = currentPitchIndex;

            // First note of first measure is just the start pitch
            if (measures.length === 0 && measure.length === 0) {
                nextPitchIndex = currentPitchIndex;
            } else {
                // Apply interval rules
                const intervalType = config.intervals[Math.floor(Math.random() * config.intervals.length)];

                let direction = 0;
                if (intervalType !== 'repeat') {
                    if (forcedDirection) {
                        direction = forcedDirection === 'up' ? 1 : -1;
                    } else {
                        direction = Math.random() > 0.5 ? 1 : -1;
                    }
                }

                let stepSize = 0;
                if (intervalType === 'step') stepSize = 1;
                if (intervalType === 'skip') stepSize = 2;

                let potentialIndex = currentPitchIndex + (stepSize * direction);

                // Boundary check: use config range indices
                if (potentialIndex < minIdx || potentialIndex > maxIdx) {
                    if (forcedDirection) {
                        // If we hit a wall in forced direction, clamp or repeat
                        potentialIndex = currentPitchIndex;
                    } else {
                        // Reverse
                        potentialIndex = currentPitchIndex - (stepSize * direction);
                    }
                }

                // Double check bounds after reverse
                if (potentialIndex >= minIdx && potentialIndex <= maxIdx) {
                    nextPitchIndex = potentialIndex;
                } else {
                    nextPitchIndex = currentPitchIndex; // Fallback to repeat
                }
            }

            currentPitchIndex = nextPitchIndex;

            // Add note
            const note: Note = {
                keys: [PITCHES[currentPitchIndex]],
                duration: duration,
                // Add finger hint only on very first note of exercise
                finger: (measures.length === 0 && measure.length === 0) ? getFingerHint(PITCHES[currentPitchIndex]) : undefined
            };

            measure.push(note);
            beatsRemaining -= RHYTHM_VALUES[duration];
        }
        measures.push(measure);
    }

    return {
        id: exerciseId,
        title: `${config.title} #${Math.floor(Math.random() * 1000)}`,
        clef: config.clef,
        measures: measures
    };
}

function getRandomStartIndex(min: string, max: string): number {
    const minIdx = PITCHES.indexOf(min);
    const maxIdx = PITCHES.indexOf(max);
    if (minIdx === -1 || maxIdx === -1) return 0; // Fallback
    return Math.floor(Math.random() * (maxIdx - minIdx + 1)) + minIdx;
}

// Simple heuristic for finger hints (assuming RH C position for simplicity for now)
function getFingerHint(pitch: string): string | undefined {
    // This is tricky without knowing hand position. 
    // For Level 1/2 usually Middle C position.
    const map: Record<string, string> = {
        'c/4': '1', 'd/4': '2', 'e/4': '3', 'f/4': '4', 'g/4': '5'
    };
    return map[pitch];
}
