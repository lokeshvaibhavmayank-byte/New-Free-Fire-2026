/**
 * Web Audio API Sound Synthesizer for Free Fire MAX
 * 100% Procedural - No external audio file dependencies
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.4, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Gunshot sounds tailored by weapon archetype
  public playGunshot(type: 'ak47' | 'mp40' | 'm1887' | 'awm' | 'deagle') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Noise burst buffer
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    const noiseGain = this.ctx.createGain();

    // Body tone oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    if (type === 'mp40') {
      // High-pitched rapid SMG snap
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2400, t);
      noiseFilter.Q.setValueAtTime(3, t);

      noiseGain.gain.setValueAtTime(0.7, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);

      oscGain.gain.setValueAtTime(0.5, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.09);
      osc.start(t);
      osc.stop(t + 0.07);

    } else if (type === 'ak47') {
      // Heavy military assault rifle boom
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1800, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(400, t + 0.15);

      noiseGain.gain.setValueAtTime(0.9, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);

      oscGain.gain.setValueAtTime(0.8, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.19);
      osc.start(t);
      osc.stop(t + 0.16);

    } else if (type === 'm1887') {
      // Thunderous double-barrel shotgun explosion
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(2800, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(300, t + 0.28);

      noiseGain.gain.setValueAtTime(1.0, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.25);

      oscGain.gain.setValueAtTime(1.0, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.32);
      osc.start(t);
      osc.stop(t + 0.28);

    } else if (type === 'awm') {
      // Supersonic sniper crack with booming low echo
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(3500, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(500, t + 0.4);

      noiseGain.gain.setValueAtTime(1.0, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

      oscGain.gain.setValueAtTime(1.0, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.46);
      osc.start(t);
      osc.stop(t + 0.4);

    } else {
      // Desert Eagle handgun snap
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2000, t);
      noiseGain.gain.setValueAtTime(0.8, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

      oscGain.gain.setValueAtTime(0.7, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.13);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  // Signature Gloo Wall deployment sound (icy crystallize blast)
  public playGlooWallDeploy() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.25);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  // Hit marker indicator sound
  public playHitMarker(isHeadshot: boolean) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isHeadshot) {
      // High-pitch rewarding "CLINK / DING" for HEADSHOT!
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.setValueAtTime(2400, t + 0.05);
      gain.gain.setValueAtTime(0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    } else {
      // Body shot blunt thud
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + (isHeadshot ? 0.26 : 0.1));
  }

  // Alok Skill - "Drop The Beat" electronic rhythm
  public playAlokSkill() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = t + idx * 0.08;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.16);
    });
  }

  // Chrono Skill - "Time Turner" forcefield hum
  public playChronoSkill() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.25);
    osc.frequency.linearRampToValueAtTime(350, t + 0.5);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  // Medkit healing sound
  public playMedkit() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.4);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.46);
  }

  // Weapon Reload sound
  public playReload() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Click 1: Magazine unlatch
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(800, t);
    gain1.gain.setValueAtTime(0.2, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(t);
    osc1.stop(t + 0.06);

    // Click 2: Magazine insert
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(450, t + 0.25);
    gain2.gain.setValueAtTime(0.3, t + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.32);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t + 0.25);
    osc2.stop(t + 0.33);

    // Click 3: Bolt slide forward
    const osc3 = this.ctx.createOscillator();
    const gain3 = this.ctx.createGain();
    osc3.type = 'sawtooth';
    osc3.frequency.setValueAtTime(1100, t + 0.5);
    gain3.gain.setValueAtTime(0.35, t + 0.5);
    gain3.gain.exponentialRampToValueAtTime(0.01, t + 0.58);
    osc3.connect(gain3);
    gain3.connect(this.masterGain);
    osc3.start(t + 0.5);
    osc3.stop(t + 0.6);
  }

  // Procedural Emote Sound Effects
  public playEmoteSound(sound: 'lol' | 'tea' | 'applause' | 'pushup' | 'threaten' | 'dance' | 'flag') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    if (sound === 'lol') {
      // Free Fire LOL laughter (syncopated giggle chops)
      for (let i = 0; i < 7; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = t + i * 0.14;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450 + (i % 2 === 0 ? 80 : -40), noteTime);
        osc.frequency.exponentialRampToValueAtTime(300, noteTime + 0.1);

        gain.gain.setValueAtTime(0.35, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(noteTime);
        osc.stop(noteTime + 0.13);
      }
    } else if (sound === 'applause') {
      // Clapping applause
      for (let i = 0; i < 12; i++) {
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) data[j] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        const gain = this.ctx.createGain();
        const clapTime = t + i * 0.09 + Math.random() * 0.02;

        gain.gain.setValueAtTime(0.4, clapTime);
        gain.gain.exponentialRampToValueAtTime(0.01, clapTime + 0.06);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(clapTime);
        noise.stop(clapTime + 0.07);
      }
    } else if (sound === 'tea') {
      // High-tea porcelain clink & chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, t);
      osc.frequency.exponentialRampToValueAtTime(1800, t + 0.4);
      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.82);
    } else if (sound === 'threaten') {
      // Sharp metallic knife slice
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.22);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.26);
    } else if (sound === 'flag') {
      // Heavy flagpole slam into earth
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);
      gain.gain.setValueAtTime(0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.46);
    } else if (sound === 'pushup') {
      // Pushup power whoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.linearRampToValueAtTime(240, t + 0.2);
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.36);
    } else {
      // Doggie Dance upbeat chords
      const notes = [330, 392, 494, 587, 659];
      notes.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const noteTime = t + idx * 0.12;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, noteTime);
        gain.gain.setValueAtTime(0.3, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(noteTime);
        osc.stop(noteTime + 0.22);
      });
    }
  }

  // Safe Zone Warning Siren
  public playSafeZoneAlarm() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(700, t + 0.3);
    osc.frequency.linearRampToValueAtTime(400, t + 0.6);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.65);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.7);
  }

  // BOOYAH! Victory fanfare
  public playBooyahFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Chords: G4, B4, D5, G5
    const chords = [
      { time: 0, notes: [392, 493.88, 587.33] },
      { time: 0.2, notes: [440, 554.37, 659.25] },
      { time: 0.4, notes: [523.25, 659.25, 783.99] },
      { time: 0.7, notes: [587.33, 739.99, 880, 1174.66] }
    ];

    chords.forEach(c => {
      c.notes.forEach(f => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const noteTime = t + c.time;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, noteTime);

        gain.gain.setValueAtTime(0.3, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(noteTime);
        osc.stop(noteTime + 0.65);
      });
    });
  }

  // UI button click
  public playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }
}

export const sounds = new SoundSystem();
