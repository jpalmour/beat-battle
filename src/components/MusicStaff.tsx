import { useEffect, useRef } from 'react'
import { Renderer, Stave, StaveNote, Formatter, Annotation, Voice, Accidental, BarlineType } from 'vexflow'
import type { Exercise } from '../types/music'

interface MusicStaffProps {
    exercise: Exercise
}

const MusicStaff = ({ exercise }: MusicStaffProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.contentRect) {
                    renderStaff(container, exercise, entry.contentRect.width, entry.contentRect.height)
                }
            }
        })

        resizeObserver.observe(container)

        renderStaff(container, exercise, container.clientWidth, container.clientHeight)

        return () => {
            resizeObserver.disconnect()
        }
    }, [exercise])

    const renderStaff = (container: HTMLDivElement, exercise: Exercise, containerWidth: number, containerHeight: number) => {
        container.innerHTML = ''

        // Logical dimensions for the VexFlow rendering
        // We render to a fixed height coordinate system and let SVG scale it up
        const LOGICAL_HEIGHT = 130
        const aspectRatio = containerWidth / containerHeight
        const logicalWidth = LOGICAL_HEIGHT * aspectRatio

        const padding = 10
        const availableWidth = logicalWidth - padding * 2
        const measureWidth = availableWidth / 4

        const renderer = new Renderer(container, Renderer.Backends.SVG)
        renderer.resize(logicalWidth, LOGICAL_HEIGHT)
        const context = renderer.getContext()
        context.setFont('Bangers', 12)
        context.setFillStyle('#f7f7f7')
        context.setStrokeStyle('#f7f7f7')

        // Set SVG to scale to container
        const svg = container.querySelector('svg')
        if (svg) {
            svg.setAttribute('viewBox', `0 0 ${logicalWidth} ${LOGICAL_HEIGHT}`)
            svg.setAttribute('width', '100%')
            svg.setAttribute('height', '100%')
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        }

        let currentX = padding
        const y = 30 // Tighter vertical positioning

        exercise.measures.forEach((measure, index) => {
            const stave = new Stave(currentX, y, measureWidth)

            if (index === 0) {
                stave.addClef(exercise.clef)
                stave.addTimeSignature('4/4')
            }

            if (index === exercise.measures.length - 1) {
                stave.setEndBarType(BarlineType.END)
            }

            stave.setContext(context).draw()

            const notes = measure.map(noteData => {
                const staveNote = new StaveNote({
                    keys: noteData.keys,
                    duration: noteData.duration,
                    clef: exercise.clef
                })

                // Style note heads and stems
                staveNote.setStyle({ fillStyle: '#f7f7f7', strokeStyle: '#f7f7f7' })

                // Add accidentals if needed
                noteData.keys.forEach((key, index) => {
                    // Check for sharps
                    if (key.includes('#')) {
                        staveNote.addModifier(new Accidental('#'), index);
                    }
                    // Check for flats (must be a letter followed by 'b', e.g., 'eb/4', 'bb/4')
                    // We use a regex to ensure we don't match 'b/4' (B natural) as a flat
                    else if (/[a-g]b\//.test(key)) {
                        staveNote.addModifier(new Accidental('b'), index);
                    }
                });

                if (noteData.fingers && noteData.fingers.length > 0) {
                    // Iterate in reverse order (High -> Low) to ensure correct vertical stacking
                    for (let i = noteData.fingers.length - 1; i >= 0; i--) {
                        const finger = noteData.fingers[i];
                        staveNote.addModifier(
                            new Annotation(finger)
                                .setFont('Bangers', 16, 'normal')
                                .setVerticalJustification(Annotation.VerticalJustify.BOTTOM)
                                .setStyle({ fillStyle: '#f2ff5d' }),
                            i
                        )
                    }
                }

                return staveNote
            })

            const voice = new Voice({
                numBeats: 4,
                beatValue: 4
            })
            voice.addTickables(notes)

            new Formatter().joinVoices([voice]).formatToStave([voice], stave)

            voice.draw(context, stave)

            currentX += measureWidth
        })
    }

    return <div ref={containerRef} className="music-staff-container" />
}

export default MusicStaff
