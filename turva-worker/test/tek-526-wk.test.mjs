import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";

// Regression tests for the Wk batch of Tek-526 (korjausohje, vaihe 2, 2026-09-28):
// A1 (V01 N01), A3 (V01 N02) and the worker.js side of decision 19 (T2-01, T2-02).
// These fail until työt/astra-uusinta-2026-09-28/paikat/Wk.py has been applied to
// src/worker.js; run with `node --test test/tek-526-wk.test.mjs` from
// turva-worker/turva-worker after the patch lands, or bare `node --test` to run
// the whole suite.

const env = {};

async function validatorJson(rawQuery) {
  const res = await worker.fetch(
    new Request("https://turva.dev/llms-txt-validator?" + rawQuery, { headers: { accept: "application/json" } }),
    env,
    {}
  );
  return { status: res.status, body: JSON.parse(await res.text()) };
}

test("A1 V01 N01: a long run of tabs cannot survive the 300 character cut and slip .invalid off the end", async () => {
  // Before the fix, cut() ran on the raw typed string, so a run of tab characters filled
  // the whole 300-unit window and ".invalid" was chopped off before normalizeHostInput ever
  // saw it. The URL parser then stripped the surviving tabs on its own and validated
  // turva.dev, although what was typed named a .invalid host.
  const evil = "https://turva.dev" + "\t".repeat(283) + ".invalid";
  const { status, body } = await validatorJson("url=" + encodeURIComponent(evil));
  assert.equal(status, 400, "an address that names a banned TLD must not validate");
  assert.notEqual(body.target, "https://turva.dev/llms.txt", "must not validate turva.dev's own file");
  assert.ok(body.error, "must report an error instead of silently validating turva.dev");
});

test("A1 V01 N01: CR and LF are stripped the same way as tab, and a short tab-padded input still resolves the real host", async () => {
  for (const pad of ["\t".repeat(10), "\r".repeat(10), "\n".repeat(10)]) {
    const evil = "https://turva.dev" + pad + ".invalid";
    const { body } = await validatorJson("url=" + encodeURIComponent(evil));
    assert.notEqual(body.target, "https://turva.dev/llms.txt", JSON.stringify(pad));
  }
  // A short, harmless run of tabs around a real address still normalizes and validates it,
  // so the fix is a strip, not a blanket refusal of every control character.
  const { body: ownBody } = await validatorJson("url=" + encodeURIComponent("\t\tturva.dev\t\t"));
  assert.equal(ownBody.target, "https://turva.dev/llms.txt");
});

test("A3 V01 N02: OPTIONS preflights on /llms-txt-validator, /index.md and /services.md, GET, OPTIONS only", async () => {
  for (const path of ["/llms-txt-validator", "/index.md", "/services.md"]) {
    const r = await worker.fetch(new Request("https://turva.dev" + path, { method: "OPTIONS" }), env, {});
    assert.equal(r.status, 204, path + " must answer 204 to OPTIONS");
    assert.equal(r.headers.get("access-control-allow-methods"), "GET, OPTIONS", path + " is GET-only, like /openapi.json and /llms.txt");
    assert.equal(r.headers.get("access-control-allow-origin"), "*", path);
    assert.ok(r.headers.get("access-control-max-age"), path + " carries access-control-max-age");
  }
  // The allow list (the METHOD GATE a few lines below the preflight list) and the preflight
  // list now agree for these three paths: POST is not advertised in the preflight and a POST
  // to any of them still answers 405 with the same GET, HEAD, OPTIONS set.
  for (const path of ["/llms-txt-validator", "/index.md", "/services.md"]) {
    const r = await worker.fetch(new Request("https://turva.dev" + path, { method: "POST" }), env, {});
    assert.equal(r.status, 405, path);
    assert.equal(r.headers.get("allow"), "GET, HEAD, OPTIONS", path);
  }
});

test("Decision 19, T2-01: the entered-path check puts the typed path in its own value field, and the sentence stays generic", async () => {
  const { body } = await validatorJson("url=" + encodeURIComponent("turva.dev/some/odd/path"));
  const chk = body.checks.find((c) => c.id === "input-path");
  assert.ok(chk, "the input-path information check must be present");
  assert.equal(chk.value, "/some/odd/path", "the raw path belongs in its own field");
  assert.ok(!chk.detail.includes("/some/odd/path"), "the sentence must not carry the raw path");
  assert.match(chk.detail, /^This path is not used/, "the sentence is the same for every address");
});

test("Decision 19, T2-01: the value field still shows in the HTML view, escaped", async () => {
  const res = await worker.fetch(
    new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent('turva.dev/<script>x</script>'), { headers: { accept: "text/html" } }),
    env,
    {}
  );
  const html = await res.text();
  assert.ok(!html.includes("<script>x</script>"), "the reflected path must never open a real tag");
  assert.ok(html.includes("&lt;script&gt;x&lt;/script&gt;"), "the escaped path still appears in the result row");
});

test("Decision 19, T2-02: an invalid CSS selector on the parity check is not repeated inside the error sentence", async () => {
  const limiter = { async limit() { return { success: true }; } };
  const res = await worker.fetch(
    new Request("https://turva.dev/markdown-parity-check", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "cf-connecting-ip": "203.0.113.50" },
      body: JSON.stringify({ url: "https://turva.dev/tools", selector: '[data-vv="not a valid selector' })
    }),
    { PARITY_LIMITER: limiter },
    {}
  );
  assert.equal(res.status, 422);
  const j = JSON.parse(await res.text());
  assert.ok(!j.summary.error.includes('[data-vv='), "the sentence must not carry the raw selector");
  assert.equal(j.summary.errorValue, '[data-vv="not a valid selector', "the raw selector belongs in its own field");
  assert.equal(j.summary.value, undefined, "the field carries the package's own name, errorValue");
});

test("Decision 19, T2-03: a valid selector that matches nothing is reported on the selector field, with its value apart", async () => {
  const limiter = { async limit() { return { success: true }; } };
  const res = await worker.fetch(
    new Request("https://turva.dev/markdown-parity-check", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "cf-connecting-ip": "203.0.113.51" },
      body: JSON.stringify({ url: "https://turva.dev/tools", selector: "#no-such-element-t2-03" })
    }),
    { PARITY_LIMITER: limiter },
    {}
  );
  assert.equal(res.status, 422);
  const j = JSON.parse(await res.text());
  assert.equal(j.summary.error, "The CSS selector matched nothing on the page. Clear it to compare the default content.");
  assert.equal(j.summary.errorValue, "#no-such-element-t2-03");
});

// Tek-561 (W20 F2b): a selector that is not valid CSS and one that matches nothing get two different fixed sentences.
test("W20 F2b: an invalid selector is told apart from one that matches nothing, with the value apart", async () => {
  const limiter = { async limit() { return { success: true }; } };
  const res = await worker.fetch(
    new Request("https://turva.dev/markdown-parity-check", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "cf-connecting-ip": "203.0.113.52" },
      body: JSON.stringify({ url: "https://turva.dev/tools", selector: "[" })
    }),
    { PARITY_LIMITER: limiter },
    {}
  );
  assert.equal(res.status, 422);
  const j = JSON.parse(await res.text());
  assert.equal(j.summary.error, "The CSS selector is not valid.");
  assert.equal(j.summary.errorValue, "[");
});

// Tek-561 (W20 F2a): an address that names a port gets its own fixed sentence, in JSON and in the page, and the
// set of accepted addresses does not change: a port other than 443 or 80 is still refused, 443 and 80 still pass.
test("W20 F2a: an address with a port names the port, and no other rejection changes its sentence", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("must not be called for a refused host"); };
  try {
    for (const bad of ["https://turva.dev:invalid/", "turva.dev:8443", "https://example.com:8443/llms.txt", "user:pw@example.com:81"]) {
      const j = await validatorJson("url=" + encodeURIComponent(bad));
      assert.equal(j.status, 400, bad);
      assert.equal(j.body.error, "That address names a port. Enter the domain alone, like example.com.", bad);
      const html = await (await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent(bad), { headers: { accept: "text/html" } }), env, {})).text();
      assert.ok(html.includes("That address names a port. Enter the domain alone, like example.com."), "the page carries the same sentence: " + bad);
    }
    for (const other of ["localhost", "user:pw@example.com", "foo..bar", "router.home.arpa"]) {
      const j = await validatorJson("url=" + encodeURIComponent(other));
      assert.equal(j.status, 400, other);
      assert.equal(j.body.error, "That does not look like a public domain name. Enter a domain like example.com.", other);
    }
  } finally {
    globalThis.fetch = realFetch;
  }
});

// Tek-561 (W20 F1): the form returns to the result, as the parity form does.
test("W20 F1: the validator form submits to the result fragment", async () => {
  const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator", { headers: { accept: "text/html" } }), env, {});
  const html = await res.text();
  assert.ok(html.includes('action="/llms-txt-validator#result"'));
});
