import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQuranBengaliTranslationClient } from './quran-translation-client';

// Synthetic strings only: no scripture or real translation is used as a fixture.
function envelope() {
  return {
    meta: { requestId: 'req_synthetic' },
    data: {
      surahNumber: 1,
      ayahNumber: 2,
      translation: '  SYNTHETIC translation\nunchanged  ',
      footnotes: '  SYNTHETIC footnote\nunchanged  ',
      provenance: {
        publisher: 'QuranEnc.com',
        translator: 'Abu Bakr Muhammad Zakaria',
        sourceTitle: 'Synthetic edition title',
        sourceDescription: 'Synthetic description',
        translationKey: 'bengali_zakaria',
        editionVersion: 'V1.1.1',
        sourceUrl: 'https://quranenc.com/bn/browse/bengali_zakaria',
        termsUrl: 'https://quranenc.com/en/home',
        lastUpdated: null
      }
    }
  };
}

function clientFor(body: unknown, status = 200) {
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  return { fetcher, client: createQuranBengaliTranslationClient({ fetcher }) };
}

afterEach(() => { vi.unstubAllEnvs(); });

describe('Bengali translation client', () => {
  it('preserves exact source text and footnotes with pinned provenance', async () => {
    const body = envelope();
    const { client, fetcher } = clientFor(body);
    const result = await client.getAyah(1, 2);
    expect(result).toEqual({ ok: true, data: body.data });
    expect(fetcher).toHaveBeenCalledWith('/api/v1/translation/bn/1/2', {
      method: 'GET', headers: { Accept: 'application/json' }
    });
  });

  it.each([[0, 1], [115, 1], [1, 0], [1.5, 1], [1, NaN], [1, Infinity]])(
    'rejects invalid coordinates %s:%s without network access', async (surah, ayah) => {
      const { client, fetcher } = clientFor(envelope());
      expect((await client.getAyah(surah, ayah)).ok).toBe(false);
      expect(fetcher).not.toHaveBeenCalled();
    }
  );

  it('uses the deployment API origin and normalizes trailing slashes', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.test/api/v1///');
    const { client, fetcher } = clientFor(envelope());
    await client.getAyah(1, 2);
    expect(fetcher.mock.calls[0][0]).toBe('https://api.example.test/api/v1/translation/bn/1/2');
  });

  it('allows an explicit API base to override deployment configuration', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://unused.example.test');
    const { fetcher } = clientFor(envelope());
    const client = createQuranBengaliTranslationClient({ fetcher, baseUrl: '/proxy/api/v1/' });
    await client.getAyah(1, 2);
    expect(fetcher.mock.calls[0][0]).toBe('/proxy/api/v1/translation/bn/1/2');
  });

  it.each([
    ['publisher', 'Other publisher'],
    ['translator', 'Other translator'],
    ['translationKey', 'bengali_other'],
    ['editionVersion', 'V1.1.2'],
    ['editionVersion', ''],
    ['sourceTitle', '  '],
    ['sourceUrl', 'https://untrusted.example.test'],
    ['termsUrl', 'javascript:alert(1)']
  ])('rejects unexpected provenance %s=%s', async (key, value) => {
    const body = envelope();
    Object.assign(body.data.provenance, { [key]: value });
    expect((await clientFor(body).client.getAyah(1, 2)).ok).toBe(false);
  });

  it.each([
    { surahNumber: 2 }, { ayahNumber: 3 }, { translation: '' },
    { translation: ' \n ' }, { footnotes: undefined }
  ])('rejects mismatched or incomplete data %j', async (patch) => {
    const body = envelope();
    Object.assign(body.data, patch);
    expect((await clientFor(body).client.getAyah(1, 2)).ok).toBe(false);
  });

  it.each([null, [], {}, { meta: { requestId: '' }, data: envelope().data }])(
    'fails closed for an invalid envelope %j', async (body) => {
      expect((await clientFor(body).client.getAyah(1, 2)).ok).toBe(false);
    }
  );

  it('returns structured API errors without treating them as source text', async () => {
    const { client } = clientFor({ error: { message: 'Synthetic upstream unavailable' } }, 503);
    expect(await client.getAyah(1, 2)).toEqual({ ok: false, message: 'Synthetic upstream unavailable' });
  });

  it('handles malformed JSON and network failures', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('invalid json'))
      .mockRejectedValueOnce(new Error('network failure'));
    const client = createQuranBengaliTranslationClient({ fetcher });
    expect((await client.getAyah(1, 2)).ok).toBe(false);
    expect((await client.getAyah(1, 2)).ok).toBe(false);
  });
  it('reads a complete ordered Surah through the implemented full-Surah endpoint', async () => {
    const single = envelope().data;
    const body = {
      meta: { requestId: 'req_synthetic_surah' },
      data: {
        surahNumber: 1,
        provenance: single.provenance,
        ayahs: [
          { ...single, ayahNumber: 1, translation: 'SYNTHETIC first translation' },
          { ...single, ayahNumber: 2, translation: 'SYNTHETIC second translation' }
        ]
      }
    };
    const { client, fetcher } = clientFor(body);
    expect(await client.getSurah(1)).toEqual({ ok: true, data: body.data });
    expect(fetcher).toHaveBeenCalledWith('/api/v1/translation/bn/1', {
      method: 'GET', headers: { Accept: 'application/json' }
    });
  });

  it('rejects gaps, reordered Ayahs, and mismatched edition provenance in full-Surah responses', async () => {
    const single = envelope().data;
    const body = {
      meta: { requestId: 'req_synthetic_surah' },
      data: {
        surahNumber: 1,
        provenance: single.provenance,
        ayahs: [
          { ...single, ayahNumber: 1 },
          { ...single, ayahNumber: 3 }
        ]
      }
    };
    expect((await clientFor(body).client.getSurah(1)).ok).toBe(false);

    Object.assign(body.data.ayahs[1], {
      ayahNumber: 2,
      provenance: { ...body.data.provenance, editionVersion: 'V1.1.2' }
    });
    expect((await clientFor(body).client.getSurah(1)).ok).toBe(false);
  });

  it('rejects invalid full-Surah coordinates without network access', async () => {
    const { client, fetcher } = clientFor({ data: {} });
    expect((await client.getSurah(115)).ok).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });

});
