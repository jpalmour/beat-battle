import type { Exercise, Measure, Note } from '../types/music';
import type { LevelConfig } from '../data/levels';

// Simple note map for pitch calculations (G2 to F5 covers Bass and Treble needs)
const PITCHES = [
    'g/2', 'a/2', 'b/2',
    'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3',
    'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4',
    'c/5', 'd/5', 'e/5', 'f/5'
];

const RHYTHM_VALUES: Record<string, number> = {
    'w': 4,
    'h': 2,
    'q': 1,
    'hd': 3
};

export function generateExercise(config: LevelConfig, exerciseId: string): Exercise {
    const measures: Measure[] = [];
    let currentPitchIndex = getRandomStartIndex(config.range.min, config.range.max);

    // Determine global direction for Level 2/8 if needed
    let forcedDirection: 'up' | 'down' | null = null;
    if (config.motion === 'unidirectional') {
        forcedDirection = Math.random() > 0.5 ? 'up' : 'down';
        // Adjust start index to allow room for movement
        if (forcedDirection === 'up') {
            currentPitchIndex = Math.max(PITCHES.indexOf(config.range.min), Math.min(currentPitchIndex, PITCHES.indexOf(config.range.max) - 4));
        } else {
            currentPitchIndex = Math.min(PITCHES.indexOf(config.range.max), Math.max(currentPitchIndex, PITCHES.indexOf(config.range.min) + 4));
        }
    }

    const minIdx = PITCHES.indexOf(config.range.min);
    const maxIdx = PITCHES.indexOf(config.range.max);

    for (let m = 0; m < 4; m++) {
        const measure: Note[] = [];
        let beatsRemaining = 4;
        let hasChordInMeasure = false;

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
                        potentialIndex = currentPitchIndex;
                    } else {
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

            // Handle Harmonic Intervals (Chords)
            let keys = [PITCHES[currentPitchIndex]];
            if (config.harmonicIntervals && !hasChordInMeasure && beatsRemaining > 0) {
                // 50% chance to make a chord if allowed and haven't yet in this bar
                if (Math.random() > 0.5) {
                    const intervalName = config.harmonicIntervals[Math.floor(Math.random() * config.harmonicIntervals.length)];
                    let intervalSize = 0;
                    switch (intervalName) {
                        case '2nd': intervalSize = 1; break;
                        case '3rd': intervalSize = 2; break;
                        case '4th': intervalSize = 3; break;
                        case '5th': intervalSize = 4; break;
                    }

                    // Thumb Anchor Logic
                    // Treble: Thumb (Anchor) is bottom -> Add note ABOVE
                    // Bass: Thumb (Anchor) is top -> Add note BELOW
                    let chordNoteIndex = -1;
                    if (config.clef === 'treble') {
                        chordNoteIndex = currentPitchIndex + intervalSize;
                    } else {
                        chordNoteIndex = currentPitchIndex - intervalSize;
                    }

                    // Check if chord note is valid (exists in PITCHES)
                    // We don't strictly enforce range min/max for the *added* note, 
                    // but it must be a valid pitch to render.
                    if (chordNoteIndex >= 0 && chordNoteIndex < PITCHES.length) {
                        keys.push(PITCHES[chordNoteIndex]);
                        // Sort keys for VexFlow (bottom to top)
                        // PITCHES is ordered low to high, so indices determine order
                        if (chordNoteIndex < currentPitchIndex) {
                            keys = [PITCHES[chordNoteIndex], PITCHES[currentPitchIndex]];
                        } else {
                            keys = [PITCHES[currentPitchIndex], PITCHES[chordNoteIndex]];
                        }
                        hasChordInMeasure = true;
                    }
                }
            }

            // Add note
            const note: Note = {
                keys: keys,
                duration: duration,
                fingers: undefined
            };

            // Logic for Finger Hints
            // 1. Always on the very first note of the exercise
            if (measures.length === 0 && measure.length === 0) {
                note.fingers = keys.map(k => getFingerHint(k, config.clef)).filter((f): f is string => !!f);
            }
            // 2. On the first chord (harmonic interval) of the exercise
            else if (keys.length > 1 && !hasChordInMeasure) {
                // We need a global flag for "first chord shown", but for now let's just do it per measure or check if we've seen one?
                // The prompt asks for "first stacked interval that appears in an exercise".
                // We need to track this outside the loop.
                // Let's add a `hasShownChordHint` variable to the outer scope.
            }

            measure.push(note);
            beatsRemaining -= RHYTHM_VALUES[duration];
        }
        measures.push(measure);
    }

    // Post-processing to add chord hint to the FIRST chord found
    let chordHintAdded = false;
    for (const m of measures) {
        for (const n of m) {
            if (n.keys.length > 1 && !chordHintAdded) {
                n.fingers = n.keys.map(k => getFingerHint(k, config.clef)).filter((f): f is string => !!f);
                chordHintAdded = true;
            }
        }
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

// Heuristic for finger hints
function getFingerHint(pitch: string, clef: 'treble' | 'bass'): string | undefined {
    // Treble (RH): C4=1, D4=2, E4=3, F4=4, G4=5
    // Bass (LH): C4=1, B3=2, A3=3, G3=4, F3=5 (Middle C position)
    // Or G-position: G2=5, A2=4, B2=3, C3=2, D3=1

    // Let's try to cover a reasonable range for the levels we have.

    if (clef === 'treble') {
        const map: Record<string, string> = {
            'c/4': '1', 'd/4': '2', 'e/4': '3', 'f/4': '4', 'g/4': '5',
            'a/4': '1', 'b/4': '2', 'c/5': '3', 'd/5': '4', 'e/5': '5', 'f/5': '1' // Extended
        };
        return map[pitch];
    } else {
        // Bass Clef (Left Hand)
        // Middle C Position (common for early levels)
        const map: Record<string, string> = {
            'c/4': '1',
            'b/3': '2',
            'a/3': '3',
            'g/3': '4',
            'f/3': '5',
            'e/3': '1', // Shift?
            'd/3': '2',
            'c/3': '3',
            // Low G position
            'g/2': '5', 'a/2': '4', 'b/2': '3'
        };
        return map[pitch];
    }
}
