import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

// The OpenAPI document at /openapi.json is the machine-readable list of what turva.dev serves to an agent, and nothing
// compared it with the routes the Worker really answers. Two directions are checked here, as far as that is cheap.
//
// (a) Every path and method the document declares answers through the Worker. A path with a placeholder gets a sample
//     value. For a path without a placeholder the Worker must not answer 404. For a path with a placeholder a 404 with a
//     JSON body is the documented "task or session not found" answer, so only the Worker's own HTML 404 page fails.
// (b) Every turva.dev URL that the /api/v1 index and the /.well-known/api-catalog linkset name, and that answers with JSON,
//     is declared in the document. A route can be served and named in the discovery files and still be missing from the
//     spec, which is how four well-known JSON files stayed undeclared until 3.238.0.
//
// What stays out of the document on purpose: it lists what an agent can pay, so POST on /x402 and on /api (the payment
// surfaces) is deliberately undeclared and is not looked for here, because (b) requests GET only.

const env = {};
const call = (path: string, init: RequestInit = {}): Promise<Response> =>
  worker.fetch(new Request("https://turva.dev" + path, init), env, {});

type Spec = { paths: Record<string, Record<string, unknown>> };
const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options"];

// A JSON URL the discovery files name that the document leaves out. Anything added here is a decision, not a fix.
const UNDECLARED_ON_PURPOSE: Record<string, string> = {
  // The document does not list itself.
  "/openapi.json": "the spec itself",
};

async function loadSpec(): Promise<Spec> {
  return JSON.parse(await (await call("/openapi.json")).text()) as Spec;
}

async function declaredButNotServed(spec: Spec): Promise<string[]> {
  const broken: string[] = [];
  for (const [path, item] of Object.entries(spec.paths)) {
    const templated = /\{[^}]+\}/.test(path);
    const sample = path.replace(/\{[^}]+\}/g, "abc");
    for (const method of Object.keys(item).filter((m) => HTTP_METHODS.includes(m))) {
      const init: RequestInit = { method: method.toUpperCase() };
      if (method === "post" || method === "put" || method === "patch") {
        init.headers = { "content-type": "application/json" };
        init.body = "{}";
      }
      const r = await call(sample, init);
      const type = r.headers.get("content-type") || "";
      const notServed = r.status === 404 && (!templated || !/json/.test(type));
      if (notServed) broken.push(method.toUpperCase() + " " + path + " -> " + r.status + " " + type);
    }
  }
  return broken;
}

// Every same-host URL named by the /api/v1 index and by the api-catalog linkset.
async function discoveredTurvaUrls(): Promise<string[]> {
  const urls = new Set<string>();
  const index = JSON.parse(await (await call("/api/v1")).text());
  for (const value of Object.values(index.endpoints as Record<string, string>)) urls.add(value);
  const catalog = JSON.parse(await (await call("/.well-known/api-catalog")).text());
  for (const entry of catalog.linkset) {
    for (const links of Object.values(entry)) {
      if (Array.isArray(links)) for (const link of links as { href?: string }[]) if (link.href) urls.add(link.href);
    }
  }
  return [...urls].filter((u) => new URL(u).host === "turva.dev").map((u) => new URL(u).pathname);
}

async function jsonUrlsMissingFromSpec(spec: Spec, paths: string[]): Promise<string[]> {
  const missing: string[] = [];
  for (const path of paths) {
    if (path in UNDECLARED_ON_PURPOSE || path in spec.paths) continue;
    const r = await call(path);
    if (/json/.test(r.headers.get("content-type") || "")) missing.push(path);
  }
  return missing;
}

test("openapi paths (a): every declared path and method is served by the Worker", async () => {
  const spec = await loadSpec();
  assert.ok(Object.keys(spec.paths).length >= 40, "the spec must list its paths (saw " + Object.keys(spec.paths).length + ")");
  assert.deepEqual(await declaredButNotServed(spec), [], "declared in /openapi.json but the Worker answers 404");
});

test("openapi paths (b): every JSON URL the /api/v1 index and the api-catalog name is declared", async () => {
  const spec = await loadSpec();
  const paths = await discoveredTurvaUrls();
  assert.ok(paths.length >= 20, "the index and the catalog must name their URLs (saw " + paths.length + ")");
  for (const path of ["/.well-known/jwks.json", "/.well-known/signatures.json", "/.well-known/ai-plugin.json", "/.well-known/agent.json"]) {
    assert.ok(paths.includes(path), path + " is named by the discovery files");
  }
  assert.deepEqual(await jsonUrlsMissingFromSpec(spec, paths), [], "named in /api/v1 or the api-catalog, answers JSON, not declared in /openapi.json");
});

test("openapi paths: both checks fail on an in-memory copy of the spec that was changed", async () => {
  const paths = await discoveredTurvaUrls();
  const withoutJwks = await loadSpec();
  delete withoutJwks.paths["/.well-known/jwks.json"];
  assert.deepEqual(await jsonUrlsMissingFromSpec(withoutJwks, paths), ["/.well-known/jwks.json"]);
  const withInvented = await loadSpec();
  withInvented.paths["/invented-route-for-the-mutation-check"] = { get: {} };
  assert.deepEqual(await declaredButNotServed(withInvented), ["GET /invented-route-for-the-mutation-check -> 404 text/html; charset=utf-8"]);
});
