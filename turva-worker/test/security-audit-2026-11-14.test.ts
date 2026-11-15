import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker, { findLinkRelations, renderInline, markdownToHtml } from "../src/worker.ts";
import { stripTypes } from "../test-support/strip-types.ts";

// Repairs after a security read of the public repositories (2026-11-14). The hosted parity check refuses a
// selector with more than one general-sibling combinator before css-select runs it. The hosted llms.txt validator
// reads nested image openers and angle-bracket targets in linear time, scans a long definition target shared by many
// references once, loses the invisible formatting characters from its JSON detail, hides user information that
// holds a ? or # or follows a scheme the URL parser refuses, reads a backslash before a line break and a heading
// inside a raw HTML block as CommonMark does, and reads past <!--> and an svg template in the head of a page.
// The content security policy lets images and connections reach only the site, and a test walks every page to prove
// that nothing needs more.

// Growth check, the same method as test/validator-tek730.test.ts (inline here because every file in
// test/ is run as a test file). Two inputs of one shape are timed, the larger about four times the
// smaller, the fastest of several rounds counts, and the limit sits on the log scale half way between a
// linear scan (4x) and a quadratic one (16x): sizes ** 1.5. A fixed limit in milliseconds would fail on a
// slow runner and let a slow but quadratic scan through.
async function timeIt(work: (input: string) => unknown, input: string, reps: number): Promise<number> {
  const started = performance.now();
  for (let i = 0; i < reps; i++) {
    const out = work(input);
    if (out instanceof Promise) await out;
  }
  return performance.now() - started;
}
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
async function assertLinear(label: string, work: (input: string) => unknown, small: string, large: string): Promise<void> {
  const sizes = large.length / small.length;
  const limit = growthLimit(sizes);
  const g = await growthRatio(work, small, large, limit);
  assert.ok(g.ratio < limit, label + ": " + sizes.toFixed(1) + "x the input took " + g.ratio.toFixed(1) + "x as long after " + g.rounds + " rounds, limit " + limit.toFixed(1));
}

// ---- the hosted parity check refuses a selector with too many ~ combinators ----

const limiter = { async limit() { return { success: true }; } };
function parityPost(selector: string) {
  const init = { method: "POST", headers: { accept: "application/json", "content-type": "application/json", "cf-connecting-ip": "203.0.113.9" }, body: JSON.stringify({ url: "https://turva.dev/guides/llms-txt", selector }) };
  return worker.fetch(new Request("https://turva.dev/markdown-parity-check", init), { PARITY_LIMITER: limiter });
}
const REFUSAL = /more than 1 general-sibling combinator \(~\)/;
const rep = (s: string, n: number) => new Array(n).fill(s).join("");
const chain = (ops: number) => "*" + rep(" ~ *", ops);

test("the parity check answers a chain of 24 sibling combinators with 422 in under 100 ms, before css-select runs it", async () => {
  const started = performance.now();
  const res = await parityPost(chain(24));
  const ms = performance.now() - started;
  assert.equal(res.status, 422);
  const report = JSON.parse(await res.text());
  assert.equal(report.summary.result, "error");
  assert.match(report.summary.error, REFUSAL);
  assert.equal(report.summary.errorValue, chain(24));
  assert.ok(ms < 100, "took " + ms.toFixed(0) + " ms");
});

test("the parity check refuses two sibling combinators, in every place a selector can hold them", async () => {
  const refused = [
    chain(2),
    ":has(" + chain(2) + ")",
    "*:not(" + chain(2) + ")",
    ":is(" + chain(2) + ")",
    "a ~ b, c ~ d",
    ":has(* ~ *):has(* ~ *)",
    "[a=it's] ~ * ~ *",
    "* ~ *~*",
    "*:has(~ * ~ *)",
  ];
  for (const sel of refused) {
    const started = performance.now();
    const res = await parityPost(sel);
    assert.equal(res.status, 422, sel);
    assert.match(JSON.parse(await res.text()).summary.error, REFUSAL, sel);
    assert.ok(performance.now() - started < 100, sel);
  }
});

test("the parity check limit is one sibling combinator, and ordinary selectors are not refused", async () => {
  const accepted = [
    "main",
    "article .content",
    "main h1 ~ p",
    chain(1),
    ":has(" + chain(1) + ")",
    '[data-x~="a"]',
    "[a~=b][c~=d][e~=f][g~=h][i~=j][k~=l]",
    '[title="a ~ b ~ c ~ d ~ e ~ f ~ g"]',
    "[title='a ~ b ~ c ~ d ~ e ~ f ~ g']",
    "[title=a~b~c~d~e~f~g]",
    "div" + rep("\\~x", 8),
  ];
  for (const sel of accepted) {
    const res = await parityPost(sel);
    const text = await res.text();
    assert.ok(!REFUSAL.test(text), sel + " was refused");
    assert.ok(res.status === 200 || res.status === 422, sel + " answered " + res.status);
  }
  const main = await parityPost("main");
  assert.equal(main.status, 200);
  assert.equal(JSON.parse(await main.text()).summary.result, "pass");
  const none = await parityPost('[data-x~="a"]');
  assert.equal(none.status, 422);
  assert.match(JSON.parse(await none.text()).summary.error, /matched nothing/);
});

// ---- the second limit: the hosted route does not run :has( at all ----

const HAS_REFUSAL = /^The CSS selector uses the :has\(\) pseudo-class, which this hosted version does not run\.$/;
const B1 = String.fromCharCode(92);

test("the parity check refuses every selector that holds :has(, in any case, escape or position, fast and in its own sentence", async () => {
  const refused = [
    ":has(+ .zz)",
    "main:has(h1)",
    ":HAS(a)",
    ":Has(a) b",
    ":" + B1 + "68 as(a)",
    ":ha" + B1 + "73(a)",
    ":" + B1 + "000068as(a)",
    ":h" + B1 + "61" + B1 + "73(a)",
    ":not(:has(a))",
    ":is(:has(a), b)",
    ":nth-child(n of :has(a))",
    "a:has(b):has(c)",
    ":has(a),:has(b)",
    ":has(+.zz),".repeat(25).slice(0, 296),
    ":has(+".repeat(42) + ".zz" + ")".repeat(42),
    // The counter tries every colon, so these over-count and are refused too: no :has( is run in any of them.
    "::has(a)",
    "[data-x=':has(']",
    ':contains(":has(")',
  ];
  for (const sel of refused) {
    const started = performance.now();
    const res = await parityPost(sel);
    assert.equal(res.status, 422, sel);
    const report = JSON.parse(await res.text());
    assert.match(report.summary.error, HAS_REFUSAL, sel);
    assert.equal(report.summary.errorValue, sel);
    assert.ok(performance.now() - started < 100, sel);
  }
});

// ---- the third limit: a functional pseudo-class inside the argument of another one ----

const NEST_REFUSAL = /^The CSS selector puts a functional pseudo-class inside the argument of another one, which this hosted version does not run\.$/;
const nest = (inner: string, depth: number, wrap: string) => (wrap + "(").repeat(depth) + inner + ")".repeat(depth);

test("the parity check refuses a functional pseudo-class inside the argument of another one, fast and in its own sentence", async () => {
  const refused = [
    ":nth-child(n of :nth-child(n of :nth-child(n of *)))",
    ":nth-child(n of :nth-child(n of :nth-child(n of :nth-child(n of *))))",
    ":nth-child(n of :nth-last-child(n of :nth-child(n of *)))",
    ":nth-child(n of :nth-child(n of :nth-child(n of * *)))",
    ":nth-child(n of :nth-child(n of :nth-child(n of :nth-child(n of * *))))",
    ":nth-child(n of :is(:nth-child(n of :is(:nth-child(n of :is(:nth-child(n of *))))))",
    ":nth-child(n of :contains(z) :nth-child(n of :contains(z)))",
    nest("*", 4, ":is"),
    nest("*", 4, ":where"),
    nest("*", 8, ":not"),
    ":not(:is(a))",
    ":is(a, :not(b))",
    ":nth-child(2n+1 of :nth-child(n of a))",
    ":is(a):not(b :where(c))",
    ":not([a=\")\"] :is(b))",
    ":not(:is(\\)))",
  ];
  for (const sel of refused) {
    const started = performance.now();
    const res = await parityPost(sel);
    assert.equal(res.status, 422, sel);
    const report = JSON.parse(await res.text());
    // An nth pseudo-class is refused before the nesting depth is counted, so a chain that holds one gets that sentence.
    assert.match(report.summary.error, /:nth-/.test(sel) ? NTH_REFUSAL : NEST_REFUSAL, sel);
    assert.equal(report.summary.errorValue, sel);
    assert.ok(performance.now() - started < 100, sel);
  }
});

test("pseudo-classes at depth one, side by side, are not refused for nesting, and the earlier limits are checked first", async () => {
  const accepted = [":first-child", ":last-child", ":is(a, b, c)", ":not(.zz):not(.yy):is(li)", ":first-child:last-child", "li:first-of-type", ":contains(abc)", "[a=\"(\"]:is(b)", "[a='x(y']:not(c)"];
  for (const sel of accepted) {
    const text = await (await parityPost(sel)).text();
    assert.ok(!NEST_REFUSAL.test(JSON.parse(text).summary.error || ""), sel + " was refused for nesting");
  }
  assert.match(JSON.parse(await (await parityPost(":has(:is(a))")).text()).summary.error, HAS_REFUSAL);
  assert.match(JSON.parse(await (await parityPost(":is(:not(a ~ b ~ c))")).text()).summary.error, REFUSAL);
});

// ---- the fourth limit: no :nth-child() and its kin ----

const NTH_REFUSAL = /^The CSS selector uses an :nth-child\(\), :nth-last-child\(\), :nth-of-type\(\) or :nth-last-of-type\(\) pseudo-class, which this hosted version does not run\.$/;

test("the parity check refuses every :nth-child() style pseudo-class, in any case, escape or position, fast and in its own sentence", async () => {
  const refused = [
    ":nth-child(2)",
    "li:nth-child(2n+1)",
    ":nth-last-child(odd)",
    ":nth-of-type(2)",
    ":nth-last-of-type(even)",
    ":nth-child(n of li)",
    ":NTH-CHILD(2)",
    ":" + B1 + "6e th-child(2)",
    ":nth" + B1 + "2d child(2)",
    "a:not(:nth-child(2))",
    ".zz:nth-child(2) ~ *:not(.zz) *",
    "a+*:not(.zz):is(*, li):nth-child(2) ~ *:not(.zz) *",
    "div *:not(.zz) [class]:nth-child(2)+.zz:nth-child(2)+*:not(.zz):is(*) ~ *:not(.zz) *:not(.zz):is(*, li)",
  ];
  for (const sel of refused) {
    const started = performance.now();
    const res = await parityPost(sel);
    assert.equal(res.status, 422, sel);
    const report = JSON.parse(await res.text());
    assert.match(report.summary.error, /^The CSS selector (uses an :nth-child|puts a functional pseudo-class)/, sel);
    assert.equal(report.summary.errorValue, sel);
    assert.ok(performance.now() - started < 100, sel);
  }
  assert.match(JSON.parse(await (await parityPost("li:nth-child(2)")).text()).summary.error, NTH_REFUSAL);
  // First, last and only child, text matching and an nth name inside text that is no pseudo-class are not refused for it.
  for (const sel of ["li:first-child", ":last-child", ":only-child", ":first-of-type", "[title=':nth-child(2)']x", ":contains(nth-child)"]) {
    const text = await (await parityPost(sel)).text();
    assert.ok(!NTH_REFUSAL.test(JSON.parse(text).summary.error || "") || sel.startsWith("[title"), sel + " was refused for nth");
  }
});

test("the nesting depth counter never reports less than the CSS parser reads, and over-counts only where it cannot tell", () => {
  const depth = loadFunction<(s: string) => number>("parityNestDepth");
  assert.equal(depth("a b"), 0);
  assert.equal(depth(":is(a)"), 1);
  assert.equal(depth(":is(a):not(b)"), 1);
  assert.equal(depth(":is(:not(a))"), 2);
  assert.equal(depth(":nth-child(n of :is(a))"), 2);
  assert.equal(depth(":is(a :not(b :where(c)))"), 3);
  assert.equal(depth("[a=\")\"]:is(:not(x))"), 2);
  assert.equal(depth(":is([a=\")\"] :not(x))"), 2);
  assert.equal(depth(":is(\\):not(x))"), 2);
  assert.equal(depth(":is(a\\)):not(x)"), 1);
  // Parentheses in the data of :contains() are counted, so a balanced pair there reads as a nesting level.
  assert.equal(depth(":contains(a(b))"), 2);
});

test("selectors without a :has( name are not refused for it, and the sibling limit is checked first", async () => {
  const accepted = [":hash(a)", "a:hover", ":not(.zz)", ":is(main, article)", ":first-child", "main", "has(a)", "[data-x=has]"];
  for (const sel of accepted) {
    const text = await (await parityPost(sel)).text();
    assert.ok(!HAS_REFUSAL.test(JSON.parse(text).summary.error || ""), sel + " was refused for :has(");
    assert.ok(!REFUSAL.test(text), sel + " was refused as a sibling chain");
  }
  const both = await parityPost(":has(* ~ *):has(* ~ *)");
  assert.match(JSON.parse(await both.text()).summary.error, REFUSAL);
  const one = await parityPost(":has(* ~ *)");
  assert.match(JSON.parse(await one.text()).summary.error, HAS_REFUSAL);
});

test("the :has( counter reads the names the CSS parser reads as has, whatever the case and the escapes, and counts nothing else", async () => {
  const counter = loadFunction<(s: string) => number>("parityCountHas");
  // Each of these is the name has for css-what (checked against its parse when the test was written).
  const names = ["has", "HAS", "Has", B1 + "68 as", B1 + "0068 as", B1 + "000068as", "ha" + B1 + "73", "h" + B1 + "61" + B1 + "73", "ha" + B1 + "73 ", B1 + "68 " + B1 + "61 " + B1 + "73", B1 + "68 a" + B1 + "73"];
  for (const n of names) assert.equal(counter(":" + n + "(a)"), 1, n);
  assert.equal(counter(":has(a):has(b)"), 2);
  assert.equal(counter("a ~ b"), 0);
  assert.equal(counter(":hash(a)"), 0);
  assert.equal(counter(":not(a):is(b)"), 0);
  assert.equal(counter("::has(a)"), 1);
});

test("the worst selectors the limits still allow stay cheap on the largest real page", async () => {
  // No :has( and at most one ~, up to 300 characters: + chains, a leading + or ~ inside :not, :is and :where,
  // descendant chains, and the one allowed ~ at the head of a long chain.
  const shapes = [
    "* ~ *",
    "~ *",
    ".zz ~ *",
    ":not(~ *)",
    ":not(:not(~ *))",
    ":is(+ .zz)",
    ":not(+ * + * + .zz)",
    "* + " + "* + ".repeat(60) + ".zz",
    ":scope + " + "* + ".repeat(60) + "*",
    "* ".repeat(140) + "*",
    "* ~ " + "* ".repeat(140) + "*",
    "li:first-child:not(.zz) ".repeat(10) + "~ *",
    "*:not(.zz):is(*, li) ".repeat(14) + "~ *",
    "*:not(.zz):is(*, li) ".repeat(7) + "~ " + "*:not(.zz):is(*, li) ".repeat(6),
  ];
  for (const sel of shapes) {
    const started = performance.now();
    const res = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", { method: "POST", headers: { accept: "application/json", "content-type": "application/json", "cf-connecting-ip": "203.0.113.9" }, body: JSON.stringify({ url: "https://turva.dev/samples/audit-report", selector: sel }) }), { PARITY_LIMITER: limiter });
    const ms = performance.now() - started;
    assert.ok(res.status === 200 || res.status === 422, sel + " answered " + res.status);
    const text = await res.text();
    assert.ok(!HAS_REFUSAL.test(JSON.parse(text).summary.error || "") && !REFUSAL.test(text), sel + " was refused");
    assert.ok(ms < 500, sel + " took " + ms.toFixed(0) + " ms on /samples/audit-report");
  }
});

test("the parity page form answers a refused selector under the selector field", async () => {
  const post = (selector: string) => worker.fetch(new Request("https://turva.dev/markdown-parity-check", { method: "POST", headers: { accept: "text/html", "content-type": "application/x-www-form-urlencoded", "cf-connecting-ip": "203.0.113.9" }, body: new URLSearchParams({ url: "https://turva.dev/tools", selector }).toString() }), { PARITY_LIMITER: limiter });
  const res = await post(chain(8));
  assert.equal(res.status, 422);
  const html = await res.text();
  assert.ok(html.includes('id="mpc-selector-err"'));
  assert.match(html, REFUSAL);
  const hasRes = await post("main:has(h1)");
  assert.equal(hasRes.status, 422);
  const hasHtml = await hasRes.text();
  assert.ok(hasHtml.includes('id="mpc-selector-err"'));
  assert.ok(hasHtml.includes("The CSS selector uses the :has() pseudo-class, which this hosted version does not run."));
});

// ---- the hosted validator, with its two fetches stubbed ----

async function validate(llms: string, home: string = ""): Promise<{ checks: Array<{ id: string; status: string; detail?: string }>; raw: string }> {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: unknown) => {
    const u = String(url);
    if (u === "https://example.com/llms.txt") return new Response(llms, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    if (u === "https://example.com/") return home === "" ? new Response("", { status: 404, headers: { "content-type": "text/html" } }) : new Response(home, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    throw new Error("unexpected fetch to " + u);
  }) as typeof fetch;
  try {
    const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com", { headers: { accept: "application/json" } }), {});
    assert.equal(res.status, 200);
    const raw = await res.text();
    return { checks: JSON.parse(raw).checks, raw };
  } finally {
    globalThis.fetch = realFetch;
  }
}

// ---- nested image openers ----

test("a text of nested image openers is read in time that grows linearly", async () => {
  const doc = (d: number) => "![".repeat(d) + "]".repeat(d);
  const work = async (s: string) => { await validate(s); };
  // Three doublings: each step must stay well under the factor 4 a quadratic scan gives.
  await assertLinear("8192 and 16384 openers", work, doc(8192), doc(16384));
  await assertLinear("16384 and 32768 openers", work, doc(16384), doc(32768));
  await assertLinear("8192 and 32768 openers", work, doc(8192), doc(32768));
});

test("nested image openers with a collapsed reference after each closer are read in linear time", async () => {
  const doc = (d: number) => "![".repeat(d) + "]".repeat(d) + "[]".repeat(d);
  await assertLinear("8192 and 32768 openers", async (s: string) => { await validate(s); }, doc(8192), doc(32768));
});

test("images and reference images still hide the links inside their alt text", async () => {
  const base = "# Example\n\n> Summary.\n\n## Docs\n\n";
  const detail = async (t: string) => (await validate(base + t + "\n")).checks.find((c) => c.id === "links")!.detail;
  assert.equal(await detail("- [Guide](https://example.com/guide) ![alt [inner](https://example.com/x)](https://example.com/i.png)"), "1 link, all absolute URLs");
  assert.equal(await detail("- ![![a]](https://example.com/i.png) [Guide](https://example.com/guide)"), "1 link, all absolute URLs");
  assert.equal(await detail("- ![alt [inner](https://example.com/x)][r] [Guide](https://example.com/guide)\n\n[r]: https://example.com/i.png"), "1 link, all absolute URLs");
  assert.equal(await detail("- ![a] [Guide](https://example.com/guide)\n\n[a]: https://example.com/i.png"), "1 link, all absolute URLs");
  assert.equal(await detail("- ![a [Guide](https://example.com/guide)"), "1 link, all absolute URLs");
});

// ---- a shared long definition target ----

test("many references to one long definition target do not scan it once per reference", async () => {
  const doc = (d: number, r: number) => "[a]: " + "a".repeat(d) + "\n" + "[a] ".repeat(r);
  // Four times the target length and four times the references: a scan per reference grows 16 times.
  await assertLinear("16384 x 4096 and 65536 x 16384", async (s: string) => { await validate(s); }, doc(16384, 4096), doc(65536, 16384));
});

test("the relative and hostless counts of the links check stay the same", async () => {
  const base = "# Example\n\n> Summary.\n\n## Docs\n\n";
  const detail = async (t: string) => (await validate(base + t + "\n")).checks.find((c) => c.id === "links")!.detail;
  assert.match(String(await detail("- [a](https://example.com/a)\n- [b](/b)\n- [c](https://)\n- [d](mailto:x@example.com)")), /^4 links, 1 relative and 2 that are not valid http or https URLs\./);
  assert.match(String(await detail("- [a][r]\n- [b][r]\n- [c][r]\n\n[r]: /rel")), /^3 links, 3 relative\./);
});

// ---- invisible characters in the JSON detail ----

const INVISIBLE: Array<[string, number]> = [
  ["LRM", 0x200E], ["RLM", 0x200F], ["ALM", 0x061C], ["LS", 0x2028], ["PS", 0x2029],
  ["ZWSP", 0x200B], ["ZWNJ", 0x200C], ["ZWJ", 0x200D], ["WJ", 0x2060], ["BOM", 0xFEFF],
  ["TAG A", 0xE0041], ["TAG begin", 0xE0001], ["TAG first", 0xE0000], ["TAG last", 0xE007F],
];
const ALREADY: Array<[string, number]> = [["LRE", 0x202A], ["RLO", 0x202E], ["RLI", 0x2067], ["PDI", 0x2069], ["C1", 0x85]];

test("each listed invisible character is absent from the JSON detail, and the visible text stays", async () => {
  for (const [name, code] of [...INVISIBLE, ...ALREADY]) {
    const ch = String.fromCodePoint(code);
    const { checks, raw } = await validate("# A" + ch + "B\n\n> Summary.\n\n## Docs\n\n- [Guide](https://example.com/guide)\n");
    const h1 = checks.find((c) => c.id === "h1-title")!;
    assert.equal(h1.status, "pass", name);
    assert.equal(h1.detail, '"# AB"', name);
    assert.ok(!raw.includes(ch), name + " survives in the JSON text");
    assert.ok(!h1.detail!.includes(ch), name + " survives in the detail");
  }
});

test("every listed character is stripped together, inside a longer run of text", async () => {
  const all = [...INVISIBLE, ...ALREADY].map(([, c]) => String.fromCodePoint(c)).join("");
  const { checks } = await validate("# Title" + all + " and more\n\n> Summary.\n\n## Docs\n\n- [Guide](https://example.com/guide)\n");
  assert.equal(checks.find((c) => c.id === "h1-title")!.detail, '"# Title and more"');
});

// ---- the hosted validator: link label scan, masking and head scan ----

const byId = (checks: Array<{ id: string; status: string; detail?: string }>, id: string) => checks.find((c) => c.id === id)!;
const HEAD = "# Example\n\n> Summary.\n\n## Docs\n\n";

// The list is a Unicode class, not a list kept by hand: every format character (General_Category Cf), every
// Default_Ignorable_Code_Point, and the line and paragraph separators. Ordinary spaces are not in it.
const cp = (...codes: number[]) => String.fromCodePoint(...codes);
const MISSED: Array<[string, number]> = [
  ["function application", 0x2061], ["invisible times", 0x2062], ["invisible separator", 0x2063], ["invisible plus", 0x2064],
  ["soft hyphen", 0x00AD], ["variation selector 1", 0xFE00], ["variation selector 15", 0xFE0E], ["variation selector 16", 0xFE0F],
  ["variation selector 17", 0xE0100], ["variation selector 100", 0xE0163], ["variation selector 256", 0xE01EF],
  ["combining grapheme joiner", 0x034F], ["hangul choseong filler", 0x115F], ["hangul filler", 0x3164], ["halfwidth hangul filler", 0xFFA0],
  ["mongolian vowel separator", 0x180E], ["mongolian free variation selector", 0x180B], ["khmer inherent vowel", 0x17B4],
  ["interlinear annotation anchor", 0xFFF9], ["musical symbol begin beam", 0x1D173], ["unassigned default ignorable", 0x2065],
  ["arabic number sign", 0x0600], ["syriac abbreviation mark", 0x070F], ["inhibit symmetric swapping", 0x206A],
];

test("the invisible characters a closed list missed are absent from the JSON detail, in the title and in the summary", async () => {
  for (const [name, code] of MISSED) {
    const ch = cp(code);
    const { checks, raw } = await validate("# A" + ch + "B\n\n> S" + ch + "T\n\n## Docs\n\n- [Guide](https://example.com/guide)\n");
    assert.equal(byId(checks, "h1-title").detail, '"# AB"', name);
    assert.equal(byId(checks, "summary").detail, '"> ST"', name);
    assert.ok(!raw.includes(ch), name + " survives in the JSON text");
  }
});

test("every format character and every default ignorable code point is stripped, whatever the code point", async () => {
  const klass = /[\p{Cf}\p{Default_Ignorable_Code_Point}\p{Zl}\p{Zp}]/u;
  const all: number[] = [];
  for (let c = 0; c <= 0x10FFFF; c++) if (c < 0xD800 || c > 0xDFFF) { if (klass.test(String.fromCodePoint(c))) all.push(c); }
  assert.ok(all.length > 4000, "the class holds " + all.length + " code points");
  for (let i = 0; i < all.length; i += 25) {
    const chunk = all.slice(i, i + 25);
    const { checks } = await validate("# A" + cp(...chunk) + "B\n\n> Summary.\n\n## Docs\n\n- [Guide](https://example.com/guide)\n");
    assert.equal(byId(checks, "h1-title").detail, '"# AB"', "chunk starting at U+" + chunk[0].toString(16));
  }
});

test("ordinary text, accents, CJK, emoji bases, combining marks and the visible spaces stay in the detail", async () => {
  const kept = [
    "Plain title", "Caf" + cp(0xE9), "Cafe" + cp(0x301), cp(0x65E5, 0x672C, 0x8A9E, 0x306E, 0x30BF, 0x30A4, 0x30C8, 0x30EB), cp(0xDC, 0x6E, 0xEF, 0x63, 0xF6, 0x64, 0xE9),
    "smile " + cp(0x1F642), "thumbs " + cp(0x1F44D, 0x1F3FD), "flag " + cp(0x1F1EB, 0x1F1EE), "keycap 1" + cp(0x20E3),
    "A" + cp(0xA0) + "B", "A" + cp(0x2003) + "B", "A" + cp(0x2009) + "B", "A" + cp(0x200A) + "B", "A" + cp(0x202F) + "B", "A" + cp(0x205F) + "B", "A" + cp(0x3000) + "B", "A" + cp(0x2000) + "B",
    "Arabic " + cp(0x627, 0x644, 0x639, 0x631, 0x628, 0x64A, 0x629), "Hebrew " + cp(0x5E2, 0x5D1, 0x5E8, 0x5D9, 0x5EA),
  ];
  for (const text of kept) {
    const { checks } = await validate("# " + text + "\n\n> Summary.\n\n## Docs\n\n- [Guide](https://example.com/guide)\n");
    assert.equal(byId(checks, "h1-title").detail, JSON.stringify("# " + text), text);
  }
});

test("an emoji sequence loses its joiners and its variation selector, and the emoji themselves stay", async () => {
  const cases: Array<[string, string]> = [
    [cp(0x1F468, 0x200D, 0x1F469, 0x200D, 0x1F467), cp(0x1F468, 0x1F469, 0x1F467)],
    [cp(0x2764, 0xFE0F), cp(0x2764)],
    [cp(0x1F3F4, 0xE0067, 0xE0062, 0xE0065, 0xE006E, 0xE0067, 0xE007F), cp(0x1F3F4)],
    [cp(0x31, 0xFE0F, 0x20E3), cp(0x31, 0x20E3)],
    [cp(0x1F44D, 0x1F3FD), cp(0x1F44D, 0x1F3FD)],
  ];
  for (const [written, shown] of cases) {
    const { checks } = await validate("# " + written + "\n\n> Summary.\n\n## Docs\n\n- [Guide](https://example.com/guide)\n");
    assert.equal(byId(checks, "h1-title").detail, JSON.stringify("# " + shown));
  }
});

test("a text of image openers followed by angle-bracket targets is read in time that grows linearly", async () => {
  const doc = (n: number) => "# T\n\n## S\n\n" + "![".repeat(n) + "](<".repeat(n) + ">";
  const work = async (s: string) => { await validate(s); };
  await assertLinear("13000 and 52000 openers", work, doc(13000), doc(52000));
  await assertLinear("6500 and 26000 openers", work, doc(6500), doc(26000));
});

function loadFunction<T>(name: string): T {
  const src = stripTypes(readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8"));
  const start = src.search(new RegExp("function " + name + "\\("));
  assert.ok(start >= 0, name + " is in worker.ts");
  const close = /\n\}\r?\n/.exec(src.slice(start));
  assert.ok(close, name + " has a closing brace at column 0");
  return new Function(src.slice(start, start + close.index + 2) + "\nreturn " + name + ";")();
}

function loadMaskLocation(): (href: string, base?: string, written?: string) => string {
  const src = stripTypes(readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8"));
  const start = src.search(/function maskLocation\(href\s*,\s*base\s*(?:,\s*written\s*)?\)\s*\{/);
  assert.ok(start >= 0, "maskLocation is in worker.ts");
  const close = /\n\}\r?\n/.exec(src.slice(start));
  assert.ok(close, "maskLocation has a closing brace at column 0");
  return new Function(src.slice(start, start + close.index + 2) + "\nreturn maskLocation;")();
}

test("maskLocation hides user information that holds a ? or a #, whether or not the URL parser reads the text as a URL", () => {
  const mask = loadMaskLocation();
  const secrets = ["SECRETuser", "SECRETpw"];
  const written = [
    "https://SECRETuser:SECRETpw?x@example.com/a",
    "https://SECRETuser:SECRETpw#x@example.com/a",
    "https://SECRETuser:12?SECRETpw@example.com/a",
    "https://SECRETuser:SECRETpw?x/y@example.com/a",
    "//SECRETuser:SECRETpw?x@example.com/a",
    "u:SECRETuser:SECRETpw?x@host/p",
  ];
  for (const t of written) {
    for (const base of [undefined, "https://example.com/llms.txt"]) {
      const shown = mask(t, base);
      for (const s of secrets) assert.ok(!shown.includes(s), t + " shows " + s + " as " + shown);
    }
  }
  // Without slashes a user name that is also a valid scheme name reads as the scheme (as before), but the password is hidden.
  assert.equal(mask("SECRETuser:SECRETpw?x@example.com"), "//***");
  // A ? or # before the @ and before any slash is ambiguous: the URL parser reads the text after it as a query,
  // a person reads the text before the @ as user information. Only the scheme is shown then, no host.
  assert.equal(mask("https://SECRETuser:SECRETpw?x@example.com/a"), "https://***");
  assert.equal(mask("https://SECRETuser:SECRETpw?x@example.com/a?k=v#f"), "https://***");
  // A parsed address whose written form hid user information is masked from the written form.
  const parsed = new URL("https://SECRETuser:12?SECRETpw@example.com/a");
  assert.equal(mask(parsed.href, undefined, "https://SECRETuser:12?SECRETpw@example.com/a"), "https://***");
});

test("maskLocation hides user information that follows a scheme the URL parser refuses", () => {
  const mask = loadMaskLocation();
  const written = [
    "my_app://SECRETuser:SECRETpw@host/p",
    "1app://SECRETuser:SECRETpw@host/p",
    "ht tps://SECRETuser:SECRETpw@host/p",
    "ht\u0001tps://SECRETuser:SECRETpw@host/x?t=1",
    "my_app://SECRETuser:SECRETpw@host/p?t=1#f",
  ];
  for (const t of written) {
    for (const base of [undefined, "https://example.com/llms.txt"]) {
      const shown = mask(t, base);
      assert.ok(!shown.includes("SECRET"), t + " shows " + shown);
      assert.ok(shown.includes("***@host"), t + " shows " + shown);
    }
  }
  assert.equal(mask("my_app://SECRETuser:SECRETpw@host/p"), "my_app://***@host/p");
  assert.equal(mask("my_app://SECRETuser:SECRETpw?x@host/p"), "my_app://***");
  assert.equal(mask("ht\u0001tps://SECRETuser:SECRETpw@host/x?t=1"), "ht\u0001tps://***@host/x?***");
});

test("maskLocation shows only the scheme when a backslash, a ? or a # comes before the @ and before any slash", () => {
  const mask = loadMaskLocation();
  const B = String.fromCharCode(92);
  const ambiguous = [
    "https://us" + B + "er:SECRETpw@other.example/",
    "https://SECRETuser:SECRETpw" + B + "x@other.example/",
    "https://other.example?e=a@b.com",
    "https://other.example#x@b.com",
    "https://other.example?e=a@b.com/path",
    "https://other.example" + B + "p@b.com",
    "http://SECRETuser:SECRETpw?x@other.example/a?k=v#f",
    "https:" + B + B + "SECRETuser" + B + ":SECRETpw@other.example/",
  ];
  for (const t of ambiguous) {
    for (const base of [undefined, "https://example.com/llms.txt"]) {
      const shown = mask(t, base);
      assert.match(shown, /^https?:\/\/\*\*\*$/, t + " shows " + shown);
    }
  }
  assert.equal(mask("//SECRETuser:SECRETpw?x@host/p"), "//***");
  // The same through the parsed form a redirect hands over: the written text decides.
  const written = "https://us" + B + "er:SECRETpw@other.example/";
  assert.equal(mask(new URL(written).href, undefined, written), "https://***");
  const query = "https://other.example?e=a@b.com";
  assert.equal(mask(new URL(query).href, undefined, query), "https://***");
  // A slash before the @ is not ambiguous: it is a path.
  assert.equal(mask("https://host.example/@name"), "https://host.example/@name");
  assert.equal(mask("https://host.example/a/b?x=a@b"), "https://host.example/a/b?x=***");
  assert.equal(mask("https://host.example/p#x@b"), "https://host.example/p");
  assert.equal(mask("https://other.example/?e=a@b.com"), "https://other.example/?e=***");
});

test("a redirect to an ambiguous address names no host, and the detail does not tell the reader to validate one", async () => {
  const B = String.fromCharCode(92);
  const realFetch = globalThis.fetch;
  try {
    for (const location of ["https://other.example?e=a@zzhost.example", "https://other.example#x@zzhost.example", "https://us" + B + "er:SECRETpw@other.example/", "https://SECRETuser:SECRETpw" + B + "x@other.example/"]) {
      globalThis.fetch = (async (url: unknown) => {
        if (String(url) === "https://example.com/llms.txt") return new Response(null, { status: 302, headers: { location } });
        return new Response("", { status: 404, headers: { "content-type": "text/html" } });
      }) as typeof fetch;
      for (const accept of ["application/json", "text/html"]) {
        const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com", { headers: { accept } }), {});
        const raw = await res.text();
        assert.ok(!/secret/i.test(raw), location + " leaks into the " + accept + " answer");
        assert.ok(!raw.includes("zzhost"), location + " names a host in the " + accept + " answer");
        assert.ok(!/validate that host/.test(raw), location + " tells the reader to validate a host in the " + accept + " answer");
      }
      const json = JSON.parse(await (await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com", { headers: { accept: "application/json" } }), {})).text());
      const detail = json.checks.find((c: { id: string }) => c.id === "http-status").detail as string;
      // The parser refuses the last location outright, and that answer prints no address at all.
      assert.match(detail, /^(redirects to https:\/\/\*\*\*, a different host that this report does not name\. llms\.txt is host-scoped, so find the host that this redirect points to and validate it directly|redirects to an unsupported target \(https:\/\/\*\*\*\)\. Only https redirects to the same site are followed|got a 302 redirect without a usable Location header)$/, location);
    }
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("maskLocation shows only the scheme for a written start that is not exactly scheme, two slashes and a non-slash, when the text holds an @", () => {
  const mask = loadMaskLocation();
  const base = "https://example.com/llms.txt";
  const odd: Array<[string, string]> = [
    ["https:///other.example?e=a@b.com", "https://***"],
    ["https:///other.example#frag@b.com", "https://***"],
    ["///other.example?e=a@b.com", "//***"],
    ["https:///SECRETuser:SECRETpw@host/p", "https://***"],
    ["https:////SECRETuser:SECRETpw@host/p", "https://***"],
    ["https:/SECRETuser:SECRETpw@host/p", "https://***"],
    ["https:SECRETuser:SECRETpw@host/p", "//***"],
    ["SECRETuser:SECRETpw@host/p", "//***"],
    ["//" + String.fromCharCode(92) + "SECRETuser:SECRETpw@host/p", "//***"],
  ];
  for (const [text, shown] of odd) {
    for (const b of [undefined, base]) assert.equal(mask(text, b), shown, text + " against " + b);
    const parsed = new URL(text, base).href;
    assert.equal(mask(parsed, undefined, text), shown, text + " as written");
  }
  // A reference with no scheme and no leading // keeps its reading, and so does the ordinary two-slash form.
  assert.equal(mask("/a@b"), "/a@b");
  assert.equal(mask("docs/@name"), "docs/@name");
  assert.equal(mask("https://host.example/@name"), "https://host.example/@name");
  assert.equal(mask("https://host.example/a@b"), "https://host.example/a@b");
  // With no @ nothing changes: the parser normalises these as before.
  assert.equal(mask("https:///x/y"), "https://x/y");
  assert.equal(mask("https:path/x?y=1"), "https://path/x?y=***");
});

test("a redirect with three slashes or a scheme and no slashes names no wrong host and shows no secret", async () => {
  const realFetch = globalThis.fetch;
  try {
    for (const location of ["https:///other.example?e=a@zzhost.example", "https:///other.example#frag@zzhost.example", "///other.example?e=a@zzhost.example", "https:SECRETuser:SECRETpw@zzhost.example/p", "https:/SECRETuser:SECRETpw@zzhost.example/p"]) {
      globalThis.fetch = (async (url: unknown) => {
        if (String(url) === "https://example.com/llms.txt") return new Response(null, { status: 302, headers: { location } });
        return new Response("", { status: 404, headers: { "content-type": "text/html" } });
      }) as typeof fetch;
      for (const accept of ["application/json", "text/html"]) {
        const raw = await (await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com", { headers: { accept } }), {})).text();
        assert.ok(!/secret/i.test(raw), location + " leaks into the " + accept + " answer");
        assert.ok(!raw.includes("zzhost"), location + " names a host in the " + accept + " answer");
        assert.ok(!/validate that host/.test(raw), location + " tells the reader to validate a host in the " + accept + " answer");
      }
    }
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("maskLocation keeps the shapes it did not touch", () => {
  const mask = loadMaskLocation();
  assert.equal(mask("https://user:pass@example.com/?q=1"), "https://example.com/?q=***");
  assert.equal(mask("https://example.com/p?x=1#f"), "https://example.com/p?x=***");
  assert.equal(mask("/p?mail=a@b.com"), "/p?***");
  assert.equal(mask("p?mail=a@b.com"), "p?***");
  assert.equal(mask("my_app://host/p"), "my_app://host/p");
  assert.equal(mask("https://host/p?x=a@b"), "https://host/p?x=***");
  assert.equal(mask("path@2x.png"), "path@2x.png");

  assert.equal(mask("user_name:pw@host?x=1"), "***@host?***");
});

test("a published describedby link with user information is shown masked, in both odd shapes", async () => {
  for (const href of ["my_app://SECRETuser:SECRETpw@host/p?t=1", "https://SECRETuser:SECRETpw?x@example.com/p", "ht&#1;tps://SECRETuser:SECRETpw@host/x?t=1"]) {
    const { checks, raw } = await validate(HEAD + "- [Guide](https://example.com/guide)\n", '<!doctype html><html><head><link rel="describedby" href="' + href + '"></head><body></body></html>');
    assert.equal(byId(checks, "v2-describedby").status, "pass", href);
    assert.ok(!/secret/i.test(raw), href + " leaks into " + byId(checks, "v2-describedby").detail);
  }
});

test("a refused redirect target with user information inside its query part is shown masked", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: unknown) => {
    if (String(url) === "https://example.com/llms.txt") return new Response(null, { status: 302, headers: { location: "https://SECRETuser:12?SECRETpw@example.com/x" } });
    return new Response("", { status: 404, headers: { "content-type": "text/html" } });
  }) as typeof fetch;
  try {
    const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com", { headers: { accept: "application/json" } }), {});
    const raw = await res.text();
    assert.match(raw, /unsupported target/);
    assert.ok(!/secret/i.test(raw), raw);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("a backslash before a line break does not carry a link label past the end of its list item or heading", async () => {
  const detail = async (text: string, id: string) => { const r = await validate(HEAD + text + "\n"); return { status: byId(r.checks, id).status, detail: byId(r.checks, id).detail }; };
  const a = await validate(HEAD + "- [Guide\\\n- more](https://example.org/a)\n");
  assert.equal(byId(a.checks, "links").status, "warn");
  assert.equal(byId(a.checks, "sections").status, "warn");
  const noBackslash = await validate(HEAD + "- [Guide\n- more](https://example.org/a)\n");
  assert.equal(byId(noBackslash.checks, "links").status, "warn");
  const b = await validate(HEAD + "- ![Alt\\\n- see [Real](https://example.org/b)](https://example.org/i.png)\n");
  assert.equal(byId(b.checks, "links").status, "pass");
  assert.equal(byId(b.checks, "links").detail, "1 link, all absolute URLs");
  const c = await validate(HEAD + "- [Guide\\\n## Next](https://example.org/a)\n");
  assert.equal(byId(c.checks, "links").status, "warn");
  assert.equal(byId(c.checks, "sections").status, "warn");
  // An escaped bracket and a backslash before an ordinary character keep their reading.
  assert.equal((await detail("- [Guide \\] more](https://example.org/a)", "links")).detail, "1 link, all absolute URLs");
  assert.equal((await detail("- [Gu\\ide](https://example.org/a)", "links")).detail, "1 link, all absolute URLs");
});

test("a heading inside a raw HTML block that CommonMark does not end there is no section", async () => {
  const doc = (open: string, close: string) => "# T\n\n> s\n\n" + open + "\n## Docs\n" + close + "\n- [a](https://example.com/a)\n";
  for (const [open, close] of [["<?x", "?>"], ["<![CDATA[", "]]>"], ["<!DOCTYPE x", ">"], ["<!-- x", "-->"]]) {
    const r = await validate(doc(open, close));
    assert.equal(byId(r.checks, "sections").status, "warn", open);
    assert.match(byId(r.checks, "sections").detail!, /^no H2 sections found/, open);
    assert.equal(JSON.parse(r.raw).summary, "valid with warnings", open);
  }
  // A heading after the block ends is a section, and a blank-line block of an ordinary tag ends at the blank line.
  const after = await validate("# T\n\n> s\n\n<?x\n?>\n\n## Docs\n\n- [a](https://example.com/a)\n");
  assert.equal(byId(after.checks, "sections").status, "pass");
  assert.equal(JSON.parse(after.raw).summary, "valid");
  const plain = await validate("# T\n\n> s\n\n## Docs\n\n- [a](https://example.com/a)\n");
  assert.equal(byId(plain.checks, "sections").detail, "1 section, 1 carrying a file list");
  assert.equal(JSON.parse(plain.raw).summary, "valid");
});

test("a raw HTML block opener inside a list item does not hide the column-0 heading after it, and one outside any item still does", async () => {
  const head = "# Site\n\n> Summary line.\n\n";
  const sections = async (body: string) => byId((await validate(head + body)).checks, "sections").detail!;
  // The opener sits at or beyond the content offset of the open item, so CommonMark puts it inside the item,
  // and the heading at column 0 closes the item and the block and is a real section.
  const inside = [
    "- item [a](https://e.com/a)\n   <!-- c\n## Docs\n\n-->\n\n- [z](https://e.com/z)\n",
    "- item\n  <?x\n## Docs\n?>\n\n- [z](https://e.com/z)\n",
    "1. item\n\n   <div>\n## Docs\n\n- [z](https://e.com/z)\n",
    "10. item\n\n    <details>\n## Docs\n\n- [z](https://e.com/z)\n",
    "* item\n  <script>\n## Docs\n  </script>\n\n- [z](https://e.com/z)\n",
    "- item\n  - nested\n\n  <![CDATA[\n## Docs\n  ]]>\n\n- [z](https://e.com/z)\n",
  ];
  for (const body of inside) assert.match(await sections(body), /^1 section/, JSON.stringify(body));
  // An opener after a blank line, indented at most three columns and outside every open item is a block of its own
  // and masks the heading inside it.
  const outside = [
    "- item\n\n<!-- c\n## Docs\n-->\n\n- [z](https://e.com/z)\n",
    "<!-- c\n## Docs\n-->\n\n- [z](https://e.com/z)\n",
    "text\n\n   <!-- c\n## Docs\n-->\n\n- [z](https://e.com/z)\n",
    "-   item\n\n   <!-- c\n## Docs\n\n-->\n\n- [z](https://e.com/z)\n",
  ];
  for (const body of outside) assert.match(await sections(body), /^no H2 sections found/, JSON.stringify(body));
  // Directly under a paragraph line, a list item line or another block the structure is not certain, so the opener masks
  // nothing and the heading is read as before.
  const uncertain = [
    "-   item\n   <!-- c\n## Docs\n\n-->\n\n- [z](https://e.com/z)\n",
    "text\n   <!-- c\n## Docs\n-->\n\n- [z](https://e.com/z)\n",
  ];
  for (const body of uncertain) assert.match(await sections(body), /^1 section/, JSON.stringify(body));
});

test("the head scan reads past <!--> and <!---> inside a script, as the HTML tokenizer does", () => {
  const link = '<link rel="describedby" href="/real">';
  for (const open of ["<!-->", "<!--->"]) {
    assert.equal(findLinkRelations("<head><script>" + open + "<script></script>" + link + "</head>", "").describedby, "/real", open);
    // The script ends at the first </script>, so a body start tag after it ends the head before the link.
    assert.equal(findLinkRelations("<head><script>" + open + "<script></script><body></script>" + link + "</head>", "").describedby, null, open);
  }
  // Unchanged: a real comment, an empty script and the double escape of a comment.
  assert.equal(findLinkRelations("<head><script><!-- x --></script>" + link + "</head>", "").describedby, "/real");
  assert.equal(findLinkRelations("<head><script>x</script>" + link + "</head>", "").describedby, "/real");
  assert.equal(findLinkRelations("<head><script><!-- <script></script> --></script>" + link + "</head>", "").describedby, "/real");
  assert.equal(findLinkRelations("<head><script><!-- <script></script>" + link + "</head>", "").describedby, null);
  assert.equal(findLinkRelations("<head><script><!-- <!--> <script></script>" + link + "</head>", "").describedby, "/real");
});

// ---- the 402 challenges ----

test("every 402 challenge body is ASCII, so the base64 PAYMENT-REQUIRED header (btoa) can carry it", async () => {
  for (const path of ["/api", "/api/", "/x402", "/api/agent/audit", "/api/agent/advisory", "/api/agent/implementation"]) {
    const res = await worker.fetch(new Request("https://turva.dev" + path, { headers: { accept: "application/json" } }), {});
    assert.equal(res.status, 402, path);
    const body = await res.text();
    assert.ok(/^[\x00-\x7f]*$/.test(body), path + " has a character outside ASCII");
    const header = res.headers.get("payment-required");
    assert.ok(header, path + " has no PAYMENT-REQUIRED header");
    assert.equal(atob(header!), body, path + ": the header is not the base64 of the body");
  }
});

// ---- the hosted validator and the typed address ----

test("the validator fetches only the public host a typed address names, whatever IP literal or credential form is typed", async () => {
  const fetched: string[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: unknown) => { fetched.push(String(url)); return new Response("", { status: 404, headers: { "content-type": "text/html" } }); }) as typeof fetch;
  const refused = [
    "127.0.0.1", "2130706433", "0x7f000001", "0x7f.0.0.1", "127.1", "127.0.0.1.", "[::1]", "[::ffff:127.0.0.1]", "::1",
    "169.254.169.254", "0251.0376.0251.0376", "1.1.1.1", "0.0.0.0", "010.0.0.1", "a.b.c.123", "example.123", "1.2.3.4.5",
    "localhost", "localhost.", "foo.localhost", "metadata.google.internal", "a.b.local", "example.com@127.0.0.1",
    "127.0.0.1@example.com", "example.com:8443", "ex ample.com",
  ];
  try {
    for (const typed of refused) {
      const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent(typed), { headers: { accept: "application/json", "cf-connecting-ip": "203.0.113.7" } }), {});
      assert.equal(res.status, 400, typed);
    }
    assert.deepEqual(fetched, [], "an address that names an IP literal, a local name or credentials was fetched: " + fetched.join(", "));
    // Forms that name a public host are read as that host and nothing else: case, a trailing dot, an IDN in its punycode form,
    // and text after a # or a backslash that would read as a second host.
    for (const typed of ["EXAMPLE.COM", "example.com.", "xn--nxasmq6b.com", "example.com#@127.0.0.1", "https://example.com" + String.fromCharCode(92) + "@127.0.0.1"]) {
      fetched.length = 0;
      await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + encodeURIComponent(typed), { headers: { accept: "application/json", "cf-connecting-ip": "203.0.113.7" } }), {});
      assert.ok(fetched.length > 0, typed + " fetched nothing");
      for (const u of fetched) assert.ok(/^https:\/\/(example\.com|xn--nxasmq6b\.com)\/(llms\.txt)?$/.test(u), typed + " fetched " + u);
    }
  } finally {
    globalThis.fetch = realFetch;
  }
});

// ---- the content security policy ----
//
// What a page of this site can load as an image or reach with a script, read from the served pages and the two scripts
// they carry, so the policy can say it narrowly. The pages are the ones the sitemap lists, the 404 page, a validator
// result page and a brief page that carries hostile Markdown.

const SITE = "https://turva.dev";
const attrsOf = (tag: string): Record<string, string> => {
  const out: Record<string, string> = {};
  const re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  const inner = tag.replace(/^<[a-zA-Z0-9-]+/, "");
  for (let m = re.exec(inner); m; m = re.exec(inner)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  return out;
};
const ownOrigin = (ref: string, page: string): boolean => {
  const v = ref.trim().replace(/&amp;/g, "&");
  if (/^(data|blob):/i.test(v)) return true;
  try { return new URL(v, page).origin === SITE; } catch { return false; }
};
const NETWORK_API = /\b(XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\b|\bnew\s+Image\b|\bimport\s*\(|\.src\s*=|createElement\s*\(\s*["'](img|image|script|iframe|link|video|audio|source|track|embed|object)["']/;

// Every reference in a page's HTML that an image, media, connect or navigation-preload directive would govern, and every
// script of the page. Returns what is not on the site's own origin.
function externalLoads(html: string, page: string): string[] {
  const bad: string[] = [];
  // Drop every inline script and the body of every script with a src, keeping only that script's opening tag. The result
  // is built by slicing between matches, not by a replace, and the end tag allows white space and attributes the way an
  // HTML parser does (CodeQL js/incomplete-multi-character-sanitization and js/bad-tag-filter, 2026-11-15).
  let noScripts = "";
  let at = 0;
  for (const s of html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gi)) {
    const start = s.index ?? 0;
    const open = s[0].slice(0, s[0].indexOf(">") + 1);
    noScripts += html.slice(at, start) + (/\bsrc\s*=/i.test(open) ? open : "");
    at = start + s[0].length;
  }
  noScripts += html.slice(at);
  for (const m of noScripts.matchAll(/<(img|source|video|audio|track|embed|iframe|object|input|picture|image|use|a|area|link|script)\b[^>]*>/gi)) {
    const tag = m[0], name = m[1].toLowerCase(), a = attrsOf(tag);
    const refs: string[] = [];
    if (name === "link") {
      const rel = (a.rel || "").toLowerCase().split(/\s+/);
      if (rel.some((r) => ["icon", "shortcut", "apple-touch-icon", "mask-icon", "preload", "prefetch", "prerender", "modulepreload", "stylesheet", "manifest", "image_src"].includes(r)) && a.href) refs.push(a.href);
    } else if (name === "a" || name === "area") {
      if ("ping" in a) bad.push(tag + " has a ping attribute");
    } else if (name === "input") {
      if ((a.type || "").toLowerCase() === "image" && a.src) refs.push(a.src);
    } else if (name === "object") {
      if (a.data) refs.push(a.data);
    } else {
      if (a.src) refs.push(a.src);
      if (a.poster) refs.push(a.poster);
      if (a.srcset) for (const c of a.srcset.split(",")) refs.push(c.trim().split(/\s+/)[0]);
      if (name === "use" && (a["xlink:href"] || a.href)) refs.push(a["xlink:href"] || a.href);
    }
    for (const r of refs) if (r && !ownOrigin(r, page)) bad.push(name + " " + r);
  }
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>|\bstyle\s*=\s*"([^"]*)"/gi)) {
    const css = m[1] ?? m[2] ?? "";
    for (const u of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) if (!ownOrigin(u[2], page)) bad.push("css url " + u[2]);
    for (const u of css.matchAll(/@import\s+(?:url\(\s*)?['"]?([^'")\s;]+)/gi)) if (!ownOrigin(u[1], page)) bad.push("css import " + u[1]);
  }
  return bad;
}

async function inlineScriptProblems(html: string, page: string): Promise<string[]> {
  const bad: string[] = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi)) {
    const a = attrsOf("<script" + m[1] + ">");
    if (a.src) {
      if (!ownOrigin(a.src, page)) { bad.push("script src " + a.src); continue; }
      const res = await worker.fetch(new Request(new URL(a.src, page).href), {});
      const text = await res.text();
      if (/\bfetch\s*\(/.test(text) || NETWORK_API.test(text)) bad.push(a.src + " calls a network API");
      continue;
    }
    if (/json/i.test(a.type || "")) continue;
    const text = m[2];
    if (NETWORK_API.test(text)) bad.push("inline script calls a network API besides fetch");
    const calls = text.match(/(?<![.\w])fetch\s*\(/g) || [];
    // The page's one script reads the site's own pages: a single fetch whose destination goes through the own-path check
    // and which is made with mode same-origin.
    if (calls.length !== 1 || !/fetch\(path, \{ headers: \{ Accept: accept \}, mode: 'same-origin', redirect: 'error' \}\)/.test(text)) bad.push("inline script has " + calls.length + " fetch calls or one that is not same-origin");
  }
  return bad;
}

test("the scan for external loads finds each kind of external reference it is meant to find", async () => {
  const page = SITE + "/x";
  const external = [
    '<img src="https://evil.example/x.png">', '<img src=//evil.example/x.png>', '<img srcset="/a.png 1x, https://evil.example/b.png 2x">',
    '<picture><source srcset="https://evil.example/b.webp"></picture>', '<link rel="icon" href="https://evil.example/i.png">',
    '<link rel="preload" as="image" href="https://evil.example/i.png">', '<video poster="https://evil.example/p.png"></video>',
    '<audio src="https://evil.example/a.mp3"></audio>', '<div style="background:url(https://evil.example/a.png)"></div>',
    '<style>.a{background:url("https://evil.example/a.png")}</style>', '<style>@import "https://evil.example/a.css";</style>',
    '<a href="/x" ping="https://evil.example/p">x</a>', '<input type="image" src="https://evil.example/i.png">',
    '<object data="https://evil.example/o.swf"></object>', '<script src="https://evil.example/s.js"></script>',
    '<img src="https://turva.dev.evil.example/x.png">', '<img src="http://turva.dev:8080/x.png">',
  ];
  for (const h of external) assert.ok(externalLoads(h, page).length > 0, h + " was not found");
  const own = ['<img src="/a.png">', '<img src="https://turva.dev/a.png">', '<img src="data:image/png;base64,AAAA">', '<link rel="icon" href="https://turva.dev/logo.png">', '<link rel="alternate" href="https://evil.example/feed">', '<a href="https://evil.example/">x</a>', '<style>.a{background:url(/a.png)}</style>'];
  for (const h of own) assert.deepEqual(externalLoads(h, page), [], h);
  const scripts = [
    '<script>new WebSocket("wss://evil.example")</script>', '<script>navigator.sendBeacon("https://evil.example", "x")</script>', '<script>new Image().src = "https://evil.example/p.gif"</script>',
    "<script>var path = 1; fetch(path, { headers: { Accept: accept }, mode: 'same-origin', redirect: 'error' }); fetch('https://evil.example')</script>",
    "<script>fetch('https://evil.example')</script>", '<script>import("https://evil.example/m.js")</script>',
  ];
  for (const h of scripts) assert.ok((await inlineScriptProblems(h, page)).length > 0, h + " was not found");
  assert.deepEqual(await inlineScriptProblems('<script type="application/ld+json">{"@context":"https://schema.org"}</script>', page), []);
});

test("no page of the site loads an external image or media file or connects to another origin", async () => {
  const sitemap = await (await worker.fetch(new Request(SITE + "/sitemap.xml"), {})).text();
  const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(pages.length >= 80, "the sitemap lists " + pages.length + " pages");
  const extra = [SITE + "/no-such-page-for-this-test", SITE + "/markdown-parity-check", SITE + "/llms-txt-validator", SITE + "/blog", SITE + "/guides"];
  let images = 0, scripts = 0, scanned = 0;
  for (const url of [...pages, ...extra]) {
    const res = await worker.fetch(new Request(url, { headers: { accept: "text/html" } }), {});
    if (!/text\/html/.test(res.headers.get("content-type") || "")) continue;
    const html = await res.text();
    scanned++;
    images += (html.match(/<img\b/gi) || []).length;
    scripts += (html.match(/<script\b/gi) || []).length;
    const bad = externalLoads(html, url).concat(await inlineScriptProblems(html, url));
    assert.deepEqual(bad, [], url);
  }
  assert.ok(scanned >= 80, "the scan read " + scanned + " pages");
  assert.ok(images >= 1, "the scan saw " + images + " images, so it is reading the pages");
  assert.ok(scripts > 100, "the scan saw " + scripts + " scripts, so it is reading the pages");
});

test("the validator result page, a brief page with hostile Markdown and the page renderer load nothing external", async () => {
  const hostile = "# T\n\n> S\n\n## Docs\n\n- [a](https://example.com/a)\n\n<img src=\"https://evil.example/x.png\">\n\n![alt](https://evil.example/y.png)\n\n<link rel=\"icon\" href=\"https://evil.example/z.png\">\n";
  const { raw } = await validate(hostile);
  assert.ok(raw.length > 0);
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: unknown) => String(url) === "https://example.com/llms.txt" ? new Response(hostile, { status: 200, headers: { "content-type": "text/plain" } }) : new Response("", { status: 404 })) as typeof fetch;
  try {
    const page = await worker.fetch(new Request(SITE + "/llms-txt-validator?url=example.com", { headers: { accept: "text/html" } }), {});
    const html = await page.text();
    assert.ok(html.includes("llms.txt"));
    assert.deepEqual(externalLoads(html, SITE + "/llms-txt-validator"), []);
  } finally {
    globalThis.fetch = realFetch;
  }
  const rec = { md: hostile + "\n[link](https://evil.example/)\n", json: { id: "x" }, kieli: "en", yritys: "Example", otsikko: "Example brief" };
  const id = "kohde-abcdefghijklm";
  const brief = await worker.fetch(new Request(SITE + "/brief/" + id, { headers: { accept: "text/html" } }), { BRIEFIT: { get: async () => rec } });
  assert.equal(brief.status, 200);
  const briefHtml = await brief.text();
  assert.ok(briefHtml.includes("Example brief"));
  assert.deepEqual(externalLoads(briefHtml, SITE + "/brief/" + id), []);
  for (const md of ["![alt](https://evil.example/y.png)", "<img src=\"https://evil.example/x.png\">", "<img src=x onerror=alert(1)>", "[![i](https://evil.example/i.png)](https://evil.example)"]) {
    assert.deepEqual(externalLoads("<p>" + renderInline(md) + "</p>" + markdownToHtml(md), SITE + "/"), [], md);
  }
});

test("the content security policy of an HTML page lets images and connections reach only the site itself", async () => {
  const res = await worker.fetch(new Request(SITE + "/", { headers: { accept: "text/html" } }), {});
  const csp = res.headers.get("content-security-policy")!;
  const directive = (name: string) => csp.split(";").map((d) => d.trim()).find((d) => d.startsWith(name + " "));
  assert.equal(directive("img-src"), "img-src 'self' data: blob:");
  assert.equal(directive("connect-src"), "connect-src 'self'");
  // Untouched here: the script hash, the inline styles the pages carry, and the other directives.
  assert.ok(directive("script-src")!.startsWith("script-src 'self' 'sha256-"));
  assert.equal(directive("style-src"), "style-src 'self' 'unsafe-inline' data:");
  assert.equal(directive("default-src"), "default-src 'self'");
  assert.equal(directive("object-src"), "object-src 'none'");
});

test("the head scan counts a template inside svg or math as an ordinary element, not as an HTML template", () => {
  const link = '<link rel="describedby" href="/real">';
  assert.equal(findLinkRelations("<head><template><svg><template></svg></template>" + link + "</head>", "").describedby, "/real");
  assert.equal(findLinkRelations("<head><template><math><template></math></template>" + link + "</head>", "").describedby, "/real");
  assert.equal(findLinkRelations("<head><template><svg><template/></svg></template>" + link + "</head>", "").describedby, "/real");
  assert.equal(findLinkRelations("<head><template><svg><template></template></svg></template>" + link + "</head>", "").describedby, "/real");
  assert.equal(findLinkRelations("<head><template><svg><template></svg></template><body></template>" + link + "</head>", "").describedby, null);
  // Unchanged: nested HTML templates count, and a template inside a foreignObject is an HTML template again.
  assert.equal(findLinkRelations("<head><template><template></template></template>" + link + "</head>", "").describedby, "/real");
  assert.equal(findLinkRelations("<head><template><p></template>" + link + "</head>", "").describedby, "/real");
  assert.equal(findLinkRelations("<head><template><svg><foreignObject><template></template></foreignObject></svg></template>" + link + "</head>", "").describedby, "/real");
  assert.equal(findLinkRelations("<head><template><template></template>" + link + "</head>", "").describedby, null);
});

// ---- the selector counters read hostile text in linear time, and the refusal itself is cheap ----

test("the four selector counters read hostile text in time that grows linearly", async () => {
  const names = ["parityCountSiblingCombinators", "parityCountHas", "parityCountNth", "parityNestDepth"];
  const shapes = ["(", ")", ":", B1, "[", '"', "'", " of ", "/*", "*/", "~", "]", ":is(", ":nth-child(", ":nth-child(n of ", "[a=", B1 + ":", ":" + B1 + ":", ") ", "(:", "):", ":has(", ":a", "::", ":" + B1 + "3a ", ":is(:nth-child(n of [a='(' /* ~ */ " + B1 + ") ~ "];
  const grow = (s: string, n: number) => rep(s, Math.ceil(n / s.length)).slice(0, n);
  for (const name of names) {
    const counter = loadFunction<(s: string) => number>(name);
    for (const shape of shapes) await assertLinear(name + " over " + JSON.stringify(shape), counter, grow(shape, 3000), grow(shape, 12000));
  }
});

test("a chain of nested :nth-child(n of ...) at the length limit is refused at once, in the nth sentence", async () => {
  for (const depth of [12, 15, 17]) {
    const sel = rep(":nth-child(n of ", depth) + "*" + rep(")", depth);
    assert.ok(sel.length <= 300, sel.length + " characters");
    const started = performance.now();
    const res = await parityPost(sel);
    const ms = performance.now() - started;
    assert.equal(res.status, 422, "depth " + depth);
    assert.match(JSON.parse(await res.text()).summary.error, NTH_REFUSAL, "depth " + depth);
    assert.ok(ms < 1000, "depth " + depth + " took " + ms.toFixed(0) + " ms");
  }
});

test("the sibling refusal names the limit and says what the hosted version runs", async () => {
  const res = await parityPost(chain(2));
  assert.equal(JSON.parse(await res.text()).summary.error, "The CSS selector has more than 1 general-sibling combinator (~). This hosted version runs at most 1. Use fewer.");
});

// ---- maskLocation decides ambiguity once, from the written text ----

test("maskLocation shows only the scheme when a later :// follows the @, whatever the start", () => {
  const mask = loadMaskLocation();
  const base = "https://example.com/llms.txt";
  const cases: Array<[string, string]> = [
    ["us:SECRETX@host.example://dd", "//***"],
    ["http:us%40er:SECRETX@host.example://dd", "//***"],
    ["ftp:us:SECRETX@host.example://x", "//***"],
    ["1app:us:SECRETX@host.example://dd", "//***"],
    ["http:/us:SECRETX@host.example://dd", "http://***"],
    ["https:///us:SECRETX@host.example://dd", "https://***"],
    ["//" + B1 + "us:SECRETX@host.example://dd", "//***"],
  ];
  for (const [text, shown] of cases) {
    for (const b of [undefined, base]) assert.equal(mask(text, b), shown, text + " against " + b);
    const parsed = new URL(text, base).href;
    assert.equal(mask(parsed, undefined, text), shown, text + " as written");
  }
  // The ordinary forms keep their reading.
  assert.equal(mask("https://us:SECRETX@host.example://dd"), "https://host.example//dd");
  assert.equal(mask("/a@b"), "/a@b");
  assert.equal(mask("docs/@name"), "docs/@name");
  assert.equal(mask("https://host.example/@name"), "https://host.example/@name");
});

// ---- raw HTML blocks mask a heading only where the block structure is certain ----

test("a raw HTML block opener under a list item line or a paragraph line masks nothing, so the heading after it is a section", async () => {
  const head = "# Site\n\n> Summary line.\n\n";
  const sections = async (body: string) => byId((await validate(head + body)).checks, "sections").detail!;
  const tail = "\n\n## Docs\n\n- [z](https://e.com/z)\n";
  const sectionBodies = [
    '  - <p>\n<a href="x">\n<script>text' + tail,
    "> quote\n</pre>\n<br>\n <![CDATA[" + tail,
    "   +   <ul>\n</script>\n  <!--text" + tail,
    "1)   <h3>\n <img src=x>\n<textarea>" + tail,
    "  *  <?x?>\n</style>\n<textarea>" + tail,
    "> > <pre>x</pre>\n</pre>\n   <script> x" + tail,
    "1.\t<!--\n</script>\n<![CDATA[ x" + tail,
  ];
  for (const body of sectionBodies) assert.match(await sections(body), /^1 section/, JSON.stringify(body));
  // After a blank line at the top level the same openers do mask: the block runs to its end marker or to the blank line.
  assert.match(await sections("<script>text\n\n## Docs\n\n</script>\n\n- [z](https://e.com/z)\n"), /^no H2 sections found/);
  assert.match(await sections("<div>\n## Docs\n\n- [z](https://e.com/z)\n"), /^no H2 sections found/);
  assert.match(await sections("text\n\n<div>\n## Docs\n\n- [z](https://e.com/z)\n"), /^no H2 sections found/);
});

test("a raw HTML block of type 2, 3, 4 or 1 that ends on its own opener line masks nothing after it, and a multi-line comment still does", async () => {
  const head = "# T\n\n> s\n\n";
  const sections = async (body: string) => byId((await validate(head + body)).checks, "sections").detail!;
  const tail = "\n\n## Docs\n\n- [z](https://e.com/z)\n";
  for (const opener of ["<!-->", "<!--->", "<?>", "<!X>", "<![CDATA[]]>", "<script></script>", "<pre>x</pre>", "<!---->", "<?x?>"]) {
    assert.match(await sections(opener + tail), /^1 section/, JSON.stringify(opener));
  }
  assert.match(await sections("<!--\n\n## Docs\n\n-->\n\n- [z](https://e.com/z)\n"), /^no H2 sections found/);
});

// ---- the redirect sentence and the x402 note ----

test("a redirect to a host the report does not name says how to find it, and a named host keeps its sentence", async () => {
  const realFetch = globalThis.fetch;
  const detailFor = async (location: string) => {
    globalThis.fetch = (async (url: unknown) => {
      if (String(url) === "https://example.com/llms.txt") return new Response(null, { status: 302, headers: { location } });
      return new Response("", { status: 404, headers: { "content-type": "text/html" } });
    }) as typeof fetch;
    const json = JSON.parse(await (await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com", { headers: { accept: "application/json" } }), {})).text());
    return json.checks.find((c: { id: string }) => c.id === "http-status").detail as string;
  };
  try {
    assert.equal(await detailFor("https://other.example?e=a@zzhost.example"), "redirects to https://***, a different host that this report does not name. llms.txt is host-scoped, so find the host that this redirect points to and validate it directly");
    assert.equal(await detailFor("https://other.example/x"), "redirects to https://other.example/x, a different host. llms.txt is host-scoped, so validate that host directly");
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("the x402 note says that neither funds nor a signed payment authorization change the answer", async () => {
  const note = "No facilitator is configured. X-PAYMENT is not verified and this resource answers 402 regardless of payment, so neither sending funds nor sending a signed payment authorization changes that answer. Ask for a quote and settle against the written scope.";
  const body = await (await worker.fetch(new Request("https://turva.dev/api", { headers: { accept: "application/json" } }), {})).text();
  assert.ok(body.includes(note), "the 402 body carries the note");
  assert.ok(!/achieves nothing/.test(body));
  assert.ok(/^[\x00-\x7f]*$/.test(note));
});
