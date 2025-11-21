import { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Formatter, Annotation, Voice, Accidental, BarlineType } from 'vexflow';
import type { Exercise } from '../types/music';

interface MusicStaffProps {
    exercise: Exercise;
}

const MusicStaff = ({ exercise }: MusicStaffProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentBoxSize) {
                    renderStaff(container, exercise, entry.contentRect.width);
                }
            }
        });

        resizeObserver.observe(container);

        // Initial render
        renderStaff(container, exercise, container.clientWidth);

        return () => {
            resizeObserver.disconnect();
        };
    }, [exercise]);

    const renderStaff = (container: HTMLDivElement, exercise: Exercise, width: number) => {
        container.innerHTML = '';

        // Calculate dimensions
        // We want 4 bars across. 
        // Padding: 20px left/right
        const padding = 20;
        const availableWidth = width - (padding * 2);
        const measureWidth = availableWidth / 4;
        const height = 200;

        const renderer = new Renderer(container, Renderer.Backends.SVG);
        renderer.resize(width, height);
        const context = renderer.getContext();
        context.setFont('Arial', 10);

        let currentX = padding;
        const y = 40;

        exercise.measures.forEach((measure, index) => {
            // Create stave
            const stave = new Stave(currentX, y, measureWidth);

            // Add clef and time signature only to the first measure
            if (index === 0) {
                stave.addClef(exercise.clef);
                stave.addTimeSignature('4/4');
            }

            // Add end bar line to the last measure
            if (index === exercise.measures.length - 1) {
                stave.setEndBarType(BarlineType.END);
            }

            stave.setContext(context).draw();

            // Create notes
            const notes = measure.map(noteData => {
                const staveNote = new StaveNote({
                    keys: noteData.keys,
                    duration: noteData.duration,
                    clef: exercise.clef,
                });

                // Add accidentals if needed
                // Check for sharps
                if (noteData.keys[0].includes('#')) {
                    staveNote.addModifier(new Accidental('#'), 0);
                }
                // Check for flats (must be a letter followed by 'b', e.g., 'eb/4', 'bb/4')
                // We use a regex to ensure we don't match 'b/4' (B natural) as a flat
                else if (/[a-g]b\//.test(noteData.keys[0])) {
                    staveNote.addModifier(new Accidental('b'), 0);
                }

                // Add finger hint
                if (noteData.finger) {
                    staveNote.addModifier(
                        new Annotation(noteData.finger)
                            .setFont('Inter', 14, 'bold') // Using our theme font
                            .setVerticalJustification(Annotation.VerticalJustify.BOTTOM),
                        0
                    );
                }

                // Add text/lyrics
                if (noteData.text) {
                    staveNote.addModifier(
                        new Annotation(noteData.text)
                            .setFont('Inter', 12, 'italic')
                            .setVerticalJustification(Annotation.VerticalJustify.BOTTOM), // VexFlow annotation positioning can be tricky, often needs adjustment
                        0
                    );
                }

                return staveNote;
            });

            // Create voice
            const voice = new Voice({
                numBeats: 4,
                beatValue: 4,
            });
            voice.addTickables(notes);

            // Format
            new Formatter().joinVoices([voice]).formatToStave([voice], stave);

            // Render
            voice.draw(context, stave);

            currentX += measureWidth;
        });
    };

    return (
        <div
            ref={containerRef}
            className="music-staff-container"
            style={{
                width: '100%',
                background: 'white',
                borderRadius: '24px', // More rounded
                padding: '20px 0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)', // Subtle shadow
                overflow: 'hidden'
            }}
        />
    );
};

export default MusicStaff;
