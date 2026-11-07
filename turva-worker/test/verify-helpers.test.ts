import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync } from "node:crypto";
import {
  scopeListsAgree, parseScopeList, readmeMeasurementDates, homeRequiresMatches, markdownTwinProblem,
  htmlTwinProblem, jwkToEd25519Key, isRealIsoDate, headersFileProblems,
} from "../../tools/verify-helpers.mts";

// Regression tests for the Sol repo-read items WL-24 to WL-29 (Tek-578, session S2): the
// comparisons that tools/verify.mts makes on turva's own surfaces. Each test fails when the
// matching fix in tools/verify-helpers.mts is reverted. The last block checks that verify.mts
// still calls every helper, so a revert of the wiring is caught as well.

// ---------------------------------------------------------------- WL-24

test("WL-24: two scope lists of the same length and different values do not agree", () => {
  assert.equal(scopeListsAgree(['"a", "b", "c"', '"a", "b", "d"']).ok, false);
});

test("WL-24: a duplicated scope value is refused and the unique count is the parsed count", () => {
  assert.deepEqual(parseScopeList('"a", "b", "a"').duplicates, ["a"]);
  assert.equal(scopeListsAgree(['"a", "b", "a"', '"a", "b", "a"']).ok, false);
  const ok = scopeListsAgree(['"a", "b", "c"', '"c", "b", "a"']);
  assert.equal(ok.ok, true);
  assert.equal(ok.count, 3);
});

test("WL-24: one list, three lists and an empty list are not an agreement", () => {
  assert.equal(scopeListsAgree(['"a"']).ok, false);
  assert.equal(scopeListsAgree(['"a"', '"a"', '"a"']).ok, false);
  assert.equal(scopeListsAgree(["", ""]).ok, false);
});

// ---------------------------------------------------------------- WL-25

const README = [
  "The reference build recorded 100/100, Level 5 on [isitagentready.com](https://isitagentready.com/) on 2026-10-21. A fork needs its own checks.",
  "",
  "Measured on 2026-10-20: all 24 categories passed on Hardenize and 98/100 on Internet.nl.",
].join("\n");

test("WL-25: each README date is read from its own sentence", () => {
  const d = readmeMeasurementDates(README);
  assert.equal(d.scannerDate, "2026-10-21");
  assert.equal(d.securityDate, "2026-10-20");
  assert.ok(d.securityLine.includes("Internet.nl"));
});

test("WL-25: a date that appears only in the other claim's sentence is not borrowed", () => {
  // The scanner sentence carries 2026-10-19; 2026-10-21 appears only in the security sentence.
  const swapped = README.replace("on 2026-10-21.", "on 2026-10-19.").replace("Measured on 2026-10-20", "Measured on 2026-10-21");
  const d = readmeMeasurementDates(swapped);
  assert.notEqual(d.scannerDate, "2026-10-21");
  assert.equal(d.scannerDate, "2026-10-19");
  // No anchored scanner sentence at all: the date is absent, whatever else the file contains.
  assert.equal(readmeMeasurementDates("Measured on 2026-10-21: all 24 categories passed.").scannerDate, null);
});

// ---------------------------------------------------------------- WL-26

const SERVICES = [{ id: "audit", name: "Audit" }, { id: "shopify", name: "Shopify agent storefront check" }];

test("WL-26: the required service must be the exact service name, not any other service", () => {
  assert.equal(homeRequiresMatches(SERVICES, "audit", "Audit"), true);
  assert.equal(homeRequiresMatches(SERVICES, "audit", "Shopify agent storefront check"), false);
  assert.equal(homeRequiresMatches(SERVICES, "audit", "Implementation"), false);
  assert.equal(homeRequiresMatches(SERVICES, "unknown", "Audit"), false);
  assert.equal(homeRequiresMatches(SERVICES, "audit", undefined), false);
});

// ---------------------------------------------------------------- WL-27

test("WL-27: a Markdown twin must answer exactly 200", () => {
  assert.equal(markdownTwinProblem("/x", 200), null);
  assert.match(markdownTwinProblem("/x", 206) || "", /HTTP 206/);
  assert.match(markdownTwinProblem("/x", 404) || "", /HTTP 404/);
});

test("WL-27: the HTML side needs 200 and an HTML content type before the h1 compare", () => {
  assert.equal(htmlTwinProblem("/x", 200, "text/html; charset=utf-8"), null);
  assert.match(htmlTwinProblem("/x", 404, "text/html") || "", /HTTP 404/);
  assert.match(htmlTwinProblem("/x", 500, "text/html") || "", /HTTP 500/);
  assert.match(htmlTwinProblem("/x", 200, "text/markdown") || "", /content-type/);
  assert.match(htmlTwinProblem("/x", 200, null) || "", /content-type none/);
});

// ---------------------------------------------------------------- WL-28

test("WL-28: the key is built from a JWK that declares OKP, Ed25519 and EdDSA", () => {
  const jwk = generateKeyPairSync("ed25519").publicKey.export({ format: "jwk" }) as { kty: string; crv: string; x: string };
  const key = jwkToEd25519Key({ ...jwk, alg: "EdDSA" });
  assert.equal(key.asymmetricKeyType, "ed25519");
  assert.throws(() => jwkToEd25519Key(jwk), /alg/); // alg not published: refused
});

test("WL-28: a JWK with another key type, curve or algorithm is refused instead of being read as Ed25519", () => {
  const jwk = generateKeyPairSync("ed25519").publicKey.export({ format: "jwk" }) as { kty: string; crv: string; x: string };
  assert.throws(() => jwkToEd25519Key({ ...jwk, kty: "EC" }), /kty/);
  assert.throws(() => jwkToEd25519Key({ ...jwk, crv: "Ed448" }), /crv/);
  assert.throws(() => jwkToEd25519Key({ ...jwk, alg: "RS256" }), /alg/);
  assert.throws(() => jwkToEd25519Key({ crv: jwk.crv, x: jwk.x } as never), /kty/);
});

// ---------------------------------------------------------------- WL-29

test("WL-29: impossible calendar dates are not ISO dates", () => {
  assert.equal(isRealIsoDate("2026-10-27"), true);
  assert.equal(isRealIsoDate("2024-02-29"), true);
  assert.equal(isRealIsoDate("2026-02-31"), false);
  assert.equal(isRealIsoDate("2026-13-45"), false);
  assert.equal(isRealIsoDate("2026-02-29"), false);
  assert.equal(isRealIsoDate("2026-1-5"), false);
});

// ---------------------------------------------------------------- wiring

test("WL-24 to WL-29: tools/verify.mts imports and calls every helper at the place the fix belongs", () => {
  const v = readFileSync(new URL("../../tools/verify.mts", import.meta.url), "utf8");
  assert.match(v, /from '\.\/verify-helpers\.mts'/);
  assert.match(v, /scopeListsAgree\(scopeMatches\.map/);
  assert.match(v, /const n = scopeAgree\.count;/);
  assert.match(v, /readmeMeasurementDates\(src\.readme\.text\)/);
  assert.match(v, /rmDates\.scannerDate === ar/);
  assert.match(v, /homeRequiresMatches\(facts\.services/);
  assert.match(v, /markdownTwinProblem\(pth, r\.status\)/);
  assert.match(v, /htmlTwinProblem\(pth, htmlRes\.status/);
  assert.equal((v.match(/jwkToEd25519Key\(k\)/g) || []).length, 2);
  assert.doesNotMatch(v, /302a300506032b6570032100/);
  assert.match(v, /isRealIsoDate\(cm\[1\]\)/);
  assert.match(v, /headersFileProblems\(readFileSync\(join\(ROOT, 'turva-worker\/public\/_headers'\)/);
});

// ---------------------------------------------------------------- round 24, D1-5

const WORKER_FIXTURE = `
const PP = ["a=()", "b=(self)"].join(", ");
function applySecurityHeaders(headers: Headers, kind: string) {
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", PP);
  headers.set("RateLimit-Policy", '"default";q=100;w=60');
  if (kind === "html") {
    headers.set("Cross-Origin-Resource-Policy", "same-origin");
  } else {
    headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  }
}
`;
const HEADERS_FIXTURE = "/*\n  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload\n  X-Frame-Options: DENY\n  Permissions-Policy: a=(), b=(self)\n  Cross-Origin-Resource-Policy: same-origin\n\n/*.png\n  Cache-Control: public, max-age=86400\n";

test("D1-5: matching headers file and applySecurityHeaders give four compared headers and no problem", () => {
  const r = headersFileProblems(HEADERS_FIXTURE, WORKER_FIXTURE);
  assert.deepEqual(r.problems, []);
  assert.equal(r.compared.length, 4);
});

test("D1-5: a differing value, a header the function never sets and a missing function are each reported by name", () => {
  const hsts = headersFileProblems(HEADERS_FIXTURE.replace("max-age=31536000", "max-age=1"), WORKER_FIXTURE);
  assert.equal(hsts.problems.length, 1);
  assert.match(hsts.problems[0], /^Strict-Transport-Security: /);
  const pp = headersFileProblems(HEADERS_FIXTURE.replace("b=(self)", "b=()"), WORKER_FIXTURE);
  assert.match(pp.problems.join(" "), /Permissions-Policy/);
  const extra = headersFileProblems(HEADERS_FIXTURE.replace("X-Frame-Options: DENY", "X-Frame-Options: DENY\n  X-Extra: 1"), WORKER_FIXTURE);
  assert.match(extra.problems.join(" "), /X-Extra: set in public\/_headers but never/);
  const gone = headersFileProblems(HEADERS_FIXTURE, "const nothing = 1;");
  assert.match(gone.problems.join(" "), /applySecurityHeaders was not found/);
  assert.equal(headersFileProblems("# nothing\n", WORKER_FIXTURE).problems[0], "public/_headers has no /* block");
});
