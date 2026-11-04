import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRestContentSource } from './content-api-client';
import { createQuranAyahClient } from './quran-ayah-client';
import { createHadithClient } from './hadith-api-client';
import { createQuranBengaliTranslationClient } from './quran-translation-client';

afterEach(() => { vi.unstubAllEnvs(); });

describe('consistent frontend API routing', () => {
  it.each([
    ['https://api.example.test/api/v1///', 'https://api.example.test/api/v1'],
    ['/proxy/api/v1///', '/proxy/api/v1'],
    ['', '/api/v1']
  ])('routes every reader through deployment base %j', async (configured, expected) => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', configured);
    // Only request destinations are under test; no religious content fixtures.
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () =>
      new Response(JSON.stringify({ error: { code: 'CONTENT_UNAVAILABLE' } }), { status: 503 }));
    await createRestContentSource({ fetcher }).getById('quran:surah:1');
    await createQuranAyahClient({ fetcher }).getAyah(1, 1);
    await createHadithClient({ fetcher }).listBooks();
    await createQuranBengaliTranslationClient({ fetcher }).getAyah(1, 1);
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      `${expected}/quran/surahs/1`,
      `${expected}/ayah/1/1`,
      `${expected}/hadith/books?limit=50`,
      `${expected}/translation/bn/1/1`
    ]);
  });

  it('fails every client closed before requesting an unsafe configured URL', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '//unexpected.example.test/api/v1');
    const fetcher = vi.fn<typeof fetch>();
    for (const factory of [createRestContentSource, createQuranAyahClient, createHadithClient, createQuranBengaliTranslationClient]) {
      expect(() => factory({ fetcher })).toThrow(/Invalid API base URL/);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
});
