export interface LevelConfig {
    id: string;
    title: string;
    description: string;
    clef: 'treble' | 'bass';
    range: { min: string; max: string }; // e.g. 'c/4', 'f/5'
    intervals: ('repeat' | 'step' | 'skip')[]; // Allowed intervals
    motion: 'any' | 'unidirectional' | 'mixed'; // Constraint for Level 2
    rhythms: ('w' | 'h' | 'q')[]; // Allowed note durations
    harmonicIntervals?: ('2nd' | '3rd' | '4th' | '5th')[]; // Allowed harmonic intervals (chords)
}

export const levels: LevelConfig[] = [
    {
        id: 'level1',
        title: 'Level 1: Rhythm & Repeats',
        description: 'Focus on rhythm with repeated notes.',
        clef: 'treble',
        range: { min: 'c/4', max: 'f/5' },
        intervals: ['repeat'],
        motion: 'any',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level2',
        title: 'Level 2: Steps (One Way)',
        description: 'Steps going only up or only down.',
        clef: 'treble',
        range: { min: 'c/4', max: 'f/5' },
        intervals: ['step', 'repeat'],
        motion: 'unidirectional',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level3',
        title: 'Level 3: Steps (Mixed)',
        description: 'Steps going up and down freely.',
        clef: 'treble',
        range: { min: 'c/4', max: 'f/5' },
        intervals: ['step', 'repeat'],
        motion: 'mixed',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level4',
        title: 'Level 4: Skips',
        description: 'Adding skips (3rds) to the mix.',
        clef: 'treble',
        range: { min: 'c/4', max: 'f/5' },
        intervals: ['skip', 'repeat'],
        motion: 'any',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level5',
        title: 'Level 5: Mixed Intervals',
        description: 'Steps, skips, and repeats combined.',
        clef: 'treble',
        range: { min: 'c/4', max: 'f/5' },
        intervals: ['step', 'skip', 'repeat'],
        motion: 'any',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level6',
        title: 'Level 6: Chords (Treble)',
        description: 'Introducing harmonic intervals (2 notes).',
        clef: 'treble',
        range: { min: 'c/4', max: 'f/5' },
        intervals: ['repeat'], // Base melody is simple repeats to focus on chords? Or mixed? User said "same as 1" (repeats)
        motion: 'any',
        rhythms: ['w', 'h', 'q'],
        harmonicIntervals: ['2nd', '3rd', '4th', '5th']
    },
    // Bass Clef Levels
    {
        id: 'level7',
        title: 'Level 7: Bass Clef Repeats',
        description: 'Left hand rhythm and repeats.',
        clef: 'bass',
        range: { min: 'g/2', max: 'c/4' },
        intervals: ['repeat'],
        motion: 'any',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level8',
        title: 'Level 8: Bass Steps (One Way)',
        description: 'Bass clef steps going up or down.',
        clef: 'bass',
        range: { min: 'g/2', max: 'c/4' },
        intervals: ['step', 'repeat'],
        motion: 'unidirectional',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level9',
        title: 'Level 9: Bass Steps (Mixed)',
        description: 'Bass clef steps moving freely.',
        clef: 'bass',
        range: { min: 'g/2', max: 'c/4' },
        intervals: ['step', 'repeat'],
        motion: 'mixed',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level10',
        title: 'Level 10: Bass Skips',
        description: 'Bass clef skips (3rds).',
        clef: 'bass',
        range: { min: 'g/2', max: 'c/4' },
        intervals: ['skip', 'repeat'],
        motion: 'any',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level11',
        title: 'Level 11: Bass Mixed',
        description: 'Bass clef steps, skips, and repeats.',
        clef: 'bass',
        range: { min: 'g/2', max: 'c/4' },
        intervals: ['step', 'skip', 'repeat'],
        motion: 'any',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level12',
        title: 'Level 12: Bass Chords',
        description: 'Bass clef harmonic intervals.',
        clef: 'bass',
        range: { min: 'g/2', max: 'c/4' },
        intervals: ['repeat'],
        motion: 'any',
        rhythms: ['w', 'h', 'q'],
        harmonicIntervals: ['2nd', '3rd', '4th', '5th']
    }
];
