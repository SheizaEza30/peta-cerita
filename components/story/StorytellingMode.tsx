"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  X,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

type StorytellingModeProps = {
  title: string;
  content: string;
  heroImage: string | null;
  category: { name: string; color: string | null } | null;
  open: boolean;
  onClose: () => void;
};

export function StorytellingMode({
  title,
  content,
  heroImage,
  category,
  open,
  onClose,
}: StorytellingModeProps) {
  // Pecah konten jadi paragraf
  const paragraphs = useMemo(
    () => content.split("\n\n").filter((p) => p.trim()),
    [content]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  const { state, isSupported, voices, speak, pause, resume, stop } = useSpeech();

  // TTS otomatis saat index berubah
  useEffect(() => {
    if (!open || !isSupported) return;
    const text = paragraphs[currentIndex];
    if (!text) return;

    speak(text, { rate: speed, voice: selectedVoice || undefined });
  }, [currentIndex, open, isSupported, paragraphs, speed, selectedVoice, speak]);

  // Stop saat tutup
  useEffect(() => {
    if (!open) {
      stop();
      setCurrentIndex(0);
    }
  }, [open, stop]);

  // Keyboard shortcut: Space = play/pause, Esc = close
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " ") {
        e.preventDefault();
        if (state === "speaking") {
          pause();
        } else if (state === "paused") {
          resume();
        }
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((i) => Math.min(i + 1, paragraphs.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => Math.max(i - 1, 0));
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, state, paragraphs.length, pause, resume, onClose]);

  if (!open) return null;

  const isPlaying = state === "speaking";
  const isPaused = state === "paused";
  const progress = ((currentIndex + 1) / paragraphs.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Background image */}
      {heroImage ? (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={title}
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-800" />
      )}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {category && (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{
                backgroundColor: `${category.color ?? "#1f9d69"}cc`,
              }}
            >
              {category.name}
            </span>
          )}
          <span className="text-xs text-white/60">
            Paragraf {currentIndex + 1} / {paragraphs.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10"
          aria-label="Tutup mode dongeng"
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mx-4 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-primary transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Subtitle / text */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-8">
        <p
          className={cn(
            "max-w-3xl text-center font-serif text-lg leading-relaxed text-white text-shadow md:text-2xl",
            isPlaying && "animate-pulse-slow"
          )}
        >
          {paragraphs[currentIndex]}
        </p>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 border-t border-white/10 bg-black/40 p-4 backdrop-blur">
        {/* Title */}
        <p className="mb-3 truncate text-center text-sm font-medium text-white/80">
          {title}
        </p>

        {/* Control row */}
        <div className="mx-auto flex max-w-md items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            disabled={currentIndex === 0}
            className="text-white hover:bg-white/10 disabled:opacity-30"
            aria-label="Paragraf sebelumnya"
          >
            <SkipBack className="size-5" />
          </Button>

          <Button
            size="icon"
            onClick={() => {
              if (isPlaying) pause();
              else if (isPaused) resume();
            }}
            disabled={!isSupported}
            className="size-14 rounded-full bg-primary hover:bg-primary/90"
            aria-label={isPlaying ? "Jeda" : "Putar"}
          >
            {isPlaying ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setCurrentIndex((i) => Math.min(i + 1, paragraphs.length - 1))
            }
            disabled={currentIndex === paragraphs.length - 1}
            className="text-white hover:bg-white/10 disabled:opacity-30"
            aria-label="Paragraf berikutnya"
          >
            <SkipForward className="size-5" />
          </Button>
        </div>

        {/* Speed & Voice */}
        <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <Volume2 className="size-4 text-white/60" />
            <Select
              value={String(speed)}
              onValueChange={(v) => setSpeed(Number(v))}
            >
              <SelectTrigger className="h-8 w-20 border-white/20 bg-white/5 text-xs text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {voices.length > 0 && (
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="h-8 flex-1 border-white/20 bg-white/5 text-xs text-white">
                <SelectValue placeholder="Pilih suara" />
              </SelectTrigger>
              <SelectContent>
                {voices
                  .filter((v) => v.lang.startsWith("id") || v.lang.startsWith("en"))
                  .slice(0, 10)
                  .map((v) => (
                    <SelectItem key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {!isSupported && (
          <p className="mt-3 text-center text-xs text-red-400">
            Browser Anda tidak mendukung text-to-speech. Coba Chrome atau Edge terbaru.
          </p>
        )}
      </div>
    </div>
  );
}