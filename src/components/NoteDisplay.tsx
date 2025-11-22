import { useState } from 'react';
import { useNoteDetection } from '../hooks/useNoteDetection';

export function NoteDisplay() {
    const [enabled, setEnabled] = useState(false);
    const { note, isListening, error } = useNoteDetection(enabled);

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            zIndex: 1000,
            fontFamily: 'monospace',
            minWidth: '200px'
        }}>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Note Detector</strong>
                <button
                    onClick={() => setEnabled(!enabled)}
                    style={{
                        background: enabled ? '#ff4444' : '#44ff44',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        color: 'black',
                        fontWeight: 'bold'
                    }}
                >
                    {enabled ? 'STOP' : 'START'}
                </button>
            </div>

            {error && (
                <div style={{ color: '#ff6b6b', fontSize: '0.9em' }}>
                    {error}
                </div>
            )}

            {isListening && !error && (
                <div style={{ textAlign: 'center' }}>
                    {note ? (
                        <>
                            <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#44ff44' }}>
                                {note.note}
                            </div>
                            <div style={{ fontSize: '0.8em', color: '#aaa' }}>
                                {note.frequency.toFixed(1)} Hz
                            </div>
                            <div style={{ fontSize: '0.8em', color: '#aaa' }}>
                                Clarity: {(note.clarity * 100).toFixed(0)}%
                            </div>
                        </>
                    ) : (
                        <div style={{ color: '#888', padding: '10px 0' }}>
                            Listening...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
