import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";

// Regression tests for Tek-496 (outside audit 2026-09-26): the hosted llms.txt validator reads the
// H1, the links, the order of headings, the link targets and the media type the way the format and
// CommonMark do, refuses localhost.localdomain, masks the discovery targets it shows and says when
// it read only part of a long head. Each case below gave the opposite result before the change.

const BS = String.fromCharCode(92);
const ESC = String.fromCharCode(27);
const base = "# Example\n\n> Summary.\n\n## Docs\n\n- [Guide](https://example.com/guide)\n";

async function check(llms, { contentType = "text/plain; charset=utf-8", home = "" } = {}) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u === "https://example.com/llms.txt") return new Response(llms, { status: 200, headers: { "content-type": contentType } });
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
const status = (body, id) => body.checks.find((c) => c.id === id).status;

test("Tek-496: the base file stays valid", async () => {
  assert.equal((await check(base)).summary, "valid");
});

test("Tek-496, H1: whitespace after the marker is allowed, a heading with no text is not", async () => {
  for (const t of ["#  Example", "#\tExample", "# Example #", "   # Example"]) {
    assert.equal(status(await check(base.replace("# Example", t)), "h1-title"), "pass", t);
  }
  for (const t of ["# ###", "#", "#   #  "]) {
    const body = await check(base.replace("# Example", t));
    assert.equal(status(body, "h1-title"), "fail", t);
    assert.match(body.checks.find((c) => c.id === "h1-title").detail, /has no text/, t);
  }
  assert.equal(status(await check(base.replace("# Example", "#Example")), "h1-title"), "fail");
});

// F08 (Tek-496 audit round): the summary check used to trim the line before testing it, which
// erases the difference between a blockquote and an indented code block. Four spaces or a tab
// makes the line a code block under CommonMark, not a summary, and up to three spaces is still
// a blockquote, the same boundary the H1 check above already allows.
test("Tek-496, summary: an indented code block is not a blockquote summary", async () => {
  for (const line of ["    > this is an indented code block", "\t> tab-indented, also a code block"]) {
    const body = await check(base.replace("> Summary.", line));
    assert.equal(status(body, "summary"), "warn", line);
  }
  for (const line of ["> Summary.", "   > three spaces is still a blockquote"]) {
    assert.equal(status(await check(base.replace("> Summary.", line)), "summary"), "pass", line);
  }
});

test("Tek-496, links: code, an escaped bracket and an image are not links", async () => {
  for (const line of ["- `[Guide](https://example.com/guide)`", "- " + BS + "[Guide](https://example.com/guide)", "- ![Guide](https://example.com/guide)", "- ``[Guide](https://example.com/guide)``"]) {
    const body = await check(base.replace("- [Guide](https://example.com/guide)", line));
    assert.equal(status(body, "links"), "warn", line);
    assert.equal(body.summary, "valid with warnings", line);
  }
});

test("Tek-496, links: an ordered list, a tab, a title and an angle target are links", async () => {
  for (const line of ["1. [Guide](https://example.com/guide)", "2) [Guide](https://example.com/guide)", "-\t[Guide](https://example.com/guide)", "- [Guide](https://example.com/guide \"Guide\")", "- [Guide](https://example.com/guide 'Guide')", "- [Guide](<https://example.com/guide>)", "- [Guide](  https://example.com/guide  )", "- " + BS + "![Guide](https://example.com/guide)", "- " + BS + BS + "[Guide](https://example.com/guide)", "- `x` [Guide](https://example.com/guide) `y`"]) {
    assert.equal((await check(base.replace("- [Guide](https://example.com/guide)", line))).summary, "valid", line);
  }
});

test("Tek-496, links: one line ending may stand around the destination, a blank line may not", async () => {
  const wrapped = await check(base + "\nSee [the guide](https://example.com/guide\n) and [more](\nhttps://example.com/more).\n");
  assert.match(wrapped.checks.find((c) => c.id === "links").detail, /^3 links, all absolute URLs/);
  const broken = await check(base + "\nSee [the guide](\n\nhttps://example.com/guide).\n");
  assert.match(broken.checks.find((c) => c.id === "links").detail, /^1 link, all absolute URLs/);
});

test("Tek-496, structure: a heading before the first H2 or a second H1 warns and names its line", async () => {
  const extra = await check(base.replace("## Docs", "### Extra heading\n\n## Docs"));
  assert.equal(status(extra, "sections"), "warn");
  assert.match(extra.checks.find((c) => c.id === "sections").detail, /heading at line 5 is out of place/);
  assert.equal(status(await check(base.replace("## Docs", "# Another\n\n## Docs")), "sections"), "warn");
  assert.equal(status(await check(base + "\n# Another\n"), "sections"), "warn");
  assert.equal(status(await check(base + "\n### Sub\n\n- [B](https://example.com/b)\n"), "sections"), "pass");
  assert.equal(status(await check(base.replace("## Docs", "```\n### in a fence\n```\n\n## Docs")), "sections"), "pass");
});

test("Tek-496, links: a target the URL parser refuses is not an absolute URL", async () => {
  for (const u of ["https://%", "https://example.com:99999/", "https://[", "https://user@", "https://example.com:bogus/"]) {
    const body = await check(base.replace("https://example.com/guide", u));
    assert.equal(status(body, "links"), "warn", u);
    assert.match(body.checks.find((c) => c.id === "links").detail, /not valid http or https URLs/, u);
  }
  assert.equal(status(await check(base.replace("https://example.com/guide", "HTTPS://EXAMPLE.COM/guide")), "links"), "pass");
});

test("Tek-496, content type: the media type is compared whole", async () => {
  for (const ct of ["application/x-text/plain", "text/markdownish", "application/json; x=text/plain"]) {
    assert.equal(status(await check(base, { contentType: ct }), "content-type"), "warn", ct);
  }
  for (const ct of ["text/plain", "text/markdown; charset=utf-8", "Text/Plain ; charset=utf-8"]) {
    assert.equal(status(await check(base, { contentType: ct }), "content-type"), "pass", ct);
  }
});

test("Tek-496, host: localhost.localdomain is refused without a fetch", async () => {
  const realFetch = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url) => { seen.push(String(url)); throw new Error("must not be called"); };
  try {
    const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=localhost.localdomain", { headers: { accept: "application/json" } }), {});
    assert.equal(res.status, 400);
    assert.deepEqual(seen, []);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("Tek-496, discovery: a shown target is masked and carries no control character", async () => {
  const marker = "m" + Math.random().toString(36).slice(2);
  const home = "<head><link rel=\"describedby\" href=\"https://u:" + marker + "@example.com/llms.txt?token=" + marker + "#" + marker + "\">" +
    "<link rel=\"alternate\" type=\"text/markdown\" href=\"/index.md?k=" + marker + ESC + "[2J\"></head>";
  const body = await check(base, { home });
  const text = JSON.stringify(body.checks);
  assert.ok(!text.includes(marker), "no user name, password, query value or fragment in the report");
  assert.ok(!body.checks.some((c) => c.detail.includes(ESC)), "no ESC in any detail");
  assert.equal(status(body, "v2-describedby"), "pass");
  assert.match(body.checks.find((c) => c.id === "v2-markdown-alternate").detail, /to \/index\.md\?\*\*\*/);
});

test("Tek-496, discovery: a relation past the 65,536 character cap is reported as not found in the part read", async () => {
  const links = "<link rel=\"describedby\" href=\"/llms.txt\"><link rel=\"alternate\" type=\"text/markdown\" href=\"/index.md\">";
  const long = "<html><head><meta name=\"pad\" content=\"" + "x".repeat(65536) + "\">" + links + "</head><body></body></html>";
  const body = await check(base, { home: long });
  assert.equal(status(body, "v2-describedby"), "info");
  assert.match(body.checks.find((c) => c.id === "v2-describedby").detail, /first 65,536 characters of the head/);
  const short = await check(base, { home: "<head>" + links + "</head>" });
  assert.equal(status(short, "v2-describedby"), "pass");
});

test("Tek-496: turva.dev's own llms.txt stays valid", async () => {
  const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=turva.dev", { headers: { accept: "application/json" } }), {});
  const body = JSON.parse(await res.text());
  assert.equal(body.summary, "valid");
});

// The scan is measured by its growth, not by a wall clock: four times the input takes about four
// times as long when the scan is linear and sixteen times when it is quadratic. A fixed time limit
// passed on this machine and failed on a slower CI runner once (mds/gotchas.md 2026-09-27 (jatko 3)).
test("Tek-496: the link scan stays linear on hostile input", async () => {
  const hostile = (k) => "# T\n\n## S\n\n- " + "[a](x \"".repeat(Math.round(4000 * k)) + "\n" + " ``".repeat(Math.round(3000 * k)) + "`\n" + BS.repeat(Math.round(10000 * k)) + "[a](b)\n" + "[a](<".repeat(Math.round(4000 * k)) + "\n" + "[a](".repeat(Math.round(8000 * k)) + "\n# " + " #".repeat(Math.round(5000 * k)) + "x";
  const best = async (k) => {
    const text = hostile(k);
    let min = Infinity;
    for (let r = 0; r < 5; r++) {
      const started = process.hrtime.bigint();
      await check(text);
      min = Math.min(min, Number(process.hrtime.bigint() - started) / 1e6);
    }
    return min;
  };
  // Both sizes stay under the 256 KB body cap, or the larger one would be cut before the scan.
  await best(1);
  const small = await best(0.5);
  const large = await best(2);
  const ratio = large / small;
  assert.ok(ratio < 10, "4x the input took " + ratio.toFixed(1) + "x as long (" + small.toFixed(1) + " ms to " + large.toFixed(1) + " ms)");
});

// Tek-564 (outside re-check W36 to W44, V1): a second H1 written as a setext heading, one text
// line over a run of "=", warns like "# Second title" does, with the same detail and the line of
// the text. Before v3.203.0 only the "#" form was read after the title. The package
// turva-llms-txt-validator mirrors this from 0.3.19.
const sectionsOf = async (text) => (await check(text)).checks.find((c) => c.id === "sections");
const setextBetween = base.replace("## Docs", "Second title\n============\n\n## Docs");
const atxBetween = base.replace("## Docs", "# Second title\n\n## Docs");
const setextAfter = base + "\nSecond title\n============\n";
const atxAfter = base + "\n# Second title\n";

test("Tek-564: a setext second H1 between the title and the first H2 warns and names its text line", async () => {
  const body = await check(setextBetween);
  const s = body.checks.find((c) => c.id === "sections");
  assert.equal(s.status, "warn");
  assert.match(s.detail, /heading at line 5 is out of place/);
  assert.equal(body.summary, "valid with warnings");
});

test("Tek-564: a setext second H1 after the last section warns and names its text line", async () => {
  const body = await check(setextAfter);
  const s = body.checks.find((c) => c.id === "sections");
  assert.equal(s.status, "warn");
  assert.match(s.detail, /heading at line 9 is out of place/);
  assert.equal(body.summary, "valid with warnings");
});

test("Tek-564: the ATX and the setext form give the same check status and the same detail", async () => {
  for (const [atx, setext] of [[atxBetween, setextBetween], [atxAfter, setextAfter]]) {
    const a = await sectionsOf(atx);
    const s = await sectionsOf(setext);
    assert.equal(s.status, a.status);
    assert.equal(s.detail, a.detail);
    assert.equal(a.status, "warn");
  }
});

test("Tek-564: a setext second H1 ends the section before it, like an ATX one", async () => {
  const withList = base + "\nSecond title\n============\n\n- [More](https://example.com/more)\n";
  assert.equal((await sectionsOf(withList)).detail.startsWith("1 section, 1 carrying a file list"), true);
  const noList = "# Example\n\n> Summary.\n\n## Docs\n\nSecond title\n============\n\n- [Guide](https://example.com/guide)\n";
  const atxNoList = "# Example\n\n> Summary.\n\n## Docs\n\n# Second title\n\n- [Guide](https://example.com/guide)\n";
  assert.equal((await sectionsOf(noList)).detail, (await sectionsOf(atxNoList)).detail);
  assert.match((await sectionsOf(noList)).detail, /but no file list under any of them/);
});

test("Tek-564: the limits stay, a multi-line setext heading and setext text that starts with # are not an H1", async () => {
  for (const extra of ["Line one\nSecond title\n============\n", "#Second title\n============\n", "- item\nSecond title\n============\n", "> quote\nSecond title\n============\n"]) {
    const s = await sectionsOf(base + "\n" + extra);
    assert.equal(s.status, "pass", extra);
    assert.ok(!/out of place/.test(s.detail), extra);
  }
  // The underline alone is never a heading, and a fenced pair is code.
  assert.equal((await sectionsOf(base + "\n============\n")).status, "pass");
  assert.equal((await sectionsOf(base + "\n```\nSecond title\n============\n```\n")).status, "pass");
  // A setext title is still the title, and nothing after it is out of place.
  const setextTitle = "Example\n=======\n\n> Summary.\n\n## Docs\n\n- [Guide](https://example.com/guide)\n";
  assert.equal((await check(setextTitle)).summary, "valid");
});

test("Tek-564: a second setext H1 right under a setext title, with no blank line, is out of place", async () => {
  const s = await sectionsOf("Example\n=======\nSecond title\n============\n\n## Docs\n\n- [Guide](https://example.com/guide)\n");
  assert.equal(s.status, "warn");
  assert.match(s.detail, /heading at line 3 is out of place/);
});

test("Tek-564: a thematic break, an HTML block or a link reference definition over = is not a second H1", async () => {
  for (const extra of ["---\n============\n", "***\n============\n", "___\n============\n", "<div>\n============\n", "<!-- c -->\n============\n", "[a]: https://example.com/x\n============\n"]) {
    const s = await sectionsOf(base + "\n" + extra);
    assert.equal(s.status, "pass", extra);
    assert.ok(!/out of place/.test(s.detail), extra);
  }
  // An autolink is paragraph text, so an autolink line over a run of "=" is still a second H1.
  assert.equal((await sectionsOf(base + "\n<https://example.com/x>\n============\n")).status, "warn");
});
