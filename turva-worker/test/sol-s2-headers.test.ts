import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

// Regression tests for the Sol repo read 2026-10-07, Tek-578 session S2, the Worker logic and
// header items: WL-02, WL-19, WL-20, WL-21, WL-23, WL-30, U-1 and U-2. Each test fails when its
// fix is removed. Offline, against the module itself.

const env = {};
const limited = { RATE_LIMITER: { limit: async () => ({ success: false }) } };
const call = (url: string, init: RequestInit = {}, e: object = env) => worker.fetch(new Request(url, init), e as never);

// ---- WL-02: the method gate runs on the mta-sts and openpgpkey resources ----

// The third route is the WKD key; its path carries PGP_WKD_HASH, so this list moves with it.
const HOST_RESOURCES: Array<[string, string]> = [
  ["https://mta-sts.turva.dev/.well-known/mta-sts.txt", "mta-sts policy"],
  ["https://openpgpkey.turva.dev/.well-known/openpgpkey/turva.dev/policy", "WKD policy"],
  ["https://openpgpkey.turva.dev/.well-known/openpgpkey/turva.dev/hu/agk5kn8g6dnzi4z7szws1t9ns6xgw14y", "WKD key"]
];

test("WL-02: POST, PUT and DELETE to a special-host resource answer 405 with Allow, OPTIONS answers 204 with Allow, GET and HEAD still serve", async () => {
  for (const [url, label] of HOST_RESOURCES) {
    const got = await call(url);
    assert.equal(got.status, 200, label + " GET serves");
    for (const method of ["POST", "DELETE", "PUT"]) {
      const r = await call(url, { method });
      assert.equal(r.status, 405, label + " " + method);
      assert.equal(r.headers.get("allow"), "GET, HEAD, OPTIONS", label + " " + method + " Allow");
      assert.equal(r.headers.get("cache-control"), "no-store");
    }
    const o = await call(url, { method: "OPTIONS" });
    assert.equal(o.status, 204, label + " OPTIONS");
    assert.equal(o.headers.get("allow"), "GET, HEAD, OPTIONS");
    const h = await call(url, { method: "HEAD" });
    assert.equal(h.status, 200, label + " HEAD arrives as GET");
  }
});

test("WL-02: any other path on the two hosts still redirects to turva.dev whatever the method", async () => {
  for (const host of ["mta-sts.turva.dev", "openpgpkey.turva.dev"]) {
    for (const method of ["GET", "OPTIONS"]) {
      const r = await call("https://" + host + "/other", { method });
      assert.equal(r.status, 301, host + " " + method);
      assert.equal(r.headers.get("location"), "https://turva.dev/");
    }
  }
});

// ---- WL-21 and U-2: a markdown twin keeps its agent policy on 429 and on the www redirect ----

test("WL-21 and U-2: the 429 of a markdown twin carries ACAO, a page's 429 does not", async () => {
  for (const path of ["/company.md", "/index.md", "/guides/llms-txt.md", "/index.html.md", "/Company.md"]) {
    const r = await call("https://turva.dev" + path, {}, limited);
    assert.equal(r.status, 429, path);
    assert.equal(r.headers.get("access-control-allow-origin"), "*", path + " ACAO");
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.equal(r.headers.get("retry-after"), "60");
  }
  const page = await call("https://turva.dev/company", {}, limited);
  assert.equal(page.status, 429);
  assert.equal(page.headers.get("access-control-allow-origin"), null, "a page keeps the page policy");
  const unknown = await call("https://turva.dev/not-a-page.md", {}, limited);
  assert.equal(unknown.headers.get("access-control-allow-origin"), null, "an .md path that is no twin is not an agent resource");
});

test("WL-21: the www redirect of a markdown twin carries ACAO and the agent-api policy, a page's does not", async () => {
  for (const path of ["/company.md", "/index.md", "/guides/llms-txt.html.md"]) {
    const r = await call("https://www.turva.dev" + path + "?a=1");
    assert.equal(r.status, 301, path);
    assert.equal(r.headers.get("location"), "https://turva.dev" + path + "?a=1");
    assert.equal(r.headers.get("access-control-allow-origin"), "*", path + " ACAO");
    assert.equal(r.headers.get("cross-origin-resource-policy"), "cross-origin", path + " CORP");
  }
  const page = await call("https://www.turva.dev/company");
  assert.equal(page.status, 301);
  assert.equal(page.headers.get("access-control-allow-origin"), null);
});

// ---- U-1: a markdown twin's OPTIONS answer carries the CORS preflight headers ----

test("U-1: OPTIONS on every kind of markdown twin answers the CORS preflight, a page's OPTIONS does not", async () => {
  for (const path of ["/company.md", "/blog.md", "/guides/llms-txt.md", "/index.md", "/services.md", "/index.html.md", "/guides/llms-txt.html.md"]) {
    const r = await call("https://turva.dev" + path, { method: "OPTIONS" });
    assert.equal(r.status, 204, path);
    assert.equal(r.headers.get("access-control-allow-origin"), "*", path + " ACAO");
    assert.equal(r.headers.get("access-control-allow-methods"), "GET, OPTIONS", path + " methods");
    assert.equal(r.headers.get("access-control-allow-headers"), "Content-Type, Accept, X-PAYMENT", path + " headers");
  }
  const page = await call("https://turva.dev/company", { method: "OPTIONS" });
  assert.equal(page.status, 204);
  assert.equal(page.headers.get("access-control-allow-origin"), null);
  assert.equal(page.headers.get("allow"), "GET, HEAD, OPTIONS");
  // POST to a twin keeps answering 405: the preflight does not widen what the twin accepts.
  assert.equal((await call("https://turva.dev/company.md", { method: "POST" })).status, 405);
});

// ---- WL-19: the WebMCP title search matches the title and not the URL ----

async function webMcpTool(name: string, llmsTxt: string) {
  const html = await (await call("https://turva.dev/", { headers: { accept: "text/html" } })).text();
  const start = html.indexOf("<script>\n(function(){\n try {\n var NL");
  assert.notEqual(start, -1, "the home page carries the WebMCP script");
  const end = html.indexOf("</script>", start);
  const body = html.slice(start + "<script>".length, end);
  let tools: Array<{ name: string; execute: (a: unknown) => Promise<any> }> = [];
  const nav = { modelContext: { provideContext: (c: { tools: typeof tools }) => { tools = c.tools; } } };
  const fakeFetch = async () => new Response(llmsTxt, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
  new Function("navigator", "document", "location", "fetch", body)(nav, undefined, undefined, fakeFetch);
  const tool = tools.find((t) => t.name === name);
  assert.ok(tool, "tool " + name + " is registered");
  return tool!;
}

test("WL-19: search_content matches a query that is in the link label, not one that exists only in a URL slug, description or host", async () => {
  const index = [
    "# turva.dev",
    "",
    "- [Pricing](https://turva.dev/services.md): fixed prices",
    "- [Contact](https://turva.dev/slugonly-zebra.md): how to write",
    ""
  ].join("\n");
  const tool = await webMcpTool("search_content", index);
  const byTitle = await tool.execute({ query: "pricing" });
  assert.equal(byTitle.count, 1);
  assert.equal(byTitle.results[0].title, "Pricing");
  assert.equal(byTitle.results[0].markdownUrl, "https://turva.dev/services.md");
  const bySlug = await tool.execute({ query: "zebra" });
  assert.equal(bySlug.count, 0, "a word that is only in a URL slug is not a title match");
  const byDesc = await tool.execute({ query: "fixed prices" });
  assert.equal(byDesc.count, 0, "a word that is only in the description is not a title match");
  const byHost = await tool.execute({ query: "turva.dev" });
  assert.equal(byHost.count, 0, "the host in every URL is not a title match");
});

// ---- WL-20: the mobile menu closes on a null focus target while the page keeps focus ----

async function navHarness() {
  const js = await (await call("https://turva.dev/nav.js")).text();
  const listeners: Record<string, Array<(e: any) => void>> = {};
  const docListeners: Record<string, Array<(e: any) => void>> = {};
  const inside = new Set<unknown>();
  const summary = { focused: 0, focus() { this.focused++; } };
  const details: any = {
    open: true,
    querySelector: () => summary,
    contains: (x: unknown) => inside.has(x),
    addEventListener: (t: string, fn: (e: any) => void) => { (listeners[t] ||= []).push(fn); }
  };
  const doc: any = {
    hasFocusValue: true,
    querySelector: () => details,
    hasFocus() { return this.hasFocusValue; },
    addEventListener: (t: string, fn: (e: any) => void) => { (docListeners[t] ||= []).push(fn); }
  };
  new Function("document", js)(doc);
  const fire = (t: string, e: any = {}) => (listeners[t] || []).forEach((fn) => fn(e));
  const fireDoc = (t: string, e: any = {}) => (docListeners[t] || []).forEach((fn) => fn(e));
  return { details, doc, inside, summary, fire, fireDoc };
}

test("WL-20: focusout closes the menu for an outside target and for a null target while the page has focus, not for an inside target", async () => {
  const outside = {};
  const inner = {};
  let h = await navHarness();
  h.inside.add(inner);
  h.fire("focusout", { relatedTarget: inner });
  assert.equal(h.details.open, true, "focus moving inside the menu keeps it open");
  h.fire("focusout", { relatedTarget: outside });
  assert.equal(h.details.open, false, "focus moving to an outside element closes it");

  h = await navHarness();
  h.fire("focusout", { relatedTarget: null });
  assert.equal(h.details.open, false, "no next target while the page has focus closes it");

  h = await navHarness();
  h.doc.hasFocusValue = false;
  h.fire("focusout", { relatedTarget: null });
  assert.equal(h.details.open, true, "the whole window losing focus does not close it");

  h = await navHarness();
  h.fire("pointerdown");
  h.fire("focusout", { relatedTarget: null });
  assert.equal(h.details.open, true, "a press inside the menu is not the focus leaving");
  h.fireDoc("pointerup");
  h.fire("focusout", { relatedTarget: null });
  assert.equal(h.details.open, false, "after the press ends a null target closes it again");
});

test("WL-20: Escape still closes the menu and returns focus to the summary", async () => {
  const h = await navHarness();
  h.fire("keydown", { key: "Escape" });
  assert.equal(h.details.open, false);
  assert.equal(h.summary.focused, 1);
});

// ---- WL-23: a request body stream that errors answers 400 with no-store ----

test("WL-23: a parity request body that errors answers a 400 with cache-control no-store", async () => {
  const body = new ReadableStream<Uint8Array>({
    pull(controller) { controller.error(new Error("boom")); }
  });
  const req = new Request("https://turva.dev/markdown-parity-check", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body,
    duplex: "half"
  } as RequestInit);
  const parityEnv = { PARITY_LIMITER: { limit: async () => ({ success: true }) } };
  const r = await worker.fetch(req, parityEnv as never);
  assert.equal(r.status, 400);
  assert.equal(r.headers.get("cache-control"), "no-store");
  const text = await r.text();
  assert.ok(text.includes("could not be read"), "the answer says the body could not be read");
});

// ---- WL-30: an accepted redirect is followed, and a refused one is not ----

type Mock = Record<string, () => Response>;
// Exact membership in the list of fetched URLs, never a substring test of a URL string (CodeQL js/incomplete-url-substring-sanitization).
const fetched = (calls: string[], url: string) => calls.some((c) => c === url);
async function validate(url: string, mock: Mock) {
  const realFetch = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = (async (u: unknown) => {
    const s = String(u);
    calls.push(s);
    const hit = mock[s];
    return hit ? hit() : new Response("", { status: 404 });
  }) as typeof fetch;
  try {
    const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + url + "&format=json", { headers: { accept: "application/json" } }), env as never);
    return { json: (await res.json()) as { checks: Array<{ id: string; status: string; label: string; detail: string }>; summary: string }, calls };
  } finally {
    globalThis.fetch = realFetch;
  }
}
const redirect = (to: string, status = 301) => () => new Response(null, { status, headers: { location: to } });
const textOk = (body: string) => () => new Response(body, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
const check = (j: { checks: Array<{ id: string; status: string; detail: string }> }, id: string) => j.checks.find((c) => c.id === id);

test("WL-30: a same-host redirect is followed: the target is fetched, http-status passes, the title and summary come from the target", async () => {
  const { json, calls } = await validate("probe-target.example", {
    "https://probe-target.example/llms.txt": redirect("/llms.txt?v=2"),
    "https://probe-target.example/llms.txt?v=2": textOk("# Target Title\n\n> Target summary.\n")
  });
  assert.ok(fetched(calls, "https://probe-target.example/llms.txt?v=2"), "the same-host target was fetched: " + calls.join(" "));
  assert.equal(check(json, "http-status")!.status, "pass");
  assert.match(check(json, "http-status")!.detail, /followed a redirect/);
  assert.match(check(json, "h1-title")!.detail, /Target Title/);
  assert.match(check(json, "summary")!.detail, /Target summary/);
});

test("WL-30: a www and apex redirect is followed in both directions", async () => {
  const toWww = await validate("probe-target.example", {
    "https://probe-target.example/llms.txt": redirect("https://www.probe-target.example/llms.txt"),
    "https://www.probe-target.example/llms.txt": textOk("# Www Title\n\n> Www summary.\n")
  });
  assert.ok(fetched(toWww.calls, "https://www.probe-target.example/llms.txt"));
  assert.equal(check(toWww.json, "http-status")!.status, "pass");
  assert.match(check(toWww.json, "h1-title")!.detail, /Www Title/);
  const toApex = await validate("www.probe-target.example", {
    "https://www.probe-target.example/llms.txt": redirect("https://probe-target.example/llms.txt"),
    "https://probe-target.example/llms.txt": textOk("# Apex Title\n\n> Apex summary.\n")
  });
  assert.ok(fetched(toApex.calls, "https://probe-target.example/llms.txt"));
  assert.equal(check(toApex.json, "http-status")!.status, "pass");
  assert.match(check(toApex.json, "h1-title")!.detail, /Apex Title/);
});

test("WL-30: the hop limit stops a long chain and an off-host redirect is refused without a fetch of its target", async () => {
  const chain: Mock = {};
  for (let i = 0; i < 8; i++) {
    chain["https://probe-target.example/" + (i === 0 ? "llms.txt" : "h" + i)] = redirect("/h" + (i + 1));
  }
  const looped = await validate("probe-target.example", chain);
  assert.equal(check(looped.json, "http-status")!.status, "fail", "a chain past the limit fails");
  assert.ok(!fetched(looped.calls, "https://probe-target.example/h6"), "the chain stopped before its sixth hop: " + looped.calls.join(" "));

  const off = await validate("probe-target.example", {
    "https://probe-target.example/llms.txt": redirect("https://other-host.example/llms.txt"),
    "https://other-host.example/llms.txt": textOk("# Off Title\n")
  });
  assert.equal(check(off.json, "http-status")!.status, "fail");
  assert.ok(!fetched(off.calls, "https://other-host.example/llms.txt"), "the off-host target is never fetched");
});
