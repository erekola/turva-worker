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
`turva-worker/package-lock.json` resolves the runtime tree to 69 packages,
`markdown-parity-check` included.

An advisory against a package in that tree can reach production, and it is
handled as a production issue: the pin moves to a fixed version and the Worker
is redeployed. The hosted check parses only turva.dev pages that the Worker
renders itself and answers 403 for any other host. That narrows what input
reaches the parsers. It does not make such an advisory irrelevant.

`wrangler` is the only entry under `devDependencies`. Advisories against it
and its own dependencies are in the build and test toolchain. They are still
cleared as they appear, because this repository is a reference implementation
people fork. `npm audit` finds no advisories in the runtime tree and none in
the full tree, which adds wrangler. On 2026-10-06 the full
tree reported three vulnerable packages: `wrangler`, `miniflare` and `sharp`.
All three traced to `sharp` 0.35.4 and GHSA-wq5f-xc86-pv6w, a high advisory
in the librsvg that `sharp` bundles. `miniflare` 5.20261006.0-alpha, which
wrangler 4.148.0 pulled in, pinned `sharp` at exactly 0.35.4.
`package.json` carried an `overrides` entry forcing `sharp` to `^0.35.5`, the
fixed release, until 2026-10-09, when wrangler 4.149.0 brought in `miniflare`
5.20261006.1-alpha, which pins `sharp` at exactly 0.35.5. The override and
the `allowScripts` key for 0.35.4 came out then. None of these advisories was
in the runtime tree. None reached the deployed Worker. An earlier set, ten
advisories in `undici` 7.29.0, cleared when wrangler 4.145.0 brought in the
patched `undici` 7.29.1. Checked 2026-10-09.

`esbuild` is in the toolchain only as a dependency of wrangler. Wrangler
4.149.0 declares it at exactly `0.28.2`. The fix for GHSA-g7r4-m6w7-qqqr, an
arbitrary file read in the esbuild development server on Windows, landed in
`0.28.1`. `turva-worker/package-lock.json` resolves `0.28.2`, and
`turva-worker/package.json` does not override it.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately
by emailing **info@turva.dev**. Send encrypted reports to erik@turva.dev. The OpenPGP key is at https://turva.dev/pgp-key.asc.

Please do not open a public issue for security reports.

You can expect an initial response within one business day. If the issue is
confirmed, a fix will be prioritized and you'll be kept informed of progress.
