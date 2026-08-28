# turva-worker

Cloudflare Worker that renders every page of [turva.dev](https://turva.dev) at the edge, with a deterministic head and matching `/.well-known/` manifests. AI agents and scanners read the same payload as humans, straight from the Worker.

This repository is the open-source reference implementation behind turva.dev, which scores 100/100 at Level 5 Agent-Native on isitagentready.com, Cloudflare's agent-readiness scanner. turva.dev sells agent-readiness audits and advisory, and the wider work of making the data agents act on and the decisions they make reliable. What you buy is expertise and implementation, not access to a tool. The Worker is public on purpose: the scoring is done by a third-party scanner, and a buyer can read every line before deciding anything.

## What it does

* Renders every page (home, guides, blog, services, company, legal, contact) from markdown held in the Worker, each with a canonical `<head>` (meta, OpenGraph, JSON-LD, canonical).
* Serves the manifests agents look for: `/llms.txt`, plus these `/.well-known/` files: `ai.txt`, `agent.json`, `mcp/server-card.json`, `agent-card.json`, `ai-catalog.json`, `ap2`, `acp`, `x402`, `ucp`, and OAuth discovery (`oauth-authorization-server`), among others. The full inventory is in [docs/endpoints.md](docs/endpoints.md).
* Maintains `robots.txt` and `sitemap.xml` aligned with the same source of truth.

A consolidated reference to every surface agents read, with a short definition of each and a link to its full guide, is in [docs/agent-readiness.md](docs/agent-readiness.md). Plain-language guides to every surface this Worker implements: [turva.dev/guides](https://turva.dev/guides). Measurement notes and scan write-ups: [turva.dev/blog](https://turva.dev/blog).

## Scanner results

Measured on `https://turva.dev` on 2026-08-20: 100/100, Level 5 (Agent-Native) on isitagentready.com, Cloudflare's agent-readiness scanner.

### isitagentready.com category breakdown

isitagentready.com groups its checks into five categories. turva.dev passes every check in all five.

| Category | Result |
|---|---|
| Discoverability | 100/100 |
| Content | 100/100 |
| Bot Access Control | 100/100 |
| API, Auth, MCP & A2A Discovery | 100/100 |
| Commerce | 100/100 |

Commerce is optional in the isitagentready model, and turva.dev passes all five of its checks: x402, MPP, UCP, ACP and AP2. The payment surface is real rather than declared. A request to /api answers with an x402 402 challenge naming a wallet on Base, and the payable operations carry live Stripe payment links. Settlement is still quote-on-request, confirmed out of band instead of executed automatically, so the site claims no rail it does not have.

## Web security

Agent-readiness is one axis. The domain's own web security is another. turva.dev publishes its own scan results so a buyer can see the same house is in order, not just claimed. Measured on `turva.dev` on 2026-08-28.

| Scanner | Result |
|---|---|
| Hardenize | All 24 categories passed |
| Internet.nl website test | 98/100 |
| Internet.nl email test | 95/100 |

On the Internet.nl website test, IPv6, DNSSEC and RPKI pass in full. The single deduction is one HTTPS sub-test, the hash function for key exchange. On the email test, IPv6, DNSSEC, DMARC with DKIM and SPF, and RPKI pass in full, and the deduction is in the cipher configuration of the receiving mail servers, which the mail provider operates. Both results are documented, not hidden.

## Verify

Every claim above is publicly auditable. Run the scanners yourself or open the company record.

* isitagentready scanner: https://isitagentready.com/
* Hardenize report: https://www.hardenize.com/report/turva.dev
* Internet.nl website report: https://internet.nl/site/turva.dev/
* Internet.nl email report: https://internet.nl/mail/turva.dev/
* Company (Finnish Business Information System): https://tietopalvelu.ytj.fi/yritys/3600281-7

The repo also carries the deploy gate the site runs on itself: [tools/verify.mjs](tools/verify.mjs) checks the source against [tools/facts.json](tools/facts.json), the single home for the volatile facts: versions, prices, scanner results and measured dates. The static run checks file integrity, pricing, versions, measured-date anchors and the twin gate that fails the run if hand-written prose appears outside the markdown twins. The live run also fetches every declared surface and verifies the Ed25519 signatures of the four signed manifests against the published JWKS.

```
node tools/verify.mjs
node tools/verify.mjs --live
```

## How it works

The Worker renders the whole site at the edge. Every page is built from a single source-of-truth object in the Worker: page content as markdown, plus a shared canonical `<head>` and JSON-LD. There is no separate CMS or origin to proxy. Agent routes (`/.well-known/*`, `robots.txt`, `sitemap.xml`, `/x402`) are served from the same Worker, and static assets such as images come from Workers Assets.

Because the site has no CMS or plugins, nothing can drift between what humans see and what agents and scanners see.

## Endpoints

| Path | Purpose |
|---|---|
| `/` and all HTML routes | Rendered by the Worker from markdown |
| `/llms.txt`, `/llms-full.txt` | LLM consumption guide, whole site as text |
| `/<page>.md` | Markdown twin of any page at its own address (llms.txt v2) |
| `/.well-known/mcp/server-card.json` | MCP server card |
| `/.well-known/signatures.json`, `/.well-known/jwks.json` | Ed25519 signatures and keys |
| `/x402`, `/api/agent/*` | Payment-required and payable service routes |
| `/llms-txt-validator` | llms.txt structure checker |

Full inventory of all 39 routes: [docs/endpoints.md](docs/endpoints.md).

## Deploy

Requires a Cloudflare account and the `wrangler` CLI. No runtime secret is needed. The Worker renders the whole site itself. The Worker project lives in a subdirectory of the same name, so the repeated path below is not a typo.

```
cd turva-worker/turva-worker
npm install
npx wrangler deploy
```

Route the Worker to your domain under **Workers & Pages, your-worker, Settings, Domains & Routes**.

## Use it for your own site

MIT licensed. Fork it, replace the source-of-truth object with your own data, then deploy.

If you want an audit of your domain against the same scanners this repository is measured by, isitagentready for agent-readiness plus the published Hardenize and Internet.nl security scans, and a tailored configuration, see [turva.dev](https://turva.dev) or [Erik Rekola on LinkedIn](https://www.linkedin.com/in/erikrekola).

## Security

Responsible disclosure: see [SECURITY.md](SECURITY.md). Contact: [info@turva.dev](mailto:info@turva.dev)

## License

The Worker source is MIT. The live turva.dev Agent API and its data are proprietary (see [/legal](https://turva.dev/legal)).

[MIT](LICENSE)
