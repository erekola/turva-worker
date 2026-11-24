import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";
import { validatorEnv } from "../test-support/validator-env.ts";

// Regression tests for the leaks an independent rerun against site 3.260.7 found on 2026-11-22 (n2, the hosted copy of
// n1, and n7 and n8 in the hosted route): a followed redirect, the unused typed path and the host echoed in the input
// field. Each case gave the other answer in 3.260.8. The package turva-llms-txt-validator carries the same cases in its
// test/redirect-2026-11-22.test.ts. The route is reached the way test/llms-validator-round3.test.ts reaches it, through
// GET /llms-txt-validator with a mocked global fetch. CANARY is a made-up value, no real secret. Characters outside
// printable ASCII are built with String.fromCharCode, so this file stays ASCII.

const BS = String.fromCharCode(92);
const CANARY = "CANARYPWD7f3a";
const PAGE = "# Example\n\n> Summary\n\n## Docs\n\n- [A](https://example.com/a): one\n";
const HOME = "<!doctype html><html><head></head><body></body></html>";

// The first requests for /llms.txt answer with the given Locations in turn; every other request gets the page or the
// home page.
function mockFetch(locations: string[]) {
  const queue = [...locations];
  return async (input: string | URL | Request) => {
    const u = new URL(typeof input === "string" ? input : (input as Request).url);
    if (u.pathname === "/") return new Response(HOME, { status: 200, headers: { "content-type": "text/html" } });
    const loc = queue.shift();
    if (loc !== undefined) return new Response(null, { status: 302, headers: { location: loc } });
    return new Response(PAGE, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
  };
}

async function call(typed: string, locations: string[], accept: string) {
  const orig = globalThis.fetch;
  globalThis.fetch = mockFetch(locations) as typeof fetch;
  try {
    const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent(typed), { headers: { accept } }), validatorEnv(), {});
    return { status: res.status, text: await res.text() };
  } finally {
    globalThis.fetch = orig;
  }
}

function checkOf(text: string, id: string): { id: string; status: string; detail: string; value?: string } | undefined {
  const body = JSON.parse(text);
  return body.checks.find((c: { id: string }) => c.id === id);
}

const HIDING = [
  "user_name:" + CANARY + "@example.com",
  ":" + CANARY + "@e.com",
  "CORP" + BS + "erik:" + CANARY + "@example.com",
  "https:/user:" + CANARY + "@example.com",
  String.fromCharCode(0xa0) + "https://user:" + CANARY + "@example.com/p",
];

test("n2: a followed same-host redirect whose Location reads as user information shows the host and /*** only", async () => {
  for (const loc of HIDING) {
    for (const after of [[], ["?q=1"]]) {
      const json = await call("example.com", [loc, ...after], "application/json");
      const status = checkOf(json.text, "http-status")!;
      assert.equal(status.status, "pass", JSON.stringify(loc));
      assert.equal(status.detail, "HTTP 200, followed a redirect from https://example.com/llms.txt to https://example.com/***", JSON.stringify(loc));
      assert.ok(!json.text.includes(CANARY), JSON.stringify(loc));
      const html = await call("example.com", [loc, ...after], "text/html");
      assert.ok(!html.text.includes(CANARY), "page: " + JSON.stringify(loc));
    }
  }
});

test("n2: a followed redirect that hides nothing is shown as before", async () => {
  const cases: Array<[string[], string]> = [
    [["/docs/llms.txt"], "https://example.com/docs/llms.txt"],
    [["/x?k=v"], "https://example.com/x?k=***"],
    [["/team@example.com"], "https://example.com/team@example.com"],
    // A later Location that keeps nothing of a hidden address clears the mark.
    [["user_name:" + CANARY + "@example.com", "/x?k=v"], "https://example.com/x?k=***"],
    [["CORP" + BS + "erik:" + CANARY + "@example.com", "https://www.example.com/llms.txt"], "https://www.example.com/llms.txt"],
    // A later .. keeps the mark while hidden segments stay (F1 of the seventh check), and clears it once none do.
    [["https:/user:" + CANARY + "@example.com/q/r/s", ".."], "https://example.com/***"],
    [["user_name:" + CANARY + "@example.com/q/r", "../x"], "https://example.com/***"],
    [["user_name:" + CANARY + "@example.com/q", "../../../.."], "https://example.com/"],
    [["user_name:" + CANARY + "@example.com/q/r", "next"], "https://example.com/***"],
    [["user_name:" + CANARY + "@example.com", "next"], "https://example.com/next"],
  ];
  for (const [locs, shown] of cases) {
    const json = await call("example.com", locs, "application/json");
    assert.equal(checkOf(json.text, "http-status")!.detail, "HTTP 200, followed a redirect from https://example.com/llms.txt to " + shown, JSON.stringify(locs));
  }
});

test("n7: a typed path that holds user information the parser moved is shown as /***", async () => {
  const typed = "https://corp.example" + BS + "erik:" + CANARY + "@host.example";
  const json = await call(typed, [], "application/json");
  assert.equal(checkOf(json.text, "input-path")!.value, "/***");
  assert.ok(!json.text.includes(CANARY));
  const html = await call(typed, [], "text/html");
  assert.ok(!html.text.includes(CANARY));
  // Control: a path with no @ is still named.
  assert.equal(checkOf((await call("example.com/docs/llms.txt", [], "application/json")).text, "input-path")!.value, "/docs/llms.txt");
});

test("n8: the input field repeats a parsed host only when it follows the last @", async () => {
  for (const typed of ["//CANARYUSER?@example.com", "https://CANARYUSER:443#@example.com"]) {
    const html = await call(typed, [], "text/html");
    assert.ok(!/canaryuser/i.test(html.text), typed);
  }
});
