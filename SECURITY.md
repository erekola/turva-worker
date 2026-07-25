# Security Policy

## Supported Versions

The site is a Cloudflare Worker, continuously deployed from `main`. Only the
currently deployed version is supported; there are no released version branches.

| Version | Supported |
| ------- | --------- |
| Current (deployed from main) | :white_check_mark: |

## Open advisories

Dependabot advisories against this repository are in the build and test
toolchain rather than in what ships. `turva-worker/package.json` declares no
runtime `dependencies` at all. Its only entry is `wrangler`, under
`devDependencies`, so the deployed Worker bundles no third-party runtime code
and no advisory against this repository reaches production. They are still
cleared as they appear, because this repository is a reference implementation
people fork. Checked 2026-07-26.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately
by emailing **info@turva.dev**.

Please do not open a public issue for security reports.

You can expect an initial response within a few days. If the issue is
confirmed, a fix will be prioritized and you'll be kept informed of progress.
