export interface Note {
    keys: string[]; // e.g. ["c/4"]
    duration: string; // e.g. "q", "h", "w"
    fingers?: string[]; // e.g. ["1"], ["1", "3"]
    text?: string; // Lyrics or annotations below the note
}

export type Measure = Note[];

export interface Exercise {
    id: string;
    title: string;
    clef: 'treble' | 'bass';
    measures: Measure[]; // Should be exactly 4 for now
}
