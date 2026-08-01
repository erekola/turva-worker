#!/usr/bin/env node
// tools/verify.mjs - turva.dev consistency + integrity checker for this repo.
// This is the deploy gate the site runs on itself before every ship.
// Source of truth: tools/facts.json. MIT, same license as the repo.
//   node tools/verify.mjs          static, offline-safe
//   node tools/verify.mjs --live   also GET every declared URL, verify the
//                                  Ed25519 signatures of the four signed
//                                  manifests against the published JWKS, and
//                                  speak MCP to mcp.turva.dev to prove the signed
//                                  server card matches the running server
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createPublicKey, verify as edVerify } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const LIVE = process.argv.includes('--live');
const facts = JSON.parse(readFileSync(join(ROOT, 'tools/facts.json'), 'utf8'));

const FILES = {
  worker:   'turva-worker/src/worker.js',
  readme:   'README.md',
};
const src = {};
for (const [k, rel] of Object.entries(FILES)) {
  const p = join(ROOT, rel);
  src[k] = { rel, buf: readFileSync(p), text: readFileSync(p, 'utf8') };
}

let fails = 0, passes = 0;
const ok  = (m) => { passes++; console.log('  pass  ' + m); };
const bad = (m) => { fails++;  console.log('  FAIL  ' + m); };
const check = (cond, m) => (cond ? ok(m) : bad(m));
const slashVariants = (s) => s.includes('/') ? [s, s.replace('/', ' / ')] : [s];
const containsAny = (t, arr) => arr.some((s) => t.includes(s));

console.log('turva.dev verify  (source of truth: tools/facts.json)\n');

console.log('Integrity');
for (const f of Object.values(src)) {
  let nul = 0; for (let i=0;i<f.buf.length;i++) if (f.buf[i]===0) nul++;
  const crlf = (f.text.match(/\r\n/g)||[]).length;
  const lf = (f.text.match(/\n/g)||[]).length;
  const nlOk = crlf===0 ? !f.buf.includes(13) : crlf===lf;
  check(nul===0, `${f.rel}: 0 NUL`);
  // A CRLF source passed through an LF->CRLF conversion once produced \r\r\n,
  // which the plain newline check missed (found 2026-07-18). Guard it directly.
  check(!f.text.includes('\r\r'), `${f.rel}: no doubled CR`);
  check(nlOk, `${f.rel}: clean ${crlf===0?'LF':'CRLF'} newlines`);
}
try { execSync(`node --check "${join(ROOT, FILES.worker)}"`); ok('worker.js parses (node --check)'); }
catch (e) { bad('worker.js node --check: ' + String(e.stderr||e.message).slice(0,200)); }

console.log('\nMeasured dates');
const ar = facts.agentReadiness.measuredAt, sec = facts.security.measuredAt;
const allowed = new Set([ar, sec]);
const wm = [...src.worker.text.matchAll(/Measured (\d{4}-\d{2}-\d{2})/g)].map(m=>m[1]);
check(wm.length>0 && wm.every(d=>allowed.has(d)), `worker.js "Measured <date>" all current (saw ${[...new Set(wm)].join(', ')||'none'})`);
// Attribute each Measured date to its claim by exact adjacency: every
// agent-readiness claim ends "on isitagentready.com. Measured <date>" and the
// security claim ends "asserted. Measured <date>". Added after two guide lines
// sat on the wrong date and a set check could not see it (both dates are
// individually allowed). A window-based version failed its own calibration by
// attributing a date to the nearest anchor on the wrong side, so the anchors
// are adjacent, with minimum counts so an empty match set cannot pass.
// Floors reflect prose living once in PAGE_MARKDOWN: the security phrase
// appears n=1 and agent-readiness n=3 (twin plus two guides).
const arNear = [...src.worker.text.matchAll(/isitagentready\.com\. Measured (\d{4}-\d{2}-\d{2})/g)].map(m=>m[1]);
check(arNear.length>=3 && arNear.every(d=>d===ar), `worker.js agent-readiness "Measured" all == ${ar} (saw ${[...new Set(arNear)].join(', ')||'none'}, n=${arNear.length})`);
const secNear = [...src.worker.text.matchAll(/asserted\. Measured (\d{4}-\d{2}-\d{2})/g)].map(m=>m[1]);
check(secNear.length>=1 && secNear.every(d=>d===sec), `worker.js security "Measured" all == ${sec} (saw ${[...new Set(secNear)].join(', ')||'none'}, n=${secNear.length})`);
const lvm = src.worker.text.match(/"lastVerified":\s*"(\d{4}-\d{2}-\d{2})"/);
check(!!lvm && lvm[1]===ar, `worker.js HOME_JSON lastVerified == ${ar}`);
check(src.readme.text.includes(ar), `README.md carries ${ar}`);

console.log('\nScanner results');
const iar = facts.agentReadiness.isitagentready, lvl = iar.level;
for (const k of Object.keys(src)) {
  check(containsAny(src[k].text, slashVariants(iar.score)), `${src[k].rel} shows ${iar.score}`);
  check(src[k].text.includes(lvl), `${src[k].rel} shows "${lvl}"`);
}

console.log('\nSecurity evidence');
const H = facts.security.hardenize, I = facts.security.internetnl;
for (const k of Object.keys(src)) check(src[k].text.includes(H.url), `${src[k].rel} links canonical Hardenize URL`);
for (const k of Object.keys(src)) check(containsAny(src[k].text, slashVariants(I.score)), `${src[k].rel} shows Internet.nl ${I.score}`);
check(src.worker.text.includes(I.url), `Internet.nl URL in worker.js`);
for (const k of Object.keys(src)) check(/13 categories/.test(src[k].text), `${src[k].rel} states 13 categories`);
// Timestamped or per-domain report URLs rot: Hardenize report snapshots expire
// and isitagentready is a SPA whose per-domain URLs render an empty page.
// Only the canonical forms may appear.
const deadHz = /hardenize\.com\/report\/turva\.dev\/\S/;
for (const f of Object.values(src)) check(!deadHz.test(f.text), `${f.rel}: no dead/timestamped Hardenize URL`);
const deadIar = /isitagentready\.com\/[A-Za-z0-9]/;
for (const f of Object.values(src)) check(!deadIar.test(f.text), `${f.rel}: no dead per-domain isitagentready URL`);

console.log('\nPricing');
for (const [name,val] of [['audit',facts.prices.audit],['advisory',facts.prices.advisory],['implementation',facts.prices.implementation]]) {
  const euro = '€' + val.toLocaleString('en-US');
  check(src.worker.text.includes(`"price": ${val}`), `worker.js "price": ${val} (${name})`);
  check(src.worker.text.includes(euro), `worker.js ${euro} (${name})`);
}

console.log('\nVersions');
// Escape every regex metacharacter, not only the dot: a version string is not
// user input, but a partial escape is the same defect wherever it is copied,
// and CodeQL flags it as one (turva-worker alert #2, 2026-07-26).
const sv = facts.versions.site.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
check((src.worker.text.match(new RegExp(`"version":\\s*"${sv}"`,'g'))||[]).length>=2, `worker.js site version ${facts.versions.site} (>=2 manifests)`);
check(src.worker.text.includes(`worker v${facts.versions.site}`), `worker.js header v${facts.versions.site}`);
// package.json "version" is inert (private, wrangler ignores it) but the repo
// is public, so a reader sees it next to the worker.js header. Enforced so it
// cannot drift silently.
const pkgSite = JSON.parse(readFileSync(join(ROOT, 'turva-worker/package.json'), 'utf8'));
check(pkgSite.version === facts.versions.site, `turva-worker package.json version == ${facts.versions.site} (saw ${pkgSite.version})`);

console.log('\nCSP script hash');
// script-src carries no 'unsafe-inline', so the sha256 in the CSP is the only
// permission the one inline script has. Editing WEBMCP_SCRIPT without moving the
// hash blocks that script on every page, and nothing else in this file could see
// it (the drift shipped once, on 2026-08-01, and was caught by a reader). The
// hash is over the served string, so CRLF is normalised to LF first: a template
// literal normalises its line terminators per the ECMAScript spec, and the file
// on disk is CRLF.
{
  const w = src.worker.text;
  const at = w.indexOf('var WEBMCP_SCRIPT = `<script>');
  const from = at < 0 ? -1 : w.indexOf('<script>', at) + '<script>'.length;
  const to = from < 0 ? -1 : w.indexOf('<\\/script>', from);
  if (at < 0 || to < 0) bad('CSP: WEBMCP_SCRIPT body not found');
  else {
    const body = w.slice(from, to).replace(/\r\n/g, '\n');
    const want = createHash('sha256').update(body, 'utf8').digest('base64');
    // Matched against the script-src directive itself, not the file. The hash
    // sitting anywhere in worker.js proves nothing: it could be in a comment,
    // or in style-src, and script-src would still carry no permission.
    const dir = (w.match(/"script-src ([^"]*)"/) || [])[1] || '';
    check(dir.includes(`'sha256-${want}'`), `CSP script-src carries the current WEBMCP_SCRIPT hash (sha256-${want}, script-src is "${dir}")`);
    // A substitution or an escape in the body would make the source slice and
    // the served string differ, and the hash above would then be computed over
    // the wrong bytes. Neither appears today; this fails the run if one lands.
    check(!/[\\`]|\$\{/.test(body), 'WEBMCP_SCRIPT body has no escape or substitution (source slice == served string)');
  }
}

console.log('\nTwin gate (prose from PAGE_MARKDOWN)');
// End state of the 2026-07-18 conversion: every card page renders its prose
// from its PAGE_MARKDOWN twin at request time, so twin parity holds by
// construction and the old two-direction comparison is retired (it caught six
// real drifts while it lived). What can still rot is a converted function
// growing hand-written prose again, or referencing a section the twin does
// not have; that is what this gate checks. Mutation-tested from both sides:
// a planted literal paragraph and a misspelled section name both fail the
// run, and a named exception that goes unused also fails the run.
// One pass over the whole entity set, not a chain of replaces. A chain that
// takes &amp; first turns &amp;lt; into < , which is a double unescape; one
// pass leaves it as &lt; (turva-worker alert #1, 2026-07-26).
const TW_ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'" };
const twDecode = (s) => s.replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, (m) => TW_ENTITIES[m]);
const twSquash = (s) => s.replace(/https?:\/\//g,'').replace(/\s+/g,' ').replace(/ ([,.;:])/g,'$1').trim();
const twHtml = (s) => twSquash(twDecode(s.replace(/<[^>]+>/g,' ')));
const twFnBody = (name) => {
  const i = src.worker.text.indexOf('function ' + name + '(');
  if (i < 0) return null;
  let j = src.worker.text.length;
  for (const pat of ['\r\nfunction ', '\r\nasync function ']) {
    const k = src.worker.text.indexOf(pat, i + 1); if (k > i && k < j) j = k;
  }
  return src.worker.text.slice(i, j);
};
const twPmStart = src.worker.text.indexOf('var PAGE_MARKDOWN');
const twMdTwin = (path) => {
  const key = `"${path}": \``;
  const s0 = src.worker.text.indexOf(key, twPmStart);
  if (s0 < 0) return null;
  let j = s0 + key.length;
  while (true) { j = src.worker.text.indexOf('`', j); if (src.worker.text[j-1] !== '\\') break; j++; }
  return src.worker.text.slice(s0 + key.length, j);
};
// hand: sections deliberately hand-rendered per medium (form instructions,
// the contact block); short lines only, the prose ban still applies.
// prose: named literal-prose exceptions with a reason, each must be used or
// the run fails:
//   home agent box intro (the md twin carries its own Markdown views note)
//   home contact intro (CTA block, per-medium wording).
const twConverted = {
  '/': { fn: 'serveHomeHtml', mdOnly: ['Markdown views', 'More', 'Guides'], hand: ['Contact'],
    prose: ['Every page on this site is also served as plain markdown',
            'Seeing where your site, API or product stands with AI agents starts'] },
  '/blog':    { fn: 'serveBlogHtml',    mdOnly: [] },
  '/llms-txt-validator': { fn: 'serveLlmsValidatorHtml', mdOnly: ['Related'], hand: ['How to use it'] },
  '/services': { fn: 'serveServicesHtml', mdOnly: [], hand: [] },
  '/tools':   { fn: 'serveToolsHtml',   mdOnly: ['Related'] },
  '/badge':   { fn: 'serveBadgeHtml',   mdOnly: [] },
  '/contact': { fn: 'serveContactHtml', mdOnly: [] },
  '/company': { fn: 'serveCompanyHtml', mdOnly: [] },
  '/legal':   { fn: 'serveLegalHtml',   mdOnly: [] },
  '/guides':  { fn: 'serveGuidesHtml',  mdOnly: [] },
};
let twcPages = 0;
for (const [path, cfg] of Object.entries(twConverted)) {
  const body = twFnBody(cfg.fn), md = twMdTwin(path);
  if (!body || !md) { bad(`${path}: converted function or twin not found`); continue; }
  const probs = [];
  let twcProseUsed = 0;
  for (const m of body.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)) {
    if (m[1].includes('${')) continue;
    const x = twHtml(m[1]);
    if (x.length < 80) continue;
    if ((cfg.prose || []).some((pre) => x.startsWith(pre))) { twcProseUsed++; continue; }
    probs.push('literal prose: ' + x.slice(0, 60));
  }
  if (twcProseUsed !== (cfg.prose || []).length) probs.push(`prose exceptions used ${twcProseUsed} of ${(cfg.prose || []).length}`);
  if (!body.includes(`"${path}"`)) probs.push('function never references its twin path');
  const heads = [...md.matchAll(/^## (.+)$/gm)].map((h) => h[1].trim());
  const twcSkip = [...cfg.mdOnly, ...(cfg.hand || [])];
  for (const h of heads) {
    if (!body.includes(`"${h}"`) && !twcSkip.includes(h)) probs.push('twin section not rendered: ' + h);
  }
  for (const m of body.matchAll(/\bmd\w+\("([^"]+)", "([^"]+)"\)/g)) {
    if (m[1] === path && !heads.includes(m[2])) probs.push('references a section the twin lacks: ' + m[2]);
    if (m[1].startsWith('/') && m[1] !== path) probs.push("references another page's twin: " + m[1]);
  }
  for (const h of twcSkip) { if (!heads.includes(h)) probs.push('mdOnly/hand names a heading the twin lacks: ' + h); }
  twcPages++;
  check(probs.length === 0, `${path}: prose from markdown${probs.length ? ' :: ' + probs.join(' | ') : ''}`);
}
check(twcPages === Object.keys(twConverted).length, `converted gate covered ${twcPages} pages`);
// Negative control: the extractor must read a planted paragraph as long prose.
const twPlanted = twHtml('<p>Planted twin gate self test paragraph that must read as literal prose well over the eighty character floor.</p>');
check(twPlanted.length >= 80, 'twin gate self-test: planted paragraph reads as long prose');

if (LIVE) {
  console.log('\nLive (URLs + signatures)');
  const base = 'https://turva.dev';
  const paths = ['/','/robots.txt','/sitemap.xml','/llms.txt','/llms-full.txt','/openapi.json',
    '/.well-known/api-catalog','/.well-known/ai-catalog.json','/.well-known/mcp/server-card.json',
    '/.well-known/agent-card.json','/.well-known/agent-skills/index.json',
    '/.well-known/oauth-authorization-server','/.well-known/oauth-protected-resource',
    '/.well-known/ap2','/.well-known/acp','/.well-known/security.txt','/auth.md'];
  for (const p of paths) {
    try { const r = await fetch(base+p, {redirect:'follow'}); check(r.ok, `GET ${p} -> ${r.status}`); }
    catch (e) { bad(`GET ${p} -> ${e.code||e.message}`); }
  }
  for (const u of [H.url, I.url, 'https://isitagentready.com/']) {
    try { const r = await fetch(u, {redirect:'follow'}); check(r.ok, `GET ${u} -> ${r.status}`); }
    catch (e) { bad(`GET ${u} -> ${e.code||e.message}`); }
  }
  const fetchBytesMcp = async (p) => Buffer.from(await (await fetch(base + p)).arrayBuffer());
  // Verify the four signed manifests against the published JWKS. Public-key
  // verification only; the same check anyone can run from these two URLs.
  try {
    const fetchBytes = async (p) => Buffer.from(await (await fetch(base + p)).arrayBuffer());
    const jwks = JSON.parse((await fetchBytes('/.well-known/jwks.json')).toString());
    const sigs = JSON.parse((await fetchBytes('/.well-known/signatures.json')).toString());
    const jwkToKey = (jwk) => {
      const raw = Buffer.from(jwk.x, 'base64url');
      const der = Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), raw]); // Ed25519 SPKI prefix
      return createPublicKey({ key: der, format: 'der', type: 'spki' });
    };
    const keyByKid = Object.fromEntries(jwks.keys.map((k) => [k.kid, jwkToKey(k)]));
    for (const [p, s] of Object.entries(sigs.signatures)) {
      const body = await fetchBytes(p);
      const pub = keyByKid[s.kid];
      const valid = !!pub && edVerify(null, body, pub, Buffer.from(s.signature, 'base64url'));
      check(valid, `signature valid: ${p}`);
    }
  } catch (e) { bad('signature verification: ' + (e.code||e.message)); }

  // MCP parity: the signed server card must describe the server that is actually
  // running. Nothing else here can see this. The static checks read files, the
  // URL checks read bytes, and the signature check proves the card was not altered
  // in transit, but a card can be perfectly signed and still promise more than the
  // server implements. That is exactly what happened: until 2026-07-24 the card
  // declared resources and prompts capabilities while the live server declared only
  // tools and answered -32601 to both, for weeks, invisibly. So: speak the protocol.
  try {
    const MCP = 'https://mcp.turva.dev/mcp';
    // Revision 2026-07-28 is stateless: no initialize, no Mcp-Session-Id, no GET stream.
    // Identity and capabilities come from server/discover, which servers MUST implement,
    // and every POST must carry the three standard headers plus the _meta envelope. The
    // header and the envelope must agree or the server answers 400 / -32020, so sending
    // them from here also proves that rejection path is wired.
    const REV = '2026-07-28';
    const SERVER_INFO_KEY = 'io.modelcontextprotocol/serverInfo';
    const rpc = async (method, params, extraHeaders) => {
      const h = {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        'mcp-protocol-version': REV,
        'mcp-method': method,
        ...(extraHeaders || {}),
      };
      const body = {
        jsonrpc: '2.0',
        id: 1,
        method,
        params: {
          ...(params || {}),
          _meta: {
            'io.modelcontextprotocol/protocolVersion': REV,
            'io.modelcontextprotocol/clientInfo': { name: 'turva-verify', version: '1' },
            'io.modelcontextprotocol/clientCapabilities': {},
          },
        },
      };
      const r = await fetch(MCP, { method: 'POST', headers: h, body: JSON.stringify(body) });
      const t = await r.text();
      const line = t.match(/^data: (.*)$/m); // Streamable HTTP may answer as SSE
      let parsed = null;
      try { parsed = JSON.parse(line ? line[1] : t); } catch { parsed = null; }
      return { res: r, body: parsed || {}, raw: t };
    };
    const card = JSON.parse((await fetchBytesMcp('/.well-known/mcp/server-card.json')).toString());
    const disc = await rpc('server/discover');
    const result = disc.body.result || {};
    const liveInfo = (result._meta && result._meta[SERVER_INFO_KEY]) || {};

    check(Array.isArray(result.supportedVersions) && result.supportedVersions.includes(REV),
      `server/discover advertises ${REV} (saw ${JSON.stringify(result.supportedVersions)})`);
    check(result.resultType === 'complete',
      `server/discover resultType == complete (saw ${result.resultType})`);
    check(Number.isFinite(result.ttlMs) && (result.cacheScope === 'public' || result.cacheScope === 'private'),
      `server/discover carries the required cache hints (ttlMs ${result.ttlMs}, cacheScope ${result.cacheScope})`);
    check(liveInfo.version === facts.versions.mcp,
      `MCP live version == facts.json ${facts.versions.mcp} (saw ${liveInfo.version})`);
    check(card.serverInfo.version === facts.versions.mcp,
      `server-card version == facts.json ${facts.versions.mcp} (saw ${card.serverInfo.version})`);
    check(card.serverInfo.name === liveInfo.name,
      `server-card name == live name (${card.serverInfo.name})`);

    const cardCaps = Object.keys(card.capabilities || {}).sort();
    const liveCaps = Object.keys(result.capabilities || {}).sort();
    check(cardCaps.join(',') === liveCaps.join(','),
      `capabilities parity: card [${cardCaps}] == live [${liveCaps}]`);

    // Every capability the card declares must answer its list method. A declared
    // capability that returns -32601 is a declared surface that does not resolve.
    const listMethod = { tools: 'tools/list', resources: 'resources/list', prompts: 'prompts/list' };
    for (const cap of cardCaps) {
      const m = listMethod[cap];
      if (!m) { bad(`server-card declares unknown capability "${cap}"`); continue; }
      const r = await rpc(m, {});
      const err = r.body.error;
      check(!err, `declared capability "${cap}" answers ${m}${err ? ' -> ' + err.code + ' ' + err.message : ''}`);
    }
    // And the reverse: a method the card does not declare must NOT quietly work,
    // otherwise the card understates the server and agents never find the surface.
    for (const [cap, m] of Object.entries(listMethod)) {
      if (cardCaps.includes(cap)) continue;
      const r = await rpc(m, {});
      check(!!r.body.error || r.res.status >= 400, `undeclared "${cap}" correctly does not answer ${m}`);
    }

    const cardTools = (card.tools || []).map((t) => t.name).sort();
    const liveList = await rpc('tools/list', {});
    const liveTools = ((liveList.body.result && liveList.body.result.tools) || []).map((t) => t.name).sort();
    check(cardTools.length > 0 && cardTools.join(',') === liveTools.join(','),
      `tool-name parity: card [${cardTools}] == live [${liveTools}]`);

    // The header/body agreement rule, proven rather than assumed: a POST whose
    // Mcp-Method header contradicts the body must be refused, not served.
    const mismatch = await rpc('tools/list', {}, { 'mcp-method': 'server/discover' });
    check(mismatch.res.status === 400 && mismatch.body.error && mismatch.body.error.code === -32020,
      `header/body mismatch refused with 400 and -32020 (saw ${mismatch.res.status} / ${mismatch.body.error && mismatch.body.error.code})`);

    // GET and DELETE were session operations and no longer exist. They must be
    // refused, not answered with an empty body, which is what the old transport did.
    const getRes = await fetch(MCP, { method: 'GET', headers: { accept: 'application/json, text/event-stream' } });
    check(getRes.status === 405, `GET ${MCP} answers 405 (saw ${getRes.status})`);
  } catch (e) { bad('MCP parity: ' + (e.code || e.message)); }
} else {
  console.log('\n(static run - add --live on a networked machine to GET every declared URL and verify signatures)');
}

console.log(`\n${fails ? 'RESULT: FAIL' : 'RESULT: OK'}  -  ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
