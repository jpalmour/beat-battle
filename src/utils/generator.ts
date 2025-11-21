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

    // 1. Select a 5-note window within the config range
    const minIdx = PITCHES.indexOf(config.range.min);
    const maxIdx = PITCHES.indexOf(config.range.max);

    // Ensure we have at least 5 notes if possible, otherwise use what we have
    const availableRange = maxIdx - minIdx + 1;
    const windowSize = 5;

    let windowStart = minIdx;
    if (availableRange > windowSize) {
        // Pick a random start index such that window fits in range
        // maxStart = maxIdx - windowSize + 1
        const maxStart = maxIdx - windowSize + 1;
        windowStart = Math.floor(Math.random() * (maxStart - minIdx + 1)) + minIdx;
    }
    const windowEnd = Math.min(windowStart + windowSize - 1, maxIdx);

    // 2. Generate notes within this window
    let currentPitchIndex = getRandomStartIndex(PITCHES[windowStart], PITCHES[windowEnd]);

    // Determine global direction for Level 2/8 if needed
    let forcedDirection: 'up' | 'down' | null = null;
    if (config.motion === 'unidirectional') {
        forcedDirection = Math.random() > 0.5 ? 'up' : 'down';
        // Adjust start index to allow room for movement
        if (forcedDirection === 'up') {
            currentPitchIndex = Math.max(windowStart, Math.min(currentPitchIndex, windowEnd - 3));
        } else {
            currentPitchIndex = Math.min(windowEnd, Math.max(currentPitchIndex, windowStart + 3));
        }
    }

    const usedPitchIndices = new Set<number>();

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

                // Boundary check: use WINDOW indices
                if (potentialIndex < windowStart || potentialIndex > windowEnd) {
                    if (forcedDirection) {
                        potentialIndex = currentPitchIndex; // If forced, just repeat the note
                    } else {
                        potentialIndex = currentPitchIndex - (stepSize * direction); // Reverse direction
                    }
                }

                // Double check bounds after reverse
                if (potentialIndex >= windowStart && potentialIndex <= windowEnd) {
                    nextPitchIndex = potentialIndex;
                } else {
                    nextPitchIndex = currentPitchIndex; // Fallback to repeat
                }
            }

            currentPitchIndex = nextPitchIndex;
            usedPitchIndices.add(currentPitchIndex);

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
                    // AND fits within the 5-note window constraint
                    if (chordNoteIndex >= windowStart && chordNoteIndex <= windowEnd) {
                        keys.push(PITCHES[chordNoteIndex]);
                        usedPitchIndices.add(chordNoteIndex);
                        // Sort keys for VexFlow (bottom to top)
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
                fingers: undefined // Will calculate later
            };

            measure.push(note);
            beatsRemaining -= RHYTHM_VALUES[duration];
        }
        measures.push(measure);
    }

    // 3. Calculate Optimal Hand Position
    // Find all valid positions (Thumb Index) that cover all usedPitchIndices
    // A position P covers index I if:
    // Treble (Thumb=Bottom): P <= I <= P + 4
    // Bass (Thumb=Top): P - 4 <= I <= P

    const usedIndices = Array.from(usedPitchIndices);
    const minUsed = Math.min(...usedIndices);
    const maxUsed = Math.max(...usedIndices);

    let bestThumbIndex = -1;

    if (config.clef === 'treble') {
        // Valid Thumb P: maxUsed - 4 <= P <= minUsed
        // We want HIGHEST P (Thumb as high as possible)
        const possibleStart = Math.max(0, maxUsed - 4);
        const possibleEnd = minUsed;

        // Iterate downwards from possibleEnd to find highest valid P
        for (let p = possibleEnd; p >= possibleStart; p--) {
            bestThumbIndex = p;
            break; // Found highest
        }
    } else {
        // Bass (Thumb=Top)
        // Valid Thumb P: minUsed + 4 >= P >= maxUsed
        // We want LOWEST P (Thumb as low as possible)
        const possibleStart = maxUsed;
        const possibleEnd = Math.min(PITCHES.length - 1, minUsed + 4);

        // Iterate upwards from possibleStart to find lowest valid P
        for (let p = possibleStart; p <= possibleEnd; p++) {
            bestThumbIndex = p;
            break; // Found lowest
        }
    }

    // 4. Assign Fingers
    // Treble: Finger = NoteIdx - ThumbIdx + 1
    // Bass: Finger = ThumbIdx - NoteIdx + 1

    // Helper to get finger
    const getFinger = (noteIdx: number) => {
        if (bestThumbIndex === -1) return undefined;
        if (config.clef === 'treble') {
            return (noteIdx - bestThumbIndex + 1).toString();
        } else {
            return (bestThumbIndex - noteIdx + 1).toString();
        }
    };

    // Apply to first note and first chord
    let chordHintAdded = false;
    measures.forEach((m, mIdx) => {
        m.forEach((n, nIdx) => {
            // First note of exercise
            if (mIdx === 0 && nIdx === 0) {
                n.fingers = n.keys.map(k => getFinger(PITCHES.indexOf(k))).filter((f): f is string => !!f);
            }
            // First chord
            else if (n.keys.length > 1 && !chordHintAdded) {
                n.fingers = n.keys.map(k => getFinger(PITCHES.indexOf(k))).filter((f): f is string => !!f);
                chordHintAdded = true;
            }
        });
    });

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
