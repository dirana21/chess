// Web Audio API Sound Synthesizer for Chess (zero external audio files needed)
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('chess_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('chess_muted', this.muted);
    return this.muted;
  }

  play(type) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    try {
      switch (type) {
        case 'move':
          this._playMoveSound(t);
          break;
        case 'capture':
          this._playCaptureSound(t);
          break;
        case 'check':
          this._playCheckSound(t);
          break;
        case 'castle':
          this._playCastleSound(t);
          break;
        case 'gameover':
          this._playGameOverSound(t);
          break;
        case 'notify':
          this._playNotifySound(t);
          break;
        case 'illegal':
          this._playIllegalSound(t);
          break;
        case 'card_draw':
          this._playCardDrawSound(t);
          break;
        case 'card_play':
          this._playCardPlaySound(t);
          break;
        case 'freeze':
          this._playFreezeSound(t);
          break;
        case 'curse':
          this._playCurseSound(t);
          break;
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  _playMoveSound(t) {
    // Tactile wooden piece drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  _playCaptureSound(t) {
    // Solid knock with slightly higher snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, t);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  _playCheckSound(t) {
    // High alert chime
    [520, 680].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.26);
    });
  }

  _playCastleSound(t) {
    // Double click
    this._playMoveSound(t);
    setTimeout(() => {
      if (this.ctx) this._playMoveSound(this.ctx.currentTime);
    }, 80);
  }

  _playGameOverSound(t) {
    // Dramatic resolving chord
    [261.63, 329.63, 392.00, 523.25].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.95);
    });
  }

  _playNotifySound(t) {
    // Cheerful notification bell
    [440, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  _playIllegalSound(t) {
    // Low blunt buzz
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  _playCardDrawSound(t) {
    // Whoosh card sliding sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  _playCardPlaySound(t) {
    // Hearthstone style card slam onto board (deep impact + mystical shimmer)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.25);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);

    // Shimmer harmonic
    [587.33, 880, 1174.66].forEach((f, i) => {
      const sOsc = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      const start = t + 0.05 + i * 0.04;

      sOsc.type = 'sine';
      sOsc.frequency.setValueAtTime(f, start);

      sGain.gain.setValueAtTime(0.18, start);
      sGain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      sOsc.connect(sGain);
      sGain.connect(this.ctx.destination);

      sOsc.start(start);
      sOsc.stop(start + 0.38);
    });
  }

  _playFreezeSound(t) {
    // Glassy ice crack
    [1200, 1800, 2400].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.03;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, start + 0.15);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  _playCurseSound(t) {
    // Deep dark curse vibration
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.45);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.5);
  }
}

window.sounds = new SoundManager();
