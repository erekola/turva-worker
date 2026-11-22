import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypes } from "../test-support/strip-types.ts";

// Regression tests for the repairs of an outside fuzz run of turva-llms-txt-validator 0.8.0 against this file's copy
// on 2026-11-22 (V4-1, its base form, V4-3, CT-1). The hosted validator here is canonical, and the package carries the
// same inputs in its test/mask-2026-11-22.test.ts. maskLocation, fetchLlmsTxt and validateLlmsTxt are not exported, so
// they are run from the type-stripped source, the way test/llms-validator-round3.test.ts does. CANARY is a made-up
// value, no real secret. Characters outside printable ASCII are built with String.fromCharCode, so this file stays ASCII.

const BS = String.fromCharCode(92);
const BASE = "https://example.com/llms.txt";
const CANARY = "CANARYPWD7f3a";

function loadMaskLocation(): (href: string, base?: string, written?: string) => string {
  const src = stripTypes(readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8"));
  const start = src.search(/function maskLocation\(href\s*,\s*base\s*(?:,\s*written\s*)?\)\s*\{/);
  assert.ok(start >= 0, "maskLocation is in worker.ts");
  const close = /\n\}\r?\n/.exec(src.slice(start));
  assert.ok(close, "maskLocation has a closing brace at column 0");
  // maskLocation calls the trim helpers declared right above its comment block (3.260.8), so the slice starts there.
  const helpers = src.search(/function trimEnds\(/);
  assert.ok(helpers >= 0 && helpers < start, "the trim helpers stand before maskLocation");
  return new Function(src.slice(helpers, start + close.index + 2) + "\nreturn maskLocation;")();
}

function loadInternals() {
  let src = stripTypes(readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8"));
  const imp = /^import \{[^}]*\} from "markdown-parity-check";(\r?)$/m;
  const exp = /\nexport \{[^}]*\};?\s*$/;
  assert.ok(imp.test(src) && exp.test(src), "worker.ts has its one import and its export list");
  src = src.replace(imp, "$1").replace(exp, "\n");
  return new Function('"use strict";\n' + src + "\nreturn { validateLlmsTxt, fetchLlmsTxt };")();
}

test("V4-1: a backslash between a domain and a user name no longer shows the password before a # or a ?", () => {
  const maskLocation = loadMaskLocation();
  const cases: Array<[string, string]> = [
    ["CORP" + BS + "erik:pa#" + CANARY + "@example.com", "***@example.com"],
    ["CORP" + BS + "erik:" + CANARY + "#x@example.com", "***@example.com"],
    ["CORP" + BS + "erik:" + CANARY + "?x@example.com", "***@example.com"],
    ["CORP" + BS + "erik:" + CANARY + "@example.com", "***@example.com"],
    ["CORP" + BS + "erik:" + CANARY + "#x@example.com?q=1", "***@example.com?***"],
    [BS + ":" + CANARY + "#@p", BS + "***@p"],
    [BS + "erik:" + CANARY + "#x@example.com", BS + "***@example.com"],
    [BS + "erik:" + CANARY + "@example.com", BS + "***@example.com"],
  ];
  for (const [written, shown] of cases) {
    // With a base, a ? or # before the last @ shows only ***: the URL reading would put the rest into a query or a
    // fragment, and the text reading would show it as a host.
    const cutBeforeAt = /[?#]/.test(written.slice(0, written.lastIndexOf("@")));
    for (const base of [undefined, BASE]) {
      assert.equal(maskLocation(written, base), base && cutBeforeAt ? "***" : shown, JSON.stringify(written) + " with base " + base);
    }
  }
});

test("V4-1, base form: a scheme-less user:password@host resolved against a base is masked from the text, not shown in the path", () => {
  const maskLocation = loadMaskLocation();
  for (const written of ["user_name:" + CANARY + "@example.com", "user_name:" + CANARY + "#x@example.com", "user_name:" + CANARY + "?x@example.com", "1user:" + CANARY + "@example.com"]) {
    assert.equal(maskLocation(written, BASE), /[?#]/.test(written) ? "***" : "***@example.com", written);
  }
  assert.equal(maskLocation("path@2x.png", BASE), "https://example.com/path@2x.png");
  assert.equal(maskLocation("/hop1", BASE), "https://example.com/hop1");
  assert.equal(maskLocation("p?mail=a@b.com", BASE), "https://example.com/p?mail=***");
  assert.equal(maskLocation("docs/@name", BASE), "https://example.com/docs/@name");
  assert.equal(maskLocation("//cdn.example.com/a@2x.png", BASE), "https://cdn.example.com/a@2x.png");
  assert.equal(maskLocation("@scope/pkg", BASE), "https://example.com/@scope/pkg");
  assert.equal(maskLocation("a@b.com/x", BASE), "https://example.com/a@b.com/x");
  assert.equal(maskLocation("user?x:" + CANARY + "@example.com", BASE), "user?***");
  assert.equal(maskLocation("user#x:" + CANARY + "@example.com", BASE), "user");
  assert.equal(maskLocation("a/b?x=1", BASE), "https://example.com/a/b?x=***");
});

test("V4-1, base form: a fifth redirect to a scheme-less user:password@host is refused as too many without the password", async () => {
  const { fetchLlmsTxt } = loadInternals();
  const orig = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return new Response(null, { status: 302, headers: { location: calls <= 4 ? "https://example.com/hop" + calls : "user_name:" + CANARY + "@example.com" } });
  }) as typeof fetch;
  try {
    const f = await fetchLlmsTxt("example.com");
    assert.equal(f.reason, "too-many");
    assert.equal(f.location, "***@example.com");
  } finally { globalThis.fetch = orig; }
});

test("V4-3: a leading space or C0 control character no longer hides an ambiguous scheme start", () => {
  const maskLocation = loadMaskLocation();
  for (const lead of [" ", "  ", String.fromCharCode(1), String.fromCharCode(0), String.fromCharCode(31) + " "]) {
    for (const base of [undefined, BASE]) {
      assert.equal(maskLocation(lead + "https:/user:" + CANARY + "@@example.com", base), "https://***", JSON.stringify(lead) + " with base " + base);
    }
  }
  assert.equal(maskLocation("https:/user:" + CANARY + "@example.com " + String.fromCharCode(2), BASE), "https://***");
  assert.equal(maskLocation(" u:AUDIT_SECRET_64923@example.com/?token=TOPSECRET#FRAGMENTSECRET"), "//***");
  assert.equal(maskLocation("ht" + String.fromCharCode(1) + "tps://SECRETuser:SECRETpw@host/x?t=1"), "ht" + String.fromCharCode(1) + "tps://***@host/x?***");
});

test("third and fourth independent checks: a Unicode space before the scheme, a refused scheme word with a slash, and an authority the parser refuses", () => {
  const maskLocation = loadMaskLocation();
  for (const base of [undefined, BASE]) {
    for (const lead of [0xa0, 0x2003, 0x3000, 0x200b, 0xfeff, 0x85, 0xfffd]) {
      assert.equal(maskLocation(String.fromCharCode(lead) + "https:/user:" + CANARY + "@example.com", base), "https://***", lead.toString(16));
    }
    assert.equal(maskLocation(String.fromCharCode(0xa0) + "https://user:" + CANARY + "@example.com/p", base), "https://example.com/p");
    assert.equal(maskLocation(String.fromCharCode(0x2003) + "https://user:" + CANARY + "@example.com/p?q=1", base), "https://example.com/p?q=***");
    assert.equal(maskLocation("my_app:/user:" + CANARY + "@example.com", base), "my_app://***");
    assert.equal(maskLocation("my_app:" + BS + "user:" + CANARY + "@example.com", base), "my_app://***");
    assert.equal(maskLocation("ht tps:/user:" + CANARY + "@example.com", base), "//***");
    assert.equal(maskLocation("https://user:pa/ss?" + CANARY + "@example.com/x", base), "https://***");
    assert.equal(maskLocation("https://example.com:99999/a?x@b", base), "https://***");
    assert.equal(maskLocation("https://example.com:99999/a@b", base), "https://***@b");
  }
  assert.equal(maskLocation("https://example.com/@team/x"), "https://example.com/@team/x");
  assert.equal(maskLocation("my_app://SECRETuser:SECRETpw@host/p"), "my_app://***@host/p");
  assert.equal(maskLocation("/docs/a@2x.png", BASE), "https://example.com/docs/a@2x.png");
});

test("CT-1: the content-type check lowercases ASCII only and trims HTTP white space only", () => {
  const { validateLlmsTxt } = loadInternals();
  const check = (contentType: string) => validateLlmsTxt({ status: 200, contentType, linkHeader: "", text: "# Example\n\n> Summary.\n", bytes: 22 }).find((c: { id: string }) => c.id === "content-type");
  for (const ok of ["text/plain", "TEXT/Plain; charset=utf-8", " text/markdown", "text/plain\t", "text/markdown ; charset=utf-8"]) {
    assert.equal(check(ok).status, "pass", JSON.stringify(ok));
  }
  const bad = [
    String.fromCharCode(0xa0) + "text/plain",
    "text/mar" + String.fromCharCode(0x212a) + "down",
    String.fromCharCode(0xfeff) + "text/plain",
    String.fromCharCode(0x3000) + "text/markdown",
    "text/plain" + String.fromCharCode(0x0b),
    "text/markdown" + String.fromCharCode(0x0c),
  ];
  for (const t of bad) assert.equal(check(t).status, "warn", JSON.stringify(t));
});

test("ReDoS: trimming the ends of an address and of a media type takes linear time (CodeQL js/polynomial-redos)", () => {
  // Until 3.260.7 the ends were trimmed with a regex of the form /^[set]+|[set]+$/g, which tries the trailing
  // alternative again from every position of a run that does not reach the end. Measured 2026-11-22: 50 000 spaces
  // inside a value took 0.55 to 0.75 s in each of the three places, and the time grows with the square of the run.
  // CodeQL flagged the same lines in the package turva-llms-txt-validator 0.8.1. The bound below is loose on purpose,
  // so that a loaded machine passes and the quadratic form still fails.
  const maskLocation = loadMaskLocation();
  const { validateLlmsTxt } = loadInternals();
  const run = " ".repeat(200000);
  const wide = String.fromCharCode(0x3000).repeat(200000);
  const check = (contentType: string) => validateLlmsTxt({ status: 200, contentType, linkHeader: "", text: "# Example\n\n> Summary.\n", bytes: 22 }).find((c: { id: string }) => c.id === "content-type");
  const started = performance.now();
  assert.equal(typeof maskLocation("https://example.com/a" + run + "b"), "string");
  assert.equal(typeof maskLocation("https://example.com/a" + wide + "b"), "string");
  assert.equal(typeof maskLocation("https://example.com/a%20b", BASE, "/a" + run + "b"), "string");
  assert.equal(check("text/plain" + run + "x").status, "warn");
  assert.equal(check(run + "text/plain" + run).status, "pass");
  const took = performance.now() - started;
  assert.ok(took < 3000, "the trims took " + Math.round(took) + " ms");
});
