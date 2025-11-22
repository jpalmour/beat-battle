import './RecordingLight.css';

interface RecordingLightProps {
    isRecording: boolean;
}

export function RecordingLight({ isRecording }: RecordingLightProps) {
    return (
        <div className={`recording-light ${isRecording ? 'on' : 'off'}`}>
            <div className="light-bulb"></div>
            <span className="rec-text">REC</span>
        </div>
    );
}
