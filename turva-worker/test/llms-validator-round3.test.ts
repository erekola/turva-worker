import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

// Growth check for the tests that say a scan "stays linear".
// The package turva-llms-txt-validator keeps the same function in test/growth.ts; it is inline here
// because this repo's test runner would treat a shared file in test/ as a test.
//
// Why a ratio and not a limit in milliseconds. A fixed limit fails on a slow CI runner and lets a
// slow but quadratic scan through. Two inputs of one shape, the second about four times the first,
// are timed instead. A linear scan takes about four times as long on the larger one, a quadratic
// scan about sixteen times, and the limit sits between the two on the log scale: sizes ** 1.5, which
// is 8 for 4x the input and about 22.6 for 8x. Each input is timed several times and the fastest
// run counts, because load on the machine only ever adds time, never removes it. The small input is
// repeated until one sample takes at least 1 ms, so the clock resolution does not decide the ratio and
// the samples stay short: a short sample is likelier to fall between two interruptions of a busy machine.
// The check passes as soon as nine rounds give a ratio under the limit. On a loaded machine the ratio
// of the fastest runs can sit above the limit because the larger input was interrupted more often, so
// more rounds are taken, at most 60 and at most four seconds, before the check fails. A scan that is
// really quadratic stays above the limit through all of them (checked against a deliberately quadratic scan).
async function timeIt(work: (input: string) => unknown, input: string, reps: number): Promise<number> {
  const started = performance.now();
  for (let i = 0; i < reps; i++) {
    const out = work(input);
    if (out instanceof Promise) await out;
  }
  return performance.now() - started;
}

// The limit for an input that is `sizes` times larger: the midpoint, on the log scale, between a
// linear scan (sizes) and a quadratic one (sizes squared).
const growthLimit = (sizes: number): number => sizes ** 1.5;

async function growthRatio(work: (input: string) => unknown, small: string, large: string, limit: number = Infinity): Promise<{ ratio: number; rounds: number }> {
  await timeIt(work, large, 1);
  await timeIt(work, small, 1);
  let reps = 1;
  while (reps < 4096 && (await timeIt(work, small, reps)) < 1) reps *= 2;
  const begun = performance.now();
  let minSmall = Infinity;
  let minLarge = Infinity;
  let rounds = 0;
  for (;;) {
    minSmall = Math.min(minSmall, await timeIt(work, small, reps));
    minLarge = Math.min(minLarge, await timeIt(work, large, reps));
    rounds++;
    const ratio = minLarge / minSmall;
    if (rounds >= 9 && ratio < limit) return { ratio, rounds };
    if (rounds >= 60 || (rounds >= 9 && performance.now() - begun > 4000)) return { ratio, rounds };
  }
}

async function assertLinear(label: string, work: (input: string) => unknown, small: string, large: string, explicitLimit?: number): Promise<void> {
  const sizes = large.length / small.length;
  const limit = explicitLimit ?? growthLimit(sizes);
  const g = await growthRatio(work, small, large, limit);
  assert.ok(g.ratio < limit, label + ": " + sizes.toFixed(1) + "x the input took " + g.ratio.toFixed(1) + "x as long after " + g.rounds + " rounds, limit " + limit.toFixed(1));
}

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
test("VREG3/VN3: a many-link document is still read in full (links pass, one section carries a file list)", async () => {
  const n = 500;
  const text = "# Example\n\n> Summary\n\n## Docs\n" + "\n".repeat(n * 8) + "- [a](https://a.com/)\n".repeat(n);
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").status, "pass");
  assert.match(byId(body.checks, "sections").detail, /1 carrying a file list/);
});

test("VREG3/VN3: a small document with links is still read in full (its section carries a file list)", async () => {
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
  return new Function('"use strict";\n' + src + "\nreturn { validateLlmsTxt, validateV2Discovery, codeSpanMask, inlineBlockReader };")();
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
// comparison of the cases was made outside this repository.
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

// The decision for a pair taken from the lines its two runs sit on, the block of every line read up front. Which block a
// line belongs to is the reader's, and the CM_LINKS table pins that against commonmark.js. This reference checks the scan
// around it, written the plain way with no counters and no pointers.
function referenceMask(text: string, makeReader: () => (line: string) => number): Uint8Array {
  const mask = new Uint8Array(text.length);
  const blockOf = makeReader();
  const blocks = new Int32Array(text.length);
  let lineStart = 0;
  for (const line of text.split("\n")) {
    const block = blockOf(line);
    blocks.fill(block, lineStart, lineStart + line.length + 1);
    lineStart += line.length + 1;
  }
  const runs: { at: number; len: number; escaped: boolean }[] = [];
  for (let i = 0; i < text.length; ) {
    if (text[i] !== "`" || blocks[i] < 0) { i++; continue; }
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
    if (blocks[start] !== blocks[end - 1]) continue;
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

test("Tek-747: the block number on each run decides every pair as a plain scan does, on 3000 generated texts", () => {
  const { codeSpanMask, inlineBlockReader } = loadValidatorInternals();
  const parts = ["`", "``", "```", BSL + "`", "word", " ", "  ", "\t", "\n", "\n", "\n\n", "\n   \n", "\n# h\n", "\n## ", "\n- item ", "\n* ", "\n+ x", "\n1. n ", "\n12) m ", "\n    - indented ", "\n#nohash ", "\n2. n ", "\n14) ", "\n*\n", "\n-\n", "\n***\n", "\n===\n", "\n  2. k ", "`c`", "`d `", "[a](b)", "x"];
  const rnd = seeded(745);
  let withSpans = 0, crossing = 0;
  for (let n = 0; n < 3000; n++) {
    const count = 1 + Math.floor(rnd() * 24);
    let text = "";
    for (let i = 0; i < count; i++) text += parts[Math.floor(rnd() * parts.length)];
    const got = codeSpanMask(text) as Uint8Array, want = referenceMask(text, inlineBlockReader);
    assert.deepEqual(Array.from(got), Array.from(want), "text " + JSON.stringify(text) + " (seed 745, case " + n + ")");
    if (got.some((v) => v === 1)) withSpans++;
    if (/`[^`]*\n[^`]*`/.test(text)) crossing++;
  }
  // the generator has to reach both outcomes, or the comparison proves nothing
  assert.ok(withSpans > 100 && crossing > 300, withSpans + " texts with a span, " + crossing + " with a backtick pair over a line break");
});

// A fixed time limit once passed here and failed on a slower CI runner, so growth is compared: lengths 1..K are opened in order, a blank line follows and they are
// closed in reverse, so every one of the K pairs spans most of the document and crosses a block
// boundary. The mask with block counters grows with the input; calling the old function for each pair
// grew about three to four times faster than the input (measured 2026-11-04 in a temp copy of the scan:
// the larger input is 24 times the smaller, the counters took 20 times as long, the old function 83).
test("Tek-745: the mask stays linear when many nested pairs all cross a block boundary", async () => {
  const { codeSpanMask } = loadValidatorInternals();
  const nested = (K: number) => {
    let s = "# T\n\n> s\n\n## Docs\n\n";
    for (let L = 1; L <= K; L++) s += "`".repeat(L) + " ";
    s += "\n\n";
    for (let L = K; L >= 1; L--) s += "`".repeat(L) + " ";
    return s + "\n";
  };
  const small = nested(96), large = nested(480);
  assert.ok(large.length > 200 * 1024 && large.length < 256 * 1024, "the large input is 256 KiB class: " + large.length);
  // every pair crosses, so nothing is masked and nothing is consumed
  assert.equal((codeSpanMask(large) as Uint8Array).some((v) => v === 1), false);
  // This test passes its own limit, sizes * 2 (about 48.7 for 24.3x the characters), because its input is quadratic in K:
  // 5x the pairs is 24.3x the characters, so the shared limit sizes ** 1.5 (about 120) would also let a rescan per
  // pair, which grows as sizes ** 1.5 (measured ratio about 78), pass. The current mask measures about 15 to 18.
  await assertLinear("nested pairs", (text) => codeSpanMask(text), small, large, 2 * (large.length / small.length));
});

// --- Tek-747: the block reading of codeSpanMask against commonmark.js 0.31.2, the CommonMark reference implementation.
// Every count below is what that parser gave on 2026-11-04 for the document with @ replaced by one absolute link. Where
// micromark differs, on "01.", the reference implementation decides, and it compares the start number as a number.
const CM_LINKS: [string, number][] = [
  // A heading line is a block of its own, so its backtick does not pair with the next line.
  ["## a ` @\nc ` d\n", 1],
  ["## a `\n` @ `\n", 0],
  ["### a ` b\n@ `\n", 1],
  ["## a `b` @\nc\n", 1],
  ["a `\n## b` @\n", 1],
  ["a\n## b ` @\nc ` d\n", 1],
  // An empty item cannot interrupt a paragraph. A lone hyphen there is a setext underline, and an empty item inside an open list is a real item.
  ["a `@\n* \nc` d\n", 0],
  ["a `@\n+\nc` d\n", 0],
  ["a `@\n1.\nc` d\n", 0],
  ["a `@\n1. \nc` d\n", 0],
  ["a `@\n- \nc` d\n", 1],
  ["a `@\n-\nc` d\n", 1],
  ["- a `@\n*\nc` d\n", 1],
  ["* a `@\n*\n* c` d\n", 1],
  ["a\n\n*\n`@\nb` c\n", 0],
  // An ordered item that does not start at 1 cannot interrupt a paragraph, unless a line indented less than the open item closes that item.
  ["a `@\n2. c` d\n", 0],
  ["a `@\n14) c` d\n", 0],
  ["a `@\n0. c` d\n", 0],
  ["a `@\n1. c` d\n", 1],
  ["a `@\n01. c` d\n", 1],
  ["1. a `@\n2. c` d\n", 1],
  ["- a `@\n2. c` d\n", 1],
  ["- a `@\n  2. c` d\n", 0],
  ["- a\n\nb `@\n2. c` d\n", 0],
  ["1. a\n\n   b `@\n2. c` d\n", 1],
  ["1. a\nb `@\n2. c` d\n", 1],
  ["1. 2. a `@\n   3. c` d\n", 1],
  ["- a\n  - b `@\n  2. c` d\n", 1],
  ["2. a `@\n3. c` d\n", 1],
  ["-   a `@\n  2. c` d\n", 1],
  ["-\ta `@\n  2. c` d\n", 1],
  ["-      a `b\n  c` @ `\n", 0],
  // A thematic break and a setext underline end a paragraph. "=" under a lazy line does not, and with no paragraph open it is text.
  ["a `@\n***\nc` d\n", 1],
  ["a `@\n- - -\nc` d\n", 1],
  ["a `@\n===\nc` d\n", 1],
  ["a `@\n---\nc` d\n", 1],
  ["- a `@\n===\nc` d\n", 0],
  ["- a `@\n---\nc` d\n", 1],
  ["a\n\n===\n`@\nb` c\n", 0],
  // A fence the caller does not blank stays one block, and so does a run of indented code, so a backtick fence hides what it
  // holds. An item closes with its fence. An empty item ends at a blank line. Then tab stops and the five-column rule.
  ["- e:\n    ```md\n    # t\n    - @\n    ```\n", 0],
  ["- i:\n    ```sh\n    # c\n    curl @\n    ```\n", 0],
  ["- e:\t\n\t```md\n\t# t\n\t@\n\t```\n", 0],
  ["- e:\n    ```\n    a\n\n    @\n    ```\n", 0],
  ["1. e:\n    ```\n    2. a\n    @\n    ```\n", 0],
  ["- e:\n    ```\n    a\nb ` @\n\nc`\n", 1],
  ["- e:\n    ````\n    ```\n    @\n    ````\n", 0],
  ["a\n\n    ```\n    @\n    ```\n", 0],
  ["a\n\n    `b\n    @\n    c`\n", 0],
  ["*\n\n   + `\n    ##   `@`\n", 1],
  ["1.\n\n   a `@\n2. b` c\n", 0],
  ["1.    a `@\n  \t1. c` d\n", 0],
  ["-\ta `@\n    1. c` d\n", 1],
  ["-     a `b\n  c` @ `\n", 0],
  ["-    a `@\n  2. c` d\n", 1],
  ["- e:\n    ```\n    ``` x\n    ` @\n\n    `\n    ```\n", 0],
  ["- e:\n    ```\n        ```\n    ` @\n\n    `\n    ```\n", 0],
  ["    a\n# h ` @\n    b `\n", 1],
  ["*\n  a\n\n  b `@\n2. c` d\n", 1],
  // A fence line is masked whole, whatever closes the fence and whichever character it uses, and it holds no run.
  ["- e:\n    ~~~\n    # t\n    @\n    ~~~\n", 0],
  ["- e:\n    ~~~\n    @\n    ~~~\n", 0],
  ["- e:\n    ```\n    # t\n    @\n- b\n", 0],
  ["- e:\n    ```\n    @\n    ````\n", 0],
  ["- e:\n    ```\n    ```js\n    @\n    ```\n", 0],
  ["- ```md\n  # t\n  @\n  ```\n", 0],
  ["- ``` @\n  a\n  ```\n", 0],
  ["- e:\n    ```\n    `\n    ```\n  @\n    ```\n    `\n    ```\n", 1],
  ["- a\n\n  *\n\n  b `@\n2. c` d\n", 1],
  ["- e:\n    ~~~\n    ```\n    @\n    ~~~\n", 0],
  ["- e:\n    ```\n     ```\n  @\n", 1],
  // What did not change.
  ["a `@\nb` c\n", 0],
  ["a `\n\nb` @\n", 1],
  ["- `literal\n- @\n- literal`\n", 1],
  ["`one\n# two` @\n", 1],
  ["    `a\n@ b`\n", 1],
];

const cmInput = (text: string, extra: Record<string, unknown> = {}) => ({ status: 200, contentType: "text/plain; charset=utf-8", linkHeader: "", text, bytes: text.length, truncated: false, ...extra });

test("Tek-747: the link count equals the CommonMark reference on every line form of the three differences", () => {
  const { validateLlmsTxt } = loadValidatorInternals();
  for (const [body, want] of CM_LINKS) {
    const text = "# T\n\n> s\n\n## Docs\n\n" + body.replaceAll("@", "[l](https://example.com/a)");
    const detail: string = validateLlmsTxt(cmInput(text)).find((c: { id: string }) => c.id === "links").detail;
    const m = /^(\d+) links?/.exec(detail);
    assert.equal(m ? Number(m[1]) : 0, want, JSON.stringify(body) + " read as: " + detail);
  }
});

test("Tek-747: the mask itself on the three differences", () => {
  const { codeSpanMask } = loadValidatorInternals();
  const shown = (t: string) => Array.from(codeSpanMask(t) as Uint8Array, (v, i) => (v ? t[i] : "-")).join("");
  // a heading line is a block of its own
  assert.equal(shown("## a `\nb` c"), "-----------");
  // an empty item and an ordered item that does not start at 1 continue the paragraph
  assert.equal(shown("a `b\n*\nc` d"), "--`b\n*\nc`--");
  assert.equal(shown("a `b\n2. c` d"), "--`b\n2. c`--");
  // a lone hyphen is a setext underline, so the paragraph ends there
  assert.equal(shown("a `b\n-\nc` d"), "-----------");
  // the next item of an open list is a new block, and a marker indented into the open item is not
  assert.equal(shown("1. a `b\n2. c` d"), "---------------");
  assert.equal(shown("- a `b\n  2. c` d"), "----`b\n  2. c`--");
});

test("Tek-747: the block reader stays linear on nested markers and a deep item stack", async () => {
  const { codeSpanMask } = loadValidatorInternals();
  const fill = (s: string, n: number) => s.repeat(Math.ceil(n / s.length)).slice(0, n);
  const shapes: [string, (n: number) => string][] = [
    ["one line of nested bullets", (n) => fill("- ", n) + "x\n"],
    ["one line of nested ordered items", (n) => fill("1. ", n) + "x\n"],
    ["a deep item stack and indented lines", (n) => { let s = fill("- ", n / 2) + "x\n"; while (s.length < n) s += " ".repeat(200) + "y `\n"; return s; }],
    ["marker-shaped lines in one paragraph", (n) => "x\n" + fill("14) a ` b\n", n)],
  ];
  for (const [name, make] of shapes) {
    await assertLinear(name, (text) => codeSpanMask(text), make(16 * 1024), make(128 * 1024));
  }
});

test("Tek-747: the report's sentences are separated by a period, checked as the exact wording of each row", () => {
  const { validateLlmsTxt } = loadValidatorInternals();
  const report = (f: unknown, id: string): string => validateLlmsTxt(f).find((c: { id: string }) => c.id === id).detail;
  const head = "# T\n\n> s\n\n## Docs\n\n";
  const link = "- [a](https://example.com/a)\n";
  const rows: [string, string, string][] = [
    ["h1-title", "#\n\n> s\n\n## Docs\n\n" + link, "the H1 has no text. The format requires the project name there"],
    ["sections", "# T\n\n> s\n\n[a](https://example.com/a)\n", "no H2 sections found. Sections are the convention for grouping links"],
    ["sections", head + "[a](https://example.com/a)\n", "1 section but no file list under any of them. The format puts a section's links in a markdown list"],
    ["sections", "# T\n\n### Early\n\n> s\n\n## Docs\n\n" + link, "1 section, 1 carrying a file list. The heading at line 3 is out of place, because the format has one H1 and no other heading before the first H2"],
    ["links", head + "- [](https://example.com/a)\n", "1 link, 1 with an empty link name. An entry needs a name an agent can show"],
    ["links", head + link + "- [b](/rel)\n", "2 links, 1 relative. Absolute URLs travel better when the file is read out of context"],
    ["links", head + link + "- [b](https://example.com/b: notes)\n", "1 link, all absolute URLs. 1 list line looks like a link entry but is not a Markdown link (line 8)"],
    ["links", head + link + "\u2013 [b](https://example.com/b)\n", "2 links, all absolute URLs. 1 list line opens with a dash or bullet that is not a Markdown list marker (line 8)"],
    ["no-html", head + link + "\n<div>x</div>\n", "HTML tags found. llms.txt should be plain markdown"],
  ];
  for (const [id, text, want] of rows) assert.equal(report(cmInput(text), id), want);
  assert.equal(report(cmInput(head + link, { bytes: 200000 }), "size"), "200000 bytes. Consider moving detail to llms-full.txt");
  assert.equal(report({ redirect: true, reason: "off-host", status: 301, location: "https://other.example/llms.txt" }, "http-status"), "redirects to https://other.example/llms.txt, a different host. llms.txt is host-scoped, so validate that host directly");
  assert.equal(report({ redirect: true, reason: "unsafe-target", status: 301, location: "http://example.com/llms.txt" }, "http-status"), "redirects to an unsupported target (http://example.com/llms.txt). Only https redirects to the same site are followed");
  assert.equal(report({ redirect: true, reason: "too-many", status: 301, location: "" }, "http-status"), "too many redirects. The llms.txt is not served at a stable URL");
});

// --- Tek-749: one reading of a fence. fenceMask takes its fences from inlineBlockReader. Each row is a body under one H2, with the link
// count and the number of sections carrying a file list that commonmark.js 0.31.2 gave on 2026-11-04, @ being one absolute link.
// Before this, a closing line at 0 to 3 columns of a fence fenceMask had not seen opened a new fence and hid the rest of the file.
const FENCE_ROWS: [string, number, number][] = [
  ["- ```\n  a\n  ```\n- @\n", 1, 1],
  ["- a\n    ```\n    b\n  ```\n- @\n", 1, 1],
  ["- a\n\t```\n\tb\n  ```\n- @\n", 1, 1],
  ["- a\n  ```\n  b\n- @\n", 1, 1],
  ["1. a\n   ```\n   b\n2. @\n", 1, 1],
  ["- a\n  ```\n  ## x\n  ```\n- @\n", 1, 1],
  ["- a\n    ```\n    ## x\n    - @\n    ```\n", 0, 0],
  ["- ```\n  ## x\n  @\n  ```\n", 0, 0],
  ["- a\n    ```\n    b\n\n@\n", 1, 0],
  ["- a\n    ~~~\n    b\n  ~~~\n- @\n", 1, 1],
  ["- a\n    ```\n    b\n```\n- @\n", 0, 0],
  ["- a\n  - b\n      ```\n      c\n    ```\n- @\n", 1, 1],
  ["- a\n\n      ```\n      b\n- @\n", 1, 1],
  ["```\na\n```\n- @\n", 1, 1],
  ["  ```\n  a\n  ```\n- @\n", 1, 1],
  ["- @\n```\n- not\n", 1, 1],
  ["- a\n  - b\n    ```\n    x\n    ```\n  @\n", 1, 1],
  ["- a\n  - b\n\n  @\n", 1, 1],
  ["- a\n\n  *\n\n  @\n", 1, 1],
  ["- a\n  ```\n  b\n  ```\n@\n", 1, 0],
  ["- a\n  - b\n\n@\n", 1, 0],
  ["1. a\n   - b\n     ```\n     c\n     ```\n   @\n", 1, 1],
  ["- a\n  - b\n\n    c\n\n  - @\n", 1, 1],
  ["- a\n  - b\n    ```\n    c\n    ```\n- d\n\n  @\n", 1, 1],
  ["-   x\n```\n```\n    ```\n  @\n    ```\n", 1, 0],
  ["-\n    ```\n    ```\n\n  @\n", 1, 1],
  ["- a\n    ```js `x`\n    @\n", 1, 1],
  ["- a\n```\n```\n  `@\n2. b`\n", 0, 0],
  ["-   a\n- b\n\n  @\n", 1, 1],
  ["- a\n\nb\n\n  - c\n\n  @\n", 1, 0],
  ["*\n\n  @\n", 1, 0],
  ["- a\n    ```\n    b\n ```\n- @\n", 0, 0],
  ["  7. a\n\t + n\n     ~~~~\n     ~~~~\n         ```sh\n        @\n", 1, 1],
];

test("Tek-749: the links and sections checks read a fence and a nested item the way the reference does", () => {
  const { validateLlmsTxt } = loadValidatorInternals();
  const at = (checks: { id: string; detail: string; status: string }[], id: string) => checks.find((c) => c.id === id)!;
  for (const [body, links, lists] of FENCE_ROWS) {
    const checks = validateLlmsTxt(cmInput("# T\n\n> s\n\n## Docs\n\n" + body.replace("@", "[l](https://example.com/a)")));
    const l = /^(\d+) links?/.exec(at(checks, "links").detail);
    assert.equal(l ? Number(l[1]) : 0, links, "links of " + JSON.stringify(body));
    const s = /^1 section, (\d+) carrying/.exec(at(checks, "sections").detail);
    assert.equal(s ? Number(s[1]) : 0, lists, "sections of " + JSON.stringify(body));
  }
  const html = validateLlmsTxt(cmInput("# T\n\n> s\n\n## Docs\n\n- a\n    ```sh\n    echo '<endpoint-id>'\n    # c\n    ```\n- [l](https://example.com/a)\n"));
  assert.equal(at(html, "no-html").status, "pass", "angle brackets inside a fence in a list item are not markup");
  assert.equal(at(html, "links").detail, "1 link, all absolute URLs");
  // One read of the raw lines: a second read of the blanked text would not pair these backticks, and the tag would read as markup.
  assert.equal(at(validateLlmsTxt(cmInput("# T\n\n> s\n\n## Docs\n\n- [k](https://example.com/k)\n\n```\n```\n  `<div>\n2. b`\n")), "no-html").status, "pass");
});
