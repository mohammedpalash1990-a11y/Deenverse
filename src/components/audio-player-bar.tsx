"use client";

import { useEffect, useRef, useState } from "react";
import { QARI_LIST, getQariById, type Qari } from "@/data/qari-catalogue";
import { QURAN_SURAHS, type QuranSurah } from "@/data/quran-surahs";
import { saveLocalAudioState } from "@/lib/user-store";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  X,
  Headphones
} from "lucide-react";

interface AudioPlayerBarProps {
  currentSurahNumber?: number;
  onSurahChange?: (surahNumber: number) => void;
}

export function AudioPlayerBar({
  currentSurahNumber = 1,
  onSurahChange
}: AudioPlayerBarProps) {
  const [surahNum, setSurahNum] = useState<number>(currentSurahNumber);
  const [selectedQari, setSelectedQari] = useState<Qari>(QARI_LIST[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isExpanded, setIsExpanded] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (currentSurahNumber && currentSurahNumber !== surahNum) {
      setSurahNum(currentSurahNumber);
    }
  }, [currentSurahNumber]);

  const currentSurah = QURAN_SURAHS.find((s: QuranSurah) => s.number === surahNum) || QURAN_SURAHS[0];
  const audioSrc = selectedQari.getSurahAudioUrl(surahNum);

  // Sync MediaSession
  useEffect(() => {
    if (typeof window !== "undefined" && "mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `সূরা ${currentSurah.nameBengali} (${currentSurah.nameArabic})`,
        artist: selectedQari.nameBengali,
        album: "আল-কুরআনুল কারীম · DEENVERSE",
        artwork: [
          { src: "/icon.svg", sizes: "512x512", type: "image/svg+xml" }
        ]
      });

      navigator.mediaSession.setActionHandler("play", () => {
        audioRef.current?.play();
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => handlePrev());
      navigator.mediaSession.setActionHandler("nexttrack", () => handleNext());
    }
  }, [currentSurah, selectedQari, surahNum]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handlePrev = () => {
    const next = surahNum > 1 ? surahNum - 1 : 114;
    setSurahNum(next);
    onSurahChange?.(next);
  };

  const handleNext = () => {
    const next = surahNum < 114 ? surahNum + 1 : 1;
    setSurahNum(next);
    onSurahChange?.(next);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const onAudioEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        aria-label="Open audio player"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#047857",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "52px",
          height: "52px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100
        }}
      >
        <Headphones size={22} />
      </button>
    );
  }

  return (
    <aside
      aria-label="Quran Audio Player"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--surface, #1e1e24)",
        borderTop: "1px solid var(--border, #333)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.18)",
        padding: "10px 16px",
        zIndex: 90,
        color: "inherit"
      }}
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            saveLocalAudioState({
              userId: "guest",
              qariId: selectedQari.id,
              qariName: selectedQari.nameBengali,
              surahNumber: surahNum,
              positionSeconds: Math.floor(audioRef.current.currentTime),
              updatedAt: new Date().toISOString()
            });
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            audioRef.current.playbackRate = playbackSpeed;
            audioRef.current.volume = isMuted ? 0 : volume;
            if (isPlaying) {
              audioRef.current.play().catch(() => {});
            }
          }
        }}
        onEnded={onAudioEnded}
      />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        {/* Track Metadata and Qari Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "220px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "8px",
              background: "rgba(4, 120, 87, 0.15)",
              color: "#047857",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "14px"
            }}
          >
            {surahNum}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>{currentSurah.nameBengali}</span>
              <span lang="ar" style={{ fontFamily: "'Amiri', serif", color: "#047857", fontSize: "16px" }}>
                ({currentSurah.nameArabic})
              </span>
            </div>
            {/* Qari selector */}
            <select
              value={selectedQari.id}
              onChange={(e) => setSelectedQari(getQariById(e.target.value))}
              aria-label="Select Qari"
              style={{
                fontSize: "11px",
                background: "transparent",
                border: "none",
                color: "var(--muted, #888)",
                cursor: "pointer",
                padding: "2px 0"
              }}
            >
              {QARI_LIST.map((q) => (
                <option key={q.id} value={q.id} style={{ background: "var(--surface, #222)", color: "#fff" }}>
                  ক্বারী: {q.nameBengali} ({q.nameEnglish})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Player Controls & Scrubber */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 360px", maxWidth: "600px" }}>
          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "4px" }}>
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              title={isRepeat ? "রিপিট বন্ধ করুন" : "সূরা রিপিট করুন"}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: isRepeat ? "#047857" : "var(--muted, #888)",
                padding: "4px"
              }}
            >
              <Repeat size={16} />
            </button>

            <button
              onClick={handlePrev}
              title="পূর্ববর্তী সূরা"
              aria-label="Previous Surah"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", padding: "4px" }}
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
              style={{
                background: "#047857",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(4, 120, 87, 0.4)"
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: "2px" }} />}
            </button>

            <button
              onClick={handleNext}
              title="পরবর্তী সূরা"
              aria-label="Next Surah"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", padding: "4px" }}
            >
              <SkipForward size={18} />
            </button>

            <button
              onClick={handleSpeedToggle}
              title="প্লেব্যাক স্পিড পরিবর্তন"
              style={{
                background: "transparent",
                border: "1px solid var(--border, #444)",
                borderRadius: "4px",
                padding: "2px 6px",
                fontSize: "11px",
                cursor: "pointer",
                color: "var(--muted, #888)"
              }}
            >
              {playbackSpeed}x
            </button>
          </div>

          {/* Scrubber bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", fontSize: "11px", color: "var(--muted, #888)" }}>
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Audio scrubber"
              style={{
                flex: 1,
                height: "4px",
                borderRadius: "2px",
                cursor: "pointer",
                accentColor: "#047857"
              }}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Close */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (audioRef.current) audioRef.current.muted = !isMuted;
            }}
            title={isMuted ? "শব্দ চালু" : "মিউট"}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted, #888)" }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              setIsMuted(false);
              if (audioRef.current) {
                audioRef.current.volume = v;
                audioRef.current.muted = false;
              }
            }}
            aria-label="Volume slider"
            style={{ width: "60px", height: "4px", cursor: "pointer", accentColor: "#047857" }}
          />

          <button
            onClick={() => setIsExpanded(false)}
            title="প্লেয়ার মিনিমাইজ করুন"
            aria-label="Minimize player"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted, #888)", marginLeft: "6px" }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
