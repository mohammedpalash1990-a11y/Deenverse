# DEENVERSE Integration Checklist

This checklist is owned by the integration/QA workstream. Check an item only after verifying the relevant PR or implementation.

## Contract alignment
- [ ] Jules publishes an API contract and schema examples.
- [ ] Queen maps frontend data needs to the agreed contract.
- [ ] Error, loading, empty, pagination, and auth states are aligned.
- [ ] API contract changes are versioned and communicated.

## Integration
- [ ] Frontend uses typed API adapters rather than scattered hard-coded URLs.
- [ ] Development mocks are clearly separated from production data.
- [ ] Authentication/session lifecycle is consistent.
- [ ] User bookmarks and progress are correctly scoped.
- [ ] Audio streaming respects source licensing and provider limits.
- [ ] RTL and localization survive real API content.

## Verification
- [ ] Main branch builds from a clean checkout.
- [ ] Unit and integration tests pass.
- [ ] Critical end-to-end flows pass.
- [ ] Quran text integrity tests pass against approved source snapshots.
- [ ] Accessibility and responsive checks pass.
- [ ] No secrets or fabricated content are present.
- [ ] Release notes list limitations and verified functionality.

## Merge policy
Do not merge a PR solely because an agent reports completion. Review changed files, inspect test evidence, verify CI, resolve conflicts, and confirm content/security requirements first.
