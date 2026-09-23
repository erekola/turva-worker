import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker, { markdownToHtml, renderInline } from "../src/worker.js";

// Regression tests for audit round 19 (docs/auditit/kierros-19/korjaussuunnitelma.md).
// Each test names the finding id it guards (F1, K6-1, ... G1-5) so a failure maps back
// to one row of the fix plan. Every fix test below was checked against the pre-fix
// worker.js (worker.orig.js, sha256 ca0f4b2a...8baa28) and fails there; every G1 test
// checks a surface round 19 did not touch and passes on both versions.

const env = {}; // no RATE_LIMITER binding: exercises the documented fail-open path

const get = (path, opts = {}) =>
  worker.fetch(new Request("https://turva.dev" + path, { method: opts.method || "GET", headers: opts.headers || {} }), env);

const workerSrc = readFileSync(new URL("../src/worker.js", import.meta.url), "utf8");

// ---- F1: fenced code blocks and one-line ATX headings ----

test("F1: backtick and tilde fences render as one pre/code block across blank lines, an info string is dropped, and an unclosed fence stays prose", () => {
  assert.equal(
    markdownToHtml("```\nfoo <b>\n\nbar\n```"),
    "<pre><code>foo &lt;b&gt;\n\nbar</code></pre>"
  );
  assert.equal(markdownToHtml("~~~\nfoo\n~~~"), "<pre><code>foo</code></pre>");
  assert.equal(markdownToHtml("```js\nvar x = 1;\n```"), "<pre><code>var x = 1;</code></pre>");
  const unclosed = markdownToHtml("```\nfoo bar");
  assert.ok(!unclosed.includes("<pre><code>"), "an unclosed fence must not become a code block");
  assert.ok(unclosed.includes("foo bar"), "an unclosed fence's text must still reach the page");
});

test("F1: an ATX heading is one line even when a list follows with no blank line", () => {
  const html = markdownToHtml("## H\n- a");
  assert.equal(html, '<h2 id="h">H</h2>\n<ul><li>a</li></ul>');
});

// ---- K6-1: a brief's held escapes return to backslash form inside code ----

test("K6-1: a brief's code keeps a backslash-escaped character, prose loses it", async () => {
  const id = "testbrief1";
  const briefMd = [
    "Prose with an escaped \\# hash and \\- dash.",
    "",
    "    \\# indented code line",
    "    \\- indented code line two",
    "",
    "```",
    "\\# fenced code line",
    "\\- fenced code line two",
    "```"
  ].join("\n");
  const rec = { md: briefMd, json: {}, kieli: "en", otsikko: "t" };
  const briefEnv = { BRIEFIT: { get: async (k) => (k === id ? rec : null) } };
  const res = await worker.fetch(new Request("https://turva.dev/brief/" + id, { headers: { accept: "text/html" } }), briefEnv);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.ok(
    html.includes("<pre><code>\\# indented code line\n\\- indented code line two</code></pre>"),
    "an indented code line must keep its backslash"
  );
  assert.ok(
    html.includes("<pre><code>\\# fenced code line\n\\- fenced code line two</code></pre>"),
    "a fenced code line must keep its backslash"
  );
  assert.ok(
    html.includes("<p>Prose with an escaped # hash and - dash.</p>"),
    "prose must drop the backslash and keep the character"
  );
  assert.ok(!html.includes("escaped \\#"), "prose must not retain the backslash form");
});

// ---- K4-3: heading ids are unique within one document ----

test("K4-3: two identical headings in one document get unique ids", () => {
  const html = markdownToHtml("## Same\n\n## Same");
  assert.equal(html, '<h2 id="same">Same</h2>\n<h2 id="same-2">Same</h2>');
});

// ---- K4-1: a root-relative link target must resolve to this origin ----

test("K4-1: a root-relative link is only linked when it resolves to this origin", () => {
  const bs = String.fromCharCode(92);
  const backslashHost = renderInline("[go](/" + bs + "evil.example.com)");
  assert.ok(!/href=/i.test(backslashHost), "a backslash-host target must not become a link");
  assert.ok(backslashHost.includes("go"), "the visible label must still show");

  const protocolRelative = renderInline("[go](//evil.example.com)");
  assert.ok(!/href=/i.test(protocolRelative), "a protocol-relative // target must not become a link");

  assert.equal(renderInline("[go](/guides)"), '<a href="/guides">go</a>');
});

// ---- K4-2: bidirectional override characters are stripped from visible text too ----

test("K4-2: a bidi override character does not reach the label or the angle-bracket link text", () => {
  const rtl = String.fromCharCode(0x202e);
  const labelOut = renderInline("[go" + rtl + "here](/guides)");
  assert.ok(!labelOut.includes(rtl), "the visible label must not carry the override character");

  const angleOut = renderInline("<https://turva.dev/" + rtl + "path>");
  assert.ok(!angleOut.includes(rtl), "the angle-bracket link text must not carry the override character");
});

// ---- K4-4: every JSON-LD block on the home page parses ----
// This may pass against the pre-fix worker.js too: today's home page FAQ has no "</"
// sequence to close early, so jsonLdSafe's fix changes no existing page's output.

test("K4-4: every application/ld+json block on the home page parses", async () => {
  const res = await get("/");
  const html = await res.text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.ok(blocks.length > 0, "the home page must carry at least one JSON-LD block");
  for (const [, body] of blocks) {
    assert.doesNotThrow(() => JSON.parse(body), "a JSON-LD block must parse");
  }
});

// ---- K7-2: an accepted llms.txt redirect is masked too ----

test("K7-2: an accepted llms.txt redirect is masked in the JSON and HTML output alike", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u === "https://probe-target.example/llms.txt") {
      return new Response(null, { status: 301, headers: { location: "/llms.txt?session=TOKEN123#frag" } });
    }
    if (u === "https://probe-target.example/llms.txt?session=TOKEN123#frag") {
      return new Response("# Probe target\n\n> A summary.\n", { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    if (u === "https://probe-target.example/") {
      return new Response("", { status: 404 });
    }
    throw new Error("unexpected fetch to " + u);
  };
  try {
    const jsonRes = await worker.fetch(
      new Request("https://turva.dev/llms-txt-validator?url=probe-target.example&format=json", { headers: { accept: "application/json" } }),
      env
    );
    const jsonText = await jsonRes.text();
    assert.ok(!jsonText.includes("TOKEN123"), "the JSON answer must not carry the query value");
    assert.ok(!jsonText.toLowerCase().includes("frag"), "the JSON answer must not carry the fragment");

    const htmlRes = await worker.fetch(
      new Request("https://turva.dev/llms-txt-validator?url=probe-target.example", { headers: { accept: "text/html" } }),
      env
    );
    const htmlText = await htmlRes.text();
    assert.ok(!htmlText.includes("TOKEN123"), "the HTML answer must not carry the query value");
    assert.ok(!htmlText.toLowerCase().includes("frag"), "the HTML answer must not carry the fragment");
  } finally {
    globalThis.fetch = realFetch;
  }
});

// ---- V6-U1: bidi controls in the fetched llms.txt do not reach the result ----

test("V6-U1: a bidi override in the fetched llms.txt does not reach the JSON or HTML result", async () => {
  const rtl = String.fromCharCode(0x202e);
  const body = "# Site" + rtl + " name\n\n> A summary" + rtl + " line.\n";
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u === "https://probe-target2.example/llms.txt") {
      return new Response(body, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    if (u === "https://probe-target2.example/") {
      return new Response("", { status: 404 });
    }
    throw new Error("unexpected fetch to " + u);
  };
  try {
    const jsonRes = await worker.fetch(
      new Request("https://turva.dev/llms-txt-validator?url=probe-target2.example", { headers: { accept: "application/json" } }),
      env
    );
    const jsonText = await jsonRes.text();
    assert.ok(!jsonText.includes(rtl), "the JSON answer must not carry the override character");

    const htmlRes = await worker.fetch(
      new Request("https://turva.dev/llms-txt-validator?url=probe-target2.example", { headers: { accept: "text/html" } }),
      env
    );
    const htmlText = await htmlRes.text();
    assert.ok(!htmlText.includes(rtl), "the HTML answer must not carry the override character");
  } finally {
    globalThis.fetch = realFetch;
  }
});

// ---- K8-1: a request body that never finishes must not hold a parity slot ----

test("K8-1: a request whose body never finishes reading must not hold a parity concurrency slot", async () => {
  const parityEnv = { PARITY_LIMITER: { limit: async () => ({ success: true }) } };
  const makeStalled = () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"url":"https://turva.dev/to'));
        // deliberately never closes
      }
    });
    return new Request("https://turva.dev/markdown-parity-check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: stream,
      duplex: "half"
    });
  };
  // Four requests whose bodies never finish reading. Started but never awaited: they
  // are meant to hang for the rest of the process, which is the point of the test.
  for (let i = 0; i < 4; i++) worker.fetch(makeStalled(), parityEnv);
  const complete = new Request("https://turva.dev/markdown-parity-check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://turva.dev/tools" })
  });
  const res = await worker.fetch(complete, parityEnv);
  assert.equal(res.status, 200, "a request whose own body reads fine must not be refused because four others are still reading theirs");
});

// ---- K1-1: every redirect and the A2A preflight carry the site's security headers ----

test("K1-1: every redirect and the A2A preflight carry RateLimit-Policy, Referrer-Policy and X-Frame-Options", async () => {
  const guideOnlySlug = "agent-commerce-discovery"; // a guide with no blog post of the same slug
  const briefId = "testbrief1";
  const cases = [
    new Request("https://www.turva.dev/services"),
    new Request("https://turva.dev/packages"), // a LEGACY_REDIRECTS key
    new Request("https://turva.dev/services/"),
    new Request("https://turva.dev/blog/" + guideOnlySlug),
    new Request("https://turva.dev/.well-known/webfinger"),
    new Request("https://mta-sts.turva.dev/"),
    new Request("https://turva.dev/v1/message:send/"),
    new Request("https://turva.dev/brief/" + briefId + ".")
  ];
  for (const req of cases) {
    const res = await worker.fetch(req, env);
    assert.equal(res.status, 301, req.url + " must answer 301");
    assert.ok(res.headers.has("RateLimit-Policy"), req.url + " must carry RateLimit-Policy");
    assert.ok(res.headers.has("Referrer-Policy"), req.url + " must carry Referrer-Policy");
    assert.ok(res.headers.has("X-Frame-Options"), req.url + " must carry X-Frame-Options");
  }
  const preflight = await worker.fetch(new Request("https://turva.dev/v1/message:send", { method: "OPTIONS" }), env);
  assert.equal(preflight.status, 204);
  assert.ok(preflight.headers.has("access-control-allow-origin"), "the A2A preflight must keep its CORS origin header");
  assert.ok(preflight.headers.has("access-control-allow-methods"), "the A2A preflight must keep its CORS methods header");
  assert.ok(preflight.headers.has("RateLimit-Policy"), "the A2A preflight must now carry RateLimit-Policy too");
});

// ---- F2: the site-wide 429 is never cached ----

test("F2: the site-wide 429 carries cache-control no-store", async () => {
  const limitedEnv = { RATE_LIMITER: { limit: async () => ({ success: false }) } };
  const res = await worker.fetch(new Request("https://turva.dev/"), limitedEnv);
  assert.equal(res.status, 429);
  assert.equal(res.headers.get("cache-control"), "no-store");
});

// ---- K1-4: the three agent/auth routes are declared as POST in the OpenAPI document ----

test("K1-4: /openapi.json declares POST for the three agent/auth routes, and each answers 200", async () => {
  const res = await get("/openapi.json");
  const doc = JSON.parse(await res.text());
  for (const path of ["/agent/auth/register", "/agent/auth/claim", "/agent/auth/revoke"]) {
    assert.ok(doc.paths[path] && doc.paths[path].post, "openapi.json must declare post for " + path);
    const postRes = await get(path, { method: "POST" });
    assert.equal(postRes.status, 200, "POST " + path + " must answer 200");
  }
});

// ---- K2-1: the services skill names agent operations and MCP server design as quoted on request ----

test("K2-1: the services skill no longer lumps agent operations and MCP server design into 'the last two'", async () => {
  const res = await get("/.well-known/agent-skills/services/skill.md");
  assert.equal(res.status, 200);
  const md = await res.text();
  assert.ok(
    md.includes("agent operations and MCP server design are quoted on request"),
    "the skill must name the two quoted-on-request services"
  );
  assert.ok(!md.includes("the last two are quoted on request"), "the old vague phrasing must be gone");
});

// ---- V4-U1: the served WebMCP script's ownPath refuses a path starting with two slashes ----

test("V4-U1: ownPath in the served WebMCP script refuses a path that starts with two slashes", async () => {
  const res = await get("/");
  const html = await res.text();
  const start = html.indexOf("var ORIGIN");
  const end = html.indexOf("function byteLength", start);
  assert.ok(start !== -1 && end !== -1 && end > start, "the WebMCP script must define ORIGIN before byteLength");
  const snippet = html.slice(start, end);
  const ownPath = new Function(snippet + "; return ownPath;")();
  assert.equal(ownPath("/.//evil.example"), "", "a pathname that itself reads as //host must be refused");
  assert.equal(ownPath("/guides"), "/guides", "an ordinary own path must still resolve");
});

// ---- K5-1: reduced motion turns off the hover transform on cell, step and svc cards ----

test("K5-1: a prefers-reduced-motion rule names .cell:hover on the home page", async () => {
  const res = await get("/");
  const html = await res.text();
  const idx = html.indexOf("@media (prefers-reduced-motion:reduce)");
  assert.notEqual(idx, -1, "the page must carry a prefers-reduced-motion rule");
  const chunk = html.slice(idx, idx + 300);
  assert.ok(chunk.includes(".cell:hover"), "the reduced-motion rule must name .cell:hover: " + chunk);
});

// ---- C4-1: the Codeberg post's meta date and its own correction note both read 2026-09-06 ----

test("C4-1: the Codeberg post's article:modified_time and its correction note both read 2026-09-06", async () => {
  const htmlRes = await get("/blog/moving-source-to-codeberg");
  const html = await htmlRes.text();
  assert.ok(
    html.includes('property="article:modified_time" content="2026-09-06"'),
    "article:modified_time must read 2026-09-06"
  );
  const mdRes = await get("/blog/moving-source-to-codeberg.md");
  const md = await mdRes.text();
  const hasOwnLine = md.split("\n").some((l) => l.trim().startsWith("Corrected 2026-09-06"));
  assert.ok(hasOwnLine, "the correction must be its own paragraph, not appended to the previous sentence");
});

// ---- G1-1: POST /oauth/token answers the exact status this site documents ----

test("G1-1: POST /oauth/token answers exactly 400", async () => {
  const res = await worker.fetch(new Request("https://turva.dev/oauth/token", { method: "POST" }), env);
  assert.equal(res.status, 400);
});

// ---- G1-2: OPTIONS /api/v1 advertises an exact preflight cache lifetime ----

test("G1-2: OPTIONS /api/v1 answers access-control-max-age 86400 exactly", async () => {
  const res = await worker.fetch(new Request("https://turva.dev/api/v1", { method: "OPTIONS" }), env);
  assert.equal(res.headers.get("access-control-max-age"), "86400");
});

// ---- G1-3: every LEGACY_REDIRECTS entry redirects to its mapped target ----

function parseLegacyRedirects(src) {
  const startMarker = "var LEGACY_REDIRECTS = {";
  const start = src.indexOf(startMarker);
  if (start === -1) throw new Error("LEGACY_REDIRECTS not found in worker.js");
  const bodyStart = start + startMarker.length;
  const end = src.indexOf("};", bodyStart);
  if (end === -1) throw new Error("LEGACY_REDIRECTS closing brace not found");
  const body = src.slice(bodyStart, end);
  const entries = {};
  const re = /"([^"]+)"\s*:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(body))) entries[m[1]] = m[2];
  return entries;
}

test("G1-3: every LEGACY_REDIRECTS entry answers 301 to https://turva.dev plus its mapped target", async () => {
  const entries = parseLegacyRedirects(workerSrc);
  const keys = Object.keys(entries);
  assert.ok(keys.length >= 20, "expected at least 20 parsed legacy redirects, got " + keys.length);
  for (const key of keys) {
    const res = await worker.fetch(new Request("https://turva.dev" + key), env);
    assert.equal(res.status, 301, key + " must redirect");
    assert.equal(res.headers.get("location"), "https://turva.dev" + entries[key], key + " must redirect to its mapped target");
  }
});

// ---- G1-4: a guide cross-posted at /blog/<slug> redirects, a real post of the same slug does not ----

test("G1-4: /blog/<guide slug with no post> redirects to the guide, a real post of the same slug stays put", async () => {
  const guideOnly = await get("/blog/agent-commerce-discovery");
  assert.equal(guideOnly.status, 301);
  assert.equal(guideOnly.headers.get("location"), "https://turva.dev/guides/agent-commerce-discovery");

  const realPost = await get("/blog/open-knowledge-format");
  assert.equal(realPost.status, 200);
});

// ---- G1-5: canceling a stateless ACP checkout session ----

test("G1-5: POST /api/acp/checkout_sessions/<id>/cancel answers 200 with a canceled, stateless session", async () => {
  const id = "acp_sess_audit_00000000-0000-0000-0000-000000000000";
  const res = await worker.fetch(new Request("https://turva.dev/api/acp/checkout_sessions/" + id + "/cancel", { method: "POST" }), env);
  assert.equal(res.status, 200);
  const body = JSON.parse(await res.text());
  assert.equal(body.id, id);
  assert.equal(body.status, "canceled");
  assert.ok(Array.isArray(body.messages), "a canceled session must explain itself in messages");
  assert.equal(body.messages.length, 2);
});
