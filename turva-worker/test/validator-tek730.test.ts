import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

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
  const time = async (s: string) => { const t = performance.now(); await status(add(s), "no-html"); return performance.now() - t; };
  await time("`".repeat(50) + " <b ");
  const small = await time(("` <b " + BS + "<").repeat(2000));
  const large = await time(("` <b " + BS + "<").repeat(16000));
  assert.ok(large < Math.max(small * 40, 1500), "8x the input took " + large + " ms against " + small + " ms");
});

test("Tek-730 B: a link entry with an unclosed destination warns in the links check", async () => {
  const nbdev = base + "- [Blogging](https://nbdev.fast.ai/tutorials/blogging.html.md: Creating a blog with notebooks)\n";
  assert.equal(await status(nbdev, "links"), "warn");
  assert.equal(await detail(nbdev, "links"), "1 link, all absolute URLs; 1 list line looks like a link entry but is not a Markdown link (line 8)");
  assert.equal((await check(nbdev)).checks.length, (await check(base)).checks.length);
});

test("Tek-730 B: an entry that starts with an en dash, an em dash or a bullet warns", async () => {
  for (const mark of [EN, EM, BULLET]) {
    const t = base + mark + " [Saleor is composable](https://saleor.io/docs/composable)\n";
    assert.equal(await status(t, "links"), "warn", mark);
    assert.match(await detail(t, "links"), /1 list line opens with a dash or bullet that is not a Markdown list marker \(line 8\)$/, mark);
  }
  const two = base + EN + " [A](https://example.com/a)\n" + EN + " [B](https://example.com/b)\n";
  assert.equal(await detail(two, "links"), "3 links, all absolute URLs; 2 list lines open with a dash or bullet that is not a Markdown list marker (lines 8, 9)");
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
  assert.equal(await detail(lone, "links"), "no markdown links found; 1 list line looks like a link entry but is not a Markdown link (line 7)");
});

// Tek-745 K10a: the note has two kinds. A look-alike marker is no list item whether or not its link
// parses, and when the link parses it is counted as a link, so "will not follow it" was wrong for it.
test("Tek-745 K10a: a look-alike marker with a link that parses is counted and named as a marker, not as a broken link", async () => {
  const one = "# Example\n\n> Summary.\n\n## Docs\n\n" + EN + " [B](https://example.com/b)\n";
  assert.equal(await status(one, "links"), "warn");
  assert.equal(await detail(one, "links"), "1 link, all absolute URLs; 1 list line opens with a dash or bullet that is not a Markdown list marker (line 7)");
});

test("Tek-745 K10a: a file with both kinds gives both notes, the broken link first", async () => {
  const both = base + "- [Bad](https://example.com/b: notes)\n" + EM + " [X](https://example.com/x)\n" + BULLET + " [Y](https://example.com/y)\n";
  assert.equal(await status(both, "links"), "warn");
  assert.equal(await detail(both, "links"),
    "3 links, all absolute URLs; 1 list line looks like a link entry but is not a Markdown link (line 8); 2 list lines open with a dash or bullet that is not a Markdown list marker (lines 9, 10)");
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
  const blog = await mainPage("/blog");
  assert.equal(JSON.stringify(blog).includes("lastReviewed"), false);
});
