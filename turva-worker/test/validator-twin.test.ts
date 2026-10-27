import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

// WL-06 (Sol repo read 2026-10-07, Tek-578, decision Tek-704 K31). The hosted validator page renders
// its "How to use it" section by hand per medium (Tek-358, listed as hand in tools/verify.mts); the
// rest of its prose is read from the markdown twin. This offline test compares the page's initial
// content with the twin and allows exactly the three named per-medium differences, so any other
// drift between the two fails here.

const env = {};
const get = (path: string, accept: string) => worker.fetch(new Request("https://turva.dev" + path, { headers: { accept } }), env);

const entities: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
const text = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&(?:amp|lt|gt|quot|#39);/g, (e) => entities[e]).replace(/\s+/g, " ").trim();
const noPeriod = (s: string) => s.replace(/\.$/, "");

test("WL-06: the validator page's initial content matches its markdown twin except the three named per-medium differences", async () => {
  const html = await (await get("/llms-txt-validator", "text/html")).text();
  const md = (await (await get("/llms-txt-validator.md", "text/markdown")).text()).replace(/\r\n/g, "\n");

  // 1. Headings: every h2 of the twin is an h2 of the page and the page adds none (no result is shown).
  const mdH2 = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  const htmlH2 = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => text(m[1]));
  assert.deepEqual(htmlH2, mdH2);

  // 2. The lead paragraphs above the first h2 appear on the page word for word.
  const lead = md.split("\n## ")[0].split(/\n{2,}/).map((b) => b.trim()).filter((b) => b && !b.startsWith("#"));
  assert.ok(lead.length >= 2, "the twin must carry lead paragraphs");
  const pageText = text(html);
  for (const p of lead) assert.ok(pageText.includes(text(p)), "lead paragraph missing from the page: " + p);

  // 3. "How to use it": the section the code renders by hand.
  const mdSec = md.split("\n## How to use it\n")[1].split("\n## ")[0];
  const mdBullets = mdSec.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim());
  const mdTail = mdSec.split(/\n{2,}/).map((b) => b.trim()).filter((b) => b && !b.startsWith("- "));
  const sec = html.match(/<section class="sec" id="how-to-use-it">([\s\S]*?)<\/section>/);
  assert.ok(sec, "the page must carry the how-to-use-it section");
  const secHtml = sec![1];
  const htmlBullets = [...secHtml.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
  assert.equal(htmlBullets.length, 3);
  assert.equal(mdBullets.length, 3);

  // The named differences, exactly. Bullet 1: the browser page points at the field above, the twin
  // spells the page address out.
  assert.equal(mdBullets[0], "In a browser: open https://turva.dev/llms-txt-validator and enter a domain");
  assert.equal(text(htmlBullets[0]), "In a browser: enter a domain in the field above.");
  // Bullet 2: the browser page links the example, the twin prints its address.
  assert.equal(mdBullets[1], "Without typing anything: https://turva.dev/llms-txt-validator?url=turva.dev runs the checks against this site's own file");
  assert.equal(text(htmlBullets[1]), "Without typing anything: run the checks against this site's own file.");
  assert.ok(/<a href="\/llms-txt-validator\?url=turva\.dev">/.test(htmlBullets[1]), "bullet 2 links the example on the page");
  // Bullet 3: identical words, the page sets the request in a code span, the twin writes it plain.
  assert.equal(noPeriod(text(htmlBullets[2])), noPeriod(mdBullets[2]));
  assert.ok(/<code>GET https:\/\/turva\.dev\/llms-txt-validator\?url=example\.com<\/code>/.test(htmlBullets[2]), "bullet 3 sets the request in a code span");
  assert.ok(!mdBullets[2].includes("`"), "the twin writes the request without a code span");

  // The closing paragraph carries no difference at all.
  assert.deepEqual(mdTail, ["The browser page and the JSON response run the same checks, listed below."]);
  assert.ok(text(secHtml.replace(/<ul>[\s\S]*?<\/ul>/, "")).includes(mdTail[0]), "closing paragraph of the section must match the twin");

  // 4. Every other section's paragraphs are read from the twin, so their sentences reach the page.
  for (const heading of mdH2.filter((h) => h !== "How to use it")) {
    const body = md.split("\n## " + heading + "\n")[1].split("\n## ")[0];
    const sentences = body.split(/\n{2,}/).map((b) => b.trim()).filter((b) => b && !/^(- |    |\|)/.test(b) && !b.includes("](") && !/[`*]/.test(b));
    for (const s of sentences) assert.ok(pageText.includes(text(s)), heading + ": paragraph missing from the page: " + s.slice(0, 60));
  }
});
