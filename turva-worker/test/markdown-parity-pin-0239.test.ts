import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("pin 0.2.39: the package is the pinned one", () => {
  assert.equal(TOOL_VERSION, "0.2.39");
  assert.equal(JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).dependencies["markdown-parity-check"], "0.2.39");
});

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
