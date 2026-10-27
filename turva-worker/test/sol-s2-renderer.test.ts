import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker, { markdownToHtml } from "../src/worker.ts";
import { stripTypes } from "../test-support/strip-types.ts";

// Regression tests for the Sol repo read 2026-10-07, Tek-578 session S2: the Markdown renderer
// (WL-07 to WL-10) and the JSON-LD escape (WL-31). Each test fails when its fix is removed.

const BS = String.fromCharCode(92);
const workerSrc = readFileSync(new URL("../src/worker.ts", import.meta.url), "utf8");

// ---- WL-07: indented code keeps its internal blank lines ----

test("WL-07: an indented code block keeps a blank line inside its text, and the blank lines at its ends are dropped", () => {
  assert.equal(markdownToHtml("    a\n\n    b"), "<pre><code>a\n\nb</code></pre>");
  assert.equal(markdownToHtml("    a\n\n\n    b"), "<pre><code>a\n\n\nb</code></pre>");
  assert.equal(markdownToHtml("    a\n    \n    b"), "<pre><code>a\n\nb</code></pre>");
  const req = "Send:\n\n    POST /x\n    Accept: application/json\n\n    {\"url\": \"a\"}\n\nAfter.";
  assert.equal(markdownToHtml(req), "<p>Send:</p>\n<pre><code>POST /x\nAccept: application/json\n\n{&quot;url&quot;: &quot;a&quot;}</code></pre>\n<p>After.</p>");
  // A blank line followed by anything that is not indented still ends the block.
  assert.equal(markdownToHtml("    a\n\nplain"), "<pre><code>a</code></pre>\n<p>plain</p>");
  // A paragraph is not pulled into a code run by an indented line after a blank line.
  assert.equal(markdownToHtml("para\n\n    code"), "<p>para</p>\n<pre><code>code</code></pre>");
});

test("WL-07: a section read through mdSecBodyHtml keeps the blank line of an indented request example (the parity page)", async () => {
  const res = await worker.fetch(new Request("https://turva.dev/markdown-parity-check", { headers: { accept: "text/html" } }), {});
  const html = await res.text();
  assert.ok(html.includes("Accept: application/json\n\n{&quot;url&quot;"), "the request headers and the JSON body are one code block with a blank line between");
  assert.equal([...html.matchAll(/<pre tabindex="0"><code>POST /g)].length, 1);
});

// ---- WL-08: inline code in a brief keeps a held backslash escape ----

test("WL-08: a brief's inline code keeps the backslash of an escaped character, prose loses it", async () => {
  const id = "wl08brief";
  const md = "Literal `" + BS + "#` and `" + BS + "-` and `a" + BS + ">b` code, prose " + BS + "# and " + BS + "- here.\n";
  const rec = { md, json: {}, kieli: "en", otsikko: "t" };
  const env = { BRIEFIT: { get: async (k: string) => (k === id ? rec : null) } };
  const res = await worker.fetch(new Request("https://turva.dev/brief/" + id, { headers: { accept: "text/html" } }), env);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.ok(html.includes("<code>" + BS + "#</code>"), "inline code keeps \\#");
  assert.ok(html.includes("<code>" + BS + "-</code>"), "inline code keeps \\-");
  assert.ok(html.includes("<code>a" + BS + "&gt;b</code>"), "inline code keeps \\> and escapes the angle bracket");
  assert.ok(html.includes("prose # and - here."), "prose drops the backslash and keeps the character");
});

// ---- WL-09: heading ids stay unique when a natural slug looks like a suffixed one ----

test("WL-09: a heading whose own slug is same-2 does not collide with the second same", () => {
  const ids = (md: string) => [...markdownToHtml(md).matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids("## Same\n\n## Same\n\n## Same 2"), ["same", "same-2", "same-2-2"]);
  assert.deepEqual(ids("## Same 2\n\n## Same\n\n## Same"), ["same-2", "same", "same-3"]);
  assert.deepEqual(ids("## Q\n\n### Q\n\n## Q 2\n\n### Q"), ["q", "q-2", "q-2-2", "q-3"]);
  for (const md of ["## Same\n\n## Same\n\n## Same 2", "## A\n\n### A\n\n## A 2\n\n### A 2\n\n## A"]) {
    const all = ids(md);
    assert.equal(new Set(all).size, all.length, "ids must be unique: " + all.join(","));
  }
});

// ---- WL-10: every heading line is its own block ----

test("WL-10: adjacent heading lines and a heading line under a paragraph line are each their own block", () => {
  assert.equal(markdownToHtml("## A\n## B\n- item"), '<h2 id="a">A</h2>\n<h2 id="b">B</h2>\n<ul><li>item</li></ul>');
  assert.equal(markdownToHtml("## A\n## B\n## C"), '<h2 id="a">A</h2>\n<h2 id="b">B</h2>\n<h2 id="c">C</h2>');
  assert.equal(markdownToHtml("paragraph\n## A"), '<p>paragraph</p>\n<h2 id="a">A</h2>');
  assert.equal(markdownToHtml("## A\ntext line\n### B\nmore"), '<h2 id="a">A</h2>\n<p>text line</p>\n<h3 id="b">B</h3>\n<p>more</p>');
  // An indented line that looks like a heading inside a code run stays code.
  assert.equal(markdownToHtml("    # not a heading\n    still code"), "<pre><code># not a heading\nstill code</code></pre>");
});

// ---- WL-31: the JSON-LD escape keeps a closing-script sequence inside the script element ----

function realJsonLdSafe(): (s: string) => string {
  const at = workerSrc.indexOf("function jsonLdSafe(");
  assert.ok(at > -1, "jsonLdSafe must exist in the worker source");
  let depth = 0, i = workerSrc.indexOf("{", at);
  for (; i < workerSrc.length; i++) {
    if (workerSrc[i] === "{") depth++;
    else if (workerSrc[i] === "}") { depth--; if (depth === 0) { i++; break; } }
  }
  return new Function(stripTypes(workerSrc.slice(at, i)) + "\nreturn jsonLdSafe;")();
}

test("WL-31: a closing-script sequence and an HTML comment opener in a JSON-LD value stay inside the script element and round-trip to the full value", () => {
  const jsonLdSafe = realJsonLdSafe();
  const value = "a </script><script>alert(1)</script> b <!-- c </SCRIPT > d";
  const doc = { "@type": "Answer", text: value, nested: [{ n: "x</script>y" }] };
  const page = `<p>before</p><script type="application/ld+json">${jsonLdSafe(JSON.stringify(doc))}</script><p>after</p>`;
  // The page reader's own rule: a script element ends at the first closing-script tag.
  const blocks = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  assert.equal(blocks.length, 1, "exactly one script element, nothing injected after it");
  assert.ok(!/<\/script/i.test(blocks[0][1]), "no closing-script tag inside the block");
  assert.deepEqual(JSON.parse(blocks[0][1]), doc, "the block parses and round-trips to the full original value");
});
