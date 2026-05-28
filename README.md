# turvadev-pretender

Cloudflare Worker that serves deterministic head metadata, JSON-LD, and `/.well-known/` manifests for [turva.dev](https://turva.dev). AI agents and scanners read the same payload regardless of CMS state.

## What it does

- Injects a canonical `<head>` (meta, OpenGraph, JSON-LD, canonical) on every HTML response.
- Serves `/.well-known/` files agents look for: `ai.txt`, `llms.txt`, `agents.json`, `mcp/server-card.json`, `ap2`, `acp`, `x402`, `x402-mesh.json`, `ucp`, `auth`.
- Maintains `robots.txt` and `sitemap.xml` aligned with the same source of truth.

## Scanner results

Measured on `https://turva.dev` on 2026-05-28.

| Scanner | Result |
|---|---|
| turva.dev agent-readiness scanner | 100 / 100 (A+) |
| startuphub.ai leaderboard | #1 of top 100 sites |
| isitagentready.com 100 / 100 |

Sub-scores on the turva.dev scanner:

| Category | Score |
|---|---|
| Discoverability | 100/100 |
| Content | 100/100 |
| Access Control | 100/100 |
| Capabilities | 100/100 |
| Commerce | 100/100 |
| Quality | 100/100 |

## How it works

The Worker sits in front of the origin. Every HTML response is intercepted, the `<head>` is replaced with a canonical block built from a single source-of-truth object in the Worker. Non-HTML agent routes (`/.well-known/*`, `robots.txt`, `sitemap.xml`, `/x402`) are served directly from the Worker, bypassing the origin.

A CMS change, theme update, or misconfigured plugin cannot break the metadata that agents and scanners see.

## Endpoints

| Path | Purpose |
|---|---|
| `/` and all HTML routes | Head injection on origin response |
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

Requires a Cloudflare account and `wrangler` CLI.

```powershell
cd turvadev-pretender
npm install
npx wrangler secret put PRERENDER_TOKEN
npx wrangler deploy
```

Route the Worker to your domain under **Workers & Pages → your-worker → Settings → Domains & Routes**.

## Use it for your own site

MIT licensed. Fork it, replace the source-of-truth object with your own data, deploy.

If you want an audit of your domain against the same scanner set and a tailored configuration, see [turva.dev](https://turva.dev).

## License

[MIT](LICENSE)