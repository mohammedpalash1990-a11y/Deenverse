# Queen Assignment — Frontend Foundation

Repository: https://github.com/mohammedpalash1990-a11y/Deenverse
Work branch: queen/frontend-foundation
Target base: main
Submit a PR; do not merge it yourself.

## Mission
Own the premium DEENVERSE product UI and frontend foundation for Web/PWA, designed to extend cleanly to Android and iOS. This is a fresh repository: inspect the docs and propose the frontend stack before building.

## Required work
1. Inspect README, architecture direction, roadmap, content-integrity policy, and `docs/PHASE-1-MVP.md`.
2. Propose a frontend stack and folder structure with reasons; do not assume a framework is preselected.
3. Create a coherent premium design system: typography, spacing, colors, responsive breakpoints, accessible components, icons, and interaction states.
4. Build the first responsive app shell and navigation for Quran, Hadith, Duas & Adhkar, Learn, Bookmarks, and Settings.
5. Prioritize the Phase 1 Quran catalogue and reader journeys defined in `docs/PHASE-1-MVP.md`: Arabic-first RTL, Surah/Ayah navigation, translation-edition selector, audio-control surface, and bookmark affordance.
6. Use clearly labeled placeholder/demo records only. Never invent Quran Arabic, hadith text, translations, tafsir, dua wording, reciter identities, or religious citations.
7. Add accessible loading, empty, error, and offline states; keyboard and screen-reader support; mobile-first layouts.
8. Add tests or visual checks for routing, core components, responsive layout, and RTL behavior.
9. Document setup, routes, design tokens, component conventions, and integration needs.

## Phase 1 behavior requirements
- Use typed API adapters rather than scattering raw URLs across components.
- Keep demo/mock adapters visibly separate from production adapters.
- Never present mock data as verified religious content.
- A bookmark action must not claim cloud sync unless authenticated backend persistence is actually available.
- Audio controls must not claim playback unless a licensed stream is configured and playback succeeds.

## Content integrity
- Never generate, paraphrase, reconstruct, or alter Quranic Arabic.
- Do not display fabricated religious text as real content. Use neutral placeholders such as "Verified content will appear here."
- Show attribution/source metadata slots for every religious content item.
- Clearly label Hifz/Tajweed features as practice assistance, not authoritative assessment.

## Collaboration
- Coordinate API contracts with jules/backend-foundation; use mock adapters until backend contracts are agreed.
- Do not modify backend scope or commit to main.
- Keep commits small and descriptive.
- Open a PR against main with screenshots, responsive/RTL evidence, tests run, and known gaps.

## Acceptance criteria
- Premium, consistent, responsive interface
- Real working navigation and interactions, not decorative controls
- Correct RTL and accessibility behavior
- No fabricated religious content
- Documented setup and integration contracts
- PR ready for review with evidence
