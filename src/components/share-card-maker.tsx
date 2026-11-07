"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type CardKind = "quran" | "hadith";

function wrapText(context: CanvasRenderingContext2D, value: string, maxWidth: number): string[] {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawLines(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  direction: CanvasDirection = "ltr"
): number {
  context.direction = direction;
  const lines = wrapText(context, value, maxWidth);
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight, maxWidth));
  context.direction = "ltr";
  return y + lines.length * lineHeight;
}

export function ShareCardMaker() {
  const [kind, setKind] = useState<CardKind>("quran");
  const [arabic, setArabic] = useState("");
  const [meaning, setMeaning] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function createImage(event: FormEvent<HTMLFormElement>, action: "download" | "share") {
    event.preventDefault();
    if (!meaning.trim() || !reference.trim()) {
      setError("বাংলা অর্থ/বর্ণনা এবং নির্ভুল সূত্র লিখুন।");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("এই ব্রাউজারে ছবি তৈরি করা যাচ্ছে না।");

      const gradient = context.createLinearGradient(0, 0, 1080, 1350);
      gradient.addColorStop(0, "#102b23");
      gradient.addColorStop(1, "#244638");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 1080, 1350);

      context.strokeStyle = "#c9ad73";
      context.lineWidth = 3;
      context.strokeRect(42, 42, 996, 1266);
      context.lineWidth = 1;
      context.strokeRect(58, 58, 964, 1234);

      context.textAlign = "center";
      context.fillStyle = "#e4c98f";
      context.font = "600 34px Arial, sans-serif";
      context.fillText("DEENVERSE", 540, 132);
      context.font = "24px Arial, sans-serif";
      context.fillStyle = "#c9d6cc";
      context.fillText("QURAN  ·  HADITH  ·  GUIDANCE", 540, 174);

      context.fillStyle = "#e3c88c";
      context.font = "600 27px Arial, sans-serif";
      context.fillText(kind === "quran" ? "কোরআনের আয়াত" : "হাদিস শরীফ", 540, 292);
      context.fillStyle = "#d6bd89";
      context.fillRect(420, 320, 240, 2);

      let y = 420;
      if (arabic.trim()) {
        context.fillStyle = "#fff9e9";
        context.font = "52px Georgia, serif";
        y = drawLines(context, arabic.trim(), 540, y, 850, 86, "rtl") + 38;
      }
      context.fillStyle = "#fffaf0";
      context.font = "44px Arial, sans-serif";
      y = drawLines(context, meaning.trim(), 540, y, 850, 76) + 42;

      context.fillStyle = "#d8c18f";
      context.fillRect(190, Math.min(y, 1040), 700, 2);
      context.fillStyle = "#f1dfb8";
      context.font = "28px Arial, sans-serif";
      drawLines(context, reference.trim(), 540, Math.min(y + 65, 1110), 850, 42);

      if (note.trim()) {
        context.fillStyle = "#c5d2c7";
        context.font = "22px Arial, sans-serif";
        drawLines(context, note.trim(), 540, 1180, 850, 32);
      }
      context.fillStyle = "#d8c18f";
      context.font = "24px Arial, sans-serif";
      context.fillText("Read Quran  ·  Follow Sunnah  ·  Spread Goodness", 540, 1260);

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error("ছবি তৈরি করা যায়নি।")), "image/png")
      );
      const file = new File([blob], "deenverse-share-card.png", { type: "image/png" });
      if (action === "share" && navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: "Deenverse", text: reference.trim(), files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (caught) {
      if (caught instanceof Error && caught.name !== "AbortError") setError(caught.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="share-card-maker" aria-labelledby="share-card-title">
      <div className="share-card-heading">
        <p className="eyebrow">CREATE · SAVE · SHARE</p>
        <h2 id="share-card-title">ইসলামিক ফটোকার্ড তৈরি করুন</h2>
        <p>যাচাইকৃত আয়াত বা হাদিসের লেখা ও সূত্র দিয়ে Deenverse ব্র্যান্ডের পোস্টার বানান।</p>
      </div>
      <div className="share-card-preview" aria-label="ফটোকার্ডের ডিজাইন প্রিভিউ">
        <span>DEENVERSE</span>
        <small>{kind === "quran" ? "কোরআনের আয়াত" : "হাদিস শরীফ"}</small>
        <strong>{arabic || "আরবি মূল পাঠ"}</strong>
        <p>{meaning || "এখানে বাংলা অর্থ বা বর্ণনা দেখা যাবে"}</p>
        <small>{reference || "সূত্র / রেফারেন্স"}</small>
        <b>Read Quran · Follow Sunnah · Spread Goodness</b>
      </div>
      <form className="share-card-form" onSubmit={(event) => void createImage(event, "download")}>
        <label>কার্ডের ধরন
          <select value={kind} onChange={(event) => setKind(event.target.value as CardKind)}>
            <option value="quran">কোরআনের আয়াত</option>
            <option value="hadith">হাদিস শরীফ</option>
          </select>
        </label>
        <label>আরবি মূল পাঠ (ঐচ্ছিক)
          <textarea dir="rtl" lang="ar" value={arabic} onChange={(event) => setArabic(event.target.value)} rows={3} placeholder="আরবি মূল পাঠ পেস্ট করুন" />
        </label>
        <label>বাংলা অর্থ / বর্ণনা
          <textarea value={meaning} onChange={(event) => setMeaning(event.target.value)} rows={4} required placeholder="যাচাইকৃত বাংলা অনুবাদ লিখুন" />
        </label>
        <label>সূত্র ও রেফারেন্স
          <input value={reference} onChange={(event) => setReference(event.target.value)} required placeholder="যেমন: সূরা আল-বাকারা ২:১৫৩ / সহিহ বুখারি ..." />
        </label>
        <label>অতিরিক্ত বার্তা (ঐচ্ছিক)
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="ছোট একটি স্মরণিকা" />
        </label>
        {error && <p className="share-card-error" role="alert">{error}</p>}
        <div className="share-card-actions">
          <button type="submit" disabled={busy}>{busy ? "তৈরি হচ্ছে…" : "PNG ছবি ডাউনলোড"}</button>
          <button type="button" disabled={busy} onClick={(event) => {
            const form = event.currentTarget.form;
            if (form) void createImage({ preventDefault: () => undefined } as FormEvent<HTMLFormElement>, "share");
          }}>শেয়ার করুন</button>
        </div>
      </form>
      <p className="share-card-integrity">গুরুত্বপূর্ণ: Deenverse এখনো অনুমোদিত আয়াত/হাদিসের পূর্ণ ডেটাসেট পায়নি। তাই এখানে নিজে যাচাইকৃত লেখা ও সূত্র দিতে হবে; অ্যাপ কোনো ধর্মীয় উদ্ধৃতি নিজে থেকে তৈরি বা যাচাই করা বলে দাবি করে না।</p>
    </section>
  );
}
