import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { findLinkRelations, markdownToHtml } from "../src/worker.ts";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

// Growth check for the tests that say a scan "stays linear".
// The package turva-llms-txt-validator keeps the same function in test/growth.ts; it is inline here
// because this repo's test runner would treat a shared file in test/ as a test.
//
// Why a ratio and not a limit in milliseconds. A fixed limit fails on a slow CI runner and lets a
// slow but quadratic scan through. Two inputs of one shape, the second about four times the first,
// are timed instead. A linear scan takes about four times as long on the larger one, a quadratic
// scan about sixteen times, and the limit sits between the two on the log scale: sizes ** 1.5, which
// is 8 for 4x the input and about 22.6 for 8x. Each input is timed several times and the fastest
// run counts, because load on the machine only ever adds time, never removes it. The small input is
// repeated until one sample takes at least 1 ms, so the clock resolution does not decide the ratio and
// the samples stay short: a short sample is likelier to fall between two interruptions of a busy machine.
// The check passes as soon as nine rounds give a ratio under the limit. On a loaded machine the ratio
// of the fastest runs can sit above the limit because the larger input was interrupted more often, so
// more rounds are taken, at most 60 and at most four seconds, before the check fails. A scan that is
// really quadratic stays above the limit through all of them (checked against a deliberately quadratic scan).
async function timeIt(work: (input: string) => unknown, input: string, reps: number): Promise<number> {
  const started = performance.now();
  for (let i = 0; i < reps; i++) {
    const out = work(input);
    if (out instanceof Promise) await out;
  }
  return performance.now() - started;
}

// The limit for an input that is `sizes` times larger: the midpoint, on the log scale, between a
// linear scan (sizes) and a quadratic one (sizes squared).
const growthLimit = (sizes: number): number => sizes ** 1.5;

async function growthRatio(work: (input: string) => unknown, small: string, large: string, limit: number = Infinity): Promise<{ ratio: number; rounds: number }> {
  await timeIt(work, large, 1);
  await timeIt(work, small, 1);
  let reps = 1;
  while (reps < 4096 && (await timeIt(work, small, reps)) < 1) reps *= 2;
  const begun = performance.now();
  let minSmall = Infinity;
  let minLarge = Infinity;
  let rounds = 0;
  for (;;) {
    minSmall = Math.min(minSmall, await timeIt(work, small, reps));
    minLarge = Math.min(minLarge, await timeIt(work, large, reps));
    rounds++;
    const ratio = minLarge / minSmall;
    if (rounds >= 9 && ratio < limit) return { ratio, rounds };
    if (rounds >= 60 || (rounds >= 9 && performance.now() - begun > 4000)) return { ratio, rounds };
  }
}

async function assertLinear(label: string, work: (input: string) => unknown, small: string, large: string): Promise<void> {
  const sizes = large.length / small.length;
  const limit = growthLimit(sizes);
  const g = await growthRatio(work, small, large, limit);
  assert.ok(g.ratio < limit, label + ": " + sizes.toFixed(1) + "x the input took " + g.ratio.toFixed(1) + "x as long after " + g.rounds + " rounds, limit " + limit.toFixed(1));
}

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

const get = (path: string, opts: { method?: string; headers?: Record<string, string> } = {}): Promise<Omit<Response, "json"> & { json(): Promise<any> }> =>
  worker.fetch(new Request("https://turva.dev" + path, { method: opts.method || "GET", headers: opts.headers || {} }), env);

const json = async (res: { text(): Promise<string> }) => JSON.parse(await res.text());

test("ACP: the declared api_base_url resolves as JSON, not as the HTML 404", async () => {
  for (const p of ["/api/acp", "/api/acp/", "/API/ACP"]) {
    const r = await get(p);
    assert.equal(r.status, 200, p + " must resolve");
    assert.match(r.headers.get("content-type")!, /application\/json/, p + " must be JSON");
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
  assert.equal(card.tools.length, 5);
});

test("commerce surfaces never report an unpaid request as paid", async () => {
  for (const p of ["/api", "/api/", "/x402", "/api/agent/audit", "/api/agent/advisory", "/api/agent/implementation"]) {
    assert.equal((await get(p)).status, 402, p + " must answer with the 402 challenge");
  }
  // even with a forged payment header
  assert.equal((await get("/api/agent/audit", { headers: { "X-PAYMENT": "forged" } })).status, 402);
});

test("/services carries the same priced Service node as the home page, and both read facts.json", async () => {
  // v3.113.0: an agent landing on the price page from search used to get prices in prose and
  // FAQ answers only, while the home page carried the AggregateOffer and OfferCatalog. The node
  // is one constant now; this test reads both rendered pages so a future split cannot drift.
  const offersOf: (html: string) => (string | number)[][] = (html) => {
    const i = html.indexOf('"hasOfferCatalog"');
    assert.ok(i > 0, "hasOfferCatalog present");
    const block = html.slice(i, html.indexOf("</script>", i));
    // Top-level offers only: an addOn (Tek-528) is nested inside its base offer.
    return [...block.matchAll(/(?<!"addOn":)\{"@type":"Offer","name":"([^"]+)"[\s\S]*?"price":"(\d+)"/g)].map((m) => [m[1], Number(m[2])]);
  };
  const home = offersOf(await (await get("/")).text());
  const services = offersOf(await (await get("/services")).text());
  assert.deepEqual(services, home, "the two pages carry the same offers");
  const priced = facts.services.filter((x: { priceKey: string | null; name: string }) => x.priceKey).map((x: { priceKey: string; name: string }) => [x.name, facts.prices[x.priceKey]]);
  assert.deepEqual(services, priced, "the offers are exactly the priced services facts.json names");
  assert.ok((await (await get("/services")).text()).includes('"@id":"https://turva.dev/#service"'), "same @id as the home page");
});

test("the primary navigation is a named landmark on every page, and a contents list is a second named nav", async () => {
  // Since v3.171.0 (Tek-479 P14, Erik 2026-09-25) a long page's contents list is a second <nav>,
  // labelled by its own visible heading, so markdown-parity-check and assistive technology both read
  // it as navigation. The primary navigation stays the first nav and the only one named Main.
  for (const p of ["/", "/services", "/agent-readiness-audit", "/contact", "/legal", "/company", "/blog", "/guides", "/tools", "/nonexistent-path",
                   "/guides/llms-txt", "/blog/html-and-markdown-can-disagree"]) {
    const html = await (await get(p)).text();
    const navs = html.match(/<nav\b[^>]*>/g) || [];
    assert.ok(navs.length === 1 || navs.length === 2, p + " has the primary nav and at most a contents list, saw " + navs.length);
    assert.match(navs[0], /aria-label="Main"/, p + " nav is named");
    for (const n of navs.slice(1)) {
      assert.match(n, /^<nav class="toc" aria-labelledby="toc-h">$/, p + " the second nav is the named contents list");
    }
  }
  for (const p of ["/legal", "/guides/llms-txt", "/blog/html-and-markdown-can-disagree"]) {
    const html = await (await get(p)).text();
    assert.ok(html.includes('<nav class="toc" aria-labelledby="toc-h"><p id="toc-h">On this page</p>'), p + " carries its contents list as the named nav");
  }
});

test("the article frame sits outside <main>: back link, frame dates and next step (Tek-479 P14)", async () => {
  const mainOf: (html: string) => string = (html) => html.slice(html.indexOf('<main id="main"'), html.indexOf("</main>") + 7);
  const guide = await (await get("/guides/llms-txt")).text();
  const gm = mainOf(guide);
  assert.ok(gm.includes("<h1>llms.txt explained</h1>"), "the guide's main holds the article");
  for (const frame of ['class="crumb"', "Sources checked", 'class="next"']) assert.ok(!gm.includes(frame), "not inside the guide's main: " + frame);
  assert.match(guide, /<header class="pagehead">\n<p class="crumb"><a href="\/guides">&#8249; all guides<\/a><\/p>\n<p class="date">Sources checked \d{4}-\d{2}-\d{2}<\/p>\n<\/header>\n<main id="main" class="has-next">/, "back link and checked date in the page head");
  assert.match(guide, /<\/main>\n<div class="pagefoot"><aside class="next"><p>/, "the next step follows main");
  const post = await (await get("/blog/html-and-markdown-can-disagree")).text();
  const pm = mainOf(post);
  for (const frame of ['class="crumb"', "Erik Rekola"]) assert.ok(!pm.includes(frame), "not inside the post's main: " + frame);
  assert.match(pm, /<h1>HTML and Markdown can disagree<\/h1>\n<p class="date">2026-09-12<\/p>/, "the twin's bare date line stays under the H1 as the twin has it");
  assert.match(post, /<header class="pagehead">\n<p class="crumb"><a href="\/blog">&#8249; all posts<\/a><\/p>\n<p class="date">Erik Rekola(?: &middot; updated \d{4}-\d{2}-\d{2})?<\/p>\n<\/header>\n<main id="main" class="has-next">/, "the author is in the page head");
  // Tek-805 (2026-11-11): a post closes with one next step outside main, as a guide does.
  assert.ok(!pm.includes('class="next"'), "not inside the post's main: the next step");
  assert.match(post, /<\/main>\n<div class="pagefoot"><aside class="next"><p>Need this checked on your own site\? <a class="btn-ghost" href="\/agent-readiness-audit">/, "the next step follows the post's main");
  const sample = await (await get("/samples/audit-report")).text();
  assert.ok(!sample.includes('class="pagehead"'), "a page without a frame gets no empty page head");
});

test("a trailing slash redirects to the canonical path for every served page", async () => {
  for (const p of ["/services", "/agent-readiness-audit", "/company", "/contact", "/legal", "/guides", "/blog", "/tools", "/badge",
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
  for (const url of Object.values(idx.endpoints) as string[]) {
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

test("the OpenAPI document and the A2A agent card carry the same site version", async () => {
  const openapi = await json(await get("/openapi.json"));
  const a2a = await json(await get("/.well-known/agent-card.json"));
  assert.equal(openapi.info.version, a2a.version);
});

test("unmatched paths return the Worker's own 404, with no origin behind it", async () => {
  const r = await get("/definitely-not-a-page");
  assert.equal(r.status, 404);
  assert.match(r.headers.get("content-type")!, /text\/html/);
});

// A2A: the agent card declared url + HTTP+JSON transport and three skills while nothing
// answered on that transport at all, so a POST got the homepage HTML. Found by the monthly
// credibility audit 2026-08-01. These cases bind three things that had drifted apart: the
// card's url, the card's skill descriptions, and the data the endpoint actually returns.
// A first version asserted only that some object came back, and a mutation test that swapped
// the contact and company payloads passed it, so every skill now asserts content unique to it.
const a2aSend = (body: unknown): Promise<Omit<Response, "json"> & { json(): Promise<any> }> => worker.fetch(new Request("https://turva.dev/v1/message:send", {
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
  assert.match(res.headers.get("content-type")!, /application\/json/);
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
  const byId = Object.fromEntries(card.skills.map((s: { id: string }) => [s.id, s]));
  assert.deepEqual(Object.keys(byId).sort(), ["company-info", "contact-info", "services"]);
  const dataFor = async (id: string) => {
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
  assert.match(g.headers.get("content-type")!, /application\/json/);

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
  let deep: unknown[] = [];
  for (let i = 0; i < 4000; i++) deep = [deep];
  const nested = await a2aSend({ message: { role: "user", parts: [], messageId: "t", metadata: { skillId: deep } } });
  assert.equal(nested.status, 200, "a non-string skillId must not crash the handler");

  const unknown = await get("/v1/unknown-method");
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
// the cheap half of the live --twins run in tools/verify.mts.

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
// The same contract, written out in both implementations: the npm package and the hosted
// validator in turva-worker/src/worker.ts. The cases are stated against the EXPECTED
// public behaviour, not against each other, because two copies agreeing proves only that
// they are copies. Added 2026-09-09 after a quoted attribute value and a quoted Link
// parameter both reported a relation the page does not publish.
test("a quoted attribute value is not a place where attributes live", () => {
  const f = findLinkRelations(`<head><link data-note=" rel='alternate' type='text/markdown' href='/fake.md'"></head>`, "");
  assert.equal(f.markdown, null);
  assert.equal(f.describedby, null);
  const g = findLinkRelations(`<head><link title="rel=describedby href=/fake.txt"></head>`, "");
  assert.equal(g.describedby, null);
});

test("a quoted Link parameter value is not a place where parameters live", () => {
  const f = findLinkRelations("", '</fake.md>; title="note; rel=alternate; type=text/markdown"');
  assert.equal(f.markdown, null);
  const g = findLinkRelations("", '</fake.txt>; title="rel=describedby"');
  assert.equal(g.describedby, null);
});

test("real relations still read, quoted, single quoted and bare", () => {
  assert.equal(findLinkRelations('<head><link rel="alternate" type="text/markdown" href="/index.md">', "").markdown, "/index.md");
  assert.equal(findLinkRelations("<head><link rel='alternate' type='text/markdown' href='/single.md'>", "").markdown, "/single.md");
  assert.equal(findLinkRelations("<head><link rel=alternate type=text/markdown href=/bare.md>", "").markdown, "/bare.md");
  assert.equal(findLinkRelations("<head><link rel='describedby' href='/llms.txt'>", "").describedby, "/llms.txt");
  assert.equal(findLinkRelations("", '</index.md>; rel="alternate"; type="text/markdown"').markdown, "/index.md");
  assert.equal(findLinkRelations("", "</index.md>; rel=alternate; type=text/markdown").markdown, "/index.md");
});

test("a comma or a semicolon inside a quoted Link parameter does not end the value", () => {
  const f = findLinkRelations("", '</index.md>; title="one, two; three"; rel="alternate"; type="text/markdown"');
  assert.equal(f.markdown, "/index.md");
  const g = findLinkRelations("", '</a.txt>; title="a, b", </index.md>; rel="alternate"; type="text/markdown"');
  assert.equal(g.markdown, "/index.md");
  const h = findLinkRelations("", '</index.md>; title="he said \\"rel=describedby\\""; rel="alternate"; type="text/markdown"');
  assert.equal(h.markdown, "/index.md");
  assert.equal(h.describedby, null);
});

test("the first declaration of an attribute wins, as in the HTML tokenizer", () => {
  assert.equal(findLinkRelations('<head><link rel="alternate" type="text/markdown" href="/first.md" href="/second.md">', "").markdown, "/first.md");
});

test("findLinkRelations does not count what a page did not publish", async () => {
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
  // The link tag inside the title carries an href: a relation without a target is no relation, so without
  // one these passed whether or not the title content was set aside (LV-31, round S3, Tek-546).
  assert.equal(findLinkRelations('<head><title>How to use <link rel=describedby href=/fake> for llms.txt</title></head>', "").describedby, null);
  assert.equal(findLinkRelations('<head><title>How to use <link rel=describedby href=/fake></title><link rel="describedby" href="/real"></head>', "").describedby, "/real");
  // A tag that never closes is not a tag, and the scan must not slow down over it.
  // The regex this replaced was quadratic: 16 000 unclosed "<link" measured 196 ms and
  // 256 KB of them would have taken minutes. The growth between two sizes is compared, not a time.
  const pathological = "<link".repeat(52428);
  assert.deepEqual(findLinkRelations(pathological, ""), { describedby: null, markdown: null });
  assert.deepEqual(findLinkRelations("", "<".repeat(65536)), { describedby: null, markdown: null });
  await assertLinear("<link", (s) => findLinkRelations(s, ""), "<link".repeat(13107), pathological);
  await assertLinear("Link header", (s) => findLinkRelations("", s), "<".repeat(16384), "<".repeat(65536));
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
  const ids = j.checks.map((c: { id: string }) => c.id);
  assert.ok(ids.includes("v2-describedby") && ids.includes("v2-markdown-alternate"), "both v2 checks must be reported");
  for (const id of ["v2-describedby", "v2-markdown-alternate"]) {
    const c = j.checks.find((x: { id: string }) => x.id === id);
    assert.equal(c.status, "pass", id + " must pass for this site, measured from the page it serves");
  }
  assert.equal(j.summary, "valid");
  const fileOnly = j.checks.filter((c: { id: string }) => !c.id.startsWith("v2-"));
  assert.equal(fileOnly.length, 8, "the eight file checks are unchanged");
  assert.ok(!j.checks.some((c: { status: string }) => c.status === "info"), "nothing here should be unmeasured");
});

// ---------------------------------------------------------------------------
// BRIEF ROUTE, Tek-269. The first route that reads a binding from env, so these
// tests bring the first mock env into this file. Two things are tested as
// negatives on purpose: a missing binding and an unknown id BOTH answer with a
// 404, because a separate error page would tell an outsider that the path
// exists.
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
  "\\# Tama rivi on proosaa eika otsikko.",
  "",
  "\\- Tama rivi on proosaa eika lista.",
  "Toinen rivi samassa kappaleessa.",
  "",
  "\\> Tama rivi on proosaa eika lainaus.",
  "",
  "Lahteen oma yksityisalueen merkki \uE003 sailyy.",
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
    get: async (key: string, opts?: { type?: string }) => {
      assert.equal(opts && opts.type, "json", "the brief is read as JSON");
      return key === BRIEF_REC.id ? BRIEF_REC : null;
    }
  }
};

const getBrief = (path: string) =>
  worker.fetch(new Request("https://turva.dev" + path, { method: "GET" }), briefEnv);

test("brief: the HTML answers, carries noindex and is not cached", async () => {
  const r = await getBrief("/brief/" + BRIEF_REC.id);
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type")!, /text\/html/);
  assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(r.headers.get("cache-control"), "private, no-store");
  assert.equal(r.headers.get("content-language"), "fi");
  const html = await r.text();
  assert.match(html, /<html lang="fi">/, "a Finnish brief is a Finnish page");
  assert.match(html, /<meta name="robots" content="noindex, nofollow" \/>/);
  assert.match(html, /<h1>Testiyhtio ja kaksi puuttuvaa riviä<\/h1>/);
  assert.match(html, /<hr \/>/, "the horizontal rule must not be laid out as a paragraph reading ---");
  assert.ok(!/<p>---<\/p>/.test(html), "--- must not stay visible");
  assert.match(html, /<th role="columnheader" scope="col">discoverability<\/th>/, "the table is laid out as a table");
  assert.match(html, /<li>Ensimmainen kohta\.<\/li>/);
  assert.ok(!/1\\\./.test(html), "the markdown backslash escape must not show on the page");
  assert.match(html, /1\. Tama on lause/, "the escaped line is laid out as prose");
  assert.match(html, /<p># Tama rivi on proosaa eika otsikko\.<\/p>/, "an escaped # is laid out as prose");
  assert.ok(!/<h1>Tama rivi/.test(html), "an escaped # must not become a heading");
  assert.match(html, /<p>- Tama rivi on proosaa eika lista\.\nToinen rivi samassa kappaleessa\.<\/p>/, "an escaped - is laid out as prose and the paragraph keeps its second line");
  assert.ok(!/<li>Tama rivi/.test(html), "an escaped - must not become a list");
  assert.match(html, /<p>&gt; Tama rivi on proosaa eika lainaus\.<\/p>/, "an escaped > is laid out as text");
  assert.match(html, /<p>Lahteen oma yksityisalueen merkki  sailyy\.<\/p>/, "the source's own private-use character does not turn into a placeholder");
  assert.equal((html.match(/[-]/g) || []).length, 1, "a placeholder must not be left on the page");
});

test("brief: .md answers byte for byte what the KV holds", async () => {
  const r = await getBrief("/brief/" + BRIEF_REC.id + ".md");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type")!, /text\/markdown/);
  assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(await r.text(), BRIEF_MD, "the markdown goes out unchanged");
  assert.equal(r.headers.get("content-location"), "https://turva.dev/brief/" + BRIEF_REC.id);
});

test("brief: .json answers the stored structure", async () => {
  const r = await getBrief("/brief/" + BRIEF_REC.id + ".json");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type")!, /application\/json/);
  assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
  const j = JSON.parse(await r.text());
  assert.equal(j.tyyppi, "agent-readiness-brief");
  assert.equal(j.kohde.yritys, "Testiyhtio Oy");
});

test("brief: all three forms come from the same id", async () => {
  const [h, m, j] = await Promise.all([
    getBrief("/brief/" + BRIEF_REC.id),
    getBrief("/brief/" + BRIEF_REC.id + ".md"),
    getBrief("/brief/" + BRIEF_REC.id + ".json")
  ]);
  for (const r of [h, m, j]) assert.equal(r.status, 200);
  const html = await h.text();
  const base = "https://turva.dev/brief/" + BRIEF_REC.id;
  assert.ok(html.includes('href="' + base + '.md"'), "the page links to its own markdown");
  assert.ok(html.includes('href="' + base + '.json"'), "the page links to its own JSON");
});

test("brief: trailing punctuation is redirected away, not a 404, Tek-323", async () => {
  // A mail client links the address in the text part itself, and some of them take
  // the sentence-ending period along. Without this route the reader gets a 404 from
  // the very address the message was meant to deliver. Measured live 2026-08-31.
  const base = "/brief/" + BRIEF_REC.id;
  for (const [path, target] of [
    [base + ".", base],
    [base + ",", base],
    [base + ")", base],
    [base + ".).", base],
    [base + ".md.", base + ".md"],
    [base + ".json)", base + ".json"]
  ]) {
    const r = await getBrief(path);
    assert.equal(r.status, 301, path + " is redirected");
    assert.equal(r.headers.get("location"), "https://turva.dev" + target, path + " redirects to the right target");
    assert.match(r.headers.get("x-robots-tag") || "", /noindex/, path + " redirect carries noindex");
    // 18-F03 (Tek-496 audit round): an access token can travel in this path, so the cleanup
    // redirect must never be cached.
    assert.equal(r.headers.get("cache-control"), "private, no-store", path + " redirect is not cached");
  }
});

test("brief: the cleanup does not rescue an invalid id and does not touch other paths, Tek-323", async () => {
  // The gate may repair ONLY a trailing punctuation mark. If it rescued an id that is
  // too short or upper-case, it would open the path BRIEF_ID exists to close.
  // "/brief/.." is NOT in this list, and the reason is a measurement rather than an
  // opinion: the URL parser normalises it to "/" before the worker sees it, so it
  // answers 200 as the home page and says nothing about this route. Invalidity is tested with an id.
  for (const p of ["/brief/lyhyt.", "/brief/ISOT.", "/brief/.", "/brief/", "/brief/aaaaaaa."]) {
    const r = await getBrief(p);
    assert.equal(r.status, 404, p + " must not be redirected");
  }
  // Other paths do not belong to this route at all.
  const other = await getBrief("/services.");
  assert.notEqual(other.status, 301, "the cleanup must not leak outside the /brief/ path");
});

test("brief: an unknown id and a missing binding both answer 404", async () => {
  const unknown = await getBrief("/brief/eioleolemassa-000000");
  assert.equal(unknown.status, 404);
  const withoutBinding = await get("/brief/" + BRIEF_REC.id);
  assert.equal(withoutBinding.status, 404, "without the KV binding the route does not exist");
});

test("brief: there is no directory listing and an invalid id does not get through", async () => {
  // "/brief/../etc" is not in this list: the URL parser normalises it to "/etc" before the
  // worker sees it, so it would only repeat the generic 404 and say nothing about this route
  // (see the comment in the cleanup test above).
  for (const p of ["/brief/lyhyt", "/brief/ISOT-KIRJAIMET-EIVAT-KELPAA", "/brief"]) {
    const r = await getBrief(p);
    assert.equal(r.status, 404, p + " must not answer");
  }
});

test("brief: Accept negotiation answers from the same address, as elsewhere on the site", async () => {
  const U = "/brief/" + BRIEF_REC.id;
  const cases: [Record<string, string>, RegExp][] = [
    [{}, /text\/html/],
    [{ Accept: "text/html" }, /text\/html/],
    [{ Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" }, /text\/html/],
    [{ Accept: "text/markdown" }, /text\/markdown/],
    [{ Accept: "application/json" }, /application\/json/]
  ];
  for (const [headers, expected] of cases) {
    const r = await worker.fetch(new Request("https://turva.dev" + U, { headers }), briefEnv);
    assert.equal(r.status, 200, JSON.stringify(headers));
    assert.match(r.headers.get("content-type")!, expected, JSON.stringify(headers));
    assert.equal(r.headers.get("vary"), "Accept", "a negotiated answer carries vary: Accept");
    assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow", "a negotiated answer is noindex too");
  }
  const md = await worker.fetch(new Request("https://turva.dev" + U, { headers: { Accept: "text/markdown" } }), briefEnv);
  assert.equal(await md.text(), BRIEF_MD, "the negotiated markdown equals the one at the .md address");
});

// OpenPGP surfaces, added 2026-08-26. These test what the site PROMISES, not what
// the router happens to do: the contact page prints a fingerprint and an address,
// and both claims are checked against the key that is actually served. A key swap
// that leaves the printed fingerprint behind fails here, before a deploy.
const ZB32 = "ybndrfg8ejkmcpqxot1uwisza345h769";
function zbase32(bytes: Uint8Array) {
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i < bits.length; i += 5) out += ZB32[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  return out;
}
function dearmor(text: string) {
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
// read the two SHA-1 calls that were alerted, v4Fingerprint below and the WKD address
// check in the contact-page test, as password hashing (js/insufficient-password-hash,
// alerts 8 and 9, then 17 and 18 after the rename to .ts) while they used createHash.
// Those two now use WebCrypto, which CodeQL's JavaScript crypto model does not cover.
// Two later tests compute the same WKD hash with createHash("sha1") and did not alert.
// The inputs are a public key and a public local part. Keep SHA-1 in every place.
async function v4Fingerprint(keyBytes: Buffer) {
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
  return Buffer.from(await crypto.subtle.digest("SHA-1", Buffer.concat([head, body]))).toString("hex").toUpperCase();
}

test("PGP: /pgp-key.asc serves a public key and never private material", async () => {
  const r = await get("/pgp-key.asc");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type")!, /application\/pgp-keys/);
  const body = await r.text();
  assert.match(body, /^-----BEGIN PGP PUBLIC KEY BLOCK-----/);
  assert.match(body, /-----END PGP PUBLIC KEY BLOCK-----\s*$/);
  assert.equal(/PRIVATE KEY/.test(body), false, "a private key must never reach this route");
});

test("PGP: the fingerprint printed on the contact page is the fingerprint of the served key", async () => {
  const armored = await (await get("/pgp-key.asc")).text();
  const fpr = await v4Fingerprint(dearmor(armored));
  const page = await (await get("/contact")).text();
  const printed = (page.match(/[0-9A-F]{4}(?:[ ][0-9A-F]{4}){9}/) || [""])[0].replace(/ /g, "");
  assert.equal(printed, fpr, "contact page prints " + printed + " but the served key is " + fpr);
});

test("PGP: WKD serves the same key as bytes, at the hash of the address the page names", async () => {
  const page = await (await get("/contact")).text();
  // Anchored to the section rather than to one sentence: the wording of the encrypted-email
  // paragraph is page copy and has moved once (2026-09-09), the section id is a gated anchor.
  const sec = (page.split('id="encrypted-email"')[1] || "").split("</section>")[0];
  const local = (sec.match(/([a-z0-9._-]+)@turva\.dev/) || [])[1];
  assert.ok(local, "the contact page must name the address encrypted mail goes to");
  // WKD hashes the local part with SHA-1 and z-base-32 by specification
  // (draft-koch-openpgp-webkey-service section 3.1), which is what makes the address
  // a path. Section 5 of the same draft says outright that this SHA-1 is not a security
  // feature and only maps the local part to a fixed-size string, so a stronger digest
  // here would serve the key at an address no mail client looks at.
  const hash = zbase32(Buffer.from(await crypto.subtle.digest("SHA-1", Buffer.from(local))));
  const r = await get("/.well-known/openpgpkey/hu/" + hash);
  assert.equal(r.status, 200, "WKD must answer at the hash of " + local);
  assert.match(r.headers.get("content-type")!, /application\/octet-stream/);
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
  assert.match(r.headers.get("content-type")!, /application\/pgp-keys/);
});

test("PGP: the WKD advanced method serves the same bytes as the direct method", async () => {
  const hash = zbase32(createHash("sha1").update("erik").digest());
  const adv = await worker.fetch(new Request(
    "https://openpgpkey.turva.dev/.well-known/openpgpkey/turva.dev/hu/" + hash + "?l=erik"), env);
  assert.equal(adv.status, 200, "the advanced host must answer");
  assert.match(adv.headers.get("content-type")!, /application\/octet-stream/);
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
// onto three lines, and the release verify chain, the 39 tests here and the repository checks were all green because
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
// R3b-1 (audit round 14, batch T). docs/endpoints.md lists the public routes, and
// every one of them is supposed to resolve because the file's own first line says
// "if a path is listed here it resolves in src/worker.ts". A large group of them
// had never been exercised by worker.fetch in this file: this table closes that gap
// route by route, so a path that stops resolving fails here before a deploy rather
// than only during the next audit's live curl pass. The table below is a hand-kept
// copy with the expected status and content type of each path; the P8 test further
// down reads docs/endpoints.md itself, so the document cannot drift unseen. Every
// expected status and content-type below was read out of src/worker.ts, not guessed:
// the 200s are serveStatic() calls, and /oauth/authorize and /oauth/token both go
// through serveOauthClosed(), which answers 400 with a spec-valid OAuth error body
// rather than a 404, because the discovery documents advertise these paths and must
// never point at something that does not respond.
const DOCUMENTED_ROUTES: [string, number, RegExp][] = [
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
  ["/.well-known/ard.json", 200, /application\/json/],
  ["/.well-known/ai-catalog.json", 200, /application\/json/],
  ["/.well-known/agent-skills/index.json", 200, /application\/json/],
  // SKILLS names services with skill.md content, src/worker.ts.
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
  // The IndexNow key file address, src/worker.ts (INDEXNOW_KEY, not exported,
  // so the value is copied here rather than derived).
  ["/9b7e4c21a8f3d65e0c1b9a4d7f2e8c63.txt", 200, /text\/plain/],
  // Aliases row.
  ["/ai.txt", 200, /text\/plain/],
  ["/security.txt", 200, /text\/plain/],
  ["/.well-known/mcp.json", 200, /application\/json/],
  ["/.well-known/openid-configuration", 200, /application\/json/],
  ["/.well-known/openapi.json", 200, /application\/json/],
  ["/favicon.ico", 200, /image\/svg\+xml/],
  ["/favicon.svg", 200, /image\/svg\+xml/],
  // Eight more paths endpoints.md lists as resolving. Status and type are read from the matching
  // branches of src/worker.ts: the .json aliases of the AP2 and ACP manifests, the A2A card under
  // /a2a/, the revocation instructions, the well-known alias of the PGP key and the registry
  // verification file.
  ["/.well-known/ap2.json", 200, /application\/json/],
  ["/.well-known/acp.json", 200, /application\/json/],
  ["/.well-known/acp/config.json", 200, /application\/json/],
  ["/.well-known/acp/manifest.json", 200, /application\/json/],
  ["/.well-known/a2a/agent-card.json", 200, /application\/json/],
  ["/agent/auth/revocation", 200, /application\/json/],
  ["/.well-known/pgp-key.asc", 200, /application\/pgp-keys/],
  ["/.well-known/mcp-registry-auth", 200, /text\/plain/]
];

test("R3b-1: every path in the hand-kept route table answers with its expected status and content type", async () => {
  for (const [path, status, contentType] of DOCUMENTED_ROUTES) {
    const r = await get(path);
    assert.equal(r.status, status, path + " -> " + r.status);
    assert.match(r.headers.get("content-type") || "", contentType, path + " content-type");
  }
});

// Tek-777 P8 (round 24, WT1-2): docs/endpoints.md is the public list of routes, and until now no test read it, so a row
// the Worker stopped serving, or a row added by mistake, went unseen. This test reads the file itself. Every code span
// in the table that is a path (optionally with a method or a turva.dev host in front) is requested through worker.fetch,
// with the placeholders of the table filled in, and must not come back as the Worker's own HTML 404 or as a 5xx. A 404
// with a JSON body is a documented answer (the A2A task routes say -32001 task not found with status 404). A path the
// Worker does not serve but public/ holds as a static asset (the badge image) passes because the file exists there.
// This covers the direction doc -> Worker; the Worker has no exported route table, so a route served but not listed is
// not detected here.
async function unresolvedEndpointsDocRoutes(doc: string): Promise<{ checked: number; broken: string[] }> {
  const wkdHash = zbase32(Buffer.from(await crypto.subtle.digest("SHA-1", Buffer.from("erik"))));
  const fill = (s: string) => s
    .replace("<page>", "services")
    .replace("<name>", "services")
    .replace("<hash>", wkdHash)
    .replace("<indexnow-key>", "9b7e4c21a8f3d65e0c1b9a4d7f2e8c63")
    .replace("{id}", "abc");
  const broken: string[] = [];
  let checked = 0;
  for (const line of doc.split("\n")) {
    if (!line.startsWith("| ") || line.startsWith("| Path ") || line.startsWith("|---")) continue;
    for (const m of line.matchAll(/`([^`]+)`/g)) {
      let token = m[1];
      let method = "GET";
      const withMethod = /^(GET|POST) /.exec(token);
      if (withMethod) { method = withMethod[1]; token = token.slice(withMethod[0].length); }
      let host = "turva.dev";
      const withHost = /^([a-z0-9-]+\.turva\.dev)(\/.*)$/.exec(token);
      if (withHost) { host = withHost[1]; token = withHost[2]; }
      if (!token.startsWith("/")) continue;
      const path = fill(token);
      const init: RequestInit = { method };
      if (method === "POST") { init.headers = { "content-type": "application/json" }; init.body = "{}"; }
      const r = await worker.fetch(new Request("https://" + host + path, init), env, {});
      checked++;
      const isHtml404 = r.status === 404 && /text\/html/.test(r.headers.get("content-type") || "");
      const isStaticAsset = isHtml404 && existsSync(new URL("../public" + path.split("?")[0], import.meta.url));
      if (r.status >= 500 || (isHtml404 && !isStaticAsset)) broken.push(method + " " + host + path + " -> " + r.status);
    }
  }
  return { checked, broken };
}

test("P8: every route that docs/endpoints.md lists resolves in the Worker", async () => {
  const doc = readFileSync(new URL("../../docs/endpoints.md", import.meta.url), "utf8");
  const { checked, broken } = await unresolvedEndpointsDocRoutes(doc);
  assert.ok(checked >= 50, "the table parser must find the table's routes (saw " + checked + ")");
  assert.deepEqual(broken, [], "listed in docs/endpoints.md but not served");
});

test("P8: the endpoints.md check fails on a copy of the file with an invented route", async () => {
  const doc = readFileSync(new URL("../../docs/endpoints.md", import.meta.url), "utf8");
  const mutated = doc.replace("| `/robots.txt` |", "| `/invented-route-for-the-mutation-check` | Not served |\n| `/robots.txt` |");
  assert.notEqual(mutated, doc, "the mutation must change the copy");
  const { broken } = await unresolvedEndpointsDocRoutes(mutated);
  assert.deepEqual(broken, ["GET turva.dev/invented-route-for-the-mutation-check -> 404"]);
});

test("R3b-1: the fediverse well-known paths redirect to social.turva.dev, not this Worker", async () => {
  // src/worker.ts. Everything else the apex serves stays here; only
  // host-meta, webfinger and nodeinfo hand off to the Mastodon instance.
  for (const path of ["/.well-known/host-meta", "/.well-known/webfinger", "/.well-known/nodeinfo"]) {
    const r = await get(path);
    assert.equal(r.status, 301, path + " must redirect");
    assert.equal(r.headers.get("location"), "https://social.turva.dev" + path);
  }
});

test("R3b-1: OPTIONS on a payable path is not swallowed by the CORS preflight when the host is not the apex", async () => {
  // Round 13 R1g-3 moved the CORS-preflight block to run after the www/mta-sts
  // host redirects (src/worker.ts), specifically so that promise ("everything
  // else sends to turva.dev") holds for OPTIONS too. A 204 here would mean the
  // preflight block had drifted back in front of the host checks.
  for (const host of ["www.turva.dev", "mta-sts.turva.dev"]) {
    const r = await worker.fetch(new Request("https://" + host + "/api/agent/audit", { method: "OPTIONS" }), env);
    assert.equal(r.status, 301, host + " must redirect an OPTIONS preflight rather than answer 204");
  }
});

test("R3b-1: the IndexNow key file carries the agent-api security-header profile", async () => {
  // applySecurityHeaders (src/worker.ts) differs between "agent-api" and
  // "default" only in Cross-Origin-Resource-Policy: cross-origin vs same-origin.
  // /<indexnow-key>.txt is served with kind "agent-api" (src/worker.ts).
  const indexnow = await get("/9b7e4c21a8f3d65e0c1b9a4d7f2e8c63.txt");
  assert.equal(indexnow.status, 200);
  assert.equal(indexnow.headers.get("cross-origin-resource-policy"), "cross-origin",
    "the IndexNow key file must use the agent-api CORP value");
  // serveMtaStsPolicy is the one route in the file that explicitly asks for the
  // "default" profile (src/worker.ts), which is what makes this a real
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
  // no access-control-allow-methods header. The preflight branch in src/worker.ts now
  // covers them; /v1/message:send keeps its own POST-only preflight and the fediverse
  // aliases keep redirecting.
  for (const path of ["/api", "/openapi.json", "/llms.txt", "/llms-full.txt", "/auth.md", "/robots.txt", "/.well-known/ai-plugin.json", "/.well-known/mcp/server-card.json", "/.well-known/agent-card.json", "/.well-known/x402", "/.well-known/api-catalog", "/x402", "/api/v1", "/oauth/token", "/oauth/authorize", "/security.txt", "/ai.txt", "/api-catalog", "/blog/feed.xml"]) {
    const r = await worker.fetch(new Request("https://turva.dev" + path, { method: "OPTIONS" }), env, {});
    assert.equal(r.status, 204, path + " must answer 204 to OPTIONS");
    // Round 16 (S1-4): the preflight advertises the methods the route honours, so a GET-only
    // surface says GET, OPTIONS and only the x402 roots and payable routes add POST.
    const postRoute = path === "/api" || path === "/x402" || path.startsWith("/oauth/");
    // Tek-562: the server card preflight says GET and allows If-None-Match, see test/tek562.test.ts.
    const wantMethods = path === "/.well-known/mcp/server-card.json" ? "GET" : postRoute ? "GET, POST, OPTIONS" : "GET, OPTIONS";
    assert.equal(r.headers.get("access-control-allow-methods"), wantMethods, path);
    assert.equal(r.headers.get("access-control-allow-origin"), "*", path);
    assert.ok(r.headers.get("access-control-max-age"), path + " carries access-control-max-age");
    assert.equal(r.headers.get("ratelimit-policy"), '"default";q=100;w=60', path + " preflight carries the security headers (round 16 S1-3)");
  }
  const fedi = await worker.fetch(new Request("https://turva.dev/.well-known/webfinger", { method: "OPTIONS" }), env, {});
  assert.equal(fedi.status, 301, "fediverse aliases still redirect on OPTIONS");
  const a2a = await worker.fetch(new Request("https://turva.dev/v1/message:send", { method: "OPTIONS" }), env, {});
  assert.equal(a2a.headers.get("access-control-allow-methods"), "POST, OPTIONS", "A2A keeps its own POST-only preflight");
});

test("R15 P1a-1: the agent-commerce-discovery guide states the AP2 URI without hyperlinking it", async () => {
  // The URI is an identifier the A2A card declares (kept as is, a recorded intentional choice), but
  // as an address it answers 404, so the guide must not render it as a link.
  const r = await worker.fetch(new Request("https://turva.dev/guides/agent-commerce-discovery"), env, {});
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(html.includes("google-agentic-commerce/ap2/tree/v0.1"), "the URI is still stated");
  assert.ok(!/href="https:\/\/github\.com\/google-agentic-commerce\/ap2\/tree\/v0\.1"/.test(html), "the lowercase URI is not a hyperlink");
  assert.ok(html.includes("identifier, not an address"), "the guide says why");
});


test("R16 S1-1: a method the route does not serve answers 405 with Allow, on pages and agent surfaces alike", async () => {
  // Round 16 measured live that POST, PUT, DELETE and PATCH on /, /llms.txt, /openapi.json and
  // /.well-known/agent-card.json answered 200 with the GET body and no Allow header.
  for (const path of ["/", "/services", "/llms.txt", "/openapi.json", "/.well-known/agent-card.json", "/guides/llms-txt.md", "/sitemap.xml"]) {
    for (const method of ["POST", "PUT", "DELETE", "PATCH"]) {
      const r = await worker.fetch(new Request("https://turva.dev" + path, { method, headers: { "content-type": "application/json" }, body: method === "DELETE" ? undefined : "{}" }), env, {});
      assert.equal(r.status, 405, method + " " + path + " must answer 405");
      assert.equal(r.headers.get("allow"), "GET, HEAD, OPTIONS", method + " " + path);
      assert.equal(r.headers.get("ratelimit-policy"), '"default";q=100;w=60', method + " " + path + " carries the security headers");
    }
  }
  const agent = await worker.fetch(new Request("https://turva.dev/llms.txt", { method: "PUT" }), env, {});
  assert.equal(agent.headers.get("access-control-allow-origin"), "*", "an agent-api 405 stays readable cross-origin");
  const page = await worker.fetch(new Request("https://turva.dev/", { method: "PUT" }), env, {});
  assert.equal(page.headers.get("access-control-allow-origin"), null, "a page 405 does not open CORS");
  // HEAD is a GET without the body and stays a 200.
  const head = await worker.fetch(new Request("https://turva.dev/llms.txt", { method: "HEAD" }), env, {});
  assert.equal(head.status, 200);
  assert.equal((await head.text()).length, 0);
});

test("R16 S1-1: POST keeps working exactly where a handler or the OpenAPI document knows it", async () => {
  const pairs: [string, number[]][] = [
    ["/v1/message:send", [200, 400]],
    ["/api/agent/audit", [402]],
    ["/api", [402]],
    ["/x402", [402]],
    ["/agent/auth/register", [200]],
    ["/oauth/token", [400, 401, 403]],
    ["/api/acp/checkout_sessions", [201]]
  ];
  for (const [path, statuses] of pairs) {
    const r = await worker.fetch(new Request("https://turva.dev" + path, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }), env, {});
    assert.ok(statuses.includes(r.status), "POST " + path + " answered " + r.status + ", wanted one of " + statuses.join("/"));
  }
  // PUT on a payable route is still refused: the route serves GET and POST, nothing else.
  const put = await worker.fetch(new Request("https://turva.dev/api/agent/audit", { method: "PUT" }), env, {});
  assert.equal(put.status, 405);
  assert.equal(put.headers.get("allow"), "GET, HEAD, POST, OPTIONS");
  // The ACP family keeps its own per-path 405 bodies.
  const acp = await worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions", { method: "PUT" }), env, {});
  assert.equal(acp.status, 405);
  assert.equal(JSON.parse(await acp.text()).code, "method_not_allowed");
});

test("R16 S1-2: OPTIONS on a page answers 204 and Allow instead of the page", async () => {
  for (const path of ["/", "/services", "/guides/llms-txt", "/legal", "/nonexistent"]) {
    const r = await worker.fetch(new Request("https://turva.dev" + path, { method: "OPTIONS" }), env, {});
    assert.equal(r.status, 204, "OPTIONS " + path);
    assert.equal(r.headers.get("allow"), "GET, HEAD, OPTIONS", "OPTIONS " + path);
    assert.equal((await r.text()).length, 0, "OPTIONS " + path + " carries no body");
    assert.equal(r.headers.get("access-control-allow-origin"), null, "a page preflight does not open CORS");
  }
  const www = await worker.fetch(new Request("https://www.turva.dev/", { method: "OPTIONS" }), env, {});
  assert.equal(www.status, 301, "the host redirects still run before the method gate");
});

test("R16 S3-1: the validator cuts its details on a code point boundary, so a truncated emoji cannot become invalid UTF-8", async () => {
  const raw = "a".repeat(299) + "\u{1F600}" + "b".repeat(20);
  const r = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent(raw), { headers: { accept: "text/html" } }), env, {});
  assert.equal(r.status, 200);
  const bytes = new Uint8Array(await r.arrayBuffer());
  const text = new TextDecoder("utf-8", { fatal: true } as TextDecoderConstructorOptions).decode(bytes);
  assert.ok(text.includes('value="' + "a".repeat(299) + '"'), "the echoed value ends at the last whole character");
});

test("R16 verifier C: the markdown renderer strips bidi controls from every href it writes", () => {
  const rtlo = "\u202E";
  const html = markdownToHtml("[label](https://example.com/a" + rtlo + "b) and https://example.com/x" + rtlo + "y here and example.com/p" + rtlo + "q there");
  assert.ok(!/href="[^"]*[\u202A-\u202E\u2066-\u2069]/.test(html), "no bidi control inside an href: " + html);
  assert.ok(html.includes('href="https://example.com/ab"'), html);
  assert.ok(html.includes('href="https://example.com/xy"'), html);
  assert.ok(html.includes('href="https://example.com/pq"'), html);
});

test("R16 S2-2 and C5-11: the OpenAPI document and the API catalog name /api/v1 and the ACP checkout operations", async () => {
  const spec = JSON.parse(await (await get("/openapi.json")).text());
  assert.ok(spec.paths["/api/v1"] && spec.paths["/api/v1"].get, "/api/v1 is an OpenAPI path");
  assert.ok(spec.paths["/api/acp/checkout_sessions"] && spec.paths["/api/acp/checkout_sessions"].post);
  assert.ok(spec.paths["/api/acp/checkout_sessions/{session_id}"].get);
  assert.ok(spec.paths["/api/acp/checkout_sessions/{session_id}/complete"].post);
  assert.ok(spec.paths["/api/acp/checkout_sessions/{session_id}/cancel"].post);
  assert.ok(!spec.info.description.includes("ACP enabled on /api/agent/*"), "the description no longer places ACP on the x402 routes");
  // The MPP reading of x-payment-info must stay at three operations (a recorded intentional choice, Tek-160).
  const paid = Object.values<Record<string, Record<string, unknown> | null>>(spec.paths).flatMap((ops) => Object.values(ops)).filter((op) => op && op["x-payment-info"]);
  assert.equal(paid.length, 3, "exactly three operations carry x-payment-info");
  const cat = JSON.parse(await (await get("/.well-known/api-catalog")).text());
  assert.ok(cat.linkset[0]["service-desc"].some((l: { href: string }) => l.href === "https://turva.dev/api/v1"), "the API catalog names /api/v1");
  const live = await get("/api/v1");
  assert.equal(live.status, 200);
});

test("R16 S4-1: no live brief address sits in the source", async () => {
  const src = readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8");
  assert.ok(!/\/brief\/[a-z0-9]+-[a-z0-9]{13}\b/.test(src), "a real brief address (name-13 random chars) must not appear in the source");
});

// One site order (2026-09-04, Tek-336). Round 17 found llms-full.txt opening with 22 blog
// posts and the home page at line 1 824, and sitemap.xml with the tool pages behind every
// post. The order is computed in siteRank() now; this test reads the served files and
// derives the expectation from the same sources a reader would use: the /guides twin for the
// guide order and the posts' dates for the blog, with the primary pages written out.
test("one site order: sitemap.xml and llms-full.txt run primary, auxiliary, guides in /guides order, blog newest first", async () => {
  const primary = ["/", "/services", "/agent-readiness-audit", "/tools", "/llms-txt-validator", "/markdown-parity-check", "/company", "/contact", "/legal"];
  const guidesMd = await (await get("/guides.md")).text();
  const guides = [...guidesMd.matchAll(/\]\(https:\/\/turva\.dev(\/guides\/[a-z0-9-]+)\)/g)].map((m) => m[1]);
  assert.ok(guides.length >= 20, "the /guides twin lists the guides");
  assert.equal(guides[0], "/guides/agent-readiness-audit");
  assert.equal(guides[1], "/guides/choosing-an-agent-readiness-audit");
  const src = readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8");
  const meta = src.slice(src.indexOf("const META_BY_PATH"));
  const posts = [...meta.matchAll(/\n  "(\/blog\/[a-z0-9-]+)": \{[\s\S]*?date: "(\d{4}-\d{2}-\d{2})"/g)].map((m, i) => ({ p: m[1], d: m[2], i }));
  const blog = posts.sort((a, b) => b.d.localeCompare(a.d) || a.i - b.i).map((x) => x.p);
  assert.ok(blog.length > 20, "META_BY_PATH lists the posts");

  const xml = await (await get("/sitemap.xml")).text();
  const sm = [...xml.matchAll(/<loc>https:\/\/turva\.dev(\/[^<]*)?<\/loc>/g)].map((m) => m[1] || "/");
  const samples = ["/samples/audit-report"]; // AUX_PATHS after /auth.md since v3.122.0 (Tek-342)
  assert.deepEqual(sm, [...primary, "/badge", "/auth.md", ...samples, "/guides", ...guides, "/blog", ...blog], "sitemap.xml order");

  const full = await (await get("/llms-full.txt")).text();
  const sources = [...full.matchAll(/ Source: https:\/\/turva\.dev(\/\S*)?\n/g)].map((m) => m[1] || "/");
  assert.deepEqual(sources, [...primary, "/badge", ...samples, "/guides", ...guides, "/blog", ...blog, "/auth.md"], "llms-full.txt order");
  assert.ok(full.indexOf("Source: https://turva.dev/\n") < full.indexOf("Source: https://turva.dev/blog"), "the home page comes before the blog");

  // The services, the audit first, then the advisory, the same in every home that lists them (domain-check withdrawn, Tek-758).
  const priced = facts.services.filter((s: { priceKey: string | null; id: string }) => s.priceKey).map((s: { priceKey: string; id: string }) => s.id);
  assert.equal(priced[0], "audit");
  assert.equal(priced[1], "advisory");
  const acp = JSON.parse(await (await get("/api/acp")).text());
  assert.deepEqual(acp.items, priced, "ACP index items");
  const skills = JSON.parse(await (await get("/.well-known/agent-skills/index.json")).text()).skills.map((s: { name: string }) => s.name);
  const card = JSON.parse(await (await get("/.well-known/agent-card.json")).text()).skills.map((s: { id: string }) => s.id);
  assert.deepEqual(skills, card, "agent-skills index and the A2A card list the skills in one order");
  assert.equal(skills[0], "services");
});

// Astra 2026-09-10 (F2), decided as Tek-383. A body that does not parse used to become an
// empty object, so `{`, `null`, `[]` and `""` all answered 201 with the default audit
// session: a client's input error was told it had created an order. The boundary this test
// exists to hold is the pair at the end: a VALID empty object still gets the default, and
// R16 S1-1 above sends exactly that.
test("A10-1: the ACP checkout refuses a body it cannot read, and keeps the default for one it can", async () => {
  const post = (body: string) => worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions", { method: "POST", headers: { "content-type": "application/json" }, body }), env, {});
  for (const [body, code] of [["{", "invalid_body"], ["null", "invalid_body"], ["[]", "invalid_body"], ['""', "invalid_body"], ["3", "invalid_body"]]) {
    const r = await post(body);
    assert.equal(r.status, 400, "body " + body + " is not a JSON object");
    assert.equal((await json(r)).code, code);
  }
  const empty = await worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions", { method: "POST" }), env, {});
  assert.equal(empty.status, 400, "no body at all does not parse either");
  for (const body of ["{}", '{"items":[]}', '{"items":[{"id":"audit"}]}']) {
    const r = await post(body);
    assert.equal(r.status, 201, "body " + body + " is a valid request");
    assert.equal((await json(r)).line_items[0].item.id, "audit");
  }
});

// The list was read at index 0 and nowhere else, so a second entry disappeared without a
// word even when its id was not a service. One session buys one service, because the
// session id encodes which one (Tek-383).
test("A10-2: the ACP checkout reads every item, not only the first", async () => {
  const post = (body: string) => worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions", { method: "POST", headers: { "content-type": "application/json" }, body }), env, {});
  const two = await post('{"items":[{"id":"advisory"},{"id":"audit"}]}');
  assert.equal(two.status, 400, "two items are refused rather than truncated to the first");
  assert.equal((await json(two)).code, "too_many_items");
  const twoBad = await post('{"items":[{"id":"advisory"},{"id":"not-a-service"}]}');
  assert.equal(twoBad.status, 400, "a second entry that is not a service does not pass behind a valid first one");
  assert.equal((await json(await post('{"items":"audit"}'))).code, "invalid_items");
  assert.equal((await json(await post('{"items":[null]}'))).code, "invalid_item");
  assert.equal((await json(await post('{"items":[{"id":1}]}'))).code, "invalid_item");
  const one = await post('{"items":[{"id":"advisory"}]}');
  assert.equal(one.status, 201, "one valid item is unchanged");
  assert.equal((await json(one)).line_items[0].item.id, "advisory");
  const retired = await post('{"items":[{"id":"shopify"}]}');
  assert.equal(retired.status, 400, "the retired shopify item id is an unknown item");
  assert.equal((await json(retired)).code, "invalid_item");
});

// F09 (Tek-496 audit round): one checkout session buys one unit of one service. A quantity
// present and not exactly 1 used to be silently rewritten to 1, and an explicit id: null used
// to be treated the same as an absent id (the default "audit" service), instead of being
// rejected as the distinct invalid input it is.
test("F09: ACP checkout rejects a quantity other than 1 and an explicit null id", async () => {
  const post = (body: string) => worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions", { method: "POST", headers: { "content-type": "application/json" }, body }), env, {});
  for (const body of ['{"items":[{"id":"implementation","quantity":10}]}', '{"items":[{"id":"advisory","quantity":-1}]}', '{"items":[{"id":"audit","quantity":0}]}', '{"items":[{"id":"audit","quantity":1.5}]}']) {
    const r = await post(body);
    assert.equal(r.status, 400, body + " must be refused, not rewritten to quantity 1");
    assert.equal((await json(r)).code, "invalid_quantity");
  }
  const nullId = await post('{"items":[{"id":null}]}');
  assert.equal(nullId.status, 400, "an explicit id: null must not fall back to the default service");
  assert.equal((await json(nullId)).code, "invalid_item");
  const absentId = await post('{"items":[{"quantity":1}]}');
  assert.equal(absentId.status, 201, "an absent id still keeps the default service");
  assert.equal((await json(absentId)).line_items[0].item.id, "audit");
  const okQty = await post('{"items":[{"id":"audit","quantity":1}]}');
  assert.equal(okQty.status, 201, "an explicit quantity of exactly 1 is unchanged");
});

// F10 (Tek-496 audit round): the OpenAPI document declared 200 intervention_required for the
// complete operation while the handler always answered 422. The document now names the real
// status and shape.
test("F10: ACP checkout complete answers 422, matching the OpenAPI document", async () => {
  const create = await worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions", { method: "POST", headers: { "content-type": "application/json" }, body: '{"items":[{"id":"audit"}]}' }), env, {});
  const session = await json(create);
  const complete = await worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions/" + session.id + "/complete", { method: "POST" }), env, {});
  assert.equal(complete.status, 422, "complete always answers 422, never 200");
  assert.equal((await json(complete)).code, "intervention_required");
  const openapi = await worker.fetch(new Request("https://turva.dev/openapi.json"), env, {});
  const spec = await json(openapi);
  const responses = spec.paths["/api/acp/checkout_sessions/{session_id}/complete"].post.responses;
  assert.ok(responses["422"], "the OpenAPI document declares the 422 response");
  assert.ok(!responses["200"], "the OpenAPI document no longer declares a misleading 200");
});

test("F14: the retired domain-check id is an unknown ACP item, an old session id is 404, and the audit keeps its invoice message", async () => {
  const retired = await worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions", { method: "POST", headers: { "content-type": "application/json" }, body: '{"items":[{"id":"domain-check"}]}' }), env, {});
  assert.equal(retired.status, 400, "the retired domain-check item id is an unknown item");
  assert.equal((await json(retired)).code, "invalid_item");
  const old = await worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions/acp_sess_domain-check_00000000-0000-4000-8000-000000000000"), env, {});
  assert.equal(old.status, 404, "an old domain-check session id no longer resolves");
  const audit = await json(await worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions", { method: "POST", headers: { "content-type": "application/json" }, body: '{"items":[{"id":"audit"}]}' }), env, {}));
  const auditComplete = await json(await worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions/" + audit.id + "/complete", { method: "POST" }), env, {}));
  assert.ok(auditComplete.message.includes("then turva invoices directly."), "the audit keeps its message");
});

// The hosted validator and the npm package are one implementation in two files and they
// answer identically by rule. These are the same cases the package's own suite runs
// (llms-txt-validator/test/validate.test.ts, Astra 2026-09-10 F1).
test("A10-3: the hosted validator reads fences and indented headings like the package", async () => {
  const ask = async (text: string) => {
    const real = globalThis.fetch;
    globalThis.fetch = async (url) => new Response(String(url).endsWith("/llms.txt") ? text : "<html><head></head></html>", { headers: { "Content-Type": String(url).endsWith("/llms.txt") ? "text/plain" : "text/html" } });
    try {
      const r = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com", { headers: { Accept: "application/json" } }), env, {});
      return await json(r);
    } finally { globalThis.fetch = real; }
  };
  const at = (body: { checks: { id: string; status: string }[] }, id: string) => body.checks.find((c) => c.id === id)!;
  for (const fence of ["```", "~~~"]) {
    const body = await ask("# Site\n> Summary\n\n" + fence + "\n## Docs\n- [Doc](https://example.com/doc)\n" + fence + "\n");
    assert.equal(at(body, "sections").status, "warn", fence + ": a fenced H2 is not a section");
    assert.equal(at(body, "links").status, "warn", fence + ": a fenced link is not a link");
  }
  const indented = await ask("# Site\n> Summary\n\n  ## Docs\n  - [Doc](https://example.com/doc)\n");
  assert.equal(at(indented, "sections").status, "pass", "two spaces is still a heading");
  assert.equal(indented.summary, "valid");
});

// Found by a second outside review of the public repos, 2026-09-12 (character references in an
// attribute, U+0130 moving indexes, NBSP in the head), and by a differential fuzz against parse5 while
// fixing them (the same ASCII rules at their other sites, and the tokenizer states around "="). Every
// expected value below is what parse5 puts in the head, checked case by case before the tests were
// written, and the Link header cases are read per RFC 8288, where HTML references do not apply.
test("attribute values are read after their character references are decoded", () => {
  // A numeric reference inside rel.
  assert.equal(findLinkRelations("<head><link rel=\"described&#98;y\" href=\"/llms.txt\"></head>", "").describedby, "/llms.txt");
  // &amp; in a query string.
  assert.equal(findLinkRelations("<head><link rel=\"describedby\" href=\"/llms.txt?a=1&amp;b=2\"></head>", "").describedby, "/llms.txt?a=1&b=2");
  // Named and hex references in unquoted values.
  assert.equal(findLinkRelations("<head><link rel=&#x61;lternate type=text&sol;markdown href=/a&period;md></head>", "").markdown, "/a.md");
  // Single quotes, a legacy name without its semicolon at a quote, uppercase X.
  assert.equal(findLinkRelations("<head><link rel='describedby' href='/x&lt;y&#X3E;z&gt'></head>", "").describedby, "/x<y>z>");
  // A legacy name is not decoded when a letter, a digit or = follows.
  assert.equal(findLinkRelations("<head><link rel=\"describedby\" href=\"/x?a=1&ampb=2&amp=3&amp\"></head>", "").describedby, "/x?a=1&ampb=2&amp=3&");
  // Zero, a surrogate, past U+10FFFF, the windows-1252 range, and a longest match.
  assert.equal(findLinkRelations("<head><link rel=\"describedby\" href=\"/&#0;&#xD800;&#x110000;&#128;&#x9D;&notin;&notit;\"></head>", "").describedby, "/\ufffd\ufffd\ufffd\u20ac\u009d\u2209&notit;");
  // A decoded quote does not end a value.
  assert.equal(findLinkRelations("<head><link title=\"&quot; rel=describedby href=/fake\" rel=\"alternate\"></head>", "").describedby, null);
  // The Link header is not HTML, so a reference in it stays as written.
  assert.equal(findLinkRelations("", "</llms.txt?a=1&amp;b=2>; rel=\"describedby\"").describedby, "/llms.txt?a=1&amp;b=2");
});

test("case and whitespace follow the HTML tokenizer, which knows only ASCII", () => {
  // U+0130 in a title.
  assert.equal(findLinkRelations("<head><title>\u0130</title><link rel=\"describedby\" href=\"/llms.txt\"></head>", "").describedby, "/llms.txt");
  // U+0130 in a comment.
  assert.equal(findLinkRelations("<head><!--\u0130--><link rel=\"describedby\" href=\"/llms.txt\"></head>", "").describedby, "/llms.txt");
  // U+212A is not an ASCII k.
  assert.equal(findLinkRelations("<head><link rel=\"alternate\" type=\"text/mar\u212adown\" href=\"/a.md\"></head>", "").markdown, null);
  // NBSP between head elements starts the body.
  assert.equal(findLinkRelations("<head>\u00a0<link rel=\"describedby\" href=\"/llms.txt\"></head>", "").describedby, null);
  // The five HTML whitespace characters keep the head open.
  assert.equal(findLinkRelations("<head> \t\n\r\f<link rel=\"describedby\" href=\"/llms.txt\"></head>", "").describedby, "/llms.txt");
  // NBSP does not separate rel tokens.
  assert.equal(findLinkRelations("<head><link rel=\"describedby\u00a0alternate\" href=\"/llms.txt\"></head>", "").describedby, null);
  // NBSP does not end a tag name.
  assert.equal(findLinkRelations("<head><link\u00a0x rel=\"describedby\" href=\"/llms.txt\"></head>", "").describedby, null);
  // The Link header still reads when the HTML finds nothing.
  assert.equal(findLinkRelations("<head>\u00a0<link rel=\"describedby\" href=\"/fake\"></head>", "</llms.txt>; rel=\"describedby\"").describedby, "/llms.txt");
});

test("a tag ends where the tokenizer ends it, not at a quote after any \"=\"", () => {
  // An end tag that only starts with body is ignored in the head.
  assert.equal(findLinkRelations("<head></bodyx><link rel=\"describedby\" href=\"/llms.txt\"></head>", "").describedby, "/llms.txt");
  // A bogus comment ends at the first >, quote or not.
  assert.equal(findLinkRelations("<head><!x a=\"><link rel=\"describedby\" href=\"/llms.txt\"></head>", "").describedby, "/llms.txt");
  // A second = after a quoted value starts a name, and the > in it ends the tag.
  assert.equal(findLinkRelations("<head><link a=\"x\"=\">\" rel=\"describedby\" href=\"/fake\"></head>", "").describedby, null);
  // An = where a name is expected starts a name.
  assert.equal(findLinkRelations("<head><link =\">\" rel=\"describedby\" href=\"/fake\"></head>", "").describedby, null);
  // A tag that ends in such a name leaves the next tag in the head.
  assert.equal(findLinkRelations("<head><link a=\"x\"=><link rel=\"describedby\" href=\"/llms.txt\"></head>", "").describedby, "/llms.txt");
  // A > inside a quoted value still does not end the tag.
  assert.equal(findLinkRelations("<head><link data-x=\"a>b\" rel=\"describedby\" href=\"/llms.txt\"></head>", "").describedby, "/llms.txt");
});

// Found by the independent verifier of the fix above, 2026-09-12. A parser tokenizes an input
// stream whose CRLF and CR have already become LF, and a page's own comments must not make the
// head scan quadratic: 256 KB of short comments took about five seconds before.
test("a CR in the head reads as LF, as it does after a parser's input preprocessing", () => {
  assert.equal(findLinkRelations('<head><link rel="describedby" href="a\rb"></head>', "").describedby, "a\nb");
  assert.equal(findLinkRelations('<head><link rel="describedby" href="a\r\nb"></head>', "").describedby, "a\nb");
  assert.equal(findLinkRelations('<head>\r\n<link rel="describedby" href="/llms.txt">\r</head>', "").describedby, "/llms.txt");
});

test("many comments in the head are scanned in linear time", async () => {
  const head = (k: number) => "<head>" + "<!--x-->".repeat(k) + '<link rel="describedby" href="/llms.txt"></head>';
  assert.equal(findLinkRelations(head(32000), "").describedby, "/llms.txt");
  await assertLinear("8000 and 32000 comments", (s) => findLinkRelations(s, ""), head(8000), head(32000));
});

// Outside review of the public repos, 2026-09-22 (F05). Both anonymous JSON routes read the whole
// body before this, so a request of about 1 MB was parsed and answered 200 or 201. The cap is
// counted from the stream, and the stream case below sends no Content-Length at all.
const streamOf = (text: string, chunk = 4096) => {
  const bytes = new TextEncoder().encode(text);
  let o = 0;
  return new ReadableStream({
    pull(c) {
      if (o >= bytes.length) { c.close(); return; }
      c.enqueue(bytes.slice(o, o + chunk));
      o += chunk;
    }
  });
};
const postBody = (path: string, body: string | ReadableStream, extraEnv?: object) => worker.fetch(new Request("https://turva.dev" + path, typeof body === "string"
  ? { method: "POST", headers: { "content-type": "application/json" }, body }
  : { method: "POST", headers: { "content-type": "application/json" }, body, duplex: "half" } as RequestInit), extraEnv || env, {});
// F13 (Tek-496 audit round): postBody above never sets Content-Length itself, so a test that
// claimed to cover "with and without Content-Length" was really covering "without" twice. This
// variant sets the header explicitly, either to the real byte length or to a deliberately too
// small one, so the byte-cap enforcement is proven against a header instead of only against a
// bodyless Request object.
const postBodyWithLength = (path: string, body: string, contentLength: number, extraEnv?: object) => worker.fetch(new Request("https://turva.dev" + path, {
  method: "POST", headers: { "content-type": "application/json", "content-length": String(contentLength) }, body
}), extraEnv || env, {});

test("F05: A2A and ACP answer 413 to a body over 16 KB, sent as a string and as a stream without Content-Length", async () => {
  const bodies = {
    "/v1/message:send": (n: number) => JSON.stringify({ message: { parts: [{ kind: "text", text: "x".repeat(n) }] } }),
    "/api/acp/checkout_sessions": (n: number) => JSON.stringify({ items: [{ id: "audit" }], padding: "x".repeat(n) })
  };
  for (const [path, make] of Object.entries(bodies)) {
    const huge = make(1024 * 1024);
    for (const body of [huge, streamOf(huge)]) {
      const r = await postBody(path, body);
      assert.equal(r.status, 413, path + (typeof body === "string" ? " as a string body" : " as a stream"));
      assert.match(r.headers.get("content-type")!, /application\/json/);
      const j = await json(r);
      assert.ok(JSON.stringify(j).includes("16384"), path + " names the limit");
    }
    // The boundary: a body of exactly 16384 bytes is read, one byte more is not.
    const pad = (target: number) => { const base = make(0).length; return make(target - base); };
    assert.equal(pad(16384).length, 16384);
    const at = await postBody(path, streamOf(pad(16384), 1000));
    assert.equal(at.status, path === "/v1/message:send" ? 200 : 201, path + " at the limit");
    const over = await postBody(path, pad(16385));
    assert.equal(over.status, 413, path + " one byte over");
  }
});

test("F13: the byte cap is enforced against the actual stream, not the declared Content-Length", async () => {
  const bodies = {
    "/v1/message:send": (n: number) => JSON.stringify({ message: { parts: [{ kind: "text", text: "x".repeat(n) }] } }),
    "/api/acp/checkout_sessions": (n: number) => JSON.stringify({ items: [{ id: "audit" }], padding: "x".repeat(n) })
  };
  for (const [path, make] of Object.entries(bodies)) {
    const huge = make(1024 * 1024);
    // A correct Content-Length still hits the cap.
    const withCorrectLength = await postBodyWithLength(path, huge, huge.length);
    assert.equal(withCorrectLength.status, 413, path + " with a correct Content-Length");
    // A deliberately too-small Content-Length (as if the client undercounted or lied) must not
    // let an oversized body slip past the cap: the check reads and counts the real stream.
    const withTooSmallLength = await postBodyWithLength(path, huge, 10);
    assert.equal(withTooSmallLength.status, 413, path + " with a too-small Content-Length");
  }
});

test("F05: the rate limiter still answers first, and a malformed body is still a 400", async () => {
  const limited = { RATE_LIMITER: { limit: async () => ({ success: false }) } };
  const huge = JSON.stringify({ message: { parts: [{ text: "x".repeat(1024 * 1024) }] } });
  assert.equal((await postBody("/v1/message:send", huge, limited)).status, 429);
  assert.equal((await postBody("/api/acp/checkout_sessions", huge, limited)).status, 429);
  assert.equal((await postBody("/v1/message:send", "{")).status, 400);
  assert.equal((await postBody("/api/acp/checkout_sessions", "{")).status, 400);
  assert.equal((await postBody("/api/acp/checkout_sessions", '{"items":[{"id":"audit"}]}')).status, 201);
});

test("F05: A2A takes at most 32 parts", async () => {
  const parts = (n: number) => JSON.stringify({ message: { parts: Array.from({ length: n }, () => ({ kind: "text", text: "services" })) } });
  assert.equal((await postBody("/v1/message:send", parts(32))).status, 200);
  const r = await postBody("/v1/message:send", parts(33));
  assert.equal(r.status, 400);
  assert.ok((await json(r)).error.message.includes("32 parts"));
});

// Outside review, 2026-09-22 (F04). A refused redirect kept the target's user name and password in
// the check's detail, and the form repeated a typed password. Every value here is synthetic, and
// fetch is replaced in memory, so no request leaves the test.
test("F04: the hosted validator masks a refused redirect target and a typed secret", async () => {
  const SECRET = "SYNTHETICPASSWORDNOTREAL";
  const QSECRET = "SYNTHETICQUERYNOTREAL";
  const orig = globalThis.fetch;
  const asked: string[] = [];
  globalThis.fetch = async (u) => {
    asked.push(String(u));
    return new Response(null, { status: 302, headers: { location: "https://user:" + SECRET + "@example.com/llms.txt?token=" + QSECRET + "#frag" } });
  };
  try {
    const r = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com", { headers: { accept: "application/json" } }), env, {});
    const text = await r.text();
    assert.equal(r.status, 200);
    const detail = JSON.parse(text).checks[0].detail;
    assert.ok(detail.includes("unsupported target (https://example.com/llms.txt?token=***)"), detail);
    assert.ok(!text.includes(SECRET) && !text.includes(QSECRET) && !text.includes("frag"), "JSON answer");
    const html = await (await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com"), env, {})).text();
    assert.ok(html.includes("unsupported target"), "the HTML answer shows the refusal");
    assert.ok(!html.includes(SECRET) && !html.includes(QSECRET), "HTML answer");
    assert.ok(asked.every((u) => !u.includes(SECRET)), "the credential target was never requested");
    const echo = (page: string) => (/id="vurl" name="url"[^>]*value="([^"]*)"/.exec(page) || [])[1];
    const typedCases = [
      ["https://user:" + SECRET + "@example.com/", ""],
      ["user:" + SECRET + "@example.com", ""],
      ["example.com/?k=" + QSECRET, "example.com"],
      // Found by the independent review of the first version: an @ past the 300 character cut, and a
      // second scheme that makes the parser read "https" as the host and put the secret in the path.
      ["https://user:" + SECRET + "S".repeat(300) + "@example.com/", ""],
      ["https:/user:" + SECRET + "@example.com/path", "https"]
    ];
    for (const [typed, shown] of typedCases) {
      const page = await (await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent(typed)), env, {})).text();
      assert.ok(!page.includes(SECRET) && !page.includes(QSECRET), typed.slice(0, 40));
      assert.equal(echo(page), shown, typed.slice(0, 40));
    }
  } finally {
    globalThis.fetch = orig;
  }
  const plain = await (await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent("not a domain")), env, {})).text();
  assert.ok(plain.includes('value="not a domain"'), "an entry without @, ? or # is repeated as typed");
});
test("PGP: /pgp-key.asc holds the version 4 key alone and /pgp-key-v6.asc holds the version 6 key alone", async () => {
  const v4 = dearmor(await (await get("/pgp-key.asc")).text());
  const r6 = await get("/pgp-key-v6.asc");
  assert.equal(r6.status, 200);
  assert.match(r6.headers.get("content-type")!, /application\/pgp-keys/);
  const r4 = await get("/pgp-key.asc");
  assert.equal(r6.headers.get("cache-control"), r4.headers.get("cache-control"), "both key addresses carry the same cache header");
  const text6 = await r6.text();
  assert.match(text6, /^-----BEGIN PGP PUBLIC KEY BLOCK-----/);
  assert.equal((text6.match(/-----END PGP PUBLIC KEY BLOCK-----/g) || []).length, 1, "one armored block");
  assert.equal(/PRIVATE KEY/.test(text6), false, "a private key must never reach this route");
  const v6 = dearmor(text6);
  const pk4 = publicKeyPackets(v4);
  const pk6 = publicKeyPackets(v6);
  assert.deepEqual(pk4, [4], "the first block holds one public key and it is version 4");
  assert.deepEqual(pk6, [6], "the second block holds one public key and it is version 6");
});

// Packet walk for the two published blocks: returns the version byte of every public-key packet.
function publicKeyPackets(bytes: Buffer) {
  const out = [];
  let i = 0;
  while (i < bytes.length) {
    const first = bytes[i];
    assert.equal(first & 0x80, 0x80, "not an OpenPGP packet header");
    let tag, hs, bl;
    if (first & 0x40) {
      tag = first & 0x3f;
      const l = bytes[i + 1];
      if (l < 192) { bl = l; hs = 2; }
      else if (l < 224) { bl = ((l - 192) << 8) + bytes[i + 2] + 192; hs = 3; }
      else { bl = bytes.readUInt32BE(i + 2); hs = 6; }
    } else {
      tag = (first >> 2) & 0x0f;
      const lt = first & 0x03;
      if (lt === 0) { bl = bytes[i + 1]; hs = 2; }
      else if (lt === 1) { bl = bytes.readUInt16BE(i + 1); hs = 3; }
      else { bl = bytes.readUInt32BE(i + 1); hs = 5; }
    }
    if (tag === 6) out.push(bytes[i + hs]);
    i += hs + bl;
  }
  assert.equal(i, bytes.length, "the packet walk must end exactly at the end of the block");
  return out;
}

test("PGP: the version 6 key address is not in the sitemap and not served through WKD", async () => {
  const sm = await (await get("/sitemap.xml")).text();
  assert.equal(sm.includes("pgp-key"), false);
  const hash = zbase32(createHash("sha1").update("erik").digest());
  const wkd = Buffer.from(await (await get("/.well-known/openpgpkey/hu/" + hash)).arrayBuffer());
  const v6 = dearmor(await (await get("/pgp-key-v6.asc")).text());
  assert.notDeepEqual(wkd, v6, "WKD serves the version 4 key");
  assert.deepEqual(publicKeyPackets(wkd), [4]);
});

// Mobile read 2026-10-30, K6: the validator field is a web address typed on a phone.
test("K6: #vurl asks for the URL keyboard and turns off capitalisation, spellcheck and autofill, and stays type=text", async () => {
  const page = await (await get("/llms-txt-validator", { headers: { Accept: "text/html" } })).text();
  const tag = /<input[^>]*id="vurl"[^>]*>/.exec(page);
  assert.ok(tag, "the field exists");
  for (const a of ['type="text"', 'inputmode="url"', 'autocapitalize="off"', 'spellcheck="false"', 'autocomplete="off"']) {
    assert.ok(tag[0].includes(a), a + " in " + tag[0]);
  }
  assert.ok(/id="vurl" name="url"[^>]*value="/.test(tag[0]), "the echo rule of the redirect tests still reads value= after name=");
});

// Mobile read 2026-10-30, K10: /contact shows four cards, one mailto draft each (Tek-758, Tek-761).
test("K10: /contact lists the four cards, in this order, in the HTML and in the Markdown twin", async () => {
  const names = ["Website or API audit", "Implementation", "Ongoing advisory", "Agent operations and MCP server design"];
  const html = await (await get("/contact", { headers: { Accept: "text/html" } })).text();
  const hi = names.map((n) => html.indexOf("<h2>" + n + "</h2>"));
  assert.ok(hi.every((i) => i > 0) && hi.every((i, k) => k === 0 || i > hi[k - 1]), "the cards are rendered in order: " + hi.join(","));
  assert.equal((html.match(/class="btn" href="mailto:info@turva[.]dev[?]subject=/g) || []).length, 4, "one mailto draft per card");
  assert.ok(!html.includes("External domain check"), "no withdrawn domain check card");
  assert.ok(!html.includes("Shopify check"), "no Shopify card");
  const md = await (await get("/contact", { headers: { Accept: "text/markdown" } })).text();
  const mi = names.map((n) => md.indexOf("## " + n + "\n"));
  assert.ok(mi.every((i) => i > 0) && mi.every((i, k) => k === 0 || i > mi[k - 1]), "the sections are in the twin, in order: " + mi.join(","));
  assert.ok(!md.includes("External domain check"), "no withdrawn domain check section");
});

// Tek-734 point 7 (2026-10-31): the Shopify check is no longer sold; its four old addresses move permanently to the audit pages.
test("Tek-734: the retired Shopify check addresses answer 301 to the audit pages and their Markdown twins", async () => {
  const pairs = [["/shopify-agent-storefront-check", "/agent-readiness-audit"], ["/shopify-agent-storefront-check/", "/agent-readiness-audit"], ["/shopify-agent-storefront-check.md", "/agent-readiness-audit.md"], ["/samples/shopify-agent-storefront-check", "/samples/audit-report"], ["/samples/shopify-agent-storefront-check/", "/samples/audit-report"], ["/samples/shopify-agent-storefront-check.md", "/samples/audit-report.md"]];
  for (const [from, to] of pairs) {
    const r = await get(from);
    assert.equal(r.status, 301, from);
    assert.equal(r.headers.get("location"), "https://turva.dev" + to, from);
  }
  const home = await (await get("/", { headers: { Accept: "text/html" } })).text();
  assert.ok(!home.includes("shopify-agent-storefront-check"), "the home page links nothing retired");
});

// Tek-758 (2026-11-06): the External domain check is withdrawn; its old addresses move permanently to the audit pages and nothing served names it.
test("Tek-758: the withdrawn External domain check addresses answer 301 and no served text carries its slug", async () => {
  const pairs = [["/external-domain-check", "/agent-readiness-audit"], ["/external-domain-check/", "/agent-readiness-audit"], ["/external-domain-check.md", "/agent-readiness-audit.md"], ["/samples/external-domain-check", "/samples/audit-report"], ["/samples/external-domain-check/", "/samples/audit-report"], ["/samples/external-domain-check.md", "/samples/audit-report.md"]];
  for (const [from, to] of pairs) {
    const r = await get(from);
    assert.equal(r.status, 301, from);
    assert.equal(r.headers.get("location"), "https://turva.dev" + to, from);
  }
  const xml = await (await get("/sitemap.xml")).text();
  const paths = [...xml.matchAll(/<loc>https:\/\/turva\.dev(\/[^<]*)?<\/loc>/g)].map((m) => m[1] || "/");
  for (const path of paths) {
    const html = await (await get(path, { headers: { Accept: "text/html" } })).text();
    assert.ok(!html.includes("external-domain-check"), "html " + path);
    const md = await (await get(path, { headers: { Accept: "text/markdown" } })).text();
    assert.ok(!md.includes("external-domain-check"), "markdown " + path);
  }
  assert.ok(!xml.includes("external-domain-check"), "sitemap.xml");
  assert.ok(!(await (await get("/llms-full.txt")).text()).includes("external-domain-check"), "llms-full.txt");
});

// ---------------------------------------------------------------------------
// Audit round 24 (Tek-777): five surfaces whose text or lists were never compared with anything.
// Each test reads the served surface through worker.fetch and measures the claim the surface makes
// about itself, so it fails when the text and the behaviour part, not only when a route disappears.
// ---------------------------------------------------------------------------
const k24Unescape = (s: string): string =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&");

// W2-1: every URL ai.txt lists resolves, and its Disallow user-agents are the robots.txt ones.
test("K24 W2-1: every URL in ai.txt resolves and its Disallow agents equal the robots.txt Disallow agents", async () => {
  const ai = await (await get("/.well-known/ai.txt")).text();
  const urls = [...ai.matchAll(/^[A-Za-z0-9-]+: (https:\/\/\S+)$/gm)].map((m) => m[1]!);
  assert.ok(urls.length >= 15, "ai.txt must list its URLs (saw " + urls.length + ")");
  for (const u of urls) {
    const url = new URL(u);
    if (url.hostname === "mcp.turva.dev") {
      // The MCP endpoint is the other Worker (turva-mcp); this one can only check that the address is the declared one.
      assert.equal(url.pathname, "/mcp", u);
      continue;
    }
    assert.equal(url.hostname, "turva.dev", u + " must be on turva.dev or the MCP host");
    const r = await get(url.pathname + url.search);
    assert.ok(r.status !== 404 && r.status < 500, u + " must resolve to a non-404, non-5xx answer (saw " + r.status + ")");
  }
  // ai.txt groups are separated by blank lines; a group that carries "Disallow: /" names the blocked robots.
  const aiAgents: string[] = [];
  for (const group of ai.split(/\r?\n\s*\r?\n/)) {
    if (!/^Disallow: \/\s*$/m.test(group)) continue;
    for (const m of group.matchAll(/^User-agent: (\S+)$/gm)) aiAgents.push(m[1]!);
  }
  // robots.txt: a group is a run of User-agent lines followed by its rules.
  const robots = await (await get("/robots.txt")).text();
  const robotsAgents: string[] = [];
  let current: string[] = [];
  let seenRule = false;
  for (const line of robots.split(/\r?\n/)) {
    const ua = line.match(/^User-agent: (\S+)$/i);
    if (ua) {
      if (seenRule) { current = []; seenRule = false; }
      current.push(ua[1]!);
    } else if (/^Disallow: \/\s*$/i.test(line)) {
      robotsAgents.push(...current);
      seenRule = true;
    } else if (/^(Allow|Disallow):/i.test(line)) {
      seenRule = true;
    }
  }
  assert.ok(aiAgents.length > 0, "ai.txt must block at least one robot");
  assert.deepEqual(aiAgents.slice().sort(), robotsAgents.slice().sort(),
    "ai.txt and robots.txt must block the same user-agents");
});

// W2-2: the RSS feed is the blog list, post by post.
test("K24 W2-2: /blog/feed.xml carries the blog posts in the served /blog order, with their titles, links and dates", async () => {
  const blog = await (await get("/blog", { headers: { Accept: "text/markdown" } })).text();
  const posts = [...blog.matchAll(/^- \[(.+?)\]\((\/blog\/[^)\s]+)\)\.? (\d{4}-\d{2}-\d{2})\./gm)]
    .map((m) => ({ title: m[1]!, link: "https://turva.dev" + m[2], date: m[3]! }));
  assert.ok(posts.length >= 40, "the blog list must be readable (saw " + posts.length + " posts)");
  const feed = await (await get("/blog/feed.xml")).text();
  const items = [...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const body = m[1]!;
    const pick = (tag: string) => k24Unescape((body.match(new RegExp("<" + tag + ">([\\s\\S]*?)</" + tag + ">")) || [])[1] || "");
    return { title: pick("title"), link: pick("link"), pubDate: pick("pubDate") };
  });
  assert.equal(items.length, posts.length, "the feed must carry every post the blog page lists");
  posts.forEach((p, i) => {
    assert.equal(items[i]!.link, p.link, "item " + i + " link");
    assert.equal(items[i]!.title, k24Unescape(p.title), "item " + i + " title");
    assert.equal(items[i]!.pubDate, new Date(p.date + "T00:00:00Z").toUTCString(), "item " + i + " pubDate");
  });
  const newest = posts.map((p) => p.date).sort().pop()!;
  const built = (feed.match(/<lastBuildDate>([^<]*)<\/lastBuildDate>/) || [])[1];
  assert.equal(built, new Date(newest + "T00:00:00Z").toUTCString(), "lastBuildDate must be the newest post date");
});

// W2-3: the "Endpoint responses" section of /auth.md is a set of statements about status codes; measure each one.
test("K24 W2-3: each status statement in the auth.md Endpoint responses section holds against the Worker", async () => {
  const auth = await (await get("/auth.md", { headers: { Accept: "text/markdown" } })).text();
  const section = (auth.match(/^## Endpoint responses\r?\n([\s\S]*?)(?=^## )/m) || [])[1] || "";
  assert.ok(section.length > 100, "auth.md must carry an Endpoint responses section");
  const flat = section.replace(/\s+/g, " ");
  const read = (re: RegExp, what: string): RegExpMatchArray => {
    const m = flat.match(re);
    assert.ok(m, "the section no longer states: " + what);
    return m!;
  };
  const meta = await json(await get("/.well-known/oauth-authorization-server"));
  const agentPaths = [meta.agent_auth.register_uri, meta.agent_auth.claim_uri, meta.agent_auth.revocation_uri]
    .map((u: string) => new URL(u).pathname);
  assert.equal(agentPaths.length, 3);

  // "GET and POST to the registration, claim and revocation endpoints answer 200 with application/json"
  const okStated = read(/GET and POST to the registration, claim and revocation endpoints answer (\d{3}) with (application\/json)/, "GET and POST answer 200 JSON");
  for (const p of agentPaths) for (const method of ["GET", "POST"]) {
    const r = await get(p, { method, headers: method === "POST" ? { "content-type": "application/json" } : {} });
    assert.equal(r.status, Number(okStated[1]), method + " " + p);
    assert.match(r.headers.get("content-type") || "", new RegExp(okStated[2]!.replace("/", "\\/")), method + " " + p);
  }
  // "HEAD answers as GET does, without a body."
  read(/HEAD answers as GET does, without a body/, "HEAD answers as GET");
  for (const p of agentPaths) {
    const r = await get(p, { method: "HEAD" });
    assert.equal(r.status, Number(okStated[1]), "HEAD " + p);
    assert.equal((await r.text()).length, 0, "HEAD " + p + " must have no body");
  }
  // "OPTIONS answers 204."
  const optStated = read(/OPTIONS answers (\d{3})/, "OPTIONS answers 204");
  for (const p of agentPaths) assert.equal((await get(p, { method: "OPTIONS" })).status, Number(optStated[1]), "OPTIONS " + p);
  // "Any other method answers 405 with the header Allow: GET, HEAD, POST, OPTIONS."
  const otherStated = read(/Any other method answers (\d{3}) with the header Allow: ([A-Z, ]+?)\.(?: |$)/, "any other method answers 405 with Allow");
  for (const p of agentPaths) for (const method of ["PUT", "DELETE", "PATCH"]) {
    const r = await get(p, { method });
    assert.equal(r.status, Number(otherStated[1]), method + " " + p);
    assert.equal(r.headers.get("allow"), otherStated[2], method + " " + p + " Allow header");
  }
  // "https://turva.dev/oauth/authorize and https://turva.dev/oauth/token answer 400, never 401."
  const oauthStated = read(/(https:\/\/turva\.dev\/oauth\/\w+) and (https:\/\/turva\.dev\/oauth\/\w+) answer (\d{3}), never (\d{3})/, "the oauth endpoints answer 400, never 401");
  for (const u of [oauthStated[1]!, oauthStated[2]!]) {
    const r = await get(new URL(u).pathname);
    assert.equal(r.status, Number(oauthStated[3]), u);
    assert.notEqual(r.status, Number(oauthStated[4]), u + " must never answer " + oauthStated[4]);
  }
});

// W3-8: the Offer descriptions in the /services JSON-LD are the third copy of the terms; the twin is the second.
test("K24 W3-8: the terms in the /services JSON-LD Offer descriptions are all in the /services twin", async () => {
  const html = await (await get("/services")).text();
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
  const graphScript = scripts.find((s) => s.includes('"@graph"'));
  assert.ok(graphScript, "/services must carry its Service JSON-LD graph");
  const descriptions: string[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (k === "description" && typeof v === "string") descriptions.push(v);
        else walk(v);
      }
    }
  };
  walk(JSON.parse(graphScript!));
  const ld = descriptions.join(" ");
  const twin = (await (await get("/services", { headers: { Accept: "text/markdown" } })).text()).replace(/\s+/g, " ").toLowerCase();
  assert.ok(descriptions.length >= 4, "the JSON-LD must carry the offer descriptions (saw " + descriptions.length + ")");

  // Every duration, review count and price the JSON-LD states, extracted rather than listed.
  const generic = new Set<string>([
    ...(ld.match(/\b(?:\d+|one|two|three|four|five)\s+(?:calendar |business )?(?:days?|weeks?|months?|reviews?)\b/gi) || []),
    ...(ld.match(/€[\d,]+/g) || []),
  ].map((t) => t.toLowerCase()));
  assert.ok(generic.size >= 8, "the term extraction must find the offer terms (saw " + generic.size + ")");
  for (const term of generic) assert.ok(twin.includes(term), "JSON-LD term \"" + term + "\" is missing from the /services twin");

  // The named terms, each pair: what the JSON-LD says, and the twin's wording of it.
  const named: [string, RegExp, RegExp][] = [
    ["delivery time", /delivered within two weeks of the agreed written kickoff/i, /delivered within two weeks of the agreed written kickoff/i],
    ["question window", /submitted within 14 calendar days of the report/i, /within 14 calendar days of the report/i],
    ["answer time", /answered within five business days/i, /within five business days/i],
    ["re-scan", /one re-scan within 30 days of the report, or within 30 days of the delivered corrections/i, /re-scan within 30 days of the report, or within 30 days of the delivered corrections/i],
    ["reviews", /within one business day up to four reviews a month/i, /within one business day, up to four reviews per service month/i],
    ["monthly summary", /monthly written summary within five business days after the month ends/i, /five business days after the month ends/i],
    ["quarterly summary", /quarterly summary of measured changes within five business days after every third service month/i, /quarterly summary follows within five business days after every third one/i],
    ["minimum term", /minimum three months/i, /minimum three months/i],
    ["first-month exit", /only the first month is charged/i, /the second and third months are not charged/i],
    ["month to month", /runs month to month/i, /runs month to month/i],
  ];
  for (const [name, inLd, inTwin] of named) {
    assert.match(ld, inLd, name + ": the JSON-LD no longer states this term");
    assert.match(twin, inTwin, name + ": the twin no longer states what the JSON-LD says");
  }
});

// W4-12: a #fragment link must point at an id that exists on the page it names.
test("K24 W4-12: every same-page or site-internal #anchor link on every sitemap page points at an id that exists", async () => {
  const xml = await (await get("/sitemap.xml")).text();
  const paths = [...xml.matchAll(/<loc>https:\/\/turva\.dev([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
  assert.ok(paths.length > 10, "the sitemap must list the pages (saw " + paths.length + ")");
  const idCache = new Map<string, Set<string>>();
  const idsOf = async (path: string): Promise<Set<string> | null> => {
    if (idCache.has(path)) return idCache.get(path) || null;
    let r = await get(path, { headers: { Accept: "text/html" } });
    if (r.status >= 300 && r.status < 400 && r.headers.get("location")) {
      const loc = new URL(r.headers.get("location")!, "https://turva.dev");
      if (loc.hostname === "turva.dev") r = await get(loc.pathname + loc.search, { headers: { Accept: "text/html" } });
    }
    if (r.status !== 200) { idCache.set(path, new Set()); return null; }
    const body = await r.text();
    const ids = new Set<string>([...body.matchAll(/\sid="([^"]+)"/g)].map((m) => k24Unescape(m[1]!)));
    idCache.set(path, ids);
    return ids;
  };
  let checked = 0;
  const broken: string[] = [];
  for (const page of paths) {
    const body = await (await get(page, { headers: { Accept: "text/html" } })).text();
    for (const m of body.matchAll(/<a\s[^>]*?href="([^"]*#[^"]+)"/g)) {
      const href = k24Unescape(m[1]!);
      let target: string, fragment: string;
      if (href.startsWith("#")) { target = page; fragment = href.slice(1); }
      else {
        const u = new URL(href, "https://turva.dev" + page);
        if (u.hostname !== "turva.dev") continue;
        target = u.pathname; fragment = u.hash.slice(1);
      }
      fragment = decodeURIComponent(fragment);
      checked++;
      const ids = await idsOf(target);
      if (!ids || !ids.has(fragment)) broken.push(page + " -> " + href);
    }
  }
  assert.ok(checked > 20, "the test must see the anchor links (saw " + checked + ")");
  assert.deepEqual(broken, [], "anchor links with no matching id");
});

// Tek-806 (2026-11-11): three checks the 3.244.0 release shipped without a test for.
test("/blog lists exactly four kinds, every post carries one of them, and only a Lab notes post closes without the next step (Tek-806)", async () => {
  const blog = await (await get("/blog")).text();
  const buttons = [...blog.matchAll(/<button type="button" class="bkind" data-kind="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(buttons, ["", "Research", "Protocol notes", "Build notes", "Lab notes"], "the filter row is All plus the four kinds");
  const kinds = buttons.slice(1);
  const posts = [...blog.matchAll(/<li class="post" data-kind="([^"]*)" data-search="[^"]*"><span class="pt"><a href="(\/blog\/[a-z0-9-]+)"/g)].map((m) => ({ kind: m[1], path: m[2] }));
  assert.equal(posts.length, (blog.match(/<li class="post"/g) || []).length, "every card was read");
  assert.ok(posts.length >= 49, "the index lists the posts: " + posts.length);
  for (const post of posts) assert.ok(kinds.includes(post.kind), "the post's kind is one of the four: " + post.path + " has " + JSON.stringify(post.kind));
  for (const kind of kinds) assert.ok(posts.some((post) => post.kind === kind), "no kind is empty: " + kind);
  for (const post of posts) {
    const html = await (await get(post.path)).text();
    const hasNext = html.includes('<div class="pagefoot">') || html.includes('class="next"') || html.includes('<main id="main" class="has-next">');
    if (post.kind === "Lab notes") assert.ok(!hasNext, "a Lab notes post has no next step: " + post.path);
    else assert.match(html, /<main id="main" class="has-next">[\s\S]*<\/main>\n<div class="pagefoot"><aside class="next"><p>/, "the next step follows the post's main: " + post.path);
  }
});

test("/services: each of the five contact links carries the href of the matching /contact button (Tek-806)", async () => {
  const drafts = (html: string): Record<string, string[]> => {
    const out: Record<string, string[]> = {};
    for (const m of html.matchAll(/<a(?: class="btn")? href="(mailto:info@turva\.dev\?subject=[^"]*)">(Ask about [^<]*)<\/a>/g)) (out[m[2]] ||= []).push(m[1]);
    return out;
  };
  const contact = drafts(await (await get("/contact")).text());
  const services = drafts(await (await get("/services")).text());
  assert.deepEqual(Object.keys(contact).sort(), ["Ask about agent operations or MCP server design", "Ask about an audit", "Ask about implementation", "Ask about ongoing advisory"], "/contact has its four buttons");
  for (const hrefs of Object.values(contact)) assert.equal(hrefs.length, 1, "one button per label on /contact");
  assert.deepEqual(Object.keys(services).sort(), Object.keys(contact).sort(), "/services uses the labels of /contact");
  assert.equal(Object.values(services).flat().length, 5, "five contact links, one per service section");
  assert.equal(services["Ask about agent operations or MCP server design"].length, 2, "agent operations and MCP server design share one draft");
  for (const [label, hrefs] of Object.entries(services)) for (const href of hrefs) assert.equal(href, contact[label][0], "same draft as /contact: " + label);
});
