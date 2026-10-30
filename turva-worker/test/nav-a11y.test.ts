import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";
import { readFileSync } from "node:fs";

// Tek-560 (W12 F3 and F2). The mobile menu closes on Escape and on focus leaving it through
// a served script, because the CSP allows one hashed inline script and nothing else inline.
// Offline, against the module itself, like routes.test.ts.
const env = {};
const get = (path: string, headers: Record<string, string> = {}) =>
  worker.fetch(new Request("https://turva.dev" + path, { headers }), env);

// Source check for the blog-only scoping: every line of serveGuideHtml that writes the tabindex replacement
// also carries the pathname.startsWith("/blog/") condition, and there is at least one such line.
function guideTabindexIsBlogOnly(src: string): boolean {
  const start = src.indexOf("function serveGuideHtml(");
  if (start < 0) return false;
  const next = src.indexOf("\nfunction ", start + 10);
  const body = src.slice(start, next < 0 ? undefined : next);
  const writers = body.split("\n").filter((l) => l.includes("<pre tabindex=\"0\"><code>"));
  return writers.length >= 1 && writers.every((l) => /if \(pathname\.startsWith\("\/blog\/"\)\)/.test(l) && l.includes(".replace(/<pre><code>/g,"));
}

const NAV_TAG = '<script src="/nav.js" defer></script>';
const count = (s: string, needle: string) => s.split(needle).length - 1;

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

test("the example pre blocks on the two tool pages, the blog posts and /badge carry tabindex, guides keep plain pre", async () => {
  // The parity page's request example is one block since WL-07: its headers and its JSON body are separated by a blank line.
  const want = { "/llms-txt-validator": 2, "/markdown-parity-check": 2 };
  for (const [p, n] of Object.entries(want)) {
    const html = await (await get(p, { Accept: "text/html" })).text();
    assert.equal(count(html, '<pre tabindex="0"><code>'), n, p + " tabindex pre count");
    assert.equal(count(html, "<pre><code>"), 0, p + " has no plain pre left");
  }
  const guide = await (await get("/guides/llms-txt", { Accept: "text/html" })).text();
  assert.ok(!guide.includes("<pre tabindex"), "guide code blocks are unchanged");
  // No guide renders a code block today (0 of 24 sitemap guides), so the rendered check above holds
  // vacuously. The scoping is carried by the source: the tabindex replacement in serveGuideHtml, which
  // serves blog posts and guides, must sit behind the /blog/ condition.
  assert.ok(guideTabindexIsBlogOnly(workerSrc), "serveGuideHtml adds tabindex to pre only behind pathname.startsWith(\"/blog/\")");
  // K4 (mobile read 2026-10-30): Playwright's WebKit build did not focus a sideways-scrolling pre without tabindex, so the six
  // pages whose pre scrolls on a phone carry tabindex too. Only the render changes; the Markdown twin does not.
  for (const p of ["/badge", "/blog/html-and-markdown-can-disagree", "/blog/microsofts-own-cve-count", "/blog/measuring-the-ai-patch-surge", "/blog/enforcing-the-rate-limit-i-advertised", "/blog/free-llms-txt-validator"]) {
    const html = await (await get(p, { Accept: "text/html" })).text();
    assert.ok(count(html, '<pre tabindex="0"><code>') >= 1, p + " has a focusable pre");
    assert.equal(count(html, "<pre><code>"), 0, p + " has no plain pre left");
    const md = await (await get(p, { Accept: "text/markdown" })).text();
    assert.ok(!md.includes("tabindex"), p + " twin is unchanged");
  }
  const page = await (await get("/markdown-parity-check", { Accept: "text/html" })).text();
  assert.ok(page.includes("pre:focus-visible{outline:2px solid #5DF18F;outline-offset:2px;}"));
});

// Mobile read 2026-10-30 (K1, K2, K3, K8, K11). The CSS cases read worker.ts as text because a
// node:test run has no layout engine; the measured side of each case is in the batch notes.
const workerSrc = readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8");

test("K1 and K2: the 760px nav rule lets the row wrap and declares no horizontal padding", () => {
  const m = /@media \(max-width:760px\)\{\.turva-nav\{([^}]*)\}/.exec(workerSrc);
  assert.ok(m, "the 760px .turva-nav rule exists");
  const body = m[1];
  assert.ok(!/flex-wrap:\s*nowrap/.test(body), "nowrap pushes the Menu button off screen at 200% text");
  assert.ok(/flex-wrap:\s*wrap/.test(body), "the row may wrap");
  // FOOTER_CSS sets the real 24px gutter later in the cascade, so any horizontal value here is dead.
  assert.ok(!/padding(-left|-right|-inline)?:\s*[^;]*clamp/.test(body), "no dead clamp padding");
  assert.ok(!/padding-(left|right|inline)/.test(body), "no horizontal longhand");
  assert.ok(!/(^|;)\s*padding:\s*\S+\s+\S+/.test(body), "no two-value padding shorthand");
  assert.ok(/padding-block:\s*10px/.test(body), "the vertical 10px stays");
  // When the row wraps, justify-content:space-between would put the lone Menu item at the left edge (Tek-355: logo left, Menu right).
  const media = workerSrc.slice(workerSrc.indexOf("@media (max-width:760px){.turva-nav{"));
  const nm = /\.turva-nav \.nv-mobile\{([^}]*)\}/.exec(media);
  assert.ok(nm && /margin-left:\s*auto/.test(nm[1]), "the 760px .nv-mobile rule carries margin-left:auto: " + (nm && nm[1]));
});

test("K3: .board-src may break the scanner host name", () => {
  const m = /\.board-src\{([^}]*)\}/.exec(workerSrc);
  assert.ok(m, ".board-src rule exists");
  assert.ok(/overflow-wrap:\s*anywhere|min-width:\s*0/.test(m[1]), ".board-src carries overflow-wrap:anywhere or min-width:0");
});

test("K8: .kvs, .posts and .bempty are written in the .sec-qualified form that beats .sec ul and .sec p", () => {
  for (const sel of [".kvs", ".posts", ".bempty"]) {
    assert.ok(workerSrc.includes("\n" + sel + ",.sec " + sel + "{"), sel + " is declared as `" + sel + ",.sec " + sel + "`");
    assert.ok(!workerSrc.includes("\n" + sel + "{"), sel + " has no bare rule left that .sec would outrank");
  }
  // The 420px single-column rule must carry the same specificity as the base grid rule, or the base
  // `.sec .kvs` wins and the key-value list keeps two columns on a phone.
  const m = /@media \(max-width:420px\)\{([^@]*?)\}\.kv \.v\{/.exec(workerSrc);
  assert.ok(m, "the 420px .kvs media rule exists");
  assert.ok(m[1].startsWith(".kvs,.sec .kvs{grid-template-columns:minmax(0,1fr)"), "the 420px rule is `.kvs,.sec .kvs{...}`: " + m[1]);
  // No other rule may adjust these three selectors in a media query.
  for (const sel of [".kvs", ".posts", ".bempty"]) {
    const inMedia = workerSrc.match(new RegExp("@media[^{\\n]*\\{[^\\n]*" + sel.replace(".", "\\.") + "[{, ]", "g")) || [];
    if (sel === ".kvs") assert.equal(inMedia.length, 1, ".kvs is adjusted in exactly one media query");
    else assert.equal(inMedia.length, 0, sel + " is not adjusted in any media query");
  }
});

test("K11: the Signal QR image and the badge preview image load lazily", async () => {
  const contact = await (await get("/contact", { Accept: "text/html" })).text();
  const qr = /<img src="\/signal-qr\.png"[^>]*>/.exec(contact);
  assert.ok(qr, "the rendered /contact page has the QR image");
  assert.ok(/loading="lazy"/.test(qr[0]) && /decoding="async"/.test(qr[0]), qr[0]);
  assert.ok(/width="147" height="147"/.test(qr[0]), "width and height stay so the layout does not shift");
  const badge = await (await get("/badge", { Accept: "text/html" })).text();
  const tags = badge.match(/<img src="\/badge\.svg"[^>]*>/g) || [];
  assert.equal(tags.length, 1, "the rendered /badge page has one preview image");
  assert.ok(/loading="lazy"/.test(tags[0]) && /decoding="async"/.test(tags[0]), tags[0]);
  assert.ok(/width="216" height="36"/.test(tags[0]), "width and height stay");
});

// K5 (mobile read 2026-10-30): the plus and minus signs are decoration, so every content declaration of the
// Menu summary carries the alternative empty text and the accessible name stays "Menu" in both states.
// The plain declaration before it is the fallback for a browser that rejects the slash syntax.
test("K5: both Menu summary content declarations carry the empty alternative text", () => {
  const decls = workerSrc.match(/summary::after\{content:[^;}]*;[^}]*\}/g) || [];
  assert.equal(decls.length, 2, "closed and open state, one copy of the nav CSS");
  assert.ok(/summary::after\{content:"\+";content:"\+" \/ "";/.test(decls[0]), decls[0]);
  assert.ok(/summary::after\{content:"\\\\2212";content:"\\\\2212" \/ "";\}/.test(decls[1]), decls[1]);
});

// N1 (195 px follow-up to the mobile read 2026-10-30): at 195 px (a 390 px phone at 200% browser zoom) the page column is
// 147 px wide. A grid track minimum above that pushed the home page 84 px sideways (.steps 175 px, .svcgrid 255 px), and
// the 216 px badge preview image did the same on /badge. Every auto-fit track minimum is capped at the column
// width with min(<px>,100%), and a lone image inside a paragraph may not be wider than its column.
test("N1: no auto-fit grid track minimum exceeds the column and a lone page image is capped at 100%", async () => {
  const home = await (await get("/", { Accept: "text/html" })).text();
  for (const px of [175, 255]) {
    assert.ok(home.includes("repeat(auto-fit,minmax(min(" + px + "px,100%),1fr))"), "the home grid with a " + px + " px minimum is capped");
    assert.ok(!home.includes("minmax(" + px + "px,1fr)"), "no uncapped " + px + " px track minimum on the home page");
  }
  assert.deepEqual(workerSrc.match(/auto-fit,minmax\(\d+px/g) || [], [], "no auto-fit track minimum anywhere in the source is a bare pixel length");
  const badge = await (await get("/badge", { Accept: "text/html" })).text();
  assert.equal(count(badge, "main p>img{max-width:100%;height:auto;}"), 1, "the shared page CSS caps a lone image once");
  assert.ok(/<p><img src="\/badge\.svg"[^>]*width="216" height="36"/.test(badge), "the badge preview is a lone image in a paragraph and keeps its drawn size");
});
