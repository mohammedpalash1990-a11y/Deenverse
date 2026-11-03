# Dependency audit and lockfile policy

## Current state

The web foundation currently declares exact top-level dependency versions in `package.json`, but does not yet commit a `package-lock.json`. CI therefore uses `npm install` rather than `npm ci`; dependency resolution is not yet fully reproducible.

The CI workflow captures `npm audit --json` and prints a compact list of affected packages, severity, affected version range, and whether npm reports a fix. This is diagnostic reporting, not a security waiver.

## Remediation policy

1. Review the exact advisory, affected transitive dependency, dependency path, and available patched version.
2. Prefer the smallest compatible non-breaking update. Do not run `npm audit fix --force` as a blanket remediation.
3. Re-run typecheck, all tests, and production build after each dependency change.
4. Generate and review `package-lock.json` using the project's pinned Node/npm toolchain.
5. Once the lockfile is committed and reviewed, change CI from `npm install` to `npm ci`.
6. Keep the audit report visible in CI until all high/critical findings are resolved or explicitly documented with an accepted, time-bounded exception.

## Scope and limitations

An npm audit result covers known advisories in the resolved dependency graph at the time of the run. A clean audit does not prove application security, and a reported fix does not guarantee compatibility. Security review must include runtime behavior, update notes, tests, and deployment configuration.
