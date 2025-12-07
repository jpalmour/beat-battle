import { useEffect, useRef } from "react";
import {
  Renderer,
  Stave,
  StaveNote,
  Formatter,
  Annotation,
  Voice,
  Accidental,
  BarlineType,
  StaveConnector,
  Beam,
  Dot,
} from "vexflow";
import type { Exercise, Note } from "../types/music";

import type { NoteStatus } from "../hooks/useExerciseEngine";

interface MusicStaffProps {
  exercise: Exercise;
  noteStatuses?: NoteStatus[];
  startMeasure?: number;
  measuresPerPage?: number;
}

const MusicStaff = ({
  exercise,
  noteStatuses = [],
  startMeasure = 0,
  measuresPerPage,
}: MusicStaffProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          renderStaff(
            container,
            exercise,
            noteStatuses,
            startMeasure,
            measuresPerPage,
          );
        }
      }
    });

    resizeObserver.observe(container);

    renderStaff(
      container,
      exercise,
      noteStatuses,
      startMeasure,
      measuresPerPage,
    );

    return () => {
      resizeObserver.disconnect();
    };
    // renderStaff depends on many musical properties and is intentionally kept outside dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise, noteStatuses, startMeasure, measuresPerPage]);

  const getNoteCountUpToMeasure = (
    measures: Exercise["measures"],
    endExclusive: number,
  ) => {
    return measures
      .slice(0, endExclusive)
      .reduce((total, measure) => total + measure.length, 0);
  };

  // Calculate beats for a duration string (e.g., "q" = 1, "8" = 0.5, "hd" = 3)
  const getDurationBeats = (duration: string): number => {
    const baseDuration = duration.replace(/d+$/, "");
    const dotCount = (duration.match(/d+$/) || [""])[0].length;
    let beats: number;
    switch (baseDuration) {
      case "w":
        beats = 4;
        break;
      case "h":
        beats = 2;
        break;
      case "q":
        beats = 1;
        break;
      case "8":
        beats = 0.5;
        break;
      case "16":
        beats = 0.25;
        break;
      default:
        beats = 1;
    }
    // Apply dots: each dot adds half the previous value
    let dotValue = beats / 2;
    for (let i = 0; i < dotCount; i++) {
      beats += dotValue;
      dotValue /= 2;
    }
    return beats;
  };

  // Calculate total beats in a measure
  const getMeasureBeats = (measure: Note[]): number => {
    return measure.reduce(
      (total, note) => total + getDurationBeats(note.duration),
      0,
    );
  };

  const getFullMeasureBeats = (
    beatsPerMeasure: number,
    beatValueNum: number,
  ) => {
    // Normalise to quarter-note beats to match getDurationBeats
    const beatValueRatio = 4 / (beatValueNum || 4);
    return beatsPerMeasure * beatValueRatio;
  };

  const shouldApplyPickupScaling = (
    measureBeats: number,
    fullMeasureBeats: number,
    measureIndex: number,
    hasPickupMeasure?: boolean,
  ) => {
    const allowsPickup = hasPickupMeasure ?? measureIndex === 0;
    return allowsPickup && measureBeats + 0.001 < fullMeasureBeats;
  };

  const renderStaff = (
    container: HTMLDivElement,
    exercise: Exercise,
    statuses: NoteStatus[],
    start: number,
    measuresPerPage?: number,
  ) => {
    container.innerHTML = "";

    // Logical dimensions for the VexFlow rendering
    // We use fixed logical dimensions to ensure the music always has standard proportionality.
    // The SVG will scale to fit the container while preserving this aspect ratio.
    const layout = exercise.layout ?? "single";
    const LOGICAL_HEIGHT = layout === "grand" ? 240 : 150;
    const LOGICAL_WIDTH = 800; // Wide enough for 4 measures

    // Extra left padding for grand staff to accommodate the brace
    const leftPadding = layout === "grand" ? 25 : 10;
    const rightPadding = 10;
    const availableWidth = LOGICAL_WIDTH - leftPadding - rightPadding;
    const measuresToRender = measuresPerPage
      ? exercise.measures.slice(start, start + measuresPerPage)
      : exercise.measures.slice(start);

    const [beats, beatValue] = (exercise.timeSignature ?? "4/4").split("/");
    const numBeats = Number.parseInt(beats) || 4;
    const beatValueNum = Number.parseInt(beatValue) || 4;
    const fullMeasureBeats = getFullMeasureBeats(numBeats, beatValueNum);
    const measureWidth = availableWidth / Math.max(1, measuresToRender.length);

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(LOGICAL_WIDTH, LOGICAL_HEIGHT);
    const context = renderer.getContext();
    context.setFont("Bangers", 12);
    context.setFillStyle("#f7f7f7");
    context.setStrokeStyle("#f7f7f7");

    // Set SVG to scale to container
    const svg = container.querySelector("svg");
    if (svg) {
      svg.setAttribute("viewBox", `0 0 ${LOGICAL_WIDTH} ${LOGICAL_HEIGHT}`);
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }

    const skippedNotes = getNoteCountUpToMeasure(exercise.measures, start);
    let globalNoteIndex = skippedNotes;

    let currentX = leftPadding;
    const trebleY = 10;
    const staffGap = 90;
    const bassY = trebleY + staffGap;

    const buildNote = (
      noteData: Note,
      clef: "treble" | "bass",
      status: NoteStatus,
    ) => {
      const dotMatch = noteData.duration.match(/d+$/);
      const dotCount = dotMatch ? dotMatch[0].length : 0;
      const baseDuration = noteData.duration.replace(/d+$/, "") || "q";

      let color = "#f7f7f7";
      if (status === "current") color = "#ffeb3b";
      else if (status === "correct") color = "#4caf50";
      else if (status === "error") color = "#f44336";

      const staveNote = new StaveNote({
        keys: noteData.keys,
        duration: baseDuration,
        clef,
      });

      for (let i = 0; i < dotCount; i++) {
        Dot.buildAndAttach([staveNote], { all: true });
      }

      if (dotCount > 0) {
        const dots = staveNote.getModifiersByType(Dot.CATEGORY) as Dot[];
        dots.forEach((dot) =>
          dot.setStyle({ fillStyle: color, strokeStyle: color }),
        );
      }

      staveNote.setStyle({ fillStyle: color, strokeStyle: color });
      staveNote.setLedgerLineStyle({ strokeStyle: color, lineWidth: 2 });

      noteData.keys.forEach((key, index) => {
        if (key.includes("#")) {
          staveNote.addModifier(new Accidental("#"), index);
        } else if (/[a-g]b\//.test(key)) {
          staveNote.addModifier(new Accidental("b"), index);
        }
      });

      if (noteData.fingers && noteData.fingers.length > 0) {
        for (let i = noteData.fingers.length - 1; i >= 0; i--) {
          const finger = noteData.fingers[i];
          staveNote.addModifier(
            new Annotation(finger)
              .setFont("Bangers", 16, "normal")
              .setVerticalJustification(Annotation.VerticalJustify.BOTTOM)
              .setStyle({ fillStyle: "#f2ff5d" }),
            i,
          );
        }
      }

      return staveNote;
    };

    const buildVoice = (notes: StaveNote[]) => {
      const voice = new Voice({
        numBeats,
        beatValue: beatValueNum,
      });
      voice.setMode(Voice.Mode.SOFT);
      voice.addTickables(notes);
      return voice;
    };

    measuresToRender.forEach((measure, index) => {
      if (layout === "grand") {
        const trebleStave = new Stave(currentX, trebleY, measureWidth);
        const bassStave = new Stave(currentX, bassY, measureWidth);

        if (index === 0) {
          trebleStave
            .addClef("treble")
            .addTimeSignature(exercise.timeSignature ?? "4/4");
          bassStave
            .addClef("bass")
            .addTimeSignature(exercise.timeSignature ?? "4/4");
        }

        if (start + index === exercise.measures.length - 1) {
          trebleStave.setEndBarType(BarlineType.END);
          bassStave.setEndBarType(BarlineType.END);
        }

        trebleStave.setContext(context).draw();
        bassStave.setContext(context).draw();

        // Only draw brace and left connector on the first measure of each line
        if (index === 0) {
          const brace = new StaveConnector(trebleStave, bassStave);
          brace.setType(StaveConnector.type.BRACE).setContext(context).draw();
          const leftLine = new StaveConnector(trebleStave, bassStave);
          leftLine
            .setType(StaveConnector.type.SINGLE_LEFT)
            .setContext(context)
            .draw();
        }

        // Build all notes in original measure order for unified x-positioning
        // This ensures sequential notes don't stack, even when spanning clefs
        const allNotes: StaveNote[] = [];
        const trebleNotes: StaveNote[] = [];
        const bassNotes: StaveNote[] = [];

        measure.forEach((noteData) => {
          const status = statuses[globalNoteIndex] || "pending";
          const noteClef = noteData.clef ?? "treble";
          const targetStave = noteClef === "bass" ? bassStave : trebleStave;
          const staveNote = buildNote(noteData, noteClef, status);
          staveNote.setStave(targetStave);

          allNotes.push(staveNote);
          if (noteClef === "bass") bassNotes.push(staveNote);
          else trebleNotes.push(staveNote);

          globalNoteIndex++;
        });

        // Generate beams per-clef to avoid cross-staff beaming
        const trebleBeams = trebleNotes.length
          ? Beam.generateBeams(trebleNotes)
          : [];
        const bassBeams = bassNotes.length ? Beam.generateBeams(bassNotes) : [];

        // Use a single unified voice for formatting - this ensures all notes
        // are positioned sequentially on a shared timeline, preventing stacking
        if (allNotes.length) {
          const unifiedVoice = buildVoice(allNotes);

          // Calculate proportional format width only when the measure is truly a pickup
          const measureBeats = getMeasureBeats(measure);
          const isPickup = shouldApplyPickupScaling(
            measureBeats,
            fullMeasureBeats,
            start + index,
            exercise.hasPickupMeasure,
          );
          const beatRatio = isPickup
            ? Math.max(
                measureBeats / (fullMeasureBeats || measureBeats || 1),
                0,
              )
            : 1;
          const baseFormatWidth = (measureWidth - 20) * beatRatio;

          const formatter = new Formatter();
          formatter.joinVoices([unifiedVoice]);

          // Ensure we always give VexFlow enough room to avoid spilling notes
          // into the next measure while still supporting smaller pickup bars.
          const minWidth = formatter.preCalculateMinTotalWidth([unifiedVoice]);
          const safeFormatWidth = Math.max(baseFormatWidth, minWidth);

          formatter.format([unifiedVoice], safeFormatWidth);

          // Draw each note individually - it will render on its assigned stave
          allNotes.forEach((note) => {
            note.setContext(context).draw();
          });
        }

        // Draw beams
        trebleBeams.forEach((beam) => beam.setContext(context).draw());
        bassBeams.forEach((beam) => beam.setContext(context).draw());
      } else {
        const stave = new Stave(currentX, trebleY, measureWidth);

        if (index === 0) {
          stave.addClef(exercise.clef);
          stave.addTimeSignature(exercise.timeSignature ?? "4/4");
        }

        if (start + index === exercise.measures.length - 1) {
          stave.setEndBarType(BarlineType.END);
        }

        stave.setContext(context).draw();

        const notes = measure.map((noteData) => {
          const status = statuses[globalNoteIndex] || "pending";
          const staveNote = buildNote(noteData, exercise.clef, status);
          globalNoteIndex++;
          return staveNote;
        });

        const voice = buildVoice(notes);

        const beams = Beam.generateBeams(notes);

        // Calculate proportional format width only when the measure is truly a pickup
        const measureBeats = getMeasureBeats(measure);
        const isPickup = shouldApplyPickupScaling(
          measureBeats,
          fullMeasureBeats,
          start + index,
          exercise.hasPickupMeasure,
        );
        const beatRatio = isPickup
          ? Math.max(measureBeats / (fullMeasureBeats || measureBeats || 1), 0)
          : 1;
        const baseFormatWidth = (measureWidth - 20) * beatRatio;

        const formatter = new Formatter();
        formatter.joinVoices([voice]);

        const minWidth = formatter.preCalculateMinTotalWidth([voice]);
        const safeFormatWidth = Math.max(baseFormatWidth, minWidth);

        formatter.format([voice], safeFormatWidth);

        voice.draw(context, stave);
        beams.forEach((beam) => beam.setContext(context).draw());
      }

      currentX += measureWidth;
    });
  };

  return <div ref={containerRef} className="music-staff-container" />;
};

export default MusicStaff;
