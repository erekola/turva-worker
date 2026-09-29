import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";

// Cloudflare's AI Crawl Control reported a third of markdown requests as unfulfilled
// (2026-09-29). Every page already answered text/markdown; the rest were 404s answered
// as HTML and Accept: text/x-markdown, which the negotiation did not recognise.
const env = {};
const get = (path, headers = {}) =>
  worker.fetch(new Request("https://turva.dev" + path, { headers }), env);

test("a 404 asked for as markdown answers markdown, still 404", async () => {
  const r = await get("/no-such-page", { Accept: "text/markdown" });
  assert.equal(r.status, 404);
  assert.match(r.headers.get("content-type"), /^text\/markdown/);
  assert.equal(r.headers.get("vary"), "Accept");
  const body = await r.text();
  assert.match(body, /^# Page not found\n/);
  assert.ok(!body.includes("no-such-page"), "the path is not echoed into markdown");
});

test("a .md address that does not exist answers a markdown 404 without an Accept header", async () => {
  const r = await get("/no-such-page.md");
  assert.equal(r.status, 404);
  assert.match(r.headers.get("content-type"), /^text\/markdown/);
});

test("a plain 404 stays HTML and says it varies by Accept", async () => {
  for (const h of [{}, { Accept: "text/html" }, { Accept: "text/html, text/markdown;q=0.1" }]) {
    const r = await get("/no-such-page", h);
    assert.equal(r.status, 404);
    assert.match(r.headers.get("content-type"), /^text\/html/);
    assert.equal(r.headers.get("vary"), "Accept");
  }
});

test("Accept: text/x-markdown gets the markdown page, and text/markdown is unchanged", async () => {
  for (const a of ["text/x-markdown", "text/markdown", "text/html, text/markdown"]) {
    const r = await get("/services", { Accept: a });
    assert.equal(r.status, 200);
    assert.match(r.headers.get("content-type"), /^text\/markdown/, a);
  }
  const refused = await get("/services", { Accept: "text/html, text/x-markdown;q=0" });
  assert.match(refused.headers.get("content-type"), /^text\/html/, "q=0 still refuses");
});
