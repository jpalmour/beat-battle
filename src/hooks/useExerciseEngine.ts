import { useState, useEffect, useRef } from 'react';
import type { Exercise } from '../types/music';
import type { DetectedNote } from '../utils/noteDetection';

export type NoteStatus = 'pending' | 'current' | 'correct' | 'error';

interface UseExerciseEngineProps {
    exercise: Exercise;
    detectedNote: DetectedNote | null;
    simulatedNote?: { note: DetectedNote, id: number } | null; // For cheats
    isRecording: boolean;
    onComplete?: () => void;
    onFail?: () => void;
}

export function useExerciseEngine({ exercise, detectedNote, simulatedNote, isRecording, onComplete, onFail }: UseExerciseEngineProps) {
    const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
    const [noteStatuses, setNoteStatuses] = useState<NoteStatus[]>([]);
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'error'>('none');

    // Refinements State
    // Refinements State
    const [isWaitingForRelease, setIsWaitingForRelease] = useState(false);
    const [lockedNote, setLockedNote] = useState<string | null>(null);
    const [stableNote, setStableNote] = useState<DetectedNote | null>(null); // Now represents the DEBOUNCED note

    // Track processed cheat IDs to prevent loops
    const lastProcessedCheatId = useRef<number | null>(null);

    const reset = () => {
        setCurrentNoteIndex(0);
        const allNotes = exercise.measures.flat();
        setNoteStatuses(new Array(allNotes.length).fill('pending'));
        setFeedback('none');
        setIsWaitingForRelease(false);
        setLockedNote(null);
        setStableNote(null);
    };

    // Reset when exercise changes
    useEffect(() => {
        reset();
    }, [exercise]);

    // 1. Stability Logic (Debounce)
    useEffect(() => {
        if (!isRecording) {
            setStableNote(null);
            return;
        }

        const timer = setTimeout(() => {
            setStableNote(detectedNote);
        }, 100); // 100ms sustained threshold

        return () => clearTimeout(timer);
    }, [detectedNote, isRecording]);

    // 2. Game Logic (Reacts to stableNote)
    useEffect(() => {
        if (!isRecording) return;

        const allNotes = exercise.measures.flat();
        if (currentNoteIndex >= allNotes.length) return;

        // Handle Release / Unlock
        if (isWaitingForRelease) {
            // Unlock if stable note is null (silence) OR different from locked note
            if (!stableNote || (lockedNote && stableNote.note !== lockedNote)) {
                setIsWaitingForRelease(false);
                setLockedNote(null);
            }
            return;
        }

        // If no stable note, nothing to do
        if (!stableNote) return;

        // Evaluate Match
        const targetNote = allNotes[currentNoteIndex];
        const targetKey = targetNote.keys[0];
        const [noteName, octave] = targetKey.split('/');
        const normalizedTarget = `${noteName.toUpperCase()}${octave}`;

        const isMatch = stableNote.note === normalizedTarget;

        // Update Status
        setNoteStatuses(prev => {
            const next = [...prev];
            next[currentNoteIndex] = isMatch ? 'correct' : 'error';
            return next;
        });

        // Feedback
        setFeedback(isMatch ? 'correct' : 'error');

        // Advance
        const nextIndex = currentNoteIndex + 1;
        setCurrentNoteIndex(nextIndex);

        // Lock
        setIsWaitingForRelease(true);
        setLockedNote(stableNote.note);

        // Clear feedback
        setTimeout(() => setFeedback('none'), 500);

        // Check Completion
        if (nextIndex >= allNotes.length) {
            const hasPriorErrors = noteStatuses.some(s => s === 'error');
            // Check if the LAST note was a match (it should be if we are here and logic holds, but let's be safe)
            // Actually, we just set it.
            const isSuccess = !hasPriorErrors && isMatch;

            if (isSuccess && onComplete) {
                onComplete();
            } else if (!isSuccess && onFail) {
                onFail();
            }
        }
    }, [stableNote, currentNoteIndex, exercise, isRecording, isWaitingForRelease, lockedNote, noteStatuses, onComplete, onFail]);

    // 3. Cheat / Manual Input Logic
    useEffect(() => {
        if (!simulatedNote || !isRecording) return;

        // Prevent duplicate processing
        if (simulatedNote.id === lastProcessedCheatId.current) return;
        lastProcessedCheatId.current = simulatedNote.id;

        const allNotes = exercise.measures.flat();
        if (currentNoteIndex >= allNotes.length) return;

        // Immediate processing for cheats (no stability check)
        const targetNote = allNotes[currentNoteIndex];
        const targetKey = targetNote.keys[0];
        const [noteName, octave] = targetKey.split('/');
        const normalizedTarget = `${noteName.toUpperCase()}${octave}`;

        // Cheat Logic: If simulated note matches note name (ignoring octave), treat as match
        // Otherwise treat as error
        // The simulatedNote passed in will likely be just the note name from the key press (e.g. "C")
        // We need to handle what App passes. 
        // Plan said: "Type a letter (e.g., 'c') will match ANY octave of that note if it's the target."

        // Let's assume simulatedNote.note is "C4" (generic) but we check the name.
        const simName = simulatedNote.note.note.replace(/[0-9]/g, '');
        const targetName = normalizedTarget.replace(/[0-9]/g, '');

        const isMatch = simName === targetName;

        // Update Status
        setNoteStatuses(prev => {
            const next = [...prev];
            next[currentNoteIndex] = isMatch ? 'correct' : 'error';
            return next;
        });

        setFeedback(isMatch ? 'correct' : 'error');

        const nextIndex = currentNoteIndex + 1;
        setCurrentNoteIndex(nextIndex);

        setTimeout(() => setFeedback('none'), 500);

        if (nextIndex >= allNotes.length) {
            const hasPriorErrors = noteStatuses.some(s => s === 'error');
            const isSuccess = !hasPriorErrors && isMatch;

            if (isSuccess && onComplete) {
                onComplete();
            } else if (!isSuccess && onFail) {
                onFail();
            }
        }

    }, [simulatedNote, currentNoteIndex, exercise, isRecording, noteStatuses, onComplete, onFail]);

    // Debug info
    const allNotes = exercise.measures.flat();
    const targetNote = allNotes[currentNoteIndex];
    const targetKey = targetNote ? targetNote.keys[0] : 'END';

    return {
        currentNoteIndex,
        noteStatuses,
        feedback,
        reset,
        debug: {
            targetKey,
            isWaitingForRelease,
            lockedNote,
            stableNote: stableNote?.note
        }
    };
}
