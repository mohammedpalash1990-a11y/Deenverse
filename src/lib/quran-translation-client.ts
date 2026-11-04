export interface QuranBengaliTranslation {
  surahNumber: number;
  ayahNumber: number;
  /** Exact QuranEnc publisher text. Do not rewrite or normalize. */
  translation: string;
  /** Publisher-provided footnotes retained as returned. */
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

export type QuranBengaliTranslationResult =
  | { ok: true; data: QuranBengaliTranslation }
  | { ok: false; message: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function createQuranBengaliTranslationClient(options: {
  baseUrl?: string;
  fetcher?: typeof fetch;
} = {}) {
  const configuredBaseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = (configuredBaseUrl?.trim() || '/api/v1').replace(/\/+$/, '');
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
          typeof body.meta.requestId !== 'string' || !isObject(body.data)) {
        return { ok: false, message: 'অনুবাদ সেবার উত্তর যাচাই করা যায়নি।' };
      }

      const data = body.data;
      const provenance = data.provenance;
      if (data.surahNumber !== surahNumber || data.ayahNumber !== ayahNumber ||
          typeof data.translation !== 'string' || data.translation.length === 0 ||
          !isObject(provenance) ||
          provenance.publisher !== 'QuranEnc.com' ||
          provenance.translator !== 'Abu Bakr Muhammad Zakaria' ||
          provenance.translationKey !== 'bengali_zakaria' ||
          typeof provenance.editionVersion !== 'string' || !provenance.editionVersion.trim() ||
          typeof provenance.sourceUrl !== 'string' ||
          provenance.sourceUrl !== 'https://quranenc.com/bn/browse/bengali_zakaria' ||
          typeof provenance.termsUrl !== 'string' ||
          provenance.termsUrl !== 'https://quranenc.com/en/home') {
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
            translationKey: 'bengali_zakaria',
            editionVersion: provenance.editionVersion,
            sourceUrl: provenance.sourceUrl,
            termsUrl: provenance.termsUrl,
            lastUpdated: typeof provenance.lastUpdated === 'string' ||
              typeof provenance.lastUpdated === 'number' ? provenance.lastUpdated : null
          }
        }
      };
    }
  };
}
