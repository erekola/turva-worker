# turva-worker

The Cloudflare Worker behind [turva.dev](https://turva.dev): a website with HTML for people, Markdown for automated clients, and discovery metadata for agents and APIs.

This is turva.dev's open-source reference implementation. Explore the running site, inspect the code, or adapt the implementation for your own domain.

[Live site](https://turva.dev) · [Markdown entry point](https://turva.dev/index.md) · [Endpoint inventory](docs/endpoints.md) · [Agent-readiness reference](docs/agent-readiness.md)

## Start here

| You want to | Start with |
| --- | --- |
| Understand the implementation | [Worker source](turva-worker/src/worker.js) |
| See the discovery and protocol routes | [Endpoint inventory](docs/endpoints.md) |
| Understand what each surface is for | [Technical reference](docs/agent-readiness.md) and [plain-language guides](https://turva.dev/guides) |
| Inspect the published measurements | [Scanner results](#scanner-results), [web security](#web-security) and [verification](#verify) |
| Try the llms.txt checker | [Hosted validator](https://turva.dev/llms-txt-validator) or [standalone CLI and Node package](https://github.com/erekola/llms-txt-validator) |
| Connect to turva.dev's MCP tools | [The separate turva-mcp repository](https://github.com/erekola/turva-mcp#connect) |

## What it does

- Renders public pages from Markdown, with shared page metadata, canonical URLs, Open Graph tags and JSON-LD.
- Serves Markdown representations through `Accept: text/markdown` and direct `.md` URLs.
- Publishes `llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml` and agent-discovery manifests.
- Exposes API, authentication, agent and commerce routes, with their capabilities and limits declared in the corresponding metadata.
- Serves the hosted llms.txt validator and public sample audit reports.
- Publishes an Ed25519 public key and signatures for four discovery resources so readers can verify the response bytes.

## How it works

Page prose is maintained in the Worker's `PAGE_MARKDOWN` data and rendered into HTML at the edge. Layout, metadata and interactive elements are implemented in code. Markdown responses offer a text representation of the content, and the home page's Markdown is intentionally more concise than its HTML presentation.

The public site runs without a separate CMS or origin server. Static assets are served through Cloudflare Workers Assets. Sharing content sources reduces the opportunities for HTML and Markdown to diverge, while the repository's checks test for inconsistencies.

The main files are [the Worker](turva-worker/src/worker.js), [deployment configuration](turva-worker/wrangler.jsonc), [verification script](tools/verify.mjs) and [recorded facts](tools/facts.json). The MCP server runs separately, and this repository publishes its discovery card and links to it.

## Endpoints

| Path | Purpose |
| --- | --- |
| `/` and the public page routes | HTML rendered by the Worker |
| `/index.md`, `/<page>.md` | Direct Markdown representations |
| `/llms.txt`, `/llms-full.txt` | Site guide and consolidated text |
| `/robots.txt`, `/sitemap.xml` | Crawler directives and URL inventory |
| `/openapi.json`, `/api/v1` | API description and endpoint index |
| `/.well-known/*` | Agent, API, authentication and commerce discovery, see the full inventory |
| `/.well-known/mcp/server-card.json` | Discovery card for the separate MCP server |
| `/.well-known/signatures.json`, `/.well-known/jwks.json` | Detached signatures and public verification keys |
| `/api`, `/x402`, `/api/agent/*` | Payment-required responses and quote-on-request service routes |
| `/llms-txt-validator` | Structure checker with HTML and JSON responses |
| `/samples/audit-report`, `/samples/shopify-agent-storefront-check` | Public sample reports using invented sites |

See [docs/endpoints.md](docs/endpoints.md) for the complete route inventory, including A2A, checkout, OAuth and mail-related endpoints.

## Scanner results

Measured on **https://turva.dev** on **2026-09-01**: **100/100, Level 5 (Agent-Native)** on [isitagentready.com](https://isitagentready.com/), Cloudflare's agent-readiness scanner.

These measurements describe the published turva.dev reference build. They are a dated snapshot and do not automatically carry over to a fork or another domain.

### isitagentready.com category breakdown

isitagentready.com groups its checks into five categories. turva.dev passes every check in all five in the recorded snapshot.

| Category | Result |
| --- | --- |
| Discoverability | 100/100 |
| Content | 100/100 |
| Bot Access Control | 100/100 |
| API, Auth, MCP & A2A Discovery | 100/100 |
| Commerce | 100/100 |

Commerce is optional in the scanner's model and is included in this result. Category scores are shown without individual check counts because the scanner's public page and MCP interface report different check sets.

The payment routes return x402 challenges and publish Stripe payment links. x402 settlement is quote-on-request and confirmed out of band. This Worker does not verify an incoming x402 payment and automatically release a paid service. Scope is agreed in writing before payment.

## Web security

Separate web-security measurements for **turva.dev**, recorded on **2026-09-01**:

| Scanner | Result |
| --- | --- |
| [Hardenize](https://www.hardenize.com/report/turva.dev) | All 24 categories passed |
| [Internet.nl website test](https://internet.nl/site/turva.dev/) | 98/100 |
| [Internet.nl email test](https://internet.nl/mail/turva.dev/) | 95/100 |

The website test passed IPv6, DNSSEC and RPKI in full. Its deduction was one HTTPS sub-test concerning the key-exchange hash function. The email test passed IPv6, DNSSEC, DMARC with DKIM and SPF, and RPKI in full, and its deduction concerned the receiving mail servers' cipher configuration, which is operated by the mail provider.

Use the linked reports to check current results. The recorded measurement dates and values are maintained in [tools/facts.json](tools/facts.json).

## Verify

The repository includes the consistency checks used for the reference build. [tools/verify.mjs](tools/verify.mjs) compares source and documentation with [tools/facts.json](tools/facts.json), including versions, prices, measurement dates, category scores, file integrity and the use of Markdown content sources.

Run the static check from the **repository root** with Node.js:

```sh
node tools/verify.mjs
```

The live variant also contacts the declared surfaces and the separate MCP server, and verifies the four signed manifests against the published JWKS:

```sh
node tools/verify.mjs --live
```

These checks are tailored to turva.dev's content and published claims. A fork needs corresponding facts and checks for its own site. The live checks use the configured public endpoints, and they do not deploy changes.

The Worker's local test suites are in [turva-worker/test](turva-worker/test). From the repository root, run:

```sh
npm --prefix turva-worker test
```

For independent verification, use the [agent-readiness scanner](https://isitagentready.com/), the web-security reports above and the [Finnish Business Information System record](https://tietopalvelu.ytj.fi/yritys/3600281-7).

## Adapt and deploy your own site

Requires Node.js, npm and a Cloudflare account. Wrangler is included as a development dependency in the nested [turva-worker/package.json](turva-worker/package.json).

The repository contains turva.dev's production configuration. Before deploying a fork:

1. Replace the page content, business identity, canonical URLs, service data, payment links and discovery metadata in [the Worker source](turva-worker/src/worker.js) with your own.
2. Set your Worker name, domain routes and `zone_name` in [wrangler.jsonc](turva-worker/wrangler.jsonc). Both `workers_dev` and preview URLs are disabled, so configure routes and proxied DNS for the hostnames you intend to serve.
3. Use your own `RATE_LIMITER` namespace and `BRIEFIT` KV namespace. The latter stores separately managed client briefs, and those records are not included in this repository. Remove the corresponding functionality if your site does not need it.
4. Replace the IndexNow key and scheduled submission configuration, or remove the scheduled task if you do not use it.
5. Publish your own verification key and regenerate the detached signatures for your response bytes. The bundled signatures belong to turva.dev's content and will not validate modified manifests. Keep the private signing key outside the repository and publish only the public key and signatures.

The current Worker does not require a runtime signing secret: its signatures are prepared ahead of deployment and stored with the public content. This does not replace the need for your own Cloudflare bindings and deployment credentials.

After adapting the configuration and passing the relevant checks, start in the **repository root** and deploy the nested Worker project:

```sh
cd turva-worker
npm ci
npm run deploy
```

The single `cd turva-worker` enters the directory that contains `package.json` and `wrangler.jsonc`. It assumes you are already in the cloned repository's root.

## Guides and services

[turva.dev/guides](https://turva.dev/guides) explains the discovery, content and protocol surfaces implemented here. [turva.dev/blog](https://turva.dev/blog) contains measurement notes and research.

For agent-readiness audits, Shopify storefront checks, advisory and implementation, see [turva.dev](https://turva.dev). Work is scoped in writing and handled asynchronously. Contact [info@turva.dev](mailto:info@turva.dev) or find [Erik Rekola on LinkedIn](https://www.linkedin.com/in/erikrekola).

## Security

For supported versions and private vulnerability reporting, see [SECURITY.md](SECURITY.md).

## License

The Worker source is [MIT licensed](LICENSE). The live turva.dev Agent API and its data are proprietary, see the [service terms](https://turva.dev/legal).
