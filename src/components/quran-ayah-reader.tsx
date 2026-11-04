"use client";

import { useState, type FormEvent } from "react";
import {
  createQuranAyahClient,
  type QuranAyahRecord
} from "@/lib/quran-ayah-client";

const defaultClient = createQuranAyahClient();

type AyahClient = Pick<ReturnType<typeof createQuranAyahClient>, "getAyah">;

type ReaderState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; retryable: boolean }
  | { status: "ready"; record: QuranAyahRecord };

interface QuranAyahReaderProps {
  client?: AyahClient;
}

export function QuranAyahReader({ client = defaultClient }: QuranAyahReaderProps) {
  const [surah, setSurah] = useState("1");
  const [ayah, setAyah] = useState("1");
  const [state, setState] = useState<ReaderState>({ status: "idle" });

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
      return;
    }

    setState({ status: "loading" });
    const result = await client.getAyah(surahNumber, ayahNumber);
    if (!result.ok) {
      setState({
        status: "error",
        message: result.error.message,
        retryable: result.error.retryable
      });
      return;
    }
    setState({ status: "ready", record: result.data });
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
            pattern="[0-9]*"
            min="1"
            max="114"
            value={surah}
            onChange={(event) => setSurah(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Ayah number</span>
          <input
            aria-label="Ayah number"
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            value={ayah}
            onChange={(event) => setAyah(event.target.value)}
            required
          />
        </label>
        <button className="catalogue-action" type="submit" disabled={state.status === "loading"}>
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
          <p className="ayah-reader-text" dir="rtl" lang="ar">{state.record.payload.textArabic}</p>
          <div className="ayah-reader-attribution">
            <span>{state.record.provenance.edition}</span>
            <span>{state.record.provenance.attribution}</span>
          </div>
          <p className="ayah-reader-reference">
            Surah {state.record.payload.surahNumber} · Ayah {state.record.payload.ayahNumber}
          </p>
        </article>
      )}
    </section>
  );
}
