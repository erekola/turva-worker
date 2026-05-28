// src/worker.js
// turva.dev pretender — single language (English), unified URLs

var BOT_AGENTS = [
  "googlebot", "adsbot-google", "apis-google", "mediapartners-google",
  "google-safety", "feedfetcher-google", "googleproducer", "google-site-verification",
  "bingbot", "yandexbot", "yabrowser", "yahoo", "baiduspider", "naver",
  "seznambot", "sznprohlizec", "qwantbot", "ecosia", "duckduckbot", "duckassistbot",
  "applebot", "facebookexternalhit", "facebookcatalog", "facebookbot",
  "meta-externalagent", "twitterbot", "linkedinbot", "whatsapp", "slackbot",
  "pinterest", "pinterestbot", "tiktok", "tiktokspider", "bytespider",
  "discordbot", "semrushbot", "ahrefsbot", "chrome-lighthouse", "screaming-frog",
  "oncrawlbot", "botifybot", "deepcrawl", "lumar", "rogerbot", "dotbot",
  "gptbot", "chatgpt", "oai-searchbot", "chatgpt-user", "claudebot",
  "google-extended", "perplexitybot", "perplexity-user", "youbot", "amazonbot",
  "anthropic-ai", "claude-web", "claude-user", "ccbot", "mistralai-user",
  "embedly", "quora link preview", "showyoubot", "outbrain", "pinterest/0.",
  "developers.google.com/+/web/snippet", "vkshare", "w3c_validator", "redditbot",
  "flipboard", "tumblr", "bitlybot", "skypeuripreview", "nuzzel",
  "google page speed", "qwantify", "bitrix link preview", "xing-contenttabreceiver",
  "google-inspectiontool", "telegrambot", "integration-test"
];

var IGNORE_EXTENSIONS = [
  ".js", ".css", ".xml", ".less", ".png", ".jpg", ".jpeg", ".gif", ".pdf",
  ".doc", ".txt", ".ico", ".rss", ".zip", ".mp3", ".rar", ".exe", ".wmv",
  ".avi", ".ppt", ".mpg", ".mpeg", ".tif", ".wav", ".mov", ".psd", ".ai",
  ".xls", ".mp4", ".m4a", ".swf", ".dat", ".dmg", ".iso", ".flv", ".m4v",
  ".torrent", ".woff", ".ttf", ".svg", ".webmanifest", ".json", ".md"
];

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
mx: mx1.alias.proton.me
mx: mx2.alias.proton.me
max_age: 604800
`;

var CSP_HTML = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:",
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

function applySecurityHeaders(headers, kind) {
  headers.delete("nel");
  headers.delete("report-to");
  headers.delete("reporting-endpoints");
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "0");
  headers.set("Permissions-Policy", PERMISSIONS_POLICY);
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("RateLimit-Limit", "100");
  headers.set("RateLimit-Remaining", "99");
  headers.set("RateLimit-Reset", "60");
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

var ROBOTS_TXT = `# robots.txt
# Content Signals per contentsignals.org
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: GPTBot
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: OAI-SearchBot
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: ChatGPT-User
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: ClaudeBot
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: Claude-User
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: Claude-SearchBot
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: PerplexityBot
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: Perplexity-User
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: Google-Extended
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: FacebookBot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

Sitemap: https://turva.dev/sitemap.xml
`;

var LLMS_TXT = `# turva.dev

> Agent-readiness audits and advisory for product teams.
> Independent measurement of how readable a site or API is by AI agents,
> with a prioritized fix list and implementation support.
> Based in Tampere, Finland. Async-only engagement.
> Language: English.

## Services
- [Services](https://turva.dev/services)
- [Company](https://turva.dev/company)
- [Contact](https://turva.dev/contact)
- [Legal](https://turva.dev/legal)

## Pricing (EUR, VAT not included)
- Audit: €6,500 (fixed scope, 2-3 weeks)
- Advisory: €3,000 / month (monthly retainer, minimum 3 months)
- Implementation: €1,500 / day (scoped per task)

Final price is confirmed in writing after scope is agreed.

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

## Agent endpoints
- Agent registration: https://turva.dev/auth.md
- API catalog: https://turva.dev/.well-known/api-catalog
- OpenAPI: https://turva.dev/.well-known/openapi.json
- MCP Server Card: https://turva.dev/.well-known/mcp/server-card.json
- MCP Endpoint: https://mcp.turva.dev/mcp
- Agent Skills index: https://turva.dev/.well-known/agent-skills/index.json
- OAuth Authorization Server: https://turva.dev/.well-known/oauth-authorization-server
- OAuth Protected Resource: https://turva.dev/.well-known/oauth-protected-resource
- AP2 (quote-on-request): https://turva.dev/.well-known/ap2
- ACP (quote-on-request): https://turva.dev/.well-known/acp
- x402-mesh (non-participation): https://turva.dev/.well-known/x402-mesh.json
- Full content: https://turva.dev/llms-full.txt
- Security contact: https://turva.dev/.well-known/security.txt
- AI policy: https://turva.dev/.well-known/ai.txt
`;

var AUTH_MD = `# Agent registration — turva.dev

turva.dev publishes public read-only metadata for AI agents.
There are no protected resources, no user accounts, and no
programmatic credentials issued by this domain. This document
describes how an operator can register an agent identity, request
metadata corrections, and revoke prior correspondence.

## Identity

- Operator: Erik Rekola (sole proprietorship, Finland)
- Trade name: turva.dev
- Business ID: 3600281-7
- Register: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Verified contact: <mailto:info@turva.dev>
- Public profile: https://www.linkedin.com/in/erikrekola/
- Source code: https://github.com/busygoat

## Supported identity types

- Email — primary channel (info@turva.dev)
- GitHub — public profile, used for code-related context
- LinkedIn — used for verifying real-world identity of operators

## Credential types

None issued. turva.dev exposes only public read-only endpoints.
No OAuth tokens, API keys, or signed assertions are required to
read any documented resource.

## Registration

To register an agent that will interact with turva.dev on behalf
of an operator, send an email to <mailto:info@turva.dev> with:

- Agent identifier and software name
- Operator name and legal entity
- Purpose of access (research, integration, monitoring)
- Expected request rate (per hour) and concurrency
- Public contact for the operator

A written acknowledgement is sent within one business day.
There is no automated registration endpoint.

## Claim or correction

To claim an existing identifier or correct metadata held about an
agent, email <mailto:info@turva.dev> with subject "agent claim". Include
proof of operator control (DNS TXT, signed message from a known
GitHub account, or a verified company email).

## Revocation

To revoke prior correspondence or request deletion of stored
metadata, email <mailto:info@turva.dev> with subject "agent revocation".
Records held to meet Finnish accounting obligations (invoices)
cannot be deleted until the statutory retention period ends.

## Engagement principles

- Async-only. No calls, no calendar links.
- First reply in writing within one business day.
- Production credentials are not requested.
- No tracking, no analytics, no third-party scripts on this site.

## Related discovery

- OAuth Authorization Server: /.well-known/oauth-authorization-server
- OAuth Protected Resource: /.well-known/oauth-protected-resource
- API catalog: /.well-known/api-catalog
- Security contact: /.well-known/security.txt
- Legal: /legal
`;

var PAGE_MARKDOWN = {
  "/": `# Agent-readiness audits and advisory

Agent-readiness audits and advisory for product teams. Independent
measurement of how readable your site and APIs are by AI agents.
Based in Tampere, Finland. Async-only engagement.

## How I work

The process has three stages and no surprises.

First, measurement. Independent agent-readiness scanners (Cloudflare
AI Audit, Internet.nl, Hardenize, StartupHub) read the current state
of the site or API and produce a numeric baseline.

Then a written report. Findings ranked by score impact and
implementation cost, written so the reader does not need an
agent-readiness background to follow it.

Then the fixes, if you want them. I implement them, or your
engineering team does the work with the report as the spec.

All communication runs async. No calls and no calendar links.
Production credentials are not requested. Write access to
repositories is scoped per task if implementation is purchased.

The result is verified by re-running the scanners. The next scan
reads higher than the previous one, in the categories the report
named.

## Services

- **Audit.** €6,500. Two to three weeks. Fixed scope.
- **Advisory.** €3,000 per month. Monthly retainer. Minimum three months.
- **Implementation.** €1,500 per day. Scoped per task.

See [Services](https://turva.dev/services) for the full description.

## Contact

Written contact only. Email for longer messages, Signal for short
questions. First reply within one business day.

- Email: <mailto:info@turva.dev>
- Signal: @turva.19
- LinkedIn: https://www.linkedin.com/in/erikrekola/

## More
- [Services](https://turva.dev/services)
- [Company](https://turva.dev/company)
- [Contact](https://turva.dev/contact)
- [Legal](https://turva.dev/legal)
- [Agent registration](https://turva.dev/auth.md)
`,

  "/services": `# Services

Three offerings. Async-only. One business day response.

## Audit

**€6,500. Two to three weeks. Fixed scope.**

A measurement of how agent-ready your site and APIs are today, with
a prioritised list of what to fix first.

What you get:
- Scanner sweep across Cloudflare AI Audit, Internet.nl, Hardenize
  and StartupHub agent-readiness
- Manual review of /.well-known/ manifests, JSON-LD, head metadata
  and HTTP headers
- Review of robots.txt, sitemap.xml, ai.txt and llms.txt against
  current agent norms
- Written report with findings ranked by score impact and
  implementation cost
- One round of written follow-up questions

What you do not get:
- Calls or meetings
- Implementation of the fixes (separate engagement)
- Ongoing monitoring (separate engagement)

Suited for teams that want a clear picture of where they stand
before deciding what to do about it.

## Advisory

**€3,000 per month. Monthly retainer. Minimum three months.**

Ongoing input on agent-readiness as part of your product roadmap,
with tracking of how the scores change over time.

What you get:
- Monthly re-scan and score delta report
- Written review of any agent-readiness related work your team
  ships, within one business day
- Roadmap input on what to ship next and why
- Async channel for questions (email or shared doc)
- Quarterly summary of measurable progress

Suited for teams treating agent-readiness as an ongoing product
responsibility rather than a one-off cleanup.

## Implementation

**€1,500 per day. Scoped per task.**

Hands-on work on the fixes the audit identified, or new agent-ready
infrastructure built from scratch.

Typical work:
- Cloudflare Workers for head metadata and /.well-known/ files
  served at the edge
- MCP servers exposing read-only product data to agents
- JSON-LD generators for product, organisation and article schemas
- ai.txt and llms.txt authoring
- Signed content and agent authentication patterns

Scoped repository write access per task. No retainer.

## How to start

Email <mailto:info@turva.dev> with the site or API you want audited. I
respond within one business day with a fixed quote and a start date.

No calls, no calendar links, no discovery sessions.

All prices exclude VAT. 24% for Finnish customers, reverse charge
for EU B2B, 0% for non-EU.
`,

  "/company": `# Company

turva.dev is operated by Erik Rekola as a Finnish sole proprietorship
(toiminimi). Based in Tampere, serving clients remotely worldwide.

## Business details

- **Trade name:** turva.dev
- **Operator:** Erik Rekola
- **Business ID:** 3600281-7
- **Register:** https://tietopalvelu.ytj.fi/yritys/3600281-7
- **Form:** Sole proprietorship (toiminimi)
- **VAT-registered:** Yes
- **Location:** Tampere, Finland

## About the operator

Erik Rekola has eleven years of experience as an engineer in
industrial settings, including roles at UPM, Franke, Thermo Fisher
Scientific and ASM International.

The work covered measurement, process engineering and the
documentation of complex systems. The same approach now applies to
a different subject: how websites and APIs are read by AI agents.

## Why this service exists

Agent-readiness is a measurable property of a site, an API, or a
product surface. Either the scanners read it higher next week than
this week, or they do not. That is the question this service answers.

Most websites and APIs were built before AI agents were a meaningful
class of clients. The protocols (MCP, well-known manifests,
structured discovery, JSON-LD) exist, but few sites implement them
correctly. The result is a measurable gap between what an agent can
read and what a human can read.

This service closes that gap on a per-project basis, with independent
scanners as the referee.

## Operating principles

- Async-only engagement. No calls, no calendar links.
- All work delivered remotely.
- Production credentials are not requested.
- Write access scoped per task and only if implementation is purchased.
- Every claim is verifiable against public scanner output.

## Contact

- **Email:** <mailto:info@turva.dev>
- **Signal:** @turva.19
- **LinkedIn:** https://www.linkedin.com/in/erikrekola/
`,

  "/contact": `# Contact

Written contact only. Email for longer messages, Signal for short
questions. The first reply is in writing within one business day.
No calls and no calendar links at any stage of the engagement.

## Channels

- **Email:** <mailto:info@turva.dev>
- **Signal:** @turva.19
- **LinkedIn:** https://www.linkedin.com/in/erikrekola/

## Response times

- Email and Signal: within one business day
- Weekends: no guaranteed response time

## What to include in a first message

A useful first message includes:
- The site or API to be audited (URL)
- Any current scanner results, if you have run them
- The scope you have in mind (audit, advisory, implementation)

If you do not have scanner results yet, that is fine. The audit
starts with running them.

## Geographic service area

Based in Tampere, Finland. Service delivered remotely worldwide.
All work is asynchronous and written.

## Business details

- Business ID: 3600281-7
- Register: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Agent registration: https://turva.dev/auth.md
`,

  "/legal": `# Legal

This page covers the terms under which turva.dev operates, the
privacy practices of the site, and the default terms for engagements.

## Operator

turva.dev is operated by Erik Rekola, Business ID 3600281-7,
registered in Finland as a sole proprietorship (toiminimi).
VAT-registered.

Contact: <mailto:info@turva.dev>

## Terms of engagement

The following terms apply to audit, advisory and implementation
engagements unless replaced by a written agreement.

**Scope.** Each engagement has a defined scope agreed in writing
before work starts. Scope changes require a new written agreement
and may affect price and timeline.

**Deliverables.** Audit deliverables are a written report.
Advisory deliverables are written reviews and a monthly summary.
Implementation deliverables are source code committed to the
agreed repository.

**Payment.** Invoices are issued through UKKO.fi. Payment terms
are fourteen days net. Late payment interest follows Finnish law.

**Confidentiality.** Information shared during an engagement is
treated as confidential. A separate non-disclosure agreement can
be signed on request.

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
required by law.

No data is sold or shared with third parties.

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

Last updated: 2026-05-28.
`
};

function buildLlmsFullTxt() {
  const header = `# Full content (llms-full.txt)

> Concatenated markdown of all primary pages. For LLMs that prefer a
> single document over per-page fetches. Sources are canonical URLs
> on https://turva.dev/.

`;
  const sections = Object.entries(PAGE_MARKDOWN).map(([path, content]) => {
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
Mcp-server-card: https://turva.dev/.well-known/mcp/server-card.json
Mcp-endpoint: https://mcp.turva.dev/mcp
Agent-skills: https://turva.dev/.well-known/agent-skills/index.json
Oauth-discovery: https://turva.dev/.well-known/oauth-authorization-server
Oauth-protected-resource: https://turva.dev/.well-known/oauth-protected-resource
Ap2: https://turva.dev/.well-known/ap2
Acp: https://turva.dev/.well-known/acp
X402-Mesh: https://turva.dev/.well-known/x402-mesh.json
`;

var SECURITY_TXT = `Contact: mailto:info@turva.dev
Expires: 2027-05-28T00:00:00.000Z
Preferred-Languages: en
Canonical: https://turva.dev/.well-known/security.txt
Policy: https://turva.dev/legal
`;

var API_CATALOG = JSON.stringify({
  "linkset": [{
    "anchor": "https://turva.dev/",
    "service-desc": [{ "href": "https://turva.dev/.well-known/openapi.json", "type": "application/json" }],
    "service-doc": [
      { "href": "https://turva.dev/llms.txt", "type": "text/plain" },
      { "href": "https://turva.dev/llms-full.txt", "type": "text/plain" },
      { "href": "https://turva.dev/auth.md", "type": "text/markdown", "title": "Agent registration" },
      { "href": "https://turva.dev/", "type": "text/html" }
    ],
    "service-meta": [
      { "href": "https://turva.dev/.well-known/mcp/server-card.json", "type": "application/json", "title": "MCP Server Card" },
      { "href": "https://turva.dev/.well-known/agent-skills/index.json", "type": "application/json", "title": "Agent Skills Index" },
      { "href": "https://turva.dev/.well-known/oauth-authorization-server", "type": "application/json", "title": "OAuth Authorization Server (non-participation)" },
      { "href": "https://turva.dev/.well-known/oauth-protected-resource", "type": "application/json", "title": "OAuth Protected Resource Metadata" },
      { "href": "https://turva.dev/.well-known/ap2", "type": "application/json", "title": "AP2 manifest" },
      { "href": "https://turva.dev/.well-known/acp", "type": "application/json", "title": "ACP manifest" },
      { "href": "https://turva.dev/.well-known/x402-mesh.json", "type": "application/json", "title": "x402-mesh (non-participation)" }
    ],
    "author": [{ "href": "https://www.linkedin.com/in/erikrekola/", "title": "Erik Rekola" }],
    "license": [{ "href": "https://turva.dev/legal" }]
  }]
}, null, 2);

var OPENAPI_SPEC = JSON.stringify({
  "openapi": "3.1.0",
  "info": {
    "title": "turva.dev metadata API",
    "version": "3.1.0",
    "description": "Read-only metadata endpoints for AI agents. Public, no authentication. turva.dev provides agent-readiness audits and advisory for product teams.",
    "contact": { "name": "Erik Rekola", "email": "info@turva.dev", "url": "https://turva.dev/" },
    "license": { "name": "Proprietary", "url": "https://turva.dev/legal" }
  },
  "servers": [{ "url": "https://turva.dev" }],
  "paths": {
    "/llms.txt": { "get": { "summary": "LLM summary", "operationId": "getLlmsTxt", "responses": { "200": { "description": "ok" } } } },
    "/llms-full.txt": { "get": { "summary": "Full concatenated content", "operationId": "getLlmsFullTxt", "responses": { "200": { "description": "ok" } } } },
    "/auth.md": { "get": { "summary": "Agent registration metadata", "operationId": "getAuthMd", "responses": { "200": { "description": "ok" } } } },
    "/sitemap.xml": { "get": { "summary": "Sitemap", "operationId": "getSitemap", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/ai.txt": { "get": { "summary": "AI policy", "operationId": "getAiPolicy", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/mcp/server-card.json": { "get": { "summary": "MCP Server Card", "operationId": "getMcpCard", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/agent-skills/index.json": { "get": { "summary": "Agent Skills index", "operationId": "getSkillsIndex", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/api-catalog": { "get": { "summary": "API catalog", "operationId": "getApiCatalog", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/security.txt": { "get": { "summary": "Security", "operationId": "getSecurity", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/oauth-authorization-server": { "get": { "summary": "OAuth Authorization Server Metadata", "operationId": "getOauthDiscovery", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/oauth-protected-resource": { "get": { "summary": "OAuth Protected Resource Metadata", "operationId": "getOauthProtectedResource", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/ap2": { "get": { "summary": "AP2 manifest (quote-on-request)", "operationId": "getAp2", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/acp": { "get": { "summary": "ACP manifest (quote-on-request)", "operationId": "getAcp", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/x402-mesh.json": { "get": { "summary": "x402-mesh (non-participation)", "operationId": "getX402Mesh", "responses": { "200": { "description": "ok" } } } }
  }
}, null, 2);

var AGENT_JSON = JSON.stringify({
  "schema_version": "v1",
  "name": "turva.dev",
  "description_for_human": "Agent-readiness audits and advisory for product teams.",
  "description_for_model": "turva.dev provides agent-readiness audits and advisory for product teams. Independent scanners measure the site or API, a written report names the prioritized fixes, the next scan verifies the result. Async-only engagement. Pricing (EUR, VAT not included): Audit €6,500 (fixed, 2-3 weeks), Advisory €3,000/month (minimum 3 months), Implementation €1,500/day (scoped per task). Pages support Accept: text/markdown.",
  "contact_email": "info@turva.dev",
  "legal_info_url": "https://turva.dev/legal",
  "auth": { "type": "none" },
  "api": { "type": "openapi", "url": "https://turva.dev/.well-known/openapi.json" }
}, null, 2);

var MCP_SERVER_CARD = JSON.stringify({
  "$schema": "https://modelcontextprotocol.io/schemas/server-card/2025-10.json",
  "serverInfo": {
    "name": "turva-mcp",
    "title": "turva.dev",
    "version": "3.1.0",
    "description": "Public read-only MCP server for turva.dev. Exposes the service catalog (audit, advisory, implementation) with prices, own-domain agent-readiness scan evidence, and engagement principles (async-only, no calls, no calendar links). No authentication, no write operations."
  },
  "transport": {
    "type": "streamable-http",
    "endpoint": "https://mcp.turva.dev/mcp"
  },
  "capabilities": {
    "tools": { "listChanged": true },
    "resources": { "listChanged": false, "subscribe": false },
    "prompts": { "listChanged": false }
  },
  "tools": [
    { "name": "get_services", "description": "Service catalog with prices in EUR." },
    { "name": "get_scan_evidence", "description": "Latest public agent-readiness scan results for turva.dev (Cloudflare AI Audit, Internet.nl, Hardenize, StartupHub)." },
    { "name": "get_principles", "description": "Engagement principles: async-only, no calls, no calendar links, no production credentials, scoped repo access." }
  ],
  "meta": {
    "homepage": "https://turva.dev/",
    "mcpEndpoint": "https://mcp.turva.dev/mcp",
    "openapi": "https://turva.dev/.well-known/openapi.json",
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
      "audit": { "price": 6500, "unit": "fixed", "duration": "2-3 weeks" },
      "advisory": { "price": 3000, "unit": "month", "minimumCommitment": "3 months" },
      "implementation": { "price": 1500, "unit": "day" }
    }
  }
}, null, 2);

var OAUTH_DISCOVERY = JSON.stringify({
  "issuer": "https://turva.dev",
  "service_documentation": "https://turva.dev/auth.md",
  "op_policy_uri": "https://turva.dev/legal",
  "op_tos_uri": "https://turva.dev/legal",
  "ui_locales_supported": ["en"],
  "auth_methods_supported": [],
  "protected_resources": ["https://turva.dev"],
  "agent_auth": {
    "self_registration_supported": false,
    "register_uri": "mailto:info@turva.dev?subject=agent%20registration",
    "claim_uri": "mailto:info@turva.dev?subject=agent%20claim",
    "revocation_uri": "mailto:info@turva.dev?subject=agent%20revocation",
    "documentation_uri": "https://turva.dev/auth.md",
    "supported_identity_types": ["email", "github", "linkedin"],
    "supported_credential_types": [],
    "contact": "info@turva.dev",
    "rationale": "turva.dev is a public read-only marketing surface with no user accounts, no protected resources, and no OAuth-protected APIs. There is nothing for an agent to authenticate to. Public APIs and the MCP endpoint at https://mcp.turva.dev/mcp are accessible without credentials. Agent registration is handled out-of-band via the channels documented at /auth.md."
  },
  "non_participation": true,
  "non_participation_reason": "No user accounts. Public read-only API and MCP endpoint. Agent registration via /auth.md."
}, null, 2);

var OAUTH_PROTECTED_RESOURCE = JSON.stringify({
  "resource": "https://turva.dev",
  "authorization_servers": ["https://turva.dev"],
  "scopes_supported": ["read:services", "read:principles", "read:scan-evidence"],
  "bearer_methods_supported": ["header"],
  "resource_name": "turva.dev",
  "resource_documentation": "https://turva.dev/auth.md",
  "resource_policy_uri": "https://turva.dev/legal",
  "resource_tos_uri": "https://turva.dev/legal",
  "resource_signing_alg_values_supported": ["RS256", "ES256"]
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
  "supported_rails": [],
  "pricing": {
    "currency": "EUR",
    "vat_included": false,
    "items": [
      { "name": "Audit", "price": 6500, "unit": "fixed", "duration": "2-3 weeks" },
      { "name": "Advisory", "price": 3000, "unit": "month", "minimum_commitment_months": 3 },
      { "name": "Implementation", "price": 1500, "unit": "day" }
    ]
  },
  "quote_endpoint": {
    "type": "human_contact",
    "channels": [
      { "type": "email", "value": "mailto:info@turva.dev" },
      { "type": "signal", "value": "@turva.19" },
      { "type": "linkedin", "value": "https://www.linkedin.com/in/erikrekola/" }
    ],
    "languages": ["en"],
    "typical_response_time": "P1D"
  },
  "rationale": "Audit, advisory, and implementation work are scoped per engagement; prices are published; final price is confirmed in writing after scope is agreed. Machine-payable rails (USDC/x402, Stripe payment links, AP2 push payments) are not enabled. Engagement is async-only; no calls and no calendar links."
}, null, 2);

var ACP_MANIFEST = JSON.stringify({
  "$schema": "https://agentcommerce.dev/schemas/manifest/v1.json",
  "version": "1.0",
  "merchant": {
    "name": "turva.dev",
    "legal_name": "Erik Rekola",
    "business_id": "3600281-7",
    "country": "FI",
    "url": "https://turva.dev/"
  },
  "payment_model": "quote_on_request",
  "checkout_flow": "human_contact",
  "supported_payment_methods": [],
  "pricing": {
    "currency": "EUR",
    "vat_included": false,
    "items": [
      { "name": "Audit", "price": 6500, "unit": "fixed" },
      { "name": "Advisory", "price": 3000, "unit": "month" },
      { "name": "Implementation", "price": 1500, "unit": "day" }
    ]
  },
  "contact": {
    "email": "info@turva.dev",
    "signal": "@turva.19",
    "languages": ["en"]
  },
  "rationale": "Pricing is per engagement against published prices. Agents should propose a written customer contact rather than attempt programmatic checkout. All communication is asynchronous and in writing.",
  "non_participation_in_programmatic_checkout": true
}, null, 2);

var X402_MESH = JSON.stringify({
  "$schema": "https://x402-mesh.org/schemas/manifest/v1.json",
  "version": "1.0",
  "participant": false,
  "site": "https://turva.dev/",
  "merchant": {
    "name": "turva.dev",
    "legal_name": "Erik Rekola",
    "business_id": "3600281-7",
    "country": "FI"
  },
  "reason": "turva.dev does not expose paywalled HTTP endpoints. All public surfaces (HTML, llms.txt, MCP endpoint at https://mcp.turva.dev/mcp, OpenAPI, well-known files) are free. Agent-readiness audits and advisory are contracted out-of-band via written async contact (email or Signal).",
  "alternative_contact": {
    "email": "info@turva.dev",
    "signal": "@turva.19",
    "languages": ["en"]
  },
  "peer_pricelist": [],
  "referrals": []
}, null, 2);

var SKILL_CONTACT_INFO = `---
name: contact-info
description: Get the primary contact channels for turva.dev (email, Signal, LinkedIn, business ID). Async-only engagement.
---

# contact-info

Use this skill to retrieve official contact methods for turva.dev.

## Returns

- **Email:** <mailto:info@turva.dev>
- **Signal:** @turva.19
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
description: List the service offerings of turva.dev with prices (EUR).
---

# services

Use this skill to learn which services turva.dev offers and prices.

## Services (prices in EUR, VAT not included)
- **Audit.** €6,500. Fixed scope, 2-3 weeks. Scanner sweep, manual review, written report with prioritized fix list.
- **Advisory.** €3,000 / month. Monthly retainer, minimum 3 months. Async-only. Ongoing review and score tracking.
- **Implementation.** €1,500 / day. Scoped per task. Cloudflare Workers, MCP servers, well-known manifests, JSON-LD.

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
  { name: "contact-info", content: SKILL_CONTACT_INFO },
  { name: "services", content: SKILL_SERVICES },
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
      description: s.content.match(/^description:\s*(.+)$/m)[1].trim(),
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
 return { email: 'info@turva.dev', signal: '@turva.19', linkedin: 'https://www.linkedin.com/in/erikrekola/', businessId: '3600281-7', language: 'en', engagement: 'async-only' };
 }
 },
 {
 name: 'get_services',
 description: 'Return the services offered by turva.dev (audit, advisory, implementation) with prices in EUR.',
 inputSchema: { type: 'object', properties: {} },
 execute: async function() {
 const r = await fetch('/services', { headers: { Accept: 'text/markdown' } });
 return { markdown: await r.text(), pricing: { currency: 'EUR', vatIncluded: false, audit: { price: 6500, unit: 'fixed' }, advisory: { price: 3000, unit: 'month', minimumCommitmentMonths: 3 }, implementation: { price: 1500, unit: 'day' } } };
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

var SITEMAP_LASTMOD = "2026-05-28";
var SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 <url><loc>https://turva.dev/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
 <url><loc>https://turva.dev/services</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
 <url><loc>https://turva.dev/company</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/contact</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/legal</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>
 <url><loc>https://turva.dev/auth.md</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>yearly</changefreq><priority>0.4</priority></url>
</urlset>`;

var CANONICAL_PATHS = new Set(["/", "/services", "/company", "/contact", "/legal"]);

function getCanonicalForPath(pathname) {
  if (CANONICAL_PATHS.has(pathname)) {
    return "https://turva.dev" + pathname;
  }
  return null;
}

var META_BY_PATH = {
  "/": {
    title: "Agent-readiness audits and advisory — turva.dev",
    description: "Agent-readiness audits and advisory for product teams. Independent measurement of how readable your site and APIs are by AI agents. Async-only.",
    imageAlt: "Agent-readiness audits and advisory"
  },
  "/services": {
    title: "Services — turva.dev",
    description: "Audit €6,500, advisory €3,000/month, implementation €1,500/day. Agent-readiness work for product teams. Async-only, one business day response.",
    imageAlt: "turva.dev services and pricing"
  },
  "/company": {
    title: "Company — turva.dev",
    description: "turva.dev is operated by Erik Rekola as a Finnish sole proprietorship. Business ID 3600281-7, based in Tampere. Eleven years of engineering experience.",
    imageAlt: "turva.dev company information"
  },
  "/contact": {
    title: "Contact — turva.dev",
    description: "Contact turva.dev via email, Signal or LinkedIn. Async-only engagement. Response within one business day. No calls, no calendar links.",
    imageAlt: "Contact turva.dev"
  },
  "/legal": {
    title: "Legal — turva.dev",
    description: "Terms of engagement, privacy practices and GDPR information for turva.dev. Finnish law applies. No tracking, no analytics, no third-party scripts.",
    imageAlt: "Legal and privacy"
  }
};

function buildMetaBlock(pathname, canonicalUrl) {
  const m = META_BY_PATH[pathname] || META_BY_PATH["/"];
  const url = canonicalUrl || "https://turva.dev" + pathname;
  return `<title>${m.title}</title>
<meta name="description" content="${m.description}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="turva.dev" />
<meta property="og:title" content="${m.title}" />
<meta property="og:description" content="${m.description}" />
<meta property="og:url" content="${url}" />
<meta property="og:locale" content="en_US" />
<meta property="og:image" content="https://turva.dev/og.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${m.imageAlt}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${m.title}" />
<meta name="twitter:description" content="${m.description}" />
<meta name="twitter:image" content="https://turva.dev/og.jpg" />
<meta name="twitter:image:alt" content="${m.imageAlt}" />`;
}

var PRICE_VALID_UNTIL = "2026-12-31";

var SCHEMA_HOME = `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"ProfessionalService","@id":"https://turva.dev/#business","name":"turva.dev","url":"https://turva.dev/","image":"https://turva.dev/og.jpg","description":"Independent agent-readiness audits and advisory for product teams. Scanners measure the site or API; a written report names the prioritized fixes; the next scan verifies the result.","priceRange":"€€€","taxID":"3600281-7","vatID":"FI36002817","email":"info@turva.dev","areaServed":{"@type":"Place","name":"Worldwide"},"address":{"@type":"PostalAddress","addressLocality":"Tampere","addressCountry":"FI"},"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"info@turva.dev","availableLanguage":["English"]},"founder":{"@id":"https://turva.dev/#person"},"sameAs":["https://tietopalvelu.ytj.fi/yritys/3600281-7","https://www.linkedin.com/in/erikrekola/","https://github.com/busygoat"]},
{"@type":"Person","@id":"https://turva.dev/#person","name":"Erik Rekola","jobTitle":"Agent-readiness consultant","worksFor":{"@id":"https://turva.dev/#business"},"sameAs":["https://www.linkedin.com/in/erikrekola/","https://github.com/busygoat"]},
{"@type":"WebSite","@id":"https://turva.dev/#website","url":"https://turva.dev/","name":"turva.dev","publisher":{"@id":"https://turva.dev/#business"},"inLanguage":"en"},
{"@type":"Service","@id":"https://turva.dev/#service","name":"Agent-readiness audits and advisory","provider":{"@id":"https://turva.dev/#business"},"serviceType":"Agent-readiness consulting","areaServed":{"@type":"Place","name":"Worldwide"},"availableChannel":{"@type":"ServiceChannel","serviceUrl":"https://turva.dev/services","availableLanguage":["en"]},"offers":{"@type":"AggregateOffer","priceCurrency":"EUR","lowPrice":"1500","highPrice":"6500","offerCount":"3","availability":"https://schema.org/InStock","url":"https://turva.dev/services","priceValidUntil":"${PRICE_VALID_UNTIL}"},"hasOfferCatalog":{"@type":"OfferCatalog","name":"turva.dev services","itemListElement":[
{"@type":"Offer","name":"Audit","description":"Fixed scope, 2-3 weeks. Scanner sweep across Cloudflare AI Audit, Internet.nl, Hardenize and StartupHub agent-readiness, plus manual review of /.well-known/ manifests, JSON-LD and head metadata. Written report with prioritized fix list.","url":"https://turva.dev/services","price":"6500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"6500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"€6,500 fixed price, two to three weeks. VAT added per Finnish law."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness audit"}},
{"@type":"Offer","name":"Advisory","description":"Monthly retainer, async-only. Monthly re-scan and score delta report, written review of shipped work within one business day, roadmap input. Minimum three months.","url":"https://turva.dev/services","price":"3000","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"UnitPriceSpecification","price":"3000","priceCurrency":"EUR","valueAddedTaxIncluded":false,"unitCode":"MON","unitText":"month","description":"€3,000 per month, retainer-based. Minimum three months commitment."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness advisory"}},
{"@type":"Offer","name":"Implementation","description":"Hands-on work on the fixes the audit identified, or new agent-ready infrastructure. Cloudflare Workers, MCP servers, well-known manifests, JSON-LD generators, ai.txt and llms.txt authoring.","url":"https://turva.dev/services","price":"1500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"UnitPriceSpecification","price":"1500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"unitCode":"DAY","unitText":"day","description":"€1,500 per day. Scoped per task."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Implementation work"}}
]}},
{"@type":"FAQPage","@id":"https://turva.dev/#faq","inLanguage":"en","mainEntity":[
{"@type":"Question","name":"What does agent-readiness mean?","acceptedAnswer":{"@type":"Answer","text":"Agent-readiness is a measurable property of a site, an API, or a product surface. It describes how well AI agents can discover, read, and operate it."}},
{"@type":"Question","name":"How much does it cost?","acceptedAnswer":{"@type":"Answer","text":"Prices (EUR, VAT not included): Audit €6,500 fixed price, Advisory €3,000/month (minimum 3 months), Implementation €1,500/day scoped per task. Final price is confirmed in writing after scope is agreed."}},
{"@type":"Question","name":"Do I need to share production credentials?","acceptedAnswer":{"@type":"Answer","text":"No. Production credentials are not requested. Read access is enough for the audit."}},
{"@type":"Question","name":"Are there calls or video meetings?","acceptedAnswer":{"@type":"Answer","text":"No. Engagement is async-only. No calls and no calendar links at any stage."}},
{"@type":"Question","name":"How long does the audit take?","acceptedAnswer":{"@type":"Answer","text":"The audit is fixed scope, 2-3 weeks."}},
{"@type":"Question","name":"Can our engineering team implement the fixes?","acceptedAnswer":{"@type":"Answer","text":"Yes. The audit report is the spec. Either I implement or your team does the work with the report as the spec."}},
{"@type":"Question","name":"How is the result verified?","acceptedAnswer":{"@type":"Answer","text":"The result shows up in scanner numbers. The next scan reads higher than the previous one in the categories the report named."}},
{"@type":"Question","name":"How do I get in touch?","acceptedAnswer":{"@type":"Answer","text":"In writing: email <mailto:info@turva.dev> or Signal @turva.19. First reply within one business day."}}
]}
]}
<\/script>`;

var HeadCleaner = class {
  element(element) {
    const tag = element.tagName.toLowerCase();
    if (tag === "title") {
      element.remove();
      return;
    }
    if (tag === "meta") {
      const name = (element.getAttribute("name") || "").toLowerCase();
      const property = (element.getAttribute("property") || "").toLowerCase();
      if (name === "description") {
        element.remove();
        return;
      }
      if (name.startsWith("twitter:")) {
        element.remove();
        return;
      }
      if (property.startsWith("og:")) {
        element.remove();
        return;
      }
      return;
    }
    if (tag === "link") {
      const rel = (element.getAttribute("rel") || "").toLowerCase();
      const hreflang = element.getAttribute("hreflang");
      if (rel === "canonical") {
        element.remove();
        return;
      }
      if (rel === "alternate" && hreflang) {
        element.remove();
        return;
      }
    }
  }
};

var HtmlLangSetter = class {
  constructor(lang) {
    this.lang = lang;
  }
  element(element) {
    element.setAttribute("lang", this.lang);
  }
};

function appendAgentLinks(headers) {
  headers.append("Link", '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"');
  headers.append("Link", '</.well-known/openapi.json>; rel="service-desc"; type="application/json"');
  headers.append("Link", '</llms.txt>; rel="service-doc"; type="text/plain"');
  headers.append("Link", '</llms-full.txt>; rel="service-doc"; type="text/plain"; title="Full content"');
  headers.append("Link", '</auth.md>; rel="agent-registration"; type="text/markdown"; title="Agent registration"');
  headers.append("Link", '</.well-known/mcp/server-card.json>; rel="service-meta"; type="application/json"');
  headers.append("Link", '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"');
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
  headers.append("Link", '</.well-known/x402-mesh.json>; rel="x402-mesh"; type="application/json"');
  headers.append("Link", '<mailto:info@turva.dev?subject=Quote%20request>; rel="payment"; title="Request a quote"');
}

function injectHtml(response, pathname) {
  const ct = response.headers.get("content-type") || "";
  if (!ct.includes("text/html")) {
    const headers2 = new Headers(response.headers);
    applySecurityHeaders(headers2, "default");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers2
    });
  }

  const canonicalUrl = getCanonicalForPath(pathname);
  const isCanonicalPage = canonicalUrl !== null;
  const isHome = pathname === "/";

  if (!isCanonicalPage) {
    const headers2 = new Headers(response.headers);
    appendAgentLinks(headers2);
    applySecurityHeaders(headers2, "html");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers2
    });
  }

  const metaBlock = buildMetaBlock(pathname, canonicalUrl);

  const transformed = new HTMLRewriter()
    .on("html", new HtmlLangSetter("en"))
    .on("title", new HeadCleaner())
    .on("meta", new HeadCleaner())
    .on("link", new HeadCleaner())
    .on("head", {
      element(el) {
        el.append(metaBlock, { html: true });
        el.append(`<link rel="canonical" href="${canonicalUrl}" />`, { html: true });
        el.append(`<link rel="api-catalog" href="https://turva.dev/.well-known/api-catalog" type="application/linkset+json" />`, { html: true });
        el.append(`<link rel="service-desc" href="https://turva.dev/.well-known/openapi.json" type="application/json" />`, { html: true });
        el.append(`<link rel="service-doc" href="https://turva.dev/llms.txt" type="text/plain" />`, { html: true });
        el.append(`<link rel="service-doc" href="https://turva.dev/llms-full.txt" type="text/plain" title="Full content" />`, { html: true });
        el.append(`<link rel="agent-registration" href="https://turva.dev/auth.md" type="text/markdown" title="Agent registration" />`, { html: true });
        el.append(`<link rel="service-meta" href="https://turva.dev/.well-known/mcp/server-card.json" type="application/json" />`, { html: true });
        el.append(`<link rel="agent-skills" href="https://turva.dev/.well-known/agent-skills/index.json" type="application/json" />`, { html: true });
        el.append(`<link rel="payment" href="mailto:info@turva.dev?subject=Quote%20request" title="Request a quote" />`, { html: true });
        el.append(`<link rel="oauth-authorization-server" href="https://turva.dev/.well-known/oauth-authorization-server" type="application/json" />`, { html: true });
        el.append(`<link rel="oauth-protected-resource" href="https://turva.dev/.well-known/oauth-protected-resource" type="application/json" />`, { html: true });
        el.append(`<link rel="ap2" href="https://turva.dev/.well-known/ap2" type="application/json" />`, { html: true });
        el.append(`<link rel="acp" href="https://turva.dev/.well-known/acp" type="application/json" />`, { html: true });
        el.append(`<link rel="x402-mesh" href="https://turva.dev/.well-known/x402-mesh.json" type="application/json" />`, { html: true });
        if (isHome) el.append(SCHEMA_HOME, { html: true });
        el.append(WEBMCP_SCRIPT, { html: true });
      }
    })
    .transform(response);

  const headers = new Headers(transformed.headers);
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "html");
  headers.set("Vary", "Accept");
  headers.set("Content-Language", "en");
  headers.append("Link", `<${canonicalUrl}>; rel="alternate"; type="text/markdown"`);
  return new Response(transformed.body, {
    status: transformed.status,
    statusText: transformed.statusText,
    headers
  });
}

function stripBody(response) {
  return new Response(null, { status: response.status, statusText: response.statusText, headers: response.headers });
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

function wantsMarkdown(request) {
  const accept = (request.headers.get("Accept") || "").toLowerCase();
  if (!accept) return false;
  const parts = accept.split(",").map((p) => p.trim().split(";")[0].trim());
  return parts.includes("text/markdown");
}

function serveMarkdown(body, canonicalUrl) {
  const tokens = body.split(/\s+/).filter(Boolean).length;
  const headers = new Headers({
    "content-type": "text/markdown; charset=utf-8",
    "cache-control": "public, max-age=3600",
    "access-control-allow-origin": "*",
    "vary": "Accept",
    "x-markdown-tokens": String(tokens)
  });
  if (canonicalUrl) {
    headers.set("content-location", canonicalUrl);
    headers.append("Link", `<${canonicalUrl}>; rel="canonical"`);
  }
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "agent-api");
  return new Response(body, { status: 200, headers });
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
      const response = await handleRequest(workingRequest, env);
      return isHead ? stripBody(response) : response;
    } catch (err) {
      const errHeaders = new Headers({ "content-type": "text/plain; charset=utf-8" });
      applySecurityHeaders(errHeaders, "default");
      const errResponse = new Response(err.stack || String(err), { status: 500, headers: errHeaders });
      return isHead ? stripBody(errResponse) : errResponse;
    }
  }
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;
  const userAgent = request.headers.get("User-Agent")?.toLowerCase() || "";
  const isPrerender = request.headers.get("X-Prerender");
  const pathLower = pathname.toLowerCase();
  const lastDot = pathLower.lastIndexOf(".");
  const extension = lastDot > -1 ? pathLower.substring(lastDot).toLowerCase() : "";

  // MTA-STS subdomain
  if (hostname === "mta-sts.turva.dev") {
    if (pathLower === "/.well-known/mta-sts.txt") {
      return serveMtaStsPolicy();
    }
    return Response.redirect("https://turva.dev/", 301);
  }

  // www → apex
  if (hostname === "www.turva.dev") {
    return Response.redirect("https://turva.dev" + pathname + url.search, 301);
  }

  // Legacy URL redirects
  if (LEGACY_REDIRECTS[pathname]) {
    return Response.redirect("https://turva.dev" + LEGACY_REDIRECTS[pathname] + url.search, 301);
  }

  // Markdown content negotiation for canonical pages
  if (wantsMarkdown(request) && PAGE_MARKDOWN[pathname]) {
    const canonicalUrl = getCanonicalForPath(pathname) || "https://turva.dev" + pathname;
    return serveMarkdown(PAGE_MARKDOWN[pathname], canonicalUrl);
  }

  // auth.md — agent registration metadata
  if (pathLower === "/auth.md") {
    return serveStatic(AUTH_MD, "text/markdown; charset=utf-8", "agent-api");
  }

  // Well-known and agent endpoints
  if (pathLower === "/robots.txt") {
    return serveStatic(ROBOTS_TXT, "text/plain; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/api-catalog" || pathLower === "/api-catalog") {
    return serveStatic(API_CATALOG, "application/linkset+json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/openapi.json" || pathLower === "/openapi.json") {
    return serveStatic(OPENAPI_SPEC, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/mcp/server-card.json" || pathLower === "/.well-known/mcp.json") {
    return serveStatic(MCP_SERVER_CARD, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/agent.json" || pathLower === "/.well-known/ai-plugin.json") {
    return serveStatic(AGENT_JSON, "application/json; charset=utf-8", "agent-api");
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
  if (pathLower === "/.well-known/acp" || pathLower === "/.well-known/acp.json") {
    return serveStatic(ACP_MANIFEST, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/x402-mesh.json" || pathLower === "/.well-known/x402-mesh") {
    return serveStatic(X402_MESH, "application/json; charset=utf-8", "agent-api");
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
  if (pathLower === "/sitemap.xml") {
    return serveStatic(SITEMAP_XML, "application/xml; charset=utf-8", "agent-api");
  }
  if (pathLower === "/llms.txt") {
    return serveStatic(LLMS_TXT, "text/plain; charset=utf-8", "agent-api");
  }
  if (pathLower === "/llms-full.txt") {
    return serveStatic(getLlmsFullTxt(), "text/plain; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/ai.txt" || pathLower === "/ai.txt") {
    return serveStatic(AI_TXT, "text/plain; charset=utf-8", "agent-api");
  }

  // Bot prerender path
  const isBot = BOT_AGENTS.some((bot) => userAgent.includes(bot.toLowerCase()));
  const isIgnoredExt = extension.length && IGNORE_EXTENSIONS.includes(extension);

  if (isPrerender || !isBot || isIgnoredExt) {
    const response = await fetch(request);
    return injectHtml(response, pathname);
  }

  if (env && env.PRERENDER_TOKEN) {
    const newURL = `https://service.prerender.io/${request.url}`;
    const newHeaders = new Headers(request.headers);
    newHeaders.set("X-Prerender-Token", env.PRERENDER_TOKEN);
    newHeaders.set("X-Prerender-Int-Type", "CloudFlare");
    const prerenderResponse = await fetch(new Request(newURL, { headers: newHeaders, redirect: "manual" }));
    const botHeaders = new Headers(prerenderResponse.headers);
    appendAgentLinks(botHeaders);
    applySecurityHeaders(botHeaders, "html");
    botHeaders.set("Vary", "Accept");
    botHeaders.set("Content-Language", "en");
    const canonicalUrl = getCanonicalForPath(pathname) || "https://turva.dev" + pathname;
    botHeaders.append("Link", `<${canonicalUrl}>; rel="alternate"; type="text/markdown"`);
    return new Response(prerenderResponse.body, {
      status: prerenderResponse.status,
      statusText: prerenderResponse.statusText,
      headers: botHeaders
    });
  }

  const response = await fetch(request);
  return injectHtml(response, pathname);
}

export {
  worker_default as default
};
