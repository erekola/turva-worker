import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

// The two-target limit of the audit ("up to two targets named in the written scope, at one fixed price", as the audit
// page words it) must stand on every surface that carries the audit price next to prose a person or an agent reads. The
// list is the price surface list H1 to H9 of the fix round of 2026-11-22. The structured price surfaces E2 to E6 (server
// card, OpenAPI document, x402, AP2, MPP and UCP manifests) carry numbers and no prose field, so they must not gain the
// sentence. The cases read what the Worker serves, not the source text.

const SENTENCE = "up to two targets named in the written scope";

// A path ending in #jsonld reads only the JSON-LD blocks of the page, because the page text itself already carries the
// sentence and would make the case pass without the structured data.
async function get(path: string): Promise<string> {
  const [p, mode] = path.split("#");
  const res = await worker.fetch(new Request("https://turva.dev" + p), {}, {});
  assert.equal(res.status, 200, path);
  const text = await res.text();
  if (mode !== "jsonld") return text;
  const blocks = [...text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.ok(blocks.length > 0, "no JSON-LD on " + p);
  return blocks.join("\n");
}

const HAVE: Array<[string, string]> = [
  ["H1 llms.txt", "/llms.txt"],
  ["H2 services twin", "/services.md"],
  ["H3 choosing guide twin", "/guides/choosing-an-agent-readiness-audit.md"],
  ["H4 agent.json", "/.well-known/agent.json"],
  ["H4 ai-plugin.json", "/.well-known/ai-plugin.json"],
  ["H5 services skill", "/.well-known/agent-skills/services/SKILL.md"],
  ["H6 home JSON-LD", "/#jsonld"],
  ["H7 audit page JSON-LD", "/agent-readiness-audit#jsonld"],
  ["H9 audit twin", "/agent-readiness-audit.md"],
];

for (const [label, path] of HAVE) {
  test("two-target sentence is served on " + label, async () => {
    const body = await get(path);
    assert.ok(body.includes(SENTENCE), label + " lacks the two-target sentence");
  });
}

test("H3 carries the sentence in both the deliverables paragraph and the price answer", async () => {
  const body = await get("/guides/choosing-an-agent-readiness-audit.md");
  assert.ok(body.split(SENTENCE).length - 1 >= 2);
});

const LACK: Array<[string, string]> = [
  ["E2 server card", "/.well-known/mcp/server-card.json"],
  ["E3 OpenAPI document", "/openapi.json"],
  ["E3 x402 manifest", "/.well-known/x402"],
  ["E5 AP2 manifest", "/.well-known/ap2"],
  ["E5 MPP manifest", "/.well-known/mpp"],
  ["E5 UCP profile", "/.well-known/ucp"],
];

for (const [label, path] of LACK) {
  test("two-target sentence is absent from " + label, async () => {
    const body = await get(path);
    assert.ok(!body.includes(SENTENCE), label + " must stay a structured price surface");
  });
}
