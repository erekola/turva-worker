// src/worker.js
// turva.dev worker v3.18.0 - blog: honesty-and-the-checker (auth.md honest form vs the checker)

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
  "script-src 'self' 'sha256-vtqXC7bOXcKVw+5MhYlFWojHT8plqU4b9yPyBtAMmPM='",
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
- [How to get your site cited by AI assistants](https://turva.dev/guides/get-cited-by-ai-assistants)
- [llms.txt explained](https://turva.dev/guides/llms-txt)
- [MCP server cards explained](https://turva.dev/guides/mcp-server-card)
- [What agents.json is](https://turva.dev/guides/agents-json)
- [x402 and agent payments](https://turva.dev/guides/x402-agent-payments)
- [Response headers that help agents](https://turva.dev/guides/response-headers-for-agents)
- [SEO and agent-readiness are not the same](https://turva.dev/guides/seo-vs-agent-readiness)
- [Agent-readiness, AEO and GEO: how they relate](https://turva.dev/guides/agent-readiness-aeo-geo)
- [Letting agents act on data: the decision envelope](https://turva.dev/guides/letting-agents-act-on-data)
- [AI agent use cases: where agents read data and make decisions](https://turva.dev/guides/ai-agent-use-cases)
- [JSON-LD and structured data for agents](https://turva.dev/guides/json-ld-structured-data)
- [The /.well-known directory for agents](https://turva.dev/guides/well-known-for-agents)
- [Agentic Resource Discovery and ai-catalog.json](https://turva.dev/guides/agentic-resource-discovery)
- [How agents authenticate](https://turva.dev/guides/agent-authentication)
- [Why agent-readiness should be measured, not asserted](https://turva.dev/guides/measurement-led-agent-readiness)
- [Prerendering and why agents see empty pages](https://turva.dev/guides/prerendering-for-agents)
- [Sitemaps, robots.txt and agent access](https://turva.dev/guides/sitemaps-and-robots-for-agents)
- [Serving markdown to agents](https://turva.dev/guides/markdown-for-agents)
- [Open Knowledge Format (OKF) explained](https://turva.dev/guides/open-knowledge-format)
- [Common agent-readiness gaps on marketing sites](https://turva.dev/guides/agent-readiness-gaps)
- [Choosing an agent-readiness audit](https://turva.dev/guides/choosing-an-agent-readiness-audit)
- [Agent commerce discovery: A2A, AP2, and ACP](https://turva.dev/guides/agent-commerce-discovery)
- [Agentic commerce readiness: selling to AI shopping agents](https://turva.dev/guides/agentic-commerce-readiness)

## Blog
- [Blog](https://turva.dev/blog)
- [Auditing the auditor with four AI agents](https://turva.dev/blog/auditing-the-auditor)
- [Four AI agents re-checked the guides](https://turva.dev/blog/re-checking-the-guides)
- [The page grew, the agent bill did not](https://turva.dev/blog/cheaper-pages-revisited)
- [Moving the source from GitHub to Codeberg](https://turva.dev/blog/moving-source-to-codeberg)
- [A free llms.txt validator](https://turva.dev/blog/free-llms-txt-validator)
- [Agent access is now a setting](https://turva.dev/blog/agent-access-is-now-a-setting)
- [What one agent-readiness scanner cannot tell you](https://turva.dev/blog/two-scanner-audit-method)
- [Publishing an ai-catalog.json for agentic discovery](https://turva.dev/blog/publishing-an-ai-catalog)
- [What the Open Knowledge Format is, and what it is not](https://turva.dev/blog/open-knowledge-format)
- [What an agent pays to read your site](https://turva.dev/blog/cheaper-pages-for-agents)
- [When an agent can prove it is Claude](https://turva.dev/blog/verifiable-agent-identity)
- [What makes an AI agent's decisions reliable](https://turva.dev/blog/reliable-agent-decisions)
- [Owning your fediverse identity](https://turva.dev/blog/owning-your-fediverse-identity)
- [Passing the agent commerce checks without faking them](https://turva.dev/blog/honest-agent-commerce-checks)
- [Moving turva.dev off prerender.io](https://turva.dev/blog/moving-off-prerender)

## Tools
- [llms.txt validator](https://turva.dev/llms-txt-validator)
- [The agent-ready badge](https://turva.dev/badge)

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
- AI catalog (ARD): https://turva.dev/.well-known/ai-catalog.json
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
- x402-mesh: https://turva.dev/.well-known/x402-mesh.json
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
There are no protected resources and no user accounts. The only
credential this domain issues is an optional api_key, provided
out-of-band on request; it attributes correspondence and grants
no additional access. This document describes how an operator can
register an agent identity, request metadata corrections, and
revoke prior correspondence.

## Identity

- Operator: Erik Rekola (sole proprietorship, Finland)
- Trade name: turva.dev
- Business ID: 3600281-7
- Register: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Verified contact: <mailto:info@turva.dev>
- Public profile: https://www.linkedin.com/in/erikrekola/
- Source code: https://codeberg.org/erekola

## Supported identity types

- anonymous: no registration, every resource is public read-only;
  an api_key can be issued out-of-band on request
- identity_assertion: a registered operator identity, backed by a
  verified email or a signed assertion; the same api_key applies

A credential only attributes correspondence. Every resource is
public, none requires a credential, and no credential grants
additional access.

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
operator control (DNS TXT, signed message from a known code hosting
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

- OAuth Authorization Server: https://turva.dev/.well-known/oauth-authorization-server
- OAuth Protected Resource: https://turva.dev/.well-known/oauth-protected-resource
- API catalog: https://turva.dev/.well-known/api-catalog
- Security contact: https://turva.dev/.well-known/security.txt
- Legal: https://turva.dev/legal
`;

var PAGE_MARKDOWN = {
  "/blog/honesty-and-the-checker": `# When honesty and the checker disagree

2026-07-06

During the line-by-line pass that [read every line of this site](/blog/auditing-the-auditor), one of the smallest surfaces turned into the sharpest question in the audit. This site serves an auth.md file, a plain description of how an agent authenticates here. It said two things that did not sit together. One line read no issued credentials. Another said an API key is issued out of band on request. Both were trying to be honest, and side by side they were a contradiction.

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

- [Auditing the auditor with four AI agents](/blog/auditing-the-auditor)
- [How agents authenticate](/guides/agent-authentication)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
`,

  "/blog/auditing-the-auditor": `# Auditing the auditor with four AI agents

2026-07-04

The company page of this site tells a buyer they can read every line before hiring me. An audit business should survive its own promise, so I pointed it at my own site. Four AI agents, all running Claude Fable 5, read the public surface line by line: the Worker source that renders turva.dev, about 5,400 lines of it, the MCP server behind mcp.turva.dev, and the READMEs of the public repos. They came back with 91 findings.

## What 91 findings look like

Most were the drift every living codebase accumulates. One surface advertised RS256 and ES256 for verification while the site's actual key is Ed25519. A response header named x-markdown-tokens carried a word count. A guide expanded MPP to the wrong protocol name. A table in one guide had never rendered as a table, because the renderer did not support tables. The legal page called this a registered company when it is a registered business. None of these move a scanner.

About 60 fixes shipped, and both scanners were re-run after the deploys: startuphub.ai reads 100/100, grade A+, with all six categories at 100, and isitagentready.com reads Level 5. The scores were the same before most of these fixes, and that is the point. A scanner cannot see whether the key algorithm you advertise is the one you use. Line-by-line reading is the layer under the score.

## Four HIGH alerts, and how they died

The agents marked four findings HIGH. All four fell when verified, and they traced to two root causes.

The first: the site claims 100/100 verified by two independent scanners, and the agents knew that one of those scanners, isitagentready.com, grades sites on levels, 0 to 5. A percentage from a level-based scanner reads like an invented number, so the claim was flagged as false advertising on the audit's own subject matter. The scanner's own scorecard settles it. Run the scan and the report shows 100/100 for this site next to Level 5. The claim stands as written.

The second: an agent fetched the live MCP server card and read version 1.1.0 where the source says 1.2.0. Deployed code that trails its repo is a real problem anywhere, so HIGH was the right severity for the claim. It was still wrong. The fetch had come through a cache, and pulling the deployed Worker straight from the Cloudflare API showed 1.2.0, identical to the source. The finding described the measuring instrument, and the deployment was never out of sync.

## The finding that held

One HIGH survived. The MCP server's README promised that the service does no logging, and the Worker configuration had platform observability switched on, which stored a log line for every call. Promise and code disagreed, and this is the exact class of gap the audit exists to catch. The repair went the honest way around. Reality changed to match the words: observability is off, and the README now also says out loud that platform logs are disabled. Rewriting the README to say minimal logging would have been faster to ship, and worth less to anyone who reads it.

## The hard part is the false positives

A finding is a claim, and a claim gets the same treatment as marketing copy. Verify it against the primary source or drop it. Acting on the dead alerts here would have made the site worse, because fixing a correct claim plants a real error where a false alarm used to be. Read the scanner's own scorecard instead of assuming its scale, and pull the deployed artifact from the platform instead of trusting a cached fetch. Minutes of checking killed four HIGHs.

The same discipline applies when you buy an audit. The report that reaches you should be the survivors, and a useful question for any auditor is how many findings were dropped between the raw scan and the written report. A report where the answer is zero usually means nobody checked.

For an agent-readiness audit where the findings are verified before you read them, contact info@turva.dev.

## Related

- [What one agent-readiness scanner cannot tell you](/blog/two-scanner-audit-method)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
`,

  "/blog/re-checking-the-guides": `# Four AI agents re-checked the guides

2026-07-04

The guides on this site describe other people's specifications, and specifications move. A sentence that says "the specification says" is true the day it ships and starts aging the day after, and no scanner will tell you when it has gone stale. So the four AI agents that [read this site line by line](/blog/auditing-the-auditor) came back for a second pass, all running Claude Fable 5, each taking one family of standards: the agent commerce stack, MCP discovery, the discovery files from agents.json to llms.txt, and the plumbing of authentication and response headers. Their job was to re-read every specification claim in those guides against the primary source behind it.

## What had moved

The pass came back with one finding rated high, one medium and six small. The high one sat in the MCP guide. It described the server card proposal, SEP-2127, in the present tense, and the proposal had moved. As of July 2026 it sits on MCP's extensions track as an experimental extension, and the current draft recommends serving the card relative to the server's endpoint plus a catalog at /.well-known/mcp/catalog.json. Nothing in the old sentence was wrong when it was written. It stayed still while the proposal moved.

The medium finding was quieter. The response-header guide leaned on the IETF draft for standard RateLimit headers, and that draft expired in March 2026 without a successor. The six small ones were wording: vocabulary that predated A2A 1.0, stale lines about the Open Knowledge Format, a Cache-Control nuance, and one phrase about ai-catalog.json contributors that had aged in two places at once, because a blog post here had quoted the guide.

## The sharpest findings were not in the guides

Two of the machine-readable profiles this site serves had drifted from their own specifications, and that is a harder failure than stale prose, because these files exist for software and both had passed every scan since they shipped. The UCP profile used service keys in a namespace the specification reserves for its own governing body, and listed transports its enum does not contain. The MPP manifest declared a version field the protocol does not define. A scanner checks that a profile exists and parses. It does not check that the vocabulary inside it exists in the specification, so an invented key passes as easily as a real one. Both profiles are now in the specification's own shape, verified against the primary text and validated programmatically, and both scanners stayed green through the change. The honest form cost nothing.

## What the scores did not measure

Both scanners were re-run after the fixes. startuphub.ai reads 100/100 with grade A+ and isitagentready.com reads Level 5, the same result as before the pass. The scores did not move in either direction, and that is worth pausing on. A score measures the shape of a site at scan time, and the currency of a sentence about somebody else's specification is outside every scanner's reach. If reading every line is part of the promise, somebody has to re-read the lines after the world moves.

## Claims now carry their date

The lasting repair is anchoring. A guide claim about a moving specification now carries its date, as of July 2026, so when the specification moves again the sentence stays true as a dated statement instead of quietly turning false. The families that move fastest, agent commerce and MCP discovery, go back on a re-check schedule, because this pass showed the drift interval there is a matter of weeks.

For an audit that reads your agent-facing claims against the specifications they cite, contact info@turva.dev.

## Related

- [Auditing the auditor with four AI agents](/blog/auditing-the-auditor)
- [MCP server cards explained](/guides/mcp-server-card)
- [Agent commerce discovery: A2A, AP2, and ACP](/guides/agent-commerce-discovery)
`,

  "/blog/cheaper-pages-revisited": `# The page grew, the agent bill did not

2026-07-04

In late June this site published [a post on what an agent pays to read a page](/blog/cheaper-pages-for-agents), and the measurement in it said the homepage as markdown cost roughly a third of the HTML form. The most recent startuphub.ai scan reports the same homepage at 10,320 tokens as HTML and 1,723 as markdown. That is a sixth of the cost, an 83% saving, and nothing in the meantime was done to improve the number.

## Where the weight came from

Since that post went out the site has gained seven blog posts before this one, two tool pages, a feed, a share image for every page and related links at the end of every post. None of that was content negotiation work. It was ordinary growth, and it landed where growth always lands, on the human-facing page. Between the 1 July and 4 July scans alone the HTML form of the homepage went from 9,560 tokens to 10,320, about 8% heavier in three days. The markdown form went from 1,750 to 1,723. It got slightly smaller.

## Two surfaces, two growth rates

The HTML form of a page carries everything a site accumulates: navigation, styling, social metadata, structured data and links to whatever shipped last week. Each of those earns its place for a human reader or a search engine. The markdown form carries the words and the links and nothing else, so it grows only when the actual content grows. Serve one surface to everyone and every agent pays for the whole accumulation on every visit. Serve both forms from the same URL and the costs come apart on their own, the human page free to get richer while the agent page stays at the price of the text.

## Read the number yourself

The token split is not self-reported. The startuphub.ai scanner prints the token count of both forms of a page with every scan it runs, on any site it is pointed at, and this site logs the pair after every deploy. The June post carried the measurement of its day and this one carries the measurement of 4 July. If the pattern holds, a later post will quote a wider gap still, because the human surface keeps accumulating and the text does not.

For an audit that measures what agents pay to read your site, contact info@turva.dev.

## Related

- [What an agent pays to read your site](/blog/cheaper-pages-for-agents)
- [Serving markdown to agents](/guides/markdown-for-agents)
- [What one agent-readiness scanner cannot tell you](/blog/two-scanner-audit-method)
`,

  "/blog/moving-source-to-codeberg": `# Moving the source from GitHub to Codeberg

2026-07-04

The company page of this site tells a buyer they can read every line before hiring me. That promise depends on the source being reachable, and for two weeks it was not, in a way I could not see. This is the log of what broke and why the source now lives at codeberg.org/erekola.

## Two weeks of 404s I could not see

On June 18 GitHub's spam detection flagged my account. There was no notification. Logged in, everything looked normal and every repo was in place. Logged out, the profile and every repo returned 404, and the search API answered "flagged as spammy". Every public pointer at the source was dead for everyone except me: the homepage hero, the guides, the READMEs, the profile links.

## How it surfaced

No scanner caught it. The agent-readiness scanners this site is measured with read the site, not the code hosting, so every score stayed green while the trust chain behind them was broken. It surfaced on July 2 during a fact-check pass, when an AI agent followed the site's own "read the source" link without a logged-in session and got a 404. That is the trap in this failure mode: the owner is the one person who cannot see it.

## What GitHub said

The support ticket had been open since June 18 with one virtual-assistant reply. On July 3 a human answered: the account had been "flagged by mistake" by their spam-detection scripts, and the flag was removed. The reply did not say what had triggered it. The response was polite and the fix was real. It also arrived after the source had already moved.

## What it cost

The measurable part is two weeks of broken pointers. The probable part is worse. An inbound lead wrote in on the same day the flag landed, and my reply pointed them at the open-source Worker as proof of how I work. From that moment every source link I had sent them returned 404, and after one more exchange they went quiet. A silent failure hides its own cost on top of causing it: I cannot prove the 404s ended that conversation, and I cannot rule it out.

## Why the move, and why it stuck

I moved the repos to Codeberg on July 2 with full history, updated every public link the same day, and deleted the GitHub account once the flag was lifted. Codeberg is run by a non-profit on open-source infrastructure, which I like, but that is not the reason. No host is immune to mistakes. The reason is what the incident showed about the failure mode: a silent flag, no notification, an appeal channel that took two weeks to reach a human, and a breakage only visible from outside my own session. A dependency that can fail that way gets treated accordingly. Source hosting now sits in the site's threat model like any other third-party dependency, and the monthly self-audit checks logged-out visibility of every external pointer, because no scanner runs that check for you.

External pointers rot in ways your own monitoring does not see, so they get checked the way a stranger's agent reaches them: from outside, logged out, against the primary source. The audit post published the same day as this one applies that discipline to the code itself.

For an audit that checks a site the way a stranger's agent reaches it, contact info@turva.dev.

## Related

- [Auditing the auditor with four AI agents](/blog/auditing-the-auditor)
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

The validator reads one file and checks its shape. It does not measure whether agents can discover the site, read its pages as markdown, find its API or complete a purchase. That is audit territory, and an audit here runs a site against two independent scanners rather than one checklist.

For an audit of the whole surface an agent sees, not just this one file, contact info@turva.dev.

## Related

- [llms.txt explained](/guides/llms-txt)
- [Serving markdown to agents](/guides/markdown-for-agents)
- [What an agent pays to read your site](/blog/cheaper-pages-for-agents)
`,

  "/llms-txt-validator": `# llms.txt validator

Enter a domain and this page fetches its /llms.txt and checks the
structure against the format: one H1 title, an optional blockquote
summary, H2 sections with link lists. Free, no signup, nothing stored.

## How to use it

- In a browser: open https://turva.dev/llms-txt-validator and enter a domain
- As an agent: GET https://turva.dev/llms-txt-validator?url=example.com with Accept: application/json

## What it checks

- The file exists at /llms.txt and returns HTTP 200
- The response is plain text, not an HTML error page
- The file starts with a single H1 title
- A blockquote summary follows the title (recommended by the format)
- H2 sections group the content
- Markdown links parse and use absolute URLs
- The file stays small enough to be cheap for an agent to read

## What it does not do

This is a structure check against the llms.txt format, not an
agent-readiness score. A full audit measures discovery, content,
access control and more: https://turva.dev/services

## Related

- [llms.txt explained](/guides/llms-txt)
- [Serving markdown to agents](/guides/markdown-for-agents)
`,

  "/badge": `# The agent-ready badge

A small SVG badge a site can embed to show it meets public
agent-readiness criteria, linking back to this page. The badge is
served from turva.dev, the criteria are listed below, and anyone can
re-check the claim by running the same public scanners.

## Who may display it

- Sites that have completed a turva.dev agent-readiness audit
- Sites that score 100/100 on a public agent-readiness scanner (startuphub.ai or isitagentready.com)

## What it is, and what it is not

The badge is a self-declared claim against public criteria, not a
certification. turva.dev does not police its use. The value of the
badge is that the claim is checkable: either scanner can be run
against the displaying site by anyone, at any time.

## How to embed it

Copy this HTML where you want the badge to appear:

    <a href="https://turva.dev/badge"><img src="https://turva.dev/badge.svg" alt="agent-ready, criteria at turva.dev/badge" width="216" height="36" loading="lazy"></a>

The image is 216 by 36 pixels, dark background, under one kilobyte.

## If your site is not there yet

An audit measures where you stand and lists what to fix first.
Services and prices are at https://turva.dev/services. Email
<mailto:info@turva.dev> and you get a reply within one business day.
`,

  "/blog": `# Blog

Notes on AI agents, and the work of letting them read a site and act on a system safely. Each entry is dated, and anything that can be measured is checked against independent scanners rather than asserted.

- [When honesty and the checker disagree](/blog/honesty-and-the-checker). 2026-07-06.
- [Auditing the auditor with four AI agents](/blog/auditing-the-auditor). 2026-07-04.
- [Four AI agents re-checked the guides](/blog/re-checking-the-guides). 2026-07-04.
- [The page grew, the agent bill did not](/blog/cheaper-pages-revisited). 2026-07-04.
- [Moving the source from GitHub to Codeberg](/blog/moving-source-to-codeberg). 2026-07-04.
- [A free llms.txt validator](/blog/free-llms-txt-validator). 2026-07-02.
- [Agent access is now a setting](/blog/agent-access-is-now-a-setting). 2026-07-02.
- [What one agent-readiness scanner cannot tell you](/blog/two-scanner-audit-method). 2026-07-01.
- [Publishing an ai-catalog.json for agentic discovery](/blog/publishing-an-ai-catalog). 2026-06-29.
- [What the Open Knowledge Format is, and what it is not](/blog/open-knowledge-format). 2026-06-27.
- [What an agent pays to read your site](/blog/cheaper-pages-for-agents). 2026-06-26.
- [When an agent can prove it is Claude](/blog/verifiable-agent-identity). 2026-06-25.
- [What makes an AI agent's decisions reliable](/blog/reliable-agent-decisions). 2026-06-22.
- [Owning your fediverse identity](/blog/owning-your-fediverse-identity). 2026-06-21.
- [Passing the agent commerce checks without faking them](/blog/honest-agent-commerce-checks). 2026-06-21.
- [Moving turva.dev off prerender.io](/blog/moving-off-prerender). 2026-06-20.
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

The benefit is measurable. Independent scanners check for markdown content negotiation and for an llms.txt, and the result shows up as a higher score in the categories that name it. You do not take the improvement on faith. You read the number before the change and after it.

## A small change that lasts

None of this is a rebuild. It is a small piece of code at the edge that picks the response format from the request header, and it keeps working as the site grows. The Worker that does it on turva.dev is public, so you can read exactly what it does before deciding whether it belongs on your own site.

For an audit of how cheaply agents can read your site, contact info@turva.dev.

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

## Related

- [How agents authenticate](/guides/agent-authentication)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [What agents.json is](/guides/agents-json)
`,
  "/blog/reliable-agent-decisions": `# What makes an AI agent's decisions reliable

2026-06-22

In the audits I have run, including this site's own, one thing keeps surfacing. An agent that is instructed well, and given the right settings, can take in data and make the correct decision, every time the rules call for it. The capability is real, and it is wider than most of the conversation around it. The limits are rarely the model. They sit in two places that are easy to overlook.

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

## Related

- [Letting agents act on data](/guides/letting-agents-act-on-data)
- [AI agent use cases](/guides/ai-agent-use-cases)
- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
`,
  "/blog/agent-access-is-now-a-setting": `# Agent access is now a setting

2026-07-02

On 1 July 2026 Cloudflare shipped its second Content Independence Day package: crawler controls that split search, agent and training bots for every customer, a research program that tells crawlers which pages actually changed, experiments that turn Pay Per Crawl into Pay Per Use, and a waitlist for a gateway that charges for any resource over x402. Read together, they move decisions that used to live in a site's code into the CDN dashboard. That relocation is what matters for agent readiness.

## The edge can undo everything the page does right

A site can serve clean markdown, an llms.txt, structured data and signed manifests, and none of it counts if a network rule turns the crawler away before the request reaches the page. Cloudflare says more than 20% of the web sits behind its network, and the new controls ship with per-crawler block toggles and defaults that change over time. This site's own crawler list turned out to contain seven blocked entries, including the Internet Archive and an AI search engine that pays publishers. However they got there, nothing in the markup shows it. You find it in the dashboard, or when your content stops appearing in answers.

An agent-readiness review therefore has to read the edge configuration next to the content. robots.txt, the WAF and the AI crawler list must say the same thing the content strategy says, and they must keep saying it, because platform defaults move without a deploy.

## Citations are replacing clicks, and both are measurable now

Cloudflare's stated reason for the package is a 2025 Pew Research Center finding: when Google shows an AI summary, users click a traditional result 8% of the time and a link inside the summary about 1% of the time. The visit is no longer where the value moves. Cloudflare's response is to make the citation itself payable. Ceramic.ai pays publishers per query their content answers, You.com lets agents buy individual premium pages, and participating sites get reporting on which AI-search queries surfaced their content, down to the page and the snippet.

The reading this is meant to price is already routine. Over the past seven days this site answered 604 requests from identified AI and search crawlers, and AI answers and search referred 88 human visits, most from Google, the rest led by Meta, DuckDuckGo and Bing. Whether that reading starts to pay is what the new programs will test.

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
  "/blog/two-scanner-audit-method": `# What one agent-readiness scanner cannot tell you

2026-07-01

Most agent-readiness checks run one scanner and stop. The report reads well, the grade looks final, and the site moves on. That grade says the site fits one vendor's model of what an agent needs. It says nothing about what that model left out.

## A checklist is not a proof

A scanner is built around a fixed set of checks and a fixed weighting between them. It can only fail a site on something it looks for. When a category sits outside a scanner's model, a real gap in that category passes clean, because nothing in the checklist asked about it. A high grade from a single tool is easy to over-read as finished, while the site can still stop an agent cold on the one thing that tool never checked.

## Where two scanners disagree

turva.dev is scored on two independent scanners with different category models, isitagentready.com and startuphub.ai. isitagentready.com carries no Quality category and marks Commerce as optional. startuphub.ai grades six categories, Discoverability, Content, Access Control, Capabilities, Commerce and Quality, so both of the categories the first scanner treats as thin get a full reading in the second. Running a site through both at once means a gap sitting in one model's blind spot still shows up in the other's report, before a buyer or an agent finds it the hard way.

## What this changes about an audit

Every audit here checks a site against both scanners, and a claim about the result carries the date it was verified and the categories the report named. A score nobody re-ran after a change is a guess wearing a number. Two readings of the same site are the cheapest way I know to stop fooling yourself about what "done" means, and it is the same discipline that runs on turva.dev itself before any change ships.

For an agent-readiness audit that checks a site against more than one scanner, contact info@turva.dev.

## Related

- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps on marketing sites](/guides/agent-readiness-gaps)
`,
  "/blog/publishing-an-ai-catalog": `# Publishing an ai-catalog.json for agentic discovery

2026-06-29

Google and a Linux Foundation working group published Agentic Resource Discovery in 2026, an open specification for telling agents what a site offers in one machine-readable file at /.well-known/ai-catalog.json. turva.dev now serves one. This is the log of adding it, and of why the change could not move the scanner score either way.

## What the file says

The manifest is a small envelope with a specVersion, a host block, and an entries array. Each entry names one agentic resource with an identifier, a type, a url, and a description. turva.dev publishes four entries, and every one points at a surface that already resolves: the MCP server card, the A2A agent card, the OpenAPI description, and the agent skills index. Nothing in the catalog is aspirational. If a line names a resource, that resource answers.

## Why it is additive

The catalog is a new file and a new route. It does not change a single existing surface, so it cannot lower a score, and because neither independent scanner checks for ai-catalog.json yet, it cannot raise one either. turva.dev already reads 100/100 on startuphub.ai and Level 5 on isitagentready.com, and it read the same after this change. The point of publishing now is not the number. It is that a Google-backed discovery standard exists, and a site that sells agent-readiness should serve the surface before its buyers ask for it.

## Discovery, not ranking

An ai-catalog.json is easy to misread as another search file. It is not. It indexes the agentic resources a site exposes so an agent can find them and call each one through its own protocol. Google confirmed in 2026 that llms.txt does not affect its search results, and the same holds here. Agent-readiness and search ranking remain different things, and neither should be sold as the other.

## Honest about adoption

In a public census in June 2026, none of the companies named as contributors to the specification yet served a discoverable ai-catalog.json. The specification is an early draft and adoption is near zero. That is the honest frame for this post. turva.dev is early rather than late, and being early on a verifiable standard is a position worth holding when the work is open source and readable line by line at codeberg.org/erekola/turva-worker.

For an audit of a site's discovery surface, contact info@turva.dev.

## Related

- [Agentic Resource Discovery and ai-catalog.json](/guides/agentic-resource-discovery)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [MCP server cards explained](/guides/mcp-server-card)
`,
  "/blog/moving-off-prerender": `# Moving turva.dev off prerender.io

2026-06-20

For a while the turva.dev homepage was rendered by a third party. The page was built on Sitejet, served to people as a JavaScript app, and served to agents through prerender.io, which returned a finished HTML snapshot so a crawler did not read an empty shell. It worked and it scored well, but it was a workaround. A site that sells agent-readiness should not depend on a separate service to be readable by agents.

Today the homepage moved into the Cloudflare Worker that already fronts the domain. The Worker renders the finished HTML itself, on every request, at the edge. There is no client-side hydration step and no prerender hop. An agent reads the real content in the first response, and so does a person.

## What the Worker returns

The Worker decides by the request. A browser asking for HTML gets the rendered page. An agent that sends Accept: text/markdown gets a markdown version of the same content, at a fraction of the tokens. An agent that sends Accept: application/json gets a structured summary of the business and its services. The same facts, in the form the client asked for.

## What this removed

The prerender.io branch is gone from the Worker. No request is sent to an external prerender service, and the token it used is no longer read. Sitejet now serves only static assets such as the social image, and those move to the Worker next. The page is one codebase, under version control, open source at codeberg.org/erekola/turva-worker.

## The result is measured, not asserted

The change was verified the same way the service verifies client work: by independent scanners, before and after. StartupHub read 100/100, grade A+, with all six categories at 100. isitagentready read Level 5, Agent-Native. The homepage migration did not drop a point.

One more note. This change was planned and deployed in a single session with an AI agent, and the result was checked by two independent scanners with no stake in the outcome. The claims on this site are measurements anyone can reproduce. Either the next scan reads the same or higher, or it does not.

Written contact only. Email info@turva.dev, Signal @turva.19. First reply within one business day.

## Related

- [Prerendering and why agents see empty pages](/guides/prerendering-for-agents)
- [Serving markdown to agents](/guides/markdown-for-agents)
- [What an agent-readiness audit is](/guides/agent-readiness-audit)
`,
  "/blog/honest-agent-commerce-checks": `# Passing the agent commerce checks without faking them

2026-06-21

turva.dev measures its own agent-readiness with two independent scanners. On startuphub.ai it ranks first among the publicly-scanned sites on the agent-readiness leaderboard at 100/100. On isitagentready.com, which checks 21 separate standards, it reaches Level 5. This is the log of taking the isitagentready commerce checks from mostly red to mostly green, without claiming a single capability the site does not actually have.

## What was failing

The site sat at Level 5, but four checks in the discovery and commerce categories were red: the A2A Agent Card, AP2 agent payments, ACP discovery, and x402. Each red check is a claim an agent cannot verify. The job was to clear them honestly and to keep the startuphub.ai score at 100 while doing it.

## The A2A Agent Card

An A2A Agent Card is a JSON file at /.well-known/agent-card.json that describes an agent interface, including its name, version, transport, and the skills it offers. turva now publishes one that points at its read-only HTTP and JSON surface, with skills that mirror the existing agent-skills index. The change was additive, a new file and a route, so it could not move the startuphub.ai score. The check went green.

## The AP2 trap

AP2 is the Agent Payments Protocol. A merchant declares support by adding an extension entry to its A2A card. The isitagentready fix text gave the extension URI as github.com/google-agentic-commerce/AP2/tree/v0.1.0. I used exactly that, and the check stayed red. The scanner validates against the real specification, which uses github.com/google-agentic-commerce/ap2/tree/v0.1, lowercase, version v0.1. The helper text was wrong and the spec was right. Once the URI matched the spec, AP2 went green. The lesson is to copy protocol identifiers from the specification, not from a fix message.

## ACP, the honest way

ACP is the Agentic Commerce Protocol. Its discovery document at /.well-known/acp.json had the wrong shape. The capabilities.services field has to be an array of strings from a closed set, and the site was sending an array of custom service objects. Editing that one field would have turned the check green on its own, because the scanner only reads the discovery file. It never calls the checkout endpoint.

That was the shortcut, and it was the wrong one. A discovery document that says it supports checkout while the checkout URL returns nothing is a broken promise to any agent that follows it. So the site got a real, if minimal, checkout endpoint instead. POST /api/acp/checkout_sessions creates a genuine session for the audit. The session comes back in the not_ready_for_payment state with a message that the engagement is scoped and confirmed in writing within one business day. That is not a workaround. It is the actual model, async and quote first, so instant agent payment is not offered. The check is green because the claim is true.

## What stays red, on purpose

Two checks remain red and will stay that way. isitagentready reports x402 as missing, yet the site serves a working x402 endpoint that returns HTTP 402 with payment terms, and startuphub.ai reads it as present. The isitagentready probe looks at paths the site does not use for that purpose, and the only way to satisfy it would disturb surfaces that are already correct. Web Bot Auth is for sites that send signed bot requests to other sites, and turva only receives traffic, so it has no bot to authenticate. Publishing signing keys it never uses would be the same hollow signal the ACP shortcut would have been. Both scanners treat this check as informational rather than a failure.

## The rule

Every change was additive, and the startuphub.ai score read 100/100 on every re-scan. The principle is the one the whole site runs on. A scanner number is worth something only if it reflects what an agent actually finds, so a green check that lies is worth less than an honest red one. The worker that produces these results is open source at codeberg.org/erekola/turva-worker, readable line by line.

For an agent-readiness audit that reports measured results, contact info@turva.dev.

## Related

- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
- [x402 and agent payments](/guides/x402-agent-payments)
- [What an agent-readiness audit is](/guides/agent-readiness-audit)
`,
  "/guides/agent-commerce-discovery": `# Agent commerce discovery: A2A, AP2, and ACP

Before an AI agent can transact with a site, it has to discover what the site supports and how to reach it. Three machine-readable surfaces carry that information: an A2A Agent Card, an AP2 declaration, and an ACP discovery document. Each answers a different question, and an agent reads them before it sends a single commerce request.

## The A2A Agent Card

An A2A Agent Card is a JSON file, usually at /.well-known/agent-card.json, that describes an agent interface. It states the agent's name, version, and description, the interfaces it exposes, each with a service URL and a protocol binding, the capabilities it declares, and the skills it offers, each skill carrying an id, a name, and a description. The Agent2Agent protocol uses the card so one agent can discover another and know how to reach it.

The card is most useful when its skills mirror surfaces an agent can already reach, such as a service catalog or contact information. A skill that points nowhere is worse than no skill at all.

## AP2 and the version that matters

AP2 is the Agent Payments Protocol. Under the v0.1 specification, which is what deployed sites and scanners still validate against, a merchant declares support not as a separate file but as an extension entry inside the A2A Agent Card. The entry carries the extension URI, a role such as merchant, and a flag marking it required.

The detail that trips people up is the URI. Some helper guides write it as github.com/google-agentic-commerce/AP2/tree/v0.1.0, with an uppercase name and a three-part version. The v0.1 specification uses github.com/google-agentic-commerce/ap2/tree/v0.1, lowercase, version v0.1. A scanner that validates against that specification rejects the uppercase form even when everything else is correct. Copy the URI from the spec, not from a fix message.

Note that the current AP2 specification, v0.2 from April 2026, restructures the protocol around checkout and payment mandates and drops the Agent Card extension entirely. The deployed discovery convention and the scanners still follow v0.1, so publish the v0.1 declaration for discoverability today and expect this surface to change as v0.2 adoption arrives.

## ACP discovery and checkout

ACP is the Agentic Commerce Protocol, and it has two parts that are easy to confuse. The first is a discovery document at /.well-known/acp.json, which is still a proposal-stage RFC in the ACP repository rather than part of the released spec snapshots. The second is the checkout API the document points to.

The discovery document is small and strict. It states the protocol name acp and a version, the api_base_url, a transports array, and a capabilities.services array. The services value is a closed set of strings such as checkout, not a list of product objects. Sending the wrong type is the most common reason an otherwise complete document fails validation.

A discovery check usually reads only the document, not the checkout endpoint behind it. That makes it tempting to declare a service the site does not implement, because the check passes either way. An agent that trusts the document and calls the checkout URL would then reach nothing.

## A minimal honest checkout

A checkout endpoint does not have to support instant payment to be real. The ACP checkout session carries a status field, and one of its values is not_ready_for_payment. A site that sells through a written quote can create a genuine session, return it in that state, and attach a message that the engagement is confirmed in writing first. The agent receives a well-formed session that reflects how the business actually works, and the discovery claim holds because the endpoint behind it answers.

## Publish what is true

These surfaces exist so an agent can act without guessing, which only holds when every claim resolves to something real. A card whose skills lead nowhere breaks the same way a checkout that never responds does, because the agent follows the signal and finds nothing. Publish what is true, and back each declaration with a surface that answers.

turva.dev publishes an A2A Agent Card, an AP2 merchant declaration, and an ACP discovery document with a working checkout endpoint, verified by independent scanners. For an audit of a site's agent commerce surface, contact info@turva.dev.

## Related

- [x402 and agent payments](/guides/x402-agent-payments)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
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
  "/": `# Audits and advisory for products that AI agents read and act on

Agent-readiness is the measurable starting point, scored by independent scanners. The wider work is the data those agents depend on and the decisions you let them make. Both are measured before they are promised.

#1 of publicly-scanned sites on the startuphub.ai agent-readiness leaderboard. 100/100 verified by two independent scanners. Business ID 3600281-7.

## Independent agent-readiness scan of turva.dev

Scanner: startuphub.ai (third party). Discoverability, Content, Access Control, Capabilities, Commerce, Quality: 100/100 each. Verified 100/100, A+, ranked #1 of publicly-scanned sites on the startuphub.ai leaderboard.

## Where this applies

The pattern is narrow, but where it fits is not. Anywhere data moves and a decision follows, an agent can be the thing that reads the data and makes the call, as long as the inputs are clean and the envelope is set. A few examples:

- An agent reading a product catalog and completing a checkout for a buyer.
- An agent watching an API and acting the moment a threshold is crossed, without waiting for a person.
- An agent guiding a technician in the field, working from the same data the expert would.
- An agent triaging incoming requests and resolving the routine ones on its own.
- An agent operating a remote system over a link that drops, holding its last safe state until the data returns.
- An agent reconciling records across systems and flagging only what does not match.
- An agent making a time-critical call locally, where the round trip to a human is too slow to matter.

These are examples, not the list. The list does not really end. The same discipline carries from one case to the next, so the question is rarely whether an agent could do the work. It is whether the data reaching it and the limits set around it are good enough to trust.

## Evidence

turva.dev is my own reference build. It is ranked #1 of publicly-scanned sites on the startuphub.ai agent-readiness leaderboard, with 100/100 verified by two independent scanners. Measured 2026-07-02.

- startuphub.ai leaderboard: #1 of publicly-scanned sites, 100/100 (A+). Discoverability, Content, Access Control, Capabilities, Commerce, Quality: 100/100 each. https://www.startuphub.ai/agent-readiness
- isitagentready.com: 100/100, Level 5 (Agent-Native). https://isitagentready.com/turva.dev

turva.dev publishes its own web security scans too, on the same principle that the result should be measurable rather than asserted. Measured 2026-07-01.

- Hardenize: all 13 categories passed. https://www.hardenize.com/report/turva.dev
- Internet.nl: 98/100. IPv6, DNSSEC and RPKI pass in full. The single deduction is one HTTPS sub-test, the hash function for key exchange. https://internet.nl/site/turva.dev/

The Cloudflare Worker that produces these results is open source: https://codeberg.org/erekola/turva-worker. You can read every line before you hire me.

Backed by a registered business, publicly verifiable: Business ID 3600281-7, registered in Finland. PRH/YTJ business register: https://tietopalvelu.ytj.fi/yritys/3600281-7

## The process has three stages and no surprises

First, measurement. For agent-readiness, two independent scanners read the current state of the site or API and produce a numeric baseline with a categorized list of what is missing. For the wider work, the data path and the decision envelope are tested the way an agent would hit them, so the starting point is a fact rather than an opinion.

Then a written report. Three to ten priority fixes in order of impact, with technical reasoning written so the reader does not need a background in any of this to follow it.

Then the fixes. I implement them, or your engineering team does the work with the report as the spec. Both routes are supported and the choice is yours.

All communication runs async. No calls and no calendar links. Live meetings are not part of how this work is done. Short questions go through Signal, longer documents through email and CryptPad. Everything stays in writing, which means the work and the trail are auditable end-to-end.

Production credentials are not requested. Write access to repositories is not taken by default. Read access is enough for the audit, and write access is scoped per task if implementation is purchased separately.

The result is checkable, not asserted. For agent-readiness that is the scanner number, higher on the next scan in the categories and by the dates the report named. For the wider work it is the same test, the data path holding under load and the envelope doing exactly what it claims. Either the next measurement confirms it or it does not.

## Services

- Audit. Fixed scope, two to three weeks. Two independent scanners run against the site or API. Written report with a prioritized fix list. You receive a measured baseline and a clear "do this first" plan.
- Advisory. Monthly retainer, async-only. Ongoing review as the site, API or product evolves. Each scanner cycle reads higher than the last, or the report explains why a tradeoff was kept on purpose.
- Implementation. On request. Worker-level changes, well-known manifests, MCP server work, JSON-LD and Schema fixes. The improvement is verifiable against the audit baseline in the next scan.
- Agent operations. On request. The work beyond readiness: the data an agent acts on, and the decision envelope of permissions and thresholds that bounds what it is allowed to do.
- MCP server design. On request. Read-only discovery tools and streamable HTTP transport. No auth surface and no logging by default. The endpoint stays readable for agents and does not turn into an abuse vector.

## Who I am

The work is done by one person under a registered business. My background is engineering: measurement, testing, and reducing things to what actually matters. I have worked in international companies for years, and I keep only the tools and methods that hold up when the output is checked line by line.

The work stays measurable on purpose. Agent-readiness is a property a scanner reads, higher next week than this week or not. The wider work holds to the same test. The data an agent acts on either arrives intact or it does not, and the boundary you set either holds or it does not. Measurable either way, which is the only kind of claim I make.

## Contact

Written contact only. Email for longer messages, Signal for short questions. The first reply is in writing within one business day. No calls and no calendar links at any stage of the engagement.

- Email: <mailto:info@turva.dev>
- Signal: @turva.19
- LinkedIn: https://www.linkedin.com/in/erikrekola/

## Markdown views

You are reading the markdown view of this page, served with Accept:
text/markdown content negotiation. Every page on this site has one,
at the same URL, at a fraction of the token cost of the HTML.

## More
- [Services](https://turva.dev/services)
- [Company](https://turva.dev/company)
- [Contact](https://turva.dev/contact)
- [Legal](https://turva.dev/legal)
- [Agent registration](https://turva.dev/auth.md)

## Guides
- [Agent-readiness guides](https://turva.dev/guides)
- [What an agent-readiness audit is](https://turva.dev/guides/agent-readiness-audit)
- [How to get your site cited by AI assistants](https://turva.dev/guides/get-cited-by-ai-assistants)
- [llms.txt explained](https://turva.dev/guides/llms-txt)
- [MCP server cards explained](https://turva.dev/guides/mcp-server-card)
- [What agents.json is](https://turva.dev/guides/agents-json)
- [x402 and agent payments](https://turva.dev/guides/x402-agent-payments)
- [Response headers that help agents](https://turva.dev/guides/response-headers-for-agents)
- [SEO and agent-readiness are not the same](https://turva.dev/guides/seo-vs-agent-readiness)
- [Agent-readiness, AEO and GEO: how they relate](https://turva.dev/guides/agent-readiness-aeo-geo)
- [Letting agents act on data: the decision envelope](https://turva.dev/guides/letting-agents-act-on-data)
- [AI agent use cases: where agents read data and make decisions](https://turva.dev/guides/ai-agent-use-cases)
- [JSON-LD and structured data for agents](https://turva.dev/guides/json-ld-structured-data)
- [The /.well-known directory for agents](https://turva.dev/guides/well-known-for-agents)
- [Agentic Resource Discovery and ai-catalog.json](https://turva.dev/guides/agentic-resource-discovery)
- [How agents authenticate](https://turva.dev/guides/agent-authentication)
- [Why agent-readiness should be measured, not asserted](https://turva.dev/guides/measurement-led-agent-readiness)
- [Prerendering and why agents see empty pages](https://turva.dev/guides/prerendering-for-agents)
- [Sitemaps, robots.txt and agent access](https://turva.dev/guides/sitemaps-and-robots-for-agents)
- [Serving markdown to agents](https://turva.dev/guides/markdown-for-agents)
- [Open Knowledge Format (OKF) explained](https://turva.dev/guides/open-knowledge-format)
- [Common agent-readiness gaps on marketing sites](https://turva.dev/guides/agent-readiness-gaps)
- [Choosing an agent-readiness audit](https://turva.dev/guides/choosing-an-agent-readiness-audit)
- [Agent commerce discovery: A2A, AP2, and ACP](https://turva.dev/guides/agent-commerce-discovery)
- [Agentic commerce readiness: selling to AI shopping agents](https://turva.dev/guides/agentic-commerce-readiness)
`,

  "/services": `# Services

Five offerings. Async-only. One business day response.

## Audit

**€6,500. Two to three weeks. Fixed scope.**

A measurement of how agent-ready your site and APIs are today, with
a prioritized list of what to fix first.

What you get:
- Two independent scanners run against the site or API
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
- JSON-LD generators for product, organization and article schemas
- ai.txt and llms.txt authoring
- Signed content and agent authentication patterns

Scoped repository write access per task. No retainer.

## Agent operations

**Price on request. Scoped per engagement.**

The work beyond readiness, for teams moving from "an agent can read us" to "an agent can act on a system that matters." Two things decide whether an agent acts correctly. The data it works from has to arrive intact, even over links that drop or lag. And the decisions it is allowed to make have to sit inside an envelope of permissions and thresholds you set deliberately.

Typical work:
- Review of the data path an agent depends on, and where it breaks under real network conditions
- The permission and threshold envelope that bounds what an agent may decide and act on
- Where a human stays in the loop, and how control passes between person and agent
- Guardrails and verification so an agent's decisions can be checked after the fact

Scope and price vary with the system.

Suited for teams letting agents act on data and decisions that matter, not only read a marketing site.

## MCP server design

**Price on request. Scoped per engagement.**

An MCP server built for your product, exposing read-only data to agents over streamable HTTP transport. No auth surface and no logging by default.

Typical work:
- Read-only discovery tools over your product data
- Streamable HTTP transport with no auth surface and no logging by default
- An MCP server card at /.well-known/mcp/server-card.json so agents can discover the server
- Registry publication so the server is findable in MCP directories

Suited for teams that want agents to read product data through a supported interface rather than scraping HTML.

## The agent-ready badge

Sites that complete an audit, or score 100/100 on a public
agent-readiness scanner, may display the agent-ready badge.
Criteria and embed code: https://turva.dev/badge

## How to start

Email <mailto:info@turva.dev> with the site or API you want audited. I
respond within one business day with a fixed quote and a start date.

No calls or calendar links, and no discovery sessions.

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
product surface. This service answers one question: whether the
scanners read it higher next week than this week.

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
- The scope you have in mind (audit, advisory, implementation, agent operations, MCP server design)

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
registered in Finland as a sole proprietorship.
VAT-registered.

Contact: <mailto:info@turva.dev>

## Terms of engagement

The following terms apply to all engagements (audit, advisory,
implementation, agent operations and MCP server design) unless
replaced by a written agreement.

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

Last updated: 2026-07-04.
`,

  "/guides/open-knowledge-format": `# Open Knowledge Format (OKF) explained

The Open Knowledge Format is an open specification from Google Cloud that represents a body of knowledge as a directory of plain markdown files. Each concept file carries a small block of YAML frontmatter and a free-form body. The goal is a portable way to hand an AI agent the context it needs, readable by a person and parseable by a machine, with no SDK and no catalog to lock into. Google Cloud published it in June 2026 as version 0.1.

## What an OKF bundle contains

A bundle is a folder of markdown files, and the unit inside it is a concept. A concept is anything worth capturing for an agent: a table, a dataset, a metric, a runbook, an API. Every concept is one UTF-8 markdown document with two parts. A YAML frontmatter block at the top, fenced by a line of three dashes above and below, and a markdown body underneath.

The format asks for exactly one field, type. Everything else is optional, including title, description, resource, tags and a timestamp. What types exist and what fields each carries is left to whoever produces the bundle. Concepts reference each other with ordinary markdown links, so the folder becomes a graph of related knowledge rather than a flat list of files.

## Structural interoperability, not yet semantic

Version 0.1 fixes a small set of things and leaves the rest open. It fixes the shape of a bundle as a folder of markdown files, the YAML frontmatter, two reserved filenames and the single required field. That is structural interoperability: any tool can open a bundle and know where the pieces are.

What it does not fix is meaning. The format does not say what a metric concept must contain, or how two producers should agree on the same field names. That is semantic interoperability, and version 0.1 leaves it to producers and to conventions that have not been written yet. This is the line to keep in mind when reading the announcements around OKF. It standardizes the shape of the files, not yet what the files mean.

## Where OKF fits with agent-readiness

Agent-readiness, the kind measured by independent scanners, is about whether an agent can reach and read your public site at all. OKF sits next to that, one layer in. It is a way to package the internal knowledge an agent works from once it is past the front door: the catalog, the metrics and the rules a decision depends on.

So OKF is not a replacement for an llms.txt or a markdown surface on your site. It is the same instinct, plain text an agent can read without a special client, applied to the data and context behind the site rather than the pages in front of it. For a team thinking about what an agent acts on, not only what it can see, that is the part of the picture OKF addresses.

## What to do with it today

OKF is new and small, version 0.1, and the semantic half is still open. That makes it worth understanding now and worth watching, but early to build an entire knowledge catalog on. If you already serve markdown to agents and keep an llms.txt, you have the instinct OKF formalizes, and adopting it later will be a short step rather than a rebuild.

For an audit of how legibly AI agents can read your site and the data behind it, contact info@turva.dev.

## Related

- [llms.txt explained](/guides/llms-txt)
- [Serving markdown to agents](/guides/markdown-for-agents)
- [Letting agents act on data: the decision envelope](/guides/letting-agents-act-on-data)
`,
  "/guides": `# Agent-readiness guides

These short guides explain, in plain language, what makes a website or an API easy for AI agents to read and use. Each one covers a single topic and takes a few minutes to read. They are free, and they cover the same surfaces an [agent-readiness audit](/services) measures.

Not sure where to start? The first guide explains what an agent-readiness audit is.

## Discovery and content

How an agent finds your site and reads it without getting lost.

- [What an agent-readiness audit is](https://turva.dev/guides/agent-readiness-audit)
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
- [Choosing an agent-readiness audit](https://turva.dev/guides/choosing-an-agent-readiness-audit)

## Frequently asked

**What is an agent-readiness audit?**

An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API, scored against current standards by an independent scanner rather than a self-assessment.

**Do I need llms.txt on my site?**

If you want models and agents to read your real content rather than guess from a cached snippet, llms.txt gives them a curated map of what matters. It does not replace robots.txt or a sitemap, it complements them.

**How do I get my site cited by AI assistants?**

A model cites content it can read cleanly and corroborate. That means machine-readable surfaces such as llms.txt and structured data, a markdown form that does not exhaust the token budget, and being indexed where the assistant searches.

**What is an MCP server card?**

An MCP server card is a JSON file, usually at /.well-known/mcp/server-card.json, that lets an agent discover a site's Model Context Protocol server and the tools it exposes, so the agent can call them without a human wiring up the connection.

**Is agent-readiness the same as SEO?**

No. SEO makes a site rank for a person to click. Agent-readiness makes a site legible and usable by an agent that reads and acts. A site can rank well and still be opaque to agents.

**How is agent-readiness measured?**

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

## Related

- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps on marketing sites](/guides/agent-readiness-gaps)
- [AI agent use cases](/guides/ai-agent-use-cases)
`,

  "/guides/llms-txt": `# llms.txt explained

llms.txt is a plain text file at the root of a site that tells AI agents and language models what the site contains and where the important content lives. It works like a guide written for machines. A human reads the rendered page, an agent reads llms.txt and follows the links it lists.

The format is simple. The file opens with the site name and a short summary, then lists the key pages and resources as markdown links, often grouped under headings. Some sites also publish llms-full.txt, a single file that bundles the full text of the site so an agent can read everything in one request instead of crawling many pages.

The reason it matters is cost and clarity. A normal HTML page carries navigation, scripts, and styling that an agent has to wade through, and that spends tokens and invites mistakes. An llms.txt file, paired with markdown content negotiation, lets an agent fetch a clean text version and skip the noise. On turva.dev the markdown version of a page costs a fraction of the HTML, which is the difference between an agent reading the page reliably and an agent truncating it.

llms.txt is not a ranking trick and it does not replace a sitemap or robots.txt. A sitemap lists every URL for crawlers. robots.txt sets crawl rules. llms.txt is a curated, human-written map of what matters, aimed at models. The three work together.

Whether a site needs one depends on whether it wants to be legible to agents. If buyers, researchers, or assistants will ever ask a model about what the site does, a clear llms.txt raises the odds that the model reads the real content rather than guessing from a cached snippet.

Check any site's llms.txt structure with the free validator at https://turva.dev/llms-txt-validator.

turva.dev publishes llms.txt and llms-full.txt and serves markdown on request. For an audit of how legible a site is to agents, contact info@turva.dev.

## Related

- [Serving markdown to agents](/guides/markdown-for-agents)
- [How to get your site cited by AI assistants](/guides/get-cited-by-ai-assistants)
- [Agent-readiness, AEO and GEO: how they relate](/guides/agent-readiness-aeo-geo)
`,

  "/guides/mcp-server-card": `# MCP server cards explained

An MCP server card is a small JSON file that describes a site's Model Context Protocol server so an agent can find it and learn what it offers. It usually lives at /.well-known/mcp/server-card.json, though the path is not yet standardized. SEP-2127, the open proposal behind the card, now develops it as an experimental MCP extension. As of July 2026 its draft recommends serving the card at the MCP endpoint URL followed by /server-card, with a site-level catalog at /.well-known/mcp/catalog.json, so the convention may still move. An agent reads the card, finds the endpoint, and can then connect without a human wiring up the connection first.

The Model Context Protocol is a standard way for agents to use external tools and data. A server implements the protocol and exposes a set of tools, and the card is how that server announces itself. Without a card, an agent has no reliable way to discover that the server exists or what it can do, so the capability stays hidden even when it is live.

A useful card states the server name, the endpoint, and the transport, in a shape an agent can parse deterministically. Many published cards, including turva.dev's, also list the tools. The newer draft leaves tool listing to the MCP connection itself, since a live tools/list answer cannot go stale the way a static list can. turva.dev publishes a server card that points to a read-only MCP server, which exposes the same agent-readiness data that the site shows to people. That means an agent can query the data directly rather than scraping a page.

A server card sits in the same family as other well-known manifests an agent looks for, such as an API catalog, an OpenAPI description, and OAuth discovery. Each one removes a guess. The card answers what tools exist, the API catalog answers what endpoints exist, and OAuth discovery answers how to authenticate. Together they let an agent move from finding a site to operating it.

For sites that want to expose a capability to agents, the card is the cheapest high-value step, because it turns an invisible server into a discoverable one. For an audit of a site's capability surface, contact info@turva.dev.

## Related

- [What agents.json is](/guides/agents-json)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [How agents authenticate](/guides/agent-authentication)
`,

  "/guides/agents-json": `# What agents.json is

agents.json is a machine-readable file that declares what an AI agent can do on a site and how. Where llms.txt tells an agent what the site contains, agents.json describes the actions and endpoints an agent is allowed to use, so an automated client can move from reading to doing without a human wiring it up.

The file lists the operations a site exposes to agents, often pointing at an OpenAPI description or specific endpoints, along with the authentication an agent needs. An agent reads it, learns which actions exist, and calls them within the rules the site sets.

The reason it matters is that most sites expose actions only through a human interface, a form or a checkout flow that a person clicks through. An agent cannot reliably reverse-engineer that. A declared action surface removes the guesswork and turns a site from something an agent can read into something an agent can operate.

agents.json sits beside the other declarations an agent looks for. An MCP server card describes a site's MCP server, an API catalog lists endpoints, and OAuth discovery describes how to authenticate. Each one removes a guess, and together they let an agent act on a user's behalf safely.

A site does not need agents.json to be readable, but it needs something like it to be operable. The specification itself has stayed at version 0.1.0 since early 2025 and the ecosystem's momentum has moved to MCP and newer discovery surfaces, so treat agents.json as one declaration pattern rather than a settled standard. If the goal is for agents to complete tasks rather than just summarize the page, declaring the action surface is the step that makes that possible.

For an audit of a site's capability and action surface, contact info@turva.dev.

## Related

- [MCP server cards explained](/guides/mcp-server-card)
- [How agents authenticate](/guides/agent-authentication)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
`,

  "/guides/x402-agent-payments": `# x402 and agent payments

x402 is a way for a site to ask an agent to pay before it returns a resource, using the long-reserved HTTP 402 Payment Required status. It lets an automated client discover a price, pay, and continue, without a human stepping in to enter card details.

When an agent requests a paid resource, the server responds with 402 and a manifest that states what is being sold and how to pay. The agent reads the terms, completes the payment through a supported method, and retries the request. The transaction happens in the protocol, not in a checkout page built for human eyes.

This matters because agent commerce is held back by payment, not by capability. An agent can find a product and compare options, then stall at a checkout flow designed for a person with a browser. A declared payment surface such as x402, paired with structured pricing in the page data, lets the agent complete the purchase the same way it completed the search.

x402 belongs to a small family of agent payment standards, alongside authorization layers such as AP2. A site that publishes these signals tells agents that it is open for automated business, and in the case of the open peer pricelist model, it can be shown alongside other options at the moment an agent decides where to spend.

turva.dev publishes an x402 endpoint and manifest and participates in the x402-mesh peer pricelist. For an audit of a site's commerce surface for agents, contact info@turva.dev.

## Related

- [Agent commerce discovery: A2A, AP2, and ACP](/guides/agent-commerce-discovery)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
`,

  "/guides/response-headers-for-agents": `# Response headers that help agents

Response headers are the metadata a server sends with every page, and the right ones let an AI agent work without parsing the full HTML. They are the cheapest place to make a site more legible to automated clients, because an agent reads them before it reads the body.

A Link header can point an agent straight at a site's machine-readable resources, such as an API catalog or a markdown version of the page, so the agent finds them without crawling. A Vary header that includes Accept tells caches and agents that the site can return different formats for the same URL, which is what makes markdown content negotiation reliable. RateLimit and RateLimit-Policy headers let a well-behaved agent throttle itself instead of guessing, though as of July 2026 their IETF draft has expired without becoming a standard. Content-Language and a clean content type remove ambiguity about what the agent is reading.

The reason headers matter is order. An agent fetches the response, reads the status and headers first, and decides what to do next from them. If the headers already say where the structured data is and what formats are available, the agent can skip the expensive step of parsing a page built for human display.

Headers are easy to get wrong in ways that hurt agents. A missing Vary header breaks content negotiation. A Cache-Control immutable directive set on the wrong response can stop an agent from seeing an update. The fix is usually small and lives at the edge, which on turva.dev is a Cloudflare Worker that sets these headers on every response.

For an audit of a site's response and discovery surface, contact info@turva.dev.

## Related

- [Serving markdown to agents](/guides/markdown-for-agents)
- [Prerendering and why agents see empty pages](/guides/prerendering-for-agents)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
`,

  "/guides/seo-vs-agent-readiness": `# SEO and agent-readiness are not the same

Search engine optimization makes a site rank in a list of links for a person to click. Agent-readiness makes a site legible and usable by an AI agent that reads, decides, and sometimes acts on the user's behalf. The two overlap, but optimizing for one does not deliver the other.

SEO is built around keywords, backlinks, and a results page where a human chooses. The page is the destination. Agent-readiness is built around machine-readable surfaces such as llms.txt, structured data, response headers, and well-known manifests, where the agent is the reader and the page may never be seen by a person at all. A site can rank well on Google and still be opaque to an agent, and a site can be highly legible to agents while ranking modestly in classic search.

The gap is widening as people ask assistants instead of typing queries. When an answer comes from a model rather than a list of links, the question is not where a site ranks but whether the model can read the site cleanly and is willing to cite it. That depends on the discovery and content surface, not on the usual ranking signals.

This is why ranking on a search engine does not predict presence in an AI answer. They are scored on different things. A site that wants both has to do both, and the agent-readiness side is the one most teams have not started.

turva.dev measures the agent-readiness side and reports exactly which checks pass or fail. For an audit, contact info@turva.dev.

## Related

- [Agent-readiness, AEO and GEO: how they relate](/guides/agent-readiness-aeo-geo)
- [How to get your site cited by AI assistants](/guides/get-cited-by-ai-assistants)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
`,

  "/guides/json-ld-structured-data": `# JSON-LD and structured data for agents

JSON-LD is a block of structured data in a page that states facts in a form a machine can read without interpreting prose. It tells an agent what the page is about, who runs it, what it sells, and at what price, as data rather than as sentences an agent has to parse and might misread.

A human reads a price from a layout and a currency symbol. An agent reading raw HTML has to guess which number is the price and which is a shipping estimate. A JSON-LD Offer with a price and a currency removes the guess. The same applies to the organization behind a site, the services it offers, and the questions it answers, each expressed as a typed object an agent can rely on.

Structured data also connects a page to the wider graph an agent builds. Declared types such as Organization, Service, FAQPage, and Article let an agent place a page in context and decide whether to trust and cite it. A page that states its facts as data is easier for a model to summarize correctly and to attribute.

The cost of getting it wrong is silent. An agent does not report that it failed to parse a price, it just acts on a worse guess. Clean JSON-LD is one of the cheapest ways to make a page legible, and it sits in the same family as the response headers and well-known manifests an agent reads first.

turva.dev declares JSON-LD for its organization, the person behind it, its services, and its guides, and the next scan reads the structured data as present. For an audit of a site's structured data, contact info@turva.dev.

## Related

- [How to get your site cited by AI assistants](/guides/get-cited-by-ai-assistants)
- [llms.txt explained](/guides/llms-txt)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
`,

  "/guides/well-known-for-agents": `# The /.well-known directory for agents

The /.well-known directory is a standard place at the root of a site where agents look for machine-readable descriptions of what the site offers. Instead of crawling pages and guessing, an agent fetches a predictable path and reads a manifest that points it to everything else.

The idea comes from a long-standing web convention and now carries the files agents care about. An API catalog at a well-known path, defined by RFC 9727, lets an agent enumerate a site's public APIs from a single URL. A server card describes an MCP server and how to reach it. OAuth metadata describes how to authenticate. Payment and agent-payment manifests describe how to transact. security.txt says where to report a problem.

The value is that discovery becomes a lookup rather than a search. An agent that knows the convention can ask one predictable question and get a map, which is faster and far more reliable than inferring structure from rendered HTML. A site that publishes a complete well-known surface is announcing its capabilities in the language agents already speak.

A missing or thin well-known directory does not break a site for people, but it leaves an agent to guess, and most agents will simply move on. Publishing the manifests an agent expects is the difference between a capability that exists and a capability an agent can find.

turva.dev publishes an API catalog, a server card, OAuth metadata, payment manifests, and a security contact under /.well-known. For an audit of a site's discovery surface, contact info@turva.dev.

## Related

- [MCP server cards explained](/guides/mcp-server-card)
- [How agents authenticate](/guides/agent-authentication)
- [Sitemaps, robots.txt and agent access](/guides/sitemaps-and-robots-for-agents)
`,

  "/guides/agentic-resource-discovery": `# Agentic Resource Discovery and ai-catalog.json

Agentic Resource Discovery, or ARD, is an open specification for telling AI agents what a site offers, in one machine-readable file. Instead of inferring from pages whether a site has an MCP server, an agent interface, or an API, the site publishes a single index that names each resource and where to reach it. The specification appeared in 2026, is licensed under Apache 2.0, and builds on the AI Catalog data model maintained by a working group under the Linux Foundation.

## What it is

A site advertises its agentic resources by serving a static JSON manifest at /.well-known/ai-catalog.json. The manifest is a small envelope with a specVersion (turva.dev publishes 1.0), a host block that names the operator, and an entries array. Each entry describes one resource with a stable identifier, a display name, a type, a url, and a short description. A resource can be an MCP server, an A2A agent, an API, or a skill set. A registry can crawl published catalogs and answer a capability query by pointing an agent at the right resource.

## Where it sits

ARD is a discovery layer, not a transport. It helps an agent find the right resource, which the agent then calls through that resource's own protocol, whether MCP, A2A, or a plain API. Discovery comes first and invocation second. The catalog does not replace the manifests it points to, it indexes them, so a site keeps its server card, its agent card, and its OpenAPI description, and adds one file that ties them together.

## How it relates to llms.txt

An ai-catalog.json is not a ranking trick and it is not a content map. llms.txt tells an agent where a site's content lives. An ai-catalog tells an agent which agentic resources the site exposes and how to reach them. The two are complementary, and neither is about search ranking. Google confirmed in 2026 that llms.txt does not affect its search results, which is the same point agent-readiness has always made. These files are for agents that read and act.

## Why it matters

Adoption is early. In a public census in June 2026, none of the companies named as contributors to the specification yet served a discoverable ai-catalog.json, so publishing one now is a forward move rather than table stakes. The value is the same as every other discovery surface. A capability an agent cannot find is a capability that does not exist for that agent, and one predictable file turns a set of separate manifests into a single answer.

turva.dev serves an ai-catalog.json at /.well-known/ai-catalog.json that indexes its MCP server, its A2A agent, its API, and its agent skills, each of which already resolves on its own. For an audit of a site's discovery surface, contact info@turva.dev.

## Related

- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [MCP server cards explained](/guides/mcp-server-card)
- [Agent commerce discovery: A2A, AP2, and ACP](/guides/agent-commerce-discovery)
`,

  "/guides/agent-authentication": `# How agents authenticate

Agent authentication is how an automated client proves who it is and gains scoped access to a site, without a human logging in first. It is the step that turns a read-only agent into one that can act on a user's behalf, and it has to be discoverable or the agent cannot begin.

The pattern follows existing standards. OAuth discovery at a well-known path tells an agent where to request access and what scopes exist. An authorization server and a protected resource description let the agent ask for a token tied to a specific permission rather than a blanket login. When a site also advertises an agent registration flow, an agent can register and claim access on a user's behalf without someone provisioning credentials by hand.

The reason this matters is trust and blast radius. A site that exposes capability without scoped, discoverable auth either stays closed to agents or invites unsafe workarounds. Proper discovery lets an agent request the least access it needs, and lets the site grant capability without handing over a password the agent should never see.

A short auth description, sometimes published as an auth.md, gives an agent a human-readable entry point to the same flow. Together with OAuth discovery it answers the agent's first question about any action, which is how do I get permission to do this safely.

turva.dev publishes OAuth discovery, a protected resource description, and an agent registration entry point, and it never requests production credentials in an engagement. For an audit of a site's authentication surface, contact info@turva.dev.

## Related

- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [MCP server cards explained](/guides/mcp-server-card)
- [What agents.json is](/guides/agents-json)
- [Letting agents act on data: the decision envelope](/guides/letting-agents-act-on-data)
`,

  "/guides/measurement-led-agent-readiness": `# Why agent-readiness should be measured, not asserted

Agent-readiness is a property you can measure, so it should be measured rather than claimed. A checklist that a team fills in by hand records intentions. An independent scanner records what an agent actually finds when it reads the site, and those two often disagree.

The difference shows up the moment something changes. A header gets dropped in a deploy, or a manifest starts returning the wrong content type. A self-assessment still reads as done, because nobody re-ticked the box. A scan reads the live site and the category drops, which is the only signal that matches what an agent experiences.

Measurement also makes a result legible to a buyer. A claim that a site is agent-ready is an assertion. A score from an independent scanner, with a category breakdown and a date, is evidence that can be checked. The honest version of the claim is the number, and the number can be re-run by anyone.

This is the standard turva.dev applies to its own site and to client sites. An audit reports the exact checks that pass or fail, each failure comes with a concrete fix, and the next scan reads higher in the categories the report named. Measured by independent scanners, turva.dev is first among the publicly-scanned sites on the startuphub.ai agent-readiness leaderboard and reaches Level 5 on isitagentready.com.

For an audit that reports measured results rather than a checklist, contact info@turva.dev.

## Related

- [What an agent-readiness audit is](/guides/agent-readiness-audit)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Common agent-readiness gaps on marketing sites](/guides/agent-readiness-gaps)
- [Letting agents act on data: the decision envelope](/guides/letting-agents-act-on-data)
`,

  "/guides/prerendering-for-agents": `# Prerendering and why agents see empty pages

Many sites render their content with JavaScript in the browser, which means the first response an agent receives is an almost empty shell. A person waits a moment and the page fills in. An agent that reads the raw response sees a loading state and little else, and it judges the site on that.

This is the single most common reason a capable site is invisible to agents. The content exists, but it arrives after the agent has already read and moved on. Search crawlers have partly adapted to this over years. Many AI agents and fetchers have not, and they take the first response at face value.

The fix is to serve the real content in the first response for clients that need it. Prerendering renders the page on the server or at the edge and returns finished HTML, so an agent reads the content immediately. A cleaner option for agents is to serve a markdown version of the page on request, which skips the rendering question entirely and costs a fraction of the tokens.

The decision is not all or nothing. A site can keep its interactive experience for people and serve prerendered or markdown content to agents and bots, deciding by the request. On turva.dev that decision lives in a Cloudflare Worker that detects the client and returns the right form.

For an audit of how a site renders for agents, contact info@turva.dev.

## Related

- [Serving markdown to agents](/guides/markdown-for-agents)
- [Response headers that help agents](/guides/response-headers-for-agents)
- [Common agent-readiness gaps on marketing sites](/guides/agent-readiness-gaps)
`,

  "/guides/sitemaps-and-robots-for-agents": `# Sitemaps, robots.txt and agent access

robots.txt and the sitemap are the oldest machine-readable files on the web, and they still decide whether an agent is allowed in and what it can find. An agent reads robots.txt to learn the rules and the sitemap to learn the map, before it reads any page.

robots.txt does two jobs for agents. It sets crawl rules, and it can name AI crawlers explicitly, so a site states whether it welcomes GPTBot and similar clients rather than leaving them to guess. A Content-Signal directive can go further and declare how content may be used, separating ordinary search from AI input and training, which gives a site granular control instead of an all-or-nothing block.

The sitemap answers the other question, which is what exists. A complete sitemap lists every canonical URL with a last-modified date, so an agent can find the real pages without inferring them from navigation. A page that is not in the sitemap is a page an agent may never reach.

Getting these wrong is quietly expensive. A robots.txt that blocks an AI crawler by accident removes a site from that assistant's answers. A stale sitemap hides new pages. The files are small and the fix is fast, which is why they are the first thing a readiness review checks.

turva.dev declares AI bot rules and Content Signals in robots.txt and keeps a complete sitemap. For an audit of a site's crawl and access surface, contact info@turva.dev.

## Related

- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [Response headers that help agents](/guides/response-headers-for-agents)
- [How to get your site cited by AI assistants](/guides/get-cited-by-ai-assistants)
`,

  "/guides/markdown-for-agents": `# Serving markdown to agents

An HTML page is built for a browser, and an agent that reads it pays for all the markup, scripts, and layout it does not need. Serving a markdown version of the same page gives an agent the content without the wrapper, which is both cheaper and less error-prone.

The mechanism is content negotiation. An agent sends an Accept header asking for text/markdown, and the server returns the markdown form of the page at the same URL. A site can also publish llms-full.txt, a single file that bundles the whole site as text, so an agent can read everything in one request instead of fetching many pages.

The saving is large. On turva.dev the markdown form of a page costs a fraction of the tokens the HTML would, and the difference decides whether an agent reads a page in full or truncates it halfway. A model that runs out of budget on markup is a model that answers from a partial reading.

Markdown delivery is not a separate site, it is the same content offered in a second form. The page stays as it is for people, and an agent that asks for text gets text. Paired with a clear llms.txt that lists where the content lives, it makes a site fast and reliable to read at machine speed.

turva.dev serves markdown on request and publishes llms.txt and llms-full.txt. For an audit of a site's content surface for agents, contact info@turva.dev.

## Related

- [llms.txt explained](/guides/llms-txt)
- [Response headers that help agents](/guides/response-headers-for-agents)
- [Prerendering and why agents see empty pages](/guides/prerendering-for-agents)
`,

  "/guides/agent-readiness-gaps": `# Common agent-readiness gaps on marketing sites

Most marketing sites are strong for people and weak for agents, and the gaps are predictable. A readiness review tends to find the same handful of misses, each of which quietly removes the site from an agent's view.

The first is rendering. A site that builds its content with JavaScript returns an empty shell to an agent, so the content never arrives in the first response. The second is discovery. No llms.txt and a thin or missing sitemap, so an agent has nothing to read but rendered pages. The third is cost. Only HTML is offered, with no markdown form, so an agent spends its budget on markup and truncates the page.

Beyond those, capability is usually undeclared. The site may have an API or a useful action, but with no server card or OAuth discovery, an agent cannot find or use it. Structured data is often missing too, so prices and facts are left for the agent to infer from layout.

None of these are hard to fix, and that is the point. The work is mostly at the edge and in a few small files, and the result shows up immediately in a scanner. A site does not have to rebuild to become legible to agents, it has to publish what agents already look for.

turva.dev runs this exact review and reports each gap with a concrete fix. For an audit, contact info@turva.dev.

## Related

- [What an agent-readiness audit is](/guides/agent-readiness-audit)
- [Prerendering and why agents see empty pages](/guides/prerendering-for-agents)
- [Choosing an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/choosing-an-agent-readiness-audit": `# Choosing an agent-readiness audit

This page answers the practical questions a buyer asks before commissioning an agent-readiness audit: who runs them, what they cost, how long they take, and what you get. The conceptual guides cover the surfaces themselves. This one covers the engagement.

## Who provides agent-readiness audits

turva.dev provides independent agent-readiness audits and advisory for product teams. It is a registered business in Tampere, Finland (Business ID 3600281-7), run by Erik Rekola. The audit measures a site or API against current standards using independent public scanners, then returns a written report with prioritized fixes.

## What an audit costs

turva.dev prices an audit at a fixed €6,500 for a two to three week engagement. Advisory is €3,000 per month with a three month minimum, and implementation is €1,500 per day, scoped per task. Prices exclude VAT, and the scope is written before any payment.

## How long it takes

A fixed-scope audit takes two to three weeks. Advisory and implementation run on the cadence the engagement sets.

## What you get

A written report that lists each check, what the scanner found, and a concrete fix for each gap, ordered by priority. The result is verifiable. An independent scanner reads the site before and after, and the categories that were fixed read higher on the next scan.

## How to make a site agent-ready

Publish the surfaces agents read, then measure the result. That means llms.txt, a markdown form of each page, a complete robots.txt and sitemap, JSON-LD for the facts on a page, the /.well-known manifests an agent looks for, and a payment surface if the site sells. Each of these has its own guide in the index.

## How the work runs

Async only. No calls, no calendar links, no discovery meetings. Replies within one business day. Fixed scope per engagement, written before payment, and an open-source reference implementation you can read before deciding.

For an audit, contact info@turva.dev.

## Related

- [What an agent-readiness audit is](/guides/agent-readiness-audit)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps on marketing sites](/guides/agent-readiness-gaps)
`,

  "/guides/agent-readiness-aeo-geo": `# Agent-readiness, AEO and GEO: how they relate

Three terms describe overlapping work, and the difference matters when you decide what to fix. Answer engine optimization (AEO) is about the pages, so an AI engine can quote them as the answer to a question. Generative engine optimization (GEO) is about the signal around the pages, so an engine trusts the source enough to cite it. Agent-readiness is wider than both, because it also covers whether an agent can act on the site, not only read and cite it.

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

## Related

- [SEO and agent-readiness are not the same](/guides/seo-vs-agent-readiness)
- [How to get your site cited by AI assistants](/guides/get-cited-by-ai-assistants)
- [llms.txt explained](/guides/llms-txt)
`,
  "/guides/agentic-commerce-readiness": `# Agentic commerce readiness: selling to AI shopping agents

An AI shopping agent buys on a person's behalf. It reads a catalog, compares options, and completes a checkout without a human filling in a form. Agentic commerce readiness is the work of making a site one of those agents can actually transact with, rather than one it skips because the path is unclear or blocked.

## What an agent needs to buy

An agent needs three things in machine-readable form. It needs to find the offer, with a price and currency it can parse rather than infer from a layout. It needs a checkout it can drive through a protocol, not a page built for a mouse. And it needs the purchase to behave predictably, so the same call produces the same result every time. A catalog that looks perfect to a person can still be opaque to an agent on all three counts.

## The protocols in play

Checkout is becoming a protocol rather than a page. Stripe and OpenAI shipped Instant Checkout inside ChatGPT in 2025. Google and Shopify introduced a universal commerce protocol in early 2026. The discovery layer is settling on a small set of standards. An A2A Agent Card describes the interface, AP2 authorizes agent payments, ACP carries the checkout, and x402 lets an agent meet a price with HTTP 402 and continue. A site does not need all of them, but it needs the ones its buyers' agents speak, declared where an agent looks.

## Where sites fail the agent

Most catalogs lose the agent before checkout. A price that lives only in rendered HTML, a CAPTCHA wall, a maintenance interstitial, or a discovery file that claims a capability the endpoint does not answer. Each one ends the purchase silently. The agent does not complain, it moves to a competitor whose path resolves. The failure looks like no traffic rather than a broken page, which is why it goes unmeasured.

## Readiness is testable

Whether an agent can buy is observable, the same way agent-readiness is. Declare the offer as structured data, expose a checkout an agent can call, publish the discovery files the protocols define, and back every claim with an endpoint that answers. Then test it the way an agent would, by driving the path end to end and watching where it stops. turva.dev built and verified its own agent commerce surface this way, across A2A, AP2, ACP and x402, checked by independent scanners.

For an audit of whether AI shopping agents can discover and complete a purchase on your site, contact info@turva.dev.

## Related

- [Agent commerce discovery: A2A, AP2, and ACP](/guides/agent-commerce-discovery)
- [x402 and agent payments](/guides/x402-agent-payments)
- [The /.well-known directory for agents](/guides/well-known-for-agents)`,
  "/guides/letting-agents-act-on-data": `# Letting agents act on data: the decision envelope

Reading a site is the first step. The harder one is letting an agent act on a system that matters, where a wrong move has a cost. That depends on two things the model does not provide on its own. The data the agent works from has to arrive intact, and the decisions it is allowed to make have to sit inside a boundary you set.

## A decision is only as good as its inputs

An agent's decision is bounded by the data that reaches it. In a clean environment that is invisible. Where the work happens it is the whole problem, because a dropped link, a delayed hop, or a single lost packet leaves the agent acting on stale input. The model did not get worse, its inputs did. Reliability lives in the layer below the model, where data either arrives in order and on time or it does not.

## The envelope is the real control

A correct decision is not an agent doing whatever it infers. It is an agent acting inside an envelope defined for it, the permissions, the thresholds, and the explicit list of what it may touch and what it may not. The judgment is front-loaded into that boundary by a person who knew the stakes. Draw it loosely and a capable agent still does something, just not what you wanted. Draw it well and the same agent is one you can leave alone.

## Keep a person where judgment belongs

Letting agents act is not removing people. The stronger pattern carries a human expert's judgment to where the work is and lets the agent handle the parts that have to be instant or exact, with a clear point where control passes back. The hardest version is where no person can step in fast enough, so the decision has to be made locally under rules agreed in advance. The fields that work under that constraint learned the discipline first.

## Make it checkable

An agent that acts has to be auditable. Log what it decided and why, keep the envelope explicit rather than implied, and verify after the fact that it stayed inside the boundary. Guardrails that cannot be checked are not guardrails. This is the difference between an agent that is impressive in a demo and one you would let touch a real operation.

This is the work behind the Agent operations engagement. For a review of the data path, the decision envelope, and where a human stays in the loop, contact info@turva.dev.

## Related

- [How agents authenticate](/guides/agent-authentication)
- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
- [Why agent-readiness should be measured, not asserted](/guides/measurement-led-agent-readiness)
- [AI agent use cases](/guides/ai-agent-use-cases)`,
  "/guides/ai-agent-use-cases": `# AI agent use cases

An AI agent is useful wherever data moves and a decision follows. It reads a machine-readable surface, decides inside the limits it was given, and acts on what it finds. The cases below are grouped by what the agent does, not by industry, because the same pattern repeats across all of them.

## Commerce and transactions

An agent reads a product catalog, weighs the options against a buyer's constraints, and completes a checkout through a protocol rather than a form. The work is making the offer, the price, and the checkout legible and reliable enough for the agent to finish without a human in the loop.

## Monitoring and response

An agent watches an API, a feed, or a system and acts the moment a threshold is crossed, with no one having to be watching. The work is a clean data path so the signal arrives in time, and a tight envelope so the agent takes only the actions it is allowed to.

## Field and frontline support

An agent guides a person doing physical work, drawing on the same data an expert would and answering from it in the moment. The agent extends the expert's reach instead of standing in for the person at the far end.

## Operations under bad connectivity

An agent runs a remote system over a link that drops, holding its last safe state and resuming cleanly when data returns. This is where the data path matters most, because one lost packet can stall every decision queued behind it.

## Back-office and data work

An agent reconciles records across systems, flags only what does not match, and routes the rest. The value is consistency, a decision the agent makes the same way every time, with a trail you can audit afterwards.

## Autonomy at the edge

An agent makes a time-critical call locally, where the round trip to a human is too slow to matter. The decision has to sit inside rules agreed in advance, because there is no one to ask. The fields that already live with hard time limits learned that discipline early.

## The common thread

These are examples, not a closed list. The same discipline carries from one case to the next. The question is rarely whether an agent could do the work. It is whether the data reaching it is clean and the envelope around it is set, because those two decide whether the agent makes the right call or a fast wrong one.

If you want an agent to do one of these reliably, or to measure how ready your site or API is for agents in the first place, contact info@turva.dev.

## Related

- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
- [Letting agents act on data: the decision envelope](/guides/letting-agents-act-on-data)
- [What an agent-readiness audit is](/guides/agent-readiness-audit)`,
  "/guides/get-cited-by-ai-assistants": `# How to get your site cited by AI assistants

When a person asks ChatGPT, Perplexity, Claude, or Gemini a question, the assistant answers from sources it can read and trust. Getting cited means being one of those sources. A site is cited when the assistant can reach its content, read it cheaply, confirm the facts, and find corroboration elsewhere. This guide covers what that takes.

## Be readable, not just rendered

An assistant that does not run JavaScript sees an empty shell where a client-rendered page should be. The first requirement is that the content arrives in the response: a prerendered or static page, a markdown form served through content negotiation, and an llms.txt that maps the site. A page an assistant cannot read is a page it cannot cite.

## State your facts as data

Prose can be summarized wrongly. JSON-LD states the facts of a page, such as the organization, the service, and the price, as data an assistant reads without inference. Structured data also ties a page to an entity an assistant already knows, which is why a Wikidata item and consistent sameAs links raise the odds that the assistant attributes the content to the right source.

## Be corroborated

An assistant is more likely to cite a claim it can confirm in more than one place. A site that only references itself is weaker than one that independent sources also describe. Open-source code, a public company record, listings in directories an assistant trusts, and genuine third-party mentions all raise confidence. The signal is consistency across sources, not volume.

## Be indexed where the assistant searches

Several assistants retrieve through a search index before they answer. If a site is not indexed where the assistant looks, it cannot be cited regardless of quality. Submitting URLs through the index protocols a site supports, and keeping the sitemap and llms.txt current, is how new content reaches that layer.

## Measure it

Whether a site is cited is observable. Ask the assistants the questions a buyer would ask and record which sources they name. Repeat on a schedule. The sources that appear, and the ones that do not, tell you where the work is. turva.dev runs this check monthly against its own queries.

For an audit of how legible and citable a site is to assistants, contact info@turva.dev.

## Related

- [Agent-readiness, AEO and GEO: how they relate](/guides/agent-readiness-aeo-geo)
- [SEO and agent-readiness are not the same](/guides/seo-vs-agent-readiness)
- [llms.txt explained](/guides/llms-txt)
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
  supported_identity_types: ["anonymous", "identity_assertion", "email", "github", "linkedin"],
  credentials_note: "Credentials only attribute correspondence. Every resource is public and none requires a credential."
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
      { "href": "https://turva.dev/.well-known/ai-catalog.json", "type": "application/json", "title": "AI catalog (ARD)" },
      { "href": "https://turva.dev/.well-known/mcp/server-card.json", "type": "application/json", "title": "MCP Server Card" },
      { "href": "https://turva.dev/.well-known/agent-card.json", "type": "application/json", "title": "A2A Agent Card" },
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
    "version": "3.18.0",
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
          "model": "quote_on_request",
          "amount_cents": 650000,
          "currency": "EUR",
          "description": "Audit: fixed scope, 2-3 weeks",
          "x402": {
            "network": "base",
            "asset": "USDC",
            "amount": "7413000000",
            "scheme": "exact"
          }
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
          "model": "quote_on_request",
          "amount_cents": 300000,
          "currency": "EUR",
          "interval": "month",
          "description": "Advisory: monthly retainer (min 3 months)",
          "x402": {
            "network": "base",
            "asset": "USDC",
            "amount": "3421000000",
            "scheme": "exact"
          }
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
          "model": "quote_on_request",
          "amount_cents": 150000,
          "currency": "EUR",
          "description": "Implementation: per day, scoped per task",
          "x402": {
            "network": "base",
            "asset": "USDC",
            "amount": "1711000000",
            "scheme": "exact"
          }
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
    "/.well-known/ai-catalog.json": { "get": { "summary": "AI catalog (ARD)", "operationId": "getAiCatalog", "responses": { "200": { "description": "ok" } } } },
    "/.well-known/agent-card.json": { "get": { "summary": "A2A Agent Card", "operationId": "getAgentCard", "responses": { "200": { "description": "ok" } } } },
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
  "logo_url": "https://turva.dev/logo.png",
  "auth": { "type": "none" },
  "api": { "type": "openapi", "url": "https://turva.dev/openapi.json" }
}, null, 2);

// --- signed manifests (provenance) ---
var JWKS_JSON = "{\n  \"keys\": [\n    {\n      \"kty\": \"OKP\",\n      \"crv\": \"Ed25519\",\n      \"x\": \"fZpH2DFoup6FI_leaxJWrvpfP4xf8gPLjh6okbFOrJU\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"use\": \"sig\",\n      \"alg\": \"EdDSA\"\n    }\n  ]\n}";
var SIGNATURES_JSON = "{\n  \"keys\": \"https://turva.dev/.well-known/jwks.json\",\n  \"signatures\": {\n    \"/.well-known/ai-plugin.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"APkGCuxheHpyMEuWvlSRuwpASeRgT0GLo8V2O5oA6PywVth8eZ30GGI9ry9j0fC_2e8Ja3LB5sy6QJAESR4FAA\"\n    },\n    \"/.well-known/agent.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"APkGCuxheHpyMEuWvlSRuwpASeRgT0GLo8V2O5oA6PywVth8eZ30GGI9ry9j0fC_2e8Ja3LB5sy6QJAESR4FAA\"\n    },\n    \"/.well-known/mcp/server-card.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"yR7wOHiGGT_f-AIcAL56mEjiSaQ8nSQ-UJyFLrGZ8L_UUbLMORPN8Z0RyOOfqNgfDilRpDzwEsBbtcMu0kuVBg\"\n    },\n    \"/llms.txt\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"YYiQr007iZH0Yz9j3rqfDS9jEkEA05h2oLeNhI1Gb1c2ePJPi_sGAK1WyScqSGpM1Uhc7Xz5S3OaHoUZaOY8BQ\"\n    }\n  }\n}";

var MCP_SERVER_CARD = JSON.stringify({
  "$schema": "https://modelcontextprotocol.io/schemas/server-card/2025-10.json",
  "serverInfo": {
    "name": "turva-mcp",
    "title": "turva.dev",
    "version": "1.2.1",
    "description": "Public read-only MCP server for turva.dev. Exposes the service catalog (audit, advisory, implementation, agent operations, MCP server design) with prices, own-domain agent-readiness scan evidence, and engagement principles (async-only, no calls, no calendar links). No authentication, no write operations."
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
    { "name": "get_services", "description": "Service catalog (audit, advisory, implementation, agent operations, MCP server design), the engagement model, and pricing." },
    { "name": "get_agent_readiness", "description": "turva.dev's own agent-readiness scores from independent public scanners (startuphub.ai, isitagentready.com), with per-scanner sub-scores, leaderboard rank, measurement date, and verification links." },
    { "name": "get_security_evidence", "description": "Latest public web-security scan results for turva.dev's own domain (Hardenize, Internet.nl), with the scan date." },
    { "name": "get_principles", "description": "Engagement principles: async-only, least access, the result shows up in scanner numbers, open and verifiable." }
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
  "version": "3.18.0",
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
        "description": "AP2 agent payments. turva.dev acts as merchant. Payment is quote-on-request, settled via x402 on Base (USDC).",
        "required": true,
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
      "description": "List the service offerings of turva.dev (audit, advisory, implementation, agent operations, MCP server design). Fixed prices in EUR for audit, advisory and implementation.",
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

var X402_MANIFEST = JSON.stringify({
  "x402Version": 1,
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
      "payTo": X402_PAY_TO,
      "maxTimeoutSeconds": 300,
      "asset": X402_USDC_BASE,
      "extra": { "name": "USDC", "version": "2" }
    },
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "7413000000",
      "resource": "https://turva.dev/api/agent/audit",
      "description": "Agent-readiness audit (€6,500 / 7413 USDC)",
      "mimeType": "application/json",
      "payTo": X402_PAY_TO,
      "maxTimeoutSeconds": 300,
      "asset": X402_USDC_BASE,
      "extra": { "name": "USDC", "version": "2" }
    },
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "3421000000",
      "resource": "https://turva.dev/api/agent/advisory",
      "description": "Monthly advisory (€3,000 / 3421 USDC)",
      "mimeType": "application/json",
      "payTo": X402_PAY_TO,
      "maxTimeoutSeconds": 300,
      "asset": X402_USDC_BASE,
      "extra": { "name": "USDC", "version": "2" }
    },
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "1711000000",
      "resource": "https://turva.dev/api/agent/implementation",
      "description": "Implementation day (€1,500 / 1711 USDC)",
      "mimeType": "application/json",
      "payTo": X402_PAY_TO,
      "maxTimeoutSeconds": 300,
      "asset": X402_USDC_BASE,
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
      "description": "turva.dev x402 discovery probe. Agents pay 0.001 USDC on Base to GET this resource. The real payable services are /api/agent/audit, /api/agent/advisory and /api/agent/implementation.",
      "mimeType": "application/json",
      "payTo": X402_PAY_TO,
      "maxTimeoutSeconds": 300,
      "asset": X402_USDC_BASE,
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
        "payTo": X402_PAY_TO,
        "maxTimeoutSeconds": 300,
        "asset": X402_USDC_BASE,
        "extra": { "name": "USDC", "version": "2", "label": label, "eurCents": amountEurCents }
      }
    ],
    "error": "Payment required to access this resource"
  }, null, 2);
}

// ============================================================
// X402-MESH (added in v3.12.0) - startuphub.ai x402-mesh/0.1 spec
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
  "wallet": X402_PAY_TO,
  "contact": "info@turva.dev",
  "self": {
    "vendor_id": "turva-dev",
    "name": "turva.dev: Agent-readiness audits and advisory",
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
    { "resource": "https://turva.dev/api/agent/audit",          "network": "base", "asset": "USDC", "amount": "7413000000" },
    { "resource": "https://turva.dev/api/agent/advisory",       "network": "base", "asset": "USDC", "amount": "3421000000" },
    { "resource": "https://turva.dev/api/agent/implementation", "network": "base", "asset": "USDC", "amount": "1711000000" }
  ]
}, null, 2);

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
    "supported_rails": ["x402-base-usdc"],
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
 return { email: 'info@turva.dev', signal: '@turva.19', linkedin: 'https://www.linkedin.com/in/erikrekola/', businessId: '3600281-7', language: 'en', engagement: 'async-only' };
 }
 },
 {
 name: 'get_services',
 description: 'Return the services offered by turva.dev (audit, advisory, implementation, agent operations, MCP server design). Fixed prices in EUR for audit, advisory and implementation.',
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

var SITEMAP_LASTMOD = "2026-07-02";
var SITEMAP_ENTRIES = [
  ["/", "weekly", "1.0"],
  ["/services", "monthly", "0.9"],
  ["/company", "monthly", "0.7"],
  ["/contact", "monthly", "0.7"],
  ["/legal", "yearly", "0.3"],
  ["/auth.md", "yearly", "0.4"],
  ["/guides", "monthly", "0.8"],
  ["/guides/agent-readiness-audit", "monthly", "0.7"],
  ["/guides/llms-txt", "monthly", "0.7"],
  ["/guides/mcp-server-card", "monthly", "0.7"],
  ["/guides/agents-json", "monthly", "0.7"],
  ["/guides/x402-agent-payments", "monthly", "0.7"],
  ["/guides/response-headers-for-agents", "monthly", "0.7"],
  ["/guides/seo-vs-agent-readiness", "monthly", "0.7"],
  ["/guides/agent-readiness-aeo-geo", "monthly", "0.7"],
  ["/guides/agentic-commerce-readiness", "monthly", "0.7"],
  ["/guides/letting-agents-act-on-data", "monthly", "0.7"],
  ["/guides/ai-agent-use-cases", "monthly", "0.7"],
  ["/guides/json-ld-structured-data", "monthly", "0.7"],
  ["/guides/well-known-for-agents", "monthly", "0.7"],
  ["/guides/agentic-resource-discovery", "monthly", "0.7"],
  ["/guides/agent-authentication", "monthly", "0.7"],
  ["/guides/measurement-led-agent-readiness", "monthly", "0.7"],
  ["/guides/prerendering-for-agents", "monthly", "0.7"],
  ["/guides/sitemaps-and-robots-for-agents", "monthly", "0.7"],
  ["/guides/markdown-for-agents", "monthly", "0.7"],
  ["/guides/agent-readiness-gaps", "monthly", "0.7"],
  ["/guides/choosing-an-agent-readiness-audit", "monthly", "0.8"],
  ["/guides/get-cited-by-ai-assistants", "monthly", "0.8"],
  ["/guides/agent-commerce-discovery", "monthly", "0.7"],
  ["/guides/open-knowledge-format", "monthly", "0.7"],
  ["/blog", "weekly", "0.7"],
  ["/blog/honesty-and-the-checker", "monthly", "0.6"],
  ["/blog/auditing-the-auditor", "monthly", "0.6"],
  ["/blog/re-checking-the-guides", "monthly", "0.6"],
  ["/blog/cheaper-pages-revisited", "monthly", "0.6"],
  ["/blog/moving-source-to-codeberg", "monthly", "0.6"],
  ["/blog/free-llms-txt-validator", "monthly", "0.6"],
  ["/blog/agent-access-is-now-a-setting", "monthly", "0.6"],
  ["/blog/two-scanner-audit-method", "monthly", "0.6"],
  ["/blog/open-knowledge-format", "monthly", "0.6"],
  ["/blog/publishing-an-ai-catalog", "monthly", "0.6"],
  ["/blog/cheaper-pages-for-agents", "monthly", "0.6"],
  ["/blog/moving-off-prerender", "monthly", "0.6"],
  ["/blog/honest-agent-commerce-checks", "monthly", "0.6"],
  ["/blog/owning-your-fediverse-identity", "monthly", "0.6"],
  ["/blog/reliable-agent-decisions", "monthly", "0.6"],
  ["/blog/verifiable-agent-identity", "monthly", "0.6"],
  ["/badge", "monthly", "0.5"],
  ["/llms-txt-validator", "monthly", "0.6"],
];
function buildSitemapXml() {
  const rows = SITEMAP_ENTRIES.map(function(e) {
    const path = e[0], cf = e[1], pr = e[2];
    let lastmod;
    if (path.indexOf("/blog/") === 0) {
      lastmod = (META_BY_PATH[path] && META_BY_PATH[path].date) || SITEMAP_LASTMOD;
    } else if (path === "/blog") {
      const ds = Object.keys(META_BY_PATH).filter(function(k) { return k.indexOf("/blog/") === 0; }).map(function(k) { return META_BY_PATH[k].date; }).filter(Boolean).sort();
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
    const title = esc((meta.title || "").replace(/ \| turva\.dev$/, ""));
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

var CANONICAL_PATHS = new Set(["/", "/services", "/company", "/contact", "/legal", "/guides", "/guides/agent-readiness-audit", "/guides/llms-txt", "/guides/mcp-server-card", "/guides/agents-json", "/guides/x402-agent-payments", "/guides/response-headers-for-agents", "/guides/seo-vs-agent-readiness", "/guides/json-ld-structured-data", "/guides/well-known-for-agents", "/guides/agent-authentication", "/guides/measurement-led-agent-readiness", "/guides/prerendering-for-agents", "/guides/sitemaps-and-robots-for-agents", "/guides/markdown-for-agents", "/guides/agent-readiness-gaps", "/guides/choosing-an-agent-readiness-audit", "/guides/get-cited-by-ai-assistants", "/blog", "/blog/agent-access-is-now-a-setting", "/blog/two-scanner-audit-method", "/blog/cheaper-pages-for-agents", "/blog/moving-off-prerender", "/blog/honest-agent-commerce-checks", "/guides/agent-commerce-discovery", "/blog/owning-your-fediverse-identity", "/blog/reliable-agent-decisions", "/blog/verifiable-agent-identity", "/guides/agent-readiness-aeo-geo", "/guides/agentic-commerce-readiness", "/guides/letting-agents-act-on-data", "/guides/ai-agent-use-cases", "/guides/open-knowledge-format", "/blog/open-knowledge-format", "/guides/agentic-resource-discovery", "/blog/publishing-an-ai-catalog", "/badge", "/llms-txt-validator", "/blog/free-llms-txt-validator", "/blog/auditing-the-auditor", "/blog/moving-source-to-codeberg", "/blog/cheaper-pages-revisited", "/blog/re-checking-the-guides", "/blog/honesty-and-the-checker"]);

function getCanonicalForPath(pathname) {
  if (CANONICAL_PATHS.has(pathname)) {
    return "https://turva.dev" + pathname;
  }
  return null;
}

var META_BY_PATH = {
  "/blog/honesty-and-the-checker": {
    title: "When honesty and the checker disagree | turva.dev",
    description: "Making this site's auth.md cleaner made the scanner fail. The honest form was the precise one, neither gutted nor padded to please the check.",
    date: "2026-07-06",
    image: "/og-honesty-and-the-checker.jpg",
    imageAlt: "When honesty and the checker disagree"
  },
  "/blog/auditing-the-auditor": {
    title: "Auditing the auditor with four AI agents | turva.dev",
    description: "Four AI agents read every line of turva.dev. Of 91 findings, four HIGH alerts failed verification and one held. False-positive discipline is the hard part.",
    date: "2026-07-04",
    image: "/og-auditing-the-auditor.jpg",
    imageAlt: "Auditing the auditor with four AI agents"
  },
  "/blog/re-checking-the-guides": {
    title: "Four AI agents re-checked the guides | turva.dev",
    description: "Four AI agents re-read the guides against the specifications behind them. One high finding, one expired draft, six small fixes. The scanners never noticed.",
    date: "2026-07-04",
    image: "/og-re-checking-the-guides.jpg",
    imageAlt: "Four AI agents re-checked the guides"
  },
  "/blog/cheaper-pages-revisited": {
    title: "The page grew, the agent bill did not | turva.dev",
    description: "The site kept growing after June's token-cost post. The 4 July startuphub.ai scan reports an 83% token saving between the HTML and markdown forms.",
    date: "2026-07-04",
    image: "/og-cheaper-pages-revisited.jpg",
    imageAlt: "The page grew, the agent bill did not"
  },

  "/blog/moving-source-to-codeberg": {
    title: "Moving the source from GitHub to Codeberg | turva.dev",
    description: "GitHub's spam filter silently hid this site's source from everyone but its owner for two weeks. The log of the 404s, the fix, and the move to Codeberg.",
    date: "2026-07-04",
    image: "/og-moving-source-to-codeberg.jpg",
    imageAlt: "Moving the source from GitHub to Codeberg"
  },
  "/blog/free-llms-txt-validator": {
    title: "A free llms.txt validator | turva.dev",
    description: "turva.dev now has a free llms.txt validator: structure checks against the format, JSON output for agents, nothing stored.",
    date: "2026-07-02",
    image: "/og-free-llms-txt-validator.jpg",
    imageAlt: "A free llms.txt validator"
  },
  "/llms-txt-validator": {
    title: "Free llms.txt validator with JSON output | turva.dev",
    description: "Free llms.txt validator. Fetches a site's /llms.txt and checks the structure: H1 title, blockquote summary, H2 link sections. JSON output for agents.",
    image: "/og-llms-txt-validator.jpg",
    imageAlt: "llms.txt validator"
  },
  "/badge": {
    title: "The agent-ready badge: criteria and embed code | turva.dev",
    description: "An embeddable SVG badge for sites that meet public agent-readiness criteria: a turva.dev audit or 100/100 on a public scanner. Criteria and embed code.",
    image: "/og-badge.jpg",
    imageAlt: "The agent-ready badge"
  },
  "/blog": {
    title: "Blog: notes on AI agents and agent-readiness | turva.dev",
    description: "Notes on AI agents and the work of letting them read a site and act on a system safely. Dated entries, checked against independent scanners.",
    image: "/og-blog.jpg",
    imageAlt: "turva.dev blog"
  },
  "/blog/cheaper-pages-for-agents": {
    title: "What an agent pays to read your site | turva.dev",
    description: "An agent pays to read your site in tokens, and an HTML-only page is expensive. How markdown content negotiation cuts that cost.",
    date: "2026-06-26",
    image: "/og-cheaper-pages-for-agents.jpg",
    imageAlt: "What an agent pays to read your site"
  },
  "/blog/verifiable-agent-identity": {
    title: "When an agent can prove it is Claude | turva.dev",
    description: "Web Bot Auth gives an AI agent a verifiable, signed identity a site can check. What the tag is, where Claude stands today, and how agent-readiness uses it.",
    date: "2026-06-25",
    image: "/og-verifiable-agent-identity.jpg",
    imageAlt: "When an agent can prove it is Claude"
  },
  "/blog/reliable-agent-decisions": {
    title: "What makes an AI agent's decisions reliable | turva.dev",
    description: "What makes an AI agent act correctly: data that arrives intact, and an envelope of settings that defines what it may do.",
    date: "2026-06-22",
    image: "/og-reliable-agent-decisions.jpg",
    imageAlt: "What makes an AI agent's decisions reliable"
  },
  "/blog/moving-off-prerender": {
    title: "Moving turva.dev off prerender.io | turva.dev",
    description: "The turva.dev homepage now renders finished HTML in a Cloudflare Worker at the edge, with no prerender.io hop. Verified 100/100 by independent scanners.",
    date: "2026-06-20",
    image: "/og-moving-off-prerender.jpg",
    imageAlt: "Moving turva.dev off prerender.io"
  },
  "/blog/honest-agent-commerce-checks": {
    title: "Passing the agent commerce checks without faking them | turva.dev",
    description: "How turva.dev cleared the isitagentready commerce checks in June 2026, without faking a capability, while holding 100/100 on startuphub.ai.",
    date: "2026-06-21",
    image: "/og-honest-agent-commerce-checks.jpg",
    imageAlt: "Passing the agent commerce checks without faking them"
  },
  "/guides/agent-commerce-discovery": {
    title: "Agent commerce discovery: A2A, AP2, and ACP | turva.dev",
    description: "A2A Agent Card, AP2 and ACP explained: what each agent commerce discovery surface is, where it lives, and backing a claim with a real endpoint.",
    image: "/og-guide-agent-commerce-discovery.jpg",
    imageAlt: "Agent commerce discovery: A2A, AP2, and ACP"
  },
  "/blog/owning-your-fediverse-identity": {
    title: "Owning your fediverse identity | turva.dev",
    description: "Why turva.dev put its fediverse handle on its own domain: a single-user instance, a domain split, and rel=me verification from the Worker.",
    date: "2026-06-21",
    image: "/og-owning-your-fediverse-identity.jpg",
    imageAlt: "Owning your fediverse identity"
  },
  "/guides/agentic-resource-discovery": {
    title: "Agentic Resource Discovery and ai-catalog.json | turva.dev",
    description: "Agentic Resource Discovery explained: what an ai-catalog.json is, how it differs from llms.txt, and where it sits before MCP, A2A and API invocation.",
    image: "/og-guide-agentic-resource-discovery.jpg",
    imageAlt: "Agentic Resource Discovery and ai-catalog.json"
  },
  "/guides/open-knowledge-format": {
    title: "Open Knowledge Format (OKF) explained | turva.dev",
    description: "What the Open Knowledge Format is: Google Cloud's open markdown spec for giving AI agents context, and where it fits agent-readiness.",
    image: "/og-guide-open-knowledge-format.jpg",
    imageAlt: "Open Knowledge Format (OKF) explained"
  },
  "/blog/agent-access-is-now-a-setting": {
    title: "Agent access is now a setting | turva.dev",
    description: "Cloudflare moves crawler access, citation payment and x402 rails into CDN configuration. What that changes for agent readiness.",
    date: "2026-07-02",
    image: "/og-agent-access-is-now-a-setting.jpg",
    imageAlt: "Agent access is now a setting"
  },
  "/blog/two-scanner-audit-method": {
    title: "What one agent-readiness scanner cannot tell you | turva.dev",
    description: "Why every turva.dev audit checks a site against two independent agent-readiness scanners, and how different category models catch more gaps.",
    date: "2026-07-01",
    image: "/og-two-scanner-audit-method.jpg",
    imageAlt: "What one agent-readiness scanner cannot tell you"
  },
  "/blog/publishing-an-ai-catalog": {
    title: "Publishing an ai-catalog.json for agentic discovery | turva.dev",
    description: "Google and a Linux Foundation group published Agentic Resource Discovery in 2026. turva.dev now serves an ai-catalog.json indexing its agent surfaces.",
    date: "2026-06-29",
    image: "/og-publishing-an-ai-catalog.jpg",
    imageAlt: "Publishing an ai-catalog.json for agentic discovery"
  },
  "/blog/open-knowledge-format": {
    title: "What the Open Knowledge Format is, and what it is not | turva.dev",
    description: "Google Cloud shipped the Open Knowledge Format. What it is, what it is not yet, and how it relates to an agent-readiness audit.",
    date: "2026-06-27",
    image: "/og-open-knowledge-format.jpg",
    imageAlt: "What the Open Knowledge Format is, and what it is not"
  },
  "/": {
    title: "Agent-readiness audits and advisory · turva.dev",
    description: "Agent-readiness audits and advisory for product teams, and the wider work wherever AI agents read data and make decisions. Independent, measured, async-only.",
    imageAlt: "Agent-readiness audits and advisory"
  },
  "/services": {
    title: "Services: audit, advisory and implementation · turva.dev",
    description: "Audit €6,500, advisory €3,000/month, implementation €1,500/day, plus agent operations and MCP server design on request. Async-only.",
    image: "/og-services.jpg",
    imageAlt: "turva.dev services and pricing"
  },
  "/company": {
    title: "Company: Erik Rekola, Tampere, Finland · turva.dev",
    description: "turva.dev is operated by Erik Rekola as a Finnish sole proprietorship. Business ID 3600281-7, based in Tampere. Eleven years of engineering experience.",
    image: "/og-company.jpg",
    imageAlt: "turva.dev company information"
  },
  "/contact": {
    title: "Contact: email, Signal or LinkedIn, async-only · turva.dev",
    description: "Contact turva.dev via email, Signal or LinkedIn. Async-only engagement. Response within one business day. No calls, no calendar links.",
    image: "/og-contact.jpg",
    imageAlt: "Contact turva.dev"
  },
  "/legal": {
    title: "Legal: terms of engagement, privacy and GDPR · turva.dev",
    description: "Terms of engagement, privacy practices and GDPR information for turva.dev. Finnish law applies. No tracking, no analytics, no third-party scripts.",
    image: "/og-legal.jpg",
    imageAlt: "Legal and privacy"
  },
  "/guides": {
    title: "Agent-readiness guides | turva.dev",
    description: "Short, focused guides on the surfaces that make a website or API readable and usable by AI agents. Audits, llms.txt, MCP, structured data, payments and more.",
    image: "/og-guides.jpg",
    imageAlt: "Agent-readiness guides"
  },
  "/guides/agent-readiness-audit": {
    title: "What an agent-readiness audit is | turva.dev",
    description: "An agent-readiness audit measures how well AI agents can discover, read, and act on a website or API, scored against current standards by independent scanners.",
    image: "/og-guide-agent-readiness-audit.jpg",
    imageAlt: "What an agent-readiness audit is"
  },
  "/guides/llms-txt": {
    title: "llms.txt explained | turva.dev",
    description: "llms.txt is a plain text guide that tells AI agents what a site contains and where its key content lives, and how it differs from robots.txt and sitemaps.",
    image: "/og-guide-llms-txt.jpg",
    imageAlt: "llms.txt explained"
  },
  "/guides/mcp-server-card": {
    title: "MCP server cards explained | turva.dev",
    description: "An MCP server card is a JSON file that lets agents discover a site's Model Context Protocol server and the tools it exposes. What it is and why it matters.",
    image: "/og-guide-mcp-server-card.jpg",
    imageAlt: "MCP server cards explained"
  },
  "/guides/agents-json": {
    title: "What agents.json is | turva.dev",
    description: "agents.json declares the actions and endpoints an AI agent can use on a site, turning a readable site into an operable one. What it is and why it matters.",
    image: "/og-guide-agents-json.jpg",
    imageAlt: "What agents.json is"
  },
  "/guides/x402-agent-payments": {
    title: "x402 and agent payments | turva.dev",
    description: "x402 uses HTTP 402 Payment Required so AI agents can discover a price, pay, and continue without a human checkout. How agent payments work and why they matter.",
    image: "/og-guide-x402-agent-payments.jpg",
    imageAlt: "x402 and agent payments"
  },
  "/guides/response-headers-for-agents": {
    title: "Response headers that help agents | turva.dev",
    description: "The right HTTP response headers let AI agents work without parsing full HTML. Link, Vary, RateLimit and content type headers explained for agent-readiness.",
    image: "/og-guide-response-headers-for-agents.jpg",
    imageAlt: "Response headers that help agents"
  },
  "/guides/seo-vs-agent-readiness": {
    title: "SEO and agent-readiness are not the same | turva.dev",
    description: "SEO makes a site rank for people to click. Agent-readiness makes a site legible and usable by AI agents. Ranking does not predict presence in AI answers.",
    image: "/og-guide-seo-vs-agent-readiness.jpg",
    imageAlt: "SEO and agent-readiness are not the same"
  },
  "/guides/json-ld-structured-data": {
    title: "JSON-LD and structured data for agents | turva.dev",
    description: "JSON-LD states a page's facts as data an AI agent can read without parsing prose. How prices, organizations and services become legible to agents.",
    image: "/og-guide-json-ld-structured-data.jpg",
    imageAlt: "JSON-LD and structured data for agents"
  },
  "/guides/well-known-for-agents": {
    title: "The /.well-known directory for agents | turva.dev",
    description: "The /.well-known directory is where agents look for a site's machine-readable manifests, from the API catalog (RFC 9727) to server cards and OAuth metadata.",
    image: "/og-guide-well-known-for-agents.jpg",
    imageAlt: "The /.well-known directory for agents"
  },
  "/guides/agent-authentication": {
    title: "How agents authenticate | turva.dev",
    description: "Agent authentication lets an automated client gain scoped access without a human login. OAuth discovery, protected resources and agent registration explained.",
    image: "/og-guide-agent-authentication.jpg",
    imageAlt: "How agents authenticate"
  },
  "/guides/measurement-led-agent-readiness": {
    title: "Why agent-readiness should be measured, not asserted | turva.dev",
    description: "A hand-filled checklist records intentions. An independent scanner records what an agent actually finds. Why measured agent-readiness beats self-assessment.",
    image: "/og-guide-measurement-led-agent-readiness.jpg",
    imageAlt: "Why agent-readiness should be measured, not asserted"
  },
  "/guides/prerendering-for-agents": {
    title: "Prerendering and why agents see empty pages | turva.dev",
    description: "JavaScript-rendered sites return an empty shell to agents, so the content never arrives. Why prerendering and markdown delivery fix the most common agent gap.",
    image: "/og-guide-prerendering-for-agents.jpg",
    imageAlt: "Prerendering and why agents see empty pages"
  },
  "/guides/sitemaps-and-robots-for-agents": {
    title: "Sitemaps, robots.txt and agent access | turva.dev",
    description: "robots.txt and the sitemap decide whether an agent is allowed in and what it can find. AI bot rules, Content Signals and complete sitemaps explained.",
    image: "/og-guide-sitemaps-and-robots-for-agents.jpg",
    imageAlt: "Sitemaps, robots.txt and agent access"
  },
  "/guides/markdown-for-agents": {
    title: "Serving markdown to agents | turva.dev",
    description: "Serving a markdown version of a page gives agents the content without the markup, at a fraction of the tokens. How content negotiation and llms-full.txt work.",
    image: "/og-guide-markdown-for-agents.jpg",
    imageAlt: "Serving markdown to agents"
  },
  "/guides/agent-readiness-aeo-geo": {
    title: "Agent-readiness, AEO and GEO: how they relate | turva.dev",
    description: "How AEO, GEO and agent-readiness relate, what each one fixes, and how to sequence the work so you do not pay for the same fix twice.",
    image: "/og-guide-agent-readiness-aeo-geo.jpg",
    imageAlt: "Agent-readiness, AEO and GEO: how they relate"
  },
  "/guides/agentic-commerce-readiness": {
    title: "Agentic commerce readiness: selling to AI shopping agents | turva.dev",
    description: "What an AI shopping agent needs to discover an offer, drive a checkout protocol and complete a purchase. Explained with A2A, AP2, ACP and x402.",
    image: "/og-guide-agentic-commerce-readiness.jpg",
    imageAlt: "Agentic commerce readiness: selling to AI shopping agents"
  },
  "/guides/letting-agents-act-on-data": {
    title: "Letting agents act on data: the decision envelope | turva.dev",
    description: "Letting an agent act safely depends on data that arrives intact and a decision envelope of permissions and thresholds. How to make that checkable.",
    image: "/og-guide-letting-agents-act-on-data.jpg",
    imageAlt: "Letting agents act on data: the decision envelope"
  },
  "/guides/ai-agent-use-cases": {
    title: "AI agent use cases: where agents read data and make decisions | turva.dev",
    description: "AI agent use cases across commerce, monitoring, field support, remote operations and back-office data work, and what makes each one reliable.",
    image: "/og-guide-ai-agent-use-cases.jpg",
    imageAlt: "AI agent use cases: where agents read data and make decisions"
  },
  "/guides/get-cited-by-ai-assistants": {
    title: "How to get your site cited by AI assistants | turva.dev",
    description: "What it takes to be a source AI assistants cite: readable content, structured data, corroboration, indexing where assistants search, and measurement.",
    image: "/og-guide-get-cited-by-ai-assistants.jpg",
    imageAlt: "How to get your site cited by AI assistants"
  },
  "/guides/choosing-an-agent-readiness-audit": {
    title: "Choosing an agent-readiness audit | turva.dev",
    description: "Who provides agent-readiness audits, what they cost, how long they take, and what you get. Pricing, deliverables, and how the engagement works.",
    image: "/og-guide-choosing-an-agent-readiness-audit.jpg",
    imageAlt: "Choosing an agent-readiness audit"
  },
  "/guides/agent-readiness-gaps": {
    title: "Common agent-readiness gaps on marketing sites | turva.dev",
    description: "Most marketing sites are strong for people and weak for agents. The predictable gaps in rendering, discovery, cost and structured data, and the fixes.",
    image: "/og-guide-agent-readiness-gaps.jpg",
    imageAlt: "Common agent-readiness gaps on marketing sites"
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
      articleMeta += `\n<meta property="article:published_time" content="${m.date}" />\n<meta property="article:modified_time" content="${m.date}" />`;
    }
  }
  const st = escapeHtml(m.title);
  const sd = escapeHtml(m.description);
  const sa = escapeHtml(m.imageAlt);
  return `<title>${st}</title>
<meta name="description" content="${sd}" />
<meta property="og:type" content="${ogType}" />
<meta property="og:site_name" content="turva.dev" />
<meta property="og:title" content="${st}" />
<meta property="og:description" content="${sd}" />
<meta property="og:url" content="${url}" />
<meta property="og:locale" content="en_US" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${sa}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${st}" />
<meta name="twitter:description" content="${sd}" />
<meta name="twitter:image" content="${ogImage}" />
<meta name="twitter:image:alt" content="${sa}" />${articleMeta}`;
}

var PRICE_VALID_UNTIL = "2026-12-31";

var SCHEMA_HOME = `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"ProfessionalService","@id":"https://turva.dev/#business","name":"turva.dev","url":"https://turva.dev/","image":"https://turva.dev/og.jpg","logo":"https://turva.dev/logo.png","description":"Independent agent-readiness audits and advisory for product teams. Scanners measure the site or API; a written report names the prioritized fixes; the next scan verifies the result. Beyond readiness, the same discipline covers the data agents act on and the decisions they are allowed to make.","priceRange":"€€€","taxID":"3600281-7","vatID":"FI36002817","email":"info@turva.dev","areaServed":{"@type":"Place","name":"Worldwide"},"address":{"@type":"PostalAddress","addressLocality":"Tampere","addressCountry":"FI"},"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"info@turva.dev","availableLanguage":["English"]},"founder":{"@id":"https://turva.dev/#person"},"sameAs":["https://tietopalvelu.ytj.fi/yritys/3600281-7","https://www.linkedin.com/in/erikrekola/","https://codeberg.org/erekola","https://www.wikidata.org/wiki/Q140276251"]},
{"@type":"Person","@id":"https://turva.dev/#person","name":"Erik Rekola","jobTitle":"Agent-readiness consultant","worksFor":{"@id":"https://turva.dev/#business"},"sameAs":["https://www.linkedin.com/in/erikrekola/","https://codeberg.org/erekola","https://www.wikidata.org/wiki/Q140276321","https://social.turva.dev/@erik"]},
{"@type":"WebSite","@id":"https://turva.dev/#website","url":"https://turva.dev/","name":"turva.dev","publisher":{"@id":"https://turva.dev/#business"},"inLanguage":"en"},
{"@type":"Service","@id":"https://turva.dev/#service","name":"Agent-readiness audits and advisory","provider":{"@id":"https://turva.dev/#business"},"serviceType":"Agent-readiness consulting","areaServed":{"@type":"Place","name":"Worldwide"},"availableChannel":{"@type":"ServiceChannel","serviceUrl":"https://turva.dev/services","availableLanguage":["en"]},"offers":{"@type":"AggregateOffer","priceCurrency":"EUR","lowPrice":"1500","highPrice":"6500","offerCount":"3","availability":"https://schema.org/InStock","url":"https://turva.dev/services","priceValidUntil":"${PRICE_VALID_UNTIL}"},"hasOfferCatalog":{"@type":"OfferCatalog","name":"turva.dev services","itemListElement":[
{"@type":"Offer","name":"Audit","description":"Fixed scope, 2-3 weeks. Two independent scanners run against the site or API, plus manual review of /.well-known/ manifests, JSON-LD and head metadata. Written report with prioritized fix list.","url":"https://turva.dev/services","price":"6500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"6500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"€6,500 fixed price, two to three weeks. VAT (25,5%) added per Finnish law."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness audit"}},
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
{"@type":"Question","name":"How do I get in touch?","acceptedAnswer":{"@type":"Answer","text":"In writing: email info@turva.dev or Signal @turva.19. First reply within one business day."}}
]}
]}
<\/script>`;

function appendAgentLinks(headers) {
  headers.append("Link", '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"');
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
  headers.append("Link", '</.well-known/x402-mesh.json>; rel="x402-mesh"; type="application/json"');
  headers.append("Link", '</.well-known/mpp>; rel="mpp"; type="application/json"');
  headers.append("Link", '</.well-known/ucp>; rel="ucp"; type="application/json"');
  headers.append("Link", '</agent/auth/register>; rel="agent-auth-register"; type="application/json"');
  headers.append("Link", '<mailto:info@turva.dev?subject=Quote%20request>; rel="payment"; title="Request a quote"');
  headers.append("Link", '<https://social.turva.dev/@erik>; rel="me"');
}

var FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#5DF18F" stroke-width="2.4"/><path d="M10.5 16.4l3.6 3.6 7.2-7.6" stroke="#5DF18F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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
<title>Page not found | turva.dev</title>
<style>
html,body{background-color:#0A1316;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color-scheme:dark;}
main{max-width:46rem;margin:0 auto;padding:3rem 1.25rem 4rem;}
h1{color:#5DF18F;font-size:2rem;line-height:1.2;margin:0 0 1rem;}
p{margin:0 0 1.1rem;}
a{color:#5DF18F;}
.turva-nav{box-sizing:border-box;width:100%;background:#0A1316;display:flex;align-items:center;gap:24px;flex-wrap:wrap;padding:16px clamp(20px,5vw,72px);}
.turva-nav *,.turva-nav *::before,.turva-nav *::after{box-sizing:border-box;}
.turva-nav .nv-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.turva-nav .nv-brand svg{display:block;width:26px;height:26px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
.turva-nav .nv-menu{display:flex;align-items:center;gap:clamp(18px,2.4vw,38px);list-style:none;margin:0;padding:0;}
.turva-nav .nv-menu a{font-size:15px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
@media (max-width:560px){.turva-nav .nv-menu{gap:16px;}.turva-nav .nv-menu a{font-size:14px;}}
${FOOTER_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<nav class="turva-nav">
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
${FOOTER_HTML}
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

var HOME_JSON = JSON.stringify({ "name": "turva.dev", "url": "https://turva.dev/", "description": "Independent agent-readiness audits and advisory for product teams. Scanners measure the site or API; a written report names the prioritized fixes; the next scan verifies the result. Beyond readiness, the same discipline covers the data agents act on and the decisions they are allowed to make.", "founder": "Erik Rekola", "location": { "city": "Tampere", "country": "FI" }, "businessId": "3600281-7", "email": "info@turva.dev", "sameAs": ["https://www.wikidata.org/wiki/Q140276251", "https://www.linkedin.com/in/erikrekola/", "https://codeberg.org/erekola", "https://tietopalvelu.ytj.fi/yritys/3600281-7"], "services": [{ "name": "Audit", "price": 6500, "currency": "EUR", "unit": "fixed", "duration": "2-3 weeks", "vatIncluded": false }, { "name": "Advisory", "price": 3000, "currency": "EUR", "unit": "month", "minimumCommitment": "3 months", "vatIncluded": false }, { "name": "Implementation", "price": 1500, "currency": "EUR", "unit": "day", "vatIncluded": false }], "engagement": "Async only. No calls, no calendar links. Reply within one business day. Fixed scope written before payment.", "useCases": ["Reading a product catalog and completing a checkout for a buyer", "Watching an API and acting when a threshold is crossed", "Guiding a field technician from the same data an expert would use", "Triaging incoming requests and resolving the routine ones", "Operating a remote system over an unreliable link", "Reconciling records across systems and flagging mismatches", "Making a time-critical decision locally when no human can respond in time"], "resources": { "guides": "https://turva.dev/guides", "llmsTxt": "https://turva.dev/llms.txt", "llmsFullTxt": "https://turva.dev/llms-full.txt", "openapi": "https://turva.dev/openapi.json", "mcp": "https://mcp.turva.dev/mcp", "apiCatalog": "https://turva.dev/.well-known/api-catalog" }, "lastVerified": "2026-07-02" }, null, 2);
var API_INDEX_JSON = JSON.stringify({ "service": "turva.dev", "version": "v1", "description": "Agent endpoint index for turva.dev. The machine-readable surfaces an AI agent can read and call.", "endpoints": { "openapi": "https://turva.dev/openapi.json", "apiCatalog": "https://turva.dev/.well-known/api-catalog", "mcp": "https://mcp.turva.dev/mcp", "mcpServerCard": "https://turva.dev/.well-known/mcp/server-card.json", "aiPlugin": "https://turva.dev/.well-known/ai-plugin.json", "agentJson": "https://turva.dev/.well-known/agent.json", "llmsTxt": "https://turva.dev/llms.txt", "llmsFullTxt": "https://turva.dev/llms-full.txt", "signatures": "https://turva.dev/.well-known/signatures.json", "jwks": "https://turva.dev/.well-known/jwks.json" }, "homepage": "https://turva.dev/", "contact": "info@turva.dev" }, null, 2);

function wantsMarkdown(request) {
  const accept = (request.headers.get("Accept") || "").toLowerCase();
  if (!accept) return false;
  const parts = accept.split(",").map((p) => p.trim().split(";")[0].trim());
  return parts.includes("text/markdown");
}

function wantsJson(request) {
  const accept = (request.headers.get("Accept") || "").toLowerCase();
  if (!accept) return false;
  const parts = accept.split(",").map((p) => p.trim().split(";")[0].trim());
  return parts.includes("application/json") && !parts.includes("text/html");
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

function renderInline(text) {
  let out = escapeHtml(text);
  out = out.replace(/&lt;mailto:(.+?)&gt;/g, '<a href="mailto:$1">$1</a>');
  out = out.replace(/&lt;(https?:\/\/.+?)&gt;/g, '<a href="$1">$1</a>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, href) => {
    return /^(https?:\/\/|mailto:|\/|#)/i.test(href.trim()) ? `<a href="${escapeHtml(href)}">${label}</a>` : escapeHtml(label);
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[\s(])(info@turva\.dev)/g, '$1<a href="mailto:info@turva.dev">$2</a>');
  out = out.replace(/(^|[\s(])(https?:\/\/[^\s<)"]+)/g, function(m, pre, url) {
    var tm = url.match(/[.,;:!?]+$/);
    var tail = "";
    if (tm) { tail = tm[0]; url = url.slice(0, url.length - tail.length); }
    return pre + '<a href="' + url + '">' + url + '</a>' + tail;
  });
  out = out.replace(/(^|[\s(])((?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+\/[^\s<)"]*)/gi, function(m, pre, url) {
    var tm = url.match(/[.,;:!?]+$/);
    var tail = "";
    if (tm) { tail = tm[0]; url = url.slice(0, url.length - tail.length); }
    return pre + '<a href="https://' + url + '">' + url + '</a>' + tail;
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
    } else if (trimmed.startsWith("## ")) {
      html.push(`<h2>${renderInline(trimmed.slice(3).trim())}</h2>`);
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

// Guide pages are worker-owned content that does not exist on the Sitejet
// origin, so they are rendered to HTML here rather than proxied. Agents that
// send Accept: text/markdown are served PAGE_MARKDOWN earlier; this is the
// human/HTML representation.
function buildGuideJsonLd(pathname, canonicalUrl) {
  const m = META_BY_PATH[pathname] || META_BY_PATH["/"];
  const headline = m.title.replace(/ \| turva\.dev$/, "");
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
    "author": { "@type": "Person", "@id": "https://turva.dev/#person", "name": "Erik Rekola", "url": "https://turva.dev/", "sameAs": ["https://www.wikidata.org/wiki/Q140276321", "https://www.linkedin.com/in/erikrekola/", "https://codeberg.org/erekola"] },
    "publisher": { "@type": "Organization", "@id": "https://turva.dev/#business", "name": "turva.dev", "url": "https://turva.dev/", "sameAs": ["https://www.wikidata.org/wiki/Q140276251"] },
    "isPartOf": { "@type": "WebSite", "name": "turva.dev", "url": "https://turva.dev/" },
    "about": "agent-readiness"
  };
  if (isBlogPost && m.date) {
    article.datePublished = m.date;
    article.dateModified = m.date;
  }
  if (isGuide || isBlogPost) {
    article.mainEntityOfPage = { "@type": "WebPage", "@id": url };
  }
  if (isBlogHub) {
    const posts = Object.keys(PAGE_MARKDOWN).filter((k) => k.startsWith("/blog/")).map((k) => {
      const pm = META_BY_PATH[k] || {};
      const item = { "@type": "BlogPosting", "headline": (pm.title || "").split(" | turva.dev")[0], "url": "https://turva.dev" + k };
      if (pm.date) { item.datePublished = pm.date; item.dateModified = pm.date; }
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

var BUYER_FAQ = [
  { q: "Who provides agent-readiness audits?", a: "turva.dev provides independent agent-readiness audits and advisory for product teams. It is a registered business in Tampere, Finland (Business ID 3600281-7), run by Erik Rekola. It measures a site or API against current standards using independent public scanners and returns a written report with prioritized fixes." },
  { q: "What does an agent-readiness audit cost?", a: "turva.dev prices an audit at a fixed €6,500 for a two to three week engagement. Advisory is €3,000 per month with a three month minimum, and implementation is €1,500 per day, scoped per task. Prices exclude VAT." },
  { q: "How long does an agent-readiness audit take?", a: "A fixed-scope audit takes two to three weeks. The scope is written before any payment." },
  { q: "What do you get from an agent-readiness audit?", a: "A written report that lists each check, what the scanner found, and a concrete fix for each gap, ordered by priority, verifiable by an independent scanner before and after." },
  { q: "How do I make my site agent-ready?", a: "Publish the surfaces agents read, such as llms.txt, a markdown form of each page, robots.txt and sitemap, JSON-LD, the /.well-known manifests, and a payment surface if you sell, then measure the result with an independent scanner." },
  { q: "How does the engagement work?", a: "Async only, with no calls or calendar links, replies within one business day, fixed scope written before payment, and an open-source reference implementation you can read first." },
];

function buildBuyerFaqJsonLd() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://turva.dev/guides/choosing-an-agent-readiness-audit#faq",
    "inLanguage": "en",
    "mainEntity": BUYER_FAQ.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  };
  const json = JSON.stringify(faq).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json">\n${json}\n<\/script>`;
}

var GUIDE_PAGE_FAQ = {
  "/guides/agentic-resource-discovery": [
    {
      "q": "What is an ai-catalog.json?",
      "a": "An ai-catalog.json is a static JSON manifest at /.well-known/ai-catalog.json that lists the agentic resources a site offers, such as its MCP server, A2A agent, and API, each with an identifier, type, url, and description, so agents and registries can discover them from one file."
    },
    {
      "q": "Does Agentic Resource Discovery affect search ranking?",
      "a": "No. ARD is a discovery layer for AI agents, not a search file. It indexes the resources an agent can call through their own protocols. Google confirmed in 2026 that llms.txt does not affect its search results, and the same applies to an ai-catalog."
    }
  ],
  "/guides/agent-commerce-discovery": [
    {
      "q": "What is an A2A Agent Card?",
      "a": "An A2A Agent Card is a JSON file, usually at /.well-known/agent-card.json, that describes an agent interface, including its name, version, transport, and the skills it offers, so another agent can discover it and know how to reach it."
    },
    {
      "q": "What is the correct AP2 extension URI?",
      "a": "AP2 support is declared as an extension inside the A2A Agent Card, using the URI https://github.com/google-agentic-commerce/ap2/tree/v0.1 (lowercase, version v0.1). Some fix texts show a V0.1.0 form with a capital V and an extra .0, which validators reject."
    }
  ],
  "/guides/agent-readiness-audit": [
    {
      "q": "What is an agent-readiness audit?",
      "a": "An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API. It is a technical review of the surfaces automated clients use, scored against current standards rather than opinion."
    },
    {
      "q": "What does an agent-readiness audit check?",
      "a": "It checks the surfaces an agent reaches first, covering discovery, content, capabilities, commerce, access control, and quality. Each check passes or fails, and each failure comes with a concrete fix an independent scanner can verify before and after."
    }
  ],
  "/guides/llms-txt": [
    {
      "q": "What is llms.txt?",
      "a": "llms.txt is a plain text file at the root of a site that tells AI agents and language models what the site contains and where the important content lives. It does not replace robots.txt or a sitemap, it complements them."
    },
    {
      "q": "Does llms.txt help with search ranking?",
      "a": "No. llms.txt is not a ranking trick. It gives models a curated map of the content so they read the real page rather than guessing from a cached snippet."
    }
  ],
  "/guides/mcp-server-card": [
    {
      "q": "What is an MCP server card?",
      "a": "An MCP server card is a small JSON file, usually at /.well-known/mcp/server-card.json, that describes a site's Model Context Protocol server so an agent can find it, learn which tools it exposes, and call them without a human wiring up the connection."
    },
    {
      "q": "Why publish an MCP server card?",
      "a": "Without a card an agent has no reliable way to discover that the server exists or what it can do, so the capability stays hidden even when it is live. The card turns an invisible server into a discoverable one."
    }
  ],
  "/guides/agents-json": [
    {
      "q": "What is agents.json?",
      "a": "agents.json is a machine-readable file that declares what an AI agent can do on a site and how. It describes the actions and endpoints an agent is allowed to use, often pointing at an OpenAPI description, along with the authentication an agent needs."
    },
    {
      "q": "How is agents.json different from llms.txt?",
      "a": "llms.txt tells an agent what the site contains. agents.json describes the actions an agent can take, so a site moves from something an agent can read to something an agent can operate."
    }
  ],
  "/guides/x402-agent-payments": [
    {
      "q": "What is x402?",
      "a": "x402 is a way for a site to ask an agent to pay before it returns a resource, using the HTTP 402 Payment Required status. It lets an automated client discover a price, pay, and continue without a human entering card details."
    },
    {
      "q": "Why does agent commerce need a payment surface like x402?",
      "a": "Agent commerce is held back by payment, not by capability. An agent can find a product and compare options, then stall at a checkout flow built for a person. A declared payment surface lets the agent complete the purchase the same way it completed the search."
    }
  ],
  "/guides/response-headers-for-agents": [
    {
      "q": "Which response headers help AI agents?",
      "a": "A Link header points an agent at machine-readable resources such as an API catalog or a markdown version of the page. A Vary header that includes Accept makes markdown content negotiation reliable. RateLimit headers let a well-behaved agent throttle itself, and Content-Language with a clean content type removes ambiguity."
    },
    {
      "q": "Why do response headers matter to agents?",
      "a": "An agent reads the status and headers before the body and decides what to do from them. If the headers already say where the structured data is and what formats are available, the agent can skip parsing a page built for human display."
    }
  ],
  "/guides/seo-vs-agent-readiness": [
    {
      "q": "Is agent-readiness the same as SEO?",
      "a": "No. SEO makes a site rank in a list of links for a person to click. Agent-readiness makes a site legible and usable by an AI agent that reads, decides, and sometimes acts. A site can rank well and still be opaque to agents."
    },
    {
      "q": "Why does search ranking not predict presence in AI answers?",
      "a": "They are scored on different things. A search engine ranks pages by keywords and backlinks. An assistant cites a site when it can read the content cleanly and corroborate it, which depends on the discovery and content surface rather than ranking signals."
    }
  ],
  "/guides/json-ld-structured-data": [
    {
      "q": "What is JSON-LD?",
      "a": "JSON-LD is a block of structured data in a page that states facts in a form a machine can read without interpreting prose. It tells an agent what the page is about, who runs it, what it sells, and at what price, as data rather than sentences."
    },
    {
      "q": "Why does structured data matter for agents?",
      "a": "An agent reading raw HTML has to guess which number is a price and which is a shipping estimate. A JSON-LD Offer with a price and a currency removes the guess, and declared types let an agent place a page in context and decide whether to trust and cite it."
    }
  ],
  "/guides/well-known-for-agents": [
    {
      "q": "What is the /.well-known directory?",
      "a": "The /.well-known directory is a standard place at the root of a site where agents look for machine-readable descriptions of what the site offers. An agent fetches a predictable path and reads a manifest that points it to everything else."
    },
    {
      "q": "What files do agents look for under /.well-known?",
      "a": "An API catalog defined by RFC 9727, an MCP server card, OAuth metadata, payment and agent-payment manifests, and a security contact. Each one turns discovery into a lookup rather than a search."
    }
  ],
  "/guides/agent-authentication": [
    {
      "q": "How do AI agents authenticate?",
      "a": "An agent proves who it is through discoverable standards such as OAuth discovery at a well-known path, which tells it where to request access and what scopes exist. It can then request a token tied to a specific permission rather than a blanket login."
    },
    {
      "q": "Why does scoped, discoverable auth matter?",
      "a": "A site that exposes capability without scoped auth either stays closed to agents or invites unsafe workarounds. Proper discovery lets an agent request the least access it needs without handling a password it should never see."
    }
  ],
  "/guides/measurement-led-agent-readiness": [
    {
      "q": "Why should agent-readiness be measured rather than asserted?",
      "a": "A checklist filled in by hand records intentions. An independent scanner records what an agent actually finds when it reads the site, and the two often disagree, especially after a deploy drops a header or changes a content type."
    },
    {
      "q": "What makes a measured result more credible to a buyer?",
      "a": "A claim that a site is agent-ready is an assertion. A score from an independent scanner, with a category breakdown and a date, is evidence anyone can re-run. The honest version of the claim is the number."
    }
  ],
  "/guides/prerendering-for-agents": [
    {
      "q": "Why do AI agents see empty pages?",
      "a": "Many sites render content with JavaScript in the browser, so the first response is an almost empty shell. A person waits and the page fills in, but an agent reads the raw response, sees a loading state, and judges the site on that."
    },
    {
      "q": "How do you fix empty pages for agents?",
      "a": "Serve the real content in the first response for clients that need it, through prerendering at the server or edge, or serve a markdown version of the page on request, which skips rendering and costs a fraction of the tokens."
    }
  ],
  "/guides/sitemaps-and-robots-for-agents": [
    {
      "q": "How do robots.txt and the sitemap affect AI agents?",
      "a": "An agent reads robots.txt to learn the rules and the sitemap to learn the map before it reads any page. robots.txt can name AI crawlers explicitly, and the sitemap lists every canonical URL so an agent finds the real pages without inferring them from navigation."
    },
    {
      "q": "What is a Content-Signal directive in robots.txt?",
      "a": "A Content-Signal directive declares how content may be used, separating ordinary search from AI input and training. It gives a site granular control instead of an all-or-nothing block."
    }
  ],
  "/guides/markdown-for-agents": [
    {
      "q": "Why serve markdown to AI agents?",
      "a": "An HTML page is built for a browser, and an agent that reads it pays for all the markup, scripts, and layout it does not need. A markdown version gives the content without the wrapper, which is cheaper and less error-prone."
    },
    {
      "q": "How does an agent request the markdown version?",
      "a": "Through content negotiation. An agent sends an Accept header asking for text/markdown and the server returns the markdown form at the same URL. A site can also publish llms-full.txt to bundle the whole site as text in one request."
    }
  ],
  "/guides/agent-readiness-gaps": [
    {
      "q": "What are the most common agent-readiness gaps on marketing sites?",
      "a": "Client-side rendering that returns an empty shell, no llms.txt and a thin or missing sitemap, and HTML-only delivery with no markdown form. Capability is usually undeclared and structured data is often missing, so prices and facts are left for the agent to infer."
    },
    {
      "q": "Are agent-readiness gaps hard to fix?",
      "a": "No. The work is mostly at the edge and in a few small files, and the result shows up immediately in a scanner. A site does not have to rebuild to become legible to agents, it has to publish what agents already look for."
    }
  ],
  "/guides/get-cited-by-ai-assistants": [
    {
      "q": "How do you get a site cited by AI assistants?",
      "a": "A site is cited when the assistant can reach its content, read it cheaply, confirm the facts, and find corroboration elsewhere. That means readable content in the first response, facts stated as data, independent corroboration, and being indexed where the assistant searches."
    },
    {
      "q": "Why does corroboration matter for citation?",
      "a": "An assistant is more likely to cite a claim it can confirm in more than one place. Open-source code, a public company record, trusted directory listings, and genuine third-party mentions raise confidence. The signal is consistency across sources, not volume."
    }
  ]
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

var FOOTER_CSS = `main table{border-collapse:collapse;margin:1.1rem 0;width:100%;font-size:.93rem}main th,main td{border:0.5px solid rgba(255,255,255,0.14);padding:.5rem .65rem;text-align:left;vertical-align:top;color:#C9D1CE}main th{color:#5DF18F;font-weight:600}pre{background:#07110D;border:1px solid #1E3328;border-radius:8px;padding:14px 16px;overflow-x:auto;font-size:13px;line-height:1.5;color:#CFE3D6;font-family:ui-monospace,"Cascadia Mono",Menlo,Consolas,monospace}pre code{font-family:inherit}.aview-cmd{font-family:ui-monospace,"Cascadia Mono",Menlo,Consolas,monospace;font-size:13px;color:#5DF18F;margin:0 0 10px;overflow-x:auto;white-space:nowrap}.vform{display:flex;gap:10px;margin:6px 0}.vform input{flex:1;min-width:0;background:#07110D;border:1px solid #1E3328;border-radius:8px;padding:10px 12px;color:#F2F5F3;font-family:ui-monospace,"Cascadia Mono",Menlo,Consolas,monospace;font-size:14px}.vform button{background:#5DF18F;color:#06100F;border:0;border-radius:8px;padding:10px 18px;font-weight:700;cursor:pointer;font-size:14px}.chk{display:flex;gap:10px;margin:8px 0;align-items:baseline;flex-wrap:wrap}.chk .s{font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:700}.chk.pass .s{color:#5DF18F}.chk.warn .s{color:#E8C15A}.chk.fail .s{color:#F17F5D}.chk .d{color:#96A79C;font-size:14px}.verr{color:#F17F5D}
.tv-foot{box-sizing:border-box;width:100%;background:#06100F;border-top:1px solid rgba(255,255,255,0.1);padding:1.9rem clamp(20px,5vw,72px);display:flex;flex-direction:column;gap:1rem;}
.tv-foot .foot-brand{display:flex;align-items:center;gap:9px;}
.tv-foot .foot-brand svg{display:block;width:22px;height:22px;}
.tv-foot .foot-links{display:flex;flex-wrap:wrap;gap:0.6rem 1rem;}
.tv-foot .ft-row{display:flex;align-items:center;gap:9px;color:#C9D1CE;font-size:0.9rem;text-decoration:none;}
.tv-foot a.ft-row:hover{color:#5DF18F;}
.tv-foot .ft-row svg{flex:0 0 auto;width:17px;height:17px;}
.tv-foot .foot-meta{font-size:0.8rem;color:#6F7A77;border-top:0.5px solid rgba(255,255,255,0.08);padding-top:0.9rem;}
.turva-nav,.tv-foot{padding-left:max(clamp(20px,5vw,72px),calc(50% - var(--col-half,23rem)));padding-right:max(clamp(20px,5vw,72px),calc(50% - var(--col-half,23rem)));}
a:focus-visible,button:focus-visible{outline:2px solid #5DF18F;outline-offset:2px;border-radius:2px;}
@media (prefers-reduced-motion:reduce){.cursor{animation:none;opacity:1;}}
::selection{background:#5DF18F;color:#06100F;}
h1,h2{text-wrap:balance;}
p,li{text-wrap:pretty;}
.skip{position:absolute;left:-999px;top:-999px;overflow:hidden;}
.skip:focus{position:fixed;left:14px;top:12px;z-index:20;background:#5DF18F;color:#06100F;font-weight:700;padding:.55rem .95rem;border-radius:8px;text-decoration:none;}
@media print{*{background:#fff!important;color:#000!important;}a{text-decoration:underline;}.turva-nav,.tv-foot,.skip,.crumb,.cursor{display:none!important;}}`;

var FOOTER_HTML = `<footer class="tv-foot">
  <div class="foot-brand">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="16" cy="16" r="13" stroke="#5DF18F" stroke-width="2.4"></circle><path d="M10.5 16.4l3.6 3.6 7.2-7.6" stroke="#5DF18F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    <span class="nv-word">turva<b>·</b>dev</span>
  </div>
  <div class="foot-links">
    <a class="ft-row" href="mailto:info@turva.dev"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg><span>info@turva.dev</span></a>
    <div class="ft-row"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/></svg><span>Signal @turva.19</span></div>
    <a class="ft-row" href="https://www.linkedin.com/in/erikrekola/"><svg viewBox="0 0 24 24" fill="#5DF18F" aria-hidden="true"><path d="M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.4 8.9h3.1V21H3.4zM9.2 8.9h2.97v1.65h.04c.41-.78 1.42-1.6 2.93-1.6 3.13 0 3.71 2.06 3.71 4.74V21h-3.1v-5.35c0-1.28-.02-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.83V21H9.2z"/></svg><span>LinkedIn</span></a>
    <a class="ft-row" rel="me" href="https://social.turva.dev/@erik"><svg viewBox="0 0 24 24" fill="#5DF18F" aria-hidden="true"><path d="M21.327 8.566c0-4.339-2.843-5.61-2.843-5.61-1.433-.658-3.894-.935-6.451-.956h-.063c-2.557.021-5.016.298-6.45.956 0 0-2.843 1.272-2.843 5.61 0 .993-.019 2.181.012 3.441.103 4.243.778 8.425 4.701 9.463 1.809.479 3.362.579 4.612.51 2.268-.126 3.541-.809 3.541-.809l-.075-1.646s-1.621.511-3.441.449c-1.804-.062-3.707-.194-3.999-2.409a4.523 4.523 0 0 1-.04-.621s1.77.433 4.014.536c1.372.063 2.658-.08 3.965-.236 2.506-.299 4.688-1.843 4.962-3.254.434-2.223.398-5.424.398-5.424zm-3.353 5.59h-2.081V9.057c0-1.075-.452-1.62-1.357-1.62-1 0-1.501.647-1.501 1.927v2.791h-2.069V9.364c0-1.28-.501-1.927-1.502-1.927-.905 0-1.357.546-1.357 1.62v5.099H5.626V8.903c0-1.074.273-1.927.823-2.558.566-.631 1.307-.955 2.228-.955 1.065 0 1.872.41 2.405 1.228l.518.869.519-.869c.533-.818 1.34-1.228 2.405-1.228.92 0 1.662.324 2.228.955.549.631.822 1.484.822 2.558v5.253z"/></svg><span>Mastodon</span></a>
    <a class="ft-row" href="https://www.startuphub.ai/startups/turva-dev"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"/></svg><span>StartupHub</span></a>
    <a class="ft-row" href="https://codeberg.org/erekola"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg><span>Codeberg</span></a>
  </div>
  <div class="foot-meta">Tampere, Finland · Business ID 3600281-7 · © 2026 turva.dev · All rights reserved</div>
</footer>`;

function serveGuideHtml(pathname, canonicalUrl) {
  const md = PAGE_MARKDOWN[pathname];
  const metaBlock = buildMetaBlock(pathname, canonicalUrl);
  const jsonLd = buildGuideJsonLd(pathname, canonicalUrl) +
    (pathname === "/guides/choosing-an-agent-readiness-audit" ? "\n" + buildBuyerFaqJsonLd() : "") +
    (GUIDE_PAGE_FAQ[pathname] ? "\n" + buildGuidePageFaqJsonLd(pathname, canonicalUrl) : "");
  const article = markdownToHtml(md);
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
<link rel="alternate" href="${canonicalUrl}" type="text/markdown" />
<style>
html,body{background-color:#0A1316;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased;color-scheme:dark;}
body{--col-half:22rem;}
main{max-width:44rem;margin:0 auto;padding:2.4rem clamp(20px,5vw,72px) 3rem;}
article h1{color:#5DF18F;font-size:2.2rem;line-height:1.12;letter-spacing:-0.02em;margin:0 0 1rem;font-weight:700;}
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
.turva-nav .nv-menu{display:flex;align-items:center;gap:clamp(14px,2vw,30px);list-style:none;margin:0;padding:0;flex:1;}
.turva-nav .nv-menu a{font-size:15px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
.turva-nav .nv-menu a[aria-current]{color:#F2F4F3;}
@media (max-width:640px){.turva-nav .nv-menu{gap:14px;}.turva-nav .nv-menu a{font-size:14px;}}
${FOOTER_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<nav class="turva-nav">
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
${FOOTER_HTML}
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

var HOME_MARKDOWN = (function () {
  const cut = PAGE_MARKDOWN["/"].indexOf("\n## More");
  return cut === -1 ? PAGE_MARKDOWN["/"] : PAGE_MARKDOWN["/"].slice(0, cut);
})();

function serveHomeHtml(canonicalUrl) {
  const metaBlock = buildMetaBlock("/", canonicalUrl);
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
<link rel="alternate" href="${canonicalUrl}" type="text/markdown" />
<style>
html,body{background-color:#0A1316;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased;color-scheme:dark;}
main{max-width:46rem;margin:0 auto;padding:0 clamp(20px,5vw,72px) 3rem;}
h1{color:#5DF18F;font-size:2.4rem;line-height:1.1;letter-spacing:-0.02em;margin:0 0 1.1rem;font-weight:700;}
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
.turva-nav .nv-menu{display:flex;align-items:center;gap:clamp(14px,2vw,30px);list-style:none;margin:0;padding:0;flex:1;}
.turva-nav .nv-menu a{font-size:15px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
.turva-nav .nv-menu a[aria-current]{color:#F2F4F3;}
.hero{padding:2.8rem 0 2rem;}
.eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.75rem;letter-spacing:.09em;text-transform:uppercase;color:#5DF18F;margin:0 0 1.1rem;}
.lede{font-size:1.16rem;line-height:1.55;color:#C9D1CE;margin:0;max-width:40rem;}
.hero-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(258px,1fr);gap:1.6rem;align-items:center;margin:1.7rem 0 0;}
.badges{display:flex;flex-wrap:wrap;gap:.55rem;list-style:none;margin:0 0 1.3rem;padding:0;}
.badges li{display:flex;align-items:center;gap:.4rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.8rem;color:#C9D1CE;background:rgba(93,241,143,0.06);border:1px solid rgba(93,241,143,0.22);border-radius:999px;padding:.32rem .8rem;}
.badges li b{color:#5DF18F;}
.cta{display:flex;flex-wrap:wrap;gap:.7rem;margin:0;}
.btn{display:inline-block;background:#5DF18F;color:#06100F;font-weight:700;border-radius:8px;padding:.65rem 1.15rem;font-size:.92rem;transition:background-color .15s ease;}
.btn:hover{background:#7df7a6;text-decoration:none;}
.btn-ghost{display:inline-block;color:#F2F4F3;font-weight:600;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:.65rem 1.15rem;font-size:.92rem;transition:border-color .15s ease,color .15s ease;}
.btn-ghost:hover{border-color:#5DF18F;color:#5DF18F;text-decoration:none;}
.terminal{border:1px solid rgba(255,255,255,0.14);border-radius:12px;overflow:hidden;background:#06100F;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.84rem;}
.tm-bar{display:flex;align-items:center;gap:.5rem;padding:.55rem .8rem;background:rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.08);}
.tm-dot{width:10px;height:10px;border-radius:50%;display:inline-block;}
.tm-dot.r{background:#ff5f56;}.tm-dot.y{background:#ffbd2e;}.tm-dot.g{background:#27c93f;}
.tm-title{margin-left:.45rem;color:#9AA3A0;font-size:.76rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tm-body{padding:.9rem .85rem 1.05rem;line-height:1.75;}
.tm-cmd{color:#F2F4F3;word-break:break-word;}
.tm-cmd .pr{color:#5DF18F;margin-right:.5rem;}
.tm-out{color:#9AA3A0;}
.tm-out b{color:#5DF18F;font-weight:600;}
.cursor{display:inline-block;width:.5rem;height:1rem;vertical-align:-0.16rem;background:#5DF18F;margin-left:.2rem;animation:tvb 1.1s steps(1) infinite;}
@keyframes tvb{50%{opacity:0;}}
.board{margin:0 0 1rem;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.02);padding:1.15rem 1.15rem 1.25rem;}
.board-top{display:flex;flex-wrap:wrap;gap:.4rem;align-items:baseline;justify-content:space-between;margin:0 0 .9rem;}
.board-head{font-size:.92rem;color:#F2F4F3;font-weight:600;}
.board-src{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.74rem;color:#9AA3A0;text-decoration:none;}
.board-src:hover{color:#5DF18F;}
.board-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem;margin:0 0 1rem;}
.cell{background:rgba(93,241,143,0.06);border:1px solid rgba(93,241,143,0.18);border-radius:9px;padding:.6rem .65rem;transition:border-color .15s ease,transform .15s ease;}
.cell:hover{border-color:rgba(93,241,143,0.45);transform:translateY(-1px);}
.cell .cat{display:block;font-size:.7rem;letter-spacing:.04em;text-transform:uppercase;color:#9AA3A0;margin:0 0 .25rem;}
.cell .val{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.02rem;color:#5DF18F;font-weight:700;}
.board-sum{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.82rem;color:#C9D1CE;border-top:1px solid rgba(255,255,255,0.1);padding-top:.85rem;}
.board-sum b{color:#5DF18F;}
.pill{background:#5DF18F;color:#06100F;font-weight:700;border-radius:6px;padding:.1rem .5rem;}
.sec{padding:1.9rem 0;border-top:0.5px solid rgba(255,255,255,0.07);}
.exgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:.6rem;margin:0 0 1.1rem;}
.ex{position:relative;background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:.7rem .8rem .7rem 1.7rem;font-size:.9rem;color:#C9D1CE;transition:border-color .15s ease,transform .15s ease;}
.ex:hover{border-color:rgba(93,241,143,0.38);transform:translateY(-1px);}
.ex::before{content:"›";position:absolute;left:.75rem;top:.62rem;color:#5DF18F;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:.6rem;margin:.3rem 0 1.2rem;}
.stat{background:rgba(93,241,143,0.05);border:1px solid rgba(93,241,143,0.18);border-radius:12px;padding:.95rem 1rem;transition:border-color .15s ease,transform .15s ease;}
.stat:hover{border-color:rgba(93,241,143,0.5);transform:translateY(-1px);}
.stat-v{display:block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.55rem;font-weight:700;color:#5DF18F;line-height:1;margin:0 0 .4rem;}
.stat-l{display:block;font-size:.82rem;color:#9AA3A0;line-height:1.45;}
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
.svc{position:relative;background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.12);border-radius:12px;padding:1.05rem 1.05rem 1.1rem;transition:border-color .15s ease,transform .15s ease;}
.svc:hover{border-color:rgba(93,241,143,0.4);transform:translateY(-1px);}
.svc-tag{position:absolute;top:.95rem;right:1rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.68rem;letter-spacing:.03em;color:#5DF18F;background:rgba(93,241,143,0.08);border:1px solid rgba(93,241,143,0.22);border-radius:999px;padding:.12rem .55rem;}
.svc-t{display:block;font-size:1.05rem;font-weight:700;color:#5DF18F;margin:0 3.5rem .45rem 0;}
.svc p{font-size:.86rem;margin:0;color:#9AA3A0;line-height:1.55;}
.contact{border-top:1px solid rgba(93,241,143,0.2);}
.contact-card{border:1px solid rgba(255,255,255,0.14);border-radius:14px;background:rgba(93,241,143,0.04);padding:1.2rem 1.2rem 1rem;margin:.4rem 0 0;}
.contact-card .ch{display:flex;align-items:center;gap:.6rem;margin:0 0 .6rem;font-size:1rem;color:#F2F4F3;text-decoration:none;}
.contact-card a.ch:hover{color:#5DF18F;text-decoration:none;}
.contact-card .ch:last-child{margin-bottom:0;}
.contact-card .ch svg{flex:0 0 auto;width:18px;height:18px;}
.cta-row{margin:1.25rem 0 0;}
.cta-btn{display:inline-block;background:#5DF18F;color:#06100F;font-weight:700;border-radius:8px;padding:.7rem 1.2rem;font-size:.95rem;transition:background-color .15s ease;}
.cta-btn:hover{background:#7df7a6;text-decoration:none;}
@media (max-width:640px){.board-grid{grid-template-columns:repeat(2,1fr);}.hero-row{grid-template-columns:1fr;}.turva-nav .nv-menu{gap:14px;}.turva-nav .nv-menu a{font-size:14px;}}
${FOOTER_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<nav class="turva-nav">
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
    <li><a href="/company">company</a></li>
    <li><a href="/legal">legal</a></li>
    <li><a href="/contact">contact</a></li>
  </ul>
</nav>
<main id="main">
  <section class="hero">
    <p class="eyebrow">where data moves and decisions matter · independently verified</p>
    <h1>Audits and advisory for products that AI agents read and act on</h1>
    <p class="lede">Agent-readiness is the measurable starting point, scored by independent scanners. The wider work is the data those agents depend on and the decisions you let them make. Both are measured before they are promised.</p>
    <div class="hero-row">
      <div class="hero-left">
        <ul class="badges">
          <li><b>#1</b> on the startuphub.ai leaderboard</li>
          <li><b>&#10003;</b> 100/100 verified</li>
          <li>Business ID 3600281-7</li>
        </ul>
        <div class="cta">
          <a class="btn" href="mailto:info@turva.dev?subject=Agent-readiness%20audit">Request an audit</a>
          <a class="btn-ghost" href="https://codeberg.org/erekola/turva-worker">Read the source</a>
        </div>
      </div>
      <div class="hero-right">
        <div class="terminal" aria-label="verification terminal">
          <div class="tm-bar"><span class="tm-dot r"></span><span class="tm-dot y"></span><span class="tm-dot g"></span><span class="tm-title">turva@audit · verify</span></div>
          <div class="tm-body">
            <div class="tm-cmd"><span class="pr">&#8250;</span>turva verify --source startuphub.ai</div>
            <div class="tm-out">&#10003; startuphub.ai &middot; <b>100/100</b> &middot; A+ &middot; #1 ranked</div>
            <div class="tm-out">&#10003; isitagentready.com &middot; <b>level 5</b> &middot; agent-native<span class="cursor"></span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="board" aria-label="agent-readiness scan result">
    <div class="board-top">
      <span class="board-head">independent agent-readiness scan of turva.dev</span>
      <a class="board-src" href="https://www.startuphub.ai/agent-readiness">scanner: startuphub.ai &middot; 3rd-party &#8599;</a>
    </div>
    <div class="board-grid">
      <div class="cell"><span class="cat">discoverability</span><span class="val">100/100</span></div>
      <div class="cell"><span class="cat">content</span><span class="val">100/100</span></div>
      <div class="cell"><span class="cat">access-control</span><span class="val">100/100</span></div>
      <div class="cell"><span class="cat">capabilities</span><span class="val">100/100</span></div>
      <div class="cell"><span class="cat">commerce</span><span class="val">100/100</span></div>
      <div class="cell"><span class="cat">quality</span><span class="val">100/100</span></div>
    </div>
    <div class="board-sum"><span>verified</span> <b>100/100</b> <span class="pill">#1 ranked</span> <span class="pill">A+</span></div>
  </section>
  <section class="sec">
    <h2>What an agent sees on this page</h2>
    <p>Every page on this site is also served as plain markdown to any agent that asks for it, at the same URL, at a fraction of the token cost of the HTML. The block below is generated from the same markdown an agent receives.</p>
    <div class="aview">
      <p class="aview-cmd">curl -H "Accept: text/markdown" https://turva.dev/</p>
      <pre><code>${escapeHtml(HOME_MARKDOWN.split("\n").slice(0, 14).join("\n"))}</code></pre>
    </div>
    <p><a href="/guides/markdown-for-agents">How markdown content negotiation works.</a></p>
  </section>

  <section class="sec">
    <h2>Audits, advisory, and implementation for product teams</h2>
    <p>An AI agent does not browse a site the way a person does. It reads machine-readable surfaces and acts on the parts it can reach, once it trusts what it found. I measure how a site, an API or a product holds up to that, fix what the measurement names, and stay on as the product changes.</p>
    <p>The measurable core is agent-readiness, scored by independent scanners and provable on the next scan. The wider work begins where readability ends. The data an agent acts on has to arrive intact, and the decisions it is allowed to make have to sit inside a boundary you set. The first makes an agent able to read you. The second makes it safe to let one act.</p>
  </section>

  <section class="sec">
    <h2>Where this applies</h2>
    <p>The pattern is narrow, but where it fits is not. Anywhere data moves and a decision follows, an agent can be the thing that reads the data and makes the call, as long as the inputs are clean and the envelope is set. A few examples:</p>
    <div class="exgrid">
      <div class="ex">An agent reading a product catalog and completing a checkout for a buyer.</div>
      <div class="ex">An agent watching an API and acting the moment a threshold is crossed, without waiting for a person.</div>
      <div class="ex">An agent guiding a technician in the field, working from the same data the expert would.</div>
      <div class="ex">An agent triaging incoming requests and resolving the routine ones on its own.</div>
      <div class="ex">An agent operating a remote system over a link that drops, holding its last safe state until the data returns.</div>
      <div class="ex">An agent reconciling records across systems and flagging only what does not match.</div>
      <div class="ex">An agent making a time-critical call locally, where the round trip to a human is too slow to matter.</div>
    </div>
    <p>These are examples, not the list. The list does not really end. The same discipline carries from one case to the next, so the question is rarely whether an agent could do the work. It is whether the data reaching it and the limits set around it are good enough to trust.</p>
  </section>

  <section class="sec">
    <h2>Evidence</h2>
    <p>turva.dev is my own reference build. It is ranked #1 of publicly-scanned sites on the startuphub.ai agent-readiness leaderboard, with 100/100 verified by two independent scanners. Measured 2026-07-02.</p>
    <div class="stats">
      <div class="stat"><span class="stat-v">#1</span><span class="stat-l">of publicly-scanned sites on startuphub.ai</span></div>
      <div class="stat"><span class="stat-v">100/100</span><span class="stat-l">verified by two independent scanners</span></div>
      <div class="stat"><span class="stat-v">Level 5</span><span class="stat-l">agent-native, isitagentready.com</span></div>
    </div>
    <ul class="evlist">
      <li>startuphub.ai leaderboard: #1 of publicly-scanned sites, 100/100 (A+). Discoverability, Content, Access Control, Capabilities, Commerce, Quality: 100/100 each. <a href="https://www.startuphub.ai/agent-readiness">startuphub.ai/agent-readiness</a></li>
      <li>isitagentready.com: 100/100, Level 5 (Agent-Native). <a href="https://isitagentready.com/turva.dev">isitagentready.com/turva.dev</a></li>
    </ul>
    <p>turva.dev publishes its own web security scans too, on the same principle that the result should be measurable rather than asserted. Measured 2026-07-01.</p>
    <ul class="evlist">
      <li>Hardenize: all 13 categories passed. <a href="https://www.hardenize.com/report/turva.dev">hardenize.com/report/turva.dev</a></li>
      <li>Internet.nl: 98/100. IPv6, DNSSEC and RPKI pass in full. The single deduction is one HTTPS sub-test, the hash function for key exchange. <a href="https://internet.nl/site/turva.dev/">internet.nl/site/turva.dev</a></li>
    </ul>
    <p>The Cloudflare Worker that produces these results is open source: <a href="https://codeberg.org/erekola/turva-worker">codeberg.org/erekola/turva-worker</a>. You can read every line before you hire me.</p>
    <p>Backed by a registered business, publicly verifiable: Business ID 3600281-7, registered in Finland. PRH/YTJ business register: <a href="https://tietopalvelu.ytj.fi/yritys/3600281-7">tietopalvelu.ytj.fi/yritys/3600281-7</a></p>
  </section>

  <section class="sec">
    <h2>The process has three stages and no surprises</h2>
    <div class="steps">
      <div class="step">
        <span class="step-n">01</span>
        <span class="step-t">Measurement</span>
        <p>For agent-readiness, two independent scanners read the current state of the site or API and produce a numeric baseline with a categorized list of what is missing. For the wider work, the data path and the decision envelope are tested the way an agent would hit them, so the starting point is a fact rather than an opinion.</p>
      </div>
      <div class="step">
        <span class="step-n">02</span>
        <span class="step-t">A written report</span>
        <p>Three to ten priority fixes in order of impact, with technical reasoning written so the reader does not need a background in any of this to follow it.</p>
      </div>
      <div class="step">
        <span class="step-n">03</span>
        <span class="step-t">The fixes</span>
        <p>I implement them, or your engineering team does the work with the report as the spec. Both routes are supported and the choice is yours.</p>
      </div>
    </div>
    <ul class="notes">
      <li>All communication runs async. No calls and no calendar links. Live meetings are not part of how this work is done. Short questions go through Signal, longer documents through email and CryptPad. Everything stays in writing, which means the work and the trail are auditable end-to-end.</li>
      <li>Production credentials are not requested. Write access to repositories is not taken by default. Read access is enough for the audit, and write access is scoped per task if implementation is purchased separately.</li>
      <li>The result is checkable, not asserted. For agent-readiness that is the scanner number, higher on the next scan in the categories and by the dates the report named. For the wider work it is the same test, the data path holding under load and the envelope doing exactly what it claims. Either the next measurement confirms it or it does not.</li>
    </ul>
  </section>

  <section class="sec">
    <h2>Services</h2>
    <div class="svcgrid">
      <div class="svc"><span class="svc-tag">2 to 3 weeks</span><span class="svc-t">Audit</span><p>Fixed scope, two to three weeks. Two independent scanners run against the site or API. Written report with a prioritized fix list. You receive a measured baseline and a clear "do this first" plan.</p></div>
      <div class="svc"><span class="svc-tag">monthly</span><span class="svc-t">Advisory</span><p>Monthly retainer, async-only. Ongoing review as the site, API or product evolves. Each scanner cycle reads higher than the last, or the report explains why a tradeoff was kept on purpose.</p></div>
      <div class="svc"><span class="svc-tag">on request</span><span class="svc-t">Implementation</span><p>Worker-level changes, well-known manifests, MCP server work, JSON-LD and Schema fixes. The improvement is verifiable against the audit baseline in the next scan.</p></div>
      <div class="svc"><span class="svc-tag">on request</span><span class="svc-t">Agent operations</span><p>The work beyond readiness: the data an agent acts on, and the decision envelope of permissions and thresholds that bounds what it is allowed to do.</p></div>
      <div class="svc"><span class="svc-tag">on request</span><span class="svc-t">MCP server design</span><p>Read-only discovery tools and streamable HTTP transport. No auth surface and no logging by default. The endpoint stays readable for agents and does not turn into an abuse vector.</p></div>
    </div>
  </section>

  <section class="sec">
    <h2>Who I am</h2>
    <p>The work is done by one person under a registered business. My background is engineering: measurement, testing, and reducing things to what actually matters. I have worked in international companies for years, and I keep only the tools and methods that hold up when the output is checked line by line.</p>
    <p>The work stays measurable on purpose. Agent-readiness is a property a scanner reads, higher next week than this week or not. The wider work holds to the same test. The data an agent acts on either arrives intact or it does not, and the boundary you set either holds or it does not. Measurable either way, which is the only kind of claim I make.</p>
  </section>

  <section class="sec contact">
    <h2>Contact me</h2>
    <p>Seeing where your site, API or product stands with AI agents starts with a measured baseline, a written report, and a prioritized list of what to fix first. For agent-readiness that baseline comes from two independent scanners. For the wider work it comes from testing the data path and the decision envelope directly. Async-only engagement. No calls and no calendar links. The first reply lands in writing within one business day.</p>
    <div class="contact-card">
      <a class="ch" href="mailto:info@turva.dev"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg><span>info@turva.dev</span></a>
      <div class="ch"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/></svg><span>Signal @turva.19</span></div>
      <a class="ch" href="https://www.linkedin.com/in/erikrekola/"><svg viewBox="0 0 24 24" fill="#5DF18F" aria-hidden="true"><path d="M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.4 8.9h3.1V21H3.4zM9.2 8.9h2.97v1.65h.04c.41-.78 1.42-1.6 2.93-1.6 3.13 0 3.71 2.06 3.71 4.74V21h-3.1v-5.35c0-1.28-.02-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.83V21H9.2z"/></svg><span>LinkedIn</span></a>
    </div>
    <div class="cta-row"><a class="cta-btn" href="mailto:info@turva.dev?subject=Agent-readiness%20audit">Request an audit</a></div>
  </section>
</main>
${FOOTER_HTML}
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

function serveServicesHtml(canonicalUrl) {
  const metaBlock = buildMetaBlock("/services", canonicalUrl);
  const jsonLd = buildGuideJsonLd("/services", canonicalUrl);
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
<link rel="alternate" href="${canonicalUrl}" type="text/markdown" />
<style>
html,body{background-color:#0A1316;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased;color-scheme:dark;}
main{max-width:46rem;margin:0 auto;padding:2.4rem clamp(20px,5vw,72px) 3rem;}
h1{color:#5DF18F;font-size:2.2rem;line-height:1.12;letter-spacing:-0.02em;margin:0 0 0.6rem;font-weight:700;}
.intro{font-size:1.12rem;color:#C9D1CE;margin:0 0 1.8rem;}
a{color:#5DF18F;text-decoration:none;}
a:hover{text-decoration:underline;}
.turva-nav{box-sizing:border-box;width:100%;background:#0A1316;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px clamp(20px,5vw,72px);border-bottom:0.5px solid rgba(255,255,255,0.08);}
.turva-nav *,.turva-nav *::before,.turva-nav *::after{box-sizing:border-box;}
.turva-nav .nv-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.turva-nav .nv-brand svg{display:block;width:26px;height:26px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
.turva-nav .nv-menu{display:flex;align-items:center;gap:clamp(14px,2vw,30px);list-style:none;margin:0;padding:0;flex:1;}
.turva-nav .nv-menu a{font-size:15px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
.turva-nav .nv-menu a[aria-current]{color:#F2F4F3;}
@media (max-width:640px){.turva-nav .nv-menu{gap:14px;}.turva-nav .nv-menu a{font-size:14px;}}
.pcard{border:0.5px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.02);padding:1.5rem 1.5rem 1.3rem;margin:0 0 1.1rem;transition:border-color .15s ease;}
.pcard:hover{border-color:rgba(93,241,143,0.35);}
.pcard-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:.4rem 1rem;border-bottom:0.5px solid rgba(255,255,255,0.08);padding-bottom:.85rem;margin-bottom:1rem;}
.pcard-t{font-size:1.3rem;font-weight:700;color:#5DF18F;letter-spacing:-0.01em;margin-right:auto;}
.pcard-price{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.45rem;font-weight:700;color:#F2F4F3;}
.pcard-meta{flex-basis:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.74rem;letter-spacing:.05em;text-transform:uppercase;color:#9AA3A0;}
.pcard p{color:#C9D1CE;margin:0 0 .9rem;font-size:.97rem;}
.pcard .lbl{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#9AA3A0;margin:1.1rem 0 .5rem;}
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
${FOOTER_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<nav class="turva-nav">
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
    <li><a href="/company">company</a></li>
    <li><a href="/legal">legal</a></li>
    <li><a href="/contact">contact</a></li>
  </ul>
</nav>
<main id="main">
  <h1>Services</h1>
  <p class="intro">Five offerings. Async-only. One business day response.</p>

  <div class="pcard">
    <div class="pcard-head"><span class="pcard-t">Audit</span><span class="pcard-price">&#8364;6,500</span><span class="pcard-meta">Two to three weeks &middot; Fixed scope</span></div>
    <p>A measurement of how agent-ready your site and APIs are today, with a prioritized list of what to fix first.</p>
    <p class="lbl">What you get</p>
    <ul class="get">
      <li>Two independent scanners run against the site or API</li>
      <li>Manual review of /.well-known/ manifests, JSON-LD, head metadata and HTTP headers</li>
      <li>Review of robots.txt, sitemap.xml, ai.txt and llms.txt against current agent norms</li>
      <li>Written report with findings ranked by score impact and implementation cost</li>
      <li>One round of written follow-up questions</li>
    </ul>
    <p class="lbl">What you do not get</p>
    <ul class="nope">
      <li>Calls or meetings</li>
      <li>Implementation of the fixes (separate engagement)</li>
      <li>Ongoing monitoring (separate engagement)</li>
    </ul>
    <p class="suited">Suited for teams that want a clear picture of where they stand before deciding what to do about it.</p>
  </div>

  <div class="pcard">
    <div class="pcard-head"><span class="pcard-t">Advisory</span><span class="pcard-price">&#8364;3,000</span><span class="pcard-meta">per month &middot; Monthly retainer &middot; Minimum three months</span></div>
    <p>Ongoing input on agent-readiness as part of your product roadmap, with tracking of how the scores change over time.</p>
    <p class="lbl">What you get</p>
    <ul class="get">
      <li>Monthly re-scan and score delta report</li>
      <li>Written review of any agent-readiness related work your team ships, within one business day</li>
      <li>Roadmap input on what to ship next and why</li>
      <li>Async channel for questions (email or shared doc)</li>
      <li>Quarterly summary of measurable progress</li>
    </ul>
    <p class="suited">Suited for teams treating agent-readiness as an ongoing product responsibility rather than a one-off cleanup.</p>
  </div>

  <div class="pcard">
    <div class="pcard-head"><span class="pcard-t">Implementation</span><span class="pcard-price">&#8364;1,500</span><span class="pcard-meta">per day &middot; Scoped per task</span></div>
    <p>Hands-on work on the fixes the audit identified, or new agent-ready infrastructure built from scratch.</p>
    <p class="lbl">Typical work</p>
    <ul class="get">
      <li>Cloudflare Workers for head metadata and /.well-known/ files served at the edge</li>
      <li>MCP servers exposing read-only product data to agents</li>
      <li>JSON-LD generators for product, organization and article schemas</li>
      <li>ai.txt and llms.txt authoring</li>
      <li>Signed content and agent authentication patterns</li>
    </ul>
    <p class="suited">Scoped repository write access per task. No retainer.</p>
  </div>

  <div class="pcard">
    <div class="pcard-head"><span class="pcard-t">Agent operations</span><span class="pcard-price">Price on request</span><span class="pcard-meta">Scoped per engagement</span></div>
    <p>The work beyond readiness, for teams moving from "an agent can read us" to "an agent can act on a system that matters." Two things decide whether an agent acts correctly. The data it works from has to arrive intact, even over links that drop or lag. And the decisions it is allowed to make have to sit inside an envelope of permissions and thresholds you set deliberately.</p>
    <p class="lbl">Typical work</p>
    <ul class="get">
      <li>Review of the data path an agent depends on, and where it breaks under real network conditions</li>
      <li>The permission and threshold envelope that bounds what an agent may decide and act on</li>
      <li>Where a human stays in the loop, and how control passes between person and agent</li>
      <li>Guardrails and verification so an agent's decisions can be checked after the fact</li>
    </ul>
    <p>Scope and price vary with the system.</p>
    <p class="suited">Suited for teams letting agents act on data and decisions that matter, not only read a marketing site.</p>
  </div>

  <div class="pcard">
    <div class="pcard-head"><span class="pcard-t">MCP server design</span><span class="pcard-price">Price on request</span><span class="pcard-meta">Scoped per engagement</span></div>
    <p>An MCP server built for your product, exposing read-only data to agents over streamable HTTP transport. No auth surface and no logging by default.</p>
    <p class="lbl">Typical work</p>
    <ul class="get">
      <li>Read-only discovery tools over your product data</li>
      <li>Streamable HTTP transport with no auth surface and no logging by default</li>
      <li>An MCP server card at /.well-known/mcp/server-card.json so agents can discover the server</li>
      <li>Registry publication so the server is findable in MCP directories</li>
    </ul>
    <p class="suited">Suited for teams that want agents to read product data through a supported interface rather than scraping HTML.</p>
  </div>

  <div class="scard"><h2>The agent-ready badge</h2>
    <p>Sites that complete an audit, or score 100/100 on a public agent-readiness scanner, may display the <a href="/badge">agent-ready badge</a>.</p>
  </div>

  <div class="start">
    <h2>How to start</h2>
    <p>Email <a href="mailto:info@turva.dev">info@turva.dev</a> with the site or API you want audited. I respond within one business day with a fixed quote and a start date.</p>
    <p>No calls or calendar links, and no discovery sessions.</p>
    <div class="cta-row"><a class="cta-btn" href="mailto:info@turva.dev?subject=Agent-readiness%20audit">Request an audit</a></div>
    <p class="fine">All prices exclude VAT. 25,5% for Finnish customers, reverse charge for EU B2B, 0% for non-EU.</p>
  </div>
</main>
${FOOTER_HTML}
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

var CARDPAGE_CSS = `html,body{background-color:#0A1316;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased;color-scheme:dark;}
main{max-width:46rem;margin:0 auto;padding:2.4rem clamp(20px,5vw,72px) 3rem;}
h1{color:#5DF18F;font-size:2.2rem;line-height:1.12;letter-spacing:-0.02em;margin:0 0 0.6rem;font-weight:700;}
.intro{font-size:1.12rem;color:#C9D1CE;margin:0 0 1.8rem;}
a{color:#5DF18F;text-decoration:none;}
a:hover{text-decoration:underline;}
.turva-nav{box-sizing:border-box;width:100%;background:#0A1316;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px clamp(20px,5vw,72px);border-bottom:0.5px solid rgba(255,255,255,0.08);}
.turva-nav *,.turva-nav *::before,.turva-nav *::after{box-sizing:border-box;}
.turva-nav .nv-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.turva-nav .nv-brand svg{display:block;width:26px;height:26px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
.turva-nav .nv-menu{display:flex;align-items:center;gap:clamp(14px,2vw,30px);list-style:none;margin:0;padding:0;flex:1;}
.turva-nav .nv-menu a{font-size:15px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
.turva-nav .nv-menu a[aria-current]{color:#F2F4F3;}
@media (max-width:640px){.turva-nav .nv-menu{gap:14px;}.turva-nav .nv-menu a{font-size:14px;}}
.scard{border:0.5px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.02);padding:1.4rem 1.5rem 1.2rem;margin:0 0 1rem;transition:border-color .15s ease;}
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
.kvs{display:grid;grid-template-columns:max-content 1fr;gap:.55rem .7rem;align-items:baseline;}
.kv{display:contents;}
.kv .k{color:#9AA3A0;font-size:.88rem;}
.kv .v{color:#5DF18F;font-weight:600;word-break:break-word;}
main>p{color:#C9D1CE;margin:0 0 1.3rem;}
.gv{color:#5DF18F;font-weight:600;}
.scard .sub{color:#9AA3A0;font-size:.95rem;margin:-.4rem 0 .9rem;}
.faq .q{color:#F2F4F3;font-weight:700;font-size:1rem;margin:1.15rem 0 .4rem;}
.faq .q:first-child{margin-top:0;}
.faq p{color:#C9D1CE;margin:0 0 .2rem;font-size:.95rem;}
.dl{display:flex;flex-direction:column;gap:.75rem;}
.dl p{margin:0;color:#C9D1CE;font-size:.95rem;line-height:1.55;}
.dl .term{color:#5DF18F;font-weight:700;}
.post{display:block;border:0.5px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.02);padding:1.05rem 1.35rem;margin:0 0 .75rem;text-decoration:none;transition:border-color .15s ease;}
.post:hover{border-color:rgba(93,241,143,0.4);}
.post .pt{display:block;color:#5DF18F;font-weight:700;font-size:1.1rem;letter-spacing:-0.01em;margin:0 0 .28rem;}
.post .pd{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.76rem;letter-spacing:.04em;color:#9AA3A0;}
.feed{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;margin:-1.2rem 0 1.6rem;}
.feed a{color:#9AA3A0;}
.feed a:hover{color:#5DF18F;text-decoration:none;}`;

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
<link rel="alternate" href="${canonicalUrl}" type="text/markdown" />
<style>
${CARDPAGE_CSS}
${FOOTER_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>`;
}

function cardPageNav(current) {
  const items = [["/","home"],["/services","services"],["/guides","guides"],["/blog","blog"],["/company","company"],["/legal","legal"],["/contact","contact"]];
  const lis = items.map(([href,label]) => `    <li><a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`).join("\n");
  return `<nav class="turva-nav">
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
  headers.append("Link", `<${canonicalUrl}>; rel="alternate"; type="text/markdown"`);
  return headers;
}

function serveCompanyHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/company", canonicalUrl), buildGuideJsonLd("/company", canonicalUrl), canonicalUrl);
  const body = `${head}
${cardPageNav("/company")}
<main id="main">
  <h1>Company</h1>
  <p class="intro">turva.dev is operated by Erik Rekola.</p>
  <div class="scard"><h2>Business details</h2><div class="kvs">
    <div class="kv"><span class="k">Trade name</span><span class="v">turva.dev</span></div>
    <div class="kv"><span class="k">Business ID</span><span class="v">3600281-7</span></div>
    <div class="kv"><span class="k">Country of registration</span><span class="v">Finland</span></div>
    <div class="kv"><span class="k">Form</span><span class="v">Sole proprietorship</span></div>
  </div></div>
  <div class="scard"><h2>About the operator</h2>
    <p>Erik has eleven years of experience as an engineer in industrial settings, including roles at UPM, Franke, Thermo Fisher Scientific and ASM International.</p>
    <p>The work covered measurement, process engineering and the documentation of complex systems. The same approach now applies to a different subject: how websites and APIs are read by AI agents.</p>
  </div>
  <div class="scard"><h2>Location</h2><p>Tampere, Pirkanmaa, Finland. All work is delivered remotely. No on-site engagements.</p></div>
  <div class="scard"><h2>Why this service exists</h2>
    <p>Agent-readiness is a measurable property of a site, an API, or a product surface. This service answers one question: whether the scanners read it higher next week than this week.</p>
    <p>Most websites and APIs were built before AI agents were a meaningful class of clients. The protocols (MCP, well-known manifests, structured discovery, JSON-LD) exist, but few sites implement them correctly. The result is a measurable gap between what an agent can read and what a human can read.</p>
    <p>This service closes that gap on a per-project basis, with independent scanners as the referee.</p>
  </div>
  <div class="scard"><h2>Operating principles</h2><ul>
    <li>Async-only engagement. No calls, no calendar links.</li>
    <li>All work delivered remotely.</li>
    <li>Production credentials are not requested.</li>
    <li>Write access scoped per task and only if implementation is purchased.</li>
    <li>Every claim is verifiable against public scanner output.</li>
  </ul></div>
  <div class="scard"><h2>Contact</h2><div class="kvs">
    <div class="kv"><span class="k">Email</span><a class="v" href="mailto:info@turva.dev">info@turva.dev</a></div>
    <div class="kv"><span class="k">Signal</span><span class="v">@turva.19</span></div>
    <div class="kv"><span class="k">LinkedIn</span><a class="v" href="https://www.linkedin.com/in/erikrekola/">linkedin.com/in/erikrekola</a></div>
  </div></div>
  <div class="scard"><h2>Invoicing</h2>
    <p>Payment terms are fourteen days net unless agreed otherwise in writing.</p>
    <p>VAT is added to invoices according to Finnish law. Reverse charge applies to EU B2B customers with a valid VAT ID. Non-EU customers are invoiced without VAT.</p>
  </div>
</main>
${FOOTER_HTML}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

function serveContactHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/contact", canonicalUrl), buildGuideJsonLd("/contact", canonicalUrl), canonicalUrl);
  const body = `${head}
${cardPageNav("/contact")}
<main id="main">
  <h1>Contact</h1>
  <p class="intro">Written contact only. Email for longer messages, Signal for short questions. The first reply is in writing within one business day. No calls and no calendar links at any stage of the engagement.</p>
  <div class="scard"><h2>Channels</h2><div class="kvs">
    <div class="kv"><span class="k">Email</span><a class="v" href="mailto:info@turva.dev">info@turva.dev</a></div>
    <div class="kv"><span class="k">Signal</span><span class="v">@turva.19</span></div>
    <div class="kv"><span class="k">LinkedIn</span><a class="v" href="https://www.linkedin.com/in/erikrekola/">linkedin.com/in/erikrekola</a></div>
  </div></div>
  <div class="scard"><h2>Response times</h2><ul>
    <li>Email and Signal: within one business day</li>
    <li>Weekends: no guaranteed response time</li>
  </ul></div>
  <div class="scard"><h2>What to include in a first message</h2>
    <p>A useful first message includes:</p>
    <ul>
      <li>The site or API to be audited (URL)</li>
      <li>Any current scanner results, if you have run them</li>
      <li>The scope you have in mind (audit, advisory, implementation, agent operations, MCP server design)</li>
    </ul>
    <p class="note">If you do not have scanner results yet, that is fine. The audit starts with running them.</p>
  </div>
  <div class="scard"><h2>Geographic service area</h2><p>Based in Tampere, Finland. Service delivered remotely worldwide. All work is asynchronous and written.</p></div>
  <div class="scard"><h2>Business details</h2><div class="kvs">
    <div class="kv"><span class="k">Business ID</span><span class="v">3600281-7</span></div>
    <div class="kv"><span class="k">Register</span><a class="v" href="https://tietopalvelu.ytj.fi/yritys/3600281-7">tietopalvelu.ytj.fi/yritys/3600281-7</a></div>
    <div class="kv"><span class="k">Agent registration</span><a class="v" href="https://turva.dev/auth.md">turva.dev/auth.md</a></div>
  </div></div>
</main>
${FOOTER_HTML}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

function serveLegalHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/legal", canonicalUrl), buildGuideJsonLd("/legal", canonicalUrl), canonicalUrl);
  const body = `${head}
${cardPageNav("/legal")}
<main id="main">
  <h1>Legal</h1>
  <p class="intro">This page covers the terms under which turva.dev operates, the privacy practices of the site, and the default terms for engagements.</p>
  <div class="scard"><h2>Operator</h2>
    <p>turva.dev is operated by Erik Rekola, Business ID <span class="gv">3600281-7</span>, registered in Finland as a sole proprietorship. VAT-registered.</p>
    <p>Contact: <a href="mailto:info@turva.dev">info@turva.dev</a></p>
  </div>
  <div class="scard"><h2>Terms of engagement</h2>
    <p>The following terms apply to all engagements (audit, advisory, implementation, agent operations and MCP server design) unless replaced by a written agreement.</p>
    <div class="dl">
      <p><span class="term">Scope.</span> Each engagement has a defined scope agreed in writing before work starts. Scope changes require a new written agreement and may affect price and timeline.</p>
      <p><span class="term">Deliverables.</span> Audit deliverables are a written report. Advisory deliverables are written reviews and a monthly summary. Implementation deliverables are source code committed to the agreed repository.</p>
      <p><span class="term">Payment.</span> Payment terms are fourteen days net. Late payment interest follows Finnish law.</p>
      <p><span class="term">Confidentiality.</span> Information shared during an engagement is treated as confidential. A separate non-disclosure agreement can be signed on request.</p>
      <p><span class="term">Liability.</span> Liability is limited to the value of the engagement. turva.dev is not liable for indirect or consequential damages.</p>
      <p><span class="term">Intellectual property.</span> The client owns the deliverables produced for them. Generic methods, templates and reusable code remain with turva.dev.</p>
      <p><span class="term">Governing law.</span> Finnish law applies. Disputes are resolved in the District Court of Pirkanmaa, Finland.</p>
    </div>
  </div>
  <div class="scard"><h2>Privacy</h2>
    <p>This site does not use analytics cookies, tracking pixels or third-party scripts.</p>
    <div class="dl">
      <p><span class="term">Server logs.</span> The hosting provider (Cloudflare) records standard request logs including IP address, user agent and requested path. Logs are retained according to Cloudflare's standard retention policy.</p>
      <p><span class="term">Email.</span> Email communication is stored in standard email infrastructure for as long as needed to deliver the work and meet accounting obligations under Finnish law (six years for invoice records).</p>
      <p><span class="term">Client data.</span> Data shared by a client during an engagement is stored only on systems necessary to deliver the work, and deleted within thirty days of engagement closure unless retention is required by law.</p>
    </div>
    <p class="note">No data is sold or shared with third parties.</p>
  </div>
  <div class="scard"><h2>Rights under GDPR</h2>
    <p>You have the right to access, correct or request deletion of personal data held about you. Send the request to <a href="mailto:info@turva.dev">info@turva.dev</a>.</p>
    <p>The supervisory authority in Finland is the Data Protection Ombudsman (tietosuojavaltuutettu.fi).</p>
  </div>
  <div class="scard"><h2>Cookies</h2>
    <p>This site sets no cookies of its own. Cloudflare may set cookies required for bot management and security. These are technical cookies and do not require consent under EU law.</p>
  </div>
  <div class="scard"><h2>Updates</h2>
    <p>This page is updated when the terms change. The current version applies to engagements started after the date below.</p>
    <p>Last updated: <span class="gv">2026-06-20</span>.</p>
  </div>
</main>
${FOOTER_HTML}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

function serveBadgeHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/badge", canonicalUrl), buildGuideJsonLd("/badge", canonicalUrl), canonicalUrl);
  const snippet = '<a href="https://turva.dev/badge"><img src="https://turva.dev/badge.svg" alt="agent-ready, criteria at turva.dev/badge" width="216" height="36" loading="lazy"></a>';
  const body = `${head}
${cardPageNav("/badge")}
<main id="main">
  <h1>The agent-ready badge</h1>
  <p class="intro">A small SVG badge a site can embed to show it meets public agent-readiness criteria, linking back to this page. The badge is served from turva.dev, the criteria are listed below, and anyone can re-check the claim by running the same public scanners.</p>
  <div class="scard"><h2>Who may display it</h2><ul>
    <li>Sites that have completed a turva.dev agent-readiness audit</li>
    <li>Sites that score 100/100 on a public agent-readiness scanner (startuphub.ai or isitagentready.com)</li>
  </ul></div>
  <div class="scard"><h2>What it is, and what it is not</h2>
    <p>The badge is a self-declared claim against public criteria, not a certification. turva.dev does not police its use. The value of the badge is that the claim is checkable: either scanner can be run against the displaying site by anyone, at any time.</p>
  </div>
  <div class="scard"><h2>How to embed it</h2>
    <p>The badge looks like this:</p>
    <p><img src="/badge.svg" alt="agent-ready, criteria at turva.dev/badge" width="216" height="36"></p>
    <p>Copy this HTML where you want it to appear:</p>
    <pre><code>${escapeHtml(snippet)}</code></pre>
    <p class="note">The image is 216 by 36 pixels, dark background, under one kilobyte.</p>
  </div>
  <div class="scard"><h2>If your site is not there yet</h2>
    <p>An audit measures where you stand and lists what to fix first. Services and prices are on the <a href="/services">services page</a>. Email <a href="mailto:info@turva.dev">info@turva.dev</a> and you get a reply within one business day.</p>
  </div>
</main>
${FOOTER_HTML}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

// llms.txt validator: fetches a target site's /llms.txt server-side and
// checks its structure against the llms.txt format. Only https://<host>/llms.txt
// is ever requested, redirects are not followed (a redirect fails the first
// check), the host must be a public DNS name
// (no IP literals, no localhost/internal names, no ports, no credentials),
// the fetch times out after 8 seconds and the body read is capped at 256 KB.
// Results are never stored and result pages are served with no-store.
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

async function fetchLlmsTxt(host) {
  const target = "https://" + host + "/llms.txt";
  const res = await fetch(target, {
    redirect: "manual",
    signal: AbortSignal.timeout(8000),
    headers: {
      "user-agent": "turva-llms-validator/1.0 (+https://turva.dev/llms-txt-validator)",
      "accept": "text/plain, text/markdown;q=0.9, */*;q=0.1"
    }
  });
  if (res.status >= 300 && res.status < 400) {
    return { redirect: true, status: res.status, location: res.headers.get("location") || "" };
  }
  const cap = 262144;
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
    text: new TextDecoder("utf-8").decode(buf),
    bytes,
    truncated
  };
}

function validateLlmsTxt(f) {
  const checks = [];
  const add = (id, status, label, detail) => checks.push({ id, status, label, detail });
  if (f.redirect) {
    add("http-status", "fail", "File exists at /llms.txt", "expected HTTP 200 at /llms.txt, got a " + f.status + " redirect" + (f.location ? " to " + f.location.slice(0, 120) : "") + "; llms.txt should be served directly");
    return checks;
  }
  if (f.status !== 200) {
    add("http-status", "fail", "File exists at /llms.txt", "expected HTTP 200, got " + f.status);
    return checks;
  }
  add("http-status", "pass", "File exists at /llms.txt", "HTTP 200");
  const ct = f.contentType.toLowerCase();
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
  const first = firstIdx === -1 ? "" : lines[firstIdx].trim();
  if (/^# \S/.test(first)) {
    add("h1-title", "pass", "Starts with an H1 title", JSON.stringify(first.slice(0, 80)));
  } else {
    add("h1-title", "fail", "Starts with an H1 title", "the first non-empty line should be a markdown H1 (# Site name)");
  }
  const afterH1 = lines.slice(firstIdx + 1).find((l) => l.trim() !== "") || "";
  if (afterH1.trim().startsWith("> ")) {
    add("summary", "pass", "Blockquote summary after the title", JSON.stringify(afterH1.trim().slice(0, 80)));
  } else {
    add("summary", "warn", "Blockquote summary after the title", "recommended by the format (> one-line summary), not required");
  }
  const h2Count = (f.text.match(/^## /gm) || []).length;
  if (h2Count > 0) {
    add("sections", "pass", "H2 sections group the content", h2Count + " section" + (h2Count === 1 ? "" : "s"));
  } else {
    add("sections", "warn", "H2 sections group the content", "no H2 sections found; sections are the convention for grouping links");
  }
  const links = [...f.text.matchAll(/\[([^\]]*)\]\(([^)\s]+)\)/g)];
  const absolute = links.filter((m) => /^https?:\/\//.test(m[2])).length;
  if (links.length === 0) {
    add("links", "warn", "Markdown links an agent can follow", "no markdown links found");
  } else if (absolute === links.length) {
    add("links", "pass", "Markdown links an agent can follow", links.length + " link" + (links.length === 1 ? "" : "s") + ", all absolute URLs");
  } else {
    add("links", "warn", "Markdown links an agent can follow", links.length + " links, " + (links.length - absolute) + " relative; absolute URLs travel better when the file is read out of context");
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

function summarizeChecks(checks) {
  if (checks.some((c) => c.status === "fail")) return "not valid";
  if (checks.some((c) => c.status === "warn")) return "valid with warnings";
  return "valid";
}

async function serveLlmsValidatorHtml(request, canonicalUrl) {
  const reqUrl = new URL(request.url);
  const raw = (reqUrl.searchParams.get("url") || "").slice(0, 300);
  let result = null;
  let error = null;
  if (raw) {
    const host = normalizeHostInput(raw);
    if (!host || !isValidPublicHost(host)) {
      error = "That does not look like a public domain name. Enter a domain like example.com.";
    } else if (host === "turva.dev" || host === "www.turva.dev") {
      // A Worker cannot fetch its own zone, so the site's own llms.txt is
      // validated directly from the same constant that serves /llms.txt.
      result = {
        target: "https://turva.dev/llms.txt",
        checks: validateLlmsTxt({
          status: 200,
          contentType: "text/plain; charset=utf-8",
          text: LLMS_TXT,
          bytes: new TextEncoder().encode(LLMS_TXT).length,
          truncated: false
        })
      };
    } else {
      try {
        const fetched = await fetchLlmsTxt(host);
        result = { target: "https://" + host + "/llms.txt", checks: validateLlmsTxt(fetched) };
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
    const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*" });
    appendAgentLinks(headers);
    applySecurityHeaders(headers, "agent-api");
    return new Response(JSON.stringify(payload, null, 2), { status: payload.error ? 400 : 200, headers });
  }
  const head = cardPageHead(buildMetaBlock("/llms-txt-validator", canonicalUrl), buildGuideJsonLd("/llms-txt-validator", canonicalUrl), canonicalUrl);
  const mark = { pass: "\u2713", warn: "!", fail: "\u2717" };
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
  <h1>llms.txt validator</h1>
  <p class="intro">Enter a domain and this page fetches its /llms.txt and checks the structure against the format: one H1 title, an optional blockquote summary, H2 sections with link lists. Free, no signup, nothing stored.</p>
  <div class="scard">
    <form class="vform" method="get" action="/llms-txt-validator">
      <input type="text" name="url" placeholder="example.com" value="${escapeHtml(raw)}" aria-label="Domain to check" required>
      <button type="submit">Check</button>
    </form>
    <p class="note">Only https://&lt;domain&gt;/llms.txt is fetched. Agents can call this with Accept: application/json.</p>
  </div>
  ${resultHtml}
  <div class="scard"><h2>What it does not do</h2>
    <p>This is a structure check against the llms.txt format, not an agent-readiness score. A full audit measures discovery, content, access control and more: see <a href="/services">services</a>, or start with <a href="/guides/llms-txt">llms.txt explained</a>.</p>
  </div>
</main>
${FOOTER_HTML}
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
  <h1>Agent-readiness guides</h1>
  <p class="intro">These short guides explain, in plain language, what makes a website or an API easy for AI agents to read and use. Each one covers a single topic and takes a few minutes to read. They are free, and they cover the same surfaces an <a href="/services">agent-readiness audit</a> measures.</p>
  <p>Not sure where to start? The first guide explains what an agent-readiness audit is.</p>
  <div class="scard"><h2>Discovery and content</h2><p class="sub">How an agent finds your site and reads it without getting lost.</p><ul>
    <li><a href="/guides/agent-readiness-audit">What an agent-readiness audit is</a></li>
    <li><a href="/guides/get-cited-by-ai-assistants">How to get your site cited by AI assistants</a></li>
    <li><a href="/guides/llms-txt">llms.txt explained</a></li>
    <li><a href="/guides/markdown-for-agents">Serving markdown to agents</a></li>
    <li><a href="/guides/open-knowledge-format">Open Knowledge Format (OKF) explained</a></li>
    <li><a href="/guides/sitemaps-and-robots-for-agents">Sitemaps, robots.txt and agent access</a></li>
    <li><a href="/guides/response-headers-for-agents">Response headers that help agents</a></li>
    <li><a href="/guides/prerendering-for-agents">Prerendering and why agents see empty pages</a></li>
  </ul></div>
  <div class="scard"><h2>Capability and trust</h2><p class="sub">How a site tells an agent what it is allowed to do, and shows it is safe to use.</p><ul>
    <li><a href="/guides/mcp-server-card">MCP server cards explained</a></li>
    <li><a href="/guides/agents-json">What agents.json is</a></li>
    <li><a href="/guides/well-known-for-agents">The /.well-known directory for agents</a></li>
    <li><a href="/guides/agentic-resource-discovery">Agentic Resource Discovery and ai-catalog.json</a></li>
    <li><a href="/guides/agent-authentication">How agents authenticate</a></li>
    <li><a href="/guides/json-ld-structured-data">JSON-LD and structured data for agents</a></li>
  </ul></div>
  <div class="scard"><h2>Commerce and strategy</h2><p class="sub">Paying agents, how this differs from SEO, and how to choose and measure an audit.</p><ul>
    <li><a href="/guides/x402-agent-payments">x402 and agent payments</a></li>
    <li><a href="/guides/agent-commerce-discovery">Agent commerce discovery: A2A, AP2, and ACP</a></li>
    <li><a href="/guides/agentic-commerce-readiness">Agentic commerce readiness: selling to AI shopping agents</a></li>
    <li><a href="/guides/seo-vs-agent-readiness">SEO and agent-readiness are not the same</a></li>
    <li><a href="/guides/agent-readiness-aeo-geo">Agent-readiness, AEO and GEO: how they relate</a></li>
    <li><a href="/guides/letting-agents-act-on-data">Letting agents act on data: the decision envelope</a></li>
    <li><a href="/guides/ai-agent-use-cases">AI agent use cases: where agents read data and make decisions</a></li>
    <li><a href="/guides/measurement-led-agent-readiness">Why agent-readiness should be measured, not asserted</a></li>
    <li><a href="/guides/agent-readiness-gaps">Common agent-readiness gaps on marketing sites</a></li>
    <li><a href="/guides/choosing-an-agent-readiness-audit">Choosing an agent-readiness audit</a></li>
  </ul></div>
  <div class="scard"><h2>Frequently asked</h2><div class="faq">
    <p class="q">What is an agent-readiness audit?</p>
    <p>An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API, scored against current standards by an independent scanner rather than a self-assessment.</p>
    <p class="q">Do I need llms.txt on my site?</p>
    <p>If you want models and agents to read your real content rather than guess from a cached snippet, llms.txt gives them a curated map of what matters. It does not replace robots.txt or a sitemap, it complements them.</p>
    <p class="q">How do I get my site cited by AI assistants?</p>
    <p>A model cites content it can read cleanly and corroborate. That means machine-readable surfaces such as llms.txt and structured data, a markdown form that does not exhaust the token budget, and being indexed where the assistant searches.</p>
    <p class="q">What is an MCP server card?</p>
    <p>An MCP server card is a JSON file, usually at /.well-known/mcp/server-card.json, that lets an agent discover a site's Model Context Protocol server and the tools it exposes, so the agent can call them without a human wiring up the connection.</p>
    <p class="q">Is agent-readiness the same as SEO?</p>
    <p>No. SEO makes a site rank for a person to click. Agent-readiness makes a site legible and usable by an agent that reads and acts. A site can rank well and still be opaque to agents.</p>
    <p class="q">How is agent-readiness measured?</p>
    <p>By an independent scanner that reads the live site and reports a score with a category breakdown. The categories that get fixed read higher on the next scan, so the claim is the number rather than an assertion.</p>
  </div></div>
  <p>For an audit, contact <a href="mailto:info@turva.dev">info@turva.dev</a>.</p>
</main>
${FOOTER_HTML}
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
    `  <a class="post" href="${path}"><span class="pt">${escapeHtml((meta.title || "").replace(/ \| turva\.dev$/, ""))}</span><span class="pd">${meta.date}</span></a>`
  ).join("\n");
}

function serveBlogHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/blog", canonicalUrl), buildGuideJsonLd("/blog", canonicalUrl), canonicalUrl);
  const body = `${head}
${cardPageNav("/blog")}
<main id="main">
  <h1>Blog</h1>
  <p class="intro">Notes on AI agents, and the work of letting them read a site and act on a system safely. Each entry is dated, and anything that can be measured is checked against independent scanners rather than asserted.</p>
  <p class="feed"><a href="/blog/feed.xml">RSS feed</a></p>
${blogPostLinks()}
</main>
${FOOTER_HTML}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

var X402_ROUTES = {
  "/api/agent/audit": {
    label: "Audit",
    description: "turva.dev: Agent-readiness audit (fixed scope, 2-3 weeks)",
    amountUsdcMicro: "7413000000",
    amountEurCents: 650000
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
  audit: { item: "audit", name: "Agent-readiness audit", amount: 650000, description: "Fixed scope, 2-3 weeks. Independent scanner sweep, manual review, written report with prioritized fixes." },
  advisory: { item: "advisory", name: "Continuous advisory", amount: 300000, description: "Monthly re-scan, score delta report, written review, roadmap input. Minimum three months." },
  implementation: { item: "implementation", name: "Implementation day", amount: 150000, description: "Hands-on Worker-level work, scoped per task." }
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
    }],
    "links": [
      { "type": "terms_of_use", "url": "https://turva.dev/legal" },
      { "type": "privacy_policy", "url": "https://turva.dev/legal" }
    ]
  };
}

function acpHeaders() {
  const h = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "api-version": "2026-01-16"
  });
  appendAgentLinks(h);
  applySecurityHeaders(h, "agent-api");
  return h;
}

async function serveAcpCheckout(request, pathLower) {
  const method = request.method;
  const base = "/api/acp/checkout_sessions";
  if (pathLower === base) {
    if (method !== "POST") {
      return new Response(JSON.stringify({ "type": "invalid_request", "code": "method_not_allowed", "message": "Use POST to create a checkout session." }, null, 2), { status: 405, headers: acpHeaders() });
    }
    let reqBody = {};
    try { reqBody = await request.json(); } catch (e) { reqBody = {}; }
    let serviceId = "audit";
    if (reqBody && Array.isArray(reqBody.items) && reqBody.items[0] && reqBody.items[0].id) {
      serviceId = String(reqBody.items[0].id).toLowerCase();
    }
    if (!["audit", "advisory", "implementation"].includes(serviceId)) {
      return new Response(JSON.stringify({ "type": "invalid_request", "code": "invalid_item", "message": "Unknown item id. Valid item ids: audit, advisory, implementation." }, null, 2), { status: 400, headers: acpHeaders() });
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
  const idMatch = sessionId.match(/^acp_sess_(audit|advisory|implementation)_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  if (!idMatch) {
    return new Response(JSON.stringify({ "type": "invalid_request", "code": "not_found", "message": "Unknown checkout session id. Sessions are stateless: create one with POST " + base + " and reuse the id it returns, which encodes the service." }, null, 2), { status: 404, headers: acpHeaders() });
  }
  const sessionService = idMatch[1];
  if (!action) {
    if (method !== "GET") {
      return new Response(JSON.stringify({ "type": "invalid_request", "code": "method_not_allowed", "message": "Use GET to retrieve a checkout session." }, null, 2), { status: 405, headers: acpHeaders() });
    }
    const session = buildAcpCheckoutSession(sessionService, sessionId);
    return new Response(JSON.stringify(session, null, 2), { status: 200, headers: acpHeaders() });
  }
  if (action === "cancel") {
    if (method !== "POST") {
      return new Response(JSON.stringify({ "type": "invalid_request", "code": "method_not_allowed", "message": "Use POST to cancel a checkout session." }, null, 2), { status: 405, headers: acpHeaders() });
    }
    const session = buildAcpCheckoutSession(sessionService, sessionId);
    session.status = "canceled";
    session.messages = [{ "type": "info", "content_type": "plain", "content": "Checkout session has been canceled." }];
    return new Response(JSON.stringify(session, null, 2), { status: 200, headers: acpHeaders() });
  }
  if (action === "complete") {
    if (method !== "POST") {
      return new Response(JSON.stringify({ "type": "invalid_request", "code": "method_not_allowed", "message": "Use POST to complete a checkout session." }, null, 2), { status: 405, headers: acpHeaders() });
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
  const pathLower = pathname.toLowerCase();

  if (request.method === "OPTIONS" && (pathLower === "/x402" || pathLower.startsWith("/api/") || pathLower.startsWith("/agent/auth/"))) {
    const headers = new Headers({
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "Content-Type, Accept, X-PAYMENT",
      "access-control-max-age": "86400"
    });
    return new Response(null, { status: 204, headers });
  }

  if (hostname === "mta-sts.turva.dev") {
    if (pathLower === "/.well-known/mta-sts.txt") return serveMtaStsPolicy();
    return Response.redirect("https://turva.dev/", 301);
  }

  if (hostname === "www.turva.dev") {
    return Response.redirect("https://turva.dev" + pathname + url.search, 301);
  }

  if (pathLower === "/.well-known/host-meta" || pathLower === "/.well-known/webfinger" || pathLower === "/.well-known/nodeinfo") {
    return Response.redirect("https://social.turva.dev" + pathname + url.search, 301);
  }
  if (pathLower === "/x402") {
    return serveX402Root();
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

  // Worker-rendered HTML pages. The homepage, guides, and the four text pages
  // (services, company, legal, contact) are rendered directly by the worker
  // rather than proxied from Sitejet.
  if (pathname === "/") {
    return serveHomeHtml("https://turva.dev/");
  }
  if (pathname === "/services") {
    return serveServicesHtml("https://turva.dev/services");
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
  if ((pathname.startsWith("/guides/") || pathname.startsWith("/blog/")) && PAGE_MARKDOWN[pathname]) {
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
  if (pathLower === "/.well-known/ai-catalog.json" || pathLower === "/.well-known/ai-catalog") {
    return serveStatic(AI_CATALOG, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/agent.json" || pathLower === "/.well-known/ai-plugin.json") {
    return serveStatic(AGENT_JSON, "application/json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/api" || pathLower === "/api/" || pathLower === "/api/v1" || pathLower === "/api/v1/") {
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
  // path is a genuine 404 rendered by the worker. The Sitejet origin no longer exists.
  return serve404(pathname);
}

export {
  worker_default as default,
  escapeHtml,
  renderInline,
  markdownToHtml
};
