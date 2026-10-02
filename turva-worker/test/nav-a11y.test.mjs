import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";

// Tek-560 (W12 F3 and F2). The mobile menu closes on Escape and on focus leaving it through
// a served script, because the CSP allows one hashed inline script and nothing else inline.
// Offline, against the module itself, like routes.test.mjs.
const env = {};
const get = (path, headers = {}) =>
  worker.fetch(new Request("https://turva.dev" + path, { headers }), env);

const NAV_TAG = '<script src="/nav.js" defer></script>';
const count = (s, needle) => s.split(needle).length - 1;

test("/nav.js serves 200 as text/javascript with no template residue", async () => {
  const r = await get("/nav.js");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type") || "", /^text\/javascript/);
  const js = await r.text();
  assert.ok(js.includes("details.nv-mobile"), "targets the mobile menu");
  assert.ok(js.includes("Escape") && js.includes("focusout"), "handles Escape and focusout");
  assert.ok(!/\$\{|`/.test(js), "no substitution or backtick in the served bytes");
  new Function(js); // parses as a plain script
});

test("every sitemap HTML page that renders the nav includes the nav script exactly once", async () => {
  const xml = await (await get("/sitemap.xml")).text();
  const paths = [...xml.matchAll(/<loc>https:\/\/turva\.dev([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
  assert.ok(paths.length > 10, "sitemap lists pages (saw " + paths.length + ")");
  let withNav = 0;
  for (const p of paths) {
    const r = await get(p, { Accept: "text/html" });
    if (!/text\/html/.test(r.headers.get("content-type") || "")) continue;
    const html = await r.text();
    if (!html.includes('class="turva-nav"')) continue;
    withNav++;
    assert.equal(count(html, NAV_TAG), 1, p + " carries the nav script once");
    assert.equal(count(html, 'class="nv-mobile"'), 1, p + " has one mobile menu");
  }
  assert.ok(withNav >= paths.length - 3, "nearly every sitemap page renders the nav (saw " + withNav + " of " + paths.length + ")");
});

test("the blog index carries both scripts, and the 404 page carries the nav script once", async () => {
  const blog = await (await get("/blog", { Accept: "text/html" })).text();
  assert.equal(count(blog, NAV_TAG), 1);
  assert.equal(count(blog, '<script src="/blog-filter.js" defer></script>'), 1);
  const nf = await get("/no-such-page-tek-560", { Accept: "text/html" });
  assert.equal(nf.status, 404);
  assert.equal(count(await nf.text(), NAV_TAG), 1);
});

test("the nav script is not listed in the sitemap", async () => {
  const xml = await (await get("/sitemap.xml")).text();
  assert.ok(!xml.includes("nav.js"));
});

test("the five example pre blocks on the two tool pages carry tabindex, other pages keep plain pre", async () => {
  const want = { "/llms-txt-validator": 2, "/markdown-parity-check": 3 };
  for (const [p, n] of Object.entries(want)) {
    const html = await (await get(p, { Accept: "text/html" })).text();
    assert.equal(count(html, '<pre tabindex="0"><code>'), n, p + " tabindex pre count");
    assert.equal(count(html, "<pre><code>"), 0, p + " has no plain pre left");
  }
  const guide = await (await get("/guides/llms-txt", { Accept: "text/html" })).text();
  assert.ok(!guide.includes("<pre tabindex"), "guide code blocks are unchanged");
  const page = await (await get("/markdown-parity-check", { Accept: "text/html" })).text();
  assert.ok(page.includes("pre:focus-visible{outline:2px solid #5DF18F;outline-offset:2px;}"));
});
