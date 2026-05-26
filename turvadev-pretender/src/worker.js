var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker.js
var BOT_AGENTS = [
 "googlebot",
 "adsbot-google",
 "apis-google",
 "mediapartners-google",
 "google-safety",
 "feedfetcher-google",
 "googleproducer",
 "google-site-verification",
 "bingbot",
 "yandexbot",
 "yabrowser",
 "yahoo",
 "baiduspider",
 "naver",
 "seznambot",
 "sznprohlizec",
 "qwantbot",
 "ecosia",
 "duckduckbot",
 "duckassistbot",
 "applebot",
 "facebookexternalhit",
 "facebookcatalog",
 "facebookbot",
 "meta-externalagent",
 "twitterbot",
 "linkedinbot",
 "whatsapp",
 "slackbot",
 "pinterest",
 "pinterestbot",
 "tiktok",
 "tiktokspider",
 "bytespider",
 "discordbot",
 "semrushbot",
 "ahrefsbot",
 "chrome-lighthouse",
 "screaming-frog",
 "oncrawlbot",
 "botifybot",
 "deepcrawl",
 "lumar",
 "rogerbot",
 "dotbot",
 "gptbot",
 "chatgpt",
 "oai-searchbot",
 "chatgpt-user",
 "claudebot",
 "google-extended",
 "perplexitybot",
 "perplexity-user",
 "youbot",
 "amazonbot",
 "anthropic-ai",
 "claude-web",
 "claude-user",
 "ccbot",
 "mistralai-user",
 "embedly",
 "quora link preview",
 "showyoubot",
 "outbrain",
 "pinterest/0.",
 "developers.google.com/+/web/snippet",
 "vkshare",
 "w3c_validator",
 "redditbot",
 "flipboard",
 "tumblr",
 "bitlybot",
 "skypeuripreview",
 "nuzzel",
 "google page speed",
 "qwantify",
 "bitrix link preview",
 "xing-contenttabreceiver",
 "google-inspectiontool",
 "telegrambot",
 "integration-test"
];
var IGNORE_EXTENSIONS = [
 ".js",
 ".css",
 ".xml",
 ".less",
 ".png",
 ".jpg",
 ".jpeg",
 ".gif",
 ".pdf",
 ".doc",
 ".txt",
 ".ico",
 ".rss",
 ".zip",
 ".mp3",
 ".rar",
 ".exe",
 ".wmv",
 ".avi",
 ".ppt",
 ".mpg",
 ".mpeg",
 ".tif",
 ".wav",
 ".mov",
 ".psd",
 ".ai",
 ".xls",
 ".mp4",
 ".m4a",
 ".swf",
 ".dat",
 ".dmg",
 ".iso",
 ".flv",
 ".m4v",
 ".torrent",
 ".woff",
 ".ttf",
 ".svg",
 ".webmanifest",
 ".json",
 ".md"
];
var LEGACY_REDIRECTS = {
 "/paketit": "/fi/paketit/",
 "/paketit/": "/fi/paketit/",
 "/yritys": "/fi/yritys/",
 "/yritys/": "/fi/yritys/",
 "/yritystiedot": "/fi/yritys/",
 "/yritystiedot/": "/fi/yritys/",
 "/yhteystiedot": "/fi/yhteystiedot/",
 "/yhteystiedot/": "/fi/yhteystiedot/",
 "/juridiikka": "/fi/juridiikka/",
 "/juridiikka/": "/fi/juridiikka/",
 "/tietosuoja": "/fi/juridiikka/",
 "/tietosuoja/": "/fi/juridiikka/",
 "/packages": "/en/packages/",
 "/packages/": "/en/packages/",
 "/company": "/en/company/",
 "/company/": "/en/company/",
 "/contact": "/en/contact/",
 "/contact/": "/en/contact/",
 "/legal": "/en/legal/",
 "/legal/": "/en/legal/",
 "/privacy": "/en/legal/",
 "/privacy/": "/en/legal/",
 "/pricing": "/en/packages/",
 "/pricing/": "/en/packages/",
 "/palvelut": "/fi/paketit/",
 "/palvelut/": "/fi/paketit/",
 "/services": "/en/packages/",
 "/services/": "/en/packages/",
 "/audit": "/en/packages/",
 "/audit/": "/en/packages/",
 "/advisory": "/en/packages/",
 "/advisory/": "/en/packages/"
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
 "accelerometer=()",
 "ambient-light-sensor=()",
 "autoplay=()",
 "battery=()",
 "camera=()",
 "display-capture=()",
 "document-domain=()",
 "encrypted-media=()",
 "fullscreen=(self)",
 "geolocation=()",
 "gyroscope=()",
 "magnetometer=()",
 "microphone=()",
 "midi=()",
 "payment=()",
 "picture-in-picture=()",
 "publickey-credentials-get=()",
 "screen-wake-lock=()",
 "sync-xhr=()",
 "usb=()",
 "web-share=()",
 "xr-spatial-tracking=()"
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
__name(applySecurityHeaders, "applySecurityHeaders");
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
> Two independent scanners measure the site or API, written report
> names the prioritized fixes, the next scan verifies the result.
> Based in Tampere, Finland. Async-only engagement.
> Languages: English (default), Finnish.

## Services (en)
- [Services](https://turva.dev/en/packages/)
- [Company](https://turva.dev/en/company/)
- [Contact](https://turva.dev/en/contact/)
- [Legal](https://turva.dev/en/legal/)

## Palvelut (fi)
- [Palvelut](https://turva.dev/fi/paketit/)
- [Yritys](https://turva.dev/fi/yritys/)
- [Yhteystiedot](https://turva.dev/fi/yhteystiedot/)
- [Juridiikka](https://turva.dev/fi/juridiikka/)

## Indicative pricing (EUR, starting from, VAT not included)
- Audit: from 4500 EUR (fixed scope, 2-3 weeks)
- Advisory: from 1800 EUR / month (retainer)
- Implementation: from 1500 EUR (per task)
- MCP server design: from 3500 EUR
- Internal workshops: from 1200 EUR

Final price is confirmed in writing after scope is agreed.

## Business details
- Name: turva.dev
- Business ID (Finland): 3600281-7
- Location: Tampere 33100, Finland
- YTJ: https://tietopalvelu.ytj.fi/yritys/3600281-7
- LinkedIn: https://www.linkedin.com/in/erikrekola/

## Engagement model
- Async-only. No calls, no calendar links.
- First reply in writing within one business day.
- Email for longer messages, Signal for short questions.
- Production credentials are not requested.
- Write access to repositories is not taken by default.

## Agent endpoints
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
var PAGE_MARKDOWN = {
 "/en/": `# Agent Readiness Audits & Advisory

Practical audits and clear advice to help product teams ship
agent-ready features. Based in Tampere, Finland. Async-only
engagement. Languages: English (default), Finnish.

## How I work

The service is backed by a registered company whose information is
publicly verifiable. See https://tietopalvelu.ytj.fi/yritys/3600281-7

The process has three stages and no surprises.

First, measurement. Two independent agent-readiness scanners read
the current state of the site or API and produce a numeric baseline
plus a categorized list of where points are missing.

Then a written report. Three to ten priority fixes in order of
impact, with technical reasoning written so the reader does not need
an agent-readiness background to follow it.

Then the fixes. I implement them, or your engineering team does the
work with the report as the spec. Both routes are supported and the
choice is yours.

All communication runs async. No calls and no calendar links. Live
meetings are not part of how this work is done. Short questions go
through Signal, longer documents through email and CryptPad.
Everything stays in writing, which means the work and the trail are
auditable end-to-end.

Production credentials are not requested. Write access to
repositories is not taken by default. Read access is enough for the
audit, and write access is scoped per task if implementation is
purchased separately.

The result shows up in scanner numbers. That is the contract. The
next scan reads higher than the previous one, in the categories the
report named, by the dates the report named.

## Services and indicative pricing

Prices below are starting points (EUR, VAT not included). Final
price is confirmed in writing after scope is agreed.

- Audit. From 4500 EUR. Fixed scope, two to three weeks. Two
 independent scanners run against the site or API. Written report
 with a prioritized fix list. You receive a measured baseline and a
 clear "do this first" plan.
- Advisory. From 1800 EUR / month. Monthly retainer, async-only.
 Ongoing review as the site, API or product evolves. Each scanner
 cycle reads higher than the last, or the report explains why a
 tradeoff was kept on purpose.
- Implementation. From 1500 EUR per task. Worker-level changes,
 well-known manifests, MCP server work, JSON-LD and Schema fixes.
 The improvement is verifiable against the audit baseline in the
 next scan.
- MCP server design. From 3500 EUR. Read-only discovery tools and
 streamable HTTP transport. No auth surface and no logging by
 default. The endpoint stays readable for agents and does not turn
 into an abuse vector.
- Internal workshops. From 1200 EUR. Async-first. Recorded session
 or written guide. Topics include how scanners read your site, what
 x402 and AP2 actually require in practice, and how to keep
 agent-readiness intact after the audit period ends.

## Who I am

The work is done by one person under a registered company. My
background is engineering: measurement, testing, and reducing things
to what actually matters. I have worked in international companies
for years, moved from general security work into agent-readiness,
and kept only the tools and methods that hold up in daily client
work.

The reason this service exists is narrow on purpose. Agent-readiness
is a measurable property of a site, an API, or a product surface.
Either the scanners read it higher next week than this week, or they
do not. That is the question I answer.

## Contact

Written contact only. Email for longer messages, Signal for short
questions. The first reply is in writing within one business day.
No calls and no calendar links at any stage of the engagement.

- Email: <mailto:info@turva.dev>
- Signal: @turva.19
- LinkedIn: https://www.linkedin.com/in/erikrekola/

## Business details
- Business ID: 3600281-7
- Register: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Location: Tampere 33100, Finland

## More
- [Services](https://turva.dev/en/packages/)
- [Company](https://turva.dev/en/company/)
- [Contact](https://turva.dev/en/contact/)
- [Legal](https://turva.dev/en/legal/)
`,
 "/en/packages/": `# Services

Agent-readiness audits, advisory, and targeted implementation work.
Async-only engagement. Each deliverable is verifiable against
scanner output.

Indicative starting prices in EUR (VAT not included). Final price is
confirmed in writing after scope is agreed.

## Audit, from 4500 EUR

Fixed scope, two to three weeks. Two independent agent-readiness
scanners run against the site or API. The result is a measured
baseline and a written report with a prioritized fix list.

You receive:
- Baseline scan output from two scanners, screenshots with
 timestamps
- A report of three to ten priority fixes in order of impact
- Technical reasoning for each fix, written so a non-specialist can
 follow it
- A clear "do this first" plan

## Advisory, from 1800 EUR / month

Monthly retainer, async-only. Ongoing review as the site, API or
product evolves. Each scanner cycle reads higher than the last, or
the report explains why a tradeoff was kept on purpose.

Suitable for product teams shipping continuously, where every
release can move the agent-readiness baseline up or down and someone
needs to keep the number trending in the right direction.

## Implementation, from 1500 EUR per task

The audit report is the spec. The work is done in your codebase or
your edge layer:
- Worker-level changes (Cloudflare Workers, edge functions)
- Well-known manifests (api-catalog, openapi, mcp/server-card,
 agent-skills, ap2, acp, x402-mesh, oauth-protected-resource,
 oauth-authorization-server)
- JSON-LD and Schema.org corrections
- robots.txt, llms.txt, ai.txt, sitemap and hreflang alignment

Every change is verifiable against the audit baseline in the next
scan.

## MCP server design, from 3500 EUR

Read-only discovery tools and streamable HTTP transport. No auth
surface and no logging by default. The endpoint stays readable for
agents and does not turn into an abuse vector.

## Internal workshops, from 1200 EUR

Async-first. Recorded session or written guide. Topics:
- How agent-readiness scanners read your site
- What x402 and AP2 actually require in practice
- How to keep agent-readiness intact after the audit period ends
- MCP design patterns for read-only product surfaces

## Pricing notes

All prices above are starting points. Audit has a fixed price once
scope is confirmed. Advisory is a monthly retainer. Implementation
and workshops are quoted against scope.

Contact for a quote:
- <mailto:info@turva.dev>
- Signal @turva.19

## Engagement principles
- Async-only. No calls, no calendar links.
- First reply in writing within one business day.
- Production credentials are not requested.
- Write access to repositories is not taken by default.
- Results are measured against public scanner output.
`,
 "/en/company/": `# Company

turva.dev is a sole proprietorship run by Erik Rekola, providing
agent-readiness audits and advisory. Based in Tampere, serving
clients remotely worldwide, in English and Finnish.

## Background

The work is done by one person under a registered company. The
background is engineering: measurement, testing, and reducing things
to what actually matters.
- Years as an engineer in international companies (UPM, Franke,
 Thermo Fisher Scientific, ASM)
- Mechanical Engineering, JAMK University of Applied Sciences
- Electricity & Automation Technology, technical college
- Strong background in quality assurance, processes, and the design
 of technical systems

## Why this service exists

The reason this service exists is narrow on purpose. Agent-readiness
is a measurable property of a site, an API, or a product surface.
Either the scanners read it higher next week than this week, or they
do not. That is the question this service answers.

Most websites and APIs were built before AI agents were a meaningful
class of clients. The protocols (MCP, AP2, ACP, x402, well-known
manifests, structured discovery) exist, but few sites implement them
correctly. The result is a measurable gap between what an agent can
read and what a human can read.

This service closes that gap on a per-project basis, with two
independent scanners as the referee.

## Operating principles
- Async-only engagement. No calls, no calendar links.
- Production credentials are not requested.
- Write access is scoped per task and only if implementation is
 purchased.
- Every claim is verifiable against public scanner output.
- The skill stays with the client team after the engagement ends.

## Business details
- Name: turva.dev
- Owner: Erik Rekola (sole proprietor)
- Business ID: 3600281-7
- Register: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Location: Tampere 33100, Finland
- Languages: English, Finnish
- LinkedIn: https://www.linkedin.com/in/erikrekola/
`,
 "/en/contact/": `# Contact

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
- Languages preferred for the deliverable (English, Finnish)

If you do not have scanner results yet, that is fine. the audit
starts with running them.

## Geographic service area

Based in Tampere (postal code 33100, Finland). Service delivered
remotely worldwide. All work is asynchronous and written.

## Business details
- Business ID: 3600281-7
- Register: https://tietopalvelu.ytj.fi/yritys/3600281-7
`,
 "/en/legal/": `# Legal and privacy

## Controller
turva.dev (Erik Rekola)
Business ID 3600281-7
Privacy contact: <mailto:info@turva.dev>

## Processing principles
- **Data minimization**. only data required for service delivery is
 collected
- **Limited retention**. client data is deleted within a reasonable
 time after the engagement ends
- **No third parties**. client data is not sold or transferred for
 marketing
- **Production credentials are not requested**. a core operational
 principle
- **Write access scoped per task**. only if implementation is
 purchased

## What data is collected
- Contact form and email content
- Name and email address for maintaining the client relationship
- Billing details to the extent required by Finnish accounting law
- Audit scope details and scanner output for the engaged client

## Your GDPR rights
- Right to be informed about what data is held
- Right to rectification
- Right to erasure (right to be forgotten)
- Right to restrict or object to processing
- Right to data portability
- Right to lodge a complaint with the Finnish Data Protection
 Ombudsman (tietosuoja.fi)

## Cookies
The site uses only technically necessary cookies. No tracking, no
advertising, no third-party analytics.

## Contact
For privacy questions: <mailto:info@turva.dev>
`,
 "/fi/": `# Agenttivalmius-auditit ja advisory

Käytännönläheisiä auditteja ja selkeää ohjausta jolla product-tiimit
saavat agenttivalmiit ominaisuudet maaliin. Toimipaikka Tampere.
Async-only-toimeksiannot. Kielet: englanti (oletus), suomi.

## Miten työskentelen

Palvelu pyörii rekisteröidyn yrityksen alla, jonka tiedot ovat
julkisesti tarkistettavissa: https://tietopalvelu.ytj.fi/yritys/3600281-7

Prosessissa on kolme vaihetta eikä yllätyksiä.

Ensin mittaus. Kaksi riippumatonta agenttivalmiusskanneria käy
sivun tai rajapinnan läpi ja antaa numeerisen lähtötason sekä
kategorioittain listan siitä missä pisteet jäävät puuttumaan.

Sitten kirjallinen raportti. Kolmesta kymmeneen korjausta
tärkeysjärjestyksessä, tekninen perustelu kirjoitettuna niin että
lukijan ei tarvitse olla agenttivalmiuden asiantuntija
ymmärtääkseen sen.

Sitten korjaukset. Joko minä toteutan ne tai teidän
kehitystiiminne tekee työn raportti speksinä. Molemmat reitit
toimivat ja valinta on teidän.

Kaikki kommunikaatio kulkee asynkronisesti. Ei puheluita eikä
kalenterilinkkejä. Live-tapaamiset eivät kuulu tähän tapaan tehdä
työtä. Lyhyet kysymykset Signalissa, pidemmät dokumentit
sähköpostilla ja CryptPadissa. Kaikki jää kirjalliseksi eli työ ja
sen jälki ovat tarkistettavissa loppuun asti.

Tuotantotunnuksia ei pyydetä. Kirjoitusoikeuksia repoihin ei oteta
oletuksena. Auditille riittää lukuoikeus, ja kirjoitusoikeudet
skoupataan tehtäväkohtaisesti jos toteutus tilataan erikseen.

Tulos näkyy skannereiden numeroissa. Se on lupaus. Seuraava
skannaus lukee korkeammalla kuin edellinen, niissä kategorioissa
jotka raportti nimesi, niinä päivinä jotka raportti nimesi.

## Palvelut ja indikatiivinen hinnoittelu

Hinnat alla ovat aloitustasoja (EUR, ALV ei sisälly). Lopullinen
hinta vahvistetaan kirjallisesti kun skooppi on sovittu.

- Audit. Alkaen 4500 EUR. Kiinteä skooppi, 2-3 viikkoa. Kaksi
 riippumatonta skanneria ajetaan sivua tai rajapintaa vasten.
 Kirjallinen raportti ja priorisoitu korjauslista. Lopputuloksena
 mitattu lähtötaso ja selkeä "tee ensin tämä" -suunnitelma.
- Advisory. Alkaen 1800 EUR / kk. Kuukausiretainer, async-only.
 Jatkuva seuranta kun sivu, rajapinta tai tuote kehittyy. Jokainen
 skannerikierros lukee korkeammalla kuin edellinen, tai raportti
 perustelee miksi joku kompromissi pidetään tietoisesti.
- Toteutus. Alkaen 1500 EUR per tehtävä. Worker-tason muutokset,
 well-known-manifestit, MCP-server-työ, JSON-LD ja
 Schema-korjaukset. Parannus on todennettavissa auditin lähtötasoon
 nähden seuraavassa skannauksessa.
- MCP-server-suunnittelu. Alkaen 3500 EUR. Read-only discovery
 -toolit ja streamable HTTP -kuljetus. Ei auth-pintaa eikä
 loggausta oletuksena. Endpoint pysyy agenttien luettavissa eikä
 muutu väärinkäytön vektoriksi.
- Sisäiset workshopit. Alkaen 1200 EUR. Async-first. Nauhoitettu
 sessio tai kirjallinen opas. Aiheina esimerkiksi miten skannerit
 lukevat sivunne, mitä x402 ja AP2 oikeasti edellyttävät
 käytännössä, ja miten agenttivalmius pidetään kasassa auditin
 jälkeenkin.

## Kuka olen

Työn tekee yksi henkilö rekisteröidyn yrityksen alla. Taustani on
insinöörityö: mittaaminen, testaaminen ja sen karsiminen mikä ei
oikeasti merkitse. Olen tehnyt vuosia kansainvälisissä yrityksissä,
siirtynyt yleisestä tietoturvatyöstä agenttivalmiuteen ja pitänyt
työkalupakissa vain ne menetelmät jotka pitävät päivittäisessä
asiakastyössä.

Palvelu on tarkoituksella kapeasti rajattu. Agenttivalmius on
mitattava ominaisuus sivulla, rajapinnalla tai tuotepinnalla. Joko
skannerit lukevat sen ensi viikolla korkeammalle kuin tällä
viikolla tai eivät. Sen kysymyksen tähän vastataan.

## Yhteys

Yhteydenotot kirjallisesti. Sähköposti pidempiin viesteihin,
Signal lyhyisiin kysymyksiin. Ensimmäinen vastaus kirjallisena
yhden työpäivän sisällä. Ei puheluita eikä kalenterilinkkejä
missään vaiheessa toimeksiantoa.

- Sähköposti: <mailto:info@turva.dev>
- Signal: @turva.19
- LinkedIn: https://www.linkedin.com/in/erikrekola/

## Yritystiedot
- Y-tunnus: 3600281-7
- YTJ: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Sijainti: Tampere 33100, Suomi

## Lisää
- [Palvelut](https://turva.dev/fi/paketit/)
- [Yritys](https://turva.dev/fi/yritys/)
- [Yhteystiedot](https://turva.dev/fi/yhteystiedot/)
- [Juridiikka](https://turva.dev/fi/juridiikka/)
`,
 "/fi/paketit/": `# Palvelut

Agenttivalmius-auditit, advisory ja kohdistetut toteutustyöt.
Async-only-toimeksiannot. Jokainen toimitus on todennettavissa
skannerin tulosta vasten.

Indikatiiviset aloitushinnat EUR (ALV ei sisälly). Lopullinen hinta
vahvistetaan kirjallisesti kun skooppi on sovittu.

## Audit, alkaen 4500 EUR

Kiinteä skooppi, 2-3 viikkoa. Kaksi riippumatonta
agenttivalmiusskanneria ajetaan sivua tai rajapintaa vasten. Tulos
on mitattu lähtötaso ja kirjallinen raportti priorisoidulla
korjauslistalla.

Saat:
- Lähtötason skannaustulokset kahdelta skannerilta,
 ruutukaappaukset aikaleimoilla
- Raportin kolmesta kymmeneen korjauksesta tärkeysjärjestyksessä
- Teknisen perustelun jokaiselle korjaukselle, kirjoitettuna niin
 että ei-asiantuntija pysyy mukana
- Selkeän "tee ensin tämä" -suunnitelman

## Advisory, alkaen 1800 EUR / kk

Kuukausiretainer, async-only. Jatkuva seuranta kun sivu, rajapinta
tai tuote kehittyy. Jokainen skannerikierros lukee korkeammalla kuin
edellinen, tai raportti perustelee miksi joku kompromissi pidetään
tietoisesti.

Sopii product-tiimeille jotka julkaisevat jatkuvasti, joissa
jokainen release voi liikuttaa agenttivalmiuden lähtötasoa
suuntaan tai toiseen ja jonkun pitää pitää numero kallistumassa
oikeaan suuntaan.

## Toteutus, alkaen 1500 EUR per tehtävä

Auditin raportti on speksi. Työ tehdään teidän koodissanne tai
edge-kerroksessanne:
- Worker-tason muutokset (Cloudflare Workers, edge-funktiot)
- Well-known-manifestit (api-catalog, openapi, mcp/server-card,
 agent-skills, ap2, acp, x402-mesh, oauth-protected-resource,
 oauth-authorization-server)
- JSON-LD ja Schema.org -korjaukset
- robots.txt, llms.txt, ai.txt, sitemap ja hreflang -linjaus

Jokainen muutos on todennettavissa auditin lähtötasoon nähden
seuraavassa skannauksessa.

## MCP-server-suunnittelu, alkaen 3500 EUR

Read-only discovery -toolit ja streamable HTTP -kuljetus. Ei
auth-pintaa eikä loggausta oletuksena. Endpoint pysyy agenttien
luettavissa eikä muutu väärinkäytön vektoriksi.

## Sisäiset workshopit, alkaen 1200 EUR

Async-first. Nauhoitettu sessio tai kirjallinen opas. Aiheet:
- Miten agenttivalmiusskannerit lukevat sivunne
- Mitä x402 ja AP2 oikeasti edellyttävät käytännössä
- Miten agenttivalmius pidetään kasassa auditin jälkeenkin
- MCP-suunnitteluperiaatteet read-only-tuotepinnoille

## Hinnoittelumerkinnät

Kaikki hinnat ovat aloitustasoja. Auditilla on kiinteä hinta kun
skooppi on vahvistettu. Advisory on kuukausiretainer. Toteutukset ja
workshopit hinnoitellaan skooppia vasten.

Tarjouspyyntö:
- <mailto:info@turva.dev>
- Signal @turva.19

## Toimeksiannon periaatteet
- Async-only. Ei puheluita, ei kalenterilinkkejä.
- Ensimmäinen vastaus kirjallisena yhden työpäivän sisällä.
- Tuotantotunnuksia ei pyydetä.
- Kirjoitusoikeuksia repoihin ei oteta oletuksena.
- Tulokset mitataan julkista skannaustulosta vasten.
`,
 "/fi/yritys/": `# Yritys

turva.dev on Erik Rekolan yksinyrittäjänä pyörittämä yritys, joka
tarjoaa agenttivalmius-auditeja ja advisorya. Toimipaikka Tampere,
palvelu etänä maailmanlaajuisesti, englanniksi ja suomeksi.

## Tausta

Työn tekee yksi henkilö rekisteröidyn yrityksen alla. Tausta on
insinöörityö: mittaaminen, testaaminen ja sen karsiminen mikä ei
oikeasti merkitse.
- Vuosia insinöörinä kansainvälisissä yrityksissä (UPM, Franke,
 Thermo Fisher Scientific, ASM)
- Mechanical Engineering, JAMK
- Electricity & Automation Technology, technical college
- Vahva tausta laadunvarmistuksessa, prosesseissa ja teknisten
 järjestelmien suunnittelussa

## Miksi tämä palvelu on olemassa

Palvelu on tarkoituksella kapeasti rajattu. Agenttivalmius on
mitattava ominaisuus sivulla, rajapinnalla tai tuotepinnalla. Joko
skannerit lukevat sen ensi viikolla korkeammalle kuin tällä
viikolla tai eivät. Sen kysymyksen palvelu vastaa.

Useimmat sivustot ja rajapinnat on rakennettu ennen kuin AI-agentit
olivat merkittävä asiakaskunta. Protokollat (MCP, AP2, ACP, x402,
well-known-manifestit, strukturoitu discovery) ovat olemassa, mutta
harva sivu toteuttaa ne oikein. Lopputuloksena on mitattava ero
sen välillä mitä agentti voi lukea ja mitä ihminen voi lukea.

Tämä palvelu sulkee sen eron projektikohtaisesti, kahden
riippumattoman skannerin toimiessa erotuomarina.

## Toimintaperiaatteet
- Async-only-toimeksiannot. Ei puheluita, ei kalenterilinkkejä.
- Tuotantotunnuksia ei pyydetä.
- Kirjoitusoikeudet skoupataan tehtäväkohtaisesti ja vain jos
 toteutus on tilattu.
- Jokainen väite on todennettavissa julkista skannaustulosta vasten.
- Osaaminen jää asiakastiimille toimeksiannon päätyttyä.

## Yritystiedot
- Nimi: turva.dev
- Omistaja: Erik Rekola (yksityinen elinkeinonharjoittaja)
- Y-tunnus: 3600281-7
- YTJ: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Sijainti: Tampere 33100, Suomi
- Kielet: englanti, suomi
- LinkedIn: https://www.linkedin.com/in/erikrekola/
`,
 "/fi/yhteystiedot/": `# Yhteystiedot

Yhteydenotot kirjallisesti. Sähköposti pidempiin viesteihin,
Signal lyhyisiin kysymyksiin. Ensimmäinen vastaus kirjallisena
yhden työpäivän sisällä. Ei puheluita eikä kalenterilinkkejä
missään vaiheessa toimeksiantoa.

## Kanavat
- **Sähköposti:** <mailto:info@turva.dev>
- **Signal:** @turva.19
- **LinkedIn:** https://www.linkedin.com/in/erikrekola/

## Vastausajat
- Sähköposti ja Signal: yhden työpäivän sisällä
- Viikonloppuisin: ei taattua vastausaikaa

## Mitä ensimmäiseen viestiin

Hyödyllinen ensimmäinen viesti sisältää:
- Auditoitava sivu tai rajapinta (URL)
- Mahdolliset olemassa olevat skannaustulokset, jos olet ajanut niitä
- Mielenkiintoinen skooppi (audit, advisory, toteutus)
- Toivottu kieli toimituksille (englanti, suomi)

Jos skannaustuloksia ei vielä ole, se on ok. audit alkaa niiden
ajamisella.

## Maantieteellinen palvelualue

Toimipaikka Tampereella (postinumero 33100, Suomi). Palvelu
toimitetaan etänä maailmanlaajuisesti. Kaikki työ on asynkronista
ja kirjallista.

## Yritystiedot
- Y-tunnus: 3600281-7
- YTJ: https://tietopalvelu.ytj.fi/yritys/3600281-7
`,
 "/fi/juridiikka/": `# Tietosuoja ja juridiikka

## Rekisterinpitäjä
turva.dev (Erik Rekola)
Y-tunnus 3600281-7
Yhteys tietosuoja-asioissa: <mailto:info@turva.dev>

## Käsittelyn periaatteet
- **Tietojen minimointi**. kerätään vain mitä palvelun
 toteuttaminen vaatii
- **Säilytysaika rajattu**. asiakastiedot poistetaan kohtuullisen
 ajan kuluessa toimeksiannon päättymisestä
- **Ei kolmansille osapuolille**. asiakastietoja ei myydä eikä
 luovuteta markkinointiin
- **Tuotantotunnuksia ei pyydetä**. keskeinen toiminnallinen
 periaate
- **Kirjoitusoikeudet skoupataan tehtäväkohtaisesti**. vain jos
 toteutus on tilattu

## Mitä tietoja kerätään
- Yhteydenottolomakkeiden ja sähköpostin sisältö
- Nimi ja sähköpostiosoite asiakassuhteen ylläpitämiseksi
- Laskutustiedot kirjanpitolain edellyttämässä laajuudessa
- Auditin skooppi ja skannaustulokset toimeksiannon ajalta

## Sinun GDPR-oikeutesi
- Oikeus saada tietää, mitä tietoja sinusta on
- Oikeus saada tiedot oikaistuiksi
- Oikeus tietojen poistoon (oikeus tulla unohdetuksi)
- Oikeus rajoittaa tai vastustaa käsittelyä
- Oikeus siirtää tiedot järjestelmästä toiseen
- Oikeus tehdä valitus tietosuojavaltuutetulle (tietosuoja.fi)

## Evästeet
Sivusto käyttää vain teknisesti välttämättömiä evästeitä. Ei
seurantaa, ei mainontaa, ei kolmansien osapuolien analytiikkaa.

## Yhteys
Tietosuojakysymyksissä: <mailto:info@turva.dev>
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
 return header + sections;
}
__name(buildLlmsFullTxt, "buildLlmsFullTxt");
var _llmsFullCache = null;
function getLlmsFullTxt() {
 if (_llmsFullCache === null) _llmsFullCache = buildLlmsFullTxt();
 return _llmsFullCache;
}
__name(getLlmsFullTxt, "getLlmsFullTxt");
var AI_TXT = `# ai.txt
User-agent: *
Allow: /

Site-name: turva.dev
Owner: Erik Rekola
Contact: <mailto:info@turva.dev>
Languages: en, fi

Training: allowed
Grounding: allowed
Citation: required
Attribution: "Erik Rekola"

Llms: https://turva.dev/llms.txt
Llms-Full: https://turva.dev/llms-full.txt
Sitemap: https://turva.dev/sitemap.xml
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
Expires: 2027-05-12T00:00:00.000Z
Preferred-Languages: en, fi
Canonical: https://turva.dev/.well-known/security.txt
Policy: https://turva.dev/en/legal/
`;
var API_CATALOG = JSON.stringify({
 "linkset": [{
 "anchor": "https://turva.dev/",
 "service-desc": [{ "href": "https://turva.dev/.well-known/openapi.json", "type": "application/json" }],
 "service-doc": [
 { "href": "https://turva.dev/llms.txt", "type": "text/plain" },
 { "href": "https://turva.dev/llms-full.txt", "type": "text/plain" },
 { "href": "https://turva.dev/en/", "type": "text/html", "hreflang": "en" },
 { "href": "https://turva.dev/fi/", "type": "text/html", "hreflang": "fi" }
 ],
 "service-meta": [
 { "href": "https://turva.dev/.well-known/mcp/server-card.json", "type": "application/json", "title": "MCP Server Card" },
 { "href": "https://turva.dev/.well-known/agent-skills/index.json", "type": "application/json", "title": "Agent Skills Index" },
 { "href": "https://turva.dev/.well-known/oauth-authorization-server", "type": "application/json", "title": "OAuth Authorization Server (RFC 8414, non-participation)" },
 { "href": "https://turva.dev/.well-known/oauth-protected-resource", "type": "application/json", "title": "OAuth Protected Resource Metadata (RFC 9728)" },
 { "href": "https://turva.dev/.well-known/ap2", "type": "application/json", "title": "AP2 manifest" },
 { "href": "https://turva.dev/.well-known/acp", "type": "application/json", "title": "ACP manifest" },
 { "href": "https://turva.dev/.well-known/x402-mesh.json", "type": "application/json", "title": "x402-mesh (non-participation)" }
 ],
 "author": [{ "href": "https://www.linkedin.com/in/erikrekola/", "title": "Erik Rekola" }],
 "license": [
 { "href": "https://turva.dev/en/legal/", "hreflang": "en" },
 { "href": "https://turva.dev/fi/juridiikka/", "hreflang": "fi" }
 ]
 }]
}, null, 2);
var OPENAPI_SPEC = JSON.stringify({
 "openapi": "3.1.0",
 "info": {
 "title": "turva.dev metadata API",
 "version": "2.1.0",
 "description": "Read-only metadata endpoints for AI agents. Public, no authentication. turva.dev provides agent-readiness audits and advisory for product teams.",
 "contact": { "name": "Erik Rekola", "email": "info@turva.dev", "url": "https://turva.dev/" },
 "license": { "name": "Proprietary", "url": "https://turva.dev/en/legal/" }
 },
 "servers": [{ "url": "https://turva.dev" }],
 "paths": {
 "/llms.txt": { "get": { "summary": "LLM summary", "operationId": "getLlmsTxt", "responses": { "200": { "description": "ok" } } } },
 "/llms-full.txt": { "get": { "summary": "Full concatenated content", "operationId": "getLlmsFullTxt", "responses": { "200": { "description": "ok" } } } },
 "/sitemap.xml": { "get": { "summary": "Sitemap", "operationId": "getSitemap", "responses": { "200": { "description": "ok" } } } },
 "/.well-known/ai.txt": { "get": { "summary": "AI policy", "operationId": "getAiPolicy", "responses": { "200": { "description": "ok" } } } },
 "/.well-known/mcp/server-card.json": { "get": { "summary": "MCP Server Card", "operationId": "getMcpCard", "responses": { "200": { "description": "ok" } } } },
 "/.well-known/agent-skills/index.json": { "get": { "summary": "Agent Skills index", "operationId": "getSkillsIndex", "responses": { "200": { "description": "ok" } } } },
 "/.well-known/api-catalog": { "get": { "summary": "API catalog", "operationId": "getApiCatalog", "responses": { "200": { "description": "ok" } } } },
 "/.well-known/security.txt": { "get": { "summary": "Security", "operationId": "getSecurity", "responses": { "200": { "description": "ok" } } } },
 "/.well-known/oauth-authorization-server": { "get": { "summary": "OAuth Authorization Server Metadata (RFC 8414)", "operationId": "getOauthDiscovery", "responses": { "200": { "description": "ok" } } } },
 "/.well-known/oauth-protected-resource": { "get": { "summary": "OAuth Protected Resource Metadata (RFC 9728)", "operationId": "getOauthProtectedResource", "responses": { "200": { "description": "ok" } } } },
 "/.well-known/ap2": { "get": { "summary": "AP2 manifest (quote-on-request)", "operationId": "getAp2", "responses": { "200": { "description": "ok" } } } },
 "/.well-known/acp": { "get": { "summary": "ACP manifest (quote-on-request)", "operationId": "getAcp", "responses": { "200": { "description": "ok" } } } },
 "/.well-known/x402-mesh.json": { "get": { "summary": "x402-mesh (non-participation)", "operationId": "getX402Mesh", "responses": { "200": { "description": "ok" } } } }
 }
}, null, 2);
var AGENT_JSON = JSON.stringify({
 "schema_version": "v1",
 "name": "turva.dev",
 "description_for_human": "Agent-readiness audits and advisory for product teams.",
 "description_for_model": "turva.dev provides agent-readiness audits and advisory for product teams. Two independent scanners measure the site or API, a written report names the prioritized fixes, the next scan verifies the result. Async-only engagement. Pricing (EUR, VAT not included): Audit from 4500, Advisory from 1800/mo, Implementation from 1500/task, MCP design from 3500, Workshops from 1200. Pages support Accept: text/markdown.",
 "contact_email": "info@turva.dev",
 "legal_info_url": "https://turva.dev/en/legal/",
 "auth": { "type": "none" },
 "api": { "type": "openapi", "url": "https://turva.dev/.well-known/openapi.json" }
}, null, 2);
var MCP_SERVER_CARD = JSON.stringify({
 "$schema": "https://modelcontextprotocol.io/schemas/server-card/2025-10.json",
 "serverInfo": {
 "name": "turva-mcp",
 "title": "turva.dev",
 "version": "2.1.0",
 "description": "Public read-only MCP server for turva.dev. Exposes the service catalog (audit, advisory, implementation, MCP server design, workshops) with indicative starting prices, own-domain agent-readiness scan evidence, and engagement principles (async-only, no calls, no calendar links). No authentication, no write operations."
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
 { "name": "get_services", "description": "Service catalog with indicative starting prices in EUR." },
 { "name": "get_scan_evidence", "description": "Latest public agent-readiness scan results for turva.dev (CF, StartupHub, Internet.nl, Hardenize)." },
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
 "contact": "info@turva.dev",
 "languages": ["en", "fi"],
 "indicativePricing": {
 "currency": "EUR",
 "vatIncluded": false,
 "audit": { "from": 4500, "unit": "fixed" },
 "advisory": { "from": 1800, "unit": "month" },
 "implementation": { "from": 1500, "unit": "task" },
 "mcpServerDesign": { "from": 3500, "unit": "fixed" },
 "workshop": { "from": 1200, "unit": "fixed" }
 },
 "tools": [
 { "name": "get_services", "description": "Service catalog with indicative starting prices in EUR." },
 { "name": "get_scan_evidence", "description": "Latest public agent-readiness scan results for turva.dev (CF, StartupHub, Internet.nl, Hardenize)." },
 { "name": "get_principles", "description": "Engagement principles: async-only, no calls, no calendar links, no production credentials, scoped repo access." }
 ]
 }
}, null, 2);
var OAUTH_DISCOVERY = JSON.stringify({
 "issuer": "https://turva.dev",
 "service_documentation": "https://turva.dev/en/legal/",
 "op_policy_uri": "https://turva.dev/en/legal/",
 "op_tos_uri": "https://turva.dev/en/legal/",
 "ui_locales_supported": ["en", "fi"],
 "auth_methods_supported": [],
 "protected_resources": ["https://turva.dev"],
 "agent_auth": {
 "self_registration_supported": false,
 "rationale": "turva.dev is a public read-only marketing surface with no user accounts, no protected resources, and no OAuth-protected APIs. There is nothing for an agent to authenticate to. Public APIs and the MCP endpoint at https://mcp.turva.dev/mcp are accessible without credentials."
 },
 "non_participation": true,
 "non_participation_reason": "No user accounts. Public read-only API and MCP endpoint."
}, null, 2);
var OAUTH_PROTECTED_RESOURCE = JSON.stringify({
 "resource": "https://turva.dev",
 "authorization_servers": ["https://turva.dev"],
 "scopes_supported": [
 "read:services",
 "read:principles",
 "read:scan-evidence"
 ],
 "bearer_methods_supported": ["header"],
 "resource_name": "turva.dev",
 "resource_documentation": "https://turva.dev/llms.txt",
 "resource_policy_uri": "https://turva.dev/en/legal/",
 "resource_tos_uri": "https://turva.dev/en/legal/",
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
 "indicative_pricing": {
 "currency": "EUR",
 "vat_included": false,
 "items": [
 { "name": "Audit", "from": 4500, "unit": "fixed" },
 { "name": "Advisory", "from": 1800, "unit": "month" },
 { "name": "Implementation", "from": 1500, "unit": "task" },
 { "name": "MCP server design", "from": 3500, "unit": "fixed" },
 { "name": "Internal workshop", "from": 1200, "unit": "fixed" }
 ]
 },
 "quote_endpoint": {
 "type": "human_contact",
 "channels": [
 { "type": "email", "value": "mailto:info@turva.dev" },
 { "type": "signal", "value": "@turva.19" },
 { "type": "linkedin", "value": "https://www.linkedin.com/in/erikrekola/" }
 ],
 "languages": ["en", "fi"],
 "typical_response_time": "P1D"
 },
 "rationale": "Audit, advisory, and implementation work are scoped per engagement; indicative starting prices are published; final price is confirmed in writing after scope is agreed. Machine-payable rails (USDC/x402, Stripe payment links, AP2 push payments) are not enabled. Engagement is async-only; no calls and no calendar links."
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
 "indicative_pricing": {
 "currency": "EUR",
 "vat_included": false,
 "items": [
 { "name": "Audit", "from": 4500, "unit": "fixed" },
 { "name": "Advisory", "from": 1800, "unit": "month" },
 { "name": "Implementation", "from": 1500, "unit": "task" },
 { "name": "MCP server design", "from": 3500, "unit": "fixed" },
 { "name": "Internal workshop", "from": 1200, "unit": "fixed" }
 ]
 },
 "contact": {
 "email": "info@turva.dev",
 "signal": "@turva.19",
 "languages": ["en", "fi"]
 },
 "rationale": "Pricing is negotiated per engagement against published starting prices. Agents should propose a written customer contact rather than attempt programmatic checkout. All communication is asynchronous and in writing.",
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
 "languages": ["en", "fi"]
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
- **Languages:** English (default), Finnish
- **Engagement:** Async-only. No calls, no calendar links.
- **Response time:** First reply in writing within one business day.

## Source
- https://turva.dev/en/contact/
- https://turva.dev/fi/yhteystiedot/
`;
var SKILL_SERVICES = `---
name: services
description: List the service offerings of turva.dev with indicative starting prices (EUR).
---

# services

Use this skill to learn which services turva.dev offers and indicative starting prices.

## Services (prices in EUR, VAT not included, starting from)
- **Audit.** From 4500 EUR. Fixed scope, 2-3 weeks. Two independent agent-readiness scanners. Written report with prioritized fix list.
- **Advisory.** From 1800 EUR / month. Monthly retainer, async-only. Ongoing review.
- **Implementation.** From 1500 EUR per task. Worker-level changes, well-known manifests, MCP server work, JSON-LD and Schema fixes.
- **MCP server design.** From 3500 EUR. Read-only discovery tools and streamable HTTP transport.
- **Internal workshops.** From 1200 EUR. Async-first. Recorded session or written guide.

Final price is confirmed in writing after scope is agreed.

## Model
Async-only engagement. No calls, no calendar links. Production credentials are not requested. Repo write access is scoped per task.

## Source
- https://turva.dev/en/packages/
- https://turva.dev/fi/paketit/
`;
var SKILL_COMPANY = `---
name: company-info
description: Get business details and background about turva.dev and its founder Erik Rekola.
---

# company-info

Use this skill for formal company data about turva.dev.

## Facts
- **Name:** turva.dev
- **Owner:** Erik Rekola (sole proprietor)
- **Business ID:** 3600281-7
- **Register:** https://tietopalvelu.ytj.fi/yritys/3600281-7
- **Location:** Tampere 33100, Finland
- **Languages:** English, Finnish
- **LinkedIn:** https://www.linkedin.com/in/erikrekola/

## Source
- https://turva.dev/en/company/
- https://turva.dev/fi/yritys/
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
__name(sha256Hex, "sha256Hex");
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
__name(buildSkillsIndex, "buildSkillsIndex");
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
 return { email: 'info@turva.dev', signal: '@turva.19', linkedin: 'https://www.linkedin.com/in/erikrekola/', businessId: '3600281-7', languages: ['en','fi'], engagement: 'async-only' };
 }
 },
 {
 name: 'get_services',
 description: 'Return the services offered by turva.dev (audit, advisory, implementation, MCP design, workshops) with indicative starting prices in EUR.',
 inputSchema: { type: 'object', properties: {} },
 execute: async function() {
 const r = await fetch('/en/packages/', { headers: { Accept: 'text/markdown' } });
 return { markdown: await r.text(), pricing: { currency: 'EUR', vatIncluded: false, audit: { from: 4500 }, advisory: { from: 1800, unit: 'month' }, implementation: { from: 1500, unit: 'task' }, mcpServerDesign: { from: 3500 }, workshop: { from: 1200 } } };
 }
 },
 {
 name: 'get_company',
 description: 'Return business details about turva.dev.',
 inputSchema: { type: 'object', properties: {} },
 execute: async function() {
 return { name: 'turva.dev', owner: 'Erik Rekola', businessId: '3600281-7', location: 'Tampere, Finland', linkedin: 'https://www.linkedin.com/in/erikrekola/' };
 }
 }
 ]
 });
 } catch (e) {}
})();
<\/script>`;
var FLAG_CSS_FIX = `<style>
a.language-en[data-lang="en"][style] {
 background-image: url('/bundles/flag-icon-css/flags/4x3/us.svg') !important;
}
</style>`;
var SITEMAP_LASTMOD = "2026-05-26";
var SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
 xmlns:xhtml="http://www.w3.org/1999/xhtml">
 <url><loc>https://turva.dev/en/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority>
 <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/"/>
 <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/"/>
 <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/en/"/></url>
 <url><loc>https://turva.dev/en/packages/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority>
 <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/packages/"/>
 <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/paketit/"/>
 <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/en/packages/"/></url>
 <url><loc>https://turva.dev/en/company/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
 <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/company/"/>
 <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/yritys/"/>
 <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/en/company/"/></url>
 <url><loc>https://turva.dev/en/contact/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
 <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/contact/"/>
 <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/yhteystiedot/"/>
 <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/en/contact/"/></url>
 <url><loc>https://turva.dev/en/legal/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority>
 <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/legal/"/>
 <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/juridiikka/"/>
 <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/en/legal/"/></url>
 <url><loc>https://turva.dev/fi/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority>
 <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/"/>
 <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/"/>
 <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/en/"/></url>
 <url><loc>https://turva.dev/fi/paketit/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority>
 <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/packages/"/>
 <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/paketit/"/>
 <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/en/packages/"/></url>
 <url><loc>https://turva.dev/fi/yritys/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
 <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/company/"/>
 <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/yritys/"/>
 <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/en/company/"/></url>
 <url><loc>https://turva.dev/fi/yhteystiedot/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
 <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/contact/"/>
 <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/yhteystiedot/"/>
 <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/en/contact/"/></url>
 <url><loc>https://turva.dev/fi/juridiikka/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority>
 <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/legal/"/>
 <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/juridiikka/"/>
 <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/en/legal/"/></url>
</urlset>`;
var PAGE_PAIRS = [
 ["/fi/", "/en/"],
 ["/fi/paketit", "/en/packages"],
 ["/fi/paketit/", "/en/packages/"],
 ["/fi/yritys", "/en/company"],
 ["/fi/yritys/", "/en/company/"],
 ["/fi/yhteystiedot", "/en/contact"],
 ["/fi/yhteystiedot/", "/en/contact/"],
 ["/fi/juridiikka", "/en/legal"],
 ["/fi/juridiikka/", "/en/legal/"]
];
function getHreflangForPath(pathname) {
 const pair = PAGE_PAIRS.find((p) => p[0] === pathname || p[1] === pathname);
 if (!pair) return null;
 const fiUrl = "https://turva.dev" + pair[0];
 const enUrl = "https://turva.dev" + pair[1];
 return `<link rel="alternate" hreflang="en" href="${enUrl}" />
<link rel="alternate" hreflang="fi" href="${fiUrl}" />
<link rel="alternate" hreflang="x-default" href="${enUrl}" />`;
}
__name(getHreflangForPath, "getHreflangForPath");
function getCanonicalForPath(pathname) {
 const pair = PAGE_PAIRS.find((p) => p[0] === pathname || p[1] === pathname);
 if (!pair) return null;
 const isFi = pair[0] === pathname;
 return "https://turva.dev" + (isFi ? pair[0] : pair[1]);
}
__name(getCanonicalForPath, "getCanonicalForPath");
function getLangForPath(pathname) {
 if (pathname.startsWith("/fi/") || pathname === "/fi") return "fi";
 return "en";
}
__name(getLangForPath, "getLangForPath");
var META_BY_LANG = {
 en: {
 title: "Agent Readiness Audits & Advisory | turva.dev",
 description: "Independent agent-readiness audits and advisory for product teams. Two scanners measure your site or API. Written report, prioritized fixes, async-only. Audit from 4500 EUR.",
 locale: "en_US",
 altLocale: "fi_FI",
 imageAlt: "Agent Readiness Audits & Advisory"
 },
 fi: {
 title: "Agenttivalmius-auditit ja advisory | turva.dev",
 description: "Riippumattomat agenttivalmius-auditit ja advisory product-tiimeille. Kaksi skanneria mittaa sivun tai rajapinnan. Kirjallinen raportti, async-only. Audit alkaen 4500 EUR.",
 locale: "fi_FI",
 altLocale: "en_US",
 imageAlt: "Agenttivalmius-auditit ja advisory"
 }
};
function buildMetaBlock(lang, canonicalUrl) {
 const m = META_BY_LANG[lang];
 const url = canonicalUrl || "https://turva.dev/" + lang + "/";
 return `<title>${m.title}</title>
<meta name="description" content="${m.description}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="turva.dev" />
<meta property="og:title" content="${m.title}" />
<meta property="og:description" content="${m.description}" />
<meta property="og:url" content="${url}" />
<meta property="og:locale" content="${m.locale}" />
<meta property="og:locale:alternate" content="${m.altLocale}" />
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
__name(buildMetaBlock, "buildMetaBlock");
var PRICE_VALID_UNTIL = "2026-12-31";
var SCHEMA_FI = `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"ProfessionalService","@id":"https://turva.dev/#business","name":"turva.dev","url":"https://turva.dev/","image":"https://turva.dev/og.jpg","description":"Riippumattomat agenttivalmius-auditit ja advisory product-tiimeille. Kaksi skanneria mittaa sivun tai rajapinnan; kirjallinen raportti nimeää priorisoidut korjaukset; seuraava skannaus todentaa tuloksen.","priceRange":"€€€","taxID":"3600281-7","vatID":"FI36002817","email":"info@turva.dev","areaServed":{"@type":"Place","name":"Worldwide"},"address":{"@type":"PostalAddress","addressLocality":"Tampere","postalCode":"33100","addressCountry":"FI"},"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"info@turva.dev","availableLanguage":["English","Finnish"]},"founder":{"@id":"https://turva.dev/#person"},"sameAs":["https://tietopalvelu.ytj.fi/yritys/3600281-7","https://www.linkedin.com/in/erikrekola/"]},
{"@type":"Person","@id":"https://turva.dev/#person","name":"Erik Rekola","jobTitle":"Agent-readiness consultant","worksFor":{"@id":"https://turva.dev/#business"},"sameAs":["https://www.linkedin.com/in/erikrekola/"]},
{"@type":"WebSite","@id":"https://turva.dev/#website","url":"https://turva.dev/","name":"turva.dev","publisher":{"@id":"https://turva.dev/#business"},"inLanguage":["en","fi"]},
{"@type":"Service","@id":"https://turva.dev/#service","name":"Agenttivalmius-auditit ja advisory","provider":{"@id":"https://turva.dev/#business"},"serviceType":"Agent-readiness consulting","areaServed":{"@type":"Place","name":"Worldwide"},"availableChannel":{"@type":"ServiceChannel","serviceUrl":"https://turva.dev/fi/paketit/","availableLanguage":["en","fi"]},"offers":{"@type":"AggregateOffer","priceCurrency":"EUR","lowPrice":"1200","highPrice":"4500","offerCount":"5","availability":"https://schema.org/InStock","url":"https://turva.dev/fi/paketit/","priceValidUntil":"${PRICE_VALID_UNTIL}"},"hasOfferCatalog":{"@type":"OfferCatalog","name":"turva.dev-palvelut","itemListElement":[
{"@type":"Offer","name":"Audit","description":"Kiinteä skooppi 2-3 viikkoa. Kaksi riippumatonta skanneria, kirjallinen raportti ja priorisoitu korjauslista.","url":"https://turva.dev/fi/paketit/","price":"4500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"4500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Alkaen 4500 EUR; lopullinen hinta vahvistetaan kun skooppi on sovittu."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agenttivalmius-audit"}},
{"@type":"Offer","name":"Advisory","description":"Kuukausiretainer, async-only. Jatkuva seuranta kun sivu tai rajapinta kehittyy.","url":"https://turva.dev/fi/paketit/","price":"1800","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"UnitPriceSpecification","price":"1800","priceCurrency":"EUR","valueAddedTaxIncluded":false,"unitCode":"MON","unitText":"kuukausi","description":"Alkaen 1800 EUR / kuukausi; retainer-pohjainen."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agenttivalmius-advisory"}},
{"@type":"Offer","name":"Toteutus","description":"Worker-tason muutokset, well-known-manifestit, MCP-server-työ, JSON-LD ja Schema-korjaukset.","url":"https://turva.dev/fi/paketit/","price":"1500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"1500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Alkaen 1500 EUR per tehtävä; skoopataan tarjouspyynnön perusteella."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Toteutustyö"}},
{"@type":"Offer","name":"MCP-server-suunnittelu","description":"Read-only discovery -toolit, streamable HTTP -kuljetus, ei auth-pintaa.","url":"https://turva.dev/fi/paketit/","price":"3500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"3500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Alkaen 3500 EUR; lopullinen hinta vahvistetaan kun skooppi on sovittu."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"MCP-server-suunnittelu"}},
{"@type":"Offer","name":"Sisäinen workshop","description":"Async-first. Nauhoitettu sessio tai kirjallinen opas.","url":"https://turva.dev/fi/paketit/","price":"1200","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"1200","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Alkaen 1200 EUR; lopullinen hinta vahvistetaan kun skooppi on sovittu."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Sisäinen workshop"}}
]}},
{"@type":"FAQPage","@id":"https://turva.dev/fi/#faq","inLanguage":"fi","mainEntity":[
{"@type":"Question","name":"Mitä agenttivalmius tarkoittaa?","acceptedAnswer":{"@type":"Answer","text":"Agenttivalmius on mitattava ominaisuus sivulla, rajapinnalla tai tuotepinnalla. Kuvaa miten hyvin AI-agentit voivat löytää, lukea ja käyttää sitä."}},
{"@type":"Question","name":"Mitä palvelu maksaa?","acceptedAnswer":{"@type":"Answer","text":"Indikatiiviset aloitushinnat (EUR, ALV ei sisälly): Audit alkaen 4500, Advisory alkaen 1800 / kk, Toteutus alkaen 1500 per tehtävä, MCP-server-suunnittelu alkaen 3500, Workshopit alkaen 1200. Lopullinen hinta vahvistetaan kirjallisesti kun skooppi on sovittu."}},
{"@type":"Question","name":"Pitääkö antaa tuotantotunnukset?","acceptedAnswer":{"@type":"Answer","text":"Ei. Tuotantotunnuksia ei pyydetä. Auditille riittää lukuoikeus."}},
{"@type":"Question","name":"Onko palvelussa puheluita tai videopalavereita?","acceptedAnswer":{"@type":"Answer","text":"Ei. Toimeksiannot ovat async-only. Ei puheluita eikä kalenterilinkkejä."}},
{"@type":"Question","name":"Miten kauan audit kestää?","acceptedAnswer":{"@type":"Answer","text":"Audit on kiinteä skooppi, 2-3 viikkoa."}},
{"@type":"Question","name":"Voiko teidän kehitystiimi tehdä korjaukset itse?","acceptedAnswer":{"@type":"Answer","text":"Kyllä. Auditin raportti on speksi. Joko me toteutamme tai teidän tiimi tekee työn raportti speksinä."}},
{"@type":"Question","name":"Miten tulos todennetaan?","acceptedAnswer":{"@type":"Answer","text":"Tulos näkyy skannereiden numeroissa. Seuraava skannaus lukee korkeammalla kuin edellinen niissä kategorioissa jotka raportti nimesi."}},
{"@type":"Question","name":"Miten otan yhteyttä?","acceptedAnswer":{"@type":"Answer","text":"Kirjallisesti: sähköpostilla <mailto:info@turva.dev> tai Signalilla @turva.19. Ensimmäinen vastaus yhden työpäivän sisällä."}}
]}
]}
<\/script>`;
var SCHEMA_EN = `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"ProfessionalService","@id":"https://turva.dev/#business","name":"turva.dev","url":"https://turva.dev/","image":"https://turva.dev/og.jpg","description":"Independent agent-readiness audits and advisory for product teams. Two scanners measure the site or API; a written report names the prioritized fixes; the next scan verifies the result.","priceRange":"€€€","taxID":"3600281-7","vatID":"FI36002817","email":"info@turva.dev","areaServed":{"@type":"Place","name":"Worldwide"},"address":{"@type":"PostalAddress","addressLocality":"Tampere","postalCode":"33100","addressCountry":"FI"},"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"info@turva.dev","availableLanguage":["English","Finnish"]},"founder":{"@id":"https://turva.dev/#person"},"sameAs":["https://tietopalvelu.ytj.fi/yritys/3600281-7","https://www.linkedin.com/in/erikrekola/"]},
{"@type":"Person","@id":"https://turva.dev/#person","name":"Erik Rekola","jobTitle":"Agent-readiness consultant","worksFor":{"@id":"https://turva.dev/#business"},"sameAs":["https://www.linkedin.com/in/erikrekola/"]},
{"@type":"WebSite","@id":"https://turva.dev/#website","url":"https://turva.dev/","name":"turva.dev","publisher":{"@id":"https://turva.dev/#business"},"inLanguage":["en","fi"]},
{"@type":"Service","@id":"https://turva.dev/#service","name":"Agent-readiness audits and advisory","provider":{"@id":"https://turva.dev/#business"},"serviceType":"Agent-readiness consulting","areaServed":{"@type":"Place","name":"Worldwide"},"availableChannel":{"@type":"ServiceChannel","serviceUrl":"https://turva.dev/en/packages/","availableLanguage":["en","fi"]},"offers":{"@type":"AggregateOffer","priceCurrency":"EUR","lowPrice":"1200","highPrice":"4500","offerCount":"5","availability":"https://schema.org/InStock","url":"https://turva.dev/en/packages/","priceValidUntil":"${PRICE_VALID_UNTIL}"},"hasOfferCatalog":{"@type":"OfferCatalog","name":"turva.dev services","itemListElement":[
{"@type":"Offer","name":"Audit","description":"Fixed scope, 2-3 weeks. Two independent scanners, written report with prioritized fix list.","url":"https://turva.dev/en/packages/","price":"4500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"4500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"From 4500 EUR; final price confirmed once scope is agreed."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness audit"}},
{"@type":"Offer","name":"Advisory","description":"Monthly retainer, async-only. Ongoing review as the site or API evolves.","url":"https://turva.dev/en/packages/","price":"1800","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"UnitPriceSpecification","price":"1800","priceCurrency":"EUR","valueAddedTaxIncluded":false,"unitCode":"MON","unitText":"month","description":"From 1800 EUR / month; retainer-based."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Agent-readiness advisory"}},
{"@type":"Offer","name":"Implementation","description":"Worker-level changes, well-known manifests, MCP server work, JSON-LD and Schema fixes.","url":"https://turva.dev/en/packages/","price":"1500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"1500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"From 1500 EUR per task; scoped against the audit report."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Implementation work"}},
{"@type":"Offer","name":"MCP server design","description":"Read-only discovery tools, streamable HTTP transport, no auth surface.","url":"https://turva.dev/en/packages/","price":"3500","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"3500","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"From 3500 EUR; final price confirmed once scope is agreed."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"MCP server design"}},
{"@type":"Offer","name":"Internal workshop","description":"Async-first. Recorded session or written guide.","url":"https://turva.dev/en/packages/","price":"1200","priceCurrency":"EUR","priceValidUntil":"${PRICE_VALID_UNTIL}","priceSpecification":{"@type":"PriceSpecification","price":"1200","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"From 1200 EUR; final price confirmed once scope is agreed."},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell","itemOffered":{"@type":"Service","name":"Internal workshop"}}
]}},
{"@type":"FAQPage","@id":"https://turva.dev/en/#faq","inLanguage":"en","mainEntity":[
{"@type":"Question","name":"What does agent-readiness mean?","acceptedAnswer":{"@type":"Answer","text":"Agent-readiness is a measurable property of a site, an API, or a product surface. It describes how well AI agents can discover, read, and operate it."}},
{"@type":"Question","name":"How much does it cost?","acceptedAnswer":{"@type":"Answer","text":"Indicative starting prices (EUR, VAT not included): Audit from 4500, Advisory from 1800 / month, Implementation from 1500 per task, MCP server design from 3500, Workshops from 1200. Final price is confirmed in writing after scope is agreed."}},
{"@type":"Question","name":"Do I need to share production credentials?","acceptedAnswer":{"@type":"Answer","text":"No. Production credentials are not requested. Read access is enough for the audit."}},
{"@type":"Question","name":"Are there calls or video meetings?","acceptedAnswer":{"@type":"Answer","text":"No. Engagement is async-only. No calls and no calendar links."}},
{"@type":"Question","name":"How long does the audit take?","acceptedAnswer":{"@type":"Answer","text":"The audit is fixed scope, 2-3 weeks."}},
{"@type":"Question","name":"Can our engineering team implement the fixes?","acceptedAnswer":{"@type":"Answer","text":"Yes. The audit report is the spec. Either I implement or your team does the work with the report as the spec."}},
{"@type":"Question","name":"How is the result verified?","acceptedAnswer":{"@type":"Answer","text":"The result shows up in scanner numbers. The next scan reads higher than the previous one in the categories the report named."}},
{"@type":"Question","name":"How do I get in touch?","acceptedAnswer":{"@type":"Answer","text":"In writing: email <mailto:info@turva.dev> or Signal @turva.19. First reply within one business day."}}
]}
]}
<\/script>`;
var HeadCleaner = class {
 static {
 __name(this, "HeadCleaner");
 }
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
 static {
 __name(this, "HtmlLangSetter");
 }
 constructor(lang) { this.lang = lang; }
 element(element) {
 element.setAttribute("lang", this.lang);
 }
};
function appendAgentLinks(headers) {
 headers.append("Link", '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"');
 headers.append("Link", '</.well-known/openapi.json>; rel="service-desc"; type="application/json"');
 headers.append("Link", '</llms.txt>; rel="service-doc"; type="text/plain"');
 headers.append("Link", '</llms-full.txt>; rel="service-doc"; type="text/plain"; title="Full content"');
 headers.append("Link", '</.well-known/mcp/server-card.json>; rel="service-meta"; type="application/json"');
 headers.append("Link", '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"');
 headers.append("Link", '</llms.txt>; rel="describedby"; type="text/plain"');
 headers.append("Link", '</sitemap.xml>; rel="sitemap"; type="application/xml"');
 headers.append("Link", '</.well-known/security.txt>; rel="security-txt"; type="text/plain"');
 headers.append("Link", '</.well-known/ai.txt>; rel="ai-policy"; type="text/plain"');
 headers.append("Link", '</robots.txt>; rel="robots"; type="text/plain"');
 headers.append("Link", '<https://www.linkedin.com/in/erikrekola/>; rel="author"');
 headers.append("Link", '</en/legal/>; rel="license"');
 headers.append("Link", '</.well-known/oauth-authorization-server>; rel="oauth-authorization-server"; type="application/json"');
 headers.append("Link", '</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json"');
 headers.append("Link", '</.well-known/ap2>; rel="ap2"; type="application/json"');
 headers.append("Link", '</.well-known/acp>; rel="acp"; type="application/json"');
 headers.append("Link", '</.well-known/x402-mesh.json>; rel="x402-mesh"; type="application/json"');
 headers.append("Link", '<mailto:info@turva.dev?subject=Quote%20request>; rel="payment"; title="Request a quote"');
}
__name(appendAgentLinks, "appendAgentLinks");
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
 const hreflangHtml = getHreflangForPath(pathname);
 const isFiHome = pathname === "/fi/" || pathname === "/fi";
 const isEnHome = pathname === "/en/" || pathname === "/en";
 const canonicalUrl = getCanonicalForPath(pathname);
 const lang = getLangForPath(pathname);
 const metaBlock = buildMetaBlock(lang, canonicalUrl || ("https://turva.dev" + pathname));
 if (!hreflangHtml) {
 const headers2 = new Headers(response.headers);
 appendAgentLinks(headers2);
 applySecurityHeaders(headers2, "html");
 return new Response(response.body, {
 status: response.status,
 statusText: response.statusText,
 headers: headers2
 });
 }
 const transformed = new HTMLRewriter()
.on("html", new HtmlLangSetter(lang))
.on("title", new HeadCleaner())
.on("meta", new HeadCleaner())
.on("link", new HeadCleaner())
.on("head", {
 element(el) {
 el.append(metaBlock, { html: true });
 if (canonicalUrl) el.append(`<link rel="canonical" href="${canonicalUrl}" />`, { html: true });
 el.append(hreflangHtml, { html: true });
 el.append(`<link rel="api-catalog" href="https://turva.dev/.well-known/api-catalog" type="application/linkset+json" />`, { html: true });
 el.append(`<link rel="service-desc" href="https://turva.dev/.well-known/openapi.json" type="application/json" />`, { html: true });
 el.append(`<link rel="service-doc" href="https://turva.dev/llms.txt" type="text/plain" />`, { html: true });
 el.append(`<link rel="service-doc" href="https://turva.dev/llms-full.txt" type="text/plain" title="Full content" />`, { html: true });
 el.append(`<link rel="service-meta" href="https://turva.dev/.well-known/mcp/server-card.json" type="application/json" />`, { html: true });
 el.append(`<link rel="agent-skills" href="https://turva.dev/.well-known/agent-skills/index.json" type="application/json" />`, { html: true });
 el.append(`<link rel="payment" href="mailto:info@turva.dev?subject=Quote%20request" title="Request a quote" />`, { html: true });
 el.append(`<link rel="oauth-authorization-server" href="https://turva.dev/.well-known/oauth-authorization-server" type="application/json" />`, { html: true });
 el.append(`<link rel="oauth-protected-resource" href="https://turva.dev/.well-known/oauth-protected-resource" type="application/json" />`, { html: true });
 el.append(`<link rel="ap2" href="https://turva.dev/.well-known/ap2" type="application/json" />`, { html: true });
 el.append(`<link rel="acp" href="https://turva.dev/.well-known/acp" type="application/json" />`, { html: true });
 el.append(`<link rel="x402-mesh" href="https://turva.dev/.well-known/x402-mesh.json" type="application/json" />`, { html: true });
 el.append(FLAG_CSS_FIX, { html: true });
 if (isFiHome) el.append(SCHEMA_FI, { html: true });
 else if (isEnHome) el.append(SCHEMA_EN, { html: true });
 el.append(WEBMCP_SCRIPT, { html: true });
 }
 })
.transform(response);
 const headers = new Headers(transformed.headers);
 appendAgentLinks(headers);
 applySecurityHeaders(headers, "html");
 headers.set("Vary", "Accept, Accept-Language");
 headers.set("Content-Language", lang);
 headers.append("Link", `<${canonicalUrl || "https://turva.dev" + pathname}>; rel="alternate"; type="text/markdown"`);
 return new Response(transformed.body, {
 status: transformed.status,
 statusText: transformed.statusText,
 headers
 });
}
__name(injectHtml, "injectHtml");
function preferredLangRedirect(request) {
 const al = (request.headers.get("Accept-Language") || "").toLowerCase();
 const fiIdx = al.indexOf("fi");
 const enIdx = al.indexOf("en");
 if (fiIdx !== -1 && (enIdx === -1 || fiIdx < enIdx)) return "https://turva.dev/fi/";
 return "https://turva.dev/en/";
}
__name(preferredLangRedirect, "preferredLangRedirect");
function stripBody(response) {
 return new Response(null, { status: response.status, statusText: response.statusText, headers: response.headers });
}
__name(stripBody, "stripBody");
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
__name(serveStatic, "serveStatic");
function serveMtaStsPolicy() {
 const headers = new Headers({
 "content-type": "text/plain; charset=utf-8",
 "cache-control": "public, max-age=86400"
 });
 applySecurityHeaders(headers, "default");
 return new Response(MTA_STS_POLICY, { status: 200, headers });
}
__name(serveMtaStsPolicy, "serveMtaStsPolicy");
function wantsMarkdown(request) {
 const accept = (request.headers.get("Accept") || "").toLowerCase();
 if (!accept) return false;
 const parts = accept.split(",").map((p) => p.trim().split(";")[0].trim());
 return parts.includes("text/markdown");
}
__name(wantsMarkdown, "wantsMarkdown");
function serveMarkdown(body, canonicalUrl) {
 const tokens = body.split(/\s+/).filter(Boolean).length;
 const headers = new Headers({
 "content-type": "text/markdown; charset=utf-8",
 "cache-control": "public, max-age=3600",
 "access-control-allow-origin": "*",
 "vary": "Accept, Accept-Language",
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
__name(serveMarkdown, "serveMarkdown");
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
 if (hostname === "mta-sts.turva.dev") {
 if (pathLower === "/.well-known/mta-sts.txt") {
 return serveMtaStsPolicy();
 }
 return Response.redirect("https://turva.dev/", 301);
 }
 if (hostname === "www.turva.dev") {
 return Response.redirect("https://turva.dev" + pathname + url.search, 301);
 }
 if (LEGACY_REDIRECTS[pathname]) {
 return Response.redirect("https://turva.dev" + LEGACY_REDIRECTS[pathname] + url.search, 301);
 }
 if (pathname === "/" || pathname === "") {
 const isBotAgent = BOT_AGENTS.some((bot) => userAgent.includes(bot.toLowerCase()));
 const target = isBotAgent ? "https://turva.dev/en/" : preferredLangRedirect(request);
 return Response.redirect(target, 301);
 }
 if (pathname === "/fi" || pathname === "/en") {
 return Response.redirect("https://turva.dev" + pathname + "/" + url.search, 301);
 }
 if (wantsMarkdown(request) && PAGE_MARKDOWN[pathname]) {
 const canonicalUrl = getCanonicalForPath(pathname) || "https://turva.dev" + pathname;
 return serveMarkdown(PAGE_MARKDOWN[pathname], canonicalUrl);
 }
 if (pathLower === "/robots.txt") {
 return serveStatic(ROBOTS_TXT, "text/plain; charset=utf-8", "agent-api");
 }
 if (pathLower === "/.well-known/api-catalog" || pathLower === "/api-catalog") {
 return serveStatic(API_CATALOG, "application/linkset+json; charset=utf-8", "agent-api");
 }
 if (pathLower === "/.well-known/openapi.json" || pathLower === "/openapi.json") {
 return serveStatic(OPENAPI_SPEC, "application/json; charset=utf-8", "agent-api");
 }
 if (pathLower === "/.well-known/mcp/server-card.json" || pathLower === "/.well-known/mcp.json" || pathLower === "/.well-known/agent.json" || pathLower === "/.well-known/ai-plugin.json") {
 if (pathLower === "/.well-known/agent.json" || pathLower === "/.well-known/ai-plugin.json") {
 return serveStatic(AGENT_JSON, "application/json; charset=utf-8", "agent-api");
 }
 return serveStatic(MCP_SERVER_CARD, "application/json; charset=utf-8", "agent-api");
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
 const isBot = BOT_AGENTS.some((bot) => userAgent.includes(bot.toLowerCase()));
 const isIgnoredExt = extension.length && IGNORE_EXTENSIONS.includes(extension);
 if (isPrerender || !isBot || isIgnoredExt) {
 const response = await fetch(request);
 return injectHtml(response, pathname);
 }
 const newURL = `https://service.prerender.io/${request.url}`;
 const newHeaders = new Headers(request.headers);
 newHeaders.set("X-Prerender-Token", env.PRERENDER_TOKEN);
 newHeaders.set("X-Prerender-Int-Type", "CloudFlare");
 const prerenderResponse = await fetch(new Request(newURL, { headers: newHeaders, redirect: "manual" }));
 const lang = getLangForPath(pathname);
 const botHeaders = new Headers(prerenderResponse.headers);
 appendAgentLinks(botHeaders);
 applySecurityHeaders(botHeaders, "html");
 botHeaders.set("Vary", "Accept, Accept-Language");
 botHeaders.set("Content-Language", lang);
 botHeaders.append("Link", `<${"https://turva.dev" + pathname}>; rel="alternate"; type="text/markdown"`);
 return new Response(prerenderResponse.body, {
 status: prerenderResponse.status,
 statusText: prerenderResponse.statusText,
 headers: botHeaders
 });
}
__name(handleRequest, "handleRequest");
export {
 worker_default as default
};
//# sourceMappingURL=worker.js.map
