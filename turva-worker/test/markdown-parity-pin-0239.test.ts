import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { run as mpcRun, errorReport as mpcErrorReport, renderJson, RunError as MpcRunError, maskUrl as mpcMaskUrl, TOOL_VERSION } from "markdown-parity-check";
import { stripTypes } from "../test-support/strip-types.ts";

// The hosted Markdown parity check reads the package's error text by regex to decide which field an error belongs to
// (the branch `^(Invalid selector|Selector )` in parityRunCheck), and a changed message once slipped through a pin raise
// (mds/gotchas.md 2026-09-29 (jatko 3)). markdown-parity-check 0.2.39 added a third RunError form: a link target over
// 8192 characters ends the comparison. Each branch of that handler is exercised here on the real parityRunCheck, evaluated
// from the Worker source, with the real package and two pages served from a stub, because no published page has such a link.

const src = stripTypes(readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8"));
function slice(from: string, to: string) {
  const a = src.indexOf(from);
  assert.notEqual(a, -1, "anchor missing in worker.ts: " + from);
  const b = src.indexOf(to, a + from.length);
  assert.notEqual(b, -1, "end anchor missing in worker.ts: " + to);
  return src.slice(a, b);
}

type Check = { status: number; report: any; field: string | null };
function checker(htmlBody: string, markdownBody: string): (input: Record<string, unknown>) => Promise<Check> {
  const code = [
    slice("const PARITY_LIMITS = ", "\nconst PARITY_MAX_REQUEST_BYTES"),
    slice("const PARITY_MAX_SELECTOR_CHARS = ", "\nconst PARITY_FINDINGS_SHOWN"),
    slice("class ParityError ", "\nfunction parityIsSelf("),
    slice("function parityIsSelf(", "\n// A published page: the home page"),
    slice("function cut(", "\n// Unicode bidi controls"),
    slice("function parityOptions(", "\nfunction parityResponse("),
    "return parityRunCheck;"
  ].join("\n");
  const page = (accept: string, body: string, url: string) => ({
    meta: { kind: "url", url, requestedUrl: url, status: 200, contentType: accept === "text/html" ? "text/html; charset=utf-8" : "text/markdown; charset=utf-8", accept, redirects: 0, bytes: body.length, baseUrl: url },
    body,
    base: url
  });
  const parityFetchSelf = async (start: URL, accept: string) => page(accept, accept === "text/html" ? htmlBody : markdownBody, start.href);
  const make = new Function("mpcRun", "mpcErrorReport", "MpcRunError", "mpcMaskUrl", "isValidPublicHost", "paritySelfPathAllowed", "parityFetchSelf", "parityRemote", code);
  const parityRunCheck = make(mpcRun, mpcErrorReport, MpcRunError, mpcMaskUrl, () => true, () => true, parityFetchSelf, async () => { throw new Error("remote path is off"); }) as (i: Record<string, unknown>, e: unknown) => Promise<Check>;
  return (input) => parityRunCheck({ markdownUrl: undefined, selector: undefined, frontMatter: "keep", strict: false, ...input }, {});
}

const PAGE = "https://turva.dev/tools";
const html = (href: string) => `<main><h1>Tools</h1><p>Read <a href="${href}">the guide</a>.</p></main>`;
const md = (dest: string) => `# Tools\n\nRead [the guide](${dest}).\n`;
const longTarget = (n: number) => "https://turva.dev/" + "a".repeat(n - "https://turva.dev/".length);
const LONG = /^A link target is (\d+) characters long, more than the limit of 8192; the comparison was not run\.$/;


test("pin 0.2.39: a link target over 8192 characters in the HTML answers 422 on no field, names its length and does not repeat the target", async () => {
  const target = longTarget(9000);
  const r = await checker(html(target), md("https://turva.dev/x"))({ url: PAGE });
  assert.equal(r.status, 422);
  assert.equal(r.field, null, "the regex branch for selectors must not claim it");
  const m = LONG.exec(r.report.summary.error);
  assert.ok(m, r.report.summary.error);
  assert.equal(m![1], "9000");
  assert.equal(r.report.summary.result, "error");
  assert.equal(r.report.summary.errorValue, undefined);
  assert.ok(!renderJson(r.report).includes(target.slice(18, 60)), "the long target is not in the answer");
});

test("pin 0.2.39: a link target over 8192 characters in the Markdown answers the same 422 on no field", async () => {
  const r = await checker(html("https://turva.dev/x"), md(longTarget(8193)))({ url: PAGE });
  assert.equal(r.status, 422);
  assert.equal(r.field, null);
  assert.match(r.report.summary.error, LONG);
  assert.equal(LONG.exec(r.report.summary.error)![1], "8193");
});

test("pin 0.2.39: a link target of exactly 8192 characters is compared, not refused", async () => {
  const target = longTarget(8192);
  const r = await checker(html(target), md(target))({ url: PAGE });
  assert.equal(r.status, 200);
  assert.equal(r.field, null);
  assert.ok(r.report.summary.result === "pass" || r.report.summary.result === "fail", r.report.summary.result);
});

test("pin 0.2.39: an invalid selector is the branch `^Invalid selector`: field selector, the fixed sentence, the value apart", async () => {
  const r = await checker(html("https://turva.dev/x"), md("https://turva.dev/x"))({ url: PAGE, selector: "div[" });
  assert.equal(r.status, 422);
  assert.equal(r.field, "selector");
  assert.equal(r.report.summary.error, "The CSS selector is not valid.");
  assert.equal(r.report.summary.errorValue, "div[");
});

test("pin 0.2.39: a selector that matches nothing is the branch `^Selector `: field selector, the fixed sentence, the value apart", async () => {
  const r = await checker(html("https://turva.dev/x"), md("https://turva.dev/x"))({ url: PAGE, selector: "#nothing-here" });
  assert.equal(r.status, 422);
  assert.equal(r.field, "selector");
  assert.equal(r.report.summary.error, "The CSS selector matched nothing on the page. Clear it to compare the default content.");
  assert.equal(r.report.summary.errorValue, "#nothing-here");
});

test("pin 0.2.39: any other package error answers 422 on no field with the package's own sentence", async () => {
  const r = await checker("<main></main>", md("https://turva.dev/x"))({ url: PAGE });
  assert.equal(r.status, 422);
  assert.equal(r.field, null);
  assert.match(r.report.summary.error, /^HTML main content is empty/);
});

// markdown-parity-check 0.2.40 (hosted since v3.257.2) shows text of the shape name:secret@host.tld/path, with no scheme
// separator, as name:***@host.tld/path, and the email link the Markdown parser reads out of it as ***. These tests run the
// whole hosted route (worker.fetch, the real handler, limiter, JSON and HTML renderers) over a copy of the Worker source whose
// page source is replaced by two stubbed pages, because no published page holds the shape. The copy sits in test-support/
// under a name of its own and is removed when the file's tests are done.
const STUB_URL = new URL("../test-support/.hosted-stub-" + process.pid + "-" + Math.random().toString(36).slice(2, 8) + ".ts", import.meta.url);
after(() => { rmSync(STUB_URL, { force: true }); });
type Route = { fetch(r: Request, e: unknown): Promise<Response> };
let routeOnce: Promise<Route> | null = null;
function hostedRoute(): Promise<Route> {
  routeOnce ??= (async () => {
    const marker = "async function parityFetchSelf(start: URL, accept: string, env: Env): Promise<ParityPage> {";
    assert.equal(src0.split(marker).length, 2, "the page source function is in worker.ts exactly once");
    writeFileSync(STUB_URL, src0.replace(marker, marker + " const stubbed = (globalThis as any).__parityStubPages; if (stubbed) return stubbed(start, accept);"));
    return (await import(STUB_URL.href)).default as Route;
  })();
  return routeOnce;
}
const src0 = readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8");
const SECRET = "QzXv7Kp9Wm";
async function viaRoute(htmlBody: string, markdownBody: string, input: Record<string, string>, accept: "json" | "html") {
  const route = await hostedRoute();
  const stubPage = (a: string, body: string, url: string) => ({
    meta: { kind: "url", url, requestedUrl: url, status: 200, contentType: a === "text/html" ? "text/html; charset=utf-8" : "text/markdown; charset=utf-8", accept: a, redirects: 0, bytes: body.length, baseUrl: url },
    body,
    base: url
  });
  (globalThis as any).__parityStubPages = (start: URL, a: string) => stubPage(a, a === "text/html" ? htmlBody : markdownBody, start.href);
  try {
    const env = { PARITY_LIMITER: { async limit() { return { success: true }; } } };
    const init: RequestInit = accept === "json"
      ? { method: "POST", headers: { accept: "application/json", "content-type": "application/json", "cf-connecting-ip": "203.0.113.9" }, body: JSON.stringify(input) }
      : { method: "POST", headers: { accept: "text/html", "content-type": "application/x-www-form-urlencoded", "cf-connecting-ip": "203.0.113.9" }, body: new URLSearchParams(input).toString() };
    const res = await route.fetch(new Request("https://turva.dev/markdown-parity-check", init), env);
    return { status: res.status, text: await res.text() };
  } finally {
    delete (globalThis as any).__parityStubPages;
  }
}
const shapeHtml = `<main><h1>Tools</h1><p>Read the guide.</p></main>`;
const shapeMd = `# Tools\n\nWrite to user:${SECRET}@host.tld/path for access.\n\nRead the guide.\n\n[user:${SECRET}@host.tld/p?k=v](https://turva.dev/x)\n`;

test("pin 0.2.40: the package is the pinned one", () => {
  assert.equal(TOOL_VERSION, "0.2.40");
  assert.equal(JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).dependencies["markdown-parity-check"], "0.2.40");
});

test("pin 0.2.40: text of the shape name:secret@host.tld/path is masked in the JSON answer of the route", async () => {
  const r = await viaRoute(shapeHtml, shapeMd, { url: PAGE }, "json");
  assert.equal(r.status, 200);
  assert.ok(!r.text.includes(SECRET), "the secret is not in the JSON answer");
  assert.ok(r.text.includes("user:***@host.tld/path"), "the masked shape is shown");
  const report = JSON.parse(r.text);
  assert.equal(report.summary.result, "fail", "the stubbed pages differ, so the answer is a real comparison");
});

test("pin 0.2.40: text of the shape name:secret@host.tld/path is masked in the HTML answer of the route", async () => {
  const r = await viaRoute(shapeHtml, shapeMd, { url: PAGE }, "html");
  assert.equal(r.status, 200);
  assert.ok(!r.text.includes(SECRET), "the secret is not in the HTML answer");
  assert.ok(r.text.includes("user:***@host.tld/path"), "the masked shape is shown");
});

test("pin 0.2.40: the shape in the HTML side is masked the same way", async () => {
  const r = await viaRoute(`<main><h1>Tools</h1><p>Write to user:${SECRET}@host.tld/path for access.</p></main>`, "# Tools\n\nRead the guide.\n", { url: PAGE }, "json");
  assert.equal(r.status, 200);
  assert.ok(!r.text.includes(SECRET));
  assert.ok(r.text.includes("user:***@host.tld/path"));
});

test("pin 0.2.40: an invalid selector that holds the shape answers 422 with the fixed sentence and without the secret", async () => {
  const selector = `a[href="user:${SECRET}@host.tld/p`;
  for (const accept of ["json", "html"] as const) {
    const r = await viaRoute(shapeHtml, "# Tools\n\nRead the guide.\n", { url: PAGE, selector }, accept);
    assert.equal(r.status, 422, accept);
    // The HTML form puts what the person typed back into the selector field, as it always has; that one input is left out
    // of the reading, and the rest of the page, the error text and the value shown apart included, must not hold the secret.
    const reply = accept === "html" ? r.text.replace(/<input[^>]*id="mpc-selector"[^>]*>/, "") : r.text;
    if (accept === "html") assert.notEqual(reply, r.text, "the selector input is found");
    assert.ok(!reply.includes(SECRET), accept + ": the secret is not in the answer");
    assert.ok(r.text.includes("The CSS selector is not valid."), accept + ": the fixed sentence");
    if (accept === "json") assert.equal(JSON.parse(r.text).summary.errorValue, `a[href="user:***@host.tld/p`, "the value shown apart is the masked one");
  }
});
