# DEENVERSE Verified Content Source Register

This is a blank governance register. No religious content source is approved merely by being listed here. Record a source only after checking authenticity, edition, attribution, copyright, and redistribution terms.

| Content type | Publisher/provider | Edition/version | Languages | Source URL/identifier | License/terms | Redistribution allowed? | Review status | Reviewer/date |
|---|---|---|---|---|---|---|---|---|
| Quran Arabic | TBD | TBD | Arabic | TBD | TBD | Not yet verified | Pending | TBD |
| Quran translation | TBD | TBD | TBD | TBD | TBD | Not yet verified | Pending | TBD |
| Tafsir | TBD | TBD | TBD | TBD | TBD | Not yet verified | Pending | TBD |
| Hadith | TBD | TBD | TBD | TBD | TBD | Not yet verified | Pending | TBD |
| Dua/Adhkar | TBD | TBD | TBD | TBD | TBD | Not yet verified | Pending | TBD |
| Recitation audio | TBD | TBD | TBD | TBD | TBD | Not yet verified | Pending | TBD |

## Approval checklist
- [ ] Source identity and reputation checked
- [ ] Exact edition and version recorded
- [ ] Arabic/source text integrity method documented
- [ ] Translation/translator or narrator/grader attribution recorded where relevant
- [ ] License and redistribution rights reviewed
- [ ] Offline caching/download rights reviewed separately
- [ ] Attribution display requirements documented
- [ ] Sample records manually reviewed
- [ ] Import checksum and rollback plan documented

Do not ship a corpus while any required permission or authenticity field remains unresolved.


## 2026-11-02 source policy update — candidate Quran Arabic source

### Candidate: Tanzil Quran Text (Uthmani)

- Publisher: Tanzil Project.
- Edition identified by the published license page: Uthmani text; the project publishes versioned text (verify the exact release/version at acquisition time).
- License stated by the publisher: Creative Commons Attribution 3.0 (CC BY 3.0).
- Official license and terms: https://tanzil.net/docs/text_license (also published at https://tanzil.ca/docs/text_license).
- Official update tracking: https://tanzil.net/updates/.
- Permitted use stated by the publisher: verbatim copying/distribution and use in websites/apps, with clear Tanzil attribution, a link to tanzil.net, and inclusion of the copyright/license notice. Changing the Quran text is expressly prohibited.
- Status in DEENVERSE: **CANDIDATE — NOT YET APPROVED/IMPORTED**. This web review confirms the published terms, not the integrity of a downloaded dataset, exact current version, or legal advice for every planned distribution model. Before import, capture the official source artifact, exact release/date, SHA-256, license notice, retrieval URL/date, and reviewer sign-off; independently compare all 114 Surahs / 6,236 ayahs and numbering against the selected release. Do not make edits or normalization transformations to the Arabic string.

### Alternative delivery route: Quran Foundation APIs

Quran Foundation Developer Terms (https://api-docs.quran.com/legal/developer-terms/) permit display of QF Content inside an end-user app under their conditions, but prohibit modifying Quran text and restrict sale, sublicensing and redistribution of raw content. Their terms also restrict ordinary API-response caching to one week; where Content Sync is available, it is the required route for maintaining offline copies, with synchronization at least every seven days when connectivity permits. A separate signed commercial license is required for separately distributing QF content/raw data. Therefore, use QF APIs only if DEENVERSE can comply with the developer terms, attribution, account/API requirements, storage limits and Content Sync obligations. Do not treat API accessibility as an unrestricted open-data license.

### Translation / Tafsir / Hadith / Dua / Audio

No blanket license is inferred from the Arabic Quran source. Every translation, tafsir, Hadith collection/edition, dua compilation, recitation recording, font, and artwork requires its own source identity, exact edition, license/permission, attribution, and offline/caching/streaming rights review. Until individually approved, these content types remain blocked or display a clear unavailable state.

### Non-negotiable publication rules

- AI may assist search, navigation, summaries of app documentation, or user-interface help, but must never generate, complete, paraphrase, correct, reconstruct, or silently substitute Quranic Arabic, ayah references, translations, Hadith, or prophetic duas as canonical app content.
- AI output must never be inserted into the canonical religious-content database or presented as a sourced verse.
- Canonical ayah display must come only from an approved immutable source record with Surah/Ayah identifiers and edition/version metadata.
- Verify source-file checksum at import and deployment; verify per-record content hashes; run exact comparison against the approved source snapshot; block publication on any missing, extra, reordered, duplicate, or changed character/diacritic.
- Keep original source bytes/string and display string identical. Do not NFC/NFD normalize, strip diacritics, replace glyphs, auto-correct, transliterate, or apply typography transformations to the canonical text.
- Store source attribution and required license notice visibly in the app's About / Sources screen and wherever the source license requires it.
- A technical checksum proves file identity, not religious correctness. Keep an independent human review/sign-off and source-version audit trail.
