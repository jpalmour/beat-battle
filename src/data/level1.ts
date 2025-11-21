import type { Exercise } from '../types/music';

export const level1Exercises: Exercise[] = [
    {
        id: 'l1-ex1',
        title: 'Step by Step',
        clef: 'treble',
        measures: [
            [ // Bar 1
                { keys: ['c/4'], duration: 'q', fingers: ['1'] },
                { keys: ['d/4'], duration: 'q' },
                { keys: ['e/4'], duration: 'q' },
                { keys: ['f/4'], duration: 'q' },
            ],
            [ // Bar 2
                { keys: ['g/4'], duration: 'h' },
                { keys: ['f/4'], duration: 'h' },
            ],
            [ // Bar 3
                { keys: ['e/4'], duration: 'q' },
                { keys: ['d/4'], duration: 'q' },
                { keys: ['c/4'], duration: 'h' },
            ],
            [ // Bar 4
                { keys: ['c/4'], duration: 'w', text: 'Done!' },
            ]
        ]
    },
    {
        id: 'l1-ex2',
        title: 'Walking Up and Down',
        clef: 'treble',
        measures: [
            [
                { keys: ['c/4'], duration: 'q', fingers: ['1'] },
                { keys: ['d/4'], duration: 'q' },
                { keys: ['e/4'], duration: 'h' },
            ],
            [
                { keys: ['f/4'], duration: 'q' },
                { keys: ['g/4'], duration: 'q' },
                { keys: ['f/4'], duration: 'h' },
            ],
            [
                { keys: ['e/4'], duration: 'q' },
                { keys: ['d/4'], duration: 'q' },
                { keys: ['c/4'], duration: 'h' },
            ],
            [
                { keys: ['c/4'], duration: 'w', text: 'Great!' },
            ]
        ]
    },
    {
        id: 'l1-ex3',
        title: 'Skipping Along',
        clef: 'treble',
        measures: [
            [
                { keys: ['c/4'], duration: 'q', fingers: ['1'] },
                { keys: ['e/4'], duration: 'q' },
                { keys: ['g/4'], duration: 'h' },
            ],
            [
                { keys: ['f/4'], duration: 'q' },
                { keys: ['d/4'], duration: 'q' },
                { keys: ['g/4'], duration: 'h' },
            ],
            [
                { keys: ['e/4'], duration: 'q' },
                { keys: ['c/4'], duration: 'q' },
                { keys: ['d/4'], duration: 'h' },
            ],
            [
                { keys: ['c/4'], duration: 'w', text: 'Yay!' },
            ]
        ]
    }
];
