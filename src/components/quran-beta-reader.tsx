"use client";

import { useEffect, useMemo, useState } from "react";

const ARABIC_SOURCE = "https://raw.githubusercontent.com/mohammedpalash1990-a11y/Deenverse/main/data/quran/tanzil/quran-uthmani.txt";
const ZAIN_ABU_KAUTSAR_LIBRARY = "https://audiomack.com/gjpakstheemai/album/full-quran-by-zain-abu-kautsar";

type ArabicAyah = { surah: number; ayah: number; text: string };
type Reciter = { id: string; name: string; folder?: string; external?: string };

const RECITERS: Reciter[] = [
  { id: "mishary", name: "মিশারি রাশিদ আল-আফাসি", folder: "Alafasy_128kbps" },
  { id: "sudais", name: "আবদুর রহমান আস-সুদাইস", folder: "Abdurrahmaan_As-Sudais_192kbps" },
  { id: "shatri", name: "আবু বকর আশ-শাতরি", folder: "Abu_Bakr_Ash-Shaatree_128kbps" },
  { id: "zain", name: "জাইন আবু কাওসার", external: ZAIN_ABU_KAUTSAR_LIBRARY }
];

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
  for (const line of source.split(/\\r?\\n/)) {
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

function audioUrl(folder: string, surah: number, ayah: number): string {
  const fileName = `${String(surah).padStart(3, "0")}${String(ayah).padStart(3, "0")}.mp3`;
  return `https://everyayah.com/data/${folder}/${fileName}`;
}

export function QuranBetaReader() {
  const [surah, setSurah] = useState(1);
  const [reciterId, setReciterId] = useState("mishary");
  const [arabic, setArabic] = useState<ArabicAyah[] | null>(null);
  const [arabicError, setArabicError] = useState("");
  const [loadingArabic, setLoadingArabic] = useState(true);

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

  const surahAyahs = useMemo(() => arabic?.filter((item) => item.surah === surah) ?? [], [arabic, surah]);
  const selectedReciter = RECITERS.find((reciter) => reciter.id === reciterId) ?? RECITERS[0];

  return (
    <section aria-labelledby="full-quran-reader-title" style={{ marginTop: 28 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 18 }}>
        <div>
          <p className="eyebrow">QURAN · ARABIC & AUDIO</p>
          <h2 id="full-quran-reader-title" style={{ margin: "5px 0", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>আল-কুরআন — আরবি তিলাওয়াত</h2>
          <p style={{ margin: 0, color: "var(--muted, #777)", fontSize: 13 }}>Tanzil Uthmani 1.1 · ১১৪টি সূরা · ৬,২৩৬টি আয়াত</p>
        </div>
        <label style={{ display: "grid", gap: 6, minWidth: 190 }}>
          <span style={{ fontSize: 13 }}>সূরা নির্বাচন</span>
          <select value={surah} onChange={(event) => setSurah(Number(event.target.value))} aria-label="সূরা নির্বাচন" style={{ padding: "11px 13px", borderRadius: 10, border: "1px solid var(--border, #ccc)", background: "var(--surface, #fff)", color: "inherit" }}>
            {SURAH_NAMES.map((name, index) => <option key={name} value={index + 1}>{index + 1}. {name}</option>)}
          </select>
        </label>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 12, padding: 14, border: "1px solid var(--border, #ddd)", borderRadius: 12, marginBottom: 18 }}>
        <div style={{ display: "grid", gap: 8, flex: "1 1 100%" }}>
          <span style={{ fontSize: 13 }}>কারি নির্বাচন — ১ থেকে ৪</span>
          <div role="group" aria-label="ক্রমিক কারি অডিও নির্বাচন" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 9 }}>
            {RECITERS.map((reciter, index) => {
              const active = reciterId === reciter.id;
              return (
                <button key={reciter.id} type="button" aria-pressed={active} onClick={() => setReciterId(reciter.id)} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "12px 13px", borderRadius: 11, border: active ? "2px solid var(--accent, #987447)" : "1px solid var(--border, #ccc)", background: active ? "var(--surface, #fff)" : "transparent", color: "inherit", cursor: "pointer" }}>
                  <span style={{ display: "inline-grid", placeItems: "center", flex: "0 0 28px", width: 28, height: 28, borderRadius: "50%", background: active ? "var(--accent, #987447)" : "var(--border, #e5e1da)", color: active ? "#fff" : "inherit", fontWeight: 700 }}>{index + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{reciter.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        {selectedReciter.external ? (
          <a href={selectedReciter.external} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: "11px 15px", borderRadius: 10, border: "1px solid var(--border, #ccc)", color: "inherit", textDecoration: "none" }}>
            জাইন আবু কাওসারের অডিও শুনুন ↗
          </a>
        ) : (
          <p style={{ margin: 0, color: "var(--muted, #777)", fontSize: 12, flex: "1 1 100%" }}>প্রতিটি আয়াতের নিচে প্লে চাপলে নির্বাচিত কারির তিলাওয়াত শুনতে পারবেন।</p>
        )}
      </div>

      {loadingArabic && <p role="status">সম্পূর্ণ আরবি কুরআন লোড হচ্ছে…</p>}
      {arabicError && <p role="alert" style={{ color: "#b42318" }}>{arabicError}</p>}

      {arabic && !arabicError && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12, fontSize: 13, color: "var(--muted, #777)" }}>
            <span>সূরা {surah}: {surahAyahs.length} আয়াত</span>
            <span>{selectedReciter.name}</span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {surahAyahs.map((row) => (
              <article key={`${row.surah}:${row.ayah}`} style={{ border: "1px solid var(--border, #e4e0d8)", borderRadius: 14, padding: "18px clamp(14px, 3vw, 24px)", background: "var(--surface, #fff)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--muted, #777)" }}>আয়াত {row.ayah}</span>
                  <span aria-label={`Surah ${surah}, Ayah ${row.ayah}`} style={{ border: "1px solid var(--border, #ddd)", borderRadius: 20, padding: "3px 9px", fontSize: 12 }}>{surah}:{row.ayah}</span>
                </div>
                <p lang="ar" dir="rtl" style={{ fontFamily: "serif", fontSize: "clamp(1.55rem, 4.8vw, 2.2rem)", lineHeight: 2, textAlign: "right", margin: "8px 0 18px", color: "var(--foreground, #25231f)" }}>{row.text}</p>
                {selectedReciter.folder ? (
                  <audio controls preload="none" aria-label={`${selectedReciter.name}, Surah ${surah}, Ayah ${row.ayah}`} style={{ width: "100%" }} src={audioUrl(selectedReciter.folder, surah, row.ayah)}>
                    আপনার ব্রাউজার অডিও চালাতে পারছে না।
                  </audio>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted, #777)" }}>জাইন আবু কাওসারের তিলাওয়াতের জন্য উপরের অডিও লাইব্রেরি খুলুন।</p>
                )}
              </article>
            ))}
          </div>
          <div style={{ marginTop: 18, padding: 14, borderTop: "1px solid var(--border, #ddd)", fontSize: 12, lineHeight: 1.8, color: "var(--muted, #777)" }}>
            <p>আরবি: Tanzil Quran Text, Uthmani, Version 1.1 · <a href="https://tanzil.net/download/" target="_blank" rel="noreferrer">Tanzil উৎস</a> · মূল টেক্সট অপরিবর্তিত রাখা হয়েছে।</p>
            <p>মিশারি, সুদাইস ও শাতরির আয়াতভিত্তিক অডিও: EveryAyah · <a href="https://everyayah.com/" target="_blank" rel="noreferrer">অডিও উৎস</a></p>
            <p>জাইন আবু কাওসার: <a href={ZAIN_ABU_KAUTSAR_LIBRARY} target="_blank" rel="noreferrer">Audiomack-এ পূর্ণ কুরআন অডিও লাইব্রেরি</a>। এটি বাহ্যিক অডিও লাইব্রেরি; এই মুহূর্তে আয়াতভিত্তিক ইন-পেজ প্লেয়ার নয়।</p>
          </div>
        </>
      )}
    </section>
  );
}
