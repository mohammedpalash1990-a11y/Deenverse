"use client";

export function QuranBetaReader() {
  return (
    <section
      aria-labelledby="quran-reader-gate-title"
      style={{
        marginTop: 28,
        padding: "clamp(16px, 3vw, 24px)",
        border: "1px solid var(--border, #ddd)",
        borderRadius: 14,
        background: "var(--surface, #fff)"
      }}
    >
      <p className="eyebrow">QURAN · SOURCE APPROVAL PENDING</p>
      <h2
        id="quran-reader-gate-title"
        style={{ margin: "5px 0 12px", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
      >
        আল-কুরআন — যাচাইকৃত পাঠ
      </h2>
      <p role="status" style={{ margin: "0 0 10px", lineHeight: 1.8 }}>
        কুরআনের আরবি পাঠ, বাংলা অনুবাদ ও অডিও এখনো প্রকাশের জন্য অনুমোদিত নয়।
      </p>
      <p style={{ margin: 0, color: "var(--muted, #777)", fontSize: 13, lineHeight: 1.8 }}>
        নির্দিষ্ট উৎস-ফাইলের SHA-256, পুনঃপ্রকাশের অধিকার এবং স্বাধীন মানব-পর্যালোচনা যাচাই না হওয়া পর্যন্ত কোনো ধর্মীয় কনটেন্ট দেখানো হবে না।
      </p>
    </section>
  );
}
