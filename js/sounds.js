// Sound Manager with Real High-Quality MP3 Audio Files + Web Audio API Synthesis Fallback
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('chess_muted') === 'true';
    this.buffers = {};
    this.soundPaths = {
      move: 'assets/sounds/Move.mp3',
      capture: 'assets/sounds/Capture.mp3',
      card_play: 'assets/sounds/Confirmation.mp3',
      card_draw: 'assets/sounds/GenericNotify.mp3',
      curse_trigger: 'assets/sounds/Explosion.mp3',
      illegal: 'assets/sounds/Error.mp3',
      select: 'assets/sounds/Select.mp3'
    };
    this.preloaded = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.preloadSounds();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  async preloadSounds() {
    if (this.preloaded || !this.ctx) return;
    this.preloaded = true;

    for (const [key, path] of Object.entries(this.soundPaths)) {
      try {
        const resp = await fetch(path);
        if (resp.ok) {
          const arrayBuffer = await resp.arrayBuffer();
          this.buffers[key] = await this.ctx.decodeAudioData(arrayBuffer);
        }
      } catch (e) {
        // Fallback to procedural synthesis if fetch fails
        // console.warn('Could not load sound', path, e);
      }
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

    // 1. Try playing preloaded high-fidelity MP3 buffer
    if (this.buffers[type]) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers[type];
        source.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch (e) {
        console.warn('Error playing buffer for', type, e);
      }
    }

    // 2. Fallbacks for compound sounds
    if (type === 'castle') {
      this.play('move');
      setTimeout(() => this.play('move'), 120);
      return;
    }
    if (type === 'check') {
      this._playCheckChime(this.ctx.currentTime);
      return;
    }
    if (type === 'gameover') {
      this.play('card_play');
      return;
    }
    if (type === 'freeze') {
      this._playFreezeChime(this.ctx.currentTime);
      return;
    }
    if (type === 'curse') {
      this.play('curse_trigger');
      return;
    }
    if (type === 'notify') {
      this.play('card_draw');
      return;
    }

    // Default synthesis fallback if mp3 not loaded
    const t = this.ctx.currentTime;
    if (type === 'move') this._playMoveFallback(t);
    else if (type === 'capture') this._playCaptureFallback(t);
  }

  _playCheckChime(t) {
    // Elegant two-note harmonic alert
    [659.25, 880].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + i * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.38);
    });
  }

  _playFreezeChime(t) {
    [1400, 2100].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, start + 0.2);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.24);
    });
  }

  _playMoveFallback(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.08);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  _playCaptureFallback(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }
}

window.sounds = new SoundManager();
