export class AudioService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;

  async initialize(): Promise<AnalyserNode> {
    if (this.audioContext && this.analyser) {
      return this.analyser;
    }

    const contextConstructor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!contextConstructor) {
      throw new Error("Web Audio API is not supported in this browser");
    }

    this.audioContext = new contextConstructor();

    // Resume context if suspended (browser policy)
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false, // We want raw audio for pitch detection
        },
      });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      throw err;
    }

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048; // Good balance for pitch detection

    source.connect(this.analyser);

    return this.analyser;
  }

  getSampleRate(): number {
    return this.audioContext?.sampleRate || 44100;
  }

  cleanup() {
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.audioContext?.close();
    this.audioContext = null;
    this.mediaStream = null;
    this.analyser = null;
  }
}

export const audioService = new AudioService();
