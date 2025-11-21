export interface LevelConfig {
    id: string;
    title: string;
    description: string;
    clef: 'treble' | 'bass';
    range: { min: string; max: string }; // e.g. 'c/4', 'f/5'
    intervals: ('repeat' | 'step' | 'skip')[]; // Allowed intervals
    motion: 'any' | 'unidirectional' | 'mixed'; // Constraint for Level 2
    rhythms: ('w' | 'h' | 'q')[]; // Allowed note durations
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
        motion: 'unidirectional', // Special logic: pick a direction and stick to it per measure/phrase
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
        intervals: ['skip', 'repeat'], // User said "skips and repeats only" for #4
        motion: 'any',
        rhythms: ['w', 'h', 'q']
    }
];
