export type Clef = "treble" | "bass";

export interface Note {
  keys: string[]; // e.g. ["c/4"]
  duration: string; // e.g. "q", "h", "w"
  fingers?: string[]; // e.g. ["1"], ["1", "3"]
  text?: string; // Lyrics or annotations below the note
  clef?: Clef; // Explicit clef for grand staff support
}

export type Measure = Note[];

export interface Exercise {
  id: string;
  title: string;
  clef: Clef;
  measures: Measure[];
  timeSignature?: string;
  layout?: "single" | "grand";
  hasPickupMeasure?: boolean;
}
