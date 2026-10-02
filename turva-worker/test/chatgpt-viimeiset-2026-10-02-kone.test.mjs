import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";

// ChatGPT last read 2026-10-02 (W5 V-1, W6 F01, F08, F09, F10): the hosted validator's HTML check,
// the ai-catalog MCP media type, the root security.txt Canonical lines, representativeQueries on
// ard.json only, and the RFC 9727 profile parameter on the api-catalog.

const base = "# Example\n\n> Summary.\n\n## Docs\n\n- [Guide](https://example.com/guide)\n";

async function noHtmlStatus(llms) {
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
    const body = JSON.parse(await res.text());
    return body.checks.find((c) => c.id === "no-html").status;
  } finally {
    globalThis.fetch = realFetch;
  }
}

test("validator HTML check: self-closing tags, closing tags and comments warn", async () => {
  for (const t of ["<br/>", "<hr/>", "<br />", "</div>", "<!-- x -->", "<div>hi</div>", "<img src=\"x\"/>"]) {
    assert.equal(await noHtmlStatus(base + "\n" + t + "\n"), "warn", t);
  }
});

test("validator HTML check: autolinks and plain prose still pass", async () => {
  for (const t of ["<https://example.com>", "<mailto:a@example.com>", "a < b and c > d", "x<3"]) {
    assert.equal(await noHtmlStatus(base + "\n" + t + "\n"), "pass", t);
  }
  assert.equal(await noHtmlStatus(base), "pass");
});

async function getJson(path) {
  const res = await worker.fetch(new Request("https://turva.dev" + path), {});
  assert.equal(res.status, 200, path);
  return { res, body: JSON.parse(await res.text()) };
}

test("ai-catalog and ard.json type the MCP entry application/mcp-server-card+json", async () => {
  for (const path of ["/.well-known/ai-catalog.json", "/.well-known/ard.json"]) {
    const { body } = await getJson(path);
    const mcp = body.entries.find((e) => e.identifier === "urn:air:turva.dev:mcp-server:turva-mcp");
    assert.equal(mcp.type, "application/mcp-server-card+json", path);
  }
});

test("representativeQueries are on ard.json only, 2 to 5 per entry", async () => {
  const ai = (await getJson("/.well-known/ai-catalog.json")).body;
  const ard = (await getJson("/.well-known/ard.json")).body;
  for (const e of ai.entries) assert.equal(e.representativeQueries, undefined, e.identifier);
  assert.equal(ard.entries.length, ai.entries.length);
  for (const e of ard.entries) {
    assert.ok(Array.isArray(e.representativeQueries), e.identifier);
    assert.ok(e.representativeQueries.length >= 2 && e.representativeQueries.length <= 5, e.identifier);
  }
});

test("security.txt names both retrieval URLs as Canonical", async () => {
  for (const path of ["/security.txt", "/.well-known/security.txt"]) {
    const res = await worker.fetch(new Request("https://turva.dev" + path), {});
    const txt = await res.text();
    assert.match(txt, /^Canonical: https:\/\/turva\.dev\/security\.txt$/m, path);
    assert.match(txt, /^Canonical: https:\/\/turva\.dev\/\.well-known\/security\.txt$/m, path);
  }
});

test("api-catalog Content-Type carries the RFC 9727 profile", async () => {
  const { res } = await getJson("/.well-known/api-catalog");
  const ct = res.headers.get("content-type");
  assert.match(ct, /^application\/linkset\+json/);
  assert.match(ct, /profile="https:\/\/www\.rfc-editor\.org\/info\/rfc9727"/);
});
