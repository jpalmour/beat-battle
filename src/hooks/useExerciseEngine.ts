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
    const [isWaitingForRelease, setIsWaitingForRelease] = useState(false);
    const [stableNote, setStableNote] = useState<DetectedNote | null>(null);
    const [stableStartTime, setStableStartTime] = useState<number>(0);

    // Reset when exercise changes
    useEffect(() => {
        setCurrentNoteIndex(0);
        // Flatten measures to get a linear list of notes
        const allNotes = exercise.measures.flat();
        setNoteStatuses(new Array(allNotes.length).fill('pending'));
        setFeedback('none');
        setIsWaitingForRelease(false);
        setStableNote(null);
    }, [exercise]);

    // Game Logic Loop
    useEffect(() => {
        if (!isRecording) {
            // Reset stability if not recording
            setStableNote(null);
            return;
        }

        const allNotes = exercise.measures.flat();
        if (currentNoteIndex >= allNotes.length) return;

        // 1. Handle Note Release (Quiet Threshold)
        if (isWaitingForRelease) {
            if (!detectedNote) {
                // Note released! Ready for next.
                setIsWaitingForRelease(false);
                setStableNote(null);
            }
            return;
        }

        // 2. Handle Note Stability (Sustained Threshold)
        if (!detectedNote) {
            setStableNote(null);
            return;
        }

        // If we have a new potential note, track it
        if (!stableNote || stableNote.note !== detectedNote.note) {
            setStableNote(detectedNote);
            setStableStartTime(Date.now());
            return;
        }

        // Check if sustained long enough (e.g. 100ms)
        const duration = Date.now() - stableStartTime;
        if (duration < 100) return;

        // 3. Evaluate Note (It's stable now!)
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

        // Lock until release
        setIsWaitingForRelease(true);

        // Clear feedback
        setTimeout(() => setFeedback('none'), 500);

        // Check Completion
        if (nextIndex >= allNotes.length) {
            // Only complete if ALL notes are correct
            // We need to check the *updated* statuses. 
            // Since state update is async, we check the logic here:
            // We know previous statuses were correct/error, and we just added one.
            // Actually, simpler: check if we have any errors in the final array.
            // But we can't see the new state yet.
            // Let's use a functional update or a ref if needed, but for now:
            // We can assume success if (all prev correct) AND (this one is match).

            // However, the requirement says "don't end until all notes played".
            // So we are here. Now check success.

            // We need to know if there were any errors.
            // We can check noteStatuses, but it's stale.
            // Let's check if we are adding an error now.

            const hasPriorErrors = noteStatuses.some(s => s === 'error');
            const isSuccess = !hasPriorErrors && isMatch;

            if (isSuccess && onComplete) {
                onComplete();
            } else if (!isSuccess) {
                // Failed attempt. Maybe auto-reset after a delay?
                // For now, just leave it. User can restart manually or we can add auto-restart.
                // Let's add a small delay then reset for retry?
                // User said "Only all green counts as a success".
                // Doesn't explicitly say what to do on failure.
                // Let's just not call onComplete.
            }
        }

    }, [detectedNote, currentNoteIndex, exercise, isRecording, isWaitingForRelease, stableNote, stableStartTime, noteStatuses, onComplete]);

    return {
        currentNoteIndex,
        noteStatuses,
        feedback
    };
}
