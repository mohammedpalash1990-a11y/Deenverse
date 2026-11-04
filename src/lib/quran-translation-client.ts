import { resolveApiBaseUrl } from "./api-config";
export interface QuranBengaliTranslationProvenance {
  publisher: 'QuranEnc.com';
  translator: 'Abu Bakr Muhammad Zakaria';
  sourceTitle: string;
  sourceDescription: string;
  translationKey: 'bengali_zakaria';
  editionVersion: 'V1.1.1';
  sourceUrl: string;
  termsUrl: string;
  lastUpdated: string | number | null;
}

export interface QuranBengaliTranslation {
  surahNumber: number;
  ayahNumber: number;
  /** Exact QuranEnc publisher text. Do not rewrite or normalize. */
  translation: string;
  /** Publisher-provided footnotes retained as returned. */
  footnotes: unknown;
  provenance: QuranBengaliTranslationProvenance;
}

export interface QuranBengaliSurahTranslation {
  surahNumber: number;
  ayahs: QuranBengaliTranslation[];
  provenance: QuranBengaliTranslationProvenance;
}

export type QuranBengaliTranslationResult =
  | { ok: true; data: QuranBengaliTranslation }
  | { ok: false; message: string };

export type QuranBengaliSurahTranslationResult =
  | { ok: true; data: QuranBengaliSurahTranslation }
  | { ok: false; message: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPinnedProvenance(value: unknown): value is QuranBengaliTranslationProvenance {
  return isObject(value) &&
    value.publisher === 'QuranEnc.com' &&
    value.translator === 'Abu Bakr Muhammad Zakaria' &&
    typeof value.sourceTitle === 'string' && value.sourceTitle.trim().length > 0 &&
    typeof value.sourceDescription === 'string' &&
    value.translationKey === 'bengali_zakaria' &&
    value.editionVersion === 'V1.1.1' &&
    value.sourceUrl === 'https://quranenc.com/bn/browse/bengali_zakaria' &&
    value.termsUrl === 'https://quranenc.com/en/home' &&
    (value.lastUpdated === null || typeof value.lastUpdated === 'string' || typeof value.lastUpdated === 'number');
}

function sameProvenance(
  left: QuranBengaliTranslationProvenance,
  right: QuranBengaliTranslationProvenance
): boolean {
  return left.publisher === right.publisher &&
    left.translator === right.translator &&
    left.sourceTitle === right.sourceTitle &&
    left.sourceDescription === right.sourceDescription &&
    left.translationKey === right.translationKey &&
    left.editionVersion === right.editionVersion &&
    left.sourceUrl === right.sourceUrl &&
    left.termsUrl === right.termsUrl &&
    left.lastUpdated === right.lastUpdated;
}

export function createQuranBengaliTranslationClient(options: {
  baseUrl?: string;
  fetcher?: typeof fetch;
} = {}) {
  const baseUrl = resolveApiBaseUrl(options.baseUrl);
  const fetcher = options.fetcher ?? fetch;

  return {
    async getAyah(surahNumber: number, ayahNumber: number): Promise<QuranBengaliTranslationResult> {
      if (!Number.isSafeInteger(surahNumber) || surahNumber < 1 || surahNumber > 114 ||
          !Number.isSafeInteger(ayahNumber) || ayahNumber < 1) {
        return { ok: false, message: 'Invalid Surah or Ayah number.' };
      }

      let response: Response;
      try {
        response = await fetcher(
          `${baseUrl}/translation/bn/${surahNumber}/${ayahNumber}`,
          { method: 'GET', headers: { Accept: 'application/json' } }
        );
      } catch {
        return { ok: false, message: 'বাংলা অনুবাদের উৎসে সংযোগ করা যায়নি।' };
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = null;
      }
      if (!response.ok) {
        const message = isObject(body) && isObject(body.error) &&
          typeof body.error.message === 'string'
          ? body.error.message
          : 'বাংলা অনুবাদ এখন পাওয়া যাচ্ছে না।';
        return { ok: false, message };
      }

      if (!isObject(body) || !isObject(body.meta) ||
          typeof body.meta.requestId !== 'string' || !body.meta.requestId.trim() || !isObject(body.data)) {
        return { ok: false, message: 'অনুবাদ সেবার উত্তর যাচাই করা যায়নি।' };
      }

      const data = body.data;
      const provenance = data.provenance;
      if (data.surahNumber !== surahNumber || data.ayahNumber !== ayahNumber ||
          typeof data.translation !== 'string' || !data.translation.trim() ||
          data.footnotes === undefined ||
          !isPinnedProvenance(provenance)) {
        return { ok: false, message: 'অনুবাদের উৎস-পরিচয় বা আয়াত নম্বর মেলেনি।' };
      }

      return {
        ok: true,
        data: {
          surahNumber,
          ayahNumber,
          translation: data.translation,
          footnotes: data.footnotes,
          provenance: {
            publisher: 'QuranEnc.com',
            translator: 'Abu Bakr Muhammad Zakaria',
            sourceTitle: provenance.sourceTitle,
            sourceDescription: provenance.sourceDescription,
            translationKey: 'bengali_zakaria',
            editionVersion: provenance.editionVersion,
            sourceUrl: provenance.sourceUrl,
            termsUrl: provenance.termsUrl,
            lastUpdated: provenance.lastUpdated
          }
        }
      };
    },

    async getSurah(surahNumber: number): Promise<QuranBengaliSurahTranslationResult> {
      if (!Number.isSafeInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        return { ok: false, message: 'Invalid Surah number.' };
      }

      let response: Response;
      try {
        response = await fetcher(
          `${baseUrl}/translation/bn/${surahNumber}`,
          { method: 'GET', headers: { Accept: 'application/json' } }
        );
      } catch {
        return { ok: false, message: 'বাংলা অনুবাদের উৎসে সংযোগ করা যায়নি।' };
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = null;
      }
      if (!response.ok) {
        const message = isObject(body) && isObject(body.error) &&
          typeof body.error.message === 'string'
          ? body.error.message
          : 'বাংলা অনুবাদ এখন পাওয়া যাচ্ছে না।';
        return { ok: false, message };
      }

      if (!isObject(body) || !isObject(body.meta) ||
          typeof body.meta.requestId !== 'string' || !body.meta.requestId.trim() ||
          !isObject(body.data)) {
        return { ok: false, message: 'অনুবাদ সেবার উত্তর যাচাই করা যায়নি।' };
      }

      const data = body.data;
      const provenance = data.provenance;
      if (data.surahNumber !== surahNumber || !Array.isArray(data.ayahs) ||
          data.ayahs.length === 0 || !isPinnedProvenance(provenance)) {
        return { ok: false, message: 'পূর্ণ সূরার অনুবাদ বা উৎস-পরিচয় যাচাই করা যায়নি।' };
      }

      const ayahs: QuranBengaliTranslation[] = [];
      for (let index = 0; index < data.ayahs.length; index += 1) {
        const row = data.ayahs[index];
        if (!isObject(row) || row.surahNumber !== surahNumber ||
            row.ayahNumber !== index + 1 ||
            typeof row.translation !== 'string' || !row.translation.trim() ||
            row.footnotes === undefined ||
            !isPinnedProvenance(row.provenance) ||
            !sameProvenance(row.provenance, provenance)) {
          return { ok: false, message: 'সূরার অনুবাদে আয়াতের ক্রম, লেখা বা সংস্করণে অমিল পাওয়া গেছে।' };
        }
        ayahs.push({
          surahNumber,
          ayahNumber: index + 1,
          translation: row.translation,
          footnotes: row.footnotes,
          provenance: row.provenance
        });
      }

      return { ok: true, data: { surahNumber, ayahs, provenance } };
    }
  };
}
