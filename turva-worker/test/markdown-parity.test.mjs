import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";
import { run, renderJson, TOOL_VERSION } from "markdown-parity-check";

// The hosted Markdown parity check (v3.154.0), offline against the module. What these pin: the
// report is the package's own run() over the bytes the site serves, a check cannot leave turva.dev's
// published pages in phase 1, the limiter fails closed, no address secret comes back, content is
// always escaped, and every published page can be checked within the hosted limits.

const limiter = (ok = true) => ({ calls: 0, async limit() { this.calls++; return { success: ok }; } });
const envOk = () => ({ PARITY_LIMITER: limiter(true) });

function post(body, { env = envOk(), type = "application/json", accept = "application/json", ip = "203.0.113.9", headers = {} } = {}) {
  const init = { method: "POST", headers: { accept, "cf-connecting-ip": ip, ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) };
  if (type) init.headers["content-type"] = type;
  return worker.fetch(new Request("https://turva.dev/markdown-parity-check", init), env);
}
const form = (fields, opts = {}) => post(new URLSearchParams(fields).toString(), { type: "application/x-www-form-urlencoded", accept: "text/html", ...opts });
const get = (path, headers = {}) => worker.fetch(new Request("https://turva.dev" + path, { headers }), {});

async function served(path, accept) {
  const res = await get(path, { accept });
  const bytes = new Uint8Array(await res.arrayBuffer());
  return { status: res.status, contentType: res.headers.get("content-type"), body: new TextDecoder().decode(bytes), bytes: bytes.length };
}

function strip(report) {
  const { generatedAt, ...rest } = JSON.parse(typeof report === "string" ? report : renderJson(report));
  assert.match(generatedAt, /^\d{4}-\d{2}-\d{2}T/);
  return rest;
}

test("parity page: served as a card page with its form, twin and script, cacheable when no check ran", async () => {
  const res = await get("/markdown-parity-check");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
  assert.match(res.headers.get("cache-control"), /public/);
  const html = await res.text();
  assert.ok(html.includes('<link rel="canonical" href="https://turva.dev/markdown-parity-check" />'));
  assert.ok(html.includes('<form class="vform pform" id="mpc-form" method="post" action="/markdown-parity-check#result" novalidate>'));
  assert.ok(html.includes('<script src="/markdown-parity-check.js" defer></script>'));
  assert.ok(!html.includes('id="result"'), "a GET runs no check");
  for (const h of ["How to use it", "What this version checks", "What the check compares", "What a result tells you", "Limits", "Use it from an agent or CI", "What is kept"]) assert.ok(html.includes(`<h2>${h}</h2>`), h);
  const md = await get("/markdown-parity-check.md");
  assert.equal(md.status, 200);
  assert.match(await md.text(), /^# Markdown parity check\n/);
});

test("parity page: a GET with ?url= does not run a check; the API is POST only", async () => {
  const html = await (await get("/markdown-parity-check?url=https://turva.dev/tools")).text();
  assert.ok(!html.includes('id="result"'));
});

test("parity page: listed on /tools, in the sitemap, in llms.txt and its script is same-origin", async () => {
  assert.ok((await (await get("/tools")).text()).includes('href="/markdown-parity-check"'));
  assert.ok((await (await get("/tools.md")).text()).includes("[Open the parity check](/markdown-parity-check)"));
  assert.ok((await (await get("/sitemap.xml")).text()).includes("<loc>https://turva.dev/markdown-parity-check</loc>"));
  assert.ok((await (await get("/llms.txt")).text()).includes("- [Markdown parity check](https://turva.dev/markdown-parity-check.md)"));
  const js = await get("/markdown-parity-check.js");
  assert.equal(js.status, 200);
  assert.match(js.headers.get("content-type"), /text\/javascript/);
  const src = await js.text();
  assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(/.test(src), "the script writes text only");
});

test("parity check: the JSON answer is run() from the package over the bytes the site serves", async () => {
  for (const [path, strict] of [["/tools", false], ["/agent-readiness-audit", true], ["/", false]]) {
    const url = "https://turva.dev" + path;
    const res = await post({ url, strict });
    assert.equal(res.status, 200, path);
    assert.match(res.headers.get("content-type"), /application\/json/);
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(res.headers.get("access-control-allow-origin"), null, "no CORS: browsers on other sites cannot drive checks");
    const hosted = strip(await res.text());
    const h = await served(path, "text/html");
    const m = await served(path, "text/markdown");
    const input = (s, accept) => ({ meta: { kind: "url", url: url, requestedUrl: url, status: s.status, contentType: s.contentType, accept, redirects: 0, bytes: s.bytes, baseUrl: url }, body: s.body, base: url });
    const direct = strip(run(input(h, "text/html"), input(m, "text/markdown"), { strict, mode: "url", frontMatter: "keep" }));
    assert.deepEqual(hosted, direct, path);
    assert.equal(hosted.schemaVersion, 1);
    assert.equal(hosted.toolVersion, TOOL_VERSION);
    assert.equal(hosted.summary.strict, strict);
    assert.equal(hosted.summary.exitCode, hosted.summary.result === "pass" ? 0 : 1);
  }
});

test("parity check: every published page can be checked within the hosted limits", async () => {
  const sitemap = await (await get("/sitemap.xml")).text();
  const paths = [...sitemap.matchAll(/<loc>https:\/\/turva\.dev([^<]*)<\/loc>/g)].map((m) => m[1] || "/").filter((p) => p !== "/markdown-parity-check" && p !== "/llms-txt-validator" && p !== "/auth.md");
  // /auth.md is an agent document served as Markdown only, not a page with an HTML version, and the
  // two tool pages are refused on purpose (a check never starts a check).
  assert.ok(paths.length > 60, "sitemap read " + paths.length + " paths");
  const bad = [];
  for (const p of paths) {
    const res = await post({ url: "https://turva.dev" + p });
    const r = JSON.parse(await res.text());
    if (res.status !== 200 || r.summary.result === "error") bad.push(`${p}: ${res.status} ${r.summary.error || ""}`);
  }
  assert.deepEqual(bad, []);
});

test("parity check: redirects inside turva.dev are followed and counted, www and a trailing slash", async () => {
  for (const url of ["https://turva.dev/tools/", "https://www.turva.dev/tools"]) {
    const r = JSON.parse(await (await post({ url })).text());
    assert.equal(r.sources.html.redirects, 1, url);
    assert.equal(r.sources.html.url, "https://turva.dev/tools");
    assert.notEqual(r.summary.result, "error");
  }
  const md = JSON.parse(await (await post({ url: "https://turva.dev/tools", markdownUrl: "https://turva.dev/tools.md" })).text());
  assert.equal(md.sources.markdown.url, "https://turva.dev/tools.md");
  assert.notEqual(md.summary.result, "error");
});

test("parity check: front matter option and strict mode reach the report", async () => {
  const keep = JSON.parse(await (await post({ url: "https://turva.dev/tools" })).text());
  assert.equal(keep.summary.strict, false);
  const strip = JSON.parse(await (await post({ url: "https://turva.dev/tools", frontMatter: "strip", strict: true })).text());
  assert.equal(strip.summary.strict, true);
  assert.ok(strip.extraction.markdown.notes.some((n) => /nothing was stripped/.test(n)), "strip on a page without front matter says so");
});

test("parity check: phase 1 refuses every address outside turva.dev's published pages", async () => {
  const cases = [
    [{ url: "https://turva.dev/auth.md" }, 400, /must be the HTML page/],
    [{ url: "https://turva.dev/tools", markdownUrl: "https://turva.dev/auth.md" }, 403, /not one of turva\.dev's published pages/],
    [{ url: "https://example.com/page" }, 403, /checks turva\.dev pages only/],
    [{ url: "https://mcp.turva.dev/mcp" }, 403, /checks turva\.dev pages only/],
    [{ url: "https://turva.dev/markdown-parity-check" }, 403, /not one of turva\.dev's published pages/],
    [{ url: "https://turva.dev/markdown-parity-check.md" }, 400, /must be the HTML page/],
    [{ url: "https://turva.dev/tools.md" }, 400, /must be the HTML page/],
    [{ url: "https://turva.dev/index.md" }, 400, /must be the HTML page/],
    [{ url: "https://turva.dev/tools", markdownUrl: "https://turva.dev/markdown-parity-check.md" }, 403, /not one of turva\.dev's published pages/],
    [{ url: "https://turva.dev/llms-txt-validator?url=example.com" }, 403, /not one of turva\.dev's published pages/],
    [{ url: "https://turva.dev/brief/abcdef" }, 403, /not one of turva\.dev's published pages/],
    [{ url: "https://turva.dev/.well-known/agent.json" }, 403, /not one of/],
    [{ url: "http://turva.dev/tools" }, 400, /must start with https/],
    [{ url: "https://127.0.0.1/" }, 422, /public domain/],
    [{ url: "https://[::1]/" }, 422, /public domain/],
    [{ url: "https://169.254.169.254/latest/meta-data/" }, 422, /public domain/],
    [{ url: "https://localhost/" }, 422, /public domain/],
    [{ url: "https://printer.local/" }, 422, /public domain/],
    [{ url: "https://turva.dev:8443/tools" }, 400, /default https port/],
    [{ url: "https://user:pass@turva.dev/tools" }, 400, /user name or a password/],
    [{ url: "turva.dev/tools" }, 400, /not a full address/],
    [{ url: "https://turva.dev/tools", markdownUrl: "https://example.com/tools.md" }, 422, /same site/],
  ];
  for (const [body, status, re] of cases) {
    const res = await post(body);
    const r = JSON.parse(await res.text());
    assert.equal(res.status, status, JSON.stringify(body));
    assert.equal(r.summary.result, "error");
    assert.equal(r.summary.exitCode, 2);
    assert.match(r.summary.error, re, JSON.stringify(body));
    assert.deepEqual(r.findings, []);
  }
});

test("parity check: malformed requests get 400, 413 and 415 with an error report", async () => {
  const r400 = async (body, re) => { const res = await post(body); assert.equal(res.status, 400); assert.match(JSON.parse(await res.text()).summary.error, re); };
  await r400("{not json", /not valid JSON/);
  await r400("[1,2]", /JSON object/);
  await r400({}, /Enter the page URL/);
  await r400({ url: 5 }, /must be a string/);
  await r400({ url: "https://turva.dev/tools", strict: "yes" }, /strict must be true or false/);
  await r400({ url: "https://turva.dev/tools", frontMatter: "drop" }, /frontMatter must be keep or strip/);
  await r400({ url: "https://turva.dev/" + "a".repeat(2100) }, /longer than 2048/);
  const big = await post(JSON.stringify({ url: "https://turva.dev/tools", pad: "x".repeat(9000) }));
  assert.equal(big.status, 413);
  const plain = await post("url=https://turva.dev/tools", { type: "text/plain" });
  assert.equal(plain.status, 415);
});

test("parity check: the limiter fails closed, answers 429 and bounds concurrent checks", async () => {
  const none = await post({ url: "https://turva.dev/tools" }, { env: {} });
  assert.equal(none.status, 503);
  assert.equal(none.headers.get("retry-after"), "60");
  const broken = await post({ url: "https://turva.dev/tools" }, { env: { PARITY_LIMITER: { async limit() { throw new Error("down"); } } } });
  assert.equal(broken.status, 503);
  const denied = limiter(false);
  const limited = await post({ url: "https://turva.dev/tools" }, { env: { PARITY_LIMITER: denied } });
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "60");
  assert.equal(denied.calls, 1);
  const statuses = (await Promise.all(Array.from({ length: 6 }, () => post({ url: "https://turva.dev/samples/audit-report" })))).map((r) => r.status);
  assert.ok(statuses.includes(503), "a burst over four concurrent checks gets 503: " + statuses);
  assert.ok(statuses.every((s) => s === 200 || s === 503), String(statuses));
  assert.equal((await post({ url: "https://turva.dev/tools" })).status, 200, "the counter is released after the burst");
  const key = limiter(true);
  await post({ url: "https://turva.dev/tools" }, { env: { PARITY_LIMITER: { limit: async (o) => { key.seen = o.key; return { success: true }; } } } });
  assert.equal(key.seen, "parity:203.0.113.9");
});

test("parity check: no query secret comes back, in JSON, in the page or in the form", async () => {
  const url = "https://turva.dev/tools?token=SECRET-1234&x=y#frag-SECRET";
  const json = await (await post({ url, markdownUrl: "https://turva.dev/tools.md?key=SECRET-5678" })).text();
  assert.ok(!json.includes("SECRET"), "JSON report");
  assert.ok(json.includes("token=***"));
  const page = await (await form({ url, markdown_url: "https://turva.dev/tools.md?key=SECRET-5678" })).text();
  assert.ok(!page.includes("SECRET"), "HTML page");
  const refused = await (await form({ url: "https://example.com/x?api_key=SECRET-9" })).text();
  assert.ok(!refused.includes("SECRET"), "refusal page");
});

test("parity check: content and input are escaped in the page, never markup", async () => {
  const sel = '<script>alert(1)</script>';
  const res = await form({ url: "https://turva.dev/tools", selector: sel });
  assert.equal(res.status, 422);
  const html = await res.text();
  assert.ok(!html.includes(sel));
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(html.includes('id="mpc-selector-err"'), "the error sits under the selector field");
  assert.ok(html.includes('aria-invalid="true" aria-describedby="mpc-selector-hint mpc-selector-err"'));
  const attr = await (await form({ url: 'https://example.com/"><img src=x onerror=alert(1)>' })).text();
  assert.ok(!attr.includes("<img src=x"), "the echoed address cannot open a tag");
  const js = await (await form({ url: "javascript:alert(1)" })).text();
  assert.ok(!/href="javascript:/i.test(js));
});

test("parity check: the form posts back a result page with the JSON report, no-store and noindex", async () => {
  const res = await form({ url: "https://turva.dev/tools", strict: "on", front_matter: "keep" });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.equal(res.headers.get("x-robots-tag"), "noindex");
  const html = await res.text();
  assert.match(html, /<h2 id="result-h">Result: (Pass|Fail)<\/h2>/);
  assert.ok(html.includes('<pre id="mpc-json" tabindex="0">'));
  assert.ok(html.includes('id="mpc-strict" name="strict" value="on" checked'));
  const pre = html.match(/<pre id="mpc-json" tabindex="0">([\s\S]*?)<\/pre>/)[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  const api = strip(await (await post({ url: "https://turva.dev/tools", strict: true })).text());
  assert.deepEqual(strip(pre), api, "the page shows the same report as the API");
});

test("parity check: phase 2 forwards other hosts only when switched on and bound", async () => {
  const report = JSON.parse(await (await post({ url: "https://turva.dev/tools" })).text());
  const calls = [];
  const env = { PARITY_LIMITER: limiter(true), PARITY_REMOTE_FETCH: "on", PARITY: { fetch: async (u, init) => { calls.push([u, JSON.parse(init.body)]); return new Response(JSON.stringify({ status: 200, report })); } } };
  const res = await post({ url: "https://example.com/page", strict: true }, { env });
  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0][1], { url: "https://example.com/page", strict: true, frontMatter: "keep" });
  const off = await post({ url: "https://example.com/page" }, { env: { ...env, PARITY_REMOTE_FETCH: "off" } });
  assert.equal(off.status, 403);
  const down = await post({ url: "https://example.com/page" }, { env: { ...env, PARITY: { fetch: async () => { throw new Error("1102"); } } } });
  assert.equal(down.status, 503);
  const turva = await post({ url: "https://turva.dev/tools" }, { env });
  assert.equal(turva.status, 200);
  assert.equal(calls.length, 1, "turva.dev pages never go to the remote transport");
});

test("parity route: methods and preflight name POST, and a POST that asks for Markdown still runs the check", async () => {
  const opt = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", { method: "OPTIONS" }), {});
  assert.equal(opt.status, 204);
  assert.equal(opt.headers.get("allow"), "GET, HEAD, POST, OPTIONS");
  assert.equal(opt.headers.get("access-control-allow-origin"), null);
  const put = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", { method: "PUT", body: "x" }), {});
  assert.equal(put.status, 405);
  assert.equal(put.headers.get("allow"), "GET, HEAD, POST, OPTIONS");
  const md = await post({ url: "https://turva.dev/tools" }, { accept: "text/markdown" });
  assert.equal(md.status, 200);
  assert.match(md.headers.get("content-type"), /application\/json/, "a JSON body gets the JSON report");
  const other = await worker.fetch(new Request("https://turva.dev/tools", { method: "POST", body: "x" }), {});
  assert.equal(other.status, 405, "no other page accepts POST");
  const upper = await worker.fetch(new Request("https://turva.dev/Markdown-Parity-Check", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }), {});
  assert.equal(upper.status, 405, "the method gate and the route agree on the exact path");
});
