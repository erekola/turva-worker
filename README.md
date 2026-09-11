# turva-worker

The Cloudflare Worker behind [turva.dev](https://turva.dev). It serves HTML for people and Markdown for automated clients from shared content sources, with discovery metadata for agents and APIs.

I use this site as a working reference. You can inspect the code or adapt it for your own domain.

[Live site](https://turva.dev) · [Endpoint inventory](docs/endpoints.md) · [Technical reference](docs/agent-readiness.md)

## Try the two representations

Request the same page as HTML and as Markdown:

```sh
curl -H "Accept: text/html" https://turva.dev/
curl -H "Accept: text/markdown" https://turva.dev/
```

In Windows PowerShell, use `curl.exe` if `curl` resolves to `Invoke-WebRequest`. You can also open [index.md](https://turva.dev/index.md) directly. The home page's Markdown is intentionally more concise than its HTML presentation.

## Command-line tools

Two npm packages cover checks you can run against your own site:

| Package | Checks |
| --- | --- |
| [turva-llms-txt-validator](https://www.npmjs.com/package/turva-llms-txt-validator) | llms.txt structure and home-page discovery declarations. |
| [markdown-parity-check](https://www.npmjs.com/package/markdown-parity-check) | Differences between the main content of a page's HTML and Markdown representations. |

With Node.js 22 or newer installed, replace the example addresses with your own:

```sh
npx --yes turva-llms-txt-validator example.com --json
npx --yes markdown-parity-check --url https://example.com/page --format json
```

The comparison requests both formats from the same URL. Add `--markdown-url https://example.com/page.md` if your Markdown has a separate address. Intentional differences, such as this site's shorter home-page Markdown, still appear in the comparison. See the [validator](https://github.com/erekola/llms-txt-validator) and [parity checker](https://github.com/erekola/markdown-parity-check) READMEs for exit codes and limits.

This Worker also hosts both checks in the browser. The [llms.txt validator](https://turva.dev/llms-txt-validator) accepts any public domain. The [Markdown parity check](https://turva.dev/markdown-parity-check) checks turva.dev's own published pages only, so use the command above for another site.

## Run locally

Use Node.js 22 or 24, the versions covered by this repository's CI. From the root of your own clone, install the nested project's dependencies and start Wrangler locally:

```sh
npm --prefix turva-worker ci
npm --prefix turva-worker run dev -- --local
```

Open the local URL Wrangler prints. The `dev` script is defined in [turva-worker/package.json](turva-worker/package.json). Local storage starts without the separately managed client briefs, and links in the content still point to turva.dev until you adapt them. Review the [configuration](turva-worker/wrangler.jsonc) before testing features that use bindings.

## How it works

Page prose lives in `PAGE_MARKDOWN` in [the Worker source](turva-worker/src/worker.js) and is rendered into HTML at the edge. Layout and interactive elements are implemented in code. Shared metadata supplies canonical URLs, Open Graph tags and JSON-LD.

The public site runs without a separate CMS or origin server. Static assets are served through Cloudflare Workers Assets. Sharing content sources reduces drift between HTML and Markdown, while the repository's checks test for inconsistencies.

The Worker also serves the hosted llms.txt validator, the hosted Markdown parity check and public sample reports. It publishes an Ed25519 public key and signatures for four discovery resources so readers can verify their response bytes.

The [MCP server](https://github.com/erekola/turva-mcp#connect) runs separately. This repository publishes its discovery card and links to it. The [standalone validator](https://github.com/erekola/llms-txt-validator) provides a CLI and Node package.

## Hosted Markdown parity check

`/markdown-parity-check` runs the comparison from the npm package [markdown-parity-check](https://github.com/erekola/markdown-parity-check). The Worker imports the package's library entry, which Wrangler bundles at deploy time. The version is pinned in [turva-worker/package.json](turva-worker/package.json) and its lockfile. The comparison code is the same one the command-line tool runs. Fetching and limits belong to this route:

- It checks turva.dev's own published pages only. The Worker renders the page and its Markdown version through its own request handler, so a check sends no request over the network. The two tool pages are not accepted as targets.
- An address on another host is refused with HTTP 403 and a pointer to `npx markdown-parity-check`. Forwarding other hosts to a separate Worker is switched off in [wrangler.jsonc](turva-worker/wrangler.jsonc).
- Its limits are lower than the command-line defaults: HTML up to 512 KiB, Markdown up to 128 KiB and at most 250 000 block pairs.
- The `PARITY_LIMITER` binding allows about 10 checks per minute per client IP at each Cloudflare location. Without the binding the route answers 503 and runs nothing.
- Every response to a check carries `Cache-Control: no-store`, and the route does not write the target address or the report to its logs.

The pinned release can be older than the latest npm release, and the report's `toolVersion` field names the one that ran. A newer package reaches the hosted page only through a site release.

## Endpoints

| Path | Purpose |
| --- | --- |
| `/` and public page routes | HTML rendered by the Worker |
| `/index.md`, `/<page>.md` | Direct Markdown representations |
| `/llms.txt`, `/llms-full.txt` | Site guide and consolidated text |
| `/robots.txt`, `/sitemap.xml` | Crawler directives and URL inventory |
| `/openapi.json`, `/api/v1` | API description and endpoint index |
| `/.well-known/*` | Agent, API, authentication and commerce discovery |
| `/.well-known/mcp/server-card.json` | Discovery card for the separate MCP server |
| `/.well-known/signatures.json`, `/.well-known/jwks.json` | Detached signatures and public verification keys |
| `/api`, `/x402`, `/api/agent/*` | Payment-required responses and quote-on-request service routes |
| `/llms-txt-validator` | Structure checker with HTML and JSON responses |
| `/markdown-parity-check` | HTML and Markdown comparison of this site's pages, as a form and a JSON POST |
| `/agent-readiness-audit`, `/shopify-agent-storefront-check` | Product pages, with the service comparison at `/services` |
| `/samples/audit-report`, `/samples/shopify-agent-storefront-check` | Sample reports using invented sites |
| `/blog-filter.js` | Search and kind filter for the blog index. Every post remains listed without it |

See [docs/endpoints.md](docs/endpoints.md) for the complete inventory, including A2A, checkout, OAuth and mail-related endpoints.

## Scanner results

The published turva.dev reference build recorded 100/100, Level 5 Agent-Native on [isitagentready.com](https://isitagentready.com/) on 2026-09-06. This is a dated measurement of this domain. A fork needs its own checks.

<details>
<summary>Category results and measurement limits</summary>

### isitagentready.com category breakdown

isitagentready.com groups its checks into five categories. turva.dev passes every check in all five in the recorded snapshot.

| Category | Result |
| --- | --- |
| Discoverability | 100/100 |
| Content | 100/100 |
| Bot Access Control | 100/100 |
| API, Auth, MCP & A2A Discovery | 100/100 |
| Commerce | 100/100 |

Commerce is optional in the scanner's model and is included here. Individual check counts are omitted because the scanner's public page and MCP interface report different check sets.

</details>

The payment routes return x402 challenges and publish Stripe payment links. x402 settlement is quote-on-request and confirmed out of band. This Worker does not verify an incoming x402 payment and automatically release a paid service. Scope is agreed in writing before payment.

## Web security

Recorded on 2026-09-06: all 24 categories passed on [Hardenize](https://www.hardenize.com/report/turva.dev), 98/100 on the [Internet.nl website test](https://internet.nl/site/turva.dev/) and 95/100 on the [Internet.nl email test](https://internet.nl/mail/turva.dev/).

The website deduction concerned the key-exchange hash function in one HTTPS sub-test. Its IPv6, DNSSEC and RPKI checks passed in full. The email deduction concerned the receiving mail servers' cipher configuration, operated by the mail provider. Its IPv6, DNSSEC and RPKI checks passed in full. DMARC with DKIM and SPF also passed.

Use the linked reports for current results. Recorded values and dates are maintained in [tools/facts.json](tools/facts.json).

## Verify

[tools/verify.mjs](tools/verify.mjs) compares source and documentation with [tools/facts.json](tools/facts.json). It checks published claims and file integrity, including the use of Markdown content sources.

`tools/verify.mjs`, the Worker's tests and the Worker itself import markdown-parity-check. Install the nested project's runtime dependencies first, from the repository root:

```sh
npm --prefix turva-worker ci --omit=dev --ignore-scripts
node tools/verify.mjs
npm --prefix turva-worker test
```

GitHub Actions runs the same install, the local tests and the documentation checks on Node.js 22 and 24. The repository's workflow does not deploy the site.

The live variant contacts the declared public endpoints and the separate MCP server. It also verifies the four signed manifests against the published JWKS:

```sh
node tools/verify.mjs --live
```

These checks are tailored to turva.dev. Update the facts and checks for your own site. The live checks do not deploy changes.

## Adapt and deploy your own site

Requires Node.js, npm and a Cloudflare account. Wrangler is a development dependency in the nested project. The repository contains turva.dev's production configuration. Before deploying a fork:

1. Replace the page content, business identity, canonical URLs, service data, payment links and discovery metadata in [the Worker source](turva-worker/src/worker.js) with your own.
2. Set your Worker name, domain routes and `zone_name` in [wrangler.jsonc](turva-worker/wrangler.jsonc). Both `workers_dev` and preview URLs are disabled, so configure routes and proxied DNS for the hostnames you intend to serve.
3. Use your own `RATE_LIMITER`, `PARITY_LIMITER` and `BRIEFIT` bindings. `BRIEFIT` is a KV namespace that stores separately managed client briefs, and those records are not included in this repository. Remove the corresponding functionality if your site does not need it.
4. Replace the IndexNow key and scheduled submission configuration, or remove the scheduled task if you do not use it.
5. Publish your own verification key and regenerate the detached signatures for your response bytes. Modified manifests need new signatures. Keep the private signing key outside the repository and publish only the public key and signatures.

The Worker does not require a runtime signing secret. Its signatures are prepared ahead of deployment and stored with the public content. You still need your own Cloudflare bindings and deployment credentials.

After adapting the configuration and passing the relevant checks, run from the repository root:

```sh
npm --prefix turva-worker ci
npm --prefix turva-worker run deploy
```

## Guides and contact

[The guides](https://turva.dev/guides) explain the surfaces implemented here. [The blog](https://turva.dev/blog) contains implementation notes and research.

Maintained by [Erik Rekola](https://github.com/erekola) in Tampere, Finland. Contact [info@turva.dev](mailto:info@turva.dev). I work in writing.

## Security

For supported versions and private vulnerability reporting, see [SECURITY.md](SECURITY.md).

## License

The Worker source is [MIT licensed](LICENSE). The live turva.dev Agent API and its data are proprietary, see the [service terms](https://turva.dev/legal).
