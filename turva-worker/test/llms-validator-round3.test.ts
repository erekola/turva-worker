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
  return new Function('"use strict";\n' + src + "\nreturn { validateLlmsTxt, validateV2Discovery };")();
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
