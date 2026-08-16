import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";
import { readFileSync } from "node:fs";

// facts.json owns which services exist. The service count used to be written into this
// file by hand, as `>= 5` with a message saying "all five offerings", so it was wrong by
// one and loose in the direction that matters: a service dropping out of the A2A answer
// still passed. Corrected 2026-08-16 (round 12, batch E16, finding B2-18).
const facts = JSON.parse(readFileSync(new URL("../../tools/facts.json", import.meta.url), "utf8"));

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
    // A POST-only endpoint answers 405 to a GET, which is a resolving path rather than a
    // missing one. Probing it with its own method keeps this gate meaningful for both kinds:
    // an undeclared or dead path still fails, because the HTML 404 is neither 200 nor 402.
    const r = u.pathname.endsWith(":send")
      ? await worker.fetch(new Request(u.toString(), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: { role: "user", parts: [], messageId: "idx" } })
        }), env, {})
      : await get(u.pathname);
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

// A2A: the agent card declared url + HTTP+JSON transport and three skills while nothing
// answered on that transport at all, so a POST got the homepage HTML. Found by the monthly
// credibility audit 2026-08-01. These cases bind three things that had drifted apart: the
// card's url, the card's skill descriptions, and the data the endpoint actually returns.
// A first version asserted only that some object came back, and a mutation test that swapped
// the contact and company payloads passed it, so every skill now asserts content unique to it.
const a2aSend = (body) => worker.fetch(new Request("https://turva.dev/v1/message:send", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body)
}), env, {});

test("A2A: the transport the card declares answers, in the envelope the spec defines", async () => {
  const card = await (await get("/.well-known/agent-card.json")).json();
  assert.equal(card.preferredTransport, "HTTP+JSON");
  assert.equal(new URL(card.url).pathname.replace(/\/$/, ""), "", "card url is the transport base");
  const res = await a2aSend({ message: { role: "user", parts: [{ kind: "text", text: "services" }], messageId: "t1" } });
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /application\/json/);
  const body = await res.json();
  // Spec 0.3.0 REST binding: the response is { message?, task? }, not a bare Message.
  assert.equal(body.kind, undefined, "a bare Message hands a conformant client undefined");
  assert.equal(body.message.kind, "message");
  assert.equal(body.message.role, "agent");
  assert.ok(body.message.messageId);
  assert.deepEqual(body.message.metadata.skills, ["services"]);
});

test("A2A: every skill the card declares returns the data its own description promises", async () => {
  const card = await (await get("/.well-known/agent-card.json")).json();
  const byId = Object.fromEntries(card.skills.map((s) => [s.id, s]));
  assert.deepEqual(Object.keys(byId).sort(), ["company-info", "contact-info", "services"]);
  const dataFor = async (id) => {
    const r = await a2aSend({ message: { role: "user", parts: [], messageId: "t", metadata: { skillId: id } } });
    assert.equal(r.status, 200, id + " must resolve");
    const b = await r.json();
    assert.deepEqual(b.message.metadata.skills, [id]);
    assert.equal(b.message.parts.length, 1);
    assert.equal(b.message.parts[0].kind, "data");
    return b.message.parts[0].data;
  };

  const services = await dataFor("services");
  assert.equal(services.skill, "services");
  assert.ok(Array.isArray(services.services), "services answers with a list");
  assert.equal(services.services.length, facts.services.length, "every offering facts.json names");
  assert.ok(services.engagement.length > 10);
  assert.equal(services.businessId, undefined, "services must not answer with the company payload");

  // The card promises email, Signal, LinkedIn and the business ID here, so the test reads the
  // card's own description and requires each named channel to come back.
  const contact = await dataFor("contact-info");
  assert.equal(contact.skill, "contact-info");
  const desc = byId["contact-info"].description.toLowerCase();
  for (const named of ["email", "signal", "linkedin", "business id"]) {
    assert.ok(desc.includes(named), "card still promises " + named);
  }
  assert.match(contact.email, /@turva\.dev$/);
  assert.match(contact.signal, /^https:\/\/signal\.me\//);
  assert.match(contact.linkedin, /linkedin\.com/);
  assert.match(contact.businessId, /^\d{7}-\d$/);

  const company = await dataFor("company-info");
  assert.equal(company.skill, "company-info");
  assert.ok(company.founder && company.description && Array.isArray(company.sameAs));
  assert.equal(company.email, undefined, "company must not answer with the contact payload");
});

test("A2A: wrong method, bad body, unknown skill and unknown method all answer as JSON", async () => {
  const g = await get("/v1/message:send");
  assert.equal(g.status, 405);
  assert.equal(g.headers.get("allow"), "POST, OPTIONS");
  assert.match(g.headers.get("content-type"), /application\/json/);

  const bad = await a2aSend({});
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).error.code, -32602);

  // A named skill that does not exist is an error, not a silent success that returns everything.
  const unknownSkill = await a2aSend({ message: { role: "user", parts: [], messageId: "t", metadata: { skillId: "nope" } } });
  assert.equal(unknownSkill.status, 400);
  const us = await unknownSkill.json();
  assert.equal(us.error.code, -32602);
  assert.deepEqual(us.error.data.skills, ["services", "contact-info", "company-info"]);

  // A deeply nested array used to reach String() and throw RangeError out of the handler,
  // answering 500 to an 8 kB body. Only a string is accepted now.
  let deep = [];
  for (let i = 0; i < 4000; i++) deep = [deep];
  const nested = await a2aSend({ message: { role: "user", parts: [], messageId: "t", metadata: { skillId: deep } } });
  assert.equal(nested.status, 200, "a non-string skillId must not crash the handler");

  const unknown = await get("/v1/tasks/get");
  assert.equal(unknown.status, 404);
  const u = await unknown.json();
  assert.equal(u.error.code, -32601);
  assert.ok(u.error.data.supported.includes("POST /v1/message:send"));

  // /v1/card is the authenticated extended card and this card declares no support for it.
  const cardRoute = await get("/v1/card");
  assert.equal(cardRoute.status, 404);

  const pre = await worker.fetch(new Request("https://turva.dev/v1/message:send", { method: "OPTIONS" }), env, {});
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get("access-control-allow-methods"), "POST, OPTIONS");

  const slash = await get("/v1/message:send/");
  assert.equal(slash.status, 301);
});
