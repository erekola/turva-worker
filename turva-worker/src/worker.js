// src/worker.js
// turva.dev worker v3.126.0 - guides re-read against their primary sources (Astra 2026-09-05, Tek-349): ARD v0.91 named /.well-known/ard.json and rel="ard", so the site now serves /.well-known/ard.json (same entries, v0.91 MCP media type), announces it with a Link header and a <link rel="ard"> in every page head, and keeps ai-catalog.json for the scanner and the MCP Server Card discovery document; the ARD, MCP card, well-known, robots and commerce guides say the current state (MCP card default location, robots.txt effect per bot, AP2 v0.1 extension scoped to v0.1). LLMS_TXT gained one line (re-sign).
// v3.125.0 was: the old-price post carries a dated correction and its FAQ answer names the 2026-08-31 Shopify price change; the home first paragraph names websites and APIs; the home Evidence block and the /services lead link the three published measurements (567 sites, four assistants, thirty days); /services title reads "Agent-readiness audits for websites, APIs and Shopify stores" (Codex SEO/AEO audit 2026-09-05, session koonti items 2, 4 and 5). Prices, promises and LLMS_TXT unchanged.

const INDEXNOW_KEY = "9b7e4c21a8f3d65e0c1b9a4d7f2e8c63";

var X402_PAY_TO = "0x023184fe62881ed1d938192b7a4b09d0119d7d39";
var X402_USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

var LEGACY_REDIRECTS = {
  "/en": "/", "/en/": "/",
  "/en/packages": "/services", "/en/packages/": "/services",
  "/en/company": "/company", "/en/company/": "/company",
  "/en/contact": "/contact", "/en/contact/": "/contact",
  "/en/legal": "/legal", "/en/legal/": "/legal",
  "/fi": "/", "/fi/": "/",
  "/fi/paketit": "/services", "/fi/paketit/": "/services",
  "/fi/palvelut": "/services", "/fi/palvelut/": "/services",
  "/fi/yritys": "/company", "/fi/yritys/": "/company",
  "/fi/yhteystiedot": "/contact", "/fi/yhteystiedot/": "/contact",
  "/fi/juridiikka": "/legal", "/fi/juridiikka/": "/legal",
  "/fi/tietosuoja": "/legal", "/fi/tietosuoja/": "/legal",
  "/paketit": "/services", "/paketit/": "/services",
  "/palvelut": "/services", "/palvelut/": "/services",
  "/yritys": "/company", "/yritys/": "/company",
  "/yritystiedot": "/company", "/yritystiedot/": "/company",
  "/yhteystiedot": "/contact", "/yhteystiedot/": "/contact",
  "/juridiikka": "/legal", "/juridiikka/": "/legal",
  "/tietosuoja": "/legal", "/tietosuoja/": "/legal",
  "/packages": "/services", "/packages/": "/services",
  "/pricing": "/services", "/pricing/": "/services",
  "/checkout": "/services", "/checkout/": "/services",
  "/audit": "/services", "/audit/": "/services",
  "/advisory": "/services", "/advisory/": "/services",
  "/privacy": "/legal", "/privacy/": "/legal",
  "/services/": "/services",
  "/company/": "/company",
  "/contact/": "/contact",
  "/legal/": "/legal"
};

var MTA_STS_POLICY = `version: STSv1
mode: enforce
mx: mxext1.mailbox.org
mx: mxext2.mailbox.org
mx: mxext3.mailbox.org
mx: mxext4.mailbox.org
max_age: 604800
`;

var CSP_HTML = [
  "default-src 'self'",
  "script-src 'self' 'sha256-aa/XgWAsbnyIjrazJucWqYec3ki7mwuHIGaUjjTaPOM='",
  "style-src 'self' 'unsafe-inline' https: data:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: wss:",
  "media-src 'self' https: data:",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
  "upgrade-insecure-requests"
].join("; ");

var PERMISSIONS_POLICY = [
  "accelerometer=()", "ambient-light-sensor=()", "autoplay=()", "battery=()",
  "camera=()", "display-capture=()", "document-domain=()", "encrypted-media=()",
  "fullscreen=(self)", "geolocation=()", "gyroscope=()", "magnetometer=()",
  "microphone=()", "midi=()", "payment=()", "picture-in-picture=()",
  "publickey-credentials-get=()", "screen-wake-lock=()", "sync-xhr=()",
  "usb=()", "web-share=()", "xr-spatial-tracking=()"
].join(", ");

// The agent-API paths, as one regex, so the 429 answer in worker_default and the 405 answer
// in serve405 describe the same surface the same way. /llms-txt-validator is the one path with
// two policies and is decided by the accepted request (see the 429 branch).
var AGENT_API_PATH_RE = /^\/(api|v1|x402|openapi\.json|llms(-full)?\.txt|\.well-known|agent\/auth|auth\.md|robots\.txt|sitemap\.xml|security\.txt|ai\.txt|api-catalog|blog\/feed\.xml|oauth\/(authorize|token)|favicon\.(ico|svg)|[0-9a-f]{32}\.txt)(\/|$)/;

function applySecurityHeaders(headers, kind) {
  headers.delete("nel");
  headers.delete("report-to");
  headers.delete("reporting-endpoints");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "0");
  headers.set("Permissions-Policy", PERMISSIONS_POLICY);
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("RateLimit-Policy", '"default";q=100;w=60');
  if (kind === "html") {
    headers.set("Content-Security-Policy", CSP_HTML);
    headers.set("Cross-Origin-Resource-Policy", "same-origin");
    headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
  } else if (kind === "agent-api") {
    headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  } else {
    headers.set("Cross-Origin-Resource-Policy", "same-origin");
  }
}

// One list, one signal line. The ten Allow blocks used to be ten hand-typed copies of
// the same Content-Signal line (round 13 R1a-2); now a copy cannot drift from its siblings.
var ROBOTS_ALLOW_AGENTS = ["*", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended"];
var ROBOTS_DISALLOW_AGENTS = ["FacebookBot", "Meta-ExternalAgent"];
var ROBOTS_CONTENT_SIGNAL = "Content-Signal: search=yes, ai-input=yes, ai-train=yes";
var ROBOTS_TXT = "# robots.txt\n# Content Signals per contentsignals.org\n\n"
  + ROBOTS_ALLOW_AGENTS.map(function(ua) { return "User-agent: " + ua + "\nAllow: /\n" + ROBOTS_CONTENT_SIGNAL + "\n\n"; }).join("")
  + ROBOTS_DISALLOW_AGENTS.map(function(ua) { return "User-agent: " + ua + "\nDisallow: /\n\n"; }).join("")
  + "Sitemap: https://turva.dev/sitemap.xml\n";

var LLMS_TXT = `# turva.dev

> Agent-readiness audits and advisory for product teams.
> Independent measurement of how readable a site or API is by AI agents,
> with a prioritized fix list and implementation support.
> An agent-readiness audit reads the website and its APIs, not an
> organisation's readiness to adopt agents.
> Based in Tampere, Finland. Async-only engagement.
> Language: English. Correspondence in English or Finnish.

## Services
- [Services](https://turva.dev/services.md)
- [Shopify agent storefront check](https://turva.dev/shopify-agent-storefront-check.md)
- [Free tools for agent-readiness](https://turva.dev/tools.md)
- [llms.txt validator](https://turva.dev/llms-txt-validator.md)
- [Company](https://turva.dev/company.md)
- [Contact](https://turva.dev/contact.md)
- [Legal](https://turva.dev/legal.md)
- [The agent-ready badge](https://turva.dev/badge.md)

## Pricing (EUR, VAT not included)
- Shopify agent storefront check: €999 (fixed scope, 48 hours)
- Audit: €4,300 (fixed scope, two weeks)
- Advisory: €3,000 / month (monthly retainer, minimum 3 months)
- Implementation: €1,500 / day (scoped per task)
- Audit fix implementation: €499 (fixed, sold only together with the audit)
- Shopify correction implementation: €499 (fixed, sold only together with the Shopify agent storefront check)

Final price is confirmed in writing after scope is agreed.

## Sample reports (synthetic, invented sites)
- [Sample audit report](https://turva.dev/samples/audit-report.md)
- [Sample Shopify agent storefront check report](https://turva.dev/samples/shopify-agent-storefront-check.md)

## Business details
- Name: turva.dev
- Business ID (Finland): 3600281-7
- Location: Tampere, Finland
- YTJ: https://tietopalvelu.ytj.fi/yritys/3600281-7
- LinkedIn: https://www.linkedin.com/in/erikrekola/

## Engagement model
- Async-only. No calls, no calendar links.
- First reply in writing within one business day.
- Email for longer messages, Signal for short questions.
- Production credentials are not requested.
- Write access to repositories is scoped per task.

## Contact
- Email: info@turva.dev
- Signal: https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK
- Written contact only, first reply within one business day.
- [Contact page](https://turva.dev/contact.md)

## Guides
- [Agent-readiness guides](https://turva.dev/guides.md)
- [What an agent-readiness audit is](https://turva.dev/guides/agent-readiness-audit.md)
- [Choosing an agent-readiness audit](https://turva.dev/guides/choosing-an-agent-readiness-audit.md)
- [How to get your site cited by AI assistants](https://turva.dev/guides/get-cited-by-ai-assistants.md)
- [llms.txt explained](https://turva.dev/guides/llms-txt.md)
- [Serving markdown to agents](https://turva.dev/guides/markdown-for-agents.md)
- [Open Knowledge Format (OKF) explained](https://turva.dev/guides/open-knowledge-format.md)
- [Sitemaps, robots.txt and agent access](https://turva.dev/guides/sitemaps-and-robots-for-agents.md)
- [Response headers that help agents](https://turva.dev/guides/response-headers-for-agents.md)
- [Prerendering and why agents see empty pages](https://turva.dev/guides/prerendering-for-agents.md)
- [MCP server cards explained](https://turva.dev/guides/mcp-server-card.md)
- [What agents.json is](https://turva.dev/guides/agents-json.md)
- [The /.well-known directory for agents](https://turva.dev/guides/well-known-for-agents.md)
- [Agentic Resource Discovery and ai-catalog.json](https://turva.dev/guides/agentic-resource-discovery.md)
- [How agents authenticate](https://turva.dev/guides/agent-authentication.md)
- [JSON-LD and structured data for agents](https://turva.dev/guides/json-ld-structured-data.md)
- [x402 and agent payments](https://turva.dev/guides/x402-agent-payments.md)
- [Agent commerce discovery: A2A, AP2, and ACP](https://turva.dev/guides/agent-commerce-discovery.md)
- [Agentic commerce readiness: selling to AI shopping agents](https://turva.dev/guides/agentic-commerce-readiness.md)
- [SEO and agent-readiness are not the same](https://turva.dev/guides/seo-vs-agent-readiness.md)
- [Agent-readiness, AEO and GEO: how they relate](https://turva.dev/guides/agent-readiness-aeo-geo.md)
- [Letting agents act on data: the decision envelope](https://turva.dev/guides/letting-agents-act-on-data.md)
- [AI agent use cases: where agents read data and make decisions](https://turva.dev/guides/ai-agent-use-cases.md)
- [Why agent-readiness should be measured, not asserted](https://turva.dev/guides/measurement-led-agent-readiness.md)
- [Common agent-readiness gaps on marketing sites](https://turva.dev/guides/agent-readiness-gaps.md)

## Blog
- [Blog](https://turva.dev/blog.md)
- [What 19 identity vendors publish for agents](https://turva.dev/blog/agent-readiness-identity-vendors.md)
- [Two files called auth.md, and they disagree on the field names](https://turva.dev/blog/two-auth-md-dialects.md)
- [Thirty days after the brief: 210 sites rescanned, four moved](https://turva.dev/blog/thirty-days-after-the-brief.md)
- [What four AI assistants call an agent readiness audit](https://turva.dev/blog/what-ai-assistants-call-an-agent-readiness-audit.md)
- [Website agent readiness, measured on 567 company sites](https://turva.dev/blog/website-agent-readiness-567-sites.md)
- [TRACE signs how an agent ran, not what it was allowed to reach](https://turva.dev/blog/trace-runtime-attestation.md)
- [I scanned fourteen code hosts. Not one served an MCP server card.](https://turva.dev/blog/agent-readiness-code-hosts.md)
- [It would be cheating to keep the old price](https://turva.dev/blog/cheating-to-keep-the-old-price.md)
- [I thought it was a small job](https://turva.dev/blog/i-thought-it-was-a-small-job.md)
- [My gate could not see a sixth](https://turva.dev/blog/my-gate-could-not-see-a-sixth.md)
- [A red reading that measured my own client](https://turva.dev/blog/red-reading-that-measured-my-own-client.md)
- [The checks that pass for the wrong reason](https://turva.dev/blog/checks-that-pass-for-the-wrong-reason.md)
- [Finishing the optional commerce checks](https://turva.dev/blog/finishing-the-optional-commerce-checks.md)
- [The twin is the page](https://turva.dev/blog/the-twin-is-the-page.md)
- [Every response promised a rate limit. Nothing enforced it.](https://turva.dev/blog/enforcing-the-rate-limit-i-advertised.md)
- [Microsoft said the patches would get bigger. I measured how much bigger.](https://turva.dev/blog/measuring-the-ai-patch-surge.md)
- [How to let an AI agent work in your repo without leaking your secrets](https://turva.dev/blog/agent-secret-hygiene.md)
- [How agent-ready are Finnish B2B sites? I scanned sixteen](https://turva.dev/blog/agent-readiness-finnish-b2b.md)
- [When honesty and the checker disagree](https://turva.dev/blog/honesty-and-the-checker.md)
- [Four AI agents re-checked the guides](https://turva.dev/blog/re-checking-the-guides.md)
- [The page grew, the agent bill did not](https://turva.dev/blog/cheaper-pages-revisited.md)
- [Moving the source from GitHub to Codeberg](https://turva.dev/blog/moving-source-to-codeberg.md)
- [A free llms.txt validator](https://turva.dev/blog/free-llms-txt-validator.md)
- [Agent access is now a setting](https://turva.dev/blog/agent-access-is-now-a-setting.md)
- [Publishing an ai-catalog.json for agentic discovery](https://turva.dev/blog/publishing-an-ai-catalog.md)
- [What the Open Knowledge Format is, and what it is not](https://turva.dev/blog/open-knowledge-format.md)
- [What an agent pays to read your site](https://turva.dev/blog/cheaper-pages-for-agents.md)
- [When an agent can prove it is Claude](https://turva.dev/blog/verifiable-agent-identity.md)
- [What makes an AI agent's decisions reliable](https://turva.dev/blog/reliable-agent-decisions.md)
- [Owning your fediverse identity](https://turva.dev/blog/owning-your-fediverse-identity.md)
- [Moving turva.dev off prerender.io](https://turva.dev/blog/moving-off-prerender.md)

## Agent endpoints
- Agent registration: https://turva.dev/auth.md
- API catalog: https://turva.dev/.well-known/api-catalog
- ARD manifest (v0.91): https://turva.dev/.well-known/ard.json
- AI catalog (ARD predecessor path): https://turva.dev/.well-known/ai-catalog.json
- OpenAPI: https://turva.dev/openapi.json
- MCP Server Card: https://turva.dev/.well-known/mcp/server-card.json
- MCP Endpoint: https://mcp.turva.dev/mcp
- A2A Agent Card: https://turva.dev/.well-known/agent-card.json
- Agent Skills index: https://turva.dev/.well-known/agent-skills/index.json
- OAuth Authorization Server: https://turva.dev/.well-known/oauth-authorization-server
- OAuth Protected Resource: https://turva.dev/.well-known/oauth-protected-resource
- AP2: https://turva.dev/.well-known/ap2
- ACP: https://turva.dev/.well-known/acp
- x402 endpoint: https://turva.dev/x402
- x402 manifest: https://turva.dev/.well-known/x402
- MPP: https://turva.dev/.well-known/mpp
- UCP: https://turva.dev/.well-known/ucp
- Full content: https://turva.dev/llms-full.txt
- Security contact: https://turva.dev/.well-known/security.txt
- AI policy: https://turva.dev/.well-known/ai.txt
`;

var AUTH_MD = `# Auth.md

> Agent registration metadata for turva.dev.
> Public read-only. No accounts. Credentials are optional and
> only attribute correspondence.
> Operator contact: <mailto:info@turva.dev>.

## Agent registration

turva.dev publishes public read-only metadata for AI agents.
No endpoint requires a credential and there are no user accounts.
The only credential this domain issues is an optional api_key,
provided out-of-band on request; it attributes correspondence and
grants no additional access. This document describes how an
operator can register an agent identity, request metadata
corrections, and revoke prior correspondence.

Both roles live on one host. The resource server is
https://turva.dev and the authorization server is
https://turva.dev.

## Discovery

Read these two documents in this order. The protected resource
metadata names an authorization server, three scope names and
bearer tokens in the Authorization header.

- Fetch https://turva.dev/.well-known/oauth-protected-resource and
  read resource, resource_name, authorization_servers,
  scopes_supported and bearer_methods_supported.
- Fetch https://turva.dev/.well-known/oauth-authorization-server and
  read the agent_auth block: skill, register_uri, claim_uri,
  revocation_uri, identity_types_supported and
  identity_assertion.assertion_types_supported.

There is no WWW-Authenticate hop here. Nothing on this domain
answers 401, so there is no challenge to bootstrap from. The
protected resource metadata is published so an OAuth-aware agent
can find the identity surface without guessing, not because a 401
is waiting. Read it as discovery and not as protection: every
declared resource answers an anonymous request exactly as it
answers one carrying a token.

## Scopes

The three names are read:services, read:principles and
read:scan-evidence. They name areas of this site. No scope grants
access that anonymous does not already have, because every
resource is already public.

## Identity

- Operator: Erik Rekola (sole proprietorship, Finland)
- Trade name: turva.dev
- Business ID: 3600281-7
- Register: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Verified contact: <mailto:info@turva.dev>
- Public profile: https://www.linkedin.com/in/erikrekola/
- Source code: https://github.com/erekola

## Supported identity types

- anonymous: no registration, every resource is public read-only;
  an api_key can be issued out-of-band on request
- identity_assertion: a registered operator identity, backed by a
  verified email or a signed assertion; the same api_key applies

A credential only attributes correspondence. Every resource is
public, none requires a credential, and no credential grants
additional access.

## Registration

Registration is handled by email; https://turva.dev/agent/auth/register
returns the same pathway as JSON. Email <mailto:info@turva.dev?subject=agent%20registration> with:

- Agent identifier and software name
- Operator name and legal entity
- Purpose of access (research, integration, monitoring)
- Expected request rate (per hour) and concurrency
- Public contact for the operator

A written acknowledgement is sent within one business day.

## Claim

To claim an existing identifier, use https://turva.dev/agent/auth/claim
or email <mailto:info@turva.dev?subject=agent%20claim>. Include proof of
operator control (DNS TXT, signed message from a known code hosting
account, or a verified company email).

## Revocation

To revoke prior correspondence or request deletion of stored
metadata, use https://turva.dev/agent/auth/revoke
or email <mailto:info@turva.dev?subject=agent%20revocation>.
Records held to meet Finnish accounting obligations (invoices)
cannot be deleted until the statutory retention period ends,
six years for invoice records under Finnish accounting law.

## Endpoint responses

Measured on this domain 2026-09-04.

- GET and POST to the registration, claim and revocation endpoints
  answer 200 with application/json describing the email pathway.
- OPTIONS answers 204.
- Any other method answers 405 with the header
  Allow: GET, HEAD, POST, OPTIONS.
- https://turva.dev/oauth/authorize and https://turva.dev/oauth/token
  answer 400, never 401.

## Relation to the auth.md protocol

WorkOS publishes an open protocol also called auth.md, documented
at https://workos.com/auth-md and https://github.com/workos/auth.md.
This file is not an implementation of it. Its two ceremonies, agent
verified and user claimed, are absent here because there are no user
accounts to register into and nothing answers 401.

The word claim above means something else than it does there. Here
it means proving control of an identifier you have already
corresponded under. There it means a device-code ceremony in which
the agent shows the user a code to confirm. The two are not the
same mechanism.

The agent_auth field names on this domain follow the convention the
isitagentready.com scanner documents, which names register_uri,
claim_uri and revocation_uri. The WorkOS file format names the same
positions identity_endpoint, claim_endpoint and events_endpoint.
Both documents were read on 2026-09-04.

## Engagement principles

- Async-only. No calls, no calendar links.
- First reply in writing within one business day.
- Production credentials are not requested.
- No tracking, no analytics, no third-party scripts on this site.

## Related discovery

The two OAuth documents are named in Discovery above.

- API catalog: https://turva.dev/.well-known/api-catalog
- Security contact: https://turva.dev/.well-known/security.txt
- Legal: https://turva.dev/legal
`;

var PAGE_MARKDOWN = {
  "/blog/agent-readiness-identity-vendors": `# What 19 identity vendors publish for agents

2026-09-05

I measured 19 companies that build digital identity and trust products, wallets and verifiable credential infrastructure, the parts of the stack meant to let one machine prove something to another machine. Then I asked the simplest question I could think of about them. Can an agent find out anything at all about these companies without a human in the loop.

## How this was measured

The measurement ran on 2026-09-05. One full scan per company with the isitagentready.com scanner on its default profile, run one target at a time, plus my own reads with curl against the same hosts. Sixteen checks applied that day. I am not naming the companies, and I come back to why below.

Levels first. Fifteen came out at Level 1, three at Level 0 and one at Level 2. Nothing above that. The average was 2,8 checks passed out of 16.

## The column where every one of them scored zero

The scanner has a group for API, auth, MCP and A2A discovery, nine checks in all: apiCatalog, oauthDiscovery, oauthProtectedResource, authMd, mcpServerCard, a2aAgentCard, agentSkills, webMcp and ard. Every company scored zero of nine. Not one of the 19 publishes an API catalog, an OAuth discovery document, an MCP server card, an A2A agent card or an ARD manifest. One authMd check failed with a 500 rather than a 404, which is a broken answer and not evidence of a missing file, and that is the only nuance in the whole column. These are companies whose product is machine to machine verifiable identity.

## The smaller readings

Two of the 19 serve no robots.txt at all. A third serves one with no wildcard rule, so the file exists and says nothing about most crawlers. Content Signals, the line where a site declares whether it wants its text used for AI training, appeared exactly once in the set. That company says ai-train=no and search=yes. Markdown content negotiation worked on one company as well, though that is a single reading and I have not repeated it. The same check moved on me within one day on a different site, from 406 to 200 to 200, so I treat it as provisional.

Seven of the 19 have an llms.txt an agent can fetch, and one of those seven is a redirect to a file parked on a marketing platform host. Twelve have nothing there. One of the seven announces in its own first line that a SEO plugin generated it, which makes it the publishing system talking rather than a decision anyone made. Seven of the 19 serve no JSON-LD at all on the front page.

## One site where 200 means nothing

One company was different in a way worth describing. I asked for eight paths on that domain and all eight returned HTTP 200 with the same 3021 byte body and an identical sha256. The front page, a real subpage, a path I invented on the spot, llms.txt and four well-known addresses. So the agent addresses answer 200 with a page that is not what was asked for. I opened the site in a browser and the content renders fine, it just arrives after JavaScript has run. An agent that does not execute scripts cannot tell an existing page from one that does not exist. The other 18 answered 404 to the same addresses, which is the correct answer.

## What this does not say

I read front pages and root paths and nothing else, so none of it is a statement about anyone's documentation, product API or MCP endpoint. Three of the passing Link header readings come from WordPress serving its own rel=alternate, which is the platform and not the company. Each company was scanned once, and a level from a single run is a snapshot. I tested no products. A site can be hard for an agent to read while the software behind it is excellent, and in this set I would expect that to be the common case.

## Why the companies are not named

The finding is not that one company forgot a file. All 19 landed on zero in the same column, which makes this a property of the category rather than of anyone's diligence. I have also not contacted any of them, and a list of names published before that would be a different kind of document than the one I wanted to write. I should be straight about the limit of this though. Every reading above comes from a public surface, so a reader who guesses the set and runs the same scan will work out who is who. Withholding the names is not protection, it is a statement about what the piece is for.

## One last thing, and it cuts against me

These checks come from one scanner and the rules move every month. The set of applicable checks grows as new ones are added, so a count from an older run is not comparable with today's. My own site reads Level 5 on that same scanner today, with all 16 applicable checks passing, and that is a snapshot from one instrument on one day, exactly like every number above.

## Frequently asked

**Does a Level 1 reading mean the company builds bad software?**

No, and nothing here measures the software. The scan reads what a website publishes for an automated visitor. A company can run excellent credential infrastructure behind a site that tells an agent nothing about it, and in this set that is the likely case for most of them.

**Why would an identity vendor need an MCP server card or an agent card?**

Because the thing being sold is machine to machine trust, and a machine that arrives at the site has no way to find the interfaces without one. The gap is not that the file is mandatory. The gap is that these nine addresses are where an agent looks first, and in this set they were empty every time.

**Can I get the reading for my own site?**

If you are in this set and want your own reading, email me and I will send you the scanner output for your own domain. That is the whole promise, one scan and the raw result, and it is not the paid work.

## Related

- [I scanned fourteen code hosts. Not one served an MCP server card.](/blog/agent-readiness-code-hosts)
- [Well-known files for agents](/guides/well-known-for-agents)
- [Publishing an MCP server card](/guides/mcp-server-card)`,

  "/blog/two-auth-md-dialects": `# Two files called auth.md, and they disagree on the field names

2026-09-04

WorkOS shipped Agent Auth for AuthKit on 2 September, a way to give the agents you build into your own product short-lived scoped tokens instead of a long-lived API key. Next to it in the same product menu sits something else with a wider blast radius, and it is a month older: an open protocol called auth.md, shipped into AuthKit on 4 August, in which a service publishes a markdown file at its own root telling outside agents how to register on behalf of a user. This site has served a file at that same address since June. The two are not the same document, I read both on 4 September to find out how far apart they are.

## What each document asks for

The scanner this site is measured by publishes its own recipe for the check it calls authMd, at https://isitagentready.com/.well-known/agent-skills/auth-md/SKILL.md, which answered 200 with 2 112 bytes. It asks for a markdown file at the service root with an H1 containing auth.md, protected resource metadata carrying resource, authorization_servers, scopes_supported and bearer_methods_supported, and an agent_auth block in the authorization server metadata. It names that block's fields: skill, register_uri, claim_uri, revocation_uri, identity_types_supported, identity_assertion.assertion_types_supported and anonymous.credential_types_supported.

The WorkOS file format at https://workos.com/auth-md/docs/auth-md asks for the same two-hop discovery walk and the same agent_auth block. It names the block's fields identity_endpoint, claim_endpoint and events_endpoint.

So the two documents agree on the path, the file name, the H1 and the discovery order, and they nearly agree on the protected resource metadata: the scanner asks for four fields in it and WorkOS for those four plus resource_name. They disagree on what to call the registration endpoint, the claim endpoint and the revocation surface inside the block both of them require.

## Why that is worth knowing before you implement

A site built from the scanner recipe and a site built from the WorkOS specification both serve a file called auth.md at the root, both publish an agent_auth block, and both can be described as having implemented auth.md. An agent that fetches one and looks for the other's field names finds nothing where it expects an endpoint. Nothing in either document warns you, because each is internally complete and neither cites the other.

The gap is easy to walk into in one direction in particular. If you build against the specification and then test with the scanner, the check reports the file as missing rather than as differently named, and the natural reading of that result is that the file is not being served.

## What this site does

This site follows the scanner's naming, because that is what was measurable when the file was written and because a rename would drop a check this site's own score rests on. The file is at https://turva.dev/auth.md, served as text/markdown, and the protected resource metadata carries all five fields the WorkOS discovery step names.

What this site does not implement is both of the WorkOS ceremonies. Agent verified needs an identity provider to vouch for a user, and user claimed needs a device-code confirmation. Neither exists here for the same reason: there are no user accounts, every resource is public and read only, and nothing on the domain answers 401, so there is no challenge for an agent to bootstrap from. The file now says that in its own words rather than describing a flow that is not there, and it names the protocol so a reader can see the difference for themselves.

The word claim is its own trap. On this site it means proving control of an identifier you already corresponded under. In the protocol it means a ceremony where the agent shows the user a code to confirm in a browser. Same word, two mechanisms, and the file now separates them.

## What I am not claiming

I have no view on which naming should win, and this is not a prediction that either one becomes a standard. I did not measure how many sites serve an auth.md of either kind, so nothing here says which is more common. What I read is two published documents on one day, and what I can show is that they name the same three positions differently. Anyone implementing from one and verifying against the other will find that out the hard way, and it seemed worth writing down before more sites are built either way.

## Frequently asked

**Is auth.md a standard?**

No. It is a convention published by two parties who do not agree on the field names inside it. The underlying pieces it composes are standards, OAuth protected resource metadata in RFC 9728 and authorization server metadata in RFC 8414, and those two are the parts an agent can rely on today.

**Which field names should I use?**

That depends on what will read your site. If a scanner grades you, use the names its recipe publishes and verify with the scanner. If a specific agent platform will consume the file, use the names its specification publishes. There is no third answer that satisfies both, and the honest thing is to say in the file which one you followed.

**Does a site need an auth.md at all?**

Only if an agent could ever need permission to do something there. A site that is entirely public and issues no credentials can publish one to say exactly that, which is what this site does, but there is nothing dishonest about not having the file when there is nothing to authenticate.

## Related

- [Agent authentication and authorisation](/guides/agent-authentication)
- [Well-known files for agents](/guides/well-known-for-agents)
- [When honesty and the checker disagree](/blog/honesty-and-the-checker)`,

  "/blog/thirty-days-after-the-brief": `# Thirty days after the brief: 210 sites rescanned, four moved

2026-09-03

Every brief I send, a short written reading of one company's website that goes out unasked, carries the same promise. Thirty days later I run the same scanner on the same site again and send back what changed, whether or not anyone answered. Between 19 August and 3 September that promise came due for 210 sites, first measured between 18 July and 6 August, and this is the first time the rescans are read as one set.

## What was measured

The scanner is isitagentready.com, which grades a site from Level 0 to Level 5, run against the same host with the same default profile as the first time, twice per site, and a pair that disagrees is run again until the reading settles or is recorded as unstable. A site counts as moved when its level changed. A check that started passing while the level held is recorded in the file but not counted here, because the level is what the recipient was told in July and what the rescan message reports.

- 210 sites rescanned. 201 gave a reading that can be compared with the first one.
- Nine could not be compared. Two hosts answered the scanner with 403 and one answered 500, and two of those three had done the same in July, so they never had a first reading either. Four runs did not settle into a reading, one of them because a single header check stalled four times out of four. Two were not rescanned at all, because the record had no address to send the result to.
- 197 of the 201 read the same level as in July. Three moved up and one moved down, 2,0 percent.
- Seven of the 210 had replied to the brief by the time of this count, 3,3 percent.

## The four that moved

Three went up. A site whose sitemap answered 404 in July answers 200 now, and reads Level 1 instead of Level 0. A site whose robots.txt redirected to itself and whose sitemap returned 500 has both working, Level 0 to Level 1. A site that now declares Content Signals in its robots.txt reads Level 2 instead of Level 1. One went down: its sitemap answered in July and answers 404 now, Level 1 to Level 0, confirmed with a request outside the scanner so that a scanner artefact is ruled out.

None of the three that moved up had replied to the brief. So the brief cannot claim them, and I am not going to. The likelier explanation is ordinary maintenance, a CMS update or a plugin that started generating a sitemap, and that is worth writing down because a rescan series is the exact place where a consultant is tempted to count every improvement as an effect.

## The scanner moved too

During the series the scanner added a check named ard to its API group. The twelve sites measured in the first days of September were read against a larger check set than in July without their sites changing. A rescan therefore compares the denominator first and the passes second, and the message the recipient gets names the checks rather than a percentage, because a percentage over a moving denominator says nothing.

## What this says and what it does not

The sample is my own prospecting list, sites I chose to write to, not a random draw. So 2,0 percent is a fact about these 210 sites and not a rate for the web. Zero movement in thirty days is also the expected result when nobody has decided to act. The fixes are small, a sitemap line, a robots.txt group, a header, but they need a person who owns the website to schedule them, and one unsolicited email rarely does that inside a month.

What the series does show is narrower and still useful. The promise has been kept for these 210 sites. The scanner is stable enough to compare across a month for 201 of them, and where it is not, the reason can be named, on the host side for most of the nine and in my own records for the two that had no address. And the one site that went down is a reminder that agent readiness is not a state a site reaches once: a sitemap that disappears in an update takes the level with it, and nobody notices until something reads the site as a machine.

292 promises are still open, the next of them due on 9 September. When the set is larger the same reading will be repeated.

## Frequently asked

**What does the 30 day rescan promise mean?**

Every brief turva.dev sends says that the same scanner will be run on the same site thirty days later and the result sent back, whether or not the recipient answered. The rescan message names the checks that changed rather than a percentage, because the scanner's check set can change in between.

**Did the briefs change anything in thirty days?**

Four of 201 comparable sites changed level, three up and one down, and none of the three that moved up had replied to the brief, so the change cannot be attributed to it. Ordinary maintenance is the likelier cause.

**Why could nine sites not be compared?**

Two hosts answered the scanner with 403 and one with 500, four runs did not settle into a reading, and two were not rescanned because the record had no address to send the result to. A rescan compares two readings, and where one of them is missing there is nothing to compare.

Corrected 2026-09-04. The version served for the first seven hours said the first measurements began on 13 July, described the nine unreadable sites less precisely, and claimed the promise "can be kept at this volume". The earliest first measurement was 18 July, the nine are now broken down as measured, and the claim is limited to these 210 sites. The counts did not change.

## Related

- [Website agent readiness, measured on 567 company sites](/blog/website-agent-readiness-567-sites)
- [Sitemaps, robots.txt and agent access](/guides/sitemaps-and-robots-for-agents)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)`,

  "/blog/what-ai-assistants-call-an-agent-readiness-audit": `# What four AI assistants call an agent readiness audit

2026-09-03

On 3 September 2026 fifty buyer questions were put to ChatGPT, Gemini, Perplexity and Google AI Mode from an anonymous browser session, one run per question, 193 answers in all. The questions are the ones a buyer types: what an agent readiness audit is, what it costs, who does it in Finland, how it differs from SEO. Claude was not measured, because its answers sit behind a login and the instrument runs logged out.

## Two products share the words

Eleven of the fifty questions use the words agent readiness, or agenttivalmius in Finnish, without saying whether they mean a website or a company. Those eleven got 41 answers. Eighteen of the 41 described the readiness of an organisation to deploy AI agents: its data, its governance, whether its teams are prepared. Thirteen described what this site means by the words, whether a website and its APIs can be read and acted on by an agent. Six described both, and four could not be placed.

The split is not even across assistants. Gemini gave the organisational reading in eight of its eleven answers and Google AI Mode in six of nine. Perplexity was the only one that leaned the other way, five of eleven for the website reading, and it was also the one that named this site most often, five times against three for ChatGPT and one each for the other two. ChatGPT split evenly, three answers for each reading and three for both, with one unclear.

## The words are the problem, not the assistants

Two Finnish questions in the set name the website outright or avoid the word agenttivalmius. All seven answers to those two read the question as being about the website. The assistants have no trouble with the concept once the question carries it. What drifts is the bare term, and it drifts toward the organisational meaning. The likely reason is what the assistants have read, because that meaning appears in far more published text, but this run does not measure that, and the control set is seven answers, so read it as the direction and not the proof.

That shows in who gets named. Thirty-five of the 41 answers named at least one provider, 112 different names between them, and almost none repeated. Both kinds of answer named a long tail of small consultancies and scanners with agent readiness in the brand, most of them once. The organisational answers also named large consultancies, and the Finnish questions a few Finnish agencies. Across all 193 answers this site was named in 27, and 23 of those carried a link to it.

## What follows from it

For a buyer, one question settles it: ask the provider what the report reads. If the answer is the organisation, its data and its teams, that is a strategy engagement. If the answer is the website and the API, the files an agent fetches and the data it gets back, that is the audit this site sells, and the report should name the checks. Both are real work. They are not the same work, and a proposal that does not say which one it is has not said much.

For this site, the same finding turned into one sentence. The FAQ on the services page and the home page now says that the audit reads the website and its APIs and not the organisation's readiness to adopt agents, and llms.txt says the same in its summary, so an assistant that reads either gets the distinction in the first lines. Whether that moves the answers is what the next run of the same fifty questions will show, and it will be reported the same way.

## Frequently asked

**Is an agent readiness audit about the company or the website?**

Both services exist under the same words. The audit on this site reads the website and its APIs with an independent scanner and reports per check. An organisational agent readiness assessment reads a company's data and governance and how prepared its teams are. Ask a provider which report they deliver.

**Why do AI assistants describe the organisational version more often?**

In a measurement of 41 answers on 3 September 2026, 18 described the organisational reading and 13 the website reading. When a question names the website, all seven answers in the control set read it that way, so the drift sits in the bare term and not in the assistants' ability to read the website meaning. Why the bare term drifts was not measured.

**How was this measured?**

Fifty buyer questions, four assistants, one anonymous run per question on 3 September 2026, 193 answers. Each answer was read for how it interpreted the term, whom it named and whether it named this site. Claude was not measured because it requires a login.

Corrected 2026-09-04. The version served for the first seven hours said Perplexity was the only assistant that named this site more than once and offered an unmeasured reason for the drift of the term. Perplexity named it most often, five times against three for ChatGPT, and the reason is now stated as unmeasured. The counts did not change.

## Related

- [What an agent-readiness audit is](/guides/agent-readiness-audit)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Agent-readiness, AEO and GEO: how they relate](/guides/agent-readiness-aeo-geo)
- [Website agent readiness, measured on 567 company sites](/blog/website-agent-readiness-567-sites)`,

  "/blog/website-agent-readiness-567-sites": `# Website agent readiness, measured on 567 company sites

2026-09-03

In July I wrote up sixteen Finnish B2B sites. Since then the same measurement has run over every company I have written to, and the sample is now 567 company sites, measured between 28 June and 3 September 2026. The scanner is the same one, isitagentready.com, which grades a site from Level 0 to Level 5. The sample is still my own prospecting list and not a random draw, so read it as a large snapshot rather than a census.

## Key figures

- 567 company sites, 407 Finnish and 160 from elsewhere, one independent scanner.
- Level 1 of 5: 485 sites, 85,5 percent. Level 0: 74 sites, 13,1 percent. Level 2: 7 sites, 1,2 percent. One site read Level 5.
- The Finnish and the non-Finnish subsets read the same: 86,5 and 83,1 percent at Level 1.
- In my own first-fix notes for the Level 0 sites, robots.txt and the sitemap are the two most frequent subjects.
- No company is named here. Every level is the reading on the day I wrote to that company.

## What website agent readiness means

The phrase agent readiness is used for two different things, and AI assistants currently answer the question with the other one. Ask an assistant what an agent readiness audit is and the answer describes an organisation: its data, its governance, whether its teams are ready to deploy AI agents. That is a real question, and it is a different one.

Website agent readiness is a property of a site or an API. It asks whether a machine reading on someone's behalf can find the site, read its pages without a browser, learn what the company sells, and act on that through a declared interface. An independent scanner can measure it, and the result is a number a third party can check. That is the measurement below.

## The numbers

Of the 567 sites, 485 read Level 1 of 5. Level 1 is the floor an ordinary CMS site reaches. Seventy-four sites read Level 0, below that floor. Seven read Level 2, and one read Level 5.

The Finnish subset is 407 sites, and 352 of them, 86,5 percent, read Level 1. The 160 sites from outside Finland read 83,1 percent at Level 1 and 14,4 percent at Level 0. The two subsets read the same, so the floor is not a Finnish trait.

The scanner added one check to its set during these ten weeks, so the two ends of the period are not measured on an identical instrument. The level scale did not change. The thirty-day rescans I promise each company are a separate series and are not in these figures.

## What the Level 0 notes say

For each site I wrote down the single sharpest finding, the thing I would fix first. Sixty-eight of the 74 Level 0 sites have such a note. Robots.txt appears in 45 of those notes and the sitemap in 38, and 29 notes mention both. The pattern in those 29 is a robots.txt the CMS shipped by default and a sitemap that is either missing at every standard address or never announced in robots.txt, so an agent that follows the rules gets no list of pages to read. These sites work for a person. A person does not start from the sitemap.

The 439 Level 1 sites with a note are more varied. The sitemap appears in 102 notes, llms.txt in 99, robots.txt in 72, structured data in 49 and an MCP server in 35. Level 1 is where the site can be found and the rest is missing, and the rest is where the work is.

## Why the level is the useful number

A level from an independent scanner is a claim someone else can verify. Run the same scanner on the same site and you get the same reading, or a newer one that shows what changed. That is the only reason I publish my own score, and it is why every company I wrote to got the level on the day of writing and an offer to read it again thirty days later.

Four levels separate the typical company site from a site an agent can read and act on, and the gap is mostly mechanical: serve markdown next to HTML, publish structured data, publish an llms.txt that lists real pages, expose the discovery files, and answer on the endpoints they declare. That is web development with a checklist, and it can start before anyone writes an AI strategy.

## How to read your own site

Run isitagentready.com on your domain and read the level, then read which checks failed. The free llms.txt validator at turva.dev/llms-txt-validator reads the llms.txt part in more detail. If you want the whole surface read and the fixes listed in priority order, the agent readiness audit is described at turva.dev/services, and the way to start is an email to info@turva.dev with the domain.

## Frequently asked

**Are these 567 sites broken?**

No. They load and a person can use them without trouble. The level measures something else, whether a machine reading on someone's behalf can find the site, read it without a browser, learn what the company sells and act on it. Level 1 is where most working company sites sit today.

**Why do Finnish and other sites read the same?**

Because Level 1 is what a CMS ships by default: a robots.txt, a sitemap and HTML pages. Nothing in that default was built for agents, and no country's CMS market ships more than that, so the floor is the same wherever the company is.

**How do I check my own site?**

Run the scanner on your domain and read the level, then read which checks failed. The free llms.txt validator on this site reads the llms.txt part in detail. The audit reads the whole surface and lists the fixes in priority order, and it starts with an email carrying the domain.

## Related

- [How agent-ready are Finnish B2B sites? I scanned sixteen](/blog/agent-readiness-finnish-b2b)
- [What an agent-readiness audit covers](/guides/agent-readiness-audit)
- [Sitemaps and robots.txt for agents](/guides/sitemaps-and-robots-for-agents)
`,
  "/blog/trace-runtime-attestation": `# TRACE signs how an agent ran, not what it was allowed to reach

2026-08-30

The Linux Foundation now governs TRACE, short for Trust, Runtime Attestation and Compliance Evidence. OPAQUE contributed the specification, announced on 25 August 2026, and developed it together with AMD, Intel, Microsoft and the Technology Innovation Institute. The idea is one signed artifact, called a Trust Record, that says which model ran, on what hardware, under which policy, against which class of data and which tools it called. The point of signing it inside a trusted execution environment is that the operator cannot write it afterwards. An ordinary audit log is written by the system being audited. This one is not.

That is a real distinction and it is the same distinction my own work rests on. A number someone reports about themselves is a claim. A number a third party can check is evidence. TRACE moves runtime logging from the first category toward the second.

Then I read the project's own documentation instead of the press release, and the interesting part is what the specification refuses to promise.

## The level is the claim, not the name

TRACE has three trust levels and they are not close to equivalent.

Level 0 is software-only signing. The project writes that a privileged operator with root access can produce a valid-looking Level 0 record for a run that never happened, or that violated policy. The documentation puts Level 0 in development, internal audit trails and staging environments, and says so plainly.

Level 1 requires the record to be signed by a key generated inside a verified TEE, with a non-zero measurement of the launch state and a verifier that has actually checked the quote. This is where hardware-rooted starts meaning something.

Level 2 adds a SCITT transparency log entry at a resolvable address, so a third party can check later that the record has not been altered since it was logged. It still does not prove that every field in the record was correct in the first place.

So "we use TRACE" is not a statement about assurance. The level is the statement, and a vendor who names the standard without naming the level has told you nothing. Anyone who has read an agent-readiness score without the scanner and the level next to it will recognise the shape of that problem.

## Two limits worth knowing before anyone builds on this

The specification is honest about both, which is more than most standards manage.

Revocation is the place where the project's own two documents pull in different directions. They agree on the underlying fact. A signature stays mathematically valid forever, so a record signed by a key that has since been revoked keeps verifying on a machine with no network. The limitations page then says the verifier has to consult current revocation status at verification time and calls that an online step by definition. The specification says close to the opposite and says it by design: revocation statements are anchored in the same transparency log as the records they govern, verifiers cache a signed revocation bundle carrying an expiry, and the text describes this as deliberately replacing a status endpoint that would require a callback. Which behaviour you get depends on which of the two a given implementation followed, so ask. Both documents agree on the fallback, and it is the sane one. A verifier holding no revocation bundle, or only an expired one, reports that instead of treating it as a pass.

Platform state is not appraised. On the AMD path the verification chain checks the report signature and the certificate chain from the VCEK up to a root the operator pins, and it checks the measurement binding. What it has no field for is the state of the machine that produced the report. As the documentation puts it, a verifier reading a conformant claim cannot appraise platform state even when the producer did check it.

Neither of these makes TRACE useless. They make it a layer with edges, and knowing where the edges are is the whole job when you are the one signing off.

## The half TRACE does not cover

A Trust Record proves how an agent ran. It says nothing about whether the systems that agent touched were readable to it, whether the tool it called should have been callable at all, or whether the decision boundary around it was written down anywhere.

That is the split I keep running into. Attestation is evidence about execution. Agent-readiness is evidence about the surface: whether your site, your data and your endpoints answer a machine the way they answer a person, and whether the permissions around them are something you can point at rather than something living in one engineer's head. An organisation can have a perfect Level 2 record of an agent doing exactly the wrong thing, correctly, against data it should never have been given.

Both halves are receipts. They are receipts about different questions.

## What this is worth today

The specification is a developer preview. Version 0.2 is current and the draft says its fields and conformance requirements may change before v1.0. The download figure in the announcement is the contributing vendor's own number and it counts installs, not deployments, so it is not evidence of adoption. Treat all of that as a snapshot of this month, exactly as you should treat any number I publish about my own site.

The part that is already useful is the vocabulary. If you run agents against production data, the question to ask a vendor is not whether they support TRACE. Ask which level their records reach, whether their verification checks revocation, and what happens to the answer when the network is down. Those three questions are answerable today and they do not depend on the specification reaching v1.0.

For EU buyers there is one more concrete hook. The project states that Level 0 does not satisfy the tamper-evident logging requirement of EU AI Act Article 12, and that DORA Article 9 needs Level 1 or above with transparency log anchoring. If someone shows you a compliance story built on software-only signing, that gap is written down in the specification's own limitations page.

Sources: [Linux Foundation press release, 25 August 2026](https://www.linuxfoundation.org/press/linux-foundation-welcomes-trace-to-advance-verifiable-runtime-evidence-for-ai-workloads), [TRACE v0.2 specification](https://trace.agentrust-io.com/spec/trace-v0.2/), [TRACE trust levels](https://trace.agentrust-io.com/docs/trust-levels/), [TRACE known limitations](https://trace.agentrust-io.com/LIMITATIONS/), [trace-spec on GitHub](https://github.com/agentrust-io/trace-spec).

## Related

- [When an agent can prove it is Claude](/blog/verifiable-agent-identity)
- [How agents authenticate](/guides/agent-authentication)
- [Letting agents act on data: the decision envelope](/guides/letting-agents-act-on-data)
`,
  "/blog/agent-readiness-code-hosts": `# I scanned fourteen code hosts. Not one served an MCP server card.

2026-08-22

Cursor launched Origin on August 17 and calls it a Git forge for the agentic era. I ran an independent agent-readiness scanner over its public surface and over thirteen other code hosts on August 22. Not one of them reached Level 2 of 5.

## Key figures

- Fourteen code host surfaces scanned with the isitagentready scanner on 2026-08-22, one run each.
- Highest reading was Level 1 of 5. Six surfaces reached it, belonging to Cursor Origin, GitLab, SourceForge, Forgejo and Azure DevOps. The other eight read Level 0.
- The scanner group named API, Auth, MCP & A2A Discovery holds nine checks. Across the sample it ran 124 times and passed twice.
- Zero MCP server cards, zero API catalogs, zero agent skills indexes, zero ARD manifests and zero auth.md files across all fourteen. GitLab answered 403 rather than 404 on most of those paths. The A2A card and WebMCP checks completed on thirteen, and both read zero there.
- Both passes were OpenID Connect metadata, which is published so people can log in and not so agents can find anything.

## What was measured, and what was not

The scanner reads a public web surface. It does not log in, and it does not see a repository. Origin itself sits behind a Cursor paid plan, so the reading describes cursor.com and its marketing page for Origin, not the forge. Four targets redirected somewhere else, GitLab to its marketing site and Azure DevOps to a Microsoft product page, so GitLab was measured a second time from the application at gitlab.com/explore. Both readings landed at Level 1, with different checks passing on each.

One host is missing from the count. savannah.gnu.org did not answer on two attempts, once with a network error and once with a 502, and an unreachable site is not a zero.

For scale, my own site reads Level 5 of 5 on the same scanner on the same day. That comparison is not a fair fight and I am not presenting it as one. turva.dev is a one-person advisory site with sixty canonical pages, and a code host carries multi-tenant load plus an access model that a site like mine never has to solve. It does show that the manifests in question are not expensive to publish.

## The numbers

| Host | Level | Checks passed |
|---|---|---|
| cursor.com/origin | 1/5 | 3 |
| gitlab.com marketing | 1/5 | 4 |
| gitlab.com/explore | 1/5 | 4 |
| sourceforge.net | 1/5 | 3 |
| forgejo.org | 1/5 | 3 |
| dev.azure.com | 1/5 | 3 |
| github.com | 0/5 | 2 |
| bitbucket.org | 0/5 | 2 |
| sr.ht | 0/5 | 2 |
| gitea.com | 0/5 | 3 |
| gitee.com | 0/5 | 2 |
| launchpad.net | 0/5 | 3 |
| radicle.dev | 0/5 | 3 |
| gerritcodereview.com | 0/5 | 1 |

For almost every host the passing checks were the same two, a robots.txt the scanner reads as valid and a robots.txt whose rules reach AI crawlers, either by naming them or by letting the wildcard cover them. That is the floor an ordinary site reaches without trying. Gerrit sits below it, because its robots.txt carries no User-agent line at all, so the file is read as invalid and the AI rules check falls with it.

## GitHub runs an MCP server. Nothing on github.com says so.

This is the finding I keep coming back to. GitHub operates a production MCP server, and I used it on the same day I ran these scans. It works. But github.com serves no MCP server card, no API catalog and no Link header pointing at either, so an agent that arrives without being told about the server has no way to discover it. The capability exists and the announcement does not.

The same shape repeats across the sample. What follows is a reading of how these products are sold, which the scan does not measure. Several of them are sold as the place where agents work on code, and on every one of them the way in is a docs page written for a person.

## Three things the scan does not prove

GitLab answered HTTP 403 to most of the well-known paths, including the API catalog, auth.md, the MCP card, the A2A card, the skills index and the ARD manifest. A 403 is a refusal, not evidence that a file is absent, and I have recorded those as failures only because the check got no answer.

Two checks did not complete on Gitee, and for different reasons. The A2A card fetch aborted and the WebMCP check timed out at eight seconds. Its discovery group was therefore scored on seven of nine.

The sample is fourteen surfaces I picked by hand. It is not a random draw and it does not cover every code host. Read it as a snapshot of one day.

## Why any of this matters

An agent that lands on a code host today can read the marketing copy. It cannot ask the site what it is able to do, because nothing on the site answers that question in a format an agent parses. Every integration therefore has to be hard-coded by a human who already knows the endpoint exists.

The fixes are small and mostly mechanical. A server card is a JSON file at a known path. An API catalog is a linkset. A Link header is one line of response configuration. None of it requires rebuilding a forge, and none of it had been done on any of the fourteen surfaces I measured.

If you want to check a site yourself, the scanner is public and the free llms.txt validator is at turva.dev/llms-txt-validator. The audit and advisory work is at turva.dev.

## Frequently asked

**Does this mean GitHub is broken?**

No. GitHub works, and so does its MCP server, which I used on the same day I ran the scan. The reading describes one thing only, whether the site announces what it can do in a format an agent finds without being told. On that point github.com reads zero, and so does every other host in the sample.

**Why would a code host publish an MCP server card?**

So that an agent arriving at the domain can learn that a server exists, where it is and what it does, without a human pasting the endpoint into a config file first. The card is a JSON file at a known path. It does not change the forge and it does not expose anything the docs do not already say.

**How do I check a host myself?**

Run the same public scanner against the domain and read the group named API, Auth, MCP & A2A Discovery. The result is a snapshot of that day, mine included, because these specifications move month to month.

## Related

- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps on marketing sites](/guides/agent-readiness-gaps)
- [How agent-ready are Finnish B2B sites? I scanned sixteen](/blog/agent-readiness-finnish-b2b)
- [Website agent readiness, measured on 567 company sites](/blog/website-agent-readiness-567-sites)`,
  "/blog/cheating-to-keep-the-old-price": `# It would be cheating to keep the old price

2026-08-21

Corrected 2026-09-05. The prices in this post are the ones in force when it was published. Since 2026-08-31 the Shopify agent storefront check is €999 and its correction implementation €499. The other prices did not change. The [services page](/services) carries the current prices, and this post keeps its own.

The agent-readiness audit is now €4,300 and two weeks. It was €6,500 and two to three weeks. Nothing came out of the scope to pay for that.

The scanner is the same one, isitagentready. The manual checks that sit over the scanner are the same. The re-scan after the fixes is still the thing the engagement is judged on, and it is still the only claim I make about the result.

What moved is that the part the old price charged for twice is now written down once.

## What the old price charged for twice

An audit has two halves. One half is measuring a surface: run the scanner, read what it says, check by hand whether the number is telling the truth. That half is real work and it stays.

The other half was me deciding, again, what a passing row actually looks like. Twenty-two checks, each one an open specification that moved in the last year, and for each one the question was the same: what does a correct implementation of this look like, what does the scanner accept, and what is the concrete change that flips it. I answered those questions from scratch every time, and the old price charged for the answering as well as the measuring.

That is the half that is now a file. The checklist has 42 rows. Every row names the pass condition, points at a working implementation of that row on a live surface, and links the fix recipe. There are 25 recipes behind it, one per check or close group.

The live surface the rows point at is this site, because it passes every scored check and I can show the code for each one.

## What it cost to get there

I read my own workspace file by file over seven days in August and recorded 367 findings. That was written up at the time. Since then the same treatment went to the four repositories at byte level, and then to the folders and documents, and then three verification rounds ran over the folder audit and the session before it.

The folder and document audit removed 2 317 files and 116 622 446 bytes. Not one line of source was in what went. It was temporary renders, build caches, a dependency tree and six revision copies of one file. I am not quoting a before and after total for the workspace, because three measurements of it taken the same day differ by up to 39 281 bytes: tools write into the folder that was supposed to be the anchor, so that total is not a number anyone should cite.

Three sessions did that work: 2 254 messages, and about 366 million tokens as the raw sum. Weighted the way billing weights them, where a cache read is a tenth of a fresh input token and an output token is five, it comes to about 88 million.

Across every session recorded on this machine the raw sum is 7 197 173 453 tokens, and the weighted figure is 1 849 081 095. Those totals are a floor rather than a count. The transcript tree holds 25 days, and a disk restore in August took five weeks of it with it, so the missing period is missing from the number too.

That spend is mine. It produced no invoice and it was never billable. What it produced is the file that means the next audit does not repeat it. Keeping the old price and the old clock would mean charging a client for work that is already done.

## Why the accuracy does not drop

The obvious reading of a lower price and a shorter clock is that something got smaller. What happened is the opposite, and the checklist proved it on me before it proved it on anyone else.

Writing the checklist out found a hole in my own material. The scanner scores a check called ard, the capability manifest at /.well-known/ai-catalog.json. My own recipe index named 21 checks and that one was not among them, and no recipe covered it. My own gate did not catch it either, because the gate reads the checks a recipe claims and has nothing to say about a check with no recipe at all. An audit run from that index would have skipped a scored check and still looked complete.

That is one check out of 22, on a site that serves the manifest correctly and passes the check. It was invisible for as long as the method lived in my head, and it was visible as soon as the method became a list.

A shorter engagement also removes a real source of error. Two to three weeks is long enough for the specifications to move underneath the report, which has already happened here. A payment specification dropped in a point release the extension that three of my guides described, and the MCP server card proposal moved onto an extensions track while the sentence about it stood still. Two weeks leaves that less room. It does not remove it.

## What these numbers do not prove

Between the two windows the transcript tree records, the weighted cost per message fell from about 69 700 to about 41 100 tokens. It is tempting to read that as the cleanup paying for itself, and I am not going to claim it. The two windows are five weeks apart, the models in them are different, and the mix of work is different. The drop is real in the record and its cause is not established, so it is an observation and not evidence.

The checklist has also not yet run against a client surface. It was built from 13 rounds of reading my own, which is a real basis and a narrow one.

## What is unchanged

Fixed scope, written before any payment. Async only, no calls and no calendar links. Read access is enough, production credentials are not requested, and write access is scoped per task only if implementation is bought separately. The report names 3 to 10 fixes in order of impact, and the next scan either reads higher in the categories the report named or the report explains which tradeoff was kept on purpose.

The other prices did not move. The Shopify agent storefront check is €1,900 within 48 hours of a written kickoff, advisory is €3,000 per month with a three month minimum, and implementation is €1,500 per day. All prices exclude VAT.

The scope is agreed in writing first. I reply by email within one business day.

## Frequently asked

**Does a lower price mean a smaller audit?**

No. The scanner is the same one, the manual checks over it are the same, and the report still names 3 to 10 fixes in order of impact with a re-scan that verifies them. What got shorter is the part where I work out from scratch what a passing check looks like, which is now a written checklist of 42 rows.

**What does an agent-readiness audit cost?**

€4,300, fixed scope, two weeks, VAT excluded. When this was published the other prices had not moved: the Shopify agent storefront check was €1,900, advisory €3,000 per month with a three month minimum, and implementation €1,500 per day. Since 2026-08-31 the Shopify check is €999, and the services page carries the current prices.

**How long does the audit take?**

Two weeks from the agreed written kickoff. It was two to three weeks, and the shorter window also leaves the specifications less time to move underneath the report.

**How do you know the accuracy held?**

Writing the checklist out immediately found a scored check, ard, that was missing from my own fix recipe index and from my own gate. That is the kind of hole the list exists to catch, and it caught it on me first.

Corrected 2026-09-03. Three sentences in this post read as if a client had already paid the old price. None had: the audit had not sold at €6,500. They now say what the old price charged for. Nothing else in the post changed.

## Related

- [I thought it was a small job](/blog/i-thought-it-was-a-small-job)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Measurement-led agent readiness](/guides/measurement-led-agent-readiness)
`,
  "/blog/i-thought-it-was-a-small-job": `# I thought it was a small job

2026-08-16

I set out to read my own workspace file by file. The idea was that it would take an evening. It took seven days, and it produced 367 findings across nine packages.

## What was actually read

The workspace holds 2 307 text files and 28 826 789 bytes, which is roughly 8 million tokens. Another 441 files are binaries such as images and PDFs. They were counted but not read line by line, because reading a JPEG line by line means nothing. The nine packages split that by surface: the Worker source, the rest of the site repo, the MCP server and the validator package, the tools, the two large decision logs, the knowledge base, the agent memory, the docs and cross-post trees, and the scratch folder.

Seven days of that produced 69 recorded decisions and 50 new entries in the trap log. It produced no invoice, no proposal and no sent message.

That is the honest ledger. A week of work with nothing billable in it.

## What it bought

The base is now audited file by file, and it is not audited by me remembering that I checked it. Seven deterministic gates run on my machine as editor hooks and block the action rather than warn about it. They stop the edit tool in this workspace, git in the agent shell, generated files written to the workspace root, and repo edits made before the trap log has been read. Two of them run after a write and check for NUL bytes, changed line endings and a size collapse.

Twenty-three gate scripts sit in the toolchain and run on demand or on ship. Three of them run on every release, and between them they perform 314 mechanical checks with no network and 567 when the live URLs and the manifest signatures are included. None of those numbers is a target. They are just what the scripts count when they run.

## What a line-by-line read finds that a scan does not

One measurement was written into two documents from the same run, one saying the worst overflow was 458 pixels and the other 514. Only 514 is internally consistent with the 139 pixel figure both texts also carry, so one of them had been wrong since the day it was written, and no gate could see it because both numbers were plausible.

A dependency update moved a package to a new version, and the allow list that permits that package to run its install script was pinned to the old version by name. The install script stayed blocked. Nothing broke, which is why it would have kept not breaking until something did.

A grid track refused to shrink below 412 pixels inside a 336 pixel row. A one-fraction track is really a minmax of auto and one fraction, and that auto resolves to the width of the widest child that cannot be broken. That one pushed the home page sideways at 200 percent text zoom, and I fixed the wrong cause three times before measuring instead of guessing.

## What this does not prove

It does not prove the workspace is correct. It proves that 367 specific things were read and classified. Each one was then either fixed or written down as a decision with a reason. A gate that is green tells you what it checked, and the useful question is always what it did not check.

It also does not prove the week was worth it. That depends on whether the next audit I sell is better because of it, and I do not know that yet.

## Frequently asked

**What does a line by line audit find that a scanner does not?**

Three things no gate could see, because each value was plausible alone. One measurement written as 458 pixels in one document and 514 in another. An allow list pinned to an old package version, so an install script stayed blocked. A grid track that refused to shrink.

**How long does a file by file audit of a workspace take?**

Seven days, for 2 307 text files and 28 826 789 bytes, roughly 8 million tokens. It produced 367 findings across nine packages, 69 recorded decisions and 50 new entries in the trap log. It produced no invoice, no proposal and no sent message.

**Do automated gates remove the need to read the code?**

No. Seven gates run as editor hooks and block the action rather than warn. 23 more run on demand or on ship, and three of those perform 314 mechanical checks offline, 567 with live URLs included. A green gate tells you only what it checked.

**What should a quality gate do when it finds a problem?**

Block the action. The gates here stop the edit tool, git in the agent shell, generated files written to the workspace root, and repo edits made before the trap log has been read. A warning is something a tired person reads past.

**Does a file by file audit prove the workspace is correct?**

No. It proves that 367 specific things were read and classified, and that each was either fixed or written down as a decision with a reason. Whether the week was worth it depends on whether the next audit is better, and that is not known yet.

## Related

- [Measurement-led agent readiness](/guides/measurement-led-agent-readiness)
- [The checks that pass for the wrong reason](/blog/checks-that-pass-for-the-wrong-reason)
- [My gate could not see a sixth](/blog/my-gate-could-not-see-a-sixth)
`,
  "/blog/my-gate-could-not-see-a-sixth": `# My gate could not see a sixth

2026-08-04

I built a gate that checks that the five agent readiness categories are declared the same way on six surfaces. It went green and it stayed green. 79 static checks with no failures, 212 checks against the live site with no failures, and 53 mutation cases across three runners that all reported no holes. Then I had a hostile reader go through the gate itself, and it came back with three holes. All three were one defect in three shapes.

The two posts before this one came at the same thing from other sides. The first was about a check that keeps passing after it has stopped measuring the right thing. The second was about a red reading that turned out to be about my own client rather than the server. This one is neither. The gate measured what it measured correctly, and it was blind by construction to everything it did not measure.

## The gate asked the wrong question

On every surface the gate asked whether these five were present. It never asked what else was there. That is the whole finding, and it is worth putting plainly. A check that asks whether these five are present is not a check of the set. It is a check of a list you wrote yourself, and it is blind to every element you did not know to write down.

A sixth category went through three of the four static surfaces untouched. I measured each one by running it rather than by reading the code, because reading my own code is how I ended up here. Add a sixth category to the surface, run the gate, read the output. RESULT: OK, zero failures, sixth category sitting on the page.

## Three shapes of one defect

The first was a filter that ran before the count. The table rows in the README are collected, filtered down to the ones that resolve to a known category, and only then counted. A row whose name the fact file does not recognise disappeared in the filter, so the counter never went up. The filter is there to keep unrelated rows out of the count, and it kept the finding out with them.

The second was a span that ends on the last element's own sentence. The gate lifts a paragraph out of the audit guide by anchoring on the first category and the last one, and the closing anchor is commerce's own sentence. That is exactly where a sixth gets appended. Anything added after it falls outside the span the gate is reading.

The third was a substring test standing in for an equality test. One surface carries a twin sentence built entirely from the fact file, and the gate compared the page against it with includes. A sixth appended to the end of the list was caught. A sixth inserted at the front was not, because the string the gate wanted was still in there. It just was not the whole of it any more.

## The fourth one was in the tool doing the checking

There was a fourth, and it sat in the thing I was using to prove the other three. One of the mutation runners reported no holes across ten cases. Seven of those ten had come back with applied=0 and HTTP 429, which means the rate limit refused the request and the mutation was never in place at all. The runner counted a case that never ran as a case with nothing wrong. It read a red run as a pass.

That is the same defect one level up, and it is the one I would rather report than the three below it. The runner asked whether the failures it knew to look for had appeared, and it never asked whether the run had happened. A tool that certifies the other tools is where this class of mistake does the most damage, and a green summary sitting on top of seven refused requests is exactly what it looks like from the outside.

The same blindness turned up in a different gate a few hours later. Cases aimed at an agent skills file were matching any agent skills line instead of the one they named, so a digest check stood in for a content check and one real hole went through. The mutation had put a wrong business identifier in the declared field. The check passed because the correct identifier still appeared elsewhere in the same file, inside a registry link, and the check was searching the file rather than reading the field.

## What a set check has to do instead

A check that watches a set must not search. Searching answers a question about one string at a time, and a set is not a bag of strings you happened to remember. The check has to enumerate what the surface actually contains, then compare that enumeration against the set. Three conditions, all of them at once.

- The enumeration and the set are the same length.
- Every element found on the surface resolves to a member of the set.
- No member of the set is resolved twice.

The third condition earns its place. Without it a surface can carry the right number of rows with one member listed twice and another missing entirely, and the first two conditions are still satisfied.

Then the part my original code had backwards. Every element that does not resolve is a finding. In the gate I wrote, an unresolvable row was a row to skip, and it was a row to skip because the code had been written to answer whether the known five were present. The question shapes the data structure, and the data structure then makes the other question impossible to ask.

## The version that transfers

None of this is new and none of it is rare. Anyone who has written against a schema has met it under the name additionalProperties, and the repair is the same repair. The reportable part is not the class of defect. It is that three instances of it were sitting in my own code, in a gate I had negative tested, on a day it reported green three separate ways.

The version that transfers to anyone with a test suite: your test asserts that the fields you remembered are present in the response. It does not ask what else is in the response. Add a field to the payload and the test stays green, which is correct behaviour for a compatibility check and wrong for anything you believe is watching a set. If a test's name says it validates a schema or a contract, open it and check whether it enumerates or whether it searches.

## About the hostile read

It was a tool of mine in a session of mine. It is not an audit and I am not going to call it one. It produced 17 observations, 13 of them carrying evidence and 4 flagged as suspicion, and I verified the four most serious by running them myself before I believed any of them. A second reader's finding is a lead. It becomes a measurement when you run it, and until you run it you have only swapped one reader's confidence for another's.

## What these gates still do not read

The gates watch what they watch. The category set is now compared across six surfaces where it used to be compared across two. Two things they do not touch at all: the markdown twins on pages other than the homepage, and the values inside the well-known manifests. Nothing here says the site cannot drift. It says that one specific way of drifting now costs a red run, and that I know the names of the next two.

## Related

- [The checks that pass for the wrong reason](/blog/checks-that-pass-for-the-wrong-reason)
- [A red reading that measured my own client](/blog/red-reading-that-measured-my-own-client)
- [Measurement-led agent readiness](/guides/measurement-led-agent-readiness)
`,
  "/blog/red-reading-that-measured-my-own-client": `# A red reading that measured my own client

2026-07-30

I posted yesterday about checks that keep passing after they have stopped measuring the right thing. The next reading I took was the same defect turned around. A request against my own MCP server came back red, and the red was about my request.

## Two responses that agreed on the wrong story

I was working on the README for that server and sent a request at the endpoint to see what it was serving. The first was server/discover, which the 2026-07-28 revision of the Model Context Protocol requires every server to implement. It answered -32601 Method not found. So I sent initialize with protocol version 2025-06-18, the handshake that revision removes, and it answered 200 with the server's identity.

Taken at face value that is a server that never migrated. The required new request is missing and the removed handshake still works. The migration had gone out that morning.

## The server was right and my request was not

Reaching the new lane takes three things at once, and I had none of them. The request has to carry the header MCP-Protocol-Version: 2026-07-28. It has to carry an Mcp-Method header naming the same method as the body. And params._meta has to carry the keys io.modelcontextprotocol/protocolVersion and io.modelcontextprotocol/clientCapabilities. Send none of that and the request is not malformed. It is a legacy request, and the library's compatibility lane answers it correctly, because answering it correctly is what the lane exists to do.

That is the part worth stopping on. A compatibility lane is built to be invisible, which is right for a client and wrong for anyone taking a measurement. When the old lane answers politely, "this server does not implement the new revision" and "my client did not ask for the new revision" arrive looking the same. Neither response carries the thing that would separate them.

## The cheap test

There is one and it costs a single request. If initialize answers, you are on the legacy lane, and whatever you conclude next is a statement about your client. A server serving 2026-07-28 does not offer initialize on the new lane at all, so a working handshake is evidence about the caller.

## What the four requests returned

- Without the version header, server/discover returns HTTP 200, framed as an event stream, carrying -32601 Method not found. The same request sent as initialize with protocol version 2025-06-18 returns 200 and the server's identity.
- With the version header and no _meta, HTTP 400 and -32602, and the message says the header names revision 2026-07-28 while the request is missing the required per-request envelope key _meta.
- With the header and a _meta whose keys are spelled protocol-version and client-capabilities, HTTP 400 and -32602 again, and this time the message lists the two names the server does want.
- With all three in place, HTTP 200, supportedVersions holding 2026-07-28 alone, capabilities.tools.listChanged true, resultType complete, ttlMs 3600000, cacheScope public, and the server identity in result._meta.

## What this is not

This is not a defect in the SDK and not a gap in the spec. The compatibility lane is a deliberate decision and the right one, and being invisible is the whole point of it. The trap is downstream, in what a reader does with a response that arrives clean.

It is also not a story where the information was missing. Read the second and third rows again. The server named the envelope key I had left out, then the two keys I had misspelled. The correct request was written inside the failures from the moment the version header went on, and I read the first response as a verdict instead of reading the rest as instructions.

Rechecking all of this turned up one more of my own. A note of mine says this endpoint refuses anything that does not accept both JSON and an event stream. That holds on the legacy lane. On the new one a plain JSON Accept is answered, and so is a request with no Accept header at all. I had written down the behaviour of the lane I happened to be standing in and filed it as the rule.

## The shape, both times

Yesterday it was a green check reading a lane the server no longer serves. Today it was a red reading of a lane my client never asked for. A response tells you what happened and you supply what it means, and the supplying is where it goes wrong. It goes wrong quietly, because a clean status code and a well-formed error object look like a measurement.

So the habit, for anything with a compatibility layer beneath it. Before reading the result, work out which lane answered. If the protocol will not tell you, put the discriminator in the request yourself and check that the answer moves.

None of this is visible to an agent-readiness scanner. Scanners do not speak MCP, so a passing readiness level says nothing about whether an MCP endpoint serves the current revision. That one belongs to whoever runs the server.

## Related

- [The checks that pass for the wrong reason](/blog/checks-that-pass-for-the-wrong-reason)
- [MCP server card](/guides/mcp-server-card)
- [Measurement-led agent readiness](/guides/measurement-led-agent-readiness)
`,
  "/blog/checks-that-pass-for-the-wrong-reason": `# The checks that pass for the wrong reason

2026-07-29

The Model Context Protocol cut revision 2026-07-28 on 28 July. I read the released tree that evening, the way I read any spec I am about to depend on, and the finding was not in the prose. It was in the step that produced the release.

## Thirteen links that resolved

Cutting a revision copies the living draft tree into a dated one, and every reference inside the copy has to be dated with it. That is the whole promise a dated snapshot makes. Reading the 2026-07-28 tree a year from now should give what it gives today.

The promote step rewrote one link pattern when it copied the spec tree, and that part worked. Two other patterns were not covered. Three links still pointed at the draft schema, including the one whose own next line calls it the source of truth for all protocol messages and structures. Nine pointed at the draft docs tier, eight of those at the security best practices page. The changelog's compare link was the thirteenth.

Not one of them was broken. Every one resolved, just to the living tier rather than the frozen one, which is presumably why a preview check did not catch them. The reader who follows a link labelled 2026-07-28 in a year gets whatever the draft has become by then, and nothing anywhere reports a problem.

I filed it with the line numbers and the two greps I had run to find them. It was closed the same day. The fixed release carries thirteen corrected links, and the promote step now runs all three rewrites over all three copied trees with the changelog compare pinned to the new tag. The second half is the half that matters. A file fix is good for one revision and a workflow fix is good for every revision after it.

## The same shape, one day later, in my own gate

The revision is a large breaking one. Sessions are gone, the initialize handshake is gone, the protocol is stateless, and there is a new server discovery request that servers must implement. Both dependencies my own MCP server needed went stable within two days of the cut, so I moved it over.

My site has a verification script that proves the signed MCP server card describes the server that is actually running. It exists because a card once declared capabilities the server did not implement, for weeks, invisibly. The way it proved parity was to run the initialize handshake against the live server and compare what came back.

The new revision has no initialize. The library keeps a compatibility lane that still answers it.

So the gate would have kept passing. It would have reported the same clean count it always reports, and it would have been measuring the old lane while the new one went untested. Not a failure, not a warning, just a number that no longer meant what it said. I rewrote the parity block around the new discovery request before the migration shipped rather than after, and added two checks the old transport had no equivalent for.

## What the two have in common

Both are the same defect wearing different clothes. In the release it was links that resolve, so nothing is broken. In my gate it was a check that passes, so nothing is red. In both cases the text and the tooling were fine in isolation and the thing between them had quietly stopped being true.

The practical version, for anyone maintaining a checker: a gate that only fails on breakage cannot tell you that it has started measuring the wrong thing. When the thing under test changes shape, read what your own check actually speaks to. Mine was one line of code and a protocol version, and I would not have found it by running it.

The lesson I took from reading three specs this way is narrower than I expected. On a mature spec, the prose has been over hundreds of eyes and the review process works. The publishing machinery around it has been over far fewer. That is where a fresh reader still has something to contribute.

## Related

- [MCP server card](/guides/mcp-server-card)
- [Measurement-led agent readiness](/guides/measurement-led-agent-readiness)
- [Honesty and the checker](/blog/honesty-and-the-checker)
- [A red reading that measured my own client](/blog/red-reading-that-measured-my-own-client)
`,
  "/blog/finishing-the-optional-commerce-checks": `# Finishing the optional commerce checks

2026-07-20

Agent-native payments are moving from proposal to plumbing. This summer the x402 protocol became a Linux Foundation project, with Visa, Mastercard, Google and Stripe among its founding members. The chain being built runs from discovery to transaction, which means a site's payment surface has to be something an agent can find and read before any money moves.

isitagentready.com scores that surface in its Commerce category. The category is optional and does not change the overall score, so turva.dev already read 100/100 and Level 5 with three of the five commerce checks green. Two were still red, x402 and MPP. This is the log of taking them green and leaving settlement exactly where it was.

## What the scanner actually checks

The two checks failed for a plain reason, and not the one an earlier note had assumed. The scanner exposes its own audit detail, so you can see what it fetches. For MPP it reads /openapi.json and looks for the payment fields directly on each payable operation. turva had declared them inside an offers array, a form the payment-discovery draft allows and this scanner does not read. Flattening the declaration to the single-offer form, same Stripe charge and same price, was all it needed.

For x402 the scanner requests /api and expects an HTTP 402 with payment terms. turva served an open index at /api and a dedicated 402 endpoint elsewhere, so the probe saw a 200 and stopped. The fix was to make /api itself answer with the canonical x402 402, backed by a real wallet on Base, and to move the free endpoint index to /api/v1. The 402 is a genuine challenge, and the free discovery surfaces stay open at /openapi.json, under /.well-known, and at /api/v1.

## Settlement did not change

What did not move is the part worth stating plainly. turva does not auto-settle. The 402 challenge and the OpenAPI discovery both declare a real payment surface, priced in USDC on Base and payable by card through Stripe, but the money is confirmed out of band rather than taken by the site. An agent can discover the offer and read the terms. A person or an agent then completes the purchase, and scope for bespoke work is agreed in writing first. A green check here says the surface is present and correct. It does not say the site quietly charged anyone.

An earlier post left these two checks red, on the reasoning that satisfying them meant disturbing surfaces that were already correct. Reading the scanner's probe more closely showed a cleaner path, so the position changed. That is the use of measuring against a tool you do not control. It shows you where you were wrong.

## The services, and how a card payment works

The three fixed offerings have a card checkout link each, prices ex VAT:

- [Agent-readiness audit, €4,300](https://buy.stripe.com/bJe5kD5Tu0dBcFG9o75EY03)
- [Monthly advisory, €3,000, minimum three months](https://buy.stripe.com/7sYcN5eq04tRfRSeIr5EY01)
- [Implementation day, €1,500](https://buy.stripe.com/6oUaEX81C0dBfRSbwf5EY02)

Scope is agreed in writing before any of the three is paid. That is what the terms say, and it is what the OpenAPI spec says about these same three links. The link is how the card payment is made once scope is settled, not a way around settling it. VAT is added on the invoice rather than by the link, so an EU business buying under reverse charge sends its VAT ID with the scope.

Corrected 2026-08-02. This section used to present the three links as an invitation to pay before scope was agreed, which contradicted the terms and the description of the same three links in the OpenAPI spec. The measurements in this post are unchanged.

## The rule, again

A green check is worth something only when it reflects what an agent actually finds. Commerce is optional, so none of this moved the headline number. It moved whether the payment surface is real and discoverable for the moment agents start to pay, which is the part that will matter. The worker that produces these results is open source at github.com/erekola/turva-worker, readable line by line.

For an agent-readiness audit that reports measured results, contact info@turva.dev.

## Related

- [x402 and agent payments](/guides/x402-agent-payments)
- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
`,
  "/blog/the-twin-is-the-page": `# The twin is the page

2026-07-19

Every page of this site lives as a markdown string inside the Worker's source file. For the guides and the blog posts that has always been literal. The Worker renders those pages from the markdown at request time, and a client that asks for text/markdown gets the same string untouched. Ten pages worked differently. The homepage, the services page, the validator and the other card-style pages were hand-written HTML, and the markdown lived beside them as a twin. Same content, two homes.

Two homes means every edit happens twice, and sooner or later one home gets the edit and the other does not. I knew that when I chose the layout. For a while the honest description of the arrangement was a sentence I never liked writing: a checker keeps the pairs in sync, and I am not sure that is the right call.

## Six drifts nobody saw

The checker earned its keep before it retired. A parity gate went into the deploy checks the day before this conversion, comparing each hand-written page against its twin paragraph by paragraph. In its short life it found six real drifts, wording that had quietly diverged between the HTML and the markdown. None of them were visible by reading. I had read those pages many times.

## One home for every sentence

This week the two homes became one. The ten card pages now render their prose from the twin at request time. Seventeen small helpers, under two hundred lines between them, read a named section of the twin and render its paragraphs into the page. The structure around the prose stays hand-built. The hero, the terminal demo, the validator form and the price cards are HTML that the markdown does not try to describe. Every sentence now lives once, and editing the twin is editing the page.

## The gate that replaced the comparison

The parity comparison is gone, because there is nothing left to compare. What replaced it is a stricter check on the end state. Before every deploy a script walks each card function and fails the run if it finds a literal prose paragraph outside two named exceptions, if a twin section is neither rendered nor declared markdown-only, or if a function references a section its twin does not have. The gate is mutation-tested from both sides. A planted paragraph fails the run, and so does a misspelled section name. An exception that exists but goes unused fails it too, which keeps the exception list from rotting into a list of ghosts.

## Proving it with rendered output

The gate was not enough on its own, because the risk in a rewrite like this is a rendering change nobody asked for. So every batch of the conversion shipped against a rendering harness. The same worker file runs in plain Node before and after the change, all ten pages and their markdown twins are snapshotted, and the outputs are diffed after normalization. The blog index came out byte-identical. The company page came out identical after normalization. Every other page changed only in ways the diff named, mostly apostrophes turning into HTML entities.

The harness also caught one real bug before it went anywhere. A sentence on the validator page named the fetched path with a placeholder domain written in URL form. As hand-written HTML it was inert text. Rendered through the markdown pipeline it matched the bare URL rule and became a link to a domain that does not exist. The fix was rewording the sentence without the URL shape. The general lesson: prose that moves into a markdown renderer starts playing by markdown's rules, and rendered output is the only place you see that.

## What did not change

From the outside almost nothing moved. The scanner read the site before and after the conversion and reported the same result. The homepage still serves a markdown version that is deliberately shorter than its HTML, and the layout is still code. That boundary is the honest one to draw. The markdown is the content contract, and the structure around it is the site's own business.

Two limits are worth stating plainly. The checks run on my machine before a deploy, and there is no CI behind them. And the blast radius of a bad edit is unchanged, because all content lives in template literals in module scope, so one stray interpolation marker would still take down every page rather than one. A build step would solve that differently, and at some size it wins. At this size, one file that renders itself is cheaper to keep honest.

If you want to check any of this, request any guide or blog post with Accept: text/markdown and diff the response against its string in worker.js. They match byte for byte.

## Related

- [When honesty and the checker disagree](/blog/honesty-and-the-checker)
- [Every response promised a rate limit. Nothing enforced it.](/blog/enforcing-the-rate-limit-i-advertised)
- [Serving markdown to agents](/guides/markdown-for-agents)
`,

  "/blog/enforcing-the-rate-limit-i-advertised": `# Every response promised a rate limit. Nothing enforced it.

2026-07-18

One function in this site's Worker attaches security headers to every response it renders. Until yesterday two of them were RateLimit-Limit: 100 and RateLimit-Policy: "default";q=100;w=60. They went out with the homepage, with all 24 guides, with every markdown twin and with every 404. This site also publishes a guide on response headers for agents, and that guide teaches the RateLimit family on the reasoning that a well-behaved agent reads the declared budget and throttles itself before anyone has to throttle it.

No code enforced either number. The Worker had no rate limiting logic and no path that returned a 429, and the config declared no limiter. The 100 had never been connected to a counter, so every response was advertising a budget the server had no way to spend. It surfaced while I was preparing answers to the hardest questions this site could be asked, which is the only reason it surfaced at all.

That is the exact defect this business sells finding. A declared surface that no code resolves is the first thing an agent-readiness audit looks for, and an agent polite enough to trust the header would have been rationing itself against a limit that lived only in text.

## What enforcement looks like

Cloudflare's Workers rate limiting binding does the work now. The configuration is a block in wrangler.jsonc naming a limiter with a simple limit of 100 requests per 60 seconds, so the config carries the same numbers the header had been promising on its own. At the top of the fetch handler the Worker calls limit() keyed on the client IP, and past the limit it returns 429 with Retry-After: 60, built by the same security header function as every other response, so the rate limit header rides on the 429 itself.

It fails open, deliberately. If the binding is missing or limit() throws, the request is served normally, because a limiter that takes the site down when its own plumbing breaks is a worse trade than a burst that gets through. That choice has a cost this post comes back to: from the outside, a guard that has failed open is indistinguishable from a guard doing its job, and only the logs can tell them apart.

The key is the client IP, and Cloudflare advises against that. Their best practices say it plainly: "It is not recommended to use IP addresses or locations (regions or countries), since these can be shared by many users in many valid cases." They are right. The identifiers they recommend are stable properties of a caller, an API key in an Authorization header or a user or tenant ID, and none of those exist here. This site is public documentation with no accounts and no login, so the IP is what is left, and the cost is real. Several agents behind one corporate proxy or one mobile NAT share a single budget of 100, and the one that gets refused may be the one that asked politely.

## The test that found nothing

Reading the code is what caught this. That finding needed no instrument: no limiter logic anywhere, nothing that could say 429. On the same morning a probe seemed to corroborate it, 130 requests in about six seconds, zero 429s back. I would have quoted the probe over the code reading in a heartbeat, because it has a number in it and numbers travel.

The probe proves nothing, and that is now measured rather than suspected. I ran the same burst against the fixed site, enforcement live, from a network that had never touched it. 130 requests, ten in parallel, and all 130 came back 200 with not one 429. The identical result the broken site gave. In the larger burst below, not one of the first 130 requests was refused either. A hundred and thirty requests never reach the point where this platform starts refusing, so the working site and the absent limiter answer that probe in exactly the same voice.

A test that returns the same answer whether or not the thing is broken is not weak evidence. It is not evidence. It is worse than no number at all, because a number gets quoted, and this one would have been quoted by me. The code reading found the defect. The curl agreed with it by coincidence.

## Cloudflare documents the looseness

The binding's documentation says, in a section titled Accuracy, that the API "is permissive, eventually consistent, and intentionally designed to not be used as an accurate accounting system." The Performance section above it explains why: the counters are cached on the machine the Worker runs on and updated asynchronously against a backing store in the same Cloudflare location, which is how limit() costs no meaningful latency. And the counters are local. For each key there is a separate limit per Cloudflare location, so 100 per 60 seconds is a budget per IP per location, never a global one.

Measured from here, permissive looks like this. A parallel burst of 300 requests, ten at a time, returned 279 responses of 200 and 21 of 429. That run tagged each request with its index, so it could see where the refusals sat: all of them pooled at the end, indexes 240 through 299. A second run from another network split 281 and 19. A single request sent straight after the burst was refused on one network and served on the other, which is eventual consistency behaving exactly as advertised, and why the Retry-After: 60 on the 429 is a declared ceiling rather than a measured wait.

The contrast that stings is local. A wrangler dev run enforces the limit exactly, 100 requests pass and the rest are refused, so the environment where you would naturally verify your own code is the one environment that behaves nothing like production.

There is also a slower path to the limit, and our first test walked toward it without knowing. The budget refills at 100 per 60 seconds, a little under two requests a second. A sequential loop at three per second drains faster than the refill, so on a bucket model it would meet its first refusal somewhere past request 220. Ours stopped at 115 requests and 38 seconds, saw nothing but 200s, and I misread that as a broken deploy and asked for a second one. The deploy had been fine. The measurement was too small to say anything in either direction, and the possibly wasted deploy is part of this story's bill.

## If you want to test it

A slow loop tells you nothing here, and a hundred requests tell you nothing. Both come back all 200s whether the limit is enforced or absent. What reaches the limit is a parallel burst big enough to outrun the counters:

    seq 300 | xargs -P 10 -I{} curl -s -o /dev/null -w "%{http_code}\\n" https://turva.dev/ | sort | uniq -c

Expect most of the burst to pass and a tail of it to be refused. My two runs split 279 to 21 and 281 to 19. Yours will be a third pair of numbers, because you will be filling a counter in your own Cloudflare location rather than in mine. The shape repeats, the arithmetic does not. And if a burst of 300 gets you no 429 at all, I want to hear about it, because that is either the fail-open path hiding a broken binding or a behavior I cannot presently explain. The address is info@turva.dev.

## One header was from a retired revision

The guide on this site names the current pair of fields, RateLimit and RateLimit-Policy. The code was sending RateLimit-Limit and RateLimit-Policy. Before touching anything I went to the IETF archive to check which surface was right, and the answer was unambiguous. Revision 11 of draft-ietf-httpapi-ratelimit-headers, the active revision from May 2026, defines exactly two fields, RateLimit-Policy and RateLimit. RateLimit-Limit belongs to the early revisions, and where revision 11 mentions it at all is inside a section whose own heading says it is to be removed before publication as an RFC, in a survey of the legacy header names the draft is trying to replace. The site was sending one field from the current draft and one from a retired lineage in the same response. The guide had been right all along. Only the code was wrong.

The fix shipped yesterday: RateLimit-Limit is gone and RateLimit-Policy stays. The field the current draft does define, RateLimit, was deliberately not added. Revision 11 makes its r parameter, the remaining quota, required, and Cloudflare's limit() returns a success boolean and nothing else, no remaining and no reset, so sending RateLimit would mean inventing the very number the field exists to carry. The draft also says the policy field alone lets a client control its own flow of requests, and positions the RateLimit field for limits that are highly dynamic. This limit is a static 100 per 60 seconds. For a static limit, RateLimit-Policy alone is the correct form.

## What to take from it

A declared limit is a claim about behavior, and claims about behavior rot silently, because nothing breaks when they do. The check that catches this class of defect is reading the code. Probing the endpoint cannot do it, because on an eventually consistent platform the probe returns the same comfortable 200s for a working guard, for a missing one and for one that has failed open. If a header on your site promises something, the interesting question is not whether the value looks sensible. It is which line of code makes it true.

If you want your own agent-facing claims read the way a skeptic would read them, an audit is what I do. Email info@turva.dev.

## Related

- [Response headers that help agents](/guides/response-headers-for-agents)
- [When honesty and the checker disagree](/blog/honesty-and-the-checker)
`,

  "/blog/measuring-the-ai-patch-surge": `# Microsoft said the patches would get bigger. I measured how much bigger.

2026-07-15

On 9 July 2026 the head of Windows published a post about AI-powered vulnerability discovery. One line in it was a warning to customers: "As AI helps defenders discover more issues, customers will see a higher volume of security updates included in each security release."

It does not say how much higher. The post runs about 1400 words and contains no numbers at all.

Five days later Microsoft shipped the July package: 1150 CVEs.

The number Microsoft would not put in the blog post is sitting in Microsoft's own API. The Security Update Guide publishes every monthly package as machine-readable CVRF, acknowledgments included, no key required. So I pulled twelve months of it and did the arithmetic.

## What the data says

I sampled eight months before the ramp and four after it.

| Month | CVEs | Month | CVEs |
| --- | --- | --- | --- |
| 2024-07 | 454 | 2026-04 | 737 |
| 2025-01 | 343 | 2026-05 | 991 |
| 2025-04 | 374 | 2026-06 | 1281 |
| 2025-07 | 527 | 2026-07 | 1150 |
| 2025-10 | 427 | | |
| 2026-01 | 310 | | |
| 2026-02 | 169 | | |
| 2026-03 | 460 | | |

The eight pre-ramp months average 383 CVEs. July 2026 is 1150, so the package is 3,0 times the old normal. The baseline broke in April and peaked in June at 1281.

April to July inclusive is 4159 CVEs. At the old rate that is 10,9 months of output, delivered in four.

## The number I am not going to use

February 2026 had 169 CVEs. It is the lowest month in two years, less than half the baseline. Divide July by February and you get 6,8 times, which is a much better number for a headline.

I am not using it, because choosing your denominator is how honest people produce dishonest numbers. February is an outlier, and the only reason to anchor to it is that it flatters the story. The real multiplier is 3,0. It does not need help.

## It is not noise

The obvious objection is that volume without quality is just a bigger pile. If AI were generating low-value findings that got patched anyway, the severity distribution would sag. It did the opposite.

| Measure | 2025-07 | 2026-07 |
| --- | --- | --- |
| CVEs | 527 | 1150 |
| CVSS median | 6,5 | 7,5 |
| CVSS mean | 6,47 | 7,26 |
| CVSS 7,0 and above | 48,0 % | 71,9 % |
| CVSS below 4,0 | 4,2 % | 0,8 % |
| Rated Moderate | 33,4 % | 4,8 % |
| Rated Critical | 26 | 66 |
| Remote code execution | 42 | 165 |
| Elevation of privilege | 58 | 256 |

Three times the volume, and the median CVE is a full point more severe. The Moderate band collapsed from a third of the package to under five per cent. Remote code execution roughly quadrupled.

One caveat, stated plainly. The share of CVEs Microsoft did not assign a CVSS score to rose from 5 % to 38 %. Those are likely Chromium-inherited Edge issues, which Microsoft does not usually score itself. The severity claim above holds for what Microsoft scored. I cannot speak for the rest, and neither can anyone who has not opened the file.

## Why the well did not run dry

Windows has been patched for thirty years. Intuition says the supply of findable bugs should be thinning. Instead it tripled.

The explanation is in Microsoft's own May post about MDASH, their multi-model agentic scanning harness. Run against five years of confirmed vulnerabilities in clfs.sys, it re-found 96 % of them. In tcpip.sys, 100 %.

A harness re-found almost everything human researchers took five years to find. The bugs were discoverable the entire time. There were never fewer of them. Nobody was looking hard enough, because looking was rate-limited by human attention rather than by how many bugs were actually there.

The well was not draining. It was being sipped. What we are watching is not a bug explosion. It is a backlog, and the backlog is as old as the code.

## The capability is in the harness

MDASH is over a hundred agents, multi-model debate across model families, and a separate pipeline that proves candidates before a human ever sees them. Microsoft reports it at 88,45 % on [CyberGym](https://arxiv.org/abs/2506.02548), a benchmark for real-world vulnerability discovery, in its [12 May 2026 announcement](https://www.microsoft.com/en-us/security/blog/2026/05/12/defense-at-ai-speed-microsofts-new-multi-model-agentic-security-system-tops-leading-industry-benchmark/). Anthropic's gated frontier model, Claude Mythos, is reported at 83,1 % on the same benchmark; the same Microsoft post names that figure as the entry just below its own, and [GeekWire's coverage](https://www.geekwire.com/2026/microsofts-multi-agent-ai-system-tops-anthropics-mythos-on-cybersecurity-benchmark/) attributes it to Mythos.

I am not going to tell you the harness beats the model. Those two figures come from two different parties under conditions neither published, and five points is well inside what a difference in evaluation setup can produce. What the pair does establish is an order of magnitude: an orchestration layer running an ensemble, distilled models included, lands in the same range as the most capable model anyone has built.

That has a consequence worth sitting with. Access to Mythos is controlled by Anthropic under Project Glasswing. Orchestration is controlled by nobody, and it is described in a public blog post. If the scaffolding carries that much of the capability, the interesting question is not how far open weights trail the frontier model. It is how far an open harness trails MDASH. Scaffolding is cheaper to copy than a frontier model.

## The same technology closed a bug bounty

In January 2026 the curl project shut down its bug bounty. Twenty reports arrived in the first twenty-one days of the year. Not one was valid. Daniel Stenberg described it as being DDoSed. HackerOne submissions rose 76 % year over year through March, and roughly three quarters of them were noise. Google stopped taking AI-generated submissions to its open-source reward programme. GitHub tightened its requirements.

So in the same six months, one organisation used AI to ship 1150 real CVEs and another was driven out of the bounty business by AI reports that were worth nothing.

Same technology. The difference is the prove pipeline. Microsoft built one, with dedicated cloud infrastructure behind it. curl is volunteers, and volunteers cannot fund a filter, so the only move left was to close the door.

## Check it yourself

The CVE counts and the severity split above come from one endpoint. No key, no account.

    https://api.msrc.microsoft.com/cvrf/v3.0/cvrf/2026-Jul

Send an Accept: application/json header, count the Vulnerability array, read Threats for severity and CVSSScoreSets for the scores. Change the month and run it again. If my baseline of 383 is wrong, the file will say so, and I would rather you tell me than take my word for it.

Note added July 16: one fair objection surfaced when this post was re-read with hostile eyes. The eight-month baseline includes the February outlier, the same kind of number the denominator section warns about. Excluding February, the baseline is 414 and the multiple is 2,8 rather than 3,0. The direction survives either denominator, and now both numbers are on the record.

Note added July 17: this post tells you to run the query yourself, so it owes you the reason your numbers will not match mine. Microsoft keeps revising these documents after release. Re-pulled on 17 July 2026, May 2026 returns 1123 rather than 991, June returns 1205 rather than 1281, and July returns 1169 rather than 1150. The May document is on revision 2275 and June on revision 1141, both last revised on 15 July 2026. The eight baseline months have not moved, so the baseline of 383 stands. On the figures the endpoint returns today, July is 3,1 times the baseline rather than 3,0, April to July is 4234 CVEs or 11,1 months of output at the old rate, and June is still the peak. The table above is what the endpoint returned when I ran it, and the pull date is now part of the number.

## Why this matters if you are buying anything

This is the method I sell, pointed at someone else.

A vendor made a qualitative claim: volume will go up. The receipt was public, machine-readable and free the whole time. The gap between the press release and the API was the entire story, and closing it took an afternoon and no privileged access.

That is what measurement is for. Not to catch anyone out. Microsoft's post is accurate, and the data supports the direction it describes more strongly than the post itself does. The point is that "higher volume" and "3,0 times, and the median CVE gained a full point of severity" are different sentences, and only one of them can be checked.

Agent-readiness works the same way. A site can assert it is ready for AI agents. A scanner reads the site and returns a number. One of those is an opinion.

## Related

- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
- [How to let an AI agent work in your repo without leaking your secrets](/blog/agent-secret-hygiene)
- [When honesty and the checker disagree](/blog/honesty-and-the-checker)
`,
  "/blog/agent-secret-hygiene": `# How to let an AI agent work in your repo without leaking your secrets

2026-07-12

Coding agents now run with your shell. They read your files and run your build. They push commits under your name. That is the point of them. It also means every plaintext secret on your disk is readable by the agent, and by every backup or synced folder that copies your working directory. A token in a text file was a small risk when only you could read it. It is a larger one the moment something else is holding the keyboard.

This is the question an agent-readiness audit asks about your product, turned inward. If you care how a third party exposes data to an agent, your own machine is the first place to get it right.

Here is the posture I would defend, the reasoning behind it, and one Windows trap that cost me an afternoon.

## Keep secrets out of plaintext files

The old habit is a token in a dotfile, a key in .npmrc, an unencrypted service account JSON sitting next to the code. It works because the file is only yours. An agent breaks that assumption. So does a leaked backup, a synced folder, or someone watching a screen-share.

Move every secret into storage the operating system encrypts and scopes to your account. On Windows that is the Data Protection API. On macOS the Keychain. On Linux libsecret through the Secret Service. The value is encrypted at rest, only your logged-in account can decrypt it, and a copied file is useless to anyone else. Your scripts ask for the secret when they run instead of reading it off disk.

## Git credentials through a credential manager

Most people still authenticate git with a personal access token pasted into a credentials file. Drop that. Use a credential manager that speaks OAuth, so the token lives in the OS store, refreshes on its own, and never lands in a file you can commit or copy by accident.

One trap to know if you are on Windows and your forge is not GitHub. The common advice is git-credential-oauth with the wincred store. That store writes to Windows Credential Manager, which caps a single entry at 2560 bytes. Some forges issue OAuth tokens well past that, and the write fails with a bare "CredWrite failed" while fetch still works, so nothing looks wrong until you notice every command re-authenticating. Git Credential Manager handles the large token by splitting it across entries and refreshes it silently. If a self-hosted GitLab, Gitea, or Forgejo keeps opening a browser prompt on push, this is usually why.

## A small vault for everything else

Credential managers are built to store one username and password per host. They are the wrong shape for an API key you set as an environment variable, or a private key you would rather not keep as a loose file. Some values also run past the size limit above.

For those, a small file based vault does the job. Encrypt each value with the same OS primitive, keep them in one file, and give it a get command. A deploy script then reads the token when it runs, setting the environment variable from that call instead of from a file on disk. The file is encrypted and tied to your account, so a backup or a stray copy exposes nothing.

Two caveats. A vault tied to your OS user cannot be decrypted after a reinstall, so keep an offline backup of anything you cannot regenerate, like a private signing key. And do not write your own crypto here. Call the OS primitive. It is audited, and it is the same mechanism your credential manager already trusts.

## Why this matters for buyers

I build this into my own setup because I sell the audit that checks for it. A prospect who asks for an NDA is asking a real question about whether you treat access seriously or leave keys lying around while an agent works next to them. The honest answer shows in how you work, before it shows in any report.

None of this is exotic. It is one habit applied everywhere. The operating system holds the secret, encrypted and scoped to you, and the code asks for it when it needs it. An agent can then do its work in your repo without ever seeing a key in the clear.

## Frequently asked

**Where should secrets live if an AI agent works in your repo?**

In storage the operating system encrypts and scopes to your account. The Data Protection API on Windows, the Keychain on macOS, libsecret on Linux. Scripts ask for the secret when they run instead of reading it off disk.

**Why is a token in a plain file a bigger risk than it used to be?**

Because the file is no longer only yours. A coding agent reads your files and runs your build, and so does every backup or synced folder that copies your working directory. A stray copy or a screen-share exposes the same plaintext.

**Why does a git push keep asking for authentication on Windows?**

Windows Credential Manager caps a single entry at 2560 bytes and some forges issue OAuth tokens past that. The write fails while fetch still works, so nothing looks wrong until every command re-authenticates. Git Credential Manager splits the token across entries.

## Related

- [Letting agents act on your data](/guides/letting-agents-act-on-data)
- [AI agent use cases](/guides/ai-agent-use-cases)
`,
  "/blog/agent-readiness-finnish-b2b": `# How agent-ready are Finnish B2B sites? I scanned sixteen

2026-07-07

Over the past weeks I ran an independent agent-readiness scanner over sixteen Finnish company websites, mostly industrial and B2B, a few in healthcare. The scanner was isitagentready.com, which grades on a Level 0 to 5 scale. This is a small, non-random sample. The sites came from my own prospecting, not a statistical draw, so read it as a snapshot, not a census. The pattern was consistent enough to be worth writing down.

## Key figures

- Sixteen Finnish B2B sites scanned with an independent scanner, isitagentready.com.
- Almost all sites landed at isitagentready Level 1 of 5, a couple at Level 0, one at Level 2, none higher.
- The three most common gaps: HTML-only pages with heavy token overhead, missing structured data, and no action or capability layer.
- Largest measured token saving: about 16500 tokens of HTML where 1400 tokens of markdown carry the same content, a 91 percent saving.
- The two sites that published a real llms.txt sat at the top of the range.

## The numbers

On the isitagentready Level scale almost all of the sixteen landed at Level 1 of 5, the floor an ordinary CMS site reaches, a couple sat at Level 0, and only one reached Level 2. None reached Level 3 or above.

To be clear about what that means, these are not broken websites. They load, they rank, a person can use them without trouble. The scanner measures something else, whether an AI agent can read the site and act on it.

## The three gaps that showed up almost everywhere

Discoverability was usually fine, legibility was not. Most sites had robots.txt, a sitemap, sometimes explicit AI-bot rules, so an agent can find them. But the same sites served HTML only, often with heavy token overhead. One consumer-facing corporate site returned about 16500 tokens of HTML where 1400 tokens of markdown would carry the same content, a 91 percent saving. An agent can fetch the page, but reading it is slow and lossy.

The second gap was structured data, or the lack of it. Missing JSON-LD and product data was common, so an agent reaches the site, sees a wall of markup, and cannot answer a plain question like what this company makes or sells.

The third and most consistent gap was the action and capability layer. No markdown negotiation, no MCP server, no API discovery, no agent-auth metadata. One site that belongs to an AI company itself passed zero of eight checks in that discovery group. This is the layer that lets an agent move from finding a site to operating it, and it was absent almost everywhere.

## Why this matters now

AI agents are becoming a discovery and transaction channel. When an agent reads a site and cannot parse or act on it, the business does not rank lower, it becomes invisible inside the answer. The sites in this sample are not behind on SEO, most rank fine. They are behind on the next thing, being legible and actionable to the agents that increasingly read on a person's behalf.

The encouraging part is that the fixes are mostly known and mechanical. Serve markdown alongside HTML, add structured data, publish an llms.txt, expose the discovery manifests. Two of the sixteen had already started, they published a real llms.txt, and that is exactly why they sat at the top of the range.

Note added July 17: one reading of the llms.txt point is circular, since
the scanner scores llms.txt directly, so publishing one raises the score
by construction. The observation stands as a description of the measured
range, not as a causal claim about readiness.

To check where a site stands, the free llms.txt validator is at turva.dev/llms-txt-validator, and the agent-readiness audit and advisory work is at turva.dev.

## Related

- [Common agent-readiness gaps on marketing sites](/guides/agent-readiness-gaps)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
- [What an agent pays to read your site](/blog/cheaper-pages-for-agents)
- [Website agent readiness, measured on 567 company sites](/blog/website-agent-readiness-567-sites)
`,
  "/blog/honesty-and-the-checker": `# When honesty and the checker disagree

2026-07-06

During the line-by-line pass that read every line of this site, one of the smallest surfaces turned into the sharpest question in the audit. This site serves an auth.md file, a plain description of how an agent authenticates here. It said two things that did not sit together. One line read no issued credentials. Another said an API key is issued out of band on request. Both were trying to be honest, and side by side they were a contradiction.

## Cleaning up a signal made the scanner fail

The obvious repair was to drop the credential machinery and let the file say the simple true thing, that nothing here needs a credential. So the agent_auth block lost its credential types, the fields that name what kind of key or token a service hands out. To a reader they looked like box-ticking, the sort of hollow detail an audit is meant to strip.

Then the scanner failed. isitagentready.com runs a check on auth.md, and that check reports agent_auth metadata was not found the moment the block has no complete registration method. Its own published recipe requires at least one method, and every method has to declare the credential types it supports. Fields removed to look more honest read to the checker as no auth surface at all. The pass count for the whole site leans on that check, and gutting the block would have dropped the 100/100 the front page shows.

## Two honest stories, and the fork between them

So there were two true things to write. This site really does issue no credential that any resource requires, and I could say exactly that and let the check fail. Or this site really does hand out an API key out of band when someone asks, and I could declare that key properly and keep the check green. Both are honest. The checker accepts only one of them.

The tempting read is that the checker is the villain here, rewarding the file that ticks more boxes. That story is wrong. The credential the check wanted was not a fiction, because a key really does get issued on request. The first draft was dishonest for a different reason. A true detail sat next to a line that flatly denied it.

## The honest form is the precise one

The fix was to make the whole block exactly true, rather than gut it or inflate it. The API key is declared and issued out of band on request. The file describes it for exactly what it is. It attributes correspondence and nothing more. No resource on this site requires it, and holding it unlocks no extra access. Two other fields went the other way and were deleted, because they were the real hollow signals. One named an access token the service never issues. The other named an events channel that does not exist. Those were claims with nothing behind them. The API key is a claim with a key behind it.

That is the line between a hollow signal and a modest true one, and a scanner cannot draw it for you. It can tell that a field is present and parses. It cannot tell whether the thing the field describes is real. The judgment that took the longest landed on the surface that moved no score at all.

## What this leaves on the page

auth.md now says one thing instead of two. The key it names is the key you get if you email and ask, and it labels the message and grants nothing. The fields that described things the service does not do are gone. The check reads green because the declaration is finally true. Nothing was padded to please it.

For an agent-readiness audit that reads your agent-facing claims the way a skeptic would, contact info@turva.dev.

## Related

- [How agents authenticate](/guides/agent-authentication)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
`,

  "/blog/re-checking-the-guides": `# Four AI agents re-checked the guides

2026-07-04

The guides on this site describe other people's specifications, and specifications move. A sentence that says "the specification says" is true the day it ships and starts aging the day after, and no scanner will tell you when it has gone stale. So the four AI agents that read this site line by line came back for a second pass, all running Claude Fable 5, each taking one family of standards: the agent commerce stack, MCP discovery, the discovery files from agents.json to llms.txt, and the plumbing of authentication and response headers. Their job was to re-read every specification claim in those guides against the primary source behind it.

## What had moved

The pass came back with one finding rated high, one medium and six small. The high one sat in the MCP guide. It described the server card proposal, SEP-2127, in the present tense, and the proposal had moved. As of July 2026 it sits on MCP's extensions track as an experimental extension, and the current draft recommends serving the card relative to the server's endpoint plus a catalog at /.well-known/mcp/catalog.json. Nothing in the old sentence was wrong when it was written. It stayed still while the proposal moved.

The medium finding was quieter. The response-header guide leaned on the IETF draft for standard RateLimit headers, and that draft expired in March 2026 without a successor. The six small ones were wording: vocabulary that predated A2A 1.0, stale lines about the Open Knowledge Format, a Cache-Control nuance, and one phrase about ai-catalog.json contributors that had aged in two places at once, because a blog post here had quoted the guide.

Update, July 16: the RateLimit sentence above was wrong when it was published. The draft had not expired, revision 10 was active in January 2026, and revision 11 from May 2026 remains active in the httpapi working group today. The response-header guide now cites the active draft.

## The sharpest findings were not in the guides

Two of the machine-readable profiles this site serves had drifted from their own specifications, and that is a harder failure than stale prose, because these files exist for software and both had passed every scan since they shipped. The UCP profile used service keys in a namespace the specification reserves for its own governing body, and listed transports its enum does not contain. The MPP manifest declared a version field the protocol does not define. A scanner checks that a profile exists and parses. It does not check that the vocabulary inside it exists in the specification, so an invented key passes as easily as a real one. Both profiles are now in the specification's own shape, verified against the primary text and validated programmatically, and the scanner stayed green through the change. The honest form cost nothing.

## What the scores did not measure

The scanner was re-run after the fixes. isitagentready.com reads Level 5, the same result as before the pass. The scores did not move in either direction, and that is worth pausing on. A score measures the shape of a site at scan time, and the currency of a sentence about somebody else's specification is outside every scanner's reach. If reading every line is part of the promise, somebody has to re-read the lines after the world moves.

## Claims now carry their date

The lasting repair is anchoring. A guide claim about a moving specification now carries its date, as of July 2026, so when the specification moves again the sentence stays true as a dated statement instead of quietly turning false. The families that move fastest, agent commerce and MCP discovery, go back on a re-check schedule, because this pass showed the drift interval there is a matter of weeks.

For an audit that reads your agent-facing claims against the specifications they cite, contact info@turva.dev.

## Related

- [MCP server cards explained](/guides/mcp-server-card)
- [Agent commerce discovery: A2A, AP2, and ACP](/guides/agent-commerce-discovery)
`,

  "/blog/cheaper-pages-revisited": `# The page grew, the agent bill did not

2026-07-04

In late June this site published [a post on what an agent pays to read a page](/blog/cheaper-pages-for-agents), and the measurement in it said the homepage as markdown cost roughly a third of the HTML form. The most recent scan reports the same homepage at 10,320 tokens as HTML and 1,723 as markdown. That is a sixth of the cost, an 83% saving, and nothing in the meantime was done to improve the number.

## Where the weight came from

Since that post went out the site has gained seven blog posts before this one, two tool pages, a feed, a share image for every page and related links at the end of every post. None of that was content negotiation work. It was ordinary growth, and it landed where growth always lands, on the human-facing page. Between the 1 July and 4 July scans alone the HTML form of the homepage went from 9,560 tokens to 10,320, about 8% heavier in three days. The markdown form went from 1,750 to 1,723. It got slightly smaller.

## Two surfaces, two growth rates

The HTML form of a page carries everything a site accumulates: navigation, styling, social metadata, structured data and links to whatever shipped last week. Each of those earns its place for a human reader or a search engine. The markdown form carries the words and the links and nothing else, so it grows only when the actual content grows. Serve one surface to everyone and every agent pays for the whole accumulation on every visit. Serve both forms from the same URL and the costs come apart on their own, the human page free to get richer while the agent page stays at the price of the text.

## Read the number yourself

The token split is not self-reported. It comes from scanning both forms of the page, and this site logs the pair after every deploy. The June post carried the measurement of its day and this one carries the measurement of 4 July. If the pattern holds, a later post will quote a wider gap still, because the human surface keeps accumulating and the text does not.

For an audit that measures what agents pay to read your site, contact info@turva.dev.

## Related

- [What an agent pays to read your site](/blog/cheaper-pages-for-agents)
- [Serving markdown to agents](/guides/markdown-for-agents)
`,

  "/blog/moving-source-to-codeberg": `# Moving the source from GitHub to Codeberg

2026-07-04

Status, July 26: the source is on GitHub only, at github.com/erekola. This post is the dated log of a move that later reversed, and the three updates at the end record each step in order. The account of the incident itself stands as written.

The company page of this site tells a buyer they can read every line before hiring me. That promise depends on the source being reachable, and for two weeks it was not, in a way I could not see. This is the log of what broke and why the source moved to codeberg.org/erekola.

## Two weeks of 404s I could not see

On June 18 GitHub's spam detection flagged my account. There was no notification. Logged in, everything looked normal and every repo was in place. Logged out, the profile and every repo returned 404, and the search API answered "flagged as spammy". Every public pointer at the source was dead for everyone except me: the homepage hero, the guides, the READMEs, the profile links.

## How it surfaced

No scanner caught it. The agent-readiness scanner this site is measured with reads the site, not the code hosting, so every score stayed green while the trust chain behind those scores was broken. It surfaced on July 2 during a fact-check pass, when an AI agent followed the site's own "read the source" link without a logged-in session and got a 404. That is the trap in this failure mode: the owner is the one person who cannot see it.

## What GitHub said

The support ticket had been open since June 18 with one virtual-assistant reply. On July 3 a human answered: the account had been "flagged by mistake" by their spam-detection scripts, and the flag was removed. The reply did not say what had triggered it. The response was polite and the fix was real. It also arrived after the source had already moved.

## What it cost

The measurable part is two weeks of broken pointers. The probable part is worse. An inbound lead wrote in on the same day the flag landed, and my reply pointed them at the open-source Worker as proof of how I work. From that moment every source link I had sent them returned 404, and after one more exchange they went quiet. A silent failure hides its own cost on top of causing it: I cannot prove the 404s ended that conversation, and I cannot rule it out.

## Why the move, and why it stuck

I moved the repos to Codeberg on July 2 with full history, updated every public link the same day, and deleted the GitHub account once the flag was lifted. Codeberg is run by a non-profit on open-source infrastructure, which I like, but that is not the reason. No host is immune to mistakes. The reason is what the incident showed about the failure mode: a silent flag, no notification, an appeal channel that took two weeks to reach a human, and a breakage only visible from outside my own session. A dependency that can fail that way gets treated accordingly. Source hosting now sits in the site's threat model like any other third-party dependency, and the monthly self-audit checks logged-out visibility of every external pointer, because no scanner runs that check for you.

Update, July 7: GitHub is back, in a different role and on my own initiative. The account erekola now exists as a push mirror: every push lands on both hosts, and Codeberg stays canonical for fetch and for every source link on this site. The failure-mode reasoning above is unchanged, and losing the mirror would break nothing.

Update, July 21: the roles flipped again, on my own initiative. Codeberg's repeated instability that month (a days-long server-side ref lock, a 503 outage) kept blocking work, so GitHub is canonical again and Codeberg is the push mirror. Every source link on this site points at GitHub now. The failure-mode reasoning above still stands, which is exactly why the mirror stays.

Update, July 24: the mirror is gone. Codeberg published new Terms of Use this week that disallow cryptocurrency-related projects and projects whose code is mostly written with generative AI tools. This repo falls under both lines: the payment surface declares a real on-chain wallet, and the code is built with AI assistance. Deleting the mirrors myself the same day was cleaner than waiting for a takedown under rules the repos no longer fit. The source lives on GitHub only now. The failure-mode reasoning above still holds, but the fallback is no longer a second forge: the full source ships inside the deployed Worker, and offline backups remain.

External pointers rot in ways your own monitoring does not see, so they get checked the way a stranger's agent reaches them: from outside, logged out, against the primary source.

For an audit that checks a site the way a stranger's agent reaches it, contact info@turva.dev.

## Related

- [Moving turva.dev off prerender.io](/blog/moving-off-prerender)
- [Owning your fediverse identity](/blog/owning-your-fediverse-identity)
`,

  "/blog/free-llms-txt-validator": `# A free llms.txt validator

2026-07-02

turva.dev now has a free llms.txt validator at https://turva.dev/llms-txt-validator. Enter a domain and it fetches that site's /llms.txt, checks the structure against the format and reports each check as pass, warn or fail. Nothing is stored and there is no signup.

## What the format asks for

llms.txt is a small format, and that is the point of it. One H1 line names the site. A blockquote under the title carries a one line summary. H2 sections group markdown links an agent can follow to the content itself. A file that follows this shape gives an agent a map of the site at a fraction of the cost of crawling it.

## What the validator checks

- The file exists at /llms.txt and answers HTTP 200
- The response is plain text, not an HTML page
- The first non-empty line is an H1 title
- A blockquote summary follows the title
- H2 sections group the content
- Markdown links parse and use absolute URLs
- The file stays small enough to be cheap to read

The second check earns its place. A site that returns its 404 page with status 200 looks like it has an llms.txt until something actually reads it, and an agent that fetches markup where it expected markdown wastes its tokens on tags.

## Agents can use it too

The same URL answers JSON. Send Accept: application/json with a url parameter and the checks come back as data, so the validator works in a script or an agent pipeline as well as in a browser:

    curl -H "Accept: application/json" "https://turva.dev/llms-txt-validator?url=example.com"

## One build note

The first deploy failed its own self check. A Cloudflare Worker cannot fetch a URL served by a Worker on its own zone, so asking the validator about turva.dev started a request that could never return and timed out after eight seconds. The fix reads the same constant that serves /llms.txt instead of fetching it. External domains are fetched normally, and the validator was proven against the llmstxt.org file before this post went out.

## What it is not

The validator reads one file and checks its shape. It does not measure whether agents can discover the site, read its pages as markdown, find its API or complete a purchase. That is audit territory, and an audit here runs a site against an independent scanner and manual review rather than one checklist.

For an audit of the whole surface an agent sees, not just this one file, contact info@turva.dev.

## Related

- [llms.txt explained](/guides/llms-txt)
- [Serving markdown to agents](/guides/markdown-for-agents)
- [What an agent pays to read your site](/blog/cheaper-pages-for-agents)
`,

  "/llms-txt-validator": `# Free llms.txt validator

Enter a domain and this page fetches its /llms.txt and checks the
structure: the first non-empty line is an H1 title, an optional blockquote
summary, H2 sections with link lists. It also reads the site's home page for
the two link relations v2 of the format recommends. Free, no signup, nothing
stored.

## How to use it

- In a browser: open https://turva.dev/llms-txt-validator and enter a domain
- Without typing anything: https://turva.dev/llms-txt-validator?url=turva.dev runs the checks against this site's own file
- As an agent: GET https://turva.dev/llms-txt-validator?url=example.com with Accept: application/json

Both views list the same checks below. The browser page and this markdown twin are kept in sync deliberately.

## What it checks

- The file exists at /llms.txt and returns HTTP 200
- The response is plain text, not an HTML error page
- The file starts with an H1 title
- A blockquote summary follows the title (recommended by the format)
- H2 sections group the content
- Markdown links parse and use absolute URLs
- The file stays small enough to be cheap for an agent to read
- No HTML markup in the file, since llms.txt should be plain markdown (HTML tags are flagged as a warning)
- Whether the home page points at the llms.txt with rel="describedby", which v2 recommends
- Whether the home page points at a markdown version with rel="alternate" type="text/markdown", which v2 recommends

The last two report pass or information, never a warning and never a failure.
They describe the site rather than the file, and v2 is two weeks old at the time of
writing, so warning about them would turn valid files into files with warnings for
following the version of the format they were written against.

## What it does not do

This is a structure check against the llms.txt format, not an
agent-readiness score. A full audit measures discoverability, content accessibility,
access control and more: see [services](/services),
or start with [llms.txt explained](/guides/llms-txt).

Two documents are fetched from the target site, its /llms.txt and its home
page, each following a redirect to the same host or its www twin when there is
one. Nothing else is requested and the site is never crawled. Agents can call
this with Accept: application/json.

All free tools on this site are collected on [the tools page](/tools).

## Frequently asked

**What is llms.txt?**

llms.txt is a plain text file that tells AI agents what a site contains and where the important content lives. It sits at the root of a site or at any path inside it, where it covers the pages under that path. It opens with the site name and a short summary, then lists the key pages as markdown links grouped under headings. This validator checks that structure.

**What does the validator check?**

Eight structural checks: the file exists at /llms.txt and returns HTTP 200, the response is plain text rather than an HTML error page, the file starts with an H1 title, the recommended blockquote summary follows it, H2 sections group the content, markdown links parse and use absolute URLs, the file stays small enough to be cheap for an agent to read, and the file carries no inline HTML, since llms.txt should be plain markdown. Two further checks read the site's home page for the link relations v2 recommends, rel="describedby" to the llms.txt and rel="alternate" type="text/markdown" to a markdown version, and both are reported as information rather than as a warning.

**Why is there no score?**

Deliberately. Eight structural checks can honestly report pass, warn or fail, and a number stacked on top of them would look like an agent-readiness score without measuring one. Agent readiness is measured with an independent public scanner, published security scans and a manual review, which is the paid audit rather than this free check.

**How does an agent call the validator?**

GET https://turva.dev/llms-txt-validator?url=example.com with an Accept: application/json header returns the same checks as JSON. Two documents are fetched from the target site, its /llms.txt and its home page, each following a redirect to the same host or its www twin when there is one, and the response carries a no-store header.

**Does the validator store anything?**

No. What is fetched is checked and discarded, the result goes back with a no-store header, and there is no signup. The validator reads two documents, the llms.txt file and the home page, each following a redirect to the same host or its www twin when there is one, and never crawls the rest of the site.

**Can I run the checks in CI?**

Yes. The same checks are published as an open npm package, turva-llms-txt-validator, with a llms-txt-validate command whose --json output matches this page's JSON exactly. One line in a pipeline, npx turva-llms-txt-validator your-domain.com --strict, fails the build when the file breaks. The two v2 checks never fail that build, since they are reported as information.

## Related

- [llms.txt explained](/guides/llms-txt)
- [Serving markdown to agents](/guides/markdown-for-agents)
- [Free tools for agent-readiness](/tools)
`,

  "/tools": `# Free tools for agent-readiness

Three tools this site publishes for anyone to use: an llms.txt validator, an embeddable agent-ready badge and a public read-only MCP server. All free, no signup, and each one works for an agent as well as for a person.

## llms.txt validator

Checks a site's /llms.txt structure against the format and reports each check as pass, warn or fail, plus two v2 link relation checks that read pass or info and never move the summary. Nothing is stored. An agent gets the same result as JSON by calling the same URL with an Accept: application/json header.

Open it at [turva.dev/llms-txt-validator](/llms-txt-validator), or [run it against this site's own file](/llms-txt-validator?url=turva.dev) without typing anything.

The same checks run in CI as an open npm package, [turva-llms-txt-validator](https://www.npmjs.com/package/turva-llms-txt-validator), with a CLI and the same JSON shape. Source on [GitHub](https://github.com/erekola/llms-txt-validator).

## The agent-ready badge

A small SVG badge a site can embed to show it meets public agent-readiness criteria, linking back to the criteria page. It is a self-declared claim and checkable by design: anyone can run the same public scanner against the displaying site at any time.

Criteria and embed instructions at [turva.dev/badge](/badge).

## Public MCP server

A read-only Model Context Protocol server at mcp.turva.dev/mcp over streamable HTTP. It exposes the service catalog and pricing, turva.dev's own agent-readiness score, the published web-security scan results and the engagement principles. No authentication, and its server card is published at /.well-known/mcp/server-card.json.

## Where to go next

These tools cover the same surfaces an agent-readiness audit measures. The audit itself, with fixed prices, is on the services page. See [services](/services).

## Related

- [llms.txt validator](/llms-txt-validator)
- [The agent-ready badge](/badge)
- [MCP server cards explained](/guides/mcp-server-card)
`,

  "/badge": `# The agent-ready badge

A small SVG badge a site can embed to show it meets public
agent-readiness criteria, linking back to this page. The badge is
served from turva.dev, the criteria are listed below, and anyone can
re-check the claim by running the same public scanner.

## Who may display it

- Sites that have completed a turva.dev agent-readiness audit
- Sites that score 100/100 on a public agent-readiness scanner (isitagentready.com)

## What it is, and what it is not

The badge is a self-declared claim against public criteria, not a
certification. turva.dev does not police its use. The value of the
badge is that the claim is checkable: the scanner can be run
against the displaying site by anyone, at any time.

## How to embed it

Copy this HTML where you want the badge to appear:

    <a href="https://turva.dev/badge"><img src="https://turva.dev/badge.svg" alt="agent-ready. Criteria at turva.dev/badge" width="216" height="36" loading="lazy"></a>

The image is 216 by 36 pixels, dark background, under one kilobyte.

## If your site is not there yet

An audit measures where you stand and lists what to fix first.
Services and prices are on the [services page](/services). Email
<mailto:info@turva.dev> and you get a reply within one business day.

All free tools on this site are collected on [the tools page](/tools).
`,

  "/blog": `# Notes on AI agents and agent-readiness

The work here is letting an agent read a site and act on a system safely. Each entry is dated, and anything that can be measured is checked against an independent scanner rather than asserted.

## Start here

- [Website agent readiness, measured on 567 company sites](/blog/website-agent-readiness-567-sites): one scanner over 567 company sites in ten weeks, and what the Level 0 and Level 1 notes say.
- [How agent-ready are Finnish B2B sites? I scanned sixteen](/blog/agent-readiness-finnish-b2b): the July snapshot the larger scan grew out of.
- [I scanned fourteen code hosts. Not one served an MCP server card.](/blog/agent-readiness-code-hosts): the same measurement on the platforms developers use every day.

## All posts

- [What 19 identity vendors publish for agents](/blog/agent-readiness-identity-vendors). 2026-09-05.
- [Two files called auth.md, and they disagree on the field names](/blog/two-auth-md-dialects). 2026-09-04.
- [Thirty days after the brief: 210 sites rescanned, four moved](/blog/thirty-days-after-the-brief). 2026-09-03.
- [What four AI assistants call an agent readiness audit](/blog/what-ai-assistants-call-an-agent-readiness-audit). 2026-09-03.
- [Website agent readiness, measured on 567 company sites](/blog/website-agent-readiness-567-sites). 2026-09-03.
- [TRACE signs how an agent ran, not what it was allowed to reach](/blog/trace-runtime-attestation). 2026-08-30.
- [I scanned fourteen code hosts. Not one served an MCP server card.](/blog/agent-readiness-code-hosts). 2026-08-22.
- [It would be cheating to keep the old price](/blog/cheating-to-keep-the-old-price). 2026-08-21.
- [I thought it was a small job](/blog/i-thought-it-was-a-small-job). 2026-08-16.
- [My gate could not see a sixth](/blog/my-gate-could-not-see-a-sixth). 2026-08-04.
- [A red reading that measured my own client](/blog/red-reading-that-measured-my-own-client). 2026-07-30.
- [The checks that pass for the wrong reason](/blog/checks-that-pass-for-the-wrong-reason). 2026-07-29.
- [Finishing the optional commerce checks](/blog/finishing-the-optional-commerce-checks). 2026-07-20.
- [The twin is the page](/blog/the-twin-is-the-page). 2026-07-19.
- [Every response promised a rate limit. Nothing enforced it.](/blog/enforcing-the-rate-limit-i-advertised). 2026-07-18.
- [Microsoft said the patches would get bigger. I measured how much bigger.](/blog/measuring-the-ai-patch-surge). 2026-07-15.
- [How to let an AI agent work in your repo without leaking your secrets](/blog/agent-secret-hygiene). 2026-07-12.
- [How agent-ready are Finnish B2B sites? I scanned sixteen](/blog/agent-readiness-finnish-b2b). 2026-07-07.
- [When honesty and the checker disagree](/blog/honesty-and-the-checker). 2026-07-06.
- [Four AI agents re-checked the guides](/blog/re-checking-the-guides). 2026-07-04.
- [The page grew, the agent bill did not](/blog/cheaper-pages-revisited). 2026-07-04.
- [Moving the source from GitHub to Codeberg](/blog/moving-source-to-codeberg). 2026-07-04.
- [A free llms.txt validator](/blog/free-llms-txt-validator). 2026-07-02.
- [Agent access is now a setting](/blog/agent-access-is-now-a-setting). 2026-07-02.
- [Publishing an ai-catalog.json for agentic discovery](/blog/publishing-an-ai-catalog). 2026-06-29.
- [What the Open Knowledge Format is, and what it is not](/blog/open-knowledge-format). 2026-06-27.
- [What an agent pays to read your site](/blog/cheaper-pages-for-agents). 2026-06-26.
- [When an agent can prove it is Claude](/blog/verifiable-agent-identity). 2026-06-25.
- [What makes an AI agent's decisions reliable](/blog/reliable-agent-decisions). 2026-06-22.
- [Owning your fediverse identity](/blog/owning-your-fediverse-identity). 2026-06-21.
- [Moving turva.dev off prerender.io](/blog/moving-off-prerender). 2026-06-20.
`,
  "/blog/agent-access-is-now-a-setting": `# Agent access is now a setting

2026-07-02

On 1 July 2026 Cloudflare shipped its second Content Independence Day package: crawler controls that split search, agent and training bots for every customer, a research program that tells crawlers which pages actually changed, experiments that turn Pay Per Crawl into Pay Per Use, and a waitlist for a gateway that charges for any resource over x402. Read together, they move decisions that used to live in a site's code into the CDN dashboard. That relocation is what matters for agent readiness.

## The edge can undo everything the page does right

A site can serve clean markdown, an llms.txt, structured data and signed manifests, and none of it counts if a network rule turns the crawler away before the request reaches the page. Cloudflare says more than 20% of the web sits behind its network, and the new controls ship with per-crawler block toggles and defaults that change over time. This site's own crawler list turned out to contain seven blocked entries, including the Internet Archive and an AI search engine that pays publishers. However they got there, nothing in the markup shows it. You find it in the dashboard, or when your content stops appearing in answers.

An agent-readiness review therefore has to read the edge configuration next to the content. robots.txt, the WAF and the AI crawler list must say the same thing the content strategy says, and they must keep saying it, because platform defaults move without a deploy.

## Citations are replacing clicks, and both are measurable now

Cloudflare's stated reason for the package is a 2025 Pew Research Center finding: when Google shows an AI summary, users click a traditional result 8% of the time and a link inside the summary about 1% of the time. The visit is no longer where the value moves. Cloudflare's response is to make the citation itself payable. Ceramic.ai pays publishers per query their content answers, You.com lets agents buy individual premium pages, and participating sites get reporting on which AI-search queries surfaced their content, down to the page and the snippet.

The reading this is meant to price is already routine. Over the past seven days this site answered 604 requests from identified AI and search crawlers, and AI answers and search referred 88 human visits (Cloudflare edge data), most from Google, the rest led by Meta, DuckDuckGo and Bing. Whether that reading starts to pay is what the new programs will test.

## Payment rails are becoming configuration

The Monetization Gateway waitlist points the same direction: charge for any page, dataset, API or MCP tool behind Cloudflare, settled over the x402 protocol, with no payment stack of your own. Charging an agent moves from an engineering project to a setting. The honesty bar moves with it. An x402 surface that quotes terms no agent can complete gets found out by the first agent that tries, which is why the x402 endpoint on this site answers HTTP 402 with its real terms instead of a pretend checkout.

## What to check this week

- Open your CDN's AI crawler list and compare it against your intent. A block you did not choose is configuration drift, and it overrides everything your pages declare.
- Re-scan after any edge change. The public agent-readiness scanners read a site from outside, so a network-level block shows up as a dropped score before a buyer sees the gap.
- If your content earns citations, look at the Pay Per Use programs. The reporting alone, which queries put your pages into AI answers, is visibility data you cannot get anywhere else today.

For an agent-readiness audit that reads the edge configuration next to the content, contact info@turva.dev.

## Related

- [What an agent pays to read your site](/blog/cheaper-pages-for-agents)
- [x402 and agent payments](/guides/x402-agent-payments)
- [Sitemaps, robots.txt and agent access](/guides/sitemaps-and-robots-for-agents)
`,
  "/blog/publishing-an-ai-catalog": `# Publishing an ai-catalog.json for agentic discovery

2026-06-29

Google and a Linux Foundation working group published Agentic Resource Discovery in 2026, an open specification for telling agents what a site offers in one machine-readable file at /.well-known/ai-catalog.json. turva.dev now serves one. This is the log of adding it, and of why the change could not move the scanner score either way.

## What the file says

The manifest is a small envelope with a specVersion, a host block, and an entries array. Each entry names one agentic resource with an identifier, a type, a url, and a description. turva.dev publishes four entries, and every one points at a surface that already resolves: the MCP server card, the A2A agent card, the OpenAPI description, and the agent skills index. Nothing in the catalog is aspirational. If a line names a resource, that resource answers.

## Why it is additive

The catalog is a new file and a new route. It does not change a single existing surface, so it cannot lower a score, and because the independent scanner does not check for ai-catalog.json yet, it cannot raise one either. turva.dev already reads Level 5 on isitagentready.com, and it read the same after this change. The point of publishing now is not the number. It is that a Google-backed discovery standard exists, and a site that sells agent-readiness should serve the surface before its buyers ask for it.

## Discovery, not ranking

An ai-catalog.json is easy to misread as another search file. It is not. It indexes the agentic resources a site exposes so an agent can find them and call each one through its own protocol. Google [has said publicly](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) that llms.txt does not affect its search results, and the same holds here. Agent-readiness and search ranking remain different things, and neither should be sold as the other.

## Honest about adoption

In a June 2026 check I ran against their public well-known paths, none of the companies named as contributors to the specification yet served a discoverable ai-catalog.json. The specification is an early draft and adoption is near zero. That is the honest frame for this post. turva.dev is early rather than late, and being early on a verifiable standard is a position worth holding when the work is open source and readable line by line at github.com/erekola/turva-worker.

For an audit of a site's discovery surface, contact info@turva.dev.

## Related

- [Agentic Resource Discovery and ai-catalog.json](/guides/agentic-resource-discovery)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [MCP server cards explained](/guides/mcp-server-card)
`,
  "/blog/open-knowledge-format": `# What the Open Knowledge Format is, and what it is not

2026-06-27

Google Cloud shipped the Open Knowledge Format a couple of weeks ago, and the posts about it are running ahead of the spec. OKF is described as your data models turned into plain markdown that humans and agents can read, with no catalog lock-in and no SDK. Most of that is true. Some of it is sold harder than version 0.1 earns. Here is the honest read.

## What it actually is

OKF represents a body of knowledge as a folder of markdown files. Each file is one concept, with a block of YAML frontmatter and a free-form body. The only required field is type. The rest is optional and open. Concepts link to each other with plain markdown links, so the folder reads as a graph. It is vendor-neutral, a person can read it, and an agent can parse it without a client. Google Cloud published it in June 2026 as version 0.1.

## What it is not

It is not a data-model format, even though that is how it is being pitched. A concept can be a metric, a runbook or an API just as easily as a table, so framing it mainly as a way to draw data models narrows it to the one use that makes a good demo.

It is also not a semantic standard yet. Version 0.1 fixes the shape of the files, the folder, the frontmatter and the one required field. It does not fix what any field means or how two teams should agree on the same names. The spec itself is clear that this is structural interoperability, with the semantic half left to producers and to conventions that do not exist yet. A shared folder layout is real progress. It is not the same as a shared meaning, and that gap is the whole reason these formats are hard.

## Why it still matters

The instinct behind OKF is the right one. It wants plain text an agent can read, owned by you, with no service sitting in the middle. It is the same move as serving markdown to agents and publishing an llms.txt, applied to the knowledge behind a site rather than the pages on it. Formalizing that pattern into something portable is useful even at version 0.1, because the alternative is every team inventing its own folder of context files and none of them agreeing.

## How it relates to what I do

An agent-readiness audit asks whether an agent can read your public site. OKF is one layer in from that, the format of the data and context the agent works from once it is inside. The two belong together, and I expect the second to matter more over time, but they are not the same thing and I will not pretend a readiness score measures one by measuring the other.

For now OKF is worth understanding and worth watching. It is early to rebuild a knowledge catalog around it. If you already serve clean text to agents, you are most of the way there already.

For an audit of how legibly AI agents read your site and the data behind it, contact info@turva.dev.

## Related

- [Serving markdown to agents](/guides/markdown-for-agents)
- [Agentic Resource Discovery and ai-catalog.json](/guides/agentic-resource-discovery)
- [llms.txt explained](/guides/llms-txt)
`,
  "/blog/cheaper-pages-for-agents": `# What an agent pays to read your site

2026-06-26

When an AI agent visits your site to check a price or finish a task for someone, it pays to read the page. That cost is counted in tokens, and a normal HTML page is expensive. Navigation, styling, scripts and structured data all arrive whether the agent needs them or not. The agent either spends its budget getting past that markup or runs out of room and reads only part of the page. Both outcomes are yours to deal with, because they decide whether the agent gets your facts right.

## Your surface sets the cost

Most advice about agent token cost is aimed at the people building agents. Cache the prompt, route easy work to a cheaper model. That is real, but it misses the half of the bill that the publisher controls. If your page is heavy, every agent that reads it pays for that weight, on every visit. You cannot tune someone else's model, but you can decide how much your own content costs to read.

## The same page, served as clean text

The mechanism is content negotiation. The site keeps serving its normal HTML to browsers, and when an agent asks for the markdown form of a page it gets the same content with the markup stripped out. Nothing is hidden and nothing is duplicated. One URL answers in the format the client asked for.

On turva.dev the homepage as markdown costs roughly a third of the HTML, a couple of thousand tokens against several thousand. An llms.txt sits alongside it as a map of the whole site, so an agent can read the structure in one request instead of crawling it page by page.

## What it buys you

A cheaper page is a more reliable one. When the content fits comfortably inside the agent's budget, the agent reads all of it instead of stopping halfway, so it quotes your real price and your real terms rather than a guess. For anything that ends in a transaction, that is the difference between a completed action and a wrong one.

It also widens who can reach you. The assistants that answer questions and cite sources read better from clean text, so your pages are more likely to be used in full and represented accurately. The work an agent does against your site gets cheaper for whoever runs it, which makes you the easier site to integrate with when an agent is choosing where to act.

The benefit is measurable. An independent scanner checks for markdown content negotiation and for an llms.txt, and the result shows up as a higher score in the categories that name it. You do not take the improvement on faith. You read the number before the change and after it.

## A small change that lasts

None of this is a rebuild. It is a small piece of code at the edge that picks the response format from the request header, and it keeps working as the site grows. The Worker that does it on turva.dev is public, so you can read exactly what it does before deciding whether it belongs on your own site.

For an audit of how cheaply agents can read your site, contact info@turva.dev.

## Frequently asked

**Why does a normal HTML page cost an agent more to read?**

Navigation, styling, scripts and structured data all arrive whether the agent needs them or not. The agent either spends its budget getting past that markup or runs out of room and reads only part of the page.

**How much cheaper is a markdown version of a page?**

On this site the homepage as markdown costs roughly a third of the HTML, a couple of thousand tokens against several thousand. An llms.txt sits alongside it, so an agent can read the structure of the site in one request instead of crawling it page by page.

**Does serving markdown mean duplicating the site?**

No. It is content negotiation. The site keeps serving HTML to browsers, and when an agent asks for the markdown form of a page it gets the same content with the markup stripped out. One URL answers in the format the client asked for.

## Related

- [Serving markdown to agents](/guides/markdown-for-agents)
- [Response headers that help agents](/guides/response-headers-for-agents)
- [The page grew, the agent bill did not](/blog/cheaper-pages-revisited)
`,
  "/blog/verifiable-agent-identity": `# When an agent can prove it is Claude

2026-06-25

A site that wants to let an AI agent act has a problem it rarely says out loud. It cannot tell which agent is actually at the door. A user-agent string is just text, and anything can send it. An IP range drifts as providers move their infrastructure around. So the site guesses, and the guess collapses into one of two bad defaults. Block too much, and the helpful agent never reaches the page. Trust too much, and anything wearing the right header walks straight in.

## What the tag actually is

Web Bot Auth is the piece that removes the guess. It comes from active work at the IETF and is already in production at Cloudflare, and it lets an agent prove who it is on every request. The agent generates a signing key and publishes the public half at a fixed location, /.well-known/http-message-signatures-directory. It then signs each request it sends. The receiving site, or Cloudflare at its edge, checks that signature against the published key. A match is a verifiable claim about the sender. Copying the header does not reproduce it, because only the holder of the private key can sign.

Cloudflare calls the end-user-directed form of this a signed agent, and opened the program in August 2025 with a first cohort: ChatGPT agent, Goose, Browserbase, and Anchor Browser. The list lives in the public bots and agents directory on Cloudflare Radar, readable by anyone, customer or not. That public directory is the part that matters to me, because it makes the identity checkable by a third party instead of asserted by the agent itself.

## Where Claude stands today

Claude is not on the signed list yet, and the gap is not academic. A site that switches on Cloudflare's Block AI Bots rule can, right now, block Claude's own request to a server it was asked to reach. Operators have run into exactly that and had to add a manual exception to let Claude back through, which is why there is an open request to register Claude as a verified bot.

I am writing this ahead of the fact rather than after it, because the mechanism is live and the direction is set. The day Claude carries a signed identity, the request a site has to guess about today becomes one it can verify in a millisecond at the edge. Nothing else about the site has to change for that to pay off.

## Why this lands on my desk

An agent-readiness audit has mostly answered one question: can an agent read this site. Verifiable identity adds the other half. Can the site tell which agent is reading, and admit it on purpose. The two questions are different, and the second one is where most marketing sites have nothing in place at all.

The concrete uses are easy to name. Validate Web Bot Auth signatures at the edge instead of pattern-matching user-agent strings that anyone can fake. Base allow rules on the public directory rather than on IP lists kept by hand. The decision envelope, the set of actions an agent is permitted to take, should then turn on a verified identity rather than on an unverified claim. A site built this way can open a real capability to a known agent and keep it closed to everything else, without falling back on the blunt switch that blocks every bot at once.

## The honest version

None of this is live for Claude on the day I publish this, and I will not write as though it were. The directory is public for a reason. Check it, and admit what it actually says rather than what a vendor page claims. When the entry appears, the work on the receiving side is already done, and the audit has a new line that can be measured rather than asserted.

For an agent-readiness audit that covers how your site recognizes and admits AI agents, contact info@turva.dev.

## Frequently asked

**How can a site tell which AI agent is at the door?**

With Web Bot Auth. The agent publishes the public half of a signing key at a fixed location and signs every request it sends, and the site or its edge checks that signature against the published key. Copying the header does not reproduce it.

**Why is a user-agent string not enough to identify an agent?**

It is just text, and anything can send it. An IP range drifts as providers move their infrastructure around. The site is left guessing, and the guess collapses into blocking too much or trusting too much.

**Can a block-all bot rule block an agent the user asked for?**

Yes. A site that switches on a rule that blocks AI bots can block a request that a person asked an agent to make, and operators have had to add a manual exception by hand to let it through.

## Related

- [How agents authenticate](/guides/agent-authentication)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [What agents.json is](/guides/agents-json)
`,
  "/blog/reliable-agent-decisions": `# What makes an AI agent's decisions reliable

2026-06-22

In the audits I have run, including this site's own, one thing keeps surfacing. An agent that is instructed well, and given the right settings and checks, can take in data and make the decision the rules call for, consistently. The capability is real, and it is wider than most of the conversation around it. The limits are rarely the model. They sit in two places that are easy to overlook.

## A decision is only as good as its inputs

The decision an agent reaches is bounded by the data that reaches the agent. In a clean datacenter that is invisible, so it gets ignored. Move the same agent to where the work actually happens and it becomes the whole problem. A link drops as a crane passes over it. A satellite hop adds the better part of a second. One lost packet stalls every packet queued behind it, and the agent waits on stale input while the moment it needed to act goes by.

The agent did not get worse. Its inputs did. Most of the reliability of an autonomous decision lives in the unglamorous layer below the model, where data either arrives in order and on time or it does not. A site or a system that wants an agent to act on live data has to earn that layer first.

## The right decision is the one the settings allow

A correct decision is not an agent doing whatever it infers. It is an agent acting inside an envelope that was defined for it. The settings are the decision, made ahead of time by a person who knew the stakes. Draw the envelope loosely and a capable agent will still do something, just not the thing you wanted. Draw it well and the same agent is one you can leave alone.

This is the part that gets skipped when people picture autonomy. They imagine judgment appearing from nowhere. In practice the judgment is front-loaded into permissions and thresholds, and into an explicit list of what the agent may touch and what it may not. Good autonomy looks less like a clever model and more like a well-set boundary.

## The hardest case is where no one can step in

The clearest test of all this is the environment where a person cannot be in the loop. Distance and latency, with help too far away to matter in the seconds that count. When the round trip to a human is longer than the decision can wait, the decision has to be made locally, under rules agreed in advance.

The fields that operate in those conditions worked this out first, because they had no choice. They learned to package a human expert's judgment into something a machine could carry to the far end and apply without asking. That discipline used to look exotic. It is now the same thing any team needs before it lets an agent act on a system that matters.

## The point is not to remove the person

Autonomy is not the absence of people. The strongest setups take an expert's judgment and place it where the work is, then let the machine handle the parts that have to be instant or exact. The person sees what the agent sees and acts through the same channel, and the agent extends their reach instead of standing in for them.

This is why I have stopped describing my work as only agent-readiness. Reading a site is the first step, the precondition for everything after it. What an agent can actually do once the inputs are clean and the envelope is set, with a person kept where judgment belongs, is the rest of the distance. That is the work I am moving toward.

For an agent-readiness audit, or a conversation about letting agents act on your systems safely, contact info@turva.dev.

## Frequently asked

**What limits the reliability of an AI agent's decisions?**

Rarely the model. Two things sit below it. The data that reaches the agent, and the envelope of settings it is allowed to act inside. A decision is bounded by its inputs, and a correct decision is the one the settings allowed.

**Why does the network layer decide whether an agent can act?**

A link drops as a crane passes over it, a satellite hop adds the better part of a second, and one lost packet stalls every packet queued behind it. The agent waits on stale input while the moment to act goes by.

**What does good autonomy look like in practice?**

A well-set boundary rather than a clever model. The judgment is front-loaded into permissions, thresholds and an explicit list of what the agent may touch. Draw the envelope loosely and a capable agent still does something, just not what you wanted.

## Related

- [Letting agents act on data](/guides/letting-agents-act-on-data)
- [AI agent use cases](/guides/ai-agent-use-cases)
- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
`,
  "/blog/owning-your-fediverse-identity": `# Owning your fediverse identity

2026-06-21

turva.dev runs on one rule: own the surfaces that carry your value, do not rent them. That rule moved the homepage off a third-party renderer, and it applies to identity too. My fediverse handle is now [@erik@turva.dev](https://social.turva.dev/@erik), on infrastructure I control, not a username on someone else's server.

## Why the handle matters

A platform handle is a dependency. If the server you joined changes its rules, slows down, or shuts off, your identity and your followers are stuck on it. The same logic that says frontier model access is not a moat says a platform username is not an identity. The address people use to find you should resolve to a domain you own.

## How the split works

Mastodon lets the handle domain and the server domain differ. The account lives at social.turva.dev, but the handle is [@erik@turva.dev](https://social.turva.dev/@erik). For that to work, turva.dev has to answer the discovery requests a remote server makes before it can reach the account.

The Cloudflare Worker that already fronts the apex does this. It redirects the well-known paths the fediverse asks for, host-meta and webfinger and nodeinfo, to the instance. Everything else the apex serves stays exactly as it was: the guides, the markdown, the agent manifests, the structured data. The same Worker that makes the site legible to agents now also carries the identity.

## Verified, not asserted

The profile links to turva.dev, and turva.dev links back to the profile with a rel="me" relation. Mastodon checks both directions and marks the link verified. It is the same standard as the rest of the site. The claim is checkable rather than taken on trust.

## The principle

Identity is infrastructure. If it lives on a domain you own, you can change servers, change hosts, or self-host later without changing your address or losing your followers. Renting the frontier is fine. Renting your name is not.

Find me on the fediverse at [@erik@turva.dev](https://social.turva.dev/@erik). For an agent-readiness audit, contact info@turva.dev.

## Related

- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [How agents authenticate](/guides/agent-authentication)
- [What agents.json is](/guides/agents-json)
`,
  "/samples/audit-report": `# Sample audit report: Northwind Fasteners Oy

2026-09-08

This is a synthetic sample of the agent-readiness audit report. The company, the domain northwind-fasteners.example, every reading and every date are invented to show the format, the depth and the wording a paying client receives. Nothing on this page describes a real client, and no figure here has been measured on a real site. A real report carries the raw scanner output and the request logs as an appendix, which this sample leaves out.

## Contents

- [Engagement record](#engagement-record)
- [Summary](#summary)
- [Scope and method](#scope-and-method)
- [Scanner readings, check by check](#scanner-readings-check-by-check)
- [Manual review](#manual-review)
- [AI visibility today](#ai-visibility-today)
- [Published security scans](#published-security-scans)
- [Findings, in fix order](#findings-in-fix-order), F1 to F8
- [Fix order and effort](#fix-order-and-effort)
- [What happens next](#what-happens-next)
- [What this report is not](#what-this-report-is-not)

## Engagement record

| Field | Value |
| --- | --- |
| Client | Northwind Fasteners Oy, industrial fastener wholesaler, invented |
| Surface audited | The public site northwind-fasteners.example and its REST API at /wp-json/ |
| Kickoff, scope agreed in writing | 2026-08-25 |
| Scanner run | 2026-09-03, isitagentready.com, default profile, three serial runs, all three identical |
| Manual review | 2026-09-03 and 2026-09-04 |
| AI visibility run | 2026-09-04, 15 questions to four assistants, one anonymous run per question |
| Report delivered | 2026-09-08, fourteen days after the kickoff |
| Written follow-up round | Open until 2026-09-22 |
| Re-scan | One, included, within 30 days of the report, by 2026-10-08, on the day the company names |
| Access used | Public surfaces only. No login, no credentials, no code repository |

## Summary

The site reads Level 1 of 5 on isitagentready.com, with 2 of the 21 scored checks passing. The two that pass are robots.txt and sitemap.xml, and both exist because the content management system ships them. Everything an agent would use on purpose is missing: no markdown form of any page, no llms.txt, no Link relations, no discovery file for the REST API that already runs, and no named rules for AI crawlers.

The most expensive finding scores no points at all. Every one of the 138 product pages publishes structured data with a price of 0,00 EUR and an availability of InStock, while the visible page shows a real price and, for 41 products, a six week lead time. An agent that trusts the data tells a buyer the whole catalog is free and in stock. This is fixed first, before anything that moves the score.

The eight findings below flip six scored checks and correct two findings outside the scored set. Seven of the eight are edge or configuration work of about one working day in total. The eighth is a decision to leave the five commerce checks red on purpose, because a commerce declaration that points at a checkout an agent cannot complete would be a false claim.

The report names the checks it moves, not a level it promises. The level moves with the check set the scanner runs on the day, and 22 checks were in the set on 2026-09-03.

## Scope and method

What was measured, in this order.

- The independent scanner. isitagentready.com was run three times in series against the origin with the default profile, and the three runs agreed. The denominator on the day was 22 checks, 21 scored and one informational, webBotAuth. Every check is recorded below individually rather than as one headline number.
- A manual review of what the scanner does not score. JSON-LD on the home page, one category page and five product pages. Head metadata and Open Graph on the same seven pages. HTTP response headers on the home page and one product page. The /.well-known/ directory. robots.txt, sitemap.xml, ai.txt and llms.txt against the current norms. The first response of each page fetched as a bot, to see whether the content arrives or a script shell does.
- AI visibility today. A fixed set of 15 questions, 12 that describe the category without naming the company and 3 that name it, put once to four AI assistants in anonymous sessions on 2026-09-04. Recorded per answer: whether the company is named, whether the answer is correct where it names it and which sources the assistant cites.
- Published security scans. internet.nl website and mail tests and Hardenize, run on 2026-09-04, so the report rests on measurements the client can re-run without turva.dev.

What was not measured. No code was read, no credentials were used, no penetration test was run and no traffic analytics were seen. The REST API was read through its public routes only. Rankings on any AI platform were not measured and are not promised anywhere in this report.

## Scanner readings, check by check

isitagentready.com on 2026-09-03. PASS and FAIL are the scanner's words. INFO marks the one check the scanner reports without scoring. The fix column points at the finding that moves the check, or says why the check stays as it is.

| Category | Check | Reading | What the scanner saw | Fix |
| --- | --- | --- | --- | --- |
| Discoverability | robotsTxt | PASS | /robots.txt exists and parses. One wildcard group. | F5 changes its content, the check stays green |
| Discoverability | sitemap | PASS | /sitemap.xml exists and parses, 14 URLs. | F4, a manual finding, the check stays green |
| Discoverability | linkHeaders | FAIL | No Link header on any response. | F3 |
| Discoverability | dnsAid | FAIL | No _index._agents record under the domain, DNSSEC not enabled. | F7 |
| Content | markdownNegotiation | FAIL | Accept: text/markdown returns text/html, 212 kB on the home page. | F2 |
| Bot access control | robotsTxtAiRules | FAIL | No AI crawler named in robots.txt. | F5 |
| Bot access control | contentSignals | FAIL | No Content-Signal line in robots.txt. | F5 |
| Bot access control | webBotAuth | INFO | No Web Bot Auth directory. Informational, not scored. | None. The company operates no bots that would sign requests |
| API, auth, MCP and A2A | apiCatalog | FAIL | /.well-known/api-catalog returns the HTML 404 page. | F6 |
| API, auth, MCP and A2A | oauthDiscovery | FAIL | No /.well-known/oauth-authorization-server or openid-configuration. | Waits, see F6 |
| API, auth, MCP and A2A | oauthProtectedResource | FAIL | No /.well-known/oauth-protected-resource. | Waits, see F6 |
| API, auth, MCP and A2A | authMd | FAIL | No /auth.md and no agent_auth metadata. | Waits, see F6 |
| API, auth, MCP and A2A | mcpServerCard | FAIL | No /.well-known/mcp/server-card.json. | Waits, see F6 |
| API, auth, MCP and A2A | a2aAgentCard | FAIL | No /.well-known/agent-card.json. | Waits, see F6 |
| API, auth, MCP and A2A | agentSkills | FAIL | No /.well-known/agent-skills/index.json. | Waits, see F6 |
| API, auth, MCP and A2A | webMcp | FAIL | No navigator.modelContext tools on the home page. | Waits, see F6 |
| API, auth, MCP and A2A | ard | FAIL | No capability manifest at the well-known path. | Waits, see F6 |
| Commerce | x402 | FAIL | No 402 challenge on any route. | Stays red on purpose, F8 |
| Commerce | mpp | FAIL | No payment discovery document. | Stays red on purpose, F8 |
| Commerce | ucp | FAIL | No /.well-known/ucp. | Stays red on purpose, F8 |
| Commerce | acp | FAIL | No ACP discovery document. | Stays red on purpose, F8 |
| Commerce | ap2 | FAIL | No AP2 declaration. | Stays red on purpose, F8 |

Category totals: Discoverability 2 of 4, Content 0 of 1, Bot access control 0 of 2, API, auth, MCP and A2A 0 of 9, Commerce 0 of 5. Overall 2 of 21 scored checks, Level 1 of 5.

After the seven fixes below: Discoverability 4 of 4, Content 1 of 1, Bot access control 2 of 2, API, auth, MCP and A2A 1 of 9, Commerce 0 of 5. Overall 8 of 21, and the report does not translate that into a level, because the level on the retest day depends on the check set the scanner runs that day.

## Manual review

The surfaces the scanner does not score, read by hand on 2026-09-03 and 2026-09-04.

| Surface | Reading | Finding |
| --- | --- | --- |
| First response as a bot | Every page returns its full HTML on the first response. No script shell, no prerender. | No finding. The content is there, it is only expensive to read. |
| JSON-LD, product pages | Product node on all 138 pages: price 0.00, priceCurrency EUR, availability InStock. | F1 |
| JSON-LD, home and category pages | Organization node with name and logo, no address, no taxID, no sameAs. WebSite node present. No BreadcrumbList. | Recorded, no fix in this round. Completeness, not correctness. |
| Head metadata and Open Graph | Title and description present on all seven pages read. og:image missing on the five product pages. | Recorded, no fix in this round. |
| HTTP response headers | Content-Type correct. No Link, no RateLimit-Policy, no security headers except HSTS. | F3 adds the Link relations. Security headers are in the internet.nl reading below. |
| /.well-known/ | Empty. Every path under it returns the HTML 404 page with status 200. | F3, F6 and F7 populate it. The soft 404 is F6's first line. |
| robots.txt | The CMS default. One wildcard group, Disallow: /wp-admin/, no Sitemap line, no AI crawler, no Content-Signal. | F5 |
| sitemap.xml | 14 URLs. The front page, eleven content pages and two template pages titled Sample Page and Privacy Policy Draft. No product page. | F4 |
| ai.txt and llms.txt | Neither exists. | F3 publishes llms.txt. ai.txt is not published: the norm it followed has merged into robots.txt Content Signals. |
| REST API | /wp-json/wc/store/v1/products answers publicly with the catalog, price fields empty, purchasable true. | F1 corrects the data, F6 declares the API. |

## AI visibility today

Fifteen questions, four assistants, one anonymous run per question on 2026-09-04, 60 answers in all. The question set is fixed so that the same run can be repeated after the fixes and the two runs compared.

| Question group | Questions | Answers | Northwind named | Correct where named | What the assistants did instead |
| --- | --- | --- | --- | --- | --- |
| Category, no company name. "Where can a Finnish workshop buy DIN 933 bolts in bulk online" and eleven like it | 12 | 48 | 0 | Not applicable | Named three national distributors and two marketplaces. Two answers cited a competitor's price list page as markdown. |
| Company by name. "What does Northwind Fasteners sell" and two like it | 3 | 12 | 12 | 9 | Two answers gave a Tampere address the company left in 2023. One answer said the catalog is free, citing the structured data F1 corrects. |

What this measures. Whether an assistant names the company when a buyer describes the need, and whether it gets the facts right when it does. It does not measure ranking, and nothing in this report predicts how the run reads after the fixes. The same 15 questions are run again at the retest, and the two tables are printed side by side.

## Published security scans

Run on 2026-09-04, recorded so that the client can re-run them without turva.dev.

| Scan | Reading | What it means for agents |
| --- | --- | --- |
| internet.nl website test | 64 of 100. IPv6 absent, DNSSEC absent, HTTPS configuration passes, security headers partial. | DNSSEC is a prerequisite of the dnsAid check, so F7 moves this reading too. |
| internet.nl mail test | 55 of 100. SPF present, DKIM present, DMARC policy none. | Not an agent surface. Recorded because a buyer checks it. |
| Hardenize | 17 of 24 categories passed. CAA, DNSSEC, HSTS preload, CSP, Referrer-Policy, security.txt and cookies did not. | security.txt is a five line file the same edge worker serves. It is listed under F3 as a same-day addition. |

## Findings, in fix order

Eight findings. Each carries the evidence as read, what it costs the company, the change, who does it and roughly how long, and the test that proves it done. The order is by impact on a buyer first and on the score second, and the effort figures are estimates scoped to these findings, not a quote.

## F1. Every product page publishes a price of 0 and an availability of InStock

**Category.** Structured data. Manual review, not scored.

**Evidence.** GET /products/din-933-m12x40-a2/ on 2026-09-03 returns a JSON-LD Product node with "price": "0.00", "priceCurrency": "EUR" and "availability": "https://schema.org/InStock". The visible page shows 0,42 EUR per piece and a lead time of six weeks. The same node shape appears on all 138 product pages, checked by fetching every product URL from the REST API and reading the price field of each. The API itself, /wp-json/wc/store/v1/products, returns "price": "" and "is_purchasable": true for the same products.

**Impact.** No scanner points, and the highest impact in this report. An agent that trusts the structured data tells a buyer the whole catalog is free and in stock, and one of the 12 by-name answers on 2026-09-04 already did. Wrong data is worse than missing data: missing data makes an agent guess, wrong data makes it confident.

**Change.** Feed the Product node from the same price and stock fields the page renders, and map the six week lead time to a PreOrder or BackOrder availability instead of InStock. This is a data mapping in the catalog plugin, not new markup. Until it is fixed, removing the price and availability fields is the safer state, and that removal is a one line template change the company can make the same day.

**Owner and effort.** The surface belongs to the company's web agency, which owns the catalog plugin configuration, and the permanent fix is theirs: about two hours. If turva.dev implements the list, the two fields are corrected at the edge on the way through, from the same price and stock fields the page renders, so the served data is right from the day the worker goes live, and the plugin mapping is still corrected by the agency for the origin itself. The report names both and the acceptance test covers both.

**Acceptance test.** Read the JSON-LD of any product page next to the page. The price and the availability match what the page shows. Repeat for three products with a lead time. No scanner check flips, and the manual review closes.

**Guide.** [JSON-LD and structured data for agents](/guides/json-ld-structured-data).

## F2. Serve markdown next to HTML

**Category.** Content accessibility. Scored check markdownNegotiation.

**Evidence.** GET / with Accept: text/markdown on 2026-09-03 returns Content-Type text/html and a 212 kB body. The same request to /products/ and to a product page returns HTML of 340 kB and 188 kB. No .md address exists for any page.

**Impact.** One scored check, and the largest token saving on the site. The home page is 212 kB as HTML and about 9 kB as markdown, so an agent that reads it as HTML spends its budget on markup and truncates the page before the catalog link.

**Change.** Put an edge worker in front of the origin that answers a text/markdown request with the markdown form of the page at the same address, and publishes each page at its .md address as well. The origin is not touched. The worker converts the rendered HTML on the way through and caches the result per URL.

**Owner and effort.** turva.dev or the company's developer, at the edge. About three hours including the cache rules. This is the worker every other edge finding in this report also lives in, so its cost is paid once.

**Acceptance test.** curl -H "Accept: text/markdown" https://northwind-fasteners.example/ returns Content-Type: text/markdown and a body that starts with the page title as a heading. markdownNegotiation reads PASS on the next scan.

**Guide.** [Serving markdown to agents](/guides/markdown-for-agents).

## F3. Publish llms.txt and announce it in the Link header

**Category.** Discoverability. Scored check linkHeaders.

**Evidence.** GET /llms.txt on 2026-09-03 returns the HTML 404 page with status 200. No response on the site carries a Link header. GET /.well-known/security.txt returns the same soft 404.

**Impact.** One scored check, and the file agents fetch first when they want to know what a site is about. Without it an agent has the navigation menu and nothing else, and the navigation menu does not mention the catalog API or the delivery terms.

**Change.** Write /llms.txt by hand: the company name, a four line summary, and the pages that matter grouped as products, delivery terms, technical documents and contact, each as an absolute link to the page's markdown form from F2. Announce it with Link: rel="describedby" on every response and add rel="alternate" type="text/markdown" pointing at the page's own .md twin. Serve /.well-known/security.txt from the same worker with a contact address and an expiry date, which closes one Hardenize category the same day.

**Owner and effort.** turva.dev or the company's developer, at the edge. About 90 minutes. The content of llms.txt is reviewed by the company before it goes live, because it is the company's own description of itself.

**Acceptance test.** linkHeaders reads PASS on the next scan. The free validator at [turva.dev/llms-txt-validator](/llms-txt-validator) reads the file as valid with every link resolving. GET /.well-known/security.txt returns text/plain with status 200.

**Guides.** [llms.txt explained](/guides/llms-txt) and [Response headers that help agents](/guides/response-headers-for-agents).

## F4. The sitemap lists two template pages and misses the catalog

**Category.** Discoverability. Manual review, not scored. The sitemap check passes and stays green.

**Evidence.** GET /sitemap.xml on 2026-09-03 lists 14 URLs: the front page, eleven content pages and two CMS template pages titled Sample Page and Privacy Policy Draft. None of the 138 product URLs is in it. robots.txt carries no Sitemap line, so an agent that starts from robots.txt does not find the sitemap at all.

**Impact.** No scanner points. An agent that follows the rules gets a list of 14 pages to read and never learns that the catalog exists. The two template pages are also indexed by search engines today.

**Change.** Let the catalog plugin generate a product sitemap, reference it from a sitemap index, remove the two template pages from the site or from the sitemap, and add one Sitemap line to robots.txt. Four settings, no code.

**Owner and effort.** The surface belongs to the company's web agency, and the four settings are theirs: about half an hour. If turva.dev implements the list, the edge serves a product sitemap generated from the REST API and a sitemap index in front of the CMS one, and the robots.txt line comes with F5, so the acceptance test passes without waiting for the agency.

**Acceptance test.** The sitemap index references a product sitemap that lists every product URL, no template page appears, and robots.txt names the index. The scored check stays green either way, which is why this is a manual finding.

**Guide.** [Sitemaps, robots.txt and agents](/guides/sitemaps-and-robots-for-agents).

## F5. Name the AI crawlers and declare Content Signals in robots.txt

**Category.** Bot access control. Scored checks robotsTxtAiRules and contentSignals.

**Evidence.** /robots.txt on 2026-09-03 is the CMS default: User-agent: *, Disallow: /wp-admin/, Allow: /wp-admin/admin-ajax.php. No AI crawler is named and no Content-Signal line exists.

**Impact.** Two scored checks. Today the file says nothing about AI agents, so every assistant guesses, and the guess is not always in the site's favour: one assistant on 2026-09-04 declined to cite the site at all and cited a distributor's copy of the same product data instead.

**Change.** Add named groups for the crawlers the company wants to allow, and one Content-Signal line that states search yes, ai-input yes, ai-train no, or whichever preference the company holds. The line is a stated preference and not an enforcement mechanism, and the report says so where it appears. The company decides the preference, the report only records what the file says today.

**Owner and effort.** The company decides, the edge worker serves the file. About half an hour once the preference is decided.

**Acceptance test.** robotsTxtAiRules and contentSignals read PASS on the next scan, and the file names the crawlers the company chose.

**Guide.** [Sitemaps, robots.txt and agents](/guides/sitemaps-and-robots-for-agents).

## F6. Tell agents that the REST API exists

**Category.** API, auth, MCP and A2A. Scored check apiCatalog.

**Evidence.** The site runs a public read-only REST API at /wp-json/ with the product catalog behind it at /wp-json/wc/store/v1/products, and no discovery file names it. GET /.well-known/api-catalog on 2026-09-03 returns the HTML 404 page with status 200, as does every path under /.well-known/. The scanner reads apiCatalog as failing along with the eight other checks in the category.

**Impact.** One scored check now, and the cheapest step in the category. An agent that finds the API reads the catalog as data instead of scraping HTML. The soft 404 under /.well-known/ has a cost of its own: an agent that probes for a manifest receives a 200 with an HTML body and has to parse it to learn there is nothing there.

**Change.** Publish /.well-known/api-catalog, one JSON linkset that names the /wp-json/ base URL and its description, with the content type application/linkset+json. Make every other path under /.well-known/ return a real 404. The other eight checks in the category need an authentication story or an MCP server and are not worth declaring until one exists: a server card that points at no server is a false claim, and this report does not recommend one.

**Owner and effort.** turva.dev or the company's developer, at the edge. About half an hour.

**Acceptance test.** apiCatalog reads PASS on the next scan. The category reads 1 of 9, and the retest report says which eight are left and why they wait. GET /.well-known/nothing returns 404.

**Guide.** [The /.well-known directory for agents](/guides/well-known-for-agents).

## F7. Publish a DNS-AID record once the discovery files exist

**Category.** Discoverability. Scored check dnsAid.

**Evidence.** No _index._agents HTTPS record exists under northwind-fasteners.example, and DNSSEC is not enabled at the registrar, which internet.nl also reports.

**Impact.** One scored check. This is the check that needs the company's DNS rather than the edge worker, which is why it is last among the scored fixes. DNSSEC also moves the internet.nl website reading.

**Change.** After the files above are live, add the _index._agents HTTPS record pointing at the site and enable DNSSEC at the registrar. Both are DNS changes the company's own IT does, and the report carries the exact record in its appendix.

**Owner and effort.** The surface belongs to the company's IT, at the registrar. About half an hour, plus the DNSSEC propagation wait. If turva.dev implements the list, the access arranged in writing before the work covers the DNS zone as well, and both records are added from the exact text in the appendix. Without that access this is the one item that stays with the company, and the report says so before the work starts.

**Acceptance test.** dnsAid reads PASS on the next scan, once DNSSEC validates. internet.nl website test shows DNSSEC as passing.

**Guide.** [The /.well-known directory for agents](/guides/well-known-for-agents), which covers the discovery index the record points at.

## F8. Declare no agent commerce surface until a checkout can back it

**Category.** Commerce. Scored checks x402, mpp, ucp, acp and ap2.

**Evidence.** The store checks out through a browser form with a card payment page. None of the five agent commerce surfaces the scanner reads is declared: an x402 payment challenge, an MPP payment discovery document, a UCP profile, an ACP discovery document or an AP2 declaration. All five commerce checks read FAIL.

**Impact.** Five scored checks, and none of them is worth flipping this quarter. A commerce declaration that points at a checkout an agent cannot complete is a false claim, and the scanner cannot tell the difference between a declaration and a working checkout.

**Change.** No change now. When the company decides that agents may buy, the first honest step is an ACP discovery document whose checkout session returns not_ready_for_payment with a message, which is real and scores. Everything else follows a payment decision, not a readiness one.

**Owner and effort.** The company's management, as a decision. No hours in this round.

**Acceptance test.** The five checks stay red on the next scan, on purpose, and the retest report repeats this entry so that nobody reads the red as an oversight.

**Guides.** [Agent commerce discovery](/guides/agent-commerce-discovery) and [Agentic commerce readiness](/guides/agentic-commerce-readiness).

## Fix order and effort

| Order | Finding | Checks moved | Owner | Effort estimate |
| --- | --- | --- | --- | --- |
| 1 | F1 structured data | None, manual | Web agency owns the plugin. Edge corrects the served fields | 2 hours |
| 2 | F2 markdown | markdownNegotiation | Edge | 3 hours |
| 3 | F3 llms.txt, Link header, security.txt | linkHeaders | Edge, content reviewed by the company | 90 minutes |
| 4 | F4 sitemap content | None, manual | Web agency owns the settings. Edge serves the product sitemap | Half an hour |
| 5 | F5 robots.txt | robotsTxtAiRules, contentSignals | Company decides, edge serves | Half an hour |
| 6 | F6 api-catalog and real 404s | apiCatalog | Edge | Half an hour |
| 7 | F7 DNS-AID and DNSSEC | dnsAid | Company IT owns the zone. Done with DNS access arranged | Half an hour plus propagation |
| 8 | F8 commerce | None, on purpose | Management decision | 0 |

Total for F1 to F7: about eight and a half hours, which is the one implementation day the services page describes. The figure is an estimate scoped to these findings.

## What happens next

Three routes, and the report is written so that any of them works.

- The company's team does the work from this report. Every finding carries its change and its acceptance test, and the guides linked above carry the patterns.
- turva.dev implements exactly the fixes this report lists for the fixed price on the services page, bought together with the audit. That price needs an edge runtime in front of the origin where the fixes are applied and the access to deploy there, plus any other access a listed fix needs, here the DNS zone for F7, all arranged in writing before the work starts. With those in place every one of F1 to F7 is implemented for the fixed price: F2, F3, F5 and F6 live in the worker, F1 and F4 are corrected at the edge while the agency fixes the origin, and F7 is done with the DNS access that the written arrangement includes. What the company still does itself is name the crawler preference for F5, review the llms.txt text and let its agency correct the plugin mapping behind F1.
- Nothing is done, and the report stands as a dated record of where the site was on 2026-09-03.

In every case the retest is the same, and it is included in the audit price: once within 30 days of this report, so by 2026-10-08, on the day the company names, the scanner is run again with the same profile, the 15 questions are put to the same four assistants, and the two readings are printed next to the ones above. One round of written follow-up questions is open until 2026-09-22.

## What this report is not

It is not a penetration test, a certification, an SEO audit or a promise of ranking on any AI platform. It reads what the site publishes and records what four assistants said on one day. It does not read the organisation's readiness to adopt agents, which is a different question that often goes by the same name.

## About this sample

Every figure on this page is invented. The check names, the categories and the statuses are the scanner's real vocabulary as it stood on 2026-09-03, so that the sample shows how a real report reads, and the site, the readings, the assistants' answers and the security scores are fiction. A real report carries the raw scanner output, the request and response logs and the 60 AI answers as an appendix.

The audit is described on the [services page](/services). To start one, [email info@turva.dev](mailto:info@turva.dev?subject=Agent-readiness%20audit&body=Site%20or%20API%20URL%3A%20%0AWhat%20the%20audit%20should%20answer%3A%20%0A) with the site or API URL and what the audit should answer. The Shopify agent storefront check has its own [sample report](/samples/shopify-agent-storefront-check).
`,

  "/samples/shopify-agent-storefront-check": `# Sample report: Shopify agent storefront check, Northstar Outdoor

2026-09-08

This is a synthetic sample of the Shopify agent storefront check report. The store Northstar Outdoor, its .myshopify.com domain, the three products, every price and every observation are invented to show the format and the depth a paying merchant receives. Nothing on this page describes a real store, and no figure here has been measured on a real storefront. A real report carries the tool call log and the redacted settings evidence as an appendix, which this sample leaves out.

## Contents

- [Engagement record](#engagement-record)
- [Decision](#decision)
- [Three-surface map](#three-surface-map)
- [Product truth matrix](#product-truth-matrix)
- [Buyer-journey evidence](#buyer-journey-evidence)
- [Correction plan](#correction-plan), C1 to C3
- [Limits and what stays unresolved](#limits-and-what-stays-unresolved)
- [Retest](#retest)
- [What this report is not](#what-this-report-is-not)

## Engagement record

| Field | Value |
| --- | --- |
| Merchant | Northstar Outdoor, invented D2C outdoor equipment store on Shopify |
| Storefront | northstar-outdoor.example, the .myshopify.com domain redacted in this sample |
| Market, language, currency | Finland, fi-FI, EUR |
| Products in scope | Trail Bottle 750 ml, blue. Merino Base Layer, size M. Camp Mug, green |
| Buyer searches in scope | Five, listed under the buyer journey |
| Preflight | 2026-09-04, public read-only. An observable agent commerce surface was found, so the check was sold |
| Written kickoff | 2026-09-05 at 09:00 EEST, after preflight, payment and settings evidence |
| Test session | 2026-09-05, one clean supported Chromium session, one anonymous shopper |
| Package delivered | 2026-09-06 at 15:40 EEST, 30 hours and 40 minutes after the kickoff |
| Retest window | Until 2026-09-20, up to two corrected items |
| Access used | Public storefront surfaces and redacted settings screenshots from the merchant. No Admin login, no credentials, no customer data |

## Decision

Correct two data mismatches before sending more agent traffic to the store. The three agent surfaces were all observable, the browser cart worked in the agreed anonymous session and the checkout handoff landed in the right store. Two of the three tested products showed a difference between surfaces: one price two euros higher on the remote catalog than on the storefront, and one variant marked unavailable on the Agentic preview while the storefront sells it. A documented match is what the merchant is paying to be able to show, and two of three products do not have one yet.

Nothing was paid, ordered or signed in. No customer detail was entered.

## Three-surface map

What is present, restricted, unavailable or not tested on each of the three surfaces, in the same session and against the same three products. PRESENT means the surface answered and was exercised within scope. RESTRICTED means it answered but refused part of the scope. UNAVAILABLE means it did not answer. NOT TESTED means the scope stopped before it.

| Surface | Status | What was verified | What was not |
| --- | --- | --- | --- |
| Browser WebMCP, in the shopper's live storefront tab | PRESENT | Ten tools registered on navigator.modelContext: browse_store, search_catalog, get_product, show_variant, update_cart, get_cart, cancel_cart, proceed_to_checkout, search_shop_policies_and_faqs and manage_orders. Eight were called within scope. One anonymous cart built and emptied. | manage_orders and browse_store were not called, and proceed_to_checkout was called once for the permitted navigation only. No customer account was opened. |
| Shopify-hosted Storefront MCP and UCP MCP | PRESENT | Catalog search and product read answered at protocol level. One remote UCP cart was created with the blue Trail Bottle and cancelled without a buyer identity. | Checkout MCP was not reached, by scope. |
| Shopify Catalog and Agentic storefront channels | PRESENT | Catalog access on, auto-enrolment of new products on, one channel active, read from the merchant's redacted settings evidence. Catalog search preview run for the three products. | Channel ranking or sales were not measured. Settings were not changed. |

Finding a surface is a fact about availability. It is not a certification, an endorsement or a security claim.

## Product truth matrix

The tested title, variant, price, currency, availability and policy facts on each surface, read in the same market, language, currency and hour. A MISMATCH was reproduced once before it was recorded.

| Product and variant | Storefront page | Browser WebMCP | Storefront and UCP MCP | Agentic Catalog preview | Result |
| --- | --- | --- | --- | --- | --- |
| Trail Bottle 750 ml, blue | 29,90 EUR, in stock | 29,90 EUR, in stock | 31,90 EUR, in stock | 29,90 EUR, in stock | MISMATCH, remote price |
| Merino Base Layer, M | 79,00 EUR, in stock | 79,00 EUR, in stock | 79,00 EUR, in stock | 79,00 EUR, unavailable | MISMATCH, variant eligibility |
| Camp Mug, green | 18,50 EUR, in stock | 18,50 EUR, in stock | 18,50 EUR, in stock | 18,50 EUR, in stock | ALIGNED |

Policy facts. The return window of 30 days, free shipping above 80 EUR and the delivery estimate of two to four working days matched on the storefront page, in the WebMCP policy tool and in the Storefront MCP policy read. The Agentic Catalog preview carries no policy fields, which is the surface's shape and not a mismatch.

The price difference was reproduced at 11:20 and 14:05 EEST in the same market, language and currency before MISMATCH was recorded. The availability difference was confirmed against the merchant's redacted Catalog settings screenshot, where the M variant is marked not eligible. No setting was changed during the test.

## Buyer-journey evidence

The five buyer searches and the cart lifecycle, each with the tool, the input, the observed result and the cart state. The session stopped before payment or order creation, and the exact stop is recorded.

| Step | Tool and input | Observed result | Cart state | Status |
| --- | --- | --- | --- | --- |
| Search 1, "light bottle for a day hike" | WebMCP search_catalog, fi-FI | Trail Bottle 750 ml returned first, blue variant listed with price and stock | Empty | ALIGNED |
| Search 2, "merino base layer size M" | WebMCP search_catalog | Merino Base Layer returned, M variant listed as in stock | Empty | ALIGNED |
| Search 3, "camp mug green" | WebMCP search_catalog | Camp Mug returned, green variant listed | Empty | ALIGNED |
| Search 4, "waterproof jacket" | WebMCP search_catalog | Two jackets returned, both outside the scope, no claim recorded | Empty | OBSERVED |
| Search 5, "return policy" | WebMCP search_shop_policies_and_faqs | 30 day return window returned, matches the storefront policy page | Empty | ALIGNED |
| Product detail | WebMCP get_product and show_variant, Trail Bottle blue | Material, volume, price 29,90 EUR and stock matched the storefront page | Empty | ALIGNED |
| Add to cart | WebMCP update_cart, one blue Trail Bottle | Cart line created, quantity 1, line price 29,90 EUR | One line, 29,90 EUR | ALIGNED |
| Cart read | WebMCP get_cart | One line, 29,90 EUR, matches the visible storefront cart drawer | One line, 29,90 EUR | ALIGNED |
| Checkout handoff | WebMCP proceed_to_checkout, the one permitted navigation | Landed on the store's own checkout page, correct store, correct line | One line, 29,90 EUR | OBSERVED |
| Payment and order | None | No form filled, no payment method entered, no order created. This is the stop | One line, 29,90 EUR | NOT TESTED |
| Remote UCP cart | Storefront MCP cart create, one blue Trail Bottle | Remote cart created with 31,90 EUR line price, the remote price of the matrix above | Separate remote cart, one line | MISMATCH, same cause as the matrix |
| Cleanup | WebMCP cancel_cart. UCP cart cancelled | Browser cart empty, storefront drawer empty, remote cart cancelled | Empty | ALIGNED |

The checkout handoff means one navigation to the checkout page. It does not mean that payment or an order was completed, and neither was.

## Correction plan

Up to five specific changes, each with its owner and an acceptance check the merchant can run without turva.dev. This plan carries three, because the check found three things to change. The order is by effect on a buyer.

## C1. Publish the Finnish price list to the remote catalog surface

**What a buyer sees today.** An agent that reads the store through the Storefront or UCP MCP quotes the blue Trail Bottle at 31,90 EUR, two euros above the storefront and the browser tools, and a remote cart is built at that price.

**Owner.** Shopify Markets and product data, on the merchant's side.

**Change.** Verify that the Finland market price list is published to the remote catalog and republish it. If the remote surface reads a default price list instead of the market list, the market assignment is the fix, not the product price.

**Acceptance check.** The same variant returns 29,90 EUR on the storefront page, in the WebMCP product read and in the Storefront MCP catalog read within one hour, in the fi-FI Finland EUR context.

## C2. Make the M variant eligible in the Agentic Catalog

**What a buyer sees today.** The M size of the Merino Base Layer is in stock and sellable on every surface except the Agentic Catalog preview, so an AI channel that reads the catalog can leave the sellable size out.

**Owner.** Agentic storefront settings and catalog mapping, on the merchant's side.

**Change.** Set the variant's eligibility in the Catalog settings and republish the mapping.

**Acceptance check.** The M variant shows as available in the Catalog preview and in a public agent answer after the propagation time the settings page states.

## C3. Run a three-surface acceptance test after every catalog or market publish

**What a buyer sees today.** Nothing yet. This change keeps C1 and C2 from coming back, because the same difference returns with the next price list, market or theme change.

**Owner.** E-commerce operations, on the merchant's side.

**Change.** Keep the three products of this check as fixtures and read them on all three surfaces after every relevant publish. The tool calls in the buyer-journey table are the script.

**Acceptance check.** For each fixture product the identity, the variant, the price in minor units, the currency and the availability match on every surface that carries them.

## Configuration changes the check does not recommend

No theme, app or product data change beyond C1 to C3 was found necessary for the three products in scope. The ten tool inventory on WebMCP is the platform's own and matched the documented set, so no tool was missing and none needed a change.

## Limits and what stays unresolved

- Ranking or sales on any external AI channel were not measured and are not promised.
- No customer account, order history or order management tool was opened.
- No payment, order or address was entered.
- Shopify Admin was not logged into and no setting was changed. Settings evidence came from the merchant as redacted screenshots.
- The result covers the three named products, the Finland market, EUR, the three surfaces and the test window of 2026-09-05. Other products, markets and hours are outside it.
- Search 4 returned products outside the scope. They were not read and no claim is made about them.

## Retest

Up to two corrected items are verified once within 14 days of this package, by 2026-09-20. C1 and C2 are the two items. Each gets the status ALIGNED, MISMATCH or UNKNOWN on direct evidence from the same tools in the same market, language and currency. A surface that cannot be read at the retest reads UNKNOWN, not ALIGNED. The retest table is printed next to the product truth matrix above.

## What this report is not

It is not a Shopify certification, an endorsement by Shopify, a penetration test or a promise of sales through any AI channel. A browser observation is not a remote MCP surface, and a navigation to the checkout page is not a payment or an order. The check reads what an AI shopper receives from one store in one session and records it.

## About this sample

Every figure on this page is invented. The surface names, the statuses and the shape of the tables are the real deliverables of the check, so that the sample shows how a real report reads, and the store, the products, the prices and the observations are fiction. A real report carries the tool call log with timestamps and the merchant's redacted settings evidence as an appendix.

The check is described on its [product page](/shopify-agent-storefront-check). To start one, [email info@turva.dev](mailto:info@turva.dev?subject=Shopify%20agent%20storefront%20check&body=Storefront%20URL%3A%20%0A.myshopify.com%20domain%3A%20%0APrimary%20market%3A%20%0AUp%20to%20three%20priority%20products%3A%20%0A) with the storefront URL, the .myshopify.com domain, the primary market and up to three priority products. The agent-readiness audit has its own [sample report](/samples/audit-report).
`,

  "/guides/agent-commerce-discovery": `# Agent commerce discovery: A2A, AP2, and ACP

Before an AI agent can transact with a site, it has to discover what the site supports and how to reach it. Three machine-readable surfaces carry that information: an A2A Agent Card, an AP2 declaration, and an ACP discovery document. Each answers a different question, and an agent reads them before it sends a single commerce request. A fourth, the UCP profile, joined them in 2026 and has its own section below.

## The A2A Agent Card

An A2A Agent Card is a JSON file, usually at /.well-known/agent-card.json, that describes an agent interface. It states the agent's name, version, and description, the interfaces it exposes, each with a service URL and a protocol binding, the capabilities it declares, and the skills it offers, each skill carrying an id, a name, and a description. The Agent2Agent protocol uses the card so one agent can discover another and know how to reach it.

The card is most useful when its skills mirror surfaces an agent can already reach, such as a service catalog or contact information. A skill that points nowhere is worse than no skill at all.

## AP2 and the version that matters

AP2 is the Agent Payments Protocol. Under the v0.1 specification, which is what deployed sites and scanners still validate against, a merchant declares support as an extension entry inside the A2A Agent Card rather than in a separate file. The entry carries the extension URI, a role such as merchant, and a flag saying whether an agent has to understand the extension.

The detail that trips people up is the URI. Some helper guides write it as "github.com/google-agentic-commerce/AP2/tree/v0.1.0", with an uppercase name and a three-part version. The v0.1 specification uses "github.com/google-agentic-commerce/ap2/tree/v0.1", lowercase, version v0.1. A scanner that validates against that specification rejects the uppercase form even when everything else is correct. Copy the URI from the spec, not from a fix message. The URI is an identifier, not an address: the repository is named AP2 and its tag is v0.1.0, so the lowercase form answers 404 in a browser, and a validator compares the string instead of fetching it.

Note that the current AP2 specification, v0.2 from April 2026, restructures the protocol around checkout and payment mandates and drops the Agent Card extension entirely. The deployed discovery convention and the scanners still follow v0.1, so publish the v0.1 declaration for discoverability today and expect this surface to change as v0.2 adoption arrives.

## ACP discovery and checkout

ACP is the Agentic Commerce Protocol, and it has two parts that are easy to confuse. The first is a discovery document at /.well-known/acp.json, which started as a proposal-stage RFC and entered the released specification with the 2026-04-17 snapshot. The second is the checkout API the document points to.

The discovery document is small and strict. It states the protocol name acp and a version, the api_base_url, a transports array, and a capabilities.services array. The services value is a closed set of strings such as checkout, not a list of product objects. Sending the wrong type is the most common reason an otherwise complete document fails validation.

A discovery check usually reads only the document, not the checkout endpoint behind it. That makes it tempting to declare a service the site does not implement, because the check passes either way. An agent that trusts the document and calls the checkout URL would then reach nothing.

## A minimal honest checkout

A checkout endpoint does not have to support instant payment to be real. The ACP checkout session carries a status field, and one of its values is not_ready_for_payment. A site that sells through a written quote can create a genuine session, return it in that state, and attach a message that the engagement is confirmed in writing first. The agent receives a well-formed session that reflects how the business actually works, and the discovery claim holds because the endpoint behind it answers.

## UCP, the fourth surface

The Universal Commerce Protocol adds a profile at /.well-known/ucp. The profile names the merchant, lists the services it offers under namespaced keys, each with a version, a transport and an endpoint, and carries two blocks, capabilities and payment_handlers, that state what an agent may do through the profile and how it may pay. The same rule holds as for the three surfaces above: a capability the profile declares has to answer at the endpoint behind it, and an empty block is more honest than a declared one nothing serves. A storefront that runs UCP over MCP carries a checkout state called requires_escalation, which means the agent has reached the edge of what it may finish alone, a verification or a regulatory step for example, and a person completes that step before the session continues. It is a pause in a checkout and not a substitute for one, so a business that sells on a written quote states that through the ACP session state above rather than through this one.

turva.dev publishes a UCP profile with empty capabilities and payment_handlers blocks on purpose, because the code behind it settles nothing automatically, and the Shopify agent storefront check reads a store's UCP surface as one of the three agent surfaces it measures.

## Publish what is true

These surfaces exist so an agent can act without guessing, which only holds when every claim resolves to something real. A card whose skills lead nowhere breaks the same way a checkout that never responds does, because the agent follows the signal and finds nothing. Publish what is true, and back each declaration with a surface that answers.

turva.dev publishes an A2A Agent Card, an AP2 merchant declaration, an ACP discovery document and a UCP profile, and an independent scanner verifies that all four are published. The checkout endpoint behind the discovery document answers as well, which is the part the scanner does not read. For an audit of a site's agent commerce surface, contact info@turva.dev.

## Frequently asked

**What is an A2A Agent Card?**

An A2A Agent Card is a JSON file, usually at /.well-known/agent-card.json, that describes an agent interface, including its name, version, transport, and the skills it offers, so another agent can discover it and know how to reach it.

**What is the correct AP2 extension URI?**

For the AP2 v0.1 Agent Card extension, the URI is "https://github.com/google-agentic-commerce/ap2/tree/v0.1" (lowercase, version v0.1), exactly as that version specifies. This is a compatibility declaration for clients and scanners that implement v0.1, not a requirement of the current AP2 v0.2, which has no Agent Card extension. The isitagentready scanner reads the v0.1 form as of 2026-09-05. Some fix texts show a V0.1.0 form with a capital V and an extra .0, which validators reject.

**Why does an AP2 declaration fail validation?**

Usually the case of the extension URI. Some fix texts show a V0.1.0 form with a capital V and an extra .0, which validators reject. The accepted form for the v0.1 extension is lowercase and v0.1. A validator built for AP2 v0.2 looks for checkout and payment mandates instead and does not read the Agent Card extension at all, so name the version the validator implements before reading its result.

**What does a UCP profile declare?**

A UCP profile at /.well-known/ucp names the merchant, the services it offers with a transport and an endpoint each, and two blocks for capabilities and payment handlers. A block left empty says the site settles nothing through the profile, which is the truthful state for a business that sells on a written quote.

## Related

- [x402 and agent payments](/guides/x402-agent-payments)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [Agentic commerce readiness: selling to AI shopping agents](/guides/agentic-commerce-readiness)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,
  "/blog/moving-off-prerender": `# Moving turva.dev off prerender.io

2026-06-20

For a while the turva.dev homepage was rendered by a third party. The page was built on Sitejet, served to people as a JavaScript app, and served to agents through prerender.io, which returned a finished HTML snapshot so a crawler did not read an empty shell. It worked and it scored well, but it was a workaround. A site that sells agent-readiness should not depend on a separate service to be readable by agents.

Today the homepage moved into the Cloudflare Worker that already fronts the domain. The Worker renders the finished HTML itself, on every request, at the edge. There is no client-side hydration step and no prerender hop. An agent reads the real content in the first response, and so does a person.

## What the Worker returns

The Worker decides by the request. A browser asking for HTML gets the rendered page. An agent that sends Accept: text/markdown gets a markdown version of the same content, at a fraction of the tokens. An agent that sends Accept: application/json gets a structured summary of the business and its services. The same facts, in the form the client asked for.

## What this removed

The prerender.io branch is gone from the Worker. No request is sent to an external prerender service, and the token it used is no longer read. Sitejet now serves only static assets such as the social image, and those move to the Worker next. The page is one codebase, under version control, open source at github.com/erekola/turva-worker.

## The result is measured, not asserted

The change was verified the same way the service verifies client work: by an independent scanner, before and after. isitagentready read Level 5, Agent-Native. The homepage migration did not drop a point.

One more note. This change was planned and deployed in a single session with an AI agent, and the result was checked by an independent scanner with no stake in the outcome. The claims on this site are measurements anyone can reproduce. Either the next scan reads the same or higher, or it does not.

Written contact only. Email info@turva.dev, Signal @turva.19. First reply within one business day.

## Related

- [Prerendering and why agents see empty pages](/guides/prerendering-for-agents)
- [Serving markdown to agents](/guides/markdown-for-agents)
- [What an agent-readiness audit is](/guides/agent-readiness-audit)
`,
  "/": `# Audits and advisory for products that AI agents read and act on

Agent-readiness is the measurable starting point: whether AI agents can find and use your website or API, scored by an independent scanner. The wider work is the data those agents depend on and the decisions you let them make. Both are measured before they are promised.

100/100 and Level 5, Agent-Native, on isitagentready.com, Cloudflare's agent-readiness scanner. Business ID 3600281-7, registered in Finland, based in Tampere and run by Erik Rekola.

## Two fixed-scope ways to start

Both diagnoses are bought at a fixed price against a written scope. Neither one requires the other.

- [Shopify agent storefront check](/shopify-agent-storefront-check). €999. One live Shopify store, read across the three agent surfaces this check covers, delivered within 48 hours of the agreed written kickoff.
- [Agent-readiness audit](/services). €4,300. A whole site or API, measured by an independent scanner, delivered in two weeks.

Both come with a public sample report on an invented site, so the format is readable before anything is bought: the [sample audit report](/samples/audit-report) and the [sample Shopify check report](/samples/shopify-agent-storefront-check).

What follows a diagnosis is scoped separately, and that work is listed on the [services page](/services).

## Audits, advisory, and implementation for product teams

An AI agent does not browse a site the way a person does. It reads machine-readable surfaces and acts on the parts it can reach, once it trusts what it found. I measure how a site, an API or a product holds up to that, fix what the measurement names, and stay on as the product changes.

The measurable core is agent-readiness, scored by an independent scanner and provable on the next scan. The wider work begins where readability ends. The data an agent acts on has to arrive intact, and the decisions it is allowed to make have to sit inside a boundary you set. The first makes an agent able to read you. The second makes it safe to let one act.

## Independent agent-readiness scan of turva.dev

Scanner: isitagentready.com (third party, Cloudflare). Discoverability, Content Accessibility, Bot Access Control, and API, Auth, MCP and A2A Discovery: 100/100. Commerce: 100/100. Verified 100/100, Level 5, Agent-Native.

## Where this applies

The pattern is narrow, but where it fits is not. Anywhere data moves and a decision follows, an agent can be the thing that reads the data and makes the call, as long as the inputs are clean and the envelope is set. A few examples:

- An agent reading a product catalog and completing a checkout for a buyer.
- An agent watching an API and acting the moment a threshold is crossed, without waiting for a person.
- An agent guiding a technician in the field, working from the same data the expert would.
- An agent triaging incoming requests and resolving the routine ones on its own.
- An agent operating a remote system over a link that drops, holding its last safe state until the data returns.

These are examples. The same discipline carries from one case to the next, so the question is rarely whether an agent could do the work. It is whether the data reaching it and the limits set around it are good enough to trust.

## Evidence

turva.dev is my own reference build. It reaches 100/100 and Level 5, Agent-Native, on isitagentready.com. Measured 2026-09-01.

- isitagentready.com: 100/100, Level 5 (Agent-Native). https://isitagentready.com/

isitagentready.com is Cloudflare's agent-readiness scanner, and this site runs on Cloudflare Workers. Independent means independent of turva.dev: the scanner is not run or influenced by this business. Commerce here is quote-on-request. turva.dev declares its payable services in the 402 challenge, priced in USDC on Base via x402, and in the OpenAPI discovery, priced in euro as a card checkout link, and settlement is confirmed out of band rather than executed automatically, so the site serves a real payment surface and claims no capability it does not have.

The agent-readiness scanner is public and can be run again at any time, by a person or by an agent. The scanner is the source. This page only reports what it returned. To check the number independently, run isitagentready.com against turva.dev.

turva.dev publishes its own security scans too, on the same principle that the result should be measurable rather than asserted. Measured 2026-09-01.

- Hardenize: all 24 categories passed. https://www.hardenize.com/report/turva.dev
- Internet.nl website test: 98/100. IPv6, DNSSEC and RPKI pass in full. The single deduction is one HTTPS sub-test, the hash function for key exchange. https://internet.nl/site/turva.dev/
- Internet.nl email test: 95/100. IPv6, DNSSEC, and DMARC with DKIM and SPF pass in full, as does RPKI. The deduction is in the cipher configuration of the receiving mail servers, which my mail provider operates. https://internet.nl/mail/turva.dev/

The Cloudflare Worker that produces these results is open source: https://github.com/erekola/turva-worker. You can read every line before you hire me.

Three published measurements sit behind the method. [567 company websites](/blog/website-agent-readiness-567-sites) read by the same scanner, my own prospecting sample and not a random draw, 85,5 percent of them at Level 1. [Fifty buyer questions put to four AI assistants](/blog/what-ai-assistants-call-an-agent-readiness-audit), 193 answers read for what each one calls an agent readiness audit. [210 sites rescanned thirty days after a brief](/blog/thirty-days-after-the-brief), 201 of them comparable, three moved up and one down, and none of the three had replied, so the brief claims none of them.

Backed by a registered business, publicly verifiable: Business ID 3600281-7, registered in Finland. PRH/YTJ business register: https://tietopalvelu.ytj.fi/yritys/3600281-7

## The process has three stages and no surprises

First, measurement. For agent-readiness, an independent scanner reads the current state of the site or API and produces a numeric baseline with a categorized list of what is missing. For the wider work, the data path and the decision envelope are tested the way an agent would hit them, so the starting point is a fact rather than an opinion.

Then a written report. Three to ten priority fixes in order of impact, with technical reasoning written so the reader does not need a background in any of this to follow it.

Then the fixes. I implement them, or your engineering team does the work with the report as the spec. Both routes are supported and the choice is yours.

All communication runs async. No calls and no calendar links. Live meetings are not part of how this work is done. Short questions go through Signal, longer documents through email. Everything stays in writing, which means the work and the trail are auditable end-to-end.

Production credentials are not requested. Write access to repositories is not taken by default. Read access is enough for the audit, and write access is scoped per task if implementation is purchased separately.

The result is checkable, not asserted. For agent-readiness that is the scanner number, higher on the next scan in the categories and by the dates the report named. For the wider work it is the same test, the data path holding under load and the envelope doing exactly what it claims. Either the next measurement confirms it or it does not.

## Services

- Shopify agent storefront check. €999. Fixed scope. What an AI shopper receives from one live Shopify store, across browser WebMCP, remote MCP and Agentic channels. Four written deliverables within 48 hours of the agreed written kickoff, and a retest within 14 days.
- Audit. Fixed scope. Two weeks. An independent scanner runs against the site or API. Written report with a prioritized fix list. You receive a measured baseline and a clear "do this first" plan.
- Advisory. Monthly retainer, async-only. Ongoing review as the site, API or product evolves. Each scanner cycle reads higher than the last, or the report explains why a tradeoff was kept on purpose.
- Implementation. €1,500 per day. Changes at the edge, well-known manifests, MCP server work, JSON-LD and Schema fixes. The improvement is verifiable against the audit baseline in the next scan.
- Agent operations. On request. The work beyond readiness: the data an agent acts on, and the decision envelope of permissions and thresholds that bounds what it is allowed to do.
- MCP server design. On request. Read-only discovery tools and streamable HTTP transport. For public, non-sensitive data, no auth surface and no logging by default. Auth and an audit trail follow the data and the misuse model. The endpoint stays readable for agents and does not turn into an abuse vector.

## Who I am

The work is done by one person under a registered business. My background is engineering: measurement, testing, and reducing things to what actually matters. I have worked in international companies for years, and I keep only the tools and methods that hold up when the output is checked line by line.

The work stays measurable on purpose. Agent-readiness is a property a scanner reads, higher next week than this week or not. The wider work holds to the same test. The data an agent acts on arrives intact or the test says where it broke, and the boundary you set holds to exactly what it claims.

## Contact

Written contact only. Email for longer messages, Signal for short questions. The first reply is in writing within one business day. No calls and no calendar links at any stage of the engagement.

- Email: <mailto:info@turva.dev>
- Signal: [@turva.19](https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK)
- LinkedIn: https://www.linkedin.com/in/erikrekola/

## Frequently asked

**What does agent-readiness mean?**

Agent-readiness is a measurable property of a site, an API, or a product surface. It describes how well AI agents can discover, read, and operate it. It is a property of the product and not of the organisation behind it: an organisation's readiness to adopt AI agents is a different question that often goes by the same name.

**How much does it cost?**

Prices (EUR, VAT not included): Shopify agent storefront check €999 fixed price, Audit €4,300 fixed price, Advisory €3,000/month (minimum 3 months), Implementation €1,500/day scoped per task, or a fixed €499 for implementing exactly the fixes an audit lists or the corrections a Shopify check lists, bought together with that diagnosis. Final price is confirmed in writing after scope is agreed.

**Do I need to share production credentials?**

No. Production credentials are not requested. Read access is enough for the audit.

**Will you sign an NDA?**

Yes. Send your own and it is signed as it stands before any material moves, at no charge. Client material is deleted within thirty days of the engagement closing, unless retention is required by law.

**Are there calls or video meetings?**

No. Engagement is async-only. No calls and no calendar links at any stage.

**How long does the audit take?**

The audit is fixed scope, two weeks.

**Can our engineering team implement the fixes?**

Yes, and the report is written for that. Every finding carries a fix instruction, and a link to the guide on this site for that surface where there is one. Either your team does the work from the report or I do. If you want me to, implementing exactly the fixes the report lists is €499 when it is bought together with the audit. The fixed price needs an edge runtime in front of your origin where the fixes are applied and the access to deploy there, plus any other access a listed fix needs, the DNS zone for example, all arranged in writing before the work starts. With those in place, every fix on the list is implemented for the €499, whatever the count. If they cannot be arranged, the add-on is not sold, and the report still carries the instructions for your team.

**How is the result verified?**

The result shows up in scanner numbers. The next scan reads higher than the previous one in the categories the report named. That re-scan is part of the audit: one run within 30 days of the report, same scanner, same profile, same question set, with the readings printed next to the baseline.

**How do I get in touch?**

In writing: email info@turva.dev or Signal @turva.19. First reply within one business day.

## Markdown views

You are reading the markdown view of this page. Every page on this
site has one, and there are two ways to it: the page URL with .md
appended, which is what llms.txt v2 asks for, or the page URL itself
with Accept: text/markdown. Both return this same document, at a
fraction of the token cost of the HTML.

## More
- [Services](https://turva.dev/services)
- [Free tools](https://turva.dev/tools)
- [Company](https://turva.dev/company)
- [Contact](https://turva.dev/contact)
- [Legal](https://turva.dev/legal)
- [Agent registration](https://turva.dev/auth.md)

## Guides
- [Agent-readiness guides](https://turva.dev/guides)
- [What an agent-readiness audit is](https://turva.dev/guides/agent-readiness-audit)
- [Choosing an agent-readiness audit](https://turva.dev/guides/choosing-an-agent-readiness-audit)
- [How to get your site cited by AI assistants](https://turva.dev/guides/get-cited-by-ai-assistants)
- [llms.txt explained](https://turva.dev/guides/llms-txt)
- [Serving markdown to agents](https://turva.dev/guides/markdown-for-agents)
- [Open Knowledge Format (OKF) explained](https://turva.dev/guides/open-knowledge-format)
- [Sitemaps, robots.txt and agent access](https://turva.dev/guides/sitemaps-and-robots-for-agents)
- [Response headers that help agents](https://turva.dev/guides/response-headers-for-agents)
- [Prerendering and why agents see empty pages](https://turva.dev/guides/prerendering-for-agents)
- [MCP server cards explained](https://turva.dev/guides/mcp-server-card)
- [What agents.json is](https://turva.dev/guides/agents-json)
- [The /.well-known directory for agents](https://turva.dev/guides/well-known-for-agents)
- [Agentic Resource Discovery and ai-catalog.json](https://turva.dev/guides/agentic-resource-discovery)
- [How agents authenticate](https://turva.dev/guides/agent-authentication)
- [JSON-LD and structured data for agents](https://turva.dev/guides/json-ld-structured-data)
- [x402 and agent payments](https://turva.dev/guides/x402-agent-payments)
- [Agent commerce discovery: A2A, AP2, and ACP](https://turva.dev/guides/agent-commerce-discovery)
- [Agentic commerce readiness: selling to AI shopping agents](https://turva.dev/guides/agentic-commerce-readiness)
- [SEO and agent-readiness are not the same](https://turva.dev/guides/seo-vs-agent-readiness)
- [Agent-readiness, AEO and GEO: how they relate](https://turva.dev/guides/agent-readiness-aeo-geo)
- [Letting agents act on data: the decision envelope](https://turva.dev/guides/letting-agents-act-on-data)
- [AI agent use cases: where agents read data and make decisions](https://turva.dev/guides/ai-agent-use-cases)
- [Why agent-readiness should be measured, not asserted](https://turva.dev/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps on marketing sites](https://turva.dev/guides/agent-readiness-gaps)
`,

  "/services": `# Two fixed-scope diagnoses, and the work that follows

Async-only. One business day response. All prices exclude VAT.

Two of these are diagnoses you can buy on their own, each at a fixed price and a fixed scope. The Shopify agent storefront check reads one live Shopify store, the audit reads a whole site or API, and neither one requires the other. Everything after them is the work a diagnosis identifies, scoped separately.

The method is measured in public before it is sold. [567 company websites](/blog/website-agent-readiness-567-sites) read by the same scanner, my own prospecting sample and not a random draw. [Fifty buyer questions put to four AI assistants](/blog/what-ai-assistants-call-an-agent-readiness-audit), 193 answers. [210 sites rescanned thirty days after a brief](/blog/thirty-days-after-the-brief), three moved up and one down, none of them because of the brief. Each post names its own limits.

## Shopify agent storefront check

**€999. 48 hours. Fixed scope.**

What an AI shopper actually receives from one live Shopify store, tested across the three agent
surfaces this check covers and reported with the evidence attached.

What you get:
- A three-surface map of browser WebMCP, remote Storefront and UCP MCP, and Agentic channels
- A product truth matrix comparing what each surface says about the tested products
- Buyer-journey evidence with the tool, the input, the observed result and the exact stop before payment
- A prioritised correction plan of up to five changes, each with an owner and an acceptance check
- One retest of up to two corrected items within 14 days

What you do not get:
- Calls or meetings
- Implementation of the corrections, which is bought separately and
  priced below
- A penetration test, or any Shopify, MCP, WebMCP or UCP certification
- A test order, because the cart lifecycle stops before payment

If you would rather not do the corrections yourself, implementing exactly
the corrections this check lists is €499 when it is bought together with
the check. That is the whole correction plan at a fixed price instead of
the €1,500 day rate. Anything outside the plan is scoped separately at the
day rate.

The fixed price needs collaborator access to the store, arranged in
writing before the work starts. With it in place, every correction on
the plan is implemented for the €499, whatever the count. If access
cannot be arranged, the add-on is not sold, and the plan still carries
the instructions for your team.

The audit is not a prerequisite. The full scope, the exclusions and the preflight are on the
[product page](/shopify-agent-storefront-check).

Suited for D2C Shopify stores that want documented evidence of what an agent receives from them today.

## Audit

**€4,300. Two weeks. Fixed scope.**

A measurement of how agent-ready your site and APIs are today, with
a prioritized list of what to fix first.

What you get:
- An independent scanner runs against the site or API
- Manual review of /.well-known/ manifests, JSON-LD, head metadata
  and HTTP headers
- Review of robots.txt, sitemap.xml, ai.txt and llms.txt against
  current agent norms
- A live check of how AI assistants and agents retrieve and answer
  questions about the site or API today, across several AI platforms
  (answer engine optimization, AEO)
- Written report with findings ranked by score impact and
  implementation cost
- A fix instruction for every finding, and a link to the guide on this
  site for that surface where there is one, so your team can do the work
  without buying implementation
- One round of written follow-up questions
- One re-scan after the fixes, within 30 days of the report and included
  in the price: the same scanner with the same profile and the same
  question set, the readings printed next to the baseline

How it is measured:
- Every agent-readiness check an independent scanner runs, recorded per
  check rather than as one headline number
- A fixed question set put to several answer engines, recording whether
  they name your site when asked about your category rather than by name
- Your published web security scans, so the report rests on measurements
  you can re-run yourself

What you do not get:
- Calls or meetings
- Implementation of the fixes, which is bought separately and priced
  below
- Ongoing monitoring (separate engagement)

Levels move with the check set. The same site can read Level 1 on a full
run and Level 2 on a narrower one, so the report names the checks that
failed and what each one costs to fix, and leaves the headline number out
of it.

Large sites are covered in full. If a site is big enough that the
live checks reach a tool quota, the quota is raised rather than the
coverage reduced. Once the audit is complete, the fixes it lists are
typically about a day of implementation work, whether your team does them or I do. That figure is an estimate scoped to the findings this audit lists, not a fixed quote, and the audit is what identifies that work and orders it by impact. The report carries the instructions for that work, so the implementation day is a choice rather than a condition.

If you would rather not do it yourself, implementing exactly the fixes
this audit lists is €499 when it is bought together with the audit.
That is the whole list at a fixed price instead of the €1,500 day rate.
Anything outside the list the report names is scoped separately at the
day rate.

The fixed price needs the same two things as an implementation day: an
edge runtime in front of your origin where the fixes are applied, and
the access to deploy there, plus any other access a listed fix needs,
the DNS zone for example, all arranged in writing before the work
starts. With those in place, every fix on the list is implemented for
the €499, whatever the count. If they cannot be arranged, the add-on is
not sold, and the report still carries the instructions for your team.

A synthetic [sample report](/samples/audit-report) is public. It uses an invented site, shows the per-check scanner readings, the manual review, the AI visibility run and eight findings with their acceptance tests, and it is not a report on a real client.

Suited for teams that want a clear picture of where they stand
before deciding what to do about it.

## Advisory

**€3,000 per month. Monthly retainer. Minimum three months.**

Ongoing input on agent-readiness as part of your product roadmap,
with tracking of how the scores change over time.

What you get:
- Monthly re-scan and score delta report
- Monthly AI-visibility delta from the same question set re-run
  across several AI platforms (answer engine optimization, AEO)
- Written review of any agent-readiness related work your team
  ships, within one business day
- Roadmap input on what to ship next and why
- Async channel for questions (email or shared doc)
- Quarterly summary of measurable progress

What you do not get:
- Calls or meetings
- A promised score, because the check set changes when the standards do

The monthly re-run uses the same measurement as the audit, so a delta
means something. A number that moved for a reason nobody can name is not
progress, and the review says which change moved it.

Suited for teams treating agent-readiness as an ongoing product
responsibility rather than a one-off cleanup.

## Implementation

**€1,500 per day. Scoped per task. €499 for a diagnosis's own fix list, bought with that diagnosis.**

Hands-on work on the fixes the audit identified, or new agent-ready
infrastructure built from scratch. The audit comes first, because the day
is spent building rather than diagnosing.

Your traffic runs through an edge worker I deploy in front of your origin,
and the access to do that exists before the day starts. Cloudflare Workers
is the default, because that is what this site runs on. Any edge runtime
that executes your code in front of the origin does the same job, Fastly
Compute, Akamai EdgeWorkers, AWS Lambda@Edge and the edge functions on
Netlify and Vercel included, so tell me which one you run when we scope
the day. The worker adds agent surfaces beside your site, and it does not
touch your application.

Typical work:
- Head metadata and /.well-known/ files served at the edge
- robots.txt with AI crawler rules and Content Signals, and a Web Bot
  Auth directory
- Markdown content negotiation, so a request asking for text/markdown
  gets markdown while a browser still gets HTML
- An agent skills index, auth.md and an API catalog
- JSON-LD generators for product, organization and article schemas
- ai.txt and llms.txt authoring
- Signed content and agent authentication patterns
- An MCP server card and an agent-to-agent card for a server that
  already runs, and the discovery paths that point at it

What a day does not cover:
- DNS records for agent discovery, which need your DNS rather than an
  edge worker
- Tool declarations inside your pages, which are application work
- Agent commerce protocols, which need working payment flows behind them
- Building the MCP server itself, which is its own engagement, so a card
  written on a day points at a server that already runs

You check the work yourself. Run the scanner before the day and after it,
so the result is a number you produced. I do not promise a readiness
level, because the level moves depending on which checks are run.

Scoped repository write access per task. No retainer.

## Agent operations

**Price on request. Scoped per engagement.**

The work beyond readiness, for teams moving from "an agent can read us" to "an agent can act on a system that matters." Two things decide whether an agent acts correctly. The data it works from has to arrive intact, even over links that drop or lag. And the decisions it is allowed to make have to sit inside an envelope of permissions and thresholds you set deliberately.

Typical work:
- Review of the data path an agent depends on, and where it breaks under real network conditions
- The permission and threshold envelope that bounds what an agent may decide and act on
- Where a human stays in the loop, and how control passes between person and agent
- Guardrails and verification so an agent's decisions can be checked after the fact

What decides the price:
- How many systems the agent touches, and whether any of them can move
  money or delete data
- Whether a decision boundary exists already or has to be written from
  scratch
- Whether the work ends at a written envelope or continues into building
  the guardrails

What you do not get:
- Calls or meetings
- An agent built for you, because this is the envelope around one rather
  than the thing itself
- Sign-off that your agent is safe, because a review cannot promise that

Suited for teams letting agents act on data and decisions that matter, rather than only reading a marketing site.

## MCP server design

**Price on request. Scoped per engagement.**

An MCP server built for your product, exposing read-only data to agents over streamable HTTP transport. For public, non-sensitive data, no auth surface and no logging by default. Auth and an audit trail follow the data and the misuse model.

Typical work:
- Read-only discovery tools over your product data
- An MCP server card at /.well-known/mcp/server-card.json so agents can discover the server
- Registry publication so the server is findable in MCP directories

What decides the price:
- How many tools the server exposes, and whether they read one system or
  several
- Whether your data is already reachable through an API, or the read path
  has to be built first
- Whether read-only is enough, which is the default here, or the server
  has to accept writes

Write tools are not included by default. A read-only server cannot modify
the source through that interface. That is the property worth keeping. It
does not settle exposure, bulk extraction or availability. Those are
decided per tool.

Suited for teams that want agents to read product data through a supported interface rather than scraping HTML.

## The agent-ready badge

Sites that complete an audit, or score 100/100 on a public
agent-readiness scanner, may display the [agent-ready badge](/badge).

Criteria and embed code: https://turva.dev/badge

## Frequently asked

**What is an agent readiness audit?**

An agent readiness audit measures how well AI agents can discover, read, and act on your website or API. It reads the website and its APIs, not the organisation's readiness to adopt AI agents, which many consultancies describe with the same words. turva.dev runs an independent scanner, isitagentready.com, reviews the agent-facing surfaces manually, checks how AI assistants currently retrieve and answer about the site, and delivers a written report with fixes ranked by score impact and implementation cost.

**What does an agent readiness audit cost?**

The Shopify agent storefront check is €999, fixed scope, delivered within 48 hours of the agreed written kickoff. The audit is €4,300, fixed scope, delivered in two weeks. Ongoing advisory is €3,000 per month with a three month minimum, and implementation is €1,500 per day, scoped per task. Implementing exactly what a diagnosis lists is a fixed €499, bought together with that diagnosis. All prices exclude VAT. Agent operations and MCP server design engagements are priced on request.

**How is the audit delivered?**

Everything is async. There are no calls or meetings, findings and answers move in writing, and questions get a response within one business day. The audit ends in a written report your team can act on directly, with one round of written follow-up questions included.

**How is agent readiness measured?**

With an independent public scanner rather than self-assessment. isitagentready.com grades sites on a Level 0 to 5 scale and scores agent readiness out of 100. The audit runs it against your site, so the result is reproducible and the same scan can verify every fix afterwards.

**Do I need the audit before the Shopify agent storefront check?**

No. The two are separate fixed-scope diagnoses and either can be bought on its own. The audit measures a whole site or API against agent-readiness norms. The Shopify check measures what an AI shopper receives from one live Shopify store, across the three agent surfaces this check covers.

**How much work are the fixes after the audit?**

In most cases, once the audit is complete, the fixes it lists are about a day of implementation work. That figure is an estimate scoped to the findings the report lists, not a fixed quote. Your team can do them with the report as the spec, or turva.dev implements them as a scoped engagement. Implementing exactly the fixes the report lists is €499 when it is bought together with the audit. That fixed price needs an edge runtime in front of your origin where the fixes are applied and the access to deploy there, plus any other access a listed fix needs, the DNS zone for example, all arranged in writing before the work starts, and with those in place every fix on the list is implemented, whatever the count.

**Will you sign an NDA, and how is our material handled?**

Yes, your own NDA, signed as it stands before any material moves, at no charge. Production credentials are not requested at any stage, and repository write access is scoped per task and only if implementation is purchased. The workstation is encrypted at disk level, and credentials are held in an encrypted vault instead of in files. Backups are encrypted on the machine before they are uploaded anywhere. Client material is deleted within thirty days of the engagement closing, unless retention is required by law.

**Do AI tools see our material?**

I use AI tools in the work. They run on a local workspace holding the files a task needs, not against your systems. Those files are processed by the provider of the tool in use. No secret reaches a tool in the clear, because credentials are held in an encrypted vault that scripts read at runtime. Material you want kept out of AI tooling is named in the NDA and stays out.

## How to start

Email <mailto:info@turva.dev> with the site or API you want audited. I
respond within one business day with a fixed quote and a start date.

No calls or calendar links, and no discovery sessions.

All prices exclude VAT. 25,5% for Finnish customers, reverse charge
for EU B2B, 0% for non-EU.
`,

  "/shopify-agent-storefront-check": `# Shopify agent storefront check

For D2C Shopify stores that want evidence of what an AI shopper actually receives. €999 plus VAT, fixed scope, delivered in 48 hours from a written kickoff.

Shopify stores now meet shopping agents through three separate interfaces. They are related, and an agent does not always get the same answer from each. This check tests one live store across all of them and reports what an agent receives on each, with the evidence attached.

A general agent-readiness audit is not a prerequisite. This check stands on its own, and it is not a step inside the audit.

## Price and timing

**€999 plus VAT. Fixed scope. 48 hours.**

The 48-hour clock starts at the agreed written kickoff, once the preflight, payment and merchant evidence are complete. No response is required from you during the delivery window.

If the public preflight cannot establish an observable agent-commerce surface suitable for controlled testing, the engagement is not sold and nothing is invoiced.

If the 48-hour package of four deliverables is not sent within 48 elapsed hours, the fee is refunded. The retest is the fifth deliverable. It runs on its own 14-day window.

All work is asynchronous and delivered in writing.

## The three surfaces

Every one of these is tested in the same session, against the same products, so a difference between them is visible rather than inferred.

- Browser WebMCP tools inside the shopper's live storefront tab.
- Shopify-hosted Storefront and UCP MCP endpoints.
- Shopify Catalog and Agentic storefront channels.

## What the check answers

Within 48 hours you receive an evidence-backed status for each of the following, including anything restricted, unavailable or not testable.

- Which agent tools were observed and functional in the tested session.
- Whether product, variant, price, currency and availability data agree across the tested surfaces.
- Whether an agent can build the intended anonymous cart.
- Where the buyer is handed off to checkout.
- Whether your Shopify Agentic channel settings match what your team intended.
- Which product-data, theme, app or configuration changes should be made first.

## Fixed scope

The scope is fixed before the clock starts, and it does not move during delivery.

The check covers:

- One Shopify store.
- One market, language and currency.
- Up to three named product and variant pairs.
- Up to five real buyer searches.
- One clean, supported Chromium browser session.
- Browser WebMCP.
- Storefront and UCP MCP.
- Shopify Agentic settings and a Catalog search preview.
- One anonymous browser cart with one permitted checkout navigation, plus one separate remote UCP Cart lifecycle that stops before Checkout MCP.
- One retest of up to two corrected items within 14 days.

No Shopify Admin password is requested. The check uses public storefront surfaces, an isolated shopper session, and settings evidence you provide as redacted screenshots or a short screen recording.

No customer details are entered. No payment is submitted and no order is placed.

## What you receive

Five written deliverables. The first four are sent as one package within 48 hours. The fifth is the retest, and it follows within 14 days.

- Three-surface map. What is present, restricted, unavailable or not tested on browser WebMCP, remote MCP and Agentic channels.
- Product truth matrix. The tested title, variant, price, currency, availability and policy facts across surfaces.
- Buyer-journey evidence. The tool, the input, the observed result, the cart state and the exact stop before payment or order creation.
- Prioritised correction plan. Up to five specific changes, their owner and a ready acceptance check.
- Retest. One verification of up to two corrected items within 14 days.

Implementation of the corrections is not included in the €999. Your team can act on the plan directly, or implementing exactly the corrections this check lists is €499 when it is bought together with the check. Work outside the plan is scoped separately at the €1,500 implementation day rate. The fixed price needs collaborator access to the store, arranged in writing before the work starts. With it in place, every correction on the plan is implemented for the €499, whatever the count. If access cannot be arranged, the add-on is not sold, and the plan still carries the instructions for your team.

## What this is not

This is an operational storefront check. It is not a penetration test. It is not a Shopify, MCP, WebMCP or UCP certification either.

A documented Shopify tool or public endpoint is not treated as a vulnerability. Browser WebMCP does not establish remote access. Checkout navigation is not reported as payment completion. Ranking or product placement in an external AI channel is not promised.

This is an independent service, not affiliated with or endorsed by Shopify.

## What the public preflight measured

Before this check was offered, 26 Shopify storefronts were read with a public read-only preflight on 2026-08-09. All 26 advertised the same ten-tool WebMCP inventory that Shopify documents as its platform-supplied surface.

What that measurement does not establish, and the reason the paid check exists:

- No tool was called on any of the 26 stores.
- Cart, checkout, payment and order creation were not tested.
- Remote MCP behaviour and Agentic Admin settings were not read.
- The identical inventory is Shopify's platform surface rather than 26 separate merchant implementations, so it says nothing about any one store's product data.
- Five of the 26 needed a repeat run before the scanner finished, so the reading is the latest available observation rather than one clean pass.
- The 26 of 26 figure describes those stores at that hour under that scanner version, and it is not generalised to Shopify stores.

## Sample report

A synthetic [sample report](/samples/shopify-agent-storefront-check) is public. It uses invented store data. It shows the three-surface map, the product truth matrix, the buyer-journey evidence, the correction plan and the retest, and it is not a report on a real merchant.

## Frequently asked

**Do I need an agent-readiness audit first?**

No. The Shopify agent storefront check is a separate fixed-scope diagnosis with its own price and its own deliverables. The general audit measures a whole site or API against agent-readiness norms, this check measures what an AI shopper receives from one Shopify store.

**What does it cost, and what is the delivery time?**

€999 plus VAT, fixed scope. Four written deliverables arrive as one package within 48 elapsed hours of the agreed written kickoff. The fifth is a retest of up to two corrected items, within 14 days. Implementing exactly the corrections this check lists is a further €499, bought together with the check.

**What does the €499 correction implementation need from me?**

Collaborator access to the store, arranged in writing before the work starts. The check itself needs none, this add-on does. With access in place, every correction on the plan is implemented for the €499, whatever the count. If access cannot be arranged, the add-on is not sold, and the plan still carries the instructions for your team.

**Do you need access to my Shopify Admin?**

The check does not. No Shopify Admin password is requested and no credentials are handled: settings evidence comes from you as redacted screenshots or a short screen recording, and everything else is read from public storefront surfaces. The separately bought correction implementation does need collaborator access to the store, arranged in writing before that work starts. No password is shared in either case.

**Will you place a test order?**

No. The cart lifecycle stops before payment, one checkout navigation is permitted if you authorise it, and no customer details, payment or order are ever submitted.

**What happens if the check finds nothing wrong?**

You receive the same deliverables, with the surfaces recorded as matching. A documented match is the result you are paying to be able to show, and the correction plan then names what to keep stable instead.

## How to start

Email <mailto:info@turva.dev> with your storefront URL, your .myshopify.com domain, your primary market and up to three priority products. A preflight and a fixed quote follow within one business day.

No calls, no calendar links, and no discovery sessions.

All prices exclude VAT. 25,5% for Finnish customers, reverse charge for EU B2B, 0% for non-EU.
`,

  "/company": `# A one-person audit practice, registered in Finland

turva.dev is operated by Erik Rekola.

## Business details

- **Trade name:** turva.dev
- **Business ID:** 3600281-7
- **Country of registration:** Finland
- **Form:** Sole proprietorship

## About the operator

Erik spent six years, 2015 to 2021, in hands-on machine roles: paper machinery at UPM, medical washer-disinfectors at Franke, a clinical LC-MS/MS analyzer at Thermo Fisher Scientific, and semiconductor production equipment at ASM International. The common thread was machine data that had to be trusted and interventions that had to stay inside strict limits.

There was then a career break, from 2021 to early 2026. turva.dev was built when AI agents turned that same discipline into a web problem: data that has to arrive intact, and decisions that have to stay inside a boundary someone set on purpose.

The proof of current skill is public rather than asserted. The site and its MCP server are open source, and every score published here comes from third-party scanners anyone can re-run.

## Location

Tampere, Pirkanmaa, Finland.
All work is delivered remotely. No on-site engagements.

## Why this service exists

Agent-readiness is a measurable property of a site, an API, or a
product surface. This service answers one question: whether an
independent scanner reads it higher next week than this week.

Most websites and APIs were built before AI agents were a meaningful
class of clients. The protocols (MCP, well-known manifests,
structured discovery, JSON-LD) exist, but few sites implement them
correctly. The result is a measurable gap between what an agent can
read and what a human can read.

This service closes that gap on a per-project basis, with an
independent scanner as the referee.

## Operating principles

- Async-only engagement. No calls, no calendar links.
- All work delivered remotely.
- Production credentials are not requested.
- Write access scoped per task and only if implementation is purchased.
- Public readiness claims are verifiable by re-running the scanner. Engagement findings are tied to recorded inputs and observed results.

## Contact

- **Email:** <mailto:info@turva.dev>
- **Signal:** [@turva.19](https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK)
- **LinkedIn:** https://www.linkedin.com/in/erikrekola/

## Invoicing

Payment terms are fourteen days net unless agreed otherwise in
writing.

VAT is added to invoices according to Finnish law. Reverse charge
applies to EU B2B customers with a valid VAT ID. Non-EU customers
are invoiced without VAT. turva.dev's own VAT ID is FI36002817.`,

  "/contact": `# Written contact only, first reply within one business day

Email for longer messages, Signal for short questions. No calls and
no calendar links at any stage of the engagement.

## Channels

- **Email:** <mailto:info@turva.dev>
- **Signal:** [@turva.19](https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK)
- **LinkedIn:** https://www.linkedin.com/in/erikrekola/

Scan the code with a phone to open a Signal chat. The code image is at /signal-qr.png. Short questions go here, longer documents by email.

Signal is end-to-end encrypted. Scanning shares no account of yours.

## Start a request by email

Each link opens a message to info@turva.dev with the subject set and the fields the first reply needs. Nothing is sent until you send it, and the same fields typed into a plain email work just as well.

- [Shopify agent storefront check](mailto:info@turva.dev?subject=Shopify%20agent%20storefront%20check&body=Storefront%20URL%3A%20%0A.myshopify.com%20domain%3A%20%0APrimary%20market%3A%20%0AUp%20to%20three%20priority%20products%3A%20%0A): storefront URL, .myshopify.com domain, primary market, up to three priority products.
- [Agent-readiness audit](mailto:info@turva.dev?subject=Agent-readiness%20audit&body=Site%20or%20API%20URL%3A%20%0AWhat%20the%20audit%20should%20answer%3A%20%0A): the site or API URL and what the audit should answer.

## Encrypted email

Mail to erik@turva.dev can be OpenPGP encrypted. Encryption is
optional, and an unencrypted message gets the same reply time.

The public key is at https://turva.dev/pgp-key.asc, and it is also
published for automatic discovery, so a mail client that supports Web
Key Directory finds it from the address alone. RSA 4096, valid until
27 July 2036.

Fingerprint:

7D66 37F2 A37B A45F 56D6 9D3A 95D8 AE0F CEDF EE35

Compare the fingerprint against the key before you use it, because a
key served over the web is only as trustworthy as the page that served
it.

## Response times

- Email and Signal: within one business day
- Weekends: no guaranteed response time

## Languages

Correspondence in English or Finnish, your choice. A brief I send unasked arrives in the language of the company it is about, and reports are written in English unless a Finnish report is agreed in the written scope.

## What to include in a first message

A useful first message includes:

- The site or API to be audited (URL)
- Any current scanner results, if you have run them
- The scope you have in mind (Shopify agent storefront check, audit, advisory, implementation, agent operations, MCP server design)

If you do not have scanner results yet, that is fine. The audit
starts with running them.

## Confidentiality

An NDA is signed before any material moves. Send your own and it is
signed as it stands, at no charge. Production credentials are not
requested at any stage, and repository write access is scoped per
task and only if implementation is purchased.

## Geographic service area

Based in Tampere, Finland. Service delivered remotely worldwide.
All work is asynchronous and written.

## Business details

- Business ID: 3600281-7
- Register: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Agent registration: https://turva.dev/auth.md
`,

  "/legal": `# Terms of engagement, and how data is handled

This page covers the terms under which turva.dev operates, the
privacy practices of the site, and the default terms for engagements.

## Operator

turva.dev is operated by Erik Rekola, Business ID 3600281-7,
registered in Finland as a sole proprietorship.
VAT-registered, VAT ID FI36002817.

Contact: <mailto:info@turva.dev>

## Terms of engagement

The following terms apply to all engagements (Shopify agent
storefront check, audit, advisory,
implementation, agent operations and MCP server design) unless
replaced by a written agreement.

**Scope.** Each engagement has a defined scope agreed in writing
before work starts. Scope changes require a new written agreement
and may affect price and timeline.

**Deliverables.** Audit deliverables are a written report.
Advisory deliverables are written reviews and a monthly summary.
Implementation deliverables are source code committed to the
agreed repository.

**Payment.** Payment terms are fourteen days net unless agreed
otherwise in writing. Late payment interest follows Finnish law.

**Confidentiality.** Information shared during an engagement is
treated as confidential. Your own non-disclosure agreement is signed
as it stands before any material moves, at no charge. Production
credentials are not requested at any stage.

**Liability.** Liability is limited to the value of the engagement.
turva.dev is not liable for indirect or consequential damages.

**Intellectual property.** The client owns the deliverables produced
for them. Generic methods, templates and reusable code remain with
turva.dev.

**Governing law.** Finnish law applies. Disputes are resolved in
the District Court of Pirkanmaa, Finland.

## Privacy

This site does not use analytics cookies, tracking pixels or
third-party scripts.

**Server logs.** The hosting provider (Cloudflare) records standard
request logs including IP address, user agent and requested path.
Logs are retained according to Cloudflare's standard retention policy.

**Email.** Email communication is stored in standard email
infrastructure for as long as needed to deliver the work and meet
accounting obligations under Finnish law (six years for invoice
records).

**Client data.** Data shared by a client during an engagement is
stored only on systems necessary to deliver the work, and deleted
within thirty days of engagement closure unless retention is
required by law. The workstation holding it uses full disk
encryption, credentials are held in an encrypted vault rather than in
files, and backups are encrypted on the machine before they are
uploaded anywhere.

**Briefs.** When turva.dev measures a company's public website and
sends the reading as a brief, the brief lives at an unlisted address
on turva.dev. It contains what the public site serves and how it was
read, and nothing a person shared. The address is not indexed and
not linked from anywhere. A brief is removed on request, and every
brief expires on its own no later than 400 days after it was last
published.

**AI tools.** AI tools are used in the work, on a local workspace
holding the files a task needs. Those files are processed by the
provider of the tool in use. No secret reaches a tool in the clear,
because credentials are held in an encrypted vault that scripts read
at runtime, and the tools have no access to client systems. Material
a client wants excluded from AI tooling is named in the
non-disclosure agreement and excluded.

No data is sold. Data reaches a third party only through the
providers needed to deliver the work: hosting, email, encrypted
backup storage and the AI tool in use.

## Rights under GDPR

You have the right to access, correct or request deletion of personal
data held about you. Send the request to <mailto:info@turva.dev>.

The supervisory authority in Finland is the Data Protection
Ombudsman (tietosuojavaltuutettu.fi).

## Cookies

This site sets no cookies of its own. Cloudflare may set cookies
required for bot management and security. These are technical
cookies and do not require consent under EU law.

## Updates

This page is updated when the terms change. The current version
applies to engagements started after the date below.

Terms last updated: 2026-08-11. Privacy section last updated: 2026-09-03.
`,

  "/guides/open-knowledge-format": `# Open Knowledge Format (OKF) explained

The Open Knowledge Format is an open specification from Google Cloud that represents a body of knowledge as a directory of plain markdown files. Each concept file carries a small block of YAML frontmatter and a free-form body. The goal is a portable way to hand an AI agent the context it needs, readable by a person and parseable by a machine, with no SDK and no catalog to lock into. Google Cloud published version 0.1 in June 2026 and version 0.2 in July 2026.

## What an OKF bundle contains

A bundle is a folder of markdown files, and the unit inside it is a concept. A concept is anything worth capturing for an agent: a table, a dataset, a metric, a runbook, an API. Every concept is one UTF-8 markdown document with two parts. A YAML frontmatter block at the top, fenced by a line of three dashes above and below, and a markdown body underneath.

The format asks for exactly one field, type. Everything else is optional, including title, description, resource, tags and a generated block that records who last changed the concept and when. What types exist and what fields each carries is left to whoever produces the bundle. Concepts reference each other with ordinary markdown links, so the folder becomes a graph of related knowledge rather than a flat list of files.

## Structural interoperability, not yet semantic

Version 0.2 fixes a small set of things and leaves the rest open. It fixes the shape of a bundle as a folder of markdown files, the YAML frontmatter, two reserved filenames and the single required field, all carried forward from version 0.1 unchanged. That is structural interoperability: any tool can open a bundle and know where the pieces are. Version 0.2 also added optional provenance and trust keys, among them sources, generated, verified, status and stale_after, and it retired two version 0.1 surfaces, since the concept timestamp became generated.at and the body Citations list became sources in the frontmatter.

What it does not fix is meaning. The format does not say what a metric concept must contain, or how two producers should agree on the same field names. That is semantic interoperability, and version 0.2 leaves it to producers and to conventions that have not been written yet. This is the line to keep in mind when reading the announcements around OKF. It standardizes the shape of the files, not yet what the files mean.

## Where OKF fits with agent-readiness

Agent-readiness, the kind measured by an independent scanner, is about whether an agent can reach and read your public site at all. OKF sits next to that, one layer in. It is a way to package the internal knowledge an agent works from once it is past the front door: the catalog, the metrics and the rules a decision depends on.

So OKF is not a replacement for an llms.txt or a markdown surface on your site. It is the same instinct, plain text an agent can read without a special client, applied to the data and context behind the site rather than the pages in front of it. For a team thinking about what an agent acts on, not only what it can see, that is the part of the picture OKF addresses.

## What to do with it today

OKF is new and small, version 0.2 since July 2026, and the semantic half is still open. That makes it worth understanding now and worth watching, but early to build an entire knowledge catalog on. If you already serve markdown to agents and keep an llms.txt, you have the instinct OKF formalizes, and adopting it later will be a short step rather than a rebuild.

For an audit of how legibly AI agents can read your site and the data behind it, contact info@turva.dev.

## Frequently asked

**What is the Open Knowledge Format?**

An open specification from Google Cloud that represents a body of knowledge as a directory of plain markdown files. Each concept is one UTF-8 document with a YAML frontmatter block and a body. Google Cloud published version 0.1 in June 2026 and version 0.2 in July 2026.

**What does OKF actually standardize?**

The shape of the files, not yet their meaning. Version 0.2 fixes the folder of markdown files, the frontmatter, two reserved filenames and one required field. What a concept must contain is left to producers.

**Does OKF replace llms.txt?**

No. An llms.txt and a markdown surface make the pages in front of the site readable. OKF packages the knowledge behind it, the catalog, the metrics and the rules a decision depends on. It is the same instinct one layer in.

## Related

- [llms.txt explained](/guides/llms-txt)
- [Serving markdown to agents](/guides/markdown-for-agents)
- [Letting agents act on data: the decision envelope](/guides/letting-agents-act-on-data)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,
  "/guides": `# Agent-readiness guides

These short guides explain, in plain language, what makes a website or an API easy for AI agents to read and use. Each one covers a single topic and takes a few minutes to read. They are free, and they cover the same surfaces an [agent-readiness audit](/services) measures.

Every guide here is re-read against its primary sources at least once a month, and the two families that move fastest, agent commerce and MCP discovery, more often than that. Specifications move, and a sentence that was true the day it shipped can stop being true without anything on this site changing.

The first guide explains what an agent-readiness audit is.

## Discovery and content

How an agent finds your site and reads it without getting lost.

- [What an agent-readiness audit is](https://turva.dev/guides/agent-readiness-audit)
- [Choosing an agent-readiness audit](https://turva.dev/guides/choosing-an-agent-readiness-audit)
- [How to get your site cited by AI assistants](https://turva.dev/guides/get-cited-by-ai-assistants)
- [llms.txt explained](https://turva.dev/guides/llms-txt)
- [Serving markdown to agents](https://turva.dev/guides/markdown-for-agents)
- [Open Knowledge Format (OKF) explained](https://turva.dev/guides/open-knowledge-format)
- [Sitemaps, robots.txt and agent access](https://turva.dev/guides/sitemaps-and-robots-for-agents)
- [Response headers that help agents](https://turva.dev/guides/response-headers-for-agents)
- [Prerendering and why agents see empty pages](https://turva.dev/guides/prerendering-for-agents)

## Capability and trust

How a site tells an agent what it is allowed to do, and shows it is safe to use.

- [MCP server cards explained](https://turva.dev/guides/mcp-server-card)
- [What agents.json is](https://turva.dev/guides/agents-json)
- [The /.well-known directory for agents](https://turva.dev/guides/well-known-for-agents)
- [Agentic Resource Discovery and ai-catalog.json](https://turva.dev/guides/agentic-resource-discovery)
- [How agents authenticate](https://turva.dev/guides/agent-authentication)
- [JSON-LD and structured data for agents](https://turva.dev/guides/json-ld-structured-data)

## Commerce and strategy

Paying agents, how this differs from SEO, and how to choose and measure an audit.

- [x402 and agent payments](https://turva.dev/guides/x402-agent-payments)
- [Agent commerce discovery: A2A, AP2, and ACP](https://turva.dev/guides/agent-commerce-discovery)
- [Agentic commerce readiness: selling to AI shopping agents](https://turva.dev/guides/agentic-commerce-readiness)
- [SEO and agent-readiness are not the same](https://turva.dev/guides/seo-vs-agent-readiness)
- [Agent-readiness, AEO and GEO: how they relate](https://turva.dev/guides/agent-readiness-aeo-geo)
- [Letting agents act on data: the decision envelope](https://turva.dev/guides/letting-agents-act-on-data)
- [AI agent use cases: where agents read data and make decisions](https://turva.dev/guides/ai-agent-use-cases)
- [Why agent-readiness should be measured, not asserted](https://turva.dev/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps on marketing sites](https://turva.dev/guides/agent-readiness-gaps)

## Frequently asked

**What is an agent-readiness audit?**

An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API, scored against current standards by an independent scanner rather than a self-assessment.

**Do I need llms.txt on my site?**

llms.txt gives a curated map of what matters to the clients that fetch it, and no assistant is obliged to be one of them. It does not replace robots.txt or a sitemap, it complements them.

**How do I get my site cited by AI assistants?**

A model cites content it can read cleanly and corroborate. That means machine-readable surfaces such as llms.txt and structured data, a markdown form that does not exhaust the token budget, and being indexed where the assistant searches.

**What is an MCP server card?**

An MCP server card is a JSON file that lets an agent discover a site's Model Context Protocol server, its endpoint and its transport, so the agent can connect without a human wiring up the connection. Deployed cards commonly sit at /.well-known/mcp/server-card.json.

**Is agent-readiness the same as SEO?**

No. SEO makes a site rank for a person to click. Agent-readiness makes a site legible and usable by an agent that reads and acts. A site can rank well and still be opaque to agents.

**How is agent-readiness measured?**

By an independent scanner that reads the live site and reports a score with a category breakdown. The categories that get fixed read higher on the next scan, so the claim is the number rather than an assertion.

For an audit, contact info@turva.dev.
`,

  "/guides/agent-readiness-audit": `# What an agent-readiness audit is

An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API. It is a technical review of the surfaces that automated clients actually use, scored against current standards rather than opinion.

Most sites are built for human readers and search crawlers. AI agents read differently. They look for machine-readable entry points such as llms.txt, a sitemap, response headers, structured data, and well-known manifests. When those are missing, the agent either guesses or gives up, and the site becomes invisible to that class of client even when the underlying product is strong.

The audit checks the parts an agent reaches first. Discoverability covers robots.txt, the sitemap, the response headers, and the DNS records that let an agent find resources without parsing a full HTML page. Content accessibility covers llms.txt, markdown content negotiation, and whether the site can return a clean text version that saves an agent most of the tokens an HTML page would cost. Bot access control covers the AI-bot rules, the content signals, and the bot-authentication directory that tell an agent how it is allowed to behave. API, auth, MCP and A2A discovery covers an MCP server card, an agent card, an OpenAPI description, an API catalog, and OAuth discovery, so an agent can enumerate what the site offers and authenticate safely. Commerce covers payment surfaces such as x402 and structured pricing, so an agent can transact.

The result is a list. Each check passes or fails, and each failure comes with a concrete fix instruction and, where this site has a guide for that surface, a link to it. The report is written so your own team can do the work, which means implementation is something you buy if you want it rather than something the report forces on you. The point is that the outcome is verifiable. An independent scanner reads the site before and after, and the categories that were fixed read higher on the next scan. The claim is the number, not an assertion.

turva.dev applies the same standard to its own site. Measured by an independent scanner, turva.dev reaches 100/100 and Level 5, Agent-Native, on isitagentready.com. Measured 2026-09-01. That is one scan on one day, and the scanner's check set moves, so a scan run today is a new measurement rather than a confirmation of this one. The audit a client receives runs the same checks against their site.

For an audit, contact info@turva.dev. Engagement is async and evidence-based, and production credentials are not requested.

## Frequently asked

**What is an agent-readiness audit?**

An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API. It is a technical review of the surfaces automated clients use, scored against current standards rather than opinion.

**What does an agent-readiness audit check?**

It checks the surfaces an agent reaches first, covering discoverability, content accessibility, bot access control, API/auth/MCP and A2A discovery, and commerce. Each check passes or fails, and each failure comes with a concrete fix an independent scanner can verify before and after.

**What does an agent-readiness audit produce?**

A pass or fail on each check, and a concrete fix instruction for every failure, with a link to the guide on this site for that surface where there is one. Your own team can do the work from the report. An independent scanner verifies the result before and after, and the scoring is against current standards rather than opinion.

## Related

- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps on marketing sites](/guides/agent-readiness-gaps)
- [AI agent use cases](/guides/ai-agent-use-cases)
`,

  "/guides/llms-txt": `# llms.txt explained

llms.txt is a plain text file that tells AI agents and language models what a site contains and where the important content lives. It sits at /llms.txt at the root of a site, or at any path inside it, in which case it covers the pages under that path and the most specific file applies. It works like a guide written for machines. A human reads the rendered page, an agent reads llms.txt and follows the links it lists.

The format is simple. The file opens with the site name as an H1, then a short summary as a blockquote, then the key pages and resources as markdown links grouped under H2 headings. Only the H1 is required. Some sites also publish llms-full.txt, a single file that bundles the full text of the site so an agent can read everything in one request instead of crawling many pages.

The proposal reached v2 in August 2026 and the file format did not change. What changed is how an agent finds the machine-readable forms. A page now names them with two standard link relations, rel="alternate" type="text/markdown" for the markdown version of the page and rel="describedby" for the llms.txt that covers it, given either as HTML link elements or as an HTTP Link header. v2 also accepts both address forms for a markdown version, page.html.md and page.md, and it drops the context expansion tooling that v1 described, so the Optional section is a convention for secondary links and carries no mechanical meaning any more.

The reason it matters is cost and clarity. A normal HTML page carries navigation, scripts, and styling that an agent has to wade through, and that spends tokens and invites mistakes. An llms.txt file, paired with markdown content negotiation, lets an agent fetch a clean text version and skip the noise. On turva.dev the markdown version of a page costs a fraction of the HTML, which is the difference between an agent reading the page reliably and an agent truncating it.

llms.txt is not a ranking trick and it does not replace a sitemap or robots.txt. A sitemap lists every URL for crawlers. robots.txt sets crawl rules. llms.txt is a curated, human-written map of what matters, aimed at models. The three work together.

Whether a site needs one depends on whether it wants to be legible to agents. A clear llms.txt serves the clients that read it, and no assistant is obliged to be one of them. Google states that Search, including its generative features, ignores the file, so publish it for the clients that fetch it rather than as a route into Google.

Check any site's llms.txt structure with the free validator at https://turva.dev/llms-txt-validator.

turva.dev publishes llms.txt and llms-full.txt, serves markdown on request, and publishes the markdown version of every page at its own .md address with both v2 link relations. For an audit of how legible a site is to agents, contact info@turva.dev.

## Frequently asked

**What is llms.txt?**

llms.txt is a plain text file that tells AI agents and language models what a site contains and where the important content lives. It sits at the root of a site or at any path inside it, where it covers the pages under that path. It does not replace robots.txt or a sitemap, it complements them.

**Does llms.txt help with search ranking?**

No. It is not a ranking trick. Google states that the file neither harms nor helps visibility or rankings in Search, because Search ignores it. What llms.txt gives is a curated map of the content to those clients that do fetch it.

**What does an llms.txt file contain?**

The site name and a short summary, then the key pages and resources as markdown links, often grouped under headings. Some sites also publish llms-full.txt, which bundles the full text so an agent can read everything in one request.

**What changed in v2 of llms.txt?**

The file format did not change. v2 added two standard link relations so an agent finds a page's markdown version and its llms.txt without guessing, accepted page.md alongside page.html.md as the address of a markdown version, defined what an llms.txt in a subpath covers, and dropped the context expansion tooling along with the mechanical meaning of the Optional section.

## Related

- [Serving markdown to agents](/guides/markdown-for-agents)
- [How to get your site cited by AI assistants](/guides/get-cited-by-ai-assistants)
- [Agent-readiness, AEO and GEO: how they relate](/guides/agent-readiness-aeo-geo)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/mcp-server-card": `# MCP server cards explained

An MCP server card is a small JSON file that describes a site's Model Context Protocol server so an agent can find it and learn what it offers. Deployed cards, turva.dev's among them, commonly sit at /.well-known/mcp/server-card.json. [SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127), the open proposal behind the card, now develops it as an [experimental MCP extension](https://github.com/modelcontextprotocol/experimental-ext-server-card). As of September 2026 its draft reserves a different default, the MCP endpoint URL followed by /server-card, and it does not recommend a /.well-known path for the card itself. Site-level discovery sits in a catalog instead: the experimental Server Card document keeps an AI Catalog at /.well-known/ai-catalog.json, while ARD v0.91 names /.well-known/ard.json, so the convention is still moving. An agent reads the card, finds the endpoint, and can then connect without a human wiring up the connection first.

The Model Context Protocol is a standard way for agents to use external tools and data. A server implements the protocol and exposes a set of tools, and the card is how that server announces itself. Without a card or a registry listing, an agent has no reliable way to discover that the server exists or what it can do, so the capability stays hidden even when it is live.

A useful card states the server name, the endpoint, and the transport, in a shape an agent can parse deterministically. Many published cards, including turva.dev's, also list the tools. The newer draft leaves tool listing to the MCP connection itself, since a live tools/list answer cannot go stale the way a static list can. turva.dev publishes a server card that points to a read-only MCP server, which exposes the same agent-readiness data that the site shows to people. That means an agent can query the data directly rather than scraping a page.

A server card sits in the same family as other well-known manifests an agent looks for, such as an API catalog, an OpenAPI description, and OAuth discovery. Each one removes a guess. The card answers what tools exist, the API catalog answers what endpoints exist, and OAuth discovery answers how to authenticate. Together they let an agent move from finding a site to operating it.

For sites that want to expose a capability to agents, the card is the cheapest high-value step, because it turns an invisible server into a discoverable one. For an audit of a site's capability surface, contact info@turva.dev.

## Frequently asked

**What is an MCP server card?**

An MCP server card is a small JSON file that describes a site's Model Context Protocol server, its endpoint and its transport, so an agent can connect without a human wiring up the connection. The current draft leaves the tool list to the live connection rather than to the card.

**Why publish an MCP server card?**

Without a card or a registry listing an agent has no reliable way to discover that the server exists or what it can do, so the capability stays hidden even when it is live. The card turns an invisible server into a discoverable one.

**Where does an MCP server card live?**

Deployed cards commonly sit at /.well-known/mcp/server-card.json, and turva.dev serves one there. The current draft reserves a different default, the MCP endpoint URL followed by /server-card, so an agent may have to try both until the convention settles.

## Related

- [What agents.json is](/guides/agents-json)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [How agents authenticate](/guides/agent-authentication)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/agents-json": `# What agents.json is

agents.json is a machine-readable file that declares what an AI agent can do on a site and how. Where llms.txt tells an agent what the site contains, agents.json describes the actions and endpoints an agent is allowed to use, so an automated client can move from reading to doing without a human wiring it up.

The file lists the operations a site exposes to agents, often pointing at an OpenAPI description or specific endpoints, along with the authentication an agent needs. An agent reads it, learns which actions exist, and calls them within the rules the site sets.

The reason it matters is that most sites expose actions only through a human interface, a form or a checkout flow that a person clicks through. An agent cannot reliably reverse-engineer that. A declared action surface removes the guesswork and turns a site from something an agent can read into something an agent can operate.

agents.json sits beside the other declarations an agent looks for. An MCP server card describes a site's MCP server, an API catalog lists endpoints, and OAuth discovery describes how to authenticate. Each one removes a guess, and together they let an agent act on a user's behalf safely.

A site does not need agents.json to be readable, but it needs something like it to be operable. The specification itself has stayed at version 0.1.0 since early 2025 and the ecosystem's momentum has moved to MCP and newer discovery surfaces, so treat agents.json as one declaration pattern rather than a settled standard. If the goal is for agents to complete tasks rather than just summarize the page, declaring the action surface is the step that makes that possible.

For an audit of a site's capability and action surface, contact info@turva.dev.

## Frequently asked

**What is agents.json?**

agents.json is a machine-readable file that declares what an AI agent can do on a site and how. It describes the actions and endpoints an agent is allowed to use, often pointing at an OpenAPI description, along with the authentication an agent needs.

**How is agents.json different from llms.txt?**

llms.txt tells an agent what the site contains. agents.json describes the actions an agent can take, so a site moves from something an agent can read to something an agent can operate.

**Does agents.json replace llms.txt?**

No. llms.txt tells an agent what the site contains and agents.json describes the actions an agent can take. Together they move a site from something an agent can read to something an agent can operate.

## Related

- [MCP server cards explained](/guides/mcp-server-card)
- [How agents authenticate](/guides/agent-authentication)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/x402-agent-payments": `# x402 and agent payments

x402 is a way for a site to ask an agent to pay before it returns a resource, using the long-reserved HTTP 402 Payment Required status. It lets an automated client discover a price, pay, and continue, without a human stepping in to enter card details.

When an agent requests a paid resource, the server responds with 402 and a manifest that states what is being sold and how to pay. The agent reads the terms, signs a payment payload for a supported method, and retries the request with the payload attached. The server or its facilitator then settles the payment. The transaction happens in the protocol, not in a checkout page built for human eyes.

This matters because agent commerce is held back by payment, not by capability. An agent can find a product and compare options, then stall at a checkout flow designed for a person with a browser. A declared payment surface such as x402, paired with structured pricing in the page data, lets the agent complete the purchase the same way it completed the search.

x402 belongs to a small family of agent payment standards, and its relationship to AP2 is worth stating precisely. They are separate specifications. AP2 defines the mandates and receipts that authorize a payment, and x402 defines an HTTP 402 payment flow that a separate extension, a2a-x402, carries into agent-to-agent work. As of September 2026 the AP2 project ships x402 scenarios among its own [samples](https://github.com/google-agentic-commerce/AP2/tree/main/code/samples/python/scenarios/a2a/human-present/x402) and the [a2a-x402 extension](https://github.com/google-agentic-commerce/a2a-x402) carries its own specification, so a site treats them as protocols it may support side by side rather than as one finished stack. A site that publishes these signals tells agents that it is open for automated business, and in the case of the open peer pricelist model, it can be shown alongside other options at the moment an agent decides where to spend.

turva.dev publishes an x402 endpoint and manifest. For an audit of a site's commerce surface for agents, contact info@turva.dev.

## Frequently asked

**What is x402?**

x402 is a way for a site to ask an agent to pay before it returns a resource, using the HTTP 402 Payment Required status. It lets an automated client discover a price, pay, and continue without a human entering card details.

**Why does agent commerce need a payment surface like x402?**

Agent commerce is held back by payment, not by capability. An agent can find a product and compare options, then stall at a checkout flow built for a person. A declared payment surface lets the agent complete the purchase the same way it completed the search.

**What stops an agent from completing a purchase today?**

The checkout, not the capability. An agent can find a product and compare options, then stall at a flow built for a person entering card details. A declared payment surface removes that stop.

## Related

- [Agent commerce discovery: A2A, AP2, and ACP](/guides/agent-commerce-discovery)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/response-headers-for-agents": `# Response headers that help agents

Response headers are the metadata a server sends with every page, and the right ones let an AI agent work without parsing the full HTML. They are the cheapest place to make a site more legible to automated clients, because an agent reads them before it reads the body.

A Link header can point an agent straight at a site's machine-readable resources, such as an API catalog or a markdown version of the page, so the agent finds them without crawling. A Vary header that includes Accept tells caches and agents that the site can return different formats for the same URL, which is what makes markdown content negotiation reliable. RateLimit-Policy states the quota a server enforces, and RateLimit adds the remaining allowance per client where the server tracks one, so a well-behaved agent can throttle itself instead of guessing. This site sends the policy header on every response and enforces it, and it keeps no per-client counter, so it sends no RateLimit header. As of July 2026 their [IETF draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/), revision 11 from May 2026, remains active without yet becoming a standard. Content-Language and a clean content type remove ambiguity about what the agent is reading.

The reason headers matter is order. An agent fetches the response, reads the status and headers first, and decides what to do next from them. If the headers already say where the structured data is and what formats are available, the agent can skip the expensive step of parsing a page built for human display.

Headers are easy to get wrong in ways that hurt agents. A missing Vary header breaks content negotiation. A Cache-Control immutable directive set on the wrong response can stop an agent from seeing an update. The fix is usually small and lives at the edge, which on turva.dev is a Cloudflare Worker that sets these headers on every response.

For an audit of a site's response and discovery surface, contact info@turva.dev.

## Frequently asked

**Which response headers help AI agents?**

A Link header points an agent at machine-readable resources such as an API catalog or a markdown version of the page. A Vary header that includes Accept makes markdown content negotiation reliable. A RateLimit-Policy header, and a RateLimit header where the server tracks a per-client allowance, let a well-behaved agent throttle itself, and Content-Language with a clean content type removes ambiguity.

**Why do response headers matter to agents?**

An agent reads the status and headers before the body and decides what to do from them. If the headers already say where the structured data is and what formats are available, the agent can skip parsing a page built for human display.

**Which header makes markdown content negotiation reliable?**

A Vary header that includes Accept. It is what keeps the negotiation reliable when the same URL can return more than one representation of the page.

## Related

- [Serving markdown to agents](/guides/markdown-for-agents)
- [Prerendering and why agents see empty pages](/guides/prerendering-for-agents)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/seo-vs-agent-readiness": `# SEO and agent-readiness are not the same

Search engine optimization makes a site rank in a list of links for a person to click. Agent-readiness makes a site legible and usable by an AI agent that reads, decides, and sometimes acts on the user's behalf. The two overlap, but optimizing for one does not deliver the other.

SEO is built around keywords, backlinks, and a results page where a human chooses. The page is the destination. Agent-readiness is built around machine-readable surfaces such as llms.txt, structured data, response headers, and well-known manifests, where the agent is the reader and the page may never be seen by a person at all. A site can rank well on Google and still be opaque to an agent, and a site can be highly legible to agents while ranking modestly in classic search.

The gap is widening as people ask assistants instead of typing queries. When an answer comes from a model rather than a list of links, ranking is not the only question. Whether the model can read the site cleanly and is willing to cite it matters too, and that depends on the discovery and content surface.

How much ranking still counts depends on the product. Google states that its generative features in Search are rooted in the same core ranking and quality systems, so the search work carries over there. An assistant that retrieves outside a search index is scored on other things, and an agent that reads a page to act on it is scored on none of them. A site that wants all of this has to do both sides, and the agent-readiness side is the one most teams have not started.

turva.dev measures the agent-readiness side and reports exactly which checks pass or fail. For an audit, contact info@turva.dev.

## Frequently asked

**Is agent-readiness the same as SEO?**

No. SEO makes a site rank in a list of links for a person to click. Agent-readiness makes a site legible and usable by an AI agent that reads, decides, and sometimes acts. A site can rank well and still be opaque to agents.

**Why does search ranking not guarantee presence in AI answers?**

It depends on the product. Google states that its generative features in Search use the same core ranking and quality systems, so ranking carries over there. An assistant that retrieves outside a search index cites a site when it can read the content cleanly and corroborate it, which depends on the discovery and content surface.

**Can a site rank well and still be invisible to agents?**

Yes. Ranking is scored on keywords and backlinks, while an agent needs to read the content cleanly and find the discovery surfaces. A page can win the search result and still be opaque to the client that reads it.

## Related

- [Agent-readiness, AEO and GEO: how they relate](/guides/agent-readiness-aeo-geo)
- [How to get your site cited by AI assistants](/guides/get-cited-by-ai-assistants)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/json-ld-structured-data": `# JSON-LD and structured data for agents

JSON-LD is a block of structured data in a page that states facts in a form a machine can read without interpreting prose. It tells an agent what the page is about, who runs it, what it sells, and at what price, as data rather than as sentences an agent has to parse and might misread.

A human reads a price from a layout and a currency symbol. An agent reading raw HTML has to guess which number is the price and which is a shipping estimate. A JSON-LD Offer with a price and a currency removes the guess. The same applies to the organization behind a site, the services it offers, and the questions it answers, each expressed as a typed object an agent can rely on.

Structured data also connects a page to the wider graph an agent builds. Declared types such as Organization, Service, FAQPage, and Article let an agent place a page in context. They do not make a claim true and they oblige nobody to cite it. What they remove is parsing ambiguity, and trust and citation stay decisions of the system that reads the page.

The cost of getting it wrong is silent. An agent does not report that it failed to parse a price, it just acts on a worse guess. Clean JSON-LD is one of the cheapest ways to make a page legible, and it sits in the same family as the response headers and well-known manifests an agent reads first.

The opposite failure is data that parses and is wrong. A product page that publishes a price of 0 and an availability of InStock on every item is structurally valid, and an agent that trusts it will offer a customer a free product that is in stock. An Organization node whose email field holds a first name validates just as well. Wrong data is worse than missing data, because missing data makes an agent guess and wrong data makes it confident. The check is the one a buyer would make: read the JSON-LD next to the page and ask whether the two say the same thing.

turva.dev declares JSON-LD for its organization, the person behind it, its services, and its guides, and the next scan reads the structured data as present. For an audit of a site's structured data, contact info@turva.dev.

## Frequently asked

**What is JSON-LD?**

JSON-LD is a block of structured data in a page that states facts in a form a machine can read without interpreting prose. It tells an agent what the page is about, who runs it, what it sells, and at what price, as data rather than sentences.

**Why does structured data matter for agents?**

An agent reading raw HTML has to guess which number is a price and which is a shipping estimate. A JSON-LD Offer with a price and a currency removes the guess, and declared types let an agent place a page in context. Trust and citation stay decisions of the system that reads the page.

**What should JSON-LD state on a page?**

What the page is about, who runs it, what it sells and at what price, as data rather than sentences. An Offer with a price and a currency removes the guess an agent would otherwise make.

**Can structured data be valid and still wrong?**

Yes. A price of 0 with an availability of InStock on every product passes every syntax check and tells an agent the whole catalog is free, and a contact field holding the wrong kind of value validates the same way. A syntax validator reads the shape, so a person has to compare the data with the page it describes.

## Related

- [How to get your site cited by AI assistants](/guides/get-cited-by-ai-assistants)
- [llms.txt explained](/guides/llms-txt)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/well-known-for-agents": `# The /.well-known directory for agents

The /.well-known directory is a standard place at the root of a site where agents look for machine-readable descriptions of what the site offers. Instead of crawling pages and guessing, an agent fetches a predictable path and reads a manifest that points it to everything else.

The idea comes from a long-standing web convention and now carries the files agents care about. An API catalog at a well-known path, defined by RFC 9727, lets an agent enumerate a site's public APIs from a single URL. A server card describes an MCP server and how to reach it. Deployed cards, turva.dev's among them, sit at /.well-known/mcp/server-card.json. The experimental Server Card specification reserves the MCP endpoint URL followed by /server-card as its default and expects a client to follow the URL the site's catalog gives. OAuth metadata describes how to authenticate. Payment and agent-payment manifests describe how to transact. security.txt says where to report a problem.

The value is that discovery becomes a lookup rather than a search. An agent that knows the convention can ask one predictable question and get a map, which is faster and far more reliable than inferring structure from rendered HTML. A site that publishes a complete well-known surface is announcing its capabilities in the language agents already speak.

A missing or thin well-known directory does not break a site for people, but it leaves an agent to guess, and most agents will simply move on. Publishing the manifests an agent expects is the difference between a capability that exists and a capability an agent can find.

turva.dev publishes an API catalog, a server card, OAuth metadata, payment manifests, and a security contact under /.well-known. For an audit of a site's discovery surface, contact info@turva.dev.

## Frequently asked

**What is the /.well-known directory?**

The /.well-known directory is a standard place at the root of a site where agents look for machine-readable descriptions of what the site offers. An agent fetches a predictable path and reads a manifest that points it to everything else.

**What files do agents look for under /.well-known?**

An API catalog defined by RFC 9727, an MCP server card, OAuth metadata, payment and agent-payment manifests, and a security contact. Each one turns discovery into a lookup rather than a search. The MCP card is the one whose home is still moving: deployed cards use /.well-known/mcp/server-card.json, the experimental specification defaults to the MCP endpoint URL plus /server-card and does not recommend a well-known path for the card itself.

**Why do agents use the well-known directory instead of crawling pages?**

Because it turns discovery into a lookup rather than a search. An agent fetches a predictable path and reads a manifest that points it to everything else, instead of inferring capabilities from navigation.

## Related

- [MCP server cards explained](/guides/mcp-server-card)
- [How agents authenticate](/guides/agent-authentication)
- [Sitemaps, robots.txt and agent access](/guides/sitemaps-and-robots-for-agents)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/agentic-resource-discovery": `# Agentic Resource Discovery and ai-catalog.json

Agentic Resource Discovery, or ARD, is an open specification for telling AI agents what a site offers, in one machine-readable file. Instead of inferring from pages whether a site has an MCP server, an agent interface, or an API, the site publishes a single index that names each resource and where to reach it. The specification appeared in 2026, is licensed under Apache 2.0, and builds on the AI Catalog data model maintained by a working group under the Linux Foundation, as its [June 2026 announcement](https://developers.googleblog.com/announcing-the-agentic-resource-discovery-specification/) states.

## What it is

A site advertises its agentic resources by serving a static JSON manifest under /.well-known. ARD v0.91, published 26 August 2026, names the file /.well-known/ard.json and the link relation ard, and a conformant client MUST read those. The predecessor path /.well-known/ai-catalog.json and the relation ai-catalog are optional for a client, so a site that serves only the old path may not be found by a client that follows the current revision. The manifest is a small envelope with a specVersion, a host block that names the operator, and an entries array. Each entry describes one resource with a stable identifier, a display name, a type, a url, and a short description. A resource can be an MCP server, an A2A agent, an API, or a skill set. The work is early: the repository that carries it calls itself a temporary working repo and its field names are still being argued in pull requests, so validate a manifest against the draft the client you care about actually reads. A registry can crawl published catalogs and answer a capability query by pointing an agent at the right resource.

## Where it sits

ARD is a discovery layer, not a transport. It helps an agent find the right resource, which the agent then calls through that resource's own protocol, whether MCP, A2A, or a plain API. Discovery comes first and invocation second. The catalog does not replace the manifests it points to, it indexes them, so a site keeps its server card, its agent card, and its OpenAPI description, and adds one file that ties them together.

## How it relates to llms.txt

An ai-catalog.json is not a ranking trick and it is not a content map. llms.txt tells an agent where a site's content lives. An ai-catalog tells an agent which agentic resources the site exposes and how to reach them. The two are complementary, and neither is about search ranking. Google [has said publicly](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) that llms.txt does not affect its search results, which is the same point agent-readiness has always made. These files are for agents that read and act.

## Why it matters

Adoption is early. In a June 2026 check I ran against their public well-known paths, none of the launch partners the [announcement](https://developers.googleblog.com/announcing-the-agentic-resource-discovery-specification/) shows yet served a discoverable ai-catalog.json, so publishing one now is a forward move rather than table stakes. The value is the same as every other discovery surface. A capability an agent cannot find is a capability that does not exist for that agent, and one predictable file turns a set of separate manifests into a single answer.

turva.dev serves the same entries at both paths: /.well-known/ard.json with the v0.91 media types and rel="ard" in every page head, and /.well-known/ai-catalog.json for clients and scanners that still read the predecessor. Both index its MCP server, its A2A agent, its API, and its agent skills, each of which already resolves on its own. The separate experimental MCP Server Card discovery document keeps its own convention, an AI Catalog at /.well-known/ai-catalog.json, so the two profiles are described apart and not merged. For an audit of a site's discovery surface, contact info@turva.dev.

## Frequently asked

**What is an ai-catalog.json?**

An ai-catalog.json is a static JSON manifest at /.well-known/ai-catalog.json that lists the agentic resources a site offers, such as its MCP server, A2A agent, and API, each with an identifier, type, url, and description, so agents and registries can discover them from one file. Since ARD v0.91 the same manifest shape is published as /.well-known/ard.json, and ai-catalog.json is the predecessor path that a client may still consult.

**Does Agentic Resource Discovery affect search ranking?**

No. ARD is a discovery layer for AI agents, not a search file. It indexes the resources an agent can call through their own protocols. Google has said publicly that llms.txt does not affect its search results, the guide above links the statement, and the same applies to an ai-catalog.

**Where does an ai-catalog.json live?**

Under ARD v0.91 at /.well-known/ard.json, announced with a link rel="ard" in the page head. A client MUST read that path and MAY also consult the predecessor /.well-known/ai-catalog.json. Serve ard.json, and keep ai-catalog.json while clients and scanners still read it. Agents and registries read the resources a site offers from that path instead of inferring them from its pages.

## Related

- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [MCP server cards explained](/guides/mcp-server-card)
- [Agent commerce discovery: A2A, AP2, and ACP](/guides/agent-commerce-discovery)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/agent-authentication": `# How agents authenticate

Agent authentication is how an automated client proves who it is and gains scoped access to a site, without a human logging in first. It is the step that turns a read-only agent into one that can act on a user's behalf, and it has to be discoverable or the agent cannot begin.

The pattern follows existing standards. OAuth discovery at a well-known path tells an agent where to request access and what scopes exist. An authorization server and a protected resource description let the agent ask for a token tied to a specific permission rather than a blanket login. When a site also advertises an agent registration flow, an agent can register and claim access on a user's behalf without someone provisioning credentials by hand.

The reason this matters is trust and blast radius. A site that exposes capability without scoped, discoverable auth either stays closed to agents or invites unsafe workarounds. Proper discovery lets an agent request the least access it needs, and lets the site grant capability without handing over a password the agent should never see.

A short auth description, sometimes published as an auth.md, gives an agent a human-readable entry point to the same flow. It is a convention rather than a standard, and as of September 2026 it is two conventions: the recipe the isitagentready.com scanner publishes and the open protocol WorkOS publishes name three of the same fields differently, which is read in full in the post linked below. The OAuth metadata documents define the machine-readable discovery and say nothing about a written page or a registration route, so an agent follows only the endpoints a site advertises for itself. Together with OAuth discovery it answers the agent's first question about any action, which is how do I get permission to do this safely.

turva.dev publishes OAuth discovery, a protected resource description, and an agent registration entry point, and it never requests production credentials in an engagement. For an audit of a site's authentication surface, contact info@turva.dev.

## Frequently asked

**How do AI agents authenticate?**

An agent proves who it is through discoverable standards such as OAuth discovery at a well-known path, which tells it where to request access and what scopes exist. It can then request a token tied to a specific permission rather than a blanket login.

**Why does scoped, discoverable auth matter?**

A site that exposes capability without scoped auth either stays closed to agents or invites unsafe workarounds. Proper discovery lets an agent request the least access it needs without handling a password it should never see.

**What does an agent need to discover before it can authenticate?**

Where to request access and what scopes exist. OAuth discovery at a well-known path tells it both, so it can request a token tied to a specific permission rather than a blanket login.

## Related

- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [MCP server cards explained](/guides/mcp-server-card)
- [What agents.json is](/guides/agents-json)
- [Letting agents act on data: the decision envelope](/guides/letting-agents-act-on-data)
- [Two files called auth.md, and they disagree on the field names](/blog/two-auth-md-dialects)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/measurement-led-agent-readiness": `# Why agent-readiness should be measured, not asserted

Agent-readiness is a property you can measure, so it should be measured rather than claimed. A checklist that a team fills in by hand records intentions. An independent scanner records what an agent actually finds when it reads the site, and those two often disagree.

The difference shows up the moment something changes. A header gets dropped in a deploy, or a manifest starts returning the wrong content type. A self-assessment still reads as done, because nobody re-ticked the box. A scan reads the live site and the category drops, which is the only signal that matches what an agent experiences.

Measurement also makes a result legible to a buyer. A claim that a site is agent-ready is an assertion. A score from an independent scanner, with a category breakdown and a date, is evidence that can be checked. The honest version of the claim is the number, and the number can be re-run by anyone.

This is the standard turva.dev applies to its own site and to client sites. An audit reports the exact checks that pass or fail, each failure comes with a concrete fix, and the next scan reads higher in the categories the report named. Measured by an independent scanner, turva.dev reaches 100/100 and Level 5, Agent-Native, on isitagentready.com. Measured 2026-09-01. A later scan can read a different check set, so it is reported as a new measurement and never as a re-confirmation of the old one.

For an audit that reports measured results rather than a checklist, contact info@turva.dev.

## Frequently asked

**Why should agent-readiness be measured rather than asserted?**

A checklist filled in by hand records intentions. An independent scanner records what an agent actually finds when it reads the site, and the two often disagree, especially after a deploy drops a header or changes a content type.

**What makes a measured result more credible to a buyer?**

A claim that a site is agent-ready is an assertion. A score from an independent scanner, with a category breakdown and a date, is evidence anyone can re-run. The honest version of the claim is the number.

**Why can a site pass a checklist and still fail a scan?**

Because a checklist filled in by hand records intentions and a scanner records what an agent actually finds. The two often disagree, especially after a deploy drops a header or changes a content type.

## Related

- [What an agent-readiness audit is](/guides/agent-readiness-audit)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Common agent-readiness gaps on marketing sites](/guides/agent-readiness-gaps)
- [Letting agents act on data: the decision envelope](/guides/letting-agents-act-on-data)
`,

  "/guides/prerendering-for-agents": `# Prerendering and why agents see empty pages

Many sites render their content with JavaScript in the browser, which means the first response an agent receives is an almost empty shell. A person waits a moment and the page fills in. An agent that reads the raw response sees a loading state and little else, and it judges the site on that.

In the audits I have run, this is the most common reason a capable site is invisible to agents. The content exists, but it arrives after the agent has already read and moved on. Search crawlers have partly adapted to this over years. Many AI agents and fetchers have not, and they take the first response at face value.

The fix is to serve the real content in the first response for clients that need it. Prerendering renders the page on the server or at the edge and returns finished HTML, so an agent reads the content immediately. A cleaner option for agents is to serve a markdown version of the page on request, which skips the rendering question entirely and costs a fraction of the tokens.

The decision is not all or nothing. A site can keep its interactive experience for people and serve prerendered or markdown content to agents and bots, deciding by the request. On turva.dev that decision lives in a Cloudflare Worker that reads the request's Accept header and returns the right form.

For an audit of how a site renders for agents, contact info@turva.dev.

## Frequently asked

**Why do AI agents see empty pages?**

Many sites render content with JavaScript in the browser, so the first response is an almost empty shell. A person waits and the page fills in, but an agent reads the raw response, sees a loading state, and judges the site on that.

**How do you fix empty pages for agents?**

Serve the real content in the first response for clients that need it, through prerendering at the server or edge, or serve a markdown version of the page on request, which skips rendering and costs a fraction of the tokens.

**Is prerendering the only fix for empty pages?**

No. Serving a markdown version of the page on request also works, and it skips rendering and costs a fraction of the tokens. Either way the real content has to be in the first response.

## Related

- [Serving markdown to agents](/guides/markdown-for-agents)
- [Response headers that help agents](/guides/response-headers-for-agents)
- [Common agent-readiness gaps on marketing sites](/guides/agent-readiness-gaps)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/sitemaps-and-robots-for-agents": `# Sitemaps, robots.txt and agent access

robots.txt and the sitemap are the oldest machine-readable files on the web, and they still decide whether an agent is allowed in and what it can find. A well-behaved agent reads robots.txt to learn the rules and the sitemap to learn the map before it reads any page. Not every client does either, so these files set the terms for the agents that follow them rather than for all traffic.

robots.txt does two jobs for agents. It sets crawl rules, and it can name AI crawlers explicitly, so a site states whether it welcomes GPTBot and similar clients rather than leaving them to guess. A Content-Signal directive can go further and declare how content may be used, separating ordinary search from AI input and training, which states a granular preference instead of an all-or-nothing block. It is a stated preference and not an enforcement mechanism, and the Content Signals documentation says plainly that some automated systems may ignore it.

The sitemap answers the other question, which is what exists. A complete sitemap lists every canonical URL, so an agent can find the real pages without inferring them from navigation. A last-modified date is optional in the sitemaps protocol and still worth publishing, because it tells a returning client what changed. The sitemap is a hint to the client rather than a guarantee that anything gets fetched. A page that is not in it is still a page an agent may never reach.

Getting these wrong is quietly expensive. A robots.txt that blocks an AI crawler by accident stops that crawler from fetching the pages and can keep the content out of what it feeds. It does not by itself remove the site from an assistant's answers, because OpenAI separates OAI-SearchBot for search from GPTBot for training and an answer can still name a page through another source. A stale sitemap hides new pages. The files are small and the fix is fast, which is why they are the first thing a readiness review checks. In [a scan of 567 company sites](/blog/website-agent-readiness-567-sites) finished in September 2026, robots.txt and the sitemap were the two most frequent first-fix subjects among the 74 sites that read Level 0: 45 and 38 of 68 notes, and 29 named both, usually a robots.txt the CMS shipped by default and a sitemap that was missing or never announced in it.

turva.dev declares AI bot rules and Content Signals in robots.txt and keeps a complete sitemap. For an audit of a site's crawl and access surface, contact info@turva.dev.

## Frequently asked

**How do robots.txt and the sitemap affect AI agents?**

A well-behaved agent reads robots.txt to learn the rules and the sitemap to learn the map before it reads any page, though not every client does either. robots.txt can name AI crawlers explicitly, and the sitemap lists every canonical URL so an agent finds the real pages without inferring them from navigation.

**What is a Content-Signal directive in robots.txt?**

A Content-Signal directive declares how content may be used, separating ordinary search from AI input and training. It states a granular preference instead of an all-or-nothing block, and its own documentation says some automated systems may ignore it.

**Can robots.txt name AI crawlers specifically?**

Yes. robots.txt can name AI crawlers explicitly rather than treating every client the same, and a Content-Signal directive separates ordinary search from AI input and training. Both express a preference that a client can ignore.

## Related

- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [Response headers that help agents](/guides/response-headers-for-agents)
- [How to get your site cited by AI assistants](/guides/get-cited-by-ai-assistants)
- [Website agent readiness, measured on 567 company sites](/blog/website-agent-readiness-567-sites)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/markdown-for-agents": `# Serving markdown to agents

An HTML page is built for a browser, and an agent that reads it pays for all the markup, scripts, and layout it does not need. Serving a markdown version of the same page gives an agent the content without the wrapper, which is both cheaper and less error-prone.

The mechanism is content negotiation. An agent sends an Accept header asking for text/markdown, and the server returns the markdown form of the page at the same URL. Since v2 of the llms.txt proposal there is a second way in. The markdown form also lives at its own address. A plain page URL takes .md appended, a URL ending in .html has that suffix replaced, and a directory-style URL takes an index form. The page points at that address with rel="alternate" type="text/markdown", so a client that never sends an Accept header can still find it. A client that reads neither signal gets the HTML, which is why the markdown form is an addition to the page and never a replacement for it. A site can also publish llms-full.txt, a single file that bundles the whole site as text, so an agent can read everything in one request instead of fetching many pages.

The saving is large. On turva.dev the markdown form of a page costs a fraction of the tokens the HTML would, and the difference decides whether an agent reads a page in full or truncates it halfway. A model that runs out of budget on markup is a model that answers from a partial reading.

Markdown delivery is not a separate site, it is the same content offered in a second form. The page stays as it is for people, and an agent that asks for text gets text. Paired with a clear llms.txt that lists where the content lives, it makes a site fast and reliable to read at machine speed.

turva.dev serves markdown on request and publishes llms.txt and llms-full.txt. Every page also answers at its own .md address, and /guides/markdown-for-agents and /guides/markdown-for-agents.md return the same markdown byte for byte. For an audit of a site's content surface for agents, contact info@turva.dev.

## Frequently asked

**Why serve markdown to AI agents?**

An HTML page is built for a browser, and an agent that reads it pays for all the markup, scripts, and layout it does not need. A markdown version gives the content without the wrapper, which is cheaper and less error-prone.

**How does an agent request the markdown version?**

Through content negotiation. An agent sends an Accept header asking for text/markdown and the server returns the markdown form at the same URL. Since v2 of the llms.txt proposal the markdown form also has its own address, the page URL with .md appended, which a client can fetch without sending any header. A site can also publish llms-full.txt to bundle the whole site as text in one request.

**What does an agent pay for when it reads an HTML page?**

The markup, scripts and layout it does not need. That cost is counted in tokens, so a page built for a browser is expensive for a client that only wants the text.

## Related

- [llms.txt explained](/guides/llms-txt)
- [Response headers that help agents](/guides/response-headers-for-agents)
- [Prerendering and why agents see empty pages](/guides/prerendering-for-agents)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/agent-readiness-gaps": `# Common agent-readiness gaps on marketing sites

Marketing sites are often strong for people and weak for agents, and the gaps are predictable. The evidence here is [a scan of 567 company sites](/blog/website-agent-readiness-567-sites) with one independent scanner between 28 June and 3 September 2026, which grew out of [an earlier write-up of sixteen Finnish sites](/blog/agent-readiness-finnish-b2b). The sample is a prospecting list and not a random draw, so read it as what recurred in the sites reviewed rather than as a count of the whole web. Of the 567 sites, 485 read Level 1 of 5, the floor an ordinary CMS reaches, and 74 read Level 0, below it. A readiness review tends to find the same handful of misses, each of which quietly removes the site from an agent's view.

The first is rendering. A site that builds its content with JavaScript returns an empty shell to any agent that does not run a browser, so for those clients the content never arrives in the first response. The second is discovery. No llms.txt and a thin or missing sitemap, so an agent has nothing to read but rendered pages. The third is cost. Only HTML is offered, with no markdown form, so an agent spends its budget on markup and truncates the page.

The scan puts numbers on the order. Among the 74 Level 0 sites, 68 have a first-fix note, and robots.txt appears in 45 of those notes and the sitemap in 38, with 29 naming both: a robots.txt the CMS shipped by default and a sitemap that is missing or never announced in it. Among the 439 Level 1 sites with a note, the sitemap appears in 102, llms.txt in 99, robots.txt in 72, structured data in 49 and an MCP server in 35. Level 1 is where the site can be found and the rest is missing.

Beyond those, capability is usually undeclared. The site may have an API or a useful action, but with no server card or OAuth discovery, an agent cannot find or use it. Structured data is often missing too, so prices and facts are left for the agent to infer from layout.

None of these are hard to fix, and that is the point. The work is mostly at the edge and in a few small files, and the result shows up immediately in a scanner. A site does not have to rebuild to become legible to agents, it has to publish what agents already look for.

turva.dev runs this exact review and reports each gap with a concrete fix. For an audit, contact info@turva.dev.

## Frequently asked

**What are the most common agent-readiness gaps on marketing sites?**

Client-side rendering that returns an empty shell to non-browser agents, no llms.txt and a thin or missing sitemap, and HTML-only delivery with no markdown form. Capability is usually undeclared and structured data is often missing, so prices and facts are left for the agent to infer.

**Are agent-readiness gaps hard to fix?**

No. The work is mostly at the edge and in a few small files, and the result shows up immediately in a scanner. A site does not have to rebuild to become legible to agents, it has to publish what agents already look for.

**Which gap costs a marketing site the most?**

Client-side rendering that returns an empty shell to non-browser agents. Nothing else on the page matters if the first response carries no content, and prices and facts are then left for the agent to infer.

## Related

- [What an agent-readiness audit is](/guides/agent-readiness-audit)
- [Prerendering and why agents see empty pages](/guides/prerendering-for-agents)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/choosing-an-agent-readiness-audit": `# Choosing an agent-readiness audit

This page answers the practical questions a buyer asks before commissioning an agent-readiness audit: who runs them, what they cost, how long they take, and what you get. The conceptual guides cover the surfaces themselves. This one covers the engagement.

## Frequently asked

**Who provides agent-readiness audits?**

turva.dev provides independent agent-readiness audits and advisory for product teams. It is a registered business in Tampere, Finland (Business ID 3600281-7), run by Erik Rekola. The audit measures a site or API against current standards using an independent public scanner plus published security scans, then returns a written report with prioritized fixes.

**What does an agent-readiness audit cost?**

turva.dev prices an audit at a fixed €4,300 for a two week engagement. The Shopify agent storefront check is a separate fixed-scope diagnosis at €999, delivered within 48 hours of the agreed written kickoff. Advisory is €3,000 per month with a three month minimum, and implementation is €1,500 per day, scoped per task. Prices exclude VAT, and the scope is written before any payment.

**How long does an agent-readiness audit take?**

A fixed-scope audit takes two weeks. The Shopify agent storefront check is delivered within 48 hours of the agreed written kickoff, with a retest of up to two corrected items within 14 days. Advisory and implementation run on the cadence the engagement sets.

**What do you get from an agent-readiness audit?**

A written report that lists each check, what the scanner found, and a concrete fix for each gap, ordered by priority. The result is verifiable. An independent scanner reads the site before and after, and the categories that were fixed read higher on the next scan.

**How do I make my site agent-ready?**

Publish the surfaces agents read, then measure the result. That means llms.txt, a markdown form of each page, a complete robots.txt and sitemap, JSON-LD for the facts on a page, the /.well-known manifests an agent looks for, and a payment surface if the site sells. Each of these has its own guide in the index.

**How does the engagement work?**

Async only. No calls, no calendar links, no discovery meetings. Replies within one business day. Fixed scope per engagement, written before payment, and an open-source reference implementation you can read before deciding.

For an audit, contact info@turva.dev.

## Related

- [What an agent-readiness audit is](/guides/agent-readiness-audit)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps on marketing sites](/guides/agent-readiness-gaps)
`,

  "/guides/agent-readiness-aeo-geo": `# Agent-readiness, AEO and GEO: how they relate

Three terms describe overlapping work, and the difference matters when you decide what to fix. Answer engine optimization, AEO, is about the pages, so an AI engine can quote them as the answer to a question. Generative engine optimization, GEO, is about the signal around the pages, so an engine has something to weigh when it decides whether to cite the source. Both are working labels rather than standardized disciplines, and neither one buys a citation. Agent-readiness is wider than both, because it also covers whether an agent can act on the site, not only read and cite it.

## At a glance

| Discipline | What it optimizes | Who consumes it | A typical fix |
| --- | --- | --- | --- |
| SEO | Ranking on a results page | A person choosing a link | Keywords, backlinks, page speed |
| AEO | A page an engine can quote | An AI answer engine | Schema, quotable passages, clear facts |
| GEO | The trust signal around the page | An engine deciding what to cite | Citations, directories, a resolved entity |
| Agent-readiness | What an agent can read and act on | An AI agent that acts | llms.txt, MCP, APIs, commerce endpoints |

## Answer engine optimization

AEO engineers the page itself. Structure, schema, source density, and passages an engine can lift cleanly. The practical test is whether the first sentence under a heading stands alone as a quotable answer, and whether the facts on the page are stated as data rather than buried in prose. Most of what makes a page AEO-ready also makes it agent-readable, because both depend on a machine reading the content without guessing.

## Generative engine optimization

GEO engineers the trust signal. Directories, citations across independent sources, a consistent description of who you are, and a knowledge-graph entity an engine can resolve. An engine cites a source when several places agree on the same thing. AEO gives the engine something to quote. GEO gives it a reason to trust the quote. One without the other underperforms.

## Where agent-readiness goes further

AEO and GEO stop at being read and cited. Agent-readiness adds the surfaces an agent needs to do something. An MCP server it can call, an API catalog it can enumerate, authentication it can pass, and commerce endpoints it can transact against. A site can be perfectly quotable and still give an agent nothing to act on. The reverse is also common, an API an agent could use that no engine can find.

## How to sequence the work

Measure first, because the three overlap and you do not want to pay for the same fix twice. A scan shows which AEO and agent surfaces are present and which are missing. The page-level gaps are usually AEO and agent-readiness work, fixable on the site itself. The trust gaps are GEO work, earned offsite over time. The point of measuring is to spend effort where an engine or an agent actually changes its behavior, not where a checklist says you should.

For a measured audit across agent-readiness, AEO and the agent surfaces an engine cannot see, contact info@turva.dev.

## Frequently asked

**What is the difference between AEO and GEO?**

AEO engineers the page so an engine can quote it, through structure, schema and passages that stand alone. GEO engineers the trust signal around the page. AEO gives the engine something to quote, GEO gives it a reason to trust the quote.

**How is agent-readiness wider than AEO and GEO?**

AEO and GEO stop at being read and cited. Agent-readiness adds the surfaces an agent needs to act on, such as an MCP server it can call, an API catalog it can enumerate, authentication it can pass and commerce endpoints it can transact against.

**In which order should AEO, GEO and agent-readiness work be done?**

Measure first, because the three overlap and the same fix should not be paid for twice. Page-level gaps are AEO and agent-readiness work and are fixable on the site. Trust gaps are GEO work, earned offsite over time.

## Related

- [SEO and agent-readiness are not the same](/guides/seo-vs-agent-readiness)
- [How to get your site cited by AI assistants](/guides/get-cited-by-ai-assistants)
- [llms.txt explained](/guides/llms-txt)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,
  "/guides/agentic-commerce-readiness": `# Agentic commerce readiness: selling to AI shopping agents

An AI shopping agent buys on a person's behalf. It reads a catalog, compares options, and completes a checkout without a human filling in a form. Agentic commerce readiness is the work of making a site one of those agents can actually transact with, rather than one it skips because the path is unclear or blocked.

## What an agent needs to buy

An agent needs three things in machine-readable form. It needs to find the offer, with a price and currency it can parse rather than infer from a layout. It needs a checkout it can drive through a protocol, not a page built for a mouse. And it needs the purchase to behave predictably, so the same call produces the same result every time. A catalog that looks perfect to a person can still be opaque to an agent on all three counts.

## The protocols in play

Checkout is becoming a protocol rather than a page. OpenAI documents the Agentic Commerce Protocol as the connective layer between merchants and shoppers in ChatGPT. Google and Shopify introduced the Universal Commerce Protocol in early 2026, and it now carries its own discovery manifest at /.well-known/ucp. The discovery layer is settling on a small set of standards. An A2A Agent Card describes the interface, AP2 authorizes agent payments, ACP carries the checkout, and x402 lets an agent meet a price with HTTP 402 and continue. A site does not need all of them. It needs the ones its buyers' agents speak, declared where an agent looks.

## Where the protocol draws the line

UCP writes down the boundary between what an agent may finish alone and what a person has to approve. Its checkout capability is a state machine, and one of its states, requires_escalation, means programmatic execution is blocked by something like age verification or a regulatory step. Escalation is not failure. The specification defines an Embedded Checkout Protocol, which is checkout's own use of the shared Embedded Protocol transport rather than a mechanism built for escalation alone. It can carry an embedded checkout through a whole session, including the steps where the buyer has to enter something or approve something. When the checkout state says requires_escalation, the platform can hand the buyer to a continue_url instead, so the session is not thrown away. The cart carries a signals object for abuse prevention, and the specification is explicit that its values must not be buyer-asserted claims. A site that treats escalation as a dead end loses the sale at the exact point where a human was willing to finish it.

## Where sites fail the agent

Most catalogs lose the agent before checkout. A price that lives only in rendered HTML, a CAPTCHA wall, a maintenance interstitial, or a discovery file that claims a capability the endpoint does not answer. Each one ends the purchase silently. The agent does not complain, it moves to a competitor whose path resolves. The failure looks like no traffic rather than a broken page, which is why it goes unmeasured.

## Readiness is testable

Whether an agent can buy is observable, the same way agent-readiness is. Declare the offer as structured data, expose a checkout an agent can call, publish the discovery files the protocols define, and back every claim with an endpoint that answers. Then test it the way an agent would, by driving the path end to end and watching where it stops. turva.dev built and verified its own agent commerce surface this way, across A2A, AP2, ACP and x402, checked by an independent scanner.

For an audit of whether AI shopping agents can discover and complete a purchase on your site, contact info@turva.dev.

## Frequently asked

**What does an AI shopping agent need in order to buy?**

An offer with a price and currency it can parse rather than infer from a layout, a checkout it can drive through a protocol instead of a page built for a mouse, and a purchase that behaves predictably, so the same call produces the same result.

**What does requires_escalation mean in UCP?**

That programmatic execution is blocked by something like age verification or a regulatory step. It is not failure. The Embedded Checkout Protocol lets a person complete the blocking step without the session being thrown away.

**Why does a failed agent purchase look like no traffic?**

Because the agent does not complain. A price that lives only in rendered HTML, a CAPTCHA wall, or a discovery file that claims a capability the endpoint does not answer ends the purchase silently, and the agent moves to a competitor whose path resolves.

## Related

- [Agent commerce discovery: A2A, AP2, and ACP](/guides/agent-commerce-discovery)
- [x402 and agent payments](/guides/x402-agent-payments)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,
  "/guides/letting-agents-act-on-data": `# Letting agents act on data: the decision envelope

Reading a site is the first step. The harder one is letting an agent act on a system that matters, where a wrong move has a cost. That depends on two things the model does not provide on its own. The data the agent works from has to arrive intact, and the decisions it is allowed to make have to sit inside a boundary you set.

## A decision is only as good as its inputs

An agent's decision is bounded by the data that reaches it. In a clean environment that is invisible. Where the work happens it is the whole problem, because a dropped link, a delayed hop, or a lost packet can leave the agent working from stale input. The model did not get worse, its inputs did. Reliability lives in the layer below the model, where data either arrives in order and on time or it does not.

## The envelope is the real control

A correct decision is not an agent doing whatever it infers. It is an agent acting inside an envelope defined for it, the permissions, the thresholds, and the explicit list of what it may touch and what it may not. The judgment is front-loaded into that boundary by a person who knew the stakes. Draw it loosely and a capable agent still does something, just not what you wanted. Draw it well and the same agent is one you can leave alone.

## The envelope is starting to appear in protocols

Commerce is the first place the boundary got written down. The Universal Commerce Protocol carries a checkout state called requires_escalation, which means the agent has reached the edge of what it may finish alone and a person has to complete the step. AP2 does the same on the payment side, where a mandate records the limits the user agreed to before the agent acted. Both encode a decision somebody made in advance. Decision envelope is the name this guide gives that pattern, and neither specification uses the term, so do not go looking for it in either document. Neither decides for you where the line sits, and that is a judgment about which actions are reversible and who carries the cost when one is not.

## Keep a person where judgment belongs

Letting agents act is not removing people. The stronger pattern carries a human expert's judgment to where the work is and lets the agent handle the parts that have to be instant or exact, with a clear point where control passes back. The hardest version is where no person can step in fast enough, so the decision has to be made locally under rules agreed in advance. The fields that work under that constraint learned the discipline first.

## Make it checkable

An agent that acts has to be auditable. Log what it decided and why, keep the envelope explicit rather than implied, and verify after the fact that it stayed inside the boundary. Guardrails have to be checkable to count. That separates an agent that is impressive in a demo from one you would let touch a real operation.

This is the work behind the Agent operations engagement. For a review of the data path, the decision envelope, and where a human stays in the loop, contact info@turva.dev.

## Frequently asked

**What is a decision envelope?**

The permissions, the thresholds and the explicit list of what an agent may touch and what it may not. The judgment is front-loaded into that boundary by a person who knew the stakes, so a correct decision is the one the envelope allowed.

**Where is the decision envelope written down in a protocol?**

In commerce first. UCP carries a checkout state called requires_escalation, where the agent has reached the edge of what it may finish alone. AP2 does the same on the payment side, where a mandate records the limits the user agreed to beforehand.

**What makes an acting agent auditable?**

A log of what it decided and why, an envelope that is explicit rather than implied, and a check after the fact that it stayed inside the boundary. Guardrails have to be checkable to count.

## Related

- [How agents authenticate](/guides/agent-authentication)
- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
- [AI agent use cases](/guides/ai-agent-use-cases)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,
  "/guides/ai-agent-use-cases": `# AI agent use cases

An AI agent is useful wherever data moves and a decision follows. It reads a machine-readable surface, decides inside the limits it was given, and acts on what it finds. The cases below are grouped by what the agent does, not by industry, because the same pattern repeats across all of them.

## Commerce and transactions

An agent reads a product catalog, weighs the options against a buyer's constraints, and completes a checkout through a protocol rather than a form. The work is making the offer, the price, and the checkout legible and reliable enough for the agent to finish without a human in the loop.

## Monitoring and response

An agent watches an API, a feed, or a system and acts the moment a threshold is crossed, with no one having to be watching. The work is a clean data path so the signal arrives in time, and a tight envelope so the agent takes only the actions it is allowed to.

## Field and frontline support

An agent guides a person doing physical work, drawing on the same data an expert would and answering from it in the moment. The agent extends the expert's reach instead of standing in for the person at the far end.

## Operations under bad connectivity

An agent runs a remote system over a link that drops, holding its last safe state and resuming when data returns. This is where the data path matters most. A lost packet delays delivery and can trigger recovery, and whether the decisions queued behind it stall depends on the transport and on how the application treats state that has gone stale.

## Back-office and data work

An agent reconciles records across systems, flags only what does not match, and routes the rest. The value is consistency, a decision the agent makes the same way every time, with a trail you can audit afterwards.

## Autonomy at the edge

An agent makes a time-critical call locally, where the round trip to a human is too slow to matter. The decision has to sit inside rules agreed in advance, because there is no one to ask. The fields that already live with hard time limits learned that discipline early.

## The common thread

These are examples. The same discipline carries from one case to the next, and the question is rarely whether an agent could do the work. What decides the outcome is whether the data reaching it is clean and the envelope around it is set.

If you want an agent to do one of these reliably, or to measure how ready your site or API is for agents in the first place, contact info@turva.dev.

## Frequently asked

**Where is an AI agent actually useful?**

Wherever data moves and a decision follows. It reads a machine-readable surface, decides inside the limits it was given, and acts on what it finds. The same pattern repeats from commerce to monitoring to back-office work.

**What decides whether an agent use case works?**

Rarely whether the agent could do the work. What decides the outcome is whether the data reaching it is clean and whether the envelope around it is set.

**Which use case depends most on the data path?**

Operations over a link that drops. The agent has to hold its last safe state and resume when data returns, because a lost packet delays delivery and the decisions queued behind it may stall depending on the transport.

## Related

- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
- [Letting agents act on data: the decision envelope](/guides/letting-agents-act-on-data)
- [What an agent-readiness audit is](/guides/agent-readiness-audit)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,
  "/guides/get-cited-by-ai-assistants": `# How to get your site cited by AI assistants

When a person asks ChatGPT, Perplexity, Claude, or Gemini a question, the assistant answers from sources it can read and trust. Getting cited means being one of those sources. A site is cited when the assistant can reach its content, read it cheaply, confirm the facts, and find corroboration elsewhere. This guide covers what that takes.

## Be readable, not just rendered

An assistant that does not run JavaScript sees an empty shell where a client-rendered page should be. The first requirement is that the content arrives in the response, which means a prerendered or static page. A markdown form served through content negotiation and an llms.txt that maps the site help the clients that read them, and no assistant is obliged to. Google states that Search, including its generative features, ignores llms.txt, so publish the file for the clients that use it rather than as a route into Google. A page an assistant cannot read is a page it cannot cite.

## State your facts as data

Prose can be summarized wrongly. JSON-LD states the facts of a page, such as the organization, the service, and the price, as data an assistant reads without inference. Structured data also ties a page to an entity an assistant already knows, which is why a Wikidata item and consistent sameAs links raise the odds that the assistant attributes the content to the right source.

## Be corroborated

An assistant is more likely to cite a claim it can confirm in more than one place. A site that only references itself is weaker than one that independent sources also describe. Open-source code, a public company record, listings in directories an assistant trusts, and genuine third-party mentions all raise confidence. The signal is consistency across sources, not volume.

## Be indexed where the assistant searches

Several assistants retrieve through a search index before they answer. If a site is not indexed where the assistant looks, it cannot be cited regardless of quality. Submitting URLs through the index protocols a site supports, and keeping the sitemap current, is how new content reaches that layer.

## Measure it

Whether a site is cited is observable. Ask the assistants the questions a buyer would ask and record which sources they name. Repeat on a schedule. The sources that appear, and the ones that do not, tell you where the work is. turva.dev runs this check against its own queries.

For an audit of how legible and citable a site is to assistants, contact info@turva.dev.

## Frequently asked

**How do you get a site cited by AI assistants?**

A site is cited when the assistant can reach its content, read it cheaply, confirm the facts, and find corroboration elsewhere. That means readable content in the first response, facts stated as data, independent corroboration, and being indexed where the assistant searches.

**Why does corroboration matter for citation?**

An assistant is more likely to cite a claim it can confirm in more than one place. Open-source code, a public company record, trusted directory listings, and genuine third-party mentions raise confidence. The signal is consistency across sources, not volume.

**What makes a claim easy for an assistant to confirm?**

Facts stated as data rather than prose, and the same fact visible in more than one place. Open-source code, a public company record and genuine third-party mentions raise confidence, and consistency matters more than volume.

## Related

- [Agent-readiness, AEO and GEO: how they relate](/guides/agent-readiness-aeo-geo)
- [SEO and agent-readiness are not the same](/guides/seo-vs-agent-readiness)
- [llms.txt explained](/guides/llms-txt)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`
};

// THE ONE SITE ORDER (2026-09-04, v3.119.0). Every list that enumerates pages follows it:
// the primary pages in PRIMARY_PATHS order (what, for whom, what it costs, then tools, then
// company, contact and legal), the auxiliary pages, /guides and the guides in the order the
// /guides twin lists them, then /blog and the posts newest first (META_BY_PATH.date, and the
// twin key order within one date). sitemap.xml and llms-full.txt compute it here; llms.txt is
// a signed hand-written literal and follows the same order by hand, and tools/verify.mjs
// reads all three against this order. Round 17 (2026-09-03) found the blog ahead of the home
// page in llms-full.txt and the pricing on line 78 of llms.txt; the order lived in five hand
// lists that had drifted apart. It lives here now.
var PRIMARY_PATHS = ["/", "/services", "/shopify-agent-storefront-check", "/tools", "/llms-txt-validator", "/company", "/contact", "/legal"];
var AUX_PATHS = ["/badge", "/auth.md", "/samples/audit-report", "/samples/shopify-agent-storefront-check"];
var _guideOrderCache = null;
function guideOrder() {
  if (_guideOrderCache === null) {
    _guideOrderCache = [];
    const re = /\]\(https:\/\/turva\.dev(\/guides\/[a-z0-9-]+)\)/g;
    let m;
    while ((m = re.exec(PAGE_MARKDOWN["/guides"])) !== null) { if (_guideOrderCache.indexOf(m[1]) === -1) _guideOrderCache.push(m[1]); }
  }
  return _guideOrderCache;
}
function siteRank(path) {
  const p = PRIMARY_PATHS.indexOf(path);
  if (p !== -1) return { group: 0, sub: p, date: "" };
  const a = AUX_PATHS.indexOf(path);
  if (a !== -1) return { group: 1, sub: a, date: "" };
  if (path === "/guides") return { group: 2, sub: -1, date: "" };
  if (path.indexOf("/guides/") === 0) { const g = guideOrder().indexOf(path); return { group: 2, sub: g === -1 ? 9999 : g, date: "" }; }
  if (path === "/blog") return { group: 3, sub: -1, date: "9999-99-99" };
  if (path.indexOf("/blog/") === 0) return { group: 3, sub: 0, date: (META_BY_PATH[path] || {}).date || "" };
  return { group: 4, sub: 0, date: "" };
}
// Stable: entries carry their source index (idx) as the last tie-break.
function compareSiteRank(a, b) {
  return a.r.group - b.r.group || a.r.sub - b.r.sub || b.r.date.localeCompare(a.r.date) || a.idx - b.idx;
}

function buildLlmsFullTxt() {
  const header = `# Full content (llms-full.txt)

> Concatenated markdown of every page: the primary pages first, then
> the guides, then the blog with the newest post first. For LLMs that
> prefer a single document over per-page fetches. Sources are canonical
> URLs on https://turva.dev/.

`;
  // Order, since 2026-09-03 (round 17, item I): the primary pages first, then the guides,
  // then the blog newest first. Before this the file followed PAGE_MARKDOWN insertion order,
  // which put 22 blog posts and 20 000 characters before the first price and the home page
  // at line 1 824, exactly the reader that "prefers a single document" never reached.
  // Since 2026-09-04 (v3.119.0) the order is the one site order, siteRank(), shared with
  // sitemap.xml, so the two files cannot disagree and a new page needs no ordering step here.
  const ordered = Object.entries(PAGE_MARKDOWN)
    .map(([path, content], idx) => ({ path, content, idx, r: siteRank(path) }))
    .sort(compareSiteRank);
  const sections = ordered.map(({ path, content }) => {
    const canonical = "https://turva.dev" + path;
    return `<!-- ============================================================
 Source: ${canonical}
 ============================================================ -->

${content}`;
  }).join("\n\n---\n\n");
  const authSection = `\n\n---\n\n<!-- ============================================================
 Source: https://turva.dev/auth.md
 ============================================================ -->

${AUTH_MD}`;
  return header + sections + authSection;
}

var _llmsFullCache = null;
function getLlmsFullTxt() {
  if (_llmsFullCache === null) _llmsFullCache = buildLlmsFullTxt();
  return _llmsFullCache;
}

var AI_TXT = `# ai.txt
User-agent: *
Allow: /

Site-name: turva.dev
Owner: Erik Rekola
Contact: <mailto:info@turva.dev>
Languages: en

Training: allowed
Grounding: allowed
Citation: required
Attribution: "Erik Rekola"

Llms: https://turva.dev/llms.txt
Llms-Full: https://turva.dev/llms-full.txt
Sitemap: https://turva.dev/sitemap.xml
Auth: https://turva.dev/auth.md
Api-catalog: https://turva.dev/.well-known/api-catalog
Ard: https://turva.dev/.well-known/ard.json
Ai-catalog: https://turva.dev/.well-known/ai-catalog.json
Mcp-server-card: https://turva.dev/.well-known/mcp/server-card.json
Mcp-endpoint: https://mcp.turva.dev/mcp
Agent-skills: https://turva.dev/.well-known/agent-skills/index.json
Oauth-discovery: https://turva.dev/.well-known/oauth-authorization-server
Oauth-protected-resource: https://turva.dev/.well-known/oauth-protected-resource
Ap2: https://turva.dev/.well-known/ap2
Acp: https://turva.dev/.well-known/acp
X402: https://turva.dev/x402
X402-Manifest: https://turva.dev/.well-known/x402
Mpp: https://turva.dev/.well-known/mpp
Ucp: https://turva.dev/.well-known/ucp
Openapi: https://turva.dev/openapi.json

User-agent: FacebookBot
Disallow: /
Training: disallowed
Grounding: disallowed

User-agent: Meta-ExternalAgent
Disallow: /
Training: disallowed
Grounding: disallowed
`;

var SECURITY_TXT = `Contact: mailto:info@turva.dev
Expires: 2027-05-28T00:00:00.000Z
Encryption: https://turva.dev/pgp-key.asc
Preferred-Languages: en
Canonical: https://turva.dev/.well-known/security.txt
Policy: https://turva.dev/legal
`;

var PGP_PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----

xsFNBGprcI8BEACjhuAEfVm9cynxxlOOkgepn5X/AxP4iwXKFgepus/tNaND6d75
etHfsPgFE134IMYM/ceonLg/o8lYYgN3uM5IIRRZbutZCp/1WQwG7793el37CUrD
OXF8XnFpYHaSf1FyO07DhHvaX4GD5fyTwzKBchJ/WsLtxL/naMccxzAMB4V/39XI
lv94xG4NdeJeN4ltvnout083Oyo/GMQ5M4P4Fi0cDpmYAggFxTxYebZGWCrE+Ayz
dfnJUcH66mDW2B9kQN7Sp6WGyyd5oNw8VUNssm3pnVx9y6pkthcGECf8v2CfjvuJ
Z7J+fYG8uIB6y7czZdxifAFmXVMmmaaAeKrkfQrgteDmM0usNDU01I25iRFZsIZE
C7ybZv5oZZT5uvUvSDrjc27ua/a6gQfmkydICbht+5oo0GT6XkMmvKXnTmR9HNoU
FjRYJ3j5J39EiQxr1pKucft/5HDe+LlRLImN082MiTJyb3n2J5eN8/NY8GccqrQK
IF6qRxhQSdY4N8+8PuFyE7VXV9n7vZaMsYNvVtK44VrwdhipDd66fuDgQIVCWkWo
A77u4vbvLJR9eBbp3kEvji04vv7H+QMQb77neQypCrvPA12xcbiQJTdj/rp3YrSz
er0s+DK5R+csLybFcDAk42hMmihdxSaPwa4MNTiKnXxkXgAUbHph+LgPowARAQAB
zRxFcmlrIFJla29sYSA8ZXJpa0B0dXJ2YS5kZXY+wsF6BBMBCAAkBYJqa3CPAhsD
BAsJCAcGFQoJCAsCBRYCAwEAAp4BBQkSzAMAAAoJEJXYrg/O3+41EWQP/3n6s0zh
YrRYyd+8p/C4cAVrRhfeA5xn3otr8Mf21iIdTeGrhyoBMYY2tnq3D6g2MXtUjl1u
uz7towrYq9x6WTpbk9qJiIArWei6Waq8GqwLyLALWUzwd8KYp5warknfiBYBcCEL
vo0ncNRVY3nunAPvk/sf6J8qaxWZ0SMMm9z4UMvNZ7z9OyJHGIQGLGj6bs6bQmdX
dG7DzJ/wVEKGFBVIQzJCKTTHKwcDoYq8k5izAJRUn+4MdhWuQPuCIscx4B1aHcTO
ovK6UOodLDOuz5ysnAAsh1gkD+fPsvVLvrMxxYPRTfmtB6jyy2yHaYCpNkc8L+Ns
gNkxkJ+5XlolLADc9ErhGnQxlTGAe+lP/rDMrVxzO2DTMPYBLb00oRz7TbGVX63r
b3qYqWxJodiIkINiVWhdg+GWZY3vHF3sITeIVxe2xWhpBEsSiL+c9m2dkA50/3nZ
pTi8E8lQbpMTo+CZebBf0NcvvgXOilRFgnAXCjH1d3jOw+jI1Rhu2YmwlwXGXRZ3
97EfKgsnh0pKVEy6U7TUImX7TDOf8VGPovhWDk+kiFx9kYkvI6ZkM7HFEAiFujc1
5pL33eMxTX5MHCTvRt9B3QOGgnrUV2KaBKwgqJWymDpYEY3C6vEUR/fh63f2mNFT
Q33Z1fvZ5zXfmq13zQpGJ1XkzZi0nuUvD1i5zsFNBGprcI8BEADk/wydExVljmR4
L4t9v6OcErNP7FnZM9EoNVRAbkDZJMV8Fh8sTeJpDwti1mFV/1z3tS28naPrD4l6
PB5jNBVbASvRXV2LnWdmDg6WweDmi0dDtLQ8nKHt556g2/9dGtZ06QugbHqcto0x
ASVXUgnZNrASV1rWmbSZbxEDvD3j1IjZtDGvbRizqPiR830WN6XqgS4f/hlPcJ1O
yGuk67FpQfts1LmtzgLbMWJAzXRsmF7rFTiqIFWJBvW50i1aflGok6YV1WvzndW9
IXHWSxo+4Oz4122Ol2UpoJBVsf1x08owDgcYILAPkVSzb8hdufK5F1qJXtCRU493
+ZH1x8jfTw5eRZVeRtYJoAeNhiLDJbIkXZFYA+eBZL49DBtaj1oH2LZ6R0L0nnZ+
wj1UCaauOaQI1VFxvsSkfMR2dW7cbSS2yPIicmWE/cYxN60bOugItxTqbpR3mcCn
rHx2zDYekUVm7uSDUHHZtx7NnDmWvi9mtwJ9idT+mAt18dbCOhEglhPWkvkYweGX
qkuR5sbLTZMdcMrN/8EmyhLYwWziGfzFP58zMQ2q71n5HEP4rHgD/3c4Bn2xpRaA
ALCj4BR5p1e/8+iDzhG+vkL9uup5ZlinQ9MF++ZcwkSPNtAoTCv5Eu46Hh7kH/5L
45b9rW/X8z+sqC6kNjZ/9wA+3RYvYQARAQABwsF6BBgBCAAkBYJqa3CPAhsMBAsJ
CAcGFQoJCAsCBRYCAwEAAp4BBQkSzAMAAAoJEJXYrg/O3+41XBsQAJn+fa1axanl
3ZDo0MwxuRw45DngmDltacZp/03lqUsCY26xzRuEFrVVG7qX32RSeHm4LgC1CmuR
8ea6PZzMyTHcyYyb8lLu0fAMVAonDFpQOeir31eU9/ZQH4+vN15vu9fkGT743Qu5
/Ru2h02T4XB6PcbY4w3k25hXKr2Q+53tYUH3PU/vaiiknErMiodtzdOE4+nMWpFc
EZUEZNu9KK96v6TDMBIxspLBC0CcR+7szJOXHFpQoGvhCJqoviADrvmpsm2GcP9e
2Nkp35Wg4ktgHSN3XxhQcrw6FLwHo0XinzJTAGasukVQm2dZ8/neHk3PQBZojrHa
JLUaCaQzFNDJiOcQx7FG4YSJSCoxczEDyTHCYUP+diP36gtl3x/k7+RJrJN4YJw2
PFMOz1v9bEpzodU2v1+dOQdVRuWXmRAEREIOyF+tGYg4y2qaj25LsuK00KWNimmP
a/6d6I0f+q3DWvtAn253VwgEvorTq9cS7+R1OLKe+jZOoS7O2g8f+ZHTY5QwJ68E
TLnSWx/N9qpwoaKux8pCqfN08BVXZ4m8SgYfh1lPZ81Q9na/wOdpprTCjHcVVB5K
7KGzWqpJxxIl2//74brX8aexeHMtG0bA3tcISaE1wHPjnGhoFwidTbn7nnv44DFr
ryIdpLieCCDGwb5HNKC8Up5EHRdd3atx
=BNdG
-----END PGP PUBLIC KEY BLOCK-----`;

// Erik 2026-08-26. Web Key Directory, direct method. The hash is the z-base-32
// SHA-1 of the lowercased local part of the address the key names, which is
// "erik", not "info". Recomputing it from a different local part serves a key
// no client will accept, because the client checks the user ID against the
// address it looked up.
var PGP_WKD_HASH = "agk5kn8g6dnzi4z7szws1t9ns6xgw14y";

// WKD serves the raw key, not the armored block. Deriving the bytes from
// PGP_PUBLIC_KEY keeps one source of truth: a replaced key cannot leave the
// two surfaces disagreeing, because there is only one place to replace it.
var pgpKeyBytes = null;
function getPgpKeyBytes() {
  if (pgpKeyBytes) return pgpKeyBytes;
  const lines = PGP_PUBLIC_KEY.split("\n");
  const b64 = [];
  let inArmor = false;
  let pastHeaders = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("-----BEGIN")) { inArmor = true; continue; }
    if (line.startsWith("-----END")) break;
    if (!inArmor) continue;
    // Armor headers (Comment:, Version:) run until the first blank line. Do not
    // depend on that blank line alone: an armor written without one would leave
    // pastHeaders false, and the function would return zero bytes in silence,
    // which is a wrong key served with a 200. Recognise a header by its shape too.
    if (!pastHeaders) {
      if (line === "") { pastHeaders = true; continue; }
      if (/^[A-Za-z][A-Za-z-]*: /.test(line)) continue;
      pastHeaders = true;
    }
    if (line === "") continue;
    if (line.startsWith("=")) continue; // CRC24 checksum, not key data
    b64.push(line);
  }
  // A key that dearmors to nothing must fail loudly, not serve an empty body.
  if (b64.length === 0) throw new Error("PGP_PUBLIC_KEY has no armored body");
  const bin = atob(b64.join(""));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  pgpKeyBytes = out;
  return out;
}

var MCP_REGISTRY_AUTH = "v=MCPv1; k=ed25519; p=ObG30Um8l6QhTDd7Xztiekz8e575d6H2TViwi6Atu8k=\n";

var AGENT_AUTH_BLOCK = {
  skill: "https://turva.dev/auth.md",
  documentation_uri: "https://turva.dev/auth.md",
  register_uri: "https://turva.dev/agent/auth/register",
  claim_uri: "https://turva.dev/agent/auth/claim",
  revocation_uri: "https://turva.dev/agent/auth/revoke",
  contact: "info@turva.dev",
  identity_types_supported: ["anonymous", "identity_assertion"],
  anonymous: {
    credential_types_supported: ["api_key"]
  },
  identity_assertion: {
    assertion_types_supported: [
      "urn:ietf:params:oauth:token-type:id-jag",
      "verified_email"
    ],
    credential_types_supported: ["api_key"]
  },
  // Same list as identity_types_supported above, and as the Supported identity types section
  // of auth.md. It used to name email, github and linkedin as well, which no code path knew
  // and no document listed; verified_email is an ASSERTION type under identity_assertion, not
  // an identity type of its own (2026-08-01).
  supported_identity_types: ["anonymous", "identity_assertion"],
  credentials_note: "Credentials only attribute correspondence. Every resource is public and none requires a credential."
};

var API_CATALOG = JSON.stringify({
  "linkset": [{
    "anchor": "https://turva.dev/",
    "service-desc": [
      { "href": "https://turva.dev/openapi.json", "type": "application/json" },
      { "href": "https://turva.dev/api/v1", "type": "application/json", "title": "Agent endpoint index" }
    ],
    "service-doc": [
      { "href": "https://turva.dev/llms.txt", "type": "text/plain" },
      { "href": "https://turva.dev/llms-full.txt", "type": "text/plain" },
      { "href": "https://turva.dev/auth.md", "type": "text/markdown", "title": "Agent registration" },
      { "href": "https://turva.dev/", "type": "text/html" }
    ],
    "service-meta": [
      { "href": "https://turva.dev/.well-known/ard.json", "type": "application/json", "title": "ARD manifest (v0.91)" },
      { "href": "https://turva.dev/.well-known/ai-catalog.json", "type": "application/json", "title": "AI catalog (ARD predecessor path)" },
      { "href": "https://turva.dev/.well-known/mcp/server-card.json", "type": "application/json", "title": "MCP Server Card" },
      { "href": "https://turva.dev/.well-known/agent-card.json", "type": "application/json", "title": "A2A Agent Card" },
      { "href": "https://turva.dev/.well-known/agent-skills/index.json", "type": "application/json", "title": "Agent Skills Index" },
      { "href": "https://turva.dev/.well-known/oauth-authorization-server", "type": "application/json", "title": "OAuth Authorization Server" },
      { "href": "https://turva.dev/.well-known/oauth-protected-resource", "type": "application/json", "title": "OAuth Protected Resource Metadata" },
      { "href": "https://turva.dev/.well-known/ap2", "type": "application/json", "title": "AP2 manifest" },
      { "href": "https://turva.dev/.well-known/acp", "type": "application/json", "title": "ACP manifest" },
      { "href": "https://turva.dev/x402", "type": "application/json", "title": "x402 endpoint (HTTP 402)" },
      { "href": "https://turva.dev/.well-known/x402", "type": "application/json", "title": "x402 manifest" },
      { "href": "https://turva.dev/.well-known/mpp", "type": "application/json", "title": "MPP discovery" },
      { "href": "https://turva.dev/.well-known/ucp", "type": "application/json", "title": "UCP profile" }
    ],
    "author": [{ "href": "https://www.linkedin.com/in/erikrekola/", "title": "Erik Rekola" }],
    "license": [{ "href": "https://turva.dev/legal" }]
  }]
}, null, 2);

var OPENAPI_SPEC = JSON.stringify({
  "openapi": "3.1.0",
  "info": {
    "title": "turva.dev Agent API",
    "version": "3.126.0",
    "description": "Read-only metadata + payable endpoints for AI agents. MPP and x402 on the /api/agent/* routes; the x402 manifest also names /x402 and /api as challenge roots. ACP checkout sessions live under /api/acp/checkout_sessions and are stateless. The free endpoint index is /api/v1.",
    "contact": { "name": "Erik Rekola", "email": "info@turva.dev", "url": "https://turva.dev/" },
    "license": { "name": "Proprietary", "url": "https://turva.dev/legal" }
  },
  "servers": [{ "url": "https://turva.dev" }],
  "x-payment-protocols": ["x402", "mpp", "acp"],
  "x-service-info": {
    "categories": ["developer-tools"],
    "docs": { "homepage": "https://turva.dev/", "llms": "https://turva.dev/llms.txt", "apiReference": "https://turva.dev/openapi.json" }
  },
  "paths": {
    "/api/agent/audit": {
      "post": {
        "summary": "Order an agent-readiness audit",
        "operationId": "orderAudit",
        "x-payment-info": {
          "intent": "charge",
          "method": "stripe",
          "amount": "430000",
          "currency": "eur",
          "description": "Card checkout link, completed by a person after the scope is agreed in writing. Not an agent-settleable rail: no API completes this payment. https://buy.stripe.com/bJe5kD5Tu0dBcFG9o75EY03"
        },
        "responses": {
          "402": { "description": "Payment Required (x402)" }
        }
      }
    },
    "/api/agent/advisory": {
      "post": {
        "summary": "Subscribe to monthly advisory",
        "operationId": "subscribeAdvisory",
        "x-payment-info": {
          "intent": "charge",
          "method": "stripe",
          "amount": "300000",
          "currency": "eur",
          "description": "Card checkout link, completed by a person after the scope is agreed in writing. Not an agent-settleable rail: no API completes this payment. https://buy.stripe.com/7sYcN5eq04tRfRSeIr5EY01"
        },
        "responses": {
          "402": { "description": "Payment Required (x402)" }
        }
      }
    },
    "/api/agent/implementation": {
      "post": {
        "summary": "Book an implementation day",
        "operationId": "bookImplementationDay",
        "x-payment-info": {
          "intent": "charge",
          "method": "stripe",
          "amount": "150000",
          "currency": "eur",
          "description": "Card checkout link, completed by a person after the scope is agreed in writing. Not an agent-settleable rail: no API completes this payment. https://buy.stripe.com/6oUaEX81C0dBfRSbwf5EY02"
        },
        "responses": {
          "402": { "description": "Payment Required (x402)" }
        }
      }
    },
    "/x402": { "get": { "summary": "x402 discovery endpoint (HTTP 402)", "operationId": "getX402Endpoint", "responses": { "402": { "description": "Payment required" } } } },
    "/agent/auth/register": { "get": { "summary": "Agent registration instructions", "operationId": "getAgentAuthRegister", "responses": { "200": { "description": "ok" } } } },
    "/agent/auth/claim": { "get": { "summary": "Agent claim instructions", "operationId": "getAgentAuthClaim", "responses": { "200": { "description": "ok" } } } },
    "/agent/auth/revoke": { "get": { "summary": "Agent revocation instructions", "operationId": "getAgentAuthRevoke", "responses": { "200": { "description": "ok" } } } },
    "/llms.txt": { "get": { "summary": "LLM summary", "operationId": "getLlmsTxt", "responses": { "200": { "description": "ok" } } } },
    "/llms-full.txt": { "get": { "summary": "Full concatenated content", "operationId": "getLlmsFullTxt", "responses": { "200": { "description": "ok" } } } },
    "/auth.md": { "get": { "summary": "Agent registration metadata", "operationId": "getAuthMd", "responses": { "200": { "description": "ok" } } } },
    "/sitemap.xml": { "get": { "summary": "Sitemap", "operationId": "getSitemap", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/ai.txt": { "get": { "summary": "AI policy", "operationId": "getAiPolicy", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/mcp/server-card.json": { "get": { "summary": "MCP Server Card", "operationId": "getMcpCard", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/agent-skills/index.json": { "get": { "summary": "Agent Skills index", "operationId": "getSkillsIndex", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/api-catalog": { "get": { "summary": "API catalog", "operationId": "getApiCatalog", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/ard.json": { "get": { "summary": "ARD manifest (v0.91)", "operationId": "getArdManifest", "responses": { "200": { "description": "Agentic Resource Discovery manifest, same entries as ai-catalog.json with the v0.91 media types", "content": { "application/json": {} } } } } },
    "/.well-known/ai-catalog.json": { "get": { "summary": "AI catalog (ARD)", "operationId": "getAiCatalog", "responses": { "200": { "description": "ok" } } } },
    "/v1/message:send": { "post": { "summary": "A2A message:send (HTTP+JSON transport, revision 0.3.0)", "operationId": "a2aMessageSend", "description": "Send an A2A message. Name one of the agent card skills with metadata.skillId (services, contact-info, company-info), or leave it out and the skills named in the message text are returned, falling back to all three. Responds with { message } carrying data parts. No authentication.", "responses": { "200": { "description": "ok" }, "400": { "description": "invalid params" }, "405": { "description": "POST only" } } } },
    "/.well-known/agent-card.json": { "get": { "summary": "A2A Agent Card", "operationId": "getAgentCard", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/security.txt": { "get": { "summary": "Security", "operationId": "getSecurity", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/oauth-authorization-server": { "get": { "summary": "OAuth Authorization Server Metadata", "operationId": "getOauthDiscovery", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/oauth-protected-resource": { "get": { "summary": "OAuth Protected Resource Metadata", "operationId": "getOauthProtectedResource", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/ap2": { "get": { "summary": "AP2 manifest", "operationId": "getAp2", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/acp": { "get": { "summary": "ACP manifest", "operationId": "getAcp", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/x402": { "get": { "summary": "x402 discovery manifest", "operationId": "getX402", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/mpp": { "get": { "summary": "MPP discovery", "operationId": "getMpp", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/ucp": { "get": { "summary": "UCP profile", "operationId": "getUcp", "responses": { "200": { "description": "ok" } } } },
    "/api/v1": { "get": { "summary": "Agent endpoint index", "operationId": "getApiIndex", "description": "Free JSON index of every agent surface this site serves. No payment, no authentication.", "responses": { "200": { "description": "ok" } } } },
    "/api/acp/checkout_sessions": { "post": { "summary": "Create an ACP checkout session", "operationId": "acpCreateCheckoutSession", "description": "Agentic Commerce Protocol, api-version 2026-01-16. Body: { items: [{ id }] } with id one of audit, advisory, implementation, shopify. Sessions are stateless and the response status is not_ready_for_payment: the engagement is confirmed in writing before any payment.", "responses": { "201": { "description": "session" }, "400": { "description": "unknown item id" }, "405": { "description": "POST only" } } } },
    "/api/acp/checkout_sessions/{session_id}": { "get": { "summary": "Retrieve an ACP checkout session", "operationId": "acpGetCheckoutSession", "parameters": [{ "name": "session_id", "in": "path", "required": true, "schema": { "type": "string" } }], "responses": { "200": { "description": "session" }, "404": { "description": "unknown session id" }, "405": { "description": "GET only" } } } },
    "/api/acp/checkout_sessions/{session_id}/complete": { "post": { "summary": "Complete an ACP checkout session", "operationId": "acpCompleteCheckoutSession", "description": "Always answers intervention_required: scope is agreed in writing before payment, no API completes it.", "parameters": [{ "name": "session_id", "in": "path", "required": true, "schema": { "type": "string" } }], "responses": { "200": { "description": "intervention_required" }, "404": { "description": "unknown session id" }, "405": { "description": "POST only" } } } },
    "/api/acp/checkout_sessions/{session_id}/cancel": { "post": { "summary": "Cancel an ACP checkout session", "operationId": "acpCancelCheckoutSession", "parameters": [{ "name": "session_id", "in": "path", "required": true, "schema": { "type": "string" } }], "responses": { "200": { "description": "canceled" }, "404": { "description": "unknown session id" }, "405": { "description": "POST only" } } } }
  }
}, null, 2);

var AGENT_JSON = JSON.stringify({
  "schema_version": "v1",
  "name": "turva.dev",
  "name_for_human": "turva.dev",
  "name_for_model": "turva_dev",
  "description_for_human": "Agent-readiness audits and advisory for product teams.",
  "description_for_model": "turva.dev provides agent-readiness audits and advisory for product teams. An independent scanner measures the site or API, a written report names the prioritized fixes, the next scan verifies the result. Async-only engagement. Pricing (EUR, VAT not included): Shopify agent storefront check €999 (fixed, 48 hours), Audit €4,300 (fixed, two weeks), Advisory €3,000/month (minimum 3 months), Implementation €1,500/day (scoped per task). Pages support Accept: text/markdown.",
  "contact_email": "info@turva.dev",
  "legal_info_url": "https://turva.dev/legal",
  "logo_url": "https://turva.dev/logo.png",
  "auth": { "type": "none" },
  "api": { "type": "openapi", "url": "https://turva.dev/openapi.json" }
}, null, 2);

// --- signed manifests (provenance) ---
var JWKS_JSON = "{\n  \"keys\": [\n    {\n      \"kty\": \"OKP\",\n      \"crv\": \"Ed25519\",\n      \"x\": \"fZpH2DFoup6FI_leaxJWrvpfP4xf8gPLjh6okbFOrJU\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"use\": \"sig\",\n      \"alg\": \"EdDSA\"\n    }\n  ]\n}";
var SIGNATURES_JSON = "{\n  \"keys\": \"https://turva.dev/.well-known/jwks.json\",\n  \"signed_bytes\": \"Each signature covers the response body of its path exactly as served, byte for byte. Verify the raw bytes against the Ed25519 key in jwks.json; do not parse and re-serialise the JSON first, because that changes the whitespace and the signature will not match.\",\n  \"signatures\": {\n    \"/.well-known/ai-plugin.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"-PPZXORW5ltdmfpDsNgd6DWH66beIkqkKhoxrxijh3g-43LGp9VqlWtCTL1dj-z4ttRe66qQU0OU77NpUzD1CQ\"\n    },\n    \"/.well-known/agent.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"-PPZXORW5ltdmfpDsNgd6DWH66beIkqkKhoxrxijh3g-43LGp9VqlWtCTL1dj-z4ttRe66qQU0OU77NpUzD1CQ\"\n    },\n    \"/.well-known/mcp/server-card.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"-66bUJMC0OgGoX003rPI5CAkSAOUwtH6-OsjndVCX8V6IMrBPuAeRbATQlyjVUit04g5nUTGKGLcXO7cBQcWAA\"\n    },\n    \"/llms.txt\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"smp74-VdR5zy7dbQWesARGFFz-gDMOA7inVRARkMZmVlom1jnSoPoVZOrrC5u6xXVNHPtiTpafQudqEPmF2XDA\"\n    }\n  }\n}";

// The four keys the Server Card schema requires live at the top level, and the keys the
// deployed convention uses live beside them. The schema restricts neither additional nor
// unevaluated properties, so a document may carry both, and the MCP project's own card at
// modelcontextprotocol.io does exactly that. Read the schema before moving anything here:
// $schema has to be the /v1/ URL, name is reverse-DNS with one slash, and description is
// capped at 100 characters. Measured against the schema and against the scanner 2026-08-29,
// see mds/decisions.md Tek-298. Changing this file means re-signing it,
// julkaisu/resign-server-card-local.mjs.
var MCP_SERVER_CARD = JSON.stringify({
  "$schema": "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
  "name": "turva.dev/turva-mcp",
  "title": "turva.dev",
  "description": "Read-only MCP server for turva.dev with the service catalog, prices and published scan evidence.",
  "version": "1.3.11",
  "websiteUrl": "https://turva.dev/",
  "repository": { "url": "https://github.com/erekola/turva-mcp", "source": "github" },
  "remotes": [
    { "type": "streamable-http", "url": "https://mcp.turva.dev/mcp" }
  ],
  "serverInfo": {
    "name": "turva-mcp",
    "title": "turva.dev",
    "version": "1.3.11",
    "description": "Public read-only MCP server for turva.dev. Exposes the service catalog (Shopify agent storefront check, audit, advisory, implementation, agent operations, MCP server design) with prices, own-domain agent-readiness and web-security scan evidence, and engagement principles (async-only, no calls, no calendar links). No authentication, no write operations."
  },
  "transport": {
    "type": "streamable-http",
    "endpoint": "https://mcp.turva.dev/mcp"
  },
  // Only the capabilities the server actually implements are declared. turva-mcp
  // registers four tools and nothing else, so resources/list, prompts/list and
  // resources/templates/list correctly answer -32601 Method not found. Declaring
  // resources or prompts here would put a promise the code does not keep inside a
  // signed manifest. Do not add them back, and do not add empty implementations to
  // match a declaration; see agent-memory/project-do-not-fix.md.
  "capabilities": {
    "tools": { "listChanged": true }
  },
  "tools": [
    { "name": "get_services", "description": "Service catalog (Shopify agent storefront check, audit, advisory, implementation, agent operations, MCP server design), the engagement model, and pricing." },
    { "name": "get_agent_readiness", "description": "turva.dev's own agent-readiness score from an independent public scanner (isitagentready.com), with category sub-scores, measurement date, and verification links." },
    { "name": "get_security_evidence", "description": "Latest public web-security scan results for turva.dev's own domain (Hardenize, Internet.nl site and mail), with the scan date." },
    { "name": "get_principles", "description": "Engagement principles: async-only, least access, the result shows up in scanner numbers, open and verifiable." }
  ],
  "_meta": {
    "homepage": "https://turva.dev/",
    "mcpEndpoint": "https://mcp.turva.dev/mcp",
    "openapi": "https://turva.dev/openapi.json",
    "agentSkills": "https://turva.dev/.well-known/agent-skills/index.json",
    "apiCatalog": "https://turva.dev/.well-known/api-catalog",
    "llmsTxt": "https://turva.dev/llms.txt",
    "llmsFullTxt": "https://turva.dev/llms-full.txt",
    "authMd": "https://turva.dev/auth.md",
    "contact": "info@turva.dev",
    "languages": ["en"],
    "pricing": {
      "currency": "EUR",
      "vatIncluded": false,
      "shopify": { "price": 999, "unit": "fixed", "duration": "48 hours" },
      "audit": { "price": 4300, "unit": "fixed", "duration": "2 weeks" },
      "advisory": { "price": 3000, "unit": "month", "minimumCommitment": "3 months" },
      "implementation": { "price": 1500, "unit": "day" }
    }
  }
}, null, 2);

var OAUTH_DISCOVERY = JSON.stringify({
  "issuer": "https://turva.dev",
  "authorization_endpoint": "https://turva.dev/oauth/authorize",
  "token_endpoint": "https://turva.dev/oauth/token",
  "service_documentation": "https://turva.dev/auth.md",
  "op_policy_uri": "https://turva.dev/legal",
  "op_tos_uri": "https://turva.dev/legal",
  "ui_locales_supported": ["en"],
  "scopes_supported": ["read:services", "read:principles", "read:scan-evidence"],
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "token_endpoint_auth_methods_supported": ["client_secret_basic", "none"],
  "code_challenge_methods_supported": ["S256"],
  "protected_resources": ["https://turva.dev"],
  "agent_auth": AGENT_AUTH_BLOCK
}, null, 2);

var OAUTH_PROTECTED_RESOURCE = JSON.stringify({
  "resource": "https://turva.dev",
  "resource_name": "turva.dev",
  "authorization_servers": ["https://turva.dev"],
  "scopes_supported": ["read:services", "read:principles", "read:scan-evidence"],
  "bearer_methods_supported": ["header"],
  "resource_documentation": "https://turva.dev/auth.md",
  "resource_policy_uri": "https://turva.dev/legal",
  "resource_tos_uri": "https://turva.dev/legal",
  "agent_auth": AGENT_AUTH_BLOCK
}, null, 2);

var AP2_MANIFEST = JSON.stringify({
  "$schema": "https://ap2.dev/schemas/manifest/v1.json",
  "version": "1.0",
  "merchant": {
    "name": "turva.dev",
    "legal_name": "Erik Rekola",
    "business_id": "3600281-7",
    "country": "FI",
    "contact": "mailto:info@turva.dev",
    "url": "https://turva.dev/"
  },
  "payment_model": "quote_on_request",
  "supported_rails": ["card-stripe-link", "x402-base-usdc"],
  "pricing": {
    "currency": "EUR",
    "vat_included": false,
    "items": [
      { "name": "Shopify agent storefront check", "price": 999, "unit": "fixed", "duration": "48 hours" },
      { "name": "Audit", "price": 4300, "unit": "fixed", "duration": "2 weeks" },
      { "name": "Advisory", "price": 3000, "unit": "month", "minimum_commitment_months": 3 },
      { "name": "Implementation", "price": 1500, "unit": "day" }
    ]
  },
  "quote_endpoint": {
    "type": "human_contact",
    "channels": [
      { "type": "email", "value": "mailto:info@turva.dev?subject=Quote%20request" },
      { "type": "signal", "value": "https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK" },
      { "type": "linkedin", "value": "https://www.linkedin.com/in/erikrekola/" }
    ],
    "languages": ["en"],
    "typical_response_time": "P1D"
  }
}, null, 2);

// ============================================================
// ACP - spec-compliant discovery (services = closed string enum). Real checkout: /api/acp/checkout_sessions
// ============================================================
var ACP_MANIFEST = JSON.stringify({
  "protocol": {
    "name": "acp",
    "version": "2026-01-16",
    "supported_versions": ["2026-01-16"],
    "documentation_url": "https://turva.dev/services"
  },
  "api_base_url": "https://turva.dev/api/acp",
  "transports": ["rest"],
  "capabilities": {
    "services": ["checkout"],
    "supported_currencies": ["eur"]
  }
}, null, 2);

// ============================================================
// X402 - manifest with full accepts[] array
// ============================================================
var A2A_AGENT_CARD = JSON.stringify({
  "protocolVersion": "0.3.0",
  "name": "turva.dev",
  "description": "Public read-only agent interface for turva.dev, an independent agent-readiness audit and advisory business operated by Erik Rekola. Exposes the service catalog with prices, contact channels, and company information over HTTP+JSON. No authentication and no write operations.",
  "url": "https://turva.dev",
  "preferredTransport": "HTTP+JSON",
  "version": "3.126.0",
  "provider": {
    "organization": "turva.dev",
    "url": "https://turva.dev/"
  },
  "documentationUrl": "https://turva.dev/llms.txt",
  "iconUrl": "https://turva.dev/logo.png",
  "supportedInterfaces": [
    {
      "url": "https://turva.dev",
      "transport": "HTTP+JSON"
    }
  ],
  "additionalInterfaces": [
    {
      "url": "https://turva.dev",
      "transport": "HTTP+JSON"
    }
  ],
  "capabilities": {
    "streaming": false,
    "pushNotifications": false,
    "stateTransitionHistory": false,
    "extensions": [
      {
        "uri": "https://github.com/google-agentic-commerce/ap2/tree/v0.1",
        "description": "AP2 agent payments. turva.dev acts as merchant. Payment is quote-on-request. An x402 402 challenge is published so the payment surface can be discovered, but there is no facilitator and no automatic settlement: scope and price are confirmed in writing first.",
        "required": false,
        "params": {
          "roles": [
            "merchant"
          ]
        }
      }
    ]
  },
  "defaultInputModes": [
    "application/json",
    "text/plain"
  ],
  "defaultOutputModes": [
    "application/json",
    "text/plain"
  ],
  "skills": [
    {
      "id": "services",
      "name": "Service catalog",
      "description": "List the service offerings of turva.dev (Shopify agent storefront check, audit, advisory, implementation, agent operations, MCP server design). Fixed prices in EUR for the Shopify agent storefront check, audit, advisory and implementation.",
      "tags": [
        "services",
        "pricing",
        "agent-readiness"
      ],
      "examples": [
        "What does an agent-readiness audit cost?",
        "List turva.dev services"
      ]
    },
    {
      "id": "contact-info",
      "name": "Contact channels",
      "description": "Get the primary contact channels for turva.dev (email, Signal, LinkedIn, business ID). Async-only engagement, no calls.",
      "tags": [
        "contact",
        "async"
      ],
      "examples": [
        "How do I contact turva.dev?",
        "What is the turva.dev email?"
      ]
    },
    {
      "id": "company-info",
      "name": "Company information",
      "description": "Get business details and background about turva.dev and its operator Erik Rekola, including the registered business ID.",
      "tags": [
        "company",
        "about"
      ],
      "examples": [
        "Who runs turva.dev?",
        "What is turva.dev's business ID?"
      ]
    }
  ]
}, null, 2);

var AI_CATALOG = JSON.stringify({
  "specVersion": "1.0",
  "host": { "displayName": "turva.dev", "identifier": "turva.dev" },
  "entries": [
    {
      "identifier": "urn:ai:turva.dev:mcp-server:turva-mcp",
      "displayName": "turva.dev MCP server",
      "type": "application/mcp-server+json",
      "url": "https://turva.dev/.well-known/mcp/server-card.json",
      "description": "Public read-only MCP server: service catalog, own agent-readiness scores, security evidence, engagement principles."
    },
    {
      "identifier": "urn:ai:turva.dev:agent:a2a",
      "displayName": "turva.dev A2A agent",
      "type": "application/a2a-agent-card+json",
      "url": "https://turva.dev/.well-known/agent-card.json",
      "description": "A2A agent card describing turva.dev's read-only HTTP and JSON surface."
    },
    {
      "identifier": "urn:ai:turva.dev:api:openapi",
      "displayName": "turva.dev API",
      "type": "application/openapi+json",
      "url": "https://turva.dev/openapi.json",
      "description": "OpenAPI description of turva.dev's public endpoints."
    },
    {
      "identifier": "urn:ai:turva.dev:skills:index",
      "displayName": "turva.dev Agent Skills",
      "type": "application/agent-skills+json",
      "url": "https://turva.dev/.well-known/agent-skills/index.json",
      "description": "Index of agent skills published by turva.dev."
    }
  ]
}, null, 2);

// ARD v0.91 (ards-project/ard-spec, 2026-08-26) renamed the well-known file to ard.json and the
// link relation to ard, and made those the ones a client MUST read; ai-catalog.json is the
// predecessor a client MAY consult. Same entries, v0.91 media type for the MCP card. AI_CATALOG
// stays as it is because the isitagentready ard check and the experimental MCP Server Card
// discovery document still read /.well-known/ai-catalog.json (Tek-349, 2026-09-05).
var ARD_MANIFEST = JSON.stringify(Object.assign({}, JSON.parse(AI_CATALOG), {
  "entries": JSON.parse(AI_CATALOG).entries.map((e) => Object.assign({}, e,
    e.type === "application/mcp-server+json" ? { "type": "application/mcp-server-card+json" } : {}))
}), null, 2);

// A conformant x402 client reads the challenge body and acts on it. It never reads
// the source comment six lines into the route handler, so the fact that nothing here
// verifies an X-PAYMENT header, and that there is no facilitator and no on-chain
// settlement, has to be stated in the body itself. Without it the challenge reads as
// an instruction to send real USDC to a real wallet on Base for a resource that will
// answer 402 again afterwards, with no refund path. The manifest carries it too: an
// agent can read /.well-known/x402 and act on the terms without ever fetching a 402.
var X402_SETTLEMENT_NOTE = {
  "mode": "out-of-band",
  "verified": false,
  "note": "No facilitator is configured. X-PAYMENT is not verified and this resource answers 402 regardless of payment, so sending funds achieves nothing. Ask for a quote and settle against the written scope.",
  "quote": "mailto:info@turva.dev?subject=Quote%20request"
};

var X402_MANIFEST = JSON.stringify({
  "x402Version": 2,
  "endpoint": "https://turva.dev/x402",
  "network": "eip155:8453",
  "asset": "USDC",
  "scheme": "exact",
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:8453",
      "amount": "1000",
      "resource": "https://turva.dev/x402",
      "description": "x402 discovery probe (0.001 USDC)",
      "mimeType": "application/json",
      "payTo": X402_PAY_TO,
      "maxTimeoutSeconds": 300,
      "asset": X402_USDC_BASE,
      "extra": { "name": "USDC", "version": "2", "settlement": X402_SETTLEMENT_NOTE }
    },
    {
      "scheme": "exact",
      "network": "eip155:8453",
      "amount": "1000",
      "resource": "https://turva.dev/api",
      "description": "turva.dev agent API discovery probe (0.001 USDC)",
      "mimeType": "application/json",
      "payTo": X402_PAY_TO,
      "maxTimeoutSeconds": 300,
      "asset": X402_USDC_BASE,
      "extra": { "name": "USDC", "version": "2", "settlement": X402_SETTLEMENT_NOTE }
    },
    {
      "scheme": "exact",
      "network": "eip155:8453",
      "amount": "4904000000",
      "resource": "https://turva.dev/api/agent/audit",
      "description": "Agent-readiness audit (€4,300 / 4904 USDC)",
      "mimeType": "application/json",
      "payTo": X402_PAY_TO,
      "maxTimeoutSeconds": 300,
      "asset": X402_USDC_BASE,
      "extra": { "name": "USDC", "version": "2", "settlement": X402_SETTLEMENT_NOTE }
    },
    {
      "scheme": "exact",
      "network": "eip155:8453",
      "amount": "3421000000",
      "resource": "https://turva.dev/api/agent/advisory",
      "description": "Monthly advisory (€3,000 / 3421 USDC)",
      "mimeType": "application/json",
      "payTo": X402_PAY_TO,
      "maxTimeoutSeconds": 300,
      "asset": X402_USDC_BASE,
      "extra": { "name": "USDC", "version": "2", "settlement": X402_SETTLEMENT_NOTE }
    },
    {
      "scheme": "exact",
      "network": "eip155:8453",
      "amount": "1711000000",
      "resource": "https://turva.dev/api/agent/implementation",
      "description": "Implementation day (€1,500 / 1711 USDC)",
      "mimeType": "application/json",
      "payTo": X402_PAY_TO,
      "maxTimeoutSeconds": 300,
      "asset": X402_USDC_BASE,
      "extra": { "name": "USDC", "version": "2", "settlement": X402_SETTLEMENT_NOTE }
    }
  ],
  "resources": [
    "https://turva.dev/x402",
    "https://turva.dev/api",
    "https://turva.dev/api/agent/audit",
    "https://turva.dev/api/agent/advisory",
    "https://turva.dev/api/agent/implementation"
  ],
  "merchant": {
    "name": "turva.dev",
    "legal_name": "Erik Rekola",
    "business_id": "3600281-7",
    "country": "FI",
    "contact": "mailto:info@turva.dev"
  }
}, null, 2);

var X402_INDEX_402 = JSON.stringify({
  "x402Version": 2,
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:8453",
      "amount": "1000",
      "resource": "https://turva.dev/x402",
      "description": "turva.dev x402 discovery probe. The challenge is published so an agent can detect the payment surface; it is not settled, and paying it returns 402 again. The real payable services are /api/agent/audit, /api/agent/advisory and /api/agent/implementation.",
      "mimeType": "application/json",
      "payTo": X402_PAY_TO,
      "maxTimeoutSeconds": 300,
      "asset": X402_USDC_BASE,
      "extra": { "name": "USDC", "version": "2", "settlement": X402_SETTLEMENT_NOTE }
    }
  ],
  "error": "Payment required to access this resource"
}, null, 2);

function build402Body(resource, label, amountUsdcMicro, amountEurCents, description) {
  const extra = { "name": "USDC", "version": "2", "label": label };
  // /api is a discovery probe with no EUR equivalent. Writing "eurCents": 0 into the
  // body states a price of 0,00 EUR for a resource that is not free, so the field is
  // omitted instead.
  if (amountEurCents > 0) extra.eurCents = amountEurCents;
  extra.settlement = X402_SETTLEMENT_NOTE;
  return JSON.stringify({
    "x402Version": 2,
    "accepts": [
      {
        "scheme": "exact",
        "network": "eip155:8453",
        "amount": amountUsdcMicro,
        "resource": resource,
        "description": description,
        "mimeType": "application/json",
        "payTo": X402_PAY_TO,
        "maxTimeoutSeconds": 300,
        "asset": X402_USDC_BASE,
        "extra": extra
      }
    ],
    "error": "Payment required to access this resource"
  }, null, 2);
}

var MPP_MANIFEST = JSON.stringify({
  "$schema": "https://mpp.dev/schemas/discovery/v1.json",
  "version": "1.0",
  "protocol": {
    "name": "Machine Payments Protocol",
    "id": "mpp",
    "spec_url": "https://mpp.dev/"
  },
  "openapi": "https://turva.dev/openapi.json",
  "x_payment_info_location": "openapi:paths.*.post.x-payment-info",
  "merchant": {
    "name": "turva.dev",
    "legal_name": "Erik Rekola",
    "business_id": "3600281-7",
    "country": "FI",
    "url": "https://turva.dev/"
  },
  "payment_discovery": {
    "model": "quote_on_request",
    "machine_payable": false,
    "supported_rails": ["card-stripe-link", "x402-base-usdc"],
    "quote_channels": [
      { "type": "email", "value": "mailto:info@turva.dev?subject=Quote%20request" },
      { "type": "signal", "value": "https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK" },
      { "type": "linkedin", "value": "https://www.linkedin.com/in/erikrekola/" }
    ],
    "typical_response_time": "P1D",
    "languages": ["en"]
  },
  "pricing": {
    "currency": "EUR",
    "vat_included": false,
    "items": [
      { "name": "Shopify agent storefront check", "price": 999, "unit": "fixed", "duration": "48 hours" },
      { "name": "Audit", "price": 4300, "unit": "fixed", "duration": "2 weeks" },
      { "name": "Advisory", "price": 3000, "unit": "month", "minimum_commitment_months": 3 },
      { "name": "Implementation", "price": 1500, "unit": "day" }
    ]
  }
}, null, 2);

var UCP_PROFILE = JSON.stringify({
  "ucp": {
    "version": "2026-04-08",
    "spec": "https://ucp.dev/2026-04-08/specification/overview",
    "merchant": {
      "name": "turva.dev",
      "legal_name": "Erik Rekola",
      "business_id": "3600281-7",
      "country": "FI",
      "url": "https://turva.dev/",
      "contact": "mailto:info@turva.dev"
    },
    "services": {
      "dev.turva.agent-readiness": [
        {
          "version": "2026-07-04",
          "spec": "https://turva.dev/services",
          "transport": "rest",
          "endpoint": "https://turva.dev",
          "schema": "https://turva.dev/openapi.json"
        },
        {
          "version": "2026-07-04",
          "spec": "https://turva.dev/services",
          "transport": "a2a",
          "endpoint": "https://turva.dev/.well-known/agent-card.json"
        }
      ]
    },
    "capabilities": {},
    "payment_handlers": {},
    "pricing": {
      "currency": "EUR",
      "vat_included": false,
      "items": [
        { "name": "Shopify agent storefront check", "price": 999, "unit": "fixed" },
        { "name": "Audit", "price": 4300, "unit": "fixed" },
        { "name": "Advisory", "price": 3000, "unit": "month" },
        { "name": "Implementation", "price": 1500, "unit": "day" }
      ]
    }
  }
}, null, 2);

function buildAgentAuthInstruction(action) {
  return JSON.stringify({
    "action": action,
    "transport": "async-email",
    "documentation": "https://turva.dev/auth.md",
    "contact": "mailto:info@turva.dev?subject=agent%20" + action,
    "instructions": "Send an email to info@turva.dev with subject 'agent " + action + "'. A written reply is sent within one business day.",
    "required_fields": action === "registration" ? [
      "agent_identifier",
      "software_name",
      "operator_legal_entity",
      "purpose",
      "expected_request_rate_per_hour",
      "public_contact"
    ] : action === "claim" ? [
      "agent_identifier",
      "proof_of_control"
    ] : [
      "agent_identifier",
      "reason"
    ],
    "engagement_model": "async-only",
    "typical_response_time": "P1D",
    "languages": ["en"],
    "note": "turva.dev is a sole-proprietorship advisory practice. Agent registration, claim and revocation are handled out-of-band via email by design (async-only engagement model). This endpoint exists so machine clients can discover the contact pathway."
  }, null, 2);
}

var SKILL_CONTACT_INFO = `---
name: contact-info
description: Get the primary contact channels for turva.dev (email, Signal, LinkedIn, business ID). Async-only engagement.
---

# contact-info

Use this skill to retrieve official contact methods for turva.dev.

## Returns

- **Email:** <mailto:info@turva.dev>
- **Signal:** [@turva.19](https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK)
- **LinkedIn:** https://www.linkedin.com/in/erikrekola/
- **Business ID (Finland):** 3600281-7
- **Language:** English
- **Engagement:** Async-only. No calls, no calendar links.
- **Response time:** First reply in writing within one business day.

## Source
- https://turva.dev/contact
`;

var SKILL_SERVICES = `---
name: services
description: List the service offerings of turva.dev, with fixed prices in EUR for the Shopify agent storefront check, audit, advisory and implementation.
---

# services

Use this skill to learn which services turva.dev offers, and which of them carry a fixed price.

## Services (fixed prices in EUR for the Shopify agent storefront check, audit, advisory and implementation, VAT not included; the last two are quoted on request)
- **Shopify agent storefront check.** €999. Fixed scope, 48 hours. One live Shopify store read across browser WebMCP, Shopify-hosted Storefront and UCP MCP, and Agentic channels. Four written deliverables within 48 hours of the agreed written kickoff, and a retest within 14 days.
- **Audit.** €4,300. Fixed scope, two weeks. An independent scanner and a live check of how AI assistants retrieve the site (answer engine optimization, AEO), manual review, written report with prioritized fix list.
- **Advisory.** €3,000 / month. Monthly retainer, minimum 3 months. Async-only. Ongoing review, score tracking and a monthly AI-visibility delta across several AI platforms.
- **Implementation.** €1,500 / day. Scoped per task. Edge workers, MCP servers, well-known manifests, JSON-LD.
- **Agent operations.** On request. The data an agent acts on, and the decision envelope of permissions and thresholds that bounds what it is allowed to do.
- **MCP server design.** On request. Read-only discovery tools and streamable HTTP transport.

Two implementation add-ons are sold only together with the diagnosis they follow, and neither can be bought on its own. Audit fix implementation, €499 fixed, is exactly the fixes the audit report lists and requires the audit. Shopify correction implementation, €499 fixed, is exactly the corrections the check's plan lists and requires the Shopify agent storefront check.

Final price is confirmed in writing after scope is agreed.

## Model
Async-only engagement. No calls, no calendar links. Production credentials are not requested. Repo write access is scoped per task.

## Source
- https://turva.dev/services
`;

var SKILL_COMPANY = `---
name: company-info
description: Get business details and background about turva.dev and its operator Erik Rekola.
---

# company-info

Use this skill for formal company data about turva.dev.

## Facts
- **Name:** turva.dev
- **Operator:** Erik Rekola (sole proprietor)
- **Business ID:** 3600281-7
- **Register:** https://tietopalvelu.ytj.fi/yritys/3600281-7
- **Location:** Tampere, Finland
- **Language:** English
- **LinkedIn:** https://www.linkedin.com/in/erikrekola/

## Source
- https://turva.dev/company
`;

var SKILLS = [
  { name: "services", content: SKILL_SERVICES },
  { name: "contact-info", content: SKILL_CONTACT_INFO },
  { name: "company-info", content: SKILL_COMPANY }
];

async function sha256Hex(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function buildSkillsIndex() {
  const entries = [];
  for (const s of SKILLS) {
    const hex = await sha256Hex(s.content);
    entries.push({
      name: s.name,
      type: "skill-md",
      description: (s.content.match(/^description:\s*(.+)$/m) || [, ""])[1].trim(),
      url: `/.well-known/agent-skills/${s.name}/SKILL.md`,
      digest: `sha256:${hex}`
    });
  }
  return JSON.stringify({
    "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    "skills": entries
  }, null, 2);
}

var WEBMCP_SCRIPT = `<script>
(function(){
 if (!navigator.modelContext || typeof navigator.modelContext.provideContext !== 'function') return;
 try {
 navigator.modelContext.provideContext({
 tools: [
 {
 name: 'get_contact',
 description: 'Return official contact channels for turva.dev. Async-only engagement.',
 inputSchema: { type: 'object', properties: {} },
 execute: async function() {
 return { email: 'info@turva.dev', signal: '@turva.19', signalUrl: 'https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK', linkedin: 'https://www.linkedin.com/in/erikrekola/', businessId: '3600281-7', language: 'en', correspondenceLanguages: ['en', 'fi'], engagement: 'async-only' };
 }
 },
 {
 name: 'get_services',
 description: 'Return the services offered by turva.dev (Shopify agent storefront check, audit, advisory, implementation, agent operations, MCP server design). Fixed prices in EUR for the Shopify agent storefront check, audit, advisory and implementation.',
 inputSchema: { type: 'object', properties: {} },
 execute: async function() {
 const r = await fetch('/services', { headers: { Accept: 'text/markdown' } });
 return { markdown: await r.text(), pricing: { currency: 'EUR', vatIncluded: false, shopify: { price: 999, unit: 'fixed' }, audit: { price: 4300, unit: 'fixed' }, advisory: { price: 3000, unit: 'month', minimumCommitmentMonths: 3 }, implementation: { price: 1500, unit: 'day' } }, bundledImplementation: [{ name: 'Audit fix implementation', price: 499, currency: 'EUR', unit: 'fixed', requires: 'audit', soldSeparately: false }, { name: 'Shopify correction implementation', price: 499, currency: 'EUR', unit: 'fixed', requires: 'shopify', soldSeparately: false }] };
 }
 },
 {
 name: 'get_company',
 description: 'Return business details about turva.dev.',
 inputSchema: { type: 'object', properties: {} },
 execute: async function() {
 return { name: 'turva.dev', operator: 'Erik Rekola', businessId: '3600281-7', location: 'Tampere, Finland', linkedin: 'https://www.linkedin.com/in/erikrekola/' };
 }
 }
 ]
 });
 } catch (e) {}
})();
<\/script>`;

var SITEMAP_LASTMOD = "2026-09-05";
var SITEMAP_ENTRIES = [
  ["/", "weekly", "1.0"],
  ["/services", "monthly", "0.9"],
  ["/shopify-agent-storefront-check", "monthly", "0.9"],
  ["/tools", "monthly", "0.6"],
  ["/llms-txt-validator", "monthly", "0.6"],
  ["/company", "monthly", "0.7"],
  ["/contact", "monthly", "0.7"],
  ["/legal", "yearly", "0.3"],
  ["/badge", "monthly", "0.5"],
  ["/auth.md", "yearly", "0.4"],
  ["/samples/audit-report", "monthly", "0.6"],
  ["/samples/shopify-agent-storefront-check", "monthly", "0.6"],
  ["/guides", "monthly", "0.8"],
  ["/guides/agent-readiness-audit", "monthly", "0.7"],
  ["/guides/choosing-an-agent-readiness-audit", "monthly", "0.8"],
  ["/guides/get-cited-by-ai-assistants", "monthly", "0.8"],
  ["/guides/llms-txt", "monthly", "0.7"],
  ["/guides/markdown-for-agents", "monthly", "0.7"],
  ["/guides/open-knowledge-format", "monthly", "0.7"],
  ["/guides/sitemaps-and-robots-for-agents", "monthly", "0.7"],
  ["/guides/response-headers-for-agents", "monthly", "0.7"],
  ["/guides/prerendering-for-agents", "monthly", "0.7"],
  ["/guides/mcp-server-card", "monthly", "0.7"],
  ["/guides/agents-json", "monthly", "0.7"],
  ["/guides/well-known-for-agents", "monthly", "0.7"],
  ["/guides/agentic-resource-discovery", "monthly", "0.7"],
  ["/guides/agent-authentication", "monthly", "0.7"],
  ["/guides/json-ld-structured-data", "monthly", "0.7"],
  ["/guides/x402-agent-payments", "monthly", "0.7"],
  ["/guides/agent-commerce-discovery", "monthly", "0.7"],
  ["/guides/agentic-commerce-readiness", "monthly", "0.7"],
  ["/guides/seo-vs-agent-readiness", "monthly", "0.7"],
  ["/guides/agent-readiness-aeo-geo", "monthly", "0.7"],
  ["/guides/letting-agents-act-on-data", "monthly", "0.7"],
  ["/guides/ai-agent-use-cases", "monthly", "0.7"],
  ["/guides/measurement-led-agent-readiness", "monthly", "0.7"],
  ["/guides/agent-readiness-gaps", "monthly", "0.7"],
  ["/blog", "weekly", "0.7"],
  ["/blog/agent-readiness-identity-vendors", "monthly", "0.6"],
  ["/blog/two-auth-md-dialects", "monthly", "0.6"],
  ["/blog/thirty-days-after-the-brief", "monthly", "0.6"],
  ["/blog/what-ai-assistants-call-an-agent-readiness-audit", "monthly", "0.6"],
  ["/blog/website-agent-readiness-567-sites", "monthly", "0.6"],
  ["/blog/trace-runtime-attestation", "monthly", "0.6"],
  ["/blog/agent-readiness-code-hosts", "monthly", "0.6"],
  ["/blog/cheating-to-keep-the-old-price", "monthly", "0.6"],
  ["/blog/i-thought-it-was-a-small-job", "monthly", "0.6"],
  ["/blog/my-gate-could-not-see-a-sixth", "monthly", "0.6"],
  ["/blog/red-reading-that-measured-my-own-client", "monthly", "0.6"],
  ["/blog/checks-that-pass-for-the-wrong-reason", "monthly", "0.6"],
  ["/blog/finishing-the-optional-commerce-checks", "monthly", "0.6"],
  ["/blog/the-twin-is-the-page", "monthly", "0.6"],
  ["/blog/enforcing-the-rate-limit-i-advertised", "monthly", "0.6"],
  ["/blog/measuring-the-ai-patch-surge", "monthly", "0.6"],
  ["/blog/agent-secret-hygiene", "monthly", "0.6"],
  ["/blog/agent-readiness-finnish-b2b", "monthly", "0.6"],
  ["/blog/honesty-and-the-checker", "monthly", "0.6"],
  ["/blog/re-checking-the-guides", "monthly", "0.6"],
  ["/blog/cheaper-pages-revisited", "monthly", "0.6"],
  ["/blog/moving-source-to-codeberg", "monthly", "0.6"],
  ["/blog/free-llms-txt-validator", "monthly", "0.6"],
  ["/blog/agent-access-is-now-a-setting", "monthly", "0.6"],
  ["/blog/publishing-an-ai-catalog", "monthly", "0.6"],
  ["/blog/open-knowledge-format", "monthly", "0.6"],
  ["/blog/cheaper-pages-for-agents", "monthly", "0.6"],
  ["/blog/verifiable-agent-identity", "monthly", "0.6"],
  ["/blog/reliable-agent-decisions", "monthly", "0.6"],
  ["/blog/owning-your-fediverse-identity", "monthly", "0.6"],
  ["/blog/moving-off-prerender", "monthly", "0.6"],
];
function buildSitemapXml() {
  // Sorted by the one site order (siteRank); the literal above is a set of rows with their
  // changefreq and priority, and a new row may go anywhere in its block.
  const entries = SITEMAP_ENTRIES.map(function(e, idx) { return { e: e, idx: idx, r: siteRank(e[0]) }; }).sort(compareSiteRank).map(function(x) { return x.e; });
  const rows = entries.map(function(e) {
    const path = e[0], cf = e[1], pr = e[2];
    let lastmod;
    if (path.indexOf("/blog/") === 0) {
      lastmod = (META_BY_PATH[path] && (META_BY_PATH[path].modified || META_BY_PATH[path].date)) || SITEMAP_LASTMOD;
    } else if (path === "/blog") {
      const ds = Object.keys(META_BY_PATH).filter(function(k) { return k.indexOf("/blog/") === 0; }).map(function(k) { return META_BY_PATH[k].modified || META_BY_PATH[k].date; }).filter(Boolean).sort();
      lastmod = ds.length ? ds[ds.length - 1] : SITEMAP_LASTMOD;
    } else {
      lastmod = SITEMAP_LASTMOD;
    }
    const loc = "https://turva.dev" + (path === "/" ? "/" : path);
    return " <url><loc>" + loc + "</loc><lastmod>" + lastmod + "</lastmod><changefreq>" + cf + "</changefreq><priority>" + pr + "</priority></url>";
  }).join("\n");
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + rows + "\n</urlset>";
}
var _sitemapCache = null;
function getSitemapXml() {
  if (_sitemapCache === null) _sitemapCache = buildSitemapXml();
  return _sitemapCache;
}

var _blogFeedCache = null;

function buildBlogFeedXml() {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const posts = Object.keys(PAGE_MARKDOWN)
    .filter((k) => k.startsWith("/blog/"))
    .map((k) => ({ path: k, meta: META_BY_PATH[k] || {} }))
    .filter((p) => p.meta.date)
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date));
  const items = posts.map(({ path, meta }) => {
    const url = "https://turva.dev" + path;
    const title = esc((meta.title || "").replace(/ [|\u00B7] turva\.dev$/, ""));
    return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(meta.date + "T00:00:00Z").toUTCString()}</pubDate>
      <description>${esc(meta.description || "")}</description>
    </item>`;
  }).join("\n");
  const lastBuild = new Date((posts[0] ? posts[0].meta.date : SITEMAP_LASTMOD) + "T00:00:00Z").toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>turva.dev blog</title>
    <link>https://turva.dev/blog</link>
    <description>Notes on AI agents, and the work of letting them read a site and act on a system safely.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="https://turva.dev/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

function getBlogFeedXml() {
  if (_blogFeedCache === null) _blogFeedCache = buildBlogFeedXml();
  return _blogFeedCache;
}

var CANONICAL_PATHS = new Set(["/", "/services", "/samples/audit-report", "/samples/shopify-agent-storefront-check", "/blog/agent-readiness-identity-vendors", "/blog/two-auth-md-dialects", "/blog/thirty-days-after-the-brief", "/blog/what-ai-assistants-call-an-agent-readiness-audit", "/company", "/contact", "/legal", "/guides", "/guides/agent-readiness-audit", "/guides/llms-txt", "/guides/mcp-server-card", "/guides/agents-json", "/guides/x402-agent-payments", "/guides/response-headers-for-agents", "/guides/seo-vs-agent-readiness", "/guides/json-ld-structured-data", "/guides/well-known-for-agents", "/guides/agent-authentication", "/guides/measurement-led-agent-readiness", "/guides/prerendering-for-agents", "/guides/sitemaps-and-robots-for-agents", "/guides/markdown-for-agents", "/guides/agent-readiness-gaps", "/guides/choosing-an-agent-readiness-audit", "/guides/get-cited-by-ai-assistants", "/blog", "/blog/agent-access-is-now-a-setting", "/blog/cheaper-pages-for-agents", "/blog/moving-off-prerender", "/guides/agent-commerce-discovery", "/blog/owning-your-fediverse-identity", "/blog/reliable-agent-decisions", "/blog/verifiable-agent-identity", "/guides/agent-readiness-aeo-geo", "/guides/agentic-commerce-readiness", "/guides/letting-agents-act-on-data", "/guides/ai-agent-use-cases", "/guides/open-knowledge-format", "/blog/open-knowledge-format", "/guides/agentic-resource-discovery", "/blog/publishing-an-ai-catalog", "/badge", "/llms-txt-validator", "/blog/free-llms-txt-validator", "/blog/moving-source-to-codeberg", "/blog/cheaper-pages-revisited", "/blog/re-checking-the-guides", "/blog/honesty-and-the-checker", "/blog/agent-readiness-finnish-b2b", "/blog/agent-secret-hygiene", "/blog/measuring-the-ai-patch-surge", "/blog/enforcing-the-rate-limit-i-advertised", "/blog/the-twin-is-the-page", "/blog/finishing-the-optional-commerce-checks", "/blog/checks-that-pass-for-the-wrong-reason", "/blog/red-reading-that-measured-my-own-client", "/blog/i-thought-it-was-a-small-job", "/blog/my-gate-could-not-see-a-sixth", "/blog/cheating-to-keep-the-old-price", "/blog/agent-readiness-code-hosts", "/blog/website-agent-readiness-567-sites", "/blog/trace-runtime-attestation", "/tools", "/shopify-agent-storefront-check"]);

function getCanonicalForPath(pathname) {
  if (CANONICAL_PATHS.has(pathname)) {
    return "https://turva.dev" + pathname;
  }
  return null;
}

var META_BY_PATH = {
  "/blog/agent-readiness-identity-vendors": {
    title: "What 19 identity vendors publish for agents · turva.dev",
    description: "I scanned 19 digital identity and trust vendors with one scanner. Every one of them scored zero of nine on agent, API and MCP discovery.",
    date: "2026-09-05",
    image: "/og-agent-readiness-identity-vendors.jpg",
    imageAlt: "turva.dev blog card: 19 digital identity and trust vendors scanned, every one scored zero of nine on agent, API and MCP discovery.",
  },
  "/blog/two-auth-md-dialects": {
    title: "Two files called auth.md, and they disagree on the field names · turva.dev",
    description: "WorkOS publishes an open auth.md protocol and the isitagentready scanner publishes another. Both live at the same path and name three fields differently.",
    date: "2026-09-04",
    image: "/og-two-auth-md-dialects.jpg",
    imageAlt: "turva.dev blog card: WorkOS publishes an open auth.md protocol and the isitagentready scanner publishes another. Both live at the same path and name three fields differently.",
  },
  "/blog/thirty-days-after-the-brief": {
    title: "Thirty days after the brief: 210 sites rescanned, four moved · turva.dev",
    description: "210 sites rescanned thirty days after an unsolicited brief: 197 unchanged, three up, one down, and none of the three that improved had replied.",
    date: "2026-09-03",
    modified: "2026-09-04",
    image: "/og-thirty-days-after-the-brief.jpg",
    imageAlt: "turva.dev blog card: 210 sites rescanned thirty days after an unsolicited brief: 197 unchanged, three up, one down, and none of the three that improved had replied.",
  },
  "/blog/what-ai-assistants-call-an-agent-readiness-audit": {
    title: "What four AI assistants call an agent readiness audit · turva.dev",
    description: "Fifty buyer questions to four AI assistants: 18 of 41 open answers describe an organisation's readiness and 13 the website. Two services share one name.",
    date: "2026-09-03",
    modified: "2026-09-04",
    image: "/og-what-ai-assistants-call-an-agent-readiness-audit.jpg",
    imageAlt: "turva.dev blog card: Fifty buyer questions to four AI assistants: 18 of 41 open answers describe an organisation's readiness and 13 the website. Two services share one name.",
  },
  "/blog/website-agent-readiness-567-sites": {
    title: "Website agent readiness, measured on 567 company sites · turva.dev",
    description: "567 company sites read with one independent scanner in ten weeks: 85,5 percent at Level 1 of 5, 13,1 percent at Level 0, Finnish and foreign sites alike.",
    date: "2026-09-03",
    image: "/og-website-agent-readiness-567-sites.jpg",
    imageAlt: "turva.dev blog card: 567 company sites read with one independent scanner in ten weeks: 85,5 percent at Level 1 of 5, 13,1 percent at Level 0, Finnish and foreign sites alike.",
  },
  "/blog/trace-runtime-attestation": {
    title: "TRACE signs how an agent ran, not what it was allowed to reach · turva.dev",
    description: "The Linux Foundation now governs TRACE. Its own documentation is where the limits are: three trust levels, and Level 0 records a privileged operator can forge.",
    date: "2026-08-30",
    image: "/og-trace-runtime-attestation.jpg",
    imageAlt: "turva.dev blog card: The Linux Foundation now governs TRACE. Its own documentation is where the limits are: three trust levels, and Level 0 records a privileged operator can forge.",
  },
  "/blog/agent-readiness-code-hosts": {
    title: "I scanned fourteen code hosts. Not one served an MCP server card. · turva.dev",
    description: "Fourteen code host surfaces scanned with an independent scanner on one day. Not one served an MCP server card, and the highest reading was Level 1 of 5.",
    date: "2026-08-22",
    image: "/og-agent-readiness-code-hosts.jpg",
    imageAlt: "turva.dev blog card: Fourteen code host surfaces scanned with an independent scanner on one day. Not one served an MCP server card, and the highest reading was Level 1 of 5.",
  },
  "/blog/cheating-to-keep-the-old-price": {
    title: "It would be cheating to keep the old price · turva.dev",
    description: "The audit drops to 4,300 euros and two weeks. The part the old price charged for twice is now a written checklist.",
    date: "2026-08-21",
    modified: "2026-09-05",
    image: "/og-cheating-to-keep-the-old-price.jpg",
    imageAlt: "turva.dev blog card: The audit drops to 4,300 euros and two weeks. The part the old price charged for twice is now a written checklist.",
  },
  "/blog/i-thought-it-was-a-small-job": {
    title: "I thought it was a small job · turva.dev",
    description: "I read my own workspace file by file. Seven days, 367 findings across 2 307 text files, and nothing billable shipped that week.",
    date: "2026-08-16",
    image: "/og-i-thought-it-was-a-small-job.jpg",
    imageAlt: "turva.dev blog card: I read my own workspace file by file. Seven days, 367 findings across 2 307 text files, and nothing billable shipped that week.",
  },
  "/blog/my-gate-could-not-see-a-sixth": {
    title: "My gate could not see a sixth · turva.dev",
    description: "My gate checked five categories on six surfaces and passed a sixth on three of them. A check that asks whether these five are there is not a check of the set.",
    date: "2026-08-04",
    image: "/og-my-gate-could-not-see-a-sixth.jpg",
    imageAlt: "turva.dev blog card: My gate checked five categories on six surfaces and passed a sixth on three of them. A check that asks whether these five are there is not a check of the set.",
  },
  "/blog/red-reading-that-measured-my-own-client": {
    title: "A red reading that measured my own client · turva.dev",
    description: "My MCP server answered Method not found to the request its new revision requires, and the fault was in my request. What a compatibility lane hides.",
    date: "2026-07-30",
    image: "/og-red-reading-that-measured-my-own-client.jpg",
    imageAlt: "turva.dev blog card: My MCP server answered Method not found to the request its new revision requires, and the fault was in my request. What a compatibility lane hides."
  },
  "/blog/checks-that-pass-for-the-wrong-reason": {
    title: "The checks that pass for the wrong reason · turva.dev",
    description: "A spec release left thirteen links pointing at the living draft, and my own gate kept passing while measuring the wrong lane. The same defect twice.",
    date: "2026-07-29",
    image: "/og-checks-that-pass-for-the-wrong-reason.jpg",
    imageAlt: "turva.dev blog card: A spec release left thirteen links pointing at the living draft, and my own gate kept passing while measuring the wrong lane. The same defect twice."
  },
  "/blog/finishing-the-optional-commerce-checks": {
    title: "Finishing the optional commerce checks · turva.dev",
    description: "Taking the last two optional commerce checks, x402 and MPP, to green on isitagentready without faking settlement, and what the scanner actually probes.",
    date: "2026-07-20",
    modified: "2026-08-02",
    image: "/og-finishing-the-optional-commerce-checks.jpg",
    imageAlt: "turva.dev blog card: Taking the last two optional commerce checks, x402 and MPP, to green on isitagentready without faking settlement, and what the scanner actually probes."
  },
  "/blog/the-twin-is-the-page": {
    title: "The twin is the page · turva.dev",
    description: "Ten card pages now render their prose from the markdown twin. What the parity gate caught before it retired and the check that replaced it.",
    date: "2026-07-19",
    image: "/og-the-twin-is-the-page.jpg",
    imageAlt: "turva.dev blog card: Ten card pages now render their prose from the markdown twin. What the parity gate caught before it retired and the check that replaced it."
  },
  "/blog/enforcing-the-rate-limit-i-advertised": {
    title: "Every response promised a rate limit · turva.dev",
    description: "A site sent rate limit headers no code enforced. The fix, the measurement that proved nothing, and the draft archaeology behind the header.",
    date: "2026-07-18",
    image: "/og-enforcing-the-rate-limit-i-advertised.jpg",
    imageAlt: "Every response promised a rate limit. Nothing enforced it."
  },
  "/blog/measuring-the-ai-patch-surge": {
    title: "Measuring the AI patch surge: Microsoft's July package · turva.dev",
    description: "Microsoft said customers would see more security updates and gave no number. Twelve months of MSRC CVRF data: the July package is 3,0 times the baseline.",
    date: "2026-07-15",
    modified: "2026-07-17",
    image: "/og-measuring-the-ai-patch-surge.jpg",
    imageAlt: "Measuring the AI patch surge from MSRC data"
  },
  "/blog/agent-secret-hygiene": {
    title: "Secret hygiene when an agent works in your repo · turva.dev",
    description: "Coding agents run with your shell, so plaintext secrets on disk are exposed to them. Move git auth to a credential manager and the rest to an encrypted vault.",
    date: "2026-07-12",
    image: "/og-agent-secret-hygiene.jpg",
    imageAlt: "turva.dev blog card: Coding agents run with your shell, so plaintext secrets on disk are exposed to them."
  },
  "/blog/agent-readiness-finnish-b2b": {
    title: "Agent-readiness of Finnish B2B sites · turva.dev",
    description: "An independent scanner over sixteen Finnish B2B sites: almost every one read isitagentready Level 1 of 5, and the same three gaps showed up almost everywhere.",
    date: "2026-07-07",
    modified: "2026-07-17",
    image: "/og-agent-readiness-finnish-b2b.jpg",
    imageAlt: "turva.dev blog card: I ran an independent scanner over sixteen Finnish B2B sites. Almost every one landed at isitagentready Level 1 of 5, and the same three gaps showed up almost everywhere."
  },
  "/blog/honesty-and-the-checker": {
    title: "When honesty and the checker disagree · turva.dev",
    description: "Making this site's auth.md cleaner made the scanner fail. The honest form was the precise one, neither gutted nor padded to please the check.",
    date: "2026-07-06",
    image: "/og-honesty-and-the-checker.jpg",
    imageAlt: "turva.dev blog card: Making this site's auth.md cleaner made the scanner fail. The honest form was the precise one, neither gutted nor padded to please the check."
  },
  "/blog/re-checking-the-guides": {
    title: "Four AI agents re-checked the guides · turva.dev",
    description: "Four AI agents re-read the guides against the specifications behind them. One high finding, one expired draft, six small fixes. The scanners never noticed.",
    date: "2026-07-04",
    modified: "2026-07-16",
    image: "/og-re-checking-the-guides.jpg",
    imageAlt: "turva.dev blog card: Four AI agents re-read the guides against the specifications behind them."
  },
  "/blog/cheaper-pages-revisited": {
    title: "The page grew, the agent bill did not · turva.dev",
    description: "The site kept growing after June's token-cost post. The 4 July scan reports an 83% token saving between the HTML and markdown forms.",
    date: "2026-07-04",
    image: "/og-cheaper-pages-revisited.jpg",
    imageAlt: "turva.dev blog card: The site kept growing after June's token-cost post. The 4 July scan reports an 83% token saving between the HTML and markdown forms."
  },

  "/blog/moving-source-to-codeberg": {
    title: "Moving the source from GitHub to Codeberg · turva.dev",
    description: "GitHub's spam filter silently hid this site's source from everyone but its owner for two weeks. The log of the 404s, the fix, and the move to Codeberg.",
    date: "2026-07-04",
    modified: "2026-07-26",
    image: "/og-moving-source-to-codeberg.jpg",
    imageAlt: "turva.dev blog card: GitHub's spam filter silently hid this site's source from everyone but its owner for two weeks."
  },
  "/blog/free-llms-txt-validator": {
    title: "A free llms.txt validator · turva.dev",
    description: "turva.dev now has a free llms.txt validator: structure checks against the format, JSON output for agents, nothing stored.",
    date: "2026-07-02",
    image: "/og-free-llms-txt-validator.jpg",
    imageAlt: "turva.dev blog card: turva.dev now has a free llms.txt validator: structure checks against the format, JSON output for agents, nothing stored."
  },
  "/tools": {
    title: "Free agent-readiness tools · turva.dev",
    description: "Three free tools: an llms.txt validator with JSON output, an embeddable agent-ready badge, and a public read-only MCP server. No signup, agent-friendly.",
    image: "/og-tools.jpg",
    imageAlt: "turva.dev tools card: the free llms.txt validator, the agent-ready badge and the public MCP server, each usable by a person or by an agent."
  },
  "/llms-txt-validator": {
    title: "Free llms.txt validator with JSON output · turva.dev",
    description: "Free llms.txt validator. Fetches a site's /llms.txt and checks the structure: H1 title, blockquote summary, H2 link sections. JSON output for agents.",
    image: "/og-llms-txt-validator.jpg",
    imageAlt: "llms.txt validator"
  },
  "/badge": {
    title: "The agent-ready badge: criteria and embed code · turva.dev",
    description: "An embeddable SVG badge for sites that meet public agent-readiness criteria: a turva.dev audit or 100/100 on a public scanner. Criteria and embed code.",
    image: "/og-badge.jpg",
    imageAlt: "turva.dev badge card: the embeddable agent-ready badge, a self-declared claim against public criteria that anyone can re-check by running the same scanner."
  },
  "/blog": {
    title: "Blog: notes on AI agents and agent-readiness · turva.dev",
    description: "Notes on AI agents and the work of letting them read a site and act on a system safely. Dated entries, checked against an independent scanner.",
    image: "/og-blog.jpg",
    imageAlt: "turva.dev blog card: dated notes on AI agents and the work of letting them act."
  },
  "/blog/agent-access-is-now-a-setting": {
    title: "Agent access is now a setting · turva.dev",
    description: "Cloudflare moves crawler access, citation payment and x402 rails into CDN configuration. What that changes for agent readiness.",
    date: "2026-07-02",
    image: "/og-agent-access-is-now-a-setting.jpg",
    imageAlt: "turva.dev blog card: Cloudflare moves crawler access, citation payment and x402 rails into CDN configuration."
  },
  "/blog/publishing-an-ai-catalog": {
    title: "Publishing an ai-catalog.json for agentic discovery · turva.dev",
    description: "Google and a Linux Foundation group published Agentic Resource Discovery in 2026. turva.dev now serves an ai-catalog.json indexing its agent surfaces.",
    date: "2026-06-29",
    image: "/og-publishing-an-ai-catalog.jpg",
    imageAlt: "turva.dev blog card: Google and a Linux Foundation group published Agentic Resource Discovery in 2026."
  },
  "/blog/open-knowledge-format": {
    title: "What the Open Knowledge Format is, and what it is not · turva.dev",
    description: "Google Cloud shipped the Open Knowledge Format. What it is, what it is not yet, and how it relates to an agent-readiness audit.",
    date: "2026-06-27",
    image: "/og-open-knowledge-format.jpg",
    imageAlt: "turva.dev blog card: Google Cloud shipped the Open Knowledge Format. What it is, what it is not yet, and how it relates to an agent-readiness audit."
  },
  "/blog/cheaper-pages-for-agents": {
    title: "What an agent pays to read your site · turva.dev",
    description: "An agent pays to read your site in tokens, and an HTML-only page is expensive. How markdown content negotiation cuts that cost.",
    date: "2026-06-26",
    image: "/og-cheaper-pages-for-agents.jpg",
    imageAlt: "turva.dev blog card: An agent pays to read your site in tokens, and an HTML-only page is expensive."
  },
  "/guides/agent-commerce-discovery": {
    title: "Agent commerce discovery: A2A, AP2, and ACP · turva.dev",
    description: "A2A Agent Card, AP2 and ACP explained: what each agent commerce discovery surface is, where it lives, and backing a claim with a real endpoint.",
    image: "/og-guide-agent-commerce-discovery.jpg",
    imageAlt: "turva.dev guide card: A2A Agent Card, AP2 and ACP explained: what each agent commerce discovery surface is, where it lives, and backing a claim with a real endpoint."
  },
  "/blog/verifiable-agent-identity": {
    title: "When an agent can prove it is Claude · turva.dev",
    description: "Web Bot Auth gives an AI agent a verifiable, signed identity a site can check. What the tag is, where Claude stands today, and how agent-readiness uses it.",
    date: "2026-06-25",
    image: "/og-verifiable-agent-identity.jpg",
    imageAlt: "turva.dev blog card: Web Bot Auth gives an AI agent a verifiable, signed identity a site can check."
  },
  "/guides/agentic-resource-discovery": {
    title: "Agentic Resource Discovery and ai-catalog.json · turva.dev",
    description: "Agentic Resource Discovery explained: what an ai-catalog.json is, how it differs from llms.txt, and where it sits before MCP, A2A and API invocation.",
    image: "/og-guide-agentic-resource-discovery.jpg",
    imageAlt: "turva.dev guide card: Agentic Resource Discovery explained: what an ai-catalog.json is, how it differs from llms.txt, and where it sits before MCP, A2A and API invocation."
  },
  "/guides/open-knowledge-format": {
    title: "Open Knowledge Format (OKF) explained · turva.dev",
    description: "What the Open Knowledge Format is: Google Cloud's open markdown spec for giving AI agents context, and where it fits agent-readiness.",
    image: "/og-guide-open-knowledge-format.jpg",
    imageAlt: "turva.dev guide card: What the Open Knowledge Format is: Google Cloud's open markdown spec for giving AI agents context, and where it fits agent-readiness."
  },
  "/blog/reliable-agent-decisions": {
    title: "What makes an AI agent's decisions reliable · turva.dev",
    description: "What makes an AI agent act correctly: data that arrives intact, and an envelope of settings that defines what it may do.",
    date: "2026-06-22",
    image: "/og-reliable-agent-decisions.jpg",
    imageAlt: "turva.dev blog card: What makes an AI agent act correctly: data that arrives intact, and an envelope of settings that defines what it may do."
  },
  "/blog/owning-your-fediverse-identity": {
    title: "Owning your fediverse identity · turva.dev",
    description: "Why turva.dev put its fediverse handle on its own domain: a single-user instance, a domain split, and rel=me verification from the Worker.",
    date: "2026-06-21",
    image: "/og-owning-your-fediverse-identity.jpg",
    imageAlt: "turva.dev blog card: Why turva.dev put its fediverse handle on its own domain: a single-user instance, a domain split, and rel=me verification from the Worker."
  },
  "/blog/moving-off-prerender": {
    title: "Moving turva.dev off prerender.io · turva.dev",
    description: "The turva.dev homepage now renders finished HTML in a Cloudflare Worker at the edge, no prerender.io hop. Verified 100/100 Level 5 by an independent scanner.",
    date: "2026-06-20",
    image: "/og-moving-off-prerender.jpg",
    imageAlt: "turva.dev blog card: The turva.dev homepage now renders finished HTML in a Cloudflare Worker at the edge, with no prerender.io hop."
  },
  "/": {
    title: "Agent-readiness audits and advisory · turva.dev",
    description: "Agent-readiness audits and advisory for product teams, and the wider work wherever AI agents read data and make decisions. Independent, measured, async-only.",
    imageAlt: "turva.dev: 100/100 and Level 5, Agent-Native, on isitagentready.com"
  },
  "/services": {
    title: "Agent-readiness audits for websites, APIs and Shopify stores · turva.dev",
    description: "Shopify agent storefront check €999 in 48 hours. Agent-readiness audit €4,300. Advisory €3,000/month, implementation €1,500/day. Two more on request.",
    image: "/og-services.jpg",
    imageAlt: "turva.dev services card: the Shopify agent storefront check €999, the audit €4,300, advisory €3,000 per month, implementation €1,500 per day, and two more on request."
  },
  "/shopify-agent-storefront-check": {
    title: "Shopify agent storefront check, €999 · turva.dev",
    description: "What an AI shopper receives from one live Shopify store, tested across browser WebMCP, remote MCP and Agentic channels. €999, fixed scope, 48 hours.",
    image: "/og-shopify-agent-storefront-check.jpg",
    imageAlt: "turva.dev product card: the Shopify agent storefront check, €999, four written deliverables within 48 hours, across three agent surfaces."
  },
  "/samples/audit-report": {
    title: "Sample audit report, synthetic · turva.dev",
    description: "A synthetic agent-readiness audit report: 22 scanner checks recorded one by one, the manual review, the AI visibility run, eight findings with evidence, owner, effort and acceptance test. Invented site.",
    image: "/og-samples-audit-report.jpg",
    imageAlt: "turva.dev sample card: the synthetic agent-readiness audit report for an invented company, every check, finding and acceptance test in the format a client receives."
  },
  "/samples/shopify-agent-storefront-check": {
    title: "Sample Shopify storefront check report · turva.dev",
    description: "A synthetic Shopify agent storefront check report: the three-surface map, the product truth matrix, the buyer-journey evidence, the correction plan and the retest. Invented store.",
    image: "/og-samples-shopify-agent-storefront-check.jpg",
    imageAlt: "turva.dev sample card: the synthetic Shopify agent storefront check report for an invented store, the five deliverables in the format a merchant receives."
  },
  "/company": {
    title: "Company: Erik Rekola, Tampere, Finland · turva.dev",
    description: "turva.dev is operated by Erik Rekola as a Finnish sole proprietorship. Business ID 3600281-7, based in Tampere. Six years in engineering, 2015 to 2021.",
    image: "/og-company.jpg",
    imageAlt: "turva.dev company card: a one-person audit practice measured by an independent scanner, operated by Erik Rekola in Tampere, Finland."
  },
  "/contact": {
    title: "Contact: email, Signal or LinkedIn, async-only · turva.dev",
    description: "Contact turva.dev via email, Signal or LinkedIn. Async-only engagement. Response within one business day. No calls, no calendar links.",
    image: "/og-contact.jpg",
    imageAlt: "turva.dev contact card: async only by email, Signal or LinkedIn, first response within one business day."
  },
  "/legal": {
    title: "Legal: terms of engagement, privacy and GDPR · turva.dev",
    description: "Terms of engagement, privacy practices and GDPR information for turva.dev. Finnish law applies. No tracking, no analytics, no third-party scripts.",
    image: "/og-legal.jpg",
    imageAlt: "turva.dev legal card: terms, privacy and GDPR in plain language, Finnish law, no tracking and no cookies."
  },
  "/guides": {
    title: "Agent-readiness guides · turva.dev",
    description: "Short, focused guides on the surfaces that make a website or API readable and usable by AI agents. Audits, llms.txt, MCP, structured data, payments and more.",
    image: "/og-guides.jpg",
    imageAlt: "turva.dev guides card: short guides on the surfaces that make a site or API readable and usable by AI agents, one surface at a time."
  },
  "/guides/agent-readiness-audit": {
    title: "What an agent-readiness audit is · turva.dev",
    description: "An agent-readiness audit measures how well AI agents can discover, read and act on a website or API, scored against current standards by an independent scanner.",
    image: "/og-guide-agent-readiness-audit.jpg",
    imageAlt: "turva.dev guide card: An agent-readiness audit measures how well AI agents can discover, read and act on a website or API, scored against current standards by an independent scanner."
  },
  "/guides/llms-txt": {
    title: "llms.txt explained · turva.dev",
    description: "llms.txt is a plain text guide that tells AI agents what a site contains and where its key content lives, and how it differs from robots.txt and sitemaps.",
    image: "/og-guide-llms-txt.jpg",
    imageAlt: "turva.dev guide card: llms.txt is a plain text guide that tells AI agents what a site contains and where its key content lives, and how it differs from robots.txt and sitemaps."
  },
  "/guides/mcp-server-card": {
    title: "MCP server cards explained · turva.dev",
    description: "An MCP server card is a JSON file that lets agents discover a site's Model Context Protocol server and connect to it. What it is and why it matters.",
    image: "/og-guide-mcp-server-card.jpg",
    imageAlt: "turva.dev guide card: An MCP server card is a JSON file that lets agents discover a site's Model Context Protocol server and connect to it."
  },
  "/guides/agents-json": {
    title: "What agents.json is · turva.dev",
    description: "agents.json declares the actions and endpoints an AI agent can use on a site, turning a readable site into an operable one. What it is and why it matters.",
    image: "/og-guide-agents-json.jpg",
    imageAlt: "turva.dev guide card: agents.json declares the actions and endpoints an AI agent can use on a site, turning a readable site into an operable one."
  },
  "/guides/x402-agent-payments": {
    title: "x402 and agent payments · turva.dev",
    description: "x402 uses HTTP 402 Payment Required so AI agents can discover a price, pay, and continue without a human checkout. How agent payments work and why they matter.",
    image: "/og-guide-x402-agent-payments.jpg",
    imageAlt: "turva.dev guide card: x402 uses HTTP 402 Payment Required so AI agents can discover a price, pay, and continue without a human checkout."
  },
  "/guides/response-headers-for-agents": {
    title: "Response headers that help agents · turva.dev",
    description: "The right HTTP response headers let AI agents work without parsing full HTML. Link, Vary, RateLimit and content type headers explained for agent-readiness.",
    image: "/og-guide-response-headers-for-agents.jpg",
    imageAlt: "turva.dev guide card: The right HTTP response headers let AI agents work without parsing full HTML."
  },
  "/guides/seo-vs-agent-readiness": {
    title: "SEO and agent-readiness are not the same · turva.dev",
    description: "SEO makes a site rank for people to click. Agent-readiness makes it legible and usable by AI agents. Ranking alone does not guarantee presence in AI answers.",
    image: "/og-guide-seo-vs-agent-readiness.jpg",
    imageAlt: "turva.dev guide card: SEO makes a site rank for people to click. Agent-readiness makes it legible and usable by AI agents."
  },
  "/guides/json-ld-structured-data": {
    title: "JSON-LD and structured data for agents · turva.dev",
    description: "JSON-LD states a page's facts as data an AI agent can read without parsing prose. How prices, organizations and services become legible to agents.",
    image: "/og-guide-json-ld-structured-data.jpg",
    imageAlt: "turva.dev guide card: JSON-LD states a page's facts as data an AI agent can read without parsing prose."
  },
  "/guides/well-known-for-agents": {
    title: "The /.well-known directory for agents · turva.dev",
    description: "The /.well-known directory is where agents look for a site's machine-readable manifests, from the API catalog (RFC 9727) to server cards and OAuth metadata.",
    image: "/og-guide-well-known-for-agents.jpg",
    imageAlt: "turva.dev guide card: The /.well-known directory is where agents look for a site's machine-readable manifests, from the API catalog (RFC 9727) to server cards and OAuth metadata."
  },
  "/guides/agent-authentication": {
    title: "How agents authenticate · turva.dev",
    description: "Agent authentication lets an automated client gain scoped access without a human login. OAuth discovery, protected resources and agent registration explained.",
    image: "/og-guide-agent-authentication.jpg",
    imageAlt: "turva.dev guide card: Agent authentication lets an automated client gain scoped access without a human login."
  },
  "/guides/measurement-led-agent-readiness": {
    title: "Why agent-readiness should be measured, not asserted · turva.dev",
    description: "A hand-filled checklist records intentions. An independent scanner records what an agent actually finds. Why measured agent-readiness beats self-assessment.",
    image: "/og-guide-measurement-led-agent-readiness.jpg",
    imageAlt: "turva.dev guide card: A hand-filled checklist records intentions. An independent scanner records what an agent actually finds."
  },
  "/guides/prerendering-for-agents": {
    title: "Prerendering and why agents see empty pages · turva.dev",
    description: "JavaScript-rendered sites return an empty shell to agents, so the content never arrives. Why prerendering and markdown delivery fix the most common agent gap.",
    image: "/og-guide-prerendering-for-agents.jpg",
    imageAlt: "turva.dev guide card: JavaScript-rendered sites return an empty shell to agents, so the content never arrives."
  },
  "/guides/sitemaps-and-robots-for-agents": {
    title: "Sitemaps, robots.txt and agent access · turva.dev",
    description: "robots.txt and the sitemap decide whether an agent is allowed in and what it can find. AI bot rules, Content Signals and complete sitemaps explained.",
    image: "/og-guide-sitemaps-and-robots-for-agents.jpg",
    imageAlt: "turva.dev guide card: robots.txt and the sitemap decide whether an agent is allowed in and what it can find."
  },
  "/guides/markdown-for-agents": {
    title: "Serving markdown to agents · turva.dev",
    description: "Serving a markdown version of a page gives agents the content without the markup, at a fraction of the tokens. How content negotiation and llms-full.txt work.",
    image: "/og-guide-markdown-for-agents.jpg",
    imageAlt: "turva.dev guide card: Serving a markdown version of a page gives agents the content without the markup, at a fraction of the tokens."
  },
  "/guides/agent-readiness-aeo-geo": {
    title: "Agent-readiness, AEO and GEO: how they relate · turva.dev",
    description: "How AEO, GEO and agent-readiness relate, what each one fixes, and how to sequence the work so you do not pay for the same fix twice.",
    image: "/og-guide-agent-readiness-aeo-geo.jpg",
    imageAlt: "turva.dev guide card: How AEO, GEO and agent-readiness relate, what each one fixes, and how to sequence the work so you do not pay for the same fix twice."
  },
  "/guides/agentic-commerce-readiness": {
    title: "Agentic commerce readiness: selling to AI shopping agents · turva.dev",
    description: "What an AI shopping agent needs to discover an offer, drive a checkout protocol and complete a purchase. Explained with A2A, AP2, ACP and x402.",
    image: "/og-guide-agentic-commerce-readiness.jpg",
    imageAlt: "turva.dev guide card: What an AI shopping agent needs to discover an offer, drive a checkout protocol and complete a purchase."
  },
  "/guides/letting-agents-act-on-data": {
    title: "Letting agents act on data: the decision envelope · turva.dev",
    description: "Letting an agent act safely depends on data that arrives intact and a decision envelope of permissions and thresholds. How to make that checkable.",
    image: "/og-guide-letting-agents-act-on-data.jpg",
    imageAlt: "turva.dev guide card: Letting an agent act safely depends on data that arrives intact and a decision envelope of permissions and thresholds."
  },
  "/guides/ai-agent-use-cases": {
    title: "AI agent use cases: where agents read data and make decisions · turva.dev",
    description: "AI agent use cases across commerce, monitoring, field support, remote operations and back-office data work, and what makes each one reliable.",
    image: "/og-guide-ai-agent-use-cases.jpg",
    imageAlt: "turva.dev guide card: AI agent use cases across commerce, monitoring, field support, remote operations and back-office data work, and what makes each one reliable."
  },
  "/guides/get-cited-by-ai-assistants": {
    title: "How to get your site cited by AI assistants · turva.dev",
    description: "What it takes to be a source AI assistants cite: readable content, structured data, corroboration, indexing where assistants search, and measurement.",
    image: "/og-guide-get-cited-by-ai-assistants.jpg",
    imageAlt: "turva.dev guide card: What it takes to be a source AI assistants cite: readable content, structured data, corroboration, indexing where assistants search, and measurement."
  },
  "/guides/choosing-an-agent-readiness-audit": {
    title: "Choosing an agent-readiness audit · turva.dev",
    description: "Who provides agent-readiness audits, what they cost, how long they take, and what you get. Pricing, deliverables, and how the engagement works.",
    image: "/og-guide-choosing-an-agent-readiness-audit.jpg",
    imageAlt: "turva.dev guide card: Who provides agent-readiness audits, what they cost, how long they take, and what you get."
  },
  "/guides/agent-readiness-gaps": {
    title: "Common agent-readiness gaps on marketing sites · turva.dev",
    description: "Marketing sites are often strong for people and weak for agents. The predictable gaps in rendering, discovery, cost and structured data, and the fixes.",
    image: "/og-guide-agent-readiness-gaps.jpg",
    imageAlt: "turva.dev guide card: Marketing sites are often strong for people and weak for agents. The predictable gaps in rendering, discovery, cost and structured data, and the fixes."
  }
};

function buildMetaBlock(pathname, canonicalUrl) {
  const m = META_BY_PATH[pathname] || META_BY_PATH["/"];
  const url = canonicalUrl || "https://turva.dev" + pathname;
  const isArticle = pathname.startsWith("/guides/") || pathname.startsWith("/blog/");
  const ogType = isArticle ? "article" : "website";
  const ogImage = "https://turva.dev" + (m.image || "/og.jpg");
  let articleMeta = "";
  if (isArticle) {
    articleMeta = `\n<meta property="article:author" content="https://www.linkedin.com/in/erikrekola/" />\n<meta property="article:section" content="${pathname.startsWith("/blog/") ? "Blog" : "Guides"}" />`;
    if (m.date) {
      articleMeta += `\n<meta property="article:published_time" content="${m.date}" />\n<meta property="article:modified_time" content="${m.modified || m.date}" />`;
    }
  }
  const st = escapeHtml(m.title);
  // Social cards and Medium's importer read og:title, and the " · turva.dev" suffix
  // that belongs in <title> only repeats the domain there. Strip it for og/twitter.
  const sot = escapeHtml(m.title.replace(/\s*[|\u00b7]\s*turva\.dev$/, ""));
  const sd = escapeHtml(m.description);
  const sa = escapeHtml(m.imageAlt);
  return `<title>${st}</title>
<meta name="description" content="${sd}" />
<meta property="og:type" content="${ogType}" />
<meta property="og:site_name" content="turva.dev" />
<meta property="og:title" content="${sot}" />
<meta property="og:description" content="${sd}" />
<meta property="og:url" content="${url}" />
<meta property="og:locale" content="en_US" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${sa}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${sot}" />
<meta name="twitter:description" content="${sd}" />
<meta name="twitter:image" content="${ogImage}" />
<meta name="twitter:image:alt" content="${sa}" />${articleMeta}`;
}

var PRICE_VALID_UNTIL = "2026-12-31";

// The Service node with its AggregateOffer and OfferCatalog is one constant because two
// pages carry it: the home page inside SCHEMA_HOME and /services inside its own graph. A
// second copy would be a second price list, and verify.mjs reads this one against facts.json.
var SCHEMA_SERVICE = `{"@type":"Service","@id":"https://turva.dev/#service","name":"Agent-readiness audits and advisory","provider":{"@id":"https://turva.dev/#business"},"serviceType":"Agent-readiness consulting","areaServed":{"@type":"Place","name":"Worldwide"},"availableChannel":{"@type":"ServiceChannel","serviceUrl":"https://turva.dev/services","availableLanguage":["en","fi"]},"offers":{"@type":"AggregateOffer","priceCurrency":"EUR","lowPrice":"999","highPrice":"4300","offerCount":"4","availability":"https://schema.org/InStock","url":"https://turva.dev/services","priceValidUntil":"${PRICE_VALID_UNTIL}"},"hasOfferCatalog":{"@type":"OfferCatalog","name":"turva.dev services with a fixed price","itemListElement":[
{"@type":"Offer","name":"Shopify agent storefront check","description":"Fixed scope, four written deliverables within 48 hours of the agreed written kickoff and a retest within 14 days. One live Shopify store read across browser WebMCP, Shopify-hosted Storefront and UCP MCP, and Agentic channels, with a product truth matrix and a prioritised correction plan.","url":"https://turva.dev/shopify-agent-storefront-check","price":"999","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"999","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"€999 fixed price, 48 hours from the agreed written kickoff. VAT (25,5%) added per Finnish law."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Shopify agent storefront check"}},
{"@type":"Offer","name":"Audit","description":"Fixed scope, two weeks. An independent scanner runs against the site or API, plus manual review of /.well-known/ manifests, JSON-LD and head metadata. Written report with prioritized fix list.","url":"https://turva.dev/services","price":"4300","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"4300","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"€4,300 fixed price, two weeks. VAT (25,5%) added per Finnish law."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness audit"}},
{"@type":"Offer","name":"Advisory","description":"Monthly retainer, async-only. Monthly re-scan and score delta report, a monthly AI-visibility delta across several AI platforms, written review of shipped work within one business day, roadmap input. Minimum three months.","url":"https://turva.dev/services","price":"3000","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"UnitPriceSpecification","price":"3000","priceCurrency":"EUR","valueAddedTaxIncluded":false,"unitCode":"MON","unitText":"month","description":"€3,000 per month, retainer-based. Minimum three months commitment."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness advisory"}},
{"@type":"Offer","name":"Implementation","description":"Hands-on work on the fixes the audit identified, or new agent-ready infrastructure. Edge workers, MCP servers, well-known manifests, JSON-LD generators, ai.txt and llms.txt authoring.","url":"https://turva.dev/services","price":"1500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"UnitPriceSpecification","price":"1500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"unitCode":"DAY","unitText":"day","description":"€1,500 per day. Scoped per task."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Implementation work"}}
]}}`;

var SCHEMA_HOME = `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"ProfessionalService","@id":"https://turva.dev/#business","name":"turva.dev","url":"https://turva.dev/","image":"https://turva.dev/og.jpg","logo":"https://turva.dev/logo.png","description":"Independent agent-readiness audits and advisory for product teams. An independent scanner measures the site or API, a written report names the prioritized fixes, the next scan verifies the result. Beyond readiness, the same discipline covers the data agents act on and the decisions they are allowed to make.","priceRange":"€€€","taxID":"3600281-7","vatID":"FI36002817","email":"info@turva.dev","areaServed":{"@type":"Place","name":"Worldwide"},"address":{"@type":"PostalAddress","addressLocality":"Tampere","addressCountry":"FI"},"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"info@turva.dev","availableLanguage":["English","Finnish"]},"founder":{"@id":"https://turva.dev/#person"},"sameAs":["https://tietopalvelu.ytj.fi/yritys/3600281-7","https://www.linkedin.com/in/erikrekola/","https://github.com/erekola","https://www.wikidata.org/wiki/Q140276251"]},
{"@type":"Person","@id":"https://turva.dev/#person","name":"Erik Rekola","jobTitle":"Agent-readiness consultant","worksFor":{"@id":"https://turva.dev/#business"},"sameAs":["https://www.linkedin.com/in/erikrekola/","https://github.com/erekola","https://www.wikidata.org/wiki/Q140276321","https://social.turva.dev/@erik","https://gravatar.com/erekola"]},
{"@type":"WebSite","@id":"https://turva.dev/#website","url":"https://turva.dev/","name":"turva.dev","publisher":{"@id":"https://turva.dev/#business"},"inLanguage":"en"},
${SCHEMA_SERVICE},
{"@type":"FAQPage","@id":"https://turva.dev/#faq","inLanguage":"en","mainEntity":[
${mdFaqBlocks("/", "Frequently asked").pairs.map((p) => `{"@type":"Question","name":${JSON.stringify(p.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(p.a)}}}`).join(",\n")}
]}
]}
<\/script>`;

function appendAgentLinks(headers) {
  headers.append("Link", '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"');
  headers.append("Link", '</.well-known/ard.json>; rel="ard"; type="application/json"');
  headers.append("Link", '</.well-known/ai-catalog.json>; rel="ai-catalog"; type="application/json"');
  headers.append("Link", '</openapi.json>; rel="service-desc"; type="application/json"');
  headers.append("Link", '</llms.txt>; rel="service-doc"; type="text/plain"');
  headers.append("Link", '</llms-full.txt>; rel="service-doc"; type="text/plain"; title="Full content"');
  headers.append("Link", '</.well-known/signatures.json>; rel="signature"; type="application/json"');
  headers.append("Link", '</auth.md>; rel="agent-registration"; type="text/markdown"; title="Agent registration"');
  headers.append("Link", '</.well-known/mcp/server-card.json>; rel="service-meta"; type="application/json"');
  headers.append("Link", '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"');
  headers.append("Link", '</.well-known/agent-card.json>; rel="service-meta"; type="application/json"; title="A2A Agent Card"');
  headers.append("Link", '</llms.txt>; rel="describedby"; type="text/plain"');
  headers.append("Link", '</sitemap.xml>; rel="sitemap"; type="application/xml"');
  headers.append("Link", '</.well-known/security.txt>; rel="security-txt"; type="text/plain"');
  headers.append("Link", '</.well-known/ai.txt>; rel="ai-policy"; type="text/plain"');
  headers.append("Link", '</robots.txt>; rel="robots"; type="text/plain"');
  headers.append("Link", '<https://www.linkedin.com/in/erikrekola/>; rel="author"');
  headers.append("Link", '</legal>; rel="license"');
  headers.append("Link", '</.well-known/oauth-authorization-server>; rel="oauth-authorization-server"; type="application/json"');
  headers.append("Link", '</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json"');
  headers.append("Link", '</.well-known/ap2>; rel="ap2"; type="application/json"');
  headers.append("Link", '</.well-known/acp>; rel="acp"; type="application/json"');
  headers.append("Link", '</x402>; rel="x402-endpoint"; type="application/json"');
  headers.append("Link", '</.well-known/x402>; rel="x402"; type="application/json"');
  headers.append("Link", '</.well-known/mpp>; rel="mpp"; type="application/json"');
  headers.append("Link", '</.well-known/ucp>; rel="ucp"; type="application/json"');
  headers.append("Link", '</agent/auth/register>; rel="agent-auth-register"; type="application/json"');
  headers.append("Link", '<mailto:info@turva.dev?subject=Quote%20request>; rel="payment"; title="Request a quote"');
  headers.append("Link", '<https://social.turva.dev/@erik>; rel="me"');
}

var FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#5DF18F" stroke-width="2.4"/><path d="M10.5 16.4l3.6 3.6 7.2-7.6" stroke="#5DF18F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// 405 for a method the route does not serve. Round 16 (S1-1, C1-2, C5-20, C7-2, measured
// 2026-09-03): until v3.115.0 every GET route answered POST, PUT, DELETE and PATCH with the
// same 200 body as GET, while the OpenAPI document declares one get operation for those
// paths and the CORS preflight promised only GET, POST and OPTIONS. The Allow header names
// what the route serves; HEAD is always in it because worker_default turns HEAD into GET.
function serve405(allow, pathLower) {
  const agent = AGENT_API_PATH_RE.test(pathLower);
  const headers = new Headers({ "content-type": "text/plain; charset=utf-8", "allow": allow, "cache-control": "no-store" });
  if (agent) headers.set("access-control-allow-origin", "*");
  applySecurityHeaders(headers, agent ? "agent-api" : "default");
  return new Response("405 Method Not Allowed. Allow: " + allow + "\n", { status: 405, headers });
}

function serve404(pathname) {
  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#0A1316" />
<meta name="robots" content="noindex" />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'><circle cx='16' cy='16' r='13' stroke='%235DF18F' stroke-width='2.4'/><path d='M10.5 16.4l3.6 3.6 7.2-7.6' stroke='%235DF18F' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/></svg>" />
<link rel="icon" type="image/png" sizes="512x512" href="https://turva.dev/logo.png" />
<link rel="apple-touch-icon" href="https://turva.dev/logo.png" />
<link rel="alternate" type="application/rss+xml" title="turva.dev blog" href="https://turva.dev/blog/feed.xml" />
<title>Page not found · turva.dev</title>
<style>
html,body{background-color:#0A1316;overflow-wrap:break-word;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color-scheme:dark;}
main{max-width:46rem;margin:0 auto;padding:3rem 1.25rem 4rem;}
h1{color:#5DF18F;overflow-wrap:break-word;hyphens:auto;font-size:2rem;line-height:1.2;margin:0 0 1rem;}
p{margin:0 0 1.1rem;}
a{color:#5DF18F;}
.turva-nav{box-sizing:border-box;width:100%;background:#0A1316;display:flex;align-items:center;gap:24px;flex-wrap:wrap;padding:16px clamp(20px,5vw,72px);}
.turva-nav *,.turva-nav *::before,.turva-nav *::after{box-sizing:border-box;}
.turva-nav .nv-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.turva-nav .nv-brand svg{display:block;width:26px;height:26px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
.turva-nav .nv-menu{display:flex;flex-wrap:wrap;min-width:0;align-items:center;gap:clamp(18px,2.4vw,38px);list-style:none;margin:0;padding:0;}
.turva-nav .nv-menu a{font-size:15px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
@media (max-width:560px){.turva-nav .nv-menu{gap:16px;}.turva-nav .nv-menu a{font-size:14px;}}
${FOOTER_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<nav class="turva-nav" aria-label="Main">
  <a class="nv-brand" href="/">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="#5DF18F" stroke-width="2.4"></circle>
      <path d="M10.5 16.4l3.6 3.6 7.2-7.6" stroke="#5DF18F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <span class="nv-word">turva<b>·</b>dev</span>
  </a>
  <ul class="nv-menu">
    <li><a href="/">home</a></li>
    <li><a href="/services">services</a></li>
    <li><a href="/guides">guides</a></li>
    <li><a href="/blog">blog</a></li>
    <li><a href="/tools">tools</a></li>
    <li><a href="/company">company</a></li>
    <li><a href="/legal">legal</a></li>
    <li><a href="/contact">contact</a></li>
  </ul>
</nav>
<main id="main">
<h1>Page not found</h1>
<p>The page at ${escapeHtml(pathname)} does not exist. It may have moved.</p>
<p>Try the <a href="/">home page</a>, the <a href="/guides">guides</a>, or the <a href="/blog">blog</a>.</p>
</main>
${footerHtml()}
</body>
</html>`;
  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    "content-language": "en"
  });
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "html");
  return new Response(body, { status: 404, headers });
}

function stripBody(response) {
  return new Response(null, { status: response.status, statusText: response.statusText, headers: response.headers });
}

// A2A HTTP+JSON transport, revision 0.3.0. The agent card has declared url https://turva.dev
// with preferredTransport HTTP+JSON and three skills since it was written, and nothing answered
// there: a POST returned the homepage HTML. The card was a promise with no endpoint behind it,
// which is the exact failure this site sells auditing for. Implemented rather than narrowed,
// because the three skills are real data already served elsewhere; only the transport was
// missing. Data comes from HOME_JSON so no fourth copy of the service catalog is created.
// The response envelope is { message } and not a bare Message, per the spec's REST binding:
// a conformant client reads response.message and a bare Message hands it undefined.
var A2A_SKILL_IDS = ["services", "contact-info", "company-info"];

function a2aSkillData(home, skillId) {
  if (skillId === "services") {
    return { skill: "services", services: home.services, bundledImplementation: home.bundledImplementation, engagement: home.engagement };
  }
  if (skillId === "contact-info") {
    // The card promises email, Signal, LinkedIn and the business ID. Every one of them is
    // returned, because a skill that answers with less than its own description is the same
    // defect as a card with no endpoint.
    return {
      skill: "contact-info",
      email: home.email,
      signal: home.signal,
      // Host match, not substring. "linkedin.com" can sit anywhere in a URL, so a
      // substring test reads as a host check without being one. sameAs is this
      // site's own data, so there is no attack path here, but this repo is public
      // reference material that gets read and forked, and a line that is a hole
      // with foreign input is a hole wherever it is copied.
      linkedin: (home.sameAs || []).find((u) => {
        try {
          const h = new URL(u).hostname.toLowerCase();
          return h === "linkedin.com" || h.endsWith(".linkedin.com");
        } catch {
          return false;
        }
      }) || null,
      businessId: home.businessId,
      engagement: home.engagement
    };
  }
  if (skillId === "company-info") {
    return {
      skill: "company-info",
      name: home.name,
      description: home.description,
      founder: home.founder,
      businessId: home.businessId,
      location: home.location,
      sameAs: home.sameAs
    };
  }
  return null;
}

function a2aJson(body, status, allow) {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*"
  });
  if (allow) headers.set("allow", allow);
  if (allow) headers.set("access-control-expose-headers", "allow");
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "agent-api");
  return new Response(JSON.stringify(body, null, 2), { status: status || 200, headers });
}

function a2aError(code, message, data, status, allow) {
  const err = { code, message };
  if (data) err.data = data;
  return a2aJson({ error: err }, status, allow);
}

async function serveA2AMessageSend(request) {
  if (request.method !== "POST") {
    return a2aError(-32600, "invalid request: A2A message:send is POST only", null, 405, "POST, OPTIONS");
  }
  let payload;
  try { payload = await request.json(); } catch { payload = null; }
  const msg = payload && payload.message;
  if (!msg || !Array.isArray(msg.parts)) {
    return a2aError(-32602, "invalid params: expected a message object with a parts array", null, 400);
  }
  // Only a string is accepted here. Coercing an arbitrary value with String() let a deeply
  // nested array recurse through Array.prototype.join and throw RangeError, which escaped this
  // function and answered 500 to an 8 kB request body (measured 2026-08-01).
  const named = typeof (msg.metadata && msg.metadata.skillId) === "string"
    ? msg.metadata.skillId.trim()
    : "";
  if (named && !A2A_SKILL_IDS.includes(named)) {
    return a2aError(-32602, "invalid params: unknown skillId", { skillId: named, skills: A2A_SKILL_IDS }, 400);
  }
  const text = msg.parts
    .map((pt) => (pt && typeof pt.text === "string" ? pt.text : ""))
    .join(" ")
    .toLowerCase();
  const matched = named
    ? [named]
    : A2A_SKILL_IDS.filter((id) => text.includes(id) || text.includes(id.split("-")[0]));
  const chosen = matched.length ? matched : A2A_SKILL_IDS;
  const home = JSON.parse(HOME_JSON);
  return a2aJson({
    message: {
      kind: "message",
      role: "agent",
      messageId: crypto.randomUUID(),
      parts: chosen.map((id) => ({ kind: "data", data: a2aSkillData(home, id) })),
      metadata: {
        skills: chosen,
        note: matched.length
          ? undefined
          : "No skill was named, so every skill this card declares is returned. Name one with metadata.skillId."
      }
    }
  });
}
function serveStatic(body, contentType, kind) {
  const headers = new Headers({
    "content-type": contentType,
    "cache-control": "public, max-age=3600",
    "access-control-allow-origin": "*"
  });
  appendAgentLinks(headers);
  applySecurityHeaders(headers, kind || "agent-api");
  return new Response(body, { status: 200, headers });
}

function serveMtaStsPolicy() {
  const headers = new Headers({
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "public, max-age=86400"
  });
  applySecurityHeaders(headers, "default");
  return new Response(MTA_STS_POLICY, { status: 200, headers });
}

var HOME_JSON = JSON.stringify({ "name": "turva.dev", "url": "https://turva.dev/", "description": "Independent agent-readiness audits and advisory for product teams. An independent scanner measures the site or API, a written report names the prioritized fixes, the next scan verifies the result. Beyond readiness, the same discipline covers the data agents act on and the decisions they are allowed to make.", "founder": "Erik Rekola", "location": { "city": "Tampere", "country": "FI" }, "businessId": "3600281-7", "email": "info@turva.dev", "signal": "https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK", "sameAs": ["https://www.wikidata.org/wiki/Q140276251", "https://www.linkedin.com/in/erikrekola/", "https://github.com/erekola", "https://tietopalvelu.ytj.fi/yritys/3600281-7"], "services": [{ "name": "Shopify agent storefront check", "price": 999, "currency": "EUR", "unit": "fixed", "duration": "48 hours", "vatIncluded": false }, { "name": "Audit", "price": 4300, "currency": "EUR", "unit": "fixed", "duration": "2 weeks", "vatIncluded": false }, { "name": "Advisory", "price": 3000, "currency": "EUR", "unit": "month", "minimumCommitment": "3 months", "vatIncluded": false }, { "name": "Implementation", "price": 1500, "currency": "EUR", "unit": "day", "vatIncluded": false }, { "name": "Agent operations", "pricing": "on request" }, { "name": "MCP server design", "pricing": "on request" }], "bundledImplementation": [{ "name": "Audit fix implementation", "price": 499, "currency": "EUR", "unit": "fixed", "vatIncluded": false, "requires": "Audit", "scope": "Exactly the fixes the audit report lists.", "soldSeparately": false }, { "name": "Shopify correction implementation", "price": 499, "currency": "EUR", "unit": "fixed", "vatIncluded": false, "requires": "Shopify agent storefront check", "scope": "Exactly the corrections the check's plan lists.", "soldSeparately": false }], "engagement": "Async only. No calls, no calendar links. Reply within one business day. Fixed scope written before payment.", "useCases": ["Reading a product catalog and completing a checkout for a buyer", "Watching an API and acting when a threshold is crossed", "Guiding a field technician from the same data an expert would use", "Triaging incoming requests and resolving the routine ones", "Operating a remote system over an unreliable link", "Reconciling records across systems and flagging mismatches", "Making a time-critical decision locally when no human can respond in time"], "resources": { "guides": "https://turva.dev/guides", "llmsTxt": "https://turva.dev/llms.txt", "llmsFullTxt": "https://turva.dev/llms-full.txt", "openapi": "https://turva.dev/openapi.json", "mcp": "https://mcp.turva.dev/mcp", "apiCatalog": "https://turva.dev/.well-known/api-catalog" }, "lastVerified": "2026-09-01" }, null, 2);
var API_INDEX_JSON = JSON.stringify({ "service": "turva.dev", "version": "v1", "description": "Agent endpoint index for turva.dev. The machine-readable surfaces an AI agent can read and call.", "endpoints": { "a2aMessageSend": "https://turva.dev/v1/message:send", "agentCard": "https://turva.dev/.well-known/agent-card.json", "openapi": "https://turva.dev/openapi.json", "apiCatalog": "https://turva.dev/.well-known/api-catalog", "mcp": "https://mcp.turva.dev/mcp", "mcpServerCard": "https://turva.dev/.well-known/mcp/server-card.json", "aiPlugin": "https://turva.dev/.well-known/ai-plugin.json", "agentJson": "https://turva.dev/.well-known/agent.json", "llmsTxt": "https://turva.dev/llms.txt", "llmsFullTxt": "https://turva.dev/llms-full.txt", "signatures": "https://turva.dev/.well-known/signatures.json", "jwks": "https://turva.dev/.well-known/jwks.json" }, "homepage": "https://turva.dev/", "contact": "info@turva.dev" }, null, 2);

// RFC 9110 12.5.1: a q-value is a preference and q=0 is a refusal. Splitting on ";"
// and keeping only the media type discarded both. "Accept: text/html, text/markdown;q=0.1"
// asks for HTML and names markdown as a last resort, and used to be answered with
// markdown; "text/markdown;q=0" is the spec form for refusing markdown and was answered
// with markdown too. wantsJson had been patched around the same gap by hand with a
// text/html exclusion, which is the tell that the gap was known in one half only.
// Both now read one parse. Each keeps its ORIGINAL tie behaviour, because a tie is not
// what was broken and isitagentready's markdown negotiation check reads this path: the
// old wantsMarkdown returned true whenever text/markdown appeared at all, so markdown
// won every tie, and the old wantsJson carried an explicit text/html exclusion, so JSON
// lost every tie. Only the discarded q-value is fixed here.
function acceptRanking(request) {
  const ranking = {};
  const accept = (request.headers.get("Accept") || "").toLowerCase();
  if (!accept) return ranking;
  for (const part of accept.split(",")) {
    const bits = part.trim().split(";");
    const type = bits[0].trim();
    if (!type) continue;
    let q = 1;
    for (const param of bits.slice(1)) {
      const m = param.trim().match(/^q=(\d+(?:\.\d+)?)$/);
      if (m) q = parseFloat(m[1]);
    }
    if (!(q >= 0)) q = 0;
    if (ranking[type] === undefined || q > ranking[type]) ranking[type] = q;
  }
  return ranking;
}

function prefersType(request, wanted, htmlWinsTie) {
  const ranking = acceptRanking(request);
  const q = ranking[wanted];
  if (!(q > 0)) return false;
  for (const other of ["text/html", "text/markdown", "application/json"]) {
    if (other === wanted) continue;
    const oq = ranking[other];
    if (oq === undefined) continue;
    if (oq > q) return false;
    if (oq === q && other === "text/html" && htmlWinsTie) return false;
  }
  return true;
}

function wantsMarkdown(request) {
  return prefersType(request, "text/markdown", false);
}

function wantsJson(request) {
  return prefersType(request, "application/json", true);
}

// v2 of the llms.txt proposal asks for the markdown version of a page at a URL an
// agent can derive without an Accept header: ".md" appended to the page URL, or the
// extension replaced. Every page here is extensionless, so appending is the form that
// applies, and the spec names index.md for a URL with no file name, which is the
// homepage. One helper builds it so the head link, the Link header and the route can
// never disagree about the address.
function markdownUrlFor(canonicalUrl) {
  return canonicalUrl.endsWith("/") ? canonicalUrl + "index.md" : canonicalUrl + ".md";
}

function serveMarkdown(body, canonicalUrl) {
  const tokens = body.split(/\s+/).filter(Boolean).length;
  const headers = new Headers({
    "content-type": "text/markdown; charset=utf-8",
    "cache-control": "public, max-age=3600",
    "access-control-allow-origin": "*",
    "vary": "Accept",
    "x-markdown-words": String(tokens)
  });
  if (canonicalUrl) {
    headers.set("content-location", canonicalUrl);
    headers.append("Link", `<${canonicalUrl}>; rel="canonical"`);
  }
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "agent-api");
  return new Response(body, { status: 200, headers });
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Cut a string to at most n UTF-16 code units without leaving a lone high surrogate at the
// end. String.prototype.slice counts code units, so a cut that lands inside a surrogate pair
// leaves half of it, and workerd serialises that half as three bytes that are not valid
// UTF-8 under a charset=utf-8 header (round 16 S3-1, measured 2026-09-03 with a 300 character
// url= parameter whose 300th unit opened an emoji). Mirrored in the npm package.
function cut(s, n) {
  s = String(s).slice(0, n);
  return /[\uD800-\uDBFF]$/.test(s) ? s.slice(0, -1) : s;
}

// Unicode bidi controls (U+202A to U+202E, U+2066 to U+2069) have no place inside an href:
// the right-to-left override is the classic way to make a link read as a different address
// than the one it opens (round 16, verifier C, 2026-09-03). Stripped from every href this
// renderer writes; the visible text keeps them because escapeHtml already neutralises markup.
var BIDI_CONTROLS = /[\u202A-\u202E\u2066-\u2069]/g;

function renderInline(text) {
  let out = escapeHtml(text);
  out = out.replace(/&lt;mailto:(.+?)&gt;/g, '<a href="mailto:$1">$1</a>');
  out = out.replace(/&lt;(https?:\/\/.+?)&gt;/g, '<a href="$1">$1</a>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, href) => {
    // out has already been through escapeHtml, so href arrives escaped, and escaping it
    // again would double-encode: the first link to carry two query parameters would render
    // "&amp;amp;" and 404 silently. No link in the file has an "&" today, so this is a
    // hazard removed rather than a bug observed. The autolinkers above already do not
    // re-escape. The "/" branch also has to refuse "//host", which is protocol-relative
    // and external, not root-relative.
    return /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href.trim()) ? `<a href="${href.replace(BIDI_CONTROLS, "")}">${label}</a>` : escapeHtml(label);
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[\s(])(info@turva\.dev)/g, '$1<a href="mailto:info@turva.dev">$2</a>');
  out = out.replace(/(^|[\s(])(https?:\/\/[^\s<)"]+)/g, function(m, pre, url) {
    var tm = url.match(/[.,;:!?]+$/);
    var tail = "";
    if (tm) { tail = tm[0]; url = url.slice(0, url.length - tail.length); }
    return pre + '<a href="' + url.replace(BIDI_CONTROLS, "") + '">' + url + '</a>' + tail;
  });
  out = out.replace(/(^|[\s(])((?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+\/[^\s<)"]*)/gi, function(m, pre, url) {
    var tm = url.match(/[.,;:!?]+$/);
    var tail = "";
    if (tm) { tail = tm[0]; url = url.slice(0, url.length - tail.length); }
    return pre + '<a href="https://' + url.replace(BIDI_CONTROLS, "") + '">' + url + '</a>' + tail;
  });
  return out;
}

function markdownToHtml(md) {
  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const rawLines = block.split("\n").filter((l) => l.trim() !== "");
    const tl = trimmed.split("\n").map((l) => l.trim());
    if (rawLines.length && rawLines.every((l) => l.startsWith("    "))) {
      html.push(`<pre><code>${escapeHtml(rawLines.map((l) => l.slice(4)).join("\n"))}</code></pre>`);
    } else if (tl.length >= 2 && tl[0].startsWith("|") && /^\|[\s:|-]+\|$/.test(tl[1])) {
      const cells = (l) => l.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => renderInline(c.trim()));
      const head = cells(tl[0]).map((c) => `<th>${c}</th>`).join("");
      const rows = tl.slice(2).filter((l) => l.startsWith("|")).map((l) => `<tr>${cells(l).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
      html.push(`<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`);
    } else if (/^-{3,}$/.test(trimmed)) {
      // Vaakaviiva. Lisatty 2026-08-24 (Tek-269). Syntyi briefsivua varten, mutta brief
      // EI enaa tuota vaakaviivaa markdowniinsa: tyylipassin R6 luki sen irralliseksi
      // riviksi rungossa, joten se jai samana paivana pois template.py:n markdownista ja
      // on nyt vain PDF:n koriste. Haara jaa tanne, koska se on oikea tapa lukea
      // markdownin vaakaviiva ja mika tahansa sivu voi kayttaa sita. Mitattu samana
      // paivana ettei yksikaan PAGE_MARKDOWN-lohko sisalla riviaan joka on tasan ---,
      // joten tama ei muuta yhdenkaan olemassa olevan sivun ulostuloa.
      html.push("<hr />");
    } else if (trimmed.startsWith("## ")) {
      // id since v3.123.0 (Tek-342): a stable anchor per section, so a long page can carry a
      // contents list. The slug is the heading text lowercased with runs of anything but
      // a to z and 0 to 9 collapsed to one hyphen, which is what a reader would type by hand.
      const h2 = trimmed.slice(3).trim();
      const h2Id = h2.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      html.push(`<h2${h2Id ? ` id="${h2Id}"` : ""}>${renderInline(h2)}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      html.push(`<h1>${renderInline(trimmed.slice(2).trim())}</h1>`);
    } else if (/^- /.test(trimmed)) {
      const items = trimmed.split("\n").filter((l) => /^- /.test(l.trim())).map((l) => `<li>${renderInline(l.trim().slice(2).trim())}</li>`).join("");
      html.push(`<ul>${items}</ul>`);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      html.push(`<p class="date">${trimmed}</p>`);
    } else {
      html.push(`<p>${renderInline(trimmed)}</p>`);
    }
  }
  return html.join("\n");
}

// ---- Prose from PAGE_MARKDOWN (T3, mds/decisions.md Tek-56) ----
// Card pages render hand-built structure (nav, cards, key-value grids,
// forms) around prose read from PAGE_MARKDOWN at request time, so every
// sentence lives once and a page cannot drift from its markdown twin.
// tools/verify.mjs guards converted pages: no literal prose paragraphs in
// the function body, and every referenced section heading must exist in
// the twin. A missing heading throws here, which the render harness and
// the static gate catch before any deploy.
function mdTwin(path) {
  return PAGE_MARKDOWN[path].replace(/\r\n/g, "\n");
}
function mdLead(path) {
  const md = mdTwin(path);
  const cut = md.indexOf("\n## ");
  const blocks = (cut === -1 ? md : md.slice(0, cut)).split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const title = blocks.length && blocks[0].startsWith("# ") ? blocks[0].slice(2).trim() : "";
  const paras = blocks.slice(1).filter((b) => !/^[-|>#]|^ {4}/.test(b));
  return { title, paras };
}
function mdSection(path, heading) {
  const md = mdTwin(path);
  const key = "\n## " + heading + "\n";
  const at = md.indexOf(key);
  if (at === -1) throw new Error("mdSection: no \"" + heading + "\" in PAGE_MARKDOWN[\"" + path + "\"]");
  const from = at + key.length;
  const next = md.indexOf("\n## ", from);
  return (next === -1 ? md.slice(from) : md.slice(from, next)).trim();
}
function mdBodyHtml(path, heading) {
  return markdownToHtml(mdSection(path, heading)).replace(/href="https:\/\/turva\.dev\//g, 'href="/');
}
function mdPageStart(path) {
  const lead = mdLead(path);
  const intro = lead.paras.map((p, i) => `<p${i === 0 ? ' class="intro"' : ""}>${renderInline(p)}</p>`).join("\n  ");
  return `<h1>${renderInline(lead.title)}</h1>
  ${intro}`;
}
function mdCard(path, heading) {
  return `<div class="scard"><h2>${renderInline(heading)}</h2>
    ${mdBodyHtml(path, heading)}
  </div>`;
}
function mdKvsCard(path, heading, extra) {
  const rows = mdSection(path, heading).split("\n").filter((l) => l.startsWith("- ")).map((l) => {
    const m = l.slice(2).match(/^(?:\*\*(.+?):\*\*|([^:]+):)\s*(.+)$/);
    return m ? { k: (m[1] || m[2]).trim(), v: m[3].trim() } : null;
  }).filter(Boolean);
  const cell = (v) => {
    // A markdown link in a key-value row is rendered as a link, not printed as
    // source. The Signal row is the first row whose value carries one.
    const lm = v.match(/^\[(.+?)\]\((https?:\/\/[^)]+)\)$/);
    if (lm) return `<a class="v" href="${escapeHtml(lm[2])}">${escapeHtml(lm[1])}</a>`;
    const mm = v.match(/^<mailto:(.+)>$/);
    if (mm) return `<a class="v" href="mailto:${escapeHtml(mm[1])}">${escapeHtml(mm[1])}</a>`;
    if (/^https?:\/\//.test(v)) {
      const disp = v.replace(/^https?:\/\/(?:www\.)?/, "").replace(/\/$/, "");
      return `<a class="v" href="${escapeHtml(v)}">${escapeHtml(disp)}</a>`;
    }
    return `<span class="v">${escapeHtml(v)}</span>`;
  };
  const kv = rows.map((r) => `    <div class="kv"><span class="k">${escapeHtml(r.k)}</span>${cell(r.v)}</div>`).join("\n");
  return `<div class="scard"><h2>${renderInline(heading)}</h2><div class="kvs">
${kv}
  </div>${extra || ""}</div>`;
}
function contactSignalQr() {
  // The Signal row resolves on a desktop, where signal.me opens the app. On a
  // phone that is already the reader's own device, so the same link is offered
  // as a code to scan from a second screen. The two sentences are the two
  // non-list blocks of the Channels section in the twin, so the prose lives
  // once and this function adds structure only. The plate is light on purpose:
  // an inverted code is closer to the site's palette but some readers refuse
  // to decode one.
  const paras = mdSection("/contact", "Channels").split("\n\n").map((b) => b.trim()).filter((b) => b && !b.startsWith("- "));
  return `
    <div class="sigqr">
      <div class="sigqr-txt">
${paras.map((t, i) => `        <p${i ? ' class="hint"' : ""}>${renderInline(t)}</p>`).join("\r\n")}
      </div>
      <div>
        <a class="sigqr-plate" href="https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK"><img src="/signal-qr.png" width="147" height="147" alt="Signal QR code for the username turva.19. Scan it with a phone to start a Signal chat."></a>
        <span class="sigqr-user">@turva.19</span>
      </div>
    </div>`;
}
function mdFaqBlocks(path, heading) {
  // One markdown block per answer. A non-question block that does not
  // directly follow a question is section tail prose (rendered by
  // mdFaqTailHtml at main level), not part of the last answer.
  const pairs = [];
  const tail = [];
  let expectAnswer = false;
  for (const block of mdSection(path, heading).split(/\n{2,}/)) {
    const t = block.trim();
    if (!t) continue;
    const q = t.match(/^\*\*(.+?)\*\*$/);
    if (q) { pairs.push({ q: q[1].trim(), a: "" }); expectAnswer = true; continue; }
    const flat = t.replace(/\s*\n\s*/g, " ");
    if (expectAnswer) { pairs[pairs.length - 1].a = flat; expectAnswer = false; }
    else tail.push(flat);
  }
  // An answerless question reached the FAQPage JSON-LD as an empty acceptedAnswer.text and
  // nothing could see it. Failing here is the same shape as mdPcard above: the module-level
  // callers make it a build failure, and the static gate names the page before any deploy.
  for (const p of pairs) {
    if (!p.a) throw new Error("mdFaqBlocks: " + path + " " + heading + ": no answer follows the question " + JSON.stringify(p.q));
  }
  return { pairs, tail };
}
function mdFaqRows(path, heading) {
  return mdFaqBlocks(path, heading).pairs.map((p) => `    <p class="q">${renderInline(p.q)}</p>
    <p>${renderInline(p.a)}</p>`).join("\n");
}
function mdFaqCard(path, heading) {
  return `<div class="scard"><h2>${renderInline(heading)}</h2><div class="faq">
${mdFaqRows(path, heading)}
  </div></div>`;
}
function mdFaqTailHtml(path, heading) {
  return mdFaqBlocks(path, heading).tail.map((t) => `<p>${renderInline(t)}</p>`).join("\n  ");
}
function mdLinksCard(path, heading) {
  const html = mdBodyHtml(path, heading).replace(/<p>/g, '<p class="sub">');
  return `<div class="scard"><h2>${renderInline(heading)}</h2>${html}
  </div>`;
}
function mdTermsHtml(path, heading) {
  const out = [];
  let dl = [];
  const flush = () => {
    if (dl.length) {
      out.push(`<div class="dl">
      ${dl.join("\n      ")}
    </div>`);
      dl = [];
    }
  };
  for (const block of mdSection(path, heading).split(/\n{2,}/)) {
    const t = block.trim();
    if (!t) continue;
    const m = t.match(/^\*\*([^*]+)\*\*\s+([\s\S]+)$/);
    if (m) {
      dl.push(`<p><span class="term">${renderInline(m[1])}</span> ${renderInline(m[2])}</p>`);
      continue;
    }
    flush();
    out.push(markdownToHtml(t));
  }
  flush();
  return out.join("\n    ");
}
function mdTermsCard(path, heading) {
  return `<div class="scard"><h2>${renderInline(heading)}</h2>
    ${mdTermsHtml(path, heading)}
  </div>`;
}
function mdParas(path, heading, count) {
  const paras = mdSection(path, heading).split(/\n{2,}/).map((b) => b.trim()).filter(Boolean).filter((b) => !/^[-|>]|^ {4}/.test(b)).map((b) => renderInline(b.replace(/\s*\n\s*/g, " ")));
  if (count && paras.length !== count) throw new Error("mdParas: " + path + " " + heading + " has " + paras.length + " blocks, expected " + count);
  return paras;
}
function mdPcard(path, heading) {
  // Price cards on /services. The twin section shape is fixed: a **price.
  // meta. meta.** lead, a description, labelled checklists ("What you
  // get:" / "What you do not get:" / "Typical work:" followed by - items,
  // continuation lines indented), optional plain paragraphs, and the LAST
  // block renders as the muted .suited line.
  const blocks = mdSection(path, heading).split(/\n{2,}/).map((b) => b.replace(/\s+$/, "")).filter(Boolean);
  const head = blocks[0].trim().match(/^\*\*(.+)\*\*$/);
  if (!head) throw new Error("mdPcard: " + heading + " does not open with a **price** block");
  const segs = head[1].replace(/\.$/, "").split(". ");
  let price = segs[0];
  let meta = segs.slice(1);
  const pm = price.match(/^(€[\d,]+)\s+(.+)$/);
  if (pm) { price = pm[1]; meta = [pm[2], ...meta]; }
  const parts = [`<div class="pcard-head"><h2 class="pcard-t">${renderInline(heading)}</h2><span class="pcard-price">${escapeHtml(price).replace(/€/g, "&#8364;")}</span><span class="pcard-meta">${meta.map((m) => escapeHtml(m)).join(" &middot; ")}</span></div>`];
  const bodyBlocks = blocks.slice(1);
  bodyBlocks.forEach((b, i) => {
    const lines = b.split("\n");
    if (/:$/.test(lines[0].trim()) && lines.slice(1).some((l) => l.startsWith("- "))) {
      const label = lines[0].trim().replace(/:$/, "");
      const items = [];
      for (const l of lines.slice(1)) {
        if (l.startsWith("- ")) items.push(l.slice(2).trim());
        else if (items.length) items[items.length - 1] += " " + l.trim();
      }
      const cls = /\bnot\b/.test(label) ? "nope" : "get";
      parts.push(`<h3 class="lbl">${renderInline(label)}</h3>`);
      parts.push(`<ul class="${cls}">
      ${items.map((it) => `<li>${renderInline(it)}</li>`).join("\n      ")}
    </ul>`);
    } else {
      const flat = renderInline(b.replace(/\s*\n\s*/g, " "));
      parts.push(i === bodyBlocks.length - 1 ? `<p class="suited">${flat}</p>` : `<p>${flat}</p>`);
    }
  });
  return `<div class="pcard">
    ${parts.join("\n    ")}
  </div>`;
}
function mdLists(path, heading) {
  // Every "- item" list block in the section, in order; continuation lines
  // (indented) join their item. Returns an array of item arrays.
  const lists = [];
  for (const block of mdSection(path, heading).split(/\n{2,}/)) {
    const lines = block.split("\n");
    if (!lines.some((l) => l.startsWith("- "))) continue;
    const items = [];
    for (const l of lines) {
      if (l.startsWith("- ")) items.push(l.slice(2).trim());
      else if (items.length && /^\s+\S/.test(l)) items[items.length - 1] += " " + l.trim();
    }
    lists.push(items.map((it) => renderInline(it)));
  }
  return lists;
}
function mdTidyUrlText(html) {
  // Autolinked bare URLs keep the full URL as their visible text; strip the
  // scheme, www. and a trailing slash from the TEXT only (hrefs untouched).
  return html.replace(/>https?:\/\/(?:www\.)?([^<]*?)\/?</g, ">$1<");
}

// Guide pages are rendered to HTML right here by the worker. Agents that
// send Accept: text/markdown are served PAGE_MARKDOWN earlier; this is the
// human/HTML representation.
function buildGuideJsonLd(pathname, canonicalUrl) {
  const m = META_BY_PATH[pathname] || META_BY_PATH["/"];
  // The headline is the page heading, not the title tag. It comes from the
  // PAGE_MARKDOWN h1 so the structured data and the visible heading cannot
  // drift, and the site suffix never leaks in. The title fallback strips
  // either separator, because META_BY_PATH uses both.
  const mdH1 = (PAGE_MARKDOWN[pathname] || "").match(/^# (.+)$/m);
  const headline = mdH1 ? mdH1[1].trim() : m.title.replace(/ [|\u00B7] turva\.dev$/, "");
  const url = canonicalUrl || "https://turva.dev" + pathname;
  const isGuide = pathname === "/guides" || pathname.startsWith("/guides/");
  const isBlogPost = pathname.startsWith("/blog/");
  const isBlogHub = pathname === "/blog";
  const article = {
    "@context": "https://schema.org",
    "@type": pathname === "/guides" ? "CollectionPage" : (isGuide ? "TechArticle" : (isBlogPost ? "BlogPosting" : (isBlogHub ? "Blog" : "WebPage"))),
    "headline": headline,
    "description": m.description,
    "url": url,
    "image": { "@type": "ImageObject", "url": "https://turva.dev" + (m.image || "/og.jpg"), "width": 1200, "height": 630 },
    "inLanguage": "en",
    "author": { "@type": "Person", "@id": "https://turva.dev/#person", "name": "Erik Rekola", "url": "https://turva.dev/", "sameAs": ["https://www.wikidata.org/wiki/Q140276321", "https://www.linkedin.com/in/erikrekola/", "https://github.com/erekola", "https://gravatar.com/erekola"] },
    "publisher": { "@type": "Organization", "@id": "https://turva.dev/#business", "name": "turva.dev", "url": "https://turva.dev/", "sameAs": ["https://www.wikidata.org/wiki/Q140276251"] },
    "isPartOf": { "@type": "WebSite", "name": "turva.dev", "url": "https://turva.dev/" },
    "about": "agent-readiness"
  };
  if (isBlogPost && m.date) {
    article.datePublished = m.date;
    // A post whose own body says "Corrected 2026-08-02" has been modified, and this field
    // told every reader it had not. The modification date owns one place, META_BY_PATH,
    // beside the publication date; verify.mjs derives it from the twin and fails on drift.
    article.dateModified = m.modified || m.date;
  }
  if (isGuide || isBlogPost) {
    article.mainEntityOfPage = { "@type": "WebPage", "@id": url };
  }
  if (isBlogHub) {
    const posts = Object.keys(PAGE_MARKDOWN).filter((k) => k.startsWith("/blog/")).map((k) => {
      const pm = META_BY_PATH[k] || {};
      const pmH1 = (PAGE_MARKDOWN[k] || "").match(/^# (.+)$/m);
      const item = { "@type": "BlogPosting", "headline": pmH1 ? pmH1[1].trim() : (pm.title || "").replace(/ [|\u00B7] turva\.dev$/, ""), "url": "https://turva.dev" + k };
      if (pm.date) { item.datePublished = pm.date; item.dateModified = pm.modified || pm.date; }
      return item;
    });
    if (posts.length) article.blogPost = posts;
  }
  const json = JSON.stringify(article).replace(/<\/script/gi, "<\\/script");
  let breadcrumb = "";
  if (isBlogPost || pathname.startsWith("/guides/")) {
    const section = isBlogPost ? { name: "Blog", url: "https://turva.dev/blog" } : { name: "Guides", url: "https://turva.dev/guides" };
    const bc = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://turva.dev/" },
        { "@type": "ListItem", "position": 2, "name": section.name, "item": section.url },
        { "@type": "ListItem", "position": 3, "name": headline, "item": url }
      ]
    };
    breadcrumb = "\n<script type=\"application/ld+json\">\n" + JSON.stringify(bc).replace(/<\/script/gi, "<\\/script") + "\n<\/script>";
  }
  return `<script type="application/ld+json">
${json}
<\/script>` + breadcrumb;
}

function buildGuidesFaqJsonLd() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "inLanguage": "en",
    "mainEntity": mdFaqBlocks("/guides", "Frequently asked").pairs.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  };
  const json = JSON.stringify(faq).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json">
${json}
<\/script>`;
}

// Every page that serves a FAQPage reads it from that page's own markdown twin, so a
// crawler and a reader are handed the same words. Eighteen guides and the buyer guide
// held their pairs here as literals until v3.92.0 and rendered none of them (B1-03).
// tools/verify.mjs compares this map, plus the card pages that build their FAQ by name
// (the homepage and /guides do not go through here), against the twins that carry a
// Frequently asked section. A page in the twins and in neither list fails the run.
var GUIDE_PAGE_FAQ = {
  "/blog/agent-readiness-identity-vendors": mdFaqBlocks("/blog/agent-readiness-identity-vendors", "Frequently asked").pairs,
  "/blog/two-auth-md-dialects": mdFaqBlocks("/blog/two-auth-md-dialects", "Frequently asked").pairs,
  "/blog/thirty-days-after-the-brief": mdFaqBlocks("/blog/thirty-days-after-the-brief", "Frequently asked").pairs,
  "/blog/what-ai-assistants-call-an-agent-readiness-audit": mdFaqBlocks("/blog/what-ai-assistants-call-an-agent-readiness-audit", "Frequently asked").pairs,
  "/blog/website-agent-readiness-567-sites": mdFaqBlocks("/blog/website-agent-readiness-567-sites", "Frequently asked").pairs,
  "/services": mdFaqBlocks("/services", "Frequently asked").pairs,
  "/shopify-agent-storefront-check": mdFaqBlocks("/shopify-agent-storefront-check", "Frequently asked").pairs,
  "/llms-txt-validator": mdFaqBlocks("/llms-txt-validator", "Frequently asked").pairs,
  "/guides/agentic-resource-discovery": mdFaqBlocks("/guides/agentic-resource-discovery", "Frequently asked").pairs,
  "/blog/agent-readiness-code-hosts": mdFaqBlocks("/blog/agent-readiness-code-hosts", "Frequently asked").pairs,
  "/blog/cheating-to-keep-the-old-price": mdFaqBlocks("/blog/cheating-to-keep-the-old-price", "Frequently asked").pairs,
  "/blog/i-thought-it-was-a-small-job": mdFaqBlocks("/blog/i-thought-it-was-a-small-job", "Frequently asked").pairs,
  "/guides/ai-agent-use-cases": mdFaqBlocks("/guides/ai-agent-use-cases", "Frequently asked").pairs,
  "/guides/letting-agents-act-on-data": mdFaqBlocks("/guides/letting-agents-act-on-data", "Frequently asked").pairs,
  "/guides/agent-readiness-aeo-geo": mdFaqBlocks("/guides/agent-readiness-aeo-geo", "Frequently asked").pairs,
  "/guides/agentic-commerce-readiness": mdFaqBlocks("/guides/agentic-commerce-readiness", "Frequently asked").pairs,
  "/guides/open-knowledge-format": mdFaqBlocks("/guides/open-knowledge-format", "Frequently asked").pairs,
  "/blog/reliable-agent-decisions": mdFaqBlocks("/blog/reliable-agent-decisions", "Frequently asked").pairs,
  "/blog/agent-secret-hygiene": mdFaqBlocks("/blog/agent-secret-hygiene", "Frequently asked").pairs,
  "/blog/verifiable-agent-identity": mdFaqBlocks("/blog/verifiable-agent-identity", "Frequently asked").pairs,
  "/blog/cheaper-pages-for-agents": mdFaqBlocks("/blog/cheaper-pages-for-agents", "Frequently asked").pairs,
  "/guides/agent-commerce-discovery": mdFaqBlocks("/guides/agent-commerce-discovery", "Frequently asked").pairs,
  "/guides/agent-readiness-audit": mdFaqBlocks("/guides/agent-readiness-audit", "Frequently asked").pairs,
  "/guides/llms-txt": mdFaqBlocks("/guides/llms-txt", "Frequently asked").pairs,
  "/guides/mcp-server-card": mdFaqBlocks("/guides/mcp-server-card", "Frequently asked").pairs,
  "/guides/agents-json": mdFaqBlocks("/guides/agents-json", "Frequently asked").pairs,
  "/guides/x402-agent-payments": mdFaqBlocks("/guides/x402-agent-payments", "Frequently asked").pairs,
  "/guides/response-headers-for-agents": mdFaqBlocks("/guides/response-headers-for-agents", "Frequently asked").pairs,
  "/guides/seo-vs-agent-readiness": mdFaqBlocks("/guides/seo-vs-agent-readiness", "Frequently asked").pairs,
  "/guides/json-ld-structured-data": mdFaqBlocks("/guides/json-ld-structured-data", "Frequently asked").pairs,
  "/guides/well-known-for-agents": mdFaqBlocks("/guides/well-known-for-agents", "Frequently asked").pairs,
  "/guides/agent-authentication": mdFaqBlocks("/guides/agent-authentication", "Frequently asked").pairs,
  "/guides/measurement-led-agent-readiness": mdFaqBlocks("/guides/measurement-led-agent-readiness", "Frequently asked").pairs,
  "/guides/prerendering-for-agents": mdFaqBlocks("/guides/prerendering-for-agents", "Frequently asked").pairs,
  "/guides/sitemaps-and-robots-for-agents": mdFaqBlocks("/guides/sitemaps-and-robots-for-agents", "Frequently asked").pairs,
  "/guides/markdown-for-agents": mdFaqBlocks("/guides/markdown-for-agents", "Frequently asked").pairs,
  "/guides/agent-readiness-gaps": mdFaqBlocks("/guides/agent-readiness-gaps", "Frequently asked").pairs,
  "/guides/get-cited-by-ai-assistants": mdFaqBlocks("/guides/get-cited-by-ai-assistants", "Frequently asked").pairs,
  "/guides/choosing-an-agent-readiness-audit": mdFaqBlocks("/guides/choosing-an-agent-readiness-audit", "Frequently asked").pairs,
};

function buildGuidePageFaqJsonLd(pathname, canonicalUrl) {
  const items = GUIDE_PAGE_FAQ[pathname];
  if (!items || !items.length) return "";
  const url = canonicalUrl || "https://turva.dev" + pathname;
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": url + "#faq",
    "inLanguage": "en",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  };
  const json = JSON.stringify(faq).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json">\n${json}\n<\/script>`;
}

function buildShopifyServiceJsonLd(canonicalUrl) {
  const url = canonicalUrl || "https://turva.dev/shopify-agent-storefront-check";
  const svc = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": url + "#service",
    "name": "Shopify agent storefront check",
    "serviceType": "Agent commerce readiness check",
    "provider": { "@id": "https://turva.dev/#business" },
    "areaServed": { "@type": "Place", "name": "Worldwide" },
    "description": "A fixed-scope check of what an AI shopper receives from one live Shopify store, across browser WebMCP, Shopify-hosted Storefront and UCP MCP, and Shopify Agentic channels. Four written deliverables as one package within 48 hours of the agreed written kickoff, and a fifth, the retest of up to two corrected items, within 14 days.",
    "availableChannel": { "@type": "ServiceChannel", "serviceUrl": url, "availableLanguage": ["en", "fi"] },
    "offers": {
      "@type": "Offer",
      "url": url,
      "price": "999",
      "priceCurrency": "EUR",
      "priceValidUntil": PRICE_VALID_UNTIL,
      "availability": "https://schema.org/InStock",
      "businessFunction": "https://schema.org/Sell",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "999",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": false,
        "description": "\u20ac999 fixed price, four written deliverables within 48 hours of the agreed written kickoff and a retest within 14 days. VAT (25,5%) added per Finnish law."
      }
    }
  };
  const json = JSON.stringify(svc).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json">\n${json}\n<\/script>`;
}

function buildValidatorAppJsonLd(canonicalUrl) {
  const url = canonicalUrl || "https://turva.dev/llms-txt-validator";
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": url + "#app",
    "name": "Free llms.txt validator",
    "url": url,
    "description": "Free llms.txt validator. Fetches a site's /llms.txt and checks the structure: H1 title, blockquote summary, H2 link sections. JSON output for agents.",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "publisher": { "@id": "https://turva.dev/#business" }
  };
  const json2 = JSON.stringify(app).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json">\n${json2}\n<\/script>`;
}

var FOOTER_CSS = `main table{border-collapse:collapse;margin:1.1rem 0;width:100%;font-size:.93rem}main th,main td{border:0.5px solid rgba(255,255,255,0.14);padding:.5rem .65rem;text-align:left;vertical-align:top;color:#C9D1CE}main th{color:#5DF18F;font-weight:600}pre{background:#07110D;border:1px solid #1E3328;border-radius:8px;padding:14px 16px;overflow-x:auto;font-size:13px;line-height:1.5;color:#CFE3D6;font-family:ui-monospace,"Cascadia Mono",Menlo,Consolas,monospace}pre code{font-family:inherit}.aview-cmd{font-family:ui-monospace,"Cascadia Mono",Menlo,Consolas,monospace;font-size:13px;color:#5DF18F;margin:0 0 10px;overflow-x:auto;white-space:nowrap}.vform{display:flex;gap:10px;margin:6px 0}.vform input{flex:1;min-width:0;background:#07110D;border:1px solid #1E3328;border-radius:8px;padding:10px 12px;color:#F2F5F3;font-family:ui-monospace,"Cascadia Mono",Menlo,Consolas,monospace;font-size:14px}.vform button{background:#5DF18F;color:#06100F;border:0;border-radius:8px;padding:10px 18px;font-weight:700;cursor:pointer;font-size:14px}.chk{display:flex;gap:10px;margin:8px 0;align-items:baseline;flex-wrap:wrap}.chk .s{font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:700}.chk.pass .s{color:#5DF18F}.chk.warn .s{color:#E8C15A}.chk.fail .s{color:#F17F5D}.chk.info .s{color:#7FB2D9}.chk .d{color:#96A79C;font-size:14px}.verr{color:#F17F5D}
.tv-foot{box-sizing:border-box;width:100%;background:#06100F;border-top:1px solid rgba(255,255,255,0.1);padding:1.9rem clamp(20px,5vw,72px);display:flex;flex-direction:column;gap:1rem;}
.tv-foot .foot-brand{display:flex;align-items:center;gap:9px;}
.tv-foot .foot-brand svg{display:block;width:22px;height:22px;}
.tv-foot .foot-links{display:flex;flex-wrap:wrap;gap:0.6rem 1rem;}
.tv-foot .ft-row{display:flex;align-items:center;gap:9px;color:#C9D1CE;font-size:0.9rem;text-decoration:none;}
.tv-foot a.ft-row:hover{color:#5DF18F;}
.tv-foot .ft-row svg{flex:0 0 auto;width:17px;height:17px;}
.tv-foot .foot-meta{font-size:0.8rem;color:#9AA3A0;border-top:0.5px solid rgba(255,255,255,0.08);padding-top:0.9rem;}
.tv-foot .foot-meta a{color:inherit;text-decoration:underline;text-underline-offset:2px;}
.tv-foot .foot-meta a:hover{color:#5DF18F;}
.turva-nav,.tv-foot{padding-left:max(clamp(20px,5vw,72px),calc(50% - var(--col-half,23rem)));padding-right:max(clamp(20px,5vw,72px),calc(50% - var(--col-half,23rem)));}
a:focus-visible,button:focus-visible{outline:2px solid #5DF18F;outline-offset:2px;border-radius:2px;}
@media (prefers-reduced-motion:reduce){.cursor{animation:none;opacity:1;}}
::selection{background:#5DF18F;color:#06100F;}
h1,h2{text-wrap:balance;}
p,li{text-wrap:pretty;}
.skip{position:absolute;left:-999px;top:-999px;overflow:hidden;}
.skip:focus{position:fixed;left:14px;top:12px;z-index:20;background:#5DF18F;color:#06100F;font-weight:700;padding:.55rem .95rem;border-radius:8px;text-decoration:none;}
@media print{*{background:#fff!important;color:#000!important;}a{text-decoration:underline;}.turva-nav,.tv-foot,.skip,.crumb,.cursor{display:none!important;}}`;

// The card shell and the FAQ rows, one home each. The three .faq copies this
// replaces were byte-identical and nothing compared them, and guide pages would
// have made a fourth: the same shape B1-15 found in the nav menu. /services keeps
// its own four .scard rules on purpose, they are a smaller set and not a copy.
var SCARD_CSS = `.scard{border:0.5px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.02);padding:1.4rem 1.5rem 1.2rem;margin:0 0 1rem;transition:border-color .15s ease;}
.scard:hover{border-color:rgba(93,241,143,0.35);}
.scard h2{color:#5DF18F;font-size:1.2rem;font-weight:700;letter-spacing:-0.01em;margin:0 0 .85rem;}
.scard p{color:#C9D1CE;margin:0 0 .85rem;font-size:.97rem;}
.scard p:last-child{margin-bottom:0;}
.scard ul{list-style:none;margin:0;padding:0;}
.scard li{position:relative;padding:0 0 0 1.5rem;margin:0 0 .5rem;color:#C9D1CE;font-size:.95rem;line-height:1.5;}
.scard li::before{content:"›";position:absolute;left:.3rem;top:0;color:#5DF18F;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
.scard li a{color:#5DF18F;text-decoration:none;}
.scard li a:hover,.scard li a:focus-visible{color:#F2F4F3;text-decoration:underline;}
.scard li:last-child{margin-bottom:0;}
.scard .note{margin-top:.85rem;}
.scard pre+p,.scard ul+p,.scard .dl+p{margin-top:.85rem;}`;
var FAQ_CSS = `.faq .q{color:#F2F4F3;font-weight:700;font-size:1rem;margin:1.15rem 0 .4rem;}
.faq .q:first-child{margin-top:0;}
.faq p{color:#C9D1CE;margin:0 0 .2rem;font-size:.95rem;}`;

// A function, not a constant: on Workers the clock in global scope reads the epoch, so a
// year computed while the module loads served "1970" live (2026-09-02). Read the clock per
// request, where it is real.
function footerHtml(kieli) { const fi = kieli === "fi"; return `<footer class="tv-foot">
  <div class="foot-brand">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="16" cy="16" r="13" stroke="#5DF18F" stroke-width="2.4"></circle><path d="M10.5 16.4l3.6 3.6 7.2-7.6" stroke="#5DF18F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    <span class="nv-word">turva<b>·</b>dev</span>
  </div>
  <div class="foot-links">
    <a class="ft-row" href="mailto:info@turva.dev"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg><span>info@turva.dev</span></a>
    <a class="ft-row" href="https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/></svg><span>Signal @turva.19</span></a>
    <a class="ft-row" href="https://www.linkedin.com/in/erikrekola/"><svg viewBox="0 0 24 24" fill="#5DF18F" aria-hidden="true"><path d="M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.4 8.9h3.1V21H3.4zM9.2 8.9h2.97v1.65h.04c.41-.78 1.42-1.6 2.93-1.6 3.13 0 3.71 2.06 3.71 4.74V21h-3.1v-5.35c0-1.28-.02-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.83V21H9.2z"/></svg><span>LinkedIn</span></a>
    <a class="ft-row" rel="me" href="https://social.turva.dev/@erik"><svg viewBox="0 0 24 24" fill="#5DF18F" aria-hidden="true"><path d="M21.327 8.566c0-4.339-2.843-5.61-2.843-5.61-1.433-.658-3.894-.935-6.451-.956h-.063c-2.557.021-5.016.298-6.45.956 0 0-2.843 1.272-2.843 5.61 0 .993-.019 2.181.012 3.441.103 4.243.778 8.425 4.701 9.463 1.809.479 3.362.579 4.612.51 2.268-.126 3.541-.809 3.541-.809l-.075-1.646s-1.621.511-3.441.449c-1.804-.062-3.707-.194-3.999-2.409a4.523 4.523 0 0 1-.04-.621s1.77.433 4.014.536c1.372.063 2.658-.08 3.965-.236 2.506-.299 4.688-1.843 4.962-3.254.434-2.223.398-5.424.398-5.424zm-3.353 5.59h-2.081V9.057c0-1.075-.452-1.62-1.357-1.62-1 0-1.501.647-1.501 1.927v2.791h-2.069V9.364c0-1.28-.501-1.927-1.502-1.927-.905 0-1.357.546-1.357 1.62v5.099H5.626V8.903c0-1.074.273-1.927.823-2.558.566-.631 1.307-.955 2.228-.955 1.065 0 1.872.41 2.405 1.228l.518.869.519-.869c.533-.818 1.34-1.228 2.405-1.228.92 0 1.662.324 2.228.955.549.631.822 1.484.822 2.558v5.253z"/></svg><span>Mastodon</span></a>
    <a class="ft-row" rel="me" href="https://gravatar.com/erekola"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18.5c1-2.4 3-3.8 5.5-3.8s4.5 1.4 5.5 3.8"/></svg><span>Gravatar</span></a>
    <a class="ft-row" href="https://github.com/erekola"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg><span>GitHub</span></a>
  </div>
  <div class="foot-meta">${fi ? "Tampere, Suomi" : "Tampere, Finland"} · <a href="https://tietopalvelu.ytj.fi/yritys/3600281-7">${fi ? "Y-tunnus" : "Business ID"} 3600281-7</a> · © ${new Date().getUTCFullYear()} turva.dev</div>
</footer>`; }

function serveGuideHtml(pathname, canonicalUrl) {
  const md = mdTwin(pathname);
  const metaBlock = buildMetaBlock(pathname, canonicalUrl);
  const jsonLd = buildGuideJsonLd(pathname, canonicalUrl) +
    (GUIDE_PAGE_FAQ[pathname] ? "\n" + buildGuidePageFaqJsonLd(pathname, canonicalUrl) : "");
  // The Frequently asked section renders as a card and the rest of the article renders
  // around it, so a question appears once rather than twice. Before v3.92.0 no guide twin
  // carried the section at all and this function served a FAQPage nothing on the page said.
  const faqHead = "\n## Frequently asked\n";
  const faqAt = md.indexOf(faqHead);
  const faqEnd = faqAt === -1 ? -1 : md.indexOf("\n## ", faqAt + faqHead.length);
  const article = faqAt === -1 ? markdownToHtml(md) : [
    markdownToHtml(md.slice(0, faqAt)),
    mdFaqCard(pathname, "Frequently asked"),
    mdFaqTailHtml(pathname, "Frequently asked"),
    faqEnd === -1 ? "" : markdownToHtml(md.slice(faqEnd))
  ].filter(Boolean).join("\n");
  const navSection = pathname.startsWith("/blog/") ? "/blog" : (pathname.startsWith("/guides/") ? "/guides" : "");
  const crumb = navSection === "/blog" ? '<p class="crumb"><a href="/blog">&#8249; all posts</a></p>\n' : (navSection === "/guides" ? '<p class="crumb"><a href="/guides">&#8249; all guides</a></p>\n' : "");
  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#0A1316" />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'><circle cx='16' cy='16' r='13' stroke='%235DF18F' stroke-width='2.4'/><path d='M10.5 16.4l3.6 3.6 7.2-7.6' stroke='%235DF18F' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/></svg>" />
<link rel="icon" type="image/png" sizes="512x512" href="https://turva.dev/logo.png" />
<link rel="apple-touch-icon" href="https://turva.dev/logo.png" />
<link rel="alternate" type="application/rss+xml" title="turva.dev blog" href="https://turva.dev/blog/feed.xml" />
${metaBlock}
${jsonLd}
${WEBMCP_SCRIPT}
<link rel="canonical" href="${canonicalUrl}" />
<link rel="ard" href="https://turva.dev/.well-known/ard.json" type="application/json" />
<link rel="alternate" href="${markdownUrlFor(canonicalUrl)}" type="text/markdown" />
<style>
html,body{background-color:#0A1316;overflow-wrap:break-word;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased;color-scheme:dark;}
body{--col-half:22rem;}
main{max-width:44rem;margin:0 auto;padding:2.4rem clamp(20px,5vw,72px) 3rem;}
article h1{color:#5DF18F;overflow-wrap:break-word;hyphens:auto;font-size:2.2rem;line-height:1.12;letter-spacing:-0.02em;margin:0 0 1rem;font-weight:700;}
article h1 + p{font-size:1.12rem;color:#F2F4F3;}
article h2{color:#5DF18F;font-size:1.4rem;font-weight:700;letter-spacing:-0.015em;margin:2.1rem 0 0.85rem;padding-top:1.6rem;border-top:0.5px solid rgba(255,255,255,0.08);}
article p{margin:0 0 1.05rem;color:#C9D1CE;}
article a{color:#5DF18F;text-decoration:none;}
article a:hover{text-decoration:underline;}
article ul{list-style:none;margin:0 0 1.1rem;padding:0;}
article li{position:relative;padding:0 0 0 1.45rem;margin:0 0 0.5rem;color:#C9D1CE;}
article li::before{content:"›";position:absolute;left:0.45rem;top:0;color:#5DF18F;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
article strong{color:#F2F4F3;}
article p.date{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.05em;color:#9AA3A0;margin:-.35rem 0 1.5rem;}
.crumb{margin:0 0 1.05rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;}
.crumb a{color:#9AA3A0;}
.crumb a:hover{color:#5DF18F;text-decoration:none;}
.turva-nav{box-sizing:border-box;width:100%;background:#0A1316;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px clamp(20px,5vw,72px);border-bottom:0.5px solid rgba(255,255,255,0.08);}
.turva-nav *,.turva-nav *::before,.turva-nav *::after{box-sizing:border-box;}
.turva-nav .nv-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.turva-nav .nv-brand svg{display:block;width:26px;height:26px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
.turva-nav .nv-menu{display:flex;flex-wrap:wrap;min-width:0;align-items:center;gap:clamp(14px,2vw,30px);list-style:none;margin:0;padding:0;flex:1;}
.turva-nav .nv-menu a{font-size:15px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
.turva-nav .nv-menu a[aria-current]{color:#F2F4F3;}
@media (max-width:640px){.turva-nav .nv-menu{gap:14px;}.turva-nav .nv-menu a{font-size:14px;}}
${faqAt === -1 ? "" : SCARD_CSS + "\n" + FAQ_CSS + "\n"}${FOOTER_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<nav class="turva-nav" aria-label="Main">
  <a class="nv-brand" href="/">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="#5DF18F" stroke-width="2.4"></circle>
      <path d="M10.5 16.4l3.6 3.6 7.2-7.6" stroke="#5DF18F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <span class="nv-word">turva<b>·</b>dev</span>
  </a>
  <ul class="nv-menu">
    <li><a href="/">home</a></li>
    <li><a href="/services">services</a></li>
    <li><a href="/guides"${navSection === "/guides" ? ' aria-current="true"' : ""}>guides</a></li>
    <li><a href="/blog"${navSection === "/blog" ? ' aria-current="true"' : ""}>blog</a></li>
    <li><a href="/tools">tools</a></li>
    <li><a href="/company">company</a></li>
    <li><a href="/legal">legal</a></li>
    <li><a href="/contact">contact</a></li>
  </ul>
</nav>
<main id="main">
${crumb}<article>
${article}
</article>
</main>
${footerHtml()}
</body>
</html>`;
  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "public, max-age=3600",
    "vary": "Accept",
    "content-language": "en"
  });
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "html");
  headers.append("Link", `<${markdownUrlFor(canonicalUrl)}>; rel="alternate"; type="text/markdown"`);
  return new Response(body, { status: 200, headers });
}

var HOME_MARKDOWN = (function () {
  const cut = PAGE_MARKDOWN["/"].indexOf("\n## More");
  return cut === -1 ? PAGE_MARKDOWN["/"] : PAGE_MARKDOWN["/"].slice(0, cut);
})();

function serveHomeHtml(canonicalUrl) {
  const metaBlock = buildMetaBlock("/", canonicalUrl);
  const lead = mdLead("/");
  const apply = mdParas("/", "Where this applies", 2);
  const exCells = mdLists("/", "Where this applies")[0].map((x) => `<div class="ex">${x}</div>`).join("\n      ");
  const ev = mdParas("/", "Evidence", 7).map(mdTidyUrlText);
  const evMeasured = (ev[0].match(/Measured (\d{4}-\d{2}-\d{2})/) || [])[1] || "";
  const hpMeasured = evMeasured ? `<span class="hp-seg">&middot; measured ${evMeasured}</span>` : "";
  const evLists = mdLists("/", "Evidence").map((l) => l.map((x) => `<li>${mdTidyUrlText(x)}</li>`).join("\n      "));
  const proc = mdParas("/", "The process has three stages and no surprises", 6);
  const stepBody = (t) => t.slice(t.indexOf(". ") + 2);
  const svcCards = mdLists("/", "Services")[0].map((it) => {
    const svcName = it.split(". ")[0];
    // Fail closed: every service line must carry one of the four pricing phrases. A
    // phrase that drifts in the twin used to fall silently into "on request" (round 13
    // R1f-3); now the home page render, which routes.test.mjs exercises, throws instead.
    const tag = it.includes("Fixed scope") ? "fixed scope" : it.includes("Monthly retainer") ? "monthly" : it.includes("per day") ? "per day" : it.includes("On request") ? "on request" : null;
    if (!tag) throw new Error("home Services line carries no pricing phrase: " + svcName);
    return `<div class="svc"><div class="svc-h"><span class="svc-t">${svcName}</span><span class="svc-tag">${tag}</span></div><p>${it.slice(svcName.length + 2)}</p></div>`;
  }).join("\n      ");
  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#0A1316" />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'><circle cx='16' cy='16' r='13' stroke='%235DF18F' stroke-width='2.4'/><path d='M10.5 16.4l3.6 3.6 7.2-7.6' stroke='%235DF18F' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/></svg>" />
<link rel="icon" type="image/png" sizes="512x512" href="https://turva.dev/logo.png" />
<link rel="apple-touch-icon" href="https://turva.dev/logo.png" />
<link rel="alternate" type="application/rss+xml" title="turva.dev blog" href="https://turva.dev/blog/feed.xml" />
${metaBlock}
${SCHEMA_HOME}
${WEBMCP_SCRIPT}
<link rel="canonical" href="${canonicalUrl}" />
<link rel="ard" href="https://turva.dev/.well-known/ard.json" type="application/json" />
<link rel="alternate" href="${markdownUrlFor(canonicalUrl)}" type="text/markdown" />
<style>
html,body{background-color:#0A1316;overflow-wrap:break-word;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased;color-scheme:dark;}
main{max-width:46rem;margin:0 auto;padding:0 clamp(20px,5vw,72px) 3rem;}
h1{color:#5DF18F;overflow-wrap:break-word;hyphens:auto;font-size:2.4rem;line-height:1.1;letter-spacing:-0.02em;margin:0 0 1.1rem;font-weight:700;}
h2{color:#F2F4F3;font-size:1.45rem;margin:0 0 0.85rem;font-weight:700;letter-spacing:-0.015em;}
p{margin:0 0 1.05rem;color:#C9D1CE;}
a{color:#5DF18F;text-decoration:none;}
a:hover{text-decoration:underline;}
strong{color:#F2F4F3;}
.turva-nav{box-sizing:border-box;width:100%;background:#0A1316;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px clamp(20px,5vw,72px);border-bottom:0.5px solid rgba(255,255,255,0.08);}
.turva-nav *,.turva-nav *::before,.turva-nav *::after{box-sizing:border-box;}
.turva-nav .nv-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.turva-nav .nv-brand svg{display:block;width:26px;height:26px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
.turva-nav .nv-menu{display:flex;flex-wrap:wrap;min-width:0;align-items:center;gap:clamp(14px,2vw,30px);list-style:none;margin:0;padding:0;flex:1;}
.turva-nav .nv-menu a{font-size:15px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
.turva-nav .nv-menu a[aria-current]{color:#F2F4F3;}
.hero{padding:2.8rem 0 2rem;}
.eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.75rem;letter-spacing:.09em;text-transform:uppercase;color:#5DF18F;margin:0 0 1.1rem;}
.lede{font-size:1.16rem;line-height:1.55;color:#C9D1CE;margin:0;max-width:40rem;}
.hero-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(258px,1fr);gap:1.6rem;align-items:center;margin:1.7rem 0 0;}
.hero-proof{max-width:100%;overflow-wrap:anywhere;display:flex;flex-direction:column;align-items:flex-start;gap:3px;margin:0 0 1.3rem;border:1px solid rgba(93,241,143,0.28);border-radius:14px;padding:13px 20px;background:rgba(93,241,143,0.04);color:#C9D1CE;font:400 14px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;}
.hero-proof .hp-claim{display:flex;flex-wrap:wrap;gap:0 8px;align-items:baseline;}
.hero-proof .hp-src{display:flex;flex-wrap:wrap;gap:0 8px;font-size:12.5px;color:#9AA3A0;}
.hero-proof .hp-score{color:#5DF18F;font-weight:600;}
.hero-proof .hp-seg{white-space:normal;overflow-wrap:anywhere;}
.cta{display:flex;flex-wrap:wrap;gap:.7rem;margin:0;}
.btn{display:inline-block;max-width:100%;overflow-wrap:break-word;background:#5DF18F;color:#06100F;font-weight:700;border-radius:8px;padding:.65rem 1.15rem;font-size:.92rem;transition:background-color .15s ease;}
.btn:hover{background:#7df7a6;text-decoration:none;}
.btn-ghost{display:inline-block;max-width:100%;overflow-wrap:break-word;color:#F2F4F3;font-weight:600;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:.65rem 1.15rem;font-size:.92rem;transition:border-color .15s ease,color .15s ease;}
.btn-ghost:hover{border-color:#5DF18F;color:#5DF18F;text-decoration:none;}
.terminal{min-width:0;max-width:100%;border:1px solid rgba(255,255,255,0.14);border-radius:12px;overflow:hidden;background:#06100F;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.84rem;}
.tm-bar{display:flex;min-width:0;align-items:center;gap:.5rem;padding:.55rem .8rem;background:rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.08);}
.tm-dot{width:10px;height:10px;border-radius:50%;display:inline-block;}
.tm-dot.r{background:#ff5f56;}.tm-dot.y{background:#ffbd2e;}.tm-dot.g{background:#27c93f;}
.tm-title{min-width:0;flex:1 1 auto;margin-left:.45rem;color:#9AA3A0;font-size:.76rem;overflow-wrap:anywhere;}
.tm-body{padding:.9rem .85rem 1.05rem;line-height:1.75;min-width:0;overflow-wrap:anywhere;}
.tm-cmd{color:#F2F4F3;word-break:break-word;}
.tm-cmd .pr{color:#5DF18F;margin-right:.5rem;}
.tm-out{color:#9AA3A0;overflow-wrap:anywhere;}
.tm-out b{color:#5DF18F;font-weight:600;}
.cursor{display:inline-block;width:.5rem;height:1rem;vertical-align:-0.16rem;background:#5DF18F;margin-left:.2rem;animation:tvb 1.1s steps(1) infinite;}
@keyframes tvb{50%{opacity:0;}}
.board{margin:0 0 1rem;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.02);padding:1.15rem 1.15rem 1.25rem;}
.board-top{display:flex;flex-wrap:wrap;gap:.4rem;align-items:baseline;justify-content:space-between;margin:0 0 .9rem;}
.board-head{font-size:.92rem;color:#F2F4F3;font-weight:600;}
.board-src{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.74rem;color:#9AA3A0;text-decoration:none;}
.board-src:hover{color:#5DF18F;}
.board-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem;margin:0 0 1rem;}
.cell{background:rgba(93,241,143,0.06);border:1px solid rgba(93,241,143,0.18);border-radius:9px;padding:.6rem .65rem;transition:border-color .15s ease,transform .15s ease;}
.cell:hover{border-color:rgba(93,241,143,0.45);transform:translateY(-1px);}
.cell .cat{display:block;font-size:.7rem;letter-spacing:.04em;text-transform:uppercase;color:#9AA3A0;margin:0 0 .25rem;}
.cell .val{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.02rem;color:#5DF18F;font-weight:700;}
.board-sum{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.82rem;color:#C9D1CE;border-top:1px solid rgba(255,255,255,0.1);padding-top:.85rem;}.whynot{margin:.85rem 0 0;font-size:.85rem;line-height:1.55;color:#96A79C;border-left:2px solid #5DF18F;padding:.1rem 0 .1rem .8rem;}.whynot b,.whynot strong{color:#F2F5F3;}.bizline{max-width:100%;overflow-wrap:anywhere;margin:.7rem 0 0;font-size:.78rem;color:#9AA3A0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
.board-sum b{color:#5DF18F;}
.pill{background:#5DF18F;color:#06100F;font-weight:700;border-radius:6px;padding:.1rem .5rem;}
.sec{padding:1.9rem 0;border-top:0.5px solid rgba(255,255,255,0.07);}
${FAQ_CSS}
.exgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:.6rem;margin:0 0 1.1rem;}
.ex{position:relative;background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:.7rem .8rem .7rem 1.7rem;font-size:.9rem;color:#C9D1CE;transition:border-color .15s ease,transform .15s ease;}
.ex:hover{border-color:rgba(93,241,143,0.38);transform:translateY(-1px);}
.ex::before{content:"›";position:absolute;left:.75rem;top:.62rem;color:#5DF18F;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;}
.evlist{margin:0 0 1.05rem;padding:0 0 0 1.2rem;color:#C9D1CE;}
.evlist li{margin:0 0 .5rem;font-size:.92rem;}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:.7rem;margin:.2rem 0 1.3rem;}
.step{background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.12);border-radius:12px;padding:1rem;transition:border-color .15s ease,transform .15s ease;}
.step:hover{border-color:rgba(93,241,143,0.38);transform:translateY(-1px);}
.step-n{display:block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.85rem;color:#5DF18F;font-weight:700;margin:0 0 .3rem;}
.step-t{display:block;font-size:1rem;font-weight:700;color:#F2F4F3;margin:0 0 .45rem;}
.step p{font-size:.86rem;margin:0;color:#9AA3A0;line-height:1.55;}
.notes{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.7rem;}
.notes li{position:relative;padding:0 0 0 1.6rem;font-size:.92rem;color:#C9D1CE;line-height:1.6;}
.notes li::before{content:"✓";position:absolute;left:0;top:0;color:#5DF18F;font-weight:700;}
.svcgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:.7rem;margin:.2rem 0 0;}
.svc{background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.12);border-radius:12px;padding:1.05rem 1.05rem 1.1rem;transition:border-color .15s ease,transform .15s ease;}
.svc:hover{border-color:rgba(93,241,143,0.4);transform:translateY(-1px);}
.svc-tag{flex:0 0 auto;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.68rem;letter-spacing:.03em;color:#5DF18F;background:rgba(93,241,143,0.08);border:1px solid rgba(93,241,143,0.22);border-radius:999px;padding:.12rem .55rem;}
.svc-h{display:flex;align-items:baseline;justify-content:space-between;gap:.6rem;margin:0 0 .45rem;}
.svc-t{display:block;font-size:1.05rem;font-weight:700;color:#5DF18F;margin:0;min-width:0;}
.svc p{font-size:.86rem;margin:0;color:#9AA3A0;line-height:1.55;}
.contact{border-top:1px solid rgba(93,241,143,0.2);}
.contact-card{border:1px solid rgba(255,255,255,0.14);border-radius:14px;background:rgba(93,241,143,0.04);padding:1.2rem 1.2rem 1rem;margin:.4rem 0 0;}
.contact-card .ch{display:flex;flex-wrap:wrap;min-width:0;align-items:center;gap:.6rem;margin:0 0 .6rem;font-size:1rem;color:#F2F4F3;text-decoration:none;}
.contact-card a.ch:hover{color:#5DF18F;text-decoration:none;}
.contact-card .ch:last-child{margin-bottom:0;}
.contact-card .ch svg{flex:0 0 auto;width:18px;height:18px;}
.contact-card .ch > span{min-width:0;overflow-wrap:anywhere;}
.cta-row{margin:1.25rem 0 0;}
.cta-btn{display:inline-block;background:#5DF18F;color:#06100F;font-weight:700;border-radius:8px;padding:.7rem 1.2rem;font-size:.95rem;transition:background-color .15s ease;}
.cta-btn:hover{background:#7df7a6;text-decoration:none;}
@media (max-width:640px){.board-grid{grid-template-columns:repeat(2,minmax(0,1fr));}.hero-row{grid-template-columns:minmax(0,1fr);}.turva-nav .nv-menu{gap:14px;}.turva-nav .nv-menu a{font-size:14px;}.tm-body{padding:12px 10px 14px;}.tm-bar{padding:9px 12px;}.hero-proof{padding:12px 12px;}}
${FOOTER_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<nav class="turva-nav" aria-label="Main">
  <a class="nv-brand" href="/">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="#5DF18F" stroke-width="2.4"></circle>
      <path d="M10.5 16.4l3.6 3.6 7.2-7.6" stroke="#5DF18F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <span class="nv-word">turva<b>·</b>dev</span>
  </a>
  <ul class="nv-menu">
    <li><a href="/" aria-current="page">home</a></li>
    <li><a href="/services">services</a></li>
    <li><a href="/guides">guides</a></li>
    <li><a href="/blog">blog</a></li>
    <li><a href="/tools">tools</a></li>
    <li><a href="/company">company</a></li>
    <li><a href="/legal">legal</a></li>
    <li><a href="/contact">contact</a></li>
  </ul>
</nav>
<main id="main">
  <section class="hero">
    <p class="eyebrow">where data moves and decisions matter · independently verified</p>
    <h1>${renderInline(lead.title)}</h1>
    <p class="lede">${renderInline(lead.paras[0])}</p>
    <div class="hero-row">
      <div class="hero-left">
        <div class="hero-proof">
          <span class="hp-claim">
            <span class="hp-score">100/100</span>
            <span class="hp-seg">&middot; Level 5</span>
            <span class="hp-seg">&middot; Agent-Native</span>
          </span>
          <span class="hp-src">
            <span class="hp-seg">on isitagentready.com</span>
            ${hpMeasured}
          </span>
        </div>
        <div class="cta">
          <a class="btn" href="mailto:info@turva.dev?subject=Agent-readiness%20audit&amp;body=Site%20or%20API%20URL%3A%20%0AWhat%20the%20audit%20should%20answer%3A%20%0A">Request an audit</a>
          <a class="btn-ghost" href="https://github.com/erekola/turva-worker">Read the source</a>
          <a class="btn-ghost" href="/samples/audit-report">Read a sample report</a>
        </div>
        <p class="bizline">Business ID 3600281-7 &middot; registered in Finland</p>
      </div>
      <div class="hero-right">
        <div class="terminal" role="group" aria-label="verification terminal">
          <div class="tm-bar"><span class="tm-dot r"></span><span class="tm-dot y"></span><span class="tm-dot g"></span><span class="tm-title">turva@audit · verify</span></div>
          <div class="tm-body">
            <div class="tm-cmd"><span class="pr">&#8250;</span>scan turva.dev on isitagentready.com</div>
            <div class="tm-out">&#10003; isitagentready.com &middot; <b>100/100</b> &middot; level 5 &middot; agent-native<span class="cursor"></span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="board" aria-label="agent-readiness scan result">
    <div class="board-top">
      <span class="board-head">independent agent-readiness scan of turva.dev</span>
      <a class="board-src" href="https://isitagentready.com/">scanner: isitagentready.com &middot; 3rd-party &middot; Cloudflare</a>
    </div>
    <div class="board-grid">
      <div class="cell"><span class="cat">discoverability</span><span class="val">100/100</span></div>
      <div class="cell"><span class="cat">content</span><span class="val">100/100</span></div>
      <div class="cell"><span class="cat">bot access control</span><span class="val">100/100</span></div>
      <div class="cell"><span class="cat">api, auth, mcp &amp; a2a</span><span class="val">100/100</span></div>
      <div class="cell"><span class="cat">commerce</span><span class="val">100/100</span></div>
    </div>
    <div class="board-sum"><span>verified</span> <b>100/100</b> <span class="pill">Level 5</span> <span class="pill">Agent-Native</span></div>
  </section>
  <section class="sec">
    <h2>Two fixed-scope ways to start</h2>
    ${mdBodyHtml("/", "Two fixed-scope ways to start")}
  </section>

  <section class="sec">
    <h2>Audits, advisory, and implementation for product teams</h2>
    ${mdBodyHtml("/", "Audits, advisory, and implementation for product teams")}
  </section>

  <section class="sec">
    <h2>Where this applies</h2>
    <p>${apply[0]}</p>
    <div class="exgrid">
      ${exCells}
    </div>
    <p>${apply[1]}</p>
  </section>

  <section class="sec">
    <h2>Evidence</h2>
    <p>${ev[0]}</p>
    <ul class="evlist">
      ${evLists[0]}
    </ul>
    <p>${ev[1]}</p>
    <p>${ev[2]}</p>
    <p>${ev[3]}</p>
    <ul class="evlist">
      ${evLists[1]}
    </ul>
    <p>${ev[4]}</p>
    <p>${ev[5]}</p>
    <p>${ev[6]}</p>
  </section>

  <section class="sec">
    <h2>What an agent sees on this page</h2>
    <p>Every page on this site is also served as plain markdown to any agent that asks for it, at the same URL, at a fraction of the token cost of the HTML. The block below is the opening of that markdown, generated from the same string an agent receives.</p>
    <div class="aview">
      <p class="aview-cmd">curl -H "Accept: text/markdown" https://turva.dev/</p>
      <pre><code>${escapeHtml(HOME_MARKDOWN.split("\n").slice(0, 7).join("\n") + "\n[Truncated. The full document continues in markdown.]")}</code></pre>
    </div>
    <p><a href="/guides/markdown-for-agents">How markdown content negotiation works.</a></p>
  </section>

  <section class="sec">
    <h2>The process has three stages and no surprises</h2>
    <div class="steps">
      <div class="step">
        <span class="step-n">01</span>
        <span class="step-t">Measurement</span>
        <p>${stepBody(proc[0])}</p>
      </div>
      <div class="step">
        <span class="step-n">02</span>
        <span class="step-t">A written report</span>
        <p>${stepBody(proc[1])}</p>
      </div>
      <div class="step">
        <span class="step-n">03</span>
        <span class="step-t">The fixes</span>
        <p>${stepBody(proc[2])}</p>
      </div>
    </div>
    <ul class="notes">
      <li>${proc[3]}</li>
      <li>${proc[4]}</li>
      <li>${proc[5]}</li>
    </ul>
  </section>

  <section class="sec">
    <h2>Services</h2>
    <div class="svcgrid">
      ${svcCards}
    </div>
  </section>

  <section class="sec">
    <h2>Who I am</h2>
    ${mdBodyHtml("/", "Who I am")}
  </section>

  <section class="sec contact">
    <h2>Contact me</h2>
    <p>Seeing where your site, API or product stands with AI agents starts with a measured baseline, a written report, and a prioritized list of what to fix first. For agent-readiness that baseline comes from an independent scanner. For the wider work it comes from testing the data path and the decision envelope directly. Async-only engagement. No calls and no calendar links. The first reply lands in writing within one business day.</p>
    <div class="contact-card">
      <a class="ch" href="mailto:info@turva.dev"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg><span>info@turva.dev</span></a>
      <a class="ch" href="https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/></svg><span>Signal @turva.19</span></a>
      <a class="ch" href="https://www.linkedin.com/in/erikrekola/"><svg viewBox="0 0 24 24" fill="#5DF18F" aria-hidden="true"><path d="M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.4 8.9h3.1V21H3.4zM9.2 8.9h2.97v1.65h.04c.41-.78 1.42-1.6 2.93-1.6 3.13 0 3.71 2.06 3.71 4.74V21h-3.1v-5.35c0-1.28-.02-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.83V21H9.2z"/></svg><span>LinkedIn</span></a>
    </div>
    <div class="cta-row"><a class="cta-btn" href="mailto:info@turva.dev?subject=Agent-readiness%20audit&amp;body=Site%20or%20API%20URL%3A%20%0AWhat%20the%20audit%20should%20answer%3A%20%0A">Request an audit</a></div>
  </section>

  <section class="sec">
    <h2>Frequently asked</h2>
    <div class="faq">
${mdFaqRows("/", "Frequently asked")}
    </div>
    <div class="cta-row"><a class="cta-btn" href="mailto:info@turva.dev?subject=Agent-readiness%20audit&amp;body=Site%20or%20API%20URL%3A%20%0AWhat%20the%20audit%20should%20answer%3A%20%0A">Request an audit</a></div>
  </section>
</main>
${footerHtml()}
</body>
</html>`;
  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "public, max-age=3600",
    "vary": "Accept",
    "content-language": "en"
  });
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "html");
  headers.append("Link", `<${markdownUrlFor(canonicalUrl)}>; rel="alternate"; type="text/markdown"`);
  return new Response(body, { status: 200, headers });
}

function serveServicesHtml(canonicalUrl) {
  const metaBlock = buildMetaBlock("/services", canonicalUrl);
  const jsonLd = buildGuideJsonLd("/services", canonicalUrl) +
    (GUIDE_PAGE_FAQ["/services"] ? "\n" + buildGuidePageFaqJsonLd("/services", canonicalUrl) : "") +
    // The price page carries the priced Service node itself, with the same @id values as the
    // home page, so both documents resolve to one graph and an agent that lands here from
    // search reads machine-readable prices instead of prose and FAQ answers only.
    `\n<script type="application/ld+json">\n{"@context":"https://schema.org","@graph":[\n${SCHEMA_SERVICE}\n]}\n<\/script>`;
  const start = mdParas("/services", "How to start", 3);
  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#0A1316" />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'><circle cx='16' cy='16' r='13' stroke='%235DF18F' stroke-width='2.4'/><path d='M10.5 16.4l3.6 3.6 7.2-7.6' stroke='%235DF18F' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/></svg>" />
<link rel="icon" type="image/png" sizes="512x512" href="https://turva.dev/logo.png" />
<link rel="apple-touch-icon" href="https://turva.dev/logo.png" />
<link rel="alternate" type="application/rss+xml" title="turva.dev blog" href="https://turva.dev/blog/feed.xml" />
${metaBlock}
${jsonLd}
${WEBMCP_SCRIPT}
<link rel="canonical" href="${canonicalUrl}" />
<link rel="ard" href="https://turva.dev/.well-known/ard.json" type="application/json" />
<link rel="alternate" href="${markdownUrlFor(canonicalUrl)}" type="text/markdown" />
<style>
html,body{background-color:#0A1316;overflow-wrap:break-word;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased;color-scheme:dark;}
main{max-width:46rem;margin:0 auto;padding:2.4rem clamp(20px,5vw,72px) 3rem;}
h1{color:#5DF18F;overflow-wrap:break-word;hyphens:auto;font-size:2.2rem;line-height:1.12;letter-spacing:-0.02em;margin:0 0 0.6rem;font-weight:700;}
.intro{font-size:1.12rem;color:#C9D1CE;margin:0 0 1.8rem;}
a{color:#5DF18F;text-decoration:none;}
a:hover{text-decoration:underline;}
.turva-nav{box-sizing:border-box;width:100%;background:#0A1316;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px clamp(20px,5vw,72px);border-bottom:0.5px solid rgba(255,255,255,0.08);}
.turva-nav *,.turva-nav *::before,.turva-nav *::after{box-sizing:border-box;}
.turva-nav .nv-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.turva-nav .nv-brand svg{display:block;width:26px;height:26px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
.turva-nav .nv-menu{display:flex;flex-wrap:wrap;min-width:0;align-items:center;gap:clamp(14px,2vw,30px);list-style:none;margin:0;padding:0;flex:1;}
.turva-nav .nv-menu a{font-size:15px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
.turva-nav .nv-menu a[aria-current]{color:#F2F4F3;}
@media (max-width:640px){.turva-nav .nv-menu{gap:14px;}.turva-nav .nv-menu a{font-size:14px;}}
.pcard{border:0.5px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.02);padding:1.5rem 1.5rem 1.3rem;margin:0 0 1.1rem;transition:border-color .15s ease;}
.pcard:hover{border-color:rgba(93,241,143,0.35);}
.pcard-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:.4rem 1rem;border-bottom:0.5px solid rgba(255,255,255,0.08);padding-bottom:.85rem;margin-bottom:1rem;}
.pcard-t{font-size:1.3rem;font-weight:700;color:#5DF18F;letter-spacing:-0.01em;margin:0 auto 0 0;}
.pcard-price{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.45rem;font-weight:700;color:#F2F4F3;}
.pcard-meta{flex-basis:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.74rem;letter-spacing:.05em;text-transform:uppercase;color:#9AA3A0;}
.pcard p{color:#C9D1CE;margin:0 0 .9rem;font-size:.97rem;}
.pcard .lbl{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.72rem;font-weight:400;letter-spacing:.08em;text-transform:uppercase;color:#9AA3A0;margin:1.1rem 0 .5rem;}
.pcard ul{list-style:none;margin:0 0 .3rem;padding:0;}
.pcard li{position:relative;padding:0 0 0 1.55rem;margin:0 0 .45rem;color:#C9D1CE;font-size:.95rem;line-height:1.5;}
.pcard ul.get li::before{content:"✓";position:absolute;left:0;top:0;color:#5DF18F;font-weight:700;}
.pcard ul.nope li{color:#9AA3A0;}
.pcard ul.nope li::before{content:"·";position:absolute;left:.4rem;top:-.05rem;color:#6F7A77;font-weight:700;}
.pcard .suited{margin:1rem 0 0;color:#9AA3A0;font-size:.92rem;}
.start{border-top:0.5px solid rgba(255,255,255,0.1);margin-top:1.6rem;padding-top:1.8rem;}
.start h2{color:#F2F4F3;font-size:1.4rem;font-weight:700;letter-spacing:-0.015em;margin:0 0 .85rem;}
.start p{color:#C9D1CE;margin:0 0 1rem;}
.cta-row{margin:1.1rem 0 1.3rem;}
.cta-btn{display:inline-block;background:#5DF18F;color:#06100F;font-weight:700;border-radius:8px;padding:.7rem 1.2rem;font-size:.95rem;}
.cta-btn:hover{background:#7df7a6;text-decoration:none;}
.fine{font-size:.85rem;color:#9AA3A0;margin:0;}
.scard{border:0.5px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.02);padding:1.4rem 1.5rem 1.2rem;margin:1.6rem 0 0;}
.scard h2{color:#5DF18F;font-size:1.2rem;font-weight:700;letter-spacing:-0.01em;margin:0 0 .85rem;}
.scard p{color:#C9D1CE;margin:0;font-size:.97rem;}
.scard p+p{margin-top:.6rem;}
${FAQ_CSS}
${FOOTER_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<nav class="turva-nav" aria-label="Main">
  <a class="nv-brand" href="/">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="#5DF18F" stroke-width="2.4"></circle>
      <path d="M10.5 16.4l3.6 3.6 7.2-7.6" stroke="#5DF18F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <span class="nv-word">turva<b>·</b>dev</span>
  </a>
  <ul class="nv-menu">
    <li><a href="/">home</a></li>
    <li><a href="/services" aria-current="page">services</a></li>
    <li><a href="/guides">guides</a></li>
    <li><a href="/blog">blog</a></li>
    <li><a href="/tools">tools</a></li>
    <li><a href="/company">company</a></li>
    <li><a href="/legal">legal</a></li>
    <li><a href="/contact">contact</a></li>
  </ul>
</nav>
<main id="main">
  ${mdPageStart("/services")}
  ${mdPcard("/services", "Shopify agent storefront check")}
  ${mdPcard("/services", "Audit")}
  ${mdPcard("/services", "Advisory")}
  ${mdPcard("/services", "Implementation")}
  ${mdPcard("/services", "Agent operations")}
  ${mdPcard("/services", "MCP server design")}
  ${mdCard("/services", "The agent-ready badge")}
  ${mdFaqCard("/services", "Frequently asked")}
  <div class="start">
    <h2>How to start</h2>
    <p>${start[0]}</p>
    <p>${start[1]}</p>
    <div class="cta-row"><a class="cta-btn" href="mailto:info@turva.dev?subject=Agent-readiness%20audit&amp;body=Site%20or%20API%20URL%3A%20%0AWhat%20the%20audit%20should%20answer%3A%20%0A">Request an audit</a></div>
    <p class="fine">${start[2]}</p>
  </div>
</main>
${footerHtml()}
</body>
</html>`;
  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "public, max-age=3600",
    "vary": "Accept",
    "content-language": "en"
  });
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "html");
  headers.append("Link", `<${markdownUrlFor(canonicalUrl)}>; rel="alternate"; type="text/markdown"`);
  return new Response(body, { status: 200, headers });
}

var CARDPAGE_CSS = `html,body{background-color:#0A1316;overflow-wrap:break-word;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased;color-scheme:dark;}
main{max-width:46rem;margin:0 auto;padding:2.4rem clamp(20px,5vw,72px) 3rem;}
h1{color:#5DF18F;overflow-wrap:break-word;hyphens:auto;font-size:2.2rem;line-height:1.12;letter-spacing:-0.02em;margin:0 0 0.6rem;font-weight:700;}
.intro{font-size:1.12rem;color:#C9D1CE;margin:0 0 1.8rem;}
a{color:#5DF18F;text-decoration:none;}
a:hover{text-decoration:underline;}
.turva-nav{box-sizing:border-box;width:100%;background:#0A1316;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px clamp(20px,5vw,72px);border-bottom:0.5px solid rgba(255,255,255,0.08);}
.turva-nav *,.turva-nav *::before,.turva-nav *::after{box-sizing:border-box;}
.turva-nav .nv-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.turva-nav .nv-brand svg{display:block;width:26px;height:26px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
.turva-nav .nv-menu{display:flex;flex-wrap:wrap;min-width:0;align-items:center;gap:clamp(14px,2vw,30px);list-style:none;margin:0;padding:0;flex:1;}
.turva-nav .nv-menu a{font-size:15px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
.turva-nav .nv-menu a[aria-current]{color:#F2F4F3;}
@media (max-width:640px){.turva-nav .nv-menu{gap:14px;}.turva-nav .nv-menu a{font-size:14px;}}
${SCARD_CSS}
.kvs{display:grid;grid-template-columns:minmax(0,max-content) minmax(0,1fr);gap:.55rem .7rem;align-items:baseline;}
.kv{display:contents;}
.kv .k{color:#9AA3A0;font-size:.88rem;}
.kv .v{color:#5DF18F;font-weight:600;word-break:break-word;}
.sigqr{display:grid;grid-template-columns:1fr auto;gap:1.1rem 1.4rem;align-items:center;margin-top:1.1rem;padding-top:1.1rem;border-top:0.5px solid rgba(255,255,255,0.10);}
.sigqr-txt p{color:#C9D1CE;margin:0;font-size:.94rem;}
.sigqr-txt .hint{color:#9AA3A0;font-size:.85rem;margin-top:.35rem;}
.sigqr-plate{display:block;background:#F2F4F3;border-radius:10px;padding:9px;line-height:0;}
.sigqr-plate img{display:block;width:147px;height:147px;}
.sigqr-user{display:block;margin-top:.45rem;text-align:center;font:600 .8rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#9AA3A0;letter-spacing:.01em;}
@media (max-width:560px){.sigqr{grid-template-columns:1fr;justify-items:start;}}
main>p{color:#C9D1CE;margin:0 0 1.3rem;}
.gv{color:#5DF18F;font-weight:600;}
.scard .sub{color:#9AA3A0;font-size:.95rem;margin:-.4rem 0 .9rem;}
${FAQ_CSS}
.dl{display:flex;flex-direction:column;gap:.75rem;}
.dl p{margin:0;color:#C9D1CE;font-size:.95rem;line-height:1.55;}
.dl .term{color:#5DF18F;font-weight:700;}
.post{display:block;border:0.5px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.02);padding:1.05rem 1.35rem;margin:0 0 .75rem;text-decoration:none;transition:border-color .15s ease;}
.post:hover{border-color:rgba(93,241,143,0.4);}
.post .pt{display:block;color:#5DF18F;font-weight:700;font-size:1.1rem;letter-spacing:-0.01em;margin:0 0 .28rem;}
.post .pd{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.76rem;letter-spacing:.04em;color:#9AA3A0;}
.feed{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;margin:-1.2rem 0 1.6rem;}
.feed a{color:#9AA3A0;}
.feed a:hover{color:#5DF18F;text-decoration:none;}
.start{border-top:0.5px solid rgba(255,255,255,0.1);margin-top:1.6rem;padding-top:1.8rem;}
.start h2{color:#F2F4F3;font-size:1.4rem;font-weight:700;letter-spacing:-0.015em;margin:0 0 .85rem;}
.start p{color:#C9D1CE;margin:0 0 1rem;}
.cta-row{margin:1.1rem 0 1.3rem;}
.cta-btn{display:inline-block;background:#5DF18F;color:#06100F;font-weight:700;border-radius:8px;padding:.7rem 1.2rem;font-size:.95rem;}
.cta-btn:hover{background:#7df7a6;text-decoration:none;}
.fine{font-size:.85rem;color:#9AA3A0;margin:0;}`;

function cardPageHead(metaBlock, jsonLd, canonicalUrl) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#0A1316" />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'><circle cx='16' cy='16' r='13' stroke='%235DF18F' stroke-width='2.4'/><path d='M10.5 16.4l3.6 3.6 7.2-7.6' stroke='%235DF18F' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/></svg>" />
<link rel="icon" type="image/png" sizes="512x512" href="https://turva.dev/logo.png" />
<link rel="apple-touch-icon" href="https://turva.dev/logo.png" />
<link rel="alternate" type="application/rss+xml" title="turva.dev blog" href="https://turva.dev/blog/feed.xml" />
${metaBlock}
${jsonLd}
${WEBMCP_SCRIPT}
<link rel="canonical" href="${canonicalUrl}" />
<link rel="ard" href="https://turva.dev/.well-known/ard.json" type="application/json" />
<link rel="alternate" href="${markdownUrlFor(canonicalUrl)}" type="text/markdown" />
<style>
${CARDPAGE_CSS}
${FOOTER_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>`;
}

function cardPageNav(current) {
  const items = [["/","home"],["/services","services"],["/guides","guides"],["/blog","blog"],["/tools","tools"],["/company","company"],["/legal","legal"],["/contact","contact"]];
  const lis = items.map(([href,label]) => `    <li><a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`).join("\n");
  return `<nav class="turva-nav" aria-label="Main">
  <a class="nv-brand" href="/">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="#5DF18F" stroke-width="2.4"></circle>
      <path d="M10.5 16.4l3.6 3.6 7.2-7.6" stroke="#5DF18F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <span class="nv-word">turva<b>·</b>dev</span>
  </a>
  <ul class="nv-menu">
${lis}
  </ul>
</nav>`;
}

function cardPageHeaders(canonicalUrl) {
  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "public, max-age=3600",
    "vary": "Accept",
    "content-language": "en"
  });
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "html");
  headers.append("Link", `<${markdownUrlFor(canonicalUrl)}>; rel="alternate"; type="text/markdown"`);
  return headers;
}

// ---------------------------------------------------------------------------
// BRIEF, Tek-269 (2026-08-24). Yhden asiakkaan agent-readiness-brief kolmessa
// muodossa samasta osoitteesta: HTML selaimelle, .md ja .json koneelle.
//
// MIKSI KV EIKA PAGE_MARKDOWN. Tama repo on JULKINEN. Asiakkaan brief nimeaa
// yrityksen ja sen puutteet, joten sen kirjoittaminen worker.js:aan julkaisisi
// ne pysyvasti julkisessa repossa eika se olisi peruttavissa jalkikateen. Lisaksi
// jokainen lahteva brief olisi koodimuutos, deploy ja push. Sisalto tulee siksi
// KV:sta ja tama tiedosto kantaa vain reitin.
//
// SISALTOA EI RENDEROIDA TASSA. KV:ssa on valmis markdown ja valmis JSON, jotka
// docs/auditit/briefgen/template.py tuottaa samasta lohkolistasta kuin PDF:n. HTML
// ladotaan siita samasta markdownista. Worker ei siis muodosta yhtaan virketta
// itse, eika mikaan kolmesta muodosta voi sanoa eri asiaa kuin toinen.
//
// EI HAKUKONEISIIN. Polku ei ole CANONICAL_PATHS:issa eika SITEMAP_ENTRIES:issa,
// tunnus on arvaamaton, ja jokainen vastaus kantaa noindex-otsakkeen. robots.txt:aa
// EI muuteta: sen sisalto on osa tuotteen omaa mitattavaa pintaa, eika Disallow-rivin
// vaikutusta skannerin bot-access-control-tarkistuksiin ole mitattu.
//
// TUNTEMATON TUNNUS VASTAA TASAN KUTEN MIKA TAHANSA TUNTEMATON POLKU, eli 404:lla.
// Erillinen "briefia ei ole" -sivu kertoisi ulkopuoliselle, etta polku on olemassa.
var BRIEF_ID = /^[a-z0-9][a-z0-9-]{7,79}$/;

function briefRoute(pathname) {
  if (!pathname.startsWith("/brief/")) return null;
  var rest = pathname.slice("/brief/".length);
  var muoto = "html";
  if (rest.endsWith(".md")) { muoto = "md"; rest = rest.slice(0, -3); }
  else if (rest.endsWith(".json")) { muoto = "json"; rest = rest.slice(0, -5); }
  if (!BRIEF_ID.test(rest)) return null;
  return { id: rest, muoto: muoto };
}

// LOPPUVALIMERKKI OSOITTEEN PERASSA, lisatty 2026-08-31 (Tek-323). Brief-osoite kulkee
// sahkopostin TEKSTIOSASSA: tools/laheta.mjs rakentaa viestin yhtena
// `Content-Type: text/plain; charset=UTF-8` -osana eika laheta HTML-vaihtoehtoa lainkaan,
// joten osoitteesta tekee linkin vastaanottajan oma postiohjelma. Osa niista ottaa
// virkkeen lopettavan pisteen mukaan linkkiin, ja silloin lukija saa 404:n tasan siita
// osoitteesta jonka koko viestin oli maara toimittaa. Mitattu 2026-08-31:
// /brief/<tunnus> vastasi 200:lla ja sama osoite pisteen kanssa 404:lla (tunnus on tassa
// paikanpitaja: elava osoite ei kuulu julkiseen repoon, kierros 16 S4-1)
// kolmessa ajossa kolmesta.
//
// SIIVOUS EI VOI SYODA OIKEAA TUNNUSTA, koska BRIEF_ID sallii vain merkit [a-z0-9-] eika
// tunnus voi siksi paattya valimerkkiin. Sulkumerkki on mukana, koska markdown-tyylinen
// (https://...) on toinen tapa jolla osoite paatyy sulkeutuvan merkin viereen.
//
// VASTAUS ON 301 EIKA SISALTO. Jos sama brief vastaisi kahdesta osoitteesta, kanoninen
// osoite ei olisi enaa yksi, ja tama sivu on nimenomaan yhden osoitteen varassa. Ohjaus
// kantaa noindexin kuten kaikki muutkin taman polun vastaukset, koska ohjauksen KOHDE on
// yksityinen sivu eika ohjaus saa olla se rivi joka paljastaa polun hakukoneelle.
var BRIEF_LOPPUVALIMERKIT = /[.,;:!?)\]]+$/;

function briefSiivousKohde(pathname) {
  if (!pathname.startsWith("/brief/")) return null;
  if (!BRIEF_LOPPUVALIMERKIT.test(pathname)) return null;
  var siivottu = pathname.replace(BRIEF_LOPPUVALIMERKIT, "");
  if (!briefRoute(siivottu)) return null;
  return siivottu;
}

function briefUnescape(md) {
  // template.py:n _md_suoja() suojaa rivin alun merkit kenoviivalla, jotta oikea
  // markdown-jasennin ei lue proosaa listaksi tai otsikoksi. markdownToHtml() ei
  // tunne kenoviivasuojausta, joten se latoisi kenoviivan nakyviin. Purku tehdaan
  // VAIN HTML-latomista varten; .md-vastaus menee ulos tavulleen sellaisena kuin
  // se on KV:ssa, koska se on kirjoitettu markdown-jasentimelle.
  return md.replace(/\\([#>+*\-.)])/g, "$1");
}

function briefHeaders(kind, kieli) {
  var headers = new Headers();
  // Yksityinen sivu, ei valimuistiin. Brief voi saada paivatyn uusintaskannauslohkon,
  // ja reunalla oleva vanha kopio sanoisi silloin eri asian kuin KV.
  headers.set("cache-control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("content-language", kieli === "fi" ? "fi" : "en");
  headers.set("vary", "Accept");
  applySecurityHeaders(headers, kind);
  return headers;
}

// Briefsivun oma valistys. Erik 2026-08-26: valia h1:n ja alaotsikon valiin.
// CARDPAGE_CSS antaa h1:lle 0,6rem, mika riittaa lyhyelle korttisivulle mutta ei
// kaksiriviselle briefotsikolle. VALIOTSIKOITA EI VALJENNETA: 3.108.2 teki myos sen,
// ja Erik poisti sen 2026-08-26. Tama koskee VAIN /brief/-sivua, koska sama
// CARDPAGE_CSS servaa julkiset korttisivut eika niiden ladontaa muuteta tassa.
var BRIEF_CSS = `main h1{margin-bottom:1.7rem;}`;

function briefHtmlPage(rec, canonicalUrl) {
  var kieli = rec.kieli === "fi" ? "fi" : "en";
  var otsikko = (rec.otsikko || rec.yritys || "agent readiness brief") + " · turva.dev";
  var kuvaus = kieli === "fi"
    ? "Agent-readiness-briiffi, " + (rec.yritys || "") + ". Sama sisältö markdownina ja JSONina samasta osoitteesta."
    : "Agent readiness brief, " + (rec.yritys || "") + ". The same content as markdown and JSON at the same address.";
  // OG JA TWITTER, lisatty 2026-09-01. Ilman og:description LinkedInin raaputtaja ei
  // putoa meta name="description" -tagiin vaan raapii sivun nakyvaa tekstia ylhaalta,
  // ja sivun ensimmainen nakyva teksti on saavutettavuuslinkki "Skip to content".
  // Mitattu eraan briefista 2026-09-01: esikatselu luki "Skip to content turva . dev".
  // Kuvaus tulee samasta kuvaus-muuttujasta kuin meta description, jottei kaksi
  // samaa tarkoittavaa merkkijonoa ajaudu erilleen.
  var someOtsikko = rec.otsikko || rec.yritys || "agent readiness brief";
  var vaihtoehdot = kieli === "fi"
    ? "Sama sisältö koneluettavana: <a href=\"" + canonicalUrl + ".md\">markdown</a> ja <a href=\"" + canonicalUrl + ".json\">JSON</a>."
    : "The same content, machine readable: <a href=\"" + canonicalUrl + ".md\">markdown</a> and <a href=\"" + canonicalUrl + ".json\">JSON</a>.";
  // KEHYS SUOMEKSI, lisatty 2026-09-03 (kierros 17, kohta A). Suomenkielisen briefin runko oli
  // suomea mutta ohituslinkki, alatunniste ja tama rivi olivat englantia, ja "sisalto" oli
  // ilman aakkosia. Nav pysyy englanniksi, koska se vie englanninkielisille sivuille.
  var yhteys = kieli === "fi"
    ? "Kysymykset suomeksi tai englanniksi: <a href=\"mailto:info@turva.dev\">info@turva.dev</a>. Vastaan kirjallisesti yhden arkipäivän kuluessa."
    : "Questions in English or Finnish: <a href=\"mailto:info@turva.dev\">info@turva.dev</a>. I reply in writing within one business day.";
  return `<!doctype html>
<html lang="${kieli}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#0A1316" />
<meta name="robots" content="noindex, nofollow" />
<title>${escapeHtml(otsikko)}</title>
<meta name="description" content="${escapeHtml(kuvaus)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="turva.dev" />
<meta property="og:title" content="${escapeHtml(someOtsikko)}" />
<meta property="og:description" content="${escapeHtml(kuvaus)}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:locale" content="${kieli === "fi" ? "fi_FI" : "en_US"}" />
<meta property="og:image" content="https://turva.dev/og.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="turva.dev" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(someOtsikko)}" />
<meta name="twitter:description" content="${escapeHtml(kuvaus)}" />
<meta name="twitter:image" content="https://turva.dev/og.jpg" />
<meta name="twitter:image:alt" content="turva.dev" />
<link rel="icon" type="image/png" sizes="512x512" href="https://turva.dev/logo.png" />
<link rel="apple-touch-icon" href="https://turva.dev/logo.png" />
${WEBMCP_SCRIPT}
<link rel="alternate" href="${canonicalUrl}.md" type="text/markdown" />
<link rel="alternate" href="${canonicalUrl}.json" type="application/json" />
<style>
${CARDPAGE_CSS}
${FOOTER_CSS}
${BRIEF_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">${kieli === "fi" ? "Siirry sisältöön" : "Skip to content"}</a>
${cardPageNav("")}
<main id="main">
${markdownToHtml(briefUnescape(rec.md))}
<p class="date">${vaihtoehdot}</p>
<p class="date">${yhteys}</p>
</main>
${footerHtml(kieli)}
</body>
</html>`;
}

async function serveBrief(route, pathname, env, request) {
  var kv = env && env.BRIEFIT;
  // Ilman bindingia reitti ei ole olemassa. Nain testit ja deployta edeltava tila
  // vastaavat samoin kuin tuntemattomaan polkuun, eika puuttuva binding ole 500.
  if (!kv || typeof kv.get !== "function") return serve404(pathname);
  var rec = null;
  try {
    rec = await kv.get(route.id, { type: "json" });
  } catch (err) {
    console.error("brief KV error:", err && err.stack ? err.stack : String(err));
    return serve404(pathname);
  }
  if (!rec || typeof rec.md !== "string" || !rec.json) return serve404(pathname);
  var canonicalUrl = "https://turva.dev/brief/" + route.id;
  // ACCEPT-NEUVOTTELU KUULUU TANNEKIN. Mitattu livesta 2026-08-24: paate-osoitteet
  // toimivat, mutta `Accept: text/markdown` briefin omaan osoitteeseen palautti HTML:n.
  // Koko sivusto vastaa muuten Acceptiin, ja markdown-neuvottelu on yksi niista
  // tarkistuksista jotka skanneri lukee lapaisseeksi, joten uusi reitti oli ainoa pinta
  // joka ei pitanyt talon omaa lupausta. Sivu kantaa jo `vary: Accept`.
  if (route.muoto === "html") {
    if (wantsJson(request)) route = { id: route.id, muoto: "json" };
    else if (wantsMarkdown(request)) route = { id: route.id, muoto: "md" };
  }
  if (route.muoto === "md") {
    var mh = briefHeaders("agent-api", rec.kieli);
    mh.set("content-type", "text/markdown; charset=utf-8");
    mh.set("content-location", canonicalUrl);
    mh.append("Link", `<${canonicalUrl}>; rel="canonical"`);
    mh.set("x-markdown-words", String(rec.md.split(/\s+/).filter(Boolean).length));
    return new Response(rec.md, { status: 200, headers: mh });
  }
  if (route.muoto === "json") {
    var jh = briefHeaders("agent-api", rec.kieli);
    jh.set("content-type", "application/json; charset=utf-8");
    jh.set("content-location", canonicalUrl);
    jh.append("Link", `<${canonicalUrl}>; rel="canonical"`);
    return new Response(JSON.stringify(rec.json, null, 2) + "\n", { status: 200, headers: jh });
  }
  var hh = briefHeaders("html", rec.kieli);
  hh.set("content-type", "text/html; charset=utf-8");
  hh.append("Link", `<${canonicalUrl}.md>; rel="alternate"; type="text/markdown"`);
  return new Response(briefHtmlPage(rec, canonicalUrl), { status: 200, headers: hh });
}


function serveCompanyHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/company", canonicalUrl), buildGuideJsonLd("/company", canonicalUrl), canonicalUrl);
  const body = `${head}
${cardPageNav("/company")}
<main id="main">
  ${mdPageStart("/company")}
  ${mdKvsCard("/company", "Business details")}
  ${mdCard("/company", "About the operator")}
  ${mdCard("/company", "Location")}
  ${mdCard("/company", "Why this service exists")}
  ${mdCard("/company", "Operating principles")}
  ${mdKvsCard("/company", "Contact")}
  ${mdCard("/company", "Invoicing")}
</main>
${footerHtml()}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

function serveContactHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/contact", canonicalUrl), buildGuideJsonLd("/contact", canonicalUrl), canonicalUrl);
  const body = `${head}
${cardPageNav("/contact")}
<main id="main">
  ${mdPageStart("/contact")}
  ${mdKvsCard("/contact", "Channels", contactSignalQr())}
  ${mdCard("/contact", "Start a request by email")}
  ${mdCard("/contact", "Encrypted email")}
  ${mdCard("/contact", "Response times")}
  ${mdCard("/contact", "Languages")}
  ${mdCard("/contact", "What to include in a first message")}
  ${mdCard("/contact", "Confidentiality")}
  ${mdCard("/contact", "Geographic service area")}
  ${mdKvsCard("/contact", "Business details")}
</main>
${footerHtml()}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

function serveLegalHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/legal", canonicalUrl), buildGuideJsonLd("/legal", canonicalUrl), canonicalUrl);
  const body = `${head}
${cardPageNav("/legal")}
<main id="main">
  ${mdPageStart("/legal")}
  ${mdCard("/legal", "Operator")}
  ${mdTermsCard("/legal", "Terms of engagement")}
  ${mdTermsCard("/legal", "Privacy")}
  ${mdCard("/legal", "Rights under GDPR")}
  ${mdCard("/legal", "Cookies")}
  ${mdCard("/legal", "Updates")}
</main>
${footerHtml()}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

function serveShopifyHtml(canonicalUrl) {
  const head = cardPageHead(
    buildMetaBlock("/shopify-agent-storefront-check", canonicalUrl),
    buildGuideJsonLd("/shopify-agent-storefront-check", canonicalUrl) + "\n" +
      buildShopifyServiceJsonLd(canonicalUrl) + "\n" +
      buildGuidePageFaqJsonLd("/shopify-agent-storefront-check", canonicalUrl),
    canonicalUrl);
  const start = mdParas("/shopify-agent-storefront-check", "How to start", 3);
  const cta = `<div class="cta-row"><a class="cta-btn" href="mailto:info@turva.dev?subject=Shopify%20agent%20storefront%20check&amp;body=Storefront%20URL%3A%20%0A.myshopify.com%20domain%3A%20%0APrimary%20market%3A%20%0AUp%20to%20three%20priority%20products%3A%20%0A">Request a check by email</a></div>`;
  const body = `${head}
${cardPageNav("/shopify-agent-storefront-check")}
<main id="main">
  ${mdPageStart("/shopify-agent-storefront-check")}
  ${cta}
  ${mdCard("/shopify-agent-storefront-check", "Price and timing")}
  ${mdCard("/shopify-agent-storefront-check", "The three surfaces")}
  ${mdCard("/shopify-agent-storefront-check", "What the check answers")}
  ${mdCard("/shopify-agent-storefront-check", "Fixed scope")}
  ${mdCard("/shopify-agent-storefront-check", "What you receive")}
  ${mdCard("/shopify-agent-storefront-check", "What this is not")}
  ${mdCard("/shopify-agent-storefront-check", "What the public preflight measured")}
  ${mdCard("/shopify-agent-storefront-check", "Sample report")}
  ${mdFaqCard("/shopify-agent-storefront-check", "Frequently asked")}
  <div class="start">
    <h2>How to start</h2>
    <p>${start[0]}</p>
    <p>${start[1]}</p>
    ${cta}
    <p class="fine">${start[2]}</p>
  </div>
</main>
${footerHtml()}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

function serveBadgeHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/badge", canonicalUrl), buildGuideJsonLd("/badge", canonicalUrl), canonicalUrl);
  const body = `${head}
${cardPageNav("/badge")}
<main id="main">
  ${mdPageStart("/badge")}
  ${mdCard("/badge", "Who may display it")}
  ${mdCard("/badge", "What it is, and what it is not")}
  <div class="scard"><h2>How to embed it</h2>
    <p>The badge looks like this:</p>
    <p><img src="/badge.svg" alt="agent-ready. Criteria at turva.dev/badge" width="216" height="36"></p>
    ${mdBodyHtml("/badge", "How to embed it")}
  </div>
  ${mdCard("/badge", "If your site is not there yet")}
</main>
${footerHtml()}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

function serveToolsHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/tools", canonicalUrl), buildGuideJsonLd("/tools", canonicalUrl), canonicalUrl);
  const body = `${head}
${cardPageNav("/tools")}
<main id="main">
  ${mdPageStart("/tools")}
  ${mdCard("/tools", "llms.txt validator")}
  ${mdCard("/tools", "The agent-ready badge")}
  ${mdCard("/tools", "Public MCP server")}
  ${mdCard("/tools", "Where to go next")}
</main>
${footerHtml()}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

// llms.txt validator: fetches a target site's /llms.txt server-side and
// checks its structure against the llms.txt format. Redirects are followed
// only to the same host or its www/apex twin (procad.fi and www.procad.fi),
// and every hop is re-guarded: https only, a public DNS name (no IP literals,
// no localhost/internal names, no ports, no credentials). An off-host or
// unsafe redirect is never fetched and fails the first check. The fetch times
// out after 8 seconds and the body read is capped at 256 KB. Results are
// never stored and result pages are served with no-store.
function normalizeHostInput(raw) {
  let s = String(raw || "").trim().toLowerCase();
  if (!s) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//.test(s)) s = "https://" + s;
  let u;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (u.port && u.port !== "443" && u.port !== "80") return null;
  if (u.username || u.password) return null;
  return u.hostname;
}

function isValidPublicHost(host) {
  if (!host || host.length > 253) return false;
  if (host.startsWith("[") || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return false;
  if (!/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{1,62}$/.test(host)) return false;
  const tld = host.split(".").pop();
  if (["localhost", "local", "internal", "home", "lan", "corp", "test", "invalid"].includes(tld)) return false;
  return true;
}

// The second argument was added for the v2 discovery checks, which need the site's
// home page as well as its llms.txt. It is one parameter and nothing else moved:
// the redirect budget, the same-host rule, the credential and port rejections and
// the 256 KB cap are the guards this function was measured against, and a rewrite
// would have put them back in play for a feature that does not need them.
async function fetchLlmsTxt(host, path, accept) {
  const reqApex = host.startsWith("www.") ? host.slice(4) : host;
  const cap = 262144;
  let url = "https://" + host + (path || "/llms.txt");
  let redirectedFrom = null;
  // One 8 s budget for the whole redirect chain, not 8 s per hop: the error shown to
  // the reader says "timed out after 8 seconds", and with up to five hops a per-hop
  // signal made that message false by a factor of five.
  const deadline = Date.now() + 8000;
  for (let hop = 0; ; hop++) {
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())),
      headers: {
        "user-agent": "turva-llms-txt-validator (+https://turva.dev/llms-txt-validator)",
        "accept": accept || "text/plain, text/markdown;q=0.9, */*;q=0.1"
      }
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location") || "";
      if (!loc) return { redirect: true, reason: "no-location", status: res.status, location: "" };
      if (hop >= 4) return { redirect: true, reason: "too-many", status: res.status, location: cut(loc, 120) };
      let next;
      try { next = new URL(loc, url); } catch { return { redirect: true, reason: "bad-location", status: res.status, location: cut(loc, 120) }; }
      const safeTarget = next.protocol === "https:" && !next.port && !next.username && !next.password && isValidPublicHost(next.hostname);
      const twin = (next.hostname.startsWith("www.") ? next.hostname.slice(4) : next.hostname) === reqApex;
      if (!safeTarget) return { redirect: true, reason: "unsafe-target", status: res.status, location: cut(next.href, 120) };
      if (!twin) return { redirect: true, reason: "off-host", status: res.status, location: cut(next.href, 120) };
      if (!redirectedFrom) redirectedFrom = url;
      url = next.href;
      continue;
    }
    let bytes = 0, truncated = false;
    const chunks = [];
    if (res.body) {
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > cap) {
          truncated = true;
          chunks.push(value.slice(0, value.length - (bytes - cap)));
          bytes = cap;
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
    }
    const buf = new Uint8Array(bytes);
    let o = 0;
    for (const c of chunks) { buf.set(c, o); o += c.length; }
    return {
      status: res.status,
      contentType: res.headers.get("content-type") || "",
      linkHeader: res.headers.get("link") || "",
      text: new TextDecoder("utf-8").decode(buf),
      bytes,
      truncated,
      redirectedFrom,
      finalUrl: url
    };
  }
}

// Every markdown link in the file, scanned once from left to right instead of collected with
// matchAll(/\[([^\][]*)\]\(([^)\s]{1,2048})\)/g). That bound meant a target longer than 2048
// characters was not counted as a link at all, and dropping the bound from the pattern would
// make it quadratic on a file that repeats "[a](" (Erik 2026-08-29). The scan carries no bound
// and no backtracking: every character is read once and the furthest failed target scan is
// remembered. matchAll resumes after a whole match, and so does this.
function collectLinks(text) {
  const out = [];
  let failEnd = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "[") continue;
    let j = i + 1;
    while (j < text.length && text[j] !== "]" && text[j] !== "[") j++;
    if (j >= text.length) break;
    if (text[j] === "[") { i = j - 1; continue; }
    if (text[j + 1] !== "(") { i = j; continue; }
    const k = j + 2;
    if (k <= failEnd) { i = j + 1; continue; }
    let e = k;
    while (e < text.length && text[e] !== ")" && !/\s/.test(text[e])) e++;
    if (e > k && text[e] === ")") { out.push({ name: text.slice(i + 1, j), target: text.slice(k, e) }); i = e; continue; }
    if (text[e] !== ")") failEnd = e;
    i = j + 1;
  }
  return out;
}

// A markdown list item that carries a link, scanned once from left to right instead of
// matched with /^ {0,3}[-*+] .*\[[^\][]*\]\([^)\s]+\)/. That pattern is quadratic on a line
// such as "- " followed by "[a](" repeated, because every candidate rescans the target to the
// end of the line, and the line comes from the audited site (CodeQL js/polynomial-redos,
// 2026-08-29). Bounding the quantifier would trade the speed bug for a silent accuracy bug,
// so the scan is by index: every character is read once and the furthest failed target scan
// is remembered.
function listItemHasLink(l) {
  const m = /^ {0,3}[-*+] /.exec(l);
  if (!m) return false;
  const isSep = (c) => c === "\r" || c === "\n" || c === "\u2028" || c === "\u2029";
  let failEnd = -1;
  for (let i = m[0].length; i < l.length; i++) {
    // A "." in the old pattern never crosses a line terminator, and split(/\r?\n/) leaves
    // a bare CR, U+2028 and U+2029 inside a line, so a link behind one was not a match then
    // and is not one now.
    if (isSep(l[i])) return false;
    if (l[i] !== "[") continue;
    let j = i + 1, sep = false;
    while (j < l.length && l[j] !== "]" && l[j] !== "[") { if (isSep(l[j])) sep = true; j++; }
    if (j >= l.length) return false;
    if (l[j] === "[") { if (sep) return false; i = j - 1; continue; }
    if (l[j + 1] !== "(") { if (sep) return false; i = j; continue; }
    const k = j + 2;
    if (k <= failEnd) { if (sep) return false; i = j + 1; continue; }
    let e = k;
    while (e < l.length && l[e] !== ")" && !/\s/.test(l[e])) e++;
    if (e > k && l[e] === ")") return true;
    if (sep) return false;
    if (l[e] !== ")") failEnd = e;
    i = j + 1;
  }
  return false;
}

function redirectFailDetail(f) {
  if (f.reason === "off-host") return "redirects to " + f.location + ", a different host; llms.txt is host-scoped, so validate that host directly";
  if (f.reason === "unsafe-target") return "redirects to an unsupported target (" + f.location + "); only https redirects to the same site are followed";
  if (f.reason === "too-many") return "too many redirects; the llms.txt is not served at a stable URL";
  return "got a " + f.status + " redirect without a usable Location header";
}

function validateLlmsTxt(f) {
  const checks = [];
  const add = (id, status, label, detail) => checks.push({ id, status, label, detail });
  if (f.redirect) {
    add("http-status", "fail", "File exists at /llms.txt", redirectFailDetail(f));
    return checks;
  }
  if (f.status !== 200) {
    add("http-status", "fail", "File exists at /llms.txt", "expected HTTP 200, got " + f.status);
    return checks;
  }
  add("http-status", "pass", "File exists at /llms.txt", f.redirectedFrom ? "HTTP 200, followed a redirect from " + f.redirectedFrom + " to " + f.finalUrl : "HTTP 200");
  const ct = (f.contentType || "").toLowerCase();
  const looksHtml = /^\s*(<!doctype|<html|<head|<body)/i.test(f.text);
  if (looksHtml) {
    add("content-type", "fail", "Response is plain text", "the body looks like an HTML page, not an llms.txt file");
    return checks;
  }
  if (ct.includes("text/plain") || ct.includes("text/markdown")) {
    add("content-type", "pass", "Response is plain text", ct.split(";")[0]);
  } else {
    add("content-type", "warn", "Response is plain text", "content-type is " + (ct.split(";")[0] || "missing") + ", text/plain or text/markdown is the convention");
  }
  const lines = f.text.split(/\r?\n/);
  const firstIdx = lines.findIndex((l) => l.trim() !== "");
  const firstRaw = firstIdx === -1 ? "" : lines[firstIdx];
  const first = firstRaw.trim();
  // The line is read as markdown and not trimmed first. Four spaces or a tab make it an
  // indented code block rather than a heading, and trimming erased that difference, so
  // "    # Site" passed as the H1 until 2026-08-29. CommonMark allows three spaces.
  if (/^ {0,3}# \S/.test(firstRaw)) {
    add("h1-title", "pass", "Starts with an H1 title", JSON.stringify(cut(first, 80)));
  } else {
    add("h1-title", "fail", "Starts with an H1 title", "the first non-empty line should be a markdown H1 (# Site name)");
  }
  const afterH1 = lines.slice(firstIdx + 1).find((l) => l.trim() !== "") || "";
  if (afterH1.trim().startsWith("> ")) {
    add("summary", "pass", "Blockquote summary after the title", JSON.stringify(cut(afterH1.trim(), 80)));
  } else {
    add("summary", "warn", "Blockquote summary after the title", "recommended by the format (> one-line summary), not required");
  }
  const h2Count = (f.text.match(/^## /gm) || []).length;
  // A section counts when it carries a file list. An H2 followed by a paragraph satisfied
  // this check until 2026-08-29, and the format puts each section's links in a list.
  let sectionsWithList = 0;
  {
    let inSection = false, counted = false;
    for (const l of lines) {
      if (/^## /.test(l)) { inSection = true; counted = false; continue; }
      if (/^# /.test(l)) { inSection = false; continue; }
      if (inSection && !counted && listItemHasLink(l)) { sectionsWithList++; counted = true; }
    }
  }
  if (h2Count > 0 && sectionsWithList > 0) {
    add("sections", "pass", "H2 sections group the content", h2Count + " section" + (h2Count === 1 ? "" : "s") + ", " + sectionsWithList + " carrying a file list");
  } else if (h2Count > 0) {
    add("sections", "warn", "H2 sections group the content", h2Count + " section" + (h2Count === 1 ? "" : "s") + " but no file list under any of them; the format puts a section's links in a markdown list");
  } else {
    add("sections", "warn", "H2 sections group the content", "no H2 sections found; sections are the convention for grouping links");
  }
  const links = collectLinks(f.text);
  // An entry an agent can use has a name and a target with a host. An empty name and a
  // bare "https://" both counted as valid absolute links until 2026-08-29.
  const named = links.filter((m) => m.name.trim() !== "");
  const unnamed = links.length - named.length;
  const absolute = named.filter((m) => /^https?:\/\/[^/\s?#]+/.test(m.target)).length;
  if (links.length === 0) {
    add("links", "warn", "Markdown links an agent can follow", "no markdown links found");
  } else if (unnamed > 0) {
    add("links", "warn", "Markdown links an agent can follow", links.length + " link" + (links.length === 1 ? "" : "s") + ", " + unnamed + " with an empty link name; an entry needs a name an agent can show");
  } else if (absolute === named.length) {
    add("links", "pass", "Markdown links an agent can follow", named.length + " link" + (named.length === 1 ? "" : "s") + ", all absolute URLs");
  } else {
    const relativeCount = named.filter((m) => !/^[a-z][a-z0-9+.-]*:/i.test(m.target)).length;
    const hostless = named.length - absolute - relativeCount;
    add("links", "warn", "Markdown links an agent can follow", named.length + " links, " + relativeCount + " relative" + (hostless > 0 ? " and " + hostless + " with a scheme but no host" : "") + "; absolute URLs travel better when the file is read out of context");
  }
  if (f.truncated) {
    add("size", "warn", "Small enough to be cheap to read", "over 256 KB, read truncated");
  } else if (f.bytes <= 51200) {
    add("size", "pass", "Small enough to be cheap to read", f.bytes + " bytes");
  } else {
    add("size", "warn", "Small enough to be cheap to read", f.bytes + " bytes; consider moving detail to llms-full.txt");
  }
  if (/<[a-z][a-z0-9-]*[\s>]/i.test(f.text)) {
    add("no-html", "warn", "No HTML markup in the file", "HTML tags found; llms.txt should be plain markdown");
  } else {
    add("no-html", "pass", "No HTML markup in the file", "plain markdown");
  }
  return checks;
}

// A "<" starts a tag only when a letter, "!", "/" or "?" follows it. Anything else is
// text, and the NEXT "<" can still start a tag. Measured, not assumed: without this rule
// "<<style><link rel=describedby ...>" read the link as published while a real parser
// treats the first "<" as text, opens style, and publishes nothing.
function startsTag(c) {
  return c !== undefined && (c === "!" || c === "/" || c === "?" || (c >= "a" && c <= "z"));
}

// The end of the tag that starts at lt: the first ">" that is NOT inside a quoted
// attribute value. A quote opens a value only right after "=", which is what the
// tokenizer does. indexOf(">") is wrong here: <link data-x="a>b" rel="describedby"> is
// one tag for a parser and two for indexOf, and the relation was lost.
function tagEnd(text, lt) {
  let quote = "", afterEq = false;
  for (let j = lt + 1; j < text.length; j++) {
    const c = text[j];
    if (quote) { if (c === quote) quote = ""; continue; }
    if (c === ">") return j;
    if (c === "=") { afterEq = true; continue; }
    if (c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f") continue;
    if (afterEq && (c === '"' || c === "'")) { quote = c; afterEq = false; continue; }
    afterEq = false;
  }
  return -1;
}

// The head is where a real parser says it ends, not where the text "</head>" happens to
// appear. Erik's decision 2026-08-24: the two v2 checks describe what the page's HEAD
// points at, so a link element the parser moves into the body is not one of them. That is
// the strict reading, and it is what the HTML parsing spec's "in head" insertion mode
// does: whitespace, comments, doctype and the head-only elements keep the head open;
// the first text node, the first body-level element and </head>, </body>, </html> or
// </br> close it; any other end tag in the head is a parse error and is ignored.
var HEAD_ELEMENTS = ["base", "basefont", "bgsound", "link", "meta", "noframes", "script", "style", "template", "title", "noscript"];
// Once </head> has been seen the parser is in "after head", and that list is the one above
// WITHOUT noscript: a noscript there opens the body instead of staying in the head.
var AFTER_HEAD_ELEMENTS = ["base", "basefont", "bgsound", "link", "meta", "noframes", "script", "style", "template", "title"];
// Their content is not markup: script, style, title, noscript (a parser with scripting on
// reads it as raw text) and noframes are raw text or RCDATA, and template content is inert.
var HEAD_SKIPPED_CONTENT = ["script", "style", "title", "noscript", "noframes", "template"];

// The end of a raw text or RCDATA element: the first </name that is followed by optional
// whitespace, an optional "/" (a parser closes on </script/> too) and a ">". Returns the
// index after it, or -1 when the element never closes, which means the rest of the
// document is inside it.
function skipSpace(lower, j) {
  while (j < lower.length && (lower[j] === " " || lower[j] === "\t" || lower[j] === "\n" || lower[j] === "\r" || lower[j] === "\f")) j++;
  return j;
}

// True when the character ends a tag name: whitespace, "/", ">" or the end of the input.
function isTagBoundary(c) {
  return c === undefined || c === ">" || c === "/" || c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f";
}

// The index just after "</name ... >", or -1 when that is not an end tag there.
function endTagAt(lower, name, at) {
  if (!lower.startsWith("</" + name, at)) return -1;
  let j = skipSpace(lower, at + name.length + 2);
  if (lower[j] === "/") j = skipSpace(lower, j + 1);
  return lower[j] === ">" ? j + 1 : -1;
}

function rawTextEnd(lower, name, from) {
  for (let at = lower.indexOf("</" + name, from); at !== -1; at = lower.indexOf("</" + name, at + name.length + 2)) {
    const end = endTagAt(lower, name, at);
    if (end !== -1) return end;
  }
  return -1;
}

// script is not plain raw text: <!-- puts the tokenizer in the escaped state, a nested
// <script there puts it in the double escaped state, and in THAT state </script only ends
// the escape, not the element. Without this the legacy shape
// <script><!-- ... <script>...</script> ... --></script> ended early and the rest of the
// script was read as markup, which is the wrong direction. 4 of 240 000 fuzz inputs.
function scriptEnd(lower, from) {
  let i = from, escaped = false, doubleEscaped = false;
  while (i < lower.length) {
    if (lower.startsWith("<!--", i)) { escaped = true; i += 4; continue; }
    if (escaped && lower.startsWith("-->", i)) { escaped = false; doubleEscaped = false; i += 3; continue; }
    if (escaped && !doubleEscaped && lower.startsWith("<script", i) && isTagBoundary(lower[i + 7])) { doubleEscaped = true; i += 7; continue; }
    if (lower.startsWith("</script", i)) {
      if (doubleEscaped) { doubleEscaped = false; i += 8; continue; }
      const end = endTagAt(lower, "script", i);
      if (end !== -1) return end;
      i += 8;
      continue;
    }
    const next = lower.indexOf("<", i + 1);
    i = next === -1 ? lower.length : next;
  }
  return -1;
}

// The end of a nested template: templates count, so an inner </template> does not close
// an outer one. Returns the index after the closing tag, or -1 when it never closes.
function templateEnd(lower, from) {
  let depth = 1;
  // Both searches resume from their own previous hit. Restarting either one from a shared
  // cursor is quadratic: "</templateX" repeated made every round scan to the end of the
  // input again, and 1 MB of it measured 15 686 ms.
  let open = lower.indexOf("<template", from);
  let close = lower.indexOf("</template", from);
  for (;;) {
    if (close === -1) return -1;
    if (open !== -1 && open < close) {
      if (isTagBoundary(lower[open + 9])) depth++;
      open = lower.indexOf("<template", open + 9);
      continue;
    }
    let j = close + 10;
    j = skipSpace(lower, j);
    if (lower[j] === "/") j = skipSpace(lower, j + 1);
    if (lower[j] !== ">") {
      // Not an end tag: for the tokenizer the rest of the name runs to the next ">", and a
      // "<" inside it is part of the name rather than a new tag.
      const bogus = lower.indexOf(">", close + 10);
      if (bogus === -1) return -1;
      close = lower.indexOf("</template", bogus + 1);
      if (open !== -1 && open < bogus) open = lower.indexOf("<template", bogus + 1);
      continue;
    }
    depth--;
    if (depth === 0) return j + 1;
    close = lower.indexOf("</template", j + 1);
  }
}

// One left to right scan by index that returns the head, with comments and the content of
// the raw text and template elements already removed. Why a scan and not a regex: a
// character class that reads a tag's attributes is quadratic on input the TARGET site
// controls (CodeQL js/polynomial-redos, alerts #4 and #5, 2026-08-24), and bounding the
// class trades that speed bug for a worse correctness bug, because an open tag longer than
// the bound stops being recognised and the element's own text is then read as markup. A
// scan has no bound and no backtracking, and it visits every character once.
//
// The shapes, all measured against a real HTML parser (parse5) rather than reasoned about.
// An unterminated <!-- comments out the rest of the document. <!--> and <!---> are EMPTY
// comments, not unterminated ones, and --!> ends a comment as well. A "<" that no letter,
// "!", "/" or "?" follows is text. A ">" inside a quoted attribute value does not end a
// tag. </script/> closes a raw text element as well as </script> does.
function headOfDocument(html) {
  const text = String(html || "");
  const lower = text.toLowerCase();
  const out = [];
  let i = 0, afterHead = false;
  for (;;) {
    const lt = lower.indexOf("<", i);
    const gap = lt === -1 ? text.slice(i) : text.slice(i, lt);
    if (gap.trim() !== "") break;
    out.push(gap);
    if (lt === -1) break;
    if (lower.startsWith("<!--", lt)) {
      if (lower.startsWith("<!-->", lt)) { i = lt + 5; continue; }
      if (lower.startsWith("<!--->", lt)) { i = lt + 6; continue; }
      const dashes = lower.indexOf("-->", lt + 4);
      const bang = lower.indexOf("--!>", lt + 4);
      if (dashes === -1 && bang === -1) break;
      i = (bang === -1 || (dashes !== -1 && dashes <= bang)) ? dashes + 3 : bang + 4;
      continue;
    }
    if (!startsTag(lower[lt + 1])) break;
    const gt = tagEnd(text, lt);
    if (gt === -1) break;
    if (lower[lt + 1] === "!" || lower[lt + 1] === "?") { i = gt + 1; continue; }
    const head14 = lower.slice(lt, Math.min(lt + 14, gt + 1));
    const endTag = (/^<\/([a-z]+)/.exec(head14) || [])[1];
    if (endTag) {
      // </body>, </html> and </br> start the body. </head> does NOT end the search: after
      // it a parser still puts base, link, meta, script, style, title and template into the
      // HEAD element until real body content starts, and every other end tag in the head is
      // a parse error that is ignored. Measured against parse5: without this, 2 660 of
      // 200 000 fuzz inputs lost a relation the head really carries.
      if (endTag === "body" || endTag === "html" || endTag === "br") break;
      if (endTag === "head") afterHead = true;
      i = gt + 1;
      continue;
    }
    const name = (/^<([a-z]+)(?=[\s/>]|$)/.exec(head14) || [])[1];
    if (!name) break;
    if (name === "html" || name === "head") { i = gt + 1; continue; }
    if (!(afterHead ? AFTER_HEAD_ELEMENTS : HEAD_ELEMENTS).includes(name)) break;   // <body> and the first body level element
    if (HEAD_SKIPPED_CONTENT.includes(name)) {
      const end = name === "template" ? templateEnd(lower, gt + 1)
        : name === "script" ? scriptEnd(lower, gt + 1)
        : rawTextEnd(lower, name, gt + 1);
      if (end === -1) break;
      i = end;
      continue;
    }
    out.push(text.slice(lt, gt + 1));
    i = gt + 1;
  }
  return out.join("");
}

// Tags are found by index and not by /<link\b[^>]*>/g, on purpose. That regex is
// quadratic on input the TARGET site controls: every "<link" with no ">" after it makes
// the character class scan to the end of the document, and "<link" repeated 16 000 times
// measured 196 ms where this loop measures under 1 ms. CodeQL reports the same shape as
// js/polynomial-redos (alerts #4 and #5 on the package repo, 2026-08-24). This scan
// visits every character once: from each "<" it reads to the next ">" and then continues
// after it, which is what the regex meant to say.
function* htmlTags(text) {
  const lower = text.toLowerCase();
  let i = 0;
  for (;;) {
    const open = lower.indexOf("<", i);
    if (open === -1) return;
    if (!startsTag(lower[open + 1])) { i = open + 1; continue; }
    const close = tagEnd(text, open);
    if (close === -1) return;
    yield text.slice(open, close + 1);
    i = close + 1;
  }
}

// v2 of the llms.txt proposal (August 2026) left the file format alone and added one
// thing: a page should say where its markdown version and its llms.txt are, using
// rel="alternate" type="text/markdown" and rel="describedby", as HTML link elements
// or as a Link response header. That is a property of the SITE, not of the file, so
// these two land in their own status, "info". They are reported, they are never a
// warn and never a fail, and the summary line and the CLI's --strict exit code stay
// exactly what they were. v2 is two weeks old, so a warn here would have turned files
// into "valid with warnings" for following the version of the format they were written
// against, which is a change to who passes rather than a new measurement (Tek-160).
// How common the relations are in the wild has not been measured, so nothing here
// claims it.
function findLinkRelations(html, linkHeader) {
  const found = { describedby: null, markdown: null };
  // Only the head, and only what a parser would put there: a commented-out link element
  // is not published, a link element inside a script or a template is not published, and
  // a link element the parser moves into the body is not what these two checks are about.
  // Counting any of them would report a relation the site does not serve, which is the one
  // thing a measurement may not do. See headOfDocument above for the shape by shape rules.
  // The 64 KB bound is a cap on work, not a rule: a head longer than that is not a head.
  const head = headOfDocument(html).slice(0, 65536);
  for (const tag of htmlTags(head)) {
    // The name has to END at "link": a real parser reads "<link<link" as ONE tag whose
    // NAME is "link<link", not as a link element, so \b would count a relation the site
    // does not publish. Measured against parse5, 2026-08-24.
    if (!/^<link(?=[\s/>])/i.test(tag)) continue;
    // The attribute name has to start the token. \b sits between the hyphen and the name,
    // so data-rel, data-type and data-href were read as the real attributes until
    // 2026-08-29, and a page could claim a relation it does not publish.
    const rel = ((tag.match(/(?:^|[\s/])rel\s*=\s*["']?([^"'>]+)/i) || [])[1] || "").toLowerCase().trim().split(/\s+/);
    const type = ((tag.match(/(?:^|[\s/])type\s*=\s*["']?([^"'>\s]+)/i) || [])[1] || "").toLowerCase();
    const href = ((tag.match(/(?:^|[\s/])href\s*=\s*"([^"]*)"|(?:^|[\s/])href\s*=\s*'([^']*)'|(?:^|[\s/])href\s*=\s*([^\s"'>]+)/i) || []).slice(1).find((x) => x !== undefined) || "").trim();
    // text/markdown, not anything that starts with it, and a relation without a target is
    // not a relation: both passed until 2026-08-29.
    const isMarkdown = type.split(";")[0].trim() === "text/markdown";
    if (!found.describedby && href && rel.includes("describedby")) found.describedby = href;
    if (!found.markdown && href && rel.includes("alternate") && isMarkdown) found.markdown = href;
  }
  for (const part of String(linkHeader || "").split(/,(?=\s*<)/)) {
    const lt = part.indexOf("<");
    const gt = lt === -1 ? -1 : part.indexOf(">", lt + 1);
    const href = (gt === -1 ? "" : part.slice(lt + 1, gt)).trim();
    const rel = ((part.match(/(?:^|[;\s])rel\s*=\s*"?([^";,]+)"?/i) || [])[1] || "").toLowerCase().trim().split(/\s+/);
    const type = ((part.match(/(?:^|[;\s])type\s*=\s*"?([^";,]+)"?/i) || [])[1] || "").toLowerCase().trim();
    const isMarkdownHeader = type.split(";")[0].trim() === "text/markdown";
    if (!found.describedby && href && rel.includes("describedby")) found.describedby = href;
    if (!found.markdown && href && rel.includes("alternate") && isMarkdownHeader) found.markdown = href;
  }
  return found;
}

function validateV2Discovery(found, unreadReason) {
  const checks = [];
  const add = (id, status, label, detail) => checks.push({ id, status, label, detail });
  if (!found) {
    add("v2-describedby", "info", "Home page points to its llms.txt (v2)", unreadReason);
    add("v2-markdown-alternate", "info", "Home page points to a markdown version (v2)", unreadReason);
    return checks;
  }
  add("v2-describedby", found.describedby ? "pass" : "info", "Home page points to its llms.txt (v2)",
    found.describedby ? 'rel="describedby" to ' + cut(found.describedby, 120) : 'no rel="describedby" in the head or the Link header; v2 recommends it so an agent finds the file without guessing');
  add("v2-markdown-alternate", found.markdown ? "pass" : "info", "Home page points to a markdown version (v2)",
    found.markdown ? 'rel="alternate" type="text/markdown" to ' + cut(found.markdown, 120) : 'no rel="alternate" type="text/markdown" in the head or the Link header; v2 recommends it so an agent finds the markdown form without guessing');
  return checks;
}

function summarizeChecks(checks) {
  if (checks.some((c) => c.status === "fail")) return "not valid";
  if (checks.some((c) => c.status === "warn")) return "valid with warnings";
  return "valid";
}

async function serveLlmsValidatorHtml(request, canonicalUrl) {
  const reqUrl = new URL(request.url);
  const raw = cut(reqUrl.searchParams.get("url") || "", 300);
  let result = null;
  let error = null;
  if (raw) {
    const host = normalizeHostInput(raw);
    if (!host || !isValidPublicHost(host)) {
      error = "That does not look like a public domain name. Enter a domain like example.com.";
    } else if (host === "turva.dev" || host === "www.turva.dev") {
      // A Worker cannot fetch its own zone, so the site's own llms.txt is
      // validated directly from the same constant that serves /llms.txt.
      const ownHome = serveHomeHtml("https://turva.dev/");
      const ownHtml = await ownHome.text();
      result = {
        target: "https://turva.dev/llms.txt",
        checks: validateLlmsTxt({
          status: 200,
          contentType: "text/plain; charset=utf-8",
          text: LLMS_TXT,
          bytes: new TextEncoder().encode(LLMS_TXT).length,
          truncated: false
        }).concat(validateV2Discovery(findLinkRelations(ownHtml, ownHome.headers.get("link") || "")))
      };
    } else {
      try {
        const fetched = await fetchLlmsTxt(host);
        let discovery;
        try {
          const home = await fetchLlmsTxt(host, "/", "text/html, */*;q=0.1");
          discovery = home.redirect
            ? validateV2Discovery(null, "the home page redirects away from this host, so this was not measured")
            : home.status !== 200
              ? validateV2Discovery(null, "the home page returned HTTP " + home.status + ", so this was not measured")
              : validateV2Discovery(findLinkRelations(home.text, home.linkHeader));
        } catch {
          discovery = validateV2Discovery(null, "the home page could not be read, so this was not measured");
        }
        result = { target: "https://" + host + "/llms.txt", checks: validateLlmsTxt(fetched).concat(discovery) };
      } catch (err) {
        error = "Could not fetch https://" + host + "/llms.txt: " + (err && err.name === "TimeoutError" ? "timed out after 8 seconds" : "network error") + ".";
      }
    }
  }
  if (wantsJson(request)) {
    const payload = error
      ? { error }
      : result
        ? { target: result.target, summary: summarizeChecks(result.checks), checks: result.checks }
        : { error: "add ?url=example.com", docs: canonicalUrl };
    const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*", "vary": "Accept" });
    appendAgentLinks(headers);
    applySecurityHeaders(headers, "agent-api");
    return new Response(JSON.stringify(payload, null, 2), { status: payload.error ? 400 : 200, headers });
  }
  const head = cardPageHead(buildMetaBlock("/llms-txt-validator", canonicalUrl), buildGuideJsonLd("/llms-txt-validator", canonicalUrl) + "\n" + buildGuidePageFaqJsonLd("/llms-txt-validator", canonicalUrl) + "\n" + buildValidatorAppJsonLd(canonicalUrl), canonicalUrl);
  const mark = { pass: "\u2713", warn: "!", fail: "\u2717", info: "i" };
  let resultHtml = "";
  if (error) {
    resultHtml = `<div class="scard"><h2>Result</h2><p class="verr">${escapeHtml(error)}</p></div>`;
  } else if (result) {
    const rows = result.checks.map((c) =>
      `<div class="chk ${c.status}"><span class="s">${mark[c.status]}</span><span class="l">${escapeHtml(c.label)}</span><span class="d">${escapeHtml(c.detail)}</span></div>`
    ).join("\n    ");
    resultHtml = `<div class="scard"><h2>Result: ${escapeHtml(summarizeChecks(result.checks))}</h2>
    <p class="aview-cmd">${escapeHtml(result.target)}</p>
    ${rows}
    <p class="note">A structure check against the llms.txt format, not an agent-readiness score.</p>
  </div>`;
  }
  const body = `${head}
${cardPageNav("/llms-txt-validator")}
<main id="main">
  ${mdPageStart("/llms-txt-validator")}
  <div class="scard">
    <form class="vform" method="get" action="/llms-txt-validator">
      <input type="text" name="url" placeholder="example.com" value="${escapeHtml(raw)}" aria-label="Domain to check" required>
      <button type="submit">Check</button>
    </form>
  </div>
  ${resultHtml}
  <div class="scard"><h2>How to use it</h2><ul>
    <li>In a browser: enter a domain in the field above.</li>
    <li>Without typing anything: <a href="/llms-txt-validator?url=turva.dev">run the checks against this site's own file</a>.</li>
    <li>As an agent: <code>GET https://turva.dev/llms-txt-validator?url=example.com</code> with <code>Accept: application/json</code>.</li>
  </ul></div>
  ${mdCard("/llms-txt-validator", "What it checks")}
  ${mdCard("/llms-txt-validator", "What it does not do")}
  ${mdFaqCard("/llms-txt-validator", "Frequently asked")}
</main>
${footerHtml()}
</body>
</html>`;
  const headers = cardPageHeaders(canonicalUrl);
  if (raw) headers.set("cache-control", "no-store");
  return new Response(body, { status: 200, headers });
}

function serveGuidesHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/guides", canonicalUrl), buildGuideJsonLd("/guides", canonicalUrl) + "\n" + buildGuidesFaqJsonLd(), canonicalUrl);
  const body = `${head}
${cardPageNav("/guides")}
<main id="main">
  ${mdPageStart("/guides")}
  ${mdLinksCard("/guides", "Discovery and content")}
  ${mdLinksCard("/guides", "Capability and trust")}
  ${mdLinksCard("/guides", "Commerce and strategy")}
  ${mdFaqCard("/guides", "Frequently asked")}
  ${mdFaqTailHtml("/guides", "Frequently asked")}
</main>
${footerHtml()}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

function blogPostLinks() {
  const posts = Object.keys(PAGE_MARKDOWN)
    .filter((k) => k.startsWith("/blog/"))
    .map((k) => ({ path: k, meta: META_BY_PATH[k] || {} }))
    .filter((p) => p.meta.date)
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date));
  return posts.map(({ path, meta }) =>
    `  <a class="post" href="${path}"><span class="pt">${escapeHtml((meta.title || "").replace(/ [|\u00B7] turva\.dev$/, ""))}</span><span class="pd">${meta.date}</span></a>`
  ).join("\n");
}

function serveBlogHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/blog", canonicalUrl), buildGuideJsonLd("/blog", canonicalUrl), canonicalUrl);
  const body = `${head}
${cardPageNav("/blog")}
<main id="main">
  ${mdPageStart("/blog")}
  <p class="feed"><a href="/blog/feed.xml">RSS feed</a></p>
  ${mdLinksCard("/blog", "Start here")}
  <h2>All posts</h2>
${blogPostLinks()}
</main>
${footerHtml()}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

var X402_ROUTES = {
  "/api/agent/audit": {
    label: "Audit",
    description: "turva.dev: Agent-readiness audit (fixed scope, two weeks)",
    amountUsdcMicro: "4904000000",
    amountEurCents: 430000
  },
  "/api/agent/advisory": {
    label: "Advisory",
    description: "turva.dev: Continuous advisory (monthly, min 3 months)",
    amountUsdcMicro: "3421000000",
    amountEurCents: 300000
  },
  "/api/agent/implementation": {
    label: "Implementation",
    description: "turva.dev: Implementation day (scoped per task)",
    amountUsdcMicro: "1711000000",
    amountEurCents: 150000
  }
};

var ACP_SERVICES = {
  shopify: { item: "shopify", name: "Shopify agent storefront check", amount: 99900, description: "Fixed scope, four written deliverables within 48 hours of the agreed written kickoff and a retest within 14 days. One live Shopify store across browser WebMCP, remote MCP and Agentic channels." },
  audit: { item: "audit", name: "Agent-readiness audit", amount: 430000, description: "Fixed scope, two weeks. Independent scanner sweep, manual review, written report with prioritized fixes." },
  advisory: { item: "advisory", name: "Continuous advisory", amount: 300000, description: "Monthly re-scan, score delta report, written review, roadmap input. Minimum three months." },
  implementation: { item: "implementation", name: "Implementation day", amount: 150000, description: "Hands-on work at your edge, scoped per task." }
};

function buildAcpCheckoutSession(serviceId, sessionId) {
  const svc = ACP_SERVICES[serviceId] || ACP_SERVICES.audit;
  return {
    "id": sessionId,
    "status": "not_ready_for_payment",
    "currency": "eur",
    "line_items": [{
      "id": "line_item_" + svc.item,
      "item": { "id": svc.item, "quantity": 1 },
      "base_amount": svc.amount,
      "discount": 0,
      "subtotal": svc.amount,
      "tax": 0,
      "total": svc.amount,
      "name": svc.name,
      "description": svc.description
    }],
    "fulfillment_options": [{
      "type": "digital",
      "id": "fulfillment_digital",
      "title": "Async written delivery",
      "description": "Delivered in writing. No calls, no calendar links.",
      "totals": [{ "type": "total", "display_text": "Delivery", "amount": 0 }]
    }],
    "selected_fulfillment_options": [{ "type": "digital", "option_id": "fulfillment_digital", "item_ids": [svc.item] }],
    "totals": [
      { "type": "items_base_amount", "display_text": "Item(s) total", "amount": svc.amount },
      { "type": "subtotal", "display_text": "Subtotal", "amount": svc.amount },
      { "type": "tax", "display_text": "VAT (added on invoice)", "amount": 0 },
      { "type": "total", "display_text": "Total (excl. VAT)", "amount": svc.amount }
    ],
    "messages": [{
      "type": "info",
      "resolution": "requires_buyer_review",
      "content_type": "plain",
      "content": "This engagement is scoped and confirmed in writing before payment. turva confirms scope and a fixed quote within one business day. Engagement is async only, with no calls and no calendar links. Agent-initiated instant payment is not available."
    }, {
      "type": "info",
      "content_type": "plain",
      "content": "Sessions are stateless. The id encodes the service and nothing is stored, so every request rebuilds the session from its id. A cancellation applies to the response that reports it and does not change what a later GET on the same id returns."
    }],
    "links": [
      { "type": "terms_of_use", "url": "https://turva.dev/legal" },
      { "type": "privacy_policy", "url": "https://turva.dev/legal" }
    ]
  };
}

function acpHeaders(allow) {
  const h = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "api-version": "2026-01-16"
  });
  // RFC 9110 15.5.6 makes Allow a MUST on 405, and neither api-version nor allow is a
  // CORS-safelisted response header, so a browser agent reading this surface cross-origin
  // cannot see either unless it is exposed. a2aJson set allow and exposed nothing, so its
  // 405 had the same gap; both are fixed together.
  if (allow) h.set("allow", allow);
  h.set("access-control-expose-headers", "api-version" + (allow ? ", allow" : ""));
  appendAgentLinks(h);
  applySecurityHeaders(h, "agent-api");
  return h;
}

// The ACP discovery document declares https://turva.dev/api/acp as api_base_url.
// A declared base that answers with the site HTML 404 is a declared surface that does
// not resolve, so the base returns a small JSON index naming the one resource that
// lives under it. Same treatment /api and /api/v1 already have. It is discovery only:
// settlement stays quote-on-request and nothing here asserts a payment.
var ACP_INDEX_JSON = JSON.stringify({
  "service": "turva.dev",
  "protocol": "acp",
  "api_version": "2026-01-16",
  "description": "Agentic Commerce Protocol base for turva.dev. Checkout sessions are created and read under this base. Settlement is quote-on-request: completion returns intervention_required and no agent-initiated instant payment is available.",
  "discovery": "https://turva.dev/.well-known/acp",
  "items": ["shopify", "audit", "advisory", "implementation"],
  "endpoints": {
    "create_checkout_session": { "method": "POST", "url": "https://turva.dev/api/acp/checkout_sessions" },
    "retrieve_checkout_session": { "method": "GET", "url": "https://turva.dev/api/acp/checkout_sessions/{checkout_session_id}" },
    "cancel_checkout_session": { "method": "POST", "url": "https://turva.dev/api/acp/checkout_sessions/{checkout_session_id}/cancel" },
    "complete_checkout_session": { "method": "POST", "url": "https://turva.dev/api/acp/checkout_sessions/{checkout_session_id}/complete" }
  },
  "contact": "info@turva.dev"
}, null, 2);

function serveAcpIndex() {
  return new Response(ACP_INDEX_JSON, { status: 200, headers: acpHeaders() });
}

async function serveAcpCheckout(request, pathLower) {
  const method = request.method;
  const base = "/api/acp/checkout_sessions";
  if (pathLower === base) {
    if (method !== "POST") {
      return new Response(JSON.stringify({ "type": "invalid_request", "code": "method_not_allowed", "message": "Use POST to create a checkout session." }, null, 2), { status: 405, headers: acpHeaders("POST, OPTIONS") });
    }
    let reqBody = {};
    try { reqBody = await request.json(); } catch (e) { reqBody = {}; }
    let serviceId = "audit";
    // Coercing an arbitrary JSON value with String() let a deeply nested array recurse
    // through Array.prototype.join and throw RangeError, which nothing here catches, so
    // the endpoint answered 500 to a body of a few kB. Same defect as the A2A skillId
    // path, fixed there on 2026-08-01 and missed in this copy twelve hundred lines away.
    //
    // Absent and present-but-not-a-string are NOT the same case here, and conflating them
    // is worse than the crash: the default is a priced service, so a guard that only
    // overwrites turns {"items":[{"id":1}]} into a paid audit session instead of the
    // 400 it used to return. An id that is present must be a string or the request is
    // invalid; only an absent id keeps the default.
    const rawItemId = reqBody && Array.isArray(reqBody.items) && reqBody.items[0]
      ? reqBody.items[0].id
      : undefined;
    if (rawItemId !== undefined && rawItemId !== null) {
      serviceId = typeof rawItemId === "string" ? rawItemId.toLowerCase() : "";
    }
    if (!["audit", "advisory", "implementation", "shopify"].includes(serviceId)) {
      return new Response(JSON.stringify({ "type": "invalid_request", "code": "invalid_item", "message": "Unknown item id. Valid item ids: audit, advisory, implementation, shopify." }, null, 2), { status: 400, headers: acpHeaders() });
    }
    const session = buildAcpCheckoutSession(serviceId, "acp_sess_" + serviceId + "_" + crypto.randomUUID());
    return new Response(JSON.stringify(session, null, 2), { status: 201, headers: acpHeaders() });
  }
  const rest = pathLower.slice(base.length + 1);
  const parts = rest.split("/").filter((s) => s !== "");
  const sessionId = parts[0] || "";
  const action = parts[1] || "";
  if (!sessionId || parts.length > 2 || (action && action !== "cancel" && action !== "complete")) {
    return new Response(JSON.stringify({ "type": "invalid_request", "code": "not_found", "message": "Unknown checkout session route." }, null, 2), { status: 404, headers: acpHeaders() });
  }
  const idMatch = sessionId.match(/^acp_sess_(audit|advisory|implementation|shopify)_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  if (!idMatch) {
    return new Response(JSON.stringify({ "type": "invalid_request", "code": "not_found", "message": "Unknown checkout session id. Sessions are stateless: create one with POST " + base + " and reuse the id it returns, which encodes the service." }, null, 2), { status: 404, headers: acpHeaders() });
  }
  const sessionService = idMatch[1];
  if (!action) {
    if (method !== "GET") {
      return new Response(JSON.stringify({ "type": "invalid_request", "code": "method_not_allowed", "message": "Use GET to retrieve a checkout session." }, null, 2), { status: 405, headers: acpHeaders("GET, OPTIONS") });
    }
    const session = buildAcpCheckoutSession(sessionService, sessionId);
    return new Response(JSON.stringify(session, null, 2), { status: 200, headers: acpHeaders() });
  }
  if (action === "cancel") {
    if (method !== "POST") {
      return new Response(JSON.stringify({ "type": "invalid_request", "code": "method_not_allowed", "message": "Use POST to cancel a checkout session." }, null, 2), { status: 405, headers: acpHeaders("POST, OPTIONS") });
    }
    const session = buildAcpCheckoutSession(sessionService, sessionId);
    session.status = "canceled";
    session.messages = [
      { "type": "info", "content_type": "plain", "content": "Checkout session has been canceled." },
      { "type": "info", "content_type": "plain", "content": "Sessions are stateless. Nothing is stored, so this cancellation applies to this response only, and a later GET on the same id returns a session in not_ready_for_payment rather than this one." }
    ];
    return new Response(JSON.stringify(session, null, 2), { status: 200, headers: acpHeaders() });
  }
  if (action === "complete") {
    if (method !== "POST") {
      return new Response(JSON.stringify({ "type": "invalid_request", "code": "method_not_allowed", "message": "Use POST to complete a checkout session." }, null, 2), { status: 405, headers: acpHeaders("POST, OPTIONS") });
    }
    return new Response(JSON.stringify({ "type": "processing_error", "code": "intervention_required", "message": "This engagement is confirmed in writing before payment. turva confirms scope and a fixed quote within one business day, then invoices directly. Agent-initiated instant completion is not available. Contact info@turva.dev.", "param": "$.payment_data" }, null, 2), { status: 422, headers: acpHeaders() });
  }
  return new Response(JSON.stringify({ "type": "invalid_request", "code": "not_found", "message": "Unknown checkout session route." }, null, 2), { status: 404, headers: acpHeaders() });
}

function serveOauthClosed(kind) {
  // turva.dev publishes OAuth Authorization Server metadata so an agent can
  // discover scopes and the registration entry point. It runs no interactive
  // login and issues no tokens automatically, because nothing on the site sits
  // behind a token. These endpoints therefore answer with a spec-valid error
  // that points to the out-of-band agent-auth flow, instead of a 404, so the
  // discovery document never advertises a path that does not respond.
  var error = kind === "authorize" ? "access_denied" : "invalid_request";
  var body = JSON.stringify({
    error: error,
    error_description: "turva.dev does not run an interactive OAuth login or issue tokens automatically. Agent access is arranged out of band. Register at https://turva.dev/agent/auth/register, read https://turva.dev/auth.md, or contact info@turva.dev.",
    registration_endpoint: "https://turva.dev/agent/auth/register",
    service_documentation: "https://turva.dev/auth.md"
  }, null, 2);
  var headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "agent-api");
  return new Response(body, { status: 400, headers });
}

function serve402(pathname, route) {
  const resource = "https://turva.dev" + pathname;
  const body = build402Body(resource, route.label, route.amountUsdcMicro, route.amountEurCents, route.description);
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-expose-headers": "PAYMENT-REQUIRED, x-payment-required, accept-payment",
    "accept-payment": "x402; network=eip155:8453; asset=USDC",
    "x-payment-required": "x402; network=eip155:8453; asset=USDC; amount=" + route.amountUsdcMicro
  });
  headers.set("PAYMENT-REQUIRED", btoa(body));
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "agent-api");
  return new Response(body, { status: 402, headers });
}

function serveX402Root() {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-expose-headers": "PAYMENT-REQUIRED, x-payment-required, accept-payment",
    "accept-payment": "x402; network=eip155:8453; asset=USDC",
    "x-payment-required": "x402; network=eip155:8453; asset=USDC; amount=1000"
  });
  headers.set("PAYMENT-REQUIRED", btoa(X402_INDEX_402));
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "agent-api");
  return new Response(X402_INDEX_402, { status: 402, headers });
}

var worker_default = {
  async fetch(request, env) {
    const originalMethod = request.method;
    const isHead = originalMethod === "HEAD";
    let workingRequest = request;
    if (isHead) {
      workingRequest = new Request(request.url, {
        method: "GET",
        headers: request.headers,
        redirect: "manual"
      });
    }
    try {
      // Enforce the declared RateLimit policy: 100 requests per 60 seconds per
      // client IP, per Cloudflare location. applySecurityHeaders promises this
      // limit on every response, and an advertised limit that no code enforces
      // would be exactly the kind of declared-but-unresolved surface this site
      // audits for. Fail open: if the binding is missing or errors, the request
      // is served normally.
      if (env && env.RATE_LIMITER) {
        try {
          const rlKey = request.headers.get("CF-Connecting-IP") || "no-ip";
          const { success } = await env.RATE_LIMITER.limit({ key: rlKey });
          if (!success) {
            const rlHeaders = new Headers({ "content-type": "text/plain; charset=utf-8" });
            // A rate-limited agent surface must describe itself the way an accepted request does.
            // Answering every 429 with the HTML policy stripped the CORS header from agent routes,
            // so a cross-origin agent saw a different policy under load than it saw normally. Same
            // defect that was fixed in turva-mcp for /mcp in v3.75.0 (2026-08-01).
            const rlPath = new URL(request.url).pathname.toLowerCase();
            // /llms-txt-validator is one path with two policies: the JSON branch is an agent
            // API that sets CORS deliberately, the HTML branch is a page. A path regex cannot
            // tell them apart, so the accepted request decides, which is what this comment asks.
            const rlAgent = AGENT_API_PATH_RE.test(rlPath)
              || (rlPath === "/llms-txt-validator" && wantsJson(request));
            applySecurityHeaders(rlHeaders, rlAgent ? "agent-api" : "default");
            if (rlAgent) rlHeaders.set("access-control-allow-origin", "*");
            rlHeaders.set("Retry-After", "60");
            const rlResponse = new Response("429 Too Many Requests. This site enforces its declared rate limit of 100 requests per 60 seconds per client IP. Retry after 60 seconds.\n", { status: 429, headers: rlHeaders });
            return isHead ? stripBody(rlResponse) : rlResponse;
          }
        } catch (rlErr) {
          console.error("Rate limiter error (failing open):", rlErr && rlErr.stack ? rlErr.stack : String(rlErr));
        }
      }
      const response = await handleRequest(workingRequest, env);
      return isHead ? stripBody(response) : response;
    } catch (err) {
      console.error("Worker error:", err && err.stack ? err.stack : String(err));
      const errHeaders = new Headers({ "content-type": "text/plain; charset=utf-8" });
      applySecurityHeaders(errHeaders, "default");
      const errResponse = new Response("Internal Server Error", { status: 500, headers: errHeaders });
      return isHead ? stripBody(errResponse) : errResponse;
    }
  },
  async scheduled(event, env, ctx) {
    try {
      const urlList = Array.from(CANONICAL_PATHS).map((p) =>
        p === "/" ? "https://turva.dev/" : "https://turva.dev" + p
      );
      const body = JSON.stringify({
        host: "turva.dev",
        key: INDEXNOW_KEY,
        keyLocation: "https://turva.dev/" + INDEXNOW_KEY + ".txt",
        urlList
      });
      ctx.waitUntil(
        fetch("https://api.indexnow.org/indexnow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        }).then(async (res) => {
          if (res.ok) {
            console.log("IndexNow submit accepted:", res.status, urlList.length, "urls");
            return;
          }
          const detail = await res.text().catch(() => "");
          console.error("IndexNow submit rejected:", res.status, detail.slice(0, 300));
        }).catch((err) => {
          console.error("IndexNow submit failed:", err && err.stack ? err.stack : String(err));
        })
      );
    } catch (err) {
      console.error("IndexNow scheduled error:", err && err.stack ? err.stack : String(err));
    }
  }
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;
  const pathLower = pathname.toLowerCase();

  if (hostname === "mta-sts.turva.dev") {
    if (pathLower === "/.well-known/mta-sts.txt") return serveMtaStsPolicy();
    return Response.redirect("https://turva.dev/", 301);
  }

  // WKD advanced method, Tek-288. Its URLs live on their own host and repeat the
  // domain inside the path, and a client that finds them never needs the fallback
  // to the direct method. The bytes are the same key from the same constant, so
  // the two methods cannot drift apart. Both stay published on purpose: a client
  // that never asks the advanced host still finds the direct one.
  if (hostname === "openpgpkey.turva.dev") {
    if (pathLower === "/.well-known/openpgpkey/turva.dev/hu/" + PGP_WKD_HASH) {
      return serveStatic(getPgpKeyBytes(), "application/octet-stream", "agent-api");
    }
    if (pathLower === "/.well-known/openpgpkey/turva.dev/policy") {
      return serveStatic("", "text/plain; charset=utf-8", "agent-api");
    }
    return Response.redirect("https://turva.dev/", 301);
  }

  if (hostname === "www.turva.dev") {
    return Response.redirect("https://turva.dev" + pathname + url.search, 301);
  }

  // CORS preflight answers only on the apex, after the host redirects above, so the
  // promise that mta-sts, openpgpkey and www send everything else to turva.dev holds
  // for OPTIONS too (round 13 R1g-3: the preflight used to run before the host checks).
  // Round 15 P4-2: the preflight used to answer only /x402, /api/* and /agent/auth/*, so
  // OPTIONS on /api itself, /openapi.json, /llms.txt and every /.well-known/ manifest fell
  // through to the GET handler and returned the body with no preflight headers. Every
  // agent-api JSON and text surface now answers 204. The fediverse aliases stay out because
  // they redirect to social.turva.dev, and /v1/message:send keeps its own POST-only preflight.
  const fediPath = pathLower === "/.well-known/host-meta" || pathLower === "/.well-known/webfinger" || pathLower === "/.well-known/nodeinfo";
  const preflightPath = pathLower === "/x402" || pathLower === "/x402/" || pathLower === "/api" || pathLower.startsWith("/api/") || pathLower.startsWith("/agent/auth/") || pathLower === "/oauth/authorize" || pathLower === "/oauth/token" || pathLower === "/openapi.json" || pathLower === "/llms.txt" || pathLower === "/llms-full.txt" || pathLower === "/auth.md" || pathLower === "/robots.txt" || pathLower === "/sitemap.xml" || (pathLower.startsWith("/.well-known/") && !fediPath);
  // METHOD GATE, round 16 (S1-1 to S1-4, C1-2, C5-20, C7-2, measured 2026-09-03). GET and
  // OPTIONS are allowed everywhere; HEAD arrives here as GET (worker_default). POST is
  // allowed only where a handler or the OpenAPI document knows it: the A2A transport, the
  // x402 challenge roots and payable routes, the agent-auth instruction documents and the
  // two OAuth endpoints. The ACP checkout family keeps its own per-path 405 logic. Every
  // other method on every other path answers 405 with an Allow header instead of the GET
  // body, and the preflight advertises the same set it will honour.
  const acpFamily = pathLower === "/api/acp/checkout_sessions" || pathLower.startsWith("/api/acp/checkout_sessions/");
  const postAllowed = pathLower === "/v1/message:send" || pathLower === "/v1/message:send/"
    || pathLower === "/api" || pathLower === "/api/" || pathLower === "/x402" || pathLower === "/x402/"
    || !!X402_ROUTES[pathLower] || !!X402_ROUTES[pathLower.replace(/\/$/, "")]
    || pathLower.startsWith("/agent/auth/") || pathLower === "/oauth/authorize" || pathLower === "/oauth/token";
  if (!acpFamily && request.method !== "GET" && request.method !== "OPTIONS" && !(request.method === "POST" && postAllowed)) {
    return serve405(postAllowed ? "GET, HEAD, POST, OPTIONS" : "GET, HEAD, OPTIONS", pathLower);
  }
  if (request.method === "OPTIONS" && preflightPath && pathLower !== "/v1/message:send" && pathLower !== "/v1/message:send/") {
    const headers = new Headers({
      "access-control-allow-origin": "*",
      "access-control-allow-methods": (acpFamily || postAllowed) ? "GET, POST, OPTIONS" : "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type, Accept, X-PAYMENT",
      "access-control-max-age": "86400"
    });
    applySecurityHeaders(headers, "agent-api");
    return new Response(null, { status: 204, headers });
  }
  if (request.method === "OPTIONS" && pathLower !== "/v1/message:send" && pathLower !== "/v1/message:send/" && !fediPath && !LEGACY_REDIRECTS[pathname]) {
    // A page or an unknown path: answer the method question and nothing else. Until v3.115.0
    // OPTIONS / fell through to serveHomeHtml and returned the whole page. The fediverse
    // aliases and the legacy paths keep redirecting on OPTIONS, as they do on GET.
    const headers = new Headers({ "allow": "GET, HEAD, OPTIONS" });
    applySecurityHeaders(headers, "default");
    return new Response(null, { status: 204, headers });
  }

  if (pathLower === "/.well-known/host-meta" || pathLower === "/.well-known/webfinger" || pathLower === "/.well-known/nodeinfo") {
    return Response.redirect("https://social.turva.dev" + pathname + url.search, 301);
  }
  if (pathLower === "/x402") {
    return serveX402Root();
  }
  if (pathLower === "/api/acp" || pathLower === "/api/acp/") {
    return serveAcpIndex();
  }
  if (pathLower === "/api/acp/checkout_sessions" || pathLower.startsWith("/api/acp/checkout_sessions/")) {
    return serveAcpCheckout(request, pathLower);
  }

  if (pathLower === "/agent/auth/register") {
    return serveStatic(buildAgentAuthInstruction("registration"), "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/agent/auth/claim") {
    return serveStatic(buildAgentAuthInstruction("claim"), "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/agent/auth/revoke" || pathLower === "/agent/auth/revocation") {
    return serveStatic(buildAgentAuthInstruction("revocation"), "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/oauth/authorize") {
    return serveOauthClosed("authorize");
  }
  if (pathLower === "/oauth/token") {
    return serveOauthClosed("token");
  }

  if (X402_ROUTES[pathLower]) {
    const route = X402_ROUTES[pathLower];
    // x402 settlement is not wired up: this is a quote-on-request service with
    // no facilitator or on-chain settlement, so an X-PAYMENT header cannot be
    // verified here. We must never report an unverified payment as paid, so every
    // request to a payable route returns the 402 challenge until real facilitator
    // verification exists, whether or not an X-PAYMENT header is present.
    return serve402(pathLower, route);
  }

  if (LEGACY_REDIRECTS[pathname]) {
    return Response.redirect("https://turva.dev" + LEGACY_REDIRECTS[pathname] + url.search, 301);
  }

  // A trailing slash is how crawlers, agents and hand-written links commonly
  // address a page. Every page this site serves has a PAGE_MARKDOWN entry, so
  // the canonical slashless URL is derived from the twin rather than from a
  // hand-maintained list: a new page is covered the day it is added. Only a
  // path that is actually served redirects, so an unknown path still returns
  // an honest 404, and the agent-API paths (/api, /api/v1) have no
  // PAGE_MARKDOWN entry and fall through to their own handlers untouched.
  //
  // The payable x402 paths are the exception to that last clause. They have no
  // PAGE_MARKDOWN entry either, so before this they fell all the way through to the
  // HTML 404 while X402_MANIFEST lists them as payable resources: an agent that
  // normalises a URL with a trailing slash got a web page where the manifest
  // promised a 402 challenge.
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const strippedPath = pathname.slice(0, -1);
    if (PAGE_MARKDOWN[strippedPath]) {
      return Response.redirect("https://turva.dev" + strippedPath + url.search, 301);
    }
    const strippedLower = strippedPath.toLowerCase();
    if (X402_ROUTES[strippedLower] || strippedLower === "/x402") {
      return Response.redirect("https://turva.dev" + strippedLower + url.search, 301);
    }
  }

  // Hashnode's headless publication sends every post to its Base URL, which is
  // /blog. A guide cross-posted there lands on /blog/<slug>, a path this site does
  // not serve, so send it on to the guide with the same slug. A real blog post has
  // a PAGE_MARKDOWN entry and never enters this branch, so /blog/open-knowledge-format
  // keeps serving the blog post and does not redirect to the guide of the same slug.
  if (pathname.startsWith("/blog/") && !PAGE_MARKDOWN[pathname]) {
    const guidePath = "/guides/" + pathname.slice(6).replace(/\/$/, "");
    if (PAGE_MARKDOWN[guidePath]) {
      return Response.redirect("https://turva.dev" + guidePath + url.search, 301);
    }
  }

  // The markdown twin at its own address. Same string the Accept: text/markdown path
  // serves, so the two forms cannot drift apart, and serveMarkdown carries the
  // canonical link back to the HTML page so the .md URL is an alternate and not a
  // second page. /auth.md and the skill.md files have no PAGE_MARKDOWN entry and fall
  // through to their own handlers untouched.
  // BRIEF, Tek-269. Ennen .md-kasittelya, jotta /brief/<id>.md ei koskaan kulje
  // PAGE_MARKDOWN-logiikan lapi. briefRoute palauttaa null jokaiselle muulle polulle.
  // Loppuvalimerkin siivous ajetaan ENNEN briefRoutea, koska briefRoute palauttaa
  // pisteelliselle polulle nullin ja polku putoaisi muuten 404:aan. Ks. Tek-323.
  var briefSiivous = briefSiivousKohde(pathname);
  if (briefSiivous) {
    return new Response(null, { status: 301, headers: {
      Location: "https://turva.dev" + briefSiivous + url.search,
      "X-Robots-Tag": "noindex, nofollow"
    } });
  }

  var briefR = briefRoute(pathname);
  if (briefR) return serveBrief(briefR, pathname, env, request);

  if (pathname.endsWith(".md")) {
    if (pathname === "/index.md" || pathname === "/index.html.md") {
      return serveMarkdown(HOME_MARKDOWN, "https://turva.dev/");
    }
    // v2 allows the appended form and the extension-replaced form both. These
    // pages carry no extension, so ".html.md" is literally neither, but an agent
    // that assumes .html will build it and the guide on this site says v2 accepts
    // both forms. Answering it costs one line and keeps that sentence from
    // reading as a promise this site does not keep.
    const mdBase = pathname.endsWith(".html.md") ? pathname.slice(0, -8) : pathname.slice(0, -3);
    if (PAGE_MARKDOWN[mdBase]) {
      return serveMarkdown(PAGE_MARKDOWN[mdBase], getCanonicalForPath(mdBase) || "https://turva.dev" + mdBase);
    }
  }

  if (wantsJson(request) && pathname === "/") {
    const resp = serveStatic(HOME_JSON, "application/json; charset=utf-8", "agent-api");
    resp.headers.append("vary", "Accept");
    return resp;
  }

  if (wantsMarkdown(request) && pathname === "/") {
    return serveMarkdown(HOME_MARKDOWN, "https://turva.dev/");
  }

  if (wantsMarkdown(request) && PAGE_MARKDOWN[pathname]) {
    const canonicalUrl = getCanonicalForPath(pathname) || "https://turva.dev" + pathname;
    return serveMarkdown(PAGE_MARKDOWN[pathname], canonicalUrl);
  }

  // Worker-rendered HTML pages. Every page is rendered directly by the worker:
  // home, services, company, contact, legal, badge, the llms.txt validator,
  // the guides and blog indexes, and the guide and blog pages themselves.
  if (pathname === "/") {
    return serveHomeHtml("https://turva.dev/");
  }
  if (pathname === "/services") {
    return serveServicesHtml("https://turva.dev/services");
  }
  if (pathname === "/shopify-agent-storefront-check") {
    return serveShopifyHtml("https://turva.dev/shopify-agent-storefront-check");
  }
  if (pathname === "/company") {
    return serveCompanyHtml("https://turva.dev/company");
  }
  if (pathname === "/contact") {
    return serveContactHtml("https://turva.dev/contact");
  }
  if (pathname === "/legal") {
    return serveLegalHtml("https://turva.dev/legal");
  }
  if (pathname === "/guides") {
    return serveGuidesHtml("https://turva.dev/guides");
  }
  if (pathname === "/blog") {
    return serveBlogHtml("https://turva.dev/blog");
  }
  if (pathname === "/badge") {
    return serveBadgeHtml("https://turva.dev/badge");
  }
  if (pathname === "/llms-txt-validator") {
    return serveLlmsValidatorHtml(request, "https://turva.dev/llms-txt-validator");
  }
  if (pathname === "/tools") {
    return serveToolsHtml("https://turva.dev/tools");
  }
  if ((pathname.startsWith("/guides/") || pathname.startsWith("/blog/") || pathname.startsWith("/samples/")) && PAGE_MARKDOWN[pathname]) {
    return serveGuideHtml(pathname, "https://turva.dev" + pathname);
  }

  if (pathLower === "/auth.md") {
    return serveStatic(AUTH_MD, "text/markdown; charset=utf-8", "agent-api");
  }

  if (pathname === "/" + INDEXNOW_KEY + ".txt") {
    return serveStatic(INDEXNOW_KEY, "text/plain; charset=utf-8", "agent-api");
  }
  if (pathLower === "/robots.txt") return serveStatic(ROBOTS_TXT, "text/plain; charset=utf-8", "agent-api");
  if (pathLower === "/.well-known/api-catalog" || pathLower === "/api-catalog") {
    return serveStatic(API_CATALOG, "application/linkset+json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/openapi.json" || pathLower === "/.well-known/openapi.json") {
    return serveStatic(OPENAPI_SPEC, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/mcp/server-card.json" || pathLower === "/.well-known/mcp.json") {
    return serveStatic(MCP_SERVER_CARD, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/ard.json") {
    return serveStatic(ARD_MANIFEST, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/ai-catalog.json" || pathLower === "/.well-known/ai-catalog") {
    return serveStatic(AI_CATALOG, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/agent.json" || pathLower === "/.well-known/ai-plugin.json") {
    return serveStatic(AGENT_JSON, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/api" || pathLower === "/api/") {
    return serve402("/api", { label: "API", amountUsdcMicro: "1000", amountEurCents: 0, description: "turva.dev agent API, payable via x402 on Base (USDC). Free discovery stays open at /openapi.json, /.well-known/* and /api/v1. Paid services: /api/agent/audit, /api/agent/advisory, /api/agent/implementation." });
  }
  if (pathLower === "/v1/message:send/") {
    return Response.redirect(new URL("/v1/message:send", request.url).toString(), 301);
  }
  if (pathLower === "/v1/message:send") {
    if (request.method === "OPTIONS") {
      // /v1 was the one agent-API surface the preflight branch below did not cover, so a
      // browser-based agent could not send the application/json POST this endpoint requires.
      return new Response(null, { status: 204, headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "Content-Type",
        "access-control-max-age": "86400"
      } });
    }
    return serveA2AMessageSend(request);
  }
  if (pathLower === "/v1" || pathLower.startsWith("/v1/")) {
    // An honest error on the A2A surface names what this transport implements, rather than
    // falling through to the HTML 404 the card's reader would have to parse. /v1/card is
    // deliberately NOT served: it is the authenticated extended card, this card declares no
    // supportsAuthenticatedExtendedCard, and the public card is at /.well-known/agent-card.json.
    return a2aError(-32601, "method not found on the A2A HTTP+JSON transport", {
      supported: ["POST /v1/message:send"],
      agentCard: "https://turva.dev/.well-known/agent-card.json"
    }, 404);
  }
  if (pathLower === "/api/v1" || pathLower === "/api/v1/") {
    return serveStatic(API_INDEX_JSON, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/jwks.json") {
    return serveStatic(JWKS_JSON, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/signatures.json") {
    return serveStatic(SIGNATURES_JSON, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/oauth-authorization-server" || pathLower === "/.well-known/openid-configuration") {
    return serveStatic(OAUTH_DISCOVERY, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/oauth-protected-resource") {
    return serveStatic(OAUTH_PROTECTED_RESOURCE, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/ap2" || pathLower === "/.well-known/ap2.json") {
    return serveStatic(AP2_MANIFEST, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/acp" ||
      pathLower === "/.well-known/acp.json" ||
      pathLower === "/.well-known/acp/config.json" ||
      pathLower === "/.well-known/acp/manifest.json") {
    return serveStatic(ACP_MANIFEST, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/agent-card.json" ||
      pathLower === "/.well-known/a2a/agent-card.json") {
    return serveStatic(A2A_AGENT_CARD, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/x402" || pathLower === "/.well-known/x402.json") {
    return serveStatic(X402_MANIFEST, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/mpp" || pathLower === "/.well-known/mpp.json") {
    return serveStatic(MPP_MANIFEST, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/ucp" || pathLower === "/.well-known/ucp.json") {
    return serveStatic(UCP_PROFILE, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/agent-skills/index.json") {
    const body = await buildSkillsIndex();
    return serveStatic(body, "application/json; charset=utf-8", "agent-api");
  }
  const skillMatch = pathLower.match(/^\/\.well-known\/agent-skills\/([a-z0-9-]+)\/skill\.md$/);
  if (skillMatch) {
    const s = SKILLS.find((x) => x.name === skillMatch[1]);
    if (s) return serveStatic(s.content, "text/markdown; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/security.txt" || pathLower === "/security.txt") {
    return serveStatic(SECURITY_TXT, "text/plain; charset=utf-8", "agent-api");
  }
  if (pathLower === "/pgp-key.asc" || pathLower === "/.well-known/pgp-key.asc") {
    return serveStatic(PGP_PUBLIC_KEY, "application/pgp-keys; charset=utf-8", "agent-api");
  }
  // WKD direct method. The policy file must exist and may be empty; its
  // presence is what tells a client the domain supports WKD at all.
  if (pathLower === "/.well-known/openpgpkey/policy") {
    return serveStatic("", "text/plain; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/openpgpkey/hu/" + PGP_WKD_HASH) {
    return serveStatic(getPgpKeyBytes(), "application/octet-stream", "agent-api");
  }
  if (pathLower === "/.well-known/mcp-registry-auth") {
    return serveStatic(MCP_REGISTRY_AUTH, "text/plain; charset=utf-8", "agent-api");
  }
  if (pathLower === "/sitemap.xml") return serveStatic(getSitemapXml(), "application/xml; charset=utf-8", "agent-api");
  if (pathLower === "/blog/feed.xml") return serveStatic(getBlogFeedXml(), "application/rss+xml; charset=utf-8", "agent-api");
  if (pathLower === "/llms.txt") return serveStatic(LLMS_TXT, "text/plain; charset=utf-8", "agent-api");
  if (pathLower === "/llms-full.txt") return serveStatic(getLlmsFullTxt(), "text/plain; charset=utf-8", "agent-api");
  if (pathLower === "/.well-known/ai.txt" || pathLower === "/ai.txt") {
    return serveStatic(AI_TXT, "text/plain; charset=utf-8", "agent-api");
  }
  if (pathLower === "/favicon.ico" || pathLower === "/favicon.svg") {
    return serveStatic(FAVICON_SVG, "image/svg+xml; charset=utf-8", "agent-api");
  }

  // Every page is rendered by the worker and static assets (og.jpg) come from
  // Workers Assets. Nothing is proxied to an origin any more, so an unmatched
  // path is a genuine 404 rendered by the worker. No origin sits behind it.
  return serve404(pathname);
}

export {
  worker_default as default,
  escapeHtml,
  renderInline,
  markdownToHtml,
  findLinkRelations
};
