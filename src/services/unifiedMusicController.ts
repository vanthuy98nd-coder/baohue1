import { audioPlayer as synthAudioPlayer } from './audioSynthesizer';
import {
  extractYouTubeVideoId,
  convertToGoogleDriveDirectAudioUrl,
  detectMusicSource,
} from '../utils/urlHelpers';
import type { MusicTrack } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type PlaybackSource = 'youtube' | 'drive' | 'mp3' | 'synth';

class UnifiedMusicController {
  private activeSource: PlaybackSource = 'synth';
  private currentTrack: MusicTrack | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5;

  // HTML5 Audio instance for MP3 & Drive audio
  private htmlAudio: HTMLAudioElement | null = null;

  // YouTube Iframe Player
  private ytPlayer: any = null;
  private isYtApiReady: boolean = false;
  private pendingYtVideoId: string | null = null;

  // Callbacks
  private onStateChangeListeners: Array<(isPlaying: boolean, track: MusicTrack | null) => void> = [];

  constructor() {
    this.initHtmlAudio();
    this.loadYouTubeIframeAPI();
  }

  private initHtmlAudio() {
    if (typeof window === 'undefined') return;
    this.htmlAudio = new Audio();
    this.htmlAudio.volume = this.volume;

    this.htmlAudio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.notifyState();
    });

    this.htmlAudio.addEventListener('pause', () => {
      if (this.activeSource === 'mp3' || this.activeSource === 'drive') {
        this.isPlaying = false;
        this.notifyState();
      }
    });

    this.htmlAudio.addEventListener('play', () => {
      if (this.activeSource === 'mp3' || this.activeSource === 'drive') {
        this.isPlaying = true;
        this.notifyState();
      }
    });

    this.htmlAudio.addEventListener('error', (e) => {
      console.warn('HTML5 Audio playback error:', e);
      // Fallback to synth if external file fails
      if (this.activeSource !== 'synth') {
        this.activeSource = 'synth';
        synthAudioPlayer.start();
        this.isPlaying = true;
        this.notifyState();
      }
    });
  }

  /**
   * Loads the YouTube Iframe Player API script dynamically
   */
  private loadYouTubeIframeAPI() {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      this.isYtApiReady = true;
      this.createHiddenYouTubeContainer();
      return;
    }

    const prevOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevOnReady) prevOnReady();
      this.isYtApiReady = true;
      this.createHiddenYouTubeContainer();
      if (this.pendingYtVideoId) {
        this.playYouTubeVideo(this.pendingYtVideoId);
        this.pendingYtVideoId = null;
      }
    };

    if (!document.getElementById('yt-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }

  private createHiddenYouTubeContainer() {
    if (typeof document === 'undefined') return;
    let container = document.getElementById('hidden-youtube-player-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'hidden-youtube-player-container';
      container.style.cssText =
        'position: fixed; bottom: -9999px; left: -9999px; width: 2px; height: 2px; opacity: 0.01; pointer-events: none; z-index: -100;';
      const innerDiv = document.createElement('div');
      innerDiv.id = 'hidden-yt-player-target';
      container.appendChild(innerDiv);
      document.body.appendChild(container);
    }

    if (window.YT && window.YT.Player && !this.ytPlayer) {
      try {
        this.ytPlayer = new window.YT.Player('hidden-yt-player-target', {
          height: '2',
          width: '2',
          videoId: '',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(this.volume * 100);
              if (this.pendingYtVideoId) {
                this.playYouTubeVideo(this.pendingYtVideoId);
                this.pendingYtVideoId = null;
              }
            },
            onStateChange: (event: any) => {
              // 1: PLAYING, 2: PAUSED, 0: ENDED
              if (this.activeSource === 'youtube') {
                if (event.data === 1) {
                  this.isPlaying = true;
                  this.notifyState();
                } else if (event.data === 2 || event.data === 0) {
                  this.isPlaying = false;
                  this.notifyState();
                }
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Player error:', err);
              // Fallback to synth if video fails or blocked
              this.activeSource = 'synth';
              synthAudioPlayer.start();
              this.isPlaying = true;
              this.notifyState();
            },
          },
        });
      } catch (err) {
        console.warn('Could not initialize YT Player:', err);
      }
    }
  }

  private stopAllSources() {
    // 1. Synth
    synthAudioPlayer.stop();

    // 2. HTML5 Audio
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.currentTime = 0;
    }

    // 3. YouTube Player
    if (this.ytPlayer && typeof this.ytPlayer.stopVideo === 'function') {
      try {
        this.ytPlayer.stopVideo();
      } catch (e) {
        // ignore
      }
    }
  }

  private playYouTubeVideo(videoId: string) {
    if (!this.ytPlayer || typeof this.ytPlayer.loadVideoById !== 'function') {
      this.pendingYtVideoId = videoId;
      this.createHiddenYouTubeContainer();
      return;
    }
    try {
      this.ytPlayer.loadVideoById(videoId);
      this.ytPlayer.setVolume(this.volume * 100);
      this.ytPlayer.playVideo();
      this.isPlaying = true;
      this.notifyState();
    } catch (e) {
      console.warn('Error loading YT video:', e);
    }
  }

  public playTrack(track: MusicTrack) {
    this.stopAllSources();
    this.currentTrack = track;

    const source = detectMusicSource(track.url);
    this.activeSource = source;

    if (source === 'youtube') {
      const ytId = track.youtubeId || extractYouTubeVideoId(track.url);
      if (ytId) {
        this.playYouTubeVideo(ytId);
      } else {
        // fallback to synth
        this.activeSource = 'synth';
        synthAudioPlayer.start();
        this.isPlaying = true;
        this.notifyState();
      }
    } else if (source === 'drive') {
      const audioStreamUrl = convertToGoogleDriveDirectAudioUrl(track.url);
      if (this.htmlAudio) {
        this.htmlAudio.src = audioStreamUrl;
        this.htmlAudio.volume = this.volume;
        this.htmlAudio.play().catch((err) => {
          console.warn('Drive audio playback notice:', err);
          this.activeSource = 'synth';
          synthAudioPlayer.start();
        });
        this.isPlaying = true;
        this.notifyState();
      }
    } else if (source === 'mp3') {
      if (this.htmlAudio) {
        this.htmlAudio.src = track.url;
        this.htmlAudio.volume = this.volume;
        this.htmlAudio.play().catch((err) => {
          console.warn('MP3 playback notice:', err);
          this.activeSource = 'synth';
          synthAudioPlayer.start();
        });
        this.isPlaying = true;
        this.notifyState();
      }
    } else {
      // Synth
      synthAudioPlayer.start();
      this.isPlaying = true;
      this.notifyState();
    }
  }

  public togglePlay(currentFallbackTrack?: MusicTrack) {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.currentTrack) {
        this.resume();
      } else if (currentFallbackTrack) {
        this.playTrack(currentFallbackTrack);
      } else {
        // start synth
        this.activeSource = 'synth';
        synthAudioPlayer.start();
        this.isPlaying = true;
        this.notifyState();
      }
    }
  }

  public pause() {
    this.isPlaying = false;

    if (this.activeSource === 'synth') {
      synthAudioPlayer.stop();
    } else if (this.activeSource === 'youtube') {
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        this.ytPlayer.pauseVideo();
      }
    } else {
      if (this.htmlAudio) {
        this.htmlAudio.pause();
      }
    }

    this.notifyState();
  }

  public resume() {
    if (!this.currentTrack) {
      synthAudioPlayer.start();
      this.activeSource = 'synth';
      this.isPlaying = true;
      this.notifyState();
      return;
    }

    this.isPlaying = true;

    if (this.activeSource === 'synth') {
      synthAudioPlayer.start();
    } else if (this.activeSource === 'youtube') {
      if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
        this.ytPlayer.playVideo();
      }
    } else {
      if (this.htmlAudio) {
        this.htmlAudio.play().catch((e) => console.warn(e));
      }
    }

    this.notifyState();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));

    synthAudioPlayer.setVolume(this.volume);

    if (this.htmlAudio) {
      this.htmlAudio.volume = this.volume;
    }

    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      this.ytPlayer.setVolume(this.volume * 100);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  public subscribeState(listener: (isPlaying: boolean, track: MusicTrack | null) => void) {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
    };
  }

  private notifyState() {
    this.onStateChangeListeners.forEach((l) => l(this.isPlaying, this.currentTrack));
  }
}

export const musicController = new UnifiedMusicController();
