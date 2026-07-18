#!/usr/bin/env node
// tools/verify.mjs - turva.dev consistency + integrity checker for this repo.
// This is the deploy gate the site runs on itself before every ship.
// Source of truth: tools/facts.json. MIT, same license as the repo.
//   node tools/verify.mjs          static, offline-safe
//   node tools/verify.mjs --live   also GET every declared URL and verify the
//                                  Ed25519 signatures of the four signed
//                                  manifests against the published JWKS
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
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
const sh = facts.agentReadiness.startuphub, lvl = facts.agentReadiness.isitagentready.level;
for (const k of Object.keys(src)) {
  check(containsAny(src[k].text, slashVariants(sh.score)), `${src[k].rel} shows ${sh.score}`);
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
const sv = facts.versions.site.replace(/\./g,'\\.');
check((src.worker.text.match(new RegExp(`"version":\\s*"${sv}"`,'g'))||[]).length>=2, `worker.js site version ${facts.versions.site} (>=2 manifests)`);
check(src.worker.text.includes(`worker v${facts.versions.site}`), `worker.js header v${facts.versions.site}`);
// package.json "version" is inert (private, wrangler ignores it) but the repo
// is public, so a reader sees it next to the worker.js header. Enforced so it
// cannot drift silently.
const pkgSite = JSON.parse(readFileSync(join(ROOT, 'turva-worker/package.json'), 'utf8'));
check(pkgSite.version === facts.versions.site, `turva-worker package.json version == ${facts.versions.site} (saw ${pkgSite.version})`);

console.log('\nTwin gate (prose from PAGE_MARKDOWN)');
// End state of the 2026-07-18 conversion: every card page renders its prose
// from its PAGE_MARKDOWN twin at request time, so twin parity holds by
// construction and the old two-direction comparison is retired (it caught six
// real drifts while it lived). What can still rot is a converted function
// growing hand-written prose again, or referencing a section the twin does
// not have; that is what this gate checks. Mutation-tested from both sides:
// a planted literal paragraph and a misspelled section name both fail the
// run, and a named exception that goes unused also fails the run.
const twDecode = (s) => s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'");
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
    '/.well-known/ap2','/.well-known/acp','/.well-known/x402-mesh.json','/.well-known/security.txt','/auth.md'];
  for (const p of paths) {
    try { const r = await fetch(base+p, {redirect:'follow'}); check(r.ok, `GET ${p} -> ${r.status}`); }
    catch (e) { bad(`GET ${p} -> ${e.code||e.message}`); }
  }
  for (const u of [H.url, I.url, 'https://isitagentready.com/']) {
    try { const r = await fetch(u, {redirect:'follow'}); check(r.ok, `GET ${u} -> ${r.status}`); }
    catch (e) { bad(`GET ${u} -> ${e.code||e.message}`); }
  }
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
} else {
  console.log('\n(static run - add --live on a networked machine to GET every declared URL and verify signatures)');
}

console.log(`\n${fails ? 'RESULT: FAIL' : 'RESULT: OK'}  -  ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
