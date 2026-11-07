import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { findLinkRelations } from "../src/worker.ts";

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

async function assertLinear(label: string, work: (input: string) => unknown, small: string, large: string): Promise<void> {
  const sizes = large.length / small.length;
  const limit = growthLimit(sizes);
  const g = await growthRatio(work, small, large, limit);
  assert.ok(g.ratio < limit, label + ": " + sizes.toFixed(1) + "x the input took " + g.ratio.toFixed(1) + "x as long after " + g.rounds + " rounds, limit " + limit.toFixed(1));
}

// Regression tests for Tek-560 (outside review 2026-10-02, items V01 to V04, V06, V07, V08 and
// V10): the hosted llms.txt validator, the canonical copy. The package turva-llms-txt-validator
// 0.3.16 carries the same cases in test/tek560.test.ts. Each case gave the opposite result
// before the change, except the guards that say what still holds.

const BS = String.fromCharCode(92);
const base = "# Example\n\n> Summary.\n\n## Docs\n\n- [Guide](https://example.com/guide)\n";

async function check(llms: string, { home = "" } = {}) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u === "https://example.com/llms.txt") return new Response(llms, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    if (u === "https://example.com/") return new Response(home, { status: home ? 200 : 404, headers: { "content-type": "text/html" } });
    throw new Error("unexpected fetch to " + u);
  };
  try {
    const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com", { headers: { accept: "application/json" } }), {});
    assert.equal(res.status, 200);
    return JSON.parse(await res.text());
  } finally {
    globalThis.fetch = realFetch;
  }
}
const status = async (text: string, id: string) => (await check(text)).checks.find((c: { id: string }) => c.id === id).status;
const detail = async (text: string, id: string) => (await check(text)).checks.find((c: { id: string }) => c.id === id).detail;

test("Tek-560 V01: a link label cannot cross a blank line", async () => {
  const split = base.replace("[Guide](", "[Gu\n\nide](");
  assert.equal(await status(split, "links"), "warn");
  assert.equal(await status(split, "sections"), "warn");
  assert.equal((await check(base.replace("[Guide](", "[Gu\nide]("))).summary, "valid");
  assert.equal(await status(base.replace("[Guide](", "[Gu\n  \t\nide]("), "links"), "warn");
});

test("Tek-560 V02: a backslash escape in the destination is unescaped before the absolute URL test", async () => {
  const esc = base.replace("https://example.com/guide", "https" + BS + "://example.com/guide");
  assert.equal(await status(esc, "links"), "pass");
  assert.equal((await check(esc)).summary, "valid");
  assert.equal(await status(base.replace("https://example.com/guide", "https://example.com/gu" + BS + "ide"), "links"), "pass");
  assert.equal(await status(base.replace("https://example.com/guide", BS + "/guide"), "links"), "warn");
});

test("Tek-560 V03: CR-only and CRLF line endings read like LF", async () => {
  assert.equal((await check(base.replace(/\n/g, "\r"))).summary, "valid");
  assert.equal((await check(base.replace(/\n/g, "\r\n"))).summary, "valid");
  const d = await detail(base.replace(/\n/g, "\r"), "h1-title");
  assert.match(d, /Example/);
  assert.doesNotMatch(d, /Summary/);
});

test("Tek-560 V04A: a setext H1 is an H1, and the summary is read after its underline", async () => {
  for (const t of ["Example\n=", "Example\n=======", "  Example\n===  "]) {
    const text = base.replace("# Example", t);
    assert.equal(await status(text, "h1-title"), "pass", t);
    assert.equal(await status(text, "summary"), "pass", t);
    assert.equal((await check(text)).summary, "valid", t);
  }
  for (const t of ["Example\n---", "- Example\n=", "> Example\n=", "## Example\n="]) {
    assert.equal(await status(base.replace("# Example", t), "h1-title"), "fail", t);
  }
  assert.equal(await status(base.replace("# Example", "Example\n\n="), "h1-title"), "fail");
  assert.match(await detail(base.replace("# Example", "Example"), "h1-title"), /underlined with =/);
});

test("Tek-560 V04B: a link on a continuation line counts as the list item's link", async () => {
  for (const item of ["-\n  [Guide](https://example.com/guide)", "- Read the\n  [Guide](https://example.com/guide)", "- Read the\n[Guide](https://example.com/guide)", "1.\n   [Guide](https://example.com/guide)", "- Read\n\n  [Guide](https://example.com/guide)"]) {
    assert.equal(await status(base.replace("- [Guide](https://example.com/guide)", item), "sections"), "pass", item);
  }
  for (const item of ["- Read\n\n[Guide](https://example.com/guide)", "- Read\n### More\n[Guide](https://example.com/guide)", "- Read\n> [Guide](https://example.com/guide)", "- Read\n---\n[Guide](https://example.com/guide)", "[Guide](https://example.com/guide)"]) {
    assert.equal(await status(base.replace("- [Guide](https://example.com/guide)", item), "sections"), "warn", item);
  }
});

test("Tek-560 V06: the HTML check needs a real tag", async () => {
  const add = (t: string) => base + "\n" + t + "\n";
  for (const t of ["For the calculation, a <b + c.", "if n <b1 + 2", "a <b + c > d", "x <3 and 2> y", "<https://example.com>", "<mailto:a@example.com>", "a < b and c > d"]) {
    assert.equal(await status(add(t), "no-html"), "pass", t);
  }
  for (const t of ["<b>bold</b>", "<br/>", "<br />", "</div>", "<!-- x -->", "<div class=\"x\">", "<a href=x>", "<img src='x'/>", "<p\nid=a>"]) {
    assert.equal(await status(add(t), "no-html"), "warn", t);
  }
});

test("Tek-560 V07: a template marker inside a comment or a raw text element does not count", () => {
  const link = '<link rel="describedby" href="/live.txt">';
  assert.deepEqual(findLinkRelations("<head><template><!--</template>" + link.replace("live", "fake") + "--></template></head>", ""), { describedby: null, markdown: null });
  assert.equal(findLinkRelations("<head><template><script>\"</template>\"</script></template>" + link + "</head>", "").describedby, "/live.txt");
  assert.equal(findLinkRelations("<head><template><template></template>" + link.replace("live", "fake") + "</template>" + link + "</head>", "").describedby, "/live.txt");
});

test("Tek-560 V07: the template scan stays linear on hostile input", async () => {
  // Both sizes stay under the 65,536 character head read, so the larger one is not cut before the scan.
  for (const unit of ["</templateX", "<template>", "<style>", "<!--", "<template><style>"]) {
    const n = Math.floor(14000 / unit.length);
    await assertLinear(JSON.stringify(unit), (s) => findLinkRelations("<head><template>" + s, ""), unit.repeat(n), unit.repeat(n * 4));
  }
});

test("Tek-560 V08: a discovery target with many query keys is masked in order and in linear time", async () => {
  // Both sizes stay under the 65,536 character head read, so the larger one is read whole.
  const homeWith = (keys: number) => '<html><head><link rel="describedby" href="https://example.com/d?' + Array.from({ length: keys }, (_, i) => "k" + i + "=v").join("&") + '"></head><body></body></html>';
  const body = await check(base, { home: homeWith(6000) });
  const d = body.checks.find((c: { id: string }) => c.id === "v2-describedby");
  assert.equal(d.status, "pass");
  assert.match(d.detail, /https:\/\/example\.com\/d\?k0=\*\*\*&k1=\*\*\*&k2=\*\*\*/);
  await assertLinear("1500 and 6000 query keys", (home) => check(base, { home }), homeWith(1500), homeWith(6000));
  const small = await check(base, { home: '<head><link rel="describedby" href="https://example.com/d?b=1&a=2&b=3&c#f"></head>' });
  assert.match(small.checks.find((c: { id: string }) => c.id === "v2-describedby").detail, /https:\/\/example\.com\/d\?b=\*\*\*&a=\*\*\*&c=\*\*\*$/);
});

test("Tek-560 V10: an empty blockquote is not a summary", async () => {
  for (const q of [">", ">   ", ">\t", "  >"]) {
    const text = base.replace("> Summary.", q);
    assert.equal(await status(text, "summary"), "warn", JSON.stringify(q));
    assert.match(await detail(text, "summary"), /recommended by the format/, JSON.stringify(q));
  }
  assert.equal(await status(base.replace("> Summary.", ">Summary."), "summary"), "pass");
  assert.equal(await status(base, "summary"), "pass");
});

test("Tek-560 F1: a blockquote block is the summary when any of its lines has text", async () => {
  const withQuote = (q: string) => base.replace("> Summary.", q);
  for (const q of [">\n> Real summary", "> \n> Real summary", ">\n>\n> Real summary", "  >\n  > Real summary", "> Real summary\n>"]) {
    assert.equal(await status(withQuote(q), "summary"), "pass", JSON.stringify(q));
    assert.match(await detail(withQuote(q), "summary"), /Real summary/, JSON.stringify(q));
  }
  // A block whose every line is empty still warns, and it is not called a late blockquote.
  for (const q of [">", ">\n>", "> \n>\t\n>"]) {
    assert.equal(await status(withQuote(q), "summary"), "warn", JSON.stringify(q));
    assert.match(await detail(withQuote(q), "summary"), /recommended by the format/, JSON.stringify(q));
  }
  // A text blockquote after a blank line and an empty one is a different block and is named late.
  const late = withQuote(">\n\n> Later");
  assert.equal(await status(late, "summary"), "warn");
  assert.match(await detail(late, "summary"), /comes after other text/);
});

test("Tek-560 F2: an empty list marker takes only an indented continuation, and a fence closes the item", async () => {
  const item = (t: string) => base.replace("- [Guide](https://example.com/guide)", t);
  for (const t of ["-\n  [Guide](https://example.com/guide)", "-\n\t[Guide](https://example.com/guide)", "- Read\n[Guide](https://example.com/guide)", "- Read\nthe [Guide](https://example.com/guide)", "-\n  Read the\n[Guide](https://example.com/guide)"]) {
    assert.equal(await status(item(t), "sections"), "pass", JSON.stringify(t));
  }
  for (const t of ["-\n[Guide](https://example.com/guide)", "-\n [Guide](https://example.com/guide)", "-\n\n  [Guide](https://example.com/guide)", "- \n[Guide](https://example.com/guide)", "1.\n[Guide](https://example.com/guide)", "- Read\n```\nx\n```\n[Guide](https://example.com/guide)"]) {
    assert.equal(await status(item(t), "sections"), "warn", JSON.stringify(t));
  }
  // A fence indented to the item content column is inside the item, so the item stays open after it.
  for (const t of ["- x\n  ```\n  y\n  ```\n  [Guide](https://example.com/guide)", "1. x\n   ```\n   y\n   ```\n   [Guide](https://example.com/guide)"]) {
    assert.equal(await status(item(t), "sections"), "pass", JSON.stringify(t));
  }
});

test("Tek-560 F3: the HTML check reads any non-space attribute name", async () => {
  const add = (t: string) => base + "\n" + t + "\n";
  for (const t of ["<div @click=\"x\">", "<div *ngIf=\"x\">", "<div class=a\"b\">", "<div class=a'b'>", "<div :class=\"x\" #slot>", "<div v-on:click.prevent=\"x\">", "<a title=\"1 > 2\">", "<input disabled>"]) {
    assert.equal(await status(add(t), "no-html"), "warn", t);
  }
  for (const t of ["For the calculation, a <b + c.", "a <b + c > d", "a <b * c > d", "x <3 and 2> y", "<https://example.com>"]) {
    assert.equal(await status(add(t), "no-html"), "pass", t);
  }
  // A tag still open at the end of the file has no closing bracket and does not warn.
  assert.equal(await status(base + "\n<div class=\"x\"", "no-html"), "pass");
  // The scan stays linear on a long run of attributes with no closing bracket.
  for (const unit of ["<a b ", "<a b=\"x\" c='y ", "<a @b=x\"y\" ", "<a +++ ", "<a b=\"<a b='"]) {
    await assertLinear(JSON.stringify(unit), (s) => status(base + "\n" + s, "no-html"), unit.repeat(10000), unit.repeat(40000));
  }
});

test("Tek-560 V-1: the HTML check reads a Unicode letter or digit in an attribute name", async () => {
  const add = (t: string) => base + "\n" + t + "\n";
  for (const t of ["<p ä=\"x\">", "<p data-ñ=1>", "<p é>", "<p ٣=\"x\">", "<p 名前=\"x\">"]) {
    assert.equal(await status(add(t), "no-html"), "warn", t);
  }
  for (const t of ["a <b + c > d", "a <b ! ? > d", "a <é> b"]) {
    assert.equal(await status(add(t), "no-html"), "pass", t);
  }
  for (const unit of ["<a ä ", "<a ä=\"x\" c='y ", "<a @ä=x\"y\" ", "<a ", "<a b=\"<a b='"]) {
    await assertLinear(JSON.stringify(unit), (s) => status(base + "\n" + s, "no-html"), unit.repeat(10000), unit.repeat(40000));
  }
});

test("Tek-560 V-2: the line after a fence needs the item's content column, and the column is the real content start", async () => {
  const item = (t: string) => base.replace("- [Guide](https://example.com/guide)", t);
  const link = "[Guide](https://example.com/guide)";
  // (a) A lazy continuation cannot follow a fence, even one that sits inside the item.
  assert.equal(await status(item("- item\n  ```\n  x\n  ```\n" + link), "sections"), "warn");
  assert.equal(await status(item("- item\n  ```\n  x\n  ```\n  " + link), "sections"), "pass");
  // (b) "-   item" has its content at column 4, so 2 columns of indent are not inside the item.
  assert.equal(await status(item("-   item\n  ```\n  x\n  ```\n  " + link), "sections"), "warn");
  assert.equal(await status(item("-   item\n\n  " + link), "sections"), "warn");
  assert.equal(await status(item("-   item\n\n    " + link), "sections"), "pass");
  assert.equal(await status(item("- item\n\n  " + link), "sections"), "pass");
  // A bare marker takes a continuation only at its content column, which is 3 for "1.".
  assert.equal(await status(item("1.\n  " + link), "sections"), "warn");
  assert.equal(await status(item("1.\n   " + link), "sections"), "pass");
  // A lazy continuation of a plain item is unchanged.
  assert.equal(await status(item("-   item\n" + link), "sections"), "pass");
});

// Tek-680: every request the validator sends to the checked site carries CF-Connecting-IP and x-real-ip
// set to the fixed address, never the visitor's, on both documents and on every redirect hop.
test("Tek-680: the validator sets the client IP headers to the fixed address on every outbound request", async () => {
  const fixed = "2a06:98c0:3600::103";
  const visitor = "203.0.113.7";
  const seen: { url: string; headers: Headers }[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    seen.push({ url: u, headers: new Headers(init?.headers) });
    if (u === "https://example.com/llms.txt") return new Response(null, { status: 301, headers: { location: "https://www.example.com/llms.txt" } });
    if (u === "https://www.example.com/llms.txt") return new Response(base, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    if (u === "https://example.com/") return new Response("<html></html>", { status: 200, headers: { "content-type": "text/html" } });
    throw new Error("unexpected fetch to " + u);
  };
  try {
    const req = new Request("https://turva.dev/llms-txt-validator?url=example.com", {
      headers: { accept: "application/json", "cf-connecting-ip": visitor, "x-real-ip": visitor, "x-forwarded-for": visitor }
    });
    const res = await worker.fetch(req, {});
    assert.equal(res.status, 200);
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.deepEqual(seen.map((s) => s.url), ["https://example.com/llms.txt", "https://www.example.com/llms.txt", "https://example.com/"]);
  for (const s of seen) {
    assert.equal(s.headers.get("cf-connecting-ip"), fixed, s.url);
    assert.equal(s.headers.get("x-real-ip"), fixed, s.url);
    for (const [name, value] of s.headers) assert.ok(!value.includes(visitor), s.url + " carries the visitor's address in " + name);
  }
});

// Round 24, V1-2: the hosted form removes tab, CR and LF from the typed address before it reads it, so an
// address with one inside its scheme is read as the address it spells. The package normalizeHostInput
// does the same since 0.7.1 (test/validate.test.ts, "host normalization and public-host gate").
test("Round 24 V1-2: a tab or a line break inside the typed scheme is removed before the address is read", async () => {
  const realFetch = globalThis.fetch;
  const asked: string[] = [];
  globalThis.fetch = async (url) => {
    const u = String(url);
    asked.push(u);
    if (u === "https://example.com/llms.txt") return new Response(base, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    if (u === "https://example.com/") return new Response("", { status: 404, headers: { "content-type": "text/html" } });
    throw new Error("unexpected fetch to " + u);
  };
  try {
    for (const typed of ["ht%09tps://example.com", "https:%0A//example.com", "https:%0D%0A//Exam%09ple.com/path"]) {
      const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=" + typed, { headers: { accept: "application/json" } }), {});
      assert.equal(res.status, 200, typed);
      assert.equal(JSON.parse(await res.text()).target, "https://example.com/llms.txt", typed);
    }
    assert.ok(asked.every((u) => u.startsWith("https://example.com/")), asked.join(" "));
  } finally {
    globalThis.fetch = realFetch;
  }
});
