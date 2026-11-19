"use client";

import { useState } from "react";
import { ADHKAR_LIST, type DhikrItem } from "@/data/adhkar-data";
import { Bookmark, Check, Copy, RotateCcw, Sparkles } from "lucide-react";
import { isBookmarked, toggleBookmark } from "@/lib/user-store";

export function DuasView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkUpdate, setBookmarkUpdate] = useState(0);

  const categories = [
    { id: "all", label: "সকল দো‘আ ও যিকির" },
    { id: "morning", label: "সকালের যিকির" },
    { id: "evening", label: "সন্ধ্যার যিকির" },
    { id: "salah", label: "নামাযের পর" },
    { id: "sleep", label: "ঘুমানোর দো‘আ" },
    { id: "anxiety", label: "বিপদ ও দুশ্চিন্তা" },
    { id: "daily", label: "দৈনন্দিন" }
  ];

  const filteredItems = ADHKAR_LIST.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.titleBengali.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translationBengali.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.arabicText.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const incrementCount = (id: string, target: number) => {
    setCounts((prev) => {
      const current = prev[id] || 0;
      const next = current + 1;
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          if (next >= target) {
            navigator.vibrate([100, 50, 100]);
          } else {
            navigator.vibrate(20);
          }
        } catch {
          // Ignore vibration errors
        }
      }
      return { ...prev, [id]: next };
    });
  };

  const resetCount = (id: string) => {
    setCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  const copyDhikr = (item: DhikrItem) => {
    const text = `${item.titleBengali}\n\n${item.arabicText}\n\nউচ্চারণ: ${item.transliteration}\n\nঅর্থ: ${item.translationBengali}\n\nসূত্র: ${item.reference}\n(Deenverse - এক মহাবিশ্ব, অসীম জ্ঞান)`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleBookmark = (item: DhikrItem) => {
    toggleBookmark({
      type: "dua",
      title: item.titleBengali,
      arabicText: item.arabicText,
      translation: item.translationBengali,
      reference: item.reference,
      itemId: item.id
    });
    setBookmarkUpdate((prev) => prev + 1);
  };

  return (
    <div className="duas-view-wrapper" style={{ marginTop: "24px" }}>
      {/* Search and Filters */}
      <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="যিকির বা দো‘আ খুঁজুন (বাংলা, আরবি বা ইংরেজি)..."
          aria-label="Search Duas and Adhkar"
          style={{
            flex: "1 1 280px",
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid var(--border, #ddd)",
            background: "var(--surface, #fff)",
            color: "inherit",
            fontSize: "14px"
          }}
        />

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                cursor: "pointer",
                border: selectedCategory === cat.id ? "1px solid #047857" : "1px solid var(--border, #ddd)",
                background: selectedCategory === cat.id ? "rgba(4, 120, 87, 0.1)" : "var(--surface, #fff)",
                color: selectedCategory === cat.id ? "#047857" : "inherit",
                fontWeight: selectedCategory === cat.id ? "600" : "normal"
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dhikr Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {filteredItems.map((item) => {
          const currentCount = counts[item.id] || 0;
          const isComplete = currentCount >= item.targetCount;
          const bookmarked = isBookmarked("dua", item.id);

          return (
            <article
              key={item.id}
              style={{
                padding: "clamp(16px, 3vw, 24px)",
                borderRadius: "14px",
                border: "1px solid var(--border, #ddd)",
                background: "var(--surface, #fff)",
                position: "relative"
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted, #666)" }}>
                    {item.categoryBengali} · লক্ষ্য: {item.targetCount} বার
                  </span>
                  <h3 style={{ margin: "4px 0 0", fontSize: "18px" }}>{item.titleBengali}</h3>
                  <small style={{ color: "var(--muted, #666)" }}>{item.titleEnglish}</small>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => handleToggleBookmark(item)}
                    title={bookmarked ? "বুকমার্ক সরানো হয়েছে" : "বুকমার্ক করুন"}
                    aria-label={`Bookmark ${item.titleBengali}`}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border, #ddd)",
                      borderRadius: "6px",
                      padding: "6px 8px",
                      cursor: "pointer",
                      color: bookmarked ? "#D97706" : "inherit"
                    }}
                  >
                    <Bookmark size={15} fill={bookmarked ? "#D97706" : "none"} />
                  </button>
                  <button
                    onClick={() => copyDhikr(item)}
                    title="কপি করুন"
                    aria-label={`Copy ${item.titleBengali}`}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border, #ddd)",
                      borderRadius: "6px",
                      padding: "6px 8px",
                      cursor: "pointer"
                    }}
                  >
                    {copiedId === item.id ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>

              {/* Arabic Scripture */}
              <p
                lang="ar"
                dir="rtl"
                style={{
                  fontFamily: "'Amiri', 'Traditional Arabic', serif",
                  fontSize: "clamp(22px, 3.5vw, 28px)",
                  lineHeight: "2.1",
                  margin: "16px 0",
                  textAlign: "right",
                  color: "var(--arabic-color, #111)"
                }}
              >
                {item.arabicText}
              </p>

              {/* Transliteration */}
              <p style={{ fontSize: "13px", fontStyle: "italic", color: "var(--muted, #555)", margin: "0 0 10px", lineHeight: "1.6" }}>
                <strong>উচ্চারণ:</strong> {item.transliteration}
              </p>

              {/* Bengali Meaning */}
              <p style={{ fontSize: "14px", lineHeight: "1.7", margin: "0 0 14px" }}>
                <strong>অর্থ:</strong> {item.translationBengali}
              </p>

              {/* Virtue if present */}
              {item.virtue && (
                <div style={{ background: "rgba(217, 119, 6, 0.08)", borderLeft: "3px solid #D97706", padding: "8px 12px", borderRadius: "0 8px 8px 0", fontSize: "12px", margin: "10px 0 16px", lineHeight: "1.6" }}>
                  <strong>ফজিলত:</strong> {item.virtue}
                </div>
              )}

              {/* Reference */}
              <p style={{ fontSize: "11px", color: "var(--muted, #777)", margin: "0 0 16px" }}>
                <strong>সূত্র:</strong> {item.reference}
              </p>

              {/* Digital Tasbeeh Counter Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--border, #eee)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => incrementCount(item.id, item.targetCount)}
                    style={{
                      background: isComplete ? "#047857" : "var(--primary-btn-bg, #1a1a1a)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "8px 20px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "transform 0.1s ease, background 0.2s"
                    }}
                  >
                    <span>ডিজিটাল তাসবীহ</span>
                    <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>
                      {currentCount} / {item.targetCount}
                    </span>
                  </button>

                  {currentCount > 0 && (
                    <button
                      onClick={() => resetCount(item.id)}
                      title="কাউন্টার রিসেট"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border, #ddd)",
                        borderRadius: "8px",
                        padding: "8px 10px",
                        cursor: "pointer",
                        color: "var(--muted, #666)"
                      }}
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>

                {isComplete && (
                  <span style={{ fontSize: "12px", color: "#047857", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Sparkles size={14} /> আলহামদুলিল্লাহ, পাঠ সম্পন্ন হয়েছে!
                  </span>
                )}
              </div>
            </article>
          );
        })}

        {filteredItems.length === 0 && (
          <p style={{ textAlign: "center", padding: "40px", color: "var(--muted, #666)" }}>
            কোনো দো‘আ বা যিকির পাওয়া যায়নি।
          </p>
        )}
      </div>
    </div>
  );
}
