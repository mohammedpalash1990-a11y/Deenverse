# Hadith source acquisition evaluation

Status: research only. No provider or dataset is approved for Deenverse ingestion yet.

## Candidate A — HadeethEnc.com

Official site: https://hadeethenc.com/

The official site provides downloadable Arabic and Bengali content in SQLite and CSV formats. It reports more than 40,000 translated Hadiths across 50+ languages, including Bengali. The published republication conditions require:
- no modification, addition, or deletion of content;
- clear publisher/source attribution to HadeethEnc.com;
- version number and version information retained;
- notifying HadeethEnc about notes on translations;
- updating to the latest source version;
- no inappropriate advertisements alongside the content.

Official pages:
- https://hadeethenc.com/en
- https://hadeethenc.com/bn/home

Evaluation:
- Promising candidate for a curated, multilingual Hadith and explanation library, including Bengali.
- Its scope is not equivalent to a complete 49,000+ narration corpus of the major Hadith books.
- Arabic and Bengali editions must be acquired as exact, separate artifacts and checked for their own edition/version metadata and terms.
- Do not normalize, edit, merge, or silently paraphrase provider text.
- Before import, capture the exact download URL, file name, version, retrieval timestamp, license/terms snapshot, SHA-256, and source attribution.
- Obtain written clarification if Deenverse's offline packaging, caching, account sync, or any monetization model is not clearly covered by the published conditions.

## Candidate B — Sunnah.com official API

Official developer page: https://sunnah.com/developers
Official API repository: https://github.com/sunnah-com/api
API specification: https://sunnah.stoplight.io/docs/api/

The official developer page states that:
- the API exposes a portion of its Hadith data;
- additional data is added as manual checks are completed;
- an API key is required and must be requested;
- offline dumps are not currently available through the stated developer process;
- scraping and mass reproduction of entire books/collections are not permitted by its site policy; the API is the appropriate route for requesting a snapshot.

Evaluation:
- Suitable for investigating a permissioned, live API integration after API access is granted.
- Not approved for bulk scraping, mirroring, or offline redistribution.
- Do not use third-party dumps extracted from Sunnah.com as a substitute for written permission.
- Record API response provenance, version/availability state, rate limits, and any written usage terms.

## Candidate C — Al-Durar Al-Saniyyah Hadith Encyclopedia API

Official service: https://dorar.net/api-services/hadith
Terms: https://dorar.net/api-services/terms

The official service offers Hadith search responses containing the text, narrator, hadith scholar, source, and the encyclopedia's grading summary. Access requires an application and manual approval. Its terms restrict use to the approved product and prohibit modifying or generating grading judgments; the Hadith must remain paired with the encyclopedia's grading summary where required.

Evaluation:
- Potentially valuable for research/reference and attributed grading display.
- Access and approved product scope must be obtained before integration.
- Never represent its grading as Deenverse's own fatwa or independent verdict.
- Preserve its exact wording, references, and required paired grading information.

## Selection rule

Do not choose a provider solely because it offers a large Hadith count or a convenient API. Evaluate:
1. permission for web display, mobile distribution, offline storage, caching, and backups;
2. Arabic text provenance and edition;
3. Bengali translation publisher, translator, version, and exact reuse terms;
4. numbering system, book/chapter mapping, and reference stability;
5. grade authority, grading work, and whether disagreements are preserved;
6. update/correction process and withdrawal/permission revocation;
7. source artifact or response integrity verification.

No candidate is approved until its exact source artifact or API permission is reviewed and registered in content_sources. No Hadith text, translation, or grade is to be copied into production from a search result, unofficial mirror, or another app.
