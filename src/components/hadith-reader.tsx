"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  createHadithClient,
  type HadithBook,
  type HadithChapter,
  type HadithRecord
} from "@/lib/hadith-api-client";

const hadithClient = createHadithClient();

function displayBookTitle(book: HadithBook): string {
  return book.titleBengali || book.titleEnglish || book.titleArabic;
}

function displayChapterTitle(chapter: HadithChapter): string {
  return chapter.titleBengali || chapter.titleEnglish || chapter.titleArabic || `Chapter ${chapter.chapterNumber}`;
}

export function HadithReader() {
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [chapters, setChapters] = useState<HadithChapter[]>([]);
  const [records, setRecords] = useState<HadithRecord[]>([]);
  const [searchResults, setSearchResults] = useState<HadithRecord[] | null>(null);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [locale, setLocale] = useState<"bn" | "ar" | "en">("bn");
  const [query, setQuery] = useState("");
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");

  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId) ?? null,
    [books, selectedBookId]
  );

  useEffect(() => {
    let active = true;
    setLoadingBooks(true);
    void hadithClient.listBooks().then((result) => {
      if (!active) return;
      if (!result.ok) {
        setError(result.error.message);
        setBooks([]);
      } else {
        setBooks(result.data.items);
        setSelectedBookId(result.data.items[0]?.id ?? "");
        if (result.data.items.length === 0) setError("No source-approved Hadith collection is available yet.");
      }
      setLoadingBooks(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedBookId) {
      setChapters([]);
      setRecords([]);
      return;
    }
    let active = true;
    setLoadingContent(true);
    setError("");
    void Promise.all([
      hadithClient.listChapters(selectedBookId),
      hadithClient.listRecords(selectedBookId, { chapterId: selectedChapterId || undefined, limit: 20 })
    ]).then(([chapterResult, recordResult]) => {
      if (!active) return;
      if (!chapterResult.ok) {
        setError(chapterResult.error.message);
        setChapters([]);
      } else {
        setChapters(chapterResult.data);
      }
      if (!recordResult.ok) {
        setError(recordResult.error.message);
        setRecords([]);
      } else {
        setRecords(recordResult.data.items);
      }
      setLoadingContent(false);
    });
    return () => { active = false; };
  }, [selectedBookId, selectedChapterId]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (!term) {
      setSearchError("Enter a word or phrase to search.");
      return;
    }
    setSearching(true);
    setSearchError("");
    const result = await hadithClient.search(term, locale, 20);
    if (!result.ok) {
      setSearchResults([]);
      setSearchError(result.error.message);
    } else {
      setSearchResults(result.data.items);
    }
    setSearching(false);
  }

  function clearSearch() {
    setSearchResults(null);
    setSearchError("");
    setQuery("");
  }

  function renderRecord(record: HadithRecord) {
    const translation = record.translations.find((item) => item.locale === locale);
    return (
      <article className="hadith-record" key={record.id}>
        <div className="hadith-record-heading">
          <span className="hadith-number">Hadith {record.hadithNumber}</span>
          <span>{record.book.titleBengali || record.book.titleEnglish || record.book.titleArabic}</span>
        </div>
        <p className="hadith-arabic" dir="rtl" lang="ar">{record.arabicText}</p>
        {record.narratorText && <p className="hadith-narrator">{record.narratorText}</p>}
        {translation ? (
          <div className="hadith-translation" lang={translation.locale} dir={translation.locale === "ar" ? "rtl" : "auto"}>
            <p>{translation.text}</p>
            <div className="hadith-attribution">
              <span>Translator: {translation.translatorName}</span>
              <a href={translation.provenance.sourceUrl} target="_blank" rel="noreferrer">
                {translation.provenance.attribution}
              </a>
              <span>{translation.provenance.edition}</span>
            </div>
          </div>
        ) : (
          <p className="hadith-translation-pending">No approved translation is available for this narration in the selected language.</p>
        )}
        {record.isnadText && <details className="hadith-isnad"><summary>Isnad / chain of narration</summary><p>{record.isnadText}</p></details>}
        <div className="hadith-record-footer">
          <span>{record.sourceReference}</span>
          <a href={record.provenance.sourceUrl} target="_blank" rel="noreferrer">
            Source: {record.provenance.attribution}
          </a>
          <span>{record.provenance.edition}</span>
          <span>Independent review passed</span>
        </div>
      </article>
    );
  }

  return (
    <section className="hadith-reader" aria-labelledby="hadith-reader-title">
      <div className="hadith-library-heading">
        <div>
          <p className="eyebrow">SOURCE-VERIFIED COLLECTIONS</p>
          <h2 id="hadith-reader-title">Hadith library</h2>
          <p>Browse narrations only after source approval and two independent text reviews.</p>
        </div>
        <span className="hadith-review-status">PRIMARY + INDEPENDENT REVIEW</span>
      </div>

      <div className="hadith-library-controls">
        <label>
          Collection
          <select
            aria-label="Hadith collection"
            value={selectedBookId}
            onChange={(event) => { setSelectedBookId(event.target.value); setSelectedChapterId(""); clearSearch(); }}
            disabled={loadingBooks || books.length === 0}
          >
            {books.map((book) => <option key={book.id} value={book.id}>{displayBookTitle(book)}</option>)}
          </select>
        </label>
        <label>
          Chapter
          <select
            aria-label="Hadith chapter"
            value={selectedChapterId}
            onChange={(event) => { setSelectedChapterId(event.target.value); clearSearch(); }}
            disabled={!selectedBookId || chapters.length === 0}
          >
            <option value="">All chapters</option>
            {chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.chapterNumber}. {displayChapterTitle(chapter)}</option>)}
          </select>
        </label>
        <label>
          Display language
          <select aria-label="Display language" value={locale} onChange={(event) => setLocale(event.target.value as "bn" | "ar" | "en")}>
            <option value="bn">বাংলা</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>

      {selectedBook && (
        <div className="hadith-source-card">
          <div><strong>{displayBookTitle(selectedBook)}</strong><span>{selectedBook.compilerName || "Compiler not specified"} · {selectedBook.edition}</span></div>
          <a href={selectedBook.provenance.sourceUrl} target="_blank" rel="noreferrer">Source and rights details</a>
        </div>
      )}

      <form className="hadith-search-form" onSubmit={handleSearch}>
        <label className="sr-only" htmlFor="hadith-search-input">Search Hadith text</label>
        <input
          id="hadith-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Arabic, Bengali or English text"
        />
        <button type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button>
        {searchResults !== null && <button type="button" className="hadith-clear-search" onClick={clearSearch}>Clear</button>}
      </form>

      {searchError && <p className="hadith-reader-error" role="alert">{searchError}</p>}
      {error && <div className="hadith-reader-state" role="status"><p>{error}</p><span>Content remains hidden until its source and review requirements are met.</span></div>}
      {loadingBooks && <p className="hadith-reader-state" role="status">Loading approved collections…</p>}
      {!loadingBooks && books.length === 0 && !error && (
        <div className="hadith-reader-state">
          <h3>No approved collection is available</h3>
          <p>Hadith text will appear here after its source, edition, redistribution terms and independent reviews are verified.</p>
        </div>
      )}
      {loadingContent && <p className="hadith-reader-state" role="status">Loading reviewed narrations…</p>}

      {!loadingContent && !loadingBooks && books.length > 0 && (
        <div className="hadith-record-list" aria-live="polite">
          {searchResults !== null ? (
            <>
              <div className="hadith-results-heading"><h3>Search results</h3><span>{searchResults.length} reviewed narrations</span></div>
              {searchResults.length > 0 ? searchResults.map(renderRecord) : <p className="hadith-reader-state">No reviewed narrations matched this search.</p>}
            </>
          ) : (
            <>
              <div className="hadith-results-heading"><h3>Reviewed narrations</h3><span>{records.length} shown</span></div>
              {records.length > 0 ? records.map(renderRecord) : <p className="hadith-reader-state">No narrations have passed both required reviews in this collection or chapter.</p>}
            </>
          )}
        </div>
      )}
    </section>
  );
}
