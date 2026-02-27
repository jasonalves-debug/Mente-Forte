class SoundService {
  private audioCtx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext is initialized on first user interaction to comply with browser policies
  }

  private initContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playCorrect() {
    // A soft, high-pitched chime
    this.playTone(880, 'sine', 0.3, 0.1);
  }

  playComplete() {
    // A gentle ascending arpeggio
    const now = Date.now();
    this.playTone(523.25, 'sine', 0.4, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.4, 0.1), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.5, 0.1), 200); // G5
  }

  playTap() {
    // A very subtle, short pop
    this.playTone(440, 'sine', 0.05, 0.05);
  }

  playError() {
    // A soft, low-pitched thud
    this.playTone(220, 'sine', 0.2, 0.05);
  }
}

export const soundService = new SoundService();
