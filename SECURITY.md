# Security Policy

## Reporting
Do not publish exploitable vulnerabilities, credentials, personal data, or production secrets in public issues. Contact the repository owner privately through GitHub's available security reporting channel.

## Baseline requirements
- Never commit secrets, private keys, tokens, service-account files, or production data.
- Use least-privilege credentials and server-side authorization.
- Validate inputs and rate-limit authentication and public endpoints.
- Store passwords only using an established password-hashing scheme if password auth is selected.
- Protect sessions, OTP flows, and account recovery against replay and brute force.
- Use parameterized database queries and safe migrations.
- Log security-relevant events without logging secrets or sensitive religious/user data.
- Review dependencies and keep supported versions patched.
- Apply privacy-by-design and document data retention/deletion behavior.

## Incident response
Revoke exposed credentials immediately, assess scope, rotate affected secrets, preserve relevant audit evidence, and document remediation before release.
