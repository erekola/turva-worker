# Security Policy

## Supported Versions

The site is a Cloudflare Worker, continuously deployed from `main`. Only the
currently deployed version is supported. There are no released version branches.

| Version | Supported |
| ------- | --------- |
| Current (deployed from main) | :white_check_mark: |

## Open advisories

The deployed Worker carries third-party runtime code.
`turva-worker/package.json` declares one runtime dependency,
`markdown-parity-check`, pinned to an exact version. Since 2026-09-11 the
Worker imports it for the hosted check at `/markdown-parity-check`, so wrangler
bundles that package into the deployed script together with the code it uses
from its own dependencies, such as `htmlparser2` and the `micromark` parsers.
`turva-worker/package-lock.json` resolves the runtime tree to 79 packages,
`markdown-parity-check` included.

An advisory against a package in that tree can reach production, and it is
handled as a production issue: the pin moves to a fixed version and the Worker
is redeployed. The hosted check parses only turva.dev pages that the Worker
renders itself and answers 403 for any other host. That narrows what input
reaches the parsers. It does not make such an advisory irrelevant.

`wrangler` is the only entry under `devDependencies`. Advisories against it
and its own dependencies are in the build and test toolchain. They are still
cleared as they appear, because this repository is a reference implementation
people fork. `npm audit` found no advisories in either tree.
Checked 2026-09-21.

`esbuild` is in the toolchain only as a dependency of wrangler. Wrangler
4.134.0 declares it at exactly `0.28.1`, the release that fixed
GHSA-g7r4-m6w7-qqqr, an arbitrary file read in the esbuild development server
on Windows. `turva-worker/package-lock.json` resolves that version, and
`turva-worker/package.json` does not override it.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately
by emailing **info@turva.dev**.

Please do not open a public issue for security reports.

You can expect an initial response within a few days. If the issue is
confirmed, a fix will be prioritized and you'll be kept informed of progress.
