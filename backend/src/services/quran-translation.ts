export interface QuranEncTranslation {
  surahNumber: number;
  ayahNumber: number;
  /** Publisher-provided text; do not normalize, rewrite, or paraphrase. */
  translation: string;
  /** Publisher-provided footnotes, retained without modification. */
  footnotes: unknown;
  provenance: {
    publisher: 'QuranEnc.com';
    translator: 'Abu Bakr Muhammad Zakaria';
    translationKey: 'bengali_zakaria';
    editionVersion: string;
    sourceUrl: string;
    termsUrl: string;
    lastUpdated: string | number | null;
  };
}

export type QuranEncLookupResult =
  | { status: 'ok'; value: QuranEncTranslation }
  | { status: 'unavailable' }
  | { status: 'not_found' }
  | { status: 'invalid_source_response' };

interface TranslationListEntry {
  key: string;
  version: string;
  last_update?: string | number;
}

const API_ROOT = 'https://quranenc.com/api/v1';
const TRANSLATION_KEY = 'bengali_zakaria';
const EDITION_URL = 'https://quranenc.com/bn/browse/bengali_zakaria';
const TERMS_URL = 'https://quranenc.com/en/home';
const TRANSLATION_LIST_URL = `${API_ROOT}/translations/list/bn/?localization=bn`;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export class QuranEncBengaliTranslationService {
  constructor(private readonly fetcher: typeof fetch = fetch) {}

  async getAyah(surahNumber: number, ayahNumber: number): Promise<QuranEncLookupResult> {
    if (!Number.isSafeInteger(surahNumber) || surahNumber < 1 || surahNumber > 114 ||
        !Number.isSafeInteger(ayahNumber) || ayahNumber < 1) {
      return { status: 'not_found' };
    }

    let listResponse: Response;
    try {
      listResponse = await this.fetcher(TRANSLATION_LIST_URL, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
    } catch {
      return { status: 'unavailable' };
    }
    if (!listResponse.ok) return { status: 'unavailable' };

    let listBody: unknown;
    try {
      listBody = await listResponse.json();
    } catch {
      return { status: 'invalid_source_response' };
    }
    if (!Array.isArray(listBody)) return { status: 'invalid_source_response' };

    const edition = listBody.find((entry): entry is TranslationListEntry =>
      isObject(entry) && entry.key === TRANSLATION_KEY &&
      typeof entry.version === 'string' && entry.version.trim().length > 0
    );
    if (!edition) return { status: 'invalid_source_response' };

    let ayahResponse: Response;
    try {
      ayahResponse = await this.fetcher(
        `${API_ROOT}/translation/aya/${TRANSLATION_KEY}/${surahNumber}/${ayahNumber}`,
        { method: 'GET', headers: { Accept: 'application/json' } }
      );
    } catch {
      return { status: 'unavailable' };
    }
    if (ayahResponse.status === 404) return { status: 'not_found' };
    if (!ayahResponse.ok) return { status: 'unavailable' };

    let body: unknown;
    try {
      body = await ayahResponse.json();
    } catch {
      return { status: 'invalid_source_response' };
    }

    if (!isObject(body) ||
        Number(body.sura) !== surahNumber ||
        Number(body.aya) !== ayahNumber ||
        typeof body.translation !== 'string' ||
        body.translation.length === 0 ||
        !(body.footnotes === null || typeof body.footnotes === 'string' || Array.isArray(body.footnotes))) {
      return { status: 'invalid_source_response' };
    }

    return {
      status: 'ok',
      value: {
        surahNumber,
        ayahNumber,
        translation: body.translation,
        footnotes: body.footnotes,
        provenance: {
          publisher: 'QuranEnc.com',
          translator: 'Abu Bakr Muhammad Zakaria',
          translationKey: TRANSLATION_KEY,
          editionVersion: edition.version,
          sourceUrl: EDITION_URL,
          termsUrl: TERMS_URL,
          lastUpdated: edition.last_update ?? null
        }
      }
    };
  }
}
