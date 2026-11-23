import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

// Regression tests for the masking leaks of the C1c outside run (V1) and the K2 reading (K2-F1), and for the setext title
// of the K2 plan (n1, P14), all of 2026-11-22/23 (decision Tek-898). V1: a Location header reaches the code as one code
// unit per byte, so a leading U+3000, U+00A0 or U+200B written as UTF-8 bytes was not an edge character and the followed
// address showed the password. K2-F1: an invisible first character in front of "//user:password@host" was not removed.
// n1: a setext H1 whose text renders nothing passed. Each case gave the other answer in 3.260.9. The package
// turva-llms-txt-validator carries the same cases in test/mask-2026-11-23.test.ts and test/k2-2026-11-23.test.ts. The route
// is reached the way test/redirect-2026-11-22.test.ts reaches it. CANARY is a made-up value, no real secret. Characters
// outside printable ASCII are built with String.fromCodePoint, so this file stays ASCII.

const BS = String.fromCharCode(92);
const CANARY = "CANARYPWD7f3a";
const PAGE = "# Example\n\n> Summary\n\n## Docs\n\n- [A](https://example.com/a): one\n";
const HOME = "<!doctype html><html><head></head><body></body></html>";
const cp = (n: number) => String.fromCodePoint(n);
const asHeader = (s: string) => Buffer.from(s, "utf8").toString("latin1");

function mockFetch(locations: string[], page = PAGE) {
  const queue = [...locations];
  return async (input: string | URL | Request) => {
    const u = new URL(typeof input === "string" ? input : (input as Request).url);
    if (u.pathname === "/") return new Response(HOME, { status: 200, headers: { "content-type": "text/html" } });
    const loc = queue.shift();
    if (loc !== undefined) return new Response(null, { status: 302, headers: { location: loc } });
    return new Response(page, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
  };
}

async function call(typed: string, locations: string[], accept: string, page = PAGE) {
  const orig = globalThis.fetch;
  globalThis.fetch = mockFetch(locations, page) as typeof fetch;
  try {
    const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent(typed), { headers: { accept } }), {}, {});
    return { status: res.status, text: await res.text() };
  } finally {
    globalThis.fetch = orig;
  }
}

function checkOf(text: string, id: string): { id: string; status: string; detail: string; value?: string } | undefined {
  const body = JSON.parse(text);
  return body.checks.find((c: { id: string }) => c.id === id);
}

// QA-1 of the same round: one byte that is not valid UTF-8 made the masking read the Location as it arrived, where a
// multi-byte invisible lead is not an edge character, and the password was shown.
test("V1: an invalid UTF-8 byte in the Location does not bring the password back behind a multi-byte invisible lead", async () => {
  const bad = String.fromCharCode(0xff);
  for (const n of [0x3000, 0xa0, 0x200b, 0x200e, 0xad, 0xfeff, 0x2060, 0xe0001, 0x3164, 0x2800]) {
    const form = asHeader("//user:" + CANARY + "@example.com/x");
    for (const loc of [asHeader(cp(n)) + form + bad, bad + asHeader(cp(n)) + form, asHeader(cp(n)) + bad + form]) {
      const json = await call("example.com", [loc], "application/json");
      assert.ok(!json.text.includes(CANARY), "json U+" + n.toString(16));
      const html = await call("example.com", [loc], "text/html");
      assert.ok(!html.text.includes(CANARY), "page U+" + n.toString(16));
    }
  }
});

test("V1: a Location written as UTF-8 bytes with an invisible first character is masked like the same Location without it", async () => {
  for (const n of [0x3000, 0xa0, 0x200b, 0x200e, 0xad, 0x2028, 0xfeff, 0x2003, 0x2060, 0x180e]) {
    const loc = asHeader(cp(n) + "/" + BS + "erik:" + CANARY + "@example.com/p");
    const json = await call("example.com", [loc], "application/json");
    const status = checkOf(json.text, "http-status")!;
    assert.equal(status.status, "pass", "U+" + n.toString(16));
    assert.equal(status.detail, "HTTP 200, followed a redirect from https://example.com/llms.txt to https://example.com/***", "U+" + n.toString(16));
    assert.ok(!json.text.includes(CANARY), "json U+" + n.toString(16));
    const html = await call("example.com", [loc], "text/html");
    assert.ok(!html.text.includes(CANARY), "page U+" + n.toString(16));
  }
});

test("V1: a refused Location written as UTF-8 bytes with an invisible first character does not show the password", async () => {
  for (const n of [0x3000, 0xa0, 0x200e, 0xad]) {
    for (const tail of ["https://user:" + CANARY + "@other.example/x", "//user:" + CANARY + "@other.example/x", "http://user:" + CANARY + "@example.com/x"]) {
      const json = await call("example.com", [asHeader(cp(n) + tail)], "application/json");
      assert.ok(!json.text.includes(CANARY), "U+" + n.toString(16) + " " + tail);
    }
  }
});

test("V1: a Location that is not valid UTF-8 is read as it arrived and still followed", async () => {
  const json = await call("example.com", ["/caf" + String.fromCharCode(0xe9) + "/x"], "application/json");
  const status = checkOf(json.text, "http-status")!;
  assert.equal(status.status, "pass");
  assert.equal(status.detail, "HTTP 200, followed a redirect from https://example.com/llms.txt to https://example.com/caf%C3%A9/x");
  // An invalid byte before the first or after the last ASCII character is read as an edge character, so the address is
  // shown as the masked form, still followed.
  const edge = await call("example.com", [String.fromCharCode(0xe9) + "/x"], "application/json");
  assert.equal(checkOf(edge.text, "http-status")!.detail, "HTTP 200, followed a redirect from https://example.com/llms.txt to https://example.com/***");
});

test("K2-F1: a typed address with an invisible first character in front of //user:password@host does not show the password", async () => {
  for (const n of [0x200e, 0xad, 0x2060, 0x80, 0x7f, 0x61c, 0x2066, 0x200d, 0xe0001, 0x3164, 0x2800, 0x3000, 0xfeff]) {
    for (const accept of ["application/json", "text/html", "text/markdown"]) {
      const typed = cp(n) + "//user:" + CANARY + "@host.example";
      const r = await call(typed, [], accept);
      assert.ok(!r.text.includes(CANARY), "U+" + n.toString(16) + " " + accept);
    }
  }
});

test("n1: a setext H1 whose text renders nothing fails like the same text after #", async () => {
  const body = "\n\n> Summary\n\n## Docs\n\n- [A](https://example.com/a): one\n";
  const failing = ["&#32;\n=====", "&#32;&#32;\n=====", "` `\n=====", "&#32;\n=", "  &#32;\n  ===  "];
  for (const head of failing) {
    const r = await call("example.com", [], "application/json", head + body);
    const h1 = checkOf(r.text, "h1-title")!;
    assert.equal(h1.status, "fail", JSON.stringify(head));
    assert.equal(h1.detail, "the H1 has no text. The format requires the project name there", JSON.stringify(head));
  }
  // The controls: the ATX forms of the same text fail as before, and real titles pass.
  for (const [head, status] of [["# &#32;", "fail"], ["# Example", "pass"], ["Example\n=====", "pass"], ["   \n=====", "fail"]] as const) {
    const r = await call("example.com", [], "application/json", head + body);
    assert.equal(checkOf(r.text, "h1-title")!.status, status, JSON.stringify(head));
  }
});
