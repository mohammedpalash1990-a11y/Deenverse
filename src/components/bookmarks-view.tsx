"use client";

import { useEffect, useState } from "react";
import { loadLocalBookmarks, saveLocalBookmarks, type UserBookmark } from "@/lib/user-store";
import { Bookmark, Trash2, Copy, Check, ExternalLink } from "lucide-react";

interface BookmarksViewProps {
  onSelectSurah?: (surah: number, ayah?: number) => void;
}

export function BookmarksView({ onSelectSurah }: BookmarksViewProps) {
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [filterType, setFilterType] = useState<"all" | "ayah" | "hadith" | "dua">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setBookmarks(loadLocalBookmarks());
  }, []);

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    saveLocalBookmarks(updated);
  };

  const copyBookmark = (item: UserBookmark) => {
    const text = `${item.title}\n${item.arabicSnippet || ""}\n${item.note || ""}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = bookmarks.filter((b) => filterType === "all" || b.itemType === filterType);

  return (
    <div className="bookmarks-view" style={{ marginTop: "24px" }}>
      {/* Filter Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { id: "all", label: `সকল (${bookmarks.length})` },
            { id: "ayah", label: `কুরআন আয়াত (${bookmarks.filter((b) => b.itemType === "ayah").length})` },
            { id: "hadith", label: `হাদিস (${bookmarks.filter((b) => b.itemType === "hadith").length})` },
            { id: "dua", label: `দো‘আ ও যিকির (${bookmarks.filter((b) => b.itemType === "dua").length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as typeof filterType)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
                border: filterType === tab.id ? "1px solid #047857" : "1px solid var(--border, #ddd)",
                background: filterType === tab.id ? "rgba(4, 120, 87, 0.1)" : "var(--surface, #fff)",
                color: filterType === tab.id ? "#047857" : "inherit",
                fontWeight: filterType === tab.id ? "600" : "normal"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks List */}
      {filtered.length === 0 ? (
        <section
          style={{
            padding: "48px 24px",
            textAlign: "center",
            borderRadius: "14px",
            border: "1px dashed var(--border, #ddd)",
            background: "var(--surface, #fff)"
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "12px", color: "var(--muted, #888)" }}>◇</div>
          <h3 style={{ margin: "0 0 8px" }}>এখনো কোনো বুকমার্ক সংরক্ষিত নেই</h3>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--muted, #666)" }}>
            কুরআন পাঠ, হাদিস বা দো‘আ পড়ার সময় বুকমার্ক আইকনে ক্লিক করে এখানে সহজে সংরক্ষণ করতে পারেন।
          </p>
        </section>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((item) => (
            <article
              key={item.id}
              style={{
                padding: "20px",
                borderRadius: "14px",
                border: "1px solid var(--border, #ddd)",
                background: "var(--surface, #fff)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: item.itemType === "ayah" ? "#047857" : item.itemType === "hadith" ? "#B45309" : "#4338CA"
                    }}
                  >
                    {item.itemType === "ayah" ? "কুরআন আয়াত" : item.itemType === "hadith" ? "হাদিস শরীফ" : "দো‘আ"}
                  </span>
                  <h4 style={{ margin: "4px 0 0", fontSize: "16px" }}>{item.title}</h4>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => copyBookmark(item)}
                    title="কপি করুন"
                    style={{ background: "transparent", border: "1px solid var(--border, #ddd)", borderRadius: "6px", padding: "6px 8px", cursor: "pointer" }}
                  >
                    {copiedId === item.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => removeBookmark(item.id)}
                    title="বুকমার্ক মুছুন"
                    style={{ background: "transparent", border: "1px solid var(--border, #ddd)", borderRadius: "6px", padding: "6px 8px", cursor: "pointer", color: "#DC2626" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {item.arabicSnippet && (
                <p
                  lang="ar"
                  dir="rtl"
                  style={{
                    fontFamily: "'Amiri', serif",
                    fontSize: "20px",
                    lineHeight: "1.9",
                    margin: "10px 0",
                    textAlign: "right",
                    color: "var(--arabic-color, #222)"
                  }}
                >
                  {item.arabicSnippet}
                </p>
              )}

              {item.note && (
                <p style={{ fontSize: "13px", lineHeight: "1.6", margin: "6px 0", color: "var(--text, #333)" }}>
                  {item.note}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border, #eee)", fontSize: "11px", color: "var(--muted, #777)" }}>
                <span>সংরক্ষণ: {new Date(item.createdAt).toLocaleDateString()}</span>
                {item.itemType === "ayah" && item.surahNumber && onSelectSurah && (
                  <button
                    onClick={() => onSelectSurah(item.surahNumber!, item.ayahNumber)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#047857",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    আয়াতে যান <ExternalLink size={12} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
