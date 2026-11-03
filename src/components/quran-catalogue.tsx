"use client";

import { useEffect, useMemo, useState } from "react";
import {
  validateContentRecord,
  type ContentRecord,
  type ContentSource
} from "@/lib/content-source";
import { createRestContentSource } from "@/lib/content-api-client";

const restContentSource = createRestContentSource({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"
});

type CatalogueState =
  | { status: "loading" }
  | { status: "error"; message: string; retryable: boolean }
  | { status: "empty" }
  | { status: "ready"; items: ContentRecord[] };

interface QuranCatalogueProps {
  source?: ContentSource;
}

export function QuranCatalogue({ source = restContentSource }: QuranCatalogueProps) {
  const [state, setState] = useState<CatalogueState>({ status: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    setSelectedIndex(null);

    Promise.resolve()
      .then(() => source.list({ type: "quran", locale: "ar", limit: 114 }))
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setState({ status: "error", message: result.error.message, retryable: result.error.retryable });
          return;
        }
        const items = result.data.items;
        if (!Array.isArray(items)) {
          setState({ status: "error", message: "Catalogue response is invalid.", retryable: false });
          return;
        }
        if (items.length === 0) {
          setState({ status: "empty" });
          return;
        }
        const invalid = items.some((item) => !validateContentRecord(item).valid || item.type !== "quran");
        if (invalid) {
          setState({
            status: "error",
            message: "Some catalogue records failed the content-integrity checks. Nothing was displayed.",
            retryable: false
          });
          return;
        }
        setState({ status: "ready", items });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "error", message: "The Quran catalogue could not be reached. Please try again.", retryable: true });
        }
      });

    return () => { cancelled = true; };
  }, [source, retryKey]);

  const items = state.status === "ready" ? state.items : [];
  const filteredItems = useMemo(() => items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => `${item.title} ${item.id}`.toLowerCase().includes(search.trim().toLowerCase())),
  [items, search]);
  const selected = selectedIndex === null ? null : items[selectedIndex];

  if (state.status === "loading") {
    return <section className="catalogue-state" aria-label="Quran catalogue" aria-busy="true" role="status" aria-live="polite">
      <span className="catalogue-state-symbol" aria-hidden="true">◌</span>
      <h3>Loading catalogue metadata</h3>
      <p>Checking catalogue availability and required provenance fields…</p>
    </section>;
  }

  if (state.status === "error") {
    return <section className="catalogue-state" aria-label="Quran catalogue">
      <span className="catalogue-state-symbol" aria-hidden="true">!</span>
      <h3>Catalogue unavailable</h3>
      <p role="alert">{state.message}</p>
      {state.retryable && <button className="catalogue-action" onClick={() => setRetryKey((value) => value + 1)}>Try again</button>}
      <span className="source-tag">NO UNVERIFIED CONTENT DISPLAYED</span>
    </section>;
  }

  if (state.status === "empty") {
    return <section className="catalogue-state" aria-label="Quran catalogue" role="status" aria-live="polite">
      <span className="catalogue-state-symbol" aria-hidden="true">۞</span>
      <h3>No catalogue records available yet</h3>
      <p>The connected source returned an empty catalogue. Source authenticity and licensing approval are separate release checks.</p>
      <span className="source-tag">EMPTY CATALOGUE</span>
    </section>;
  }

  return <section className="catalogue-results" aria-label="Quran catalogue">
    <div className="catalogue-results-heading">
      <div><h3>Surah catalogue</h3><p>{items.length} catalogue records passed metadata checks</p></div>
      <span className="source-tag">METADATA PREFLIGHT ONLY</span>
    </div>
    <label className="surah-search">
      <span className="sr-only">Search Surah catalogue</span>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Surah name or ID…" aria-label="Search Surah catalogue" />
    </label>
    <ol className="surah-list">
      {filteredItems.map(({ item, index }) => <li key={item.id}>
        <button className={selectedIndex === index ? "surah-item selected" : "surah-item"} onClick={() => setSelectedIndex(index)} aria-pressed={selectedIndex === index}>
          <span className="surah-number">{index + 1}</span>
          <span className="surah-title">{item.title}<small>{item.locale.toUpperCase()} · SURAH METADATA</small></span>
          <span aria-hidden="true">↗</span>
        </button>
      </li>)}
      {filteredItems.length === 0 && <li className="no-results">No matching Surah metadata.</li>}
    </ol>
    {selected && <div className="reader-navigation" aria-label="Reader navigation">
      <div><span className="source-tag">SELECTED CATALOGUE ENTRY</span><strong>{selected.title}</strong><small>Religious text will load only through a separately approved reader endpoint.</small></div>
      <div className="reader-navigation-actions">
        <button className="catalogue-action" disabled={selectedIndex === 0} onClick={() => setSelectedIndex((value) => value === null ? null : value - 1)}>Previous</button>
        <button className="catalogue-action" disabled={selectedIndex === items.length - 1} onClick={() => setSelectedIndex((value) => value === null ? null : value + 1)}>Next</button>
      </div>
    </div>}
  </section>;
}
