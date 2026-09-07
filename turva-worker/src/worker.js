// src/worker.js
// turva.dev worker v3.144.0 - MTA-STS policy names both mail hosts during the mailbox.org to Proton move (2026-09-07): the enforce policy listed only the four mxext hosts, so a sending MTA that had cached it would refuse delivery to the new MX the moment it changed; mail.protonmail.ch and mailsec.protonmail.ch now stand alongside them and the mxext hosts stay until the move is done.
// turva.dev worker v3.143.0 - nav and footer spread across the content width (2026-09-07, Erik: yhtalevea kuin sisaltoalue ja keskella): the nav and the footer keep the 68rem centred frame and their contents now fill it, the menu links distributed edge to edge with space-between and the footer icon links the same; the redundant body --col-half declaration is gone, the rule's own 34rem fallback carries it.
// turva.dev worker v3.142.0 - blog post i-rebuilt-turva-dev-around-the-report (2026-09-07): the site rewrite and the report template written up for buyers, with the two synthetic sample reports as the thing to inspect before buying; six surfaces (PAGE_MARKDOWN, the /blog twin, META_BY_PATH, CANONICAL_PATHS, SITEMAP_ENTRIES and the signed LLMS_TXT) plus the OG card.
// turva.dev worker v3.140.3 - no reading column at all (2026-09-06, Erik: "pelkka full"): every viewport reads the full frame, READ_CSS is empty.
// turva.dev worker v3.140.2 - reading column only below 1080p (2026-09-06, Erik): 1920 CSS px and wider read the full frame.
// turva.dev worker v3.140.1 - reading column by viewport (2026-09-06, Erik): the 65ch prose column applies below 2000 CSS px, a 4K display reads the full frame.
// turva.dev worker v3.140.0 - koko sivuston tarkistus 2026-09-06 (Erik: kohdat 1 to 5 ja 6a): prose reads in a 65ch column again (READ_CSS, shared by every template; cards, tables and headings keep the frame), every guide carries the day it was last read against its sources (META_BY_PATH.checked, rendered under the H1, verify requires it), the vault sentence on /services and /legal says what the vault does and no more, the follow-up study is quoted with 201 comparable and 208 rescanned sites, the audit FAQ separates scanner-verified from test-verified fixes, the OfferCatalog audit and implementation descriptions match the visible services, the authentication guide limits the credentials claim to the audit, and the auth.md post names the optional api_key.
// turva.dev worker v3.139.1 - measurement day (2026-09-06, Erik): turva.dev re-measured after the v3.139.0 ship, Level 5/5 on isitagentready, internet.nl 98 and 95, Hardenize all passed, every result unchanged, and the measured-at date moves from 2026-09-01 to 2026-09-06 on every surface that states it.
// turva.dev worker v3.139.0 - kierros 4 fixes (2026-09-06, Erik: "korjaa kaikki"): stripTags replaces the two tag regexes CodeQL #10 and #11 flagged, ten old guide anchors come back as alias spans (GUIDE_ANCHOR_ALIASES), the /contact Signal paragraph renders once, verify.mjs reads the rendered h2 order (5b), and 22 text findings from the Opus round: META descriptions under 160 characters and equal to the deck, two blog titles equal to their H1, the home title in the site form, hyphens, sample contents lists in page order, dated and sourced sentences.
// turva.dev worker v3.138.0 - the brief shell on the page template (2026-09-06, Erik): BRIEF_CSS restates the open-section rules for the bare headings, lists and code a brief's markdown renders inside main, so every published brief, old or new, reads like the rest of the site the moment this is live; and /llms.txt re-signed, because v3.137.0 changed two blog titles in LLMS_TXT and shipped with the old signature.
// v3.137.0 was: the 31 blog posts edited to the 2026-09-06 page instruction (Tek-364): each post carries its one-sentence deck under the date line and the same sentence as its META_BY_PATH description, so the index card and the page say the same thing; the named editorial corrections only (a new H1 for the thirty-day follow-up and the secret hygiene post, existing correction and status notes raised next to the title, links to the current guides and tools, dated limitations stated beside the numbers, absolute claims narrowed to their measured case), with the original text, data, examples, code, timeline and publication dates unchanged.
// v3.136.0 was: the 24 guides rewritten to the 2026-09-06 page instruction (Tek-362): new H1s and opening paragraphs, three to five named H2 sections each, the rising-score promises and the unsupported generalisations removed, technical scan, manual review and observed AI answers kept apart, the guide index in four groups (audit and visibility, content and crawl access, discovery and authentication, commerce and agent operations) with the same order in LLMS_TXT, the home twin and SITEMAP_ENTRIES, guide titles and descriptions in META_BY_PATH, every cross-link label updated, and the navigation and footer one step larger at Erik's request.
// v3.135.0 was: navigation and footer sized to the page (2026-09-06, Erik): the nav and the footer follow the 68rem frame instead of the old 46rem column (--col-half 34rem by default), the brand mark, the word and the menu links grow to the body's scale (32 px mark, 19 px word, 17 px links, 20 px vertical padding), and the footer gets the same brand word style, 1.05rem links and a .95rem meta line.
// v3.134.0 was: the two sample reports on the report reading template (2026-09-06, Tek-360): a Synthetic sample report eyebrow above a new H1, the page instruction's introduction with the illustrative report date as text rather than a date line, two actions after the introduction (SAMPLE_HEAD), Summary and Decision moved ahead of the contents list and the engagement record, F1 to F9 and C1 to C3 as h3 under their sections with the same anchor ids, Shopify status labels in the instruction's form (Present, Restricted, Unavailable, Not tested, Aligned, Mismatch), and every table wider than four columns offered a second time as a list of named cards from the same cells under a details element beside its scroll box.
// v3.133.0 was: one page template for the site (2026-09-06, Tek-358): every card page and article shares the home page frame (68rem, 24 px edge, 20 px at 320), prose reads in a 65ch column while headings, dividers, card groups and tables keep the frame, H1 is white and green is reserved for links and actions; sections are open (h2 plus body) and cards are used only for offers, tools and results; markdown tables carry data-label cells inside a bounded scroll box and stack into named cards below 640 px when they have up to four columns; ### headings render; articles get a byline from META_BY_PATH, a generated contents list above four sections and one next step; /services, /shopify-agent-storefront-check, /company, /contact, /legal, /tools, /badge, /llms-txt-validator, /guides and /blog rewritten to the 2026-09-06 page instruction with their twins, titles and descriptions; blog index cards carry kind and description.
// v3.132.1 was: hotfix (2026-09-06, Tek-357): the FAQ answer on implementation no longer carries a markdown link, because the FAQPage JSON-LD publishes the answer text raw and the live gate read the link syntax as a difference between the published answer and the page (mds/gotchas.md 2026-09-03 (jatko 9)); the link stands after the FAQ as its own line.
// v3.132.0 was: home content rewritten to Erik's brief (2026-09-06, Tek-357): eleven sections in the twin and the same order in HTML, two starting points as cards read from the twin list, what the client gets, the process in writing, work you can inspect with the scan board and the dated security scans, support beyond the first report, who does the work, a five-question FAQ and the contact section; the curl demo, the x402 prose and every "higher on the next scan" promise left the home page; title, meta description and the ProfessionalService description say the same thing as the page. Prices, scope and promises unchanged, llms.txt unchanged (no re-sign).
// v3.131.0 was: one outer frame for every home section (2026-09-06, Tek-356): .page now shares the hero and offer width, so headings, dividers, card grids, the scan board and the process steps align on the same edges, and the text runs the same width, which Erik chose over a narrower reading column. Prices and promises unchanged, llms.txt unchanged (no re-sign).

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
mx: mail.protonmail.ch
mx: mailsec.protonmail.ch
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
- [Practical guides to agent-readiness](https://turva.dev/guides.md)
- [What a website and API agent-readiness audit covers](https://turva.dev/guides/agent-readiness-audit.md)
- [How to choose an agent-readiness audit](https://turva.dev/guides/choosing-an-agent-readiness-audit.md)
- [Make your website easier for AI assistants to find and cite](https://turva.dev/guides/get-cited-by-ai-assistants.md)
- [SEO and agent-readiness: overlap and differences](https://turva.dev/guides/seo-vs-agent-readiness.md)
- [Agent-readiness, AEO and GEO](https://turva.dev/guides/agent-readiness-aeo-geo.md)
- [Measure agent-readiness with evidence](https://turva.dev/guides/measurement-led-agent-readiness.md)
- [Common agent-readiness gaps in a measured sample](https://turva.dev/guides/agent-readiness-gaps.md)
- [llms.txt explained](https://turva.dev/guides/llms-txt.md)
- [Serving Markdown to AI clients](https://turva.dev/guides/markdown-for-agents.md)
- [Open Knowledge Format explained](https://turva.dev/guides/open-knowledge-format.md)
- [Sitemaps, robots.txt and AI crawler access](https://turva.dev/guides/sitemaps-and-robots-for-agents.md)
- [Response headers for AI clients](https://turva.dev/guides/response-headers-for-agents.md)
- [When AI clients cannot read rendered pages](https://turva.dev/guides/prerendering-for-agents.md)
- [JSON-LD and structured data for AI clients](https://turva.dev/guides/json-ld-structured-data.md)
- [MCP server cards and discovery](https://turva.dev/guides/mcp-server-card.md)
- [What agents.json describes](https://turva.dev/guides/agents-json.md)
- [The /.well-known directory for agent discovery](https://turva.dev/guides/well-known-for-agents.md)
- [Agentic Resource Discovery and resource catalogs](https://turva.dev/guides/agentic-resource-discovery.md)
- [Authentication and authorisation for AI agents](https://turva.dev/guides/agent-authentication.md)
- [x402 and HTTP payment flows](https://turva.dev/guides/x402-agent-payments.md)
- [Agent commerce discovery: A2A, AP2, ACP and UCP](https://turva.dev/guides/agent-commerce-discovery.md)
- [Agentic commerce readiness](https://turva.dev/guides/agentic-commerce-readiness.md)
- [Define what an agent may do with your data](https://turva.dev/guides/letting-agents-act-on-data.md)
- [AI agent use cases and their operating limits](https://turva.dev/guides/ai-agent-use-cases.md)

## Blog
- [Blog](https://turva.dev/blog.md)
- [I rebuilt turva.dev around the report](https://turva.dev/blog/i-rebuilt-turva-dev-around-the-report.md)
- [What 19 identity vendors publish for agents](https://turva.dev/blog/agent-readiness-identity-vendors.md)
- [Two files called auth.md, and they disagree on the field names](https://turva.dev/blog/two-auth-md-dialects.md)
- [Thirty-day follow-up: 201 comparable readings from 210 sites](https://turva.dev/blog/thirty-days-after-the-brief.md)
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
- [Reducing secret exposure in coding-agent workflows](https://turva.dev/blog/agent-secret-hygiene.md)
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
  "/blog/i-rebuilt-turva-dev-around-the-report": `# I rebuilt turva.dev around the report

2026-09-07

The updated site puts sample reports beside the services they describe, with evidence, correction owners and acceptance checks visible before purchase.

I have rewritten turva.dev and rebuilt the pages around the work a buyer receives. The home page now leads into two services and their sample reports. Each report shows how an observation becomes a finding, a correction and a check that the correction worked.

That is the part I want someone to be able to inspect before buying an audit.

## What changed on the site

The [home page](/) separates the focused Shopify storefront check from the broader website and API audit. Each has its own scope and a public example of the deliverable. The process is written out too: agree the question and scope, receive the findings, then make and verify the corrections.

The pages share a common layout. Headings, navigation and report sections follow the same structure across the site. The reports put the summary or decision before the contents and engagement details. Someone opening a long report can see the recommended action first, then follow the evidence behind it.

The [guides](/guides) are grouped by what a reader is trying to do:

- Audit, visibility and priorities.
- Content and crawl access.
- Discovery and authentication.
- Commerce and agent operations.

Their source-check dates are separate from the layout update. A redesigned page does not, by itself, establish that its technical advice is current.

This rewrite changed the pages, not the service scopes or the prices.

## What the report template has to carry

The useful unit in the template is a finding with enough information for someone else to act on it:

- What was checked, under which conditions, and what came back.
- Why the result matters to the business question agreed at the start.
- Which correction comes first and who owns the work.
- What must be available before that work can begin.
- How to check the result afterwards, including anything still unresolved.

The website and API report keeps scanner readings, manual observations and answers from AI assistants identifiable as separate sources of evidence. They answer different questions. A reachable interface can return incorrect data. An assistant can repeat an old address even when the current page is accessible.

The report also names the boundary of a correction. Changing a response at the edge can correct what a client receives while leaving the underlying source unchanged. The person responsible for the source needs to know that, and the acceptance check needs to cover the surfaces that matter.

## The finding that changes no scanner points

The [sample website and API audit](/samples/audit-report) uses an invented fastener wholesaler. Every company detail, reading and date in it is fictional.

In that example, the visible product pages show real prices, while the structured data says the products cost zero and are in stock. The API provides another inconsistent representation. Correcting those facts comes before the fixes that improve the scanner result.

That ordering is deliberate. The company's question concerns what a buyer's assistant will read about its products. The report has to follow that question through the evidence and the correction plan, even where the scanner awards no points for the fix.

The sample shows the format and reasoning. It provides no evidence of a result achieved for a real client.

## A smaller report for a Shopify question

The [Shopify sample report](/samples/shopify-agent-storefront-check) uses a second invented business. It compares selected product variants across the storefront and the agent-shopping surfaces available in the example.

One fictional product has different prices in the storefront and the remote catalog. Another has conflicting availability. The report records the market, variant and session conditions, then gives each mismatch a correction and a retest condition.

It also records where the buyer journey stops. Reaching a checkout handoff does not establish that payment or order creation succeeded. The sample describes no paid order.

This is a narrower deliverable than the website and API audit. Its structure follows the merchant's immediate question: whether the tested interfaces agree about the products, and what the supported journey actually permits.

## What I can claim about the update

The site now makes the report structure, service boundaries and next steps explicit. The two samples let a reader inspect the evidence format and correction instructions before contacting me.

I have not measured whether the redesign improves sales or AI citations. Those would need their own observations. Both sample reports remain synthetic, and neither is a certification of a real business.

For someone considering the work, the most useful place to start is the sample for their situation. It shows what I mean by an audit more precisely than a list of protocol names can.

## Frequently asked

**What should an agent-readiness audit report include beyond a scanner score?**

The agreed scope, dated evidence, manual findings, priorities, correction owners and acceptance checks. If AI answers are included, the questions and measurement conditions should be documented separately from the technical scan.

**Are the public sample reports real client work?**

No. Both use invented businesses and observations to demonstrate the deliverable. They do not show measured client outcomes.

**Can a team use the report without buying implementation?**

Yes. The correction instructions and acceptance checks are part of the report. Implementation is a separate purchase, with access requirements and responsibilities agreed for that work.

## Related

- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Sample website and API audit report](/samples/audit-report)
- [Sample Shopify storefront check report](/samples/shopify-agent-storefront-check)
- [Audit scope and pricing](/services)
`,

  "/blog/agent-readiness-identity-vendors": `# What 19 identity vendors publish for agents

2026-09-05

A dated scan of 19 identity vendors examines what their public sites expose for agents, and what the results cannot say about the products behind them.

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
- [Publishing an MCP server card](/guides/mcp-server-card)
`,

  "/blog/two-auth-md-dialects": `# Two files called auth.md, and they disagree on the field names

2026-09-04

Two auth.md conventions use similar language and different field names. This comparison records the mismatch and the limited role of turva.dev's own file.

WorkOS shipped Agent Auth for AuthKit on 2 September, a way to give the agents you build into your own product short-lived scoped tokens instead of a long-lived API key. Next to it in the same product menu sits something else with a wider blast radius, and it is a month older: an open protocol called auth.md, shipped into AuthKit on 4 August, in which a service publishes a markdown file at its own root telling outside agents how to register on behalf of a user. This site has served a file at that same address since June. The two are not the same document, I read both on 4 September to find out how far apart they are.

| Position in the agent_auth block | Scanner recipe field | WorkOS field |
| --- | --- | --- |
| Registration endpoint | register_uri | identity_endpoint |
| Claim endpoint | claim_uri | claim_endpoint |
| Revocation surface | revocation_uri | events_endpoint |

## What each document asks for

The scanner this site is measured by publishes its own recipe for the check it calls authMd, at https://isitagentready.com/.well-known/agent-skills/auth-md/SKILL.md, which answered 200 with 2 112 bytes. It asks for a markdown file at the service root with an H1 containing auth.md, protected resource metadata carrying resource, authorization_servers, scopes_supported and bearer_methods_supported, and an agent_auth block in the authorization server metadata. It names that block's fields: skill, register_uri, claim_uri, revocation_uri, identity_types_supported, identity_assertion.assertion_types_supported and anonymous.credential_types_supported.

The WorkOS file format at https://workos.com/auth-md/docs/auth-md asks for the same two-hop discovery walk and the same agent_auth block. It names the block's fields identity_endpoint, claim_endpoint and events_endpoint.

So the two documents agree on the path, the file name, the H1 and the discovery order, and they nearly agree on the protected resource metadata: the scanner asks for four fields in it and WorkOS for those four plus resource_name. They disagree on what to call the registration endpoint, the claim endpoint and the revocation surface inside the block both of them require, as the table above shows.

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

Only if an agent could ever need permission to do something there. A site that is entirely public and issues no credential that grants access can publish one to say exactly that, which is what this site does: its only credential is an optional api_key that attributes correspondence. There is nothing dishonest about not having the file when there is nothing to authenticate.

Corrected 2026-09-06. The answer to the last question said this site issues no credentials. Its auth.md describes an optional api_key that attributes correspondence and grants no access, and the answer now says so.

## Related

- [Agent authentication and authorisation](/guides/agent-authentication)
- [Well-known files for agents](/guides/well-known-for-agents)
- [When honesty and the checker disagree](/blog/honesty-and-the-checker)
`,

  "/blog/thirty-days-after-the-brief": `# Thirty-day follow-up: 201 comparable readings from 210 sites

2026-09-03

A 210-site follow-up cohort produced 201 comparable readings. Four changed level. The observations do not establish an effect from the unsolicited briefs.

Every brief I send, a short written reading of one company's website that goes out unasked, carries the same promise. Thirty days later I run the same scanner on the same site again and send back what changed, whether or not anyone answered. Between 19 August and 3 September that promise came due for 210 sites, first measured between 18 July and 6 August, and this is the first time the rescans are read as one set.

## What was measured

The scanner is isitagentready.com, which grades a site from Level 0 to Level 5, run against the same host with the same default profile as the first time, twice per site, and a pair that disagrees is run again until the reading settles or is recorded as unstable. A site counts as moved when its level changed. A check that started passing while the level held is recorded in the file but not counted here, because the level is what the recipient was told in July and what the rescan message reports.

- 210 sites where the promise came due. 201 gave a reading that can be compared with the first one. The other nine, including two that were not rescanned at all, are broken down below.
- Nine could not be compared. Two hosts answered the scanner with 403 and one answered 500, and two of those three had done the same in July, so they never had a first reading either. Four runs did not settle into a reading, one of them because a single header check stalled four times out of four. Two were not rescanned at all, because the record had no address to send the result to.
- 197 of the 201 read the same level as in July. Three moved up and one moved down, 2,0 percent.
- Seven of the 210 had replied to the brief by the time of this count, 3,3 percent.

## The four that moved

Three went up. A site whose sitemap answered 404 in July answers 200 now, and reads Level 1 instead of Level 0. A site whose robots.txt redirected to itself and whose sitemap returned 500 has both working, Level 0 to Level 1. A site that now declares Content Signals in its robots.txt reads Level 2 instead of Level 1. One went down: its sitemap answered in July and answers 404 now, Level 1 to Level 0, confirmed with a request outside the scanner so that a scanner artefact is ruled out.

None of the three that moved up had replied to the brief. So the brief cannot claim them, and I am not going to. The likelier explanation is ordinary maintenance, a CMS update or a plugin that started generating a sitemap, and that is worth writing down because a rescan series is the exact place where a consultant is tempted to count every improvement as an effect.

## The scanner moved too

During the series the scanner added a check named ard to its API group. The twelve sites measured in the first days of September were read against a larger check set than in July without their sites changing. A rescan therefore compares the denominator first and the passes second, and the message the recipient gets names the checks rather than a percentage, because a percentage over a moving denominator says nothing.

## What this says and what it does not

The sample is my own prospecting list, sites I chose to write to, not a random draw. So 2,0 percent is a fact about these 201 comparable sites and not a rate for the web. Zero movement in thirty days is also the expected result when nobody has decided to act. The fixes are small, a sitemap line, a robots.txt group, a header, but they need a person who owns the website to schedule them, and one unsolicited email rarely does that inside a month.

What the series does show is narrower and still useful. The promise has been kept for 208 of these 210 sites, and the two exceptions are named above. The scanner is stable enough to compare across a month for 201 of them, and where it is not, the reason can be named, on the host side for most of the nine and in my own records for the two that had no address. And the one site that went down is a reminder that agent readiness is not a state a site reaches once: a sitemap that disappears in an update takes the level with it, and nobody notices until something reads the site as a machine.

292 promises are still open, the next of them due on 9 September. When the set is larger the same reading will be repeated.

## Frequently asked

**What does the 30 day rescan promise mean?**

Every brief turva.dev sends says that the same scanner will be run on the same site thirty days later and the result sent back, whether or not the recipient answered. The rescan message names the checks that changed rather than a percentage, because the scanner's check set can change in between.

**Did the briefs change anything in thirty days?**

Four of 201 comparable sites changed level, three up and one down, and none of the three that moved up had replied to the brief, so the change cannot be attributed to it. Ordinary maintenance is the likelier cause.

**Why could nine sites not be compared?**

Two hosts answered the scanner with 403 and one with 500, four runs did not settle into a reading, and two were not rescanned because the record had no address to send the result to. A rescan compares two readings, and where one of them is missing there is nothing to compare.

Corrected 2026-09-04. The version served for the first seven hours said the first measurements began on 13 July, described the nine unreadable sites less precisely, and claimed the promise "can be kept at this volume". The earliest first measurement was 18 July, the nine are now broken down as measured, and the claim is limited to these 210 sites. The counts did not change.

Corrected 2026-09-06. Two sentences said the promise was kept for 210 sites and that 2,0 percent was a fact about 210 sites. The first now excludes the two sites that were not rescanned, and the second names the 201 comparable sites the percentage is computed from. The counts did not change.

## Related

- [Website agent readiness, measured on 567 company sites](/blog/website-agent-readiness-567-sites)
- [Sitemaps, robots.txt and AI crawler access](/guides/sitemaps-and-robots-for-agents)
- [Measure agent-readiness with evidence](/guides/measurement-led-agent-readiness)
`,

  "/blog/what-ai-assistants-call-an-agent-readiness-audit": `# What four AI assistants call an agent readiness audit

2026-09-03

Fifty buyer questions produced 193 answers across four assistants. The study shows how the same audit term can refer to websites or organisational AI adoption.

On 3 September 2026 fifty buyer questions were put to ChatGPT, Gemini, Perplexity and Google AI Mode from an anonymous browser session, one run per question, 193 answers in all. Seven of the 200 runs returned no answer: Google AI Mode was stopped by a reCAPTCHA four times, ChatGPT gave nothing twice and Gemini once, and those runs are counted as missing rather than as answers. The questions are the ones a buyer types: what an agent readiness audit is, what it costs, who does it in Finland, how it differs from SEO. Claude was not measured, because its answers sit behind a login and the instrument runs logged out.

## Two products share the words

Eleven of the fifty questions use the words agent readiness, or agenttivalmius in Finnish, without saying whether they mean a website or a company. Those eleven got 41 answers. Eighteen of the 41 described the readiness of an organisation to deploy AI agents: its data, its governance, whether its teams are prepared. Thirteen described what this site means by the words, whether a website and its APIs can be read and acted on by an agent. Six described both, and four could not be placed.

The split is not even across assistants. Gemini gave the organisational reading in eight of its eleven answers and Google AI Mode in six of nine. Perplexity was the only one that leaned the other way, five of eleven for the website reading, and it was also the one that named this site most often, five times against three for ChatGPT and one each for the other two. ChatGPT split evenly, three answers for each reading and three for both, with one unclear.

## The words are the problem, not the assistants

Two Finnish questions in the set name the website outright or avoid the word agenttivalmius. All seven answers to those two read the question as being about the website. The assistants have no trouble with the concept once the question carries it. What drifts is the bare term, and it drifts toward the organisational meaning. The likely reason is what the assistants have read, because that meaning appears in far more published text, but this run does not measure that, and the control set is seven answers, so read it as the direction and not the proof.

That shows in who gets named. Thirty-five of the 41 answers named at least one provider, 112 different names between them, and almost none repeated. Both kinds of answer named a long tail of small consultancies and scanners with agent readiness in the brand, most of them once. The organisational answers also named large consultancies, and the Finnish questions a few Finnish agencies. Across all 193 answers this site was named in 27, and 23 of those carried a link to it. The two counts describe different things, a mention and a mention with a link, and neither is a share of any market.

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

- [What a website and API agent-readiness audit covers](/guides/agent-readiness-audit)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Agent-readiness, AEO and GEO](/guides/agent-readiness-aeo-geo)
- [Website agent readiness, measured on 567 company sites](/blog/website-agent-readiness-567-sites)
`,

  "/blog/website-agent-readiness-567-sites": `# Website agent readiness, measured on 567 company sites

2026-09-03

One scanner measured 567 selected company websites over ten weeks. The results describe that prospecting sample, and the changing check set is a stated limit.

In July I wrote up sixteen Finnish B2B sites. Since then the same measurement has run over every company I have written to, and the sample is now 567 company sites, measured between 28 June and 3 September 2026. The scanner is the same one, isitagentready.com, which grades a site from Level 0 to Level 5. The sample is still my own prospecting list and not a random draw, so read it as a large snapshot rather than a census.

## Key figures

- 567 company sites, 407 Finnish and 160 from elsewhere, one independent scanner.
- Level 1 of 5: 485 sites, 85,5 percent. Level 0: 74 sites, 13,1 percent. Level 2: 7 sites, 1,2 percent. One site read Level 5.
- The Finnish and the non-Finnish subsets read the same: 86,5 and 83,1 percent at Level 1.
- In my own first-fix notes for the Level 0 sites, robots.txt and the sitemap are the two most frequent subjects.
- No company is named here. Every level is the reading on the day I wrote to that company.

## What website agent readiness means

The phrase agent readiness is used for two different things, and AI assistants currently answer the question with the other one. Ask an assistant what an agent-readiness audit is and the answer describes an organisation: its data, its governance, whether its teams are ready to deploy AI agents. That is a real question, and it is a different one.

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

Run isitagentready.com on your domain and read the level, then read which checks failed. The free llms.txt validator at turva.dev/llms-txt-validator reads the llms.txt part in more detail. If you want the whole surface read and the fixes listed in priority order, the agent-readiness audit is described at turva.dev/services, and the way to start is an email to info@turva.dev with the domain.

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

This article examines what a TRACE Trust Record attests to, and why runtime evidence does not itself establish the right permissions or correct decisions.

| What a Trust Record establishes | What it does not establish |
| --- | --- |
| Which model ran, on what hardware, under which policy, against which class of data and which tools it called | Whether the systems the agent touched were readable to it, or should have been |
| At Level 1 and above, that the record was signed inside a verified TEE the operator cannot rewrite afterwards | Whether the tool it called should have been callable at all, or whether the decision boundary around it was written down anywhere |
| At Level 2, that the record has not been altered since it was logged in a transparency log | The state of the machine that produced the report, even when the producer checked it |

The Linux Foundation now governs TRACE, short for Trust, Runtime Attestation and Compliance Evidence. OPAQUE contributed the specification, announced on 25 August 2026, and developed it together with AMD, Intel, Microsoft and the Technology Innovation Institute. The idea is one signed artifact, called a Trust Record, that says which model ran, on what hardware, under which policy, against which class of data and which tools it called. The point of signing it inside a trusted execution environment is that, at Level 1 and above, the operator cannot rewrite it afterwards. An ordinary audit log is written by the system being audited. This one is not.

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
- [Authentication and authorisation for AI agents](/guides/agent-authentication)
- [Define what an agent may do with your data](/guides/letting-agents-act-on-data)
`,
  "/blog/agent-readiness-code-hosts": `# I scanned fourteen code hosts. Not one served an MCP server card.

2026-08-22

Fourteen code-host surfaces were scanned on one day. The findings concern public discovery paths, not the full capabilities of each hosting service.

Cursor launched Origin on August 17 and calls it a Git forge for the agentic era. I ran an independent agent-readiness scanner over its public surface and over thirteen other code hosts on August 22. Not one of them reached Level 2 of 5.

A 403 answer is a refusal, not evidence that a file is absent. Where the count below reads zero, some of those checks got no answer at all rather than a confirmed absence, and that qualification applies directly to the headline claim above.

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

| Host | Level | Passed |
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

- [Measure agent-readiness with evidence](/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps in a measured sample](/guides/agent-readiness-gaps)
- [How agent-ready are Finnish B2B sites? I scanned sixteen](/blog/agent-readiness-finnish-b2b)
- [Website agent readiness, measured on 567 company sites](/blog/website-agent-readiness-567-sites)
`,
  "/blog/cheating-to-keep-the-old-price": `# It would be cheating to keep the old price

2026-08-21

A dated account of pricing changes and the work behind them. Historical prices remain in the article, with the current service prices linked separately.

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

The other prices did not move at the time. When this was published the Shopify agent storefront check was €1,900 within 48 hours of a written kickoff, advisory was €3,000 per month with a three month minimum, and implementation was €1,500 per day. All prices exclude VAT.

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
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Measurement-led agent readiness](/guides/measurement-led-agent-readiness)
`,
  "/blog/i-thought-it-was-a-small-job": `# I thought it was a small job

2026-08-16

A seven-day review of the author's own workspace found 367 issues across nine packages. The article records the effort, findings and limits of that work.

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

A passing validation gate missed elements it never expected. The investigation shows why checking required members differs from checking the complete set.

In this post:

- The gate asked the wrong question
- Three shapes of one defect
- The fourth one was in the tool doing the checking
- What a set check has to do instead
- The version that transfers
- About the hostile read
- What these gates still do not read

I built a gate that checks that the five agent-readiness categories are declared the same way on six surfaces. It went green and it stayed green. 79 static checks with no failures, 212 checks against the live site with no failures, and 53 mutation cases across three runners that all reported no holes. Then I had a hostile reader go through the gate itself, and it came back with three holes. All three were one defect in three shapes.

The two posts before this one came at the same thing from other sides. The first was about a check that keeps passing after it has stopped measuring the right thing. The second was about a red reading that turned out to be about my own client rather than the server. This one is neither. The gate measured what it measured correctly, and it was blind by construction to everything it did not measure.

## The gate asked the wrong question

On every surface the gate asked whether these five were present. It never asked what else was there. That is the whole finding, and it is worth putting plainly. A check that asks whether these five are present is not a check of the set. It is a check of a list you wrote yourself, and it is blind to every element you did not know to write down.

A sixth category went through three of the four static surfaces untouched. I measured each one by running it rather than by reading the code, because reading my own code is how I ended up here. Add a sixth category to the surface, run the gate, read the output. RESULT: OK, zero failures, sixth category sitting on the page.

## Three shapes of one defect

| Shape | Where it hid | Why it passed |
|---|---|---|
| A filter that ran before the count | The README table rows are filtered down to the ones that resolve to a known category before they are counted | A row the fact file did not recognise disappeared in the filter, so the counter never went up |
| A span that ends on the last known element's own sentence | The gate lifts a paragraph out of the audit guide by anchoring on the first category and the last one | Anything added after the closing anchor falls outside the span the gate is reading |
| A substring test standing in for an equality test | A twin sentence built from the fact file, compared against the page with an includes check | A sixth category inserted at the front was not caught, because the wanted string was still contained in the longer one |

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

An MCP request seemed to expose a server regression but selected the wrong compatibility path. The article records how request and response were told apart.

I posted yesterday about checks that keep passing after they have stopped measuring the right thing. The next reading I took was the same defect turned around. A request against my own MCP server came back red, and the red was about my request, sent from a test client I run myself rather than one of turva.dev's clients.

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

A link can resolve successfully and still point to the wrong version. This investigation examines checks that pass while validating the wrong target.

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

## What the two have in common, at a glance

| Observed result | Intended target | Corrected check |
|---|---|---|
| Every rewritten link resolved with a normal response | The frozen 2026-07-28 tree | The promote step now runs all three rewrites over all three copied trees, with the changelog compare pinned to the new tag |
| The parity script kept reporting a clean count | The live server running the new stateless revision | The parity block was rewritten around the new discovery request, with two checks added for what the old transport had no equivalent for |

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

A dated implementation note separates discoverable payment declarations from settlement. The scanner checks changed, the settlement boundary did not.

Corrected 2026-08-02. The section on the three card links used to present them as an invitation to pay before scope was agreed, which contradicted the terms and the description of the same three links in the OpenAPI spec. The measurements in this post are unchanged.

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

## The rule, again

A green check is worth something only when it reflects what an agent actually finds. Commerce is optional, so none of this moved the headline number. It moved whether the payment surface is real and discoverable for the moment agents start to pay, which is the part that will matter. The worker that produces these results is open source at github.com/erekola/turva-worker, readable line by line.

For an agent-readiness audit that reports measured results, contact info@turva.dev.

## Related

- [x402 and HTTP payment flows](/guides/x402-agent-payments)
- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
`,
  "/blog/the-twin-is-the-page": `# The twin is the page

2026-07-19

Two separately maintained versions of the same content drifted apart. This build note explains the move to shared content and the limits of the checks on it.

Every page of this site lives as a markdown string inside the Worker's source file. For the guides and the blog posts that has always been literal. The Worker renders those pages from the markdown at request time, and a client that asks for text/markdown gets the same string untouched, the same approach the [Serving Markdown to AI clients](/guides/markdown-for-agents) guide describes. Ten pages worked differently. The homepage, the services page, the validator and the other card-style pages were hand-written HTML, and the markdown lived beside them as a twin. Same content, two homes.

Two homes means every edit happens twice, and sooner or later one home gets the edit and the other does not. I knew that when I chose the layout. For a while the honest description of the arrangement was a sentence I never liked writing: a checker keeps the pairs in sync, and I am not sure that is the right call.

## Six drifts nobody saw

The checker earned its keep before it retired. A parity gate went into the deploy checks the day before this conversion, comparing each hand-written page against its twin paragraph by paragraph. In its short life it found six real drifts, wording that had quietly diverged between the HTML and the markdown. None of them were visible by reading. I had read those pages many times.

## One home for every sentence

This week the two homes became one. The ten card pages now render their prose from the twin at request time. Seventeen small helpers, under two hundred lines between them, read a named section of the twin and render its paragraphs into the page. The structure around the prose stays hand-built. The hero, the terminal demo, the validator form and the price cards are HTML that the markdown does not try to describe. Every sentence now lives once, and editing the twin is editing the page.

## The gate that replaced the comparison

The parity comparison is gone, because there is nothing left to compare. What replaced it is a stricter check on the end state. Before every deploy a script walks each card function and fails the run if it finds a literal prose paragraph outside two named exceptions, if a twin section is neither rendered nor declared markdown-only, or if a function references a section its twin does not have. The gate is mutation-tested from both sides. A planted paragraph fails the run, and so does a misspelled section name. An exception that exists but goes unused fails it too, which keeps the exception list from rotting into a list of ghosts.

## Proving it with rendered output

The gate was not enough on its own, because the risk in a rewrite like this is a rendering change nobody asked for. So every batch of the conversion shipped against a rendering harness. The same worker file runs in plain Node before and after the change, all ten pages and their markdown twins are snapshotted, and the outputs are diffed after normalization. The blog index came out byte-identical. The company page came out identical after normalization. Every other page changed only in ways the diff named, mostly apostrophes turning into HTML entities. That comparison ran once, at the moment of conversion. It describes what changed that week, not a standing claim about every deploy since.

The harness also caught one real bug before it went anywhere. A sentence on the validator page named the fetched path with a placeholder domain written in URL form. As hand-written HTML it was inert text. Rendered through the markdown pipeline it matched the bare URL rule and became a link to a domain that does not exist. The fix was rewording the sentence without the URL shape. The general lesson: prose that moves into a markdown renderer starts playing by markdown's rules, and rendered output is the only place you see that.

## What did not change

From the outside almost nothing moved. The scanner read the site before and after the conversion and reported the same result. The homepage still serves a markdown version that is deliberately shorter than its HTML, and the layout is still code. That boundary is the honest one to draw. The markdown is the content contract, and the structure around it is the site's own business.

Two limits are worth stating plainly. The checks run on my machine before a deploy, and there is no CI behind them. And the blast radius of a bad edit is unchanged, because all content lives in template literals in module scope, so one stray interpolation marker would still take down every page rather than one. A build step would solve that differently, and at some size it wins. At this size, one file that renders itself is cheaper to keep honest.

If you want to check any of this, request any guide or blog post with Accept: text/markdown and diff the response against its string in worker.js. They match byte for byte.

## Related

- [When honesty and the checker disagree](/blog/honesty-and-the-checker)
- [Every response promised a rate limit. Nothing enforced it.](/blog/enforcing-the-rate-limit-i-advertised)
- [Serving Markdown to AI clients](/guides/markdown-for-agents)
`,

  "/blog/enforcing-the-rate-limit-i-advertised": `# Every response promised a rate limit. Nothing enforced it.

2026-07-18

A response header advertised a request limit that no code enforced. The investigation separates a published policy, the code and what a probe can show.

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

- [Response headers for AI clients](/guides/response-headers-for-agents)
- [When honesty and the checker disagree](/blog/honesty-and-the-checker)
`,

  "/blog/measuring-the-ai-patch-surge": `# Microsoft said the patches would get bigger. I measured how much bigger.

2026-07-15

A comparison of selected Microsoft security-update datasets examines changes in reported vulnerability counts and severity, with the comparison limits stated.

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

This explains capacity. It is not proof of cause. Microsoft's own post attributes the higher volume to AI-assisted discovery. The measurement in this post confirms that the volume rose and puts a size on it. It does not, on its own, prove that AI is the sole or demonstrated cause of that rise, only that the rise coincides with the capability Microsoft describes.

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

- [Measure agent-readiness with evidence](/guides/measurement-led-agent-readiness)
- [Reducing secret exposure in coding-agent workflows](/blog/agent-secret-hygiene)
- [When honesty and the checker disagree](/blog/honesty-and-the-checker)
`,
  "/blog/agent-secret-hygiene": `# Reducing secret exposure in coding-agent workflows

2026-07-12

Ways to reduce secret exposure when coding agents work with a repository, including credential storage and the permissions around runtime access.

Coding agents now run with your shell. They read your files and run your build. They push commits under your name. That is the point of them. It also means every plaintext secret on your disk is readable by the agent, and by every backup or synced folder that copies your working directory. A token in a text file was a small risk when only you could read it. It is a larger one the moment something else is holding the keyboard.

This is the question an agent-readiness audit asks about your product, turned inward. If you care how a third party exposes data to an agent, your own machine is the first place to get it right.

Here is the posture I would defend, the reasoning behind it, and one Windows trap that cost me an afternoon.

## Keep secrets out of plaintext files

The old habit is a token in a dotfile, a key in .npmrc, an unencrypted service account JSON sitting next to the code. It works because the file is only yours. An agent breaks that assumption. So does a leaked backup, a synced folder, or someone watching a screen-share.

Move every secret into storage the operating system encrypts and scopes to your account. On Windows that is the Data Protection API. On macOS the Keychain. On Linux libsecret through the Secret Service. The value is encrypted at rest, only your logged-in account can decrypt it, and a copied file is useless to anyone else. Your scripts ask for the secret when they run instead of reading it off disk.

## Git credentials through a credential manager

Most people still authenticate git with a personal access token pasted into a credentials file. Drop that. Use a credential manager that speaks OAuth, so the token lives in the OS store, refreshes on its own, and never lands in a file you can commit or copy by accident.

One trap to know if you are on Windows and your forge is not GitHub. The common advice is git-credential-oauth with the wincred store. That store writes to Windows Credential Manager, which caps a single entry at 2560 bytes ([CRED_MAX_CREDENTIAL_BLOB_SIZE in the CREDENTIAL structure](https://learn.microsoft.com/en-us/windows/win32/api/wincred/ns-wincred-credentialw)). Some forges issue OAuth tokens well past that, and the write fails with a bare "CredWrite failed" while fetch still works, so nothing looks wrong until you notice every command re-authenticating. Git Credential Manager handles the large token by splitting it across entries and refreshes it silently. If a self-hosted GitLab, Gitea, or Forgejo keeps opening a browser prompt on push, this is usually why.

## A small vault for everything else

Credential managers are built to store one username and password per host. They are the wrong shape for an API key you set as an environment variable, or a private key you would rather not keep as a loose file. Some values also run past the size limit above.

For those, a small file based vault does the job. Encrypt each value with the same OS primitive, keep them in one file, and give it a get command. A deploy script then reads the token when it runs, setting the environment variable from that call instead of from a file on disk. The file is encrypted and tied to your account, so a backup or a stray copy exposes nothing.

Two caveats. A vault tied to your OS user cannot be decrypted after a reinstall, so keep an offline backup of anything you cannot regenerate, like a private signing key. And do not write your own crypto here. Call the OS primitive. It is audited, and it is the same mechanism your credential manager already trusts.

The vault only changes where a secret sits at rest. It does not by itself stop an agent from reaching the value, because if the agent can run the script that calls get, it can still see what that command returns or read it from the environment of the process it started. Encrypting the secret and scoping what the agent is allowed to run and access at runtime are two separate controls, and the vault only provides the first one.

## Why this matters for buyers

I build this into my own setup because I sell the audit that checks for it. A prospect who asks for an NDA is asking a real question about whether you treat access seriously or leave keys lying around while an agent works next to them. The honest answer shows in how you work, before it shows in any report.

None of this is exotic. It is one habit applied everywhere. The operating system holds the secret, encrypted and scoped to you, and the code asks for it when it needs it. An agent can then do its work in your repo without a key sitting in a plaintext file it can read at rest, which is a narrower claim than saying it never sees a key in the clear.

## Frequently asked

**Where should secrets live if an AI agent works in your repo?**

In storage the operating system encrypts and scopes to your account. The Data Protection API on Windows, the Keychain on macOS, libsecret on Linux. Scripts ask for the secret when they run instead of reading it off disk.

**Why is a token in a plain file a bigger risk than it used to be?**

Because the file is no longer only yours. A coding agent reads your files and runs your build, and so does every backup or synced folder that copies your working directory. A stray copy or a screen-share exposes the same plaintext.

**Why does a git push keep asking for authentication on Windows?**

Windows Credential Manager caps a single entry at 2560 bytes and some forges issue OAuth tokens past that. The write fails while fetch still works, so nothing looks wrong until every command re-authenticates. Git Credential Manager splits the token across entries.

## Related

- [Letting agents act on your data](/guides/letting-agents-act-on-data)
- [AI agent use cases and their operating limits](/guides/ai-agent-use-cases)
`,
  "/blog/agent-readiness-finnish-b2b": `# How agent-ready are Finnish B2B sites? I scanned sixteen

2026-07-07

A small, selected sample of sixteen Finnish B2B sites introduced the scan series. Read it as a historical snapshot and follow the later 567-site study.

Over the past weeks I ran an independent agent-readiness scanner over sixteen Finnish company websites, mostly industrial and B2B, a few in healthcare. The scanner was isitagentready.com, which grades on a Level 0 to 5 scale. This is a small, non-random sample. The sites came from my own prospecting, not a statistical draw, so read it as a snapshot, not a census. The pattern was consistent enough to be worth writing down.

## Key figures

- Sixteen Finnish B2B sites scanned with an independent scanner, isitagentready.com.
- Almost all sites landed at isitagentready Level 1 of 5, a couple at Level 0, one at Level 2, none higher.
- The three most common gaps: HTML-only pages with heavy token overhead, missing structured data, and no action or capability layer.
- Largest measured token saving: about 16500 tokens of HTML where 1400 tokens of markdown carry the same content, a 91 percent saving.
- The two sites that published a real llms.txt sat at the top of the range.

Note added July 17: one reading of the llms.txt point is circular, since
the scanner scores llms.txt directly, so publishing one raises the score
by construction. The observation stands as a description of the measured
range, not as a causal claim about readiness.

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

For the larger sample, a later post ran the same scanner across [567 company sites](/blog/website-agent-readiness-567-sites).

To check where a site stands, the free llms.txt validator is at turva.dev/llms-txt-validator, and the agent-readiness audit and advisory work is at turva.dev.

## Related

- [Common agent-readiness gaps in a measured sample](/guides/agent-readiness-gaps)
- [Measure agent-readiness with evidence](/guides/measurement-led-agent-readiness)
- [What an agent pays to read your site](/blog/cheaper-pages-for-agents)
- [Website agent readiness, measured on 567 company sites](/blog/website-agent-readiness-567-sites)
`,
  "/blog/honesty-and-the-checker": `# When honesty and the checker disagree

2026-07-06

An optional credential was both declared and denied in the same metadata. The repair made the description consistent without claiming access it did not grant.

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

[auth.md](/auth.md) now says one thing instead of two. The key it names is the key you get if you email and ask, and it labels the message and grants nothing. The fields that described things the service does not do are gone. The check reads green because the declaration is finally true. Nothing was padded to please it.

For an agent-readiness audit that reads your agent-facing claims the way a skeptic would, contact info@turva.dev.

## Related

- [Authentication and authorisation for AI agents](/guides/agent-authentication)
- [Measure agent-readiness with evidence](/guides/measurement-led-agent-readiness)
`,

  "/blog/re-checking-the-guides": `# Four AI agents re-checked the guides

2026-07-04

A dated review of the guides found that source specifications and local claims had moved. The article records corrections and the limits of automated checks.

The guides on this site describe other people's specifications, and specifications move. A sentence that says "the specification says" is true the day it ships and starts aging the day after, and no scanner will tell you when it has gone stale. So the four AI agents that read this site line by line came back for a second pass, all running Claude Fable 5, each taking one family of standards: the agent commerce stack, MCP discovery, the discovery files from [agents.json](/guides/agents-json) to [llms.txt](/guides/llms-txt), and the plumbing of authentication and response headers. Their job was to re-read every specification claim in those guides against the primary source behind it.

## What had moved

The pass came back with one finding rated high, one medium and six small. The high one sat in the [MCP guide](/guides/mcp-server-card). It described the server card proposal, SEP-2127, in the present tense, and the proposal had moved. As of July 2026 it sits on MCP's extensions track as an experimental extension, and the current draft recommends serving the card relative to the server's endpoint plus a catalog at /.well-known/mcp/catalog.json. Nothing in the old sentence was wrong when it was written. It stayed still while the proposal moved.

The medium finding was quieter. The [response-header guide](/guides/response-headers-for-agents) leaned on the IETF draft for standard RateLimit headers, and that draft expired in March 2026 without a successor. The six small ones were wording: vocabulary that predated A2A 1.0, stale lines about the [Open Knowledge Format](/guides/open-knowledge-format), a Cache-Control nuance, and one phrase about ai-catalog.json contributors that had aged in two places at once, because a blog post here had quoted the guide.

Update, July 16: the RateLimit sentence above was wrong when it was published. The draft had not expired, revision 10 was active in January 2026, and revision 11 from May 2026 remains active in the httpapi working group today. The response-header guide now cites the active draft.

## The sharpest findings were not in the guides

Two of the machine-readable profiles this site serves had drifted from their own specifications, and that is a harder failure than stale prose, because these files exist for software and both had passed every scan since they shipped. The UCP profile used service keys in a namespace the specification reserves for its own governing body, and listed transports its enum does not contain. The MPP manifest declared a version field the protocol does not define. A scanner checks that a profile exists and parses. It does not check that the vocabulary inside it exists in the specification, so an invented key passes as easily as a real one. Both profiles are now in the specification's own shape, verified against the primary text and validated programmatically, and the scanner stayed green through the change. The honest form cost nothing.

## What the scores did not measure

The scanner was re-run after the fixes. isitagentready.com reads Level 5, the same result as before the pass. The scores did not move in either direction, and that is worth pausing on. A score measures the shape of a site at scan time, and the currency of a sentence about somebody else's specification is outside every scanner's reach. If reading every line is part of the promise, somebody has to re-read the lines after the world moves.

## Claims now carry their date

The lasting repair is anchoring. A guide claim about a moving specification now carries its date, as of July 2026, so when the specification moves again the sentence stays true as a dated statement instead of quietly turning false. The families that move fastest, agent commerce and MCP discovery, go back on a re-check schedule, because this pass showed the drift interval there is a matter of weeks.

For an audit that reads your agent-facing claims against the specifications they cite, contact info@turva.dev.

## Related

- [MCP server cards and discovery](/guides/mcp-server-card)
- [Agent commerce discovery: A2A, AP2, ACP and UCP](/guides/agent-commerce-discovery)
`,

  "/blog/cheaper-pages-revisited": `# The page grew, the agent bill did not

2026-07-04

A July measurement compared the token counts of the homepage's HTML and Markdown representations. The result describes that page and measurement date.

In late June this site published [a post on what an agent pays to read a page](/blog/cheaper-pages-for-agents), and the measurement in it said the homepage as markdown cost roughly a third of the HTML form. The most recent scan, as of 4 July 2026, reports the same homepage at 10,320 tokens as HTML and 1,723 as markdown. That is a sixth of the cost, an 83% saving, and nothing in the meantime was done to improve the number.

## Where the weight came from

Since that post went out the site has gained seven blog posts before this one, two tool pages, a feed, a share image for every page and related links at the end of every post. None of that was content negotiation work. It was ordinary growth, and it landed where growth always lands, on the human-facing page. Between the 1 July and 4 July scans alone the HTML form of the homepage went from 9,560 tokens to 10,320, about 8% heavier in three days. The markdown form went from 1,750 to 1,723. It got slightly smaller.

## Two surfaces, two growth rates

The HTML form of a page carries everything a site accumulates: navigation, styling, social metadata, structured data and links to whatever shipped last week. Each of those earns its place for a human reader or a search engine. The markdown form carries the words and the links and nothing else, so it grows only when the actual content grows. Serve one surface to everyone and every agent pays for the whole accumulation on every visit. Serve both forms from the same URL and the costs come apart on their own, the human page free to get richer while the agent page stays at the price of the text.

## Read the number yourself

The token split is not self-reported. It comes from scanning both forms of the page, and this site logs the pair after every deploy. The June post carried the measurement of its day and this one carries the measurement of 4 July. If the pattern holds, a later post will quote a wider gap still, because the human surface keeps accumulating and the text does not.

For an audit that measures what agents pay to read your site, contact info@turva.dev.

## Related

- [What an agent pays to read your site](/blog/cheaper-pages-for-agents)
- [Serving Markdown to AI clients](/guides/markdown-for-agents)
`,

  "/blog/moving-source-to-codeberg": `# Moving the source from GitHub to Codeberg

2026-07-04

The source moved to Codeberg and later returned to GitHub. This dated incident log preserves the sequence and links readers to the current public source.

Status, July 26: the source is on GitHub only, at github.com/erekola. This post is the dated log of a move that later reversed, and the three updates at the end record each step in order. The account of the incident itself stands as written.

The company page of this site tells a buyer they can read every line before hiring me. That promise depends on the source being reachable, and for two weeks it was not, in a way I could not see. This is the log of what broke and why the source moved to Codeberg. Corrected 2026-09-06: this paragraph used to carry the mirror's own address as a link, and the mirror was deleted on 24 July, so that link answered 404.

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

The launch note for turva.dev's llms.txt validator explains its original checks. The live tool page carries the current interface and supported checks.

Open the validator: [/llms-txt-validator](/llms-txt-validator).

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
- [Serving Markdown to AI clients](/guides/markdown-for-agents)
- [What an agent pays to read your site](/blog/cheaper-pages-for-agents)
`,

  "/llms-txt-validator": `# Free llms.txt validator

Check the structure of a site's llms.txt file and the discovery links on its home page. Free, no signup. This checks the published format. It is not an agent-readiness score.

The validator requests the llms.txt file and home page. It does not crawl the rest of the site.

## How to use it

- In a browser: open https://turva.dev/llms-txt-validator and enter a domain
- Without typing anything: https://turva.dev/llms-txt-validator?url=turva.dev runs the checks against this site's own file
- As an agent: GET https://turva.dev/llms-txt-validator?url=example.com with Accept: application/json

Both views list the same checks below. The browser page and this markdown twin are kept in sync deliberately.

## What is checked

Eight structural checks on the file:

- The file exists at /llms.txt and returns HTTP 200
- The response is plain text, not an HTML error page
- The file starts with an H1 title
- A blockquote summary follows the title (recommended by the format)
- H2 sections group the content
- Markdown links parse and use absolute URLs
- The file stays small enough to be cheap for an agent to read
- No HTML markup in the file, since llms.txt should be plain markdown (HTML tags are flagged as a warning)

Two discovery checks on the home page, which v2 of the format recommends:

- Whether the home page points at the llms.txt with rel="describedby"
- Whether the home page points at a markdown version with rel="alternate" type="text/markdown"

The two v2 discovery checks report pass or information, never a warning and never a failure. They describe the site rather than the file, and they do not change the structural result. The format reached v2 in August 2026, and the version history is in [llms.txt explained](/guides/llms-txt).

## What this result means

The result is a structure check against the llms.txt format, not an agent-readiness score. Each check is reported with its name, its status as a word, what was observed and what to do next. There is no total, no percentage and no summary number, because eight structural checks can honestly report pass, warn or fail and a number stacked on top of them would look like a score without measuring one.

A valid file does not guarantee that any assistant reads it, mentions the site or answers correctly. A full audit measures discoverability, content accessibility, access control and more: see [services](/services), or start with [llms.txt explained](/guides/llms-txt).

Two documents are fetched from the target site, its /llms.txt and its home page, each following a redirect to the same host or its www twin when there is one. Nothing else is requested and the site is never crawled. What is fetched is checked and discarded, and the result page is served with a no-store header.

## Use in an agent or CI

An agent calls GET https://turva.dev/llms-txt-validator?url=example.com with an Accept: application/json header and receives the same checks as JSON, with a no-store header.

The same checks are published as an open npm package, turva-llms-txt-validator, with a llms-txt-validate command whose --json output matches this page's JSON exactly. One line in a pipeline, npx turva-llms-txt-validator your-domain.com --strict, fails the build when the file breaks. The two v2 checks never fail that build, since they are reported as information.

All free tools on this site are collected on [the tools page](/tools).

## Frequently asked

**What is llms.txt?**

llms.txt is a plain text file that tells AI agents what a site contains and where the important content lives. It sits at the root of a site or at any path inside it, where it covers the pages under that path. It opens with the site name and a short summary, then lists the key pages as markdown links grouped under headings. This validator checks that structure.

**What does the validator check?**

Eight structural checks: the file exists at /llms.txt and returns HTTP 200, the response is plain text rather than an HTML error page, the file starts with an H1 title, the recommended blockquote summary follows it, H2 sections group the content, markdown links parse and use absolute URLs, the file stays small enough to be cheap for an agent to read, and the file carries no inline HTML, since llms.txt should be plain markdown. Two further checks read the site's home page for the link relations v2 recommends, rel="describedby" to the llms.txt and rel="alternate" type="text/markdown" to a markdown version, and both report pass or information rather than a warning or a failure.

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
- [Serving Markdown to AI clients](/guides/markdown-for-agents)
- [Free tools for agent-readiness](/tools)
`,

  "/tools": `# Free tools for agent-readiness

Check an llms.txt file, inspect the public MCP interface or use a badge with published criteria. These tools address specific parts of agent-readiness, and each page explains what the result does and does not establish.

## llms.txt validator

Check file structure and discovery links. See the result for each check, without signing up.

[Open the validator](/llms-txt-validator)

## Public MCP server

Read turva.dev's service information, published scan results and engagement principles through a public MCP interface.

[Read the MCP server guide](/guides/mcp-server-card)

## Agent-ready badge

A self-declared badge with public eligibility criteria. It is not a certification.

[Read the badge criteria](/badge)

## Technical details

- The validator reports each check as pass, warn or fail, plus two v2 link relation checks that read pass or information and never move the summary. An agent gets the same result as JSON by calling the same URL with an Accept: application/json header. The same checks run in CI as an open npm package, [turva-llms-txt-validator](https://www.npmjs.com/package/turva-llms-txt-validator), with a CLI and the same JSON shape. Source on [GitHub](https://github.com/erekola/llms-txt-validator).
- The MCP server is a read-only Model Context Protocol endpoint at https://mcp.turva.dev/mcp over streamable HTTP, for MCP clients rather than a browser. No authentication. Its server card is published at https://turva.dev/.well-known/mcp/server-card.json.
- The badge is a small SVG served from turva.dev, linking back to the criteria page. Anyone can run the same public scanner against the displaying site at any time.

## Need a broader review?

These tools cover parts of what an agent-readiness audit measures. The audit itself, with fixed prices, is on the [services page](/services).

## Related

- [llms.txt validator](/llms-txt-validator)
- [The agent-ready badge](/badge)
- [MCP server cards and discovery](/guides/mcp-server-card)
`,

  "/badge": `# The agent-ready badge

A self-declared badge for sites that meet the published eligibility criteria below. It does not certify security, guarantee AI visibility or confirm that an agent can complete every task.

## Eligibility

A site may display the badge after completing a turva.dev agent-readiness audit, or after scoring 100/100 on the named public agent-readiness scanner. Completing an audit does not itself mean a 100/100 score.

- Sites that have completed a turva.dev agent-readiness audit
- Sites that score 100/100 on a public agent-readiness scanner (isitagentready.com)

## What it is, and what it is not

The badge is a self-declared claim against public criteria, not a certification. turva.dev does not police its use. The value of the badge is that the claim is checkable: the scanner can be run against the displaying site by anyone, at any time.

## Use the badge

Read the criteria, inspect the preview and copy the complete embed code. Copy this HTML where you want the badge to appear:

    <a href="https://turva.dev/badge"><img src="https://turva.dev/badge.svg" alt="agent-ready. Criteria at turva.dev/badge" width="216" height="36" loading="lazy"></a>

The image is 216 by 36 pixels, dark background, under one kilobyte.

## If your site is not there yet

An audit measures where you stand and lists what to fix first. Services and prices are on the [services page](/services). Email <mailto:info@turva.dev> and you get a reply within one business day.

All free tools on this site are collected on [the tools page](/tools).
`,

  "/blog": `# Research and field notes

Dated studies, technical investigations and build notes from turva.dev. Each article explains what was observed, how it was checked and what the result does not establish.

## Start with the research

- [Website agent-readiness across 567 company sites](/blog/website-agent-readiness-567-sites): one scanner over a selected prospecting sample of 567 company sites in ten weeks, with the changing check set recorded as a limitation.
- [What four AI assistants call an agent-readiness audit](/blog/what-ai-assistants-call-an-agent-readiness-audit): fifty buyer questions, 193 answers, one day's conditions.
- [Thirty-day follow-up: 201 comparable site readings](/blog/thirty-days-after-the-brief): a 210-site cohort, 201 comparable readings, four changed level, and no effect from the briefs established.

## All posts

- [I rebuilt turva.dev around the report](/blog/i-rebuilt-turva-dev-around-the-report). 2026-09-07.
- [What 19 identity vendors publish for agents](/blog/agent-readiness-identity-vendors). 2026-09-05.
- [Two files called auth.md, and they disagree on the field names](/blog/two-auth-md-dialects). 2026-09-04.
- [Thirty-day follow-up: 201 comparable readings from 210 sites](/blog/thirty-days-after-the-brief). 2026-09-03.
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
- [Reducing secret exposure in coding-agent workflows](/blog/agent-secret-hygiene). 2026-07-12.
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

A July product update illustrates how crawler access, discovery and payment controls can sit at the network edge, before the site's content is reached.

On 1 July 2026 Cloudflare shipped its second Content Independence Day package: crawler controls that split search, agent and training bots for every customer, a research program that tells crawlers which pages actually changed, experiments that turn Pay Per Crawl into Pay Per Use, and a waitlist for a gateway that charges for any resource over x402. Read together, they move decisions that used to live in a site's code into the CDN dashboard. That relocation is what matters for agent readiness.

## The edge can undo everything the page does right

A site can serve clean markdown, an llms.txt, structured data and signed manifests, and none of it counts if a network rule turns the crawler away before the request reaches the page. [Cloudflare states on its own site](https://www.cloudflare.com/what-is-cloudflare/) that about 20% of the web runs through its network, and the new controls ship with per-crawler block toggles and defaults that change over time. This site's own crawler list turned out, on 2 July 2026, to contain seven blocked entries, including the Internet Archive and an AI search engine that pays publishers. However they got there, nothing in the markup shows it. You find it in the dashboard, or when your content stops appearing in answers.

An agent-readiness review therefore has to read the edge configuration next to the content. [robots.txt](/guides/sitemaps-and-robots-for-agents), the WAF and the AI crawler list must say the same thing the content strategy says, and they must keep saying it, because platform defaults move without a deploy.

## Citations are replacing clicks, and both are measurable now

Cloudflare's stated reason for the package is a 2025 Pew Research Center finding: when Google shows an AI summary, users click a traditional result 8% of the time and a link inside the summary about 1% of the time. The visit is no longer where the value moves. Cloudflare's response is to make the citation itself payable. Ceramic.ai pays publishers per query their content answers, You.com lets agents buy individual premium pages, and participating sites get reporting on which AI-search queries surfaced their content, down to the page and the snippet.

The reading this is meant to price is already routine. Over the past seven days this site answered 604 requests from identified AI and search crawlers, and AI answers and search referred 88 human visits (Cloudflare edge data), most from Google, the rest led by Meta, DuckDuckGo and Bing. Whether that reading starts to pay is what the new programs will test.

## Payment rails are becoming configuration

The Monetization Gateway waitlist points the same direction: charge for any page, dataset, API or MCP tool behind Cloudflare, settled over the x402 protocol, with no payment stack of your own. Charging an agent moves from an engineering project to a setting. The honesty bar moves with it. An x402 surface that quotes terms no agent can complete gets found out by the first agent that tries, which is why the x402 endpoint on this site, as of 2 July 2026, answers HTTP 402 with its real terms instead of a pretend checkout.

## What to check this week

- Open your CDN's AI crawler list and compare it against your intent. A block you did not choose is configuration drift, and it overrides everything your pages declare.
- Re-scan after any edge change. The public agent-readiness scanners read a site from outside, so a network-level block shows up as a dropped score before a buyer sees the gap.
- If your content earns citations, look at the Pay Per Use programs. The reporting alone, which queries put your pages into AI answers, is visibility data you cannot get anywhere else today.

For an agent-readiness audit that reads the edge configuration next to the content, contact info@turva.dev.

## Related

- [What an agent pays to read your site](/blog/cheaper-pages-for-agents)
- [x402 and HTTP payment flows](/guides/x402-agent-payments)
- [Sitemaps, robots.txt and AI crawler access](/guides/sitemaps-and-robots-for-agents)
`,
  "/blog/publishing-an-ai-catalog": `# Publishing an ai-catalog.json for agentic discovery

2026-06-29

A dated implementation log records adding an AI Catalog discovery manifest. Later ARD conventions are explained in the current resource-discovery guide.

Status: later Agentic Resource Discovery conventions are explained in the current guide, [Agentic Resource Discovery and resource catalogs](/guides/agentic-resource-discovery).

Google and a Linux Foundation working group published Agentic Resource Discovery in 2026, an open specification for telling agents what a site offers in one machine-readable file at /.well-known/ai-catalog.json. turva.dev now serves one. This is the log of adding it, and of why the change could not move the scanner score either way.

## What the file says

The manifest is a small envelope with a specVersion, a host block, and an entries array. Each entry names one agentic resource with an identifier, a type, a url, and a description. turva.dev publishes four entries, and every one points at a surface that already resolves: the MCP server card, the A2A agent card, the OpenAPI description, and the agent skills index. Nothing in the catalog is aspirational. If a line names a resource, that resource answers.

## Why it is additive

The catalog is a new file and a new route. It does not change a single existing surface, so it cannot lower a score, and because the independent scanner did not check for ai-catalog.json as of June 2026, it could not raise one either. turva.dev already reads Level 5 on isitagentready.com, and it read the same after this change. The point of publishing now is not the number. It is that a Google-backed discovery standard exists, and a site that sells agent-readiness should serve the surface before its buyers ask for it.

## Discovery, not ranking

An ai-catalog.json is easy to misread as another search file. It is not. It indexes the agentic resources a site exposes so an agent can find them and call each one through its own protocol. Google [has said publicly](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) that llms.txt does not affect its search results, and the same holds here. Agent-readiness and search ranking remain different things, and neither should be sold as the other.

## Honest about adoption

In a June 2026 check I ran against their public well-known paths, none of the companies named as contributors to the specification yet served a discoverable ai-catalog.json. The specification is an early draft and adoption is near zero. That is the honest frame for this post. turva.dev is early rather than late, and being early on a verifiable standard is a position worth holding when the work is open source and readable line by line at github.com/erekola/turva-worker.

For an audit of a site's discovery surface, contact info@turva.dev.

## Related

- [Agentic Resource Discovery and resource catalogs](/guides/agentic-resource-discovery)
- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
- [MCP server cards and discovery](/guides/mcp-server-card)
`,
  "/blog/open-knowledge-format": `# What the Open Knowledge Format is, and what it is not

2026-06-27

An early reading of Open Knowledge Format version 0.1 separates the file structure it defines from the semantic promises it leaves open.

This is a dated read of version 0.1, published in June 2026. For guidance that keeps up with later versions, see the [Open Knowledge Format guide](/guides/open-knowledge-format).

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

- [Serving Markdown to AI clients](/guides/markdown-for-agents)
- [Agentic Resource Discovery and resource catalogs](/guides/agentic-resource-discovery)
- [llms.txt explained](/guides/llms-txt)
`,
  "/blog/cheaper-pages-for-agents": `# What an agent pays to read your site

2026-06-26

This article examines the publisher's influence on the content a text-based client receives, using a dated HTML-versus-Markdown comparison.

When an AI agent visits your site to check a price or finish a task for someone, it pays to read the page. That cost is counted in tokens, and a normal HTML page is expensive. Navigation, styling, scripts and structured data all arrive whether the agent needs them or not. The agent either spends its budget getting past that markup or runs out of room and reads only part of the page. Both outcomes are yours to deal with, because they decide whether the agent gets your facts right.

## Your surface sets the cost

Most advice about agent token cost is aimed at the people building agents. Cache the prompt, route easy work to a cheaper model. That is real, but it misses the half of the bill that the publisher controls. If your page is heavy and agents read the same markup browsers get, every agent that reads it pays for that weight, on every visit. You cannot tune someone else's model, but you can decide how much your own content costs to read.

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

- [Serving Markdown to AI clients](/guides/markdown-for-agents)
- [Response headers for AI clients](/guides/response-headers-for-agents)
- [The page grew, the agent bill did not](/blog/cheaper-pages-revisited)
`,
  "/blog/verifiable-agent-identity": `# When an agent can prove it is Claude

2026-06-25

Signed requests can give evidence of a sender's identity. This dated article separates that evidence from trusting a user-agent string or granting an action.

This is a snapshot from 25 June 2026, written while Claude has not yet joined the signed list Cloudflare maintains. Read the title as a question about the mechanism, not a claim that Claude carries a verified identity today.

A site that wants to let an AI agent act has a problem it rarely says out loud. It cannot tell which agent is actually at the door. A user-agent string is just text, and anything can send it. An IP range drifts as providers move their infrastructure around. So the site guesses, and the guess collapses into one of two bad defaults. Block too much, and the helpful agent never reaches the page. Trust too much, and anything wearing the right header walks straight in.

## What the tag actually is

Web Bot Auth is the piece that removes the guess. It comes from active work at the IETF and is already in production at Cloudflare, and it lets an agent prove who it is on every request. The agent generates a signing key and publishes the public half at a fixed location, /.well-known/http-message-signatures-directory. It then signs each request it sends. The receiving site, or Cloudflare at its edge, checks that signature against the published key. A match is a verifiable claim about the sender. Copying the header does not reproduce it, because only the holder of the private key can sign.

Cloudflare calls the end-user-directed form of this a signed agent, and opened the program in August 2025 with a first cohort: ChatGPT agent, Goose, Browserbase, and Anchor Browser. The list lives in the public bots and agents directory on Cloudflare Radar, readable by anyone, customer or not. That public directory is the part that matters to me, because it makes the identity checkable by a third party instead of asserted by the agent itself.

## Where Claude stands today

Claude is not on the signed list yet, and the gap is not academic. A site that switches on Cloudflare's Block AI Bots rule can, right now, block Claude's own request to a server it was asked to reach. Operators have run into exactly that and had to add a manual exception to let Claude back through, which is why there is an open request to register Claude as a verified bot.

I am writing this ahead of the fact rather than after it, because the mechanism is live and the direction is set. The day Claude carries a signed identity, the request a site has to guess about today becomes one it can verify in a millisecond at the edge. Nothing else about the site has to change for that to pay off.

## Why this lands on my desk

An agent-readiness audit has mostly answered one question: can an agent read this site. Verifiable identity adds the other half. Can the site tell which agent is reading, and admit it on purpose. The two questions are different, and the second one is where most marketing sites have nothing in place at all.

The concrete uses are easy to name. Validate Web Bot Auth signatures at the edge instead of pattern-matching user-agent strings that anyone can fake. Base allow rules on the public directory rather than on IP lists kept by hand. The decision envelope, the set of actions an agent is permitted to take, should then turn on a verified identity rather than on an unverified claim. A verified signature is evidence of who is asking. It does not by itself grant permission to act. That permission stays a separate decision the site has to make. A site built this way can open a real capability to a known agent and keep it closed to everything else, without falling back on the blunt switch that blocks every bot at once.

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

- [Authentication and authorisation for AI agents](/guides/agent-authentication)
- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
- [What agents.json describes](/guides/agents-json)
`,
  "/blog/reliable-agent-decisions": `# What makes an AI agent's decisions reliable

2026-06-22

Usable inputs and explicit operating limits matter for agent decisions, alongside model uncertainty. The article asks where control and verification belong.

In the audits I have run, including this site's own, one thing keeps surfacing. An agent that is instructed well, and given the right settings and checks, can take in data and make the decision the rules call for, consistently. The capability is real, and it is wider than most of the conversation around it. The limits are not always the model. They also sit in two places that are easy to overlook.

## A decision is only as good as its inputs

The decision an agent reaches is bounded by the data that reaches the agent. In a clean datacenter that is invisible, so it gets ignored. Move the same agent to where the work actually happens and it becomes the whole problem. A link drops as a crane passes over it. A satellite hop adds the better part of a second. On a transport that delivers in order, one lost packet can stall every packet queued behind it, and whether it does depends on the transport and the application. The agent waits on stale input while the moment it needed to act goes by.

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

Not always the model. Two things sit below it. The data that reaches the agent, and the envelope of settings it is allowed to act inside. A decision is bounded by its inputs, and a correct decision is the one the settings allowed.

**Why does the network layer decide whether an agent can act?**

A link drops as a crane passes over it, a satellite hop adds the better part of a second, and on a transport that delivers in order one lost packet can stall every packet queued behind it. Whether it does depends on the transport and the application. The agent waits on stale input while the moment to act goes by.

**What does good autonomy look like in practice?**

A well-set boundary rather than a clever model. The judgment is front-loaded into permissions, thresholds and an explicit list of what the agent may touch. Draw the envelope loosely and a capable agent still does something, just not what you wanted.

## Related

- [Letting agents act on data](/guides/letting-agents-act-on-data)
- [AI agent use cases and their operating limits](/guides/ai-agent-use-cases)
- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
`,
  "/blog/owning-your-fediverse-identity": `# Owning your fediverse identity

2026-06-21

A build note on separating a public identity domain from the server that hosts the account, and the dependencies that still remain.

turva.dev runs on one rule: own the surfaces that carry your value, do not rent them. That rule moved the homepage off a third-party renderer, and it applies to identity too. My fediverse handle is now [@erik@turva.dev](https://social.turva.dev/@erik), on infrastructure I control, not a username on someone else's server.

## Why the handle matters

A platform handle is a dependency. If the server you joined changes its rules, slows down, or shuts off, your identity and your followers are stuck on it. The same logic that says frontier model access is not a moat says a platform username is not an identity. The address people use to find you should resolve to a domain you own.

## How the split works

Mastodon lets the handle domain and the server domain differ. The account lives at social.turva.dev, but the handle is [@erik@turva.dev](https://social.turva.dev/@erik). For that to work, turva.dev has to answer the discovery requests a remote server makes before it can reach the account.

The Cloudflare Worker that already fronts the apex does this. It redirects the well-known paths the fediverse asks for, host-meta and webfinger and nodeinfo, to the instance. Everything else the apex serves stays exactly as it was: the guides, the markdown, the agent manifests, the structured data. The same Worker that makes the site legible to agents now also carries the identity.

## Verified, not asserted

The profile links to turva.dev, and turva.dev links back to the profile with a rel="me" relation. Mastodon checks both directions and marks the link verified. It is the same standard as the rest of the site. The claim is checkable rather than taken on trust.

## The principle

For me, identity is infrastructure. Because mine lives on a domain I own, I can change servers, change hosts, or self-host later without changing my address or losing my followers. Renting the frontier is fine. Renting my name is not.

Find me on the fediverse at [@erik@turva.dev](https://social.turva.dev/@erik). For an agent-readiness audit, contact info@turva.dev.

## Related

- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
- [Authentication and authorisation for AI agents](/guides/agent-authentication)
- [What agents.json describes](/guides/agents-json)
`,
  "/samples/audit-report": `# A website and API audit, from evidence to fixes

An invented company, Northwind Fasteners Oy, shows how the report connects technical findings, observed AI answers and a prioritised correction plan. All companies, readings and report dates in this sample are fictional.

Illustrative report date: 8 September 2026. This is a synthetic sample of the agent-readiness audit report: the company, the domain northwind-fasteners.example, every reading and every date are invented to show the format, the depth and the wording a paying client receives. Nothing on this page describes a real client, and no figure here has been measured on a real site. A real report carries the raw scanner output, the request logs and the full AI answer set as appendices, which this sample shortens to three evidence chains and the question list.

## Summary

The site reads Level 1 of 5 on isitagentready.com, with 2 of the 21 scored checks passing. The two that pass are robots.txt and sitemap.xml, and both exist because the content management system ships them. Everything an agent would use on purpose is missing: no markdown form of any page, no llms.txt, no Link relations, no discovery file for the REST API that already runs, and no named rules for AI crawlers.

The most expensive finding scores no points. Every one of the 138 product pages publishes structured data with a price of 0,00 EUR and an availability of InStock, and the API publishes an empty price with the product marked purchasable, while the visible page shows a real price and, for 41 products, a six week lead time. One of the twelve by-name answers in the AI run already told a buyer the catalog is free. This is fixed first, across the whole catalog and on all three surfaces the company publishes, before anything that moves the score.

Nine findings. Five of them, F2, F3, F5, F6 and F7, flip six scored checks. Two, F1 and F4, correct data the scanner does not score. F8 is a decision to leave the five commerce checks red on purpose, because a commerce declaration that points at a checkout an agent cannot complete would be a false claim. F9 is the old address that two assistants quoted, which is not an agent-readiness check at all and is in the report because the company asked for correct answers.

The edge work in F1 to F7 is about eleven and a half hours. The services page says the list is typically about a day, and this one runs over because the catalog has variants and two price bases, so every product row is tested and not sampled. The fixed price for implementing the list covers it whatever the count. The report names the checks it moves, not a level it promises: the level moves with the check set the scanner runs on the day, and 22 checks were in the set on 2026-09-03.

## Contents

- [Summary](#summary)
- [Engagement record](#engagement-record)
- [Decisions the company makes](#decisions-the-company-makes)
- [Fix order and owners](#fix-order-and-owners)
- [Who does what](#who-does-what)
- [Scope and method](#scope-and-method)
- [Scanner readings, check by check](#scanner-readings-check-by-check)
- [Manual review](#manual-review)
- [AI visibility today](#ai-visibility-today)
- [Published security scans](#published-security-scans)
- [Findings](#findings), F1 to F9
- [What happens next](#what-happens-next)
- [What this report is not](#what-this-report-is-not)
- [Appendix A. Evidence chains](#appendix-a-evidence-chains)
- [Appendix B. The questions and the measurement conditions](#appendix-b-the-questions-and-the-measurement-conditions)
- [About this sample](#about-this-sample)

## Engagement record

| Field | Value |
| --- | --- |
| Client | Northwind Fasteners Oy, industrial fastener wholesaler, invented |
| Surface audited | The public site northwind-fasteners.example, its 138 product pages and its REST API at /wp-json/ |
| What the company asked | That a buyer's assistant quotes the right price and the right lead time, that the catalog is reachable through agents, and no agent checkout this year |
| Kickoff, scope agreed in writing | 2026-08-25 |
| Scanner run | 2026-09-03, isitagentready.com, default profile, three serial runs, all three identical |
| Manual review | 2026-09-03 and 2026-09-04, whole catalog read through the API and the sitemap |
| AI visibility run | 2026-09-04, 15 questions to four assistants, one anonymous run per question, conditions in appendix B |
| Report delivered | 2026-09-08, fourteen days after the kickoff |
| Written follow-up round | Open until 2026-09-22 |
| Re-scan | One, included, within 30 days of the report, by 2026-10-08, on the day the company names |
| Access used | Public surfaces only. No login, no credentials, no code repository |

## Decisions the company makes

Five decisions belong to the company, and the work below is scoped so that none of them blocks the others.

| Decision | Options | Effect | Needed by |
| --- | --- | --- | --- |
| D1. Who implements F1 to F7 | The company's team from this report, or turva.dev at the edge for the fixed price on the services page | Decides who owns the acceptance run in the section Who does what | Before the work starts |
| D2. The AI crawler preference for F5 | Allow named crawlers, disallow them, or allow search and ai-input and refuse ai-train | Decides the content of robots.txt. The report records no preference of its own | Before F5 is written |
| D3. The text of llms.txt for F3 | Approve the draft as written, or edit it | The file is the company's own description of itself and goes live only after the company has read it | Before F3 goes live |
| D4. The four discontinued products and the six price-on-request products, F1 | Keep them published with the right availability, or unpublish them | Decides whether 10 of 138 products stay in the catalog an agent reads | Before the F1 acceptance run |
| D5. Agent checkout, F8 | No agent checkout this year, as agreed at the kickoff, or a separate scoped engagement when that changes | The five commerce checks stay red on purpose until this decision changes. The report makes no recommendation on the strength of a scanner point | Whenever the company wants |

## Fix order and owners

The order is by impact on a buyer first and on the score second. The edge column is what turva.dev delivers when the company chooses that route. The source column is work at the origin that the company or its agency does whether or not turva.dev implements the list, because an edge correction serves the right data while the source still holds the wrong data. The effort figures are estimates scoped to these findings, not a quote.

| Order | Finding | Checks moved | At the edge, turva.dev | At the source, company or agency | Edge hours | Source hours |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | F1 product data on all three surfaces | None, manual | Correct the JSON-LD Product node on every product page from the fields the page renders, and run the whole-catalog acceptance script | Fix the plugin mapping and the API price visibility so the origin publishes the right data itself | 4 | 2,5 |
| 2 | F2 markdown next to HTML | markdownNegotiation | Edge worker with the acceptance list in F2 | None | 4 | 0 |
| 3 | F3 llms.txt, Link header, security.txt | linkHeaders | Serve the three files and the header | Read and approve the llms.txt text, D3 | 1,5 | 0,5 |
| 4 | F4 sitemap content | None, manual | Serve a product sitemap generated from the API and a sitemap index in front of the CMS one | Four plugin settings so the origin sitemap is right on its own | 0,5 | 0,5 |
| 5 | F5 robots.txt | robotsTxtAiRules, contentSignals | Serve the file | Decide the preference, D2 | 0,5 | 0 |
| 6 | F6 api-catalog and real 404s | apiCatalog | Serve the linkset and the 404s | None | 0,5 | 0 |
| 7 | F7 DNS-AID and DNSSEC | dnsAid | Add the records when the DNS access is in the written arrangement | Add the records and enable DNSSEC when it is not | 0,5 | 0,5 |
| 8 | F8 commerce | None, on purpose | None | Decision D5 | 0 | 0 |
| 9 | F9 the old address | None, manual | Add the current address to the Organization node | Remove or update the 2022 price list PDF, ask the directory to correct its listing | 0,5 | 1 |

Edge total for F1 to F7 and F9: about twelve hours. Source total: about five hours, of which the largest is the plugin work behind F1, which the agency does.

## Who does what

Four things are kept apart on purpose, because a client who buys the implementation needs to know what arrives, what has to be in place before it can arrive, what stays theirs afterwards and when the delivery counts as done.

What turva.dev delivers. When the company chooses the fixed price route, turva.dev implements the edge column of every row above in one edge worker in front of the origin: the corrected JSON-LD on every product page, the markdown twin of every page with the acceptance list in F2, llms.txt with the Link relations and security.txt, the product sitemap and index, the robots.txt the company decided, the api-catalog linkset with real 404s under /.well-known/, the Organization address, and the DNS-AID record and DNSSEC when the DNS access is in the written arrangement. It also delivers the whole-catalog acceptance script from F1 as a file the company can run itself, and runs it once on the day the work is declared done.

What the company has in place first. An edge runtime in front of the origin where the worker runs, and the access to deploy there. The DNS zone access if F7 is to be done by turva.dev. A named contact at the web agency for the source work in F1 and F4. The three decisions D2, D3 and D4, because F5, F3 and the F1 acceptance run each wait on one of them. All of this is arranged in writing before the work starts, and the services page says the same.

What stays with the company. The permanent fixes at the source: the plugin mapping and the API price visibility behind F1, the sitemap settings behind F4, and the old PDF and the directory listing behind F9. The edge corrections serve the right data from the day the worker goes live, and they are corrections on the way through, not a repair of the origin: if the origin's plugin still publishes price 0 on the day the edge worker is switched off or bypassed, the wrong data is back. The report says so here and in F1, so that nobody reads a green acceptance run as the plugin having been fixed.

When the delivery is accepted. On the day turva.dev declares the work done, the acceptance tests of F1 to F7 and F9 are run and their output is delivered with the retest report. The delivery is accepted when all four of the following hold on that day.

- The whole-catalog script from F1 reports zero rows where the JSON-LD differs from the visible page.
- The edge acceptance list in F2 is green in every line.
- markdownNegotiation, linkHeaders, robotsTxtAiRules, contentSignals, apiCatalog and dnsAid read PASS on a full default-profile scan, or dnsAid reads FAIL with the DNS work recorded as the company's under F7.
- The acceptance tests of F3, F4, F6 and F9 pass as written.

What the acceptance does not cover, because it is source work: the API price rows in F1 and the origin sitemap in F4, which the retest reads and reports as the company's remaining work if they are still open.

## Scope and method

What was measured, in this order.

- The independent scanner. isitagentready.com was run three times in series against the origin with the default profile, and the three runs agreed. The denominator on the day was 22 checks, 21 scored and one informational, webBotAuth. Every check is recorded below individually rather than as one headline number.
- A manual review of what the scanner does not score. JSON-LD on the home page, one category page and every product page, 138 in all, read from the sitemap and the API rather than from a sample. Head metadata and Open Graph on seven pages. HTTP response headers on the home page and one product page. The /.well-known/ directory. robots.txt, sitemap.xml, ai.txt and llms.txt against the current norms. The first response of each page fetched as a bot, to see whether the content arrives or a script shell does.
- AI visibility today. A fixed set of 15 questions, 12 that describe the category without naming the company and 3 that name it, put once to four AI assistants in anonymous sessions on 2026-09-04. Recorded per answer: whether the company is named, whether the answer is correct where it names it, and which sources the assistant cites. The questions and the conditions are in appendix B.
- Published security scans. internet.nl website and mail tests and Hardenize, run on 2026-09-04, so the report rests on measurements the client can re-run without turva.dev.

What was not measured. No code was read, no credentials were used, no penetration test was run and no traffic analytics were seen. The REST API was read through its public routes only. Rankings on any AI platform were not measured and are not promised anywhere in this report. Where the report says an agent may do something, that is a possible effect and not a measured one, and the report keeps the two apart in every finding.

## Scanner readings, check by check

isitagentready.com on 2026-09-03. PASS and FAIL are the scanner's words. INFO marks the one check the scanner reports without scoring. The fix column points at the finding that moves the check, or says why the check stays as it is. The last column reads the check against what the company asked for, because a red check is not a defect when the company does not need what it measures.

| Category | Check | Reading | What the scanner saw | Fix | What it means for Northwind |
| --- | --- | --- | --- | --- | --- |
| Discoverability | robotsTxt | PASS | /robots.txt exists and parses. One wildcard group. | F5 changes its content, the check stays green | Green because the CMS ships the file, not because it says anything useful |
| Discoverability | sitemap | PASS | /sitemap.xml exists and parses, 14 URLs. | F4, a manual finding, the check stays green | Green with none of the 138 products in it. The check reads the file, not the catalog |
| Discoverability | linkHeaders | FAIL | No Link header on any response. | F3 | Cheap, and it is how a page points at its own markdown twin and at llms.txt |
| Discoverability | dnsAid | FAIL | No _index._agents record under the domain, DNSSEC not enabled. | F7 | Needs the company's DNS, not the edge. Last among the scored fixes for that reason |
| Content | markdownNegotiation | FAIL | Accept: text/markdown returns text/html, 212 kB on the home page. | F2 | The catalog and the delivery terms are what a buyer's assistant reads, and today it reads them as 200 kB of markup per page |
| Bot access control | robotsTxtAiRules | FAIL | No AI crawler named in robots.txt. | F5 | A stated preference the company has not stated. Decision D2 |
| Bot access control | contentSignals | FAIL | No Content-Signal line in robots.txt. | F5 | Same file, same decision |
| Bot access control | webBotAuth | INFO | No Web Bot Auth directory. Informational, not scored. | None | The company operates no bots that would sign requests |
| API, auth, MCP and A2A | apiCatalog | FAIL | /.well-known/api-catalog returns the HTML 404 page. | F6 | The catalog API already exists. Naming it is the cheapest route to an agent reading prices as data |
| API, auth, MCP and A2A | oauthDiscovery | FAIL | No /.well-known/oauth-authorization-server or openid-configuration. | Waits, see F6 | No agent needs to log in here. Stays red at no cost |
| API, auth, MCP and A2A | oauthProtectedResource | FAIL | No /.well-known/oauth-protected-resource. | Waits, see F6 | Same |
| API, auth, MCP and A2A | authMd | FAIL | No /auth.md and no agent_auth metadata. | Waits, see F6 | Same |
| API, auth, MCP and A2A | mcpServerCard | FAIL | No /.well-known/mcp/server-card.json. | Waits, see F6 | There is no MCP server to point at, and a card that points at none is a false claim |
| API, auth, MCP and A2A | a2aAgentCard | FAIL | No /.well-known/agent-card.json. | Waits, see F6 | Same |
| API, auth, MCP and A2A | agentSkills | FAIL | No /.well-known/agent-skills/index.json. | Waits, see F6 | Same |
| API, auth, MCP and A2A | webMcp | FAIL | No navigator.modelContext tools on the home page. | Waits, see F6 | Browser tools on a catalog page are worth a look after the data is right, not before |
| API, auth, MCP and A2A | ard | FAIL | No capability manifest at the well-known path. | Waits, see F6 | Same as the server card |
| Commerce | x402 | FAIL | No 402 challenge on any route. | Stays red on purpose, F8 | No agent checkout this year, by the company's own decision |
| Commerce | mpp | FAIL | No payment discovery document. | Stays red on purpose, F8 | Same |
| Commerce | ucp | FAIL | No /.well-known/ucp. | Stays red on purpose, F8 | Same |
| Commerce | acp | FAIL | No ACP discovery document. | Stays red on purpose, F8 | Same |
| Commerce | ap2 | FAIL | No AP2 declaration. | Stays red on purpose, F8 | Same |

Category totals: Discoverability 2 of 4, Content 0 of 1, Bot access control 0 of 2, API, auth, MCP and A2A 0 of 9, Commerce 0 of 5. Overall 2 of 21 scored checks, Level 1 of 5.

After F2, F3, F5, F6 and F7: Discoverability 4 of 4, Content 1 of 1, Bot access control 2 of 2, API, auth, MCP and A2A 1 of 9, Commerce 0 of 5. Overall 8 of 21, and the report does not translate that into a level, because the level on the retest day depends on the check set the scanner runs that day.

## Manual review

The surfaces the scanner does not score, read by hand on 2026-09-03 and 2026-09-04.

| Surface | Reading | Finding |
| --- | --- | --- |
| First response as a bot | Every page returns its full HTML on the first response. No script shell, no prerender. | No finding. The content is there, it is only expensive to read. |
| JSON-LD, product pages | Product node on all 138 pages: price 0.00, priceCurrency EUR, availability InStock. The 19 products with variants publish one node for the whole product and nothing per variant. The 12 products priced per box of 100 carry no unit. | F1 |
| JSON-LD, home and category pages | Organization node with name and logo, no address, no taxID, no sameAs. WebSite node present. No BreadcrumbList. | F9 adds the address. The rest is recorded, no fix in this round. Completeness, not correctness. |
| Head metadata and Open Graph | Title and description present on all seven pages read. og:image missing on the five product pages. | Recorded, no fix in this round. |
| HTTP response headers | Content-Type correct. No Link, no RateLimit-Policy, no security headers except HSTS. | F3 adds the Link relations. Security headers are in the internet.nl reading below. |
| /.well-known/ | Empty. Every path under it returns the HTML 404 page with status 200. | F3, F6 and F7 populate it. The soft 404 is F6's first line. |
| robots.txt | The CMS default. One wildcard group, Disallow: /wp-admin/, no Sitemap line, no AI crawler, no Content-Signal. | F5 |
| sitemap.xml | 14 URLs. The front page, eleven content pages and two template pages titled Sample Page and Privacy Policy Draft. No product page. | F4 |
| ai.txt and llms.txt | Neither exists. | F3 publishes llms.txt. ai.txt is not published: the norm it followed has merged into robots.txt Content Signals. |
| REST API | /wp-json/wc/store/v1/products answers publicly, 100 products per page, two pages, X-WP-Total 138. Every row has prices.price as an empty string and is_purchasable true. stock_status is instock on 90 rows, onbackorder on 41 and outofstock on 7. | F1 corrects the data, F6 declares the API. |
| Old documents still served | /wp-content/uploads/2022/hinnasto-2022.pdf is a 2022 price list with the company's previous Tampere address on its cover, linked from nowhere on the site and indexed by two search engines. | F9 |

## AI visibility today

Fifteen questions, four assistants, one anonymous run per question on 2026-09-04, 60 answers in all. The question set is fixed so that the same run can be repeated after the fixes and the two runs compared. The four assistants are named in appendix B with the conditions of the run. In the tables below they are A to D, because the answers on this page are invented and an invented answer is not put in a real product's mouth. A real report names the assistant on every row.

| Question group | Questions | Answers | Northwind named | Correct where named | What the assistants did instead |
| --- | --- | --- | --- | --- | --- |
| Category, no company name. "Where can a Finnish workshop buy DIN 933 bolts in bulk online" and eleven like it | 12 | 48 | 0 | Not applicable | Named three national distributors and two marketplaces. Two answers cited a distributor's price list page and quoted its markdown form as the source |
| Company by name. "What does Northwind Fasteners sell" and two like it | 3 | 12 | 12 | 9 | Two answers gave the Tampere address the company left in 2023. One answer said the catalog is free, citing the structured data F1 corrects |

Every material error has a source read on the site or off it, a follow-up in this report, an owner and a retest, so that the retest can say whether the error is gone and why.

| Error | Answers | Source read | Follow-up | Owner | Retest |
| --- | --- | --- | --- | --- | --- |
| The catalog is free | 1 of 12, assistant B | The answer cited the product page, whose JSON-LD says price 0.00. Read on 2026-09-04, appendix A, chain 1 | F1 | Edge, turva.dev. Source, the agency | The three by-name questions, same conditions. The error is closed when no answer states a price the page does not show |
| The company is at the old Tampere address | 2 of 12, assistants A and C | A cited a business directory listing that still carries the old address. C cited the 2022 price list PDF at /wp-content/uploads/2022/hinnasto-2022.pdf. The site's own Organization node has no address at all, so neither assistant could have read the current one from structured data | F9 | The company for the PDF and the directory. Edge, turva.dev, for the Organization node | The three by-name questions. Closed when both answers give the current address or none. The directory is a third party, and if it has not corrected its listing by the retest the report says so rather than counting the answer against the site |

What is recorded and is not an error. Two category answers cited a distributor's price list page as markdown. That is an observation about the distributor's site and this report draws no conclusion from it about Northwind's. One category answer named no Finnish source at all. Nothing in this run shows why any assistant chose the sources it chose, and the report does not guess.

What this measures. Whether an assistant names the company when a buyer describes the need, and whether it gets the facts right when it does. It does not measure ranking, and nothing in this report predicts how the run reads after the fixes. The same 15 questions are run again at the retest under the same conditions, and the two tables are printed side by side.

## Published security scans

Run on 2026-09-04, recorded so that the client can re-run them without turva.dev.

| Scan | Reading | What it means for agents |
| --- | --- | --- |
| internet.nl website test | 64 of 100. IPv6 absent, DNSSEC absent, HTTPS configuration passes, security headers partial. | DNSSEC is a prerequisite of the dnsAid check, so F7 moves this reading too. |
| internet.nl mail test | 55 of 100. SPF present, DKIM present, DMARC policy none. | Not an agent surface. Recorded because a buyer checks it. |
| Hardenize | 17 of 24 categories passed. CAA, DNSSEC, HSTS preload, CSP, Referrer-Policy, security.txt and cookies did not. | security.txt is a five line file the same edge worker serves. It is listed under F3 as a same-day addition. |

## Findings

Nine findings. Each carries the evidence as read, what it costs the company, the change, who does it and roughly how long, and the test that proves it done. Where a finding names an effect on agents, it says whether the effect was observed in this run, is possible, or was shown to follow from the cause. The order is by impact on a buyer first and on the score second.

### F1. Every product publishes a price of 0 and an availability of InStock, on all three surfaces

**Category.** Structured data. Manual review, not scored. Invented reading for northwind-fasteners.example, like every figure in this sample.

**Evidence.** GET /products/din-933-m12x40-a2/ on 2026-09-03 returns a JSON-LD Product node with "price": "0.00", "priceCurrency": "EUR" and "availability": "https://schema.org/InStock". The visible page shows 0,42 EUR per piece, VAT 0 %, and a lead time of six weeks. The same node shape appears on all 138 product pages, read by fetching both pages of /wp-json/wc/store/v1/products, following every product URL and reading the price field of each. The API returns prices.price as an empty string and is_purchasable true for every product, and its stock_status field is instock for 90 products, onbackorder for 41 and outofstock for 7. The 19 products that come in several thread lengths show a price per variant on the page and publish one Product node with one price for all of them. The 12 products sold by the box of 100 show the box price on the page and publish it in JSON-LD as if it were the price of one piece.

**Impact.** No scanner points, and the highest impact in this report. Observed in this run: one by-name answer on 2026-09-04 told a buyer the catalog is free and cited the product page. Possible and not observed: an agent that reads the API as data gets an empty price and a purchasable flag, and an agent that reads a per-box price as a per-piece price quotes a hundred times too much. Wrong data is worse than missing data: missing data makes an agent guess, wrong data makes it confident.

**Change.** Publish, on the visible page, in the JSON-LD and in the API, the same price, the same currency, the same price basis and the same availability for every product and every variant in the catalog. Four rules, and the acceptance test reads them back.

- Price and currency. The JSON-LD Offer price is the number the page shows, in EUR, VAT excluded as the page states, and the API price is the same number in minor units. Prices are not rounded on one surface and not on another.
- Price basis. A product sold by the box carries a UnitPriceSpecification with referenceQuantity 100 in JSON-LD and its unit in the API, so the number is never read as a per-piece price.
- Availability from the stock state, not from the lead time text. InStock when stock_status is instock, BackOrder when it is onbackorder, OutOfStock when it is outofstock. PreOrder is not used: no product in this catalog has a release date, and a lead time on an existing product is a BackOrder with a deliveryLeadTime of six weeks, not a pre-order. The lead time is published in that field and in the page text, and it does not decide the availability value on its own.
- Variants. The 19 variable products publish one offer per variant, 61 in all, with the variant's own price and stock state, matching the variation list the page shows and the variations array the API returns.

Exceptions, listed so that the acceptance test does not read them as failures. Six products are priced on request: the page says so, and they carry no price in JSON-LD or in the API, only an availability from their stock state. Four products are discontinued and still published: they carry availability Discontinued and no price, and decision D4 says whether they stay published at all. The tests below skip the price on those ten and test the availability on the six.

**Owner and effort.** Two owners, and the report keeps them apart. The permanent fix is at the source, in the catalog plugin's structured data mapping and in the setting that hides prices from the API for anonymous readers, and it belongs to the company's web agency: about two and a half hours. When turva.dev implements the list, the JSON-LD is corrected at the edge on the way through, on every product page, from the price, unit, variant and stock elements the page itself renders, so the served node is right from the day the worker goes live: about three hours, plus one hour for the whole-catalog acceptance script the company keeps. The edge cannot correct the API, because the API's empty price is the origin withholding data and there is nothing on the way through to correct it from: the API rows are the agency's, and the acceptance below says which rows are whose.

**Acceptance test.** A script the company keeps, delivered with the report, and run against the live site. It fetches both API pages, checks that the API total, the sitemap product count and the number of product pages agree at 138, follows every product URL, and for every offer compares the visible page, the JSON-LD and the API on price in minor units, currency, price basis and availability. The catalog has 170 price rows, 109 simple products and 61 variants, and 176 availability rows, the same plus the six price-on-request products. The edge delivery is accepted when the JSON-LD column matches the visible page on every one of the 170 and the 176, and when the four discontinued products read Discontinued. The API column is reported per row, and any row where the API still differs is listed as the agency's remaining work with the product URL, not hidden inside a total. The manual finding closes when all three columns agree on every row. Appendix A, chain 1, shows one row of this test end to end.

**Guide.** [JSON-LD and structured data for AI clients](/guides/json-ld-structured-data).

### F2. Serve markdown next to HTML

**Category.** Content accessibility. Scored check markdownNegotiation. Invented reading for northwind-fasteners.example, like every figure in this sample.

**Evidence.** GET / with Accept: text/markdown on 2026-09-03 returns Content-Type text/html and a 212 kB body. The same request to /products/ and to a product page returns HTML of 340 kB and 188 kB. No .md address exists for any page. The markdown form of the home page, produced from the same HTML on 2026-09-03, is 9 kB.

**Impact.** One scored check. Observed: the three page sizes above, and the 9 kB markdown form of the home page. Possible and not observed: an assistant with a fixed reading budget stops before the end of a 212 kB page. Nothing in the AI run of 2026-09-04 shows an assistant truncating a Northwind page, and the report does not claim it.

**Change.** Put an edge worker in front of the origin that answers a text/markdown request with the markdown form of the page at the same address, and publishes each page at its .md address as well. The origin is not touched. The worker converts the rendered HTML on the way through and caches the result per URL. This is the worker every other edge finding in this report lives in, so its cost is paid once, and the acceptance list below is the acceptance list of the edge itself.

**Owner and effort.** turva.dev or the company's developer, at the edge. About four hours, of which the acceptance list is one.

**Acceptance test.** Every line is checked on the home page, on /products/ and on three product pages, one of them a variable product, and the list is delivered filled in.

- Content negotiation. A request with Accept: text/markdown returns Content-Type: text/markdown and a body that starts with the page title as a heading. A request with Accept: text/html, or with no Accept header, returns the HTML exactly as the origin serves it. A request that lists both with a higher q on text/html gets HTML.
- Separate caches. Every response carries Vary: Accept, so no cache serves the markdown form to a browser or the HTML form to an agent that asked for markdown. Checked by requesting the two forms in both orders from a cold cache.
- Freshness. The markdown form of a product page is not older than the origin's own page: the worker revalidates against the origin on every request or caches the markdown for at most ten minutes, and a price changed at the origin appears in the markdown within that time. Checked by comparing the price in the markdown form with the visible page at the end of the F1 acceptance run.
- Canonicals. The .md twin carries Link: rel="canonical" pointing at the HTML page, and the HTML page carries rel="alternate" type="text/markdown" pointing at the twin, so search engines see one page and not two.
- HTTP statuses. A page the origin serves with 404 is 404 in markdown. A 301 from the origin is passed through as a 301, not converted. An origin 500 is passed through as 500 and is never cached as markdown.
- Scope. /cart/, /checkout/, /my-account/, /wp-admin/, /wp-login.php, every /wp-json/ route and every response that sets a cookie or carries a session are passed through untouched and never converted or cached. Checked by requesting each with Accept: text/markdown and reading the response unchanged.
- The scanner. markdownNegotiation reads PASS on the next full scan.

**Guide.** [Serving Markdown to AI clients](/guides/markdown-for-agents).

### F3. Publish llms.txt and announce it in the Link header

**Category.** Discoverability. Scored check linkHeaders. Invented reading for northwind-fasteners.example, like every figure in this sample.

**Evidence.** GET /llms.txt on 2026-09-03 returns the HTML 404 page with status 200. No response on the site carries a Link header. GET /.well-known/security.txt returns the same soft 404.

**Impact.** One scored check. Observed: no file, no header. Possible and not observed: an assistant that looks for llms.txt gets a 200 with an HTML body and has to read the whole page to learn there is nothing there. The AI run of 2026-09-04 does not show whether any of the four assistants asked for the file, and the report does not claim that they do.

**Change.** Write /llms.txt by hand: the company name, a four line summary, and the pages that matter grouped as products, delivery terms, technical documents and contact, each as an absolute link to the page's markdown form from F2. Announce it with Link: rel="describedby" on every response and add rel="alternate" type="text/markdown" pointing at the page's own .md twin. Serve /.well-known/security.txt from the same worker with a contact address and an expiry date, which closes one Hardenize category the same day.

**Owner and effort.** turva.dev or the company's developer, at the edge. About 90 minutes. The text of llms.txt is decision D3: it goes live after the company has read it, because it is the company's own description of itself.

**Acceptance test.** linkHeaders reads PASS on the next full scan. The free validator at [turva.dev/llms-txt-validator](/llms-txt-validator) reads the file as valid with every link resolving. GET /.well-known/security.txt returns text/plain with status 200 and an Expires date in the future.

**Guides.** [llms.txt explained](/guides/llms-txt) and [Response headers for AI clients](/guides/response-headers-for-agents).

### F4. The sitemap lists two template pages and misses the catalog

**Category.** Discoverability. Manual review, not scored. The sitemap check passes and stays green. Invented reading for northwind-fasteners.example, like every figure in this sample.

**Evidence.** GET /sitemap.xml on 2026-09-03 lists 14 URLs: the front page, eleven content pages and two CMS template pages titled Sample Page and Privacy Policy Draft. None of the 138 product URLs is in it. robots.txt carries no Sitemap line.

**Impact.** No scanner points. Observed: a sitemap with 14 pages and no product, and two template pages that two search engines index today. Possible and not observed: a reader that starts from the sitemap and reads only what it lists never reaches a product page. The report does not claim any assistant read the sitemap on 2026-09-04.

**Change.** At the source: let the catalog plugin generate a product sitemap, reference it from a sitemap index, remove the two template pages from the site or from the sitemap, and add one Sitemap line to robots.txt. Four settings, no code. At the edge, when turva.dev implements the list: serve a product sitemap generated from the API and a sitemap index in front of the CMS one, and the robots.txt line comes with F5, so the acceptance test passes without waiting for the agency.

**Owner and effort.** The four settings belong to the company's web agency: about half an hour. The edge sitemap is about half an hour.

**Acceptance test.** The sitemap index references a product sitemap that lists every product URL, the count agrees with the API total from F1, no template page appears, and robots.txt names the index. The scored check stays green either way, which is why this is a manual finding.

**Guide.** [Sitemaps, robots.txt and agents](/guides/sitemaps-and-robots-for-agents).

### F5. Name the AI crawlers and declare Content Signals in robots.txt

**Category.** Bot access control. Scored checks robotsTxtAiRules and contentSignals. Invented reading for northwind-fasteners.example, like every figure in this sample.

**Evidence.** /robots.txt on 2026-09-03 is the CMS default: User-agent: *, Disallow: /wp-admin/, Allow: /wp-admin/admin-ajax.php. No AI crawler is named and no Content-Signal line exists.

**Impact.** Two scored checks. Observed: the file says nothing about AI crawlers. Possible and not observed: a crawler that reads the file finds no rule for itself and applies its own default, whatever that is. One assistant on 2026-09-04 cited a distributor's copy of a product page instead of Northwind's, and the report records that as an observation only: nothing in the run shows that robots.txt had anything to do with the choice.

**Change.** Add named groups for the crawlers the company wants to allow, and one Content-Signal line that states search yes, ai-input yes, ai-train no, or whichever preference the company holds under decision D2. The line is a stated preference and not an enforcement mechanism, and the file says so in a comment where it appears. The company decides the preference, the report only records what the file says today.

**Owner and effort.** The company decides, the edge worker serves the file. About half an hour once the preference is decided.

**Acceptance test.** robotsTxtAiRules and contentSignals read PASS on the next full scan, and the file names the crawlers the company chose.

**Guide.** [Sitemaps, robots.txt and agents](/guides/sitemaps-and-robots-for-agents).

### F6. Tell agents that the REST API exists

**Category.** API, auth, MCP and A2A. Scored check apiCatalog. Invented reading for northwind-fasteners.example, like every figure in this sample.

**Evidence.** The site runs a public read-only REST API at /wp-json/ with the product catalog behind it at /wp-json/wc/store/v1/products, and no discovery file names it. GET /.well-known/api-catalog on 2026-09-03 returns the HTML 404 page with status 200, as does every path under /.well-known/. The scanner reads apiCatalog as failing along with the eight other checks in the category. Appendix A, chain 3, carries the request and the response.

**Impact.** One scored check now, and the cheapest step in the category. Observed: the API answers and nothing announces it, and every well-known probe gets a 200 with an HTML body. Possible and not observed: an agent that finds the API reads the catalog as data instead of scraping HTML, which is only worth anything once F1 has made the data right.

**Change.** Publish /.well-known/api-catalog, one JSON linkset that names the /wp-json/ base URL and its description, with the content type application/linkset+json. Make every other path under /.well-known/ return a real 404. The other eight checks in the category need an authentication story or an MCP server and are not declared until one exists: a server card that points at no server is a false claim, and this report does not recommend one.

**Owner and effort.** turva.dev or the company's developer, at the edge. About half an hour.

**Acceptance test.** apiCatalog reads PASS on the next full scan. The category reads 1 of 9, and the retest report says which eight are left and why they wait. GET /.well-known/nothing returns 404 with a short plain text body.

**Guide.** [The /.well-known directory for agent discovery](/guides/well-known-for-agents).

### F7. Publish a DNS-AID record once the discovery files exist

**Category.** Discoverability. Scored check dnsAid. Invented reading for northwind-fasteners.example, like every figure in this sample.

**Evidence.** No _index._agents record exists under northwind-fasteners.example, and DNSSEC is not enabled at the registrar, which internet.nl also reports.

**Impact.** One scored check. This is the check that needs the company's DNS rather than the edge worker, which is why it is last among the scored fixes. DNSSEC also moves the internet.nl website reading.

**What the check reads, with versions.** The record shape follows the IETF draft DNS for AI Discovery, draft-mozleywilliams-dnsop-dnsaid-02, which defines _index._agents under the domain as an SVCB record pointing at the organisation's agent index. The scanner's dnsAid check, as it read on 2026-09-03, looks for that record and reports whether DNSSEC validated it. Both are moving: the draft has a revision number and an expiry date, and the scanner's check definition is not versioned by the scanner, so the report pins both to their state on 2026-09-03 and the retest reads them against their state on the retest day. If either has moved between the two dates, the retest report names both versions next to the two readings rather than treating the readings as comparable.

**Change.** After the files above are live, add the _index._agents SVCB record pointing at the site and enable DNSSEC at the registrar. The exact record text, as of draft 02, is carried in the delivery, and the report does not reproduce it here because it is the part most likely to change between now and the retest.

**Owner and effort.** The surface belongs to the company's IT, at the registrar. About half an hour, plus the DNSSEC propagation wait. When turva.dev implements the list and the written arrangement covers the DNS zone, both records are added from the delivery. Without that access this is the one item that stays with the company, and the acceptance in Who does what says what the retest reads in that case.

**Acceptance test.** dnsAid reads PASS on the next full scan, once DNSSEC validates. internet.nl website test shows DNSSEC as passing. The retest report states the draft revision and the scanner check definition date the reading was taken against.

**Guide.** [The /.well-known directory for agent discovery](/guides/well-known-for-agents), which covers the discovery index the record points at.

### F8. Declare no agent commerce surface until a checkout can back it

**Category.** Commerce. Scored checks x402, mpp, ucp, acp and ap2. Invented reading for northwind-fasteners.example, like every figure in this sample.

**Evidence.** The store checks out through a browser form with a card payment page. None of the five agent commerce surfaces the scanner reads is declared: an x402 payment challenge, an MPP payment discovery document, a UCP profile, an ACP discovery document or an AP2 declaration. All five commerce checks read FAIL.

**Impact.** Five scored checks, and none of them is worth flipping this year. A commerce declaration that points at a checkout an agent cannot complete is a false claim, and the scanner cannot tell the difference between a declaration and a working checkout.

**Change.** No change. The company said at the kickoff that agents do not buy here this year, and that is decision D5. When it changes, agent checkout is a separate engagement scoped from the payment side, and the report makes no recommendation about which of the five surfaces to declare first, because the only reason to pick one on the evidence here would be that it scores, and that is not a reason.

**Owner and effort.** The company's management, as a decision. No hours in this round.

**Acceptance test.** The five checks stay red on the next scan, on purpose, and the retest report repeats this entry so that nobody reads the red as an oversight.

**Guides.** [Agent commerce discovery](/guides/agent-commerce-discovery) and [Agentic commerce readiness](/guides/agentic-commerce-readiness).

### F9. The old address is still published in two places and the current one in none an agent reads

**Category.** Correctness of published facts. Manual review, not scored, raised by the AI run. Invented reading for northwind-fasteners.example, like every figure in this sample.

**Evidence.** Two of the twelve by-name answers on 2026-09-04 gave the Tampere address the company left in 2023. Assistant A cited a business directory listing that still carries it. Assistant C cited /wp-content/uploads/2022/hinnasto-2022.pdf, a 2022 price list on the company's own site with the old address on its cover, linked from no page and indexed by two search engines. The site's Organization node carries no address, and the current address appears only as text on the contact page.

**Impact.** No scanner points. Observed: two wrong answers in twelve. Possible and not observed: a buyer's assistant sends a visitor or a delivery to the wrong city.

**Change.** Three parts with three owners. Add a PostalAddress with the current address to the Organization node on every page, which the edge does from the text the company confirms. Remove the 2022 PDF or replace it with the current price list at the same address, which the company does, because the file is the company's own and a price list from 2022 is wrong on more than the address. Ask the directory to correct its listing, which the company does and which is outside anyone's control here.

**Owner and effort.** Edge, about half an hour. Company, about an hour including the directory request.

**Acceptance test.** The Organization node on the home page carries the current address. GET /wp-content/uploads/2022/hinnasto-2022.pdf returns 404 or the current list. The three by-name questions at the retest give the current address or none. If the directory still carries the old address on the retest day, the report records that as the directory's state and not as a failure of the site.

**Guide.** [JSON-LD and structured data for AI clients](/guides/json-ld-structured-data).

## What happens next

Three routes, and the report is written so that any of them works.

- The company's team does the work from this report. Every finding carries its change and its acceptance test, the section Who does what says which acceptance belongs to which owner, and the guides linked above carry the patterns.
- turva.dev implements the edge column of every finding for the fixed price on the services page, bought together with the audit. That price needs the prerequisites listed under Who does what, arranged in writing before the work starts. The source column stays with the company and its agency whichever route is chosen.
- Nothing is done, and the report stands as a dated record of where the site was on 2026-09-03.

In every case the retest is the same, and it is included in the audit price: once within 30 days of this report, so by 2026-10-08, on the day the company names, the scanner is run again with the same profile, the whole-catalog script from F1 is run again, the 15 questions are put to the same four assistants under the same conditions, and the readings are printed next to the ones above with the versions from F7 stated. One round of written follow-up questions is open until 2026-09-22.

## What this report is not

It is not a penetration test, a certification, an SEO audit or a promise of ranking on any AI platform. It reads what the site publishes and records what four assistants said on one day. Where it says an agent may do something, it says so as a possibility and not as a measurement. It does not read the organisation's readiness to adopt agents, which is a different question that often goes by the same name.

## Appendix A. Evidence chains

Three findings shown end to end: the request as sent, the response as read, the observation, the change, and the acceptance reading as it will appear in the retest report. In this sample the acceptance readings are invented like everything else, and they are shown so that the shape of a closed finding is visible. In a real report the last row is empty until the retest.

Chain 1, F1, one row of the whole-catalog test.

| Step | Content |
| --- | --- |
| Request | GET /products/din-933-m12x40-a2/ on the host northwind-fasteners.example with Accept: text/html, 2026-09-03 |
| Response excerpt | Visible: 0,42 EUR / kpl, alv 0 %, toimitusaika 6 viikkoa. JSON-LD: "@type": "Product", "offers": {"price": "0.00", "priceCurrency": "EUR", "availability": "https://schema.org/InStock"} |
| Second request | GET /wp-json/wc/store/v1/products?slug=din-933-m12x40-a2 on the same host |
| Response excerpt | "prices": {"price": "", "currency_code": "EUR", "currency_minor_unit": 2}, "is_purchasable": true, "stock_status": "onbackorder" |
| Observation | Three surfaces, three answers: 0,42 EUR with a six week lead time, 0,00 EUR in stock, and no price at all but purchasable |
| Change | JSON-LD from the page's own price and stock elements at the edge. Plugin mapping and API price visibility at the source. Availability from stock_status onbackorder, so BackOrder with deliveryLeadTime 6 weeks |
| Acceptance reading | JSON-LD "price": "0.42", "availability": "https://schema.org/BackOrder", "deliveryLeadTime": 6 weeks. API "price": "42", "stock_status": "onbackorder". Row ALIGNED on all three surfaces, and the script's total line reads 170 of 170 price rows and 176 of 176 availability rows aligned. The API column reads right here because the agency has done its source work by the retest day. The edge delivery alone is accepted on the JSON-LD column, as Who does what says |

Chain 2, F2, markdown negotiation on the home page.

| Step | Content |
| --- | --- |
| Request | GET / on the host northwind-fasteners.example with Accept: text/markdown, 2026-09-03 |
| Response excerpt | HTTP 200, Content-Type: text/html, Content-Length 217088, no Vary header, no Link header, body starts with the HTML doctype |
| Observation | The origin ignores the Accept header. 212 kB of markup for a page whose markdown form is 9 kB |
| Change | Edge worker converts the rendered HTML on the way through and serves it at the same address and at /index.md, with the acceptance list in F2 |
| Acceptance reading | HTTP 200, Content-Type: text/markdown, Vary: Accept, Link: rel="canonical" to the HTML page, body starts with the page title as a heading, 9 216 bytes. The same request to /cart/ passes through as HTML untouched. markdownNegotiation PASS on the retest scan |

Chain 3, F6, the soft 404 under /.well-known/.

| Step | Content |
| --- | --- |
| Request | GET /.well-known/api-catalog on the host northwind-fasteners.example with Accept: application/linkset+json, 2026-09-03 |
| Response excerpt | HTTP 200, Content-Type: text/html, body is the theme's page titled Sivua ei löytynyt |
| Observation | A probe for a manifest gets a 200 and an HTML page. Every path under /.well-known/ answers the same way, so nothing under it can be trusted by status alone |
| Change | Serve the linkset at /.well-known/api-catalog with application/linkset+json, and return a real 404 with a plain text body for every other path under /.well-known/ that the edge does not serve |
| Acceptance reading | /.well-known/api-catalog: HTTP 200, application/linkset+json, one link with rel service-desc to /wp-json/. /.well-known/nothing: HTTP 404, text/plain. apiCatalog PASS on the retest scan, category 1 of 9 |

## Appendix B. The questions and the measurement conditions

The four assistants are ChatGPT, Gemini, Perplexity and Google AI Mode, the same four as in the [published measurement of fifty buyer questions](/blog/what-ai-assistants-call-an-agent-readiness-audit). Claude is not measured because it requires a login. Each question was put once to each assistant on 2026-09-04 between 09:00 and 12:00 EEST, in a fresh conversation without memory, without an account where the platform allows it, with web browsing on, from a Finnish network location, in the language the question is written in. Where a platform did not answer, the row would read missing, and none did on the day. The retest repeats every condition and the report states any that could not be repeated.

Category questions, no company name, 12.

- Mistä suomalainen konepaja voi ostaa DIN 933 -pultteja tukkuerissä verkosta?
- Where can a Finnish workshop buy DIN 933 bolts in bulk online?
- Mikä suomalainen tukkuri myy A2-haponkestäviä ruuveja yrityksille?
- Which Finnish wholesaler sells A2 stainless fasteners to businesses?
- Mistä saa M12-kuusioruuveja sadan kappaleen laatikoissa Suomessa?
- Kuka toimittaa kiinnitystarvikkeita teollisuudelle Pirkanmaalla?
- Where do I buy DIN 912 socket head screws in Finland with business invoicing?
- Mikä on halvin paikka ostaa sinkittyjä muttereita tukkuhintaan Suomessa?
- Which Finnish fastener suppliers publish their prices online without a login?
- Mistä löydän teollisuuden kiinnikkeiden toimittajan, jolla on kuuden viikon toimitusajat isoille erille?
- Suomalainen ruuvitukku, joka toimittaa seuraavana päivänä, mitä vaihtoehtoja on?
- Which Finnish suppliers of industrial fasteners have an online catalog with stock information?

Questions by name, 3.

- Mitä Northwind Fasteners myy?
- What does Northwind Fasteners sell and where is the company located?
- Paljonko DIN 933 M12x40 A2 maksaa Northwind Fastenersilta?

## About this sample

Every figure on this page is invented. The check names, the categories and the statuses are the scanner's real vocabulary as it stood on 2026-09-03, the draft name in F7 is the real IETF draft, and the four assistants in appendix B are the four the published measurement used, so that the sample shows how a real report reads. The site, the readings, the assistants' answers, the addresses and the security scores are fiction. A real report carries the raw scanner output, the request and response logs, the whole-catalog script and its output and the 60 AI answers with the assistant named on each.

The audit is described on the [services page](/services). To start one, [email info@turva.dev](mailto:info@turva.dev?subject=Agent-readiness%20audit&body=Site%20or%20API%20URL%3A%20%0AWhat%20the%20audit%20should%20answer%3A%20%0A) with the site or API URL and what the audit should answer. The Shopify agent storefront check has its own [sample report](/samples/shopify-agent-storefront-check).
`,

  "/samples/shopify-agent-storefront-check": `# A Shopify check, from product data to corrections

Northstar Outdoor is an invented store used to demonstrate the report. See the three-surface map, product comparisons, buyer-journey evidence and correction plan. All store data, observations and report dates are fictional.

Illustrative report date: 8 September 2026. This is a synthetic sample of the Shopify agent storefront check report: the store Northstar Outdoor, its .myshopify.com domain, the three products, every price and every observation are invented to show the format and the depth a paying merchant receives. Nothing on this page describes a real store, and no figure here has been measured on a real storefront. A real report carries the tool call log and the redacted settings evidence as an appendix, which this sample leaves out.

## Decision

Correct two data mismatches before sending more agent traffic to the store. The three agent surfaces were all observable, the browser cart worked in the agreed anonymous session and the checkout handoff landed in the right store. Two of the three tested products showed a difference between surfaces: one price two euros higher on the remote catalog than on the storefront, and one variant marked unavailable on the Agentic preview while the storefront sells it. A documented match is what the merchant is paying to be able to show, and two of three products do not have one yet.

Nothing was paid, ordered or signed in. No customer detail was entered.

## Contents

- [Decision](#decision)
- [Engagement record](#engagement-record)
- [Three-surface map](#three-surface-map)
- [Product truth matrix](#product-truth-matrix)
- [Buyer-journey evidence](#buyer-journey-evidence)
- [Correction plan](#correction-plan), C1 to C3
- [Configuration changes the check does not recommend](#configuration-changes-the-check-does-not-recommend)
- [Limits and what stays unresolved](#limits-and-what-stays-unresolved)
- [Retest](#retest)
- [What this report is not](#what-this-report-is-not)
- [About this sample](#about-this-sample)

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

## Three-surface map

What is present, restricted, unavailable or not tested on each of the three surfaces, in the same session and against the same three products. Present means the surface answered and was exercised within scope. Restricted means it answered but refused part of the scope. Unavailable means it did not answer. Not tested means the scope stopped before it.

| Surface | Status | What was verified | What was not |
| --- | --- | --- | --- |
| Browser WebMCP, in the shopper's live storefront tab | Present | Ten tools registered on navigator.modelContext: browse_store, search_catalog, get_product, show_variant, update_cart, get_cart, cancel_cart, proceed_to_checkout, search_shop_policies_and_faqs and manage_orders. Eight were called within scope. One anonymous cart built and emptied. | manage_orders and browse_store were not called, and proceed_to_checkout was called once for the permitted navigation only. No customer account was opened. |
| Shopify-hosted Storefront MCP and UCP MCP | Present | Catalog search and product read answered at protocol level. One remote UCP cart was created with the blue Trail Bottle and cancelled without a buyer identity. | Checkout MCP was not reached, by scope. |
| Shopify Catalog and Agentic storefront channels | Present | Catalog access on, auto-enrolment of new products on, one channel active, read from the merchant's redacted settings evidence. Catalog search preview run for the three products. | Channel ranking or sales were not measured. Settings were not changed. |

Finding a surface is a fact about availability. It is not a certification, an endorsement or a security claim.

## Product truth matrix

The tested title, variant, price, currency, availability and policy facts on each surface, read in the same market, language, currency and hour. A Mismatch was reproduced once before it was recorded.

| Product and variant | Storefront page | Browser WebMCP | Storefront and UCP MCP | Agentic Catalog preview | Result |
| --- | --- | --- | --- | --- | --- |
| Trail Bottle 750 ml, blue | 29,90 EUR, in stock | 29,90 EUR, in stock | 31,90 EUR, in stock | 29,90 EUR, in stock | Mismatch, remote price |
| Merino Base Layer, M | 79,00 EUR, in stock | 79,00 EUR, in stock | 79,00 EUR, in stock | 79,00 EUR, unavailable | Mismatch, variant eligibility |
| Camp Mug, green | 18,50 EUR, in stock | 18,50 EUR, in stock | 18,50 EUR, in stock | 18,50 EUR, in stock | Aligned |

Policy facts. The return window of 30 days, free shipping above 80 EUR and the delivery estimate of two to four working days matched on the storefront page, in the WebMCP policy tool and in the Storefront MCP policy read. The Agentic Catalog preview carries no policy fields, which is the surface's shape and not a mismatch.

The price difference was reproduced at 11:20 and 14:05 EEST in the same market, language and currency before Mismatch was recorded. The availability difference was confirmed against the merchant's redacted Catalog settings screenshot, where the M variant is marked not eligible. No setting was changed during the test.

## Buyer-journey evidence

The five buyer searches and the cart lifecycle, each with the tool, the input, the observed result and the cart state. The session stopped before payment or order creation, and the exact stop is recorded.

| Step | Tool and input | Observed result | Cart state | Status |
| --- | --- | --- | --- | --- |
| Search 1, "light bottle for a day hike" | WebMCP search_catalog, fi-FI | Trail Bottle 750 ml returned first, blue variant listed with price and stock | Empty | Aligned |
| Search 2, "merino base layer size M" | WebMCP search_catalog | Merino Base Layer returned, M variant listed as in stock | Empty | Aligned |
| Search 3, "camp mug green" | WebMCP search_catalog | Camp Mug returned, green variant listed | Empty | Aligned |
| Search 4, "waterproof jacket" | WebMCP search_catalog | Two jackets returned, both outside the scope, no claim recorded | Empty | Observed |
| Search 5, "return policy" | WebMCP search_shop_policies_and_faqs | 30 day return window returned, matches the storefront policy page | Empty | Aligned |
| Product detail | WebMCP get_product and show_variant, Trail Bottle blue | Material, volume, price 29,90 EUR and stock matched the storefront page | Empty | Aligned |
| Add to cart | WebMCP update_cart, one blue Trail Bottle | Cart line created, quantity 1, line price 29,90 EUR | One line, 29,90 EUR | Aligned |
| Cart read | WebMCP get_cart | One line, 29,90 EUR, matches the visible storefront cart drawer | One line, 29,90 EUR | Aligned |
| Checkout handoff | WebMCP proceed_to_checkout, the one permitted navigation | Landed on the store's own checkout page, correct store, correct line | One line, 29,90 EUR | Observed |
| Payment and order | None | No form filled, no payment method entered, no order created. This is the stop | One line, 29,90 EUR | Not tested |
| Remote UCP cart | Storefront MCP cart create, one blue Trail Bottle | Remote cart created with 31,90 EUR line price, the remote price of the matrix above | Separate remote cart, one line | Mismatch, same cause as the matrix |
| Cleanup | WebMCP cancel_cart. UCP cart cancelled | Browser cart empty, storefront drawer empty, remote cart cancelled | Empty | Aligned |

The checkout handoff means one navigation to the checkout page. It does not mean that payment or an order was completed, and neither was.

## Correction plan

Up to five specific changes, each with its owner and an acceptance check the merchant can run without turva.dev. This plan carries three, because the check found three things to change. The order is by effect on a buyer.

### C1. Publish the Finnish price list to the remote catalog surface

**What a buyer sees today.** An agent that reads the store through the Storefront or UCP MCP quotes the blue Trail Bottle at 31,90 EUR, two euros above the storefront and the browser tools, and a remote cart is built at that price.

**Owner.** Shopify Markets and product data, on the merchant's side. Invented finding for northstar-outdoor.example, like every figure in this sample.

**Change.** Verify that the Finland market price list is published to the remote catalog and republish it. If the remote surface reads a default price list instead of the market list, the market assignment is the fix, not the product price.

**Acceptance check.** The same variant returns 29,90 EUR on the storefront page, in the WebMCP product read and in the Storefront MCP catalog read within one hour, in the fi-FI Finland EUR context.

### C2. Make the M variant eligible in the Agentic Catalog

**What a buyer sees today.** The M size of the Merino Base Layer is in stock and sellable on every surface except the Agentic Catalog preview, so an AI channel that reads the catalog can leave the sellable size out.

**Owner.** Agentic storefront settings and catalog mapping, on the merchant's side. Invented finding for northstar-outdoor.example, like every figure in this sample.

**Change.** Set the variant's eligibility in the Catalog settings and republish the mapping.

**Acceptance check.** The M variant shows as available in the Catalog preview and in a public agent answer after the propagation time the settings page states.

### C3. Run a three-surface acceptance test after every catalog or market publish

**What a buyer sees today.** Nothing yet. This change keeps C1 and C2 from coming back, because the same difference returns with the next price list, market or theme change.

**Owner.** E-commerce operations, on the merchant's side. Invented finding for northstar-outdoor.example, like every figure in this sample.

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

Up to two corrected items are verified once within 14 days of this package, by 2026-09-20. C1 and C2 are the two items. Each gets the status Aligned, Mismatch or Unknown on direct evidence from the same tools in the same market, language and currency. A surface that cannot be read at the retest reads Unknown, not Aligned. The retest table is printed next to the product truth matrix above.

## What this report is not

It is not a Shopify certification, an endorsement by Shopify, a penetration test or a promise of sales through any AI channel. A browser observation is not a remote MCP surface, and a navigation to the checkout page is not a payment or an order. The check reads what an AI shopper receives from one store in one session and records it.

## About this sample

Every figure on this page is invented. The surface names, the statuses and the shape of the tables are the real deliverables of the check, so that the sample shows how a real report reads, and the store, the products, the prices and the observations are fiction. A real report carries the tool call log with timestamps and the merchant's redacted settings evidence as an appendix.

The check is described on its [product page](/shopify-agent-storefront-check). To start one, [email info@turva.dev](mailto:info@turva.dev?subject=Shopify%20agent%20storefront%20check&body=Storefront%20URL%3A%20%0A.myshopify.com%20domain%3A%20%0APrimary%20market%3A%20%0AUp%20to%20three%20priority%20products%3A%20%0A) with the storefront URL, the .myshopify.com domain, the primary market and up to three priority products. The agent-readiness audit has its own [sample report](/samples/audit-report).
`,

  "/guides/agent-commerce-discovery": `# Agent commerce discovery: A2A, AP2, ACP and UCP

Commerce discovery describes the interfaces and payment-related capabilities a service supports. This guide separates the named protocols and the versions used in each example.

Before an AI agent can transact with a site, it has to discover what the site supports and how to reach it. Four machine-readable surfaces carry that information: an A2A Agent Card, an AP2 declaration, an ACP discovery document, and a UCP profile. Each answers a different question, and an agent reads them before it sends a single commerce request.

| Protocol | Where it lives | What it declares | Question it answers |
| --- | --- | --- | --- |
| A2A | /.well-known/agent-card.json | Agent interfaces and skills | Can I talk to this agent? |
| AP2 | Extension entry in the Agent Card, v0.1 | A merchant role for agent payments | Can this merchant accept agent payments? |
| ACP | /.well-known/acp.json | Transports and a services array | Can I check out here? |
| UCP | /.well-known/ucp | Services, capabilities, payment handlers | What can I do here and how do I pay for it? |

## The A2A Agent Card

An A2A Agent Card is a JSON file, usually at /.well-known/agent-card.json, that describes an agent interface. It states the agent's name, version, and description, the interfaces it exposes, each with a service URL and a protocol binding, the capabilities it declares, and the skills it offers, each skill carrying an id, a name, and a description. The Agent2Agent protocol uses the card so one agent can discover another and know how to reach it.

The card is most useful when its skills mirror surfaces an agent can already reach, such as a service catalog or contact information. A skill that points nowhere is worse than no skill at all.

## AP2 and the version that matters

AP2 is the Agent Payments Protocol. Under the v0.1 specification, which is what deployed sites and scanners still validate against, a merchant declares support as an extension entry inside the A2A Agent Card rather than in a separate file. The entry carries the extension URI, a role such as merchant, and a flag saying whether an agent has to understand the extension.

The detail that trips people up is the URI. Some helper guides write it as "github.com/google-agentic-commerce/AP2/tree/v0.1.0", with an uppercase name and a three-part version. The v0.1 specification uses "github.com/google-agentic-commerce/ap2/tree/v0.1", lowercase, version v0.1. A scanner that validates against that specification rejects the uppercase form even when everything else is correct. Copy the URI from the spec, not from a fix message. The URI is an identifier, not an address: the repository is named AP2 and its tag is v0.1.0, so the lowercase form answers 404 in a browser, and a validator compares the string instead of fetching it. Do not correct the identifier to a working URL to silence the 404. That answer is expected and the validator does not fetch it.

Note that the current AP2 specification, v0.2 from April 2026, restructures the protocol around checkout and payment mandates and drops the Agent Card extension entirely. The deployed discovery convention and the scanners still follow v0.1, so publish the v0.1 declaration for discoverability today and expect this surface to change as v0.2 adoption arrives.

## ACP discovery and checkout

ACP is the Agentic Commerce Protocol, and it has two parts that are easy to confuse. The first is a discovery document at /.well-known/acp.json, which started as a proposal-stage RFC and entered the released specification with the 2026-04-17 snapshot. The second is the checkout API the document points to.

The discovery document is small and strict. It states the protocol name acp and a version, the api_base_url, a transports array, and a capabilities.services array. The services value is a closed set of strings such as checkout, not a list of product objects. Sending the wrong type is the most common reason an otherwise complete document fails validation.

A discovery check usually reads only the document, not the checkout endpoint behind it. That makes it tempting to declare a service the site does not implement, because the check passes either way. An agent that trusts the document and calls the checkout URL would then reach nothing.

### A minimal honest checkout

A checkout endpoint does not have to support instant payment to be real. The ACP checkout session carries a status field, and one of its values is not_ready_for_payment. A site that sells through a written quote can create a genuine session, return it in that state, and attach a message that the engagement is confirmed in writing first. The agent receives a well-formed session that reflects how the business actually works, and the discovery claim holds because the endpoint behind it answers.

## UCP, the fourth surface

The Universal Commerce Protocol adds a profile at /.well-known/ucp. The profile names the merchant, lists the services it offers under namespaced keys, each with a version, a transport and an endpoint, and carries two blocks, capabilities and payment_handlers, that state what an agent may do through the profile and how it may pay. The same rule holds as for the three surfaces above: a capability the profile declares has to answer at the endpoint behind it, and an empty block is more honest than a declared one nothing serves.

A storefront that runs UCP over MCP carries a checkout state called requires_escalation. It means the agent has reached the edge of what it may finish alone, a verification step or a regulatory step for example, and a person completes that step before the session continues. It is a pause in a checkout and not a substitute for one, so a business that sells on a written quote states that through the ACP session state above rather than through this one.

turva.dev publishes a UCP profile with empty capabilities and payment_handlers blocks on purpose, because the code behind it settles nothing automatically, and the Shopify agent storefront check reads a store's UCP surface as one of the three agent surfaces it measures.

## Publish what is true

These surfaces exist so an agent can act without guessing. That only holds when every claim resolves to something real. A card whose skills lead nowhere breaks the same way a checkout that never responds does, because the agent follows the signal and finds nothing.

turva.dev publishes an A2A Agent Card, an AP2 merchant declaration, an ACP discovery document and a UCP profile, and an independent scanner verifies that all four are published. The checkout endpoint behind the discovery document answers as well, which is the part the scanner does not read. For an audit of a site's agent commerce surface, contact info@turva.dev.

## Frequently asked

**What is an A2A Agent Card?**

An A2A Agent Card is a JSON file, usually at /.well-known/agent-card.json, that describes an agent interface, including its name, version, transport, and the skills it offers, so another agent can discover it and know how to reach it.

**What is the correct AP2 extension URI?**

For the AP2 v0.1 Agent Card extension, the URI is "https://github.com/google-agentic-commerce/ap2/tree/v0.1" (lowercase, version v0.1), exactly as that version specifies. This is a compatibility declaration for clients and scanners that implement v0.1, not a requirement of the current AP2 v0.2, which has no Agent Card extension. The isitagentready scanner reads the v0.1 form as of 2026-09-05. Some fix texts show a V0.1.0 form with a capital V and an extra .0, which validators reject.

**Why does an AP2 declaration fail validation?**

Usually the case of the extension URI is the cause. Some fix texts show a V0.1.0 form with a capital V and an extra .0, which validators reject. The accepted form for the v0.1 extension is lowercase and v0.1. A validator built for AP2 v0.2 looks for checkout and payment mandates instead and does not read the Agent Card extension at all, so name the version the validator implements before reading its result.

**What does a UCP profile declare?**

A UCP profile at /.well-known/ucp names the merchant, the services it offers with a transport and an endpoint each, and two blocks for capabilities and payment handlers. A block left empty says the site settles nothing through the profile, which is the truthful state for a business that sells on a written quote.

## Sources

- [A2A protocol specification](https://a2a-protocol.org/latest/specification/)
- [Agent Payments Protocol (AP2) repository](https://github.com/google-agentic-commerce/AP2)
- [Agentic Commerce Protocol (ACP)](https://www.agenticcommerce.dev/)
- [Universal Commerce Protocol (UCP)](https://ucp.dev/)

## Related

- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
- [x402 and HTTP payment flows](/guides/x402-agent-payments)
- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,
  "/blog/moving-off-prerender": `# Moving turva.dev off prerender.io

2026-06-20

A dated account of moving the homepage rendering into a Cloudflare Worker and serving HTML or Markdown from the same public site.

For the general trade-offs of relying on a prerender service, see the [prerendering guide](/guides/prerendering-for-agents).

For a while the turva.dev homepage was rendered by a third party. The page was built on Sitejet, served to people as a JavaScript app, and served to agents through prerender.io, which returned a finished HTML snapshot so a crawler did not read an empty shell. It worked and it scored well, but it was a workaround. I did not want a site that sells agent-readiness to depend on a separate service to be readable by agents.

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

- [When AI clients cannot read rendered pages](/guides/prerendering-for-agents)
- [Serving Markdown to AI clients](/guides/markdown-for-agents)
- [What a website and API agent-readiness audit covers](/guides/agent-readiness-audit)
`,
  "/": `# Know what AI agents see in your product

Technical audits and AI visibility checks for websites and APIs. Focused checks for Shopify stores. You get documented findings and a prioritised plan your team can act on.

Async-only. First reply within one business day. [Scope and pricing](/services).

Technical agent-readiness of turva.dev: 100/100 and Level 5, Agent-Native, on isitagentready.com. Measured 2026-09-06. Business ID 3600281-7, registered in Finland, based in Tampere and run by Erik Rekola.

## Choose the right starting point

Choose a focused Shopify check or a broader website and API audit. Each has a fixed scope and can be bought on its own.

- [Shopify agent storefront check](/shopify-agent-storefront-check). €999. A focused check of what agent-shopping surfaces return for selected products in your Shopify store. It compares product information and documents the buyer journey before payment. Up to three product variants in one market, with a prioritised correction plan. Delivered within 48 hours of the agreed written kickoff.
- [Website and API agent-readiness audit](/services). €4,300. A third-party technical scan, manual review and a documented question set tested across selected AI assistants. You receive written findings, prioritised fixes and one included re-scan. Delivered in two weeks.

Prices exclude VAT. Implementation is purchased separately.

See what each report contains before you buy: the [sample audit report](/samples/audit-report) and the [sample Shopify report](/samples/shopify-agent-storefront-check).

## From an observed problem to a checkable fix

The report connects each finding to evidence, its impact and the next action. Your team can use it without purchasing implementation.

Evidence. See what was tested, what was returned and where the issue appeared.

Priorities. Understand which corrections deserve attention first and why.

Acceptance checks. Know what a successful correction should look like and how to verify it.

The website and API audit combines technical checks with observed AI answers. The Shopify check focuses on product information and the supported shopping journey. The detailed scope is listed with each service.

## A clear process, in writing

Agree the scope. Send the URL and the question you need answered. I confirm the service, required access, price and start date in writing.

Receive the findings. I run the agreed checks and deliver the evidence, priorities and correction instructions in a written report.

Make and verify the corrections. Your team can implement the plan, or you can purchase implementation. The included follow-up check is defined by the service: an audit re-scan within 30 days of the report, or a Shopify retest of up to two corrected items within 14 days.

No calls or calendar bookings. Questions, decisions and findings stay in writing.

## Work you can inspect

Sample deliverables. Read the audit and Shopify sample reports to see the structure, evidence and correction plans. Both use invented businesses and are clearly labelled as synthetic examples. [Sample audit report](/samples/audit-report) and [sample Shopify report](/samples/shopify-agent-storefront-check).

Public reference build. turva.dev is my own reference build. Its published technical checks have named sources and measurement dates, and the worker source is public. [Public scanner](https://isitagentready.com/) and [read the source](https://github.com/erekola/turva-worker).

Published research. Read the methods and limitations behind the website measurements, AI-answer study and follow-up research. [Website agent-readiness study](/blog/website-agent-readiness-567-sites), [What AI assistants call an agent-readiness audit](/blog/what-ai-assistants-call-an-agent-readiness-audit) and [Thirty days after the brief](/blog/thirty-days-after-the-brief).

Scanner: isitagentready.com (third party, Cloudflare). Discoverability, Content Accessibility, Bot Access Control, and API, Auth, MCP and A2A Discovery: 100/100. Commerce: 100/100. Verified 100/100, Level 5, Agent-Native.

turva.dev publishes its own security scans too, on the same principle that the result should be measurable rather than asserted. Measured 2026-09-06.

- Hardenize: all 24 categories passed. https://www.hardenize.com/report/turva.dev
- Internet.nl website test: 98/100. https://internet.nl/site/turva.dev/
- Internet.nl email test: 95/100. https://internet.nl/mail/turva.dev/

## Support beyond the first report

Implementation turns the agreed correction plan into working changes. Ongoing advisory records technical and AI-visibility measurements over time, reviews changes and helps your team choose the next priorities.

Agent operations and MCP server design are available as separately scoped engagements around the systems, data and permissions involved.

[Explore all services](/services).

## Work directly with Erik Rekola

I'm an independent consultant based in Tampere, Finland. I work on agent-readiness audits, technical reviews and implementation.

You work directly with me throughout the engagement. Scope, findings and decisions are documented in writing.

[About turva.dev](/company).

## Frequently asked

**What is agent-readiness?**

It is how well AI agents can discover, read and use the information and interfaces your product exposes. This audit examines websites and APIs. It is different from assessing an organisation's readiness to adopt AI.

**Is agent-readiness the same as AI visibility?**

No. Technical readiness concerns access, information and interfaces. AI visibility concerns how assistants mention and describe your business in their answers. The website and API audit examines both, using separate technical checks and a documented question set.

**Do you guarantee AI mentions or a particular score?**

No. The audit records observed results, identifies issues and defines how corrections can be checked. AI answers and scanner results can change, so every measurement needs its date, scope and method.

**Can our own team implement the findings?**

Yes. The report includes correction instructions and acceptance checks. A €499 implementation add-on covers the diagnosis's own fix list when bought with that diagnosis and when the required access is arranged in advance. Work outside that list is scoped separately at €1,500 per day. The services page sets out the prerequisites and scope.

**What access is required?**

The audit does not require production credentials. If you purchase implementation, any required deployment, DNS, Shopify or repository permissions are agreed separately and limited to the work being carried out.

[Implementation scope and access requirements](/services).

## Contact

Send your website, API or Shopify store URL and tell me what you want to understand. I'll reply within one business day with the appropriate next step, scope and start date.

[Request an audit](/contact). Email: <mailto:info@turva.dev>.

Everything is handled in writing. No calls or calendar bookings.

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
- [Practical guides to agent-readiness](https://turva.dev/guides)
- [What a website and API agent-readiness audit covers](https://turva.dev/guides/agent-readiness-audit)
- [How to choose an agent-readiness audit](https://turva.dev/guides/choosing-an-agent-readiness-audit)
- [Make your website easier for AI assistants to find and cite](https://turva.dev/guides/get-cited-by-ai-assistants)
- [SEO and agent-readiness: overlap and differences](https://turva.dev/guides/seo-vs-agent-readiness)
- [Agent-readiness, AEO and GEO](https://turva.dev/guides/agent-readiness-aeo-geo)
- [Measure agent-readiness with evidence](https://turva.dev/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps in a measured sample](https://turva.dev/guides/agent-readiness-gaps)
- [llms.txt explained](https://turva.dev/guides/llms-txt)
- [Serving Markdown to AI clients](https://turva.dev/guides/markdown-for-agents)
- [Open Knowledge Format explained](https://turva.dev/guides/open-knowledge-format)
- [Sitemaps, robots.txt and AI crawler access](https://turva.dev/guides/sitemaps-and-robots-for-agents)
- [Response headers for AI clients](https://turva.dev/guides/response-headers-for-agents)
- [When AI clients cannot read rendered pages](https://turva.dev/guides/prerendering-for-agents)
- [JSON-LD and structured data for AI clients](https://turva.dev/guides/json-ld-structured-data)
- [MCP server cards and discovery](https://turva.dev/guides/mcp-server-card)
- [What agents.json describes](https://turva.dev/guides/agents-json)
- [The /.well-known directory for agent discovery](https://turva.dev/guides/well-known-for-agents)
- [Agentic Resource Discovery and resource catalogs](https://turva.dev/guides/agentic-resource-discovery)
- [Authentication and authorisation for AI agents](https://turva.dev/guides/agent-authentication)
- [x402 and HTTP payment flows](https://turva.dev/guides/x402-agent-payments)
- [Agent commerce discovery: A2A, AP2, ACP and UCP](https://turva.dev/guides/agent-commerce-discovery)
- [Agentic commerce readiness](https://turva.dev/guides/agentic-commerce-readiness)
- [Define what an agent may do with your data](https://turva.dev/guides/letting-agents-act-on-data)
- [AI agent use cases and their operating limits](https://turva.dev/guides/ai-agent-use-cases)
`,

  "/services": `# Agent-readiness services and pricing

Choose a focused Shopify check or a broader website and API audit. Each has a fixed scope and can be bought on its own. You receive documented findings and a prioritised correction plan.

Async-only. First reply within one business day. Prices exclude VAT.

## Choose a starting point

- [Shopify agent storefront check](/shopify-agent-storefront-check). €999. Find out whether selected products, prices and availability agree across the agent-shopping surfaces your store exposes. One store, up to three product and variant pairs, one market, with buyer-journey evidence and a prioritised correction plan. Delivered within 48 hours of the agreed written kickoff.
- [Website and API agent-readiness audit](/services#audit). €4,300. A third-party technical scan, manual review of your website and API surfaces, and a documented question set tested across selected AI assistants. Written findings, a prioritised correction plan and one included re-scan. Delivered in two weeks.

See what each report contains before you buy: the [sample audit report](/samples/audit-report) and the [sample Shopify report](/samples/shopify-agent-storefront-check).

## Shopify agent storefront check

**€999. 48 hours. Fixed scope.**

What an AI shopper actually receives from one live Shopify store, tested across the three agent surfaces this check covers and reported with the evidence attached.

What you get:
- A three-surface map of browser WebMCP, remote Storefront and UCP MCP, and Catalog and Agentic channels
- A product truth matrix comparing what each surface says about the tested products
- Buyer-journey evidence with the tool, the input, the observed result and the exact stop before payment
- A prioritised correction plan of up to five changes, each with an owner and an acceptance check
- One retest of up to two corrected items within 14 days

What you do not get:
- Calls or meetings
- Implementation of the corrections, which is bought separately and described under Implementation below
- A penetration test, or any Shopify, MCP, WebMCP or UCP certification
- A test order, because the cart lifecycle stops before payment

The audit is not a prerequisite. The full scope, the exclusions and the public preflight are on the [product page](/shopify-agent-storefront-check).

Suited for D2C Shopify stores that want documented evidence of what an agent receives from them today.

## Website and API agent-readiness audit

**€4,300. Two weeks. Fixed scope.**

A third-party technical scan, manual review of your website and API surfaces, and a documented question set tested across selected AI assistants. The report separates technical findings from observed AI answers and explains what to correct, why it matters and how to verify it.

What you get:
- An independent scanner runs against the site or API, and every check it runs is recorded one by one rather than as one headline number
- Manual review of /.well-known/ manifests, JSON-LD, head metadata and HTTP headers
- Review of robots.txt, sitemap.xml, ai.txt and llms.txt against current agent norms
- Your published web security scans read alongside the agent checks, so the report rests on measurements you can re-run yourself
- A documented question set put to several AI assistants, recording what they answer about the site or API today and whether they name it when asked about its category rather than by name
- Written report with findings prioritised by their impact on users and agent behaviour, with implementation effort and scanner effects recorded separately
- A fix instruction for every finding, and a link to the guide on this site for that surface where there is one, so your team can do the work without buying implementation
- One round of written follow-up questions
- One re-scan after the fixes, within 30 days of the report and included in the price

What you do not get:
- Calls or meetings
- Implementation of the fixes, which is bought separately and described under Implementation below
- Ongoing monitoring, which is the advisory engagement

How the follow-up is verified:
- Technical corrections are checked with the relevant scanner or a direct test of the surface
- AI visibility is observed again with the same documented question set
- The follow-up results are shown beside the baseline, with dates, scope and any change in the measurement method

Levels move with the check set. The same site can read Level 1 on a full run and Level 2 on a narrower one, so the report names the checks that failed and what each one costs to fix, and leaves the headline number out of it.

Large sites are covered in full. If a site is big enough that the live checks reach a tool quota, the quota is raised rather than the coverage reduced. Once the audit is complete, the fixes it lists are typically about a day of implementation work, whether your team does them or I do. That figure is an estimate scoped to the findings this audit lists, not a fixed quote, and the audit is what identifies that work and orders it. The report carries the instructions for that work, so the implementation day is a choice rather than a condition.

A synthetic [sample report](/samples/audit-report) is public. It uses an invented site, shows the per-check scanner readings, the manual review, the AI visibility run, nine findings with their owners and acceptance tests, and the decisions the company makes, and it is not a report on a real client.

Suited for teams that want a clear picture of where they stand before deciding what to do about it.

## Implementation

**€1,500 per day. Scoped per task. €499 for a diagnosis's own fix list, bought with that diagnosis.**

Your team can implement the report, or you can purchase implementation. A €499 add-on covers the diagnosis's own complete fix list when bought with that diagnosis and when the required access is arranged in advance. Work outside that list is scoped separately at €1,500 per day.

For a Shopify check, the add-on requires collaborator access to the store. For an audit, it requires an edge runtime, deployment access and any other access the listed fixes need, such as DNS. If those prerequisites cannot be arranged, the add-on is not sold and your team still receives the correction instructions.

With the access in place, every fix on the list is implemented for the €499, whatever the count. That is the whole list at a fixed price instead of the day rate.

An implementation day is hands-on work on the fixes a website and API audit identified, or new agent-ready infrastructure built from scratch. That audit comes first for this work, because the day is spent building rather than diagnosing.

Your traffic runs through an edge worker I deploy in front of your origin, and the access to do that exists before the day starts. Cloudflare Workers is the default, because that is what this site runs on. Any edge runtime that executes your code in front of the origin does the same job, Fastly Compute, Akamai EdgeWorkers, AWS Lambda@Edge and the edge functions on Netlify and Vercel included, so tell me which one you run when we scope the day. The worker adds agent surfaces beside your site, and it does not touch your application.

Typical work on a day:
- Head metadata and /.well-known/ files served at the edge
- robots.txt with AI crawler rules and Content Signals, and a Web Bot Auth directory
- Markdown content negotiation, so a request asking for text/markdown gets markdown while a browser still gets HTML
- An agent skills index, auth.md and an API catalog
- JSON-LD generators for product, organization and article schemas
- ai.txt and llms.txt authoring
- Signed content and agent authentication patterns
- An MCP server card and an agent-to-agent card for a server that already runs, and the discovery paths that point at it

What a separately scoped day does not cover:
- DNS records for agent discovery, which need your DNS rather than an edge worker
- Tool declarations inside your pages, which are application work
- Agent commerce protocols, which need working payment flows behind them
- Building the MCP server itself, which is its own engagement, so a card written on a day points at a server that already runs

You check the work yourself. Run the scanner before the day and after it, so the result is a number you produced. I do not promise a readiness level, because the level moves depending on which checks are run.

Scoped repository write access per task. No retainer.

## Ongoing advisory

**€3,000 per month. Minimum three months.**

Monthly technical and AI-visibility measurements, written review of shipped changes, roadmap input and ongoing written support. Each review records what changed and what the evidence supports. No particular score or AI mention is guaranteed.

What you get:
- Monthly re-scan with the same scanner and the same profile, and the delta recorded beside the previous reading
- Monthly AI-visibility delta from the same question set, re-run across the same AI assistants
- Written review of any agent-readiness related work your team ships, within one business day
- Roadmap input on what to ship next and why
- Async channel for questions, email or a shared document
- Quarterly summary of measurable progress

What you do not get:
- Calls or meetings
- A promised score, because the check set changes when the standards do

The monthly re-run uses the same measurement as the audit, so a delta means something. A number that moved for a reason nobody can name is not progress, and the review says which change moved it.

Suited for teams treating agent-readiness as an ongoing product responsibility rather than a one-off cleanup.

## Agent operations

**Price on request. Scoped per engagement.**

Review the data, permissions, decision limits and human handoffs around an agent-operated system. Scope and price are agreed separately.

Two things decide whether an agent acts correctly. The data it works from has to arrive intact, even over links that drop or lag. And the decisions it is allowed to make have to sit inside an envelope of permissions and thresholds you set deliberately.

Typical work:
- Review of the data path an agent depends on, and where it breaks under real network conditions
- The permission and threshold envelope that bounds what an agent may decide and act on
- Where a human stays in the loop, and how control passes between person and agent
- Guardrails and verification so an agent's decisions can be checked after the fact

What decides the price:
- How many systems the agent touches, and whether any of them can move money or delete data
- Whether a decision boundary exists already or has to be written from scratch
- Whether the work ends at a written envelope or continues into building the guardrails

What you do not get:
- Calls or meetings
- An agent built for you, because this is the envelope around one rather than the thing itself
- Sign-off that your agent is safe, because a review cannot promise that

Suited for teams letting agents act on data and decisions that matter, rather than only reading a marketing site.

## MCP server design

**Price on request. Scoped per engagement.**

Design and build a supported interface for agents to read your product data. Tools, data sources, authentication and any write capabilities are scoped explicitly.

The default is a read-only server over streamable HTTP transport. For public, non-sensitive data, no auth surface and no logging by default. Auth and an audit trail follow the data and the misuse model.

Typical work:
- Read-only discovery tools over your product data
- An MCP server card at /.well-known/mcp/server-card.json so agents can discover the server
- Registry publication so the server is findable in MCP directories

What decides the price:
- How many tools the server exposes, and whether they read one system or several
- Whether your data is already reachable through an API, or the read path has to be built first
- Whether read-only is enough, which is the default here, or the server has to accept writes

Write tools are not included by default. A read-only server cannot modify the source through that interface. That is the property worth keeping. It does not settle exposure, bulk extraction or availability. Those are decided per tool.

Suited for teams that want agents to read product data through a supported interface rather than scraping HTML.

## How the method is measured

The method is measured in public before it is sold. [567 company websites](/blog/website-agent-readiness-567-sites) read by the same scanner, my own prospecting sample and not a random draw. [Fifty buyer questions put to four AI assistants](/blog/what-ai-assistants-call-an-agent-readiness-audit), 193 answers on one day. [210 sites whose thirty-day rescan came due](/blog/thirty-days-after-the-brief), 201 comparable readings, three moved up and one down, and no effect from the brief established. Each post names its own limits, and none of them is a result a paying client achieved.

Sites that complete an audit, or score 100/100 on the named public agent-readiness scanner, may display the [agent-ready badge](/badge). It is a self-declared badge with public criteria, not a certification.

## Frequently asked

**What is an agent-readiness audit?**

An agent-readiness audit measures how well AI agents can discover, read, and act on your website or API. It reads the website and its APIs, not the organisation's readiness to adopt AI agents, which many consultancies describe with the same words. turva.dev runs an independent scanner, isitagentready.com, reviews the agent-facing surfaces manually, records how AI assistants currently answer a documented question set about the site, and delivers a written report with findings prioritised by their impact on users and agent behaviour, with implementation effort and scanner effects recorded separately.

**What does an agent-readiness audit cost?**

The Shopify agent storefront check is €999, fixed scope, delivered within 48 hours of the agreed written kickoff. The audit is €4,300, fixed scope, delivered in two weeks. Ongoing advisory is €3,000 per month with a three month minimum, and implementation is €1,500 per day, scoped per task. Implementing exactly what a diagnosis lists is a fixed €499, bought together with that diagnosis. All prices exclude VAT. Agent operations and MCP server design engagements are priced on request.

**How is the audit delivered?**

Everything is async. There are no calls or meetings, findings and answers move in writing, and questions get a response within one business day. The audit ends in a written report your team can act on directly, with one round of written follow-up questions included.

**How is agent readiness measured, and how are fixes verified?**

With an independent public scanner, a manual review and observed AI answers, kept separate in the report. isitagentready.com grades sites on a Level 0 to 5 scale and scores agent readiness out of 100, and that score describes the named scanner's result rather than the whole of an agent's behaviour. Technical corrections are checked with the relevant scanner or direct test. AI visibility is observed with a documented question set. Follow-up results are shown beside the baseline, with dates, scope and changes in the measurement method.

**Do I need the audit before the Shopify agent storefront check?**

No. The two are separate fixed-scope diagnoses and either can be bought on its own. The audit measures a whole site or API against agent-readiness norms. The Shopify check measures what an AI shopper receives from one live Shopify store, across the three agent surfaces this check covers.

**How much work are the fixes after the audit?**

In most cases, once the audit is complete, the fixes it lists are about a day of implementation work. That figure is an estimate scoped to the findings the report lists, not a fixed quote. Your team can do them with the report as the spec, or turva.dev implements them as a scoped engagement. Implementing exactly the fixes the report lists is €499 when it is bought together with the audit. That fixed price needs an edge runtime in front of your origin where the fixes are applied and the access to deploy there, plus any other access a listed fix needs, the DNS zone for example, all arranged in writing before the work starts, and with those in place every fix on the list is implemented, whatever the count.

**Will you sign an NDA, and how is our material handled?**

Yes, your own NDA, signed as it stands before any material moves, at no charge. The audit does not require production credentials. Any deployment, DNS, Shopify or repository access needed for purchased implementation is agreed separately and limited to the work. The workstation is encrypted at disk level, and credentials are held in an encrypted vault instead of in files. Backups are encrypted on the machine before they are uploaded anywhere. Client material is deleted within thirty days of the engagement closing, unless retention is required by law.

**Do AI tools see our material?**

I use AI tools in the work. They run on a local workspace holding the files a task needs, not against your systems. Those files are processed by the provider of the tool in use. Credentials are held in an encrypted vault and read by scripts at runtime, so no secret sits in a file. The vault controls storage, and what a tool may run and reach is scoped separately per task. Material you want kept out of AI tooling is named in the NDA and stays out.

## How to start

Email <mailto:info@turva.dev> with the site, API or store you want examined and the question the work should answer. I respond within one business day with a fixed quote and a start date.

No calls or calendar links, and no discovery sessions.

All prices exclude VAT. 25,5% for Finnish customers, reverse charge for EU B2B, 0% for non-EU.
`,

  "/shopify-agent-storefront-check": `# Shopify agent storefront check

Find out whether selected products, prices and availability agree across the agent-shopping surfaces your store exposes. Receive documented buyer-journey evidence and a prioritised correction plan.

€999 plus VAT. Fixed scope. Four written deliverables within 48 hours of the agreed written kickoff, followed by the included retest. One store, up to three product and variant pairs, one market.

A general agent-readiness audit is not a prerequisite. This check stands on its own, and it is not a step inside the audit. It is an independent service, not affiliated with or endorsed by Shopify.

## What you will learn

Shopify stores meet shopping agents through three separate interfaces. They are related, and an agent does not always get the same answer from each. Within 48 hours you receive an evidence-backed status for each of the following, including anything restricted, unavailable or not testable.

- Which agent tools were observed and functional in the tested session.
- Whether product, variant, price, currency and availability data agree across the tested surfaces.
- Whether an agent can build the intended anonymous cart.
- Where the buyer is handed off to checkout.
- Whether your Shopify Agentic channel settings match what your team intended.
- Which product-data, theme, app or configuration changes should be made first.

## What you receive

Five written deliverables. The first four are sent as one package within 48 hours. The fifth is the retest, and it follows within 14 days.

- Three-surface map. What is present, restricted, unavailable or not tested on browser WebMCP, remote MCP and Catalog and Agentic channels.
- Product truth matrix. The tested title, variant, price, currency, availability and policy facts across surfaces.
- Buyer-journey evidence. The tool, the input, the observed result, the cart state and the exact stop before payment or order creation.
- Prioritised correction plan. Up to five specific changes, their owner and a ready acceptance check.
- Retest. One verification of up to two corrected items within 14 days.

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

## The three surfaces

Every one of these is tested in the same session, against the same products, so a difference between them is visible rather than inferred.

- Browser WebMCP tools inside the shopper's live storefront tab.
- Shopify-hosted Storefront and UCP MCP endpoints.
- Shopify Catalog and Agentic storefront channels.

## Price, kickoff and delivery

**€999 plus VAT. Fixed scope. 48 hours.**

The 48-hour clock starts at the agreed written kickoff, once the preflight, payment and merchant evidence are complete. No response is required from you during the delivery window.

If the public preflight cannot establish an observable agent-commerce surface suitable for controlled testing, the engagement is not sold and nothing is invoiced.

If the 48-hour package of four deliverables is not sent within 48 elapsed hours, the fee is refunded. The retest is the fifth deliverable. It runs on its own 14-day window and is not part of the first package's delivery time.

All work is asynchronous and delivered in writing.

## Optional implementation

Implementation of the corrections is not included in the €999. Your team can act on the plan directly, or implementing exactly the corrections this check lists is €499 when it is bought together with the check. Work outside the plan is scoped separately at the €1,500 implementation day rate.

The fixed price needs collaborator access to the store, arranged in writing before the work starts. With it in place, every correction on the plan is implemented for the €499, whatever the count. If access cannot be arranged, the add-on is not sold, and the plan still carries the instructions for your team.

## Limits and exclusions

This is an operational storefront check. It is not a penetration test. It is not a Shopify, MCP, WebMCP or UCP certification either.

A documented Shopify tool or public endpoint is not treated as a vulnerability. Browser WebMCP does not establish remote access. Checkout navigation is not reported as payment completion. Ranking or product placement in an external AI channel is not promised.

This is an independent service, not affiliated with or endorsed by Shopify.

## Sample report

A synthetic [sample report](/samples/shopify-agent-storefront-check) is public. It uses invented store data. It shows the three-surface map, the product truth matrix, the buyer-journey evidence, the correction plan and the retest, and it is not a report on a real merchant.

## Public preflight evidence

Before this check was offered, 26 Shopify storefronts were read with a public read-only preflight on 2026-08-09. All 26 advertised the same ten-tool WebMCP inventory that Shopify documents as its platform-supplied surface. That is a reading of 26 public storefronts, not a result from 26 paying clients.

What that measurement does not establish, and the reason the paid check exists:

- No tool was called on any of the 26 stores.
- Cart, checkout, payment and order creation were not tested.
- Remote MCP behaviour and Agentic Admin settings were not read.
- The identical inventory is Shopify's platform surface rather than 26 separate merchant implementations, so it says nothing about any one store's product data.
- Five of the 26 needed a repeat run before the scanner finished, so the reading is the latest available observation rather than one clean pass.
- The 26 of 26 figure describes those stores at that hour under that scanner version, and it is not generalised to Shopify stores.

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

  "/company": `# Work directly with Erik Rekola

I'm an independent consultant based in Tampere, Finland. I work on agent-readiness audits, technical reviews and implementation for websites, APIs and Shopify stores. You work directly with me, and scope, findings and decisions stay in writing.

## My background

From 2015 to 2021, I worked in hands-on machine roles involving paper machinery at UPM, medical washer-disinfectors at Franke, a clinical LC-MS/MS analyser at Thermo Fisher Scientific and semiconductor production equipment at ASM International. The common thread was reliable machine data and interventions within defined limits.

After a career break from 2021 to early 2026, I built turva.dev around technical measurement, review and implementation. My current work is available to inspect through [public source code](https://github.com/erekola), [dated research](/blog) and clearly labelled [sample reports](/samples/audit-report).

## Why this work matters

A product can look clear to a person while exposing incomplete or conflicting information to automated clients. My work documents what those clients can reach, what they receive and which corrections deserve attention. Technical readiness and observed AI answers are measured separately.

## How I work

- Async-only engagement. No calls, no calendar links.
- All work delivered remotely. No on-site engagements.
- The audit does not require production credentials. Access needed for purchased implementation is agreed separately and limited to the work being carried out.
- Write access scoped per task and only if implementation is purchased.
- Public readiness claims are verifiable by re-running the scanner. Engagement findings are tied to recorded inputs and observed results.

## Business details

- **Trade name:** turva.dev
- **Operator:** Erik Rekola
- **Form:** Sole proprietorship
- **Country of registration:** Finland
- **Business ID:** 3600281-7
- **VAT ID:** FI36002817
- **Location:** Tampere, Pirkanmaa, Finland
- **Register:** https://tietopalvelu.ytj.fi/yritys/3600281-7
- **Source code:** https://github.com/erekola

## Invoicing

Payment terms are fourteen days net unless agreed otherwise in writing.

VAT is added to invoices according to Finnish law. Reverse charge applies to EU B2B customers with a valid VAT ID. Non-EU customers are invoiced without VAT. turva.dev's own VAT ID is FI36002817.

## Discuss a project

Send the URL and the question you want answered. Everything is handled in writing, and the first reply arrives within one business day. Email <mailto:info@turva.dev> or use the [contact page](/contact).
`,

  "/contact": `# Start with the URL and the question

Send your website, API or Shopify store URL and tell me what you want to understand. I'll reply within one business day with the next step, proposed scope and start date.

Everything is handled in writing. No calls or calendar bookings.

## Email

- **Email:** <mailto:info@turva.dev>

For project requests, URLs and longer messages. Each link below opens a message to info@turva.dev with the subject set and the fields the first reply needs. Nothing is sent until you send it, and the same fields typed into a plain email work just as well.

- [Ask about a website or API audit](mailto:info@turva.dev?subject=Agent-readiness%20audit&body=Site%20or%20API%20URL%3A%20%0AWhat%20the%20audit%20should%20answer%3A%20%0A): include the URL and the question the audit should answer.
- [Ask about a Shopify check](mailto:info@turva.dev?subject=Shopify%20agent%20storefront%20check&body=Storefront%20URL%3A%20%0A.myshopify.com%20domain%3A%20%0APrimary%20market%3A%20%0AUp%20to%20three%20priority%20products%3A%20%0A): include your storefront URL, .myshopify.com domain, primary market and up to three priority products.

Not sure which service fits? Send the URL and the question. Existing scanner results are welcome, but you do not need them to get started.

## Other channels

- **Signal:** [@turva.19](https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK)
- **LinkedIn:** https://www.linkedin.com/in/erikrekola/

Short questions go to Signal, longer documents by email. Open Signal directly, or scan the code with your phone.

Signal is end-to-end encrypted. Scanning shares no account of yours.

## What to include

A useful first message includes:

- The website, API or store to be examined (URL)
- The question you want answered, or the scope you have in mind (Shopify agent storefront check, audit, advisory, implementation, agent operations, MCP server design)
- Any current scanner results, if you have run them

If you do not have scanner results yet, that is fine. The work starts with running them.

## Response time and languages

- Email and Signal: within one business day
- Weekends: no guaranteed response time

Correspondence in English or Finnish, your choice. A brief I send unasked arrives in the language of the company it is about, and reports are written in English unless a Finnish report is agreed in the written scope.

## Confidentiality

An NDA is signed before any material moves. Send your own and it is signed as it stands, at no charge. The audit does not require production credentials. Any deployment, DNS, Shopify or repository access needed for purchased implementation is agreed separately and limited to the work.

## Optional encrypted email

Mail to erik@turva.dev can be OpenPGP encrypted. Encryption is optional, and an unencrypted message gets the same reply time.

The public key is at https://turva.dev/pgp-key.asc, and it is also published for automatic discovery, so a mail client that supports Web Key Directory finds it from the address alone. RSA 4096, valid until 27 July 2036.

Fingerprint:

7D66 37F2 A37B A45F 56D6 9D3A 95D8 AE0F CEDF EE35

Compare the fingerprint against the key before you use it, because a key served over the web is only as trustworthy as the page that served it.

## Business details

- **Business ID:** 3600281-7
- **Register:** https://tietopalvelu.ytj.fi/yritys/3600281-7
- **Location:** Tampere, Finland. Service delivered remotely worldwide.
- **Agent registration:** https://turva.dev/auth.md
`,

  "/legal": `# Terms, privacy and data handling

The terms for working with turva.dev, how information is handled and where to send a privacy request. Service-specific scope and delivery conditions are described on the relevant service page and confirmed in writing.

## Operator

turva.dev is operated by Erik Rekola, Business ID 3600281-7, registered in Finland as a sole proprietorship. VAT-registered, VAT ID FI36002817.

Contact: <mailto:info@turva.dev>

## Engagement terms

The following terms apply to all engagements (Shopify agent storefront check, audit, advisory, implementation, agent operations and MCP server design) unless replaced by a written agreement.

**Scope.** Each engagement has a defined scope agreed in writing before work starts. Scope changes require a new written agreement and may affect price and timeline.

**Deliverables.** Audit deliverables are a written report. Shopify agent storefront check deliverables are the five written documents described on the [service page](/shopify-agent-storefront-check). Advisory deliverables are written reviews and a monthly summary. Implementation deliverables are source code committed to the agreed repository.

**Payment.** Payment terms are fourteen days net unless agreed otherwise in writing. The Shopify agent storefront check is paid before the agreed written kickoff, which is a written exception to this term and is stated on its [service page](/shopify-agent-storefront-check). Late payment interest follows Finnish law.

**Confidentiality.** Information shared during an engagement is treated as confidential. Your own non-disclosure agreement is signed as it stands before any material moves, at no charge. The audit does not require production credentials. Access needed for purchased implementation is agreed separately and limited to the work being carried out.

**Liability.** Liability is limited to the value of the engagement. turva.dev is not liable for indirect or consequential damages.

**Intellectual property.** The client owns the deliverables produced for them. Generic methods, templates and reusable code remain with turva.dev.

**Governing law.** Finnish law applies. Disputes are resolved in the District Court of Pirkanmaa, Finland.

## Privacy

This site does not use analytics cookies, tracking pixels or third-party scripts.

**Server logs.** The hosting provider (Cloudflare) records standard request logs including IP address, user agent and requested path. Logs are retained according to Cloudflare's standard retention policy.

**Email.** Email communication is stored in standard email infrastructure for as long as needed to deliver the work and meet accounting obligations under Finnish law (six years for invoice records).

**Client data.** Data shared by a client during an engagement is stored only on systems necessary to deliver the work, and deleted within thirty days of engagement closure unless retention is required by law. The workstation holding it uses full disk encryption, credentials are held in an encrypted vault rather than in files, and backups are encrypted on the machine before they are uploaded anywhere.

**Briefs.** When turva.dev measures a company's public website and sends the reading as a brief, the brief lives at an unlisted address on turva.dev. It contains what the public site serves and how it was read, and nothing a person shared. The address is not indexed and not linked from anywhere. A brief is removed on request, and every brief expires on its own no later than 400 days after it was last published.

**AI tools.** AI tools are used in the work, on a local workspace holding the files a task needs. Those files are processed by the provider of the tool in use. Credentials are held in an encrypted vault and read by scripts at runtime, so no secret sits in a file. The vault controls storage, what a tool may run and reach is scoped separately per task, and the tools have no access to client systems. Material a client wants excluded from AI tooling is named in the non-disclosure agreement and excluded.

No data is sold. Data reaches a third party only through the providers needed to deliver the work: hosting, email, encrypted backup storage and the AI tool in use.

## Data rights

You have the right to access, correct or request deletion of personal data held about you. Send the request to <mailto:info@turva.dev>.

The supervisory authority in Finland is the Data Protection Ombudsman (tietosuojavaltuutettu.fi).

## Cookies

This site sets no cookies of its own. Cloudflare may set cookies required for bot management and security. These are technical cookies and do not require consent under EU law.

## Updates

This page is updated when the terms change. The current version applies to engagements started after the date below.

- **Terms last updated:** 2026-09-06
- **Privacy last updated:** 2026-09-03
`,

  "/guides/open-knowledge-format": `# Open Knowledge Format explained

Open Knowledge Format describes knowledge as linked markdown documents. This guide explains the bundle structure and distinguishes portable files from shared semantic meaning.

The Open Knowledge Format is an open specification from Google Cloud that represents a body of knowledge as a directory of plain markdown files. Each concept file carries a small block of YAML frontmatter and a free-form body. The goal is a portable way to hand an AI agent the context it needs, readable by a person and parseable by a machine, with no SDK and no catalog to lock into.

## What an OKF bundle contains

A bundle is a folder of markdown files, and the unit inside it is a concept. A concept is anything worth capturing for an agent, such as a table, a dataset, a metric, a runbook or an API. Every concept is one UTF-8 markdown document with two parts, a YAML frontmatter block at the top fenced by a line of three dashes above and below, and a markdown body underneath.

The format asks for exactly one field, type. Everything else is optional, including title, description, resource, tags and a generated block that records who last changed the concept and when. What types exist and what fields each carries is left to whoever produces the bundle. Concepts reference each other with ordinary markdown links, so the folder becomes a graph of related knowledge rather than a flat list of files.

## Structure versus meaning

Version 0.2 fixes a small set of things and leaves the rest open. It fixes the shape of a bundle as a folder of markdown files, the YAML frontmatter, two reserved filenames and the single required field, all carried forward from version 0.1 unchanged. That is structural interoperability. Any tool can open a bundle and know where the pieces are. Version 0.2 also added optional provenance and trust keys, among them sources, generated, verified, status and stale_after, and it retired two version 0.1 surfaces, since the concept timestamp became generated.at and the body citations list became sources in the frontmatter.

What version 0.2 does not fix is meaning. The format does not say what a metric concept must contain, or how two producers should agree on the same field names. That is semantic interoperability, and version 0.2 leaves it to producers and to conventions that have not been written yet. This is the line to keep in mind when reading announcements about OKF. It standardizes the shape of the files, not yet what the files mean.

## Version and status

Google Cloud published version 0.1 in June 2026 and version 0.2 in July 2026. This guide describes version 0.2 as published. A team evaluating OKF should check which version a given bundle or tool targets before comparing it against the description here, because the required field, the reserved filenames and the frontmatter keys have already changed once between 0.1 and 0.2.

## Where OKF fits with agent-readiness

Agent-readiness, the kind measured by an independent scanner, is about whether an agent can reach and read a public site at all. OKF sits next to that, one layer in. It is a way to package the internal knowledge an agent works from once it is past the front door, the catalog, the metrics and the rules a decision depends on.

So OKF is not a replacement for an llms.txt or a markdown surface on a site. It is the same instinct, plain text an agent can read without a special client, applied to the data and context behind the site rather than the pages in front of it. For a team thinking about what an agent acts on, not only what it can see, that is the part of the picture OKF addresses.

## What to do with it today

OKF is new and small, version 0.2 since July 2026, and the semantic half is still open. That makes it worth understanding now and worth watching, but early to build an entire knowledge catalog on. A site that already serves markdown to agents and keeps an llms.txt has the instinct OKF formalizes, and adopting it later will be a short step rather than a rebuild.

## Frequently asked

**What is the Open Knowledge Format?**

An open specification from Google Cloud that represents a body of knowledge as a directory of plain markdown files. Each concept is one UTF-8 document with a YAML frontmatter block and a body. Google Cloud published version 0.1 in June 2026 and version 0.2 in July 2026.

**What does OKF actually standardize?**

The shape of the files, not yet their meaning. Version 0.2 fixes the folder of markdown files, the frontmatter, two reserved filenames and one required field. What a concept must contain is left to producers.

**Does OKF replace llms.txt?**

No. An llms.txt and a markdown surface make the pages in front of the site readable. OKF packages the knowledge behind it, the catalog, the metrics and the rules a decision depends on. It is the same instinct one layer in.

## Related

- [llms.txt explained](/guides/llms-txt)
- [Serving Markdown to AI clients](/guides/markdown-for-agents)
- [Define what an agent may do with your data](/guides/letting-agents-act-on-data)
`,
  "/guides": `# Practical guides to agent-readiness

Understand what AI clients can discover, read and use on a website or API. Start with the buying decision, improve a technical surface or explore how AI visibility is measured.

Every guide here is re-read against its primary sources at least once a month, and the two families that move fastest, agent commerce and MCP discovery, more often than that. Specifications move, and a sentence that was true the day it shipped can stop being true without anything on this site changing. A layout change is not a technical re-check, so each guide's own check date is the one that counts.

## Start here

- [What an agent-readiness audit covers](/guides/agent-readiness-audit)
- [How to choose an audit](/guides/choosing-an-agent-readiness-audit)
- [How technical readiness differs from AI visibility](/guides/agent-readiness-aeo-geo)

## Audit, visibility and priorities

What an audit measures, how to choose one, and how technical readiness differs from AI visibility.

- [What a website and API agent-readiness audit covers](https://turva.dev/guides/agent-readiness-audit)
- [How to choose an agent-readiness audit](https://turva.dev/guides/choosing-an-agent-readiness-audit)
- [Make your website easier for AI assistants to find and cite](https://turva.dev/guides/get-cited-by-ai-assistants)
- [SEO and agent-readiness: overlap and differences](https://turva.dev/guides/seo-vs-agent-readiness)
- [Agent-readiness, AEO and GEO](https://turva.dev/guides/agent-readiness-aeo-geo)
- [Measure agent-readiness with evidence](https://turva.dev/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps in a measured sample](https://turva.dev/guides/agent-readiness-gaps)

## Content and crawl access

What a text-based client can read on a site, and what the files at the root tell a crawler.

- [llms.txt explained](https://turva.dev/guides/llms-txt)
- [Serving Markdown to AI clients](https://turva.dev/guides/markdown-for-agents)
- [Open Knowledge Format explained](https://turva.dev/guides/open-knowledge-format)
- [Sitemaps, robots.txt and AI crawler access](https://turva.dev/guides/sitemaps-and-robots-for-agents)
- [Response headers for AI clients](https://turva.dev/guides/response-headers-for-agents)
- [When AI clients cannot read rendered pages](https://turva.dev/guides/prerendering-for-agents)
- [JSON-LD and structured data for AI clients](https://turva.dev/guides/json-ld-structured-data)

## Discovery and authentication

How a client finds an interface, and how the service decides what it may access.

- [MCP server cards and discovery](https://turva.dev/guides/mcp-server-card)
- [What agents.json describes](https://turva.dev/guides/agents-json)
- [The /.well-known directory for agent discovery](https://turva.dev/guides/well-known-for-agents)
- [Agentic Resource Discovery and resource catalogs](https://turva.dev/guides/agentic-resource-discovery)
- [Authentication and authorisation for AI agents](https://turva.dev/guides/agent-authentication)

## Commerce and agent operations

Payment flows, commerce discovery, and the limits an agent operates within.

- [x402 and HTTP payment flows](https://turva.dev/guides/x402-agent-payments)
- [Agent commerce discovery: A2A, AP2, ACP and UCP](https://turva.dev/guides/agent-commerce-discovery)
- [Agentic commerce readiness](https://turva.dev/guides/agentic-commerce-readiness)
- [Define what an agent may do with your data](https://turva.dev/guides/letting-agents-act-on-data)
- [AI agent use cases and their operating limits](https://turva.dev/guides/ai-agent-use-cases)

## Frequently asked

**What is an agent-readiness audit?**

An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API. It combines an independent scanner's per-check readings, a manual review of the agent-facing surfaces and observed answers from AI assistants to a documented question set, rather than a self-assessment.

**Do I need llms.txt on my site?**

llms.txt gives a curated map of what matters to the clients that fetch it, and no assistant is obliged to be one of them. It does not replace robots.txt or a sitemap, it complements them.

**How do I get my site cited by AI assistants?**

A model cites content it can read cleanly and corroborate. That means machine-readable surfaces such as llms.txt and structured data, a markdown form that does not exhaust the token budget, and being indexed where the assistant searches. None of that guarantees a citation.

**What is an MCP server card?**

An MCP server card is a JSON file that lets an agent discover a site's Model Context Protocol server, its endpoint and its transport, so the agent can connect without a human wiring up the connection. Deployed cards commonly sit at /.well-known/mcp/server-card.json.

**Is agent-readiness the same as SEO?**

No. SEO makes a site rank for a person to click. Agent-readiness makes a site legible and usable by an agent that reads and acts. A site can rank well and still be opaque to agents.

**How is agent-readiness measured?**

By an independent scanner that reads the live site and reports its checks one by one, beside a manual review and observed AI answers. A follow-up repeats the relevant checks and records the result beside the baseline, with the date and any change in the measurement method. No particular score or AI mention is guaranteed.

For an audit, contact info@turva.dev.
`,

  "/guides/agent-readiness-audit": `# What a website and API agent-readiness audit covers

A technical scan, manual review and observed AI answers reveal different problems. This guide explains what an audit should record and how a team can use the findings.

Most sites are built for human readers and search crawlers. AI agents read differently. They look for machine-readable entry points such as llms.txt, a sitemap, response headers, structured data, and well-known manifests, and when those are missing the agent either guesses or gives up.

## Technical checks

The audit checks the parts an agent reaches first. Discoverability covers robots.txt, the sitemap, the response headers, and the DNS records that let an agent find resources without parsing a full HTML page. Content accessibility covers llms.txt, markdown content negotiation, and whether the site can return a clean text version that saves an agent most of the tokens an HTML page would cost. Bot access control covers the AI-bot rules, the content signals, and the bot-authentication directory that tell an agent how it is allowed to behave. API, auth, MCP and A2A discovery covers an MCP server card, an agent card, an OpenAPI description, an API catalog, and OAuth discovery, so an agent can enumerate what the site offers and authenticate safely. Commerce covers payment surfaces such as x402 and structured pricing, so an agent can transact.

Each check runs against an independent scanner's current rule set. That rule set moves, so a scan run today is a new measurement rather than a repeat of an earlier one.

## Manual review

A technical scan reads what a page serves. It does not read what a person notices when following the same path an agent would. Manual review checks whether the instructions a site publishes, such as an llms.txt entry or a registration step in auth.md, match what the site actually returns when followed. It checks whether structured data on a page agrees with the prose beside it, whether an error page reveals more than it should, and whether an edge case the scanner does not test, such as a redirect chain or a stale sitemap entry, breaks a path an agent would take. The finding here is usually a contradiction between two places, not a missing file.

## AI-answer observations

A separate question from both of the above is what an AI assistant actually says when a buyer asks it something. Observed AI answers means asking ChatGPT, Perplexity, Claude, and similar assistants the questions a buyer would ask, and recording which sources they name and what they get wrong. This does not test the site directly. It tests whether the work already done on discoverability and content accessibility shows up in a real answer, and it can surface an assistant repeating outdated information that a scan of the current site would not catch.

## Findings and verification

The result of an audit is a list. Each check passes or fails, and each failure comes with a concrete fix instruction and, where this site has a guide for that surface, a link to it. The report is written so your own team can do the work, which means implementation is something you buy if you want it rather than something the report forces on you.

turva.dev applies the same standard to its own site. Measured by an independent scanner, turva.dev reaches 100/100 and Level 5, Agent-Native, on isitagentready.com. Measured 2026-09-06. That is one scan on one day against one named scanner, and it does not stand in for manual review or for how an assistant answers a buyer's question, so it counts as one input among the three above rather than a summary of all of them. A rescan after a fix shows whether that specific fix passed. The audit a client receives runs the same three kinds of check against their site.

## Frequently asked

**What is an agent-readiness audit?**

An agent-readiness audit measures how well an AI agent can discover, read, and act on a website or an API. It is a technical review of the surfaces automated clients use, scored against current standards rather than opinion.

**What does an agent-readiness audit check?**

It checks the surfaces an agent reaches first, covering discoverability, content accessibility, bot access control, API/auth/MCP and A2A discovery, and commerce. Each check passes or fails, and each failure comes with a concrete fix, verified by the scanner where the check is scored and by a direct test where it is not.

**What does an agent-readiness audit produce?**

A pass or fail on each check, and a concrete fix instruction for every failure, with a link to the guide on this site for that surface where there is one. Your own team can do the work from the report. Scored checks are verified by the scanner before and after, manual-review fixes by a direct test, and the scoring is against current standards rather than opinion.

## Sources

- [isitagentready.com, the scanner the audit reads](https://isitagentready.com/)
- [Well-known URIs, RFC 8615](https://www.rfc-editor.org/rfc/rfc8615.html)
- [API catalog, RFC 9727](https://www.rfc-editor.org/rfc/rfc9727.html)

## Related

- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Measure agent-readiness with evidence](/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps in a measured sample](/guides/agent-readiness-gaps)
`,

  "/guides/llms-txt": `# llms.txt explained

An llms.txt file offers a curated map of a site for clients that choose to read it. Learn its structure, discovery links and limits.

llms.txt is a plain text file that tells AI agents and language models what a site contains and where the important content lives. It sits at /llms.txt at the root of a site, or at any path inside it, in which case it covers the pages under that path and the most specific file applies. It works like a guide written for machines. A human reads the rendered page, an agent reads llms.txt and follows the links it lists.

## File structure

The file opens with the site name as an H1, then a short summary as a blockquote, then the key pages and resources as markdown links grouped under H2 headings. Only the H1 is required. Everything after it, the summary, the headings, and the grouped links, is recommended rather than mandatory, and a minimal file with just the name is still a valid one. Some sites also publish llms-full.txt, a single file that bundles the full text of the site so an agent can read everything in one request instead of crawling many pages.

The proposal reached v2 in August 2026 and the file format did not change. What changed is how an agent finds the machine-readable forms. A page now names them with two standard link relations, rel="alternate" type="text/markdown" for the markdown version of the page and rel="describedby" for the llms.txt that covers it, given either as HTML link elements or as an HTTP Link header. v2 also accepts both address forms for a markdown version, page.html.md and page.md, and it drops the context expansion tooling that v1 described, so the Optional section is a convention for secondary links and carries no mechanical meaning any more.

## How clients find it

The reason it matters is cost and clarity. A normal HTML page carries navigation, scripts, and styling that an agent has to wade through, and that spends tokens and invites mistakes. An llms.txt file, paired with markdown content negotiation, lets an agent fetch a clean text version and skip the noise. On turva.dev the markdown version of a page costs a fraction of the HTML, which is the difference between an agent reading the page reliably and an agent truncating it. turva.dev publishes llms.txt and llms-full.txt, serves markdown on request, and publishes the markdown version of every page at its own .md address with both v2 link relations. Whether a client fetches any of it depends on the client. A clear llms.txt serves the clients that read it, and no assistant is obliged to be one of them.

## What it does not replace

llms.txt is not a ranking trick and it does not replace a sitemap or robots.txt. A sitemap lists every URL for crawlers. robots.txt sets crawl rules. llms.txt is a curated, human-written map of what matters, aimed at models. The three work together. Google states that Search, including its generative features, ignores the file, so publish it for the clients that fetch it rather than as a route into Google or into search rankings.

## Validate your file

A validator reads the file the way a client would. It checks that the H1 is present, that the links resolve to pages that exist, and that the grouping under each heading is well formed. Running one before publishing catches a malformed link before an agent does.

Check any site's llms.txt structure with the [free validator](/llms-txt-validator), which reads the file and the home page without signing up.

## Frequently asked

**What is llms.txt?**

llms.txt is a plain text file that tells AI agents and language models what a site contains and where the important content lives. It sits at the root of a site or at any path inside it, where it covers the pages under that path. It does not replace robots.txt or a sitemap, it complements them.

**Does llms.txt help with search ranking?**

No. It is not a ranking trick. Google states that the file neither harms nor helps visibility or rankings in Search, because Search ignores it. What llms.txt gives is a curated map of the content to those clients that do fetch it.

**What does an llms.txt file contain?**

The site name and a short summary, then the key pages and resources as markdown links, often grouped under headings. Some sites also publish llms-full.txt, which bundles the full text so an agent can read everything in one request.

**What changed in v2 of llms.txt?**

The file format did not change. v2 added two standard link relations so an agent finds a page's markdown version and its llms.txt without guessing, accepted page.md alongside page.html.md as the address of a markdown version, defined what an llms.txt in a subpath covers, and dropped the context expansion tooling along with the mechanical meaning of the Optional section.

## Sources

- [llms.txt proposal](https://llmstxt.org/)
- [Web linking, RFC 8288](https://www.rfc-editor.org/rfc/rfc8288.html)

## Related

- [Serving Markdown to AI clients](/guides/markdown-for-agents)
- [Make your website easier for AI assistants to find and cite](/guides/get-cited-by-ai-assistants)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/mcp-server-card": `# MCP server cards and discovery

A server card describes an MCP endpoint for clients that support the relevant discovery convention. The card, the live endpoint and the client's protocol support must agree.

As of September 2026 the server card lives in two places that have not converged. Deployed cards, turva.dev's among them, commonly sit at /.well-known/mcp/server-card.json. The proposal behind the card, [SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127), now develops as an [experimental MCP extension](https://github.com/modelcontextprotocol/ext-server-card), and its draft reserves a different default, the MCP endpoint URL followed by /server-card. The draft does not recommend a /.well-known path for the card itself, and site-level discovery instead sits in a catalog: the experimental Server Card document keeps an AI Catalog at /.well-known/ai-catalog.json, while ARD v0.91 names /.well-known/ard.json. The convention is still moving, so a client that checks only one location may miss a card that exists at the other.

An MCP server card is a small JSON file that describes a site's Model Context Protocol server so a client can find it and learn what it offers. The Model Context Protocol itself is a standard way for agents to use external tools and data. A server implements the protocol and exposes a set of tools, and the card is how that server announces itself before any connection is made.

## What the card states

A useful card states the server name, the endpoint and the transport, in a shape a client can parse without guessing. Many published cards, including turva.dev's, also list the tools the server offers. The newer draft leaves that list to the live MCP connection instead, since a tools list answer from the running server cannot go stale the way a static list in a card can.

## Where discovery can fail

Finding a card is not the same as confirming the server works. A card can exist at a stale path, point to an endpoint that has moved, or name a transport the client does not support, and a client that stops at the card being found has not checked any of that. The card, the live endpoint and the client's own protocol support all have to agree before a connection succeeds, and only the connection attempt itself confirms that they do.

## How it fits with other discovery files

A server card sits in the same family as other well-known manifests a client looks for, such as an API catalog, an OpenAPI description and OAuth discovery. Each one removes a guess. The card answers what tools a server might expose, the API catalog answers what endpoints exist, and OAuth discovery answers how to authenticate. turva.dev publishes a server card that points to a read-only MCP server, which exposes the same agent-readiness data that the site shows to people, so a client can query the data directly rather than scraping a page.

## Practical steps

Publish the card at the deployed convention your target clients actually check, and confirm it with a live connection attempt rather than a directory listing. Where a client supports the newer draft location, publish there too rather than choosing one over the other, since the two conventions have not converged. The card is a low cost step for a site that wants to expose a capability to agents, and it only becomes useful once a client can reach and use the endpoint it names.

## Frequently asked

**What is an MCP server card?**

An MCP server card is a small JSON file that describes a site's Model Context Protocol server, its endpoint and its transport, so a client can attempt a connection without a human wiring it up first. The current draft leaves the tool list to the live connection rather than to the card.

**Why publish an MCP server card?**

Without a card or a registry listing, a client has no reliable way to discover that the server exists or what it offers, so the capability stays hidden even when it is live. Publishing the card is a low cost way to make the server discoverable, though discovery alone does not confirm the endpoint works.

**Where does an MCP server card live?**

Deployed cards commonly sit at /.well-known/mcp/server-card.json, and turva.dev serves one there. The current experimental draft reserves a different default, the MCP endpoint URL followed by /server-card, so a client may need to check both locations until the convention settles.

## Sources

- [MCP Server Card extension repository](https://github.com/modelcontextprotocol/ext-server-card)
- [Server Card discovery document](https://github.com/modelcontextprotocol/ext-server-card/blob/main/docs/discovery.md)
- [SEP-2127, the proposal](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127)

## Related

- [What agents.json describes](/guides/agents-json)
- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
- [Authentication and authorisation for AI agents](/guides/agent-authentication)
`,

  "/guides/agents-json": `# What agents.json describes

agents.json is one pattern for describing actions and endpoints for automated clients. Treat it as a specific declaration format, not as a universal requirement for an agent usable site.

The specification has stayed at version 0.1.0 since early 2025, and adoption since then has shifted toward MCP and newer discovery surfaces. A site can adopt agents.json, but it should not be treated as the settled or required way to declare an action surface. Where llms.txt tells an agent what a site contains, agents.json describes the actions and endpoints an agent is allowed to use, so an automated client can move from reading to doing without a human wiring it up first.

## Purpose

The file lists the operations a site exposes to agents, often pointing at an OpenAPI description or specific endpoints, along with the authentication a client needs to call them. A client reads the file, learns which actions exist, and calls them within the rules the site sets. Most sites expose actions only through a human interface, a form or a checkout flow that a person clicks through, and a client cannot reliably reverse-engineer that interface. A declared action surface removes that guesswork.

## Example

A minimal agents.json entry names an action, such as checking an order status, and points to the endpoint and method that perform it, together with the authentication scheme the endpoint expects. The file describes the shape of the call. It does not perform any authorisation itself and does not replace the checks the endpoint runs when the call actually arrives.

## Alternatives

agents.json sits beside other declarations a client looks for. An MCP server card describes a site's MCP server and its tools, an API catalog lists endpoints directly, and OAuth discovery describes how to authenticate. A site that has already published an MCP server exposing the same actions may not need a separate agents.json file, since the live tools list serves the same purpose and cannot go stale the way a static file can.

## Limits

Declaring an action in agents.json describes what exists. It does not grant a client permission to call it, and it does not perform the authorisation or rate limiting that has to happen on the server when the call arrives. Those checks live at the endpoint, not in the declaration file, and a site still has to enforce them regardless of what agents.json says. Treat the file as documentation a client can parse, not as an access control mechanism.

## Frequently asked

**What is agents.json?**

agents.json is a machine-readable file that declares what an AI agent can do on a site and how, describing the actions and endpoints an agent is allowed to use, often pointing at an OpenAPI description, along with the authentication a client needs. The specification has stayed at version 0.1.0 since early 2025.

**How is agents.json different from llms.txt?**

llms.txt tells an agent what the site contains. agents.json describes the actions an agent can take, so a site moves from something an agent can read to something an agent can operate, though the authorisation for any given call still happens at the endpoint.

**Does agents.json replace llms.txt?**

No. llms.txt tells an agent what the site contains and agents.json describes the actions an agent can take. Together they describe both what a site holds and what a client may do with it, though neither one performs the server side checks a call still needs.

## Sources

- [agents.json specification repository](https://github.com/wild-card-ai/agents-json)
- [Well-known URIs, RFC 8615](https://www.rfc-editor.org/rfc/rfc8615.html)

## Related

- [MCP server cards and discovery](/guides/mcp-server-card)
- [Authentication and authorisation for AI agents](/guides/agent-authentication)
- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
`,

  "/guides/x402-agent-payments": `# x402 and HTTP payment flows

x402 describes an HTTP-based payment flow. A payment declaration, an accepted payment and settlement are different states and should be documented separately.

x402 is a way for a site to ask an agent to pay before it returns a resource, using the long-reserved HTTP 402 Payment Required status. It lets an automated client discover a price, pay and continue, without a human stepping in to enter card details.

## How the flow works

When an agent requests a paid resource, the server responds with 402 and a manifest that states what is being sold and how to pay. The agent reads the terms, signs a payment payload for a supported method, and retries the request with the payload attached. The server or its facilitator then settles the payment. The transaction happens in the protocol, not in a checkout page built for human eyes.

## x402, AP2 and a2a-x402 are separate specifications

x402 belongs to a small family of agent payment standards, and its relationship to AP2 is worth stating precisely. They are separate specifications. AP2 defines the mandates and receipts that authorize a payment, and x402 defines an HTTP 402 payment flow that a separate extension, a2a-x402, carries into agent-to-agent work. As of September 2026 the AP2 project ships x402 scenarios among its own [samples](https://github.com/google-agentic-commerce/AP2/tree/main/code/samples/python/scenarios/a2a/human-present/x402), and the [a2a-x402 extension](https://github.com/google-agentic-commerce/a2a-x402) carries its own specification, so a site treats them as protocols it may support side by side rather than as one finished stack.

## Declaration, acceptance and settlement are different states

A 402 response with a manifest is a declaration that a resource can be bought this way, and nothing more. An agent that signs a payload and retries has made an accepted payment attempt, which is a second, later state. Settlement, where the server or its facilitator confirms the funds moved, is a third state that can trail the first two by an interval the site should be able to name. Treating these three as one event hides the point where a purchase can still fail after the agent believes it has paid, so a site's own record keeps them apart rather than collapsing a declaration into a completed sale.

## Why a declared payment surface matters

Checkout is one of the places agent commerce stalls today. An agent can find a product and compare options, then stall at a checkout flow designed for a person with a browser. A declared payment surface such as x402, paired with structured pricing in the page data, lets the agent complete the purchase the same way it completed the search, though checkout is one obstacle among several and not the whole of what agent commerce still needs. A site that publishes these signals tells agents it is open for automated business, and in the case of an open peer pricelist model, it can be shown alongside other options at the moment an agent decides where to spend.

turva.dev's own x402 surface is a declaration only. Its manifest states that no facilitator is configured, that the payment header is not verified and that the resource answers 402 regardless of payment, so sending funds achieves nothing, and settlement happens out of band against a written scope after a quote. That is the boundary this guide recommends stating on any site whose x402 surface is not wired to a facilitator: say which of the three states the site actually implements.

## Frequently asked

**What is x402?**

x402 is a way for a site to ask an agent to pay before it returns a resource, using the HTTP 402 Payment Required status. It lets an automated client discover a price, pay and continue without a human entering card details.

**Why does agent commerce need a payment surface like x402?**

Checkout is one of the places agent commerce stalls today. An agent can find a product and compare options, then stall at a checkout flow built for a person. A declared payment surface lets the agent complete the purchase the same way it completed the search.

**What stops an agent from completing a purchase today?**

Checkout is one common stopping point. An agent can find a product and compare options, then stall at a flow built for a person entering card details. A declared payment surface removes that particular stop, and other gaps in agent commerce stay separate problems with their own fixes.

## Sources

- [x402 protocol site](https://x402.org/)
- [x402 repository](https://github.com/coinbase/x402)
- [a2a-x402 extension](https://github.com/google-agentic-commerce/a2a-x402)
- [Agent Payments Protocol (AP2) repository](https://github.com/google-agentic-commerce/AP2)

## Related

- [Agent commerce discovery: A2A, AP2, ACP and UCP](/guides/agent-commerce-discovery)
- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/response-headers-for-agents": `# Response headers for AI clients

Response headers describe formats, discovery links and request policy. Check both what a header declares and whether the server behaves accordingly.

Response headers are the metadata a server sends with every page, and the right ones let an AI client work without parsing the full HTML. They are the cheapest place to make a site more legible to automated clients, because a client reads them before it reads the body. The reason headers matter is order. A client fetches the response, reads the status and headers first, and decides what to do next from them. If the headers already say where the structured data is and what formats are available, the client can skip the expensive step of parsing a page built for human display.

## Content type

Content-Language and a clean content type remove ambiguity about what the client is reading. A response that states its language and its exact content type leaves no guesswork about how to parse it or which version of a page it received.

## Link and Vary

A Link header can point a client straight at a site's machine-readable resources, such as an API catalog or a markdown version of the page, so the client finds them without crawling. A Vary header that includes Accept tells caches and clients that the site can return different formats for the same URL, which is what makes markdown content negotiation reliable. A missing Vary header breaks content negotiation, because a cache can then serve the wrong format to the next client that asks. A Cache-Control immutable directive set on the wrong response can also stop a client from seeing an update.

## Rate limits

RateLimit-Policy states the quota a server enforces, and RateLimit adds the remaining allowance per client where the server tracks one, so a well-behaved client can throttle itself instead of guessing. Sending a RateLimit-Policy header does not by itself prove the server enforces the stated quota. Checking enforcement means sending requests past the stated limit and confirming the server responds accordingly, not reading the header alone. This site sends the policy header on every response and enforces it, and it keeps no per-client counter, so it sends no RateLimit header.

## Verification

As of July 2026 the [IETF draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/), revision 11 from May 2026, remains active without yet becoming a standard. Checking a site's headers means requesting a page and reading the response headers directly, then confirming the behaviour they describe, such as a different response for a different Accept value or a request that is actually throttled once a stated limit is passed. The fix for a missing or wrong header is usually small and lives at the edge, which on turva.dev is a Cloudflare Worker that sets these headers on every response.

## Frequently asked

**Which response headers help AI agents?**

A Link header points an agent at machine-readable resources such as an API catalog or a markdown version of the page. A Vary header that includes Accept makes markdown content negotiation reliable. A RateLimit-Policy header, and a RateLimit header where the server tracks a per-client allowance, let a well-behaved agent throttle itself, and Content-Language with a clean content type removes ambiguity.

**Why do response headers matter to agents?**

An agent reads the status and headers before the body and decides what to do from them. If the headers already say where the structured data is and what formats are available, the agent can skip parsing a page built for human display.

**Which header makes markdown content negotiation reliable?**

A Vary header that includes Accept. It is what keeps the negotiation reliable when the same URL can return more than one representation of the page.

## Sources

- [Web linking, RFC 8288](https://www.rfc-editor.org/rfc/rfc8288.html)
- [API catalog, RFC 9727](https://www.rfc-editor.org/rfc/rfc9727.html)
- [RateLimit header fields, IETF draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/)
- [HTTP semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)

## Related

- [Serving Markdown to AI clients](/guides/markdown-for-agents)
- [When AI clients cannot read rendered pages](/guides/prerendering-for-agents)
- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
`,

  "/guides/seo-vs-agent-readiness": `# SEO and agent-readiness: overlap and differences

SEO, AI-answer visibility and technical agent access overlap, but they answer different questions. Use the measurement that matches the outcome you want to improve.

## Two disciplines, two readers

SEO is a wider discipline than keywords and backlinks. It covers indexing, crawlability, site structure and relevance to the query a person types, and ranking on a results page is the outcome that gets measured. Agent-readiness is built around a different set of surfaces: llms.txt, structured data, response headers and well-known manifests, where an agent is the reader and the page may never be seen by a person at all. A site can rank well on Google and still be opaque to an agent, and a site can be highly legible to agents while ranking modestly in classic search.

## Four outcomes, four measurements

The terms above blur together because people use one word, visibility, for four different outcomes. Separating them tells you which surface to fix.

| Outcome | What it means | What gets measured |
| --- | --- | --- |
| Indexing | A crawler can fetch and parse the page | Crawl access, sitemap, robots.txt |
| Search match | The page ranks for a query a person typed | Position on a results page |
| Source citation | An AI answer names the page as its source | Whether an assistant's answer links back to it |
| API action | An agent calls an endpoint to do something | Whether the call resolves and returns a usable result |

## Where Google's AI features fit

Indexing and search match are the classic SEO pair, and they are the input Google's own AI search features build on. Google states that its generative features in Search are rooted in the same core ranking and quality systems, so a page that indexes and ranks well feeds directly into AI Overviews and similar results inside Google Search. That connection does not extend to source citation from an assistant that retrieves outside a search index, which depends on whether the model can read the content cleanly and corroborate it elsewhere, and it does not extend to API action at all, which depends on machine-readable surfaces classic SEO never touched.

## The gap is widening

As people ask assistants instead of typing queries, ranking is not the only question. Whether the model can read the site cleanly and is willing to cite it matters too, and that depends on the discovery and content surface rather than on keyword density. A site that wants all four outcomes has to work on both sides, and the agent-readiness side, source citation and API action, is the one most teams have not started.

turva.dev measures the agent-readiness side and reports exactly which checks pass or fail. For an audit, contact info@turva.dev.

## Frequently asked

**Is agent-readiness the same as SEO?**

No. SEO covers indexing, crawlability and ranking on a results page for a person to click. Agent-readiness covers whether an AI agent can read, decide and sometimes act, through surfaces such as llms.txt and structured data. A site can rank well and still be opaque to agents.

**Why does search ranking not guarantee presence in AI answers?**

It depends on the product. Google states that its generative features in Search use the same core ranking and quality systems, so indexing and search match carry over into results built inside Google Search. An assistant that retrieves outside a search index cites a site when it can read the content cleanly and corroborate it, which depends on the discovery and content surface rather than on ranking.

**Can a site rank well and still be invisible to agents?**

Yes. Search match is scored on relevance to a query and on ranking signals, while an agent needs to read the content cleanly and find the discovery surfaces. A page can win the search result and still be opaque to the client that reads it.

## Sources

- [Google Search Central, AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [isitagentready.com](https://isitagentready.com/)

## Related

- [Agent-readiness, AEO and GEO](/guides/agent-readiness-aeo-geo)
- [Make your website easier for AI assistants to find and cite](/guides/get-cited-by-ai-assistants)
- [Measure agent-readiness with evidence](/guides/measurement-led-agent-readiness)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/json-ld-structured-data": `# JSON-LD and structured data for AI clients

Structured data makes page facts explicit, but those facts must agree with the visible page and underlying source. Valid syntax can still carry a wrong price or availability.

JSON-LD is a block of structured data in a page that states facts in a form a machine can read without interpreting prose. It tells an agent what the page is about, who runs it, what it sells, and at what price, as data rather than as sentences an agent has to parse and might misread. A human reads a price from a layout and a currency symbol. An agent reading raw HTML has to guess which number is the price and which is a shipping estimate, and a JSON-LD Offer with a price and a currency removes the guess.

## Facts as data

Structured data connects a page to the wider graph an agent builds. Declared types such as Organization, Service, FAQPage and Article let an agent place a page in context. They do not make a claim true and they oblige nobody to cite it. What they remove is parsing ambiguity, and trust and citation stay decisions of the system that reads the page.

## Agreement across surfaces

The cost of getting it wrong is silent. An agent does not report that it failed to parse a price, it just acts on a worse guess. Clean JSON-LD is one of the cheapest ways to make a page legible, and it sits in the same family as the response headers and well-known manifests an agent reads first.

The opposite failure is data that parses and is wrong. A product page that publishes a price of 0 and an availability of InStock on every item is structurally valid, and an agent that trusts it will offer a customer a free product that is in stock. An Organization node whose email field holds a first name validates just as well. Wrong data is worse than missing data, because missing data makes an agent guess and wrong data makes it confident. The check is the one a buyer would make: read the JSON-LD next to the page and ask whether the two say the same thing, and where a source system feeds the page, whether the JSON-LD also agrees with that source.

## Validation

Three separate questions get asked here, and each has its own answer. Syntax validity asks whether the JSON-LD parses as the declared type with the required fields present, and a validator answers that from the markup alone. Semantic correctness asks whether the values in that valid structure match the page a person sees and the system that feeds it, and a validator cannot answer that, a person has to compare the two. AI source selection asks whether an assistant picks this page as the source for an answer at all, which depends on the assistant, the query and the moment, and neither syntax nor semantic correctness settles it on its own. A guide's own sample report shows a case where a price of 0 passed every syntax check and one assistant then cited it as the reason the whole catalog was free, in the [sample audit report, finding F1](/samples/audit-report#f1-every-product-publishes-a-price-of-0-and-an-availability-of-instock-on-all-three-surfaces).

## Limits

Clean, correct JSON-LD makes a page legible. It does not guarantee that an assistant reads it, cites it, or answers a question the way the site would want. Legibility removes the guess an agent would otherwise make about the page's own facts. What an assistant does with a legible page is a separate, observed question, and it is checked by putting real questions to real assistants rather than by reading the markup again.

turva.dev declares JSON-LD for its organization, the person behind it, its services and its guides, and the next scan reads the structured data as present. For an audit of a site's structured data, contact info@turva.dev.

## Frequently asked

**What is JSON-LD?**

JSON-LD is a block of structured data in a page that states facts in a form a machine can read without interpreting prose. It tells an agent what the page is about, who runs it, what it sells, and at what price, as data rather than sentences.

**Why does structured data matter for agents?**

An agent reading raw HTML has to guess which number is a price and which is a shipping estimate. A JSON-LD Offer with a price and a currency removes the guess, and declared types let an agent place a page in context. Trust and citation stay decisions of the system that reads the page.

**What should JSON-LD state on a page?**

What the page is about, who runs it, what it sells and at what price, as data rather than sentences. An Offer with a price and a currency removes the guess an agent would otherwise make.

**Can structured data be valid and still wrong?**

Yes. A price of 0 with an availability of InStock on every product passes every syntax check and tells an agent the whole catalog is free, and a contact field holding the wrong kind of value validates the same way. A syntax validator reads the shape, so a person has to compare the data with the page it describes.

## Sources

- [JSON-LD 1.1, W3C recommendation](https://www.w3.org/TR/json-ld11/)
- [schema.org vocabulary](https://schema.org/)
- [Google Search Central, structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

## Related

- [Make your website easier for AI assistants to find and cite](/guides/get-cited-by-ai-assistants)
- [llms.txt explained](/guides/llms-txt)
- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
`,

  "/guides/well-known-for-agents": `# The /.well-known directory for agent discovery

Well-known URLs give clients predictable places to look for specific metadata. Publish the documents your service actually supports and identify the convention behind each one.

The /.well-known directory is a standard place at the root of a site where clients look for machine-readable descriptions of what the site offers. Instead of crawling pages and guessing, a client fetches a predictable path and reads a manifest that points it to everything else. The idea comes from a long-standing web convention, and it now carries several files that matter to agents, each backed by a different level of standardisation.

| Path | Purpose | Standard or convention |
| --- | --- | --- |
| /.well-known/api-catalog | Lists a site's public APIs from one URL | RFC 9727 |
| /.well-known/oauth-authorization-server | Describes how a client authenticates | OAuth discovery, RFC 8414 |
| /.well-known/security.txt | States where to report a security problem | RFC 9116 |
| /.well-known/mcp/server-card.json | Describes an MCP server and how to reach it | Deployed convention, not yet standardised |
| /.well-known/x402, /.well-known/mpp, /.well-known/ap2 | Payment and agent-payment manifests: how an agent is quoted and how it pays | x402, MPP and AP2, deployed conventions |

## What each file establishes

An API catalog at a well-known path, defined by RFC 9727, lets a client enumerate a site's public APIs from a single URL. OAuth metadata describes how to authenticate, under its own long-established RFC. security.txt says where to report a problem, also under its own RFC. Each of these three has a fixed specification behind it, so a client that supports the standard can rely on the path staying put.

## Where MCP discovery still moves

A server card describes an MCP server and how to reach it, but this one is not yet settled the way the three above are. Deployed cards, turva.dev's among them, sit at /.well-known/mcp/server-card.json. The experimental Server Card specification instead reserves the MCP endpoint URL followed by /server-card as its default, and expects a client to follow the URL a site's own catalog gives rather than assume a fixed well-known path. Treat the MCP card path as a deployed convention, not as a ratified standard on the same footing as RFC 9727 or OAuth discovery.

## Why lookup beats crawling

The value of a well-known path is that discovery becomes a lookup rather than a search. A client that knows the convention can ask one predictable question and get a map, which is faster and more reliable than inferring structure from rendered HTML. A site that publishes a well-known surface is announcing its capabilities in a form clients already know how to parse.

## What a missing directory means

A missing or thin well-known directory does not break a site for people, and it does not mean every client will abandon the site outright. It does mean a client that relies on lookup rather than crawling has to fall back to guessing or skip the site, so the practical effect depends on which clients the site cares about and how those clients behave when a lookup fails. turva.dev publishes an API catalog, a server card, OAuth metadata, payment manifests and a security contact under /.well-known.

## Frequently asked

**What is the /.well-known directory?**

The /.well-known directory is a standard place at the root of a site where clients look for machine-readable descriptions of what the site offers. A client fetches a predictable path and reads a manifest that points it to everything else.

**What files do agents look for under /.well-known?**

An API catalog defined by RFC 9727, an MCP server card, OAuth metadata, payment and agent-payment manifests, and a security contact. The MCP card is the one whose home is still moving: deployed cards use /.well-known/mcp/server-card.json, while the experimental specification defaults to the MCP endpoint URL plus /server-card and does not recommend a well-known path for the card itself.

**Why do clients use the well-known directory instead of crawling pages?**

Because it turns discovery into a lookup rather than a search. A client fetches a predictable path and reads a manifest that points it to everything else, instead of inferring capabilities from navigation.

## Sources

- [Well-known URIs, RFC 8615](https://www.rfc-editor.org/rfc/rfc8615.html)
- [API catalog, RFC 9727](https://www.rfc-editor.org/rfc/rfc9727.html)
- [OAuth 2.0 authorization server metadata, RFC 8414](https://www.rfc-editor.org/rfc/rfc8414.html)
- [security.txt, RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.html)
- [Server Card discovery document](https://github.com/modelcontextprotocol/ext-server-card/blob/main/docs/discovery.md)

## Related

- [MCP server cards and discovery](/guides/mcp-server-card)
- [Authentication and authorisation for AI agents](/guides/agent-authentication)
- [Sitemaps, robots.txt and AI crawler access](/guides/sitemaps-and-robots-for-agents)
`,

  "/guides/agentic-resource-discovery": `# Agentic Resource Discovery and resource catalogs

Resource catalogs describe the agent-facing interfaces a site exposes. This guide distinguishes ARD revisions, earlier AI Catalog conventions and the resources those manifests point to.

Agentic Resource Discovery, or ARD, is an open specification for telling AI agents what a site offers, in one machine-readable file. Instead of inferring from pages whether a site has an MCP server, an agent interface or an API, the site publishes a single index that names each resource and where to reach it. The specification appeared in 2026, is licensed under Apache 2.0, and builds on the AI Catalog data model maintained by a working group under the Linux Foundation, as its [June 2026 announcement](https://developers.googleblog.com/announcing-the-agentic-resource-discovery-specification/) states.

## What the manifest contains

A site advertises its agentic resources by serving a static JSON manifest under /.well-known. ARD v0.91, published 26 August 2026, names the file /.well-known/ard.json and the link relation ard, and says a conformant client MUST read that path. The predecessor path /.well-known/ai-catalog.json and the relation ai-catalog are ones a client MAY also consult, so a site that serves only the old path may not be found by a client that follows the current revision.

The manifest itself is a small envelope with a specVersion, a host block that names the operator, and an entries array. Each entry describes one resource with a stable identifier, a display name, a type, a url and a short description. A resource can be an MCP server, an A2A agent, an API or a skill set. A registry can crawl published catalogs and answer a capability query by pointing an agent at the right resource.

## Where it sits, and how it differs from llms.txt

ARD is a discovery layer, not a transport. It helps an agent find the right resource, which the agent then calls through that resource's own protocol, whether MCP, A2A or a plain API. Discovery comes first and invocation second. The catalog does not replace the manifests it points to, it indexes them, so a site keeps its server card, its agent card and its OpenAPI description, and adds one file that ties them together.

llms.txt tells an agent where a site's content lives. An ai-catalog or ard manifest tells an agent which agentic resources the site exposes and how to reach them. The two are complementary, and neither is a ranking file. Google [has said publicly](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) that llms.txt does not affect its search results, and the same holds for a resource catalog. These files are read by agents that act, not by a search index.

## Draft status and how to validate a manifest

The specification is early. The repository that carries it calls itself a temporary working repo, and its field names are still being argued in pull requests. Publishing a manifest today means validating it against the draft revision the client you care about actually reads, rather than assuming one fixed shape.

## What a scan checks, and why it matters now

A technical scan can check whether a manifest resolves at the declared path, parses as valid JSON and names entries with a url that answers. A manual review reads whether those entries point at resources that actually work, and whether the descriptions match what the resource does. Neither checks whether an agent has found the catalog through observed use, which is a separate question from whether the file exists and parses.

Adoption is early. In a June 2026 check against public well-known paths, none of the launch partners the [announcement](https://developers.googleblog.com/announcing-the-agentic-resource-discovery-specification/) shows yet served a discoverable ai-catalog.json, so publishing one now is a forward move rather than table stakes. The value is the same as every other discovery surface. A capability an agent cannot find is a capability that does not exist for that agent, and one predictable file turns a set of separate manifests into a single answer.

turva.dev serves the same entries at both paths, /.well-known/ard.json with the v0.91 media types and rel="ard" in every page head, and /.well-known/ai-catalog.json for clients and scanners that still read the predecessor. Both index its MCP server, its A2A agent, its API and its agent skills, each of which already resolves on its own. The separate experimental MCP Server Card discovery document keeps its own convention, an AI Catalog at /.well-known/ai-catalog.json, so the two profiles are described apart and not merged. For an audit of a site's discovery surface, contact info@turva.dev.

## Frequently asked

**What is an ai-catalog.json?**

An ai-catalog.json is a static JSON manifest at /.well-known/ai-catalog.json that lists the agentic resources a site offers, such as its MCP server, A2A agent and API, each with an identifier, type, url and description, so agents and registries can discover them from one file. Since ARD v0.91 the same manifest shape is published as /.well-known/ard.json, and ai-catalog.json is the predecessor path that a client may still consult.

**Does Agentic Resource Discovery affect search ranking?**

No. ARD is a discovery layer for AI agents, not a search file. It indexes the resources an agent can call through their own protocols. Google has said publicly that llms.txt does not affect its search results, the guide above links the statement, and the same applies to a resource catalog.

**Where does an ai-catalog.json live?**

Under ARD v0.91 at /.well-known/ard.json, announced with a link rel="ard" in the page head. The draft says a conformant client MUST read that path and MAY also consult the predecessor /.well-known/ai-catalog.json. Serve ard.json, and keep ai-catalog.json while clients and scanners still read it. Agents and registries read the resources a site offers from that path instead of inferring them from its pages.

## Sources

- [ARD specification repository](https://github.com/ards-project/ard-spec)
- [Google announcement of Agentic Resource Discovery](https://developers.googleblog.com/announcing-the-agentic-resource-discovery-specification/)
- [Server Card discovery document, the AI Catalog side](https://github.com/modelcontextprotocol/ext-server-card/blob/main/docs/discovery.md)

## Related

- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
- [MCP server cards and discovery](/guides/mcp-server-card)
- [Agent commerce discovery: A2A, AP2, ACP and UCP](/guides/agent-commerce-discovery)
`,

  "/guides/agent-authentication": `# Authentication and authorisation for AI agents

Authentication identifies a client. Authorisation determines what it may access or do. Discovery metadata explains the available flow, while the service must enforce the permissions.

Authentication tells a site who is asking. Authorisation tells the site what that identity may do. A client can authenticate successfully and still be authorised for nothing beyond a read-only scope, and it is authorisation, not authentication, that turns a read-only client into one that can act on a person's behalf.

The pattern follows existing standards. OAuth discovery at a well-known path tells an agent where to request access and what scopes exist. An authorization server and a protected resource description let the agent ask for a token tied to a specific permission rather than a blanket login. When a site also advertises an agent registration flow, an agent can register and claim access on a user's behalf without someone provisioning credentials by hand. None of this removes the case for a person confirming a specific high-stakes action at the point it happens, and a service can require that confirmation on top of scoped auth without contradicting either.

## What an agent must discover before it acts

Discovery answers two questions: where to request access, and what scopes exist. OAuth discovery at a well-known path answers both, so an agent can request a token tied to one named permission instead of a blanket login. A protected resource description names what the resource actually needs, so the agent asks for that scope and nothing wider. The service still decides at request time whether to grant it, and discovery only describes the route, it does not grant anything by itself.

## The written entry point, and its two dialects

A short auth description, sometimes published as an auth.md, gives an agent a human-readable entry point to the same flow. It is a convention rather than a standard, and as of September 2026 it is two conventions: the recipe the isitagentready.com scanner publishes and the open protocol WorkOS publishes name three of the same fields differently, read in full in the [post linked below](/blog/two-auth-md-dialects). The OAuth metadata documents define the machine-readable discovery and say nothing about a written page or a registration route, so an agent follows only the endpoints a site advertises for itself.

## Why scoped, discoverable auth matters

The reason this matters is trust and blast radius. A site that exposes capability without scoped, discoverable auth either stays closed to agents or invites unsafe workarounds. Proper discovery lets an agent request the least access it needs, and lets the site grant capability without handing over a password the agent should never see. Together with OAuth discovery it answers the agent's first question about any action, which is how to get permission to do it safely.

turva.dev publishes OAuth discovery, a protected resource description and an agent registration entry point, and the audit never requests production credentials, and access for purchased implementation is agreed separately and limited to the work. For an audit of a site's authentication surface, contact info@turva.dev.

## Frequently asked

**How do AI agents authenticate?**

An agent proves who it is through discoverable standards such as OAuth discovery at a well-known path, which tells it where to request access and what scopes exist. It can then request a token tied to a specific permission rather than a blanket login.

**Why does scoped, discoverable auth matter?**

A site that exposes capability without scoped auth either stays closed to agents or invites unsafe workarounds. Proper discovery lets an agent request the least access it needs without handling a password it should never see.

**What does an agent need to discover before it can authenticate?**

Where to request access and what scopes exist. OAuth discovery at a well-known path tells it both, so it can request a token tied to a specific permission rather than a blanket login.

## Sources

- [OAuth 2.0 protected resource metadata, RFC 9728](https://www.rfc-editor.org/rfc/rfc9728.html)
- [OAuth 2.0 authorization server metadata, RFC 8414](https://www.rfc-editor.org/rfc/rfc8414.html)
- [MCP authorization specification, 2026-07-28 revision](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
- [Web Bot Auth, Cloudflare reference](https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/)

## Related

- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
- [Define what an agent may do with your data](/guides/letting-agents-act-on-data)
- [Two files called auth.md, and they disagree on the field names](/blog/two-auth-md-dialects)
`,

  "/guides/measurement-led-agent-readiness": `# Measure agent-readiness with evidence

A scan is one source of evidence. Combine it with direct technical checks and observed AI answers, and record the method and date behind every conclusion.

Agent-readiness is a property you can measure, so it should be measured rather than claimed. Three kinds of evidence answer three different questions, and a credible conclusion names which one it rests on. A technical scan reads what a defined set of checks finds on the live site at a point in time. A manual review reads what the scan does not score, the parts that need a person to look, such as whether a page's markdown twin actually matches its HTML or whether a manifest is internally consistent. Observed AI answers read what a named assistant says today when asked a buyer's question, which depends on that assistant's own retrieval and can change between sessions.

The difference between a scan and a self-assessment shows up the moment something changes. A header gets dropped in a deploy, or a manifest starts returning the wrong content type. A checklist filled in by hand still reads as done, because nobody re-ticked the box. A scan reads the live site and the category drops, which is the only signal that matches what an agent experiences. Neither replaces the other: a scan tells you what a defined check found, and a manual review catches what the check set does not cover.

## What a technical scan checks

A scan runs a fixed set of checks against the live site, such as whether llms.txt resolves, whether a sitemap lists the pages it should, and whether a response carries the content type it declares. Each check either passes or fails on the day it ran, against the version of the site live that day.

## What a manual review adds

A person reads the surfaces a scanner does not score: whether an example in a guide still matches the current API, whether a claim on one page contradicts a date or a number on another, whether a markdown twin has drifted from the HTML it is supposed to mirror. This is slower and it is where the reviewer's judgment does the work a fixed check cannot.

## What an observed AI answer shows

Asking a named assistant a buyer's question and recording what it says is a third kind of evidence, distinct from both of the above. It shows what that assistant retrieved and how it answered on that date, not what the site's technical readiness is, and it can change on a later run without the site changing at all.

## Recording the method and the date

Each conclusion should say which of the three it rests on and when it was taken. This is the standard turva.dev applies to its own site. An audit reports the exact checks that pass or fail, each failure comes with a concrete fix, and the categories the report named are the ones a later scan is checked against. Measured by an independent scanner, turva.dev reaches 100/100 and Level 5, Agent-Native, on isitagentready.com. Measured 2026-09-06. A later scan can read a different check set, so it is reported as a new measurement and never as a re-confirmation of the old one.

For an audit that reports measured results, naming the method behind each one, contact info@turva.dev.

## Frequently asked

**Why should agent-readiness be measured rather than asserted?**

A checklist filled in by hand records intentions. A technical scan records what a defined set of checks finds on the live site, and the two often disagree, especially after a deploy drops a header or changes a content type.

**What is the difference between a technical scan and a manual review?**

A scan runs a fixed set of checks and reports pass or fail against the live site on the day it ran. A manual review covers what the scan does not score, such as whether an example still matches the current API or whether a markdown twin has drifted from its page.

**Why can a site pass a checklist and still fail a scan?**

Because a checklist filled in by hand records intentions and a scan records what a defined check actually finds. The two often disagree, especially after a deploy drops a header or changes a content type.

## Sources

- [isitagentready.com](https://isitagentready.com/)
- [internet.nl](https://internet.nl/)
- [Hardenize](https://www.hardenize.com/)

## Related

- [What a website and API agent-readiness audit covers](/guides/agent-readiness-audit)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
- [Common agent-readiness gaps in a measured sample](/guides/agent-readiness-gaps)
- [Define what an agent may do with your data](/guides/letting-agents-act-on-data)
`,

  "/guides/prerendering-for-agents": `# When AI clients cannot read rendered pages

Some clients read the initial HTTP response without running a browser. Compare that response with the rendered page before choosing server rendering or a Markdown representation.

Many sites render their content with JavaScript in the browser. A person's browser waits a moment and the page fills in. A client that reads only the raw HTTP response sees the page before that script runs, so it reads a loading shell instead of the content.

Client behaviour varies. Some AI clients run a full browser and execute JavaScript before reading a page, so they see the same content a person sees. Others fetch the URL directly and read only the response body, without executing any script. A site cannot assume which behaviour applies without checking, and the practical fix is the same either way: make sure the finished content is present in the first response for clients that need it.

## What the first response contains

For a JavaScript-rendered page, the first HTTP response usually contains an HTML shell: a document structure, script tags, and little visible text. The content a person eventually sees is built in the browser after those scripts run. A client that stops at the raw response reads the shell, not the content, and has no way to know that more is coming.

## Options

Prerendering renders the page on the server or at the edge and returns finished HTML in the first response, so any client reads the content immediately, without running scripts. A separate option is to serve a Markdown representation of the page on request, which skips the rendering question for clients that ask for it and costs a fraction of the tokens a full HTML page would. These options are not mutually exclusive. A site can keep its interactive build for people and serve prerendered or Markdown content by request, deciding on the incoming request rather than rebuilding the whole site. On turva.dev that decision lives in a Cloudflare Worker that reads the request's Accept header and returns the matching form.

## Content parity

Whichever form a client is served, technical scan and manual review both check the same requirement: the content in that response must match what a person sees on the rendered page. A prerendered response that leaves out sections, or a Markdown twin that drifts from the live page, fails that check even if the response itself loads instantly. Content parity is a maintenance commitment, not a one time build step.

## How to verify

Fetch the URL with a plain HTTP request and read the response body directly, then load the same URL in a browser and compare what each one contains. A gap between the two is the failure this guide describes. Checking both forms, rather than only the rendered page, is the only way to know what a non browser client actually receives.

## Frequently asked

**Why do AI agents see empty pages?**

Some AI clients read the initial HTTP response without running a browser, so if a page relies on JavaScript to fill in its content, that client reads the loading shell rather than the finished content. Other AI clients run a full browser and render the page the way a person's browser does, so the outcome depends on the client.

**How do you fix empty pages for AI clients?**

Serve the real content in the first response for clients that need it, either through prerendering at the server or edge, or by serving a Markdown representation of the page on request. A Markdown response skips the rendering question and costs a fraction of the tokens.

**Is prerendering the only fix for empty pages?**

No. Serving a Markdown version of the page on request also works, and it skips rendering and costs a fraction of the tokens. Either approach only helps once the finished content is actually present in the response the client receives.

## Sources

- [Google Search Central, JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [OpenAI crawler and user-agent documentation](https://developers.openai.com/api/docs/bots)
- [The text/markdown media type, RFC 7763](https://www.rfc-editor.org/rfc/rfc7763.html)

## Related

- [Serving Markdown to AI clients](/guides/markdown-for-agents)
- [Response headers for AI clients](/guides/response-headers-for-agents)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/sitemaps-and-robots-for-agents": `# Sitemaps, robots.txt and AI crawler access

Sitemaps describe published URLs, while robots.txt communicates crawler rules. Neither file guarantees retrieval or replaces access control.

robots.txt and the sitemap are the oldest machine-readable files on the web, and they still shape whether an agent is welcomed in and what it can find. A well-behaved agent reads robots.txt to learn the rules and the sitemap to learn the map before it reads any page. Not every client does either, so these files set the terms for the agents that follow them rather than for all traffic.

## Crawl preferences

robots.txt sets crawl rules, and it can name AI crawlers explicitly, so a site states whether it welcomes GPTBot and similar clients rather than leaving them to guess. A Content-Signal directive can go further and declare how content may be used, separating ordinary search from AI input and training, which states a granular preference instead of an all-or-nothing block. GPTBot and OAI-SearchBot serve different purposes for the same provider. OpenAI uses OAI-SearchBot for search and GPTBot for training, so blocking one does not block the other, and a page can still be named in an assistant's answer through a source other than the blocked crawler.

## URL discovery

The sitemap answers the other question, which is what exists. A complete sitemap lists every canonical URL, so an agent can find the real pages without inferring them from navigation. A last-modified date is optional in the sitemaps protocol and still worth publishing, because it tells a returning client what changed. The sitemap is a hint to the client rather than a guarantee that anything gets fetched. A page that is not in it is still a page an agent may never reach.

## Content Signals

A Content-Signal directive is a stated preference and not an enforcement mechanism. The Content Signals documentation says plainly that some automated systems may ignore it. Publishing the directive tells a compliant client what is welcome. It does not by itself stop a client that chooses not to read it or not to honour it.

## Checks to run

Getting these files wrong is quietly expensive. A robots.txt that blocks an AI crawler by accident stops that crawler from fetching the pages and can keep the content out of what it feeds, though it does not by itself remove the site from an assistant's answers, since an answer can still name a page through another source. A stale sitemap hides new pages. The files are small and the fix is fast, which is why they are the first thing a readiness review checks. In [a scan of 567 company sites](/blog/website-agent-readiness-567-sites) finished in September 2026, robots.txt and the sitemap were the two most frequent first-fix subjects among the 74 sites that read Level 0, 45 and 38 of 68 notes, and 29 named both, usually a robots.txt the CMS shipped by default and a sitemap that was missing or never announced in it.

turva.dev declares AI bot rules and Content Signals in robots.txt and keeps a complete sitemap.

## Frequently asked

**How do robots.txt and the sitemap affect AI agents?**

A well-behaved agent reads robots.txt to learn the rules and the sitemap to learn the map before it reads any page, though not every client does either. robots.txt can name AI crawlers explicitly, and the sitemap lists every canonical URL so an agent finds the real pages without inferring them from navigation.

**What is a Content-Signal directive in robots.txt?**

A Content-Signal directive declares how content may be used, separating ordinary search from AI input and training. It states a granular preference instead of an all-or-nothing block, and its own documentation says some automated systems may ignore it.

**Can robots.txt name AI crawlers specifically?**

Yes. robots.txt can name AI crawlers explicitly rather than treating every client the same, and a Content-Signal directive separates ordinary search from AI input and training. Both express a preference that a client can ignore.

## Sources

- [Robots Exclusion Protocol, RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html)
- [Sitemaps protocol](https://www.sitemaps.org/protocol.html)
- [Content Signals](https://contentsignals.org/)
- [OpenAI crawler and user-agent documentation](https://developers.openai.com/api/docs/bots)
- [DNS-AID, IETF draft](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)

## Related

- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
- [Response headers for AI clients](/guides/response-headers-for-agents)
- [Make your website easier for AI assistants to find and cite](/guides/get-cited-by-ai-assistants)
`,

  "/guides/markdown-for-agents": `# Serving Markdown to AI clients

A markdown representation can make published content easier for text-based clients to consume. Keep its facts and links aligned with the HTML page.

An HTML page carries markup, scripts and layout that a browser needs and a text-based client does not. A client that reads the raw HTML pays for all of that structure before it reaches the words. Serving a markdown form of the same page at the same address removes that overhead without changing what the page says. The words stay the same.

## Negotiation

Content negotiation lets a client ask for the markdown form directly. A client sends an Accept header naming text/markdown, and the server returns the markdown form of the page in response to that same URL. A client that never sends an Accept header receives the HTML by default, so the markdown form is an addition to the page rather than a replacement for it.

## Direct markdown URLs

Since v2 of the llms.txt proposal, the markdown form also has its own address. A plain page URL takes .md appended, a URL ending in .html has that suffix replaced, and a directory-style URL takes an index form. The page can also carry a link relation of type alternate for text/markdown, so a client that never sends an Accept header can still find the address by reading the page's own links. A site can also publish llms-full.txt, a single file that bundles the whole site as text, so a client can read everything in one request instead of fetching many pages.

## Content parity

Markdown delivery is not a separate site. It is the same content offered in a second form, and the two forms should never drift apart. The page stays as it is for people, and a client that asks for text gets text, with the same facts and the same links. Paired with a clear llms.txt that lists where the content lives, this makes a site fast and reliable to read at machine speed.

## Verification

The token saving can be large. On turva.dev the markdown form of a page has measured at a fraction of the tokens the HTML form costs for the same content, and that difference is what decides whether a client reads a page in full or runs out of budget partway through. That figure is tied to the page it was measured on and to how the receiving client counts tokens, so it is a measured example rather than a cost guarantee that holds for every client and every page. Checking a given page means comparing its own HTML and markdown byte counts, not assuming a figure measured elsewhere carries over.

turva.dev serves markdown on request and publishes llms.txt and llms-full.txt. Every page also answers at its own .md address, and /guides/markdown-for-agents and /guides/markdown-for-agents.md return the same markdown byte for byte.

## Frequently asked

**Why serve markdown to AI agents?**

An HTML page is built for a browser, and an agent that reads it pays for all the markup, scripts, and layout it does not need. A markdown version gives the content without the wrapper, which is cheaper and less error-prone.

**How does an agent request the markdown version?**

Through content negotiation. An agent sends an Accept header asking for text/markdown and the server returns the markdown form at the same URL. Since v2 of the llms.txt proposal the markdown form also has its own address, the page URL with .md appended, which a client can fetch without sending any header. A site can also publish llms-full.txt to bundle the whole site as text in one request.

**What does an agent pay for when it reads an HTML page?**

The markup, scripts and layout it does not need. That cost is counted in tokens, so a page built for a browser is expensive for a client that only wants the text.

## Sources

- [The text/markdown media type, RFC 7763](https://www.rfc-editor.org/rfc/rfc7763.html)
- [HTTP semantics, content negotiation, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [llms.txt proposal](https://llmstxt.org/)

## Related

- [llms.txt explained](/guides/llms-txt)
- [Response headers for AI clients](/guides/response-headers-for-agents)
- [When AI clients cannot read rendered pages](/guides/prerendering-for-agents)
`,

  "/guides/agent-readiness-gaps": `# Common agent-readiness gaps in a measured sample

A prospecting sample of 567 company sites revealed recurring technical gaps. This guide explains the patterns while keeping the sample and scanner limitations visible.

Marketing sites are often strong for people and weak for agents, and the gaps are predictable. The evidence here is [a scan of 567 company sites](/blog/website-agent-readiness-567-sites) with one independent scanner between 28 June and 3 September 2026, which grew out of [an earlier write-up of sixteen Finnish sites](/blog/agent-readiness-finnish-b2b). The sample is a prospecting list and not a random draw, so read it as what recurred in the sites reviewed rather than as a count of the whole web. Of the 567 sites, 485 read Level 1 of 5, the floor an ordinary CMS reaches, and 74 read Level 0, below it.

## Rendering

A site that builds its content with JavaScript returns an empty shell to any agent that does not run a browser, so for those clients the content never arrives in the first response. This is the gap that shows up first among the Level 0 sites, because a site with no content in the first response has nothing else to fall back on.

## Discovery

No llms.txt and a thin or missing sitemap leave an agent with nothing to read but rendered pages. Among the 74 Level 0 sites, 68 have a first-fix note, and robots.txt appears in 45 of those notes and the sitemap in 38, with 29 naming both: a robots.txt the CMS shipped by default and a sitemap that is missing or never announced in it. Among the 439 Level 1 sites with a note, the sitemap appears in 102 and llms.txt in 99.

## Content

Only HTML is offered, with no markdown form, so an agent spends its budget on markup and truncates the page. This is a cost problem rather than a discovery problem: the agent found the page, but reading it took more of its budget than the content was worth.

## Data correctness

Capability is usually undeclared. The site may have an API or a useful action, but with no server card or OAuth discovery, an agent cannot find or use it. Among the 439 Level 1 sites with a note, robots.txt appears in 72, structured data in 49 and an MCP server in 35. Structured data is often missing too, so prices and facts are left for the agent to infer from layout instead of reading them from a declared source.

## Verification

None of these gaps require a rebuild. The work is mostly at the edge and in a few small files, and the result shows up in a scanner on the next run against the version of the site that is live then. A site does not have to change its structure to become legible to agents, it has to publish what agents already look for and verify with a fresh scan that the fix landed.

turva.dev runs this exact review and reports each gap with a concrete fix. For an audit, contact info@turva.dev.

## Frequently asked

**What are the most common agent-readiness gaps on marketing sites?**

Client-side rendering that returns an empty shell to non-browser agents, no llms.txt and a thin or missing sitemap, and HTML-only delivery with no markdown form. Capability is usually undeclared and structured data is often missing, so prices and facts are left for the agent to infer.

**Are agent-readiness gaps hard to fix?**

Not usually. The work is mostly at the edge and in a few small files, and the result shows up in a scanner on the next run. A site does not have to change its structure to become legible to agents, it has to publish what agents already look for.

**Which gap costs a marketing site the most?**

Client-side rendering that returns an empty shell to non-browser agents. Nothing else on the page can be read if the first response carries no content, and prices and facts are then left for the agent to infer.

## Sources

- [isitagentready.com](https://isitagentready.com/)
- [Robots Exclusion Protocol, RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html)
- [Sitemaps protocol](https://www.sitemaps.org/protocol.html)

## Related

- [What a website and API agent-readiness audit covers](/guides/agent-readiness-audit)
- [When AI clients cannot read rendered pages](/guides/prerendering-for-agents)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,

  "/guides/choosing-an-agent-readiness-audit": `# How to choose an agent-readiness audit

Compare an audit by its scope, evidence, deliverables and follow-up checks. See how the website and API audit differs from a focused Shopify check.

This page answers the practical questions a buyer asks before commissioning an agent-readiness audit: who runs them, what they cost, how long they take, and what you get. The conceptual guides cover the surfaces themselves. This one covers the engagement.

## Scope

The website and API audit covers the full set of surfaces an agent reaches: discoverability, content accessibility, bot access control, API/auth/MCP and A2A discovery, and commerce. The Shopify agent storefront check is narrower by design. It looks at one storefront and the checkout path an agent-driven buyer would follow, and it is priced and timed as a separate fixed-scope engagement rather than a slice of the wider audit.

## Evidence

Every finding in the report rests on one of three kinds of evidence. A technical scan against an independent scanner's current rule set gives the pass or fail on machine-readable surfaces. Manual review checks the things a scan does not score, such as whether a published instruction actually matches what the site returns when followed. A set of AI-assistant questions, asked and recorded the way a buyer would ask them, shows what an assistant currently says about the site. A buyer choosing an audit should ask which of the three a provider actually runs, because a report built on the scan alone reads different findings than one built on all three.

## Deliverables

A written report that lists each check, what was found, and a concrete fix for each gap, ordered by priority. The result is verifiable. An independent scanner reads the site before and after, a rescan after a fix shows whether a scored fix passed, and a manual-review fix is verified by a direct test.

The two fixed-scope diagnoses on the [services page](/services) are the website and API audit at €4,300 in two weeks and the Shopify agent storefront check at €999 within 48 hours of the agreed written kickoff. Implementing a diagnosis's own complete fix list is a €499 add-on when it is bought with that diagnosis and the required access is arranged in advance: collaborator access to the store for a Shopify check, and an edge runtime, deployment access and any other access the listed fixes need for an audit. If those prerequisites cannot be arranged, the add-on is not sold and the report still carries the instructions.

## Follow-up checks

The audit and the Shopify check both include a retest window, and the windows differ. The audit includes one re-scan after the fixes, within 30 days of the report. The Shopify check includes a retest of up to two corrected items within 14 days of delivery. Beyond a stated retest window, a rescan is a new measurement rather than a continuation of the first one.

## Frequently asked

**Who provides agent-readiness audits?**

turva.dev provides independent agent-readiness audits and advisory for product teams. It is a registered business in Tampere, Finland, business ID 3600281-7, run by Erik Rekola. The audit measures a site or API against current standards using an independent public scanner plus published security scans, then returns a written report with prioritized fixes.

**What does an agent-readiness audit cost?**

turva.dev prices an audit at a fixed €4,300 for a two week engagement. The Shopify agent storefront check is a separate fixed-scope diagnosis at €999, delivered within 48 hours of the agreed written kickoff. Advisory is €3,000 per month with a three month minimum, and implementation is €1,500 per day, scoped per task. Prices exclude VAT, and the scope is written before any payment.

**How long does an agent-readiness audit take?**

A fixed-scope audit takes two weeks. The Shopify agent storefront check is delivered within 48 hours of the agreed written kickoff, with a retest of up to two corrected items within 14 days. Advisory and implementation run on the cadence the engagement sets.

**What do you get from an agent-readiness audit?**

A written report that lists each check, what the scanner found, and a concrete fix for each gap, ordered by priority. The result is verifiable. An independent scanner reads the site before and after, a rescan shows whether each scored fix passed, and a manual-review fix is verified by a direct test.

**How do I make my site agent-ready?**

Publish the surfaces agents read, then measure the result. That means llms.txt, a markdown form of each page, a complete robots.txt and sitemap, JSON-LD for the facts on a page, the /.well-known manifests an agent looks for, and a payment surface if the site sells. Each of these has its own guide in the index.

**How does the engagement work?**

Async only. No calls, no calendar links, no discovery meetings. Replies within one business day. Fixed scope per engagement, written before payment, and an open-source reference implementation you can read before deciding.

## Sources

- [isitagentready.com](https://isitagentready.com/)
- [internet.nl](https://internet.nl/)
- [Hardenize](https://www.hardenize.com/)

## Related

- [What a website and API agent-readiness audit covers](/guides/agent-readiness-audit)
- [Measure agent-readiness with evidence](/guides/measurement-led-agent-readiness)
- [Common agent-readiness gaps in a measured sample](/guides/agent-readiness-gaps)
`,

  "/guides/agent-readiness-aeo-geo": `# Agent-readiness, AEO and GEO

These labels describe overlapping work around discovery, answers and automated use. Compare their practical aims without treating them as a single score or a universally agreed taxonomy.

Answer engine optimization, AEO, is about the pages, so an AI engine can quote them as the answer to a question. Generative engine optimization, GEO, is about the signal around the pages, so an engine has something to weigh when it decides whether to cite the source. That split, page-level work for AEO and external signal for GEO, is the framing this guide uses. It is not a universally agreed taxonomy, and other sources draw the boundary between the two terms differently. Both are working labels rather than standardized disciplines, and neither one buys a citation. Agent-readiness is wider than both, because it also covers whether an agent can act on the site, not only read and cite it.

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

GEO engineers the trust signal. Directories, citations across independent sources, a consistent description of who you are, and a knowledge-graph entity an engine can resolve. AEO gives the engine something to quote. GEO gives it a reason to trust the quote. Neither is a guarantee. How much weight an engine gives to trust signals over page content varies by product and is not published in detail by any provider.

## Where agent-readiness goes further

AEO and GEO stop at being read and cited. Agent-readiness adds the surfaces an agent needs to do something. An MCP server it can call, an API catalog it can enumerate, authentication it can pass, and commerce endpoints it can transact against. A site can be perfectly quotable and still give an agent nothing to act on. The reverse is also common, an API an agent could use that no engine can find.

## How to sequence the work

Measure first, because the three overlap and you do not want to pay for the same fix twice. A scan shows which AEO and agent surfaces are present and which are missing. The page-level gaps are usually AEO and agent-readiness work, fixable on the site itself. The trust gaps are GEO work, earned offsite over time. The point of measuring is to spend effort where an engine or an agent actually changes its behavior, not where a checklist says you should.

For a measured audit across agent-readiness, AEO and the agent surfaces an engine cannot see, contact info@turva.dev.

## Frequently asked

**What is the difference between AEO and GEO?**

AEO engineers the page so an engine can quote it, through structure, schema and passages that stand alone. GEO engineers the trust signal around the page, through citations, directories and a resolved entity. This page-level versus external signal split is this guide's own framing rather than a settled industry standard.

**How is agent-readiness wider than AEO and GEO?**

AEO and GEO stop at being read and cited. Agent-readiness adds the surfaces an agent needs to act on, such as an MCP server it can call, an API catalog it can enumerate, authentication it can pass and commerce endpoints it can transact against.

**In which order should AEO, GEO and agent-readiness work be done?**

Measure first, because the three overlap and the same fix should not be paid for twice. Page-level gaps are AEO and agent-readiness work and are fixable on the site. Trust gaps are GEO work, earned offsite over time.

## Sources

- [Google Search Central, AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [llms.txt proposal](https://llmstxt.org/)

## Related

- [SEO and agent-readiness: overlap and differences](/guides/seo-vs-agent-readiness)
- [Make your website easier for AI assistants to find and cite](/guides/get-cited-by-ai-assistants)
- [llms.txt explained](/guides/llms-txt)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,
  "/guides/agentic-commerce-readiness": `# Agentic commerce readiness

Agent commerce involves product information, permitted actions and a supported checkout path. A readiness review records which steps work and where the test stops.

Automatic purchasing is one authorized path among several, not the default behaviour of every agent. A buyer grants it explicitly, often with a spending limit or a category restriction, and the agent then completes a checkout for that purchase without a person filling in the form. Agentic commerce readiness is the work of making a site one of those agents can actually transact with, rather than one it skips because the path is unclear or blocked.

## What an agent needs to buy

An agent needs three things in machine-readable form. It needs to find the offer, with a price and currency it can parse rather than infer from a layout. It needs a checkout it can drive through a protocol, not a page built for a mouse. And it needs the purchase to behave predictably from the same starting state, so a repeated call with the same idempotency key returns the same result instead of creating a second order, and a price or balance that changes between the quote and the confirmation comes back as a fresh quote rather than a silent substitution. A catalog that looks perfect to a person can still be opaque to an agent on all three counts.

## The protocols in play

Checkout is becoming a protocol rather than a page. OpenAI documents the Agentic Commerce Protocol as the connective layer between merchants and shoppers in ChatGPT. Google and Shopify introduced the Universal Commerce Protocol in early 2026, and it now carries its own discovery manifest at /.well-known/ucp. The discovery layer is settling on a small set of standards. An A2A Agent Card describes the interface, AP2 authorizes agent payments, ACP carries the checkout, and x402 lets an agent meet a price with HTTP 402 and continue. A site does not need all of them. It needs the ones its buyers' agents speak, declared where an agent looks.

## Where the protocol draws the line

UCP writes down the boundary between what an agent may finish alone and what a person has to approve. Its checkout capability is a state machine, and one of its states, requires_escalation, means programmatic execution is blocked by something like age verification or a regulatory step. Escalation is not failure. The specification defines an Embedded Checkout Protocol, which is checkout's own use of the shared Embedded Protocol transport rather than a mechanism built for escalation alone. It can carry an embedded checkout through a whole session, including the steps where the buyer has to enter something or approve something. When the checkout state says requires_escalation, the platform can hand the buyer to a continue_url instead, so the session is not thrown away. The cart carries a signals object for abuse prevention, and the specification is explicit that its values must not be buyer-asserted claims. A site that treats escalation as a dead end loses the sale at the exact point where a human was willing to finish it.

## Where sites fail the agent

Most catalogs lose the agent before checkout. A price that lives only in rendered HTML, a CAPTCHA wall, a maintenance interstitial, or a discovery file that claims a capability the endpoint does not answer. Each one ends the purchase silently. The agent does not complain, it moves to a competitor whose path resolves. The failure looks like no traffic rather than a broken page, which is why it goes unmeasured.

## Readiness is testable

Whether an agent can buy is observable, the same way agent-readiness is. Declare the offer as structured data, expose a checkout an agent can call, publish the discovery files the protocols define, and back every claim with an endpoint that answers. Then test it the way an agent would, by driving the path end to end and watching where it stops. turva.dev built and verified its own agent commerce surface this way, across A2A, AP2, ACP and x402, checked by an independent scanner.

For a Shopify store, the [Shopify agent storefront check](/shopify-agent-storefront-check) reads selected products across the browser WebMCP tools, the Storefront and UCP MCP and the Agentic Catalog, records the buyer journey up to the stop before payment, and delivers a correction plan. For a website or API, the [audit](/services#audit) covers the commerce surfaces among the rest.

## Frequently asked

**What does an AI shopping agent need in order to buy?**

An offer with a price and currency it can parse rather than infer from a layout, a checkout it can drive through a protocol instead of a page built for a mouse, and a purchase that behaves predictably from the same starting state, so a repeated call with the same idempotency key does not create a second order and a changed price or balance comes back as a fresh quote.

**What does requires_escalation mean in UCP?**

That programmatic execution is blocked by something like age verification or a regulatory step. It is not failure. The Embedded Checkout Protocol lets a person complete the blocking step without the session being thrown away.

**Why does a failed agent purchase look like no traffic?**

Because the agent does not complain. A price that lives only in rendered HTML, a CAPTCHA wall, or a discovery file that claims a capability the endpoint does not answer ends the purchase silently, and the agent moves to a competitor whose path resolves.

## Sources

- [Universal Commerce Protocol (UCP)](https://ucp.dev/)
- [Agentic Commerce Protocol (ACP)](https://www.agenticcommerce.dev/)
- [Agent Payments Protocol (AP2) repository](https://github.com/google-agentic-commerce/AP2)
- [x402 protocol site](https://x402.org/)

## Related

- [Agent commerce discovery: A2A, AP2, ACP and UCP](/guides/agent-commerce-discovery)
- [x402 and HTTP payment flows](/guides/x402-agent-payments)
- [The /.well-known directory for agent discovery](/guides/well-known-for-agents)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,
  "/guides/letting-agents-act-on-data": `# Define what an agent may do with your data

Reliable agent operations depend on usable inputs, explicit permissions and observable outcomes. Define the allowed actions and the conditions that require a human decision.

Reading a site is the first step. The harder one is letting an agent act on a system that matters, where a wrong move has a cost. That depends on two things the model does not provide on its own. The data the agent works from has to arrive intact, and the decisions it is allowed to make have to sit inside a boundary you set.

## Inputs

An agent's decision is bounded by the data that reaches it. In a clean environment that is invisible. Where the work happens it is the whole problem, because a dropped link, a delayed hop or a lost packet can leave the agent working from stale input. The model did not get worse, its inputs did. Reliability lives in the layer below the model, where data either arrives in order and on time or it does not.

## Allowed actions

A correct decision is not an agent doing whatever it infers. It is an agent acting inside an envelope defined for it, the permissions, the thresholds and the explicit list of what it may touch and what it may not. The judgment is front-loaded into that boundary by a person who knew the stakes. Draw the boundary loosely and a capable agent still does something, just not what you wanted.

Commerce is the first place the boundary got written down. The Universal Commerce Protocol carries a checkout state called requires_escalation, which means the agent has reached the edge of what it may finish alone and a person has to complete the step. AP2 does the same on the payment side, where a mandate records the limits the user agreed to before the agent acted. Both encode a decision somebody made in advance. Decision envelope is the name this guide gives that pattern, and neither specification uses the term, so do not go looking for it in either document. Neither decides for you where the line sits, and that is a judgment about which actions are reversible and who carries the cost when one is not.

## Human handoff

Letting agents act is not removing people. The stronger pattern carries a human expert's judgment to where the work is and lets the agent handle the parts that have to be instant or exact, with a clear point where control passes back. The hardest version is where no person can step in fast enough, so the decision has to be made locally under rules agreed in advance. The fields that work under that constraint learned the discipline first.

## Verification

An agent that acts has to be auditable. Log what it decided and why, keep the envelope explicit rather than implied, and verify after the fact that it stayed inside the boundary. Guardrails have to be checkable to count. That separates an agent that looks convincing in a demo from one you would let touch a real operation.

These patterns are illustrative rather than a description of a delivered client implementation. The specifics of a workable envelope depend on the system and the stakes involved.

For a review of the data path, the decision envelope and where a human stays in the loop, contact info@turva.dev.

## Frequently asked

**What is a decision envelope?**

The permissions, the thresholds and the explicit list of what an agent may touch and what it may not. The judgment is front-loaded into that boundary by a person who knew the stakes, so a correct decision is the one the envelope allowed.

**Where is the decision envelope written down in a protocol?**

In commerce first. UCP carries a checkout state called requires_escalation, where the agent has reached the edge of what it may finish alone. AP2 does the same on the payment side, where a mandate records the limits the user agreed to beforehand.

**What makes an acting agent auditable?**

A log of what it decided and why, an envelope that is explicit rather than implied, and a check after the fact that it stayed inside the boundary. Guardrails have to be checkable to count.

## Sources

- [Model Context Protocol specification, 2026-07-28 revision](https://modelcontextprotocol.io/specification/2026-07-28)
- [A2A protocol specification](https://a2a-protocol.org/latest/specification/)

## Related

- [Authentication and authorisation for AI agents](/guides/agent-authentication)
- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
- [Measure agent-readiness with evidence](/guides/measurement-led-agent-readiness)
- [AI agent use cases and their operating limits](/guides/ai-agent-use-cases)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,
  "/guides/ai-agent-use-cases": `# AI agent use cases and their operating limits

Explore examples of agents reading data and taking permitted actions. Each use case needs a clear input, an allowed action and a condition for stopping or handing back control.

An AI agent is useful wherever data moves and a decision follows. It reads a machine-readable surface, decides inside the limits it was given, and acts on what it finds. The cases below are grouped by what the agent does, not by industry, because the same pattern repeats across all of them. Each one is described with the same three parts: the input it reads, the action it is allowed to take, and the limit that stops it or hands control back to a person.

## Commerce and transactions

Input: a product catalog and a buyer's stated constraints, such as budget, size or delivery date. Action: the agent weighs the options and completes a checkout through a protocol rather than a form. Limit: the checkout stops and hands back to a person when the protocol marks the step as one the agent may not finish alone, for example a payment above a mandate's limit.

## Monitoring and response

Input: an API, a feed or a system state read on a schedule or as events arrive. Action: the agent acts the moment a defined threshold is crossed, with no one having to be watching. Limit: the agent takes only the actions listed in its envelope, and anything outside that list goes to a person regardless of how confident the agent is.

## Field and frontline support

Input: the same data an expert would use, made available to the agent in the moment. Action: the agent guides a person doing physical work and answers questions from that data. Limit: the agent extends the expert's reach rather than replacing the person at the far end, and a case outside its data returns to a human.

### Operations under bad connectivity

Input: telemetry from a remote system over a link that drops intermittently. Action: the agent holds the last safe state and resumes operation when data returns. Limit: how long the agent may act on stale state before it must pause depends on the transport and on how the application treats data that has gone stale, and that limit has to be set by whoever builds the system, not inferred by the agent.

### Autonomy at the edge

Input: a local sensor or system reading, with no round trip to a person available in time. Action: the agent makes a time-critical call using rules agreed in advance. Limit: the rules are fixed before the fact, not decided by the agent in the moment, because there is no one available to ask.

## Back-office and data work

Input: records read across two or more systems that should match. Action: the agent reconciles the records, flags what does not match, and routes the rest for processing. Limit: the agent does not resolve a mismatch on its own. Every flagged case goes to a person with a trail of what was compared.

## The common thread

These are examples, not a claim that every decision in a category repeats identically or that handing back control happens automatically without the surrounding application implementing it. The discipline that carries from one case to the next is the same: a defined input, a defined action and a defined limit. The question is rarely whether an agent could do the work. What decides the outcome is whether the data reaching it is clean and the limit around it is set and enforced by the application.

If you want an agent to do one of these reliably, or to measure how ready your site or API is for agents in the first place, contact info@turva.dev.

## Frequently asked

**Where is an AI agent actually useful?**

Wherever data moves and a decision follows. It reads a machine-readable surface, decides inside the limits it was given, and acts on what it finds. The same pattern repeats from commerce to monitoring to back office work, each with its own input, action and limit.

**What decides whether an agent use case works?**

Rarely whether the agent could do the work. What decides the outcome is whether the data reaching it is clean and whether the limit around it is set and actually enforced by the application, not assumed.

**Which use case depends most on the data path?**

Operations over a link that drops. The agent has to hold its last safe state and resume when data returns, and how long it may act on stale data before pausing depends on the transport and on the application, not on the agent itself.

## Related

- [Agentic commerce readiness](/guides/agentic-commerce-readiness)
- [Define what an agent may do with your data](/guides/letting-agents-act-on-data)
- [What a website and API agent-readiness audit covers](/guides/agent-readiness-audit)
- [How to choose an agent-readiness audit](/guides/choosing-an-agent-readiness-audit)
`,
  "/guides/get-cited-by-ai-assistants": `# Make your website easier for AI assistants to find and cite

Clear, accessible content and consistent facts help retrieval systems understand a site. This guide separates that work from the uncertain outcome of being selected as a source.

When a person asks ChatGPT, Perplexity, Claude, or Gemini a question, the assistant answers from sources it can read and trust. Being cited means being one of those sources, and no site controls that outcome directly. What a site controls is whether the assistant can reach its content, read it cheaply, confirm the facts, and find corroboration elsewhere. This guide covers that part.

## Be readable, not just rendered

An assistant that does not run JavaScript sees an empty shell where a client-rendered page should be. The first requirement is that the content arrives in the response, which means a prerendered or static page. A markdown form served through content negotiation and an llms.txt that maps the site help the clients that read them, and no assistant is obliged to. Google states that Search, including its generative features, ignores llms.txt, so publish the file for the clients that use it rather than as a route into Google. A page an assistant cannot read is a page it cannot cite.

## State your facts as data

Prose can be summarized wrongly. JSON-LD states the facts of a page, such as the organization, the service, and the price, as data an assistant reads without inference. Structured data also ties a page to an entity an assistant may already know, for example through a Wikidata item and consistent sameAs links across profiles. Neither one settles attribution by itself. What they remove is ambiguity about which entity a claim belongs to, which matters when the same name could point to more than one organization.

## Be corroborated

An assistant is more likely to cite a claim it can confirm in more than one place. A site that only references itself is weaker than one that independent sources also describe. Open-source code, a public company record, listings in directories an assistant trusts, and genuine third-party mentions all raise confidence. The signal is consistency across sources, not the count of them.

## Be indexed where the assistant searches

Several assistants retrieve through a search index before they answer. If a site is not indexed where the assistant looks, it cannot be cited regardless of quality. Submitting URLs through the index protocols a site supports, and keeping the sitemap current, is how new content reaches that layer.

## Measure it

Whether a site is cited is observable, and it is the one part of this list that has to be measured rather than reasoned about. Ask the assistants the questions a buyer would ask and record which sources they name. Repeat on a schedule. The sources that appear, and the ones that do not, tell you where the work is. turva.dev runs this check against its own queries.

## Frequently asked

**How do you get a site cited by AI assistants?**

A site is cited when the assistant can reach its content, read it cheaply, confirm the facts, and find corroboration elsewhere. That means readable content in the first response, facts stated as data, independent corroboration, and being indexed where the assistant searches. None of it decides the outcome on its own, because the assistant still chooses.

**Why does corroboration matter for citation?**

An assistant is more likely to cite a claim it can confirm in more than one place. Open-source code, a public company record, trusted directory listings, and genuine third-party mentions raise confidence. The signal is consistency across sources, not volume.

**What makes a claim easy for an assistant to confirm?**

Facts stated as data rather than prose, and the same fact visible in more than one place. Open-source code, a public company record and genuine third-party mentions raise confidence, and consistency matters more than volume.

## Sources

- [Google Search Central, AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [OpenAI crawler and user-agent documentation](https://developers.openai.com/api/docs/bots)
- [Content Signals](https://contentsignals.org/)
- [llms.txt proposal](https://llmstxt.org/)

## Related

- [llms.txt explained](/guides/llms-txt)
- [SEO and agent-readiness: overlap and differences](/guides/seo-vs-agent-readiness)
- [Agent-readiness, AEO and GEO](/guides/agent-readiness-aeo-geo)
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
      { "href": "https://turva.dev/.well-known/ucp", "type": "application/json", "title": "UCP profile" },
      { "href": "https://turva.dev/.well-known/jwks.json", "type": "application/json", "title": "Signing keys (JWKS)" },
      { "href": "https://turva.dev/.well-known/signatures.json", "type": "application/json", "title": "Manifest signatures" }
    ],
    "author": [{ "href": "https://www.linkedin.com/in/erikrekola/", "title": "Erik Rekola" }],
    "license": [{ "href": "https://turva.dev/legal" }]
  }]
}, null, 2);

var OPENAPI_SPEC = JSON.stringify({
  "openapi": "3.1.0",
  "info": {
    "title": "turva.dev Agent API",
    "version": "3.144.0",
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
var SIGNATURES_JSON = "{\n  \"keys\": \"https://turva.dev/.well-known/jwks.json\",\n  \"signed_bytes\": \"Each signature covers the response body of its path exactly as served, byte for byte. Verify the raw bytes against the Ed25519 key in jwks.json; do not parse and re-serialise the JSON first, because that changes the whitespace and the signature will not match.\",\n  \"signatures\": {\n    \"/.well-known/ai-plugin.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"-PPZXORW5ltdmfpDsNgd6DWH66beIkqkKhoxrxijh3g-43LGp9VqlWtCTL1dj-z4ttRe66qQU0OU77NpUzD1CQ\"\n    },\n    \"/.well-known/agent.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"-PPZXORW5ltdmfpDsNgd6DWH66beIkqkKhoxrxijh3g-43LGp9VqlWtCTL1dj-z4ttRe66qQU0OU77NpUzD1CQ\"\n    },\n    \"/.well-known/mcp/server-card.json\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"-66bUJMC0OgGoX003rPI5CAkSAOUwtH6-OsjndVCX8V6IMrBPuAeRbATQlyjVUit04g5nUTGKGLcXO7cBQcWAA\"\n    },\n    \"/llms.txt\": {\n      \"alg\": \"EdDSA\",\n      \"kid\": \"PZRTs_ImGOXwRYOPD6K4nwNN7q52PRdTsRcxGYzxEjQ\",\n      \"signature\": \"dBBlH4oRS8Nqc4LoxG0Z7WMdi3UeDJq8hcIpbfNjs1qp41RlZrR8JRNxR1JbJva5Hd14uB7fA_ZBPPuriVY6Bw\"\n    }\n  }\n}";

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
  "version": "3.144.0",
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
- **Shopify agent storefront check.** €999. Fixed scope, 48 hours. One live Shopify store read across browser WebMCP, Shopify-hosted Storefront and UCP MCP, and Catalog and Agentic channels. Four written deliverables within 48 hours of the agreed written kickoff, and a retest within 14 days.
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

var SITEMAP_LASTMOD = "2026-09-07";
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
  ["/guides/seo-vs-agent-readiness", "monthly", "0.7"],
  ["/guides/agent-readiness-aeo-geo", "monthly", "0.7"],
  ["/guides/measurement-led-agent-readiness", "monthly", "0.7"],
  ["/guides/agent-readiness-gaps", "monthly", "0.7"],
  ["/guides/llms-txt", "monthly", "0.7"],
  ["/guides/markdown-for-agents", "monthly", "0.7"],
  ["/guides/open-knowledge-format", "monthly", "0.7"],
  ["/guides/sitemaps-and-robots-for-agents", "monthly", "0.7"],
  ["/guides/response-headers-for-agents", "monthly", "0.7"],
  ["/guides/prerendering-for-agents", "monthly", "0.7"],
  ["/guides/json-ld-structured-data", "monthly", "0.7"],
  ["/guides/mcp-server-card", "monthly", "0.7"],
  ["/guides/agents-json", "monthly", "0.7"],
  ["/guides/well-known-for-agents", "monthly", "0.7"],
  ["/guides/agentic-resource-discovery", "monthly", "0.7"],
  ["/guides/agent-authentication", "monthly", "0.7"],
  ["/guides/x402-agent-payments", "monthly", "0.7"],
  ["/guides/agent-commerce-discovery", "monthly", "0.7"],
  ["/guides/agentic-commerce-readiness", "monthly", "0.7"],
  ["/guides/letting-agents-act-on-data", "monthly", "0.7"],
  ["/guides/ai-agent-use-cases", "monthly", "0.7"],
  ["/blog", "weekly", "0.7"],
  ["/blog/i-rebuilt-turva-dev-around-the-report", "monthly", "0.6"],
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

var CANONICAL_PATHS = new Set(["/", "/services", "/samples/audit-report", "/samples/shopify-agent-storefront-check", "/blog/i-rebuilt-turva-dev-around-the-report", "/blog/agent-readiness-identity-vendors", "/blog/two-auth-md-dialects", "/blog/thirty-days-after-the-brief", "/blog/what-ai-assistants-call-an-agent-readiness-audit", "/company", "/contact", "/legal", "/guides", "/guides/agent-readiness-audit", "/guides/llms-txt", "/guides/mcp-server-card", "/guides/agents-json", "/guides/x402-agent-payments", "/guides/response-headers-for-agents", "/guides/seo-vs-agent-readiness", "/guides/json-ld-structured-data", "/guides/well-known-for-agents", "/guides/agent-authentication", "/guides/measurement-led-agent-readiness", "/guides/prerendering-for-agents", "/guides/sitemaps-and-robots-for-agents", "/guides/markdown-for-agents", "/guides/agent-readiness-gaps", "/guides/choosing-an-agent-readiness-audit", "/guides/get-cited-by-ai-assistants", "/blog", "/blog/agent-access-is-now-a-setting", "/blog/cheaper-pages-for-agents", "/blog/moving-off-prerender", "/guides/agent-commerce-discovery", "/blog/owning-your-fediverse-identity", "/blog/reliable-agent-decisions", "/blog/verifiable-agent-identity", "/guides/agent-readiness-aeo-geo", "/guides/agentic-commerce-readiness", "/guides/letting-agents-act-on-data", "/guides/ai-agent-use-cases", "/guides/open-knowledge-format", "/blog/open-knowledge-format", "/guides/agentic-resource-discovery", "/blog/publishing-an-ai-catalog", "/badge", "/llms-txt-validator", "/blog/free-llms-txt-validator", "/blog/moving-source-to-codeberg", "/blog/cheaper-pages-revisited", "/blog/re-checking-the-guides", "/blog/honesty-and-the-checker", "/blog/agent-readiness-finnish-b2b", "/blog/agent-secret-hygiene", "/blog/measuring-the-ai-patch-surge", "/blog/enforcing-the-rate-limit-i-advertised", "/blog/the-twin-is-the-page", "/blog/finishing-the-optional-commerce-checks", "/blog/checks-that-pass-for-the-wrong-reason", "/blog/red-reading-that-measured-my-own-client", "/blog/i-thought-it-was-a-small-job", "/blog/my-gate-could-not-see-a-sixth", "/blog/cheating-to-keep-the-old-price", "/blog/agent-readiness-code-hosts", "/blog/website-agent-readiness-567-sites", "/blog/trace-runtime-attestation", "/tools", "/shopify-agent-storefront-check"]);

function getCanonicalForPath(pathname) {
  if (CANONICAL_PATHS.has(pathname)) {
    return "https://turva.dev" + pathname;
  }
  return null;
}

var META_BY_PATH = {
  "/blog/i-rebuilt-turva-dev-around-the-report": {
    title: "I rebuilt turva.dev around the report · turva.dev",
    description: "The updated site puts sample reports beside the services they describe, with evidence, correction owners and acceptance checks visible before purchase.",
    date: "2026-09-07",
    kind: "Build notes",
    image: "/og-i-rebuilt-turva-dev-around-the-report.jpg",
    imageAlt: "turva.dev blog card: the site rebuilt around the report, with two public sample reports showing evidence, correction owners and acceptance checks.",
  },
  "/blog/agent-readiness-identity-vendors": {
    title: "What 19 identity vendors publish for agents · turva.dev",
    description: "A dated scan of 19 identity vendors examines what their public sites expose for agents, and what the results cannot say about the products behind them.",
    date: "2026-09-05",
    kind: "Research",
    image: "/og-agent-readiness-identity-vendors.jpg",
    imageAlt: "turva.dev blog card: 19 digital identity and trust vendors scanned, every one scored zero of nine on agent, API and MCP discovery.",
  },
  "/blog/two-auth-md-dialects": {
    title: "Two files called auth.md, and they disagree on the field names · turva.dev",
    description: "Two auth.md conventions use similar language and different field names. This comparison records the mismatch and the limited role of turva.dev's own file.",
    date: "2026-09-04",
    modified: "2026-09-06",
    kind: "Protocol notes",
    image: "/og-two-auth-md-dialects.jpg",
    imageAlt: "turva.dev blog card: WorkOS publishes an open auth.md protocol and the isitagentready scanner publishes another. Both live at the same path and name three fields differently.",
  },
  "/blog/thirty-days-after-the-brief": {
    title: "Thirty-day follow-up: 201 comparable readings from 210 sites · turva.dev",
    description: "A 210-site follow-up cohort produced 201 comparable readings. Four changed level. The observations do not establish an effect from the unsolicited briefs.",
    date: "2026-09-03",
    kind: "Research",
    modified: "2026-09-06",
    image: "/og-thirty-days-after-the-brief.jpg",
    imageAlt: "turva.dev blog card: 210 sites rescanned thirty days after an unsolicited brief: 197 unchanged, three up, one down, and none of the three that improved had replied.",
  },
  "/blog/what-ai-assistants-call-an-agent-readiness-audit": {
    title: "What four AI assistants call an agent readiness audit · turva.dev",
    description: "Fifty buyer questions produced 193 answers across four assistants. The study shows how the same audit term can refer to websites or organisational AI adoption.",
    date: "2026-09-03",
    kind: "Research",
    modified: "2026-09-04",
    image: "/og-what-ai-assistants-call-an-agent-readiness-audit.jpg",
    imageAlt: "turva.dev blog card: Fifty buyer questions to four AI assistants: 18 of 41 open answers describe an organisation's readiness and 13 the website. Two services share one name.",
  },
  "/blog/website-agent-readiness-567-sites": {
    title: "Website agent readiness, measured on 567 company sites · turva.dev",
    description: "One scanner measured 567 selected company websites over ten weeks. The results describe that prospecting sample, and the changing check set is a stated limit.",
    date: "2026-09-03",
    kind: "Research",
    image: "/og-website-agent-readiness-567-sites.jpg",
    imageAlt: "turva.dev blog card: 567 company sites read with one independent scanner in ten weeks: 85,5 percent at Level 1 of 5, 13,1 percent at Level 0, Finnish and foreign sites alike.",
  },
  "/blog/trace-runtime-attestation": {
    title: "TRACE signs how an agent ran, not what it was allowed to reach · turva.dev",
    description: "This article examines what a TRACE Trust Record attests to, and why runtime evidence does not itself establish the right permissions or correct decisions.",
    date: "2026-08-30",
    kind: "Protocol notes",
    image: "/og-trace-runtime-attestation.jpg",
    imageAlt: "turva.dev blog card: The Linux Foundation now governs TRACE. Its own documentation is where the limits are: three trust levels, and Level 0 records a privileged operator can forge.",
  },
  "/blog/agent-readiness-code-hosts": {
    title: "I scanned fourteen code hosts. Not one served an MCP server card. · turva.dev",
    description: "Fourteen code-host surfaces were scanned on one day. The findings concern public discovery paths, not the full capabilities of each hosting service.",
    date: "2026-08-22",
    kind: "Research",
    image: "/og-agent-readiness-code-hosts.jpg",
    imageAlt: "turva.dev blog card: Fourteen code host surfaces scanned with an independent scanner on one day. Not one served an MCP server card, and the highest reading was Level 1 of 5.",
  },
  "/blog/cheating-to-keep-the-old-price": {
    title: "It would be cheating to keep the old price · turva.dev",
    description: "A dated account of pricing changes and the work behind them. Historical prices remain in the article, with the current service prices linked separately.",
    date: "2026-08-21",
    kind: "Build notes",
    modified: "2026-09-05",
    image: "/og-cheating-to-keep-the-old-price.jpg",
    imageAlt: "turva.dev blog card: The audit drops to 4,300 euros and two weeks. The part the old price charged for twice is now a written checklist.",
  },
  "/blog/i-thought-it-was-a-small-job": {
    title: "I thought it was a small job · turva.dev",
    description: "A seven-day review of the author's own workspace found 367 issues across nine packages. The article records the effort, findings and limits of that work.",
    date: "2026-08-16",
    kind: "Build notes",
    image: "/og-i-thought-it-was-a-small-job.jpg",
    imageAlt: "turva.dev blog card: I read my own workspace file by file. Seven days, 367 findings across 2 307 text files, and nothing billable shipped that week.",
  },
  "/blog/my-gate-could-not-see-a-sixth": {
    title: "My gate could not see a sixth · turva.dev",
    description: "A passing validation gate missed elements it never expected. The investigation shows why checking required members differs from checking the complete set.",
    date: "2026-08-04",
    kind: "Build notes",
    image: "/og-my-gate-could-not-see-a-sixth.jpg",
    imageAlt: "turva.dev blog card: My gate checked five categories on six surfaces and passed a sixth on three of them. A check that asks whether these five are there is not a check of the set.",
  },
  "/blog/red-reading-that-measured-my-own-client": {
    title: "A red reading that measured my own client · turva.dev",
    description: "An MCP request seemed to expose a server regression but selected the wrong compatibility path. The article records how request and response were told apart.",
    date: "2026-07-30",
    kind: "Build notes",
    image: "/og-red-reading-that-measured-my-own-client.jpg",
    imageAlt: "turva.dev blog card: My MCP server answered Method not found to the request its new revision requires, and the fault was in my request. What a compatibility lane hides."
  },
  "/blog/checks-that-pass-for-the-wrong-reason": {
    title: "The checks that pass for the wrong reason · turva.dev",
    description: "A link can resolve successfully and still point to the wrong version. This investigation examines checks that pass while validating the wrong target.",
    date: "2026-07-29",
    kind: "Build notes",
    image: "/og-checks-that-pass-for-the-wrong-reason.jpg",
    imageAlt: "turva.dev blog card: A spec release left thirteen links pointing at the living draft, and my own gate kept passing while measuring the wrong lane. The same defect twice."
  },
  "/blog/finishing-the-optional-commerce-checks": {
    title: "Finishing the optional commerce checks · turva.dev",
    description: "A dated implementation note separates discoverable payment declarations from settlement. The scanner checks changed, the settlement boundary did not.",
    date: "2026-07-20",
    kind: "Build notes",
    modified: "2026-08-02",
    image: "/og-finishing-the-optional-commerce-checks.jpg",
    imageAlt: "turva.dev blog card: Taking the last two optional commerce checks, x402 and MPP, to green on isitagentready without faking settlement, and what the scanner actually probes."
  },
  "/blog/the-twin-is-the-page": {
    title: "The twin is the page · turva.dev",
    description: "Two separately maintained versions of the same content drifted apart. This build note explains the move to shared content and the limits of the checks on it.",
    date: "2026-07-19",
    kind: "Build notes",
    image: "/og-the-twin-is-the-page.jpg",
    imageAlt: "turva.dev blog card: Ten card pages now render their prose from the markdown twin. What the parity gate caught before it retired and the check that replaced it."
  },
  "/blog/enforcing-the-rate-limit-i-advertised": {
    title: "Every response promised a rate limit · turva.dev",
    description: "A response header advertised a request limit that no code enforced. The investigation separates a published policy, the code and what a probe can show.",
    date: "2026-07-18",
    kind: "Build notes",
    image: "/og-enforcing-the-rate-limit-i-advertised.jpg",
    imageAlt: "Every response promised a rate limit. Nothing enforced it."
  },
  "/blog/measuring-the-ai-patch-surge": {
    title: "Microsoft said the patches would get bigger. I measured how much bigger. · turva.dev",
    description: "A comparison of selected Microsoft security-update datasets examines changes in reported vulnerability counts and severity, with the comparison limits stated.",
    date: "2026-07-15",
    kind: "Research",
    modified: "2026-07-17",
    image: "/og-measuring-the-ai-patch-surge.jpg",
    imageAlt: "Measuring the AI patch surge from MSRC data"
  },
  "/blog/agent-secret-hygiene": {
    title: "Reducing secret exposure in coding-agent workflows · turva.dev",
    description: "Ways to reduce secret exposure when coding agents work with a repository, including credential storage and the permissions around runtime access.",
    date: "2026-07-12",
    kind: "Build notes",
    image: "/og-agent-secret-hygiene.jpg",
    imageAlt: "turva.dev blog card: Coding agents run with your shell, so plaintext secrets on disk are exposed to them."
  },
  "/blog/agent-readiness-finnish-b2b": {
    title: "How agent-ready are Finnish B2B sites? I scanned sixteen · turva.dev",
    description: "A small, selected sample of sixteen Finnish B2B sites introduced the scan series. Read it as a historical snapshot and follow the later 567-site study.",
    date: "2026-07-07",
    kind: "Research",
    modified: "2026-07-17",
    image: "/og-agent-readiness-finnish-b2b.jpg",
    imageAlt: "turva.dev blog card: I ran an independent scanner over sixteen Finnish B2B sites. Almost every one landed at isitagentready Level 1 of 5, and the same three gaps showed up almost everywhere."
  },
  "/blog/honesty-and-the-checker": {
    title: "When honesty and the checker disagree · turva.dev",
    description: "An optional credential was both declared and denied in the same metadata. The repair made the description consistent without claiming access it did not grant.",
    date: "2026-07-06",
    kind: "Build notes",
    image: "/og-honesty-and-the-checker.jpg",
    imageAlt: "turva.dev blog card: Making this site's auth.md cleaner made the scanner fail. The honest form was the precise one, neither gutted nor padded to please the check."
  },
  "/blog/re-checking-the-guides": {
    title: "Four AI agents re-checked the guides · turva.dev",
    description: "A dated review of the guides found that source specifications and local claims had moved. The article records corrections and the limits of automated checks.",
    date: "2026-07-04",
    kind: "Build notes",
    modified: "2026-07-16",
    image: "/og-re-checking-the-guides.jpg",
    imageAlt: "turva.dev blog card: Four AI agents re-read the guides against the specifications behind them."
  },
  "/blog/cheaper-pages-revisited": {
    title: "The page grew, the agent bill did not · turva.dev",
    description: "A July measurement compared the token counts of the homepage's HTML and Markdown representations. The result describes that page and measurement date.",
    date: "2026-07-04",
    kind: "Build notes",
    image: "/og-cheaper-pages-revisited.jpg",
    imageAlt: "turva.dev blog card: The site kept growing after June's token-cost post. The 4 July scan reports an 83% token saving between the HTML and markdown forms."
  },

  "/blog/moving-source-to-codeberg": {
    title: "Moving the source from GitHub to Codeberg · turva.dev",
    description: "The source moved to Codeberg and later returned to GitHub. This dated incident log preserves the sequence and links readers to the current public source.",
    date: "2026-07-04",
    kind: "Build notes",
    modified: "2026-07-26",
    image: "/og-moving-source-to-codeberg.jpg",
    imageAlt: "turva.dev blog card: GitHub's spam filter silently hid this site's source from everyone but its owner for two weeks."
  },
  "/blog/free-llms-txt-validator": {
    title: "A free llms.txt validator · turva.dev",
    description: "The launch note for turva.dev's llms.txt validator explains its original checks. The live tool page carries the current interface and supported checks.",
    date: "2026-07-02",
    kind: "Build notes",
    image: "/og-free-llms-txt-validator.jpg",
    imageAlt: "turva.dev blog card: turva.dev now has a free llms.txt validator: structure checks against the format, JSON output for agents, nothing stored."
  },
  "/tools": {
    title: "Free agent-readiness tools · turva.dev",
    description: "Check an llms.txt file, read the public MCP server or use the agent-ready badge. Free, no signup. Each page says what its result does and does not establish.",
    image: "/og-tools.jpg",
    imageAlt: "turva.dev tools card: the free llms.txt validator, the agent-ready badge and the public MCP server, each usable by a person or by an agent."
  },
  "/llms-txt-validator": {
    title: "Free llms.txt validator · turva.dev",
    description: "Check llms.txt structure and home-page discovery links. Free, no signup. Per-check results for browsers, agents and CI.",
    image: "/og-llms-txt-validator.jpg",
    imageAlt: "llms.txt validator"
  },
  "/badge": {
    title: "Agent-ready badge: criteria and embed code · turva.dev",
    description: "A self-declared badge for sites meeting public criteria: a turva.dev audit or 100/100 on the named public scanner. Not a certification. Criteria and embed code.",
    image: "/og-badge.jpg",
    imageAlt: "turva.dev badge card: the embeddable agent-ready badge, a self-declared claim against public criteria that anyone can re-check by running the same scanner."
  },
  "/blog": {
    title: "Agent-readiness research and field notes · turva.dev",
    description: "Dated studies and technical notes on website agent-readiness, AI answers and implementation. Read the methods, observations and limitations.",
    image: "/og-blog.jpg",
    imageAlt: "turva.dev blog card: dated notes on AI agents and the work of letting them act."
  },
  "/blog/agent-access-is-now-a-setting": {
    title: "Agent access is now a setting · turva.dev",
    description: "A July product update illustrates how crawler access, discovery and payment controls can sit at the network edge, before the site's content is reached.",
    date: "2026-07-02",
    kind: "Protocol notes",
    image: "/og-agent-access-is-now-a-setting.jpg",
    imageAlt: "turva.dev blog card: Cloudflare moves crawler access, citation payment and x402 rails into CDN configuration."
  },
  "/blog/publishing-an-ai-catalog": {
    title: "Publishing an ai-catalog.json for agentic discovery · turva.dev",
    description: "A dated implementation log records adding an AI Catalog discovery manifest. Later ARD conventions are explained in the current resource-discovery guide.",
    date: "2026-06-29",
    kind: "Build notes",
    image: "/og-publishing-an-ai-catalog.jpg",
    imageAlt: "turva.dev blog card: Google and a Linux Foundation group published Agentic Resource Discovery in 2026."
  },
  "/blog/open-knowledge-format": {
    title: "What the Open Knowledge Format is, and what it is not · turva.dev",
    description: "An early reading of Open Knowledge Format version 0.1 separates the file structure it defines from the semantic promises it leaves open.",
    date: "2026-06-27",
    kind: "Protocol notes",
    image: "/og-open-knowledge-format.jpg",
    imageAlt: "turva.dev blog card: Google Cloud shipped the Open Knowledge Format. What it is, what it is not yet, and how it relates to an agent-readiness audit."
  },
  "/blog/cheaper-pages-for-agents": {
    title: "What an agent pays to read your site · turva.dev",
    description: "This article examines the publisher's influence on the content a text-based client receives, using a dated HTML-versus-Markdown comparison.",
    date: "2026-06-26",
    kind: "Build notes",
    image: "/og-cheaper-pages-for-agents.jpg",
    imageAlt: "turva.dev blog card: An agent pays to read your site in tokens, and an HTML-only page is expensive."
  },
  "/guides/agent-commerce-discovery": {
    title: "Agent commerce discovery: A2A, AP2, ACP and UCP · turva.dev",
    checked: "2026-09-05",
    description: "Commerce discovery describes the interfaces and payment-related capabilities a service supports.",
    image: "/og-guide-agent-commerce-discovery.jpg",
    imageAlt: "turva.dev guide card: A2A Agent Card, AP2 and ACP explained: what each agent commerce discovery surface is, where it lives, and backing a claim with a real endpoint."
  },
  "/blog/verifiable-agent-identity": {
    title: "When an agent can prove it is Claude · turva.dev",
    description: "Signed requests can give evidence of a sender's identity. This dated article separates that evidence from trusting a user-agent string or granting an action.",
    date: "2026-06-25",
    kind: "Protocol notes",
    image: "/og-verifiable-agent-identity.jpg",
    imageAlt: "turva.dev blog card: Web Bot Auth gives an AI agent a verifiable, signed identity a site can check."
  },
  "/guides/agentic-resource-discovery": {
    title: "Agentic Resource Discovery and resource catalogs · turva.dev",
    checked: "2026-09-05",
    description: "Resource catalogs describe the agent-facing interfaces a site exposes.",
    image: "/og-guide-agentic-resource-discovery.jpg",
    imageAlt: "turva.dev guide card: Agentic Resource Discovery explained: what an ai-catalog.json is, how it differs from llms.txt, and where it sits before MCP, A2A and API invocation."
  },
  "/guides/open-knowledge-format": {
    title: "Open Knowledge Format explained · turva.dev",
    checked: "2026-09-05",
    description: "Open Knowledge Format describes knowledge as linked Markdown documents.",
    image: "/og-guide-open-knowledge-format.jpg",
    imageAlt: "turva.dev guide card: What the Open Knowledge Format is: Google Cloud's open markdown spec for giving AI agents context, and where it fits agent-readiness."
  },
  "/blog/reliable-agent-decisions": {
    title: "What makes an AI agent's decisions reliable · turva.dev",
    description: "Usable inputs and explicit operating limits matter for agent decisions, alongside model uncertainty. The article asks where control and verification belong.",
    date: "2026-06-22",
    kind: "Protocol notes",
    image: "/og-reliable-agent-decisions.jpg",
    imageAlt: "turva.dev blog card: What makes an AI agent act correctly: data that arrives intact, and an envelope of settings that defines what it may do."
  },
  "/blog/owning-your-fediverse-identity": {
    title: "Owning your fediverse identity · turva.dev",
    description: "A build note on separating a public identity domain from the server that hosts the account, and the dependencies that still remain.",
    date: "2026-06-21",
    kind: "Build notes",
    image: "/og-owning-your-fediverse-identity.jpg",
    imageAlt: "turva.dev blog card: Why turva.dev put its fediverse handle on its own domain: a single-user instance, a domain split, and rel=me verification from the Worker."
  },
  "/blog/moving-off-prerender": {
    title: "Moving turva.dev off prerender.io · turva.dev",
    description: "A dated account of moving the homepage rendering into a Cloudflare Worker and serving HTML or Markdown from the same public site.",
    date: "2026-06-20",
    kind: "Build notes",
    image: "/og-moving-off-prerender.jpg",
    imageAlt: "turva.dev blog card: The turva.dev homepage now renders finished HTML in a Cloudflare Worker at the edge, with no prerender.io hop."
  },
  "/": {
    title: "Agent-readiness audits for websites, APIs and Shopify · turva.dev",
    description: "Agent-readiness audits for websites and APIs, plus focused Shopify checks. Evidence, prioritised fixes and optional implementation. Async-only.",
    imageAlt: "turva.dev: 100/100 and Level 5, Agent-Native, on isitagentready.com"
  },
  "/services": {
    title: "Agent-readiness services and pricing · turva.dev",
    description: "Fixed-scope website and API audits and Shopify checks. Compare prices, deliverables, follow-up checks and optional implementation.",
    image: "/og-services.jpg",
    imageAlt: "turva.dev services card: the Shopify agent storefront check €999, the audit €4,300, advisory €3,000 per month, implementation €1,500 per day, and two more on request."
  },
  "/shopify-agent-storefront-check": {
    title: "Shopify agent storefront check, €999 · turva.dev",
    description: "Check selected Shopify products across three agent-shopping surfaces. Written evidence and a correction plan within 48 hours of the agreed kickoff.",
    image: "/og-shopify-agent-storefront-check.jpg",
    imageAlt: "turva.dev product card: the Shopify agent storefront check, €999, four written deliverables within 48 hours, across three agent surfaces."
  },
  "/samples/audit-report": {
    title: "Sample audit report, synthetic · turva.dev",
    description: "Explore a synthetic website and API audit report with evidence, technical findings, observed AI answers, priorities and acceptance checks.",
    image: "/og-samples-audit-report.jpg",
    imageAlt: "turva.dev sample card: the synthetic agent-readiness audit report for an invented company, every check, finding and acceptance test in the format a client receives."
  },
  "/samples/shopify-agent-storefront-check": {
    title: "Sample Shopify storefront check report · turva.dev",
    description: "Read a synthetic Shopify check with product comparisons across three agent surfaces, buyer-journey evidence and a prioritised correction plan.",
    image: "/og-samples-shopify-agent-storefront-check.jpg",
    imageAlt: "turva.dev sample card: the synthetic Shopify agent storefront check report for an invented store, the five deliverables in the format a merchant receives."
  },
  "/company": {
    title: "Erik Rekola, independent agent-readiness consultant · turva.dev",
    description: "Work directly with Erik Rekola in Tampere, Finland. Independent technical audits, documented findings and implementation, handled entirely in writing.",
    image: "/og-company.jpg",
    imageAlt: "turva.dev company card: a one-person audit practice measured by an independent scanner, operated by Erik Rekola in Tampere, Finland."
  },
  "/contact": {
    title: "Contact Erik Rekola · turva.dev",
    description: "Send a website, API or Shopify URL and the question you need answered. First reply within one business day. All communication stays in writing.",
    image: "/og-contact.jpg",
    imageAlt: "turva.dev contact card: async only by email, Signal or LinkedIn, first response within one business day."
  },
  "/legal": {
    title: "Terms, privacy and data handling · turva.dev",
    description: "Terms for working with turva.dev, how information is handled and where to send a privacy request. Finnish law applies. No tracking or third-party scripts.",
    image: "/og-legal.jpg",
    imageAlt: "turva.dev legal card: terms, privacy and GDPR in plain language, Finnish law, no tracking and no cookies."
  },
  "/guides": {
    title: "Practical agent-readiness guides · turva.dev",
    description: "Guides to technical audits, AI visibility, website content, discovery, authentication and agent commerce. Choose a topic and see what to check.",
    image: "/og-guides.jpg",
    imageAlt: "turva.dev guides card: short guides on the surfaces that make a site or API readable and usable by AI agents, one surface at a time."
  },
  "/guides/agent-readiness-audit": {
    title: "What a website and API agent-readiness audit covers · turva.dev",
    checked: "2026-09-05",
    description: "A technical scan, manual review and observed AI answers reveal different problems.",
    image: "/og-guide-agent-readiness-audit.jpg",
    imageAlt: "turva.dev guide card: An agent-readiness audit measures how well AI agents can discover, read and act on a website or API, scored against current standards by an independent scanner."
  },
  "/guides/llms-txt": {
    title: "llms.txt explained · turva.dev",
    checked: "2026-09-05",
    description: "An llms.txt file offers a curated map of a site for clients that choose to read it. Learn its structure, discovery links and limits.",
    image: "/og-guide-llms-txt.jpg",
    imageAlt: "turva.dev guide card: llms.txt is a plain text guide that tells AI agents what a site contains and where its key content lives, and how it differs from robots.txt and sitemaps."
  },
  "/guides/mcp-server-card": {
    title: "MCP server cards and discovery · turva.dev",
    checked: "2026-09-05",
    description: "A server card describes an MCP endpoint for clients that support the relevant discovery convention.",
    image: "/og-guide-mcp-server-card.jpg",
    imageAlt: "turva.dev guide card: An MCP server card is a JSON file that lets agents discover a site's Model Context Protocol server and connect to it."
  },
  "/guides/agents-json": {
    title: "What agents.json describes · turva.dev",
    checked: "2026-09-05",
    description: "agents.json is one pattern for describing actions and endpoints for automated clients.",
    image: "/og-guide-agents-json.jpg",
    imageAlt: "turva.dev guide card: agents.json declares the actions and endpoints an AI agent can use on a site, turning a readable site into an operable one."
  },
  "/guides/x402-agent-payments": {
    title: "x402 and HTTP payment flows · turva.dev",
    checked: "2026-09-05",
    description: "x402 describes an HTTP-based payment flow. A payment declaration, an accepted payment and settlement are different states and should be documented separately.",
    image: "/og-guide-x402-agent-payments.jpg",
    imageAlt: "turva.dev guide card: x402 uses HTTP 402 Payment Required so AI agents can discover a price, pay, and continue without a human checkout."
  },
  "/guides/response-headers-for-agents": {
    title: "Response headers for AI clients · turva.dev",
    checked: "2026-09-05",
    description: "Response headers describe formats, discovery links and request policy. Check both what a header declares and whether the server behaves accordingly.",
    image: "/og-guide-response-headers-for-agents.jpg",
    imageAlt: "turva.dev guide card: The right HTTP response headers let AI agents work without parsing full HTML."
  },
  "/guides/seo-vs-agent-readiness": {
    title: "SEO and agent-readiness: overlap and differences · turva.dev",
    checked: "2026-09-05",
    description: "SEO, AI-answer visibility and technical agent access overlap, but they answer different questions.",
    image: "/og-guide-seo-vs-agent-readiness.jpg",
    imageAlt: "turva.dev guide card: SEO makes a site rank for people to click. Agent-readiness makes it legible and usable by AI agents."
  },
  "/guides/json-ld-structured-data": {
    title: "JSON-LD and structured data for AI clients · turva.dev",
    checked: "2026-09-05",
    description: "Structured data makes page facts explicit, but those facts must agree with the visible page and underlying source.",
    image: "/og-guide-json-ld-structured-data.jpg",
    imageAlt: "turva.dev guide card: JSON-LD states a page's facts as data an AI agent can read without parsing prose."
  },
  "/guides/well-known-for-agents": {
    title: "The /.well-known directory for agent discovery · turva.dev",
    checked: "2026-09-05",
    description: "Well-known URLs give clients predictable places to look for specific metadata.",
    image: "/og-guide-well-known-for-agents.jpg",
    imageAlt: "turva.dev guide card: The /.well-known directory is where agents look for a site's machine-readable manifests, from the API catalog (RFC 9727) to server cards and OAuth metadata."
  },
  "/guides/agent-authentication": {
    title: "Authentication and authorisation for AI agents · turva.dev",
    checked: "2026-09-05",
    description: "Authentication identifies a client, authorisation determines what it may access or do.",
    image: "/og-guide-agent-authentication.jpg",
    imageAlt: "turva.dev guide card: Agent authentication lets an automated client gain scoped access without a human login."
  },
  "/guides/measurement-led-agent-readiness": {
    title: "Measure agent-readiness with evidence · turva.dev",
    checked: "2026-09-05",
    description: "A scan is one source of evidence. Combine it with direct technical checks and observed AI answers, and record the method and date behind every conclusion.",
    image: "/og-guide-measurement-led-agent-readiness.jpg",
    imageAlt: "turva.dev guide card: A hand-filled checklist records intentions. An independent scanner records what an agent actually finds."
  },
  "/guides/prerendering-for-agents": {
    title: "When AI clients cannot read rendered pages · turva.dev",
    checked: "2026-09-05",
    description: "Some clients read the initial HTTP response without running a browser.",
    image: "/og-guide-prerendering-for-agents.jpg",
    imageAlt: "turva.dev guide card: JavaScript-rendered sites return an empty shell to agents, so the content never arrives."
  },
  "/guides/sitemaps-and-robots-for-agents": {
    title: "Sitemaps, robots.txt and AI crawler access · turva.dev",
    checked: "2026-09-05",
    description: "Sitemaps describe published URLs, while robots.txt communicates crawler rules. Neither file guarantees retrieval or replaces access control.",
    image: "/og-guide-sitemaps-and-robots-for-agents.jpg",
    imageAlt: "turva.dev guide card: robots.txt and the sitemap decide whether an agent is allowed in and what it can find."
  },
  "/guides/markdown-for-agents": {
    title: "Serving Markdown to AI clients · turva.dev",
    checked: "2026-09-05",
    description: "A Markdown representation can make published content easier for text-based clients to consume. Keep its facts and links aligned with the HTML page.",
    image: "/og-guide-markdown-for-agents.jpg",
    imageAlt: "turva.dev guide card: Serving a markdown version of a page gives agents the content without the markup, at a fraction of the tokens."
  },
  "/guides/agent-readiness-aeo-geo": {
    title: "Agent-readiness, AEO and GEO · turva.dev",
    checked: "2026-09-05",
    description: "These labels describe overlapping work around discovery, answers and automated use.",
    image: "/og-guide-agent-readiness-aeo-geo.jpg",
    imageAlt: "turva.dev guide card: How AEO, GEO and agent-readiness relate, what each one fixes, and how to sequence the work so you do not pay for the same fix twice."
  },
  "/guides/agentic-commerce-readiness": {
    title: "Agentic commerce readiness · turva.dev",
    checked: "2026-09-05",
    description: "Agent commerce involves product information, permitted actions and a supported checkout path.",
    image: "/og-guide-agentic-commerce-readiness.jpg",
    imageAlt: "turva.dev guide card: What an AI shopping agent needs to discover an offer, drive a checkout protocol and complete a purchase."
  },
  "/guides/letting-agents-act-on-data": {
    title: "Define what an agent may do with your data · turva.dev",
    checked: "2026-09-05",
    description: "Reliable agent operations depend on usable inputs, explicit permissions and observable outcomes.",
    image: "/og-guide-letting-agents-act-on-data.jpg",
    imageAlt: "turva.dev guide card: Letting an agent act safely depends on data that arrives intact and a decision envelope of permissions and thresholds."
  },
  "/guides/ai-agent-use-cases": {
    title: "AI agent use cases and their operating limits · turva.dev",
    checked: "2026-09-05",
    description: "Explore examples of agents reading data and taking permitted actions.",
    image: "/og-guide-ai-agent-use-cases.jpg",
    imageAlt: "turva.dev guide card: AI agent use cases across commerce, monitoring, field support, remote operations and back-office data work, and what makes each one reliable."
  },
  "/guides/get-cited-by-ai-assistants": {
    title: "Make your website easier for AI assistants to find and cite · turva.dev",
    checked: "2026-09-05",
    description: "Clear, accessible content and consistent facts help retrieval systems understand a site.",
    image: "/og-guide-get-cited-by-ai-assistants.jpg",
    imageAlt: "turva.dev guide card: What it takes to be a source AI assistants cite: readable content, structured data, corroboration, indexing where assistants search, and measurement."
  },
  "/guides/choosing-an-agent-readiness-audit": {
    title: "How to choose an agent-readiness audit · turva.dev",
    checked: "2026-09-05",
    description: "Compare an audit by its scope, evidence, deliverables and follow-up checks. See how the website and API audit differs from a focused Shopify check.",
    image: "/og-guide-choosing-an-agent-readiness-audit.jpg",
    imageAlt: "turva.dev guide card: Who provides agent-readiness audits, what they cost, how long they take, and what you get."
  },
  "/guides/agent-readiness-gaps": {
    title: "Common agent-readiness gaps in a measured sample · turva.dev",
    checked: "2026-09-05",
    description: "A prospecting sample of 567 company sites revealed recurring technical gaps.",
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
{"@type":"Offer","name":"Shopify agent storefront check","description":"Fixed scope, four written deliverables within 48 hours of the agreed written kickoff and a retest within 14 days. One live Shopify store read across browser WebMCP, Shopify-hosted Storefront and UCP MCP, and Catalog and Agentic channels, with a product truth matrix and a prioritised correction plan.","url":"https://turva.dev/shopify-agent-storefront-check","price":"999","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"999","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"€999 fixed price, 48 hours from the agreed written kickoff. VAT (25,5%) added per Finnish law."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Shopify agent storefront check"}},
{"@type":"Offer","name":"Audit","description":"Fixed scope, two weeks. An independent scanner runs against the site or API, plus manual review of /.well-known/ manifests, JSON-LD and head metadata, and a documented question set put to several AI assistants. Written report with prioritized fix list.","url":"https://turva.dev/services","price":"4300","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"4300","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"€4,300 fixed price, two weeks. VAT (25,5%) added per Finnish law."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness audit"}},
{"@type":"Offer","name":"Advisory","description":"Monthly retainer, async-only. Monthly re-scan and score delta report, a monthly AI-visibility delta across several AI platforms, written review of shipped work within one business day, roadmap input. Minimum three months.","url":"https://turva.dev/services","price":"3000","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"UnitPriceSpecification","price":"3000","priceCurrency":"EUR","valueAddedTaxIncluded":false,"unitCode":"MON","unitText":"month","description":"€3,000 per month, retainer-based. Minimum three months commitment."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness advisory"}},
{"@type":"Offer","name":"Implementation","description":"Hands-on work on the fixes the audit identified, or new agent-ready infrastructure. Edge workers, well-known manifests, JSON-LD generators, ai.txt and llms.txt authoring. An MCP server is a separate engagement.","url":"https://turva.dev/services","price":"1500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"UnitPriceSpecification","price":"1500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"unitCode":"DAY","unitText":"day","description":"€1,500 per day. Scoped per task."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Implementation work"}}
]}}`;

var SCHEMA_HOME = `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"ProfessionalService","@id":"https://turva.dev/#business","name":"turva.dev","url":"https://turva.dev/","image":"https://turva.dev/og.jpg","logo":"https://turva.dev/logo.png","description":"Agent-readiness audits for websites and APIs, plus focused Shopify checks. Evidence, prioritised fixes and optional implementation. Async-only.","priceRange":"€€€","taxID":"3600281-7","vatID":"FI36002817","email":"info@turva.dev","areaServed":{"@type":"Place","name":"Worldwide"},"address":{"@type":"PostalAddress","addressLocality":"Tampere","addressCountry":"FI"},"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"info@turva.dev","availableLanguage":["English","Finnish"]},"founder":{"@id":"https://turva.dev/#person"},"sameAs":["https://tietopalvelu.ytj.fi/yritys/3600281-7","https://www.linkedin.com/in/erikrekola/","https://github.com/erekola","https://www.wikidata.org/wiki/Q140276251"]},
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
.turva-nav .nv-brand svg{display:block;width:36px;height:36px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:21px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
${NAV_MOBILE_CSS}
.turva-nav .nv-menu{display:flex;flex-wrap:wrap;min-width:0;align-items:center;gap:clamp(18px,2.4vw,38px);list-style:none;margin:0;padding:0;}
.turva-nav .nv-menu a{font-size:18px;font-weight:500;color:#9AA3A0;text-decoration:none;}
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
${navMenuHtml(`    <li><a href="/">home</a></li>
    <li><a href="/services">services</a></li>
    <li><a href="/guides">guides</a></li>
    <li><a href="/blog">blog</a></li>
    <li><a href="/tools">tools</a></li>
    <li><a href="/company">company</a></li>
    <li><a href="/legal">legal</a></li>
    <li><a href="/contact">contact</a></li>`)}
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

var HOME_JSON = JSON.stringify({ "name": "turva.dev", "url": "https://turva.dev/", "description": "Agent-readiness audits for websites and APIs, plus focused Shopify checks. Evidence, prioritised fixes and optional implementation. Async-only.", "founder": "Erik Rekola", "location": { "city": "Tampere", "country": "FI" }, "businessId": "3600281-7", "email": "info@turva.dev", "signal": "https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK", "sameAs": ["https://www.wikidata.org/wiki/Q140276251", "https://www.linkedin.com/in/erikrekola/", "https://github.com/erekola", "https://tietopalvelu.ytj.fi/yritys/3600281-7"], "services": [{ "name": "Shopify agent storefront check", "price": 999, "currency": "EUR", "unit": "fixed", "duration": "48 hours", "vatIncluded": false }, { "name": "Audit", "price": 4300, "currency": "EUR", "unit": "fixed", "duration": "2 weeks", "vatIncluded": false }, { "name": "Advisory", "price": 3000, "currency": "EUR", "unit": "month", "minimumCommitment": "3 months", "vatIncluded": false }, { "name": "Implementation", "price": 1500, "currency": "EUR", "unit": "day", "vatIncluded": false }, { "name": "Agent operations", "pricing": "on request" }, { "name": "MCP server design", "pricing": "on request" }], "bundledImplementation": [{ "name": "Audit fix implementation", "price": 499, "currency": "EUR", "unit": "fixed", "vatIncluded": false, "requires": "Audit", "scope": "Exactly the fixes the audit report lists.", "soldSeparately": false }, { "name": "Shopify correction implementation", "price": 499, "currency": "EUR", "unit": "fixed", "vatIncluded": false, "requires": "Shopify agent storefront check", "scope": "Exactly the corrections the check's plan lists.", "soldSeparately": false }], "engagement": "Async only. No calls, no calendar links. Reply within one business day. Fixed scope written before payment.", "useCases": ["Reading a product catalog and completing a checkout for a buyer", "Watching an API and acting when a threshold is crossed", "Guiding a field technician from the same data an expert would use", "Triaging incoming requests and resolving the routine ones", "Operating a remote system over an unreliable link", "Reconciling records across systems and flagging mismatches", "Making a time-critical decision locally when no human can respond in time"], "resources": { "guides": "https://turva.dev/guides", "llmsTxt": "https://turva.dev/llms.txt", "llmsFullTxt": "https://turva.dev/llms-full.txt", "openapi": "https://turva.dev/openapi.json", "mcp": "https://mcp.turva.dev/mcp", "apiCatalog": "https://turva.dev/.well-known/api-catalog" }, "lastVerified": "2026-09-06" }, null, 2);
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

function stripTags(s) {
  // Drops every <...> run by index scan instead of a tag regex, so nothing that looks like
  // a tag survives one pass (CodeQL js/incomplete-multi-character-sanitization, alerts #10
  // and #11, 2026-09-06). Input is our own rendered HTML; an unterminated "<" drops the tail.
  let out = "";
  let i = 0;
  while (i < s.length) {
    const lt = s.indexOf("<", i);
    if (lt < 0) { out += s.slice(i); break; }
    out += s.slice(i, lt);
    const gt = s.indexOf(">", lt + 1);
    if (gt < 0) break;
    i = gt + 1;
  }
  return out.replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
  // The three autolinkers below run only OUTSIDE anchors already built above. Before
  // v3.134.0 (Tek-360) a label such as "email info@turva.dev" inside a [label](mailto:)
  // link got a second <a> inside the first, which is invalid HTML and reached both sample
  // reports live; a Sonnet checker found it on 2026-09-06.
  const outside = (text, fn) => text.split(/(<a [^>]*>[\s\S]*?<\/a>)/).map((seg, i) => (i % 2 ? seg : fn(seg))).join("");
  out = outside(out, (t) => t.replace(/(^|[\s(])(info@turva\.dev)/g, '$1<a href="mailto:info@turva.dev">$2</a>'));
  out = outside(out, (t) => t.replace(/(^|[\s(])(https?:\/\/[^\s<)"]+)/g, function(m, pre, url) {
    var tm = url.match(/[.,;:!?]+$/);
    var tail = "";
    if (tm) { tail = tm[0]; url = url.slice(0, url.length - tail.length); }
    return pre + '<a href="' + url.replace(BIDI_CONTROLS, "") + '">' + url + '</a>' + tail;
  }));
  out = outside(out, (t) => t.replace(/(^|[\s(])((?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+\/[^\s<)"]*)/gi, function(m, pre, url) {
    // Kierros 18 (2026-09-06, S5-1): this branch used to link ANY "label.label/path"
    // string, and a reverse-DNS identifier has exactly that shape, so two MCP metadata
    // keys in a blog post rendered as links to a host that does not resolve. The last
    // label now has to be a top-level domain this file declares; anything else is left
    // as the text it was. The set is enumerated rather than guessed, and verify.mjs
    // asserts that every autolink-shaped string in the served markdown either ends in
    // one of these or is named in AUTOLINK_NOT_HOSTS, so a new top-level domain fails
    // the gate loudly instead of silently not linking.
    var host = url.split("/")[0];
    var tld = host.slice(host.lastIndexOf(".") + 1).toLowerCase();
    if (!AUTOLINK_TLDS.has(tld)) return m;
    var tm = url.match(/[.,;:!?]+$/);
    var tail = "";
    if (tm) { tail = tm[0]; url = url.slice(0, url.length - tail.length); }
    return pre + '<a href="https://' + url.replace(BIDI_CONTROLS, "") + '">' + url + '</a>' + tail;
  }));
  return out;
}

// Top-level domains the protocol-less autolinker in renderInline() accepts, and the
// strings that look like a bare host but are not one. Both are read by
// turva-worker/tools/verify.mjs, so these are the only copies. Added kierros 18
// (2026-09-06) after two reverse-DNS metadata keys rendered as dead links.
var AUTOLINK_TLDS = new Set(["com", "dev", "org", "net", "io", "fi", "nl", "eu", "se", "no", "dk", "de", "uk", "ai", "app", "me", "info"]);
var AUTOLINK_NOT_HOSTS = new Set(["io.modelcontextprotocol/protocolVersion", "io.modelcontextprotocol/clientCapabilities"]);

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
      // Since v3.133.0 (Tek-358) every cell carries its column name as data-label, the
      // table sits in a bounded, keyboard-focusable scroll box, and a table of up to four
      // columns stacks into one named card per row below 640 px, so no cell is hidden and
      // the document never scrolls sideways. Wider tables keep the scroll box.
      const headCells = cells(tl[0]);
      const labels = headCells.map((c) => stripTags(c).replace(/"/g, "&quot;"));
      const head = headCells.map((c) => `<th>${c}</th>`).join("");
      const rows = tl.slice(2).filter((l) => l.startsWith("|")).map((l) => `<tr>${cells(l).map((c, i) => `<td data-label="${labels[i] || ""}">${c}</td>`).join("")}</tr>`).join("");
      const tableHtml = (cls) => `<table class="cols-${headCells.length}${cls}"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
      if (headCells.length <= 4) {
        html.push(`<div class="tbl" tabindex="0">${tableHtml(" stack")}</div>`);
      } else {
        // A wide table keeps its columns in the scroll box and is offered a second time as a
        // list of named cards from the same cells (v3.134.0, Tek-360), so every value can be
        // read vertically without hiding a column or shrinking the text.
        html.push(`<div class="tbl" tabindex="0">${tableHtml("")}</div>\n<details class="tbl-list"><summary>Read this table as a list</summary>${tableHtml(" stacked")}</details>`);
      }
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
    } else if (trimmed.startsWith("### ")) {
      // H3 since v3.133.0 (Tek-358): the same slug rule as H2, so a finding or a term can be
      // linked from a contents list without promoting it to a section.
      const h3 = trimmed.slice(4).trim();
      const h3Id = h3.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      html.push(`<h3${h3Id ? ` id="${h3Id}"` : ""}>${renderInline(h3)}</h3>`);
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
  const paras = mdSection("/contact", "Other channels").split("\n\n").map((b) => b.trim()).filter((b) => b && !b.startsWith("- "));
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
// ---- Open sections and card groups (v3.133.0, Tek-358) ----
// The shared page template of 2026-09-06: a section is an h2 with its body open on the
// page rather than boxed, and a card is used only where the reader compares things
// (offers, tools, results). Every sentence still comes from the twin; these helpers add
// structure and never prose. The section id is the same slug rule as markdownToHtml's
// h2 ids, so an anchor written by hand and one generated here agree.
function mdSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function mdSecBodyHtml(path, heading, listOnly) {
  // Like mdPcard's body: an opening **price. meta.** block becomes the price line, a
  // "Label:" block followed by "- items" becomes a labelled checklist, and everything
  // else is markdown. Continuation lines of a list item (indented) join the item.
  // listOnly: the paragraphs are rendered elsewhere in the same section (the /contact
  // Signal block, kierros 4 E-01: the twin says it once, the HTML said it twice).
  const blocks = mdSection(path, heading).split(/\n{2,}/).map((b) => b.replace(/\s+$/, "")).filter(Boolean)
    .filter((b) => !listOnly || b.trim().startsWith("- "));
  const parts = [];
  blocks.forEach((b, i) => {
    const lines = b.split("\n");
    const head = i === 0 ? b.trim().match(/^\*\*(.+)\*\*$/) : null;
    if (head) {
      const segs = head[1].replace(/\.$/, "").split(". ");
      let price = segs[0];
      let meta = segs.slice(1);
      const pm = price.match(/^(€[\d,]+)\s+(.+)$/);
      if (pm) { price = pm[1]; meta = [pm[2], ...meta]; }
      parts.push(`<p class="price-line"><span class="price">${escapeHtml(price).replace(/€/g, "&#8364;")}</span><span class="terms">${meta.map((m) => escapeHtml(m)).join(" &middot; ")}</span></p>`);
    } else if (/:$/.test(lines[0].trim()) && lines.slice(1).some((l) => l.startsWith("- "))) {
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
      parts.push(markdownToHtml(b).replace(/href="https:\/\/turva\.dev\//g, 'href="/'));
    }
  });
  return parts.join("\n    ");
}
function mdOpenSec(path, heading, id, extra, listOnly) {
  return `<section class="sec" id="${id || mdSlug(heading)}"><h2>${renderInline(heading)}</h2>
    ${mdSecBodyHtml(path, heading, listOnly)}${extra || ""}
  </section>`;
}
function mdFaqSec(path, heading, id) {
  return `<section class="sec" id="${id || mdSlug(heading)}"><h2>${renderInline(heading)}</h2><div class="faq">
${mdFaqRows(path, heading)}
  </div>
  ${mdFaqTailHtml(path, heading)}
  </section>`;
}
function mdKvsSec(path, heading, extra) {
  const grid = mdKvsCard(path, heading).replace(/^<div class="scard"><h2>.*?<\/h2>/, "").replace(/<\/div>$/, "");
  return `<section class="sec" id="${mdSlug(heading)}"><h2>${renderInline(heading)}</h2>
    ${grid}${extra || ""}
  </section>`;
}
function mdOfferCards(path, heading, linkLabel) {
  // The same row shape as the home page offers: "- [name](href). €price. covers Delivered ...".
  const rows = mdSection(path, heading).split("\n").filter((l) => l.startsWith("- "));
  if (!rows.length) throw new Error("mdOfferCards: no offer rows under " + heading + " in " + path);
  return rows.map((line) => {
    const m = line.match(/^- \[([^\]]+)\]\(([^)]+)\)\. (€[\d,]+)\. (.+?) (Delivered [^.]+\.)$/);
    if (!m) throw new Error("offer line does not parse: " + line.slice(0, 60));
    const [, name, href, price, covers, when] = m;
    const label = linkLabel[href];
    if (!label) throw new Error("offer has no link label for " + href);
    return `<a class="card" href="${href}"><span class="card-top"><span class="name">${escapeHtml(name)}</span><span class="price">${escapeHtml(price)}</span></span><p>${escapeHtml(covers)}</p><span class="when">${escapeHtml(when)}</span><span class="go">${label}</span></a>`;
  }).join("\n      ");
}
function mdToolCards(path, headings) {
  // One card per section: the section's paragraphs, then its last "[label](href)" line as the action.
  return headings.map((h) => {
    const blocks = mdSection(path, h).split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
    const last = blocks[blocks.length - 1].match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!last) throw new Error("mdToolCards: " + h + " does not end in a link line");
    const paras = blocks.slice(0, -1).map((b) => `<p>${renderInline(b.replace(/\s*\n\s*/g, " "))}</p>`).join("");
    return `<div class="card"><h2>${renderInline(h)}</h2>${paras}<a class="go" href="${last[2]}">${escapeHtml(last[1])}</a></div>`;
  }).join("\n      ");
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
  "/blog/i-rebuilt-turva-dev-around-the-report": mdFaqBlocks("/blog/i-rebuilt-turva-dev-around-the-report", "Frequently asked").pairs,
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
    "description": "A fixed-scope check of what an AI shopper receives from one live Shopify store, across browser WebMCP, Shopify-hosted Storefront and UCP MCP, and Shopify Catalog and Agentic channels. Four written deliverables as one package within 48 hours of the agreed written kickoff, and a fifth, the retest of up to two corrected items, within 14 days.",
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

// Reading column: NONE (2026-09-06, Erik, third and final decision of the evening). v3.140.0
// bounded prose to 65ch, v3.140.1 and v3.140.2 tried to limit that to narrower viewports, and
// none of them read right on Erik's displays in three browsers. The whole site reads the full
// 68rem frame (Tek-360 stands). READ_CSS stays as an empty hook so the templates need no change.
var READ_CSS = ``;
var FOOTER_CSS = `${READ_CSS}main table{border-collapse:collapse;margin:1.1rem 0;width:100%;font-size:.93rem}main th,main td{border:0.5px solid rgba(255,255,255,0.14);padding:.5rem .65rem;text-align:left;vertical-align:top;color:#C9D1CE}main th{color:#F2F4F3;font-weight:600}pre{background:#07110D;border:1px solid #1E3328;border-radius:8px;padding:14px 16px;overflow-x:auto;font-size:13px;line-height:1.5;color:#CFE3D6;font-family:ui-monospace,"Cascadia Mono",Menlo,Consolas,monospace;max-width:100%}pre code{font-family:inherit}.aview-cmd{font-family:ui-monospace,"Cascadia Mono",Menlo,Consolas,monospace;font-size:13px;color:#5DF18F;margin:0 0 10px;overflow-wrap:anywhere}.verr{color:#F17F5D}
.tv-foot{box-sizing:border-box;width:100%;background:#06100F;border-top:1px solid rgba(255,255,255,0.1);padding:3rem clamp(24px,5vw,72px);display:flex;flex-direction:column;gap:1.5rem;}
.tv-foot .foot-brand{display:flex;align-items:center;gap:10px;}.tv-foot .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:21px;letter-spacing:.02em;color:#F2F4F3;}.tv-foot .nv-word b{color:#5DF18F;}
.tv-foot .foot-brand svg{display:block;width:34px;height:34px;}
.tv-foot .foot-links{display:flex;flex-wrap:wrap;gap:0.8rem 1.6rem;}
.tv-foot .ft-row{display:flex;align-items:center;gap:11px;color:#C9D1CE;font-size:1.15rem;text-decoration:none;}
.tv-foot a.ft-row:hover{color:#5DF18F;}
.tv-foot .ft-row svg{flex:0 0 auto;width:22px;height:22px;}
.tv-foot .foot-meta{font-size:1.02rem;color:#9AA3A0;border-top:0.5px solid rgba(255,255,255,0.08);padding-top:1.1rem;}
.tv-foot .foot-meta a{color:inherit;text-decoration:underline;text-underline-offset:2px;}
.tv-foot .foot-meta a:hover{color:#5DF18F;}
.turva-nav,.tv-foot{padding-left:max(clamp(24px,5vw,72px),calc(50% - var(--col-half,34rem)));padding-right:max(clamp(24px,5vw,72px),calc(50% - var(--col-half,34rem)));}.turva-nav > ul.nv-menu{flex:1;justify-content:space-between;}.tv-foot .foot-links{justify-content:space-between;}
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

// One restrained next step at the end of a guide (Tek-358). The default points at the
// services page; a guide about a free tool or about Shopify points at that instead. Short
// lines by design: the twin gate reads any paragraph over 80 characters as prose.
var SAMPLE_HEAD = {
  "/samples/audit-report": { eyebrow: "Synthetic sample report", primary: ["Jump to the findings", "#findings"], secondary: ["View audit scope and pricing", "/services#audit"] },
  "/samples/shopify-agent-storefront-check": { eyebrow: "Synthetic sample report", primary: ["View the product comparison", "#product-truth-matrix"], secondary: ["View Shopify check scope", "/shopify-agent-storefront-check"] }
};
// Kierros 4 (2026-09-06, worker-02): Tek-362 renamed headings in three guides and the id is
// derived from the heading, so ten fragment addresses that had been served stopped resolving.
// The implementation guide keeps existing anchors, so each old id is rendered as an empty
// span before the heading that now carries the content. The twin does not change.
var GUIDE_ANCHOR_ALIASES = {
  "/guides/open-knowledge-format": {
    "structure-versus-meaning": ["structural-interoperability-not-yet-semantic"]
  },
  "/guides/agentic-resource-discovery": {
    "what-the-manifest-contains": ["what-it-is"],
    "where-it-sits-and-how-it-differs-from-llms-txt": ["where-it-sits", "how-it-relates-to-llms-txt"],
    "what-a-scan-checks-and-why-it-matters-now": ["why-it-matters"]
  },
  "/guides/letting-agents-act-on-data": {
    "inputs": ["a-decision-is-only-as-good-as-its-inputs"],
    "allowed-actions": ["the-envelope-is-the-real-control", "the-envelope-is-starting-to-appear-in-protocols"],
    "human-handoff": ["keep-a-person-where-judgment-belongs"],
    "verification": ["make-it-checkable"]
  }
};
function withAnchorAliases(pathname, html) {
  const aliases = GUIDE_ANCHOR_ALIASES[pathname];
  if (!aliases) return html;
  let out = html;
  for (const [id, olds] of Object.entries(aliases)) {
    const tag = `<h2 id="${id}">`;
    if (!out.includes(tag)) throw new Error("anchor alias target missing: " + pathname + "#" + id);
    out = out.replace(tag, olds.map((o) => `<span id="${o}"></span>`).join("") + tag);
  }
  return out;
}
var GUIDE_NEXT = {
  default: 'Need a broader review? <a class="btn-ghost" href="/services">See the services</a>',
  "/guides/llms-txt": 'Check your own file: <a class="btn-ghost" href="/llms-txt-validator">Open the validator</a>',
  "/guides/agentic-commerce-readiness": 'Selling on Shopify? <a class="btn-ghost" href="/shopify-agent-storefront-check">See the Shopify check</a>',
  "/guides/agent-commerce-discovery": 'Selling on Shopify? <a class="btn-ghost" href="/shopify-agent-storefront-check">See the Shopify check</a>',
  "/guides/mcp-server-card": 'Read this site\'s card: <a class="btn-ghost" href="/tools">See the free tools</a>'
};

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
  const aliased = withAnchorAliases(pathname, article);
  const navSection = pathname.startsWith("/blog/") ? "/blog" : (pathname.startsWith("/guides/") ? "/guides" : "");
  const crumb = navSection === "/blog" ? '<p class="crumb"><a href="/blog">&#8249; all posts</a></p>\n' : (navSection === "/guides" ? '<p class="crumb"><a href="/guides">&#8249; all guides</a></p>\n' : "");
  // Article template since v3.133.0 (Tek-358): the twin's bare date line becomes a byline
  // with the author and the real dates from META_BY_PATH, a contents list is generated from
  // the H2 ids when an article carries more than four sections and no contents list of its
  // own, and a guide ends in one restrained next step. Nothing here adds prose over 80
  // characters; the article text is the twin.
  const meta = META_BY_PATH[pathname] || {};
  const bylined = navSection === "" ? aliased : aliased.replace(/<p class="date">(\d{4}-\d{2}-\d{2})<\/p>/, (m, d) =>
    `<p class="date">Erik Rekola &middot; ${d}${meta.modified && meta.modified !== d ? ` &middot; updated ${meta.modified}` : ""}</p>`);
  // Guides carry no date line in the twin. Since 2026-09-06 (koko sivuston tarkistus, kohta 6)
  // META_BY_PATH.checked is the day the guide was last read against its primary sources, and
  // /guides says that date is the one that counts, so it is rendered under the H1. It is not a
  // publication or modification date and is not written into the JSON-LD as one.
  const checkedLine = navSection === "/guides" && meta.checked
    ? `<p class="date">Sources checked ${meta.checked}</p>`
    : "";
  const withChecked = checkedLine ? bylined.replace(/<\/h1>\n?/, (m) => `${m}${checkedLine}\n`) : bylined;
  const h2s = [...withChecked.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map((m) => ({ id: m[1], text: stripTags(m[2]) }));
  const hasOwnContents = /<h2 id="contents">/.test(withChecked) || /<h2 id="[^"]*">Contents<\/h2>/.test(withChecked);
  const toc = h2s.length > 4 && !hasOwnContents
    ? `<div class="toc"><p>On this page</p><ul>${h2s.map((h) => `<li><a href="#${h.id}">${h.text}</a></li>`).join("")}</ul></div>`
    : "";
  const withToc = toc ? withChecked.replace(/(<\/p>\n)(?=<h2 )/, `$1${toc}\n`) : withChecked;
  // Sample reports (Tek-360): the synthetic label stands above the H1, and two actions follow
  // the introduction. Both come from SAMPLE_HEAD; labels are short by design.
  const sample = SAMPLE_HEAD[pathname];
  const withSample = sample
    ? withToc.replace(/^<h1>/, `<p class="eyebrow">${sample.eyebrow}</p>\n<h1>`)
        .replace(/(<\/p>\n)(?=<h2 )/, `$1<div class="cta"><a class="btn" href="${sample.primary[1]}">${sample.primary[0]}</a><a class="btn-ghost" href="${sample.secondary[1]}">${sample.secondary[0]}</a></div>\n`)
    : withToc;
  const next = navSection === "/guides"
    ? `<aside class="next"><p>${GUIDE_NEXT[pathname] || GUIDE_NEXT.default}</p></aside>`
    : "";
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
html,body{background-color:#0A1316;overflow-wrap:break-word;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;color-scheme:dark;}
main{max-width:68rem;box-sizing:content-box;margin:0 auto;padding:clamp(28px,4vw,44px) clamp(24px,5vw,72px) 3.5rem;}
main *,main *::before,main *::after{box-sizing:border-box;}
article h1{color:#F2F4F3;overflow-wrap:break-word;hyphens:manual;font-size:clamp(30px,3.4vw,46px);line-height:1.1;letter-spacing:-0.02em;margin:0 0 .9rem;font-weight:700;max-width:26ch;}
article h1 + p,article h1 + p.date + p{font-size:clamp(17px,1.3vw,19px);color:#F2F4F3;}
article h2{color:#F2F4F3;font-size:clamp(24px,2.2vw,28px);line-height:1.2;font-weight:700;letter-spacing:-0.015em;margin:clamp(36px,5vw,52px) 0 .9rem;padding-top:clamp(20px,3vw,28px);border-top:0.5px solid rgba(255,255,255,0.08);scroll-margin-top:1rem;}
article h3{color:#F2F4F3;font-size:clamp(18px,1.6vw,20px);font-weight:700;margin:1.6rem 0 .55rem;scroll-margin-top:1rem;}
article p{margin:0 0 1.05rem;color:#C9D1CE;font-size:17px;line-height:1.6;}
article a{color:#5DF18F;text-decoration:none;overflow-wrap:anywhere;}
article a:hover{text-decoration:underline;}
article ul{list-style:none;margin:0 0 1.1rem;padding:0;}
article li{position:relative;padding:0 0 0 1.45rem;margin:0 0 0.5rem;color:#C9D1CE;font-size:17px;line-height:1.6;}
article li::before{content:"\\203A";position:absolute;left:0.45rem;top:0;color:#5DF18F;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
article strong{color:#F2F4F3;}
article pre{max-width:100%;}
article p.date{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.8rem;letter-spacing:.04em;color:#9AA3A0;margin:-.35rem 0 1.4rem;}
article .eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.75rem;letter-spacing:.09em;text-transform:uppercase;color:#5DF18F;margin:0 0 1rem;}
.toc{margin:0 0 1.6rem;padding:.9rem 1.1rem;border:1px solid rgba(255,255,255,0.1);border-radius:10px;}
.toc p{margin:0 0 .4rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:#9AA3A0;}
.toc ul{list-style:none;margin:0;padding:0;columns:2;column-gap:1.4rem;}
.toc li{margin:0 0 .3rem;padding:0;font-size:.95rem;break-inside:avoid;}
.toc li::before{content:none;}
.toc a{color:#C9D1CE;}
.toc a:hover{color:#5DF18F;}
@media (max-width:560px){.toc ul{columns:1;}}
.next{margin:clamp(36px,5vw,56px) 0 0;padding:1.4rem 1.5rem;border:1px solid #2D3D3D;border-radius:10px;background:#111F21;}
.next p{margin:0 0 .8rem;}
.next p:last-child{margin:0;}
.next .btn-ghost{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:.7rem 1.2rem;border-radius:7px;font-size:15px;font-weight:600;color:#F2F4F3;border:1px solid rgba(255,255,255,0.24);}
.next .btn-ghost:hover{border-color:#5DF18F;color:#5DF18F;text-decoration:none;}
.cta{display:flex;flex-wrap:wrap;gap:14px;margin:.4rem 0 1.6rem;}
.btn,.btn-ghost{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:50px;padding:.75rem 1.35rem;border-radius:7px;font-size:15px;font-weight:700;max-width:100%;overflow-wrap:break-word;text-align:center;}
.btn{background:#5DF18F;color:#06100F;}
.btn:hover{background:#7df7a6;text-decoration:none;}
.btn-ghost{color:#F2F4F3;font-weight:600;border:1px solid rgba(255,255,255,0.24);}
.btn-ghost:hover{border-color:#5DF18F;color:#5DF18F;text-decoration:none;}
@media (max-width:560px){.cta{flex-direction:column;}.btn,.btn-ghost{width:100%;}}
.tbl-list{margin:-.4rem 0 1.2rem;}
.tbl-list summary{cursor:pointer;color:#C9D1CE;font-size:.9rem;padding:.4rem 0;}
.tbl-list summary:hover{color:#5DF18F;}
.tbl-list[open] summary{margin-bottom:.6rem;}
table.stacked{display:block;border:0;min-width:0;width:100%;}table.stacked thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}table.stacked tbody,table.stacked tr{display:block;}table.stacked tr{border:1px solid #2D3D3D;border-radius:10px;padding:.7rem .9rem;margin:0 0 .75rem;background:#111F21;}table.stacked td{display:block;border:0;padding:.25rem 0;color:#C9D1CE;}table.stacked td::before{content:attr(data-label);display:block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.7rem;letter-spacing:.05em;text-transform:uppercase;color:#9AA3A0;margin:0 0 .1rem;}table.stacked td:first-child{color:#F2F4F3;font-weight:600;}
.crumb{margin:0 0 1.2rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;}
.crumb a{color:#9AA3A0;}
.crumb a:hover{color:#5DF18F;text-decoration:none;}
a:focus-visible{outline:2px solid #5DF18F;outline-offset:2px;}
.tbl{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;margin:1.1rem 0;}
.tbl table{margin:0;min-width:100%;}
.tbl:focus-visible{outline:2px solid #5DF18F;outline-offset:2px;}
@media (max-width:640px){table.stack{display:block;border:0;min-width:0;}table.stack thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}table.stack tbody,table.stack tr{display:block;}table.stack tr{border:1px solid #2D3D3D;border-radius:10px;padding:.7rem .9rem;margin:0 0 .75rem;background:#111F21;}table.stack td{display:block;border:0;padding:.25rem 0;color:#C9D1CE;}table.stack td::before{content:attr(data-label);display:block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.7rem;letter-spacing:.05em;text-transform:uppercase;color:#9AA3A0;margin:0 0 .1rem;}table.stack td:first-child{color:#F2F4F3;font-weight:600;}}
@media (max-width:360px){main{padding-left:20px;padding-right:20px;}}
.turva-nav{box-sizing:border-box;width:100%;background:#0A1316;display:flex;align-items:center;gap:28px;flex-wrap:wrap;padding:24px clamp(24px,5vw,72px);border-bottom:0.5px solid rgba(255,255,255,0.08);}
.turva-nav *,.turva-nav *::before,.turva-nav *::after{box-sizing:border-box;}
.turva-nav .nv-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.turva-nav .nv-brand svg{display:block;width:36px;height:36px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:21px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
${NAV_MOBILE_CSS}
.turva-nav .nv-menu{display:flex;flex-wrap:wrap;min-width:0;align-items:center;gap:clamp(18px,2.4vw,38px);list-style:none;margin:0;padding:0;flex:1;}
.turva-nav .nv-menu a{font-size:18px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
.turva-nav .nv-menu a[aria-current]{color:#F2F4F3;}
@media (max-width:640px){.turva-nav .nv-menu{gap:14px;}.turva-nav .nv-menu a{font-size:15px;}}
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
${navMenuHtml(`    <li><a href="/">home</a></li>
    <li><a href="/services">services</a></li>
    <li><a href="/guides"${navSection === "/guides" ? ' aria-current="true"' : ""}>guides</a></li>
    <li><a href="/blog"${navSection === "/blog" ? ' aria-current="true"' : ""}>blog</a></li>
    <li><a href="/tools">tools</a></li>
    <li><a href="/company">company</a></li>
    <li><a href="/legal">legal</a></li>
    <li><a href="/contact">contact</a></li>`)}
</nav>
<main id="main">
${crumb}<article>
${withSample}
</article>
${next}
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
  // The measured date comes from the twin's own agent-readiness sentence, so the hero row and
  // the markdown agree by construction and the Measured-date gate in verify.mjs reads one copy.
  const evMeasured = ((lead.paras[2] || "").match(/Measured (\d{4}-\d{2}-\d{2})/) || [])[1] || "";
  if (!evMeasured) throw new Error("home lead carries no Measured date for the scan row");
  const hpMeasured = ` &middot; measured ${evMeasured}`;
  // The hero H1 is the twin's title. The words "AI agents" are the one green highlight the
  // layout guide (2026-09-06, Tek-354) allows in the heading; if the title stops carrying them,
  // the heading renders plain and nothing breaks.
  const heroH1 = renderInline(lead.title).replace("AI agents", '<span class="hl">AI agents</span>');
  // "Title. Body." paragraphs become a titled card; the split is the first ". " and a paragraph
  // without one throws, so a twin edit that drops the title cannot render an empty card.
  const titled = (t, what) => { const k = t.indexOf(". "); if (k < 0) throw new Error("home " + what + " paragraph has no title: " + t.slice(0, 40)); return { t: t.slice(0, k), b: t.slice(k + 2) }; };
  // The two offers are read from the twin list, one card each: name, price, what it covers and
  // when it is delivered. Fail closed: a list line that stops matching the shape throws here
  // instead of rendering a card with an empty price (Tek-355, Tek-357).
  const offerParas = mdParas("/", "Choose the right starting point", 3);
  const offerRaw = mdSection("/", "Choose the right starting point").split("\n").filter((l) => l.startsWith("- "));
  if (offerRaw.length !== 2) throw new Error("home starting-point list does not carry exactly two offers: " + offerRaw.length);
  const OFFER_LINK = { "/shopify-agent-storefront-check": "Explore the Shopify check", "/services": "Explore the audit" };
  const offerCards = offerRaw.map((line) => {
    const m = line.match(/^- \[([^\]]+)\]\(([^)]+)\)\. (€[\d,]+)\. (.+?) (Delivered [^.]+\.)$/);
    if (!m) throw new Error("home offer line does not parse: " + line.slice(0, 60));
    const [, name, href, price, covers, when] = m;
    if (!OFFER_LINK[href]) throw new Error("home offer has no link label for " + href);
    return `<a class="offer" href="${href}"><span class="offer-top"><span class="offer-name">${escapeHtml(name)}</span><span class="offer-price">${escapeHtml(price)}</span></span><span class="offer-covers">${escapeHtml(covers)}</span><span class="offer-when">${escapeHtml(when)}</span><span class="offer-link">${OFFER_LINK[href]}</span></a>`;
  }).join("\n      ");
  const gets = mdParas("/", "From an observed problem to a checkable fix", 5);
  const getCards = gets.slice(1, 4).map((t) => titled(t, "deliverable")).map((c) => `<div class="step"><span class="step-t">${c.t}</span><p>${c.b}</p></div>`).join("\n      ");
  const proc = mdParas("/", "A clear process, in writing", 4);
  const procCards = proc.slice(0, 3).map((t, i) => titled(t, "process")).map((c, i) => `<div class="step"><span class="step-n">0${i + 1}</span><span class="step-t">${c.t}</span><p>${c.b}</p></div>`).join("\n      ");
  const work = mdParas("/", "Work you can inspect", 5);
  const workCards = work.slice(0, 3).map((t) => titled(t, "inspect")).map((c) => `<div class="svc"><div class="svc-h"><span class="svc-t">${c.t}</span></div><p>${c.b}</p></div>`).join("\n      ");
  const secList = mdLists("/", "Work you can inspect")[0].map((x) => `<li>${mdTidyUrlText(x)}</li>`).join("\n      ");
  const support = mdParas("/", "Support beyond the first report", 3);
  const who = mdParas("/", "Work directly with Erik Rekola", 3);
  const contact = mdParas("/", "Contact", 3);
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
.turva-nav{box-sizing:border-box;width:100%;background:#0A1316;display:flex;align-items:center;gap:28px;flex-wrap:wrap;padding:24px clamp(24px,5vw,72px);border-bottom:0.5px solid rgba(255,255,255,0.08);}
.turva-nav *,.turva-nav *::before,.turva-nav *::after{box-sizing:border-box;}
.turva-nav .nv-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.turva-nav .nv-brand svg{display:block;width:36px;height:36px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:21px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
${NAV_MOBILE_CSS}
.turva-nav .nv-menu{display:flex;flex-wrap:wrap;min-width:0;align-items:center;gap:clamp(18px,2.4vw,38px);list-style:none;margin:0;padding:0;flex:1;}
.turva-nav .nv-menu a{font-size:18px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
.turva-nav .nv-menu a[aria-current]{color:#F2F4F3;}
main{max-width:none;margin:0;padding:0;}
.page{max-width:68rem;box-sizing:content-box;margin:0 auto;padding:0 clamp(24px,5vw,72px) 3rem;}
.hero{max-width:68rem;box-sizing:content-box;margin:0 auto;padding:clamp(48px,6vw,72px) clamp(24px,5vw,72px) 2.6rem;border-bottom:0.5px solid rgba(255,255,255,0.07);}
.hero-grid{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:clamp(40px,4vw,48px);align-items:center;}
.eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.75rem;letter-spacing:.09em;text-transform:uppercase;color:#5DF18F;margin:0 0 1.1rem;}
.hero h1{color:#F2F4F3;font-size:clamp(34px,4.2vw,56px);line-height:1.08;letter-spacing:-0.02em;margin:0 0 24px;font-weight:700;hyphens:manual;}
.hero h1 .hl{color:#5DF18F;}
.lede{font-size:clamp(17px,1.35vw,20px);line-height:1.6;color:#C9D1CE;margin:0 0 30px;max-width:36rem;}
.cta{display:flex;flex-wrap:wrap;gap:14px;margin:0;}
.btn,.btn-ghost{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:52px;padding:.8rem 1.35rem;border-radius:7px;font-size:15px;font-weight:700;max-width:100%;overflow-wrap:break-word;text-align:center;}
.btn{background:#5DF18F;color:#06100F;transition:background-color .15s ease;}
.btn:hover{background:#7df7a6;text-decoration:none;}
.btn-ghost{color:#F2F4F3;font-weight:600;border:1px solid rgba(255,255,255,0.24);transition:border-color .15s ease,color .15s ease;}
.btn-ghost:hover{border-color:#5DF18F;color:#5DF18F;text-decoration:none;}
.btn:focus-visible,.btn-ghost:focus-visible,.hero a:focus-visible{outline:2px solid #5DF18F;outline-offset:3px;}
.svcnote{margin:18px 0 0;font-size:13px;color:#9AA3A0;letter-spacing:.01em;}
.svcnote a{color:#C9D1CE;border-bottom:1px solid rgba(255,255,255,0.25);}
.svcnote a:hover{color:#5DF18F;border-color:#5DF18F;text-decoration:none;}
.rcard{box-sizing:border-box;min-width:0;background:#111F21;border:1px solid #2D3D3D;border-radius:10px;padding:24px;color:#C9D1CE;box-shadow:0 18px 40px rgba(0,0,0,0.28);}
.rc-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:6px 12px;margin:0 0 14px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:#9AA3A0;}
.rc-tag{color:#5DF18F;border:1px solid rgba(93,241,143,0.35);border-radius:999px;padding:.1rem .55rem;text-transform:none;letter-spacing:.02em;}
.rc-title{margin:0 0 4px;font-size:1.25rem;line-height:1.25;font-weight:700;color:#F2F4F3;}
.rc-client{margin:0 0 16px;font-size:.9rem;color:#9AA3A0;}
.rc-list{list-style:none;margin:0 0 16px;padding:0;border-top:1px solid #2D3D3D;}
.rc-list li{display:flex;gap:14px;align-items:baseline;padding:10px 0;border-bottom:1px solid #2D3D3D;font-size:.95rem;color:#F2F4F3;}
.rc-n{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;color:#5DF18F;font-weight:700;flex:0 0 auto;}
.rc-foot{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.72rem;letter-spacing:.05em;color:#9AA3A0;}
.hero-proof{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;margin:clamp(32px,4vw,44px) 0 0;padding:14px 0 0;border-top:1px solid #2D3D3D;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13.5px;color:#C9D1CE;}
.hero-proof .hp-score{color:#5DF18F;font-weight:700;font-size:1.15rem;}
.hero-proof .hp-src{color:#9AA3A0;}
.hero-proof a{margin-left:auto;color:#F2F4F3;border-bottom:1px solid rgba(255,255,255,0.3);padding:.15rem 0;}
.hero-proof a:hover{color:#5DF18F;border-color:#5DF18F;text-decoration:none;}
.rc-more{display:inline-block;margin:16px 0 0;font-size:.9rem;font-weight:600;color:#5DF18F;border-bottom:1px solid rgba(93,241,143,0.4);padding:.1rem 0;}
.rc-more:hover{border-color:#5DF18F;text-decoration:none;}
.offers{max-width:68rem;margin:0 auto;padding:2.2rem clamp(24px,5vw,72px) 2rem;border-top:0;box-sizing:content-box;}
.offer-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(16px,2vw,24px);margin:.4rem 0 1.4rem;}
.offer{display:flex;flex-direction:column;gap:10px;box-sizing:border-box;min-width:0;background:#111F21;border:1px solid #2D3D3D;border-radius:10px;padding:22px 24px;color:#C9D1CE;text-decoration:none;transition:border-color .15s ease;}
.offer:hover{border-color:#5DF18F;text-decoration:none;}
.offer:focus-visible{outline:2px solid #5DF18F;outline-offset:3px;}
.offer-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:6px 14px;}
.offer-name{font-size:1.15rem;font-weight:700;color:#F2F4F3;}
.offer-price{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.05rem;font-weight:700;color:#5DF18F;}
.offer-covers{font-size:.95rem;line-height:1.55;color:#C9D1CE;}
.offer-when{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.76rem;letter-spacing:.03em;color:#9AA3A0;}
.offer-link{margin-top:auto;padding-top:6px;font-size:.9rem;font-weight:600;color:#5DF18F;}
.muted{font-size:.9rem;color:#9AA3A0;}
.mail-link{display:inline-block;margin-left:14px;color:#F2F4F3;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.3);padding:.15rem 0;}
.mail-link:hover{color:#5DF18F;border-color:#5DF18F;text-decoration:none;}
.board{margin:1.2rem 0 1.4rem;}
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
.exgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:.6rem;margin:0 0 1.1rem;}
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
@media (max-width:700px){.offer-grid{grid-template-columns:minmax(0,1fr);}.hero-grid{grid-template-columns:minmax(0,1fr);gap:32px;}.hero{padding-top:44px;}.hero h1{font-size:clamp(34px,9vw,38px);line-height:1.1;}.lede{font-size:clamp(16px,4.4vw,18px);}.hero-proof a{margin-left:0;}.turva-nav .nv-menu{gap:14px;}.turva-nav .nv-menu a{font-size:14px;}}
@media (max-width:640px){.board-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media (max-width:430px){.cta{flex-direction:column;}.btn,.btn-ghost{width:100%;}.hero{padding-left:24px;padding-right:24px;}.rcard{padding:20px;}}
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
${navMenuHtml(`    <li><a href="/" aria-current="page">home</a></li>
    <li><a href="/services">services</a></li>
    <li><a href="/guides">guides</a></li>
    <li><a href="/blog">blog</a></li>
    <li><a href="/tools">tools</a></li>
    <li><a href="/company">company</a></li>
    <li><a href="/legal">legal</a></li>
    <li><a href="/contact">contact</a></li>`)}
</nav>
<main id="main">
  <section class="hero">
    <div class="hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Independent agent-readiness audits</p>
        <h1>${heroH1}</h1>
        <p class="lede">${renderInline(lead.paras[0])}</p>
        <div class="cta">
          <a class="btn" href="/contact">Request an audit</a>
          <a class="btn-ghost" href="/samples/audit-report">Read a sample report</a>
        </div>
        <p class="svcnote">${renderInline(lead.paras[1])}</p>
      </div>
      <div class="rcard" role="group" aria-label="What a report looks like, synthetic example">
        <div class="rc-top"><span>turva.dev / audit</span><span class="rc-tag">Synthetic example</span></div>
        <p class="rc-title">A report your team can act on.</p>
        <p class="rc-client">Northwind Fasteners Oy &middot; invented company</p>
        <ol class="rc-list">
          <li><span class="rc-n">01</span><span>Document the issue</span></li>
          <li><span class="rc-n">02</span><span>Prioritise the correction</span></li>
          <li><span class="rc-n">03</span><span>Define how to verify it</span></li>
        </ol>
        <p class="rc-foot">Evidence &middot; Priorities &middot; Acceptance checks</p>
        <a class="rc-more" href="/samples/audit-report">View the full sample</a>
      </div>
    </div>
    <div class="hero-proof">
      <span class="hp-score">100/100</span>
      <span>Technical agent-readiness of turva.dev &middot; Level 5, Agent-Native</span>
      <span class="hp-src">isitagentready.com${hpMeasured}</span>
      <a href="https://isitagentready.com/">Open the scanner</a>
    </div>
  </section>
  <section class="sec offers">
    <h2>Choose the right starting point</h2>
    <p>${offerParas[0]}</p>
    <div class="offer-grid">
      ${offerCards}
    </div>
    <p class="muted">${offerParas[1]}</p>
    <p>${offerParas[2]}</p>
  </section>
  <div class="page">
  <section class="sec">
    <h2>From an observed problem to a checkable fix</h2>
    <p>${gets[0]}</p>
    <div class="steps">
      ${getCards}
    </div>
    <p>${gets[4]}</p>
  </section>

  <section class="sec">
    <h2>A clear process, in writing</h2>
    <div class="steps">
      ${procCards}
    </div>
    <p class="muted">${proc[3]}</p>
  </section>

  <section class="sec">
    <h2>Work you can inspect</h2>
    <div class="svcgrid">
      ${workCards}
    </div>
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
    <p>${work[4]}</p>
    <ul class="evlist">
      ${secList}
    </ul>
  </section>

  <section class="sec">
    <h2>Support beyond the first report</h2>
    <p>${support[0]}</p>
    <p>${support[1]}</p>
    <p>${support[2]}</p>
  </section>

  <section class="sec">
    <h2>Work directly with Erik Rekola</h2>
    <p>${who[0]}</p>
    <p>${who[1]}</p>
    <p>${who[2]}</p>
  </section>

  <section class="sec">
    <h2>Questions before you start</h2>
    <div class="faq">
${mdFaqRows("/", "Frequently asked")}
    </div>
    ${mdFaqBlocks("/", "Frequently asked").tail.map((t) => `<p class="cta-row"><a href="/services">${renderInline(t).replace(/<\/?a[^>]*>/g, "")}</a></p>`).join("\n    ")}
  </section>

  <section class="sec contact">
    <h2>Start with the URL and the question</h2>
    <p>${contact[0]}</p>
    <div class="cta-row"><a class="cta-btn" href="/contact">Request an audit</a> <a class="mail-link" href="mailto:info@turva.dev">info@turva.dev</a></div>
    <p class="muted">${contact[2]}</p>
  </section>
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

function serveServicesHtml(canonicalUrl) {
  const metaBlock = buildMetaBlock("/services", canonicalUrl);
  const jsonLd = buildGuideJsonLd("/services", canonicalUrl) +
    (GUIDE_PAGE_FAQ["/services"] ? "\n" + buildGuidePageFaqJsonLd("/services", canonicalUrl) : "") +
    // The price page carries the priced Service node itself, with the same @id values as the
    // home page, so both documents resolve to one graph and an agent that lands here from
    // search reads machine-readable prices instead of prose and FAQ answers only.
    `\n<script type="application/ld+json">\n{"@context":"https://schema.org","@graph":[\n${SCHEMA_SERVICE}\n]}\n<\/script>`;
  const head = cardPageHead(metaBlock, jsonLd, canonicalUrl);
  const start = mdParas("/services", "How to start", 3);
  const offers = mdOfferCards("/services", "Choose a starting point", { "/shopify-agent-storefront-check": "Explore the Shopify check", "/services#audit": "Explore the audit" });
  const offerParas = mdParas("/services", "Choose a starting point", 1);
  const body = `${head}
${cardPageNav("/services")}
<main id="main">
  ${mdPageStart("/services")}
  <div class="cta"><a class="btn" href="#start">Choose a starting point</a><a class="btn-ghost" href="/samples/audit-report">Read a sample audit report</a></div>
  <section class="sec" id="start"><h2>Choose a starting point</h2>
    <div class="cards">
      ${offers}
    </div>
    <p>${offerParas[0]}</p>
  </section>
  ${mdOpenSec("/services", "Shopify agent storefront check", "shopify")}
  ${mdOpenSec("/services", "Website and API agent-readiness audit", "audit")}
  ${mdOpenSec("/services", "Implementation")}
  ${mdOpenSec("/services", "Ongoing advisory", "advisory")}
  ${mdOpenSec("/services", "Agent operations")}
  ${mdOpenSec("/services", "MCP server design")}
  ${mdOpenSec("/services", "How the method is measured")}
  ${mdFaqSec("/services", "Frequently asked", "questions")}
  <div class="start" id="how-to-start">
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
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

// Defined before CARDPAGE_CSS on purpose: that constant is built at module load and reads this one.
var NAV_MOBILE_CSS = `.turva-nav .nv-mobile{display:none;}
@media (max-width:760px){.turva-nav{flex-wrap:nowrap;justify-content:space-between;position:relative;padding:10px clamp(16px,4vw,24px);}.turva-nav > ul.nv-menu{display:none;}.turva-nav .nv-mobile{display:block;flex:0 0 auto;}.turva-nav .nv-mobile summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;border:1px solid rgba(255,255,255,0.24);border-radius:7px;color:#F2F4F3;font-weight:600;font-size:14px;user-select:none;}.turva-nav .nv-mobile summary::-webkit-details-marker{display:none;}.turva-nav .nv-mobile summary::after{content:"+";font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:16px;line-height:1;}.turva-nav .nv-mobile[open] summary::after{content:"\\2212";}.turva-nav .nv-mobile summary:focus-visible{outline:2px solid #5DF18F;outline-offset:2px;}.turva-nav .nv-mobile .nv-list{position:absolute;left:0;right:0;top:100%;z-index:10;display:flex;flex-direction:column;align-items:stretch;text-align:left;gap:0;background:#0A1316;border-bottom:0.5px solid rgba(255,255,255,0.14);padding:6px 0 10px;box-shadow:0 14px 30px rgba(0,0,0,0.35);}.turva-nav .nv-mobile .nv-list li{margin:0;}.turva-nav .nv-mobile .nv-list a{display:block;box-sizing:border-box;min-height:44px;padding:12px clamp(16px,4vw,24px);font-size:16px;color:#F2F4F3;}.turva-nav .nv-mobile .nv-list a[aria-current]{color:#5DF18F;}}`;
var CARDPAGE_CSS = `html,body{background-color:#0A1316;overflow-wrap:break-word;color:#F2F4F3;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;color-scheme:dark;}
main{max-width:68rem;box-sizing:content-box;margin:0 auto;padding:clamp(36px,5vw,56px) clamp(24px,5vw,72px) 3.5rem;}
main *,main *::before,main *::after{box-sizing:border-box;}
h1{color:#F2F4F3;overflow-wrap:break-word;font-size:clamp(30px,3.4vw,46px);line-height:1.1;letter-spacing:-0.02em;margin:0 0 .9rem;font-weight:700;max-width:24ch;}
.intro{font-size:clamp(17px,1.3vw,19px);line-height:1.6;color:#C9D1CE;margin:0 0 1.1rem;}
main>p{color:#C9D1CE;font-size:17px;line-height:1.6;margin:0 0 1.1rem;}
a{color:#5DF18F;text-decoration:none;}
a:hover{text-decoration:underline;}
a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible{outline:2px solid #5DF18F;outline-offset:2px;}
.eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.75rem;letter-spacing:.09em;text-transform:uppercase;color:#5DF18F;margin:0 0 1rem;}
.meta-line{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.8rem;letter-spacing:.03em;color:#9AA3A0;margin:0 0 1.4rem;overflow-wrap:anywhere;}
.turva-nav{box-sizing:border-box;width:100%;background:#0A1316;display:flex;align-items:center;gap:28px;flex-wrap:wrap;padding:24px clamp(24px,5vw,72px);border-bottom:0.5px solid rgba(255,255,255,0.08);}
.turva-nav *,.turva-nav *::before,.turva-nav *::after{box-sizing:border-box;}
.turva-nav .nv-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.turva-nav .nv-brand svg{display:block;width:36px;height:36px;}
.turva-nav .nv-word{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:21px;letter-spacing:.02em;color:#F2F4F3;}
.turva-nav .nv-word b{color:#5DF18F;}
${NAV_MOBILE_CSS}
.turva-nav .nv-menu{display:flex;flex-wrap:wrap;min-width:0;align-items:center;gap:clamp(18px,2.4vw,38px);list-style:none;margin:0;padding:0;flex:1;}
.turva-nav .nv-menu a{font-size:18px;font-weight:500;color:#9AA3A0;text-decoration:none;}
.turva-nav .nv-menu a:hover{color:#F2F4F3;}
.turva-nav .nv-menu a[aria-current]{color:#F2F4F3;}
@media (max-width:640px){.turva-nav .nv-menu{gap:14px;}.turva-nav .nv-menu a{font-size:15px;}}
.cta{display:flex;flex-wrap:wrap;gap:14px;margin:1.4rem 0 .6rem;}
.btn,.btn-ghost{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:50px;padding:.75rem 1.35rem;border-radius:7px;font-size:15px;font-weight:700;max-width:100%;overflow-wrap:break-word;text-align:center;}
.btn{background:#5DF18F;color:#06100F;transition:background-color .15s ease;}
.btn:hover{background:#7df7a6;text-decoration:none;}
.btn-ghost{color:#F2F4F3;font-weight:600;border:1px solid rgba(255,255,255,0.24);transition:border-color .15s ease,color .15s ease;}
.btn-ghost:hover{border-color:#5DF18F;color:#5DF18F;text-decoration:none;}
.btn:focus-visible,.btn-ghost:focus-visible{outline:2px solid #5DF18F;outline-offset:3px;}
.sec{margin:clamp(36px,5vw,56px) 0 0;padding-top:clamp(24px,3vw,32px);border-top:0.5px solid rgba(255,255,255,0.08);}
.sec>h2,.sec>h3{scroll-margin-top:1rem;}
.sec h2{color:#F2F4F3;font-size:clamp(24px,2.2vw,28px);line-height:1.2;margin:0 0 1rem;font-weight:700;letter-spacing:-0.015em;}
.sec h3{color:#F2F4F3;font-size:clamp(18px,1.6vw,20px);margin:1.5rem 0 .55rem;font-weight:700;}
.sec p{color:#C9D1CE;font-size:17px;line-height:1.6;margin:0 0 1rem;}
.sec ul{list-style:none;margin:0 0 1.1rem;padding:0;}
.sec li{position:relative;padding:0 0 0 1.45rem;margin:0 0 .5rem;color:#C9D1CE;font-size:17px;line-height:1.6;}
.sec li::before{content:"\\203A";position:absolute;left:.45rem;top:0;color:#5DF18F;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
.sec strong{color:#F2F4F3;}
.sec pre{max-width:100%;}
.sec .lbl{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.74rem;font-weight:400;letter-spacing:.08em;text-transform:uppercase;color:#9AA3A0;margin:1.3rem 0 .5rem;}
.sec ul.get li::before{content:"\\2713";left:0;}
.sec ul.nope li{color:#9AA3A0;}
.sec ul.nope li::before{content:"\\00B7";left:.4rem;top:-.05rem;color:#6F7A77;}
.sec .fine,.fine{font-size:.9rem;color:#9AA3A0;margin:0 0 .6rem;}
.price-line{display:flex;flex-wrap:wrap;align-items:baseline;gap:.4rem 1rem;margin:-.4rem 0 1.1rem;}
.price-line .price{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.35rem;font-weight:700;color:#5DF18F;}
.price-line .terms{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;color:#9AA3A0;}
.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(16px,2vw,24px);margin:.6rem 0 1.2rem;}
.cards.three{grid-template-columns:repeat(3,minmax(0,1fr));}
@media (max-width:767px){.cards,.cards.three{grid-template-columns:minmax(0,1fr);}}
.card{display:flex;flex-direction:column;gap:10px;box-sizing:border-box;min-width:0;background:#111F21;border:1px solid #2D3D3D;border-radius:10px;padding:24px;color:#C9D1CE;text-decoration:none;transition:border-color .15s ease;}
a.card:hover{border-color:#5DF18F;text-decoration:none;}
a.card:focus-visible{outline:2px solid #5DF18F;outline-offset:3px;}
.card-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:6px 14px;}
.card h2,.card h3,.card .name{font-size:1.15rem;line-height:1.3;font-weight:700;color:#F2F4F3;margin:0;}
.card .price{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.05rem;font-weight:700;color:#5DF18F;}
.card p{font-size:.97rem;line-height:1.55;color:#C9D1CE;margin:0;}
.card .when{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.76rem;letter-spacing:.03em;color:#9AA3A0;}
.card .go{margin-top:auto;padding-top:6px;font-size:.92rem;font-weight:600;color:#5DF18F;}
.card ul{list-style:none;margin:0;padding:0;}
.card li{position:relative;padding:0 0 0 1.4rem;margin:0 0 .4rem;font-size:.95rem;line-height:1.5;color:#C9D1CE;}
.card li::before{content:"\\203A";position:absolute;left:.4rem;top:0;color:#5DF18F;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
@media (max-width:640px){.card{padding:20px;}}
${SCARD_CSS}
.kvs{display:grid;grid-template-columns:minmax(0,max-content) minmax(0,1fr);gap:.55rem .9rem;align-items:baseline;}
.kv{display:contents;}
.kv .k{color:#9AA3A0;font-size:.9rem;}
.kv .v{color:#F2F4F3;font-weight:600;word-break:break-word;}
a.v{color:#5DF18F;}
@media (max-width:420px){.kvs{grid-template-columns:minmax(0,1fr);gap:.15rem .9rem;}.kv .v{margin-bottom:.55rem;}}
.sigqr{display:grid;grid-template-columns:1fr auto;gap:1.1rem 1.4rem;align-items:center;margin-top:1.1rem;padding-top:1.1rem;border-top:0.5px solid rgba(255,255,255,0.10);}
.sigqr-txt p{color:#C9D1CE;margin:0;font-size:.97rem;}
.sigqr-txt .hint{color:#9AA3A0;font-size:.88rem;margin-top:.35rem;}
.sigqr-plate{display:block;background:#F2F4F3;border-radius:10px;padding:9px;line-height:0;}
.sigqr-plate img{display:block;width:147px;height:147px;}
.sigqr-user{display:block;margin-top:.45rem;text-align:center;font:600 .8rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#9AA3A0;letter-spacing:.01em;}
@media (max-width:560px){.sigqr{grid-template-columns:1fr;justify-items:start;}}
.gv{color:#5DF18F;font-weight:600;}
.scard .sub{color:#9AA3A0;font-size:.95rem;margin:-.4rem 0 .9rem;}
${FAQ_CSS}
.faq{}
.faq .q{font-size:1.05rem;}
.faq p{font-size:1rem;line-height:1.6;}
.dl{display:flex;flex-direction:column;gap:.85rem;}
.dl p{margin:0;color:#C9D1CE;font-size:17px;line-height:1.6;}
.dl .term{color:#F2F4F3;font-weight:700;}
.toc{margin:0 0 1.4rem;padding:.9rem 1.1rem;border:1px solid rgba(255,255,255,0.1);border-radius:10px;}
.toc p{margin:0 0 .4rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:#9AA3A0;}
.toc ul{list-style:none;margin:0;padding:0;columns:2;column-gap:1.4rem;}
.toc li{margin:0 0 .3rem;padding:0;font-size:.95rem;break-inside:avoid;}
.toc li::before{content:none;}
.toc a{color:#C9D1CE;}
.toc a:hover{color:#5DF18F;}
@media (max-width:560px){.toc ul{columns:1;}}
.post{display:flex;flex-direction:column;gap:6px;box-sizing:border-box;min-width:0;border:1px solid #2D3D3D;border-radius:10px;background:#111F21;padding:18px 22px;margin:0 0 .75rem;text-decoration:none;transition:border-color .15s ease;}
.post:hover{border-color:#5DF18F;text-decoration:none;}
.post .pt{display:block;color:#F2F4F3;font-weight:700;font-size:1.1rem;line-height:1.3;letter-spacing:-0.01em;}
.post .pm{display:flex;flex-wrap:wrap;gap:.3rem .8rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.76rem;letter-spacing:.04em;color:#9AA3A0;}
.post .pk{color:#5DF18F;}
.post .ps{color:#C9D1CE;font-size:.95rem;line-height:1.5;}
.feed{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;margin:-.6rem 0 1.4rem;}
.feed a{color:#9AA3A0;}
.feed a:hover{color:#5DF18F;text-decoration:none;}
.start{border-top:0.5px solid rgba(255,255,255,0.1);margin-top:clamp(36px,5vw,56px);padding-top:clamp(24px,3vw,32px);}
.start h2{color:#F2F4F3;font-size:clamp(24px,2.2vw,28px);font-weight:700;letter-spacing:-0.015em;margin:0 0 .9rem;}
.start p{color:#C9D1CE;font-size:17px;line-height:1.6;margin:0 0 1rem;}
.cta-row{margin:1.1rem 0 1.3rem;}
.cta-btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;background:#5DF18F;color:#06100F;font-weight:700;border-radius:7px;padding:.75rem 1.35rem;font-size:15px;}
.cta-btn:hover{background:#7df7a6;text-decoration:none;}
.mail-plain{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.05rem;color:#F2F4F3;overflow-wrap:anywhere;}
.copy-btn{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;margin-left:10px;border:1px solid rgba(255,255,255,0.24);border-radius:7px;background:transparent;color:#F2F4F3;font:600 14px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;cursor:pointer;}
.copy-btn:hover{border-color:#5DF18F;color:#5DF18F;}
.vform{display:flex;flex-wrap:wrap;gap:10px;margin:.6rem 0 .4rem;}
.vform label{flex-basis:100%;font-size:.95rem;color:#F2F4F3;font-weight:600;}
.vform input{flex:1 1 16rem;min-width:0;min-height:50px;background:#07110D;border:1px solid #2D3D3D;border-radius:7px;padding:10px 14px;color:#F2F5F3;font-family:ui-monospace,"Cascadia Mono",Menlo,Consolas,monospace;font-size:16px;}
.vform button{min-height:50px;background:#5DF18F;color:#06100F;border:0;border-radius:7px;padding:10px 22px;font-weight:700;cursor:pointer;font-size:15px;}
@media (max-width:560px){.vform input,.vform button{flex-basis:100%;width:100%;}.cta{flex-direction:column;}.btn,.btn-ghost,.cta-btn{width:100%;}}
.result-sum{display:flex;flex-wrap:wrap;gap:.4rem 1rem;margin:0 0 1rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.85rem;color:#C9D1CE;}
.result-sum b{color:#F2F4F3;}
.chk{display:grid;grid-template-columns:auto minmax(0,1fr);gap:.15rem .7rem;align-items:baseline;margin:0 0 .9rem;padding:0 0 .9rem;border-bottom:0.5px solid rgba(255,255,255,0.08);}
.chk .s{font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:700;font-size:.85rem;letter-spacing:.04em;text-transform:uppercase;}
.chk .l{color:#F2F4F3;font-weight:600;}
.chk .d{grid-column:2;color:#C9D1CE;font-size:.95rem;line-height:1.5;}
.chk.pass .s{color:#5DF18F;}.chk.warn .s{color:#E8C15A;}.chk.fail .s{color:#F17F5D;}.chk.info .s{color:#7FB2D9;}
.tbl{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;margin:1.1rem 0;}
.tbl table{margin:0;min-width:100%;}
.tbl:focus-visible{outline:2px solid #5DF18F;outline-offset:2px;}
@media (max-width:640px){table.stack{display:block;border:0;min-width:0;}table.stack thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}table.stack tbody,table.stack tr{display:block;}table.stack tr{border:1px solid #2D3D3D;border-radius:10px;padding:.7rem .9rem;margin:0 0 .75rem;background:#111F21;}table.stack td{display:block;border:0;padding:.25rem 0;color:#C9D1CE;}table.stack td::before{content:attr(data-label);display:block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.7rem;letter-spacing:.05em;text-transform:uppercase;color:#9AA3A0;margin:0 0 .1rem;}table.stack td:first-child{color:#F2F4F3;font-weight:600;}}
.tbl-list{margin:-.4rem 0 1.2rem;}
.tbl-list summary{cursor:pointer;color:#C9D1CE;font-size:.9rem;padding:.4rem 0;}
.tbl-list summary:hover{color:#5DF18F;}
table.stacked{display:block;border:0;min-width:0;width:100%;}table.stacked thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}table.stacked tbody,table.stacked tr{display:block;}table.stacked tr{border:1px solid #2D3D3D;border-radius:10px;padding:.7rem .9rem;margin:0 0 .75rem;background:#111F21;}table.stacked td{display:block;border:0;padding:.25rem 0;color:#C9D1CE;}table.stacked td::before{content:attr(data-label);display:block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.7rem;letter-spacing:.05em;text-transform:uppercase;color:#9AA3A0;margin:0 0 .1rem;}table.stacked td:first-child{color:#F2F4F3;font-weight:600;}
@media (max-width:360px){main{padding-left:20px;padding-right:20px;}}`;

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

// Mobile navigation (2026-09-06, Tek-355): the same eight links twice, a plain <ul> for wide
// screens and a <details> with a visible Menu button for narrow ones. CSS-only on purpose: the
// site carries exactly one inline script under a hashed CSP, and a menu does not earn a second.
// Every nav on the site is built through this helper so the two forms cannot drift.
function navMenuHtml(lis) {
  return `  <ul class="nv-menu">
${lis}
  </ul>
  <details class="nv-mobile">
    <summary>Menu</summary>
    <ul class="nv-menu nv-list">
${lis}
    </ul>
  </details>`;
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
${navMenuHtml(lis)}
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
// The brief body is plain markdown inside main, with no section wrappers, so the shared
// page template's open-section rules are restated here for bare headings, lists and code.
// Every brief, old or new, is rendered from KV through this shell at request time, so a
// change here reaches every published brief at once (Erik 2026-09-06).
var BRIEF_CSS = `main h1{margin-bottom:1.2rem;max-width:none;}
main h1+p{font-size:clamp(17px,1.3vw,19px);color:#F2F4F3;}
main h2{color:#F2F4F3;font-size:clamp(24px,2.2vw,28px);line-height:1.2;font-weight:700;letter-spacing:-0.015em;margin:clamp(36px,5vw,52px) 0 .9rem;padding-top:clamp(20px,3vw,28px);border-top:0.5px solid rgba(255,255,255,0.08);scroll-margin-top:1rem;}
main h3{color:#F2F4F3;font-size:clamp(18px,1.6vw,20px);font-weight:700;margin:1.6rem 0 .55rem;}
main p{color:#C9D1CE;font-size:17px;line-height:1.6;margin:0 0 1.05rem;}
main p.date{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.85rem;letter-spacing:.03em;color:#9AA3A0;margin:1.6rem 0 0;}
main ul{list-style:none;margin:0 0 1.1rem;padding:0;}
main li{position:relative;padding:0 0 0 1.45rem;margin:0 0 .5rem;color:#C9D1CE;font-size:17px;line-height:1.6;}
main li::before{content:"\\203A";position:absolute;left:.45rem;top:0;color:#5DF18F;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
main strong{color:#F2F4F3;}
main pre{max-width:100%;}
main a{overflow-wrap:anywhere;}`;

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
  ${mdOpenSec("/company", "My background")}
  ${mdOpenSec("/company", "Why this work matters")}
  ${mdOpenSec("/company", "How I work")}
  ${mdKvsSec("/company", "Business details")}
  ${mdOpenSec("/company", "Invoicing")}
  ${mdOpenSec("/company", "Discuss a project", "discuss", '\n    <div class="cta"><a class="btn" href="/contact">Discuss a project</a></div>')}
</main>
${footerHtml()}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

function serveContactHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/contact", canonicalUrl), buildGuideJsonLd("/contact", canonicalUrl), canonicalUrl);
  // The email address is the primary action and also stands as plain text, so it can be
  // copied without opening a mail client; the two prefilled mailto links stay complete in
  // the twin and open a draft only. The QR code is an extra route for Signal, not a step.
  const body = `${head}
${cardPageNav("/contact")}
<main id="main">
  ${mdPageStart("/contact")}
  <div class="cta"><a class="btn" href="mailto:info@turva.dev">Email info@turva.dev</a><a class="btn-ghost" href="https://signal.me/#eu/2qzayURnxbJ8wl7dmQOd5c3sAF7cW8xvDVUrNiG6Cl7rEsXfkSlIsYOS9FSjJixK">Signal @turva.19</a><a class="btn-ghost" href="https://www.linkedin.com/in/erikrekola/">LinkedIn</a></div>
  ${mdOpenSec("/contact", "Email")}
  ${mdOpenSec("/contact", "Other channels", "channels", contactSignalQr(), true)}
  ${mdOpenSec("/contact", "What to include")}
  ${mdOpenSec("/contact", "Response time and languages")}
  ${mdOpenSec("/contact", "Confidentiality")}
  ${mdOpenSec("/contact", "Optional encrypted email", "encrypted-email")}
  ${mdKvsSec("/contact", "Business details")}
</main>
${footerHtml()}
</body>
</html>`;
  return new Response(body, { status: 200, headers: cardPageHeaders(canonicalUrl) });
}

function serveLegalHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/legal", canonicalUrl), buildGuideJsonLd("/legal", canonicalUrl), canonicalUrl);
  const secs = ["Operator", "Engagement terms", "Privacy", "Data rights", "Cookies", "Updates"];
  const toc = `<div class="toc"><p>On this page</p><ul>${secs.map((h) => `<li><a href="#${mdSlug(h)}">${h}</a></li>`).join("")}</ul></div>`;
  const terms = (h) => `<section class="sec" id="${mdSlug(h)}"><h2>${h}</h2>
    ${mdTermsHtml("/legal", h)}
  </section>`;
  const body = `${head}
${cardPageNav("/legal")}
<main id="main">
  ${mdPageStart("/legal")}
  ${toc}
  ${mdOpenSec("/legal", "Operator")}
  ${terms("Engagement terms")}
  ${terms("Privacy")}
  ${mdOpenSec("/legal", "Data rights")}
  ${mdOpenSec("/legal", "Cookies")}
  ${mdOpenSec("/legal", "Updates")}
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
  const mailto = "mailto:info@turva.dev?subject=Shopify%20agent%20storefront%20check&amp;body=Storefront%20URL%3A%20%0A.myshopify.com%20domain%3A%20%0APrimary%20market%3A%20%0AUp%20to%20three%20priority%20products%3A%20%0A";
  const body = `${head}
${cardPageNav("/shopify-agent-storefront-check")}
<main id="main">
  ${mdPageStart("/shopify-agent-storefront-check")}
  <div class="cta"><a class="btn" href="${mailto}">Request a Shopify check</a><a class="btn-ghost" href="/samples/shopify-agent-storefront-check">Read the sample report</a></div>
  ${mdOpenSec("/shopify-agent-storefront-check", "What you will learn")}
  ${mdOpenSec("/shopify-agent-storefront-check", "What you receive")}
  ${mdOpenSec("/shopify-agent-storefront-check", "Fixed scope")}
  ${mdOpenSec("/shopify-agent-storefront-check", "The three surfaces")}
  ${mdOpenSec("/shopify-agent-storefront-check", "Price, kickoff and delivery", "price")}
  ${mdOpenSec("/shopify-agent-storefront-check", "Optional implementation")}
  ${mdOpenSec("/shopify-agent-storefront-check", "Limits and exclusions")}
  ${mdOpenSec("/shopify-agent-storefront-check", "Sample report")}
  ${mdOpenSec("/shopify-agent-storefront-check", "Public preflight evidence")}
  ${mdFaqSec("/shopify-agent-storefront-check", "Frequently asked", "questions")}
  <div class="start" id="how-to-start">
    <h2>How to start</h2>
    <p>${start[0]}</p>
    <p>${start[1]}</p>
    <div class="cta-row"><a class="cta-btn" href="${mailto}">Request a Shopify check</a></div>
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
  ${mdOpenSec("/badge", "Eligibility")}
  ${mdOpenSec("/badge", "What it is, and what it is not", "not-a-certification")}
  <section class="sec" id="use-the-badge"><h2>Use the badge</h2>
    <p><img src="/badge.svg" alt="agent-ready. Criteria at turva.dev/badge" width="216" height="36"></p>
    ${mdSecBodyHtml("/badge", "Use the badge")}
  </section>
  ${mdOpenSec("/badge", "If your site is not there yet")}
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
  <div class="cards three">
      ${mdToolCards("/tools", ["llms.txt validator", "Public MCP server", "Agent-ready badge"])}
  </div>
  ${mdOpenSec("/tools", "Technical details")}
  ${mdOpenSec("/tools", "Need a broader review?", "services")}
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
// exactly what they were. v2 was two weeks old in August 2026, so a warn here would have turned files
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
  // The result names each check with its status as a word (colour only accompanies it), and
  // opens with the target and the counts. No total and no percentage on purpose: the twin
  // says why. Error wording is the shared form from the 2026-09-06 page instruction, with
  // the measured reason appended so nothing is hidden.
  const word = { pass: "Pass", warn: "Warning", fail: "Fail", info: "Information" };
  let resultHtml = "";
  if (error) {
    const invalid = error.startsWith("That does not look like");
    resultHtml = `<section class="sec" id="result"><h2>Result</h2><p class="verr">${invalid ? "Enter a domain or a website URL." : "The check could not be completed. Review the reported error and try again."} ${escapeHtml(error)}</p></section>`;
  } else if (result) {
    const counts = ["pass", "warn", "fail", "info"].map((k) => `<span><b>${word[k]}</b> ${result.checks.filter((c) => c.status === k).length}</span>`).join("");
    const rows = result.checks.map((c) =>
      `<div class="chk ${c.status}"><span class="s">${word[c.status] || escapeHtml(c.status)}</span><span class="l">${escapeHtml(c.label)}</span><span class="d">${escapeHtml(c.detail)}</span></div>`
    ).join("\n    ");
    resultHtml = `<section class="sec" id="result"><h2>Result: ${escapeHtml(summarizeChecks(result.checks))}</h2>
    <p class="aview-cmd">${escapeHtml(result.target)}</p>
    <p class="result-sum">${counts}</p>
    ${rows}
    <p class="fine">The two v2 discovery checks are informational and do not change the structural result.</p>
    <p class="fine">A structure check against the llms.txt format, not an agent-readiness score.</p>
  </section>`;
  }
  const body = `${head}
${cardPageNav("/llms-txt-validator")}
<main id="main">
  ${mdPageStart("/llms-txt-validator")}
  <form class="vform" method="get" action="/llms-txt-validator">
    <label for="vurl">Domain to check</label>
    <input type="text" id="vurl" name="url" placeholder="example.com" value="${escapeHtml(raw)}" aria-label="Domain to check" required>
    <button type="submit">Check llms.txt</button>
  </form>
  <p class="fine"><a href="/llms-txt-validator?url=turva.dev">Try it with turva.dev</a></p>
  ${resultHtml}
  <section class="sec" id="how-to-use-it"><h2>How to use it</h2><ul>
    <li>In a browser: enter a domain in the field above.</li>
    <li>Without typing anything: <a href="/llms-txt-validator?url=turva.dev">run the checks against this site's own file</a>.</li>
    <li>As an agent: <code>GET https://turva.dev/llms-txt-validator?url=example.com</code> with <code>Accept: application/json</code>.</li>
  </ul></section>
  ${mdOpenSec("/llms-txt-validator", "What is checked")}
  ${mdOpenSec("/llms-txt-validator", "What this result means")}
  ${mdOpenSec("/llms-txt-validator", "Use in an agent or CI")}
  ${mdFaqSec("/llms-txt-validator", "Frequently asked", "questions")}
  ${mdOpenSec("/llms-txt-validator", "Related", "related-guides")}
</main>
${footerHtml()}
</body>
</html>`;
  const headers = cardPageHeaders(canonicalUrl);
  if (raw) headers.set("cache-control", "no-store");
  return new Response(body, { status: 200, headers });
}

function mdGuideGroupSec(path, h) {
  const blocks = mdSection(path, h).split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const lead = blocks.filter((b) => !b.startsWith("- ")).map((b) => `<p>${renderInline(b)}</p>`).join("");
  // One card per guide: the title from the twin's link, the one-sentence description
  // from META_BY_PATH, so the index says what the guide's own head says.
  const items = mdLists(path, h)[0].map((x) => {
    const m = x.match(/^<a href="(?:https:\/\/turva\.dev)?(\/guides\/[a-z0-9-]+)">(.+?)<\/a>$/);
    if (!m) throw new Error("guide list item does not parse: " + x.slice(0, 60));
    const d = (META_BY_PATH[m[1]] || {}).description || "";
    return `<a class="card" href="${m[1]}"><span class="name">${m[2]}</span>${d ? `<p>${escapeHtml(d)}</p>` : ""}</a>`;
  }).join("\n      ");
  return `<section class="sec" id="${mdSlug(h)}"><h2>${renderInline(h)}</h2>${lead}
  <div class="cards">
    ${items}
  </div>
</section>`;
}

function serveGuidesHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/guides", canonicalUrl), buildGuideJsonLd("/guides", canonicalUrl) + "\n" + buildGuidesFaqJsonLd(), canonicalUrl);
  const body = `${head}
${cardPageNav("/guides")}
<main id="main">
  ${mdPageStart("/guides")}
  ${mdGuideGroupSec("/guides", "Start here")}
  ${mdGuideGroupSec("/guides", "Audit, visibility and priorities")}
  ${mdGuideGroupSec("/guides", "Content and crawl access")}
  ${mdGuideGroupSec("/guides", "Discovery and authentication")}
  ${mdGuideGroupSec("/guides", "Commerce and agent operations")}
  ${mdFaqSec("/guides", "Frequently asked", "questions")}
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
  // Since v3.133.0 (Tek-358) each card shows the title, the date, the kind of article and
  // its one-sentence description, all from META_BY_PATH, so the index and the page agree.
  return posts.map(({ path, meta }) =>
    `  <a class="post" href="${path}"><span class="pt">${escapeHtml((meta.title || "").replace(/ [|\u00B7] turva\.dev$/, ""))}</span><span class="pm"><span class="pd">${meta.date}</span>${meta.kind ? `<span class="pk">${escapeHtml(meta.kind)}</span>` : ""}</span>${meta.description ? `<span class="ps">${escapeHtml(meta.description)}</span>` : ""}</a>`
  ).join("\n");
}

function serveBlogHtml(canonicalUrl) {
  const head = cardPageHead(buildMetaBlock("/blog", canonicalUrl), buildGuideJsonLd("/blog", canonicalUrl), canonicalUrl);
  const body = `${head}
${cardPageNav("/blog")}
<main id="main">
  ${mdPageStart("/blog")}
  <p class="feed"><a href="/blog/feed.xml">RSS feed</a></p>
  ${mdOpenSec("/blog", "Start with the research", "research")}
  <section class="sec" id="all-posts"><h2>Browse all articles</h2>
    <p class="fine">Research &middot; Protocol notes &middot; Build notes</p>
${blogPostLinks()}
  </section>
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
  shopify: { item: "shopify", name: "Shopify agent storefront check", amount: 99900, description: "Fixed scope, four written deliverables within 48 hours of the agreed written kickoff and a retest within 14 days. One live Shopify store across browser WebMCP, remote MCP and Catalog and Agentic channels." },
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
