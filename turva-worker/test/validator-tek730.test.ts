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

async function assertLinear(label: string, work: (input: string) => unknown, small: string, large: string): Promise<void> {
  const sizes = large.length / small.length;
  const limit = growthLimit(sizes);
  const g = await growthRatio(work, small, large, limit);
  assert.ok(g.ratio < limit, label + ": " + sizes.toFixed(1) + "x the input took " + g.ratio.toFixed(1) + "x as long after " + g.rounds + " rounds, limit " + limit.toFixed(1));
}

// Tek-730 (2026-10-31): the hosted llms.txt validator, the canonical copy. The package
// turva-llms-txt-validator 0.5.0 carries the same cases in test/tek730.test.ts. Three changes:
// the HTML check no longer reads code, the links check warns on a list line that looks like a link
// entry but is not one, and a guide's JSON-LD carries its checked date as lastReviewed.

const BS = String.fromCharCode(92);
const EN = String.fromCharCode(0x2013);
const EM = String.fromCharCode(0x2014);
const BULLET = String.fromCharCode(0x2022);
const base = "# Example\n\n> Summary.\n\n## Docs\n\n- [Guide](https://example.com/guide)\n";
const env = {};

async function check(llms: string) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u === "https://example.com/llms.txt") return new Response(llms, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    if (u === "https://example.com/") return new Response("", { status: 404, headers: { "content-type": "text/html" } });
    throw new Error("unexpected fetch to " + u);
  };
  try {
    const res = await worker.fetch(new Request("https://turva.dev/llms-txt-validator?url=example.com", { headers: { accept: "application/json" } }), env);
    assert.equal(res.status, 200);
    return JSON.parse(await res.text());
  } finally {
    globalThis.fetch = realFetch;
  }
}
const find = async (text: string, id: string) => (await check(text)).checks.find((c: { id: string }) => c.id === id);
const status = async (text: string, id: string) => (await find(text, id)).status;
const detail = async (text: string, id: string) => (await find(text, id)).detail;
const add = (t: string) => base + "\n" + t + "\n";

test("Tek-730 A: angle brackets inside code no longer warn in the HTML check", async () => {
  const pass = [
    "Fetch `https://fal.ai/models/<endpoint-id>/llms.txt` for the model.",
    "- `submit_<form>_form` submits the form",
    "Write " + BS + "<node-name" + BS + "> for the node.",
    "Write " + BS + "<div>x" + BS + "</div> in prose.",
    "``a ` <div>x</div> b``",
    "```html\n<div class=\"x\">hi</div>\n<!-- note -->\n```",
    "~~~\n</div>\n~~~",
    "<https://example.com> and <mailto:a@example.com>",
  ];
  for (const t of pass) assert.equal(await status(add(t), "no-html"), "pass", t);
});

test("Tek-730 A: a real tag, a closing tag or a comment in prose still warns", async () => {
  const warn = [
    "<div>hi</div>",
    "</div>",
    "<!-- note -->",
    "<br/>",
    "text `code` and <b>bold</b>",
    "a ` <div>x</div>",
    BS + BS + "<div>x</div>",
    "`one`\n\n<div>x</div>\n\n`two`",
    "`a\n\n<div>x</div>\n\nb`",
    "```\ncode\n```\n<div>x</div>",
    "<p\nid=a>",
  ];
  for (const t of warn) assert.equal(await status(add(t), "no-html"), "warn", t);
});

test("Tek-730 A: an unclosed fence still hides its content, as the other checks read it", async () => {
  assert.equal(await status(add("```\n<div>x</div>"), "no-html"), "pass");
});

test("Tek-730 A: the blanking stays linear on a document of unmatched backticks and brackets", async () => {
  const doc = (k: number) => ("` <b " + BS + "<").repeat(k);
  await assertLinear("2000 and 16000 repeats", (s) => status(add(s), "no-html"), doc(2000), doc(16000));
});

test("Tek-730 B: a link entry with an unclosed destination warns in the links check", async () => {
  const nbdev = base + "- [Blogging](https://nbdev.fast.ai/tutorials/blogging.html.md: Creating a blog with notebooks)\n";
  assert.equal(await status(nbdev, "links"), "warn");
  assert.equal(await detail(nbdev, "links"), "1 link, all absolute URLs. 1 list line looks like a link entry but is not a Markdown link (line 8)");
  assert.equal((await check(nbdev)).checks.length, (await check(base)).checks.length);
});

test("Tek-730 B: an entry that starts with an en dash, an em dash or a bullet warns", async () => {
  for (const mark of [EN, EM, BULLET]) {
    const t = base + mark + " [Saleor is composable](https://saleor.io/docs/composable)\n";
    assert.equal(await status(t, "links"), "warn", mark);
    assert.match(await detail(t, "links"), /1 list line opens with a dash or bullet that is not a Markdown list marker \(line 8\)$/, mark);
  }
  const two = base + EN + " [A](https://example.com/a)\n" + EN + " [B](https://example.com/b)\n";
  assert.equal(await detail(two, "links"), "3 links, all absolute URLs. 2 list lines open with a dash or bullet that is not a Markdown list marker (lines 8, 9)");
});

test("Tek-730 B: the detail names the first five lines and counts the rest", async () => {
  const many = base + Array.from({ length: 7 }, (_, i) => EN + " [E" + i + "](https://example.com/" + i + ")\n").join("");
  assert.match(await detail(many, "links"), /7 list lines open with a dash or bullet that is not a Markdown list marker \(lines 8, 9, 10, 11, 12 and 2 more\)$/);
});

test("Tek-730 B: a valid entry, a numbered entry and a task box do not warn", async () => {
  const ok = [
    "- [Name](https://example.com/n): notes after the link",
    "- [Name](https://example.com/n)",
    "* [Name](https://example.com/n \"title\")",
    "1. [Name](https://example.com/n)",
    "  - [Nested](https://example.com/n): indented",
    "- [x] a done task",
    "- [ ] an open task",
  ];
  for (const t of ok) {
    const text = base + t + "\n";
    assert.equal(await status(text, "links"), "pass", t);
    assert.equal((await check(text)).summary, "valid", t);
  }
});

test("Tek-730 B: only lines under an H2 and outside fences are read", async () => {
  const intro = "# Example\n\n> Summary.\n\n- " + "[Orphan](https://example.com/o: x)\n\n## Docs\n\n- [Guide](https://example.com/guide)\n";
  assert.equal(await status(intro, "links"), "pass");
  const fenced = base + "\n```\n- [Blogging](https://example.com/b.md: notes)\n" + EN + " [X](https://example.com/x)\n```\n";
  assert.equal(await status(fenced, "links"), "pass");
  const numbered = base + "1. [Bad](https://example.com/b: notes)\n";
  assert.equal(await status(numbered, "links"), "warn");
});

test("Tek-730 B: an unclosed entry in a file with no other link is one warning, not a second check", async () => {
  const lone = "# Example\n\n> Summary.\n\n## Docs\n\n- [Blogging](https://nbdev.fast.ai/b.md: notes)\n";
  assert.equal(await detail(lone, "links"), "no markdown links found. 1 list line looks like a link entry but is not a Markdown link (line 7)");
});

// Tek-745 K10a: the note has two kinds. A look-alike marker is no list item whether or not its link
// parses, and when the link parses it is counted as a link, so "will not follow it" was wrong for it.
test("Tek-745 K10a: a look-alike marker with a link that parses is counted and named as a marker, not as a broken link", async () => {
  const one = "# Example\n\n> Summary.\n\n## Docs\n\n" + EN + " [B](https://example.com/b)\n";
  assert.equal(await status(one, "links"), "warn");
  assert.equal(await detail(one, "links"), "1 link, all absolute URLs. 1 list line opens with a dash or bullet that is not a Markdown list marker (line 7)");
});

test("Tek-745 K10a: a file with both kinds gives both notes, the broken link first", async () => {
  const both = base + "- [Bad](https://example.com/b: notes)\n" + EM + " [X](https://example.com/x)\n" + BULLET + " [Y](https://example.com/y)\n";
  assert.equal(await status(both, "links"), "warn");
  assert.equal(await detail(both, "links"),
    "3 links, all absolute URLs. 1 list line looks like a link entry but is not a Markdown link (line 8). 2 list lines open with a dash or bullet that is not a Markdown list marker (lines 9, 10)");
  const none = await detail(base + "- [Bad](https://example.com/b: notes)\n" + EN + " [X](https://example.com/x)\n", "links");
  assert.doesNotMatch(none, /agent will not follow/);
});

test("Tek-730: turva.dev's own llms.txt as served gets no new warning", async () => {
  const res = await worker.fetch(new Request("https://turva.dev/llms.txt"), env);
  assert.equal(res.status, 200);
  const own = await res.text();
  assert.equal(await status(own, "no-html"), "pass");
  assert.equal(await status(own, "links"), "pass");
  assert.doesNotMatch(await detail(own, "links"), /list line/);
});

// ---- C: guide JSON-LD ----

async function ldBlocks(path: string) {
  const res = await worker.fetch(new Request("https://turva.dev" + path), env);
  assert.equal(res.status, 200, path);
  const html = await res.text();
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
}
const mainPage = async (path: string) => (await ldBlocks(path)).find((b) => b["@type"] === "TechArticle" || b["@type"] === "BlogPosting" || b["@type"] === "CollectionPage" || b["@type"] === "Blog");

test("Tek-730 C: a guide carries its checked date as lastReviewed on the WebPage, and no publication dates", async () => {
  const guides = ["/guides/llms-txt", "/guides/mcp-server-card", "/guides/agent-readiness-audit"];
  for (const g of guides) {
    const page = await mainPage(g);
    assert.equal(page["@type"], "TechArticle", g);
    const shown = (await (await worker.fetch(new Request("https://turva.dev" + g), env)).text()).match(/Sources checked (\d{4}-\d{2}-\d{2})/);
    assert.ok(shown, g + " shows a Sources checked line");
    assert.deepEqual(page.mainEntityOfPage, { "@type": "WebPage", "@id": "https://turva.dev" + g, "lastReviewed": shown![1] }, g);
    assert.equal(page.lastReviewed, undefined, g + ": lastReviewed is not on the TechArticle");
    assert.equal(page.datePublished, undefined, g);
    assert.equal(page.dateModified, undefined, g);
    assert.equal(page.about, "agent-readiness", g);
  }
});

test("Tek-730 C: the guides hub and the blog posts get no lastReviewed", async () => {
  const hub = await mainPage("/guides");
  assert.equal(hub["@type"], "CollectionPage");
  assert.equal(JSON.stringify(hub).includes("lastReviewed"), false);
  const post = await mainPage("/blog/tla-plus-in-numbers");
  assert.equal(post["@type"], "BlogPosting");
  assert.equal(JSON.stringify(post).includes("lastReviewed"), false);
  assert.ok(post.datePublished, "a post keeps its datePublished");
  assert.equal(post.about, undefined, "a post carries no site-wide about value");
  const blog = await mainPage("/blog");
  assert.equal(JSON.stringify(blog).includes("lastReviewed"), false);
});
