/**
 * Interface SpeechProvider.
 * Abstraction untuk Text-to-Speech.
 * Bisa diimplementasi:
 *   - WebSpeechProvider (browser, gratis)
 *   - GoogleTTSProvider (premium)
 *   - ElevenLabsProvider (premium)
 */
export type SpeechOptions = {
  text: string;
  lang?: string;
  rate?: number; // 0.1 - 10
  pitch?: number; // 0 - 2
  volume?: number; // 0 - 1
  voice?: string;
};

export type SpeechState = "idle" | "speaking" | "paused";

export interface SpeechProvider {
  speak(options: SpeechOptions): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  getVoices(): SpeechSynthesisVoice[];
  isSupported(): boolean;
}