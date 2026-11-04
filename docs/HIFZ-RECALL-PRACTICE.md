# Hifz: self-guided Ayah recall

## Available behavior

The existing Quran Ayah reader now offers **Start Hifz practice** after its
source-validating client returns a successful Ayah record. No separate scripture
copy, generated text, ingestion, or approval bypass is introduced.

1. Load an Ayah using its Surah/Ayah coordinates.
2. Read the exact returned Arabic text, with available source-backed translation.
3. Choose **Start Hifz practice** to remove Arabic, translation and footnotes from
   the rendered DOM. Recall independently at your own pace.
4. Choose **Reveal Ayah** to compare against the unchanged source text.
5. Choose **Hide Ayah again** to repeat, or **Exit practice** for ordinary reading.

Source attribution, edition and Ayah reference remain visible throughout. No
words, diacritics, or verse boundaries are rewritten for the exercise. Translation
text/footnotes arriving after recall begins remain concealed until reveal.
Loading another Ayah removes the previous result and resets practice state.

## Accessibility and privacy

- Native buttons support standard keyboard activation. The primary button stays
  mounted across transitions; exiting restores focus to it.
- `aria-expanded`/`aria-controls` expose disclosure state. A polite status region
  announces conceal/reveal without automatically reading the whole Arabic text.
- Concealed content is not merely made transparent or hidden with CSS: it is
  absent from the DOM, including the translation and publisher footnotes.
- Controls wrap on narrow screens and have a minimum 44px height.
- Practice uses transient React state only. It adds no localStorage, IndexedDB,
  server-side progress, telemetry, microphone access, recording, or extra fetch.
- This is a recall aid, not a privacy/security boundary. Previously loaded text
  remains in application memory and may be available through developer tools.

## Explicit limitations

There is no speech recognition, pronunciation/Tajweed grading, memorization
score, schedule, saved progress, multi-Ayah lesson, audio, or teacher approval.
For recitation feedback consult a qualified teacher. Corpus/source approval and
production availability remain separate release gates. A successful client
response does not itself independently prove upstream authenticity or permission.

## QA evidence

Synthetic, explicitly non-Quran strings exercise six component tests and three
additional reader-level integration tests. Coverage includes exact strings,
concealed DOM, translation/footnote concealment, repeated recall, focus restoration,
remount/reset behavior, source attribution, pending translation completion and
loading another Ayah. Existing idle/source-rejection tests also assert that recall
controls are absent until a record is accepted. No real scripture fixture is added.
Manual mobile/browser/screen-reader verification remains required.
