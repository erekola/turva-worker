import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";

// Regression tests for Tek-562 (outside reviews W26 to W35): the x402 EIP-712 name, the UCP key,
// the closed ACP capabilities object, the A2A task routes, the server card CORS headers, the v6 key
// footer and the H2 rule of the hosted llms.txt validator. The package turva-llms-txt-validator
// 0.3.18 carries the same H2 cases in test/tek562.test.mjs.

const env = {};
const get = (path, opts = {}) =>
  worker.fetch(new Request("https://turva.dev" + path, { method: opts.method || "GET", headers: opts.headers || {} }), env);
// The digests below pin public bytes, so they go through WebCrypto rather than a hash CodeQL reads as a password hash.
const sha256Hex = async (bytes) => Buffer.from(await crypto.subtle.digest("SHA-256", bytes)).toString("hex");

// ---------------------------------------------------------------- x402, UCP, ACP

test("x402: every mainnet USDC entry in the manifest and the 402 challenge names the EIP-712 domain USD Coin", async () => {
  const res = await get("/.well-known/x402");
  const m = JSON.parse(await res.text());
  const mainnet = m.accepts.filter((a) => a.network === "eip155:8453" && a.asset.toLowerCase() === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913");
  assert.ok(mainnet.length >= 5);
  for (const a of mainnet) assert.equal(a.extra.name, "USD Coin", a.resource);
  assert.equal(m.accepts.filter((a) => a.extra && a.extra.name === "USDC").length, 0, "no entry keeps the old name");
  const ch = await get("/api/agent/audit");
  assert.equal(ch.status, 402);
  const body = JSON.parse(await ch.text());
  assert.equal(body.accepts[0].extra.name, "USD Coin");
  assert.equal(body.accepts[0].extra.version, "2");
});

test("UCP: the service key is the underscore form the profile schema allows", async () => {
  const j = JSON.parse(await (await get("/.well-known/ucp")).text());
  const keys = Object.keys(j.ucp.services);
  assert.deepEqual(keys, ["dev.turva.agent_readiness"]);
  assert.ok(keys.every((k) => /^[a-z][a-z0-9_]*(?:[.][a-z][a-z0-9_]*)+$/.test(k)));
});

test("ACP: capabilities is a closed object with no checkout_note, and the wording lives in the OpenAPI spec", async () => {
  const j = JSON.parse(await (await get("/.well-known/acp")).text());
  assert.deepEqual(Object.keys(j.capabilities).sort(), ["services", "supported_currencies"]);
  const spec = await (await get("/openapi.json")).text();
  assert.ok(spec.includes("agreed by email and a written scope"));
});

test("API index: the description does not claim every surface", async () => {
  const spec = JSON.parse(await (await get("/openapi.json")).text());
  const d = spec.paths["/api/v1"].get.description;
  assert.match(d, /main agent entrypoints, with links to the full catalogs/);
  assert.ok(!/every agent surface/.test(d));
});

// ---------------------------------------------------------------- A2A

test("A2A: GET /v1/tasks/{id} and POST /v1/tasks/{id}:cancel answer -32001 task not found with status 404", async () => {
  const g = await get("/v1/tasks/abc-123");
  assert.equal(g.status, 404);
  assert.match(g.headers.get("content-type"), /application\/json/);
  const gj = await g.json();
  assert.equal(gj.error.code, -32001);
  assert.equal(gj.error.message, "task not found");
  assert.deepEqual(gj.error.data, { taskId: "abc-123" });
  const p = await get("/v1/tasks/abc-123:cancel", { method: "POST" });
  assert.equal(p.status, 404);
  const pj = await p.json();
  assert.equal(pj.error.code, -32001);
  assert.deepEqual(pj.error.data, { taskId: "abc-123" });
});

test("A2A: the task routes keep their method rules and CORS preflights", async () => {
  const getCancel = await get("/v1/tasks/x:cancel");
  assert.equal(getCancel.status, 405);
  assert.equal(getCancel.headers.get("allow"), "POST, OPTIONS");
  const postGet = await get("/v1/tasks/x", { method: "POST" });
  assert.equal(postGet.status, 405);
  const o1 = await get("/v1/tasks/x", { method: "OPTIONS" });
  assert.equal(o1.status, 204);
  assert.equal(o1.headers.get("access-control-allow-methods"), "GET, OPTIONS");
  assert.equal(o1.headers.get("access-control-allow-origin"), "*");
  const o2 = await get("/v1/tasks/x:cancel", { method: "OPTIONS" });
  assert.equal(o2.status, 204);
  assert.equal(o2.headers.get("access-control-allow-methods"), "POST, OPTIONS");
});

test("A2A: an unknown /v1 path is still the 404 method-not-found and lists the two task routes as supported", async () => {
  for (const p of ["/v1/unknown", "/v1/tasks", "/v1/tasks/", "/v1/tasks/a/b"]) {
    const r = await get(p);
    assert.equal(r.status, 404, p);
    const j = await r.json();
    assert.equal(j.error.code, -32601, p);
    assert.deepEqual(j.error.data.supported, ["POST /v1/message:send", "GET /v1/tasks/{id}", "POST /v1/tasks/{id}:cancel"]);
  }
});

test("OpenAPI: the A2A message schema names messageId and kind as optional, and parts stays the only required key", async () => {
  const spec = JSON.parse(await (await get("/openapi.json")).text());
  const schema = spec.paths["/v1/message:send"].post.requestBody.content["application/json"].schema;
  const msg = schema.properties.message;
  assert.deepEqual(msg.required, ["parts"]);
  assert.equal(msg.properties.messageId.type, "string");
  assert.deepEqual(msg.properties.kind.enum, ["message"]);
  const ex = spec.paths["/v1/message:send"].post.requestBody.content["application/json"].example.message;
  assert.equal(ex.kind, "message");
  assert.match(ex.messageId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
});

// ---------------------------------------------------------------- server card CORS

test("MCP server card: the GET exposes ETag and the preflight answers 204 with the four CORS headers", async () => {
  const g = await get("/.well-known/mcp/server-card.json", { headers: { origin: "https://example.com" } });
  assert.equal(g.status, 200);
  assert.equal(g.headers.get("access-control-allow-origin"), "*");
  assert.match(g.headers.get("access-control-expose-headers"), /ETag/);
  assert.equal(g.headers.get("access-control-allow-methods"), "GET");
  assert.equal(g.headers.get("access-control-allow-headers"), "Content-Type, If-None-Match");
  const o = await get("/.well-known/mcp/server-card.json", { method: "OPTIONS", headers: { origin: "https://example.com", "access-control-request-method": "GET" } });
  assert.equal(o.status, 204);
  assert.equal(o.headers.get("access-control-allow-origin"), "*");
  assert.equal(o.headers.get("access-control-allow-methods"), "GET");
  assert.equal(o.headers.get("access-control-allow-headers"), "Content-Type, If-None-Match");
  assert.equal(o.headers.get("access-control-expose-headers"), "ETag");
});

// Tek-564 moved the card to MCP 1.6.15 and the 2026-10-05 measurement day to MCP 1.6.16 (both version fields, same length), so the pinned
// digest is that card's; the signature lives in SIGNATURES_JSON, outside these bytes.
test("MCP server card: the signed bytes are unchanged", async () => {
  const b = Buffer.from(await (await get("/.well-known/mcp/server-card.json")).arrayBuffer());
  assert.equal(b.length, 4244);
  assert.equal(await sha256Hex(b), "afa36391c8bb5598db56be5a4190d442c36fcfb8faef2ecd817e52d3e59cd367");
});

// ---------------------------------------------------------------- PGP v6 key

test("PGP: the version 6 armor has no CRC24 footer and its binary key is the same 13678 bytes", async () => {
  const t = await (await get("/pgp-key-v6.asc")).text();
  const lines = t.split(/\r?\n/);
  assert.ok(!lines.some((l) => /^=[A-Za-z0-9+/]{4}$/.test(l)), "RFC 9580 section 6.1: no CRC24 line in a v6 key armor");
  assert.ok(lines.includes("-----END PGP PUBLIC KEY BLOCK-----"));
  const bin = Buffer.from(lines.filter((l) => l && !l.startsWith("-----") && !l.includes(":")).join(""), "base64");
  assert.equal(bin.length, 13678);
  assert.equal(await sha256Hex(bin), "94c06baec8eadd24dc21b558fa1bdbfaad3d92db93aeba1731676327d6f0db22");
  const t4 = await (await get("/pgp-key.asc")).text();
  assert.ok(/\n=[A-Za-z0-9+/]{4}\n/.test(t4), "the version 4 block keeps its CRC footer");
});

// ---------------------------------------------------------------- hosted validator H2 rule

async function check(llms) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u === "https://example.com/llms.txt") return new Response(llms, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    if (u === "https://example.com/") return new Response("", { status: 404, headers: { "content-type": "text/html" } });
    throw new Error("unexpected fetch to " + u);
  };
  try {
    const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com", { headers: { accept: "application/json" } }), {});
    assert.equal(res.status, 200);
    return JSON.parse(await res.text());
  } finally {
    globalThis.fetch = realFetch;
  }
}
const sections = async (text) => (await check(text)).checks.find((c) => c.id === "sections");
const link = "- [Guide](https://example.org/a)\n";
const head = "# Test\n\n> Summary\n\n";

test("hosted validator: ## followed by a tab is an H2, and the report's 74-byte fixture passes", async () => {
  const fixture = "# Test\n\n> Summary\n\n##\tLinks\n\n- [Guide](https://turva.dev/guides/llms-txt)\n";
  assert.equal(Buffer.byteLength(fixture), 74);
  const s = await sections(fixture);
  assert.equal(s.status, "pass");
  assert.match(s.detail, /1 section, 1 carrying a file list/);
  assert.equal((await sections(head + "## Links\n\n" + link)).status, "pass");
  assert.equal((await sections(head + "##  Links\n\n" + link)).status, "pass");
});

test("hosted validator: a single-line setext H2 is a section and its links are that section's file list", async () => {
  for (const underline of ["-----", "---", "-", "---  "]) {
    const s = await sections(head + "Links\n" + underline + "\n\n" + link);
    assert.equal(s.status, "pass", JSON.stringify(underline));
    assert.match(s.detail, /1 section, 1 carrying a file list/, JSON.stringify(underline));
  }
  const two = await sections(head + "Docs\n----\n\n" + link + "\nMore\n----\n\n" + "- [Other](https://example.org/b)\n");
  assert.match(two.detail, /2 sections, 2 carrying a file list/);
  const atFileStart = await sections("Links\n---\n\n" + link);
  assert.equal(atFileStart.status, "pass", "a text line at the start of the file is a heading");
});

test("hosted validator: what stays out of H2", async () => {
  const noH2 = "no H2 sections found; sections are the convention for grouping links";
  // A list item followed by a thematic break.
  let s = await sections(head + "- [Guide](https://example.org/a)\n---\n");
  assert.equal(s.status, "warn");
  assert.equal(s.detail, noH2);
  // A thematic break after a blank line.
  s = await sections(head + "---\n\n" + link);
  assert.equal(s.detail, noH2);
  // A thematic break under a thematic break.
  s = await sections(head + "---\n---\n\n" + link);
  assert.equal(s.detail, noH2);
  // Text that continues a paragraph: the line before is not blank.
  s = await sections(head + "intro\nLinks\n---\n\n" + link);
  assert.equal(s.detail, noH2);
  // Inside a fence.
  s = await sections(head + "```\nLinks\n---\n```\n\n" + link);
  assert.equal(s.detail, noH2);
  s = await sections(head + "```\n## Links\n```\n\n" + link);
  assert.equal(s.detail, noH2);
  // A bare ## and three hashes.
  s = await sections(head + "##\n\n" + link);
  assert.equal(s.detail, noH2);
  s = await sections(head + "### Links\n\n" + link);
  assert.ok(s.detail.startsWith(noH2), "three hashes are not an H2 (the misplaced-heading note is the old behavior)");
  // Four spaces make an indented code block, a list marker or a quote starts another block.
  s = await sections(head + "    Links\n---\n\n" + link);
  assert.equal(s.detail, noH2);
  s = await sections(head + "> Links\n---\n\n" + link);
  assert.equal(s.detail, noH2);
  s = await sections(head + "1. Links\n---\n\n" + link);
  assert.equal(s.detail, noH2);
});

test("hosted validator: #Project with === is still not an H1, and a setext H2 ends the summary scan", async () => {
  const r = await check("#Project\n===\n\n> Summary\n\n## Docs\n\n" + link);
  assert.equal(r.checks.find((c) => c.id === "h1-title").status, "fail");
  // A blockquote after a setext H2 is not read as a late summary of the title.
  const late = await check("# Test\n\nDocs\n----\n\n> not a summary\n\n" + link);
  const sum = late.checks.find((c) => c.id === "summary");
  assert.equal(sum.status, "warn");
  assert.match(sum.detail, /recommended by the format/);
  assert.equal(late.checks.find((c) => c.id === "sections").status, "pass");
});

// ---------------------------------------------------------------- text

test("page text: services reply promise, validator implementation sentence, legal re-scan window and sample dates", async () => {
  const services = await (await get("/services.md")).text();
  assert.ok(services.includes("I reply within one business day. All prices exclude VAT."));
  assert.ok(!services.includes("I acknowledge a new message"));
  const validator = await (await get("/llms-txt-validator.md")).text();
  assert.ok(validator.includes("If you want the findings fixed, [implementation](/services#implementation) is sold with the audit."));
  const legal = await (await get("/legal.md")).text();
  assert.ok(legal.includes("You can report a deviation in an earlier deliverable within 14 calendar days of the included re-scan or retest in which it first shows."));
  assert.ok(legal.includes("**Terms last updated:** 2026-10-03"));
  const audit = await (await get("/samples/audit-report.md")).text();
  assert.ok(audit.includes("This page itself was last revised on 3 October 2026."));
  assert.ok(audit.includes("today each page weighs between 188 kB and 340 kB of markup"));
  assert.ok(!audit.includes("more than 200 kB"));
  const shop = await (await get("/samples/shopify-agent-storefront-check.md")).text();
  assert.ok(shop.includes("This page itself was last revised on 2 October 2026."));
  const parity = await (await get("/markdown-parity-check.md")).text();
  assert.ok(parity.includes("That page passed again on 2 October 2026."));
});
