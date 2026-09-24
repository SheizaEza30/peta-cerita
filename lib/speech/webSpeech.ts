import type { SpeechProvider, SpeechOptions } from "./provider";

/**
 * Web Speech API Provider.
 * Gratis, pakai TTS bawaan browser.
 */
export class WebSpeechProvider implements SpeechProvider {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  speak(options: SpeechOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error("Web Speech API tidak didukung browser ini"));
        return;
      }

      // Hentikan yang sedang jalan
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(options.text);
      utterance.lang = options.lang ?? "id-ID";
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      // Cari voice yang cocok
      if (options.voice) {
        const voices = this.synth.getVoices();
        const found = voices.find((v) => v.name === options.voice);
        if (found) utterance.voice = found;
      } else {
        // Auto-pilih voice Indonesia kalau ada
        const voices = this.synth.getVoices();
        const idVoice = voices.find((v) => v.lang.startsWith("id"));
        if (idVoice) utterance.voice = idVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        // "interrupted" bukan error sebenarnya (dari cancel)
        if (e.error === "interrupted" || e.error === "canceled") {
          resolve();
        } else {
          reject(new Error(`Speech error: ${e.error}`));
        }
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}