# Endpoints

The public routes this Worker serves, copied from the repository README so the README can stay short. Left out on purpose: the per-recipient brief addresses under `/brief/`, which are unlisted and carry a noindex header, the old paths of the previous site, which redirect to their current pages through `LEGACY_REDIRECTS` in `src/worker.ts`, and the static images in `public/`, such as the OG cards. The Worker is the single source of truth: if a path is listed here it resolves in `src/worker.ts`, and `node tools/verify.mts --live` fetches a fixed list of public discovery surfaces. Adding `--twins` also fetches every canonical page and its Markdown twin (two paced requests per page). Routes outside that list, such as the PGP key and the MCP registry authentication files, are not fetched by `--live`.

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
| `/.well-known/ard.json` | Agentic Resource Discovery manifest, ARD v0.91 path (same entries as ai-catalog.json) |
| `/.well-known/ai-catalog.json` | Agentic Resource Discovery catalog, predecessor path kept for clients and scanners that read it |
| `/.well-known/agent-skills/index.json` | Agent skills index |
| `/openapi.json` | OpenAPI description |
| `/.well-known/api-catalog` | API catalog linkset (RFC 9727) |
| `/.well-known/ap2` | Agent Payments Protocol pointer |
| `/.well-known/acp` | Agentic Commerce Protocol manifest |
| `/.well-known/x402` | x402 payment manifest |
| `/.well-known/ucp` | Universal Commerce Profile |
| `/.well-known/mpp` | MPP discovery manifest |
| `/.well-known/oauth-authorization-server` | OAuth / auth discovery |
| `/.well-known/oauth-protected-resource` | OAuth protected resource metadata |
| `/auth.md` | Agent authentication guide: the anonymous and verified-email pathways and where the agent auth endpoints live |
| `/agent/auth/register`, `/agent/auth/claim`, `/agent/auth/revoke` | Agent identity registration, out-of-band flow |
| `/oauth/authorize`, `/oauth/token` | OAuth endpoints (spec-valid closed errors, see `/auth.md`) |
| `/api` | x402 402 challenge. The free endpoint index moved to `/api/v1` in v3.51.0 |
| `/api/v1` | API index JSON |
| `POST /v1/message:send` | A2A HTTP+JSON transport, revision 0.3.0. Name a skill with `metadata.skillId` |
| `GET /v1/tasks/{id}`, `POST /v1/tasks/{id}:cancel` | A2A task routes. `message:send` answers at once and never creates a task, so a GET on a task id and a cancel on a task id both answer -32001 task not found with status 404 |
| `/api/agent/audit`, `/api/agent/advisory`, `/api/agent/implementation` | x402 payable service routes (HTTP 402, quote-on-request) |
| `/api/acp` | Agentic Commerce Protocol base: lists the checkout session routes and points at the discovery manifest |
| `/api/acp/checkout_sessions` | ACP checkout sessions (stateless, buyer review before payment) |
| `/.well-known/agent-skills/<name>/skill.md` | Individual agent skill files |
| `/.well-known/signatures.json` | Ed25519 signatures for the signed manifests |
| `/.well-known/jwks.json` | Public keys for verifying the signatures |
| `/.well-known/security.txt` | Security contact (RFC 9116) |
| `/pgp-key.asc`, `/.well-known/pgp-key.asc` | OpenPGP version 4 Ed25519 public key, the key Web Key Directory serves |
| `/pgp-key-v6.asc` | OpenPGP version 6 post-quantum public key: ML-DSA-65+Ed25519 signing key with an ML-KEM-768+X25519 encryption subkey |
| `/.well-known/openpgpkey/policy` | WKD direct method policy for turva.dev |
| `/.well-known/openpgpkey/hu/<hash>` | WKD direct method key lookup for turva.dev |
| `/.well-known/mcp-registry-auth` | Public key that proves this domain to the MCP registry for `dev.turva/turva-mcp` (HTTP domain authentication) |
| `openpgpkey.turva.dev/.well-known/openpgpkey/turva.dev/policy`, `openpgpkey.turva.dev/.well-known/openpgpkey/turva.dev/hu/<hash>` | WKD advanced method on its own subdomain, required for the DNS record to resolve (Tek-288) |
| `mta-sts.turva.dev/.well-known/mta-sts.txt` | MTA-STS policy for mail sent to turva.dev, served on its own subdomain |
| `/x402` | HTTP 402 payment-required endpoint |
| `/robots.txt` | Crawler directives |
| `/sitemap.xml` | URL index |
| `/blog/feed.xml` | Blog RSS feed |
| `/<indexnow-key>.txt` | IndexNow key file. A weekly cron resubmits the canonical pages whose sitemap date falls in the last eight days |
| Aliases | `/ai.txt`, `/security.txt`, `/.well-known/mcp.json`, `/.well-known/openid-configuration`, `/.well-known/openapi.json`, `/api-catalog`, `/.well-known/ap2.json`, `/.well-known/acp.json`, `/.well-known/acp/config.json`, `/.well-known/acp/manifest.json`, `/.well-known/a2a/agent-card.json`, `/agent/auth/revocation`, favicons and fediverse redirects (`host-meta`, `webfinger`, `nodeinfo`) |
| `/llms-txt-validator` | llms.txt structure checker (HTML form, JSON for agents) |
| `/markdown-parity-check` | Main-content comparison of this site's pages with the markdown-parity-check package (HTML form, JSON POST for agents); `/markdown-parity-check.js` adds the busy state and the JSON copy and save, and the form works without it |
| `/badge` and `/badge.svg` | Agent-ready badge criteria and embeddable SVG |
| `/samples/audit-report`, `/samples/shopify-agent-storefront-check` | Public synthetic sample reports for the two fixed-scope diagnoses, invented sites, markdown twins at `.md` |
| `/external-domain-check` | Product page of the external domain check, ordered by email, markdown twin at `.md` |
| `/samples/external-domain-check` | Public sample report of the external domain check, made from turva.dev's own domain with real readings, markdown twin at `.md` |
| `/agent-readiness-audit` | Product page of the website and API audit (the guide at `/guides/agent-readiness-audit` stays a guide), markdown twin at `.md` |
| `/blog-filter.js` | Same-origin script for the blog index search and kind filter, allowed by `script-src 'self'`; the index lists every post without it |
| `/nav.js` | Same-origin script that closes the mobile menu on Escape and when focus leaves it, allowed by `script-src 'self'`; the menu opens and closes without it |

Content negotiation on the page routes is simplified on purpose: the path decides when it names a representation (a `.md` address serves markdown), and otherwise the `Accept` header is read as the three explicit types `text/html`, `text/markdown` and `application/json` ranked by q-value, with markdown winning a tie against HTML and JSON losing one to HTML, so wildcards such as `text/*` and `*/*` and media type parameters other than `q` do not count in the ranking and a listed type the route does not offer can still outrank one it does, which RFC 9110 allows because a server may ignore `Accept`.

Back to the [README](../README.md).
