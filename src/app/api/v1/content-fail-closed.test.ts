import { describe, expect, it } from "vitest";
import { GET as getAyah } from "./ayah/[surah]/[ayah]/route";
import { GET as getHadithBookChapters } from "./hadith/books/[bookId]/chapters/route";
import { GET as getHadithBookRecords } from "./hadith/books/[bookId]/records/route";
import { GET as getHadithBooks } from "./hadith/books/route";
import { GET as getHadithRecord } from "./hadith/records/[recordId]/route";
import { GET as getHadithSearch } from "./hadith/search/route";
import { GET as getQuranSurah } from "./quran/surahs/[surahNumber]/route";
import { GET as getQuranSurahs } from "./quran/surahs/route";

async function expectUnavailable(response: Response) {
  const body = await response.json();
  expect(response.status).toBe(503);
  expect(body.error.code).toBe("CONTENT_UNAVAILABLE");
  expect(body.data).toBeUndefined();
  expect(body.requestId ?? body.error.requestId).toMatch(/^req_[a-f0-9]{32}$/);
}

async function expectValidationError(response: Response) {
  const body = await response.json();
  expect(response.status).toBe(400);
  expect(body.error.code).toBe("VALIDATION_ERROR");
  expect(body.data).toBeUndefined();
}

describe("Next.js religious-content fallback routes", () => {
  it("keeps the Quran Surah catalogue unavailable until approved content exists", async () => {
    await expectUnavailable(await getQuranSurahs(new Request("http://localhost/api/v1/quran/surahs")));
  });

  it("validates Quran catalogue pagination before returning the fail-closed state", async () => {
    await expectValidationError(await getQuranSurahs(new Request("http://localhost/api/v1/quran/surahs?limit=0")));
  });

  it("keeps individual Surah metadata unavailable", async () => {
    await expectUnavailable(await getQuranSurah(
      new Request("http://localhost/api/v1/quran/surahs/1"),
      { params: Promise.resolve({ surahNumber: "1" }) }
    ));
    await expectValidationError(await getQuranSurah(
      new Request("http://localhost/api/v1/quran/surahs/115"),
      { params: Promise.resolve({ surahNumber: "115" }) }
    ));
  });

  it("keeps individual Ayah content unavailable", async () => {
    await expectUnavailable(await getAyah(
      new Request("http://localhost/api/v1/ayah/1/1"),
      { params: Promise.resolve({ surah: "1", ayah: "1" }) }
    ));
    await expectValidationError(await getAyah(
      new Request("http://localhost/api/v1/ayah/1/0"),
      { params: Promise.resolve({ surah: "1", ayah: "0" }) }
    ));
  });

  it("keeps the Hadith book catalogue unavailable", async () => {
    await expectUnavailable(await getHadithBooks(new Request("http://localhost/api/v1/hadith/books")));
    await expectValidationError(await getHadithBooks(new Request("http://localhost/api/v1/hadith/books?limit=0")));
  });

  it("keeps Hadith chapters unavailable and rejects invalid book identifiers", async () => {
    await expectUnavailable(await getHadithBookChapters(
      new Request("http://localhost/api/v1/hadith/books/bukhari/chapters"),
      { params: Promise.resolve({ bookId: "bukhari" }) }
    ));
    await expectValidationError(await getHadithBookChapters(
      new Request("http://localhost/api/v1/hadith/books/invalid/chapters"),
      { params: Promise.resolve({ bookId: "" }) }
    ));
  });

  it("keeps Hadith records unavailable and validates locale and pagination", async () => {
    await expectUnavailable(await getHadithBookRecords(
      new Request("http://localhost/api/v1/hadith/books/bukhari/records?locale=bn"),
      { params: Promise.resolve({ bookId: "bukhari" }) }
    ));
    await expectValidationError(await getHadithBookRecords(
      new Request("http://localhost/api/v1/hadith/books/bukhari/records?locale=xx"),
      { params: Promise.resolve({ bookId: "bukhari" }) }
    ));
  });

  it("keeps individual Hadith records unavailable", async () => {
    await expectUnavailable(await getHadithRecord(
      new Request("http://localhost/api/v1/hadith/records/record-1?locale=bn"),
      { params: Promise.resolve({ recordId: "record-1" }) }
    ));
    await expectValidationError(await getHadithRecord(
      new Request("http://localhost/api/v1/hadith/records/record-1?locale=xx"),
      { params: Promise.resolve({ recordId: "record-1" }) }
    ));
  });

  it("keeps Hadith search unavailable until an approved collection is configured", async () => {
    await expectUnavailable(await getHadithSearch(
      new Request("http://localhost/api/v1/hadith/search?q=prayer&locale=bn")
    ));
    await expectValidationError(await getHadithSearch(
      new Request("http://localhost/api/v1/hadith/search?q=")
    ));
  });
});
