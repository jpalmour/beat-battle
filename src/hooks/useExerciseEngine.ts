import { useState, useEffect } from 'react';
import type { Exercise } from '../types/music';
import type { DetectedNote } from '../utils/noteDetection';

export type NoteStatus = 'pending' | 'current' | 'correct' | 'error';

interface UseExerciseEngineProps {
    exercise: Exercise;
    detectedNote: DetectedNote | null;
    isRecording: boolean;
    onComplete?: () => void;
}

export function useExerciseEngine({ exercise, detectedNote, isRecording, onComplete }: UseExerciseEngineProps) {
    const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
    const [noteStatuses, setNoteStatuses] = useState<NoteStatus[]>([]);
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'error'>('none');

    // Refinements State
    // Refinements State
    const [isWaitingForRelease, setIsWaitingForRelease] = useState(false);
    const [lockedNote, setLockedNote] = useState<string | null>(null);
    const [stableNote, setStableNote] = useState<DetectedNote | null>(null); // Now represents the DEBOUNCED note

    // Reset when exercise changes
    useEffect(() => {
        setCurrentNoteIndex(0);
        // Flatten measures to get a linear list of notes
        const allNotes = exercise.measures.flat();
        setNoteStatuses(new Array(allNotes.length).fill('pending'));
        setFeedback('none');
        setIsWaitingForRelease(false);
        setLockedNote(null);
        setStableNote(null);
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
            const isSuccess = !hasPriorErrors && isMatch;

            if (isSuccess && onComplete) {
                onComplete();
            }
        }
    }, [stableNote, currentNoteIndex, exercise, isRecording, isWaitingForRelease, lockedNote, noteStatuses, onComplete]);

    // Debug info
    const allNotes = exercise.measures.flat();
    const targetNote = allNotes[currentNoteIndex];
    const targetKey = targetNote ? targetNote.keys[0] : 'END';

    return {
        currentNoteIndex,
        noteStatuses,
        feedback,
        debug: {
            targetKey,
            isWaitingForRelease,
            lockedNote,
            stableNote: stableNote?.note
        }
    };
}
