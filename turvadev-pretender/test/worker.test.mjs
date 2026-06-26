import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { escapeHtml, renderInline, markdownToHtml } from "../src/worker.js";

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
  assert.equal(markdownToHtml("## Title"), "<h2>Title</h2>");
  assert.equal(markdownToHtml("- one\n- two"), "<ul><li>one</li><li>two</li></ul>");
});

test("the default export is a worker with a fetch handler", () => {
  assert.equal(typeof worker.fetch, "function");
  assert.equal(typeof worker.scheduled, "function");
});
