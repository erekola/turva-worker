// src/worker.js
// turva.dev pretender v3.7.0 — x402-mesh.json now uses startuphub.ai spec (protocol/vendor_id/categories/registry_url)

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

const INDEXNOW_KEY = "9b7e4c21a8f3d65e0c1b9a4d7f2e8c63";

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

## Guides
- [Agent-readiness guides](https://turva.dev/guides)
- [What an agent-readiness audit is](https://turva.dev/guides/agent-readiness-audit)
- [llms.txt explained](https://turva.dev/guides/llms-txt)
- [MCP server cards explained](https://turva.dev/guides/mcp-server-card)
- [What agents.json is](https://turva.dev/guides/agents-json)
- [x402 and agent payments](https://turva.dev/guides/x402-agent-payments)
- [Response headers that help agents](https://turva.dev/guides/response-headers-for-agents)
- [SEO and agent-readiness are not the same](https://turva.dev/guides/seo-vs-agent-readiness)
- [JSON-LD and structured data for agents](https://turva.dev/guides/json-ld-structured-data)
- [The /.well-known directory for agents](https://turva.dev/guides/well-known-for-agents)
- [How agents authenticate](https://turva.dev/guides/agent-authentication)
- [Why agent-readiness should be measured, not asserted](https://turva.dev/guides/measurement-led-agent-readiness)
- [Prerendering and why agents see empty pages](https://turva.dev/guides/prerendering-for-agents)
- [Sitemaps, robots.txt and agent access](https://turva.dev/guides/sitemaps-and-robots-for-agents)
- [Serving markdown to agents](https://turva.dev/guides/markdown-for-agents)
- [Common agent-readiness gaps on marketing sites](https://turva.dev/guides/agent-readiness-gaps)

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
- OpenAPI: https://turva.dev/openapi.json
- MCP Server Card: https://turva.dev/.well-known/mcp/server-card.json
- MCP Endpoint: https://mcp.turva.dev/mcp
- Agent Skills index: https://turva.dev/.well-known/agent-skills/index.json
- OAuth Authorization Server: https://turva.dev/.well-known/oauth-authorization-server
- OAuth Protected Resource: https://turva.dev/.well-known/oauth-protected-resource
- AP2: https://turva.dev/.well-known/ap2
- ACP: https://turva.dev/.well-known/acp
- x402 endpoint: https://turva.dev/x402
- x402 manifest: https://turva.dev/.well-known/x402
- x402-mesh: https://turva.dev/.well-known/x402-mesh.json
- MPP: https://turva.dev/.well-known/mpp
- UCP: https://turva.dev/.well-known/ucp
- Full content: https://turva.dev/llms-full.txt
- Security contact: https://turva.dev/.well-known/security.txt
- AI policy: https://turva.dev/.well-known/ai.txt
`;

var AUTH_MD = `# Auth.md

> Agent registration metadata for turva.dev.
> Public read-only. No accounts. No issued credentials.
> Operator contact: <mailto:info@turva.dev>.

## Agent registration

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

- anonymous — API key issued out-of-band on request
- identity_assertion — verified email or signed assertion

## Credential types

- api_key (anonymous)
- access_token (identity_assertion)

## Registration

POST a JSON document to https://turva.dev/agent/auth/register
or email <mailto:info@turva.dev?subject=agent%20registration> with:

- Agent identifier and software name
- Operator name and legal entity
- Purpose of access (research, integration, monitoring)
- Expected request rate (per hour) and concurrency
- Public contact for the operator

A written acknowledgement is sent within one business day.

## Claim

To claim an existing identifier, use https://turva.dev/agent/auth/claim
or email <mailto:info@turva.dev?subject=agent%20claim>. Include proof of
operator control (DNS TXT, signed message from a known GitHub
account, or a verified company email).

## Revocation

To revoke prior correspondence or request deletion of stored
metadata, use https://turva.dev/agent/auth/revoke
or email <mailto:info@turva.dev?subject=agent%20revocation>.
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

## Guides
- [Agent-readiness guides](https://turva.dev/guides)
- [What an agent-readiness audit is](https://turva.dev/guides/agent-readiness-audit)
- [llms.txt explained](https://turva.dev/guides/llms-txt)
- [MCP server cards explained](https://turva.dev/guides/mcp-server-card)
- [What agents.json is](https://turva.dev/guides/agents-json)
- [x402 and agent payments](https://turva.dev/guides/x402-agent-payments)
- [Response headers that help agents](https://turva.dev/guides/response-headers-for-agents)
- [SEO and agent-readiness are not the same](https://turva.dev/guides/seo-vs-agent-readiness)
- [JSON-LD and structured data for agents](https://turva.dev/guides/json-ld-structured-data)
- [The /.well-known directory for agents](https://turva.dev/guides/well-known-for-agents)
- [How agents authenticate](https://turva.dev/guides/agent-authentication)
- [Why agent-readiness should be measured, not asserted](https://turva.dev/guides/measurement-led-agent-readiness)
- [Prerendering and why agents see empty pages](https://turva.dev/guides/prerendering-for-agents)
- [Sitemaps, robots.txt and agent access](https://turva.dev/guides/sitemaps-and-robots-for-agents)
- [Serving markdown to agents](https://turva.dev/guides/markdown-for-agents)
- [Common agent-readiness gaps on marketing sites](https://turva.dev/guides/agent-readiness-gaps)
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

All prices exclude VAT. 25,5% for Finnish customers, reverse charge
for EU B2B, 0% for non-EU.
`,

  "/company": `# Company

turva.dev is operated by Erik Rekola.

## Business details

- **Trade name:** turva.dev
- **Business ID:** 3600281-7
- **Country of registration:** Finland
- **Form:** Sole proprietorship

## About the operator

Erik has eleven years of experience as an engineer in industrial
settings, including roles at UPM, Franke, Thermo Fisher Scientific
and ASM International.

The work covered measurement, process engineering and the
documentation of complex systems. The same approach now applies to
a different subject: how websites and APIs are read by AI agents.

## Location

Tampere, Pirkanmaa, Finland.
All work is delivered remotely. No on-site engagements.

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

## Invoicing

Payment terms are fourteen days net unless agreed otherwise in
writing.

VAT is added to invoices according to Finnish law. Reverse charge
applies to EU B2B customers with a valid VAT ID. Non-EU customers
are invoiced without VAT.`,

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

**Payment.** Payment terms are fourteen days net. Late payment
interest follows Finnish law.

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
`,

  "/guides": `# Agent-readiness guides

Short, focused explanations of the surfaces that decide whether an AI agent can discover, read, and act on a website or an API. Each guide covers one topic.

## Discovery and content
- [What an agent-readiness audit is](https://turva.dev/guides/agent-readiness-audit)
- [llms.txt explained](https://turva.dev/guides/llms-txt)
- [Serving markdown to agents](https://turva.dev/guides/markdown-for-agents)
- [Sitemaps, robots.txt and agent access](https://turva.dev/guides/sitemaps-and-robots-for-agents)
- [Response headers that help agents](https://turva.dev/guides/response-headers-for-agents)
- [Prerendering and why agents see empty pages](https://turva.dev/guides/prerendering-for-agents)

## Capability and trust
- [MCP server cards explained](https://turva.dev/guides/mcp-server-card)
- [What agents.json is](https://turva.dev/guides/agents-json)
- [The /.well-known directory for agents](https://turva.dev/guides/well-known-for-agents)
- [How agents authenticate](https://turva.dev/guides/agent-authentication)
- [JSON-LD and structured data for agents](https://turva.dev/guides/json-ld-structured-data)

## Commerce and strategy
- [x402 and agent payments](https://turva.dev/guides/x402-agent-payments)
- [SEO and agent-readiness are not the same](https://turva.dev/guides/seo-vs-agent-readiness)
- [Why agent-readiness should be measured, not asserted](https://turva.dev/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps on marketing sites](https://turva.dev/guides/agent-readiness-gaps)

## Frequently asked

### What is an agent-readiness audit?
An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API, scored against current standards by an independent scanner rather than a self-assessment.

### Do I need llms.txt on my site?
If you want models and agents to read your real content rather than guess from a cached snippet, llms.txt gives them a curated map of what matters. It does not replace robots.txt or a sitemap, it complements them.

### How do I get my site cited by AI assistants?
A model cites content it can read cleanly and corroborate. That means machine-readable surfaces such as llms.txt and structured data, a markdown form that does not exhaust the token budget, and being indexed where the assistant searches.

### What is an MCP server card?
An MCP server card is a JSON file, usually at /.well-known/mcp/server-card.json, that lets an agent discover a site's Model Context Protocol server and the tools it exposes, so the agent can call them without a human wiring up the connection.

### Is agent-readiness the same as SEO?
No. SEO makes a site rank for a person to click. Agent-readiness makes a site legible and usable by an agent that reads and acts. A site can rank well and still be opaque to agents.

### How is agent-readiness measured?
By an independent scanner that reads the live site and reports a score with a category breakdown. The categories that get fixed read higher on the next scan, so the claim is the number rather than an assertion.

For an audit, contact info@turva.dev.
`,

  "/guides/agent-readiness-audit": `# What an agent-readiness audit is

An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API. It is a technical review of the surfaces that automated clients actually use, scored against current standards rather than opinion.

Most sites are built for human readers and search crawlers. AI agents read differently. They look for machine-readable entry points such as llms.txt, a sitemap, response headers, structured data, and well-known manifests. When those are missing, the agent either guesses or gives up, and the site becomes invisible to that class of client even when the underlying product is strong.

The audit checks the parts an agent reaches first. Discovery covers robots.txt, the sitemap, and the response headers that let an agent find resources without parsing a full HTML page. Content covers llms.txt, markdown content negotiation, and whether the site can return a clean text version that saves an agent most of the tokens an HTML page would cost. Capabilities cover an MCP server card, an OpenAPI description, an API catalog, and OAuth discovery, so an agent can enumerate what the site offers and authenticate safely. Commerce covers payment surfaces such as x402 and structured pricing, so an agent can transact. Access control and quality cover the headers, signals, and metadata that tell an agent how it is allowed to behave.

The result is a list. Each check passes or fails, and each failure comes with a concrete fix. The point is that the outcome is verifiable. An independent scanner reads the site before and after, and the categories that were fixed read higher on the next scan. The claim is the number, not an assertion.

turva.dev applies the same standard to its own site. Measured by independent scanners, turva.dev is first among the publicly-scanned sites on the startuphub.ai agent-readiness leaderboard and reaches Level 5 on isitagentready.com. The audit a client receives runs the same checks against their site.

For an audit, contact info@turva.dev. Engagement is async and evidence-based, and production credentials are not requested.
`,

  "/guides/llms-txt": `# llms.txt explained

llms.txt is a plain text file at the root of a site that tells AI agents and language models what the site contains and where the important content lives. It works like a guide written for machines. A human reads the rendered page, an agent reads llms.txt and follows the links it lists.

The format is simple. The file opens with the site name and a short summary, then lists the key pages and resources as markdown links, often grouped under headings. Some sites also publish llms-full.txt, a single file that bundles the full text of the site so an agent can read everything in one request instead of crawling many pages.

The reason it matters is cost and clarity. A normal HTML page carries navigation, scripts, and styling that an agent has to wade through, and that spends tokens and invites mistakes. A llms.txt file, paired with markdown content negotiation, lets an agent fetch a clean text version and skip the noise. On turva.dev the markdown version of a page costs a small fraction of the HTML, which is the difference between an agent reading the page reliably and an agent truncating it.

llms.txt is not a ranking trick and it does not replace a sitemap or robots.txt. A sitemap lists every URL for crawlers. robots.txt sets crawl rules. llms.txt is a curated, human-written map of what matters, aimed at models. The three work together.

Whether a site needs one depends on whether it wants to be legible to agents. If buyers, researchers, or assistants will ever ask a model about what the site does, a clear llms.txt raises the odds that the model reads the real content rather than guessing from a cached snippet.

turva.dev publishes llms.txt and llms-full.txt and serves markdown on request. For an audit of how legible a site is to agents, contact info@turva.dev.
`,

  "/guides/mcp-server-card": `# MCP server cards explained

An MCP server card is a small JSON file that describes a site's Model Context Protocol server so an agent can find it and learn what it offers. It usually lives at /.well-known/mcp/server-card.json. An agent reads the card, sees which tools the server exposes, and can then call them without a human wiring up the connection first.

The Model Context Protocol is a standard way for agents to use external tools and data. A server implements the protocol and exposes a set of tools, and the card is how that server announces itself. Without a card, an agent has no reliable way to discover that the server exists or what it can do, so the capability stays hidden even when it is live.

A useful card states the server name, the endpoint, and the tools available, in a shape an agent can parse deterministically. turva.dev publishes a server card that points to a read-only MCP server, which exposes the same agent-readiness data that the site shows to people. That means an agent can query the data directly rather than scraping a page.

A server card sits in the same family as other well-known manifests an agent looks for, such as an API catalog, an OpenAPI description, and OAuth discovery. Each one removes a guess. The card answers what tools exist, the API catalog answers what endpoints exist, and OAuth discovery answers how to authenticate. Together they let an agent move from finding a site to operating it.

For sites that want to expose a capability to agents, the card is the cheapest high-value step, because it turns an invisible server into a discoverable one. For an audit of a site's capability surface, contact info@turva.dev.
`,

  "/guides/agents-json": `# What agents.json is

agents.json is a machine-readable file that declares what an AI agent can do on a site and how. Where llms.txt tells an agent what the site contains, agents.json describes the actions and endpoints an agent is allowed to use, so an automated client can move from reading to doing without a human wiring it up.

The file lists the operations a site exposes to agents, often pointing at an OpenAPI description or specific endpoints, along with the authentication an agent needs. An agent reads it, learns which actions exist, and calls them within the rules the site sets.

The reason it matters is that most sites expose actions only through a human interface, a form or a checkout flow that a person clicks through. An agent cannot reliably reverse-engineer that. A declared action surface removes the guesswork and turns a site from something an agent can read into something an agent can operate.

agents.json sits beside the other declarations an agent looks for. An MCP server card lists tools, an API catalog lists endpoints, and OAuth discovery describes how to authenticate. Each one removes a guess, and together they let an agent act on a user's behalf safely.

A site does not need agents.json to be readable, but it needs something like it to be operable. If the goal is for agents to complete tasks rather than just summarise the page, declaring the action surface is the step that makes that possible.

For an audit of a site's capability and action surface, contact info@turva.dev.
`,

  "/guides/x402-agent-payments": `# x402 and agent payments

x402 is a way for a site to ask an agent to pay before it returns a resource, using the long-reserved HTTP 402 Payment Required status. It lets an automated client discover a price, pay, and continue, without a human stepping in to enter card details.

When an agent requests a paid resource, the server responds with 402 and a manifest that states what is being sold and how to pay. The agent reads the terms, completes the payment through a supported method, and retries the request. The transaction happens in the protocol, not in a checkout page built for human eyes.

This matters because agent commerce is held back by payment, not by capability. An agent can find a product and compare options, then stall at a checkout flow designed for a person with a browser. A declared payment surface such as x402, paired with structured pricing in the page data, lets the agent complete the purchase the same way it completed the search.

x402 belongs to a small family of agent payment standards, alongside agent payments discovery such as AP2. A site that publishes these signals tells agents that it is open for automated business, and in the case of the open peer pricelist model, it can be shown alongside other options at the moment an agent decides where to spend.

turva.dev publishes an x402 endpoint and manifest and participates in the x402-mesh peer pricelist. For an audit of a site's commerce surface for agents, contact info@turva.dev.
`,

  "/guides/response-headers-for-agents": `# Response headers that help agents

Response headers are the metadata a server sends with every page, and the right ones let an AI agent work without parsing the full HTML. They are the cheapest place to make a site more legible to automated clients, because an agent reads them before it reads the body.

A Link header can point an agent straight at a site's machine-readable resources, such as an API catalog or a markdown version of the page, so the agent finds them without crawling. A Vary header that includes Accept tells caches and agents that the site can return different formats for the same URL, which is what makes markdown content negotiation reliable. RateLimit headers let a well-behaved agent throttle itself instead of guessing. Content-Language and a clean content type remove ambiguity about what the agent is reading.

The reason headers matter is order. An agent fetches the response, reads the status and headers first, and decides what to do next from them. If the headers already say where the structured data is and what formats are available, the agent can skip the expensive step of parsing a page built for human display.

Headers are easy to get wrong in ways that hurt agents. A missing Vary header breaks content negotiation. An immutable header set on the wrong response can stop an agent from seeing an update. The fix is usually small and lives at the edge, which on turva.dev is a Cloudflare Worker that sets these headers on every response.

For an audit of a site's response and discovery surface, contact info@turva.dev.
`,

  "/guides/seo-vs-agent-readiness": `# SEO and agent-readiness are not the same

Search engine optimisation makes a site rank in a list of links for a person to click. Agent-readiness makes a site legible and usable by an AI agent that reads, decides, and sometimes acts on the user's behalf. The two overlap, but optimising for one does not deliver the other.

SEO is built around keywords, backlinks, and a results page where a human chooses. The page is the destination. Agent-readiness is built around machine-readable surfaces such as llms.txt, structured data, response headers, and well-known manifests, where the agent is the reader and the page may never be seen by a person at all. A site can rank well on Google and still be opaque to an agent, and a site can be highly legible to agents while ranking modestly in classic search.

The gap is widening as people ask assistants instead of typing queries. When an answer comes from a model rather than a list of links, the question is not where a site ranks but whether the model can read the site cleanly and is willing to cite it. That depends on the discovery and content surface, not on the usual ranking signals.

This is why ranking on a search engine does not predict presence in an AI answer. They are scored on different things. A site that wants both has to do both, and the agent-readiness side is the one most teams have not started.

turva.dev measures the agent-readiness side and reports exactly which checks pass or fail. For an audit, contact info@turva.dev.
`,

  "/guides/json-ld-structured-data": `# JSON-LD and structured data for agents

JSON-LD is a block of structured data in a page that states facts in a form a machine can read without interpreting prose. It tells an agent what the page is about, who runs it, what it sells, and at what price, as data rather than as sentences an agent has to parse and might misread.

A human reads a price from a layout and a currency symbol. An agent reading raw HTML has to guess which number is the price and which is a shipping estimate. A JSON-LD Offer with a price and a currency removes the guess. The same applies to the organisation behind a site, the services it offers, and the questions it answers, each expressed as a typed object an agent can rely on.

Structured data also connects a page to the wider graph an agent builds. Declared types such as Organization, Service, FAQPage, and Article let an agent place a page in context and decide whether to trust and cite it. A page that states its facts as data is easier for a model to summarise correctly and to attribute.

The cost of getting it wrong is silent. An agent does not report that it failed to parse a price, it just acts on a worse guess. Clean JSON-LD is one of the cheapest ways to make a page legible, and it sits in the same family as the response headers and well-known manifests an agent reads first.

turva.dev declares JSON-LD for its organisation, the people behind it, its services, and its guides, and the next scan reads the structured data as present. For an audit of a site's structured data, contact info@turva.dev.
`,

  "/guides/well-known-for-agents": `# The /.well-known directory for agents

The /.well-known directory is a standard place at the root of a site where agents look for machine-readable descriptions of what the site offers. Instead of crawling pages and guessing, an agent fetches a predictable path and reads a manifest that points it to everything else.

The idea comes from a long-standing web convention and now carries the files agents care about. An API catalog at a well-known path, defined by RFC 9727, lets an agent enumerate a site's public APIs from a single URL. A server card describes an MCP server and its tools. OAuth metadata describes how to authenticate. Payment and agent-payment manifests describe how to transact. security.txt says where to report a problem.

The value is that discovery becomes a lookup rather than a search. An agent that knows the convention can ask one predictable question and get a map, which is faster and far more reliable than inferring structure from rendered HTML. A site that publishes a complete well-known surface is announcing its capabilities in the language agents already speak.

A missing or thin well-known directory does not break a site for people, but it leaves an agent to guess, and most agents will simply move on. Publishing the manifests an agent expects is the difference between a capability that exists and a capability an agent can find.

turva.dev publishes an API catalog, a server card, OAuth metadata, payment manifests, and a security contact under /.well-known. For an audit of a site's discovery surface, contact info@turva.dev.
`,

  "/guides/agent-authentication": `# How agents authenticate

Agent authentication is how an automated client proves who it is and gains scoped access to a site, without a human logging in first. It is the step that turns a read-only agent into one that can act on a user's behalf, and it has to be discoverable or the agent cannot begin.

The pattern follows existing standards. OAuth discovery at a well-known path tells an agent where to request access and what scopes exist. An authorization server and a protected resource description let the agent ask for a token tied to a specific permission rather than a blanket login. When a site also advertises an agent registration flow, an agent can register and claim access on a user's behalf without someone provisioning credentials by hand.

The reason this matters is trust and blast radius. A site that exposes capability without scoped, discoverable auth either stays closed to agents or invites unsafe workarounds. Proper discovery lets an agent request the least access it needs, and lets the site grant capability without handing over a password the agent should never see.

A short auth description, sometimes published as an auth.md, gives an agent a human-readable entry point to the same flow. Together with OAuth discovery it answers the agent's first question about any action, which is how do I get permission to do this safely.

turva.dev publishes OAuth discovery, a protected resource description, and an agent registration entry point, and it never requests production credentials in an engagement. For an audit of a site's authentication surface, contact info@turva.dev.
`,

  "/guides/measurement-led-agent-readiness": `# Why agent-readiness should be measured, not asserted

Agent-readiness is a property you can measure, so it should be measured rather than claimed. A checklist that a team fills in by hand records intentions. An independent scanner records what an agent actually finds when it reads the site, and those two often disagree.

The difference shows up the moment something changes. A header gets dropped in a deploy, or a manifest starts returning the wrong content type. A self-assessment still reads as done, because nobody re-ticked the box. A scan reads the live site and the category drops, which is the only signal that matches what an agent experiences.

Measurement also makes a result legible to a buyer. A claim that a site is agent-ready is an assertion. A score from an independent scanner, with a category breakdown and a date, is evidence that can be checked. The honest version of the claim is the number, and the number can be re-run by anyone.

This is the standard turva.dev applies to its own site and to client sites. An audit reports the exact checks that pass or fail, each failure comes with a concrete fix, and the next scan reads higher in the categories the report named. Measured by independent scanners, turva.dev is first among the publicly-scanned sites on the startuphub.ai agent-readiness leaderboard and reaches Level 5 on isitagentready.com.

For an audit that reports measured results rather than a checklist, contact info@turva.dev.
`,

  "/guides/prerendering-for-agents": `# Prerendering and why agents see empty pages

Many sites render their content with JavaScript in the browser, which means the first response an agent receives is an almost empty shell. A person waits a moment and the page fills in. An agent that reads the raw response sees a loading state and little else, and it judges the site on that.

This is the single most common reason a capable site is invisible to agents. The content exists, but it arrives after the agent has already read and moved on. Search crawlers have partly adapted to this over years. Many AI agents and fetchers have not, and they take the first response at face value.

The fix is to serve the real content in the first response for clients that need it. Prerendering renders the page on the server or at the edge and returns finished HTML, so an agent reads the content immediately. A cleaner option for agents is to serve a markdown version of the page on request, which skips the rendering question entirely and costs a fraction of the tokens.

The decision is not all or nothing. A site can keep its interactive experience for people and serve prerendered or markdown content to agents and bots, deciding by the request. On turva.dev that decision lives in a Cloudflare Worker that detects the client and returns the right form.

For an audit of how a site renders for agents, contact info@turva.dev.
`,

  "/guides/sitemaps-and-robots-for-agents": `# Sitemaps, robots.txt and agent access

robots.txt and the sitemap are the oldest machine-readable files on the web, and they still decide whether an agent is allowed in and what it can find. An agent reads robots.txt to learn the rules and the sitemap to learn the map, before it reads any page.

robots.txt does two jobs for agents. It sets crawl rules, and it can name AI crawlers explicitly, so a site states whether it welcomes GPTBot and similar clients rather than leaving them to guess. A Content-Signal directive can go further and declare how content may be used, separating ordinary search from AI input and training, which gives a site granular control instead of an all-or-nothing block.

The sitemap answers the other question, which is what exists. A complete sitemap lists every canonical URL with a last-modified date, so an agent can find the real pages without inferring them from navigation. A page that is not in the sitemap is a page an agent may never reach.

Getting these wrong is quietly expensive. A robots.txt that blocks an AI crawler by accident removes a site from that assistant's answers. A stale sitemap hides new pages. The files are small and the fix is fast, which is why they are the first thing a readiness review checks.

turva.dev declares AI bot rules and Content Signals in robots.txt and keeps a complete sitemap. For an audit of a site's crawl and access surface, contact info@turva.dev.
`,

  "/guides/markdown-for-agents": `# Serving markdown to agents

An HTML page is built for a browser, and an agent that reads it pays for all the markup, scripts, and layout it does not need. Serving a markdown version of the same page gives an agent the content without the wrapper, which is both cheaper and less error-prone.

The mechanism is content negotiation. An agent sends an Accept header asking for text/markdown, and the server returns the markdown form of the page at the same URL. A site can also publish llms-full.txt, a single file that bundles the whole site as text, so an agent can read everything in one request instead of fetching many pages.

The saving is large. On turva.dev the markdown form of a page costs a small fraction of the tokens the HTML would, and the difference decides whether an agent reads a page in full or truncates it halfway. A model that runs out of budget on markup is a model that answers from a partial reading.

Markdown delivery is not a separate site, it is the same content offered in a second form. The page stays as it is for people, and an agent that asks for text gets text. Paired with a clear llms.txt that lists where the content lives, it makes a site fast and reliable to read at machine speed.

turva.dev serves markdown on request and publishes llms.txt and llms-full.txt. For an audit of a site's content surface for agents, contact info@turva.dev.
`,

  "/guides/agent-readiness-gaps": `# Common agent-readiness gaps on marketing sites

Most marketing sites are strong for people and weak for agents, and the gaps are predictable. A readiness review tends to find the same handful of misses, each of which quietly removes the site from an agent's view.

The first is rendering. A site that builds its content with JavaScript returns an empty shell to an agent, so the content never arrives in the first response. The second is discovery. No llms.txt and a thin or missing sitemap, so an agent has nothing to read but rendered pages. The third is cost. Only HTML is offered, with no markdown form, so an agent spends its budget on markup and truncates the page.

Beyond those, capability is usually undeclared. The site may have an API or a useful action, but with no server card or OAuth discovery, an agent cannot find or use it. Structured data is often missing too, so prices and facts are left for the agent to infer from layout.

None of these are hard to fix, and that is the point. The work is mostly at the edge and in a few small files, and the result shows up immediately in a scanner. A site does not have to rebuild to become legible to agents, it has to publish what agents already look for.

turva.dev runs this exact review and reports each gap with a concrete fix. For an audit, contact info@turva.dev.
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
X402: https://turva.dev/x402
X402-Manifest: https://turva.dev/.well-known/x402
X402-Mesh: https://turva.dev/.well-known/x402-mesh.json
Mpp: https://turva.dev/.well-known/mpp
Ucp: https://turva.dev/.well-known/ucp
Openapi: https://turva.dev/openapi.json
`;

var SECURITY_TXT = `Contact: mailto:info@turva.dev
Expires: 2027-05-28T00:00:00.000Z
Preferred-Languages: en
Canonical: https://turva.dev/.well-known/security.txt
Policy: https://turva.dev/legal
`;

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
    credential_types_supported: ["access_token", "api_key"]
  },
  supported_identity_types: ["anonymous", "identity_assertion", "email", "github", "linkedin"],
  supported_credential_types: ["api_key", "access_token"],
  events_supported: [
    "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked"
  ]
};

var API_CATALOG = JSON.stringify({
  "linkset": [{
    "anchor": "https://turva.dev/",
    "service-desc": [{ "href": "https://turva.dev/openapi.json", "type": "application/json" }],
    "service-doc": [
      { "href": "https://turva.dev/llms.txt", "type": "text/plain" },
      { "href": "https://turva.dev/llms-full.txt", "type": "text/plain" },
      { "href": "https://turva.dev/auth.md", "type": "text/markdown", "title": "Agent registration" },
      { "href": "https://turva.dev/", "type": "text/html" }
    ],
    "service-meta": [
      { "href": "https://turva.dev/.well-known/mcp/server-card.json", "type": "application/json", "title": "MCP Server Card" },
      { "href": "https://turva.dev/.well-known/agent-skills/index.json", "type": "application/json", "title": "Agent Skills Index" },
      { "href": "https://turva.dev/.well-known/oauth-authorization-server", "type": "application/json", "title": "OAuth Authorization Server" },
      { "href": "https://turva.dev/.well-known/oauth-protected-resource", "type": "application/json", "title": "OAuth Protected Resource Metadata" },
      { "href": "https://turva.dev/.well-known/ap2", "type": "application/json", "title": "AP2 manifest" },
      { "href": "https://turva.dev/.well-known/acp", "type": "application/json", "title": "ACP manifest" },
      { "href": "https://turva.dev/x402", "type": "application/json", "title": "x402 endpoint (HTTP 402)" },
      { "href": "https://turva.dev/.well-known/x402", "type": "application/json", "title": "x402 manifest" },
      { "href": "https://turva.dev/.well-known/x402-mesh.json", "type": "application/json", "title": "x402-mesh" },
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
    "version": "3.7.0",
    "description": "Read-only metadata + payable endpoints for AI agents. MPP + x402 + ACP enabled on /api/agent/* routes.",
    "contact": { "name": "Erik Rekola", "email": "info@turva.dev", "url": "https://turva.dev/" },
    "license": { "name": "Proprietary", "url": "https://turva.dev/legal" }
  },
  "servers": [{ "url": "https://turva.dev" }],
  "x-payment-protocols": ["x402", "mpp", "acp"],
  "paths": {
    "/api/agent/audit": {
      "post": {
        "summary": "Order an agent-readiness audit",
        "operationId": "orderAudit",
        "x-payment-info": {
          "intent": "charge",
          "method": "stripe",
          "amount": 650000,
          "currency": "EUR",
          "description": "Audit — fixed scope, 2-3 weeks",
          "x402": {
            "network": "base",
            "asset": "USDC",
            "amount": "6500000000",
            "scheme": "exact"
          }
        },
        "responses": {
          "402": { "description": "Payment Required (x402)" },
          "200": { "description": "Audit ordered" }
        }
      }
    },
    "/api/agent/advisory": {
      "post": {
        "summary": "Subscribe to monthly advisory",
        "operationId": "subscribeAdvisory",
        "x-payment-info": {
          "intent": "session",
          "method": "stripe",
          "amount": 300000,
          "currency": "EUR",
          "interval": "month",
          "description": "Advisory — monthly retainer (min 3 months)",
          "x402": {
            "network": "base",
            "asset": "USDC",
            "amount": "3000000000",
            "scheme": "exact"
          }
        },
        "responses": {
          "402": { "description": "Payment Required (x402)" },
          "200": { "description": "Subscription created" }
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
          "amount": 150000,
          "currency": "EUR",
          "description": "Implementation — per day, scoped per task",
          "x402": {
            "network": "base",
            "asset": "USDC",
            "amount": "1500000000",
            "scheme": "exact"
          }
        },
        "responses": {
          "402": { "description": "Payment Required (x402)" },
          "200": { "description": "Day booked" }
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
    "/.well-known/security.txt": { "get": { "summary": "Security", "operationId": "getSecurity", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/oauth-authorization-server": { "get": { "summary": "OAuth Authorization Server Metadata", "operationId": "getOauthDiscovery", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/oauth-protected-resource": { "get": { "summary": "OAuth Protected Resource Metadata", "operationId": "getOauthProtectedResource", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/ap2": { "get": { "summary": "AP2 manifest", "operationId": "getAp2", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/acp": { "get": { "summary": "ACP manifest", "operationId": "getAcp", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/x402": { "get": { "summary": "x402 discovery manifest", "operationId": "getX402", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/x402-mesh.json": { "get": { "summary": "x402-mesh", "operationId": "getX402Mesh", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/mpp": { "get": { "summary": "MPP discovery", "operationId": "getMpp", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/ucp": { "get": { "summary": "UCP profile", "operationId": "getUcp", "responses": { "200": { "description": "ok" } } } }
  }
}, null, 2);

var AGENT_JSON = JSON.stringify({
  "schema_version": "v1",
  "name": "turva.dev",
  "name_for_human": "turva.dev",
  "name_for_model": "turva_dev",
  "description_for_human": "Agent-readiness audits and advisory for product teams.",
  "description_for_model": "turva.dev provides agent-readiness audits and advisory for product teams. Independent scanners measure the site or API, a written report names the prioritized fixes, the next scan verifies the result. Async-only engagement. Pricing (EUR, VAT not included): Audit €6,500 (fixed, 2-3 weeks), Advisory €3,000/month (minimum 3 months), Implementation €1,500/day (scoped per task). Pages support Accept: text/markdown.",
  "contact_email": "info@turva.dev",
  "legal_info_url": "https://turva.dev/legal",
  "logo_url": "https://turva.dev/og.jpg",
  "auth": { "type": "none" },
  "api": { "type": "openapi", "url": "https://turva.dev/openapi.json" }
}, null, 2);

// --- signed manifests (provenance) ---
var JWKS_JSON = "{\n  \"keys\": [\n    {\n      \"kty\": \"OKP\",\n      \"crv\": \"Ed25519\",\n      \"x\": \"fZpH2DFoup6FI_leaxJWrvpfP4xf8gPLjh6okbFOrJU\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"use\": \"sig\",\n      \"alg\": \"EdDSA\"\n    }\n  ]\n}";
var SIGNATURES_JSON = "{\n  \"keys\": \"https://turva.dev/.well-known/jwks.json\",\n  \"signatures\": {\n    \"/.well-known/ai-plugin.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"YAxS8xV_WjZjvCZIzCL97M-lgOEQNOKUuZ0puIknxRbxQw6HnjdtTKHiXRj3AXZ98tWugfq6y9EWpwQBhGeDCw\"\n    },\n    \"/.well-known/agent.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"YAxS8xV_WjZjvCZIzCL97M-lgOEQNOKUuZ0puIknxRbxQw6HnjdtTKHiXRj3AXZ98tWugfq6y9EWpwQBhGeDCw\"\n    },\n    \"/.well-known/mcp/server-card.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"DEUupWZ1xbJxmuuGf_z0UBhc5du4wwL7BJROckH4ruFb6QJEhFeQEfXzT7UPwXgt7z3_xAy-I-nAMtie0q9uDg\"\n    },\n    \"/llms.txt\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"lqclS_sKw24-KVokrzd9M0Hd08Vc-3YNWLxeCq2p7ofWfd-m-zyM27yB9OyBW4EJCpNF83Rat1kHYNJAPaKtDw\"\n    }\n  }\n}";

var MCP_SERVER_CARD = JSON.stringify({
  "$schema": "https://modelcontextprotocol.io/schemas/server-card/2025-10.json",
  "serverInfo": {
    "name": "turva-mcp",
    "title": "turva.dev",
    "version": "3.7.0",
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
      "audit": { "price": 6500, "unit": "fixed", "duration": "2-3 weeks" },
      "advisory": { "price": 3000, "unit": "month", "minimumCommitment": "3 months" },
      "implementation": { "price": 1500, "unit": "day" }
    }
  }
}, null, 2);

var OAUTH_DISCOVERY = JSON.stringify({
  "issuer": "https://turva.dev",
  "authorization_endpoint": "https://turva.dev/oauth/authorize",
  "token_endpoint": "https://turva.dev/oauth/token",
  "registration_endpoint": "https://turva.dev/agent/auth/register",
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
  "resource_signing_alg_values_supported": ["RS256", "ES256"],
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
  "supported_rails": ["x402-base-usdc"],
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
  }
}, null, 2);

// ============================================================
// ACP — enriched capabilities.services
// ============================================================
var ACP_MANIFEST = JSON.stringify({
  "$schema": "https://agenticcommerce.dev/schemas/manifest/v1.json",
  "protocol": {
    "name": "acp",
    "version": "2025-09-29",
    "spec_url": "https://www.agenticcommerce.dev/"
  },
  "acp_version": "1.0",
  "api_base_url": "https://turva.dev/api/acp",
  "supported_transports": ["https", "http+json"],
  "transports": ["https", "http+json"],
  "merchant": {
    "id": "turva-dev",
    "name": "turva.dev",
    "legal_name": "Erik Rekola",
    "business_id": "3600281-7",
    "country": "FI",
    "url": "https://turva.dev/",
    "category": "professional_services",
    "subcategory": "agent_readiness_consulting"
  },
  "capabilities": {
    "services": [
      {
        "id": "audit",
        "name": "Agent-readiness audit",
        "type": "one_time",
        "description": "Fixed scope, 2-3 weeks. Scanner sweep + manual review + written report.",
        "url": "https://turva.dev/services",
        "available": true,
        "price": { "amount": 650000, "currency": "EUR" },
        "currency": "EUR",
        "duration": "P3W"
      },
      {
        "id": "advisory",
        "name": "Continuous advisory",
        "type": "subscription",
        "interval": "month",
        "minimum_commitment_months": 3,
        "description": "Monthly re-scan, score delta report, written review, roadmap input.",
        "url": "https://turva.dev/services",
        "available": true,
        "price": { "amount": 300000, "currency": "EUR" },
        "currency": "EUR"
      },
      {
        "id": "implementation",
        "name": "Implementation day",
        "type": "one_time",
        "description": "Hands-on work, scoped per task.",
        "url": "https://turva.dev/services",
        "available": true,
        "price": { "amount": 150000, "currency": "EUR" },
        "currency": "EUR",
        "duration": "P1D"
      }
    ],
    "checkout": true,
    "instant_checkout_enabled": false,
    "quote_on_request": true,
    "payment": {
      "providers": ["stripe", "x402"],
      "x402": { "network": "base", "asset": "USDC" }
    }
  },
  "checkout_configuration": {
    "instant_checkout_enabled": false,
    "guest_checkout_allowed": true,
    "requires_shipping": false,
    "digital_delivery": true,
    "supported_currencies": ["EUR", "USD"],
    "tax_handling": "merchant_calculated"
  },
  "payment_methods": {
    "stripe": { "enabled": false },
    "x402": {
      "enabled": true,
      "network": "base",
      "asset": "USDC"
    },
    "invoice": {
      "enabled": true,
      "terms": "net 14"
    }
  },
  "agent_permissions": {
    "can_view_catalog": true,
    "can_request_quote": true,
    "can_initiate_checkout": false,
    "can_complete_purchase": false,
    "requires_user_confirmation": true
  },
  "contact": {
    "email": "info@turva.dev",
    "signal": "@turva.19",
    "languages": ["en"]
  }
}, null, 2);

// ============================================================
// X402 — manifest with full accepts[] array
// ============================================================
var X402_MANIFEST = JSON.stringify({
  "x402Version": 1,
  "version": 1,
  "endpoint": "https://turva.dev/x402",
  "network": "base",
  "asset": "USDC",
  "scheme": "exact",
  "accepts": [
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "1000",
      "resource": "https://turva.dev/x402",
      "description": "x402 discovery probe (0.001 USDC)",
      "mimeType": "application/json",
      "payTo": "0x023184fe62881ed1d938192b7a4b09d0119d7d39",
      "maxTimeoutSeconds": 300,
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "extra": { "name": "USDC", "version": "2" }
    },
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "6500000000",
      "resource": "https://turva.dev/api/agent/audit",
      "description": "Agent-readiness audit (€6,500 / 6500 USDC)",
      "mimeType": "application/json",
      "payTo": "0x023184fe62881ed1d938192b7a4b09d0119d7d39",
      "maxTimeoutSeconds": 300,
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "extra": { "name": "USDC", "version": "2" }
    },
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "3000000000",
      "resource": "https://turva.dev/api/agent/advisory",
      "description": "Monthly advisory (€3,000 / 3000 USDC)",
      "mimeType": "application/json",
      "payTo": "0x023184fe62881ed1d938192b7a4b09d0119d7d39",
      "maxTimeoutSeconds": 300,
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "extra": { "name": "USDC", "version": "2" }
    },
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "1500000000",
      "resource": "https://turva.dev/api/agent/implementation",
      "description": "Implementation day (€1,500 / 1500 USDC)",
      "mimeType": "application/json",
      "payTo": "0x023184fe62881ed1d938192b7a4b09d0119d7d39",
      "maxTimeoutSeconds": 300,
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "extra": { "name": "USDC", "version": "2" }
    }
  ],
  "resources": [
    "https://turva.dev/x402",
    "https://turva.dev/api/agent/audit",
    "https://turva.dev/api/agent/advisory",
    "https://turva.dev/api/agent/implementation"
  ],
  "facilitator": "https://x402.org/facilitator",
  "merchant": {
    "name": "turva.dev",
    "country": "FI",
    "contact": "mailto:info@turva.dev"
  }
}, null, 2);

var X402_INDEX_402 = JSON.stringify({
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "1000",
      "resource": "https://turva.dev/x402",
      "description": "Turva.dev x402 discovery probe. Agents pay 0.001 USDC on Base to GET this resource. The real payable services are /api/agent/audit, /advisory, /implementation.",
      "mimeType": "application/json",
      "payTo": "0x023184fe62881ed1d938192b7a4b09d0119d7d39",
      "maxTimeoutSeconds": 300,
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "extra": { "name": "USDC", "version": "2" }
    }
  ],
  "error": "Payment required to access this resource"
}, null, 2);

function build402Body(resource, label, amountUsdcMicro, amountEurCents, description) {
  return JSON.stringify({
    "x402Version": 1,
    "accepts": [
      {
        "scheme": "exact",
        "network": "base",
        "maxAmountRequired": amountUsdcMicro,
        "resource": resource,
        "description": description,
        "mimeType": "application/json",
        "payTo": "0x023184fe62881ed1d938192b7a4b09d0119d7d39",
        "maxTimeoutSeconds": 300,
        "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "extra": { "name": "USDC", "version": "2", "label": label, "eurCents": amountEurCents }
      }
    ],
    "error": "Payment required to access this resource"
  }, null, 2);
}

// ============================================================
// X402-MESH v3.7.0 — startuphub.ai x402-mesh/0.1 spec
// Required fields: protocol, vendor_id, categories, registry_url
// Wallet enables zero-friction on-chain referral payouts on Base
// ============================================================
var X402_MESH = JSON.stringify({
  "protocol": "x402-mesh/0.1",
  "vendor_id": "turva-dev",
  "name": "turva.dev",
  "categories": [
    "agent-readiness-audits",
    "agent-readiness-advisory",
    "agent-readiness-implementation"
  ],
  "registry_url": "https://www.startuphub.ai/api/x402-mesh/registry",
  "wallet": "0x023184fe62881ed1d938192b7a4b09d0119d7d39",
  "contact": "info@turva.dev",
  "self": {
    "vendor_id": "turva-dev",
    "name": "turva.dev — Agent-readiness audits and advisory",
    "category": "agent-readiness-audits",
    "endpoint": "https://turva.dev/api/agent/audit",
    "method": "POST",
    "price": { "amount_cents": 650000, "currency": "EUR", "unit": "flat" },
    "quality": { "accuracy": 1.0, "p95_latency_ms": 250 }
  },
  "alternatives": [],
  "settle": {
    "url": "https://www.startuphub.ai/api/x402-mesh/settle",
    "registry_url": "https://www.startuphub.ai/api/x402-mesh/registry"
  },
  "merchant": {
    "name": "turva.dev",
    "legal_name": "Erik Rekola",
    "business_id": "3600281-7",
    "country": "FI",
    "url": "https://turva.dev/",
    "contact": "mailto:info@turva.dev"
  },
  "endpoint": "https://turva.dev/x402",
  "discovery": "https://turva.dev/.well-known/x402",
  "peer_pricelist": [
    { "resource": "https://turva.dev/api/agent/audit",          "network": "base", "asset": "USDC", "amount": "6500000000" },
    { "resource": "https://turva.dev/api/agent/advisory",       "network": "base", "asset": "USDC", "amount": "3000000000" },
    { "resource": "https://turva.dev/api/agent/implementation", "network": "base", "asset": "USDC", "amount": "1500000000" }
  ]
}, null, 2);

var MPP_MANIFEST = JSON.stringify({
  "$schema": "https://mpp.dev/schemas/discovery/v1.json",
  "version": "1.0",
  "protocol": {
    "name": "Machine Payment Protocol",
    "id": "mpp",
    "version": "1.0",
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
    "model": "machine_payable",
    "machine_payable": true,
    "supported_rails": ["stripe", "x402-base-usdc"],
    "quote_channels": [
      { "type": "email", "value": "mailto:info@turva.dev?subject=Quote%20request" },
      { "type": "signal", "value": "@turva.19" }
    ],
    "typical_response_time": "P1D",
    "languages": ["en"]
  },
  "pricing": {
    "currency": "EUR",
    "vat_included": false,
    "items": [
      { "name": "Audit", "price": 6500, "unit": "fixed", "duration": "2-3 weeks" },
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
      "dev.ucp.discovery": [
        {
          "version": "2026-04-08",
          "spec": "https://ucp.dev/2026-04-08/specification/overview",
          "transport": "mcp",
          "endpoint": "https://mcp.turva.dev/mcp"
        },
        {
          "version": "2026-04-08",
          "spec": "https://ucp.dev/2026-04-08/specification/overview",
          "transport": "rest",
          "endpoint": "https://turva.dev/openapi.json",
          "schema": "https://turva.dev/openapi.json"
        }
      ],
      "dev.ucp.payment": [
        {
          "version": "2026-04-08",
          "transport": "x402",
          "endpoint": "https://turva.dev/x402"
        },
        {
          "version": "2026-04-08",
          "transport": "acp",
          "endpoint": "https://turva.dev/.well-known/acp"
        }
      ]
    },
    "capabilities": { "checkout": true, "machine_payable": true },
    "payment_handlers": {
      "x402": { "network": "base", "asset": "USDC" }
    },
    "pricing": {
      "currency": "EUR",
      "vat_included": false,
      "items": [
        { "name": "Audit", "price": 6500, "unit": "fixed" },
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
 <url><loc>https://turva.dev/guides</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
 <url><loc>https://turva.dev/guides/agent-readiness-audit</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/llms-txt</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/mcp-server-card</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/agents-json</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/x402-agent-payments</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/response-headers-for-agents</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/seo-vs-agent-readiness</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/json-ld-structured-data</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/well-known-for-agents</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/agent-authentication</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/measurement-led-agent-readiness</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/prerendering-for-agents</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/sitemaps-and-robots-for-agents</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/markdown-for-agents</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
 <url><loc>https://turva.dev/guides/agent-readiness-gaps</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>`;

var CANONICAL_PATHS = new Set(["/", "/services", "/company", "/contact", "/legal", "/guides", "/guides/agent-readiness-audit", "/guides/llms-txt", "/guides/mcp-server-card", "/guides/agents-json", "/guides/x402-agent-payments", "/guides/response-headers-for-agents", "/guides/seo-vs-agent-readiness", "/guides/json-ld-structured-data", "/guides/well-known-for-agents", "/guides/agent-authentication", "/guides/measurement-led-agent-readiness", "/guides/prerendering-for-agents", "/guides/sitemaps-and-robots-for-agents", "/guides/markdown-for-agents", "/guides/agent-readiness-gaps"]);

function getCanonicalForPath(pathname) {
  if (CANONICAL_PATHS.has(pathname)) {
    return "https://turva.dev" + pathname;
  }
  return null;
}

var META_BY_PATH = {
  "/": {
    title: "Agent-readiness audits and advisory · turva.dev",
    description: "Agent-readiness audits and advisory for product teams. Independent measurement of how readable your site and APIs are by AI agents. Async-only.",
    imageAlt: "Agent-readiness audits and advisory"
  },
  "/services": {
    title: "Services · turva.dev",
    description: "Audit €6,500, advisory €3,000/month, implementation €1,500/day. Agent-readiness work for product teams. Async-only, one business day response.",
    imageAlt: "turva.dev services and pricing"
  },
  "/company": {
    title: "Company · turva.dev",
    description: "turva.dev is operated by Erik Rekola as a Finnish sole proprietorship. Business ID 3600281-7, based in Tampere. Eleven years of engineering experience.",
    imageAlt: "turva.dev company information"
  },
  "/contact": {
    title: "Contact · turva.dev",
    description: "Contact turva.dev via email, Signal or LinkedIn. Async-only engagement. Response within one business day. No calls, no calendar links.",
    imageAlt: "Contact turva.dev"
  },
  "/legal": {
    title: "Legal · turva.dev",
    description: "Terms of engagement, privacy practices and GDPR information for turva.dev. Finnish law applies. No tracking, no analytics, no third-party scripts.",
    imageAlt: "Legal and privacy"
  },
  "/guides": {
    title: "Agent-readiness guides | turva.dev",
    description: "Short, focused guides on the surfaces that make a website or API readable and usable by AI agents. Audits, llms.txt, MCP, structured data, payments and more.",
    imageAlt: "Agent-readiness guides"
  },
  "/guides/agent-readiness-audit": {
    title: "What an agent-readiness audit is | turva.dev",
    description: "An agent-readiness audit measures how well AI agents can discover, read, and act on a website or API, scored against current standards by independent scanners.",
    imageAlt: "What an agent-readiness audit is"
  },
  "/guides/llms-txt": {
    title: "llms.txt explained | turva.dev",
    description: "llms.txt is a plain text guide that tells AI agents what a site contains and where its key content lives. What it is, why it matters, and how it differs from robots.txt and sitemaps.",
    imageAlt: "llms.txt explained"
  },
  "/guides/mcp-server-card": {
    title: "MCP server cards explained | turva.dev",
    description: "An MCP server card is a JSON file that lets agents discover a site's Model Context Protocol server and the tools it exposes. What it is and why it matters.",
    imageAlt: "MCP server cards explained"
  },
  "/guides/agents-json": {
    title: "What agents.json is | turva.dev",
    description: "agents.json declares the actions and endpoints an AI agent can use on a site, turning a readable site into an operable one. What it is and why it matters.",
    imageAlt: "What agents.json is"
  },
  "/guides/x402-agent-payments": {
    title: "x402 and agent payments | turva.dev",
    description: "x402 uses HTTP 402 Payment Required so AI agents can discover a price, pay, and continue without a human checkout. How agent payments work and why they matter.",
    imageAlt: "x402 and agent payments"
  },
  "/guides/response-headers-for-agents": {
    title: "Response headers that help agents | turva.dev",
    description: "The right HTTP response headers let AI agents work without parsing full HTML. Link, Vary, RateLimit and content type headers explained for agent-readiness.",
    imageAlt: "Response headers that help agents"
  },
  "/guides/seo-vs-agent-readiness": {
    title: "SEO and agent-readiness are not the same | turva.dev",
    description: "SEO makes a site rank for people to click. Agent-readiness makes a site legible and usable by AI agents. Why ranking on Google does not predict presence in AI answers.",
    imageAlt: "SEO and agent-readiness are not the same"
  },
  "/guides/json-ld-structured-data": {
    title: "JSON-LD and structured data for agents | turva.dev",
    description: "JSON-LD states a page's facts as data an AI agent can read without parsing prose. How structured data makes prices, organisations and services legible to agents.",
    imageAlt: "JSON-LD and structured data for agents"
  },
  "/guides/well-known-for-agents": {
    title: "The /.well-known directory for agents | turva.dev",
    description: "The /.well-known directory is where agents look for a site's machine-readable manifests, from the API catalog (RFC 9727) to server cards and OAuth metadata.",
    imageAlt: "The /.well-known directory for agents"
  },
  "/guides/agent-authentication": {
    title: "How agents authenticate | turva.dev",
    description: "Agent authentication lets an automated client gain scoped access without a human login. OAuth discovery, protected resources and agent registration explained.",
    imageAlt: "How agents authenticate"
  },
  "/guides/measurement-led-agent-readiness": {
    title: "Why agent-readiness should be measured, not asserted | turva.dev",
    description: "A hand-filled checklist records intentions. An independent scanner records what an agent actually finds. Why measured agent-readiness beats self-assessment.",
    imageAlt: "Why agent-readiness should be measured, not asserted"
  },
  "/guides/prerendering-for-agents": {
    title: "Prerendering and why agents see empty pages | turva.dev",
    description: "JavaScript-rendered sites return an empty shell to agents, so the content never arrives. Why prerendering and markdown delivery fix the most common agent gap.",
    imageAlt: "Prerendering and why agents see empty pages"
  },
  "/guides/sitemaps-and-robots-for-agents": {
    title: "Sitemaps, robots.txt and agent access | turva.dev",
    description: "robots.txt and the sitemap decide whether an agent is allowed in and what it can find. AI bot rules, Content Signals and complete sitemaps explained.",
    imageAlt: "Sitemaps, robots.txt and agent access"
  },
  "/guides/markdown-for-agents": {
    title: "Serving markdown to agents | turva.dev",
    description: "Serving a markdown version of a page gives agents the content without the markup, at a fraction of the tokens. How content negotiation and llms-full.txt work.",
    imageAlt: "Serving markdown to agents"
  },
  "/guides/agent-readiness-gaps": {
    title: "Common agent-readiness gaps on marketing sites | turva.dev",
    description: "Most marketing sites are strong for people and weak for agents. The predictable gaps in rendering, discovery, cost, capability and structured data, and how to fix them.",
    imageAlt: "Common agent-readiness gaps on marketing sites"
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
{"@type":"ProfessionalService","@id":"https://turva.dev/#business","name":"turva.dev","url":"https://turva.dev/","image":"https://turva.dev/og.jpg","description":"Independent agent-readiness audits and advisory for product teams. Scanners measure the site or API; a written report names the prioritized fixes; the next scan verifies the result.","priceRange":"€€€","taxID":"3600281-7","vatID":"FI36002817","email":"info@turva.dev","areaServed":{"@type":"Place","name":"Worldwide"},"address":{"@type":"PostalAddress","addressLocality":"Tampere","addressCountry":"FI"},"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"info@turva.dev","availableLanguage":["English"]},"founder":{"@id":"https://turva.dev/#person"},"sameAs":["https://tietopalvelu.ytj.fi/yritys/3600281-7","https://www.linkedin.com/in/erikrekola/","https://github.com/busygoat","https://www.wikidata.org/wiki/Q140276251"]},
{"@type":"Person","@id":"https://turva.dev/#person","name":"Erik Rekola","jobTitle":"Agent-readiness consultant","worksFor":{"@id":"https://turva.dev/#business"},"sameAs":["https://www.linkedin.com/in/erikrekola/","https://github.com/busygoat","https://www.wikidata.org/wiki/Q140276321"]},
{"@type":"WebSite","@id":"https://turva.dev/#website","url":"https://turva.dev/","name":"turva.dev","publisher":{"@id":"https://turva.dev/#business"},"inLanguage":"en"},
{"@type":"Service","@id":"https://turva.dev/#service","name":"Agent-readiness audits and advisory","provider":{"@id":"https://turva.dev/#business"},"serviceType":"Agent-readiness consulting","areaServed":{"@type":"Place","name":"Worldwide"},"availableChannel":{"@type":"ServiceChannel","serviceUrl":"https://turva.dev/services","availableLanguage":["en"]},"offers":{"@type":"AggregateOffer","priceCurrency":"EUR","lowPrice":"1500","highPrice":"6500","offerCount":"3","availability":"https://schema.org/InStock","url":"https://turva.dev/services","priceValidUntil":"${PRICE_VALID_UNTIL}"},"hasOfferCatalog":{"@type":"OfferCatalog","name":"turva.dev services","itemListElement":[
{"@type":"Offer","name":"Audit","description":"Fixed scope, 2-3 weeks. Scanner sweep across Cloudflare AI Audit, Internet.nl, Hardenize and StartupHub agent-readiness, plus manual review of /.well-known/ manifests, JSON-LD and head metadata. Written report with prioritized fix list.","url":"https://turva.dev/services","price":"6500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"6500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"€6,500 fixed price, two to three weeks. VAT (25,5%) added per Finnish law."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness audit"}},
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
    if (tag === "title") { element.remove(); return; }
    if (tag === "meta") {
      const name = (element.getAttribute("name") || "").toLowerCase();
      const property = (element.getAttribute("property") || "").toLowerCase();
      if (name === "description") { element.remove(); return; }
      if (name.startsWith("twitter:")) { element.remove(); return; }
      if (property.startsWith("og:")) { element.remove(); return; }
      return;
    }
    if (tag === "link") {
      const rel = (element.getAttribute("rel") || "").toLowerCase();
      const hreflang = element.getAttribute("hreflang");
      if (rel === "canonical") { element.remove(); return; }
      if (rel === "alternate" && hreflang) { element.remove(); return; }
    }
  }
};

var HtmlLangSetter = class {
  constructor(lang) { this.lang = lang; }
  element(element) { element.setAttribute("lang", this.lang); }
};

function appendAgentLinks(headers) {
  headers.append("Link", '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"');
  headers.append("Link", '</openapi.json>; rel="service-desc"; type="application/json"');
  headers.append("Link", '</llms.txt>; rel="service-doc"; type="text/plain"');
  headers.append("Link", '</llms-full.txt>; rel="service-doc"; type="text/plain"; title="Full content"');
  headers.append("Link", '</.well-known/signatures.json>; rel="signature"; type="application/json"');
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
  headers.append("Link", '</x402>; rel="x402-endpoint"; type="application/json"');
  headers.append("Link", '</.well-known/x402>; rel="x402"; type="application/json"');
  headers.append("Link", '</.well-known/x402-mesh.json>; rel="x402-mesh"; type="application/json"');
  headers.append("Link", '</.well-known/mpp>; rel="mpp"; type="application/json"');
  headers.append("Link", '</.well-known/ucp>; rel="ucp"; type="application/json"');
  headers.append("Link", '</agent/auth/register>; rel="agent-auth-register"; type="application/json"');
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
        el.append(`<link rel="service-desc" href="https://turva.dev/openapi.json" type="application/json" />`, { html: true });
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
        el.append(`<link rel="x402-endpoint" href="https://turva.dev/x402" type="application/json" />`, { html: true });
        el.append(`<link rel="x402" href="https://turva.dev/.well-known/x402" type="application/json" />`, { html: true });
        el.append(`<link rel="x402-mesh" href="https://turva.dev/.well-known/x402-mesh.json" type="application/json" />`, { html: true });
        el.append(`<link rel="mpp" href="https://turva.dev/.well-known/mpp" type="application/json" />`, { html: true });
        el.append(`<link rel="ucp" href="https://turva.dev/.well-known/ucp" type="application/json" />`, { html: true });
        el.append(`<link rel="agent-auth-register" href="https://turva.dev/agent/auth/register" type="application/json" />`, { html: true });
        if (isHome) el.append(SCHEMA_HOME, { html: true });
        el.append(WEBMCP_SCRIPT, { html: true });
        // TEMP dark-theme override (live site). Loads last in <head>, wins the cascade. Remove once Sitejet theme is finalized.
        el.append(`<style id="turva-dark-override">html,body{background-color:#0A1316!important;color:#F2F4F3!important;}body .ed-element[class*="preset-text"],body .ed-element[class*="preset-text"] p,body .ed-element[class*="preset-text"] li,body .ed-element[class*="preset-text"] span,body .ed-element[class*="preset-text"] strong,body .ed-element[class*="preset-text"] td,body .ed-element[class*="preset-boxes"] p,body .ed-element[class*="preset-boxes"] li,body .ed-element[class*="preset-boxes"] span,body .ed-element[class*="preset-pricing"] td,body .ed-element[class*="preset-pricing"] span,body .ed-element[class*="preset-accordion"] p,body .ed-element[class*="preset-accordion"] span,body .ed-element[class*="preset-table"] td,body .ed-element[class*="preset-footer"],body .ed-element[class*="preset-footer"] p,body .ed-element[class*="preset-footer"] li,body .ed-element[class*="preset-footer"] span{color:#F2F4F3!important;}body .ed-element.ed-element.ed-element h1,body .ed-element.ed-element.ed-element h2,body .ed-element.ed-element.ed-element h3,body .ed-element.ed-element.ed-element h4,body .ed-element.ed-element.ed-element h5,body .ed-element.ed-element.ed-element h6{color:#5DF18F!important;}body .ed-element[class*="preset-text"] a,body .ed-element[class*="preset-boxes"] a,body .ed-element[class*="preset-footer"] a{color:#5DF18F!important;}body .ed-element[class*="preset-section"],body .ed-element[class*="preset-container"],body .ed-element[class*="preset-columns"],body .ed-element[class*="preset-column"],body .ed-element[class*="preset-text-with-image"],body .ed-element[class*="preset-boxes"],body .ed-element[class*="preset-slider"],body .ed-element[class*="preset-pricing"],body .ed-element[class*="preset-footer"]{background-color:transparent!important;}body .ed-element[class*="contact-form"] input,body .ed-element[class*="contact-form"] textarea,body .ed-element[class*="contact-form"] select{background-color:rgba(255,255,255,0.05)!important;color:#F2F4F3!important;border-color:rgba(255,255,255,0.25)!important;}body .ed-element[class*="contact-form"] ::placeholder{color:#9AA3A0!important;}body .ed-element[class*="preset-footer"] a[href*="startuphub.ai"]{color:#F2F4F3!important;}</style>`, { html: true });
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

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderInline(text) {
  let out = escapeHtml(text);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, href) => {
    return `<a href="${escapeHtml(href)}">${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[\s(])(info@turva\.dev)/g, '$1<a href="mailto:info@turva.dev">$2</a>');
  return out;
}

function markdownToHtml(md) {
  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("## ")) {
      html.push(`<h2>${renderInline(trimmed.slice(3).trim())}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      html.push(`<h1>${renderInline(trimmed.slice(2).trim())}</h1>`);
    } else if (/^- /.test(trimmed)) {
      const items = trimmed.split("\n").filter((l) => /^- /.test(l.trim())).map((l) => `<li>${renderInline(l.trim().slice(2).trim())}</li>`).join("");
      html.push(`<ul>${items}</ul>`);
    } else {
      html.push(`<p>${renderInline(trimmed)}</p>`);
    }
  }
  return html.join("\n");
}

// Guide pages are worker-owned content that does not exist on the Sitejet
// origin, so they are rendered to HTML here rather than proxied. Agents that
// send Accept: text/markdown are served PAGE_MARKDOWN earlier; this is the
// human/HTML representation.
function buildGuideJsonLd(pathname, canonicalUrl) {
  const m = META_BY_PATH[pathname] || META_BY_PATH["/"];
  const headline = m.title.replace(/ \| turva\.dev$/, "");
  const url = canonicalUrl || "https://turva.dev" + pathname;
  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": headline,
    "description": m.description,
    "url": url,
    "inLanguage": "en",
    "author": { "@type": "Person", "name": "Erik Rekola", "url": "https://turva.dev/" },
    "publisher": { "@type": "Organization", "name": "turva.dev", "url": "https://turva.dev/" },
    "isPartOf": { "@type": "WebSite", "name": "turva.dev", "url": "https://turva.dev/" },
    "about": "agent-readiness"
  };
  const json = JSON.stringify(article).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json">
${json}
<\/script>`;
}

var GUIDES_FAQ = [
  {
    q: "What is an agent-readiness audit?",
    a: "An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API, scored against current standards by an independent scanner rather than a self-assessment."
  },
  {
    q: "Do I need llms.txt on my site?",
    a: "If you want models and agents to read your real content rather than guess from a cached snippet, llms.txt gives them a curated map of what matters. It does not replace robots.txt or a sitemap, it complements them."
  },
  {
    q: "How do I get my site cited by AI assistants?",
    a: "A model cites content it can read cleanly and corroborate. That means machine-readable surfaces such as llms.txt and structured data, a markdown form that does not exhaust the token budget, and being indexed where the assistant searches."
  },
  {
    q: "What is an MCP server card?",
    a: "An MCP server card is a JSON file, usually at /.well-known/mcp/server-card.json, that lets an agent discover a site's Model Context Protocol server and the tools it exposes, so the agent can call them without a human wiring up the connection."
  },
  {
    q: "Is agent-readiness the same as SEO?",
    a: "No. SEO makes a site rank for a person to click. Agent-readiness makes a site legible and usable by an agent that reads and acts. A site can rank well and still be opaque to agents."
  },
  {
    q: "How is agent-readiness measured?",
    a: "By an independent scanner that reads the live site and reports a score with a category breakdown. The categories that get fixed read higher on the next scan, so the claim is the number rather than an assertion."
  }
];

function buildGuidesFaqJsonLd() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "inLanguage": "en",
    "mainEntity": GUIDES_FAQ.map((item) => ({
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

function serveGuideHtml(pathname, canonicalUrl) {
  const md = PAGE_MARKDOWN[pathname];
  const metaBlock = buildMetaBlock(pathname, canonicalUrl);
  const jsonLd = buildGuideJsonLd(pathname, canonicalUrl) +
    (pathname === "/guides" ? "\n" + buildGuidesFaqJsonLd() : "");
  const article = markdownToHtml(md);
  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${metaBlock}
${jsonLd}
<link rel="canonical" href="${canonicalUrl}" />
<link rel="alternate" href="${canonicalUrl}" type="text/markdown" />
<style>
html,body{background-color:#0A1316;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;}
main{max-width:46rem;margin:0 auto;padding:3rem 1.25rem 4rem;}
h1{color:#5DF18F;font-size:2rem;line-height:1.2;margin:0 0 1.5rem;}
h2{color:#5DF18F;font-size:1.35rem;margin:2.25rem 0 0.75rem;}
p{margin:0 0 1.1rem;}
ul{margin:0 0 1.1rem 1.25rem;padding:0;}
li{margin:0 0 0.35rem;}
a{color:#5DF18F;}
nav{margin-top:3rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.15);font-size:0.95rem;}
nav a{margin-right:1.25rem;}
</style>
</head>
<body>
<main>
<article>
${article}
</article>
<nav>
<a href="https://turva.dev/">Home</a>
<a href="https://turva.dev/guides">Guides</a>
<a href="https://turva.dev/services">Services</a>
<a href="https://turva.dev/contact">Contact</a>
</nav>
</main>
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
  headers.append("Link", `<${canonicalUrl}>; rel="alternate"; type="text/markdown"`);
  return new Response(body, { status: 200, headers });
}

var X402_ROUTES = {
  "/api/agent/audit": {
    label: "Audit",
    description: "Turva.dev — Agent-readiness audit (fixed scope, 2-3 weeks)",
    amountUsdcMicro: "6500000000",
    amountEurCents: 650000
  },
  "/api/agent/advisory": {
    label: "Advisory",
    description: "Turva.dev — Continuous advisory (monthly, min 3 months)",
    amountUsdcMicro: "3000000000",
    amountEurCents: 300000
  },
  "/api/agent/implementation": {
    label: "Implementation",
    description: "Turva.dev — Implementation day (scoped per task)",
    amountUsdcMicro: "1500000000",
    amountEurCents: 150000
  }
};

function serve402(pathname, route) {
  const resource = "https://turva.dev" + pathname;
  const body = build402Body(resource, route.label, route.amountUsdcMicro, route.amountEurCents, route.description);
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-expose-headers": "X-PAYMENT, X-Payment-Response, X-Payment-Required",
    "accept-payment": "x402; network=base; asset=USDC",
    "x-payment-required": "x402; network=base; asset=USDC; amount=" + route.amountUsdcMicro
  });
  appendAgentLinks(headers);
  applySecurityHeaders(headers, "agent-api");
  return new Response(body, { status: 402, headers });
}

function serveX402Root() {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-expose-headers": "X-PAYMENT, X-Payment-Response, X-Payment-Required",
    "accept-payment": "x402; network=base; asset=USDC",
    "x-payment-required": "x402; network=base; asset=USDC; amount=1000"
  });
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
  const userAgent = request.headers.get("User-Agent")?.toLowerCase() || "";
  const isPrerender = request.headers.get("X-Prerender");
  const pathLower = pathname.toLowerCase();
  const lastDot = pathLower.lastIndexOf(".");
  const extension = lastDot > -1 ? pathLower.substring(lastDot).toLowerCase() : "";

  if (hostname === "mta-sts.turva.dev") {
    if (pathLower === "/.well-known/mta-sts.txt") return serveMtaStsPolicy();
    return Response.redirect("https://turva.dev/", 301);
  }

  if (hostname === "www.turva.dev") {
    return Response.redirect("https://turva.dev" + pathname + url.search, 301);
  }

  if (pathLower === "/x402") {
    return serveX402Root();
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

  if (wantsMarkdown(request) && PAGE_MARKDOWN[pathname]) {
    const canonicalUrl = getCanonicalForPath(pathname) || "https://turva.dev" + pathname;
    return serveMarkdown(PAGE_MARKDOWN[pathname], canonicalUrl);
  }

  // Guide pages are worker-owned and not present on the Sitejet origin, so the
  // worker renders the HTML representation directly instead of proxying. The
  // /guides hub is rendered through the same path as the /guides/* sub-pages.
  if ((pathname === "/guides" || pathname.startsWith("/guides/")) && PAGE_MARKDOWN[pathname]) {
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
  if (pathLower === "/.well-known/agent.json" || pathLower === "/.well-known/ai-plugin.json") {
    return serveStatic(AGENT_JSON, "application/json; charset=utf-8", "agent-api");
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
  if (pathLower === "/.well-known/x402" || pathLower === "/.well-known/x402.json") {
    return serveStatic(X402_MANIFEST, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/x402-mesh.json" || pathLower === "/.well-known/x402-mesh") {
    return serveStatic(X402_MESH, "application/json; charset=utf-8", "agent-api");
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
  if (pathLower === "/sitemap.xml") return serveStatic(SITEMAP_XML, "application/xml; charset=utf-8", "agent-api");
  if (pathLower === "/llms.txt") return serveStatic(LLMS_TXT, "text/plain; charset=utf-8", "agent-api");
  if (pathLower === "/llms-full.txt") return serveStatic(getLlmsFullTxt(), "text/plain; charset=utf-8", "agent-api");
  if (pathLower === "/.well-known/ai.txt" || pathLower === "/ai.txt") {
    return serveStatic(AI_TXT, "text/plain; charset=utf-8", "agent-api");
  }

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
