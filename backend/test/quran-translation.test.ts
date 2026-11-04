import test from 'node:test';
import assert from 'node:assert/strict';
import { QuranEncBengaliTranslationService } from '../src/services/quran-translation.js';

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
  title: 'Bengali Translation - Abu Bakr Zakaria'
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
