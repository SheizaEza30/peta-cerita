import { WebSpeechProvider } from "./webSpeech";
import type { SpeechProvider } from "./provider";

/**
 * Speech service singleton.
 * Ganti provider di sini kalau mau pakai Google TTS / ElevenLabs.
 */
let speechInstance: SpeechProvider | null = null;

export function getSpeech(): SpeechProvider {
  if (!speechInstance) {
    speechInstance = new WebSpeechProvider();
  }
  return speechInstance;
}

export * from "./provider";