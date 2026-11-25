import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, verify as edVerify } from "node:crypto";
import type { KeyObject } from "node:crypto";
import worker from "../src/worker.ts";

// Tek-910: Web Bot Auth. The hosted validator signs every request it sends to the checked site, serves its key
// directory signed, and limits itself with two fail-closed rate limits. The tests generate a key pair with node:crypto,
// pass the private JWK as the Worker secret WBA_SIGNING_KEY, capture the outbound requests by replacing
// globalThis.fetch, rebuild the RFC 9421 signature base by hand and verify the signatures with node:crypto, so the
// Worker's WebCrypto signing is checked by an independent implementation.

const DIRECTORY = "https://turva.dev/.well-known/http-message-signatures-directory";
const LLMS = "# Site\n> Summary\n\n## Docs\n- [Doc](https://example.com/doc)\n";

const pair = generateKeyPairSync("ed25519");
const privJwk = pair.privateKey.export({ format: "jwk" }) as { kty: string; crv: string; x: string; d: string };
const pubJwk = pair.publicKey.export({ format: "jwk" }) as { x: string };
const thumbprint = createHash("sha256").update(`{"crv":"Ed25519","kty":"OKP","x":"${pubJwk.x}"}`).digest("base64url");
const allow = { limit: async (_o: { key: string }) => ({ success: true }) };

function envWith(extra: Record<string, unknown> = {}, withKey = true) {
  return { VALIDATOR_LIMITER: allow, VALIDATOR_HOST_LIMITER: allow, ...(withKey ? { WBA_SIGNING_KEY: JSON.stringify(privJwk) } : {}), ...extra } as never;
}

type Call = { url: string; headers: Headers };

async function validate(env: never, typed = "example.com", redirectFirst = false, accept = "application/json"): Promise<{ res: Response; calls: Call[] }> {
  const calls: Call[] = [];
  const real = globalThis.fetch;
  globalThis.fetch = (async (input: unknown, init?: { headers?: HeadersInit }) => {
    const url = String(input);
    calls.push({ url, headers: new Headers(init && init.headers) });
    if (redirectFirst && url === "https://example.com/llms.txt") return new Response(null, { status: 301, headers: { location: "https://www.example.com/llms.txt" } });
    if (url.endsWith("/llms.txt")) return new Response(LLMS, { headers: { "content-type": "text/plain" } });
    return new Response("<html><head></head><body></body></html>", { headers: { "content-type": "text/html" } });
  }) as typeof fetch;
  try {
    const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent(typed), { headers: { accept, "cf-connecting-ip": "203.0.113.9" } }), env, {});
    return { res, calls };
  } finally { globalThis.fetch = real; }
}

const SIGINPUT_RE = /^sig1=\("@authority" "signature-agent"\);created=(\d+);keyid="([^"]+)";alg="ed25519";expires=(\d+);nonce="([A-Za-z0-9+/]{43}=)";tag="web-bot-auth"$/;

// Rebuilds the signature base of RFC 9421 section 2.5 for one captured request and verifies the signature.
function checkSignedRequest(call: Call, pub: KeyObject = pair.publicKey): string {
  const h = call.headers;
  assert.equal(h.get("signature-agent"), "\"https://turva.dev\"", call.url);
  const input = h.get("signature-input") || "";
  const m = SIGINPUT_RE.exec(input);
  assert.ok(m, "Signature-Input has exactly the specified shape: " + input);
  assert.equal(Number(m![3]) - Number(m![1]), 60, "expires is created plus 60");
  assert.equal(m![2], thumbprint, "keyid is the RFC 7638 thumbprint");
  assert.ok(!/;key=/.test(input) && !/;req/.test(input), "no key or req parameter in a request signature");
  const sm = /^sig1=:([A-Za-z0-9+/]{86}==):$/.exec(h.get("signature") || "");
  assert.ok(sm, "Signature is sig1 and one 64 byte value in standard base64: " + h.get("signature"));
  const params = input.slice("sig1=".length);
  const base = "\"@authority\": " + new URL(call.url).host + "\n\"signature-agent\": \"https://turva.dev\"\n\"@signature-params\": " + params;
  assert.ok(edVerify(null, Buffer.from(base, "utf8"), pub, Buffer.from(sm![1], "base64")), "the signature verifies over the rebuilt base for " + call.url);
  return m![4];
}

test("every request of a validation is signed, and the signature verifies against the public key", async () => {
  const { res, calls } = await validate(envWith());
  assert.equal(res.status, 200);
  assert.deepEqual(calls.map((c) => c.url), ["https://example.com/llms.txt", "https://example.com/"]);
  const nonces = calls.map((c) => checkSignedRequest(c));
  assert.notEqual(nonces[0], nonces[1], "each request has a fresh nonce");
  for (const c of calls) assert.equal(c.headers.get("user-agent"), "turva-llms-txt-validator (+https://turva.dev/llms-txt-validator)");
});

test("a same-host redirect is signed again for the authority of the next hop", async () => {
  const { res, calls } = await validate(envWith(), "example.com", true);
  assert.equal(res.status, 200);
  assert.deepEqual(calls.map((c) => c.url), ["https://example.com/llms.txt", "https://www.example.com/llms.txt", "https://example.com/"]);
  for (const c of calls) checkSignedRequest(c);
  // A signature made for one authority does not verify for another: the base of hop 2 cannot be reused for hop 1.
  assert.notEqual(calls[0].headers.get("signature"), calls[1].headers.get("signature"));
});

test("without a usable key the validator fetches unsigned and the directory answers 503", async () => {
  const bad = ["", "not json", JSON.stringify({ kty: "OKP", crv: "Ed25519", x: pubJwk.x }), JSON.stringify({ ...privJwk, d: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" })];
  for (const secret of [undefined, ...bad]) {
    const env = envWith(secret === undefined ? {} : { WBA_SIGNING_KEY: secret }, false);
    const { res, calls } = await validate(env);
    assert.equal(res.status, 200, String(secret));
    assert.equal(calls.length, 2);
    for (const c of calls) for (const name of ["signature", "signature-input", "signature-agent"]) assert.equal(c.headers.get(name), null, name);
    const dir = await worker.fetch(new Request(DIRECTORY), env, {});
    assert.equal(dir.status, 503);
    assert.equal(dir.headers.get("cache-control"), "no-store");
    assert.ok(!(await dir.text()).includes(privJwk.d));
  }
});

test("the key directory: media type, digest, signed over the request authority and the digest, kid is the thumbprint", async () => {
  const res = await worker.fetch(new Request(DIRECTORY, { headers: { accept: "application/http-message-signatures-directory+json" } }), envWith(), {});
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "application/http-message-signatures-directory+json");
  assert.equal(res.headers.get("cache-control"), "public, max-age=3600");
  const body = await res.text();
  assert.equal(body, JSON.stringify({ keys: [{ kty: "OKP", crv: "Ed25519", x: pubJwk.x, kid: thumbprint, use: "sig" }] }));
  assert.ok(!body.includes(privJwk.d) && !body.includes("\"d\""), "the private part is not in the directory");
  // WebCrypto, not createHash: CodeQL's crypto model reads createHash over served bytes as a password hash (mds/gotchas.md 2026-10-03 (jatko 1)).
  const digest = "sha-256=:" + Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body))).toString("base64") + ":";
  assert.equal(res.headers.get("content-digest"), digest);
  const input = res.headers.get("signature-input") || "";
  const m = /^sig1=\("@authority";req "content-digest"\);alg="ed25519";keyid="([^"]+)";nonce="([A-Za-z0-9+/]{43}=)";tag="http-message-signatures-directory";created=(\d+);expires=(\d+)$/.exec(input);
  assert.ok(m, "Signature-Input of the directory: " + input);
  assert.equal(m![1], thumbprint);
  assert.equal(Number(m![4]) - Number(m![3]), 86400);
  const sm = /^sig1=:([A-Za-z0-9+/]{86}==):$/.exec(res.headers.get("signature") || "");
  assert.ok(sm, "Signature of the directory");
  const base = "\"@authority\";req: turva.dev\n\"content-digest\": " + digest + "\n\"@signature-params\": " + input.slice("sig1=".length);
  assert.ok(edVerify(null, Buffer.from(base, "utf8"), pair.publicKey, Buffer.from(sm![1], "base64")), "the directory signature verifies");
  // The signed authority is the one the request named, so a copy of the response cannot vouch for another host.
  const wrong = base.replace("turva.dev", "example.org");
  assert.ok(!edVerify(null, Buffer.from(wrong, "utf8"), pair.publicKey, Buffer.from(sm![1], "base64")));
  const head = await worker.fetch(new Request(DIRECTORY, { method: "HEAD" }), envWith(), {});
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  assert.equal(head.headers.get("content-type"), "application/http-message-signatures-directory+json");
});

test("the validator limiters fail closed: a missing binding or a limiter that throws is 503, a refusal is 429, and nothing is fetched", async () => {
  const deny = { limit: async () => ({ success: false }) };
  const boom = { limit: async () => { throw new Error("limiter down"); } };
  const cases: Array<[string, Record<string, unknown>, number]> = [
    ["no VALIDATOR_LIMITER", { VALIDATOR_LIMITER: undefined }, 503],
    ["no VALIDATOR_HOST_LIMITER", { VALIDATOR_HOST_LIMITER: undefined }, 503],
    ["visitor limit refuses", { VALIDATOR_LIMITER: deny }, 429],
    ["host limit refuses", { VALIDATOR_HOST_LIMITER: deny }, 429],
    ["visitor limiter throws", { VALIDATOR_LIMITER: boom }, 503],
    ["host limiter throws", { VALIDATOR_HOST_LIMITER: boom }, 503]
  ];
  for (const withKey of [true, false]) {
    for (const [label, extra, status] of cases) {
      for (const accept of ["application/json", "text/html"]) {
        const { res, calls } = await validate(envWith(extra, withKey), "example.com", false, accept);
        const where = label + ", key " + withKey + ", " + accept;
        assert.equal(res.status, status, where);
        assert.equal(calls.length, 0, "no outbound fetch: " + where);
        assert.equal(res.headers.get("cache-control"), "no-store", where);
        assert.equal(res.headers.get("retry-after"), status === 429 ? "60" : null, where);
        const text = await res.text();
        assert.ok(/rate limiter|Too many validations/.test(text), where);
        if (accept === "application/json") assert.ok(typeof JSON.parse(text).error === "string", where);
        else assert.ok(text.includes("The check could not be completed."), where);
      }
    }
  }
});

test("the host limiter shares one bucket between a site and its www counterpart", async () => {
  const keys: string[] = [];
  const record = { limit: async (o: { key: string }) => { keys.push(o.key); return { success: true }; } };
  await validate(envWith({ VALIDATOR_HOST_LIMITER: record }), "www.example.com");
  await validate(envWith({ VALIDATOR_HOST_LIMITER: record }), "example.com");
  assert.deepEqual(keys, ["valhost:example.com", "valhost:example.com"]);
});

test("the limiters are keyed by visitor address and by checked host, and turva.dev itself is not limited", async () => {
  const keys: string[] = [];
  const record = { limit: async (o: { key: string }) => { keys.push(o.key); return { success: true }; } };
  await validate(envWith({ VALIDATOR_LIMITER: record, VALIDATOR_HOST_LIMITER: record }));
  assert.deepEqual(keys, ["val:203.0.113.9", "valhost:example.com"]);
  keys.length = 0;
  const own = await validate(envWith({ VALIDATOR_LIMITER: undefined, VALIDATOR_HOST_LIMITER: undefined }), "turva.dev");
  assert.equal(own.res.status, 200);
  assert.equal(own.calls.length, 0);
  // A refused address never reaches the limiters either.
  const invalid = await validate(envWith({ VALIDATOR_LIMITER: record, VALIDATOR_HOST_LIMITER: record }), "localhost");
  assert.equal(invalid.res.status, 400);
  assert.deepEqual(keys, []);
});
