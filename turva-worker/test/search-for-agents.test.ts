import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

// Search for Agents (Tek-925): the Worker answers GET /.well-known/search?q={query} itself, as the
// isitagentready check and Cloudflare's zone feature define it, and advertises it in the head of
// every normal page. The zone feature was switched off on 2026-11-25 because the edge rewrote
// every HTML page and removed the weak ETag; these tests pin that the Worker's own version keeps it.
const env = {};
const get = (path: string, init: RequestInit = {}) =>
  worker.fetch(new Request("https://turva.dev" + path, init), env, {});

test("a known query answers 200 markdown with the heading first, no Accept-Query, and the matching page", async () => {
  const r = await get("/.well-known/search?q=llms.txt");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type")!, /^text\/markdown/);
  assert.equal(r.headers.get("accept-query"), null, "Accept-Query would advertise a QUERY method the endpoint does not accept");
  assert.equal(r.headers.get("access-control-allow-origin"), "*");
  const body = await r.text();
  assert.ok(body.startsWith('# Search results for: "llms.txt"\n'), "the body starts with the heading the check reads");
  assert.ok(body.includes("](https://turva.dev/guides/llms-txt)"), "the llms.txt guide is among the results");
  assert.ok(body.includes("Markdown: https://turva.dev/guides/llms-txt.md"));
});

test("a title hit ranks above a body-only hit", async () => {
  const body = await (await get("/.well-known/search?q=llms.txt&limit=50")).text();
  const first = body.indexOf("## [");
  assert.ok(body.slice(first, first + 300).includes("llms.txt"), "the first result names the query in its title");
});

test("an empty, missing or too long q answers 400 markdown that is not an HTML page", async () => {
  for (const path of ["/.well-known/search?q=", "/.well-known/search", "/.well-known/search?q=%20%20", "/.well-known/search?q=" + "a".repeat(201), "/.well-known/search?q=%21"]) {
    const r = await get(path);
    assert.equal(r.status, 400, path.slice(0, 40));
    assert.match(r.headers.get("content-type")!, /^text\/markdown/);
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.ok(!(await r.text()).includes("<html"));
  }
  assert.equal((await get("/.well-known/search?q=" + "a".repeat(200))).status, 200, "200 characters is the limit and passes");
});

test("a method other than GET and HEAD answers 405 with Allow", async () => {
  const r = await get("/.well-known/search?q=llms.txt", { method: "POST", body: "x" });
  assert.equal(r.status, 405);
  assert.match(r.headers.get("allow") || "", /GET, HEAD/);
});

test("a quote in the query is escaped and the heading stays on one line", async () => {
  const body = await (await get("/.well-known/search?q=" + encodeURIComponent('say "hello"\nsecond'))).text();
  const heading = body.split("\n")[0];
  assert.equal(heading, '# Search results for: "say \\"hello\\" second"');
});

test("no hits is still 200 with the heading, 0 results and a pointer to llms.txt", async () => {
  const r = await get("/.well-known/search?q=zzzzqqqq");
  assert.equal(r.status, 200);
  const body = await r.text();
  assert.ok(body.startsWith('# Search results for: "zzzzqqqq"\n'));
  assert.ok(body.includes("0 results."));
  assert.ok(body.includes("https://turva.dev/llms.txt"));
});

test("limit is clamped, and every result path is a page the sitemap lists", async () => {
  const sitemap = await (await get("/sitemap.xml")).text();
  const listed = new Set([...sitemap.matchAll(/<loc>https:\/\/turva\.dev([^<]*)<\/loc>/g)].map((m) => m[1] || "/"));
  const body = await (await get("/.well-known/search?q=agent&limit=999")).text();
  const links = [...body.matchAll(/^## \[[^\]]*\]\(https:\/\/turva\.dev([^)]*)\)$/gm)].map((m) => m[1] || "/");
  assert.ok(links.length >= 10 && links.length <= 50, "between 10 and 50 results for a common word: " + links.length);
  for (const p of links) assert.ok(listed.has(p), p + " is in sitemap.xml");
  const one = await (await get("/.well-known/search?q=agent&limit=1")).text();
  assert.equal([...one.matchAll(/^## \[/gm)].length, 1);
});

test("an HTML page advertises the endpoint in four agent: meta tags", async () => {
  for (const path of ["/", "/services", "/guides/llms-txt", "/blog"]) {
    const html = await (await get(path)).text();
    const head = html.slice(0, html.indexOf("</head>"));
    assert.ok(head.includes('<meta name="agent:instructions" content="'), path);
    assert.ok(head.includes('<meta name="agent:endpoint" content="https://turva.dev/.well-known/search?q={query}" />'), path);
    assert.ok(head.includes('<meta name="agent:method" content="GET" />'), path);
    assert.ok(head.includes('<meta name="agent:documentation" content="https://github.com/turva-dev/turva-worker/blob/main/docs/endpoints.md" />'), path);
  }
});

test("an HTML 200 page still carries its ETag, and a matching If-None-Match gets 304", async () => {
  const r = await get("/guides/llms-txt");
  assert.equal(r.status, 200);
  const etag = r.headers.get("etag");
  assert.match(etag || "", /^W\/"[0-9a-f]{32}"$/);
  const again = await get("/guides/llms-txt", { headers: { "if-none-match": etag! } });
  assert.equal(again.status, 304);
});
