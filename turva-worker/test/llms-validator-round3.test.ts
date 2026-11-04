import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

// Mirrors llms-txt-validator/test/round3.test.ts (Tek-542, batch Fv) against the hosted
// validator route instead of the package's own exports: worker.ts exports only
// { default, escapeHtml, renderInline, markdownToHtml, findLinkRelations }, so maskLocation,
// validateLlmsTxt, collectLinks and collectLinkDefinitions are reached the way
// test/tek-526-wk.test.ts already reaches worker.ts's validator internals, through
// GET /llms-txt-validator?url=... with Accept: application/json and a mocked global fetch
// standing in for the target host's /llms.txt and home page.

const env = {};
const prefix = "# Example\n\n> Summary\n\n## Docs\n\n";

function mockFetch(routes: Record<string, { text: string; status?: number; contentType?: string }>) {
  return async (input: string | URL | Request) => {
    const u = new URL(typeof input === "string" ? input : (input as Request).url);
    const entry = routes[u.pathname];
    if (!entry) return new Response("not found", { status: 404 });
    return new Response(entry.text, {
      status: entry.status || 200,
      headers: { "content-type": entry.contentType || "text/plain; charset=utf-8" }
    });
  };
}

async function validate(text: string) {
  const orig = globalThis.fetch;
  globalThis.fetch = mockFetch({
    "/llms.txt": { text },
    "/": { text: "<!doctype html><html><head></head><body></body></html>", contentType: "text/html" }
  });
  try {
    const res = await worker.fetch(
      new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent("example.com"), {
        headers: { accept: "application/json" }
      }),
      env,
      {}
    );
    return { status: res.status, body: JSON.parse(await res.text()) };
  } finally {
    globalThis.fetch = orig;
  }
}

function byId(checks: { id: string; status: string; detail: string }[], id: string) {
  return checks.find((c) => c.id === id)!;
}

// --- V03-VREG1: a link reference definition is CommonMark-valid only in its own block, not
// inside a code span or as a paragraph continuation line, with a title that is quoted or absent;
// fence removal must not join lines across a fenced block. Same four cases as the package test.
test("VREG1: a definition with an unquoted trailing word is not a definition", async () => {
  const text = prefix + "- [Guide][guide]\n\n[guide]: https://example.com/guide not-a-title\n";
  const { body } = await validate(text);
  assert.match(byId(body.checks, "links").detail, /^no markdown links found/);
});

test("VREG1: a definition-shaped line inside an inline code span is literal code", async () => {
  const text = prefix + "- [Guide][guide]\n\n`some code\n[guide]: https://example.com/guide\nend code`\n";
  const { body } = await validate(text);
  assert.match(byId(body.checks, "links").detail, /^no markdown links found/);
});

test("VREG1: a definition-shaped line that continues open paragraph text is not a definition", async () => {
  const text = prefix + "- [Guide][guide]\n\nA paragraph\n[guide]: https://example.com/guide\n";
  const { body } = await validate(text);
  assert.match(byId(body.checks, "links").detail, /^no markdown links found/);
});

test("VREG1: fence removal does not join a link target across a fenced code block", async () => {
  const text = prefix + "- [Guide](\n```\nanything\n```\n  https://example.com/guide\n  )\n";
  const { body } = await validate(text);
  assert.match(byId(body.checks, "links").detail, /^no markdown links found/);
});

// --- V03-VREG2: codeSpanMask must not cross a block boundary (list item, heading, or a blank
// line made only of spaces/tabs), not only a literal blank line.
test("VREG2: backticks in two different list items do not hide a real link between them", async () => {
  const text = "# Example\n\n> Summary\n\n## Docs\n\n- `literal\n- [Guide](https://example.com/guide)\n- literal`\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").status, "pass");
  assert.equal(byId(body.checks, "links").detail, "1 link, all absolute URLs");
});

test("VREG2: a blank line made only of spaces still breaks a code span", async () => {
  const text = "# Example\n\n> Summary\n\n## Docs\n\n`one\n   \ntwo` [Guide](https://example.com/guide)\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").status, "pass");
});

test("VREG2: a heading between two backtick runs still breaks a code span", async () => {
  const text = "# Example\n\n> Summary\n\n## Docs\n\n`literal\n## Heading\n[Guide](https://example.com/guide) literal`\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").status, "pass");
});

// --- V03-VREG3/VN3: the link-to-line mapping must not restart its line scan for every link. A
// smaller n than the package test's own timing comparison, because this is a correctness check
// run over HTTP, not a timed one.
test("VREG3/VN3: a many-link document maps every link to a line without restarting the scan", async () => {
  const n = 500;
  const text = "# Example\n\n> Summary\n\n## Docs\n" + "\n".repeat(n * 8) + "- [a](https://a.com/)\n".repeat(n);
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").status, "pass");
  assert.match(byId(body.checks, "sections").detail, /1 carrying a file list/);
});

test("VREG3/VN3: the mapped line index still matches the real position for a small document", async () => {
  const text = prefix + "- [First](https://example.com/a)\n- [Second](https://example.com/b)\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "sections").status, "pass");
  assert.match(byId(body.checks, "sections").detail, /1 carrying a file list/);
});

// --- V03-VN2 (scope: shortcut and collapsed references only).
test("VN2: a shortcut reference, \"[label]\" alone, resolves against its definition", async () => {
  const text = prefix + "- [Guide]\n\n[Guide]: https://example.com/guide\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").status, "pass");
  assert.equal(byId(body.checks, "links").detail, "1 link, all absolute URLs");
});

test("VN2: a shortcut reference does not resolve the definition line against itself", async () => {
  const text = prefix + "- [Guide]\n\n[guide]: https://example.com/guide\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").detail, "1 link, all absolute URLs");
});

test("VN2: an unresolved shortcut reference is read as plain brackets", async () => {
  const text = prefix + "- [Guide]\n";
  const { body } = await validate(text);
  assert.match(byId(body.checks, "links").detail, /^no markdown links found/);
});

test("VN2: a collapsed reference, \"[label][]\", still resolves (regression guard)", async () => {
  const text = prefix + "- [Guide][]\n\n[guide]: https://example.com/guide\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").status, "pass");
});

// --- V13 D5-1: with no slash at all, a ":" ahead of the last @ is user:password and is masked;
// an @ with no ":" ahead of it (an asset name) stays as given. worker.ts does not export
// maskLocation and no hosted route reaches this shape (a Location value is resolved against the
// request URL first), so the function is read out of the source text and run as it stands.
import { readFileSync } from "node:fs";
import { stripTypes } from "../test-support/strip-types.ts";

function loadMaskLocation() {
  const src = stripTypes(readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8"));
  const start = src.search(/function maskLocation\(href\s*,\s*base\s*\)\s*\{/);
  assert.ok(start >= 0, "maskLocation is in worker.ts");
  const close = /\n\}\r?\n/.exec(src.slice(start));
  assert.ok(close, "maskLocation has a closing brace at column 0");
  const body = src.slice(start, start + close.index + 2);
  return new Function(body + "\nreturn maskLocation;")();
}

test("V13 D5-1: a slashless user:password@host is masked, path@2x.png is not", () => {
  const maskLocation = loadMaskLocation();
  assert.equal(maskLocation("user_name:demo-secret@example.com"), "***@example.com");
  assert.equal(maskLocation("a_b:pw@example.com"), "***@example.com");
  assert.equal(maskLocation("1user:pw@example.com"), "***@example.com");
  assert.equal(maskLocation("user_name:pw@host?x=1"), "***@host?***");
  for (const t of ["user_name:demo-secret@example.com", "a_b:pw@example.com", "user_name:pw@host?x=1"]) {
    assert.doesNotMatch(maskLocation(t), /demo-secret|pw/, t);
  }
  assert.equal(maskLocation("path@2x.png"), "path@2x.png");
  assert.equal(maskLocation("path/x@y"), "path/x@y");
});

// --- Tek-668 NULL-1 and NULL-2 (2026-10-21): two inputs that no hosted route produces, because the route
// always passes validateV2Discovery a reason and fetchLlmsTxt always sets finalUrl together with
// redirectedFrom. They are fixed here first because the hosted validator is canonical and the npm package
// mirrors it, and there both are reachable through the public API. Neither function is exported, so the
// whole module body is run from the type-stripped source with its one import and its export list removed.
function loadValidatorInternals() {
  let src = stripTypes(readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8"));
  const imp = /^import \{[^}]*\} from "markdown-parity-check";(\r?)$/m;
  const exp = /\nexport \{[^}]*\};?\s*$/;
  assert.ok(imp.test(src) && exp.test(src), "worker.ts has its one import and its export list");
  src = src.replace(imp, "$1").replace(exp, "\n");
  return new Function('"use strict";\n' + src + "\nreturn { validateLlmsTxt, validateV2Discovery, codeSpanMask };")();
}

test("Tek-668 NULL-1: validateV2Discovery(null) without a reason says the home page was not read", () => {
  const { validateV2Discovery } = loadValidatorInternals();
  const checks = validateV2Discovery(null);
  assert.equal(checks.length, 2);
  for (const c of checks) {
    assert.equal(c.status, "info");
    assert.equal(c.detail, "the home page was not read, so this was not measured");
  }
  for (const c of validateV2Discovery(null, "given reason")) assert.equal(c.detail, "given reason");
});

test('Tek-668 NULL-2: a redirect with no finalUrl names the address it was redirected from alone, not "to undefined"', () => {
  const { validateLlmsTxt } = loadValidatorInternals();
  const text = "# Example\n\n> Summary\n\n## Docs\n\n- [A](https://example.com/a): one\n";
  const base = { status: 200, contentType: "text/plain; charset=utf-8", linkHeader: "", text, bytes: text.length };
  const detail = (extra: Record<string, unknown>) =>
    validateLlmsTxt(Object.assign({}, base, extra)).find((c: { id: string }) => c.id === "http-status").detail;
  assert.equal(detail({ redirectedFrom: "https://example.com/llms.txt" }), "HTTP 200, followed a redirect from https://example.com/llms.txt");
  assert.equal(detail({ redirectedFrom: "https://example.com/llms.txt", finalUrl: "https://www.example.com/llms.txt?session=abc" }),
    "HTTP 200, followed a redirect from https://example.com/llms.txt to https://www.example.com/llms.txt?session=***");
  assert.equal(detail({}), "HTTP 200");
});

// --- Tek-745 K9: a backtick pair that crosses a block boundary no longer consumes its closer, so the
// closer can open a span of its own in its own block. Before 2026-11-04 the scan jumped past the closer:
// a stray backtick in one block moved the mask by one run, a link inside the next real span counted as
// a link (C-01, a false pass) and a real link after a lone backtick in a list item could be read as
// code (N3, a false warn). The measured fixtures are the two outside-read cases; the CommonMark
// comparison is in työt/chatgpt-syvaajot-2026-11-04/korjaukset/aalto2/.
const BSL = String.fromCharCode(92);
const p745 = "# T\n\n> Summary\n\n## Docs\n\n";
const linksCheck = async (text: string) => { const c = byId((await validate(text)).body.checks, "links"); return c.status + " | " + c.detail; };

test("Tek-745 C-01: a stray backtick in an earlier block does not move the mask onto the next real span", async () => {
  const stray = await linksCheck(p745 + "`\n\n`[Guide](https://example.com/guide)`\n");
  const control = await linksCheck(p745 + "`[Guide](https://example.com/guide)`\n");
  assert.equal(control, "warn | no markdown links found");
  assert.equal(stray, control);
});

test("Tek-745 N3: a lone backtick at the end of one list item does not turn the next item's real span and text into code", async () => {
  const text = "# T\n\n> s\n\n## Docs\n\n- [A](https://example.com/a) `\n- see `[B](/relative)` here\n";
  assert.equal(await linksCheck(text), "pass | 1 link, all absolute URLs");
});

test("Tek-745: what must not change when the closer stays free", async () => {
  // a real link after a lone backtick in another block still counts
  assert.equal(await linksCheck(p745 + "- [A](https://example.com/a) `x\n\n[B](https://example.com/b) and `y`\n"), "pass | 2 links, all absolute URLs");
  // a real span inside one block still masks its link text
  assert.equal(await linksCheck(p745 + "- [A](https://example.com/a) `[B](https://example.com/b)`\n"), "pass | 1 link, all absolute URLs");
  // a span across a soft line break inside one paragraph still masks
  assert.equal(await linksCheck(p745 + "`one\n[B](https://example.com/b) two`\n"), "warn | no markdown links found");
  // an unclosed run stays literal
  assert.equal(await linksCheck(p745 + "- [A](https://example.com/a) `x [B](https://example.com/b)\n"), "pass | 2 links, all absolute URLs");
  // a double-backtick span holds a single backtick and masks to its closing run
  assert.equal(await linksCheck(p745 + "- [A](https://example.com/a) ``x`y [B](https://example.com/b)``\n- [C](https://example.com/c)\n"), "pass | 2 links, all absolute URLs");
  // VREG2: backticks in two list items still enclose no real link between them
  assert.equal(await linksCheck(p745 + "- `literal\n- [Guide](https://example.com/guide)\n- literal`\n"), "pass | 1 link, all absolute URLs");
});

test("Tek-745: the mask itself, run by run", () => {
  const { codeSpanMask } = loadValidatorInternals();
  const shown = (t: string) => Array.from(codeSpanMask(t) as Uint8Array, (v, i) => (v ? t[i] : "-")).join("");
  // the closer of a crossing pair opens its own span in its own block
  assert.equal(shown("a `\n\nb `c` d"), "-------`c`--");
  assert.equal(shown("`one\ntwo`"), "`one\ntwo`");
  assert.equal(shown("`one\n\ntwo`"), "----------");
  assert.equal(shown("``a`b`` c"), "``a`b``--");
  assert.equal(shown("x ` y"), "-----");
  // an escaped first backtick is literal, the rest of its run still opens
  assert.equal(shown(BSL + "``a` b"), "--`a`--");
});

// The old decision, kept here as the reference the block counters are compared with.
function crossesBlockBoundary(text: string, start: number, end: number): boolean {
  const inner = text.slice(start, end);
  if (/\n[ \t]*\n/.test(inner)) return true;
  const lines = inner.split("\n");
  for (let i = 1; i < lines.length; i++) {
    if (/^ {0,3}(#{1,6}(?:[ \t]|$)|[-*+][ \t]|\d{1,9}[.)][ \t])/.test(lines[i])) return true;
  }
  return false;
}
// The same scan as codeSpanMask with the new rule (a crossing pair consumes nothing) but the decision
// taken by the old function for every candidate, written the plain way with no counters and no pointers.
function referenceMask(text: string): Uint8Array {
  const mask = new Uint8Array(text.length);
  const runs: { at: number; len: number; escaped: boolean }[] = [];
  for (let i = 0; i < text.length; ) {
    if (text[i] !== "`") { i++; continue; }
    let j = i;
    while (j < text.length && text[j] === "`") j++;
    let n = 0;
    for (let b = i - 1; b >= 0 && text[b] === BSL; b--) n++;
    runs.push({ at: i, len: j - i, escaped: n % 2 === 1 });
    i = j;
  }
  for (let k = 0; k < runs.length; k++) {
    const r = runs[k];
    const len = r.escaped ? r.len - 1 : r.len;
    if (len <= 0) continue;
    let m = k + 1;
    while (m < runs.length && runs[m].len !== len) m++;
    if (m === runs.length) continue;
    const start = r.escaped ? r.at + 1 : r.at;
    const end = runs[m].at + runs[m].len;
    if (crossesBlockBoundary(text, start, end)) continue;
    mask.fill(1, start, end);
    k = m;
  }
  return mask;
}

// mulberry32, so a failure is reproducible from the seed in its message
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("Tek-745: the block counters decide every pair as the old function did, on 3000 generated texts", () => {
  const { codeSpanMask } = loadValidatorInternals();
  const parts = ["`", "``", "```", BSL + "`", "word", " ", "  ", "\t", "\n", "\n", "\n\n", "\n   \n", "\n# h\n", "\n## ", "\n- item ", "\n* ", "\n+ x", "\n1. n ", "\n12) m ", "\n    - indented ", "\n#nohash ", "[a](b)", "x"];
  const rnd = seeded(745);
  let withSpans = 0, crossing = 0;
  for (let n = 0; n < 3000; n++) {
    const count = 1 + Math.floor(rnd() * 24);
    let text = "";
    for (let i = 0; i < count; i++) text += parts[Math.floor(rnd() * parts.length)];
    const got = codeSpanMask(text) as Uint8Array, want = referenceMask(text);
    assert.deepEqual(Array.from(got), Array.from(want), "text " + JSON.stringify(text) + " (seed 745, case " + n + ")");
    if (got.some((v) => v === 1)) withSpans++;
    if (/`[^`]*\n[^`]*`/.test(text)) crossing++;
  }
  // the generator has to reach both outcomes, or the comparison proves nothing
  assert.ok(withSpans > 100 && crossing > 300, withSpans + " texts with a span, " + crossing + " with a backtick pair over a line break");
});

// A fixed time limit once passed here and failed on a slower CI runner (mds/gotchas.md 2026-09-27
// (jatko 3)), so growth is compared: lengths 1..K are opened in order, a blank line follows and they are
// closed in reverse, so every one of the K pairs spans most of the document and crosses a block
// boundary. The mask with block counters grows with the input; calling the old function for each pair
// grew about three to four times faster than the input (measured 2026-11-04 in a temp copy of the scan:
// the larger input is 24 times the smaller, the counters took 20 times as long, the old function 83).
test("Tek-745: the mask stays linear when many nested pairs all cross a block boundary", () => {
  const { codeSpanMask } = loadValidatorInternals();
  const nested = (K: number) => {
    let s = "# T\n\n> s\n\n## Docs\n\n";
    for (let L = 1; L <= K; L++) s += "`".repeat(L) + " ";
    s += "\n\n";
    for (let L = K; L >= 1; L--) s += "`".repeat(L) + " ";
    return s + "\n";
  };
  const best = (text: string) => {
    let min = Infinity;
    for (let r = 0; r < 15; r++) {
      const started = process.hrtime.bigint();
      for (let i = 0; i < 10; i++) codeSpanMask(text);
      min = Math.min(min, Number(process.hrtime.bigint() - started) / 1e6);
    }
    return min;
  };
  const small = nested(96), large = nested(480);
  assert.ok(large.length > 200 * 1024 && large.length < 256 * 1024, "the large input is 256 KiB class: " + large.length);
  // every pair crosses, so nothing is masked and nothing is consumed
  assert.equal((codeSpanMask(large) as Uint8Array).some((v) => v === 1), false);
  best(large);
  const ratio = best(large) / best(small);
  const sizes = large.length / small.length;
  assert.ok(ratio < sizes * 1.5, sizes.toFixed(1) + "x the input took " + ratio.toFixed(1) + "x as long");
});
