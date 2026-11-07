"use client";

/**
 * Religious text and audio remain unavailable until the exact source artifact,
 * its SHA-256 digest, redistribution rights, and independent approval are
 * verified by the publication pipeline. This component intentionally performs
 * no network request and renders no Quran text or third-party audio.
 */
export function QuranBetaReader() {
  return (
    <section
      role="region"
      aria-label="আল-কুরআন — আরবি ও বাংলা"
      aria-labelledby="quran-reader-title"
      style={{
        marginTop: 28,
        padding: "clamp(18px, 3vw, 28px)",
        border: "1px solid var(--border, #ddd)",
        borderRadius: 14,
        background: "var(--surface, #fff)"
      }}
    >
      <p className="eyebrow">QURAN · PUBLICATION PAUSED</p>
      <h2 id="quran-reader-title" style={{ margin: "5px 0 12px", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
        আল-কুরআন
      </h2>
      <p lang="bn" style={{ margin: 0, lineHeight: 1.9, color: "var(--muted, #777)" }}>
        কুরআনের আরবি পাঠ, অনুবাদ ও তিলাওয়াত সাময়িকভাবে অনুপলব্ধ। নির্দিষ্ট মূল
        উৎসের ফাইল, SHA-256 যাচাই, পুনঃপ্রকাশের অনুমতি এবং স্বাধীন অনুমোদন
        সম্পন্ন না হওয়া পর্যন্ত কোনো ধর্মীয় কনটেন্ট প্রকাশ করা হবে না।
      </p>
      <p role="status" lang="bn" style={{ margin: "14px 0 0", fontSize: 13 }}>
        উৎস ও প্রকাশনা যাচাই চলছে — যাচাই সম্পন্ন না হওয়া পর্যন্ত পাঠ দেখানো হবে না।
      </p>
    </section>
  );
}
