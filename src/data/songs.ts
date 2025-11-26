import type { Exercise, Note } from "../types/music";

const pickClef = (key: string): "treble" | "bass" => {
  const [, octaveText] = key.split("/");
  const octave = Number.parseInt(octaveText || "4", 10);
  return octave < 4 ? "bass" : "treble";
};

const note = (key: string, duration: Note["duration"]): Note => ({
  keys: [key],
  duration,
  clef: pickClef(key),
});

const e = (key: string): Note => note(key, "8");
const q = (key: string): Note => note(key, "q");
const h = (key: string): Note => note(key, "h");
const dh = (key: string): Note => note(key, "hd");

export const happyBirthdaySong: Exercise = {
  id: "song-happy-birthday",
  title: "Happy Birthday",
  clef: "treble",
  layout: "grand",
  timeSignature: "3/4",
  measures: [
    [e("g/3"), e("g/3")],
    [q("a/3"), q("g/3"), q("c/4")],
    [h("b/3"), e("g/3"), e("g/3")],
    [q("a/3"), q("g/3"), q("d/4")],
    [h("c/4"), e("g/3"), e("g/3")],
    [q("g/4"), q("e/4"), q("c/4")],
    [q("b/3"), q("a/3"), e("f/4"), e("f/4")],
    [q("e/4"), q("c/4"), q("d/4")],
    [dh("c/4")],
  ],
};

export const songs: Record<string, Exercise> = {
  "happy-birthday": happyBirthdaySong,
};
