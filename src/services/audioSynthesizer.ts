/**
 * Vintage Acoustic Lofi Audio Engine using Web Audio API
 * Generates warm acoustic guitar / rhodes chords with vinyl needle crackle.
 * 100% reliable, zero dead links, works offline or online.
 */

class VintageAcousticEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private volumeNode: GainNode | null = null;
  private vinylNoiseNode: AudioNode | null = null;
  private currentTrackIndex = 0;
  private tempo = 68; // warm chill bpm

  // Acoustic Chord progressions (frequencies in Hz)
  private readonly tracks = [
    {
      title: 'Kỷ Niệm Bên Tách Cà Phê',
      subtitle: 'Acoustic Guitar & Warm Rhodes (Key of D Maj)',
      chords: [
        [146.83, 220.0, 293.66, 369.99, 440.0], // Dmaj9
        [123.47, 185.0, 246.94, 293.66, 369.99], // Bm7
        [130.81, 196.0, 261.63, 329.63, 392.0], // Em7
        [110.0, 164.81, 220.0, 277.18, 329.63], // A7sus4
      ],
      tempo: 64,
    },
    {
      title: 'Gió Qua Đồi Trà & Hoa Đào',
      subtitle: 'Sakura Breeze & Ocean Waves Lofi',
      chords: [
        [130.81, 196.0, 261.63, 329.63, 392.0], // Cmaj7
        [110.0, 164.81, 220.0, 261.63, 329.63], // Am7
        [87.31, 130.81, 174.61, 220.0, 261.63], // Fmaj7
        [98.0, 146.83, 196.0, 246.94, 293.66], // G7
      ],
      tempo: 68,
    },
    {
      title: 'Bản Tình Ca Số 1 — Bảo & Huệ',
      subtitle: 'Fingerstyle Acoustic Melody',
      chords: [
        [174.61, 220.0, 261.63, 329.63, 349.23], // Fmaj7#11
        [146.83, 220.0, 261.63, 329.63], // Dm9
        [164.81, 246.94, 293.66, 392.0], // Em7
        [110.0, 164.81, 220.0, 261.63, 329.63], // Am9
      ],
      tempo: 60,
    },
  ];

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.volumeNode.connect(this.ctx.destination);
    }
  }

  public getTrackInfo(index = this.currentTrackIndex) {
    return this.tracks[index % this.tracks.length];
  }

  public getTracks() {
    return this.tracks;
  }

  public getCurrentTrackIndex() {
    return this.currentTrackIndex;
  }

  public setTrack(index: number) {
    this.currentTrackIndex = index % this.tracks.length;
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
  }

  public nextTrack() {
    this.setTrack((this.currentTrackIndex + 1) % this.tracks.length);
  }

  public prevTrack() {
    this.setTrack((this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length);
  }

  public setVolume(volume: number) {
    if (this.volumeNode && this.ctx) {
      this.volumeNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public start(): boolean {
    this.init();
    if (!this.ctx || !this.volumeNode) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.startVinylNoise();

    let chordStep = 0;
    const currentTrack = this.tracks[this.currentTrackIndex];
    const beatMs = (60 / currentTrack.tempo) * 1000;

    const playLoop = () => {
      if (!this.isPlaying || !this.ctx) return;
      const chords = currentTrack.chords;
      const chord = chords[chordStep % chords.length];

      // Arpeggiate the chord notes smoothly
      chord.forEach((freq, noteIdx) => {
        const noteDelay = noteIdx * 0.12; // Fingerstyle strum offset
        this.playAcousticString(freq, noteDelay);
      });

      chordStep++;
      this.timer = window.setTimeout(playLoop, beatMs * 2.5);
    };

    playLoop();
    return true;
  }

  private playAcousticString(freq: number, delaySec: number) {
    if (!this.ctx || !this.volumeNode) return;

    const now = this.ctx.currentTime + delaySec;

    // Triangle / Sine mix for warm wooden acoustic resonance
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now); // soft harmonic

    const stringGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 1.8);

    // Warm pluck envelope
    stringGain.gain.setValueAtTime(0.001, now);
    stringGain.gain.exponentialRampToValueAtTime(0.28, now + 0.03);
    stringGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(stringGain);
    stringGain.connect(this.volumeNode);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.3);
    osc2.stop(now + 2.3);
  }

  private startVinylNoise() {
    if (!this.ctx || !this.volumeNode || this.vinylNoiseNode) return;

    // Create a gentle, comforting vinyl dust crackle buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Occasional crackle
      if (Math.random() < 0.0008) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.008; // very soft pink-ish noise
      }
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1100;
    noiseFilter.Q.value = 1.2;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.volumeNode);

    noiseSource.start();
    this.vinylNoiseNode = noiseSource;
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.vinylNoiseNode) {
      try {
        (this.vinylNoiseNode as AudioScheduledSourceNode).stop();
      } catch {
        // ignore
      }
      this.vinylNoiseNode = null;
    }
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}

export const audioPlayer = new VintageAcousticEngine();
