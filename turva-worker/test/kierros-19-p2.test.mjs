import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import worker from "../src/worker.js";

// Regression tests for audit round 19, patch 2 (docs/auditit/kierros-19/jatko-briiffi.md).
// Each test names the item id from that brief so a failure maps back to one row of it.
// Every fix test below was checked against the pre-patch-2 worker.js (the v3.164.0 release,
// scratchpad/k19b/v164/worker.js) and fails there; the mutation run that proves this is
// recorded in the session report, not in this file.

const env = {}; // no RATE_LIMITER binding: exercises the documented fail-open path

const get = (path, opts = {}) =>
  worker.fetch(new Request("https://turva.dev" + path, { method: opts.method || "GET", headers: opts.headers || {} }), env);

const workerSrc = readFileSync(new URL("../src/worker.js", import.meta.url), "utf8");

// Ground truth for "every page": parsed from the source the same way the site itself builds
// its sitemap and its IndexNow list, so this list can never drift from what CANONICAL_PATHS says.
function parseCanonicalPaths(src) {
  const m = src.match(/var CANONICAL_PATHS = new Set\(\[([\s\S]*?)\]\);/);
  if (!m) throw new Error("CANONICAL_PATHS not found in worker.js");
  return [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
}

function parseSitemapLastmods(xml) {
  const map = {};
  for (const m of xml.matchAll(/<url><loc>(https:\/\/turva\.dev[^<]*)<\/loc><lastmod>([^<]+)<\/lastmod>/g)) {
    const path = m[1].replace("https://turva.dev", "") || "/";
    map[path] = m[2];
  }
  return map;
}

// Extracts one top-level function declaration's full source text by brace matching, so a
// function's real, current implementation can be tested directly even though it is not
// exported. Returns null when the function does not exist in this build (the pre-fix build,
// for a function patch 2 adds), which the caller turns into a failing assertion.
function extractFunction(src, name) {
  const marker = "function " + name + "(";
  const start = src.indexOf(marker);
  if (start === -1) return null;
  const braceStart = src.indexOf("{", start);
  let depth = 0, i = braceStart;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(start, i);
}

// One fetch per canonical page, cached for reuse across the sweeps below (K1-P6, K4-P4), so a
// ~73 page site is rendered once per test run and not once per test.
let _pagesCache = null;
async function allPagesHtml() {
  if (_pagesCache) return _pagesCache;
  const paths = parseCanonicalPaths(workerSrc);
  const out = [];
  for (const p of paths) {
    const res = await get(p);
    out.push({ path: p, status: res.status, html: await res.text() });
  }
  _pagesCache = out;
  return out;
}

// ---- P1: a page or its markdown twin asked for in another letter case redirects to lower case ----

test("P1: another letter case of a served page or its .md twin answers 301 to the lower-case path, a query string survives", async () => {
  const cases = [
    ["/Services", "https://turva.dev/services"],
    ["/SERVICES.md", "https://turva.dev/services.md"],
    ["/Guides/Llms-Txt", "https://turva.dev/guides/llms-txt"],
    ["/Tools/", "https://turva.dev/tools"]
  ];
  for (const [path, location] of cases) {
    const res = await get(path);
    assert.equal(res.status, 301, path);
    assert.equal(res.headers.get("location"), location, path);
    assert.ok(res.headers.has("RateLimit-Policy"), path + " must carry RateLimit-Policy");
    assert.ok(res.headers.has("Referrer-Policy"), path + " must carry Referrer-Policy");
  }
  const withQuery = await get("/Services?ref=x&y=1");
  assert.equal(withQuery.headers.get("location"), "https://turva.dev/services?ref=x&y=1", "the query string must survive the redirect");
});

// Passes on both builds, safety net: an outright-unknown path was always a plain 404, and a
// brief's own /brief/ prefix check is case-sensitive on both builds too, for different reasons
// (v3.164.0 has no case-redirect at all; this build's case-redirect explicitly excludes /brief/).
test("P1: an unknown path in another case stays a plain 404, a brief keeps its exact case-sensitive address", async () => {
  const unknown = await get("/Nope-Upper");
  assert.equal(unknown.status, 404);

  const id = "testbrief-p1";
  const rec = { md: "Hello.", json: { a: 1 }, kieli: "en", otsikko: "t" };
  const briefEnv = { BRIEFIT: { get: async (k) => (k === id ? rec : null) } };
  const wrongCase = await worker.fetch(new Request("https://turva.dev/Brief/" + id), briefEnv);
  assert.equal(wrongCase.status, 404, "a brief is not case-redirected, even when the lower-case id would resolve");
});

// ---- P2: /markdown-parity-check's CORS and its 429 form ----

test("P2: a JSON parity POST is an agent-api resource (ACAO *, CORP cross-origin), the preflight names POST, a form POST under load gets the default 429", async () => {
  const limiter = { async limit() { return { success: true }; } };
  const jsonRes = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://turva.dev/tools" })
  }), { PARITY_LIMITER: limiter });
  assert.equal(jsonRes.status, 200);
  assert.equal(jsonRes.headers.get("access-control-allow-origin"), "*");
  assert.equal(jsonRes.headers.get("cross-origin-resource-policy"), "cross-origin");

  const opt = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", { method: "OPTIONS" }), env);
  assert.equal(opt.status, 204);
  assert.equal(opt.headers.get("access-control-allow-origin"), "*");
  assert.match(opt.headers.get("access-control-allow-methods"), /POST/);
  assert.match(opt.headers.get("access-control-allow-headers"), /Content-Type/i);

  // The site-wide limiter (RATE_LIMITER), not the parity-specific one: a JSON POST under site
  // load gets the agent form of the 429, a form-encoded POST gets the page form.
  const limitedEnv = { RATE_LIMITER: { limit: async () => ({ success: false }) } };
  const jsonLimited = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  }), limitedEnv);
  assert.equal(jsonLimited.status, 429);
  assert.equal(jsonLimited.headers.get("access-control-allow-origin"), "*");
  assert.equal(jsonLimited.headers.get("cross-origin-resource-policy"), "cross-origin");
  assert.equal(jsonLimited.headers.get("cache-control"), "no-store");

  const formLimited = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "url=https%3A%2F%2Fturva.dev%2Ftools"
  }), limitedEnv);
  assert.equal(formLimited.status, 429);
  assert.equal(formLimited.headers.get("access-control-allow-origin"), null, "a form POST's 429 must not carry the agent CORS header");
  assert.equal(formLimited.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.equal(formLimited.headers.get("cache-control"), "no-store");
});

// ---- P3, K7-P5: isValidPublicHost refuses arpa/onion, normalizeHostInput accepts a trailing dot ----

test("P3, K7-P5: the validator refuses arpa and onion hosts without fetching, and reads a trailing dot as the same host", async () => {
  const realFetch = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url) => { seen.push(String(url)); throw new Error("must not be called for a refused host"); };
  try {
    for (const bad of ["router.home.arpa", "1.0.0.127.in-addr.arpa", "somesite.onion"]) {
      const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent(bad), { headers: { accept: "application/json" } }), {});
      assert.equal(res.status, 400, bad);
      const body = JSON.parse(await res.text());
      assert.match(body.error, /does not look like a public domain/, bad);
    }
    assert.deepEqual(seen, [], "a refused host must never reach fetch");
  } finally {
    globalThis.fetch = realFetch;
  }

  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u === "https://example.com/llms.txt") {
      return new Response("# Example\n\n> A summary.\n", { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    if (u === "https://example.com/") return new Response("", { status: 404 });
    throw new Error("unexpected fetch to " + u);
  };
  try {
    const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent("example.com."), { headers: { accept: "application/json" } }), {});
    assert.equal(res.status, 200);
    const body = JSON.parse(await res.text());
    assert.equal(body.target, "https://example.com/llms.txt", "a trailing dot must be read as example.com, not refused or fetched with the dot");
  } finally {
    globalThis.fetch = realFetch;
  }

  const accepted = await get("/llms-txt-validator?url=turva.dev");
  assert.equal(accepted.status, 200);
  const goodHost = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.org", { headers: { accept: "application/json" } }), {});
  assert.notEqual(goodHost.status, 400, "an ordinary public host must still be accepted (isValidPublicHost is not over-broadened)");
});

// ---- P1-P1: a weak ETag on every cacheable text 200, 304 on a matching If-None-Match ----

function sha256First16Hex(bytes) {
  return createHash("sha256").update(Buffer.from(bytes)).digest("hex").slice(0, 32);
}

test("P1-P1: GET /services carries a weak ETag of the body's own SHA-256, and answers 304 to a matching If-None-Match", async () => {
  const res = await get("/services");
  assert.equal(res.status, 200);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const etag = res.headers.get("etag");
  assert.match(etag, /^W\/"[0-9a-f]{32}"$/, "etag must be the weak form W/\"<32 hex>\"");
  const hex = etag.slice(3, -1);
  assert.equal(hex, sha256First16Hex(bytes), "the etag must be the first 16 bytes of SHA-256 of the exact body");

  const weakMatch = await get("/services", { headers: { "if-none-match": etag } });
  assert.equal(weakMatch.status, 304);
  assert.equal((await weakMatch.arrayBuffer()).byteLength, 0, "a 304 must carry no body");
  assert.equal(weakMatch.headers.get("etag"), etag);
  assert.equal(weakMatch.headers.get("cache-control"), res.headers.get("cache-control"));

  const strongForm = '"' + hex + '"';
  const strongMatch = await get("/services", { headers: { "if-none-match": strongForm } });
  assert.equal(strongMatch.status, 304, "the strong form of the same tag (no W/) must also match");

  const starMatch = await get("/services", { headers: { "if-none-match": "*" } });
  assert.equal(starMatch.status, 304, "\"*\" must match any current representation");

  const otherTag = await get("/services", { headers: { "if-none-match": '"0000000000000000000000000000000"' } });
  assert.equal(otherTag.status, 200, "a different tag must not match");

  const headMatch = await get("/services", { method: "HEAD", headers: { "if-none-match": etag } });
  assert.equal(headMatch.status, 304, "HEAD with a matching tag must also answer 304");

  const md = await get("/services.md");
  assert.equal(md.status, 200);
  assert.notEqual(md.headers.get("etag"), etag, "the HTML and the markdown of the same path must carry different tags");

  const parityPost = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://turva.dev/tools" })
  }), { PARITY_LIMITER: { async limit() { return { success: true }; } } });
  assert.equal(parityPost.headers.has("etag"), false, "a no-store parity answer must carry no etag");

  const validatorRun = await get("/llms-txt-validator?url=turva.dev");
  assert.equal(validatorRun.headers.get("cache-control"), "no-store");
  assert.equal(validatorRun.headers.has("etag"), false, "a no-store validator run must carry no etag");

  const notFound = await get("/this-path-does-not-exist-19p2");
  assert.equal(notFound.status, 404);
  assert.equal(notFound.headers.has("etag"), false, "a 404 must carry no etag");
});

// ---- K1-P5: sitemapLastmodOf() shared by the sitemap and the weekly IndexNow run ----

test("K1-P5: scheduled() submits only the canonical URLs whose sitemap lastmod is within 8 days of scheduledTime", async () => {
  const sitemapXml = await (await get("/sitemap.xml")).text();
  const lastmodByPath = parseSitemapLastmods(sitemapXml);
  const canonicalPaths = parseCanonicalPaths(workerSrc);
  for (const p of canonicalPaths) assert.ok(lastmodByPath[p], "every canonical path must appear in the sitemap: " + p);

  const newest = canonicalPaths.map((p) => lastmodByPath[p]).sort().pop();
  const scheduledTime = Date.parse(newest + "T00:00:00.000Z") + 86400000; // one day after the newest lastmod
  const cutoff = new Date(scheduledTime - 8 * 86400000).toISOString().slice(0, 10);
  const expected = new Set(
    canonicalPaths.filter((p) => lastmodByPath[p] >= cutoff).map((p) => (p === "/" ? "https://turva.dev/" : "https://turva.dev" + p))
  );
  assert.ok(expected.size > 0 && expected.size < canonicalPaths.length, "the cutoff must be selective for this run to mean anything: " + expected.size + " of " + canonicalPaths.length);

  let captured = null;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    captured = { url: String(url), body: JSON.parse(init.body) };
    return new Response("", { status: 200 });
  };
  const waits = [];
  const ctx = { waitUntil: (p) => waits.push(p) };
  try {
    await worker.scheduled({ scheduledTime }, {}, ctx);
    await Promise.all(waits);
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.ok(captured, "scheduled must submit to IndexNow when at least one canonical page is due");
  assert.equal(captured.url, "https://api.indexnow.org/indexnow");
  assert.deepEqual(new Set(captured.body.urlList), expected);
  for (const u of captured.body.urlList) {
    const p = u.replace("https://turva.dev", "") || "/";
    assert.ok(lastmodByPath[p] >= cutoff, u + " lastmod " + lastmodByPath[p] + " is older than the cutoff " + cutoff);
  }
});

test("K1-P5: scheduled() submits nothing, and never calls fetch at all, when no canonical page falls within the cutoff", async () => {
  let called = false;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => { called = true; return new Response("", { status: 200 }); };
  const waits = [];
  const ctx = { waitUntil: (p) => waits.push(p) };
  try {
    await worker.scheduled({ scheduledTime: Date.parse("2031-01-01T00:00:00.000Z") }, {}, ctx);
    await Promise.all(waits);
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(called, false, "no fetch call must be made when nothing is due");
  assert.equal(waits.length, 0, "ctx.waitUntil must not even be called");
});

// ---- K1-P6: CSP style-src/font-src drop https:, Permissions-Policy grows by five ----

test("K1-P6: the CSP's style-src and font-src carry no https:, and Permissions-Policy adds bluetooth, hid, serial, idle-detection and browsing-topics", async () => {
  const res = await get("/");
  const csp = res.headers.get("content-security-policy");
  const directives = Object.fromEntries(csp.split("; ").map((d) => {
    const sp = d.indexOf(" ");
    return sp === -1 ? [d, ""] : [d.slice(0, sp), d.slice(sp + 1)];
  }));
  assert.equal(directives["style-src"], "'self' 'unsafe-inline' data:", csp);
  assert.equal(directives["font-src"], "'self' data:", csp);
  const pp = res.headers.get("permissions-policy");
  assert.ok(pp.endsWith("bluetooth=(), hid=(), serial=(), idle-detection=(), browsing-topics=()"), pp);
});

// Passes on both builds, safety net: today's served pages never loaded a cross-origin
// stylesheet or font either way, so this proves the CSP tightening above is safe to ship
// rather than guarding a behaviour patch 2 changed.
test("K1-P6: no HTML page loads a stylesheet or a font from another origin (safety net: the served pages never did, before or after)", async () => {
  const pages = await allPagesHtml();
  for (const { path, status, html } of pages) {
    assert.equal(status, 200, path);
    assert.ok(!/<link[^>]+rel=["']?stylesheet["']?[^>]*href=["']https?:/i.test(html), path + " links an external stylesheet");
    const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
    for (const css of styleBlocks) {
      assert.ok(!/@import\s+["']?https?:/i.test(css), path + " has an external @import");
      assert.ok(!/url\(\s*["']?https?:/i.test(css), path + " loads url(http...) inside a style block");
    }
  }
});

// ---- K2-P1: /oauth/authorize and /oauth/token are declared in OpenAPI, both answer exactly 400 ----

test("K2-P1: openapi.json declares GET and POST for /oauth/authorize and /oauth/token with a 400 response, and each answers exactly 400", async () => {
  const res = await get("/openapi.json");
  const doc = JSON.parse(await res.text());
  for (const path of ["/oauth/authorize", "/oauth/token"]) {
    assert.ok(doc.paths[path] && doc.paths[path].get, "openapi.json must declare get for " + path);
    assert.ok(doc.paths[path] && doc.paths[path].post, "openapi.json must declare post for " + path);
    assert.ok(doc.paths[path].get.responses && doc.paths[path].get.responses["400"], path + " get must document a 400 response");
    assert.ok(doc.paths[path].post.responses && doc.paths[path].post.responses["400"], path + " post must document a 400 response");
    for (const method of ["GET", "POST"]) {
      const r = await worker.fetch(new Request("https://turva.dev" + path, { method }), env);
      assert.equal(r.status, 400, method + " " + path);
    }
  }
});

// ---- K4-P4: every JSON-LD block on every page parses and carries no "</" ----

test("K4-P4: every application/ld+json block on every canonical page parses and carries no literal \"</\"", async () => {
  const pages = await allPagesHtml();
  let blockCount = 0;
  for (const { path, html } of pages) {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    for (const [, body] of blocks) {
      blockCount++;
      assert.doesNotThrow(() => JSON.parse(body), path + " JSON-LD block must parse");
      assert.ok(!body.includes("</"), path + " JSON-LD block must not carry a literal \"</\"");
    }
  }
  assert.ok(blockCount > 50, "expected JSON-LD blocks across most of the 73 pages, got " + blockCount);
  // Source assertion, identical behaviour on both builds for today's content (no page's JSON-LD
  // text contains "</" today, so nothing here actually renders differently): every builder now
  // goes through jsonLdSafe() and the old inline "<\/script" replace pattern is gone from source.
  assert.ok(!workerSrc.includes("replace(/<\\/script/gi"), "every JSON.stringify(...).replace(/<\\/script/gi, ...) call must be gone, replaced by jsonLdSafe()");
});

// ---- K4-P6: an Accept q value above 1 clamps to 1 ----

test("K4-P6: an Accept q value above 1 clamps to 1, turning a text/html vs application/json tie in html's favour", async () => {
  // Unclamped, application/json;q=2 outranks text/html's implicit q=1 and wins outright.
  // Clamped to 1, the two tie, and wantsJson's tie rule (html wins ties against json) applies,
  // so the brief route stays on "html" instead of switching to "json".
  const id = "testbrief-q";
  const rec = { md: "Hello.", json: { a: 1 }, kieli: "en", otsikko: "t" };
  const briefEnv = { BRIEFIT: { get: async (k) => (k === id ? rec : null) } };
  const res = await worker.fetch(new Request("https://turva.dev/brief/" + id, {
    headers: { accept: "text/html, application/json;q=2" }
  }), briefEnv);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/, "clamped to 1, text/html must win the tie against application/json");
});

// ---- K5-2: the ten dead CSS rules and their class usages are gone ----

test("K5-2: the ten removed classes carry no CSS rule and no class attribute anywhere in the served source", () => {
  // worker.js is the one and only source of every page's markup and CSS: nothing here is
  // computed from external state, so a source-text sweep is exactly equivalent to sweeping
  // every rendered page, and is far cheaper. The CSS-rule check requires "{" or a pseudo-class
  // ":" right after the class name, on purpose: a looser class such as [{,: ] also matches JS
  // property access like "e.html.notes," which is not a CSS rule at all.
  const classes = ["whynot", "bizline", "exgrid", "ex", "notes", "svc-tag", "contact-card", "meta-line", "gv", "cursor"];
  for (const c of classes) {
    const escaped = c.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
    assert.ok(!new RegExp("\\." + escaped + "[{:]").test(workerSrc), "a CSS rule for ." + c + " must be gone");
    assert.ok(!new RegExp('class="[^"]*\\b' + escaped + '\\b').test(workerSrc), 'class="' + c + '" must be gone from markup');
  }
});

// ---- K5-P4: the home page's .rc-flag rule sets font-size .75rem ----

test("K5-P4: the home page's .rc-flag rule sets font-size:.75rem", async () => {
  const html = await (await get("/")).text();
  const idx = html.indexOf(".rc-flag{");
  assert.notEqual(idx, -1, "the home page must carry a .rc-flag rule");
  const rule = html.slice(idx, html.indexOf("}", idx) + 1);
  assert.ok(rule.includes("font-size:.75rem"), rule);
  assert.ok(!rule.includes("font-size:.68rem"), rule);
});

// ---- K5-P5: mdOfferCards and mdToolCards escape href before writing it into the card ----

test("K5-P5: mdOfferCards and mdToolCards wrap their href in escapeHtml() before writing the card", async () => {
  const offerFn = workerSrc.slice(workerSrc.indexOf("function mdOfferCards"), workerSrc.indexOf("function mdActionCards"));
  assert.ok(offerFn.includes('href="${escapeHtml(href)}"'), "mdOfferCards must escape href");
  const toolFn = workerSrc.slice(workerSrc.indexOf("function mdToolCards"), workerSrc.indexOf("function mdTidyUrlText"));
  assert.ok(toolFn.includes('href="${escapeHtml(last[2])}"'), "mdToolCards must escape href");
  // Safety net: today's offer and tool hrefs are plain internal paths with nothing escapeHtml
  // would change, so the rendered bytes are the same on both builds.
  const services = await (await get("/services")).text();
  // Since Tek-488 round 2 the offer card is a list item and its link sits on the offer name.
  assert.match(services, /<li class="card ocard"[^>]*><span class="card-top"><span class="name"><a href="\/shopify-agent-storefront-check">/);
  const tools = await (await get("/tools")).text();
  assert.match(tools, /<a class="go" href="\/llms-txt-validator">/);
});

// ---- K6-P1: /brief/<id>/ redirects exactly like /brief/<id>. ----

test("K6-P1: /brief/<id>/ (a trailing slash) redirects exactly like /brief/<id>. (a trailing period)", async () => {
  const id = "testbrief-slash";
  const rec = { md: "Hello.", json: { a: 1 }, kieli: "en", otsikko: "t" };
  const briefEnv = { BRIEFIT: { get: async (k) => (k === id ? rec : null) } };
  const dot = await worker.fetch(new Request("https://turva.dev/brief/" + id + "."), briefEnv);
  const slash = await worker.fetch(new Request("https://turva.dev/brief/" + id + "/"), briefEnv);
  assert.equal(dot.status, 301);
  assert.equal(slash.status, 301);
  assert.equal(slash.headers.get("location"), dot.headers.get("location"));
  assert.equal(slash.headers.get("location"), "https://turva.dev/brief/" + id);
});

// ---- K6-P3: a brief's .md and .json use the default header kind (same-origin, no ACAO) ----

test("K6-P3: a brief's markdown and JSON forms carry cross-origin-resource-policy same-origin and no access-control-allow-origin", async () => {
  const id = "testbrief-corp";
  const rec = { md: "Hello **world**.", json: { a: 1 }, kieli: "en", otsikko: "t" };
  const briefEnv = { BRIEFIT: { get: async (k) => (k === id ? rec : null) } };
  const md = await worker.fetch(new Request("https://turva.dev/brief/" + id + ".md"), briefEnv);
  assert.equal(md.status, 200);
  assert.equal(md.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.equal(md.headers.get("access-control-allow-origin"), null);
  const json = await worker.fetch(new Request("https://turva.dev/brief/" + id + ".json"), briefEnv);
  assert.equal(json.status, 200);
  assert.equal(json.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.equal(json.headers.get("access-control-allow-origin"), null);
});

// ---- K6-P4: replaceExactlyOnce throws on a missing or repeated anchor ----

test("K6-P4: replaceExactlyOnce replaces a single occurrence and throws on zero or on more than one", () => {
  const fnSrc = extractFunction(workerSrc, "replaceExactlyOnce");
  assert.ok(fnSrc, "replaceExactlyOnce must exist in worker.js");
  const fn = new Function("return (" + fnSrc + ");")();
  assert.equal(fn("a-b", "-", "+"), "a+b");
  assert.throws(() => fn("ab", "-", "+"), /occurs 0 times/);
  assert.throws(() => fn("a-b-c", "-", "+"), /occurs 2 times/);

  // The live call site since Tek-488: a sample report's button row, read from its twin, replaces
  // the paragraph markdownToHtml made of it exactly once. The Shopify FAQ heading rename that
  // used it before is gone, because the page now shows the twin's own heading.
  assert.ok(workerSrc.includes("replaceExactlyOnce(withSample, `<p>${renderInline(cut.row)}</p>`"), "the sample button row must go through replaceExactlyOnce");
});

// ---- K6-P5: the two prefilled mailto links no longer hand-type &amp; ----

test("K6-P5: the two prefilled mailto links carry a plain & in the twin rows the buttons are read from (Tek-484)", () => {
  // The constants moved into the twins in v3.174.0: every button row is a links-only paragraph
  // of its page's Markdown, and escapeHtml turns the & into &amp; when the row is rendered.
  for (const [path, subject, rows] of [["/shopify-agent-storefront-check", "Shopify", 2], ["/agent-readiness-audit", "Agent-readiness", 3]]) {
    const at = workerSrc.indexOf('"' + path + '": `');
    assert.notEqual(at, -1, path);
    const twin = workerSrc.slice(at, workerSrc.indexOf("\n`,", at));
    const links = twin.match(new RegExp("\\(mailto:info@turva\\.dev\\?subject=" + subject + "[^)]*\\)", "g")) || [];
    assert.equal(links.length, rows, path + ": one prefilled link per button row");
    for (const l of links) {
      assert.ok(l.includes("&body="), l);
      assert.ok(!l.includes("&amp;"), "the twin must not hand-type &amp;: " + l);
    }
  }
});

// Passes on both builds, safety net: escapeHtml(mailto) on the new plain-& constant produces
// the exact same rendered bytes as the old hand-typed &amp; constant used unescaped, so this
// proves the rewrite did not change what the page serves, not that it serves something new.
test("K6-P5: the rendered mailto hrefs carry &amp;body= exactly as many times as there are buttons, never &amp;amp; (safety net: identical bytes on both builds)", async () => {
  const shopify = await (await get("/shopify-agent-storefront-check")).text();
  assert.equal((shopify.match(/&amp;body=/g) || []).length, 2, "two mailto hrefs on the Shopify page");
  assert.ok(!shopify.includes("&amp;amp;"), "must never double-escape");

  const audit = await (await get("/agent-readiness-audit")).text();
  assert.equal((audit.match(/&amp;body=/g) || []).length, 3, "three mailto hrefs on the audit page");
  assert.ok(!audit.includes("&amp;amp;"), "must never double-escape");
});

// ---- K8-P4: "/index" is refused by paritySelfPathAllowed like any other non-page path ----

test("K8-P4: a parity check for https://turva.dev/index is refused the same way another non-page path is", async () => {
  const limiter = { async limit() { return { success: true }; } };
  const res = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://turva.dev/index" })
  }), { PARITY_LIMITER: limiter });
  assert.equal(res.status, 403);
  const body = JSON.parse(await res.text());
  assert.match(body.summary.error, /not one of turva\.dev's published pages/);
});

// ---- K2-P3: the skills index is built once per isolate, not once per request ----

test("K2-P3: getSkillsIndex builds the skills index once per isolate and reuses it on the next request", async () => {
  const realDigest = crypto.subtle.digest.bind(crypto.subtle);
  let calls = 0;
  crypto.subtle.digest = async (...args) => { calls++; return realDigest(...args); };
  try {
    const first = await get("/.well-known/agent-skills/index.json");
    const firstBody = await first.text();
    calls = 0;
    const second = await get("/.well-known/agent-skills/index.json");
    const secondBody = await second.text();
    // Only this response's own ETag digest should run (withValidator, P1-P1): the three
    // per-skill SHA-256 digests inside buildSkillsIndex must not be recomputed.
    assert.equal(calls, 1, "the skills index must not be rebuilt on the second request, only its etag recomputed: saw " + calls + " digest call(s)");
    assert.equal(secondBody, firstBody, "safety net: a cached and a freshly built index render the same bytes either way");
  } finally {
    crypto.subtle.digest = realDigest;
  }
});

// ---- V6-P1: a bidi override in a remote parity report does not reach the HTML result's rendered findings ----

test("V6-P1: a bidi override character in a remote report's finding message, excerpt, before and after does not reach the HTML result's rendered findings", async () => {
  const RTL = String.fromCharCode(0x202e);
  const limiter = { async limit() { return { success: true }; } };
  // A real, valid report shape from a local self-check, then one finding is added that carries
  // the override character in every string field the HTML result's Findings section quotes.
  const baseRes = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://turva.dev/tools" })
  }), { PARITY_LIMITER: limiter });
  const report = JSON.parse(await baseRes.text());
  report.findings = [{
    severity: "warning",
    code: "test-bidi",
    direction: "html_only",
    message: "hidden" + RTL + "message",
    html: { line: 1, excerpt: "ex" + RTL + "cerpt" },
    before: "bef" + RTL + "ore",
    after: "aft" + RTL + "er"
  }];
  const remoteEnv = {
    PARITY_LIMITER: limiter,
    PARITY_REMOTE_FETCH: "on",
    PARITY: { fetch: async () => new Response(JSON.stringify({ status: 200, report })) }
  };
  const htmlRes = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "text/html" },
    body: "url=" + encodeURIComponent("https://example.com/page")
  }), remoteEnv);
  const html = await htmlRes.text();
  const findingsStart = html.indexOf("<h3>Findings</h3>");
  const findingsEnd = html.indexOf("<h3>Limits of this result</h3>");
  assert.ok(findingsStart !== -1 && findingsEnd > findingsStart, "the result page must carry a Findings section");
  const findingsSection = html.slice(findingsStart, findingsEnd);
  assert.ok(!findingsSection.includes(RTL), "the rendered finding text must not carry the override character");

  // The review of patch 2 found the JSON report embedded in the same page, and the plain JSON
  // answer, still carrying the raw character. Both now write it as a JSON escape: the parsed value
  // is the package's own, and no raw control character reaches the page or a saved file.
  assert.ok(!html.includes(RTL), "no raw override character anywhere on the result page, the embedded JSON report included");
  assert.ok(html.includes("hidden\\u202emessage"), "the embedded JSON report writes the override character as an escape");

  const jsonRes = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://example.com/page" })
  }), remoteEnv);
  const jsonText = await jsonRes.text();
  assert.ok(!jsonText.includes(RTL), "the plain JSON answer carries no raw override character");
  assert.equal(JSON.parse(jsonText).findings[0].message, "hidden" + RTL + "message", "the escape parses back to the package's own value");
});

// ---- The review of patch 2 (adversarial reviewers, confirmed by a second reader and measured) ----

const parityPost = (body, envExtra = {}, headers = { "content-type": "application/json" }) =>
  worker.fetch(new Request("https://turva.dev/markdown-parity-check", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body)
  }), { PARITY_LIMITER: { async limit() { return { success: true }; } }, ...envExtra });

test("review, K8-P4: the home page's markdown twin is still checkable as the Markdown URL, in both spellings", async () => {
  for (const md of ["https://turva.dev/index.md", "https://turva.dev/index.html.md"]) {
    const res = await parityPost({ url: "https://turva.dev/", markdownUrl: md });
    const r = JSON.parse(await res.text());
    assert.equal(res.status, 200, md + ": " + (r.summary && r.summary.error));
    assert.notEqual(r.summary.result, "error", md);
  }
});

test("review, P1: a parity check of a page in another letter case follows the 301 and checks the page", async () => {
  const res = await parityPost({ url: "https://turva.dev/Services" });
  const r = JSON.parse(await res.text());
  assert.equal(res.status, 200, r.summary && r.summary.error);
  assert.notEqual(r.summary.result, "error");
});

test("review, P1: /index.html.md in another letter case answers 301 like /index.md does", async () => {
  for (const [asked, target] of [["/Index.HTML.md", "https://turva.dev/index.html.md"], ["/INDEX.md", "https://turva.dev/index.md"]]) {
    const res = await get(asked);
    assert.equal(res.status, 301, asked);
    assert.equal(res.headers.get("location"), target, asked);
  }
});

test("review, P1: a markdown twin's case redirect carries the twin's agent-api headers, a page's does not", async () => {
  const twin = await get("/Guides/LLMS-TXT.md");
  assert.equal(twin.status, 301);
  assert.equal(twin.headers.get("location"), "https://turva.dev/guides/llms-txt.md");
  assert.equal(twin.headers.get("cross-origin-resource-policy"), "cross-origin");
  assert.equal(twin.headers.get("access-control-allow-origin"), "*");
  const served = await get("/guides/llms-txt.md");
  assert.equal(served.headers.get("cross-origin-resource-policy"), twin.headers.get("cross-origin-resource-policy"), "the hop and the twin agree");
  const page = await get("/Services");
  assert.equal(page.status, 301);
  assert.equal(page.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.equal(page.headers.get("access-control-allow-origin"), null);
});

test("review, K7-P5: the parity check reads one trailing dot on the host as the same host, as the validator does", async () => {
  const res = await parityPost({ url: "https://turva.dev./tools" });
  const r = JSON.parse(await res.text());
  assert.equal(res.status, 200, r.summary && r.summary.error);
  assert.notEqual(r.summary.result, "error");
});

test("review, V6-P1: a selector that carries a bidi override is echoed without it, in the field and in the error", async () => {
  const RTL = String.fromCharCode(0x202e);
  const body = new URLSearchParams({ url: "https://turva.dev/tools", selector: "nosuch" + RTL + "thing" }).toString();
  const res = await parityPost(body, {}, { "content-type": "application/x-www-form-urlencoded", accept: "text/html" });
  const html = await res.text();
  assert.ok(html.includes("nosuchthing"), "the selector is echoed");
  assert.ok(!html.includes(RTL), "no raw override character in the echoed field, the error line or the embedded report");
});
