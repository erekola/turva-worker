import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

// Poppy discovery (Tek-926): /.well-known/poppy.json serves the website-only form of the Personal
// Agent Protocol 0.1 document. There is no apis or agent field, because the spec requires every
// listed API to accept Poppy Session tokens and an OAuth issuer for apis or agent, and turva handles
// no such tokens and has no working issuer. These tests pin the exact body so a field cannot be added without a decision.
const env = {};
const get = (path: string, init: RequestInit = {}) =>
  worker.fetch(new Request("https://turva.dev" + path, init), env, {});

test("GET answers 200 application/json with exactly the website-only document", async () => {
  const r = await get("/.well-known/poppy.json");
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "application/json; charset=utf-8");
  const doc = JSON.parse(await r.text());
  assert.deepEqual(doc, {
    protocol_version: "0.1",
    organization: { name: "turva.dev", domain: "turva.dev" },
    web: {},
  });
  assert.equal(doc.organization.domain, "turva.dev", "the organization domain is the host the request went to");
  assert.ok(!("apis" in doc) && !("agent" in doc) && !("auth" in doc), "no apis, agent or auth field");
});

test("HEAD answers 200 with the same content type and an empty body", async () => {
  const r = await get("/.well-known/poppy.json", { method: "HEAD" });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "application/json; charset=utf-8");
  assert.equal(await r.text(), "");
});

test("the weak ETag is present and If-None-Match gives 304 without a redirect", async () => {
  const first = await get("/.well-known/poppy.json");
  const etag = first.headers.get("etag");
  assert.ok(etag && etag.startsWith("W/"), "a weak ETag is present");
  assert.ok(!first.redirected && first.status === 200, "no redirect");
  const again = await get("/.well-known/poppy.json", { headers: { "if-none-match": etag! } });
  assert.equal(again.status, 304);
});

test("the document is declared in the OpenAPI spec", async () => {
  const spec = JSON.parse(await (await get("/openapi.json")).text());
  assert.ok(spec.paths["/.well-known/poppy.json"]?.get, "GET /.well-known/poppy.json is declared");
});
