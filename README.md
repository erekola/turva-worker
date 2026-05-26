# turvadev-pretender

A Cloudflare Worker that serves deterministic head metadata, JSON-LD, and `/.well-known/` manifests for [turva.dev](https://turva.dev), so AI agents and scanners read consistent information regardless of CMS state.

## What it does

- Injects canonical `<head>` content (meta tags, OpenGraph, JSON-LD, hreflang, canonicals) on every HTML response.
- Serves `/.well-known/` files agents look for: `ai.txt`, `llms.txt`, `agents.json`, `mcp/server-card.json`, `ap2`, `acp`, `x402-mesh.json`.
- Maintains `robots.txt` and `sitemap.xml` aligned with the same source of truth.
- Returns the same payload per language (EN default, FI), so multilingual scanners do not see drift.

## Scanner results

Numbers measured on turva.dev after deployment.

| Scanner | Score |
|---|---|
| Cloudflare AI Audit | 100/100 |
| Internet.nl | 98/100 |
| Hardenize | 13/13 |
| StartupHub agent-readiness | A+ |

## How it works

The Worker sits in front of the origin. Every HTML response is intercepted, parsed once, and the `<head>` is replaced with a canonical block built from a single source-of-truth object. Non-HTML routes (`/.well-known/*`, `robots.txt`, `sitemap.xml`) are served directly from the Worker, bypassing the origin.

This means a CMS change, a theme update, or a misconfigured plugin cannot break the metadata that agents and scanners see.

## Endpoints

| Path | Purpose |
|---|---|
| `/` and all HTML routes | Head injection on origin response |
| `/.well-known/ai.txt` | AI agent disclosure |
| `/.well-known/llms.txt` | LLM consumption guide |
| `/.well-known/agents.json` | Agent skills manifest |
| `/.well-known/mcp/server-card.json` | MCP server card |
| `/.well-known/ap2` | Agent Payments Protocol pointer |
| `/.well-known/acp` | Agent Commerce Protocol pointer |
| `/.well-known/x402-mesh.json` | x402 payment mesh manifest |
| `/robots.txt` | Crawler directives |
| `/sitemap.xml` | URL index |

## Deploy

Requires a Cloudflare account, `wrangler` CLI, and a `PRERENDER_TOKEN` secret if you use a prerender service.

```bash
cd turvadev-pretender
npm install
npx wrangler secret put PRERENDER_TOKEN
npx wrangler deploy
```

Route the Worker to your domain in the Cloudflare dashboard under Workers Routes.

## Use it for your own site

The Worker is MIT licensed. Fork it, replace the source-of-truth object with your own data, and deploy. If you want an audit of your domain against the same scanner set and a tailored configuration, see [turva.dev](https://turva.dev/services).

## License

[MIT](LICENSE)