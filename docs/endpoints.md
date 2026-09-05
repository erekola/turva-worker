# Endpoints

Every route this Worker serves, copied from the repository README so the README can stay short. The Worker is the single source of truth: if a path is listed here it resolves in `src/worker.js`, and `node tools/verify.mjs --live` fetches every declared surface.

| Path | Purpose |
|---|---|
| `/` and all HTML routes | Rendered by the Worker from markdown |
| `/.well-known/ai.txt` | AI agent disclosure |
| `/llms.txt` | LLM consumption guide |
| `/llms-full.txt` | The whole site as one text file |
| `/<page>.md` | The markdown twin of any page at its own address, `/index.md` for the home page (llms.txt v2) |
| `/.well-known/agent.json` | ai-plugin / agent manifest |
| `/.well-known/ai-plugin.json` | ai-plugin manifest, byte-identical to `agent.json` and signed with it (round 15 P3-1 added the row; the route existed and was verified all along) |
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
| `/api` | x402 402 challenge. The free endpoint index moved to `/api/v1` in v3.51.0 |
| `/api/v1` | API index JSON |
| `POST /v1/message:send` | A2A HTTP+JSON transport, revision 0.3.0. Name a skill with `metadata.skillId` |
| `/api/agent/audit`, `/api/agent/advisory`, `/api/agent/implementation` | x402 payable service routes (HTTP 402, quote-on-request) |
| `/api/acp/checkout_sessions` | ACP checkout sessions (stateless, buyer review before payment) |
| `/.well-known/agent-skills/<name>/skill.md` | Individual agent skill files |
| `/.well-known/signatures.json` | Ed25519 signatures for the signed manifests |
| `/.well-known/jwks.json` | Public keys for verifying the signatures |
| `/.well-known/security.txt` | Security contact (RFC 9116) |
| `/pgp-key.asc`, `/.well-known/pgp-key.asc` | PGP public key |
| `/.well-known/openpgpkey/policy` | WKD advanced method policy for turva.dev |
| `/.well-known/openpgpkey/hu/<hash>` | WKD advanced method key lookup for turva.dev |
| `openpgpkey.turva.dev/.well-known/openpgpkey/turva.dev/policy`, `openpgpkey.turva.dev/.well-known/openpgpkey/turva.dev/hu/<hash>` | WKD advanced method on its own subdomain, required for the DNS record to resolve (Tek-288) |
| `/x402` | HTTP 402 payment-required endpoint |
| `/robots.txt` | Crawler directives |
| `/sitemap.xml` | URL index |
| `/blog/feed.xml` | Blog RSS feed |
| `/<indexnow-key>.txt` | IndexNow key file. A weekly cron resubmits the canonical URLs |
| Aliases | `/ai.txt`, `/security.txt`, `/.well-known/mcp.json`, `/.well-known/openid-configuration`, `/.well-known/openapi.json`, favicons, and fediverse redirects (`host-meta`, `webfinger`, `nodeinfo`) |
| `/llms-txt-validator` | llms.txt structure checker (HTML form, JSON for agents) |
| `/badge` and `/badge.svg` | Agent-ready badge criteria and embeddable SVG |
| `/samples/audit-report`, `/samples/shopify-agent-storefront-check` | Public synthetic sample reports for the two fixed-scope diagnoses, invented sites, markdown twins at `.md` |

Back to the [README](../README.md).
