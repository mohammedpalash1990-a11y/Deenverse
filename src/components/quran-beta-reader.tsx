"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveApiBaseUrl } from "@/lib/api-config";

const ARABIC_SOURCE = "https://raw.githubusercontent.com/mohammedpalash1990-a11y/Deenverse/main/data/quran/tanzil/quran-uthmani.txt";

type ArabicAyah = { surah: number; ayah: number; text: string };
type BengaliAyah = { surahNumber: number; ayahNumber: number; translation: string; footnotes: unknown };
type TranslationPayload = {
  surahNumber: number;
  ayahs: BengaliAyah[];
  provenance: {
    publisher: string;
    translator: string;
    sourceTitle: string;
    editionVersion: string;
    sourceUrl: string;
    termsUrl: string;
  };
};

const SURAH_NAMES = [
  "আল-ফাতিহা","আল-বাকারা","আলে ইমরান","আন-নিসা","আল-মায়িদা","আল-আনআম","আল-আরাফ","আল-আনফাল","আত-তাওবা","ইউনুস",
  "হুদ","ইউসুফ","আর-রাদ","ইবরাহিম","আল-হিজর","আন-নাহল","আল-ইসরা","আল-কাহফ","মারইয়াম","ত্ব-হা",
  "আল-আম্বিয়া","আল-হজ","আল-মুমিনুন","আন-নূর","আল-ফুরকান","আশ-শুআরা","আন-নামল","আল-কাসাস","আল-আনকাবুত","আর-রূম",
  "লুকমান","আস-সাজদাহ","আল-আহযাব","সাবা","ফাতির","ইয়াসিন","আস-সাফফাত","সোয়াদ","আয-যুমার","গাফির",
  "ফুসসিলাত","আশ-শূরা","আয-যুখরুফ","আদ-দুখান","আল-জাসিয়া","আল-আহকাফ","মুহাম্মদ","আল-ফাতহ","আল-হুজুরাত","কাফ",
  "আয-যারিয়াত","আত-তূর","আন-নাজম","আল-কামার","আর-রহমান","আল-ওয়াকিয়া","আল-হাদিদ","আল-মুজাদিলা","আল-হাশর","আল-মুমতাহিনা",
  "আস-সাফ","আল-জুমুআ","আল-মুনাফিকুন","আত-তাগাবুন","আত-তালাক","আত-তাহরিম","আল-মুলক","আল-কলম","আল-হাক্কাহ","আল-মাআরিজ",
  "নূহ","আল-জিন","আল-মুযযাম্মিল","আল-মুদ্দাসসির","আল-কিয়ামাহ","আল-ইনসান","আল-মুরসালাত","আন-নাবা","আন-নাযিআত","আবাসা",
  "আত-তাকভির","আল-ইনফিতার","আল-মুতাফফিফিন","আল-ইনশিকাক","আল-বুরুজ","আত-তারিক","আল-আলা","আল-গাশিয়াহ","আল-ফজর","আল-বালাদ",
  "আশ-শামস","আল-লাইল","আদ-দুহা","আশ-শারহ","আত-তিন","আল-আলাক","আল-কদর","আল-বাইয়্যিনাহ","আয-যিলযাল","আল-আদিয়াত",
  "আল-কারিআহ","আত-তাকাসুর","আল-আসর","আল-হুমাযাহ","আল-ফিল","কুরাইশ","আল-মাউন","আল-কাউসার","আল-কাফিরুন","আন-নাসর",
  "আল-মাসাদ","আল-ইখলাস","আল-ফালাক","আন-নাস"
];

function parseArabicFile(source: string): ArabicAyah[] {
  const records: ArabicAyah[] = [];
  for (const line of source.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const first = line.indexOf("|");
    const second = line.indexOf("|", first + 1);
    if (first < 1 || second < 0) throw new Error("Tanzil ফাইলের রেকর্ড ফরম্যাট সঠিক নয়।");
    const surah = Number(line.slice(0, first));
    const ayah = Number(line.slice(first + 1, second));
    const text = line.slice(second + 1);
    if (!Number.isInteger(surah) || surah < 1 || surah > 114 ||
        !Number.isInteger(ayah) || ayah < 1 || !text.trim()) {
      throw new Error("Tanzil ফাইলে অবৈধ আয়াত পাওয়া গেছে।");
    }
    records.push({ surah, ayah, text });
  }
  if (records.length !== 6236) throw new Error(`Tanzil ফাইলে ৬,২৩৬টির বদলে ${records.length}টি আয়াত পাওয়া গেছে।`);
  return records;
}

function footnoteText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return JSON.stringify(value, null, 2);
}

export function QuranBetaReader() {
  const [surah, setSurah] = useState(1);
  const [arabic, setArabic] = useState<ArabicAyah[] | null>(null);
  const [translation, setTranslation] = useState<TranslationPayload | null>(null);
  const [arabicError, setArabicError] = useState("");
  const [translationError, setTranslationError] = useState("");
  const [loadingArabic, setLoadingArabic] = useState(true);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(ARABIC_SOURCE, { headers: { Accept: "text/plain" } })
      .then((response) => {
        if (!response.ok) throw new Error("Tanzil-এর আরবি ফাইল লোড করা যায়নি।");
        return response.text();
      })
      .then((text) => {
        const records = parseArabicFile(text);
        if (!cancelled) setArabic(records);
      })
      .catch((error: unknown) => {
        if (!cancelled) setArabicError(error instanceof Error ? error.message : "আরবি পাঠ লোড করা যায়নি।");
      })
      .finally(() => { if (!cancelled) setLoadingArabic(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingTranslation(true);
    setTranslation(null);
    setTranslationError("");
    const base = resolveApiBaseUrl();
    fetch(`${base}/translation/bn/${surah}`, { headers: { Accept: "application/json" } })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          const message = body?.error?.message;
          throw new Error(typeof message === "string" ? message : "বাংলা অনুবাদ পাওয়া যায়নি।");
        }
        const data = body?.data as TranslationPayload | undefined;
        if (!data || data.surahNumber !== surah || !Array.isArray(data.ayahs) ||
            !data.provenance || data.provenance.publisher !== "QuranEnc.com" ||
            data.provenance.editionVersion !== "V1.1.1" ||
            data.ayahs.some((item, index) => item.surahNumber !== surah ||
              item.ayahNumber !== index + 1 || typeof item.translation !== "string" || !item.translation.trim())) {
          throw new Error("QuranEnc-এর অনুবাদ ডেটা যাচাই করা যায়নি।");
        }
        if (!cancelled) setTranslation(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) setTranslationError(error instanceof Error ? error.message : "বাংলা অনুবাদ লোড করা যায়নি।");
      })
      .finally(() => { if (!cancelled) setLoadingTranslation(false); });
    return () => { cancelled = true; };
  }, [surah]);

  const surahAyahs = useMemo(() => arabic?.filter((item) => item.surah === surah) ?? [], [arabic, surah]);
  const rows = useMemo(() => surahAyahs.map((item) => ({
    ...item,
    bengali: translation?.ayahs[item.ayah - 1]
  })), [surahAyahs, translation]);

  return (
    <section aria-labelledby="full-quran-reader-title" style={{ marginTop: 28 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 18 }}>
        <div>
          <p className="eyebrow">PUBLIC BETA · সম্পূর্ণ কুরআন পাঠ</p>
          <h2 id="full-quran-reader-title" style={{ margin: "5px 0", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>আল-কুরআন — আরবি ও বাংলা</h2>
          <p style={{ margin: 0, color: "var(--muted, #777)", fontSize: 13 }}>Tanzil Uthmani 1.1 · ড. আবু বকর মুহাম্মাদ যাকারিয়া · QuranEnc V1.1.1</p>
        </div>
        <label style={{ display: "grid", gap: 6, minWidth: 190 }}>
          <span style={{ fontSize: 13 }}>সূরা নির্বাচন</span>
          <select value={surah} onChange={(event) => setSurah(Number(event.target.value))} aria-label="সূরা নির্বাচন" style={{ padding: "11px 13px", borderRadius: 10, border: "1px solid var(--border, #ccc)", background: "var(--surface, #fff)", color: "inherit" }}>
            {SURAH_NAMES.map((name, index) => <option key={name} value={index + 1}>{index + 1}. {name}</option>)}
          </select>
        </label>
      </div>

      <div style={{ padding: "12px 15px", borderRadius: 12, background: "rgba(180, 145, 80, .09)", border: "1px solid rgba(180, 145, 80, .25)", marginBottom: 18, fontSize: 13, lineHeight: 1.7 }}>
        <strong>পাবলিক বিটা:</strong> পাঠকদের জন্য কনটেন্ট উন্মুক্ত। উৎস ও সংস্করণ উল্লেখ করা হয়েছে। কোনো ভুল বা অসংগতি পেলে রিপোর্ট করুন এবং নির্ভরযোগ্য মুসহাফের সঙ্গে মিলিয়ে পড়ুন।
      </div>

      {loadingArabic && <p role="status">সম্পূর্ণ আরবি কুরআন লোড হচ্ছে…</p>}
      {arabicError && <p role="alert" style={{ color: "#b42318" }}>{arabicError}</p>}
      {loadingTranslation && <p role="status">বাংলা অনুবাদ লোড হচ্ছে…</p>}
      {translationError && <p role="alert" style={{ color: "#b42318" }}>{translationError}</p>}

      {arabic && !arabicError && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12, fontSize: 13, color: "var(--muted, #777)" }}>
            <span>সূরা {surah}: {surahAyahs.length} আয়াত</span>
            <span>{rows.filter((row) => row.bengali).length} / {surahAyahs.length} বাংলা অনুবাদ লোড হয়েছে</span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {rows.map((row) => (
              <article key={`${row.surah}:${row.ayah}`} style={{ border: "1px solid var(--border, #e4e0d8)", borderRadius: 14, padding: "18px clamp(14px, 3vw, 24px)", background: "var(--surface, #fff)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--muted, #777)" }}>আয়াত {row.ayah}</span>
                  <span aria-label={`Surah ${surah}, Ayah ${row.ayah}`} style={{ border: "1px solid var(--border, #ddd)", borderRadius: 20, padding: "3px 9px", fontSize: 12 }}>{surah}:{row.ayah}</span>
                </div>
                <p lang="ar" dir="rtl" style={{ fontFamily: "serif", fontSize: "clamp(1.55rem, 4.8vw, 2.2rem)", lineHeight: 2, textAlign: "right", margin: "8px 0 18px", color: "var(--foreground, #25231f)" }}>{row.text}</p>
                <div style={{ borderTop: "1px solid var(--border, #eee)", paddingTop: 13 }}>
                  <p lang="bn" style={{ fontSize: 16, lineHeight: 1.95, margin: 0, whiteSpace: "pre-wrap" }}>
                    {row.bengali?.translation ?? (loadingTranslation ? "অনুবাদ লোড হচ্ছে…" : "এই আয়াতের অনুবাদ পাওয়া যায়নি।")}
                  </p>
                  {row.bengali && footnoteText(row.bengali.footnotes) && (
                    <details style={{ marginTop: 9, fontSize: 13 }}>
                      <summary>অনুবাদকের টীকা</summary>
                      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.7 }}>{footnoteText(row.bengali.footnotes)}</pre>
                    </details>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 18, padding: 14, borderTop: "1px solid var(--border, #ddd)", fontSize: 12, lineHeight: 1.8, color: "var(--muted, #777)" }}>
            <p>আরবি: Tanzil Quran Text, Uthmani, Version 1.1 · <a href="https://tanzil.net/download/" target="_blank" rel="noreferrer">Tanzil উৎস</a> · মূল টেক্সট অপরিবর্তিত রাখা হয়েছে।</p>
            <p>বাংলা: {translation?.provenance.translator ?? "আবু বকর মুহাম্মাদ যাকারিয়া"} · {translation?.provenance.publisher ?? "QuranEnc.com"} · V1.1.1 · <a href="https://quranenc.com/bn/browse/bengali_zakaria" target="_blank" rel="noreferrer">মূল অনুবাদ</a> · <a href="https://quranenc.com/en/home" target="_blank" rel="noreferrer">প্রকাশের শর্ত</a></p>
          </div>
        </>
      )}
    </section>
  );
}
