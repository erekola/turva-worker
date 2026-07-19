# turva-worker

Cloudflare Worker that renders every page of [turva.dev](https://turva.dev) at the edge, with a deterministic head and matching `/.well-known/` manifests. AI agents and scanners read the same payload as humans, straight from the Worker.

This repository is the open-source reference implementation behind turva.dev, which scores 100/100 at Level 5 Agent-Native on isitagentready.com, Cloudflare’s agent-readiness scanner. The Worker is public on purpose: a buyer can read every line before deciding anything.

turva.dev offers agent-readiness audits and advisory, and the wider work of making the data agents act on and the decisions they make reliable, across use cases from commerce and monitoring to operations under bad connectivity.

What you buy is expertise and implementation, not access to a tool. The scoring is done by an independent third-party scanner, isitagentready.com, so the numbers above are verifiable rather than asserted. This repository is the reference implementation and the manifests behind that work.

## What it does

* Renders every page (home, guides, blog, services, company, legal, contact) from markdown held in the Worker, each with a canonical `<head>` (meta, OpenGraph, JSON-LD, canonical).
* Serves the manifests agents look for: `/llms.txt`, plus these `/.well-known/` files: `ai.txt`, `agent.json`, `mcp/server-card.json`, `agent-card.json`, `ai-catalog.json`, `ap2`, `acp`, `x402`, `ucp`, and OAuth discovery (`oauth-authorization-server`), among others; the full inventory is in the Endpoints table below.
* Maintains `robots.txt` and `sitemap.xml` aligned with the same source of truth.

## Scanner results

Measured on `https://turva.dev` on 2026-07-17.

| Scanner | Result |
|---|---|
| Cloudflare Agent-Ready (isitagentready.com) | 100/100, Level 5 Agent-Native |

Cloudflare Agent-Ready and isitagentready.com are the same scanner on two domains, so they count as one result.

### isitagentready.com category breakdown

isitagentready.com groups its checks into five categories. turva.dev passes every check in four of them.

| Category | Result |
|---|---|
| Discoverability | 100/100 |
| Content | 100/100 |
| Bot Access Control | 100/100 |
| API, Auth, MCP & A2A Discovery | 100/100 |
| Commerce | Optional |

Commerce is optional in the isitagentready model. turva.dev's commerce surface is quote-on-request: it publishes a working x402 payment endpoint but does not wire machine settlement, and it does not declare a payment rail it does not have, so the checks it does not implement are left honestly red rather than faked.

## Web security

Agent-readiness is one axis; the domain's own web security is another. turva.dev publishes its own scan results so a buyer can see the same house is in order, not just claimed. Measured on `turva.dev` on 2026-07-16.

| Scanner | Result |
|---|---|
| Hardenize | All 13 categories passed |
| Internet.nl | 98/100 |

On Internet.nl, IPv6, DNSSEC and RPKI pass in full. The single deduction is one HTTPS sub-test, the hash function for key exchange. The result is documented, not hidden.

## Verify

Every claim above is publicly auditable. Run the scanners yourself or open the company record.

* isitagentready scanner: https://isitagentready.com/
* Hardenize report: https://www.hardenize.com/report/turva.dev
* Internet.nl report: https://internet.nl/site/turva.dev/
* Company (Finnish Business Information System): https://tietopalvelu.ytj.fi/yritys/3600281-7

The repo also carries the deploy gate the site runs on itself: [tools/verify.mjs](tools/verify.mjs) checks the source against [tools/facts.json](tools/facts.json), the single home for the volatile facts: versions, prices, scanner results and measured dates. The static run checks file integrity, pricing, versions, measured-date anchors and the twin gate that fails the run if hand-written prose appears outside the markdown twins. The live run also fetches every declared surface and verifies the Ed25519 signatures of the four signed manifests against the published JWKS.

```
node tools/verify.mjs
node tools/verify.mjs --live
```

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
* [Choosing an agent-readiness audit](https://turva.dev/guides/choosing-an-agent-readiness-audit)
* [How to get your site cited by AI assistants](https://turva.dev/guides/get-cited-by-ai-assistants)
* [Agent commerce discovery: A2A, AP2, and ACP](https://turva.dev/guides/agent-commerce-discovery)
* [Agent-readiness, AEO and GEO: how they relate](https://turva.dev/guides/agent-readiness-aeo-geo)
* [Agentic commerce readiness](https://turva.dev/guides/agentic-commerce-readiness)
* [Letting agents act on data: the decision envelope](https://turva.dev/guides/letting-agents-act-on-data)
* [AI agent use cases](https://turva.dev/guides/ai-agent-use-cases)
* [Open Knowledge Format (OKF) explained](https://turva.dev/guides/open-knowledge-format)
* [Agentic Resource Discovery and ai-catalog.json](https://turva.dev/guides/agentic-resource-discovery)

## Blog

Notes on AI agents and the work of letting them read a site and act on a system safely. Published on turva.dev.

* [Blog (index)](https://turva.dev/blog)
* [The twin is the page](https://turva.dev/blog/the-twin-is-the-page)
* [Every response promised a rate limit. Nothing enforced it.](https://turva.dev/blog/enforcing-the-rate-limit-i-advertised)
* [Microsoft said the patches would get bigger. I measured how much bigger.](https://turva.dev/blog/measuring-the-ai-patch-surge)
* [How to let an AI agent work in your repo without leaking your secrets](https://turva.dev/blog/agent-secret-hygiene)
* [How agent-ready are Finnish B2B sites? I scanned sixteen](https://turva.dev/blog/agent-readiness-finnish-b2b)
* [When honesty and the checker disagree](https://turva.dev/blog/honesty-and-the-checker)
* [What an agent pays to read your site](https://turva.dev/blog/cheaper-pages-for-agents)
* [When an agent can prove it is Claude](https://turva.dev/blog/verifiable-agent-identity)
* [What makes an AI agent's decisions reliable](https://turva.dev/blog/reliable-agent-decisions)
* [Owning your fediverse identity](https://turva.dev/blog/owning-your-fediverse-identity)
* [Passing the agent commerce checks without faking them](https://turva.dev/blog/honest-agent-commerce-checks)
* [Moving turva.dev off prerender.io](https://turva.dev/blog/moving-off-prerender)
* [What the Open Knowledge Format is, and what it is not](https://turva.dev/blog/open-knowledge-format)
* [Publishing an ai-catalog.json for agentic discovery](https://turva.dev/blog/publishing-an-ai-catalog)
* [What one agent-readiness scanner cannot tell you](https://turva.dev/blog/two-scanner-audit-method)
* [Agent access is now a setting](https://turva.dev/blog/agent-access-is-now-a-setting)
* [A free llms.txt validator](https://turva.dev/blog/free-llms-txt-validator)
* [Auditing the auditor with four AI agents](https://turva.dev/blog/auditing-the-auditor)
* [Moving the source from GitHub to Codeberg](https://turva.dev/blog/moving-source-to-codeberg)
* [The page grew, the agent bill did not](https://turva.dev/blog/cheaper-pages-revisited)
* [Four AI agents re-checked the guides](https://turva.dev/blog/re-checking-the-guides)

## How it works

The Worker renders the whole site at the edge. Every page is built from a single source-of-truth object in the Worker: page content as markdown, plus a shared canonical `<head>` and JSON-LD. There is no separate CMS or origin to proxy. Agent routes (`/.well-known/*`, `robots.txt`, `sitemap.xml`, `/x402`) are served from the same Worker, and static assets such as images come from Workers Assets.

Because the site has no CMS or plugins, nothing can drift between what humans see and what agents and scanners see.

## Endpoints

| Path | Purpose |
|---|---|
| `/` and all HTML routes | Rendered by the Worker from markdown |
| `/.well-known/ai.txt` | AI agent disclosure |
| `/llms.txt` | LLM consumption guide |
| `/llms-full.txt` | The whole site as one text file |
| `/.well-known/agent.json` | ai-plugin / agent manifest |
| `/.well-known/mcp/server-card.json` | MCP server card |
| `/.well-known/agent-card.json` | A2A agent card |
| `/.well-known/ai-catalog.json` | Agentic Resource Discovery catalog |
| `/.well-known/agent-skills/index.json` | Agent skills index |
| `/openapi.json` | OpenAPI description |
| `/.well-known/api-catalog` | API catalog linkset (RFC 9727) |
| `/.well-known/ap2` | Agent Payments Protocol pointer |
| `/.well-known/acp` | Agent Commerce Protocol manifest |
| `/.well-known/x402` | x402 payment manifest |
| `/.well-known/ucp` | Universal Commerce Profile |
| `/.well-known/mpp` | MPP discovery manifest |
| `/.well-known/oauth-authorization-server` | OAuth / auth discovery |
| `/.well-known/oauth-protected-resource` | OAuth protected resource metadata |
| `/auth.md` | Agent registration metadata (public key at `/.well-known/mcp-registry-auth`) |
| `/agent/auth/register`, `/agent/auth/claim`, `/agent/auth/revoke` | Agent identity registration, out-of-band flow |
| `/oauth/authorize`, `/oauth/token` | OAuth endpoints (spec-valid closed errors, see `/auth.md`) |
| `/api` and `/api/v1` | API index JSON |
| `/api/agent/audit`, `/api/agent/advisory`, `/api/agent/implementation` | x402 payable service routes (HTTP 402, quote-on-request) |
| `/api/acp/checkout_sessions` | ACP checkout sessions (stateless, buyer review before payment) |
| `/.well-known/agent-skills/<name>/skill.md` | Individual agent skill files |
| `/.well-known/signatures.json` | Ed25519 signatures for the signed manifests |
| `/.well-known/jwks.json` | Public keys for verifying the signatures |
| `/.well-known/security.txt` | Security contact (RFC 9116) |
| `/x402` | HTTP 402 payment-required endpoint |
| `/robots.txt` | Crawler directives |
| `/sitemap.xml` | URL index |
| `/blog/feed.xml` | Blog RSS feed |
| `/<indexnow-key>.txt` | IndexNow key file; a weekly cron resubmits the canonical URLs |
| Aliases | `/ai.txt`, `/security.txt`, `/.well-known/mcp.json`, `/.well-known/openid-configuration`, `/.well-known/openapi.json`, favicons, and fediverse redirects (`host-meta`, `webfinger`, `nodeinfo`) |
| `/llms-txt-validator` | llms.txt structure checker (HTML form, JSON for agents) |
| `/badge` and `/badge.svg` | Agent-ready badge criteria and embeddable SVG |

## Deploy

Requires a Cloudflare account and the `wrangler` CLI. No runtime secret is needed; the Worker renders the whole site itself.
```
cd turva-worker/turva-worker
npm install
npx wrangler deploy
```

Route the Worker to your domain under **Workers & Pages, your-worker, Settings, Domains & Routes**.

## Use it for your own site

MIT licensed. Fork it, replace the source-of-truth object with your own data, then deploy.

If you want an audit of your domain against the same scanner set and a tailored configuration, see [turva.dev](https://turva.dev) or [Erik Rekola on LinkedIn](https://www.linkedin.com/in/erikrekola).

## Security

Responsible disclosure: see [SECURITY.md](SECURITY.md). Contact: [info@turva.dev](mailto:info@turva.dev)

## License

The Worker source is MIT. The live turva.dev Agent API and its data are proprietary (see [/legal](https://turva.dev/legal)).

[MIT](LICENSE)
