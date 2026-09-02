import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { findLinkRelations } from "../src/worker.js";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

// facts.json owns which services exist. The service count used to be written into this
// file by hand, as `>= 5` with a message saying "all five offerings", so it was wrong by
// one and loose in the direction that matters: a service dropping out of the A2A answer
// still passed. Corrected 2026-08-16 (round 12, batch E16, finding B2-18).
const facts = JSON.parse(readFileSync(new URL("../../tools/facts.json", import.meta.url), "utf8"));

// Route-level tests for the Worker, run offline against the module itself.
// Why these exist: "every declared surface resolves in code" was a habit enforced
// by reading and by post-deploy fetches. On 2026-07-24 an audit found the ACP
// discovery document declaring https://turva.dev/api/acp while that path returned
// the site's HTML 404 page. Nothing caught it because nothing exercised the router
// before a deploy. These cases make the promise mechanical: they run in well under
// a second, need no network, and fail before wrangler is ever invoked.
const env = {}; // no RATE_LIMITER binding: exercises the documented fail-open path

const get = (path, opts = {}) =>
  worker.fetch(new Request("https://turva.dev" + path, { method: opts.method || "GET", headers: opts.headers || {} }), env);

const json = async (res) => JSON.parse(await res.text());

test("ACP: the declared api_base_url resolves as JSON, not as the HTML 404", async () => {
  for (const p of ["/api/acp", "/api/acp/", "/API/ACP"]) {
    const r = await get(p);
    assert.equal(r.status, 200, p + " must resolve");
    assert.match(r.headers.get("content-type"), /application\/json/, p + " must be JSON");
    const j = await json(r);
    assert.equal(j.protocol, "acp");
    assert.ok(j.endpoints.create_checkout_session.url.endsWith("/api/acp/checkout_sessions"));
  }
});

test("ACP: the manifest's api_base_url is the path that actually resolves", async () => {
  const manifest = await json(await get("/.well-known/acp"));
  const base = new URL(manifest.api_base_url).pathname;
  assert.equal((await get(base)).status, 200, "api_base_url " + base + " must resolve");
});

test("ACP checkout: stateless session rules hold", async () => {
  assert.equal((await get("/api/acp/checkout_sessions")).status, 405); // create requires POST
  assert.equal((await get("/api/acp/checkout_sessions/bogus")).status, 404); // id encodes the service
  const good = "/api/acp/checkout_sessions/acp_sess_audit_00000000-0000-0000-0000-000000000000";
  const s = await json(await get(good));
  assert.equal(s.status, "not_ready_for_payment");
  assert.equal((await get(good + "/complete", { method: "POST" })).status, 422);
});

test("MCP server card declares only the capabilities the server implements", async () => {
  const card = await json(await get("/.well-known/mcp/server-card.json"));
  assert.deepEqual(Object.keys(card.capabilities), ["tools"],
    "the live server registers tools only and answers -32601 to resources/list and prompts/list; " +
    "declaring more here puts a promise the code does not keep inside a signed manifest");
  assert.equal(card.tools.length, 4);
});

test("commerce surfaces never report an unpaid request as paid", async () => {
  for (const p of ["/api", "/api/", "/x402", "/api/agent/audit", "/api/agent/advisory", "/api/agent/implementation"]) {
    assert.equal((await get(p)).status, 402, p + " must answer with the 402 challenge");
  }
  // even with a forged payment header
  assert.equal((await get("/api/agent/audit", { headers: { "X-PAYMENT": "forged" } })).status, 402);
});

test("a trailing slash redirects to the canonical path for every served page", async () => {
  for (const p of ["/services", "/company", "/contact", "/legal", "/guides", "/blog", "/tools", "/badge",
                   "/llms-txt-validator", "/guides/llms-txt", "/blog/reliable-agent-decisions"]) {
    const r = await get(p + "/");
    assert.equal(r.status, 301, p + "/ must redirect");
    assert.equal(r.headers.get("location"), "https://turva.dev" + p);
  }
  assert.equal((await get("/nonexistent-path/")).status, 404, "an unknown path stays an honest 404");
});

test("agent-API routes are not swallowed by the slash normaliser", async () => {
  assert.equal((await get("/api/v1")).status, 200);
  assert.equal((await get("/api/v1/")).status, 200);
});

test("every path listed in the API index resolves", async () => {
  const idx = await json(await get("/api/v1"));
  for (const url of Object.values(idx.endpoints)) {
    const u = new URL(url);
    if (u.hostname !== "turva.dev") continue; // mcp.turva.dev is a separate Worker
    // A POST-only endpoint answers 405 to a GET, which is a resolving path rather than a
    // missing one. Probing it with its own method keeps this gate meaningful for both kinds:
    // an undeclared or dead path still fails, because the HTML 404 is neither 200 nor 402.
    const r = u.pathname.endsWith(":send")
      ? await worker.fetch(new Request(u.toString(), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: { role: "user", parts: [], messageId: "idx" } })
        }), env, {})
      : await get(u.pathname);
    assert.ok(r.status === 200 || r.status === 402, u.pathname + " -> " + r.status);
  }
});

test("the site version is the same in every manifest that carries one", async () => {
  const openapi = await json(await get("/openapi.json"));
  const a2a = await json(await get("/.well-known/agent-card.json"));
  assert.equal(openapi.info.version, a2a.version);
});

test("unmatched paths return the Worker's own 404, with no origin behind it", async () => {
  const r = await get("/definitely-not-a-page");
  assert.equal(r.status, 404);
  assert.match(r.headers.get("content-type"), /text\/html/);
});

// A2A: the agent card declared url + HTTP+JSON transport and three skills while nothing
// answered on that transport at all, so a POST got the homepage HTML. Found by the monthly
// credibility audit 2026-08-01. These cases bind three things that had drifted apart: the
// card's url, the card's skill descriptions, and the data the endpoint actually returns.
// A first version asserted only that some object came back, and a mutation test that swapped
// the contact and company payloads passed it, so every skill now asserts content unique to it.
const a2aSend = (body) => worker.fetch(new Request("https://turva.dev/v1/message:send", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body)
}), env, {});

test("A2A: the transport the card declares answers, in the envelope the spec defines", async () => {
  const card = await (await get("/.well-known/agent-card.json")).json();
  assert.equal(card.preferredTransport, "HTTP+JSON");
  assert.equal(new URL(card.url).pathname.replace(/\/$/, ""), "", "card url is the transport base");
  const res = await a2aSend({ message: { role: "user", parts: [{ kind: "text", text: "services" }], messageId: "t1" } });
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /application\/json/);
  const body = await res.json();
  // Spec 0.3.0 REST binding: the response is { message?, task? }, not a bare Message.
  assert.equal(body.kind, undefined, "a bare Message hands a conformant client undefined");
  assert.equal(body.message.kind, "message");
  assert.equal(body.message.role, "agent");
  assert.ok(body.message.messageId);
  assert.deepEqual(body.message.metadata.skills, ["services"]);
});

test("A2A: every skill the card declares returns the data its own description promises", async () => {
  const card = await (await get("/.well-known/agent-card.json")).json();
  const byId = Object.fromEntries(card.skills.map((s) => [s.id, s]));
  assert.deepEqual(Object.keys(byId).sort(), ["company-info", "contact-info", "services"]);
  const dataFor = async (id) => {
    const r = await a2aSend({ message: { role: "user", parts: [], messageId: "t", metadata: { skillId: id } } });
    assert.equal(r.status, 200, id + " must resolve");
    const b = await r.json();
    assert.deepEqual(b.message.metadata.skills, [id]);
    assert.equal(b.message.parts.length, 1);
    assert.equal(b.message.parts[0].kind, "data");
    return b.message.parts[0].data;
  };

  const services = await dataFor("services");
  assert.equal(services.skill, "services");
  assert.ok(Array.isArray(services.services), "services answers with a list");
  assert.equal(services.services.length, facts.services.length, "every offering facts.json names");
  assert.ok(services.engagement.length > 10);
  assert.equal(services.businessId, undefined, "services must not answer with the company payload");

  // The card promises email, Signal, LinkedIn and the business ID here, so the test reads the
  // card's own description and requires each named channel to come back.
  const contact = await dataFor("contact-info");
  assert.equal(contact.skill, "contact-info");
  const desc = byId["contact-info"].description.toLowerCase();
  for (const named of ["email", "signal", "linkedin", "business id"]) {
    assert.ok(desc.includes(named), "card still promises " + named);
  }
  assert.match(contact.email, /@turva\.dev$/);
  assert.match(contact.signal, /^https:\/\/signal\.me\//);
  assert.match(contact.linkedin, /linkedin\.com/);
  assert.match(contact.businessId, /^\d{7}-\d$/);

  const company = await dataFor("company-info");
  assert.equal(company.skill, "company-info");
  assert.ok(company.founder && company.description && Array.isArray(company.sameAs));
  assert.equal(company.email, undefined, "company must not answer with the contact payload");
});

test("A2A: wrong method, bad body, unknown skill and unknown method all answer as JSON", async () => {
  const g = await get("/v1/message:send");
  assert.equal(g.status, 405);
  assert.equal(g.headers.get("allow"), "POST, OPTIONS");
  assert.match(g.headers.get("content-type"), /application\/json/);

  const bad = await a2aSend({});
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).error.code, -32602);

  // A named skill that does not exist is an error, not a silent success that returns everything.
  const unknownSkill = await a2aSend({ message: { role: "user", parts: [], messageId: "t", metadata: { skillId: "nope" } } });
  assert.equal(unknownSkill.status, 400);
  const us = await unknownSkill.json();
  assert.equal(us.error.code, -32602);
  assert.deepEqual(us.error.data.skills, ["services", "contact-info", "company-info"]);

  // A deeply nested array used to reach String() and throw RangeError out of the handler,
  // answering 500 to an 8 kB body. Only a string is accepted now.
  let deep = [];
  for (let i = 0; i < 4000; i++) deep = [deep];
  const nested = await a2aSend({ message: { role: "user", parts: [], messageId: "t", metadata: { skillId: deep } } });
  assert.equal(nested.status, 200, "a non-string skillId must not crash the handler");

  const unknown = await get("/v1/tasks/get");
  assert.equal(unknown.status, 404);
  const u = await unknown.json();
  assert.equal(u.error.code, -32601);
  assert.ok(u.error.data.supported.includes("POST /v1/message:send"));

  // /v1/card is the authenticated extended card and this card declares no support for it.
  const cardRoute = await get("/v1/card");
  assert.equal(cardRoute.status, 404);

  const pre = await worker.fetch(new Request("https://turva.dev/v1/message:send", { method: "OPTIONS" }), env, {});
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get("access-control-allow-methods"), "POST, OPTIONS");

  const slash = await get("/v1/message:send/");
  assert.equal(slash.status, 301);
});

// v2 of the llms.txt proposal asks for the markdown version of a page at an address an
// agent can derive without an Accept header. The twin already existed behind content
// negotiation, so the risk of adding the address is not that it 404s, it is that the two
// forms drift apart and the site starts answering two different documents at one page.
// Every canonical path in the sitemap is checked byte for byte here, offline, which is
// the cheap half of the live --twins run in tools/verify.mjs.

const sitemapPaths = async () => {
  const xml = await (await get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>https:\/\/turva\.dev([^<]*)<\/loc>/g)].map((m) => m[1]);
};

test("every canonical path answers at its .md address with the same bytes as the negotiated twin", async () => {
  const paths = await sitemapPaths();
  assert.ok(paths.length > 40, "sitemap should list the pages, got " + paths.length);
  const broken = [];
  for (const path of paths) {
    if (path.endsWith(".md")) continue;
    const mdUrl = path === "/" ? "/index.md" : path + ".md";
    const direct = await get(mdUrl);
    if (direct.status !== 200) { broken.push(mdUrl + ": HTTP " + direct.status); continue; }
    if (!/text\/markdown/.test(direct.headers.get("content-type") || "")) { broken.push(mdUrl + ": not markdown"); continue; }
    const negotiated = await get(path, { headers: { accept: "text/markdown" } });
    const a = await direct.text(), b = await negotiated.text();
    if (a !== b) broken.push(mdUrl + ": differs from the negotiated twin");
    if (direct.headers.get("content-location") !== "https://turva.dev" + path) broken.push(mdUrl + ": content-location is not the page");
  }
  assert.deepEqual(broken, [], "the .md address and the negotiated twin must be the same document");
});

test("the homepage markdown answers at both names v2 allows for a URL with no file name", async () => {
  const home = await (await get("/", { headers: { accept: "text/markdown" } })).text();
  for (const p of ["/index.md", "/index.html.md"]) {
    const r = await get(p);
    assert.equal(r.status, 200, p);
    assert.equal(await r.text(), home, p + " must serve the home markdown");
  }
});

test("both address forms v2 names answer for a page, not only for the home page", async () => {
  const plain = await get("/guides/llms-txt.md");
  const withHtml = await get("/guides/llms-txt.html.md");
  assert.equal(withHtml.status, 200, "/guides/llms-txt.html.md must answer");
  assert.equal(await withHtml.text(), await plain.text(), "both forms must return the same document");
  assert.equal((await get("/auth.html.md")).status, 404, "the form does not invent pages that do not exist");
});

// The parser that reads another site's link relations. It is measured here as well as
// in the npm package, because the hosted validator is the canonical one: a parser that
// reports a relation the target does not actually serve is the one failure a check on
// someone else's site may not have. Both cases below were found by an independent
// review on the day this shipped.
test("findLinkRelations does not count what a page did not publish", () => {
  assert.deepEqual(
    findLinkRelations('<head><!-- <link rel="alternate" type="text/markdown" href="/commented.md"> --></head>', ""),
    { describedby: null, markdown: null });
  // An unterminated comment swallows the rest of the document for a real parser,
  // so nothing behind it is published either.
  assert.deepEqual(
    findLinkRelations('<head><!-- <link rel="describedby" href="/x.txt"><link rel="alternate" type="text/markdown" href="/x.md">', ""),
    { describedby: null, markdown: null });
  // script and style are raw text: <!-- inside them opens no comment, so a link
  // element after the closing tag IS published. Checked against parse5.
  assert.equal(findLinkRelations('<head><script><!--\nvar x = 1;\n</script><link rel="describedby" href="/real">', "").describedby, "/real");
  assert.equal(findLinkRelations('<head><style><!-- .a{} </style><link rel="describedby" href="/real">', "").describedby, "/real");
  // A link element written inside a script is not published, and neither is
  // anything after an unclosed script.
  assert.equal(findLinkRelations('<head><script>var s = "<link rel=describedby href=/nope>";</script>', "").describedby, null);
  assert.equal(findLinkRelations('<head><script>var x = 1;<link rel="describedby" href="/nope">', "").describedby, null);
  // <!--> and <!---> are empty comments, not unterminated ones.
  assert.equal(findLinkRelations('<head><!--><link rel="describedby" href="/after">', "").describedby, "/after");
  assert.equal(findLinkRelations('<head><!---><link rel="describedby" href="/after">', "").describedby, "/after");
  assert.equal(findLinkRelations('<head><!-- x --!><link rel="describedby" href="/after">', "").describedby, "/after");
  // The strip is one left to right pass, so a comment that only MENTIONS a script
  // tag in prose does not eat the document up to the next real </script>.
  assert.equal(
    findLinkRelations('<head><!-- put your <script> tag here --><link rel="alternate" type="text/markdown" href="/found"><script>var r = 1;</script></head>', "").markdown,
    "/found");
  // title and textarea are RCDATA: a link tag written in a title is TEXT, not markup,
  // and a page whose title mentions HTML syntax is exactly what this validator reads.
  assert.equal(findLinkRelations('<head><title>How to use <link rel=describedby> for llms.txt</title></head>', "").describedby, null);
  assert.equal(findLinkRelations('<head><title>How to use <link rel=describedby></title><link rel="describedby" href="/real"></head>', "").describedby, "/real");
  // A tag that never closes is not a tag, and the scan must not slow down over it.
  // The regex this replaced was quadratic: 16 000 unclosed "<link" measured 196 ms and
  // 256 KB of them would have taken minutes. Generous bound so the test is not flaky.
  const pathological = "<link".repeat(52428);
  const t0 = Date.now();
  assert.deepEqual(findLinkRelations(pathological, ""), { describedby: null, markdown: null });
  assert.deepEqual(findLinkRelations("", "<".repeat(65536)), { describedby: null, markdown: null });
  assert.ok(Date.now() - t0 < 2000, "256 KB of unclosed tags must not take seconds");
  // "<link<link<link rel=..." is ONE tag whose name is "link<link<link", not a link
  // element, so nothing is published. Measured against parse5.
  assert.equal(findLinkRelations('<head><link<link<link rel="describedby" href="/real">', "").describedby, null);
  // A real link element after an unclosed tag IS read.
  assert.equal(findLinkRelations('<head><meta<link rel="describedby" href="/real">', "").describedby, null);
  // A p element ends the head, so what follows it is body content and not one of these
  // two checks. Erik's decision 2026-08-24: the strict reading of "the page's head".
  assert.equal(findLinkRelations('<head><p class="x"><link rel="describedby" href="/real">', "").describedby, null);
  assert.equal(findLinkRelations('<head><meta charset="utf-8"><link rel="describedby" href="/real">', "").describedby, "/real");
  // A link element after </head> but before any body content is still in the head for a
  // parser, and it is counted.
  assert.equal(findLinkRelations('<head></head><link rel="describedby" href="/real">', "").describedby, "/real");
  // Three shapes a 200 000 input fuzz run against parse5 turned up (Tek-127).
  // A "<" that no letter follows is text, and the tag after it is still a tag.
  assert.equal(findLinkRelations('<head><<style><link rel="describedby" href="/x"></style>', "").describedby, null);
  // A "<" that no letter follows is text, and text ends the head, so nothing after it is
  // head metadata any more.
  assert.equal(findLinkRelations('<head><<link rel="describedby" href="/real">', "").describedby, null);
  // A ">" inside a quoted attribute value does not end the tag.
  assert.equal(findLinkRelations('<head><link data-x="a>b" rel="describedby" href="/q">', "").describedby, "/q");
  // </script/> closes a raw text element as well.
  assert.equal(findLinkRelations('<head><script>var s = "x";</script/><link rel="describedby" href="/real">', "").describedby, "/real");
  // Text in the head ends the head.
  assert.equal(findLinkRelations('<head>hello<link rel="describedby" href="/real">', "").describedby, null);
  // Three shapes an independent 240 000 input fuzz round found, all measured against parse5.
  // After </head> the parser is in "after head", where noscript is NOT one of the elements
  // that still go into the head: it opens the body instead.
  assert.equal(findLinkRelations('<head></head><noscript><link rel=describedby href=/a></noscript><link rel=describedby href=/z>', "").describedby, null);
  // "</templateX" is not an end tag: for the tokenizer the name runs on to the next ">".
  assert.equal(findLinkRelations('<head><template></templateX</template><link rel=describedby href=/z></head>', "").describedby, null);
  // Inside a script, <!-- and a nested <script> put the tokenizer in the double escaped
  // state, where </script> ends the escape and not the element.
  assert.equal(findLinkRelations('<head><script><!-- <script>x</script> --></script><link rel=describedby href=/real>', "").describedby, "/real");
  // template content is inert, so a link element inside one is not published.
  assert.equal(findLinkRelations('<head><template><link rel="describedby" href="/inert"></template></head>', "").describedby, null);
  assert.equal(findLinkRelations('<head><template><link rel="describedby" href="/inert"></template><link rel="describedby" href="/real"></head>', "").describedby, "/real");
  assert.equal(findLinkRelations("<head><link rel=alternate type=text/markdown href=/noquotes.md></head>", "").markdown, "/noquotes.md");
  assert.equal(findLinkRelations('<head><link rel="alternate stylesheet" type="text/css" href="/a.css"></head>', "").markdown, null);
  assert.equal(findLinkRelations('<head><link rel="alternate" type="text/markdown; charset=utf-8" href="/a.md"></head>', "").markdown, "/a.md");
  const f = findLinkRelations("", '</a,b.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"');
  assert.equal(f.markdown, "/a,b.md");
  assert.equal(f.describedby, "/llms.txt");
});

test("the .md route does not swallow paths that are not page twins", async () => {
  const auth = await get("/auth.md");
  assert.equal(auth.status, 200);
  assert.match(await auth.text(), /^# Auth\.md/, "/auth.md is its own document, not a page twin");
  assert.equal((await get("/no-such-page.md")).status, 404);
});

test("a page points at its markdown address with the two v2 relations", async () => {
  const r = await get("/guides/llms-txt");
  const html = await r.text();
  const link = r.headers.get("link") || "";
  assert.match(html, /<link rel="alternate" href="https:\/\/turva\.dev\/guides\/llms-txt\.md" type="text\/markdown" \/>/);
  assert.ok(link.includes('<https://turva.dev/guides/llms-txt.md>; rel="alternate"; type="text/markdown"'), "Link header must name the .md address");
  assert.ok(link.includes('</llms.txt>; rel="describedby"'), "Link header must name the llms.txt that describes the page");
});

test("the validator reports the two v2 relations and its summary does not move", async () => {
  const r = await get("/llms-txt-validator?url=turva.dev", { headers: { accept: "application/json" } });
  const j = await json(r);
  const ids = j.checks.map((c) => c.id);
  assert.ok(ids.includes("v2-describedby") && ids.includes("v2-markdown-alternate"), "both v2 checks must be reported");
  for (const id of ["v2-describedby", "v2-markdown-alternate"]) {
    const c = j.checks.find((x) => x.id === id);
    assert.equal(c.status, "pass", id + " must pass for this site, measured from the page it serves");
  }
  assert.equal(j.summary, "valid");
  const fileOnly = j.checks.filter((c) => !c.id.startsWith("v2-"));
  assert.equal(fileOnly.length, 8, "the eight file checks are unchanged");
  assert.ok(!j.checks.some((c) => c.status === "info"), "nothing here should be unmeasured");
});

// ---------------------------------------------------------------------------
// BRIEF-REITTI, Tek-269. Ensimmainen reitti joka lukee env:sta bindingin, joten
// nama testit tuovat mukanaan ensimmaisen mock-env:n tassa tiedostossa. Kaksi
// asiaa on tarkoituksella testattu negatiivisena: puuttuva binding ja tuntematon
// tunnus vastaavat MOLEMMAT 404:lla, koska erillinen virhesivu kertoisi
// ulkopuoliselle etta polku on olemassa.
const BRIEF_MD = [
  "turva.dev",
  "",
  "Agent readiness brief",
  "",
  "---",
  "",
  "# Testiyhtio ja kaksi puuttuvaa riviä",
  "",
  "## Where agents act",
  "",
  "- Ensimmainen kohta.",
  "- Toinen kohta.",
  "",
  "isitagentready: Level 1 / 5, basic web presence",
  "",
  "| discoverability | bot access control |",
  "| --- | --- |",
  "| 3/4 | 1/2 |",
  "",
  "1\\. Tama on lause eika lista."
].join("\n") + "\n";

const BRIEF_REC = {
  id: "testiyhtio-7f3k9q2m",
  yritys: "Testiyhtio Oy",
  kieli: "fi",
  otsikko: "Testiyhtio ja kaksi puuttuvaa riviä",
  md: BRIEF_MD,
  json: { tyyppi: "agent-readiness-brief", kieli: "fi", kohde: { yritys: "Testiyhtio Oy" } }
};

const briefEnv = {
  BRIEFIT: {
    get: async (avain, opts) => {
      assert.equal(opts && opts.type, "json", "brief luetaan JSONina");
      return avain === BRIEF_REC.id ? BRIEF_REC : null;
    }
  }
};

const getBrief = (path) =>
  worker.fetch(new Request("https://turva.dev" + path, { method: "GET" }), briefEnv);

test("brief: HTML vastaa, kantaa noindexin eika mene valimuistiin", async () => {
  const r = await getBrief("/brief/" + BRIEF_REC.id);
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /text\/html/);
  assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(r.headers.get("cache-control"), "private, no-store");
  assert.equal(r.headers.get("content-language"), "fi");
  const html = await r.text();
  assert.match(html, /<html lang="fi">/, "suomenkielinen brief on suomenkielinen sivu");
  assert.match(html, /<meta name="robots" content="noindex, nofollow" \/>/);
  assert.match(html, /<h1>Testiyhtio ja kaksi puuttuvaa riviä<\/h1>/);
  assert.match(html, /<hr \/>/, "vaakaviiva ei saa latoutua kappaleeksi jossa lukee ---");
  assert.ok(!/<p>---<\/p>/.test(html), "--- ei saa jaada nakyviin");
  assert.match(html, /<th>discoverability<\/th>/, "taulukko latoutuu taulukkona");
  assert.match(html, /<li>Ensimmainen kohta\.<\/li>/);
  assert.ok(!/1\\\./.test(html), "markdownin kenoviivasuojaus ei saa nakya sivulla");
  assert.match(html, /1\. Tama on lause/, "suojattu rivi latoutuu proosana");
});

test("brief: .md vastaa tavulleen sen mita KV:ssa on", async () => {
  const r = await getBrief("/brief/" + BRIEF_REC.id + ".md");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /text\/markdown/);
  assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(await r.text(), BRIEF_MD, "markdown menee ulos muuttumattomana");
  assert.equal(r.headers.get("content-location"), "https://turva.dev/brief/" + BRIEF_REC.id);
});

test("brief: .json vastaa tallennetun rakenteen", async () => {
  const r = await getBrief("/brief/" + BRIEF_REC.id + ".json");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /application\/json/);
  assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
  const j = JSON.parse(await r.text());
  assert.equal(j.tyyppi, "agent-readiness-brief");
  assert.equal(j.kohde.yritys, "Testiyhtio Oy");
});

test("brief: kaikki kolme muotoa tulevat samasta tunnuksesta", async () => {
  const [h, m, j] = await Promise.all([
    getBrief("/brief/" + BRIEF_REC.id),
    getBrief("/brief/" + BRIEF_REC.id + ".md"),
    getBrief("/brief/" + BRIEF_REC.id + ".json")
  ]);
  for (const r of [h, m, j]) assert.equal(r.status, 200);
  const html = await h.text();
  const kanta = "https://turva.dev/brief/" + BRIEF_REC.id;
  assert.ok(html.includes('href="' + kanta + '.md"'), "sivu linkittaa oman markdowninsa");
  assert.ok(html.includes('href="' + kanta + '.json"'), "sivu linkittaa oman JSONinsa");
});

test("brief: loppuvalimerkki ohjataan pois, ei 404, Tek-323", async () => {
  // Postiohjelma linkittaa tekstiosan osoitteen itse ja osa niista ottaa virkkeen
  // lopettavan pisteen mukaan. Ilman tata reittia lukija saa 404:n juuri siita
  // osoitteesta jonka viestin oli maara toimittaa. Mitattu 2026-08-31 elavana.
  const kanta = "/brief/" + BRIEF_REC.id;
  for (const [polku, kohde] of [
    [kanta + ".", kanta],
    [kanta + ",", kanta],
    [kanta + ")", kanta],
    [kanta + ".).", kanta],
    [kanta + ".md.", kanta + ".md"],
    [kanta + ".json)", kanta + ".json"]
  ]) {
    const r = await getBrief(polku);
    assert.equal(r.status, 301, polku + " ohjataan");
    assert.equal(r.headers.get("location"), "https://turva.dev" + kohde, polku + " ohjautuu oikeaan");
    assert.match(r.headers.get("x-robots-tag") || "", /noindex/, polku + " ohjaus kantaa noindexin");
  }
});

test("brief: siivous ei pelasta kelvotonta tunnusta eika koske muihin polkuihin, Tek-323", async () => {
  // Portti saa korjata VAIN loppuvalimerkin. Jos se pelastaisi liian lyhyen tai
  // isokirjaimisen tunnuksen, se avaisi polun jonka BRIEF_ID nimenomaan sulkee.
  // "/brief/.." EI ole tassa listassa, ja syy on mittaus eika mielipide: URL-jasennin
  // normalisoi sen poluksi "/" ennen kuin worker nakee sita, joten se vastaa 200:lla
  // etusivuna eika kerro tasta reitista mitaan. Kelvottomuus testataan tunnuksella.
  for (const p of ["/brief/lyhyt.", "/brief/ISOT.", "/brief/.", "/brief/", "/brief/aaaaaaa."]) {
    const r = await getBrief(p);
    assert.equal(r.status, 404, p + " ei saa ohjautua");
  }
  // Muut polut eivat kuulu tahan reittiin lainkaan.
  const muu = await getBrief("/services.");
  assert.notEqual(muu.status, 301, "siivous ei saa vuotaa /brief/-polun ulkopuolelle");
});

test("brief: tuntematon tunnus ja puuttuva binding vastaavat molemmat 404", async () => {
  const tuntematon = await getBrief("/brief/eioleolemassa-000000");
  assert.equal(tuntematon.status, 404);
  const ilmanBindingia = await get("/brief/" + BRIEF_REC.id);
  assert.equal(ilmanBindingia.status, 404, "ilman KV-bindingia reitti ei ole olemassa");
});

test("brief: hakemistoa ei ole eika kelvoton tunnus paase lapi", async () => {
  for (const p of ["/brief/", "/brief", "/brief/lyhyt", "/brief/ISOT-KIRJAIMET-EIVAT-KELPAA", "/brief/../etc"]) {
    const r = await getBrief(p);
    assert.equal(r.status, 404, p + " ei saa vastata");
  }
});

test("brief: Accept-neuvottelu vastaa samasta osoitteesta, kuten muuallakin sivustolla", async () => {
  const U = "/brief/" + BRIEF_REC.id;
  const tapaus = [
    [{}, /text\/html/],
    [{ Accept: "text/html" }, /text\/html/],
    [{ Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" }, /text\/html/],
    [{ Accept: "text/markdown" }, /text\/markdown/],
    [{ Accept: "application/json" }, /application\/json/]
  ];
  for (const [headers, odotus] of tapaus) {
    const r = await worker.fetch(new Request("https://turva.dev" + U, { headers }), briefEnv);
    assert.equal(r.status, 200, JSON.stringify(headers));
    assert.match(r.headers.get("content-type"), odotus, JSON.stringify(headers));
    assert.equal(r.headers.get("vary"), "Accept", "neuvoteltu vastaus kantaa vary: Accept");
    assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow", "myos neuvoteltu vastaus on noindex");
  }
  const md = await worker.fetch(new Request("https://turva.dev" + U, { headers: { Accept: "text/markdown" } }), briefEnv);
  assert.equal(await md.text(), BRIEF_MD, "neuvoteltu markdown on sama kuin paate-osoitteen");
});

// OpenPGP surfaces, added 2026-08-26. These test what the site PROMISES, not what
// the router happens to do: the contact page prints a fingerprint and an address,
// and both claims are checked against the key that is actually served. A key swap
// that leaves the printed fingerprint behind fails here, before a deploy.
const ZB32 = "ybndrfg8ejkmcpqxot1uwisza345h769";
function zbase32(bytes) {
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i < bits.length; i += 5) out += ZB32[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  return out;
}
function dearmor(text) {
  const lines = text.split("\n");
  const b64 = [];
  let inArmor = false, pastHeaders = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("-----BEGIN")) { inArmor = true; continue; }
    if (line.startsWith("-----END")) break;
    if (!inArmor) continue;
    if (!pastHeaders) { if (line === "") pastHeaders = true; continue; }
    if (line === "" || line.startsWith("=")) continue;
    b64.push(line);
  }
  return Buffer.from(b64.join(""), "base64");
}
// RFC 4880 section 12.2: a v4 fingerprint is SHA-1 over 0x99, the two-byte length
// of the public-key packet body, and the body itself.
// The SHA-1 is the specification and not a choice: a v4 fingerprint IS this digest,
// so SHA-256 here would compute a number no OpenPGP implementation accepts. CodeQL
// reads both SHA-1 calls in this file as password hashing (js/insufficient-password-hash,
// alerts 8 and 9, 2026-08-27). There is no password and no secret on either line: the
// inputs are a public key and a public local part, and the output is an identifier.
// Do not replace either digest.
function v4Fingerprint(keyBytes) {
  const first = keyBytes[0];
  assert.equal(first & 0x80, 0x80, "not an OpenPGP packet header");
  let tag, bodyStart, bodyLen;
  if (first & 0x40) {
    tag = first & 0x3f;
    const l = keyBytes[1];
    if (l < 192) { bodyLen = l; bodyStart = 2; }
    else if (l < 224) { bodyLen = ((l - 192) << 8) + keyBytes[2] + 192; bodyStart = 3; }
    else { bodyLen = keyBytes.readUInt32BE(2); bodyStart = 6; }
  } else {
    tag = (first >> 2) & 0x0f;
    const lt = first & 0x03;
    if (lt === 0) { bodyLen = keyBytes[1]; bodyStart = 2; }
    else if (lt === 1) { bodyLen = keyBytes.readUInt16BE(1); bodyStart = 3; }
    else { bodyLen = keyBytes.readUInt32BE(1); bodyStart = 5; }
  }
  assert.equal(tag, 6, "first packet must be the public key packet");
  const body = keyBytes.subarray(bodyStart, bodyStart + bodyLen);
  const head = Buffer.from([0x99, (bodyLen >> 8) & 0xff, bodyLen & 0xff]);
  return createHash("sha1").update(Buffer.concat([head, body])).digest("hex").toUpperCase();
}

test("PGP: /pgp-key.asc serves a public key and never private material", async () => {
  const r = await get("/pgp-key.asc");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /application\/pgp-keys/);
  const body = await r.text();
  assert.match(body, /^-----BEGIN PGP PUBLIC KEY BLOCK-----/);
  assert.match(body, /-----END PGP PUBLIC KEY BLOCK-----\s*$/);
  assert.equal(/PRIVATE KEY/.test(body), false, "a private key must never reach this route");
});

test("PGP: the fingerprint printed on the contact page is the fingerprint of the served key", async () => {
  const armored = await (await get("/pgp-key.asc")).text();
  const fpr = v4Fingerprint(dearmor(armored));
  const page = await (await get("/contact")).text();
  const printed = (page.match(/[0-9A-F]{4}(?:[ ][0-9A-F]{4}){9}/) || [""])[0].replace(/ /g, "");
  assert.equal(printed, fpr, "contact page prints " + printed + " but the served key is " + fpr);
});

test("PGP: WKD serves the same key as bytes, at the hash of the address the page names", async () => {
  const page = await (await get("/contact")).text();
  const local = (page.match(/([a-z0-9._-]+)@turva\.dev can be OpenPGP/) || [])[1];
  assert.ok(local, "the contact page must name the address encrypted mail goes to");
  // WKD hashes the local part with SHA-1 and z-base-32 by specification
  // (draft-koch-openpgp-webkey-service section 3.1), which is what makes the address
  // a path. Section 5 of the same draft says outright that this SHA-1 is not a security
  // feature and only maps the local part to a fixed-size string, so a stronger digest
  // here would serve the key at an address no mail client looks at.
  const hash = zbase32(createHash("sha1").update(local).digest());
  const r = await get("/.well-known/openpgpkey/hu/" + hash);
  assert.equal(r.status, 200, "WKD must answer at the hash of " + local);
  assert.match(r.headers.get("content-type"), /application\/octet-stream/);
  const served = Buffer.from(await r.arrayBuffer());
  const armored = await (await get("/pgp-key.asc")).text();
  assert.deepEqual(served, dearmor(armored), "WKD bytes must be the armored key, dearmored");
});

test("PGP: the WKD policy file exists, which is what advertises WKD at all", async () => {
  const r = await get("/.well-known/openpgpkey/policy");
  assert.equal(r.status, 200);
});

test("PGP: the Encryption field in security.txt resolves", async () => {
  const txt = await (await get("/.well-known/security.txt")).text();
  const m = txt.match(/^Encryption: (\S+)$/m);
  assert.ok(m, "security.txt must declare Encryption");
  const r = await get(new URL(m[1]).pathname);
  assert.equal(r.status, 200, m[1] + " must resolve");
  assert.match(r.headers.get("content-type"), /application\/pgp-keys/);
});

test("PGP: the WKD advanced method serves the same bytes as the direct method", async () => {
  const hash = zbase32(createHash("sha1").update("erik").digest());
  const adv = await worker.fetch(new Request(
    "https://openpgpkey.turva.dev/.well-known/openpgpkey/turva.dev/hu/" + hash + "?l=erik"), env);
  assert.equal(adv.status, 200, "the advanced host must answer");
  assert.match(adv.headers.get("content-type"), /application\/octet-stream/);
  const direct = await get("/.well-known/openpgpkey/hu/" + hash);
  assert.deepEqual(Buffer.from(await adv.arrayBuffer()), Buffer.from(await direct.arrayBuffer()),
    "both WKD methods must serve the identical key");
});

test("PGP: the advanced host serves its own policy file and redirects everything else", async () => {
  const pol = await worker.fetch(new Request(
    "https://openpgpkey.turva.dev/.well-known/openpgpkey/turva.dev/policy"), env);
  assert.equal(pol.status, 200);
  const other = await worker.fetch(new Request("https://openpgpkey.turva.dev/services"), env);
  assert.equal(other.status, 301, "the advanced host is not a second copy of the site");
  assert.equal(other.headers.get("location"), "https://turva.dev/");
});

// Every canonical page RENDERS, in both forms. Added 2026-08-31 after /services shipped a 500
// to every browser and no gate saw it: the page builders throw on malformed page markdown
// (mdPcard: "does not open with a **price** block"), a bold price block had been rewrapped
// onto three lines, and verify.mjs, the 39 tests here and check-docs were all green because
// not one of them asked the router for the HTML of a page. The sitemap is the list, so a new
// page is covered the day it is published rather than the day someone remembers this file.
test("every page in the sitemap renders as HTML and as markdown", async () => {
  const xml = await (await get("/sitemap.xml")).text();
  const paths = [...xml.matchAll(/<loc>https:\/\/turva\.dev([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
  assert.ok(paths.length > 10, `the sitemap must list the pages (saw ${paths.length})`);
  for (const path of paths) {
    const html = await get(path);
    assert.equal(html.status, 200, `${path} must render as HTML (saw ${html.status})`);
    const body = await html.text();
    assert.ok(body.length > 500 && !/Internal Server Error/.test(body),
      `${path} must return a real page, not an error (${body.length} bytes)`);
    const md = await get(path, { headers: { Accept: "text/markdown" } });
    assert.equal(md.status, 200, `${path} must render as markdown (saw ${md.status})`);
    assert.ok((await md.text()).length > 100, `${path} markdown must not be empty`);
  }
});
// ---------------------------------------------------------------------------
// R3b-1 (round 14, kierros 14 batch T). docs/endpoints.md declares 39 routes
// plus an Aliases row, and every one of them is supposed to resolve because
// the file's own first line says "if a path is listed here it resolves in
// src/worker.js". A large group of them had never been exercised by
// worker.fetch in this file: this table closes that gap route by route, so a
// path that stops resolving fails here before a deploy rather than only
// during the next audit's live curl pass. Every expected status and
// content-type below was read out of src/worker.js, not guessed: the 200s
// are serveStatic() calls, and /oauth/authorize and /oauth/token both go
// through serveOauthClosed(), which answers 400 with a spec-valid OAuth
// error body rather than a 404, because the discovery documents advertise
// these paths and must never point at something that does not respond.
const DOCUMENTED_ROUTES = [
  ["/llms.txt", 200, /text\/plain/],
  ["/llms-full.txt", 200, /text\/plain/],
  ["/robots.txt", 200, /text\/plain/],
  ["/blog/feed.xml", 200, /application\/rss\+xml/],
  ["/oauth/authorize", 400, /application\/json/],
  ["/oauth/token", 400, /application\/json/],
  ["/agent/auth/register", 200, /application\/json/],
  ["/agent/auth/claim", 200, /application\/json/],
  ["/agent/auth/revoke", 200, /application\/json/],
  ["/.well-known/ai.txt", 200, /text\/plain/],
  ["/.well-known/agent.json", 200, /application\/json/],
  ["/.well-known/ai-catalog.json", 200, /application\/json/],
  ["/.well-known/agent-skills/index.json", 200, /application\/json/],
  // SKILLS names services with skill.md content, src/worker.js:4572-4576.
  ["/.well-known/agent-skills/services/skill.md", 200, /text\/markdown/],
  ["/.well-known/api-catalog", 200, /application\/linkset\+json/],
  ["/.well-known/ap2", 200, /application\/json/],
  ["/.well-known/x402", 200, /application\/json/],
  ["/.well-known/ucp", 200, /application\/json/],
  ["/.well-known/mpp", 200, /application\/json/],
  ["/.well-known/oauth-authorization-server", 200, /application\/json/],
  ["/.well-known/oauth-protected-resource", 200, /application\/json/],
  ["/.well-known/signatures.json", 200, /application\/json/],
  ["/.well-known/jwks.json", 200, /application\/json/],
  // The IndexNow key file address, src/worker.js:4 (INDEXNOW_KEY, not exported,
  // so the value is copied here rather than derived).
  ["/9b7e4c21a8f3d65e0c1b9a4d7f2e8c63.txt", 200, /text\/plain/],
  // Aliases row.
  ["/ai.txt", 200, /text\/plain/],
  ["/security.txt", 200, /text\/plain/],
  ["/.well-known/mcp.json", 200, /application\/json/],
  ["/.well-known/openid-configuration", 200, /application\/json/],
  ["/.well-known/openapi.json", 200, /application\/json/],
  ["/favicon.ico", 200, /image\/svg\+xml/],
  ["/favicon.svg", 200, /image\/svg\+xml/]
];

test("R3b-1: every documented path without a prior test resolves as endpoints.md promises", async () => {
  for (const [path, status, contentType] of DOCUMENTED_ROUTES) {
    const r = await get(path);
    assert.equal(r.status, status, path + " -> " + r.status);
    assert.match(r.headers.get("content-type") || "", contentType, path + " content-type");
  }
});

test("R3b-1: the fediverse well-known paths redirect to social.turva.dev, not this Worker", async () => {
  // src/worker.js:8171-8173. Everything else the apex serves stays here; only
  // host-meta, webfinger and nodeinfo hand off to the Mastodon instance.
  for (const path of ["/.well-known/host-meta", "/.well-known/webfinger", "/.well-known/nodeinfo"]) {
    const r = await get(path);
    assert.equal(r.status, 301, path + " must redirect");
    assert.equal(r.headers.get("location"), "https://social.turva.dev" + path);
  }
});

test("R3b-1: OPTIONS on a payable path is not swallowed by the CORS preflight when the host is not the apex", async () => {
  // Round 13 R1g-3 moved the CORS-preflight block to run after the www/mta-sts
  // host redirects (src/worker.js:8154-8169), specifically so that promise ("everything
  // else sends to turva.dev") holds for OPTIONS too. A 204 here would mean the
  // preflight block had drifted back in front of the host checks.
  for (const host of ["www.turva.dev", "mta-sts.turva.dev"]) {
    const r = await worker.fetch(new Request("https://" + host + "/api/agent/audit", { method: "OPTIONS" }), env);
    assert.equal(r.status, 301, host + " must redirect an OPTIONS preflight rather than answer 204");
  }
});

test("R3b-1: the IndexNow key file carries the agent-api security-header profile", async () => {
  // applySecurityHeaders (src/worker.js:74-95) differs between "agent-api" and
  // "default" only in Cross-Origin-Resource-Policy: cross-origin vs same-origin.
  // /<indexnow-key>.txt is served with kind "agent-api" (src/worker.js:8344-8345).
  const indexnow = await get("/9b7e4c21a8f3d65e0c1b9a4d7f2e8c63.txt");
  assert.equal(indexnow.status, 200);
  assert.equal(indexnow.headers.get("cross-origin-resource-policy"), "cross-origin",
    "the IndexNow key file must use the agent-api CORP value");
  // serveMtaStsPolicy is the one route in the file that explicitly asks for the
  // "default" profile (src/worker.js:5468-5475), which is what makes this a real
  // comparison and not just a restatement of one constant.
  const defaultProfile = await worker.fetch(new Request("https://mta-sts.turva.dev/.well-known/mta-sts.txt"), env);
  assert.equal(defaultProfile.status, 200);
  assert.equal(defaultProfile.headers.get("cross-origin-resource-policy"), "same-origin",
    "the default profile used elsewhere must stay same-origin, or this is not actually testing a difference");
});

test("footer: the copyright year is this year, read per request and not at module load", async () => {
  // Round 14 R1f-1 first computed the year in global scope, and Workers freeze the clock at
  // the epoch there, so the live footer read 1970. The year must come from the request clock.
  const year = String(new Date().getUTCFullYear());
  for (const path of ["/", "/services", "/guides/llms-txt", "/blog"]) {
    const res = await get(path);
    assert.equal(res.status, 200, path);
    const html = await res.text();
    assert.ok(html.includes("\u00a9 " + year + " turva.dev"), path + " footer carries " + year);
    assert.ok(!html.includes("1970 turva.dev"), path + " footer must not read the epoch year");
  }
});

test("R15 P4-2: OPTIONS answers 204 with preflight headers on every agent-api surface, not only /x402, /api/* and /agent/auth/*", async () => {
  // Round 15 measured live that OPTIONS on /api, /openapi.json, /llms.txt and the
  // /.well-known/ manifests fell through to the GET handler and returned the body with
  // no access-control-allow-methods header. The preflight branch in src/worker.js now
  // covers them; /v1/message:send keeps its own POST-only preflight and the fediverse
  // aliases keep redirecting.
  for (const path of ["/api", "/openapi.json", "/llms.txt", "/llms-full.txt", "/auth.md", "/robots.txt", "/.well-known/ai-plugin.json", "/.well-known/mcp/server-card.json", "/.well-known/agent-card.json", "/.well-known/x402", "/.well-known/api-catalog", "/x402", "/api/v1"]) {
    const r = await worker.fetch(new Request("https://turva.dev" + path, { method: "OPTIONS" }), env, {});
    assert.equal(r.status, 204, path + " must answer 204 to OPTIONS");
    assert.equal(r.headers.get("access-control-allow-methods"), "GET, POST, OPTIONS", path);
    assert.equal(r.headers.get("access-control-allow-origin"), "*", path);
    assert.ok(r.headers.get("access-control-max-age"), path + " carries access-control-max-age");
  }
  const fedi = await worker.fetch(new Request("https://turva.dev/.well-known/webfinger", { method: "OPTIONS" }), env, {});
  assert.equal(fedi.status, 301, "fediverse aliases still redirect on OPTIONS");
  const a2a = await worker.fetch(new Request("https://turva.dev/v1/message:send", { method: "OPTIONS" }), env, {});
  assert.equal(a2a.headers.get("access-control-allow-methods"), "POST, OPTIONS", "A2A keeps its own POST-only preflight");
});

test("R15 P1a-1: the agent-commerce-discovery guide states the AP2 URI without hyperlinking it", async () => {
  // The URI is an identifier the A2A card declares (kept as is, see project-do-not-fix), but
  // as an address it answers 404, so the guide must not render it as a link.
  const r = await worker.fetch(new Request("https://turva.dev/guides/agent-commerce-discovery"), env, {});
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(html.includes("google-agentic-commerce/ap2/tree/v0.1"), "the URI is still stated");
  assert.ok(!/href="https:\/\/github\.com\/google-agentic-commerce\/ap2\/tree\/v0\.1"/.test(html), "the lowercase URI is not a hyperlink");
  assert.ok(html.includes("identifier, not an address"), "the guide says why");
});
