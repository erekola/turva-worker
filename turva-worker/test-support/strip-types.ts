// Strips the TypeScript types from the Worker source before a test evaluates a slice of it with new Function
// (Tek-664, TypeScript migration W1; since phase W4 one copy here instead of one in each test). Offsets and
// lines are kept, and plain JavaScript comes back unchanged. A warning whose message names stripTypeScriptTypes
// is dropped for the length of the call (the API's one-time experimental warning); its type is not checked,
// and every other warning passes through. This folder sits outside test/ on purpose: node --test runs every file under a test/ folder as a
// test file of its own, so a helper there would add one to the test count.
import { stripTypeScriptTypes } from "node:module";

export function stripTypes(text: string): string {
  const emit = process.emitWarning;
  process.emitWarning = function (w: string | Error, ...rest: unknown[]) {
    if (/stripTypeScriptTypes/.test(String((w && (w as Error).message) || w))) return;
    return (emit as (...args: unknown[]) => void).call(process, w, ...rest);
  };
  try { return stripTypeScriptTypes(text, { mode: "strip" }); } finally { process.emitWarning = emit; }
}
