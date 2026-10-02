import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { findLinkRelations } from "../src/worker.js";

// Regression tests for Tek-560 (outside review 2026-10-02, items V01 to V04, V06, V07, V08 and
// V10): the hosted llms.txt validator, the canonical copy. The package turva-llms-txt-validator
// 0.3.16 carries the same cases in test/tek560.test.mjs. Each case gave the opposite result
// before the change, except the guards that say what still holds.

const BS = String.fromCharCode(92);
const base = "# Example\n\n> Summary.\n\n## Docs\n\n- [Guide](https://example.com/guide)\n";

async function check(llms, { home = "" } = {}) {
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
const status = async (text, id) => (await check(text)).checks.find((c) => c.id === id).status;
const detail = async (text, id) => (await check(text)).checks.find((c) => c.id === id).detail;

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
  const add = (t) => base + "\n" + t + "\n";
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

test("Tek-560 V07: the template scan stays linear on hostile input", () => {
  // Both sizes stay under the 65,536 character head read, so the larger one is not cut before the scan.
  const time = (s) => { const t = performance.now(); findLinkRelations("<head><template>" + s, ""); return performance.now() - t; };
  for (const unit of ["</templateX", "<template>", "<style>", "<!--", "<template><style>"]) {
    const n = Math.floor(14000 / unit.length);
    time(unit.repeat(n));
    const small = time(unit.repeat(n));
    const large = time(unit.repeat(n * 4));
    assert.ok(large / Math.max(small, 1) < 20, unit + " scaled " + (large / Math.max(small, 1)).toFixed(1) + "x for 4x the input");
  }
});

test("Tek-560 V08: a discovery target with many query keys is masked in order and in linear time", async () => {
  const keys = 6000;
  const href = "https://example.com/d?" + Array.from({ length: keys }, (_, i) => "k" + i + "=v").join("&");
  const home = '<html><head><link rel="describedby" href="' + href + '"></head><body></body></html>';
  const t = performance.now();
  const body = await check(base, { home });
  const ms = performance.now() - t;
  const d = body.checks.find((c) => c.id === "v2-describedby");
  assert.equal(d.status, "pass");
  assert.match(d.detail, /https:\/\/example\.com\/d\?k0=\*\*\*&k1=\*\*\*&k2=\*\*\*/);
  assert.ok(ms < 1500, keys + " keys took " + ms.toFixed(0) + " ms");
  const small = await check(base, { home: '<head><link rel="describedby" href="https://example.com/d?b=1&a=2&b=3&c#f"></head>' });
  assert.match(small.checks.find((c) => c.id === "v2-describedby").detail, /https:\/\/example\.com\/d\?b=\*\*\*&a=\*\*\*&c=\*\*\*$/);
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
  const withQuote = (q) => base.replace("> Summary.", q);
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
  const item = (t) => base.replace("- [Guide](https://example.com/guide)", t);
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
  const add = (t) => base + "\n" + t + "\n";
  for (const t of ["<div @click=\"x\">", "<div *ngIf=\"x\">", "<div class=a\"b\">", "<div class=a'b'>", "<div :class=\"x\" #slot>", "<div v-on:click.prevent=\"x\">", "<a title=\"1 > 2\">", "<input disabled>"]) {
    assert.equal(await status(add(t), "no-html"), "warn", t);
  }
  for (const t of ["For the calculation, a <b + c.", "a <b + c > d", "a <b * c > d", "x <3 and 2> y", "<https://example.com>"]) {
    assert.equal(await status(add(t), "no-html"), "pass", t);
  }
  // A tag still open at the end of the file has no closing bracket and does not warn.
  assert.equal(await status(base + "\n<div class=\"x\"", "no-html"), "pass");
  // The scan stays linear on a long run of attributes with no closing bracket.
  const time = async (s) => { const t = performance.now(); await status(base + "\n" + s, "no-html"); return performance.now() - t; };
  for (const unit of ["<a b ", "<a b=\"x\" c='y ", "<a @b=x\"y\" ", "<a +++ ", "<a b=\"<a b='"]) {
    await time(unit.repeat(2000));
    const small = await time(unit.repeat(10000));
    const large = await time(unit.repeat(40000));
    assert.ok(large / Math.max(small, 1) < 20, JSON.stringify(unit) + " scaled " + (large / Math.max(small, 1)).toFixed(1) + "x for 4x the input");
  }
});

test("Tek-560 V-1: the HTML check reads a Unicode letter or digit in an attribute name", async () => {
  const add = (t) => base + "\n" + t + "\n";
  for (const t of ["<p ä=\"x\">", "<p data-ñ=1>", "<p é>", "<p ٣=\"x\">", "<p 名前=\"x\">"]) {
    assert.equal(await status(add(t), "no-html"), "warn", t);
  }
  for (const t of ["a <b + c > d", "a <b ! ? > d", "a <é> b"]) {
    assert.equal(await status(add(t), "no-html"), "pass", t);
  }
  const time = async (s) => { const t = performance.now(); await status(base + "\n" + s, "no-html"); return performance.now() - t; };
  for (const unit of ["<a ä ", "<a ä=\"x\" c='y ", "<a @ä=x\"y\" ", "<a ", "<a b=\"<a b='"]) {
    await time(unit.repeat(2000));
    const small = await time(unit.repeat(10000));
    const large = await time(unit.repeat(40000));
    assert.ok(large / Math.max(small, 1) < 20, JSON.stringify(unit) + " scaled " + (large / Math.max(small, 1)).toFixed(1) + "x for 4x the input");
  }
});

test("Tek-560 V-2: the line after a fence needs the item's content column, and the column is the real content start", async () => {
  const item = (t) => base.replace("- [Guide](https://example.com/guide)", t);
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
