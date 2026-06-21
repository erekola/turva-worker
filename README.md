# turvadev-pretender

Cloudflare Worker that renders every page of [turva.dev](https://turva.dev) at the edge, with deterministic head metadata, JSON-LD, and `/.well-known/` manifests. AI agents and scanners read the same payload as humans, straight from the Worker.

This repository is the open-source reference implementation behind turva.dev, which ranks #1 of all publicly-scanned sites on the startuphub.ai agent-readiness leaderboard and scores a perfect 100 / 100 Level 5 Agent-Native on Cloudflare Agent-Ready. The Worker is public on purpose: a buyer can read every line before deciding anything.

## What it does

* Renders every page (home, guides, blog, services, company, legal, contact) from markdown held in the Worker, each with a canonical `&lt;head&gt;` (meta, OpenGraph, JSON-LD, canonical).
* Serves `/.well-known/` files agents look for: `ai.txt`, `llms.txt`, `agents.json`, `mcp/server-card.json`, `ap2`, `acp`, `x402`, `x402-mesh.json`, `ucp`, `auth`.
* Maintains `robots.txt` and `sitemap.xml` aligned with the same source of truth.

## Scanner results

Measured on `https://turva.dev` on 2026-06-21. Two independent public scanners, listed once each.

| Scanner | Result |
|---|---|
| Cloudflare Agent-Ready (isitagentready.com) | 100 / 100, Level 5 Agent-Native |
| startuphub.ai Agent Readiness | 100 / 100 (A+), #1 of top 100 sites |

Cloudflare Agent-Ready and isitagentready.com are the same scanner on two domains, so they count as one result.

### startuphub.ai category breakdown

These six category scores come from the startuphub.ai scan. The Cloudflare Agent-Ready scan uses a different model (no Quality category, Commerce optional), so this breakdown is StartupHub's.

| Category | Score |
|---|---|
| Discoverability | 100 / 100 |
| Content | 100 / 100 |
| Access Control | 100 / 100 |
| Capabilities | 100 / 100 |
| Commerce | 100 / 100 |
| Quality | 100 / 100 |

## Web security

Agent-readiness is one axis; the domain's own web security is another. We publish turva.dev's own scan results so a buyer can see the same house is in order, not just claimed. Measured on `turva.dev` on 2026-06-20.

| Scanner | Result |
|---|---|
| Hardenize | All 13 categories passed |
| Internet.nl | 98 / 100 |

The missing 2 points on Internet.nl are a deliberate tradeoff: TLS 1.2 is kept enabled for broad client compatibility, while everything else passes. We document the choice rather than hide it.

## Verify

Every claim above is publicly auditable. Run the scanners yourself or open the company record.

* StartupHub leaderboard: https://www.startuphub.ai/agent-readiness
* isitagentready scan: https://isitagentready.com/turva.dev
* Hardenize report: https://www.hardenize.com/report/turva.dev/
* Internet.nl report: https://internet.nl/site/turva.dev/
* Company (Finnish Business Information System): https://tietopalvelu.ytj.fi/yritys/3600281-7

## Agent-readiness reference

A consolidated, self-contained reference to the surfaces agents read, with a short definition of each and a link to its full guide, is in [docs/agent-readiness.md](docs/agent-readiness.md).

## Agent-readiness guides

Plain-language explanations of the surfaces this Worker implements, and why each one matters to an AI agent. Published on turva.dev.

* [Agent-readiness guides (index)](https://turva.dev/guides)
* [What an agent-readiness audit is](https://turva.dev/guides/agent-readiness-audit)
* [llms.txt explained](https://turva.dev/guides/llms-txt)
* [Serving markdown to agents](https://turva.dev/guides/markdown-for-agents)
* [Response headers that help agents](https://turva.dev/guides/response-headers-for-agents)
* [Sitemaps, robots.txt and agent access](https://turva.dev/guides/sitemaps-and-robots-for-agents)
* [Prerendering and why agents see empty pages](https://turva.dev/guides/prerendering-for-agents)
* [MCP server cards explained](https://turva.dev/guides/mcp-server-card)
* [What agents.json is](https://turva.dev/guides/agents-json)
* [The /.well-known directory for agents](https://turva.dev/guides/well-known-for-agents)
* [How agents authenticate](https://turva.dev/guides/agent-authentication)
* [JSON-LD and structured data for agents](https://turva.dev/guides/json-ld-structured-data)
* [x402 and agent payments](https://turva.dev/guides/x402-agent-payments)
* [SEO and agent-readiness are not the same](https://turva.dev/guides/seo-vs-agent-readiness)
* [Why agent-readiness should be measured, not asserted](https://turva.dev/guides/measurement-led-agent-readiness)
* [Common agent-readiness gaps on marketing sites](https://turva.dev/guides/agent-readiness-gaps)

## How it works

The Worker renders the whole site at the edge. Every page is built from a single source-of-truth object in the Worker: page content as markdown, plus a shared canonical `&lt;head&gt;` and JSON-LD. There is no separate CMS or origin to proxy. Agent routes (`/.well-known/*`, `robots.txt`, `sitemap.xml`, `/x402`) are served from the same Worker, and static assets such as images come from Workers Assets.

Because the site has no CMS, theme, or plugins, nothing can drift between what humans see and what agents and scanners see.

## Endpoints

| Path | Purpose |
|---|---|
| `/` and all HTML routes | Rendered by the Worker from markdown |
| `/.well-known/ai.txt` | AI agent disclosure |
| `/.well-known/llms.txt` | LLM consumption guide |
| `/.well-known/agents.json` | Agent skills manifest |
| `/.well-known/mcp/server-card.json` | MCP server card |
| `/.well-known/ap2` | Agent Payments Protocol pointer |
| `/.well-known/acp` | Agent Commerce Protocol manifest |
| `/.well-known/x402` | x402 payment manifest |
| `/.well-known/x402-mesh.json` | x402 mesh manifest |
| `/.well-known/ucp` | Universal Commerce Profile |
| `/.well-known/auth` | OAuth / auth discovery |
| `/x402` | HTTP 402 payment-required endpoint |
| `/robots.txt` | Crawler directives |
| `/sitemap.xml` | URL index |

## Deploy

Requires a Cloudflare account and the `wrangler` CLI. No runtime secret is needed; the Worker renders the whole site itself.
```
cd turvadev-pretender
npm install
npx wrangler deploy
```

Route the Worker to your domain under **Workers &amp; Pages, your-worker, Settings, Domains &amp; Routes**.

## Use it for your own site

MIT licensed. Fork it, replace the source-of-truth object with your own data, and deploy.

If you want an audit of your domain against the same scanner set and a tailored configuration, see [turva.dev](https://turva.dev) or [Erik Rekola on LinkedIn](https://www.linkedin.com/in/erikrekola).

## Security

Responsible disclosure: see [SECURITY.md](SECURITY.md). Contact: [info@turva.dev](mailto:info@turva.dev)


## License

[MIT](LICENSE)
