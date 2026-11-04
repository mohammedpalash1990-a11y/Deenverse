import test from 'node:test';
import assert from 'node:assert/strict';
import { QuranEncBengaliTranslationService } from '../src/services/quran-translation.js';
import { EXPECTED_AYAH_COUNTS } from '../src/services/quran-surah-counts.js';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

const editionList = [{
  key: 'bengali_zakaria',
  version: 'V1.1.1',
  last_update: 1621641600,
  title: 'Bengali Translation - Abu Bakr Zakaria',
  description: 'Bengali Translation of Dr. Abu Bakr Muhammad Zakaria'
}];

test('returns publisher text, footnotes, and live edition provenance unchanged', async () => {
  const translation = 'এটি প্রকাশকের দেওয়া অনুবাদ।';
  const footnotes = [{ id: 1, text: 'প্রকাশকের দেওয়া টীকা' }];
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    if (url.includes('/translations/list/')) return jsonResponse(editionList);
    return jsonResponse({ sura: '1', aya: '1', translation, footnotes });
  };

  const result = await new QuranEncBengaliTranslationService(fetcher).getAyah(1, 1);
  assert.equal(result.status, 'ok');
  if (result.status !== 'ok') return;
  assert.equal(result.value.translation, translation);
  assert.deepEqual(result.value.footnotes, footnotes);
  assert.equal(result.value.provenance.publisher, 'QuranEnc.com');
  assert.equal(result.value.provenance.translator, 'Abu Bakr Muhammad Zakaria');
  assert.equal(result.value.provenance.editionVersion, 'V1.1.1');
  assert.equal(calls.length, 2);
  assert.match(calls[1], /translation\/aya\/bengali_zakaria\/1\/1$/);
});

test('rejects a response whose Surah or Ayah does not match the request', async () => {
  const fetcher: typeof fetch = async (input) => String(input).includes('/translations/list/')
    ? jsonResponse(editionList)
    : jsonResponse({ sura: 1, aya: 2, translation: 'অনুবাদ', footnotes: [] });

  const result = await new QuranEncBengaliTranslationService(fetcher).getAyah(1, 1);
  assert.equal(result.status, 'invalid_source_response');
});

test('fails closed when the official edition list does not contain the expected key', async () => {
  const fetcher: typeof fetch = async () => jsonResponse([]);
  const result = await new QuranEncBengaliTranslationService(fetcher).getAyah(1, 1);
  assert.equal(result.status, 'invalid_source_response');
});

test('reports source network failures without substituting another translation', async () => {
  const fetcher: typeof fetch = async () => { throw new Error('network unavailable'); };
  const result = await new QuranEncBengaliTranslationService(fetcher).getAyah(1, 1);
  assert.equal(result.status, 'unavailable');
});

test('rejects invalid coordinates before making a source request', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls += 1;
    return jsonResponse(editionList);
  };
  const result = await new QuranEncBengaliTranslationService(fetcher).getAyah(115, 1);
  assert.equal(result.status, 'not_found');
  assert.equal(calls, 0);
});


test('serves the QuranEnc translation route with attribution and rejects invalid coordinates', async () => {
  const { buildApp } = await import('../src/app.js');
  const fetcher: typeof fetch = async (input) => String(input).includes('/translations/list/')
    ? jsonResponse(editionList)
    : jsonResponse({
        sura: 1,
        aya: 1,
        translation: 'প্রকাশকের মূল অনুবাদ',
        footnotes: [{ id: 1, text: 'প্রকাশকের মূল টীকা' }]
      });
  const app = buildApp({ db: {} as never, enableRateLimit: false, quranTranslationFetcher: fetcher });

  try {
    const valid = await app.inject({ method: 'GET', url: '/api/v1/translation/bn/1/1' });
    assert.equal(valid.statusCode, 200);
    const payload = valid.json();
    assert.equal(payload.data.translation, 'প্রকাশকের মূল অনুবাদ');
    assert.equal(payload.data.provenance.publisher, 'QuranEnc.com');
    assert.equal(payload.data.provenance.sourceDescription, editionList[0].description);

    const invalid = await app.inject({ method: 'GET', url: '/api/v1/translation/bn/115/1' });
    assert.equal(invalid.statusCode, 400);
  } finally {
    await app.close();
  }
});


test('fails closed when QuranEnc changes the pinned translation edition', async () => {
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    if (url.includes('/translations/list/')) {
      return jsonResponse([{ ...editionList[0], version: 'V1.1.2' }]);
    }
    return jsonResponse({ sura: 1, aya: 1, translation: 'অনুবাদ', footnotes: [] });
  };

  const result = await new QuranEncBengaliTranslationService(fetcher).getAyah(1, 1);
  assert.equal(result.status, 'invalid_source_response');
  assert.equal(calls.length, 1, 'must not fetch translation text from an unreviewed edition');
});

test('returns an ordered full-Surah translation and rejects gaps or reordered Ayahs', async () => {
  const validRows = Array.from({ length: EXPECTED_AYAH_COUNTS[0] }, (_, index) => ({
    sura: 1,
    aya: index + 1,
    translation: `সূরা ফাতিহার আয়াত ${index + 1}`,
    footnotes: []
  }));
  const fetcher: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes('/translations/list/')) return jsonResponse(editionList);
    return jsonResponse(validRows);
  };
  const service = new QuranEncBengaliTranslationService(fetcher);
  const result = await service.getSurah(1);
  assert.equal(result.status, 'ok');
  if (result.status === 'ok') {
    assert.deepEqual(result.value.ayahs.map((ayah) => ayah.ayahNumber), [1, 2, 3, 4, 5, 6, 7]);
    assert.equal(result.value.ayahs[1].translation, 'সূরা ফাতিহার আয়াত 2');
    assert.equal(result.value.provenance.editionVersion, 'V1.1.1');
  }

  const gapRows = validRows.map((row, index) => index === 2 ? { ...row, aya: 4 } : row);
  const gapFetcher: typeof fetch = async (input) => String(input).includes('/translations/list/')
    ? jsonResponse(editionList)
    : jsonResponse(gapRows);
  const gapResult = await new QuranEncBengaliTranslationService(gapFetcher).getSurah(1);
  assert.equal(gapResult.status, 'invalid_source_response');
});

test('serves a complete ordered Surah through the public translation route', async () => {
  const { buildApp } = await import('../src/app.js');
  const fetcher: typeof fetch = async (input) => String(input).includes('/translations/list/')
    ? jsonResponse(editionList)
    : jsonResponse(Array.from({ length: EXPECTED_AYAH_COUNTS[0] }, (_, index) => ({
        sura: 1,
        aya: index + 1,
        translation: `সূরা ফাতিহার আয়াত ${index + 1}`,
        footnotes: []
      })));
  const app = buildApp({ db: {} as never, enableRateLimit: false, quranTranslationFetcher: fetcher });
  try {
    const response = await app.inject({ method: 'GET', url: '/api/v1/translation/bn/1' });
    assert.equal(response.statusCode, 200);
    const payload = response.json();
    assert.equal(payload.data.surahNumber, 1);
    assert.deepEqual(payload.data.ayahs.map((ayah: { ayahNumber: number }) => ayah.ayahNumber), [1, 2, 3, 4, 5, 6, 7]);
    assert.equal(payload.data.provenance.publisher, 'QuranEnc.com');
  } finally {
    await app.close();
  }
});

test('rejects a Surah response that is ordered but incomplete', async () => {
  const fetcher: typeof fetch = async (input) => String(input).includes('/translations/list/')
    ? jsonResponse(editionList)
    : jsonResponse([{ sura: 1, aya: 1, translation: 'প্রথম আয়াত', footnotes: [] }]);

  const result = await new QuranEncBengaliTranslationService(fetcher).getSurah(1);
  assert.equal(result.status, 'invalid_source_response');
});

test('rejects an Ayah coordinate beyond the canonical Surah boundary before fetching', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls += 1;
    return jsonResponse(editionList);
  };

  const result = await new QuranEncBengaliTranslationService(fetcher).getAyah(1, 8);
  assert.equal(result.status, 'not_found');
  assert.equal(calls, 0);
});
