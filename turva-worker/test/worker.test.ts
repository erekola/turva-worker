import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { escapeHtml, renderInline, markdownToHtml } from "../src/worker.ts";

test("escapeHtml escapes all five HTML-significant characters", () => {
  assert.equal(escapeHtml("&<>\"'"), "&amp;&lt;&gt;&quot;&#39;");
});

test("renderInline drops dangerous link schemes but keeps the visible text", () => {
  const out = renderInline("[click](javascript:alert(1))");
  assert.ok(!/href=/i.test(out), "must not emit an href for a javascript: link");
  assert.ok(!/javascript:/i.test(out), "must not pass the javascript: scheme through");
  assert.ok(out.includes("click"), "must keep the visible label");
});

test("renderInline keeps safe https links", () => {
  assert.equal(renderInline("[site](https://turva.dev)"), '<a href="https://turva.dev">site</a>');
});

test("markdownToHtml renders headings and lists", () => {
  assert.equal(markdownToHtml("## Title"), "<h2 id=\"title\">Title</h2>");
  assert.equal(markdownToHtml("- one\n- two"), "<ul><li>one</li><li>two</li></ul>");
});

test("the default export is a worker with a fetch handler", () => {
  assert.equal(typeof worker.fetch, "function");
  assert.equal(typeof worker.scheduled, "function");
});

test("renderInline: a link whose href holds a quote, angle bracket or space cannot add an attribute (audit R1-1)", () => {
  // The <https://...> autolinker runs before the [label](href) rule and builds markup with a quote
  // in it; the link rule used to take that markup as its href and close the attribute early.
  const marker = "style=position:fixed;inset:0;background:white;z-index:2147483647";
  const inputs = [
    `[Review marker](https://example.invalid/ <https://example.invalid/ ${marker} >)`,
    `[Review marker](https://example.invalid/<https://example.invalid/ ${marker}>)`,
    `[Review marker](https://example.invalid/>x ${marker})`,
    `[Review marker](https://example.invalid/ ${marker})`,
    `[Review marker](https://example.invalid/"${marker})`,
  ];
  for (const md of inputs) {
    const out = renderInline(md);
    assert.ok(!/<a [^>]*\sstyle=/i.test(out), "no anchor may carry a style attribute: " + out);
    assert.ok(!/<[a-z][^>]*\sstyle=/i.test(out), "no tag may carry a style attribute: " + out);
    assert.ok(out.includes("Review marker"), "the visible label stays: " + out);
  }
  assert.equal(renderInline("[ok](https://example.invalid/a?b=1&c=2)"), '<a href="https://example.invalid/a?b=1&amp;c=2">ok</a>');
});
