import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";

// Mirrors llms-txt-validator/test/round3.test.mjs (Tek-542, batch Fv) against the hosted
// validator route instead of the package's own exports: worker.js exports only
// { default, escapeHtml, renderInline, markdownToHtml, findLinkRelations }, so maskLocation,
// validateLlmsTxt, collectLinks and collectLinkDefinitions are reached the way
// test/tek-526-wk.test.mjs already reaches worker.js's validator internals, through
// GET /llms-txt-validator?url=... with Accept: application/json and a mocked global fetch
// standing in for the target host's /llms.txt and home page.

const env = {};
const prefix = "# Example\n\n> Summary\n\n## Docs\n\n";

function mockFetch(routes) {
  return async (input) => {
    const u = new URL(typeof input === "string" ? input : input.url);
    const entry = routes[u.pathname];
    if (!entry) return new Response("not found", { status: 404 });
    return new Response(entry.text, {
      status: entry.status || 200,
      headers: { "content-type": entry.contentType || "text/plain; charset=utf-8" }
    });
  };
}

async function validate(text) {
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

function byId(checks, id) {
  return checks.find((c) => c.id === id);
}

// --- V03-VREG1: a link reference definition is CommonMark-valid only in its own block, not
// inside a code span or as a paragraph continuation line, with a title that is quoted or absent;
// fence removal must not join lines across a fenced block. Same four cases as the package test.
test("VREG1: a definition with an unquoted trailing word is not a definition", async () => {
  const text = prefix + "- [Guide][guide]\n\n[guide]: https://example.com/guide not-a-title\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").detail, "no markdown links found");
});

test("VREG1: a definition-shaped line inside an inline code span is literal code", async () => {
  const text = prefix + "- [Guide][guide]\n\n`some code\n[guide]: https://example.com/guide\nend code`\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").detail, "no markdown links found");
});

test("VREG1: a definition-shaped line that continues open paragraph text is not a definition", async () => {
  const text = prefix + "- [Guide][guide]\n\nA paragraph\n[guide]: https://example.com/guide\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").detail, "no markdown links found");
});

test("VREG1: fence removal does not join a link target across a fenced code block", async () => {
  const text = prefix + "- [Guide](\n```\nanything\n```\n  https://example.com/guide\n  )\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").detail, "no markdown links found");
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
  assert.equal(byId(body.checks, "links").detail, "no markdown links found");
});

test("VN2: a collapsed reference, \"[label][]\", still resolves (regression guard)", async () => {
  const text = prefix + "- [Guide][]\n\n[guide]: https://example.com/guide\n";
  const { body } = await validate(text);
  assert.equal(byId(body.checks, "links").status, "pass");
});

// --- V13 D5-1: with no slash at all, a ":" ahead of the last @ is user:password and is masked;
// an @ with no ":" ahead of it (an asset name) stays as given. worker.js does not export
// maskLocation and no hosted route reaches this shape (a Location value is resolved against the
// request URL first), so the function is read out of the source text and run as it stands.
import { readFileSync } from "node:fs";

function loadMaskLocation() {
  const src = readFileSync(new URL("../src/worker.js", import.meta.url), "utf8");
  const start = src.indexOf("function maskLocation(href, base) {");
  assert.ok(start >= 0, "maskLocation is in worker.js");
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
