// =============================================================
// turva.dev — Unified Worker (2026-05-23)
// + MTA-STS policy handler for mta-sts.turva.dev
// + Security headers: HSTS preload, CSP, Referrer-Policy no-referrer,
//   Permissions-Policy, frame-ancestors, COOP, CORP
// + Strips Cloudflare NEL / Report-To (privacy: no 3rd-party reporting)
// + security.txt Expires aligned to RFC 9116 (12 months)
// + StartupHub.ai quick wins: Service JSON-LD, /pricing aliases,
//   RateLimit-* headers (RFC 9331), llms-full.txt
// + 2026-05-18b: Offer price + priceSpecification "Contact for price"
//   pattern (StartupHub.ai Commerce bug fix)
// + 2026-05-23: MCP_SERVER_CARD now points to live MCP endpoint at
//   mcp.turva.dev/mcp (streamable-http, separate turva-mcp Worker)
// =============================================================

const BOT_AGENTS = [
  "googlebot","adsbot-google","apis-google","mediapartners-google",
  "google-safety","feedfetcher-google","googleproducer",
  "google-site-verification","bingbot","yandexbot","yabrowser",
  "yahoo","baiduspider","naver","seznambot","sznprohlizec",
  "qwantbot","ecosia","duckduckbot","duckassistbot","applebot",
  "facebookexternalhit","facebookcatalog","facebookbot",
  "meta-externalagent","twitterbot","linkedinbot","whatsapp",
  "slackbot","pinterest","pinterestbot","tiktok","tiktokspider",
  "bytespider","discordbot",
  "semrushbot","ahrefsbot","chrome-lighthouse","screaming-frog",
  "oncrawlbot","botifybot","deepcrawl","lumar","rogerbot","dotbot",
  "gptbot","chatgpt","oai-searchbot","chatgpt-user","claudebot",
  "google-extended","perplexitybot","perplexity-user","youbot",
  "amazonbot","anthropic-ai","claude-web","claude-user","ccbot",
  "mistralai-user",
  "embedly","quora link preview","showyoubot","outbrain",
  "pinterest/0.","developers.google.com/+/web/snippet","vkshare",
  "w3c_validator","redditbot","flipboard","tumblr","bitlybot",
  "skypeuripreview","nuzzel","google page speed","qwantify",
  "bitrix link preview","xing-contenttabreceiver",
  "google-inspectiontool","telegrambot",
  "integration-test"
];

const IGNORE_EXTENSIONS = [
  ".js",".css",".xml",".less",".png",".jpg",".jpeg",".gif",
  ".pdf",".doc",".txt",".ico",".rss",".zip",".mp3",".rar",
  ".exe",".wmv",".avi",".ppt",".mpg",".mpeg",".tif",".wav",
  ".mov",".psd",".ai",".xls",".mp4",".m4a",".swf",".dat",
  ".dmg",".iso",".flv",".m4v",".torrent",".woff",".ttf",
  ".svg",".webmanifest",".json",".md"
];

const LEGACY_REDIRECTS = {
  "/paketit":"/fi/paketit/","/paketit/":"/fi/paketit/",
  "/yritys":"/fi/yritys/","/yritys/":"/fi/yritys/",
  "/yritystiedot":"/fi/yritys/","/yritystiedot/":"/fi/yritys/",
  "/yhteystiedot":"/fi/yhteystiedot/","/yhteystiedot/":"/fi/yhteystiedot/",
  "/juridiikka":"/fi/juridiikka/","/juridiikka/":"/fi/juridiikka/",
  "/tietosuoja":"/fi/juridiikka/","/tietosuoja/":"/fi/juridiikka/",
  "/packages":"/en/packages/","/packages/":"/en/packages/",
  "/company":"/en/company/","/company/":"/en/company/",
  "/contact":"/en/contact/","/contact/":"/en/contact/",
  "/legal":"/en/legal/","/legal/":"/en/legal/",
  "/privacy":"/en/legal/","/privacy/":"/en/legal/",
  // Pricing aliases (StartupHub.ai Commerce dimension)
  "/pricing":"/fi/paketit/","/pricing/":"/fi/paketit/",
  "/palvelut":"/fi/paketit/","/palvelut/":"/fi/paketit/",
  "/services":"/en/packages/","/services/":"/en/packages/"
};

// -----------------------------------------------------------
// MTA-STS POLICY (served at mta-sts.turva.dev/.well-known/mta-sts.txt)
// -----------------------------------------------------------
// id in DNS TXT (_mta-sts) must change whenever this policy changes.
// Current id: 20260502000000
const MTA_STS_POLICY = `version: STSv1
mode: enforce
mx: mx1.alias.proton.me
mx: mx2.alias.proton.me
max_age: 604800
`;

// -----------------------------------------------------------
// SECURITY HEADERS
// -----------------------------------------------------------
const CSP_HTML = [
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

const PERMISSIONS_POLICY = [
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
  // Strip Cloudflare auto-injected reporting (privacy: avoid 3rd-party leaks)
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

  // RFC 9331 (RateLimit fields) — informational for well-behaved agents.
  // Static values: no per-client tracking, no state. Pure declaration of
  // a generous default. Cloudflare-tason WAF hoitaa varsinaisen rate
  // limitingin; nämä ovat metadata-signaali boteille ja AI-agenteille.
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

// -----------------------------------------------------------
// ROBOTS.TXT
// -----------------------------------------------------------
const ROBOTS_TXT = `# robots.txt — turva.dev
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

// -----------------------------------------------------------
// LLMS.TXT
// -----------------------------------------------------------
const LLMS_TXT = `# turva.dev

> Tietoturva- ja yksityisyyskonsultointia yksityishenkilöille ja pienyrityksille.
> Toimipaikka Tampere, palvelu koko Suomi etänä. Kielet: suomi, englanti.

Palvelu perustuu ohjattuun itsepalveluun: asiakas tekee muutokset itse
konsultin opastuksella. Salasanoja ei luovuteta eikä etähallintaa anneta.

## Palvelut (fi)
- [Paketit ja hinnoittelu](https://turva.dev/fi/paketit/)
- [Yritys](https://turva.dev/fi/yritys/)
- [Yhteystiedot](https://turva.dev/fi/yhteystiedot/)
- [Tietosuoja ja juridiikka](https://turva.dev/fi/juridiikka/)

## Services (en)
- [Packages](https://turva.dev/en/packages/)
- [Company](https://turva.dev/en/company/)
- [Contact](https://turva.dev/en/contact/)
- [Legal](https://turva.dev/en/legal/)

## Yritystiedot
- Nimi: turva.dev
- Y-tunnus: 3600281-7
- Sijainti: Tampere 33100, Suomi
- YTJ: https://tietopalvelu.ytj.fi/yritys/3600281-7
- LinkedIn: https://www.linkedin.com/in/erik1764/

## Agent endpoints
- API catalog: https://turva.dev/.well-known/api-catalog
- OpenAPI: https://turva.dev/.well-known/openapi.json
- MCP Server Card: https://turva.dev/.well-known/mcp/server-card.json
- MCP Endpoint: https://mcp.turva.dev/mcp
- Agent Skills index: https://turva.dev/.well-known/agent-skills/index.json
- Full content: https://turva.dev/llms-full.txt
- Security contact: https://turva.dev/.well-known/security.txt
- AI policy: https://turva.dev/.well-known/ai.txt
`;

// -----------------------------------------------------------
// PAGE_MARKDOWN — curated (10 pages)
// -----------------------------------------------------------
const PAGE_MARKDOWN = {
  "/fi/": `# turva.dev — Parempi turva. Parempi mieli.

Käytännönläheistä tietoturva- ja yksityisyyskonsultointia yksityishenkilöille
ja pk-yrityksille Suomessa. Toimipaikka Tampere, palvelu koko Suomi etänä.
Kielet: suomi, englanti.

## Palvelumalli: ohjattu itsepalvelu

Tavanomainen IT-konsultti pyytää salasanat ja tekee muutokset puolestasi.
turva.dev toimii toisin:

- **Et luovuta salasanojasi** kenellekään
- **Et anna etähallintaa** laitteisiisi
- **Teet muutokset itse** selkeiden ohjeiden mukaan
- Konsultti opastaa rinnalla — osaaminen jää sinulle

Hitaampaa? Muutaman minuutin verran. Turvallisempaa ja opettavampaa?
Huomattavasti. Kun konsultti lähtee, turva jää.

## Mitä saat
- Tilien suojaus (MFA, passkey, salasanamanageri, vuotojen tarkistus)
- Laitteiden kovennus (Windows, macOS, Linux, Android, iOS)
- Sähköpostin huijaussuojaukset (SPF, DKIM, DMARC, koulutus)
- Yksityisyyden vahvistaminen ja digitaalisen jalanjäljen pienentäminen
- Lasten turva-asetukset
- Varmuuskopiointi 3-2-1-mallilla
- Pk-yritysten räätälöidyt paketit
- **100 % tyytyväisyystakuu**

## Kenelle
- Yksityishenkilöt jotka haluavat hallita digitaalista jalanjälkeään
- Pk-yrittäjät jotka tarvitsevat perusasiat kuntoon ilman kallista IT-osastoa
- Henkilöt joilla on erityistä syytä pitää tietoturvasta huolta
  (julkisuuden henkilöt, lähisuhdeväkivallasta toipuvat, journalistit)

## Yhteys
- Sähköposti: <mailto:info@turva.dev>
- Signal: @turva.19 (anonyymi yhteydenotto)
- LinkedIn: https://www.linkedin.com/in/erik1764/

## Yritystiedot
- Y-tunnus: 3600281-7
- YTJ: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Sijainti: Tampere 33100, Suomi

## Lisää
- [Paketit ja hinnoittelu](https://turva.dev/fi/paketit/)
- [Yritys ja Erikin tausta](https://turva.dev/fi/yritys/)
- [Yhteystiedot](https://turva.dev/fi/yhteystiedot/)
- [Tietosuoja ja juridiikka](https://turva.dev/fi/juridiikka/)
`,

  "/fi/paketit/": `# Paketit ja hinnoittelu — turva.dev

Kaikki paketit perustuvat ohjattuun itsepalveluun: et luovuta salasanoja,
et anna etähallintaa. Teet muutokset itse, minä opastan rinnalla.
**Jokaisessa paketissa 100 % tyytyväisyystakuu.**

## Yksityishenkilöille

### Alkukartoitus (30–60 min)
Käymme läpi nykyisen tilanteen: tilit, laitteet, sähköposti, varmuuskopiot,
yksityisyysasetukset. Saat kirjallisen yhteenvedon ja priorisoidun
toimenpidelistan. Sopii lähtöpisteeksi kaikille.

### Tilitilanteen parantaminen
MFA käyttöön kriittisille tileille (passkey jos mahdollista, muuten
authenticator-sovellus). Vahvojen ja yksilöllisten salasanojen käyttöönotto
salasanamanagerilla. Vuotojen tarkistus (have-i-been-pwned, Mozilla Monitor).

### Laitteiden kovennus
Windows, macOS, Linux, Android, iOS — käyttöjärjestelmäkohtaiset
turva-asetukset, automaattiset päivitykset, levynsalaus, lukitusasetukset,
sovellusten oikeuksien siivous.

### Huijaussuojaukset
Tietojenkalastelun, scam-soittojen ja some-huijausten tunnistaminen.
Sähköpostin tekniset suojaukset (SPF, DKIM, DMARC) jos sinulla on
oma domain. Käytännön harjoitukset.

### Lasten turva-asetukset
Ikätason mukaiset rajoitukset laitteille ja palveluille. Yksityisyyden
opettaminen ilman pelottelua. Käytännön työkalut perheen yhteisiin
sopimuksiin.

### Yksityisyyden peruspaketti
Digitaalisen jalanjäljen pienentäminen, vanhojen tilien siivous,
välitön yksityisyyden parantaminen ilmaisilla työkaluilla. Datavälittäjien
opt-out -prosessit Suomessa ja EU:ssa.

### Räätälöidyt paketit
Erityistarpeet: julkisuuden henkilöt, journalistit, lähisuhdeväkivallasta
toipuvat, korkean uhka-arvion tilanteet. Räätälöity sisältö ja luottamuksellinen
työskentely.

## Pk-yrityksille

Räätälöidyt yrityspaketit: työntekijöiden tietoturvakoulutus,
sähköpostin tekniset suojaukset, varmuuskopiointistrategia, MFA-käyttöönotto
koko organisaatiossa, GDPR-perusasiat, etätyön turvaohjeet. Yleensä
paljon kevyempi ja edullisempi kuin oma IT-osasto tai iso konsulttitalo.

## Hinnoittelu ja yhteys
Hinnat keskustelussa, koska tarpeet vaihtelevat. Pyydä tarjous tai
keskustelua ilman sitoumusta:

- <mailto:info@turva.dev>
- Signal @turva.19
`,

  "/fi/yritys/": `# Yritys — turva.dev

turva.dev on Erik Rekolan yksinyrittäjänä pyörittämä tietoturva- ja
yksityisyyskonsultointi. Toimipaikka Tampere, palvelu koko Suomi etänä,
suomeksi ja englanniksi.

## Erikin tausta
- 11 vuotta insinöörinä kansainvälisissä yrityksissä (UPM, Franke,
  Thermo Fisher Scientific, ASM)
- Mechanical Engineering, JAMK
- Electricity & Automation Technology, technical college
- Vahva tausta laadunvarmistuksessa, prosesseissa ja teknisten
  järjestelmien suunnittelussa

## Miksi tämä bisnes
Vuosien aikana huomasin saman ilmiön toistuvasti: tietoturva on
ratkaistu isoissa yrityksissä paljon paremmin kuin yksityishenkilöiden
ja pk-yritysten arjessa. Sama yrittäjä, joka rakentaa lujaa fyysistä
turvallisuutta yritykseensä, käyttää samaa salasanaa viidessä paikassa.

Halusin tarjota saman tason ymmärrystä myös niille, joilla ei ole varaa
omaan IT-osastoon — ja tehdä sen niin, että osaaminen jää asiakkaalle.

## Erottava periaate
- **Et luovuta salasanojasi**
- **Ei etähallintaa**
- **Tekoja, ei pelottelua**
- **Konkretia, ei jargonia**
- **100 % tyytyväisyystakuu**

## Yritystiedot
- Nimi: turva.dev
- Y-tunnus: 3600281-7
- YTJ: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Sijainti: Tampere 33100, Suomi
- Kielet: suomi, englanti
- LinkedIn: https://www.linkedin.com/in/erik1764/
`,

  "/fi/yhteystiedot/": `# Yhteystiedot — turva.dev

## Kanavat
- **Sähköposti:** <mailto:info@turva.dev>
- **Signal:** @turva.19 (anonyymi yhteydenotto, suositeltu arkaluonteisille
  asioille)
- **LinkedIn:** https://www.linkedin.com/in/erik1764/

## Vastausajat
- Sähköposti ja Signal: arkisin 24 tunnin sisällä
- Viikonloppuisin: ei taattua vastausaikaa, kiireelliset asiat
  ensimmäisenä maanantaina

## Anonymiteetti
Voit ottaa yhteyttä nimettömästi Signalilla. Et tarvitse tilausta,
sopimusta tai henkilötietoja keskustellaksesi siitä, voiko
turva.dev auttaa tilanteessasi.

## Maantieteellinen palvelualue
Toimipaikka Tampereella (postinumero 33100). Palvelu tehdään etänä
koko Suomeen — videoneuvotteluna, puhelimitse tai chatissa, asiakkaan
toiveen mukaan.

## Yritystiedot
- Y-tunnus: 3600281-7
- YTJ: https://tietopalvelu.ytj.fi/yritys/3600281-7
`,

  "/fi/juridiikka/": `# Tietosuoja ja juridiikka — turva.dev

## Rekisterinpitäjä
turva.dev (Erik Rekola)
Y-tunnus 3600281-7
Yhteys tietosuoja-asioissa: <mailto:info@turva.dev>

## Käsittelyn periaatteet
- **Salasanoja ei pyydetä eikä säilytetä** — palvelumallin perusperiaate
- **Etäyhteyttä ei oteta** asiakkaan laitteisiin
- **Tietojen minimointi** — kerätään vain mitä palvelun toteuttaminen vaatii
- **Säilytysaika rajattu** — asiakastiedot poistetaan kohtuullisen ajan
  kuluessa palvelun päättymisestä
- **Ei kolmansille osapuolille** — tietoja ei myydä eikä luovuteta
  markkinointiin

## Mitä tietoja kerätään
- Yhteydenottolomakkeiden ja sähköpostin sisältö
- Nimi ja sähköpostiosoite asiakassuhteen ylläpitämiseksi
- Laskutustiedot kirjanpitolain edellyttämässä laajuudessa

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
`,

  "/en/": `# turva.dev — Better security. Better peace of mind.

Practical cybersecurity and privacy consulting for individuals and small
businesses in Finland. Based in Tampere, serving all of Finland remotely.
Languages: Finnish, English.

## Service model: guided self-service

A typical IT consultant asks for your passwords and makes the changes for
you. turva.dev works differently:

- **You don't share your passwords** with anyone
- **You don't grant remote access** to your devices
- **You make the changes yourself**, with clear guidance
- The consultant guides alongside — the skill stays with you

Slower? By a few minutes. Safer and more educational? Significantly.
When the consultant leaves, the security stays.

## What you get
- Account security (MFA, passkey, password manager, breach checks)
- Device hardening (Windows, macOS, Linux, Android, iOS)
- Email scam protections (SPF, DKIM, DMARC, training)
- Privacy strengthening and digital footprint reduction
- Children's safety settings
- 3-2-1 backup strategy
- Tailored SME packages
- **100% satisfaction guarantee**

## Who for
- Individuals who want to control their digital footprint
- SME owners who need the basics done without an expensive IT department
- People with specific reasons to care about security
  (public figures, domestic violence survivors, journalists)

## Contact
- Email: <mailto:info@turva.dev>
- Signal: @turva.19 (anonymous contact)
- LinkedIn: https://www.linkedin.com/in/erik1764/

## Business details
- Business ID: 3600281-7
- Register: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Location: Tampere 33100, Finland

## More
- [Packages and pricing](https://turva.dev/en/packages/)
- [Company and Erik's background](https://turva.dev/en/company/)
- [Contact](https://turva.dev/en/contact/)
- [Legal and privacy](https://turva.dev/en/legal/)
`,

  "/en/packages/": `# Packages and pricing — turva.dev

All packages are based on guided self-service: you don't share passwords,
you don't grant remote access. You make the changes, I guide alongside.
**Every package includes a 100% satisfaction guarantee.**

## For individuals

### Initial assessment (30–60 min)
We review your current state: accounts, devices, email, backups, privacy
settings. You get a written summary and prioritized action list. A good
starting point for everyone.

### Account security
MFA on critical accounts (passkey when possible, otherwise authenticator
app). Strong, unique passwords with a password manager. Breach checks
(have-i-been-pwned, Mozilla Monitor).

### Device hardening
Windows, macOS, Linux, Android, iOS — OS-specific security settings,
automatic updates, disk encryption, lock settings, app permissions cleanup.

### Scam protections
Recognizing phishing, scam calls, and social media fraud. Email technical
protections (SPF, DKIM, DMARC) if you have your own domain. Practical
exercises.

### Children's safety settings
Age-appropriate restrictions for devices and services. Teaching privacy
without scaremongering. Practical tools for family agreements.

### Privacy fundamentals
Reducing your digital footprint, cleaning up old accounts, immediate
privacy improvements with free tools. Data broker opt-out processes
in Finland and the EU.

### Custom packages
Special needs: public figures, journalists, domestic violence survivors,
high-threat situations. Tailored content and confidential work.

## For SMEs

Tailored business packages: employee security awareness training, email
technical protections, backup strategy, organization-wide MFA rollout,
GDPR essentials, remote work guidelines. Usually much lighter and more
affordable than an in-house IT team or a large consultancy.

## Pricing and contact
Prices discussed individually because needs vary. Request a quote or
no-obligation conversation:

- <mailto:info@turva.dev>
- Signal @turva.19
`,

  "/en/company/": `# Company — turva.dev

turva.dev is a sole proprietorship run by Erik Rekola, providing
cybersecurity and privacy consulting. Based in Tampere, serving all of
Finland remotely, in Finnish and English.

## Erik's background
- 11 years as an engineer in international companies (UPM, Franke,
  Thermo Fisher Scientific, ASM)
- Mechanical Engineering, JAMK University of Applied Sciences
- Electricity & Automation Technology, technical college
- Strong background in quality assurance, processes, and the design
  of technical systems

## Why this business
Over the years I noticed the same pattern repeatedly: cybersecurity is
solved much better in large companies than in the daily lives of
individuals and small businesses. The same entrepreneur who builds strong
physical security at their workplace uses the same password in five places.

I wanted to bring that same level of understanding to those who can't
afford an in-house IT department — and do it so the skill stays with the
client.

## Differentiating principles
- **You don't share your passwords**
- **No remote access**
- **Action, not fear**
- **Concrete, not jargon**
- **100% satisfaction guarantee**

## Business details
- Name: turva.dev
- Business ID: 3600281-7
- Register: https://tietopalvelu.ytj.fi/yritys/3600281-7
- Location: Tampere 33100, Finland
- Languages: Finnish, English
- LinkedIn: https://www.linkedin.com/in/erik1764/
`,

  "/en/contact/": `# Contact — turva.dev

## Channels
- **Email:** <mailto:info@turva.dev>
- **Signal:** @turva.19 (anonymous contact, recommended for sensitive
  matters)
- **LinkedIn:** https://www.linkedin.com/in/erik1764/

## Response times
- Email and Signal: within 24 hours on weekdays
- Weekends: no guaranteed response time, urgent matters first thing
  Monday

## Anonymity
You can contact me anonymously via Signal. You don't need a subscription,
contract, or personal details to discuss whether turva.dev can help with
your situation.

## Geographic service area
Based in Tampere (postal code 33100). Service delivered remotely across
Finland — by video conference, phone, or chat, depending on the
client's preference.

## Business details
- Business ID: 3600281-7
- Register: https://tietopalvelu.ytj.fi/yritys/3600281-7
`,

  "/en/legal/": `# Legal and privacy — turva.dev

## Controller
turva.dev (Erik Rekola)
Business ID 3600281-7
Privacy contact: <mailto:info@turva.dev>

## Processing principles
- **Passwords are never requested or stored** — a core principle of the
  service model
- **No remote access** to client devices
- **Data minimization** — only data required for service delivery is
  collected
- **Limited retention** — client data is deleted within a reasonable
  time after the service ends
- **No third parties** — data is not sold or transferred for marketing

## What data is collected
- Contact form and email content
- Name and email address for maintaining the client relationship
- Billing details to the extent required by Finnish accounting law

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
`
};

// -----------------------------------------------------------
// LLMS-FULL.TXT — concatenated full content for agents/LLMs
// Generated from PAGE_MARKDOWN on first request (lazy cached).
// StartupHub.ai Content dimension bonus point.
// -----------------------------------------------------------
function buildLlmsFullTxt() {
  const header = `# turva.dev — Full content (llms-full.txt)

> Concatenated markdown of all primary pages. For LLMs that prefer a
> single document over per-page fetches. Sources are canonical URLs
> on https://turva.dev/.

`;
  const sections = Object.entries(PAGE_MARKDOWN)
    .map(([path, content]) => {
      const canonical = "https://turva.dev" + path;
      return `<!-- ============================================================\n     Source: ${canonical}\n     ============================================================ -->\n\n${content}`;
    })
    .join("\n\n---\n\n");
  return header + sections;
}

let _llmsFullCache = null;
function getLlmsFullTxt() {
  if (_llmsFullCache === null) _llmsFullCache = buildLlmsFullTxt();
  return _llmsFullCache;
}

// -----------------------------------------------------------
// AI.TXT, SECURITY.TXT
// -----------------------------------------------------------
const AI_TXT = `# ai.txt — turva.dev
User-agent: *
Allow: /

Site-name: turva.dev
Owner: Erik Rekola
Contact: <mailto:info@turva.dev>
Languages: fi, en

Training: allowed
Grounding: allowed
Citation: required
Attribution: "turva.dev — Erik Rekola"

Llms: https://turva.dev/llms.txt
Llms-Full: https://turva.dev/llms-full.txt
Sitemap: https://turva.dev/sitemap.xml
Api-catalog: https://turva.dev/.well-known/api-catalog
Mcp-server-card: https://turva.dev/.well-known/mcp/server-card.json
Mcp-endpoint: https://mcp.turva.dev/mcp
Agent-skills: https://turva.dev/.well-known/agent-skills/index.json
`;

// RFC 9116: Expires SHOULD NOT be more than 1 year in the future.
// Current: 12 months from deploy date 2026-05-12.
// Renewal reminder: 2027-04-12 (calendar).
const SECURITY_TXT = `Contact: mailto:info@turva.dev
Expires: 2027-05-12T00:00:00.000Z
Preferred-Languages: fi, en
Canonical: https://turva.dev/.well-known/security.txt
Policy: https://turva.dev/fi/juridiikka/
`;

// -----------------------------------------------------------
// API CATALOG (RFC 9727)
// -----------------------------------------------------------
const API_CATALOG = JSON.stringify({
  "linkset": [{
    "anchor": "https://turva.dev/",
    "service-desc": [{ "href": "https://turva.dev/.well-known/openapi.json", "type": "application/json" }],
    "service-doc":  [
      { "href": "https://turva.dev/llms.txt", "type": "text/plain" },
      { "href": "https://turva.dev/llms-full.txt", "type": "text/plain" },
      { "href": "https://turva.dev/fi/", "type": "text/html", "hreflang": "fi" },
      { "href": "https://turva.dev/en/", "type": "text/html", "hreflang": "en" }
    ],
    "service-meta": [
      { "href": "https://turva.dev/.well-known/mcp/server-card.json", "type": "application/json", "title": "MCP Server Card" },
      { "href": "https://turva.dev/.well-known/agent-skills/index.json", "type": "application/json", "title": "Agent Skills Index" }
    ],
    "author":  [{ "href": "https://www.linkedin.com/in/erik1764/", "title": "Erik Rekola" }],
    "license": [
      { "href": "https://turva.dev/fi/juridiikka/", "hreflang": "fi" },
      { "href": "https://turva.dev/en/legal/", "hreflang": "en" }
    ]
  }]
}, null, 2);

// -----------------------------------------------------------
// OpenAPI 3.1
// -----------------------------------------------------------
const OPENAPI_SPEC = JSON.stringify({
  "openapi": "3.1.0",
  "info": {
    "title": "turva.dev metadata API",
    "version": "1.2.0",
    "description": "Read-only metadata endpoints for AI agents. Public, no authentication.",
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
    "/.well-known/security.txt": { "get": { "summary": "Security", "operationId": "getSecurity", "responses": { "200": { "description": "ok" } } } }
  }
}, null, 2);

const AGENT_JSON = JSON.stringify({
  "schema_version": "v1",
  "name": "turva.dev",
  "description_for_human": "Privacy and security consulting for individuals and SMEs in Finland.",
  "description_for_model": "turva.dev provides cybersecurity and privacy consulting via guided self-service. Pages support Accept: text/markdown. See /.well-known/mcp/server-card.json for MCP discovery; live MCP endpoint at https://mcp.turva.dev/mcp.",
  "contact_email": "info@turva.dev",
  "legal_info_url": "https://turva.dev/en/legal/",
  "auth": { "type": "none" },
  "api": { "type": "openapi", "url": "https://turva.dev/.well-known/openapi.json" }
}, null, 2);

// -----------------------------------------------------------
// MCP SERVER CARD (updated 2026-05-23)
// Now points to live MCP endpoint at mcp.turva.dev/mcp, served by
// the separate turva-mcp Worker (Cloudflare Agents SDK / McpAgent).
// Three read-only tools: get_services, get_security_evidence,
// get_principles.
// -----------------------------------------------------------
const MCP_SERVER_CARD = JSON.stringify({
  "$schema": "https://modelcontextprotocol.io/schemas/server-card/2025-10.json",
  "serverInfo": {
    "name": "turva-mcp",
    "title": "turva.dev",
    "version": "1.0.0",
    "description": "Public read-only MCP server for turva.dev. Exposes service catalog, own-domain security scan evidence, and service-model principles. No authentication, no write operations."
  },
  "transport": {
    "type": "streamable-http",
    "endpoint": "https://mcp.turva.dev/mcp"
  },
  "capabilities": {
    "tools":     { "listChanged": true },
    "resources": { "listChanged": false, "subscribe": false },
    "prompts":   { "listChanged": false }
  },
  "meta": {
    "homepage": "https://turva.dev/",
    "mcpEndpoint": "https://mcp.turva.dev/mcp",
    "openapi": "https://turva.dev/.well-known/openapi.json",
    "agentSkills": "https://turva.dev/.well-known/agent-skills/index.json",
    "apiCatalog": "https://turva.dev/.well-known/api-catalog",
    "llmsTxt": "https://turva.dev/llms.txt",
    "llmsFullTxt": "https://turva.dev/llms-full.txt",
    "contact": "info@turva.dev",
    "languages": ["fi", "en"],
    "tools": [
      { "name": "get_services", "description": "Service catalog with inclusions and exclusions." },
      { "name": "get_security_evidence", "description": "Latest public security scan results for turva.dev (Internet.nl, Hardenize)." },
      { "name": "get_principles", "description": "Service-model principles: guided self-service, no password sharing, no remote access, satisfaction guarantee." }
    ]
  }
}, null, 2);

// -----------------------------------------------------------
// AGENT SKILLS
// -----------------------------------------------------------
const SKILL_CONTACT_INFO = `---
name: contact-info
description: Get the primary contact channels for turva.dev (email, Signal, business ID).
---

# contact-info

Use this skill to retrieve official contact methods for turva.dev.

## Returns

- **Email:** <mailto:info@turva.dev>
- **Signal:** @turva.19
- **Business ID (Finland):** 3600281-7
- **Languages:** Finnish, English
- **Service area:** All of Finland, remotely

## Source
- https://turva.dev/fi/yhteystiedot/
- https://turva.dev/en/contact/
`;

const SKILL_PACKAGES = `---
name: packages
description: List the service packages and pricing model for turva.dev.
---

# packages

Use this skill to learn which cybersecurity and privacy packages turva.dev offers.

## Packages for individuals
- Initial assessment (30–60 min)
- Account security (MFA, passkey, breach checks)
- Device hardening
- Scam protection
- Children's safety settings
- Privacy fundamentals
- Custom packages

## Packages for SMEs
- Tailored business packages

## Model
Guided self-service: the client performs changes themselves. No passwords shared, no remote access. 100% satisfaction guarantee.

## Source
- https://turva.dev/fi/paketit/
- https://turva.dev/en/packages/
`;

const SKILL_COMPANY = `---
name: company-info
description: Get business details and background about turva.dev and its founder.
---

# company-info

Use this skill for formal company data about turva.dev.

## Facts
- **Name:** turva.dev
- **Owner:** Erik Rekola (sole proprietor)
- **Business ID:** 3600281-7
- **Register:** https://tietopalvelu.ytj.fi/yritys/3600281-7
- **Location:** Tampere 33100, Finland
- **Languages:** Finnish, English
- **LinkedIn:** https://www.linkedin.com/in/erik1764/

## Source
- https://turva.dev/fi/yritys/
- https://turva.dev/en/company/
`;

const SKILLS = [
  { name: "contact-info", content: SKILL_CONTACT_INFO },
  { name: "packages",     content: SKILL_PACKAGES },
  { name: "company-info", content: SKILL_COMPANY }
];

async function sha256Hex(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
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

// -----------------------------------------------------------
// WebMCP
// -----------------------------------------------------------
const WEBMCP_SCRIPT = `<script>
(function(){
  if (!navigator.modelContext || typeof navigator.modelContext.provideContext !== 'function') return;
  try {
    navigator.modelContext.provideContext({
      tools: [
        {
          name: 'get_contact',
          description: 'Return official contact channels for turva.dev.',
          inputSchema: { type: 'object', properties: {} },
          execute: async function() {
            return { email: 'info@turva.dev', signal: '@turva.19', businessId: '3600281-7', languages: ['fi','en'] };
          }
        },
        {
          name: 'get_packages',
          description: 'Return the service packages offered by turva.dev.',
          inputSchema: { type: 'object', properties: {} },
          execute: async function() {
            const r = await fetch('/fi/paketit/', { headers: { Accept: 'text/markdown' } });
            return { markdown: await r.text() };
          }
        },
        {
          name: 'get_company',
          description: 'Return business details about turva.dev.',
          inputSchema: { type: 'object', properties: {} },
          execute: async function() {
            return { name: 'turva.dev', owner: 'Erik Rekola', businessId: '3600281-7', location: 'Tampere, Finland' };
          }
        }
      ]
    });
  } catch (e) {}
})();
</script>`;

// -----------------------------------------------------------
// SITEMAP
// -----------------------------------------------------------
const SITEMAP_LASTMOD = "2026-05-23";
const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>https://turva.dev/fi/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/fi/"/></url>
  <url><loc>https://turva.dev/fi/paketit/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/paketit/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/packages/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/fi/paketit/"/></url>
  <url><loc>https://turva.dev/fi/yritys/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/yritys/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/company/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/fi/yritys/"/></url>
  <url><loc>https://turva.dev/fi/yhteystiedot/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/yhteystiedot/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/contact/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/fi/yhteystiedot/"/></url>
  <url><loc>https://turva.dev/fi/juridiikka/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority>
    <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/juridiikka/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/legal/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/fi/juridiikka/"/></url>
  <url><loc>https://turva.dev/en/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/fi/"/></url>
  <url><loc>https://turva.dev/en/packages/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/paketit/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/packages/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/fi/paketit/"/></url>
  <url><loc>https://turva.dev/en/company/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/yritys/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/company/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/fi/yritys/"/></url>
  <url><loc>https://turva.dev/en/contact/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/yhteystiedot/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/contact/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/fi/yhteystiedot/"/></url>
  <url><loc>https://turva.dev/en/legal/</loc><lastmod>${SITEMAP_LASTMOD}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority>
    <xhtml:link rel="alternate" hreflang="fi" href="https://turva.dev/fi/juridiikka/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://turva.dev/en/legal/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://turva.dev/fi/juridiikka/"/></url>
</urlset>`;

// -----------------------------------------------------------
// Hreflang / canonical / schema
// -----------------------------------------------------------
const PAGE_PAIRS = [
  ["/fi/","/en/"],
  ["/fi/paketit","/en/packages"],["/fi/paketit/","/en/packages/"],
  ["/fi/yritys","/en/company"],["/fi/yritys/","/en/company/"],
  ["/fi/yhteystiedot","/en/contact"],["/fi/yhteystiedot/","/en/contact/"],
  ["/fi/juridiikka","/en/legal"],["/fi/juridiikka/","/en/legal/"]
];

function getHreflangForPath(pathname) {
  const pair = PAGE_PAIRS.find(p => p[0]===pathname || p[1]===pathname);
  if (!pair) return null;
  const fiUrl = "https://turva.dev" + pair[0];
  const enUrl = "https://turva.dev" + pair[1];
  return `<link rel="alternate" hreflang="fi" href="${fiUrl}" />
<link rel="alternate" hreflang="en" href="${enUrl}" />
<link rel="alternate" hreflang="x-default" href="${fiUrl}" />`;
}
function getCanonicalForPath(pathname) {
  const pair = PAGE_PAIRS.find(p => p[0]===pathname || p[1]===pathname);
  if (!pair) return null;
  const isFi = pair[0] === pathname;
  return "https://turva.dev" + (isFi ? pair[0] : pair[1]);
}

// -----------------------------------------------------------
// 2026-05-18b: "Contact for price" Offer pattern
// schema.org sallii price="0" + priceSpecification.description
// kun käytössä on "Pricing on request" -malli (yleinen
// palvelukonsulteilla). Tämä toimii StartupHub.ai-skannerin
// "Offer has price + priceCurrency" -tarkistuksessa.
// -----------------------------------------------------------
const SCHEMA_FI = `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"ProfessionalService","@id":"https://turva.dev/#business","name":"turva.dev","url":"https://turva.dev/","image":"https://turva.dev/og.jpg","description":"Käytännönläheistä tietoturva- ja yksityisyysohjausta yksityisille ja pk-yrityksille.","priceRange":"€€","taxID":"3600281-7","vatID":"FI36002817","email":"info@turva.dev","areaServed":{"@type":"Country","name":"Finland"},"address":{"@type":"PostalAddress","addressLocality":"Tampere","postalCode":"33100","addressCountry":"FI"},"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"info@turva.dev","availableLanguage":["Finnish","English"]},"founder":{"@id":"https://turva.dev/#person"},"sameAs":["https://tietopalvelu.ytj.fi/yritys/3600281-7","https://www.linkedin.com/in/erik1764/","https://share.google/oc4jGh7zTx0Qgaj5m"]},
{"@type":"Person","@id":"https://turva.dev/#person","name":"Erik","jobTitle":"Tietoturvakonsultti","worksFor":{"@id":"https://turva.dev/#business"},"sameAs":["https://www.linkedin.com/in/erik1764/"]},
{"@type":"WebSite","@id":"https://turva.dev/#website","url":"https://turva.dev/","name":"turva.dev","publisher":{"@id":"https://turva.dev/#business"},"inLanguage":["fi","en"]},
{"@type":"Service","@id":"https://turva.dev/#service","name":"Tietoturva- ja yksityisyyskonsultointi","provider":{"@id":"https://turva.dev/#business"},"serviceType":"Cybersecurity consulting","areaServed":{"@type":"Country","name":"Finland"},"availableChannel":{"@type":"ServiceChannel","serviceUrl":"https://turva.dev/fi/paketit/","availableLanguage":["fi","en"]},"hasOfferCatalog":{"@type":"OfferCatalog","name":"turva.dev-palvelut","itemListElement":[
{"@type":"Offer","name":"Alkukartoitus","description":"30–60 min nykytila-arvio ja priorisoitu toimenpidelista","url":"https://turva.dev/fi/paketit/","price":"0","priceCurrency":"EUR","priceSpecification":{"@type":"PriceSpecification","price":"0","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Hinnoittelu keskustelussa — pyydä tarjous"},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell"},
{"@type":"Offer","name":"Tilien suojaus","description":"MFA, passkey, salasanamanageri, vuotojen tarkistus","url":"https://turva.dev/fi/paketit/","price":"0","priceCurrency":"EUR","priceSpecification":{"@type":"PriceSpecification","price":"0","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Hinnoittelu keskustelussa — pyydä tarjous"},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell"},
{"@type":"Offer","name":"Laitteiden kovennus","description":"Windows, macOS, Linux, Android, iOS","url":"https://turva.dev/fi/paketit/","price":"0","priceCurrency":"EUR","priceSpecification":{"@type":"PriceSpecification","price":"0","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Hinnoittelu keskustelussa — pyydä tarjous"},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell"},
{"@type":"Offer","name":"Pk-yritysten räätälöidyt paketit","description":"Tietoturvakoulutus, sähköpostisuojaukset, MFA-käyttöönotto","url":"https://turva.dev/fi/paketit/","price":"0","priceCurrency":"EUR","priceSpecification":{"@type":"PriceSpecification","price":"0","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Hinnoittelu keskustelussa — pyydä tarjous"},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell"}
]}},
{"@type":"FAQPage","@id":"https://turva.dev/fi/#faq","inLanguage":"fi","mainEntity":[
{"@type":"Question","name":"Pitääkö minun luovuttaa salasanani tai antaa etähallintaa laitteilleni?","acceptedAnswer":{"@type":"Answer","text":"Ei. Palvelu perustuu ohjattuun itsepalveluun."}},
{"@type":"Question","name":"Voiko digitaalisen jalanjäljen poistaa kokonaan internetistä?","acceptedAnswer":{"@type":"Answer","text":"Täydellinen poisto on harvoin mahdollista, mutta jalanjälkeä voi pienentää huomattavasti."}},
{"@type":"Question","name":"Mitä alkukartoituksessa tapahtuu?","acceptedAnswer":{"@type":"Answer","text":"Alkukartoitus kestää 30-60 min ja sisältää kirjallisen yhteenvedon."}},
{"@type":"Question","name":"Sopiiko palvelu vain teknisille ihmisille?","acceptedAnswer":{"@type":"Answer","text":"Ei. Ohjeet ovat selkeitä kenelle tahansa."}},
{"@type":"Question","name":"Missä palvelu toimii maantieteellisesti?","acceptedAnswer":{"@type":"Answer","text":"Toimipaikka Tampereella, palvelu koko Suomeen etänä."}},
{"@type":"Question","name":"Mitä palvelu maksaa ja onko tyytyväisyystakuu?","acceptedAnswer":{"@type":"Answer","text":"Hinnoittelu sivulla /fi/paketit. 100 % tyytyväisyystakuu."}},
{"@type":"Question","name":"Mitä palveluita turva.dev tarjoaa?","acceptedAnswer":{"@type":"Answer","text":"Alkukartoitus, tilit, laitteet, huijaussuojaukset, lapset, yksityisyys, räätälöidyt."}},
{"@type":"Question","name":"Voinko ottaa yhteyttä nimettömästi?","acceptedAnswer":{"@type":"Answer","text":"Kyllä, Signalilla @turva.19 tai sähköpostilla."}}
]}
]}
</script>`;

const SCHEMA_EN = `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"ProfessionalService","@id":"https://turva.dev/#business","name":"turva.dev","url":"https://turva.dev/","image":"https://turva.dev/og.jpg","description":"Practical cybersecurity and privacy consulting for individuals and SMEs.","priceRange":"€€","taxID":"3600281-7","vatID":"FI36002817","email":"info@turva.dev","areaServed":{"@type":"Country","name":"Finland"},"address":{"@type":"PostalAddress","addressLocality":"Tampere","postalCode":"33100","addressCountry":"FI"},"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"info@turva.dev","availableLanguage":["Finnish","English"]},"founder":{"@id":"https://turva.dev/#person"},"sameAs":["https://tietopalvelu.ytj.fi/yritys/3600281-7","https://www.linkedin.com/in/erik1764/","https://share.google/oc4jGh7zTx0Qgaj5m"]},
{"@type":"Person","@id":"https://turva.dev/#person","name":"Erik","jobTitle":"Cybersecurity consultant","worksFor":{"@id":"https://turva.dev/#business"},"sameAs":["https://www.linkedin.com/in/erik1764/"]},
{"@type":"WebSite","@id":"https://turva.dev/#website","url":"https://turva.dev/","name":"turva.dev","publisher":{"@id":"https://turva.dev/#business"},"inLanguage":["fi","en"]},
{"@type":"Service","@id":"https://turva.dev/#service","name":"Cybersecurity and privacy consulting","provider":{"@id":"https://turva.dev/#business"},"serviceType":"Cybersecurity consulting","areaServed":{"@type":"Country","name":"Finland"},"availableChannel":{"@type":"ServiceChannel","serviceUrl":"https://turva.dev/en/packages/","availableLanguage":["fi","en"]},"hasOfferCatalog":{"@type":"OfferCatalog","name":"turva.dev services","itemListElement":[
{"@type":"Offer","name":"Initial assessment","description":"30–60 min state review and prioritized action list","url":"https://turva.dev/en/packages/","price":"0","priceCurrency":"EUR","priceSpecification":{"@type":"PriceSpecification","price":"0","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Pricing on request — contact for quote"},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell"},
{"@type":"Offer","name":"Account security","description":"MFA, passkey, password manager, breach checks","url":"https://turva.dev/en/packages/","price":"0","priceCurrency":"EUR","priceSpecification":{"@type":"PriceSpecification","price":"0","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Pricing on request — contact for quote"},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell"},
{"@type":"Offer","name":"Device hardening","description":"Windows, macOS, Linux, Android, iOS","url":"https://turva.dev/en/packages/","price":"0","priceCurrency":"EUR","priceSpecification":{"@type":"PriceSpecification","price":"0","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Pricing on request — contact for quote"},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell"},
{"@type":"Offer","name":"SME custom packages","description":"Security awareness training, email protections, MFA rollout","url":"https://turva.dev/en/packages/","price":"0","priceCurrency":"EUR","priceSpecification":{"@type":"PriceSpecification","price":"0","priceCurrency":"EUR","valueAddedTaxIncluded":false,"description":"Pricing on request — contact for quote"},"availability":"https://schema.org/InStock","businessFunction":"https://schema.org/Sell"}
]}},
{"@type":"FAQPage","@id":"https://turva.dev/en/#faq","inLanguage":"en","mainEntity":[
{"@type":"Question","name":"Do I need to share my passwords or give remote access?","acceptedAnswer":{"@type":"Answer","text":"No. The service is based on guided self-service."}},
{"@type":"Question","name":"Can my digital footprint be removed entirely from the internet?","acceptedAnswer":{"@type":"Answer","text":"Complete removal is rarely possible, but the footprint can be significantly reduced."}},
{"@type":"Question","name":"What happens during the initial assessment?","acceptedAnswer":{"@type":"Answer","text":"30-60 min session, written summary and action plan."}},
{"@type":"Question","name":"Is this service only for technical people?","acceptedAnswer":{"@type":"Answer","text":"No. Written clearly for anyone."}},
{"@type":"Question","name":"Where do you operate geographically?","acceptedAnswer":{"@type":"Answer","text":"Based in Tampere, serving all of Finland remotely."}},
{"@type":"Question","name":"How much does it cost and is there a satisfaction guarantee?","acceptedAnswer":{"@type":"Answer","text":"Pricing at /en/packages. 100% satisfaction guarantee."}},
{"@type":"Question","name":"What services does turva.dev offer?","acceptedAnswer":{"@type":"Answer","text":"Assessment, account security, devices, scam protection, children, privacy, custom."}},
{"@type":"Question","name":"Can I contact you anonymously?","acceptedAnswer":{"@type":"Answer","text":"Yes, via Signal @turva.19 or email."}}
]}
]}
</script>`;

class LinkRelCleaner {
  element(element) {
    const rel = (element.getAttribute("rel") || "").toLowerCase();
    const hreflang = element.getAttribute("hreflang");
    if (rel === "canonical" || (rel === "alternate" && hreflang)) element.remove();
  }
}

function appendAgentLinks(headers) {
  headers.append('Link','</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"');
  headers.append('Link','</.well-known/openapi.json>; rel="service-desc"; type="application/json"');
  headers.append('Link','</llms.txt>; rel="service-doc"; type="text/plain"');
  headers.append('Link','</llms-full.txt>; rel="service-doc"; type="text/plain"; title="Full content"');
  headers.append('Link','</.well-known/mcp/server-card.json>; rel="service-meta"; type="application/json"');
  headers.append('Link','</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"');
  headers.append('Link','</llms.txt>; rel="describedby"; type="text/plain"');
  headers.append('Link','</sitemap.xml>; rel="sitemap"; type="application/xml"');
  headers.append('Link','</.well-known/security.txt>; rel="security-txt"; type="text/plain"');
  headers.append('Link','</.well-known/ai.txt>; rel="ai-policy"; type="text/plain"');
  headers.append('Link','</robots.txt>; rel="robots"; type="text/plain"');
  headers.append('Link','<https://www.linkedin.com/in/erik1764/>; rel="author"');
  headers.append('Link','</en/legal/>; rel="license"');
}

function injectHtml(response, pathname) {
  const ct = response.headers.get("content-type") || "";
  if (!ct.includes("text/html")) {
    const r = new Response(response.body, response);
    applySecurityHeaders(r.headers, "default");
    return r;
  }

  const hreflangHtml = getHreflangForPath(pathname);
  if (!hreflangHtml) {
    appendAgentLinks(response.headers);
    applySecurityHeaders(response.headers, "html");
    return response;
  }

  const isFiHome = (pathname === "/fi/" || pathname === "/fi");
  const isEnHome = (pathname === "/en/" || pathname === "/en");
  const canonicalUrl = getCanonicalForPath(pathname);

  const transformed = new HTMLRewriter()
    .on("link", new LinkRelCleaner())
    .on("head", {
      element(el) {
        if (canonicalUrl) el.append(`<link rel="canonical" href="${canonicalUrl}" />`, { html: true });
        el.append(hreflangHtml, { html: true });
        el.append(`<link rel="api-catalog" href="https://turva.dev/.well-known/api-catalog" type="application/linkset+json" />`, { html: true });
        el.append(`<link rel="service-desc" href="https://turva.dev/.well-known/openapi.json" type="application/json" />`, { html: true });
        el.append(`<link rel="service-doc" href="https://turva.dev/llms.txt" type="text/plain" />`, { html: true });
        el.append(`<link rel="service-doc" href="https://turva.dev/llms-full.txt" type="text/plain" title="Full content" />`, { html: true });
        el.append(`<link rel="service-meta" href="https://turva.dev/.well-known/mcp/server-card.json" type="application/json" />`, { html: true });
        el.append(`<link rel="agent-skills" href="https://turva.dev/.well-known/agent-skills/index.json" type="application/json" />`, { html: true });
        if (isFiHome) el.append(SCHEMA_FI, { html: true });
        else if (isEnHome) el.append(SCHEMA_EN, { html: true });
        el.append(WEBMCP_SCRIPT, { html: true });
      }
    })
    .transform(response);

  appendAgentLinks(transformed.headers);
  applySecurityHeaders(transformed.headers, "html");
  transformed.headers.set('Vary', 'Accept, Accept-Language');
  transformed.headers.append('Link', `<${canonicalUrl || 'https://turva.dev' + pathname}>; rel="alternate"; type="text/markdown"`);
  return transformed;
}

function preferredLangRedirect(request) {
  const al = (request.headers.get("Accept-Language") || "").toLowerCase();
  const fiIdx = al.indexOf("fi");
  const enIdx = al.indexOf("en");
  if (enIdx !== -1 && (fiIdx === -1 || enIdx < fiIdx)) return "https://turva.dev/en/";
  return "https://turva.dev/fi/";
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

// MTA-STS policy is its own minimal response — no agent Link headers,
// no CORS noise, just the policy text. Browsers and MTAs expect text/plain.
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
  const parts = accept.split(",").map(p => p.trim().split(";")[0].trim());
  return parts.includes("text/markdown");
}

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

// =============================================================
// MAIN
// =============================================================
export default {
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
      const errResponse = new Response(err.stack || String(err), { status: 500 });
      applySecurityHeaders(errResponse.headers, "default");
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

  // ---- MTA-STS subdomain ----
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
    const target = isBotAgent ? "https://turva.dev/fi/" : preferredLangRedirect(request);
    return Response.redirect(target, 301);
  }

  if (pathname === "/fi" || pathname === "/en") {
    return Response.redirect("https://turva.dev" + pathname + "/" + url.search, 301);
  }

  // ---- Markdown negotiation ----
  if (wantsMarkdown(request) && PAGE_MARKDOWN[pathname]) {
    const canonicalUrl = getCanonicalForPath(pathname) || ("https://turva.dev" + pathname);
    return serveMarkdown(PAGE_MARKDOWN[pathname], canonicalUrl);
  }

  // ---- robots.txt ----
  if (pathLower === "/robots.txt") {
    return serveStatic(ROBOTS_TXT, "text/plain; charset=utf-8", "agent-api");
  }

  // ---- Agent discovery ----
  if (pathLower === "/.well-known/api-catalog" || pathLower === "/api-catalog") {
    return serveStatic(API_CATALOG, "application/linkset+json; charset=utf-8", "agent-api");
  }
  if (pathLower === "/.well-known/openapi.json" || pathLower === "/openapi.json") {
    return serveStatic(OPENAPI_SPEC, "application/json; charset=utf-8", "agent-api");
  }

  if (pathLower === "/.well-known/mcp/server-card.json" ||
      pathLower === "/.well-known/mcp.json" ||
      pathLower === "/.well-known/agent.json" ||
      pathLower === "/.well-known/ai-plugin.json") {
    if (pathLower === "/.well-known/agent.json" || pathLower === "/.well-known/ai-plugin.json") {
      return serveStatic(AGENT_JSON, "application/json; charset=utf-8", "agent-api");
    }
    return serveStatic(MCP_SERVER_CARD, "application/json; charset=utf-8", "agent-api");
  }

  if (pathLower === "/.well-known/agent-skills/index.json") {
    const body = await buildSkillsIndex();
    return serveStatic(body, "application/json; charset=utf-8", "agent-api");
  }
  const skillMatch = pathLower.match(/^\/\.well-known\/agent-skills\/([a-z0-9-]+)\/skill\.md$/);
  if (skillMatch) {
    const s = SKILLS.find(x => x.name === skillMatch[1]);
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

  // Prerender.io
  const newURL = `https://service.prerender.io/${request.url}`;
  const newHeaders = new Headers(request.headers);
  newHeaders.set("X-Prerender-Token", env.PRERENDER_TOKEN);
  newHeaders.set("X-Prerender-Int-Type", "CloudFlare");
  const prerenderResponse = await fetch(new Request(newURL, { headers: newHeaders, redirect: "manual" }));
  const botResponse = new Response(prerenderResponse.body, prerenderResponse);
  appendAgentLinks(botResponse.headers);
  applySecurityHeaders(botResponse.headers, "html");
  botResponse.headers.set('Vary', 'Accept, Accept-Language');
  return botResponse;
}
