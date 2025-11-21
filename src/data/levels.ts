export interface LevelConfig {
    id: string
    title: string
    shortLabel?: string
    description: string
    clef: 'treble' | 'bass'
    range: { min: string; max: string }
    intervals: ('repeat' | 'step' | 'skip')[]
    motion: 'any' | 'unidirectional' | 'mixed'
    rhythms: ('w' | 'h' | 'q')[]
}

export const levels: LevelConfig[] = [
    {
        id: 'level1',
        title: 'Level 1: Rhythm & Repeats',
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
        title: 'Level 5: Skips & Steps',
        shortLabel: 'Block 5',
        description: 'Blend skips and steps with tighter bounds.',
        clef: 'treble',
        range: { min: 'd/4', max: 'g/5' },
        intervals: ['skip', 'step', 'repeat'],
        motion: 'mixed',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level6',
        title: 'Level 6: Bass Steps',
        shortLabel: 'Block 6',
        description: 'Switch to bass clef with smooth step motion.',
        clef: 'bass',
        range: { min: 'c/3', max: 'e/4' },
        intervals: ['step', 'repeat'],
        motion: 'mixed',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level7',
        title: 'Level 7: Bass Skips',
        shortLabel: 'Block 7',
        description: 'Bass clef with skips and repeats.',
        clef: 'bass',
        range: { min: 'c/3', max: 'g/4' },
        intervals: ['skip', 'repeat'],
        motion: 'any',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level8',
        title: 'Level 8: Mixed Clef Steps',
        shortLabel: 'Block 8',
        description: 'Treble clef with tighter range and steps.',
        clef: 'treble',
        range: { min: 'b/3', max: 'd/5' },
        intervals: ['step', 'repeat'],
        motion: 'mixed',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level9',
        title: 'Level 9: Bold Skips',
        shortLabel: 'Block 9',
        description: 'Push wider skips and direction changes.',
        clef: 'treble',
        range: { min: 'c/4', max: 'a/5' },
        intervals: ['skip', 'step', 'repeat'],
        motion: 'mixed',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level10',
        title: 'Level 10: Low Steps',
        shortLabel: 'Block 10',
        description: 'Stay grounded with low register steps.',
        clef: 'bass',
        range: { min: 'a/2', max: 'd/4' },
        intervals: ['step', 'repeat'],
        motion: 'mixed',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level11',
        title: 'Level 11: Pulse & Repeats',
        shortLabel: 'Block 11',
        description: 'Rhythmic repeats with tight motion.',
        clef: 'treble',
        range: { min: 'd/4', max: 'g/5' },
        intervals: ['repeat', 'step'],
        motion: 'unidirectional',
        rhythms: ['w', 'h', 'q']
    },
    {
        id: 'level12',
        title: 'Level 12: Freestyle Finale',
        shortLabel: 'Block 12',
        description: 'Full mix of steps, skips, and repeats.',
        clef: 'treble',
        range: { min: 'c/4', max: 'a/5' },
        intervals: ['repeat', 'step', 'skip'],
        motion: 'mixed',
        rhythms: ['w', 'h', 'q']
    }
]
