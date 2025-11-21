export interface LevelConfig {
    id: string;
    title: string;
    name: string; // Brief descriptive name
    shortLabel?: string;
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
        name: 'Fresh Start',
        shortLabel: 'Block 1',
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
        name: 'One Way Street',
        shortLabel: 'Block 2',
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
        name: 'City Steps',
        shortLabel: 'Block 3',
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
        name: 'Rooftop Hops',
        shortLabel: 'Block 4',
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
        name: 'Street Flow',
        shortLabel: 'Block 5',
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
        name: 'Treble Trouble',
        shortLabel: 'Block 6',
        description: 'Introducing harmonic intervals (2 notes).',
        clef: 'treble',
        range: { min: 'c/4', max: 'f/5' },
        intervals: ['repeat'],
        motion: 'any',
        rhythms: ['w', 'h', 'q'],
        harmonicIntervals: ['2nd', '3rd', '4th', '5th']
    },
    // Bass Clef Levels
    {
        id: 'level7',
        title: 'Level 7: Bass Clef Repeats',
        name: 'Low End Theory',
        shortLabel: 'Block 7',
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
        name: 'Basement Beats',
        shortLabel: 'Block 8',
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
        name: 'Subway Jam',
        shortLabel: 'Block 9',
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
        name: 'Underground Skip',
        shortLabel: 'Block 10',
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
        name: 'Concrete Jungle',
        shortLabel: 'Block 11',
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
        name: 'Heavy Hitters',
        shortLabel: 'Block 12',
        description: 'Bass clef harmonic intervals.',
        clef: 'bass',
        range: { min: 'g/2', max: 'c/4' },
        intervals: ['repeat'],
        motion: 'any',
        rhythms: ['w', 'h', 'q'],
        harmonicIntervals: ['2nd', '3rd', '4th', '5th']
    }
];
