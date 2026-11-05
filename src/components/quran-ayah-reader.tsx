"use client";

import { useState, type FormEvent } from "react";
import { AyahRecallPractice } from "./ayah-recall-practice";
import {
  createQuranAyahClient,
  type QuranAyahRecord
} from "@/lib/quran-ayah-client";
import {
  createQuranBengaliTranslationClient,
  type QuranBengaliTranslation
} from "@/lib/quran-translation-client";

const defaultClient = createQuranAyahClient();
const defaultTranslationClient = createQuranBengaliTranslationClient();

type AyahClient = Pick<ReturnType<typeof createQuranAyahClient>, "getAyah">;

type ReaderState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; retryable: boolean }
  | { status: "ready"; record: QuranAyahRecord }
  | { status: "beta-ready"; surahNumber: number; ayahNumber: number; arabic: string };

type TranslationState =
  | { status: "idle" | "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: QuranBengaliTranslation };

const TANZIL_TEXT_URL = "https://raw.githubusercontent.com/mohammedpalash1990-a11y/Deenverse/main/data/quran/tanzil/quran-uthmani.txt";
const TANZIL_TEXT_SHA256 = "ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af";

async function loadTanzilBetaAyah(surahNumber: number, ayahNumber: number): Promise<string> {
  const response = await fetch(TANZIL_TEXT_URL, { headers: { Accept: "text/plain" }, cache: "force-cache" });
  if (!response.ok) throw new Error("Tanzil Arabic text file could not be reached.");
  const bytes = await response.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const checksum = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (checksum !== TANZIL_TEXT_SHA256) throw new Error("Tanzil Arabic file checksum did not match the published source artifact.");
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const prefix = `${surahNumber}|${ayahNumber}|`;
  const line = text.split(/\\r?\\n/u).find((row) => row.startsWith(prefix));
  const arabic = line?.slice(prefix.length);
  if (!arabic) throw new Error("The requested Ayah was not found in the Tanzil file.");
  return arabic;
}

interface QuranAyahReaderProps {
  client?: AyahClient;
  translationClient?: Pick<ReturnType<typeof createQuranBengaliTranslationClient>, "getAyah">;
}

export function QuranAyahReader({ client = defaultClient, translationClient = defaultTranslationClient }: QuranAyahReaderProps) {
  const [surah, setSurah] = useState("1");
  const [ayah, setAyah] = useState("1");
  const [state, setState] = useState<ReaderState>({ status: "idle" });
  const [translationState, setTranslationState] = useState<TranslationState>({ status: "idle" });

  async function loadAyah(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const surahNumber = Number(surah);
    const ayahNumber = Number(ayah);

    if (!/^\d+$/.test(surah) || !/^\d+$/.test(ayah)) {
      setState({
        status: "error",
        message: "Enter whole-number Surah and Ayah coordinates.",
        retryable: false
      });
      setTranslationState({ status: "idle" });
      return;
    }

    setState({ status: "loading" });
    setTranslationState({ status: "loading" });
    const result = await client.getAyah(surahNumber, ayahNumber);
    if (result.ok) {
      setState({ status: "ready", record: result.data });
    } else if (result.error.code === "CONTENT_UNAVAILABLE" || result.error.code === "UNAVAILABLE") {
      try {
        const arabic = await loadTanzilBetaAyah(surahNumber, ayahNumber);
        setState({ status: "beta-ready", surahNumber, ayahNumber, arabic });
      } catch (error) {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "The public-beta Quran source could not be loaded.",
          retryable: true
        });
        setTranslationState({ status: "idle" });
        return;
      }
    } else {
      setState({
        status: "error",
        message: result.error.message,
        retryable: result.error.retryable
      });
      setTranslationState({ status: "idle" });
      return;
    }

    const translation = await translationClient.getAyah(surahNumber, ayahNumber);
    setTranslationState(translation.ok
      ? { status: "ready", data: translation.data }
      : { status: "error", message: translation.message });
  }

  return (
    <section className="ayah-reader-panel" aria-labelledby="ayah-reader-title">
      <div className="ayah-reader-heading">
        <div>
          <p className="eyebrow">VERIFIED CONTENT DELIVERY</p>
          <h3 id="ayah-reader-title">Read an Ayah</h3>
        </div>
        <span className="source-tag">PUBLIC BETA · SOURCE-ATTRIBUTED</span>
      </div>

      <form className="ayah-reader-form" onSubmit={loadAyah}>
        <label>
          <span>Surah number</span>
          <input
            aria-label="Surah number"
            inputMode="numeric"
            value={surah}
            onChange={(event) => setSurah(event.target.value)}
          />
        </label>
        <label>
          <span>Ayah number</span>
          <input
            aria-label="Ayah number"
            inputMode="numeric"
            value={ayah}
            onChange={(event) => setAyah(event.target.value)}
            required
          />
        </label>
        <button className="catalogue-action" type="submit" disabled={state.status === "loading" || translationState.status === "loading"}>
          {state.status === "loading" ? "Loading…" : state.status === "error" && state.retryable ? "Try again" : "Load Ayah"}
        </button>
      </form>

      {state.status === "idle" && (
        <p className="ayah-reader-note" role="status" aria-live="polite">
          The reader first checks the approved API. If the catalogue is not yet active, it can display the checksum-verified Tanzil public-beta text with its source clearly identified.
        </p>
      )}
      {state.status === "loading" && (
        <p className="ayah-reader-note" role="status" aria-live="polite">Loading the source text…</p>
      )}
      {state.status === "error" && (
        <p className="ayah-reader-error" role="alert">{state.message}</p>
      )}
      {state.status === "beta-ready" && (
        <article className="ayah-reader-result" aria-label="Public beta Quran Ayah">
          <div className="ayah-reader-attribution">
            <span>Tanzil Quran Text · Uthmani · Version 1.1</span>
            <span>Tanzil Project · Creative Commons Attribution 3.0</span>
          </div>
          <p className="ayah-reader-reference">Surah {state.surahNumber} · Ayah {state.ayahNumber} · PUBLIC BETA</p>
          <p className="ayah-reader-arabic" dir="rtl" lang="ar">{state.arabic}</p>
          <p className="ayah-reader-note">এই আরবি পাঠটি মূল Tanzil ফাইল থেকে SHA-256 checksum মিলিয়ে দেখিয়ে প্রকাশ করা হচ্ছে। এটি এখনো স্বাধীন মানব-পর্যালোচনা সম্পন্ন সংস্করণ নয়।</p>
          <a href="https://tanzil.net/download/" target="_blank" rel="noreferrer">Tanzil-এর মূল উৎস</a>
          <section className="ayah-translation" aria-label="বাংলা অনুবাদ">
            <h4>বাংলা অনুবাদ — ড. আবু বকর মুহাম্মাদ যাকারিয়া</h4>
            {translationState.status === "loading" && <p role="status">অনুবাদ লোড হচ্ছে…</p>}
            {translationState.status === "error" && <p role="alert">{translationState.message}</p>}
            {translationState.status === "ready" && (
              <>
                <p lang="bn">{translationState.data.translation}</p>
                {translationState.data.footnotes !== null && translationState.data.footnotes !== undefined && (
                  <details>
                    <summary>অনুবাদকের টীকা</summary>
                    <pre>{typeof translationState.data.footnotes === "string"
                      ? translationState.data.footnotes
                      : JSON.stringify(translationState.data.footnotes, null, 2)}</pre>
                  </details>
                )}
                <p className="ayah-reader-attribution">
                  {translationState.data.provenance.translator} · {translationState.data.provenance.publisher} · {translationState.data.provenance.sourceTitle} · {translationState.data.provenance.editionVersion}
                </p>
                <a href={translationState.data.provenance.sourceUrl} target="_blank" rel="noreferrer">QuranEnc-এর মূল অনুবাদ</a>{" · "}
                <a href={translationState.data.provenance.termsUrl} target="_blank" rel="noreferrer">প্রকাশের শর্ত</a>
              </>
            )}
          </section>
        </article>
      )}

      {state.status === "ready" && (
        <article className="ayah-reader-result" aria-label="Verified Ayah">
          <div className="ayah-reader-attribution">
            <span>{state.record.provenance.edition}</span>
            <span>{state.record.provenance.attribution}</span>
          </div>
          <p className="ayah-reader-reference">
            Surah {state.record.payload.surahNumber} · Ayah {state.record.payload.ayahNumber}
          </p>
          <AyahRecallPractice textArabic={state.record.payload.textArabic}>
            <section className="ayah-translation" aria-label="বাংলা অনুবাদ">
              <h4>বাংলা অনুবাদ — আবু বকর মুহাম্মাদ যাকারিয়া</h4>
              {translationState.status === "loading" && <p role="status">অনুবাদ লোড হচ্ছে…</p>}
              {translationState.status === "error" && <p role="alert">{translationState.message}</p>}
              {translationState.status === "ready" && (
                <>
                  <p lang="bn">{translationState.data.translation}</p>
                  {translationState.data.footnotes !== null && translationState.data.footnotes !== undefined && (
                    <details>
                      <summary>অনুবাদকের টীকা</summary>
                      <pre>{typeof translationState.data.footnotes === "string"
                        ? translationState.data.footnotes
                        : JSON.stringify(translationState.data.footnotes, null, 2)}</pre>
                    </details>
                  )}
                  <p className="ayah-reader-attribution">
                    {translationState.data.provenance.translator} · {translationState.data.provenance.publisher} · {translationState.data.provenance.sourceTitle} · {translationState.data.provenance.editionVersion}
                  </p>
                  <a href={translationState.data.provenance.sourceUrl} target="_blank" rel="noreferrer">QuranEnc-এর মূল অনুবাদ</a>{" · "}
                  <a href={translationState.data.provenance.termsUrl} target="_blank" rel="noreferrer">প্রকাশের শর্ত</a>
                </>
              )}
            </section>
          </AyahRecallPractice>
        </article>
      )}
    </section>
  );
}
