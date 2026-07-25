import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";

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
    const r = await get(u.pathname);
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
