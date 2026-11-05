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
  | { status: "ready"; record: QuranAyahRecord };

type TranslationState =
  | { status: "idle" | "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: QuranBengaliTranslation };

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
    if (!result.ok) {
      setState({
        status: "error",
        message: result.error.message,
        retryable: result.error.retryable
      });
      setTranslationState({ status: "idle" });
      return;
    }

    setState({ status: "ready", record: result.data });
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
        <span className="source-tag">APPROVAL REQUIRED</span>
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
          Ayah text appears only when the API returns a record with valid approval, licensing and integrity metadata.
        </p>
      )}
      {state.status === "loading" && (
        <p className="ayah-reader-note" role="status" aria-live="polite">Checking the approved source…</p>
      )}
      {state.status === "error" && (
        <p className="ayah-reader-error" role="alert">{state.message}</p>
      )}
      {state.status === "ready" && (
        <article className="ayah-reader-result" aria-label="Verified Ayah">
          <div className="ayah-reader-attribution">
            <span>{state.record.provenance.edition}</span>
            <span>{state.record.provenance.attribution}</span>
            <span>License: {state.record.provenance.licenseId}</span>
            <a href={state.record.provenance.sourceUrl} target="_blank" rel="noreferrer">Official Quran source</a>
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
