"use client";

import { useEffect, useState, useMemo } from "react";
import { QURAN_SURAHS, type QuranSurah } from "@/data/quran-surahs";
import { JUZ_LIST, type JuzMetadata } from "@/data/juz-index";
import {
  loadLocalReadingPosition,
  saveLocalReadingPosition,
  isBookmarked,
  toggleBookmark,
  loadLocalPreferences,
  saveLocalPreferences,
  type ReadingPosition
} from "@/lib/user-store";
import {
  Play,
  Bookmark,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sliders,
  Share2,
  ExternalLink,
  Volume2
} from "lucide-react";

interface AyahData {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationBengali: string;
  footnotes?: string | null;
}

interface QuranFullReaderProps {
  onPlaySurah?: (surahNumber: number) => void;
  initialSurah?: number;
}

export function QuranFullReader({ onPlaySurah, initialSurah = 1 }: QuranFullReaderProps) {
  const [selectedSurah, setSelectedSurah] = useState<number>(initialSurah);
  const [navMode, setNavMode] = useState<"surah" | "juz">("surah");
  const [searchQuery, setSearchQuery] = useState("");
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User preferences
  const [fontSize, setFontSize] = useState<number>(28);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showFootnotes, setShowFootnotes] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);

  // Tracking
  const [lastPosition, setLastPosition] = useState<ReadingPosition | null>(null);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [bookmarkUpdate, setBookmarkUpdate] = useState(0);

  useEffect(() => {
    const prefs = loadLocalPreferences();
    setFontSize(prefs.arabicFontSize || 28);
    setShowTranslation(prefs.showTranslation !== false);
    setShowFootnotes(prefs.showFootnotes === true);

    const pos = loadLocalReadingPosition();
    if (pos) {
      setLastPosition(pos);
    }
  }, []);

  const currentSurah = useMemo(
    () => QURAN_SURAHS.find((s: QuranSurah) => s.number === selectedSurah) || QURAN_SURAHS[0],
    [selectedSurah]
  );

  // Fetch Surah text and Abu Bakr Zakaria translation
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Persist reading position
    saveLocalReadingPosition({
      userId: "guest",
      surahNumber: currentSurah.number,
      ayahNumber: 1,
      surahNameArabic: currentSurah.nameArabic,
      surahNameEnglish: currentSurah.nameEnglish,
      surahNameBengali: currentSurah.nameBengali,
      updatedAt: new Date().toISOString()
    });

    const fetchSurahData = async () => {
      try {
        // QuranEnc API for Bengali Zakaria translation
        const url = `https://quranenc.com/api/v1/translation/sura/bengali_zakaria/${currentSurah.number}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Could not fetch translation from QuranEnc.");
        }
        const data = await res.json();
        if (cancelled) return;

        if (Array.isArray(data.result)) {
          const mapped: AyahData[] = data.result.map((row: any) => ({
            surahNumber: Number(row.sura),
            ayahNumber: Number(row.aya),
            arabicText: row.arabic_text || "",
            translationBengali: row.translation || "",
            footnotes: row.footnotes || null
          }));
          setAyahs(mapped);
        } else {
          throw new Error("Invalid response format.");
        }
      } catch (err) {
        if (cancelled) return;
        // Fallback placeholder with metadata if network is restricted
        const fallback: AyahData[] = Array.from({ length: currentSurah.ayahCount }, (_, i) => ({
          surahNumber: currentSurah.number,
          ayahNumber: i + 1,
          arabicText: i === 0 && currentSurah.number !== 9 ? "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" : `آية ${i + 1}`,
          translationBengali: "অনুবাদ লোড করা সম্ভব হয়নি। সংযোগ পুনরায় চেষ্টা করুন।"
        }));
        setAyahs(fallback);
        setError("অনলাইন ডেটা সংযোগে সমস্যা হয়েছে। সংযোগ যাচাই করে পুনরায় চেষ্টা করুন।");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSurahData();
    return () => {
      cancelled = true;
    };
  }, [selectedSurah, currentSurah]);

  const filteredSurahs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return QURAN_SURAHS;
    return QURAN_SURAHS.filter(
      (s: QuranSurah) =>
        s.number.toString() === q ||
        s.nameBengali.toLowerCase().includes(q) ||
        s.nameEnglish.toLowerCase().includes(q) ||
        s.nameSimple.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        s.meaningBengali.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const copyAyah = (ayah: AyahData) => {
    const text = `${ayah.arabicText}\n\n${ayah.translationBengali}\n\n[সূরা ${currentSurah.nameBengali} (${currentSurah.nameEnglish}): ${ayah.ayahNumber} — অনুবাদ: ড. আবু বকর মুহাম্মাদ যাকারিয়া]`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(ayah.ayahNumber);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const handleToggleBookmark = (ayah: AyahData) => {
    toggleBookmark({
      type: "ayah",
      title: `সূরা ${currentSurah.nameBengali} : আয়াত ${ayah.ayahNumber}`,
      arabicText: ayah.arabicText,
      translation: ayah.translationBengali,
      reference: `সূরা ${currentSurah.nameBengali} (${currentSurah.number}:${ayah.ayahNumber})`,
      itemId: `ayah-${currentSurah.number}-${ayah.ayahNumber}`,
      surahNumber: currentSurah.number,
      ayahNumber: ayah.ayahNumber
    });
    setBookmarkUpdate((prev) => prev + 1);
  };

  const updateFontSize = (delta: number) => {
    const next = Math.min(44, Math.max(18, fontSize + delta));
    setFontSize(next);
    saveLocalPreferences({ ...loadLocalPreferences(), arabicFontSize: next });
  };

  return (
    <div className="quran-full-reader" style={{ marginTop: "20px" }}>
      {/* Continue Reading Card */}
      {lastPosition && lastPosition.surahNumber !== selectedSurah && (
        <aside
          style={{
            background: "rgba(4, 120, 87, 0.08)",
            border: "1px solid rgba(4, 120, 87, 0.25)",
            borderRadius: "12px",
            padding: "14px 20px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#047857", letterSpacing: "1px", textTransform: "uppercase" }}>
              সর্বশেষ পঠিত স্থান
            </span>
            <div style={{ fontWeight: 600, fontSize: "15px", marginTop: "2px" }}>
              সূরা {lastPosition.surahNameBengali || lastPosition.surahNumber} ({lastPosition.surahNameArabic}) · আয়াত {lastPosition.ayahNumber}
            </div>
          </div>
          <button
            onClick={() => setSelectedSurah(lastPosition.surahNumber)}
            style={{
              background: "#047857",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <BookOpen size={14} /> পড়া চালিয়ে যান
          </button>
        </aside>
      )}

      {/* Surah / Juz Selector Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          background: "var(--surface, #fff)",
          border: "1px solid var(--border, #ddd)",
          borderRadius: "14px",
          padding: "14px 20px",
          marginBottom: "20px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Nav toggle */}
          <div style={{ display: "flex", background: "var(--surface-active, #f0ede6)", borderRadius: "8px", padding: "3px" }}>
            <button
              onClick={() => setNavMode("surah")}
              style={{
                border: "none",
                background: navMode === "surah" ? "var(--surface, #fff)" : "transparent",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: navMode === "surah" ? 600 : "normal",
                cursor: "pointer"
              }}
            >
              সূরা (১১৪)
            </button>
            <button
              onClick={() => setNavMode("juz")}
              style={{
                border: "none",
                background: navMode === "juz" ? "var(--surface, #fff)" : "transparent",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: navMode === "juz" ? 600 : "normal",
                cursor: "pointer"
              }}
            >
              পারা / পারা ভিত্তিক (৩০)
            </button>
          </div>

          {/* Quick Surah Dropdown */}
          <select
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(Number(e.target.value))}
            aria-label="Select Surah"
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border, #ddd)",
              background: "var(--surface, #fff)",
              color: "inherit",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {QURAN_SURAHS.map((s: QuranSurah) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.nameBengali} ({s.nameArabic}) - {s.ayahCount} আয়াত
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls & Font Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => onPlaySurah?.(selectedSurah)}
            title="সম্পূর্ণ সূরা শুনুন"
            style={{
              background: "#047857",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Volume2 size={16} /> তিলাওয়াত শুনুন
          </button>

          <button
            onClick={() => setShowControls(!showControls)}
            title="পঠন সেটিংস"
            aria-label="Reading display settings"
            style={{
              background: showControls ? "rgba(4, 120, 87, 0.1)" : "transparent",
              border: "1px solid var(--border, #ddd)",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer"
            }}
          >
            <Sliders size={16} />
          </button>
        </div>
      </div>

      {/* Reading Customization Bar */}
      {showControls && (
        <div
          style={{
            background: "var(--surface, #fff)",
            border: "1px solid var(--border, #ddd)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            alignItems: "center"
          }}
        >
          {/* Font Size */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600 }}>আরবি ফন্ট সাইজ:</span>
            <button
              onClick={() => updateFontSize(-2)}
              style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid var(--border, #ddd)", background: "transparent", cursor: "pointer", fontWeight: "bold" }}
            >
              A-
            </button>
            <span style={{ fontSize: "13px", minWidth: "36px", textAlign: "center" }}>{fontSize}px</span>
            <button
              onClick={() => updateFontSize(2)}
              style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid var(--border, #ddd)", background: "transparent", cursor: "pointer", fontWeight: "bold" }}
            >
              A+
            </button>
          </div>

          {/* Translation Toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showTranslation}
              onChange={(e) => {
                setShowTranslation(e.target.checked);
                saveLocalPreferences({ ...loadLocalPreferences(), showTranslation: e.target.checked });
              }}
            />
            বাংলা অনুবাদ প্রদর্শন
          </label>

          {/* Footnotes Toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showFootnotes}
              onChange={(e) => {
                setShowFootnotes(e.target.checked);
                saveLocalPreferences({ ...loadLocalPreferences(), showFootnotes: e.target.checked });
              }}
            />
            অনুবাদকের টীকা ও ব্যাখ্যা প্রদর্শন
          </label>
        </div>
      )}

      {/* Surah Details Banner */}
      <header
        style={{
          background: "var(--surface, #fff)",
          border: "1px solid var(--border, #ddd)",
          borderRadius: "16px",
          padding: "24px 28px",
          textAlign: "center",
          marginBottom: "24px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{ fontSize: "12px", color: "var(--muted, #666)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>
          সূরা নং {currentSurah.number} · {currentSurah.revelationType === "makkah" ? "মাক্কী" : "মাদানী"} · {currentSurah.ayahCount} আয়াত · পারা {currentSurah.juzStart}
        </div>

        <h1
          lang="ar"
          dir="rtl"
          style={{
            fontFamily: "'Amiri', 'Traditional Arabic', serif",
            fontSize: "clamp(36px, 6vw, 48px)",
            margin: "8px 0",
            color: "#047857"
          }}
        >
          سُورَةُ {currentSurah.nameArabic}
        </h1>

        <div style={{ fontSize: "18px", fontWeight: "bold" }}>{currentSurah.nameBengali}</div>
        <p style={{ margin: "4px 0 0", color: "var(--muted, #666)", fontSize: "13px" }}>
          {currentSurah.meaningBengali} ({currentSurah.nameEnglish})
        </p>

        {/* Bismillah Header (except Surah 9 At-Tawbah) */}
        {currentSurah.number !== 9 && (
          <div
            lang="ar"
            dir="rtl"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: "clamp(24px, 4vw, 30px)",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px dashed var(--border, #eee)",
              color: "var(--text, #222)"
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}
      </header>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted, #666)" }}>
          <p>যাচাইকৃত কুরআনুল কারীমের পাঠ ও বাংলা অনুবাদ লোড হচ্ছে…</p>
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(220, 38, 38, 0.08)", color: "#DC2626", padding: "14px 20px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* Ayahs Stream */}
      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {ayahs.map((ayah) => {
            const isAyahBookmarked = isBookmarked("ayah", `ayah-${currentSurah.number}-${ayah.ayahNumber}`);

            return (
              <article
                key={ayah.ayahNumber}
                id={`ayah-${ayah.ayahNumber}`}
                style={{
                  background: "var(--surface, #fff)",
                  border: "1px solid var(--border, #ddd)",
                  borderRadius: "14px",
                  padding: "clamp(16px, 3vw, 24px)",
                  position: "relative"
                }}
              >
                {/* Ayah Header Tools */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div
                    style={{
                      background: "rgba(4, 120, 87, 0.1)",
                      color: "#047857",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}
                  >
                    {currentSurah.number}:{ayah.ayahNumber}
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => handleToggleBookmark(ayah)}
                      title={isAyahBookmarked ? "বুকমার্ক সরানো হয়েছে" : "আয়াত বুকমার্ক করুন"}
                      aria-label={`Bookmark Ayah ${ayah.ayahNumber}`}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border, #ddd)",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        cursor: "pointer",
                        color: isAyahBookmarked ? "#D97706" : "inherit"
                      }}
                    >
                      <Bookmark size={15} fill={isAyahBookmarked ? "#D97706" : "none"} />
                    </button>

                    <button
                      onClick={() => copyAyah(ayah)}
                      title="আয়াত ও অনুবাদ কপি করুন"
                      aria-label={`Copy Ayah ${ayah.ayahNumber}`}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border, #ddd)",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        cursor: "pointer"
                      }}
                    >
                      {copiedAyah === ayah.ayahNumber ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>

                {/* Arabic Scripture */}
                <p
                  lang="ar"
                  dir="rtl"
                  style={{
                    fontFamily: "'Amiri', 'Traditional Arabic', serif",
                    fontSize: `${fontSize}px`,
                    lineHeight: "2.3",
                    textAlign: "right",
                    margin: "12px 0 16px",
                    color: "var(--arabic-color, #111)"
                  }}
                >
                  {ayah.arabicText}
                  <span style={{ fontSize: "0.8em", color: "#047857", margin: "0 6px" }}>
                    ۝ {ayah.ayahNumber}
                  </span>
                </p>

                {/* Bengali Translation */}
                {showTranslation && (
                  <div style={{ borderTop: "1px solid var(--border, #eee)", paddingTop: "14px", marginTop: "14px" }}>
                    <p style={{ fontSize: "15px", lineHeight: "1.8", margin: "0 0 8px", color: "var(--text, #222)" }}>
                      {ayah.translationBengali}
                    </p>

                    {/* Footnotes */}
                    {showFootnotes && ayah.footnotes && (
                      <details style={{ marginTop: "8px", fontSize: "12px", color: "var(--muted, #666)" }}>
                        <summary style={{ cursor: "pointer", fontWeight: 600 }}>অনুবাদকের টীকা দেখুন</summary>
                        <div style={{ padding: "8px 12px", background: "var(--surface-active, #f8f8f8)", borderRadius: "6px", marginTop: "4px", lineHeight: "1.6" }}>
                          {ayah.footnotes}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Surah Pagination Footer */}
      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "32px",
          padding: "16px 0",
          borderTop: "1px solid var(--border, #ddd)"
        }}
      >
        <button
          onClick={() => setSelectedSurah((prev) => Math.max(1, prev - 1))}
          disabled={selectedSurah <= 1}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid var(--border, #ddd)",
            background: "var(--surface, #fff)",
            cursor: selectedSurah <= 1 ? "not-allowed" : "pointer",
            opacity: selectedSurah <= 1 ? 0.5 : 1
          }}
        >
          <ChevronLeft size={16} /> পূর্ববর্তী সূরা
        </button>

        <span style={{ fontSize: "13px", fontWeight: 600 }}>
          সূরা {selectedSurah} / ১১৪
        </span>

        <button
          onClick={() => setSelectedSurah((prev) => Math.min(114, prev + 1))}
          disabled={selectedSurah >= 114}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid var(--border, #ddd)",
            background: "var(--surface, #fff)",
            cursor: selectedSurah >= 114 ? "not-allowed" : "pointer",
            opacity: selectedSurah >= 114 ? 0.5 : 1
          }}
        >
          পরবর্তী সূরা <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
}
