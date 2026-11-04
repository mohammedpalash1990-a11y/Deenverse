"use client";

import type { ContentSourceError } from "./content-source";
import { mapContentApiError } from "./content-api-errors";

export interface HadithProvenance {
  contentType: "hadith" | "translation";
  sourceId: string;
  edition: string;
  sourceUrl: string;
  attribution: string;
  licenseId: string;
  redistributionAllowed: true;
  reviewer: string;
  reviewedAt: string;
  approvalStatus: "approved";
  reviewDecisionId: string;
  approvedByAuthority: string;
  approvedAt: string;
  checksum: string;
}

export interface HadithBook {
  id: string;
  slug: string;
  titleArabic: string;
  titleEnglish: string | null;
  titleBengali: string | null;
  compilerName: string | null;
  collectionType: string;
  edition: string;
  provenance: HadithProvenance;
}

export interface HadithChapter {
  id: string;
  bookId: string;
  chapterNumber: string;
  titleArabic: string | null;
  titleEnglish: string | null;
  titleBengali: string | null;
  sortOrder: number;
}

export interface HadithTranslation {
  id: string;
  locale: string;
  translatorName: string;
  text: string;
  licenseId: string;
  provenance: HadithProvenance;
}

export interface HadithRecord {
  id: string;
  hadithNumber: string;
  numberingSystem: string;
  book: {
    id: string;
    slug: string;
    titleArabic: string;
    titleEnglish: string | null;
    titleBengali: string | null;
    compilerName: string | null;
    collectionType: string;
    edition: string;
  };
  chapterId: string | null;
  arabicText: string;
  narratorText: string | null;
  isnadText: string | null;
  sourceReference: string;
  provenance: HadithProvenance;
  translations: HadithTranslation[];
}

export interface HadithPage<T> {
  items: T[];
  nextCursor: string | null;
}

export type HadithClientResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ContentSourceError };

export interface HadithClientOptions {
  /** API root, for example https://api.example.com/api/v1. Defaults to NEXT_PUBLIC_API_BASE_URL or /api/v1. */
  baseUrl?: string;
  fetcher?: typeof fetch;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(message: string): HadithClientResult<never> {
  return { ok: false, error: { code: "INTEGRITY_REJECTED", message, retryable: false } };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isProvenance(value: unknown, contentType: "hadith" | "translation"): value is HadithProvenance {
  if (!isObject(value)) return false;
  const fields = [
    "sourceId", "edition", "sourceUrl", "attribution", "licenseId", "reviewer",
    "reviewedAt", "reviewDecisionId", "approvedByAuthority", "approvedAt"
  ];
  if (fields.some((field) => !isNonEmptyString(value[field]))) return false;
  if (value.contentType !== contentType || value.approvalStatus !== "approved" ||
      value.redistributionAllowed !== true || typeof value.checksum !== "string" ||
      !/^[a-f0-9]{64}$/.test(value.checksum)) return false;
  try {
    if (new URL(value.sourceUrl as string).protocol !== "https:") return false;
  } catch {
    return false;
  }
  return !Number.isNaN(Date.parse(value.reviewedAt as string)) &&
    !Number.isNaN(Date.parse(value.approvedAt as string));
}

function parseBook(value: unknown): value is HadithBook {
  return isObject(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.slug) &&
    isNonEmptyString(value.titleArabic) &&
    isNonEmptyString(value.collectionType) &&
    isNonEmptyString(value.edition) &&
    (value.titleEnglish === null || typeof value.titleEnglish === "string") &&
    (value.titleBengali === null || typeof value.titleBengali === "string") &&
    (value.compilerName === null || typeof value.compilerName === "string") &&
    isProvenance(value.provenance, "hadith");
}

function parseChapter(value: unknown): value is HadithChapter {
  return isObject(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.bookId) &&
    isNonEmptyString(value.chapterNumber) &&
    (value.titleArabic === null || typeof value.titleArabic === "string") &&
    (value.titleEnglish === null || typeof value.titleEnglish === "string") &&
    (value.titleBengali === null || typeof value.titleBengali === "string") &&
    typeof value.sortOrder === "number";
}

function parseTranslation(value: unknown): value is HadithTranslation {
  return isObject(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.locale) &&
    isNonEmptyString(value.translatorName) &&
    isNonEmptyString(value.text) &&
    isNonEmptyString(value.licenseId) &&
    isProvenance(value.provenance, "translation");
}

function parseRecord(value: unknown): value is HadithRecord {
  if (!isObject(value) || !isObject(value.book)) return false;
  const book = value.book;
  return isNonEmptyString(value.id) &&
    isNonEmptyString(value.hadithNumber) &&
    isNonEmptyString(value.numberingSystem) &&
    isNonEmptyString(book.id) &&
    isNonEmptyString(book.slug) &&
    isNonEmptyString(book.titleArabic) &&
    (book.titleEnglish === null || typeof book.titleEnglish === "string") &&
    (book.titleBengali === null || typeof book.titleBengali === "string") &&
    (book.compilerName === null || typeof book.compilerName === "string") &&
    isNonEmptyString(book.collectionType) &&
    isNonEmptyString(book.edition) &&
    (value.chapterId === null || isNonEmptyString(value.chapterId)) &&
    isNonEmptyString(value.arabicText) &&
    (value.narratorText === null || typeof value.narratorText === "string") &&
    (value.isnadText === null || typeof value.isnadText === "string") &&
    isNonEmptyString(value.sourceReference) &&
    isProvenance(value.provenance, "hadith") &&
    Array.isArray(value.translations) &&
    value.translations.every(parseTranslation);
}

export function createHadithClient(options: HadithClientOptions = {}) {
  const configuredBaseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = (configuredBaseUrl?.trim() || "/api/v1").replace(/\/+$/, "");
  const fetcher = options.fetcher ?? fetch;

  async function read<T>(path: string, validate: (value: unknown) => value is T): Promise<HadithClientResult<T>> {
    let response: Response;
    try {
      response = await fetcher(`${baseUrl}/hadith${path}`, {
        method: "GET",
        headers: { Accept: "application/json" }
      });
    } catch {
      return { ok: false, error: { code: "UNAVAILABLE", message: "The Hadith service could not be reached.", retryable: true } };
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    if (!response.ok) return { ok: false, error: mapContentApiError(response.status, body) };
    if (!isObject(body) || !isObject(body.meta) || !isNonEmptyString(body.meta.requestId) || !validate(body.data)) {
      return invalid("The Hadith service returned an invalid or unapproved response.");
    }
    return { ok: true, data: body.data };
  }

  const parsePage = <T>(parser: (value: unknown) => value is T) => (value: unknown): value is HadithPage<T> => {
    return isObject(value) &&
      Array.isArray(value.items) &&
      value.items.every(parser) &&
      (value.nextCursor === null || typeof value.nextCursor === "string");
  };

  function pagePath(params: Record<string, string | undefined>): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") query.set(key, value);
    }
    const suffix = query.toString();
    return suffix ? `?${suffix}` : "";
  }

  return {
    listBooks(limit = 50): Promise<HadithClientResult<HadithPage<HadithBook>>> {
      return read(pagePath({ limit: String(limit) }), parsePage(parseBook));
    },

    listChapters(bookId: string): Promise<HadithClientResult<HadithChapter[]>> {
      return read(`/books/${encodeURIComponent(bookId)}/chapters`, (value): value is HadithChapter[] =>
        Array.isArray(value) && value.every(parseChapter));
    },

    listRecords(bookId: string, options: { chapterId?: string; locale?: "ar" | "bn" | "en"; limit?: number } = {}): Promise<HadithClientResult<HadithPage<HadithRecord>>> {
      const query = pagePath({
        chapterId: options.chapterId,
        locale: options.locale,
        limit: String(options.limit ?? 20)
      });
      return read(`/books/${encodeURIComponent(bookId)}/records${query}`, parsePage(parseRecord));
    },

    getRecord(recordId: string, locale?: "ar" | "bn" | "en"): Promise<HadithClientResult<HadithRecord>> {
      return read(`/records/${encodeURIComponent(recordId)}${pagePath({ locale })}`, parseRecord);
    },

    search(query: string, locale?: "ar" | "bn" | "en", limit = 20): Promise<HadithClientResult<HadithPage<HadithRecord>>> {
      return read(`/search${pagePath({ q: query, locale, limit: String(limit) })}`, parsePage(parseRecord));
    }
  };
}
