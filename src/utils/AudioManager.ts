/**
 * AudioManager - Centralized audio management system for the game
 * Handles background music, sound effects, and audio transitions
 */

export type AudioTrack = 'menu' | 'game';

interface AudioConfig {
  volume: number;
  loop: boolean;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private currentTrack: HTMLAudioElement | null = null;
  private tracks: Map<AudioTrack, HTMLAudioElement> = new Map();
  private masterVolume: number = 0.7;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private fadeInterval: NodeJS.Timeout | null = null;

  // Audio file paths
  private readonly trackPaths: Record<AudioTrack, string> = {
    menu: '/assets/candy-rush-high.mp3',
    game: '/assets/neon-prairie-nights.mp3'
  };

  private constructor() {
    this.initializeAudioContext();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      // Create audio context (required for modern browsers)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Preload audio tracks
      await this.preloadTracks();

      this.isInitialized = true;
      console.log('AudioManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
    }
  }

  private async preloadTracks(): Promise<void> {
    const loadPromises = Object.entries(this.trackPaths).map(async ([trackName, path]) => {
      try {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = this.masterVolume;

        // Wait for the audio to be ready
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true });
          audio.addEventListener('error', reject, { once: true });
          audio.load();
        });

        this.tracks.set(trackName as AudioTrack, audio);
        console.log(`Preloaded audio track: ${trackName}`);
      } catch (error) {
        console.error(`Failed to preload audio track ${trackName}:`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  public async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeAudioContext();
    }

    // Resume audio context if it's suspended (required by browser policies)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Audio context resumed');
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  }

  public async playTrack(
    trackName: AudioTrack,
    config: Partial<AudioConfig> = {}
  ): Promise<void> {
    await this.ensureInitialized();

    const defaultConfig: AudioConfig = {
      volume: this.masterVolume,
      loop: true,
      fadeInDuration: 1000,
      fadeOutDuration: 1000
    };

    const finalConfig = { ...defaultConfig, ...config };

    try {
      // Stop current track if playing
      if (this.currentTrack) {
        await this.stopCurrentTrack(finalConfig.fadeOutDuration);
      }

      const audio = this.tracks.get(trackName);
      if (!audio) {
        console.error(`Audio track not found: ${trackName}`);
        return;
      }

      // Configure audio
      audio.loop = finalConfig.loop;
      audio.volume = this.isMuted ? 0 : 0;

      // Start playing
      await audio.play();
      this.currentTrack = audio;

      // Fade in
      if (finalConfig.fadeInDuration && finalConfig.fadeInDuration > 0) {
        this.fadeIn(audio, finalConfig.volume, finalConfig.fadeInDuration);
      } else {
        audio.volume = this.isMuted ? 0 : finalConfig.volume;
      }

      console.log(`Playing audio track: ${trackName}`);
    } catch (error) {
      console.error(`Failed to play audio track ${trackName}:`, error);
    }
  }

  private async stopCurrentTrack(fadeOutDuration: number = 1000): Promise<void> {
    if (!this.currentTrack) return;

    const audio = this.currentTrack;

    if (fadeOutDuration > 0) {
      await this.fadeOut(audio, fadeOutDuration);
    }

    audio.pause();
    audio.currentTime = 0;
    this.currentTrack = null;
  }

  private fadeIn(audio: HTMLAudioElement, targetVolume: number, duration: number): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    const startVolume = 0;
    const volumeStep = (targetVolume - startVolume) / (duration / 50);
    let currentVolume = startVolume;

    audio.volume = this.isMuted ? 0 : currentVolume;

    this.fadeInterval = setInterval(() => {
      currentVolume += volumeStep;

      if (currentVolume >= targetVolume) {
        currentVolume = targetVolume;
        clearInterval(this.fadeInterval!);
        this.fadeInterval = null;
      }

      audio.volume = this.isMuted ? 0 : currentVolume;
    }, 50);
  }

  private fadeOut(audio: HTMLAudioElement, duration: number): Promise<void> {
    return new Promise((resolve) => {
      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
      }

      const startVolume = audio.volume;
      const volumeStep = startVolume / (duration / 50);
      let currentVolume = startVolume;

      this.fadeInterval = setInterval(() => {
        currentVolume -= volumeStep;

        if (currentVolume <= 0) {
          currentVolume = 0;
          clearInterval(this.fadeInterval!);
          this.fadeInterval = null;
          resolve();
        }

        audio.volume = Math.max(0, currentVolume);
      }, 50);
    });
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));

    if (this.currentTrack && !this.isMuted) {
      this.currentTrack.volume = this.masterVolume;
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    if (this.currentTrack) {
      this.currentTrack.volume = this.isMuted ? 0 : this.masterVolume;
    }

    return this.isMuted;
  }

  public isMutedState(): boolean {
    return this.isMuted;
  }

  public getCurrentTrack(): AudioTrack | null {
    if (!this.currentTrack) return null;

    // Use Array.from to convert the iterator to an array for compatibility
    const trackEntries = Array.from(this.tracks.entries());
    for (const [trackName, audio] of trackEntries) {
      if (audio === this.currentTrack) {
        return trackName;
      }
    }

    return null;
  }

  public stop(): void {
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
      this.currentTrack = null;
    }

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  public destroy(): void {
    this.stop();

    // Clean up all audio elements
    const trackValues = Array.from(this.tracks.values());
    trackValues.forEach(audio => {
      audio.pause();
      audio.src = '';
      audio.load();
    });

    this.tracks.clear();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
  }
}

export default AudioManager;
