"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSpeech, type SpeechState } from "@/lib/speech";

/**
 * Hook untuk Text-to-Speech.
 * Wrapper di atas speechService dengan state management React.
 */
export function useSpeech() {
  const [state, setState] = useState<SpeechState>("idle");
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentText, setCurrentText] = useState<string>("");
  const speechRef = useRef(getSpeech());

  // Init — cek dukungan & load voices
  useEffect(() => {
    const speech = speechRef.current;
    setIsSupported(speech.isSupported());

    function loadVoices() {
      setVoices(speech.getVoices());
    }

    loadVoices();
    // Beberapa browser load voices async
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      speech.stop();
    };
  }, []);

  const speak = useCallback(
    async (text: string, options?: { rate?: number; voice?: string }) => {
      if (!text.trim()) return;

      setCurrentText(text);
      setState("speaking");

      try {
        await speechRef.current.speak({
          text,
          lang: "id-ID",
          rate: options?.rate ?? 1,
          voice: options?.voice,
        });
        setState("idle");
      } catch (err) {
        console.error("[SPEECH_ERROR]", err);
        setState("idle");
      }
    },
    []
  );

  const pause = useCallback(() => {
    speechRef.current.pause();
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    speechRef.current.resume();
    setState("speaking");
  }, []);

  const stop = useCallback(() => {
    speechRef.current.stop();
    setState("idle");
    setCurrentText("");
  }, []);

  return {
    state,
    isSupported,
    voices,
    currentText,
    speak,
    pause,
    resume,
    stop,
  };
}