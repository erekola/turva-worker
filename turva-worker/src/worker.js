// src/worker.js
// turva.dev worker v3.108.5 - the security evidence block is re-measured and the Hardenize category count is corrected: the report names 24 categories and every one reads good, while the surfaces had said 13 since the report had a different shape on 1 August. Internet.nl was re-run the same morning and both numbers are unchanged, 98 for the website test and 95 for the mail test, so only the date and the category count move. v3.108.4 - the brief page keeps only the space under its title; the section heading spacing added in 3.108.2 is removed and the shared card page rhythm stands. v3.108.3 - the brief page title gets air under it: a two line brief heading sat on its own standfirst at the shared card page spacing. Scoped to /brief/. v3.108.2 - the brief page gives its section headings room: a brief carries six of them and the shared card page spacing is measured for short pages, so the rule is scoped to /brief/ and the public card pages are untouched. v3.108.1 - the brief address answers content negotiation as the rest of the site does, so an agent that asks for text/markdown or application/json at the page's own address gets it instead of HTML. Measured live on the deployed 3.108.0, which answered HTML to an Accept header it should have honoured. v3.108.0 - a brief now answers at its own address in three forms, HTML for a person and markdown and JSON for a machine, all three read from KV so that a client's brief never enters this public repository. The address is unlisted, it carries noindex and it is not in the sitemap, and an unknown identifier answers exactly as any unknown path does. v3.107.3 - the two v2 link relation checks now read strictly the head a real HTML parser builds, so a link element that a parser moves into the body is no longer counted; 200 000 fuzz inputs on two seeds agree with parse5 exactly, 0 differences. v3.107.2 - the link relation parser finds tags by index instead of by a regex whose character class could scan the whole document from every unclosed tag, which CodeQL reports as js/polynomial-redos; 256 KB of unclosed tags measured 42 ms where the old form was quadratic. v3.107.1 - the link relation parser strips an unterminated HTML comment too, which a real parser treats as commenting out the rest of the document; CodeQL alert #7 named the same gap. v3.107.0 - llms.txt v2, second half: the file's own 59 page links now point at the markdown twin of each page, which is what v2 asks its links to do, and the validator FAQ no longer says llms.txt lives only at the root. v3.106.0 - Every page now answers at its own .md address as well as by content negotiation, the head link and the Link header point at that address instead of at the page itself, and the validator reports the two v2 link relations from the target's home page as information that never moves the summary.

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
  "script-src 'self' 'sha256-aKlb0igJUBpaIswN+2W7JxkrGLB89YJtZNFchOmOrcU='",
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
- [Services](https://turva.dev/services.md)
- [Shopify agent storefront check](https://turva.dev/shopify-agent-storefront-check.md)
- [Company](https://turva.dev/company.md)
- [Contact](https://turva.dev/contact.md)
- [Legal](https://turva.dev/legal.md)

## Guides
- [Agent-readiness guides](https://turva.dev/guides.md)
- [What an agent-readiness audit is](https://turva.dev/guides/agent-readiness-audit.md)
- [How to get your site cited by AI assistants](https://turva.dev/guides/get-cited-by-ai-assistants.md)
- [llms.txt explained](https://turva.dev/guides/llms-txt.md)
- [MCP server cards explained](https://turva.dev/guides/mcp-server-card.md)
- [What agents.json is](https://turva.dev/guides/agents-json.md)
- [x402 and agent payments](https://turva.dev/guides/x402-agent-payments.md)
- [Response headers that help agents](https://turva.dev/guides/response-headers-for-agents.md)
- [SEO and agent-readiness are not the same](https://turva.dev/guides/seo-vs-agent-readiness.md)
- [Agent-readiness, AEO and GEO: how they relate](https://turva.dev/guides/agent-readiness-aeo-geo.md)
- [Letting agents act on data: the decision envelope](https://turva.dev/guides/letting-agents-act-on-data.md)
- [AI agent use cases: where agents read data and make decisions](https://turva.dev/guides/ai-agent-use-cases.md)
- [JSON-LD and structured data for agents](https://turva.dev/guides/json-ld-structured-data.md)
- [The /.well-known directory for agents](https://turva.dev/guides/well-known-for-agents.md)
- [Agentic Resource Discovery and ai-catalog.json](https://turva.dev/guides/agentic-resource-discovery.md)
- [How agents authenticate](https://turva.dev/guides/agent-authentication.md)
- [Why agent-readiness should be measured, not asserted](https://turva.dev/guides/measurement-led-agent-readiness.md)
- [Prerendering and why agents see empty pages](https://turva.dev/guides/prerendering-for-agents.md)
- [Sitemaps, robots.txt and agent access](https://turva.dev/guides/sitemaps-and-robots-for-agents.md)
- [Serving markdown to agents](https://turva.dev/guides/markdown-for-agents.md)
- [Open Knowledge Format (OKF) explained](https://turva.dev/guides/open-knowledge-format.md)
- [Common agent-readiness gaps on marketing sites](https://turva.dev/guides/agent-readiness-gaps.md)
- [Choosing an agent-readiness audit](https://turva.dev/guides/choosing-an-agent-readiness-audit.md)
- [Agent commerce discovery: A2A, AP2, and ACP](https://turva.dev/guides/agent-commerce-discovery.md)
- [Agentic commerce readiness: selling to AI shopping agents](https://turva.dev/guides/agentic-commerce-readiness.md)

## Blog
- [Blog](https://turva.dev/blog.md)
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

## Tools
- [Free tools for agent-readiness](https://turva.dev/tools.md)
- [llms.txt validator](https://turva.dev/llms-txt-validator.md)
- [The agent-ready badge](https://turva.dev/badge.md)

## Pricing (EUR, VAT not included)
- Shopify agent storefront check: €1,900 (fixed scope, 48 hours)
- Audit: €4,300 (fixed scope, two weeks)
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
This domain does publish OAuth protected resource metadata at
/.well-known/oauth-protected-resource, which names an
authorization server, three scope names and bearer tokens in the
Authorization header. Read that document as discovery, not as
protection: every declared resource answers an anonymous request
exactly as it answers one carrying a token, and no scope grants
access that anonymous does not already have. It is published so
an OAuth-aware agent can discover the identity surface without
guessing, not because a 401 is waiting. The only credential this
domain issues is an optional api_key, provided out-of-band on
request; it attributes correspondence and grants no additional
access. This document describes how an operator can
register an agent identity, request metadata corrections, and
revoke prior correspondence.

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
- [How agent-ready are Finnish B2B sites? I scanned sixteen](/blog/agent-readiness-finnish-b2b)`,
  "/blog/cheating-to-keep-the-old-price": `# It would be cheating to keep the old price

2026-08-21

The agent-readiness audit is now €4,300 and two weeks. It was €6,500 and two to three weeks. Nothing came out of the scope to pay for that.

The scanner is the same one, isitagentready. The manual checks that sit over the scanner are the same. The re-scan after the fixes is still the thing the engagement is judged on, and it is still the only claim I make about the result.

What moved is that the part a client used to pay for twice is now written down once.

## What a client used to pay for twice

An audit has two halves. One half is measuring a surface: run the scanner, read what it says, check by hand whether the number is telling the truth. That half is real work and it stays.

The other half was me deciding, again, what a passing row actually looks like. Twenty-two checks, each one an open specification that moved in the last year, and for each one the question was the same: what does a correct implementation of this look like, what does the scanner accept, and what is the concrete change that flips it. I answered those questions from scratch every time, and the client paid for the answering as well as the measuring.

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

€4,300, fixed scope, two weeks, VAT excluded. The other prices did not move: the Shopify agent storefront check is €1,900, advisory is €3,000 per month with a three month minimum, and implementation is €1,500 per day.

**How long does the audit take?**

Two weeks from the agreed written kickoff. It was two to three weeks, and the shorter window also leaves the specifications less time to move underneath the report.

**How do you know the accuracy held?**

Writing the checklist out immediately found a scored check, ard, that was missing from my own fix recipe index and from my own gate. That is the kind of hole the list exists to catch, and it caught it on me first.

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

MDASH is over a hundred agents, multi-model debate across model families, and a separate pipeline that proves candidates before a human ever sees them. Microsoft reports it at 88,45 % on CyberGym, a benchmark for real-world vulnerability discovery. Anthropic's gated frontier model, Claude Mythos, is reported at 83,1 % on the same benchmark.

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

Checks a site's /llms.txt structure against the format and reports each check as pass, warn or fail, plus two v2 link relation checks reported as information. Nothing is stored. An agent gets the same result as JSON by calling the same URL with an Accept: application/json header.

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

    <a href="https://turva.dev/badge"><img src="https://turva.dev/badge.svg" alt="agent-ready, criteria at turva.dev/badge" width="216" height="36" loading="lazy"></a>

The image is 216 by 36 pixels, dark background, under one kilobyte.

## If your site is not there yet

An audit measures where you stand and lists what to fix first.
Services and prices are on the [services page](/services). Email
<mailto:info@turva.dev> and you get a reply within one business day.

All free tools on this site are collected on [the tools page](/tools).
`,

  "/blog": `# Notes on AI agents and agent-readiness

The work here is letting an agent read a site and act on a system safely. Each entry is dated, and anything that can be measured is checked against an independent scanner rather than asserted.

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

An ai-catalog.json is easy to misread as another search file. It is not. It indexes the agentic resources a site exposes so an agent can find them and call each one through its own protocol. Google has said publicly that llms.txt does not affect its search results, and the same holds here. Agent-readiness and search ranking remain different things, and neither should be sold as the other.

## Honest about adoption

In a June 2026 check I ran against their public well-known paths, none of the companies named as contributors to the specification yet served a discoverable ai-catalog.json. The specification is an early draft and adoption is near zero. That is the honest frame for this post. turva.dev is early rather than late, and being early on a verifiable standard is a position worth holding when the work is open source and readable line by line at github.com/erekola/turva-worker.

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
  "/guides/agent-commerce-discovery": `# Agent commerce discovery: A2A, AP2, and ACP

Before an AI agent can transact with a site, it has to discover what the site supports and how to reach it. Three machine-readable surfaces carry that information: an A2A Agent Card, an AP2 declaration, and an ACP discovery document. Each answers a different question, and an agent reads them before it sends a single commerce request.

## The A2A Agent Card

An A2A Agent Card is a JSON file, usually at /.well-known/agent-card.json, that describes an agent interface. It states the agent's name, version, and description, the interfaces it exposes, each with a service URL and a protocol binding, the capabilities it declares, and the skills it offers, each skill carrying an id, a name, and a description. The Agent2Agent protocol uses the card so one agent can discover another and know how to reach it.

The card is most useful when its skills mirror surfaces an agent can already reach, such as a service catalog or contact information. A skill that points nowhere is worse than no skill at all.

## AP2 and the version that matters

AP2 is the Agent Payments Protocol. Under the v0.1 specification, which is what deployed sites and scanners still validate against, a merchant declares support not as a separate file but as an extension entry inside the A2A Agent Card. The entry carries the extension URI, a role such as merchant, and a flag saying whether an agent has to understand the extension.

The detail that trips people up is the URI. Some helper guides write it as github.com/google-agentic-commerce/AP2/tree/v0.1.0, with an uppercase name and a three-part version. The v0.1 specification uses github.com/google-agentic-commerce/ap2/tree/v0.1, lowercase, version v0.1. A scanner that validates against that specification rejects the uppercase form even when everything else is correct. Copy the URI from the spec, not from a fix message.

Note that the current AP2 specification, v0.2 from April 2026, restructures the protocol around checkout and payment mandates and drops the Agent Card extension entirely. The deployed discovery convention and the scanners still follow v0.1, so publish the v0.1 declaration for discoverability today and expect this surface to change as v0.2 adoption arrives.

## ACP discovery and checkout

ACP is the Agentic Commerce Protocol, and it has two parts that are easy to confuse. The first is a discovery document at /.well-known/acp.json, which started as a proposal-stage RFC and entered the released specification with the 2026-04-17 snapshot. The second is the checkout API the document points to.

The discovery document is small and strict. It states the protocol name acp and a version, the api_base_url, a transports array, and a capabilities.services array. The services value is a closed set of strings such as checkout, not a list of product objects. Sending the wrong type is the most common reason an otherwise complete document fails validation.

A discovery check usually reads only the document, not the checkout endpoint behind it. That makes it tempting to declare a service the site does not implement, because the check passes either way. An agent that trusts the document and calls the checkout URL would then reach nothing.

## A minimal honest checkout

A checkout endpoint does not have to support instant payment to be real. The ACP checkout session carries a status field, and one of its values is not_ready_for_payment. A site that sells through a written quote can create a genuine session, return it in that state, and attach a message that the engagement is confirmed in writing first. The agent receives a well-formed session that reflects how the business actually works, and the discovery claim holds because the endpoint behind it answers.

## Publish what is true

These surfaces exist so an agent can act without guessing, which only holds when every claim resolves to something real. A card whose skills lead nowhere breaks the same way a checkout that never responds does, because the agent follows the signal and finds nothing. Publish what is true, and back each declaration with a surface that answers.

turva.dev publishes an A2A Agent Card, an AP2 merchant declaration, and an ACP discovery document, and an independent scanner verifies that those documents are published. The checkout endpoint behind the discovery document answers as well, which is the part the scanner does not read. For an audit of a site's agent commerce surface, contact info@turva.dev.

## Frequently asked

**What is an A2A Agent Card?**

An A2A Agent Card is a JSON file, usually at /.well-known/agent-card.json, that describes an agent interface, including its name, version, transport, and the skills it offers, so another agent can discover it and know how to reach it.

**What is the correct AP2 extension URI?**

AP2 support is declared as an extension inside the A2A Agent Card, using the URI https://github.com/google-agentic-commerce/ap2/tree/v0.1 (lowercase, version v0.1). Some fix texts show a V0.1.0 form with a capital V and an extra .0, which validators reject.

**Why does an AP2 declaration fail validation?**

Usually the case of the extension URI. Some fix texts show a V0.1.0 form with a capital V and an extra .0, which validators reject. The accepted form is lowercase and v0.1.

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

Agent-readiness is the measurable starting point, scored by an independent scanner. The wider work is the data those agents depend on and the decisions you let them make. Both are measured before they are promised.

100/100 and Level 5, Agent-Native, on isitagentready.com, Cloudflare's agent-readiness scanner. Business ID 3600281-7, registered in Finland.

## Audits, advisory, and implementation for product teams

An AI agent does not browse a site the way a person does. It reads machine-readable surfaces and acts on the parts it can reach, once it trusts what it found. I measure how a site, an API or a product holds up to that, fix what the measurement names, and stay on as the product changes.

The measurable core is agent-readiness, scored by an independent scanner and provable on the next scan. The wider work begins where readability ends. The data an agent acts on has to arrive intact, and the decisions it is allowed to make have to sit inside a boundary you set. The first makes an agent able to read you. The second makes it safe to let one act.

## Two fixed-scope ways to start

Both diagnoses are bought at a fixed price against a written scope. Neither one requires the other.

- [Shopify agent storefront check](/shopify-agent-storefront-check). €1,900. One live Shopify store, read across the three agent surfaces this check covers, delivered in 48 hours.
- [Agent-readiness audit](/services). €4,300. A whole site or API, measured by an independent scanner, delivered in two weeks.

What follows a diagnosis is scoped separately, and that work is listed on the [services page](/services).

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

turva.dev is my own reference build. It reaches 100/100 and Level 5, Agent-Native, on isitagentready.com. Measured 2026-08-20.

- isitagentready.com: 100/100, Level 5 (Agent-Native). https://isitagentready.com/

isitagentready.com is Cloudflare's agent-readiness scanner, and this site runs on Cloudflare Workers. Independent means independent of turva.dev: the scanner is not run or influenced by this business. Commerce here is quote-on-request. turva.dev declares its payable services in the 402 challenge, priced in USDC on Base via x402, and in the OpenAPI discovery, priced in euro as a card checkout link, and settlement is confirmed out of band rather than executed automatically, so the site serves a real payment surface and claims no capability it does not have.

The agent-readiness scanner is public and can be run again at any time, by a person or by an agent. The scanner is the source. This page only reports what it returned. To check the number independently, run isitagentready.com against turva.dev.

turva.dev publishes its own security scans too, on the same principle that the result should be measurable rather than asserted. Measured 2026-08-28.

- Hardenize: all 24 categories passed. https://www.hardenize.com/report/turva.dev
- Internet.nl website test: 98/100. IPv6, DNSSEC and RPKI pass in full. The single deduction is one HTTPS sub-test, the hash function for key exchange. https://internet.nl/site/turva.dev/
- Internet.nl email test: 95/100. IPv6, DNSSEC, and DMARC with DKIM and SPF pass in full, as does RPKI. The deduction is in the cipher configuration of the receiving mail servers, which my mail provider operates. https://internet.nl/mail/turva.dev/

The Cloudflare Worker that produces these results is open source: https://github.com/erekola/turva-worker. You can read every line before you hire me.

Backed by a registered business, publicly verifiable: Business ID 3600281-7, registered in Finland. PRH/YTJ business register: https://tietopalvelu.ytj.fi/yritys/3600281-7

## The process has three stages and no surprises

First, measurement. For agent-readiness, an independent scanner reads the current state of the site or API and produces a numeric baseline with a categorized list of what is missing. For the wider work, the data path and the decision envelope are tested the way an agent would hit them, so the starting point is a fact rather than an opinion.

Then a written report. Three to ten priority fixes in order of impact, with technical reasoning written so the reader does not need a background in any of this to follow it.

Then the fixes. I implement them, or your engineering team does the work with the report as the spec. Both routes are supported and the choice is yours.

All communication runs async. No calls and no calendar links. Live meetings are not part of how this work is done. Short questions go through Signal, longer documents through email. Everything stays in writing, which means the work and the trail are auditable end-to-end.

Production credentials are not requested. Write access to repositories is not taken by default. Read access is enough for the audit, and write access is scoped per task if implementation is purchased separately.

The result is checkable, not asserted. For agent-readiness that is the scanner number, higher on the next scan in the categories and by the dates the report named. For the wider work it is the same test, the data path holding under load and the envelope doing exactly what it claims. Either the next measurement confirms it or it does not.

## Services

- Shopify agent storefront check. €1,900. Fixed scope. What an AI shopper receives from one live Shopify store, across browser WebMCP, remote MCP and Agentic channels. Four written deliverables in 48 hours, and a retest within 14 days.
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

Agent-readiness is a measurable property of a site, an API, or a product surface. It describes how well AI agents can discover, read, and operate it.

**How much does it cost?**

Prices (EUR, VAT not included): Shopify agent storefront check €1,900 fixed price, Audit €4,300 fixed price, Advisory €3,000/month (minimum 3 months), Implementation €1,500/day scoped per task. Final price is confirmed in writing after scope is agreed.

**Do I need to share production credentials?**

No. Production credentials are not requested. Read access is enough for the audit.

**Will you sign an NDA?**

Yes. Send your own and it is signed as it stands before any material moves, at no charge. Client material is deleted within thirty days of the engagement closing, unless retention is required by law.

**Are there calls or video meetings?**

No. Engagement is async-only. No calls and no calendar links at any stage.

**How long does the audit take?**

The audit is fixed scope, two weeks.

**Can our engineering team implement the fixes?**

Yes. The audit report is the spec. Either I implement or your team does the work with the report as the spec.

**How is the result verified?**

The result shows up in scanner numbers. The next scan reads higher than the previous one in the categories the report named.

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

  "/services": `# Two fixed-scope diagnoses, and the work that follows

Async-only. One business day response. All prices exclude VAT.

Two of these are diagnoses you can buy on their own, each at a fixed price and a fixed scope. The Shopify agent storefront check reads one live Shopify store, the audit reads a whole site or API, and neither one requires the other. Everything after them is the work a diagnosis identifies, scoped separately.

## Shopify agent storefront check

**€1,900. 48 hours. Fixed scope.**

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
- Implementation of the corrections, which is a separate engagement
- A penetration test, or any Shopify, MCP, WebMCP or UCP certification
- A test order, because the cart lifecycle stops before payment

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
- One round of written follow-up questions

How it is measured:
- Every agent-readiness check an independent scanner runs, recorded per
  check rather than as one headline number
- A fixed question set put to several answer engines, recording whether
  they name your site when asked about your category rather than by name
- Your published web security scans, so the report rests on measurements
  you can re-run yourself

What you do not get:
- Calls or meetings
- Implementation of the fixes (separate engagement)
- Ongoing monitoring (separate engagement)

Levels move with the check set. The same site can read Level 1 on a full
run and Level 2 on a narrower one, so the report names the checks that
failed and what each one costs to fix, and leaves the headline number out
of it.

Large sites are covered in full. If a site is big enough that the
live checks reach a tool quota, the quota is raised rather than the
coverage reduced. Once the audit is complete, the fixes it lists are
typically about a day of implementation work, whether your team does them or I do. That figure is an estimate scoped to the findings this audit lists, not a fixed quote, and the audit is what identifies that work and orders it by impact.

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

**€1,500 per day. Scoped per task.**

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

An agent readiness audit measures how well AI agents can discover, read, and act on your website or API. turva.dev runs an independent scanner, isitagentready.com, reviews the agent-facing surfaces manually, checks how AI assistants currently retrieve and answer about the site, and delivers a written report with fixes ranked by score impact and implementation cost.

**What does an agent readiness audit cost?**

The Shopify agent storefront check is €1,900, fixed scope, delivered in 48 hours. The audit is €4,300, fixed scope, delivered in two weeks. Ongoing advisory is €3,000 per month with a three month minimum, and implementation is €1,500 per day, scoped per task. All prices exclude VAT. Agent operations and MCP server design engagements are priced on request.

**How is the audit delivered?**

Everything is async. There are no calls or meetings, findings and answers move in writing, and questions get a response within one business day. The audit ends in a written report your team can act on directly, with one round of written follow-up questions included.

**How is agent readiness measured?**

With an independent public scanner rather than self-assessment. isitagentready.com grades sites on a Level 0 to 5 scale and scores agent readiness out of 100. The audit runs it against your site, so the result is reproducible and the same scan can verify every fix afterwards.

**Do I need the audit before the Shopify agent storefront check?**

No. The two are separate fixed-scope diagnoses and either can be bought on its own. The audit measures a whole site or API against agent-readiness norms. The Shopify check measures what an AI shopper receives from one live Shopify store, across the three agent surfaces this check covers.

**How much work are the fixes after the audit?**

In most cases, once the audit is complete, the fixes it lists are about a day of implementation work. That figure is an estimate scoped to the findings the report lists, not a fixed quote. Your team can do them with the report as the spec, or turva.dev implements them as a scoped engagement.

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

For D2C Shopify stores that want evidence of what an AI shopper actually receives. €1,900 plus VAT, fixed scope, delivered in 48 hours from a written kickoff.

Shopify stores now meet shopping agents through three separate interfaces. They are related, and an agent does not always get the same answer from each. This check tests one live store across all of them and reports what an agent receives on each, with the evidence attached.

A general agent-readiness audit is not a prerequisite. This check stands on its own, and it is not a step inside the audit.

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

Implementation of the corrections is not included. Your team can act on the plan directly, or the corrections can be bought separately as implementation days.

## Price and timing

**€1,900 plus VAT. Fixed scope. 48 hours.**

The 48-hour clock starts at the agreed written kickoff, once the preflight, payment and merchant evidence are complete. No response is required from you during the delivery window.

If the public preflight cannot establish an observable agent-commerce surface suitable for controlled testing, the engagement is not sold and nothing is invoiced.

If the 48-hour package of four deliverables is not sent within 48 elapsed hours, the fee is refunded. The retest is the fifth deliverable. It runs on its own 14-day window.

All work is asynchronous and delivered in writing.

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

A synthetic sample report is available on request. It uses invented store data. It shows the format of the three-surface map, the product truth matrix and the correction plan, and it is not a report on a real merchant.

## Frequently asked

**Do I need an agent-readiness audit first?**

No. The Shopify agent storefront check is a separate fixed-scope diagnosis with its own price and its own deliverables. The general audit measures a whole site or API against agent-readiness norms, this check measures what an AI shopper receives from one Shopify store.

**What does it cost, and what is the delivery time?**

€1,900 plus VAT, fixed scope. Four written deliverables arrive as one package within 48 elapsed hours of the agreed written kickoff. The fifth is a retest of up to two corrected items, within 14 days.

**Do you need access to my Shopify Admin?**

No. No Shopify Admin password is requested and no credentials are handled. Settings evidence comes from you as redacted screenshots or a short screen recording, and everything else is read from public storefront surfaces.

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

Terms last updated: 2026-08-11.
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
`,
  "/guides": `# Agent-readiness guides

These short guides explain, in plain language, what makes a website or an API easy for AI agents to read and use. Each one covers a single topic and takes a few minutes to read. They are free, and they cover the same surfaces an [agent-readiness audit](/services) measures.

The first guide explains what an agent-readiness audit is.

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

The result is a list. Each check passes or fails, and each failure comes with a concrete fix. The point is that the outcome is verifiable. An independent scanner reads the site before and after, and the categories that were fixed read higher on the next scan. The claim is the number, not an assertion.

turva.dev applies the same standard to its own site. Measured by an independent scanner, turva.dev reaches 100/100 and Level 5, Agent-Native, on isitagentready.com. Measured 2026-08-20. That is one scan on one day, and the scanner's check set moves, so a scan run today is a new measurement rather than a confirmation of this one. The audit a client receives runs the same checks against their site.

For an audit, contact info@turva.dev. Engagement is async and evidence-based, and production credentials are not requested.

## Frequently asked

**What is an agent-readiness audit?**

An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API. It is a technical review of the surfaces automated clients use, scored against current standards rather than opinion.

**What does an agent-readiness audit check?**

It checks the surfaces an agent reaches first, covering discoverability, content accessibility, bot access control, API/auth/MCP and A2A discovery, and commerce. Each check passes or fails, and each failure comes with a concrete fix an independent scanner can verify before and after.

**What does an agent-readiness audit produce?**

A pass or fail on each check, and a concrete fix for every failure that an independent scanner can verify before and after. The result is scored against current standards rather than opinion.

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

Whether a site needs one depends on whether it wants to be legible to agents. If buyers, researchers, or assistants will ever ask a model about what the site does, a clear llms.txt raises the odds that the model reads the real content rather than guessing from a cached snippet.

Check any site's llms.txt structure with the free validator at https://turva.dev/llms-txt-validator.

turva.dev publishes llms.txt and llms-full.txt, serves markdown on request, and publishes the markdown version of every page at its own .md address with both v2 link relations. For an audit of how legible a site is to agents, contact info@turva.dev.

## Frequently asked

**What is llms.txt?**

llms.txt is a plain text file that tells AI agents and language models what a site contains and where the important content lives. It sits at the root of a site or at any path inside it, where it covers the pages under that path. It does not replace robots.txt or a sitemap, it complements them.

**Does llms.txt help with search ranking?**

No. llms.txt is not a ranking trick. It gives models a curated map of the content so they read the real page rather than guessing from a cached snippet.

**What does an llms.txt file contain?**

The site name and a short summary, then the key pages and resources as markdown links, often grouped under headings. Some sites also publish llms-full.txt, which bundles the full text so an agent can read everything in one request.

**What changed in v2 of llms.txt?**

The file format did not change. v2 added two standard link relations so an agent finds a page's markdown version and its llms.txt without guessing, accepted page.md alongside page.html.md as the address of a markdown version, defined what an llms.txt in a subpath covers, and dropped the context expansion tooling along with the mechanical meaning of the Optional section.

## Related

- [Serving markdown to agents](/guides/markdown-for-agents)
- [How to get your site cited by AI assistants](/guides/get-cited-by-ai-assistants)
- [Agent-readiness, AEO and GEO: how they relate](/guides/agent-readiness-aeo-geo)
`,

  "/guides/mcp-server-card": `# MCP server cards explained

An MCP server card is a small JSON file that describes a site's Model Context Protocol server so an agent can find it and learn what it offers. Deployed cards, turva.dev's among them, commonly sit at /.well-known/mcp/server-card.json. SEP-2127, the open proposal behind the card, now develops it as an experimental MCP extension. As of August 2026 its draft reserves a different default, the MCP endpoint URL followed by /server-card, and it does not recommend a /.well-known path for the card itself. Site-level discovery sits in the Agentic Resource Discovery catalog at /.well-known/ai-catalog.json instead, so the convention is still moving. An agent reads the card, finds the endpoint, and can then connect without a human wiring up the connection first.

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
`,

  "/guides/x402-agent-payments": `# x402 and agent payments

x402 is a way for a site to ask an agent to pay before it returns a resource, using the long-reserved HTTP 402 Payment Required status. It lets an automated client discover a price, pay, and continue, without a human stepping in to enter card details.

When an agent requests a paid resource, the server responds with 402 and a manifest that states what is being sold and how to pay. The agent reads the terms, signs a payment payload for a supported method, and retries the request with the payload attached. The server or its facilitator then settles the payment. The transaction happens in the protocol, not in a checkout page built for human eyes.

This matters because agent commerce is held back by payment, not by capability. An agent can find a product and compare options, then stall at a checkout flow designed for a person with a browser. A declared payment surface such as x402, paired with structured pricing in the page data, lets the agent complete the purchase the same way it completed the search.

x402 belongs to a small family of agent payment standards, and its relationship to AP2 is worth stating precisely. They are separate specifications. AP2 defines the mandates and receipts that authorize a payment, and x402 defines an HTTP 402 payment flow that a separate extension, a2a-x402, carries into agent-to-agent work. As of August 2026 the AP2 documentation describes the two as complementary and says the alignment is ongoing, so a site treats them as protocols it may support side by side rather than as one finished stack. A site that publishes these signals tells agents that it is open for automated business, and in the case of the open peer pricelist model, it can be shown alongside other options at the moment an agent decides where to spend.

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
`,

  "/guides/response-headers-for-agents": `# Response headers that help agents

Response headers are the metadata a server sends with every page, and the right ones let an AI agent work without parsing the full HTML. They are the cheapest place to make a site more legible to automated clients, because an agent reads them before it reads the body.

A Link header can point an agent straight at a site's machine-readable resources, such as an API catalog or a markdown version of the page, so the agent finds them without crawling. A Vary header that includes Accept tells caches and agents that the site can return different formats for the same URL, which is what makes markdown content negotiation reliable. RateLimit and RateLimit-Policy headers let a well-behaved agent throttle itself instead of guessing, though as of July 2026 their IETF draft, revision 11 from May 2026, remains active without yet becoming a standard. Content-Language and a clean content type remove ambiguity about what the agent is reading.

The reason headers matter is order. An agent fetches the response, reads the status and headers first, and decides what to do next from them. If the headers already say where the structured data is and what formats are available, the agent can skip the expensive step of parsing a page built for human display.

Headers are easy to get wrong in ways that hurt agents. A missing Vary header breaks content negotiation. A Cache-Control immutable directive set on the wrong response can stop an agent from seeing an update. The fix is usually small and lives at the edge, which on turva.dev is a Cloudflare Worker that sets these headers on every response.

For an audit of a site's response and discovery surface, contact info@turva.dev.

## Frequently asked

**Which response headers help AI agents?**

A Link header points an agent at machine-readable resources such as an API catalog or a markdown version of the page. A Vary header that includes Accept makes markdown content negotiation reliable. RateLimit headers let a well-behaved agent throttle itself, and Content-Language with a clean content type removes ambiguity.

**Why do response headers matter to agents?**

An agent reads the status and headers before the body and decides what to do from them. If the headers already say where the structured data is and what formats are available, the agent can skip parsing a page built for human display.

**Which header makes markdown content negotiation reliable?**

A Vary header that includes Accept. It is what keeps the negotiation reliable when the same URL can return more than one representation of the page.

## Related

- [Serving markdown to agents](/guides/markdown-for-agents)
- [Prerendering and why agents see empty pages](/guides/prerendering-for-agents)
- [The /.well-known directory for agents](/guides/well-known-for-agents)
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
`,

  "/guides/json-ld-structured-data": `# JSON-LD and structured data for agents

JSON-LD is a block of structured data in a page that states facts in a form a machine can read without interpreting prose. It tells an agent what the page is about, who runs it, what it sells, and at what price, as data rather than as sentences an agent has to parse and might misread.

A human reads a price from a layout and a currency symbol. An agent reading raw HTML has to guess which number is the price and which is a shipping estimate. A JSON-LD Offer with a price and a currency removes the guess. The same applies to the organization behind a site, the services it offers, and the questions it answers, each expressed as a typed object an agent can rely on.

Structured data also connects a page to the wider graph an agent builds. Declared types such as Organization, Service, FAQPage, and Article let an agent place a page in context. They do not make a claim true and they oblige nobody to cite it. What they remove is parsing ambiguity, and trust and citation stay decisions of the system that reads the page.

The cost of getting it wrong is silent. An agent does not report that it failed to parse a price, it just acts on a worse guess. Clean JSON-LD is one of the cheapest ways to make a page legible, and it sits in the same family as the response headers and well-known manifests an agent reads first.

turva.dev declares JSON-LD for its organization, the person behind it, its services, and its guides, and the next scan reads the structured data as present. For an audit of a site's structured data, contact info@turva.dev.

## Frequently asked

**What is JSON-LD?**

JSON-LD is a block of structured data in a page that states facts in a form a machine can read without interpreting prose. It tells an agent what the page is about, who runs it, what it sells, and at what price, as data rather than sentences.

**Why does structured data matter for agents?**

An agent reading raw HTML has to guess which number is a price and which is a shipping estimate. A JSON-LD Offer with a price and a currency removes the guess, and declared types let an agent place a page in context. Trust and citation stay decisions of the system that reads the page.

**What should JSON-LD state on a page?**

What the page is about, who runs it, what it sells and at what price, as data rather than sentences. An Offer with a price and a currency removes the guess an agent would otherwise make.

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

## Frequently asked

**What is the /.well-known directory?**

The /.well-known directory is a standard place at the root of a site where agents look for machine-readable descriptions of what the site offers. An agent fetches a predictable path and reads a manifest that points it to everything else.

**What files do agents look for under /.well-known?**

An API catalog defined by RFC 9727, an MCP server card, OAuth metadata, payment and agent-payment manifests, and a security contact. Each one turns discovery into a lookup rather than a search.

**Why do agents use the well-known directory instead of crawling pages?**

Because it turns discovery into a lookup rather than a search. An agent fetches a predictable path and reads a manifest that points it to everything else, instead of inferring capabilities from navigation.

## Related

- [MCP server cards explained](/guides/mcp-server-card)
- [How agents authenticate](/guides/agent-authentication)
- [Sitemaps, robots.txt and agent access](/guides/sitemaps-and-robots-for-agents)
`,

  "/guides/agentic-resource-discovery": `# Agentic Resource Discovery and ai-catalog.json

Agentic Resource Discovery, or ARD, is an open specification for telling AI agents what a site offers, in one machine-readable file. Instead of inferring from pages whether a site has an MCP server, an agent interface, or an API, the site publishes a single index that names each resource and where to reach it. The specification appeared in 2026, is licensed under Apache 2.0, and builds on the AI Catalog data model maintained by a working group under the Linux Foundation.

## What it is

A site advertises its agentic resources by serving a static JSON manifest at /.well-known/ai-catalog.json. The manifest is a small envelope with a specVersion, a host block that names the operator, and an entries array. Each entry describes one resource with a stable identifier, a display name, a type, a url, and a short description. A resource can be an MCP server, an A2A agent, an API, or a skill set. The work is early: the repository that carries it calls itself a temporary working repo and its field names are still being argued in pull requests, so validate a manifest against the draft the client you care about actually reads. A registry can crawl published catalogs and answer a capability query by pointing an agent at the right resource.

## Where it sits

ARD is a discovery layer, not a transport. It helps an agent find the right resource, which the agent then calls through that resource's own protocol, whether MCP, A2A, or a plain API. Discovery comes first and invocation second. The catalog does not replace the manifests it points to, it indexes them, so a site keeps its server card, its agent card, and its OpenAPI description, and adds one file that ties them together.

## How it relates to llms.txt

An ai-catalog.json is not a ranking trick and it is not a content map. llms.txt tells an agent where a site's content lives. An ai-catalog tells an agent which agentic resources the site exposes and how to reach them. The two are complementary, and neither is about search ranking. Google has said publicly that llms.txt does not affect its search results, which is the same point agent-readiness has always made. These files are for agents that read and act.

## Why it matters

Adoption is early. In a June 2026 check I ran against their public well-known paths, none of the companies named as contributors to the specification yet served a discoverable ai-catalog.json, so publishing one now is a forward move rather than table stakes. The value is the same as every other discovery surface. A capability an agent cannot find is a capability that does not exist for that agent, and one predictable file turns a set of separate manifests into a single answer.

turva.dev serves an ai-catalog.json at /.well-known/ai-catalog.json that indexes its MCP server, its A2A agent, its API, and its agent skills, each of which already resolves on its own. For an audit of a site's discovery surface, contact info@turva.dev.

## Frequently asked

**What is an ai-catalog.json?**

An ai-catalog.json is a static JSON manifest at /.well-known/ai-catalog.json that lists the agentic resources a site offers, such as its MCP server, A2A agent, and API, each with an identifier, type, url, and description, so agents and registries can discover them from one file.

**Does Agentic Resource Discovery affect search ranking?**

No. ARD is a discovery layer for AI agents, not a search file. It indexes the resources an agent can call through their own protocols. Google has said publicly that llms.txt does not affect its search results, and the same applies to an ai-catalog.

**Where does an ai-catalog.json live?**

At /.well-known/ai-catalog.json, as a static JSON manifest. Agents and registries read the resources a site offers from that one path instead of inferring them from its pages.

## Related

- [The /.well-known directory for agents](/guides/well-known-for-agents)
- [MCP server cards explained](/guides/mcp-server-card)
- [Agent commerce discovery: A2A, AP2, and ACP](/guides/agent-commerce-discovery)
`,

  "/guides/agent-authentication": `# How agents authenticate

Agent authentication is how an automated client proves who it is and gains scoped access to a site, without a human logging in first. It is the step that turns a read-only agent into one that can act on a user's behalf, and it has to be discoverable or the agent cannot begin.

The pattern follows existing standards. OAuth discovery at a well-known path tells an agent where to request access and what scopes exist. An authorization server and a protected resource description let the agent ask for a token tied to a specific permission rather than a blanket login. When a site also advertises an agent registration flow, an agent can register and claim access on a user's behalf without someone provisioning credentials by hand.

The reason this matters is trust and blast radius. A site that exposes capability without scoped, discoverable auth either stays closed to agents or invites unsafe workarounds. Proper discovery lets an agent request the least access it needs, and lets the site grant capability without handing over a password the agent should never see.

A short auth description, sometimes published as an auth.md, gives an agent a human-readable entry point to the same flow. It is a site convention rather than a standard. The OAuth metadata documents define the machine-readable discovery and say nothing about a written page or a registration route, so an agent follows only the endpoints a site advertises for itself. Together with OAuth discovery it answers the agent's first question about any action, which is how do I get permission to do this safely.

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
`,

  "/guides/measurement-led-agent-readiness": `# Why agent-readiness should be measured, not asserted

Agent-readiness is a property you can measure, so it should be measured rather than claimed. A checklist that a team fills in by hand records intentions. An independent scanner records what an agent actually finds when it reads the site, and those two often disagree.

The difference shows up the moment something changes. A header gets dropped in a deploy, or a manifest starts returning the wrong content type. A self-assessment still reads as done, because nobody re-ticked the box. A scan reads the live site and the category drops, which is the only signal that matches what an agent experiences.

Measurement also makes a result legible to a buyer. A claim that a site is agent-ready is an assertion. A score from an independent scanner, with a category breakdown and a date, is evidence that can be checked. The honest version of the claim is the number, and the number can be re-run by anyone.

This is the standard turva.dev applies to its own site and to client sites. An audit reports the exact checks that pass or fail, each failure comes with a concrete fix, and the next scan reads higher in the categories the report named. Measured by an independent scanner, turva.dev reaches 100/100 and Level 5, Agent-Native, on isitagentready.com. Measured 2026-08-20. A later scan can read a different check set, so it is reported as a new measurement and never as a re-confirmation of the old one.

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
`,

  "/guides/sitemaps-and-robots-for-agents": `# Sitemaps, robots.txt and agent access

robots.txt and the sitemap are the oldest machine-readable files on the web, and they still decide whether an agent is allowed in and what it can find. A well-behaved agent reads robots.txt to learn the rules and the sitemap to learn the map before it reads any page. Not every client does either, so these files set the terms for the agents that follow them rather than for all traffic.

robots.txt does two jobs for agents. It sets crawl rules, and it can name AI crawlers explicitly, so a site states whether it welcomes GPTBot and similar clients rather than leaving them to guess. A Content-Signal directive can go further and declare how content may be used, separating ordinary search from AI input and training, which states a granular preference instead of an all-or-nothing block. It is a stated preference and not an enforcement mechanism, and the Content Signals documentation says plainly that some automated systems may ignore it.

The sitemap answers the other question, which is what exists. A complete sitemap lists every canonical URL, so an agent can find the real pages without inferring them from navigation. A last-modified date is optional in the sitemaps protocol and still worth publishing, because it tells a returning client what changed. The sitemap is a hint to the client rather than a guarantee that anything gets fetched. A page that is not in it is still a page an agent may never reach.

Getting these wrong is quietly expensive. A robots.txt that blocks an AI crawler by accident removes a site from that assistant's answers. A stale sitemap hides new pages. The files are small and the fix is fast, which is why they are the first thing a readiness review checks.

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
`,

  "/guides/agent-readiness-gaps": `# Common agent-readiness gaps on marketing sites

Marketing sites are often strong for people and weak for agents, and the gaps are predictable. The evidence here is one documented scan of Finnish company sites, a small and non-random sample, so read it as what recurred in the sites reviewed rather than as a count of the whole web. A readiness review tends to find the same handful of misses, each of which quietly removes the site from an agent's view.

The first is rendering. A site that builds its content with JavaScript returns an empty shell to any agent that does not run a browser, so for those clients the content never arrives in the first response. The second is discovery. No llms.txt and a thin or missing sitemap, so an agent has nothing to read but rendered pages. The third is cost. Only HTML is offered, with no markdown form, so an agent spends its budget on markup and truncates the page.

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

turva.dev prices an audit at a fixed €4,300 for a two week engagement. The Shopify agent storefront check is a separate fixed-scope diagnosis at €1,900, delivered within 48 hours of the agreed written kickoff. Advisory is €3,000 per month with a three month minimum, and implementation is €1,500 per day, scoped per task. Prices exclude VAT, and the scope is written before any payment.

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
- [The /.well-known directory for agents](/guides/well-known-for-agents)`,
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
- [What an agent-readiness audit is](/guides/agent-readiness-audit)`,
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
    "version": "3.108.5",
    "description": "Read-only metadata + payable endpoints for AI agents. MPP + x402 + ACP enabled on /api/agent/* routes.",
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
    "/.well-known/ucp": { "get": { "summary": "UCP profile", "operationId": "getUcp", "responses": { "200": { "description": "ok" } } } }
  }
}, null, 2);

var AGENT_JSON = JSON.stringify({
  "schema_version": "v1",
  "name": "turva.dev",
  "name_for_human": "turva.dev",
  "name_for_model": "turva_dev",
  "description_for_human": "Agent-readiness audits and advisory for product teams.",
  "description_for_model": "turva.dev provides agent-readiness audits and advisory for product teams. An independent scanner measures the site or API, a written report names the prioritized fixes, the next scan verifies the result. Async-only engagement. Pricing (EUR, VAT not included): Shopify agent storefront check €1,900 (fixed, 48 hours), Audit €4,300 (fixed, two weeks), Advisory €3,000/month (minimum 3 months), Implementation €1,500/day (scoped per task). Pages support Accept: text/markdown.",
  "contact_email": "info@turva.dev",
  "legal_info_url": "https://turva.dev/legal",
  "logo_url": "https://turva.dev/logo.png",
  "auth": { "type": "none" },
  "api": { "type": "openapi", "url": "https://turva.dev/openapi.json" }
}, null, 2);

// --- signed manifests (provenance) ---
var JWKS_JSON = "{\n  \"keys\": [\n    {\n      \"kty\": \"OKP\",\n      \"crv\": \"Ed25519\",\n      \"x\": \"fZpH2DFoup6FI_leaxJWrvpfP4xf8gPLjh6okbFOrJU\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"use\": \"sig\",\n      \"alg\": \"EdDSA\"\n    }\n  ]\n}";
var SIGNATURES_JSON = "{\n  \"keys\": \"https://turva.dev/.well-known/jwks.json\",\n  \"signatures\": {\n    \"/.well-known/ai-plugin.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"KGlfNizvHWJrwEcUdVkBR2NjhziGG8UEWkSmaZjuwjb5xZMA8fWDcqIJXLpK1g6cSiPde7uVd7Dj3vvQSHm7Aw\"\n    },\n    \"/.well-known/agent.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"KGlfNizvHWJrwEcUdVkBR2NjhziGG8UEWkSmaZjuwjb5xZMA8fWDcqIJXLpK1g6cSiPde7uVd7Dj3vvQSHm7Aw\"\n    },\n    \"/.well-known/mcp/server-card.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"Sso6ovs2AWzaFQ0fPF0oVmqmNson5Vc31ESTFJl68KM6ySrtxmevzcZOQOU_CXfLcJoDu7Sirc5geP8mJTWzDQ\"\n    },\n    \"/llms.txt\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"Oyh3MraE8x9nj4hAurDe_jbphmMzqCdHiUPz66LdvVXCXrsNIXfencX5k1KiHv4YSJJ7D3tmXGCNX0zXA8-VAQ\"\n    }\n  }\n}";

var MCP_SERVER_CARD = JSON.stringify({
  "$schema": "https://modelcontextprotocol.io/schemas/server-card/2025-10.json",
  "serverInfo": {
    "name": "turva-mcp",
    "title": "turva.dev",
    "version": "1.3.6",
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
      "shopify": { "price": 1900, "unit": "fixed", "duration": "48 hours" },
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
      { "name": "Shopify agent storefront check", "price": 1900, "unit": "fixed", "duration": "48 hours" },
      { "name": "Audit", "price": 4300, "unit": "fixed", "duration": "2 weeks" },
      { "name": "Advisory", "price": 3000, "unit": "month", "minimum_commitment_months": 3 },
      { "name": "Implementation", "price": 1500, "unit": "day" }
    ]
  },
  "quote_endpoint": {
    "type": "human_contact",
    "channels": [
      { "type": "email", "value": "mailto:info@turva.dev" },
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
  "version": "3.108.5",
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
      { "type": "signal", "value": "https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK" }
    ],
    "typical_response_time": "P1D",
    "languages": ["en"]
  },
  "pricing": {
    "currency": "EUR",
    "vat_included": false,
    "items": [
      { "name": "Shopify agent storefront check", "price": 1900, "unit": "fixed", "duration": "48 hours" },
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
        { "name": "Shopify agent storefront check", "price": 1900, "unit": "fixed" },
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
- **Shopify agent storefront check.** €1,900. Fixed scope, 48 hours. One live Shopify store read across browser WebMCP, Shopify-hosted Storefront and UCP MCP, and Agentic channels. Four written deliverables in 48 hours, and a retest within 14 days.
- **Audit.** €4,300. Fixed scope, two weeks. An independent scanner and a live check of how AI assistants retrieve the site (answer engine optimization, AEO), manual review, written report with prioritized fix list.
- **Advisory.** €3,000 / month. Monthly retainer, minimum 3 months. Async-only. Ongoing review, score tracking and a monthly AI-visibility delta across several AI platforms.
- **Implementation.** €1,500 / day. Scoped per task. Edge workers, MCP servers, well-known manifests, JSON-LD.
- **Agent operations.** On request. The data an agent acts on, and the decision envelope of permissions and thresholds that bounds what it is allowed to do.
- **MCP server design.** On request. Read-only discovery tools and streamable HTTP transport.

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
 return { email: 'info@turva.dev', signal: '@turva.19', signalUrl: 'https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK', linkedin: 'https://www.linkedin.com/in/erikrekola/', businessId: '3600281-7', language: 'en', engagement: 'async-only' };
 }
 },
 {
 name: 'get_services',
 description: 'Return the services offered by turva.dev (Shopify agent storefront check, audit, advisory, implementation, agent operations, MCP server design). Fixed prices in EUR for the Shopify agent storefront check, audit, advisory and implementation.',
 inputSchema: { type: 'object', properties: {} },
 execute: async function() {
 const r = await fetch('/services', { headers: { Accept: 'text/markdown' } });
 return { markdown: await r.text(), pricing: { currency: 'EUR', vatIncluded: false, shopify: { price: 1900, unit: 'fixed' }, audit: { price: 4300, unit: 'fixed' }, advisory: { price: 3000, unit: 'month', minimumCommitmentMonths: 3 }, implementation: { price: 1500, unit: 'day' } } };
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

var SITEMAP_LASTMOD = "2026-08-28";
var SITEMAP_ENTRIES = [
  ["/", "weekly", "1.0"],
  ["/services", "monthly", "0.9"],
  ["/shopify-agent-storefront-check", "monthly", "0.9"],
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
  ["/blog/measuring-the-ai-patch-surge", "monthly", "0.6"],
  ["/blog/agent-secret-hygiene", "monthly", "0.6"],
  ["/blog/agent-readiness-finnish-b2b", "monthly", "0.6"],
  ["/blog/honesty-and-the-checker", "monthly", "0.6"],
  ["/blog/enforcing-the-rate-limit-i-advertised", "monthly", "0.6"],
  ["/blog/re-checking-the-guides", "monthly", "0.6"],
  ["/blog/cheaper-pages-revisited", "monthly", "0.6"],
  ["/blog/moving-source-to-codeberg", "monthly", "0.6"],
  ["/blog/free-llms-txt-validator", "monthly", "0.6"],
  ["/blog/agent-access-is-now-a-setting", "monthly", "0.6"],
  ["/blog/open-knowledge-format", "monthly", "0.6"],
  ["/blog/publishing-an-ai-catalog", "monthly", "0.6"],
  ["/blog/cheaper-pages-for-agents", "monthly", "0.6"],
  ["/blog/moving-off-prerender", "monthly", "0.6"],
  ["/blog/owning-your-fediverse-identity", "monthly", "0.6"],
  ["/blog/reliable-agent-decisions", "monthly", "0.6"],
  ["/blog/agent-readiness-code-hosts", "monthly", "0.6"],
  ["/blog/cheating-to-keep-the-old-price", "monthly", "0.6"],
  ["/blog/i-thought-it-was-a-small-job", "monthly", "0.6"],
  ["/blog/my-gate-could-not-see-a-sixth", "monthly", "0.6"],
  ["/blog/red-reading-that-measured-my-own-client", "monthly", "0.6"],
  ["/blog/checks-that-pass-for-the-wrong-reason", "monthly", "0.6"],
  ["/blog/finishing-the-optional-commerce-checks", "monthly", "0.6"],
  ["/blog/the-twin-is-the-page", "monthly", "0.6"],
  ["/blog/verifiable-agent-identity", "monthly", "0.6"],
  ["/badge", "monthly", "0.5"],
  ["/llms-txt-validator", "monthly", "0.6"],
  ["/tools", "monthly", "0.6"],
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

var CANONICAL_PATHS = new Set(["/", "/services", "/company", "/contact", "/legal", "/guides", "/guides/agent-readiness-audit", "/guides/llms-txt", "/guides/mcp-server-card", "/guides/agents-json", "/guides/x402-agent-payments", "/guides/response-headers-for-agents", "/guides/seo-vs-agent-readiness", "/guides/json-ld-structured-data", "/guides/well-known-for-agents", "/guides/agent-authentication", "/guides/measurement-led-agent-readiness", "/guides/prerendering-for-agents", "/guides/sitemaps-and-robots-for-agents", "/guides/markdown-for-agents", "/guides/agent-readiness-gaps", "/guides/choosing-an-agent-readiness-audit", "/guides/get-cited-by-ai-assistants", "/blog", "/blog/agent-access-is-now-a-setting", "/blog/cheaper-pages-for-agents", "/blog/moving-off-prerender", "/guides/agent-commerce-discovery", "/blog/owning-your-fediverse-identity", "/blog/reliable-agent-decisions", "/blog/verifiable-agent-identity", "/guides/agent-readiness-aeo-geo", "/guides/agentic-commerce-readiness", "/guides/letting-agents-act-on-data", "/guides/ai-agent-use-cases", "/guides/open-knowledge-format", "/blog/open-knowledge-format", "/guides/agentic-resource-discovery", "/blog/publishing-an-ai-catalog", "/badge", "/llms-txt-validator", "/blog/free-llms-txt-validator", "/blog/moving-source-to-codeberg", "/blog/cheaper-pages-revisited", "/blog/re-checking-the-guides", "/blog/honesty-and-the-checker", "/blog/agent-readiness-finnish-b2b", "/blog/agent-secret-hygiene", "/blog/measuring-the-ai-patch-surge", "/blog/enforcing-the-rate-limit-i-advertised", "/blog/the-twin-is-the-page", "/blog/finishing-the-optional-commerce-checks", "/blog/checks-that-pass-for-the-wrong-reason", "/blog/red-reading-that-measured-my-own-client", "/blog/i-thought-it-was-a-small-job", "/blog/my-gate-could-not-see-a-sixth", "/blog/cheating-to-keep-the-old-price", "/blog/agent-readiness-code-hosts", "/tools", "/shopify-agent-storefront-check"]);

function getCanonicalForPath(pathname) {
  if (CANONICAL_PATHS.has(pathname)) {
    return "https://turva.dev" + pathname;
  }
  return null;
}

var META_BY_PATH = {
  "/blog/agent-readiness-code-hosts": {
    title: "I scanned fourteen code hosts. Not one served an MCP server card. | turva.dev",
    description: "Fourteen code host surfaces scanned with an independent scanner on one day. Not one served an MCP server card, and the highest reading was Level 1 of 5.",
    date: "2026-08-22",
    image: "/og-agent-readiness-code-hosts.jpg",
    imageAlt: "turva.dev blog card: Fourteen code host surfaces scanned with an independent scanner on one day. Not one served an MCP server card, and the highest reading was Level 1 of 5.",
  },
  "/blog/cheating-to-keep-the-old-price": {
    title: "It would be cheating to keep the old price | turva.dev",
    description: "The audit drops to 4,300 euros and two weeks. The part a client paid for twice is now a written checklist.",
    date: "2026-08-21",
    image: "/og-cheating-to-keep-the-old-price.jpg",
    imageAlt: "turva.dev blog card: The audit drops to 4,300 euros and two weeks. The part a client paid for twice is now a written checklist.",
  },
  "/blog/i-thought-it-was-a-small-job": {
    title: "I thought it was a small job | turva.dev",
    description: "I read my own workspace file by file. Seven days, 367 findings across 2 307 text files, and nothing billable shipped that week.",
    date: "2026-08-16",
    image: "/og-i-thought-it-was-a-small-job.jpg",
    imageAlt: "turva.dev blog card: I read my own workspace file by file. Seven days, 367 findings across 2 307 text files, and nothing billable shipped that week.",
  },
  "/blog/my-gate-could-not-see-a-sixth": {
    title: "My gate could not see a sixth | turva.dev",
    description: "My gate checked five categories on six surfaces and passed a sixth on three of them. A check that asks whether these five are there is not a check of the set.",
    date: "2026-08-04",
    image: "/og-my-gate-could-not-see-a-sixth.jpg",
    imageAlt: "turva.dev blog card: My gate checked five categories on six surfaces and passed a sixth on three of them. A check that asks whether these five are there is not a check of the set.",
  },
  "/blog/red-reading-that-measured-my-own-client": {
    title: "A red reading that measured my own client | turva.dev",
    description: "My MCP server answered Method not found to the request its new revision requires, and the fault was in my request. What a compatibility lane hides.",
    date: "2026-07-30",
    image: "/og-red-reading-that-measured-my-own-client.jpg",
    imageAlt: "turva.dev blog card: My MCP server answered Method not found to the request its new revision requires, and the fault was in my request. What a compatibility lane hides."
  },
  "/blog/checks-that-pass-for-the-wrong-reason": {
    title: "The checks that pass for the wrong reason | turva.dev",
    description: "A spec release left thirteen links pointing at the living draft, and my own gate kept passing while measuring the wrong lane. The same defect twice.",
    date: "2026-07-29",
    image: "/og-checks-that-pass-for-the-wrong-reason.jpg",
    imageAlt: "turva.dev blog card: A spec release left thirteen links pointing at the living draft, and my own gate kept passing while measuring the wrong lane. The same defect twice."
  },
  "/blog/finishing-the-optional-commerce-checks": {
    title: "Finishing the optional commerce checks | turva.dev",
    description: "Taking the last two optional commerce checks, x402 and MPP, to green on isitagentready without faking settlement, and what the scanner actually probes.",
    date: "2026-07-20",
    modified: "2026-08-02",
    image: "/og-finishing-the-optional-commerce-checks.jpg",
    imageAlt: "turva.dev blog card: Taking the last two optional commerce checks, x402 and MPP, to green on isitagentready without faking settlement, and what the scanner actually probes."
  },
  "/blog/the-twin-is-the-page": {
    title: "The twin is the page | turva.dev",
    description: "Ten card pages now render their prose from the markdown twin. What the parity gate caught before it retired and the check that replaced it.",
    date: "2026-07-19",
    image: "/og-the-twin-is-the-page.jpg",
    imageAlt: "turva.dev blog card: Ten card pages now render their prose from the markdown twin. What the parity gate caught before it retired and the check that replaced it."
  },
  "/blog/enforcing-the-rate-limit-i-advertised": {
    title: "Every response promised a rate limit | turva.dev",
    description: "A site sent rate limit headers no code enforced. The fix, the measurement that proved nothing, and the draft archaeology behind the header.",
    date: "2026-07-18",
    image: "/og-enforcing-the-rate-limit-i-advertised.jpg",
    imageAlt: "Every response promised a rate limit. Nothing enforced it."
  },
  "/blog/measuring-the-ai-patch-surge": {
    title: "Measuring the AI patch surge: Microsoft's July package | turva.dev",
    description: "Microsoft said customers would see a higher volume of security updates and gave no number. Twelve months of MSRC CVRF data: the July package is 3,0 times the baseline, and the median CVE got more severe.",
    date: "2026-07-15",
    modified: "2026-07-17",
    image: "/og-measuring-the-ai-patch-surge.jpg",
    imageAlt: "Measuring the AI patch surge from MSRC data"
  },
  "/blog/agent-secret-hygiene": {
    title: "Secret hygiene when an agent works in your repo | turva.dev",
    description: "Coding agents run with your shell, so plaintext secrets on disk are exposed to them. Move git auth to a credential manager and the rest into an OS-encrypted vault.",
    date: "2026-07-12",
    image: "/og-agent-secret-hygiene.jpg",
    imageAlt: "turva.dev blog card: Coding agents run with your shell, so plaintext secrets on disk are exposed to them."
  },
  "/blog/agent-readiness-finnish-b2b": {
    title: "Agent-readiness of Finnish B2B sites | turva.dev",
    description: "I ran an independent scanner over sixteen Finnish B2B sites. Almost every one landed at isitagentready Level 1 of 5, and the same three gaps showed up almost everywhere.",
    date: "2026-07-07",
    modified: "2026-07-17",
    image: "/og-agent-readiness-finnish-b2b.jpg",
    imageAlt: "turva.dev blog card: I ran an independent scanner over sixteen Finnish B2B sites. Almost every one landed at isitagentready Level 1 of 5, and the same three gaps showed up almost everywhere."
  },
  "/blog/honesty-and-the-checker": {
    title: "When honesty and the checker disagree | turva.dev",
    description: "Making this site's auth.md cleaner made the scanner fail. The honest form was the precise one, neither gutted nor padded to please the check.",
    date: "2026-07-06",
    image: "/og-honesty-and-the-checker.jpg",
    imageAlt: "turva.dev blog card: Making this site's auth.md cleaner made the scanner fail. The honest form was the precise one, neither gutted nor padded to please the check."
  },
  "/blog/re-checking-the-guides": {
    title: "Four AI agents re-checked the guides | turva.dev",
    description: "Four AI agents re-read the guides against the specifications behind them. One high finding, one expired draft, six small fixes. The scanners never noticed.",
    date: "2026-07-04",
    modified: "2026-07-16",
    image: "/og-re-checking-the-guides.jpg",
    imageAlt: "turva.dev blog card: Four AI agents re-read the guides against the specifications behind them."
  },
  "/blog/cheaper-pages-revisited": {
    title: "The page grew, the agent bill did not | turva.dev",
    description: "The site kept growing after June's token-cost post. The 4 July scan reports an 83% token saving between the HTML and markdown forms.",
    date: "2026-07-04",
    image: "/og-cheaper-pages-revisited.jpg",
    imageAlt: "turva.dev blog card: The site kept growing after June's token-cost post. The 4 July scan reports an 83% token saving between the HTML and markdown forms."
  },

  "/blog/moving-source-to-codeberg": {
    title: "Moving the source from GitHub to Codeberg | turva.dev",
    description: "GitHub's spam filter silently hid this site's source from everyone but its owner for two weeks. The log of the 404s, the fix, and the move to Codeberg.",
    date: "2026-07-04",
    modified: "2026-07-26",
    image: "/og-moving-source-to-codeberg.jpg",
    imageAlt: "turva.dev blog card: GitHub's spam filter silently hid this site's source from everyone but its owner for two weeks."
  },
  "/blog/free-llms-txt-validator": {
    title: "A free llms.txt validator | turva.dev",
    description: "turva.dev now has a free llms.txt validator: structure checks against the format, JSON output for agents, nothing stored.",
    date: "2026-07-02",
    image: "/og-free-llms-txt-validator.jpg",
    imageAlt: "turva.dev blog card: turva.dev now has a free llms.txt validator: structure checks against the format, JSON output for agents, nothing stored."
  },
  "/tools": {
    title: "Free agent-readiness tools | turva.dev",
    description: "Three free tools: an llms.txt validator with JSON output, an embeddable agent-ready badge, and a public read-only MCP server. No signup, agent-friendly.",
    image: "/og-tools.jpg",
    imageAlt: "turva.dev tools card: the free llms.txt validator, the agent-ready badge and the public MCP server, each usable by a person or by an agent."
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
    imageAlt: "turva.dev badge card: the embeddable agent-ready badge, a self-declared claim against public criteria that anyone can re-check by running the same scanner."
  },
  "/blog": {
    title: "Blog: notes on AI agents and agent-readiness | turva.dev",
    description: "Notes on AI agents and the work of letting them read a site and act on a system safely. Dated entries, checked against an independent scanner.",
    image: "/og-blog.jpg",
    imageAlt: "turva.dev blog card: dated notes on AI agents and the work of letting them act."
  },
  "/blog/cheaper-pages-for-agents": {
    title: "What an agent pays to read your site | turva.dev",
    description: "An agent pays to read your site in tokens, and an HTML-only page is expensive. How markdown content negotiation cuts that cost.",
    date: "2026-06-26",
    image: "/og-cheaper-pages-for-agents.jpg",
    imageAlt: "turva.dev blog card: An agent pays to read your site in tokens, and an HTML-only page is expensive."
  },
  "/blog/verifiable-agent-identity": {
    title: "When an agent can prove it is Claude | turva.dev",
    description: "Web Bot Auth gives an AI agent a verifiable, signed identity a site can check. What the tag is, where Claude stands today, and how agent-readiness uses it.",
    date: "2026-06-25",
    image: "/og-verifiable-agent-identity.jpg",
    imageAlt: "turva.dev blog card: Web Bot Auth gives an AI agent a verifiable, signed identity a site can check."
  },
  "/blog/reliable-agent-decisions": {
    title: "What makes an AI agent's decisions reliable | turva.dev",
    description: "What makes an AI agent act correctly: data that arrives intact, and an envelope of settings that defines what it may do.",
    date: "2026-06-22",
    image: "/og-reliable-agent-decisions.jpg",
    imageAlt: "turva.dev blog card: What makes an AI agent act correctly: data that arrives intact, and an envelope of settings that defines what it may do."
  },
  "/blog/moving-off-prerender": {
    title: "Moving turva.dev off prerender.io | turva.dev",
    description: "The turva.dev homepage now renders finished HTML in a Cloudflare Worker at the edge, with no prerender.io hop. Verified 100/100 Level 5 by an independent scanner.",
    date: "2026-06-20",
    image: "/og-moving-off-prerender.jpg",
    imageAlt: "turva.dev blog card: The turva.dev homepage now renders finished HTML in a Cloudflare Worker at the edge, with no prerender.io hop."
  },
  "/guides/agent-commerce-discovery": {
    title: "Agent commerce discovery: A2A, AP2, and ACP | turva.dev",
    description: "A2A Agent Card, AP2 and ACP explained: what each agent commerce discovery surface is, where it lives, and backing a claim with a real endpoint.",
    image: "/og-guide-agent-commerce-discovery.jpg",
    imageAlt: "turva.dev guide card: A2A Agent Card, AP2 and ACP explained: what each agent commerce discovery surface is, where it lives, and backing a claim with a real endpoint."
  },
  "/blog/owning-your-fediverse-identity": {
    title: "Owning your fediverse identity | turva.dev",
    description: "Why turva.dev put its fediverse handle on its own domain: a single-user instance, a domain split, and rel=me verification from the Worker.",
    date: "2026-06-21",
    image: "/og-owning-your-fediverse-identity.jpg",
    imageAlt: "turva.dev blog card: Why turva.dev put its fediverse handle on its own domain: a single-user instance, a domain split, and rel=me verification from the Worker."
  },
  "/guides/agentic-resource-discovery": {
    title: "Agentic Resource Discovery and ai-catalog.json | turva.dev",
    description: "Agentic Resource Discovery explained: what an ai-catalog.json is, how it differs from llms.txt, and where it sits before MCP, A2A and API invocation.",
    image: "/og-guide-agentic-resource-discovery.jpg",
    imageAlt: "turva.dev guide card: Agentic Resource Discovery explained: what an ai-catalog.json is, how it differs from llms.txt, and where it sits before MCP, A2A and API invocation."
  },
  "/guides/open-knowledge-format": {
    title: "Open Knowledge Format (OKF) explained | turva.dev",
    description: "What the Open Knowledge Format is: Google Cloud's open markdown spec for giving AI agents context, and where it fits agent-readiness.",
    image: "/og-guide-open-knowledge-format.jpg",
    imageAlt: "turva.dev guide card: What the Open Knowledge Format is: Google Cloud's open markdown spec for giving AI agents context, and where it fits agent-readiness."
  },
  "/blog/agent-access-is-now-a-setting": {
    title: "Agent access is now a setting | turva.dev",
    description: "Cloudflare moves crawler access, citation payment and x402 rails into CDN configuration. What that changes for agent readiness.",
    date: "2026-07-02",
    image: "/og-agent-access-is-now-a-setting.jpg",
    imageAlt: "turva.dev blog card: Cloudflare moves crawler access, citation payment and x402 rails into CDN configuration."
  },
  "/blog/publishing-an-ai-catalog": {
    title: "Publishing an ai-catalog.json for agentic discovery | turva.dev",
    description: "Google and a Linux Foundation group published Agentic Resource Discovery in 2026. turva.dev now serves an ai-catalog.json indexing its agent surfaces.",
    date: "2026-06-29",
    image: "/og-publishing-an-ai-catalog.jpg",
    imageAlt: "turva.dev blog card: Google and a Linux Foundation group published Agentic Resource Discovery in 2026."
  },
  "/blog/open-knowledge-format": {
    title: "What the Open Knowledge Format is, and what it is not | turva.dev",
    description: "Google Cloud shipped the Open Knowledge Format. What it is, what it is not yet, and how it relates to an agent-readiness audit.",
    date: "2026-06-27",
    image: "/og-open-knowledge-format.jpg",
    imageAlt: "turva.dev blog card: Google Cloud shipped the Open Knowledge Format. What it is, what it is not yet, and how it relates to an agent-readiness audit."
  },
  "/": {
    title: "Agent-readiness audits and advisory · turva.dev",
    description: "Agent-readiness audits and advisory for product teams, and the wider work wherever AI agents read data and make decisions. Independent, measured, async-only.",
    imageAlt: "turva.dev: 100/100 and Level 5, Agent-Native, on isitagentready.com"
  },
  "/services": {
    title: "Services: two fixed-scope diagnoses and four more · turva.dev",
    description: "Shopify agent storefront check €1,900 in 48 hours. Agent-readiness audit €4,300. Advisory €3,000/month, implementation €1,500/day. Two more on request.",
    image: "/og-services.jpg",
    imageAlt: "turva.dev services card: the Shopify agent storefront check €1,900, the audit €4,300, advisory €3,000 per month, implementation €1,500 per day, and two more on request."
  },
  "/shopify-agent-storefront-check": {
    title: "Shopify agent storefront check, €1,900 · turva.dev",
    description: "What an AI shopper receives from one live Shopify store, tested across browser WebMCP, remote MCP and Agentic channels. €1,900, fixed scope, 48 hours.",
    image: "/og-shopify-agent-storefront-check.jpg",
    imageAlt: "turva.dev product card: the Shopify agent storefront check, €1,900, four written deliverables within 48 hours, across three agent surfaces."
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
    title: "Agent-readiness guides | turva.dev",
    description: "Short, focused guides on the surfaces that make a website or API readable and usable by AI agents. Audits, llms.txt, MCP, structured data, payments and more.",
    image: "/og-guides.jpg",
    imageAlt: "turva.dev guides card: short guides on the surfaces that make a site or API readable and usable by AI agents, one surface at a time."
  },
  "/guides/agent-readiness-audit": {
    title: "What an agent-readiness audit is | turva.dev",
    description: "An agent-readiness audit measures how well AI agents can discover, read and act on a website or API, scored against current standards by an independent scanner.",
    image: "/og-guide-agent-readiness-audit.jpg",
    imageAlt: "turva.dev guide card: An agent-readiness audit measures how well AI agents can discover, read and act on a website or API, scored against current standards by an independent scanner."
  },
  "/guides/llms-txt": {
    title: "llms.txt explained | turva.dev",
    description: "llms.txt is a plain text guide that tells AI agents what a site contains and where its key content lives, and how it differs from robots.txt and sitemaps.",
    image: "/og-guide-llms-txt.jpg",
    imageAlt: "turva.dev guide card: llms.txt is a plain text guide that tells AI agents what a site contains and where its key content lives, and how it differs from robots.txt and sitemaps."
  },
  "/guides/mcp-server-card": {
    title: "MCP server cards explained | turva.dev",
    description: "An MCP server card is a JSON file that lets agents discover a site's Model Context Protocol server and connect to it. What it is and why it matters.",
    image: "/og-guide-mcp-server-card.jpg",
    imageAlt: "turva.dev guide card: An MCP server card is a JSON file that lets agents discover a site's Model Context Protocol server and connect to it."
  },
  "/guides/agents-json": {
    title: "What agents.json is | turva.dev",
    description: "agents.json declares the actions and endpoints an AI agent can use on a site, turning a readable site into an operable one. What it is and why it matters.",
    image: "/og-guide-agents-json.jpg",
    imageAlt: "turva.dev guide card: agents.json declares the actions and endpoints an AI agent can use on a site, turning a readable site into an operable one."
  },
  "/guides/x402-agent-payments": {
    title: "x402 and agent payments | turva.dev",
    description: "x402 uses HTTP 402 Payment Required so AI agents can discover a price, pay, and continue without a human checkout. How agent payments work and why they matter.",
    image: "/og-guide-x402-agent-payments.jpg",
    imageAlt: "turva.dev guide card: x402 uses HTTP 402 Payment Required so AI agents can discover a price, pay, and continue without a human checkout."
  },
  "/guides/response-headers-for-agents": {
    title: "Response headers that help agents | turva.dev",
    description: "The right HTTP response headers let AI agents work without parsing full HTML. Link, Vary, RateLimit and content type headers explained for agent-readiness.",
    image: "/og-guide-response-headers-for-agents.jpg",
    imageAlt: "turva.dev guide card: The right HTTP response headers let AI agents work without parsing full HTML."
  },
  "/guides/seo-vs-agent-readiness": {
    title: "SEO and agent-readiness are not the same | turva.dev",
    description: "SEO makes a site rank for people to click. Agent-readiness makes it legible and usable by AI agents. Ranking alone does not guarantee presence in AI answers.",
    image: "/og-guide-seo-vs-agent-readiness.jpg",
    imageAlt: "turva.dev guide card: SEO makes a site rank for people to click. Agent-readiness makes it legible and usable by AI agents."
  },
  "/guides/json-ld-structured-data": {
    title: "JSON-LD and structured data for agents | turva.dev",
    description: "JSON-LD states a page's facts as data an AI agent can read without parsing prose. How prices, organizations and services become legible to agents.",
    image: "/og-guide-json-ld-structured-data.jpg",
    imageAlt: "turva.dev guide card: JSON-LD states a page's facts as data an AI agent can read without parsing prose."
  },
  "/guides/well-known-for-agents": {
    title: "The /.well-known directory for agents | turva.dev",
    description: "The /.well-known directory is where agents look for a site's machine-readable manifests, from the API catalog (RFC 9727) to server cards and OAuth metadata.",
    image: "/og-guide-well-known-for-agents.jpg",
    imageAlt: "turva.dev guide card: The /.well-known directory is where agents look for a site's machine-readable manifests, from the API catalog (RFC 9727) to server cards and OAuth metadata."
  },
  "/guides/agent-authentication": {
    title: "How agents authenticate | turva.dev",
    description: "Agent authentication lets an automated client gain scoped access without a human login. OAuth discovery, protected resources and agent registration explained.",
    image: "/og-guide-agent-authentication.jpg",
    imageAlt: "turva.dev guide card: Agent authentication lets an automated client gain scoped access without a human login."
  },
  "/guides/measurement-led-agent-readiness": {
    title: "Why agent-readiness should be measured, not asserted | turva.dev",
    description: "A hand-filled checklist records intentions. An independent scanner records what an agent actually finds. Why measured agent-readiness beats self-assessment.",
    image: "/og-guide-measurement-led-agent-readiness.jpg",
    imageAlt: "turva.dev guide card: A hand-filled checklist records intentions. An independent scanner records what an agent actually finds."
  },
  "/guides/prerendering-for-agents": {
    title: "Prerendering and why agents see empty pages | turva.dev",
    description: "JavaScript-rendered sites return an empty shell to agents, so the content never arrives. Why prerendering and markdown delivery fix the most common agent gap.",
    image: "/og-guide-prerendering-for-agents.jpg",
    imageAlt: "turva.dev guide card: JavaScript-rendered sites return an empty shell to agents, so the content never arrives."
  },
  "/guides/sitemaps-and-robots-for-agents": {
    title: "Sitemaps, robots.txt and agent access | turva.dev",
    description: "robots.txt and the sitemap decide whether an agent is allowed in and what it can find. AI bot rules, Content Signals and complete sitemaps explained.",
    image: "/og-guide-sitemaps-and-robots-for-agents.jpg",
    imageAlt: "turva.dev guide card: robots.txt and the sitemap decide whether an agent is allowed in and what it can find."
  },
  "/guides/markdown-for-agents": {
    title: "Serving markdown to agents | turva.dev",
    description: "Serving a markdown version of a page gives agents the content without the markup, at a fraction of the tokens. How content negotiation and llms-full.txt work.",
    image: "/og-guide-markdown-for-agents.jpg",
    imageAlt: "turva.dev guide card: Serving a markdown version of a page gives agents the content without the markup, at a fraction of the tokens."
  },
  "/guides/agent-readiness-aeo-geo": {
    title: "Agent-readiness, AEO and GEO: how they relate | turva.dev",
    description: "How AEO, GEO and agent-readiness relate, what each one fixes, and how to sequence the work so you do not pay for the same fix twice.",
    image: "/og-guide-agent-readiness-aeo-geo.jpg",
    imageAlt: "turva.dev guide card: How AEO, GEO and agent-readiness relate, what each one fixes, and how to sequence the work so you do not pay for the same fix twice."
  },
  "/guides/agentic-commerce-readiness": {
    title: "Agentic commerce readiness: selling to AI shopping agents | turva.dev",
    description: "What an AI shopping agent needs to discover an offer, drive a checkout protocol and complete a purchase. Explained with A2A, AP2, ACP and x402.",
    image: "/og-guide-agentic-commerce-readiness.jpg",
    imageAlt: "turva.dev guide card: What an AI shopping agent needs to discover an offer, drive a checkout protocol and complete a purchase."
  },
  "/guides/letting-agents-act-on-data": {
    title: "Letting agents act on data: the decision envelope | turva.dev",
    description: "Letting an agent act safely depends on data that arrives intact and a decision envelope of permissions and thresholds. How to make that checkable.",
    image: "/og-guide-letting-agents-act-on-data.jpg",
    imageAlt: "turva.dev guide card: Letting an agent act safely depends on data that arrives intact and a decision envelope of permissions and thresholds."
  },
  "/guides/ai-agent-use-cases": {
    title: "AI agent use cases: where agents read data and make decisions | turva.dev",
    description: "AI agent use cases across commerce, monitoring, field support, remote operations and back-office data work, and what makes each one reliable.",
    image: "/og-guide-ai-agent-use-cases.jpg",
    imageAlt: "turva.dev guide card: AI agent use cases across commerce, monitoring, field support, remote operations and back-office data work, and what makes each one reliable."
  },
  "/guides/get-cited-by-ai-assistants": {
    title: "How to get your site cited by AI assistants | turva.dev",
    description: "What it takes to be a source AI assistants cite: readable content, structured data, corroboration, indexing where assistants search, and measurement.",
    image: "/og-guide-get-cited-by-ai-assistants.jpg",
    imageAlt: "turva.dev guide card: What it takes to be a source AI assistants cite: readable content, structured data, corroboration, indexing where assistants search, and measurement."
  },
  "/guides/choosing-an-agent-readiness-audit": {
    title: "Choosing an agent-readiness audit | turva.dev",
    description: "Who provides agent-readiness audits, what they cost, how long they take, and what you get. Pricing, deliverables, and how the engagement works.",
    image: "/og-guide-choosing-an-agent-readiness-audit.jpg",
    imageAlt: "turva.dev guide card: Who provides agent-readiness audits, what they cost, how long they take, and what you get."
  },
  "/guides/agent-readiness-gaps": {
    title: "Common agent-readiness gaps on marketing sites | turva.dev",
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
      articleMeta += `\n<meta property="article:published_time" content="${m.date}" />\n<meta property="article:modified_time" content="${m.date}" />`;
    }
  }
  const st = escapeHtml(m.title);
  // Social cards and Medium's importer read og:title, and the " | turva.dev" suffix
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

var SCHEMA_HOME = `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"ProfessionalService","@id":"https://turva.dev/#business","name":"turva.dev","url":"https://turva.dev/","image":"https://turva.dev/og.jpg","logo":"https://turva.dev/logo.png","description":"Independent agent-readiness audits and advisory for product teams. An independent scanner measures the site or API, a written report names the prioritized fixes, the next scan verifies the result. Beyond readiness, the same discipline covers the data agents act on and the decisions they are allowed to make.","priceRange":"€€€","taxID":"3600281-7","vatID":"FI36002817","email":"info@turva.dev","areaServed":{"@type":"Place","name":"Worldwide"},"address":{"@type":"PostalAddress","addressLocality":"Tampere","addressCountry":"FI"},"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"info@turva.dev","availableLanguage":["English"]},"founder":{"@id":"https://turva.dev/#person"},"sameAs":["https://tietopalvelu.ytj.fi/yritys/3600281-7","https://www.linkedin.com/in/erikrekola/","https://github.com/erekola","https://www.wikidata.org/wiki/Q140276251"]},
{"@type":"Person","@id":"https://turva.dev/#person","name":"Erik Rekola","jobTitle":"Agent-readiness consultant","worksFor":{"@id":"https://turva.dev/#business"},"sameAs":["https://www.linkedin.com/in/erikrekola/","https://github.com/erekola","https://www.wikidata.org/wiki/Q140276321","https://social.turva.dev/@erik","https://gravatar.com/erekola"]},
{"@type":"WebSite","@id":"https://turva.dev/#website","url":"https://turva.dev/","name":"turva.dev","publisher":{"@id":"https://turva.dev/#business"},"inLanguage":"en"},
{"@type":"Service","@id":"https://turva.dev/#service","name":"Agent-readiness audits and advisory","provider":{"@id":"https://turva.dev/#business"},"serviceType":"Agent-readiness consulting","areaServed":{"@type":"Place","name":"Worldwide"},"availableChannel":{"@type":"ServiceChannel","serviceUrl":"https://turva.dev/services","availableLanguage":["en"]},"offers":{"@type":"AggregateOffer","priceCurrency":"EUR","lowPrice":"1500","highPrice":"4300","offerCount":"4","availability":"https://schema.org/InStock","url":"https://turva.dev/services","priceValidUntil":"${PRICE_VALID_UNTIL}"},"hasOfferCatalog":{"@type":"OfferCatalog","name":"turva.dev services with a fixed price","itemListElement":[
{"@type":"Offer","name":"Shopify agent storefront check","description":"Fixed scope, four written deliverables within 48 hours of the agreed written kickoff and a retest within 14 days. One live Shopify store read across browser WebMCP, Shopify-hosted Storefront and UCP MCP, and Agentic channels, with a product truth matrix and a prioritised correction plan.","url":"https://turva.dev/shopify-agent-storefront-check","price":"1900","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"1900","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"€1,900 fixed price, 48 hours from the agreed written kickoff. VAT (25,5%) added per Finnish law."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Shopify agent storefront check"}},
{"@type":"Offer","name":"Audit","description":"Fixed scope, two weeks. An independent scanner runs against the site or API, plus manual review of /.well-known/ manifests, JSON-LD and head metadata. Written report with prioritized fix list.","url":"https://turva.dev/services","price":"4300","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"4300","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"€4,300 fixed price, two weeks. VAT (25,5%) added per Finnish law."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness audit"}},
{"@type":"Offer","name":"Advisory","description":"Monthly retainer, async-only. Monthly re-scan and score delta report, a monthly AI-visibility delta across several AI platforms, written review of shipped work within one business day, roadmap input. Minimum three months.","url":"https://turva.dev/services","price":"3000","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"UnitPriceSpecification","price":"3000","priceCurrency":"EUR","valueAddedTaxIncluded":false,"unitCode":"MON","unitText":"month","description":"€3,000 per month, retainer-based. Minimum three months commitment."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness advisory"}},
{"@type":"Offer","name":"Implementation","description":"Hands-on work on the fixes the audit identified, or new agent-ready infrastructure. Edge workers, MCP servers, well-known manifests, JSON-LD generators, ai.txt and llms.txt authoring.","url":"https://turva.dev/services","price":"1500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"UnitPriceSpecification","price":"1500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"unitCode":"DAY","unitText":"day","description":"€1,500 per day. Scoped per task."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Implementation work"}}
]}},
{"@type":"FAQPage","@id":"https://turva.dev/#faq","inLanguage":"en","mainEntity":[
${mdFaqBlocks("/", "Frequently asked").pairs.map((p) => `{"@type":"Question","name":${JSON.stringify(p.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(p.a)}}}`).join(",\n")}
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
    return { skill: "services", services: home.services, engagement: home.engagement };
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

var HOME_JSON = JSON.stringify({ "name": "turva.dev", "url": "https://turva.dev/", "description": "Independent agent-readiness audits and advisory for product teams. An independent scanner measures the site or API, a written report names the prioritized fixes, the next scan verifies the result. Beyond readiness, the same discipline covers the data agents act on and the decisions they are allowed to make.", "founder": "Erik Rekola", "location": { "city": "Tampere", "country": "FI" }, "businessId": "3600281-7", "email": "info@turva.dev", "signal": "https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK", "sameAs": ["https://www.wikidata.org/wiki/Q140276251", "https://www.linkedin.com/in/erikrekola/", "https://github.com/erekola", "https://tietopalvelu.ytj.fi/yritys/3600281-7"], "services": [{ "name": "Shopify agent storefront check", "price": 1900, "currency": "EUR", "unit": "fixed", "duration": "48 hours", "vatIncluded": false }, { "name": "Audit", "price": 4300, "currency": "EUR", "unit": "fixed", "duration": "2 weeks", "vatIncluded": false }, { "name": "Advisory", "price": 3000, "currency": "EUR", "unit": "month", "minimumCommitment": "3 months", "vatIncluded": false }, { "name": "Implementation", "price": 1500, "currency": "EUR", "unit": "day", "vatIncluded": false }, { "name": "Agent operations", "pricing": "on request" }, { "name": "MCP server design", "pricing": "on request" }], "engagement": "Async only. No calls, no calendar links. Reply within one business day. Fixed scope written before payment.", "useCases": ["Reading a product catalog and completing a checkout for a buyer", "Watching an API and acting when a threshold is crossed", "Guiding a field technician from the same data an expert would use", "Triaging incoming requests and resolving the routine ones", "Operating a remote system over an unreliable link", "Reconciling records across systems and flagging mismatches", "Making a time-critical decision locally when no human can respond in time"], "resources": { "guides": "https://turva.dev/guides", "llmsTxt": "https://turva.dev/llms.txt", "llmsFullTxt": "https://turva.dev/llms-full.txt", "openapi": "https://turva.dev/openapi.json", "mcp": "https://mcp.turva.dev/mcp", "apiCatalog": "https://turva.dev/.well-known/api-catalog" }, "lastVerified": "2026-08-20" }, null, 2);
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
    return /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href.trim()) ? `<a href="${href}">${label}</a>` : escapeHtml(label);
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
      const item = { "@type": "BlogPosting", "headline": pmH1 ? pmH1[1].trim() : (pm.title || "").split(" | turva.dev")[0], "url": "https://turva.dev" + k };
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
    "availableChannel": { "@type": "ServiceChannel", "serviceUrl": url, "availableLanguage": ["en"] },
    "offers": {
      "@type": "Offer",
      "url": url,
      "price": "1900",
      "priceCurrency": "EUR",
      "priceValidUntil": PRICE_VALID_UNTIL,
      "availability": "https://schema.org/InStock",
      "businessFunction": "https://schema.org/Sell",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "1900",
        "priceCurrency": "EUR",
        "valueAddedTaxIncluded": false,
        "description": "\u20ac1,900 fixed price, four written deliverables within 48 hours of the agreed written kickoff and a retest within 14 days. VAT (25,5%) added per Finnish law."
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

var FOOTER_HTML = `<footer class="tv-foot">
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
  <div class="foot-meta">Tampere, Finland · <a href="https://tietopalvelu.ytj.fi/yritys/3600281-7">Business ID 3600281-7</a> · © 2026 turva.dev</div>
</footer>`;

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
  const ev = mdParas("/", "Evidence", 6).map(mdTidyUrlText);
  const evMeasured = (ev[0].match(/Measured (\d{4}-\d{2}-\d{2})/) || [])[1] || "";
  const hpMeasured = evMeasured ? `<span class="hp-seg">&middot; measured ${evMeasured}</span>` : "";
  const evLists = mdLists("/", "Evidence").map((l) => l.map((x) => `<li>${mdTidyUrlText(x)}</li>`).join("\n      "));
  const proc = mdParas("/", "The process has three stages and no surprises", 6);
  const stepBody = (t) => t.slice(t.indexOf(". ") + 2);
  const svcCards = mdLists("/", "Services")[0].map((it) => {
    const svcName = it.split(". ")[0];
    const tag = it.includes("Fixed scope") ? "fixed scope" : it.includes("Monthly retainer") ? "monthly" : it.includes("per day") ? "per day" : "on request";
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
          <a class="btn" href="mailto:info@turva.dev?subject=Agent-readiness%20audit">Request an audit</a>
          <a class="btn-ghost" href="https://github.com/erekola/turva-worker">Read the source</a>
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
    <h2>What an agent sees on this page</h2>
    <p>Every page on this site is also served as plain markdown to any agent that asks for it, at the same URL, at a fraction of the token cost of the HTML. The block below is the opening of that markdown, generated from the same string an agent receives.</p>
    <div class="aview">
      <p class="aview-cmd">curl -H "Accept: text/markdown" https://turva.dev/</p>
      <pre><code>${escapeHtml(HOME_MARKDOWN.split("\n").slice(0, 7).join("\n") + "\n[Truncated. The full document continues in markdown.]")}</code></pre>
    </div>
    <p><a href="/guides/markdown-for-agents">How markdown content negotiation works.</a></p>
  </section>

  <section class="sec">
    <h2>Audits, advisory, and implementation for product teams</h2>
    ${mdBodyHtml("/", "Audits, advisory, and implementation for product teams")}
  </section>

  <section class="sec">
    <h2>Two fixed-scope ways to start</h2>
    ${mdBodyHtml("/", "Two fixed-scope ways to start")}
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

  <section class="sec">
    <h2>Frequently asked</h2>
    <div class="faq">
${mdFaqRows("/", "Frequently asked")}
    </div>
  </section>

  <section class="sec contact">
    <h2>Contact me</h2>
    <p>Seeing where your site, API or product stands with AI agents starts with a measured baseline, a written report, and a prioritized list of what to fix first. For agent-readiness that baseline comes from an independent scanner. For the wider work it comes from testing the data path and the decision envelope directly. Async-only engagement. No calls and no calendar links. The first reply lands in writing within one business day.</p>
    <div class="contact-card">
      <a class="ch" href="mailto:info@turva.dev"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg><span>info@turva.dev</span></a>
      <a class="ch" href="https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK"><svg viewBox="0 0 24 24" fill="none" stroke="#5DF18F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/></svg><span>Signal @turva.19</span></a>
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
  headers.append("Link", `<${markdownUrlFor(canonicalUrl)}>; rel="alternate"; type="text/markdown"`);
  return new Response(body, { status: 200, headers });
}

function serveServicesHtml(canonicalUrl) {
  const metaBlock = buildMetaBlock("/services", canonicalUrl);
  const jsonLd = buildGuideJsonLd("/services", canonicalUrl) +
    (GUIDE_PAGE_FAQ["/services"] ? "\n" + buildGuidePageFaqJsonLd("/services", canonicalUrl) : "");
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
    <div class="cta-row"><a class="cta-btn" href="mailto:info@turva.dev?subject=Agent-readiness%20audit">Request an audit</a></div>
    <p class="fine">${start[2]}</p>
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
    ? "Agent-readiness-briiffi, " + (rec.yritys || "") + ". Sama sisalto markdownina ja JSONina samasta osoitteesta."
    : "Agent readiness brief, " + (rec.yritys || "") + ". The same content as markdown and JSON at the same address.";
  var vaihtoehdot = kieli === "fi"
    ? "Sama sisalto koneluettavana: <a href=\"" + canonicalUrl + ".md\">markdown</a> ja <a href=\"" + canonicalUrl + ".json\">JSON</a>."
    : "The same content, machine readable: <a href=\"" + canonicalUrl + ".md\">markdown</a> and <a href=\"" + canonicalUrl + ".json\">JSON</a>.";
  return `<!doctype html>
<html lang="${kieli}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#0A1316" />
<meta name="robots" content="noindex, nofollow" />
<title>${escapeHtml(otsikko)}</title>
<meta name="description" content="${escapeHtml(kuvaus)}" />
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
<a class="skip" href="#main">Skip to content</a>
${cardPageNav("")}
<main id="main">
${markdownToHtml(briefUnescape(rec.md))}
<p class="date">${vaihtoehdot}</p>
</main>
${FOOTER_HTML}
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
  ${mdPageStart("/contact")}
  ${mdKvsCard("/contact", "Channels", contactSignalQr())}
  ${mdCard("/contact", "Encrypted email")}
  ${mdCard("/contact", "Response times")}
  ${mdCard("/contact", "What to include in a first message")}
  ${mdCard("/contact", "Confidentiality")}
  ${mdCard("/contact", "Geographic service area")}
  ${mdKvsCard("/contact", "Business details")}
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
  ${mdPageStart("/legal")}
  ${mdCard("/legal", "Operator")}
  ${mdTermsCard("/legal", "Terms of engagement")}
  ${mdTermsCard("/legal", "Privacy")}
  ${mdCard("/legal", "Rights under GDPR")}
  ${mdCard("/legal", "Cookies")}
  ${mdCard("/legal", "Updates")}
</main>
${FOOTER_HTML}
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
  const cta = `<div class="cta-row"><a class="cta-btn" href="mailto:info@turva.dev?subject=Shopify%20agent%20storefront%20check">Request a check by email</a></div>`;
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
${FOOTER_HTML}
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
    <p><img src="/badge.svg" alt="agent-ready, criteria at turva.dev/badge" width="216" height="36"></p>
    ${mdBodyHtml("/badge", "How to embed it")}
  </div>
  ${mdCard("/badge", "If your site is not there yet")}
</main>
${FOOTER_HTML}
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
${FOOTER_HTML}
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
      if (hop >= 4) return { redirect: true, reason: "too-many", status: res.status, location: loc.slice(0, 120) };
      let next;
      try { next = new URL(loc, url); } catch { return { redirect: true, reason: "bad-location", status: res.status, location: loc.slice(0, 120) }; }
      const safeTarget = next.protocol === "https:" && !next.port && !next.username && !next.password && isValidPublicHost(next.hostname);
      const twin = (next.hostname.startsWith("www.") ? next.hostname.slice(4) : next.hostname) === reqApex;
      if (!safeTarget) return { redirect: true, reason: "unsafe-target", status: res.status, location: next.href.slice(0, 120) };
      if (!twin) return { redirect: true, reason: "off-host", status: res.status, location: next.href.slice(0, 120) };
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
  const firstRaw = firstIdx === -1 ? "" : lines[firstIdx];
  const first = firstRaw.trim();
  // The line is read as markdown and not trimmed first. Four spaces or a tab make it an
  // indented code block rather than a heading, and trimming erased that difference, so
  // "    # Site" passed as the H1 until 2026-08-29. CommonMark allows three spaces.
  if (/^ {0,3}# \S/.test(firstRaw)) {
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
  // A section counts when it carries a file list. An H2 followed by a paragraph satisfied
  // this check until 2026-08-29, and the format puts each section's links in a list.
  let sectionsWithList = 0;
  {
    let inSection = false, counted = false;
    for (const l of lines) {
      if (/^## /.test(l)) { inSection = true; counted = false; continue; }
      if (/^# /.test(l)) { inSection = false; continue; }
      if (inSection && !counted && /^ {0,3}[-*+] .*\[[^\][]*\]\([^)\s]+\)/.test(l)) { sectionsWithList++; counted = true; }
    }
  }
  if (h2Count > 0 && sectionsWithList > 0) {
    add("sections", "pass", "H2 sections group the content", h2Count + " section" + (h2Count === 1 ? "" : "s") + ", " + sectionsWithList + " carrying a file list");
  } else if (h2Count > 0) {
    add("sections", "warn", "H2 sections group the content", h2Count + " section" + (h2Count === 1 ? "" : "s") + " but no file list under any of them; the format puts a section's links in a markdown list");
  } else {
    add("sections", "warn", "H2 sections group the content", "no H2 sections found; sections are the convention for grouping links");
  }
  const links = [...f.text.matchAll(/\[([^\][]*)\]\(([^)\s]{1,2048})\)/g)];
  // An entry an agent can use has a name and a target with a host. An empty name and a
  // bare "https://" both counted as valid absolute links until 2026-08-29.
  const named = links.filter((m) => m[1].trim() !== "");
  const unnamed = links.length - named.length;
  const absolute = named.filter((m) => /^https?:\/\/[^/\s?#]+/.test(m[2])).length;
  if (links.length === 0) {
    add("links", "warn", "Markdown links an agent can follow", "no markdown links found");
  } else if (unnamed > 0) {
    add("links", "warn", "Markdown links an agent can follow", links.length + " link" + (links.length === 1 ? "" : "s") + ", " + unnamed + " with an empty link name; an entry needs a name an agent can show");
  } else if (absolute === named.length) {
    add("links", "pass", "Markdown links an agent can follow", named.length + " link" + (named.length === 1 ? "" : "s") + ", all absolute URLs");
  } else {
    const relativeCount = named.filter((m) => !/^[a-z][a-z0-9+.-]*:/i.test(m[2])).length;
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
    found.describedby ? 'rel="describedby" to ' + found.describedby.slice(0, 120) : 'no rel="describedby" in the head or the Link header; v2 recommends it so an agent finds the file without guessing');
  add("v2-markdown-alternate", found.markdown ? "pass" : "info", "Home page points to a markdown version (v2)",
    found.markdown ? 'rel="alternate" type="text/markdown" to ' + found.markdown.slice(0, 120) : 'no rel="alternate" type="text/markdown" in the head or the Link header; v2 recommends it so an agent finds the markdown form without guessing');
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
  ${mdPageStart("/guides")}
  ${mdLinksCard("/guides", "Discovery and content")}
  ${mdLinksCard("/guides", "Capability and trust")}
  ${mdLinksCard("/guides", "Commerce and strategy")}
  ${mdFaqCard("/guides", "Frequently asked")}
  ${mdFaqTailHtml("/guides", "Frequently asked")}
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
  ${mdPageStart("/blog")}
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
  audit: { item: "audit", name: "Agent-readiness audit", amount: 430000, description: "Fixed scope, two weeks. Independent scanner sweep, manual review, written report with prioritized fixes." },
  advisory: { item: "advisory", name: "Continuous advisory", amount: 300000, description: "Monthly re-scan, score delta report, written review, roadmap input. Minimum three months." },
  implementation: { item: "implementation", name: "Implementation day", amount: 150000, description: "Hands-on work at your edge, scoped per task." },
  shopify: { item: "shopify", name: "Shopify agent storefront check", amount: 190000, description: "Fixed scope, four written deliverables within 48 hours of the agreed written kickoff and a retest within 14 days. One live Shopify store across browser WebMCP, remote MCP and Agentic channels." }
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
  "items": ["audit", "advisory", "implementation", "shopify"],
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
            const rlAgent = /^\/(api|v1|x402|openapi\.json|llms(-full)?\.txt|\.well-known|agent\/auth|auth\.md|robots\.txt|sitemap\.xml|security\.txt|ai\.txt|api-catalog|blog\/feed\.xml|oauth\/(authorize|token)|favicon\.(ico|svg))(\/|$)/.test(rlPath)
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

  if (request.method === "OPTIONS" && (pathLower === "/x402" || pathLower === "/x402/" || pathLower.startsWith("/api/") || pathLower.startsWith("/agent/auth/"))) {
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
