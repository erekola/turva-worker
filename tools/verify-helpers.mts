// tools/verify-helpers.mts - the small pure comparison functions of tools/verify.mts.
// They live here, with no side effects and no top-level code, so the tests under test/ can
// import them without running the whole checker. verify.mts imports nine of the ten exports;
// parseScopeList is used inside scopeListsAgree and is exported for the tests.
// MIT, same license as the repo.
import { createPublicKey } from 'node:crypto';
import type { KeyObject } from 'node:crypto';

// WL-24. A scopes_supported array body, e.g. `"a", "b"`, parsed to its values. Counting quoted
// strings let two lists with the same length and different values agree, and a repeated value
// counted twice. The unique set is what the prose count has to match.
export function parseScopeList(body: string): { values: string[]; unique: string[]; duplicates: string[] } {
  const values = (body.match(/"[^"]+"/g) || []).map((s) => s.slice(1, -1));
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const v of values) {
    if (seen.has(v)) duplicates.push(v); else seen.add(v);
  }
  return { values, unique: [...seen], duplicates };
}

// WL-24. True only when there are exactly two lists, neither has a duplicate, both are
// non-empty and their value sets are equal. The unique count is the number the prose must state.
export function scopeListsAgree(bodies: string[]): { ok: boolean; count: number; detail: string } {
  const parsed = bodies.map(parseScopeList);
  const sets = parsed.map((p) => [...p.unique].sort());
  const ok = parsed.length === 2
    && parsed.every((p) => p.duplicates.length === 0 && p.unique.length > 0)
    && JSON.stringify(sets[0]) === JSON.stringify(sets[1]);
  const detail = JSON.stringify(parsed.map((p) => ({ values: p.unique, duplicates: p.duplicates })));
  return { ok, count: ok ? parsed[0].unique.length : 0, detail };
}

// WL-25. The two measurement dates the README states, each read from its own sentence so one
// claim cannot borrow the date of the other. The scanner sentence is the one that names
// isitagentready.com as a link and gives its date; the security sentence is the line that
// starts "Measured on <date>: all ".
export function readmeMeasurementDates(readme: string): { scannerDate: string | null; securityDate: string | null; securityLine: string } {
  const sc = readme.match(/on \[isitagentready\.com\]\([^)]*\) on (\d{4}-\d{2}-\d{2})\./);
  const se = readme.match(/^(Measured on (\d{4}-\d{2}-\d{2}): all .*)$/m);
  return { scannerDate: sc ? sc[1] : null, securityDate: se ? se[2] : null, securityLine: se ? se[1] : '' };
}

// WL-26. HOME_JSON names the required service by its name ("Audit"), facts.json by its id
// ("audit"). The id is mapped to the name through facts.services and compared exactly, so a
// different existing service no longer passes as "a non-empty string".
export function requiredServiceName(services: { id: string; name: string }[], requiresId: string): string | undefined {
  return (services.find((s) => s.id === requiresId) || { name: undefined }).name;
}
export function homeRequiresMatches(services: { id: string; name: string }[], requiresId: string, got: unknown): boolean {
  const want = requiredServiceName(services, requiresId);
  return typeof want === 'string' && got === want;
}

// WL-27. A canonical twin must answer 200 for the Markdown and 200 with an HTML content type
// for the HTML before the two h1 lines are compared. A 206 Markdown or a 404 HTML error page
// that carries an h1 used to pass. The 429 case is handled by the caller before this runs.
export function markdownTwinProblem(pth: string, status: number): string | null {
  return status === 200 ? null : `${pth}: HTTP ${status}`;
}
export function htmlTwinProblem(pth: string, status: number, contentType: string | null): string | null {
  if (status !== 200) return `${pth}: HTML HTTP ${status}`;
  const ct = (contentType || '').toLowerCase();
  if (!ct.includes('text/html')) return `${pth}: HTML content-type ${ct || 'none'}`;
  return null;
}

// WL-28. Builds the Ed25519 verification key from a published JWK, after checking the key type
// the JWK itself declares. The old code took only x and built the SPKI by hand, so a JWKS that
// declared another key type or curve was still read as Ed25519. alg must be published and be
// EdDSA, as the served JWKS publishes it. createPublicKey with format 'jwk' rejects a mismatching x as well.
export function jwkToEd25519Key(jwk: { kty?: string; crv?: string; alg?: string; x: string }): KeyObject {
  if (jwk.kty !== 'OKP') throw new Error(`JWK kty is ${JSON.stringify(jwk.kty)}, expected "OKP"`);
  if (jwk.crv !== 'Ed25519') throw new Error(`JWK crv is ${JSON.stringify(jwk.crv)}, expected "Ed25519"`);
  if (jwk.alg !== 'EdDSA') throw new Error(`JWK alg is ${JSON.stringify(jwk.alg)}, expected "EdDSA"`);
  return createPublicKey({ key: jwk as never, format: 'jwk' });
}

// WL-29. A real calendar day in ISO form. Matching the digits alone let 2026-02-31 and
// 2026-13-45 through, and the string compare against today then read them as ordinary dates.
export function isRealIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// Round 24 (D1-5). public/_headers is a second copy of the security header values that
// applySecurityHeaders sets in worker.ts, and nothing compared the two copies. This reads the
// `/*` block of the headers file and every headers.set("Name", value) call of the function,
// resolves a value written as a constant (PERMISSIONS_POLICY is an array joined with ", "), and
// reports every header both sides set whose values differ, plus every header the file sets that
// the function never does. A header only the Worker sets (RateLimit-Policy, the CSP) is not a
// difference. `compared` is returned so the caller can fail a read that found nothing.
export function headersFileProblems(headersFile: string, workerSource: string): { compared: string[]; problems: string[] } {
  const problems: string[] = [];
  const shown = (v: string) => (v.length > 70 ? v.slice(0, 70) + '...' : v);
  const lines = headersFile.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === '/*');
  const fileHeaders = new Map<string, { name: string; value: string }>();
  if (start < 0) problems.push('public/_headers has no /* block');
  else {
    for (let i = start + 1; i < lines.length; i++) {
      if (!/^\s+\S/.test(lines[i])) break;
      const m = lines[i].trim().match(/^([A-Za-z0-9-]+):\s*(.*)$/);
      if (m) fileHeaders.set(m[1].toLowerCase(), { name: m[1], value: m[2].trim() });
    }
  }
  const fnAt = workerSource.indexOf('function applySecurityHeaders(');
  const fnEnd = fnAt < 0 ? -1 : workerSource.indexOf('\n}', fnAt);
  if (fnAt < 0 || fnEnd < 0) problems.push('applySecurityHeaders was not found in worker.ts');
  const body = fnAt < 0 || fnEnd < 0 ? '' : workerSource.slice(fnAt, fnEnd);
  const resolveConst = (id: string): string | null => {
    const m = workerSource.match(new RegExp('const ' + id + ' = \\[([\\s\\S]*?)\\]\\.join\\(([^)]*)\\);'));
    if (!m) return null;
    const sep = (m[2].match(/^\s*"([^"]*)"\s*$/) || [])[1];
    if (sep === undefined) return null;
    return [...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]).join(sep);
  };
  const workerValues = new Map<string, Set<string>>();
  for (const m of body.matchAll(/headers\.set\(\s*"([^"]+)"\s*,\s*("[^"]*"|'[^']*'|[A-Z_][A-Z0-9_]*)\s*\);/g)) {
    const expr = m[2].trim();
    const lit = expr.match(/^"([^"]*)"$/) || expr.match(/^'([^']*)'$/);
    const value = lit ? lit[1] : (/^[A-Z_][A-Z0-9_]*$/.test(expr) ? resolveConst(expr) : null);
    if (value === null) continue;
    const key = m[1].toLowerCase();
    if (!workerValues.has(key)) workerValues.set(key, new Set());
    workerValues.get(key)!.add(value);
  }
  if (fnAt >= 0 && workerValues.size === 0) problems.push('no header value could be read from applySecurityHeaders');
  const compared: string[] = [];
  for (const [key, { name, value }] of fileHeaders) {
    const set = workerValues.get(key);
    if (!set) { problems.push(`${name}: set in public/_headers but never by applySecurityHeaders`); continue; }
    compared.push(name);
    if (!set.has(value)) problems.push(`${name}: public/_headers says "${shown(value)}", worker.ts says ${[...set].map((v) => '"' + shown(v) + '"').join(' or ')}`);
  }
  return { compared, problems };
}
