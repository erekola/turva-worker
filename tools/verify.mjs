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
// existsSync lisatty 2026-08-16: og-cards.json -tarkistus kaytti sita ilman importtia, ja se ei
// ollut koskaan ajanut, koska manifesti oli tyhja. Ensimmainen kortti manifestissa kaatoi koko
// verify-ajon ReferenceErroriin. Tarkistus joka ei ole koskaan ajanut ei ole vihrea vaan ajamaton.
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createPublicKey, verify as edVerify } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

// FETCH TIMEOUT, added 2026-08-16 (round 12, follow-up work item 1 from the round-12 wrap-up).
// Every one of the 19 network calls in this file ran without a timeout. Node's fetch has no
// default one, so a single unanswered request hung the whole gate with no error and no exit
// code, and a hung gate reads exactly like a slow one. Wrapping fetch once here fixes all
// call sites at the same time, and it cannot be forgotten at a new call site the way a
// per-call option can. An explicit init.signal still wins, so a caller that wants its own
// abort behaviour keeps it. Override with VERIFY_FETCH_TIMEOUT_MS when a slow network is the
// expected condition rather than the fault being measured.
const FETCH_TIMEOUT_MS = Number(process.env.VERIFY_FETCH_TIMEOUT_MS || 20000);
const nativeFetch = globalThis.fetch;
const fetch = (input, init = {}) => (
  init && init.signal
    ? nativeFetch(input, init)
    : nativeFetch(input, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
);
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

// B2-20 (round 12, batch E16). Two published files in this repo were read by no gate at
// all, so their numbers, dates and spellings could drift silently, and one of them had
// already started to. They are NOT added to FILES, because every check that loops over
// FILES asks for the scanner score and the level, and SECURITY.md states neither. They get
// their own object and their own checks below: what a file claims decides what is asked of
// it, not which list it happens to sit in.
const DOCS = {
  security:  'SECURITY.md',
  readiness: 'docs/agent-readiness.md',
};
const doc = {};
for (const [k, rel] of Object.entries(DOCS)) {
  const p = join(ROOT, rel);
  doc[k] = { rel, buf: readFileSync(p), text: readFileSync(p, 'utf8') };
}

let fails = 0, passes = 0;
const ok  = (m) => { passes++; console.log('  pass  ' + m); };
const bad = (m) => { fails++;  console.log('  FAIL  ' + m); };
const check = (cond, m) => (cond ? ok(m) : bad(m));
const slashVariants = (s) => s.includes('/') ? [s, s.replace('/', ' / ')] : [s];
const containsAny = (t, arr) => arr.some((s) => t.includes(s));

console.log('turva.dev verify  (source of truth: tools/facts.json)\n');

console.log('Integrity');
for (const f of [...Object.values(src), ...Object.values(doc)]) {
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

console.log('\nSecret files stay out of the public repo');
// B2-12 (round 12, batch E16). Three lines in the repo root .gitignore are the only thing
// keeping the threat model and the vulnerability findings out of the public repository, and
// no gate read them. Deleting them produced no red anywhere, and the next `git add -A` would
// have published both files. This does not prove the files are untracked, which git owns; it
// proves the rule that keeps them untracked is still written down.
{
  const giText = readFileSync(join(ROOT, '.gitignore'), 'utf8');
  const giLines = giText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  // Written out one by one rather than looped, so each excluded path is named in the check
  // itself. A loop over a list reads the same and hides which entry went missing.
  check(giLines.includes('THREAT_MODEL.md'), '.gitignore still excludes THREAT_MODEL.md');
  check(giLines.includes('VULN-FINDINGS.*'), '.gitignore still excludes VULN-FINDINGS.*');
  check(giLines.includes('tools/verify.proxy.mjs'), '.gitignore still excludes tools/verify.proxy.mjs');
}

console.log('\nShare card manifest (tools/og-cards.json)');
// B2-21 (round 12, batch E16, Erik's decision 2026-08-16). An og card's headline and subhead
// are JPEG pixels, so no text gate could read them: not this file, not tools/kielletyt.mjs,
// not the style pass. Three measured drifts (findings B2-22, B2-23 and B2-24) all happened the
// same way, the text surface was corrected and the card was not. tools/make-og-card.py now
// records what it laid into each card, so the words exist as text somewhere and can be gated.
//
// The manifest is itself a claim surface in a public repo, and an unwatched claim surface in
// this repo has drifted before (mds/gotchas.md 2026-07-25), so it is gated in the same change
// that creates it rather than later.
//
// TWO LIMITS, both decisions rather than oversights, and neither is pretended away.
// 1. The manifest states what was MEANT to be laid into the card, not what was laid. It is not
//    a substitute for reading the pixels; it is the source of truth the pixels are built from.
// 2. Cards generated before 2026-08-16 are NOT in it, because their texts were never stored
//    anywhere. Coverage therefore starts at 0 and grows one card at a time, forward only.
//    The count is PRINTED below rather than asserted, because asserting a floor that is zero
//    today would be a check that cannot fail, and asserting tomorrow's number here would be the
//    hardcoded value this whole file exists to remove.
{
  const cardsRaw = readFileSync(join(ROOT, 'tools/og-cards.json'), 'utf8');
  let cards = null;
  try { cards = JSON.parse(cardsRaw); } catch (e) { bad('tools/og-cards.json does not parse: ' + e.message); }
  const isObj = !!cards && typeof cards === 'object' && !Array.isArray(cards);
  check(isObj, 'og-cards.json is a JSON object keyed by file name');
  const names = isObj ? Object.keys(cards) : [];
  // Deterministic file: the generator writes sorted keys, so a diff shows only real changes.
  check(names.slice().sort().join(',') === names.join(','), `og-cards.json keys are sorted (${names.length} cards recorded)`);
  const publicDir = join(ROOT, 'turva-worker/public');
  const missingFile = names.filter((n) => !existsSync(join(publicDir, n)));
  check(missingFile.length === 0,
    `every og-cards.json entry names a file in turva-worker/public${missingFile.length ? ' (missing: ' + missingFile.join(', ') + ')' : ''}`);
  const unreferenced = names.filter((n) => !src.worker.text.includes(`"/${n}"`));
  check(unreferenced.length === 0,
    `every og-cards.json entry is referenced by worker.js${unreferenced.length ? ' (not referenced: ' + unreferenced.join(', ') + ')' : ''}`);
  const fields = ['kicker', 'white', 'green', 'subhead'];
  const incomplete = names.filter((n) => !fields.every((f) => typeof cards[n][f] === 'string' && cards[n][f].trim().length > 0));
  check(incomplete.length === 0,
    `every og-cards.json entry carries ${fields.join(', ')}${incomplete.length ? ' (incomplete: ' + incomplete.join(', ') + ')' : ''}`);
  console.log(`  note  og card text coverage: ${names.length} cards carry their text in the manifest (forward only, see the comment above)`);
}

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
// B2-06 (round 12, batch E16). Only the agent-readiness date was anchored in README.md,
// although the same file carries the security measurement date in its own sentence
// ("Measured on `turva.dev` on <date>") and `sec` was already read above. That sentence does
// not match the "Measured <date>" pattern used for worker.js either, because a word sits in
// between, so nothing was watching it. Both dates are anchored now.
check(src.readme.text.includes(sec), `README.md carries ${sec}`);

console.log('\nScanner results');
const iar = facts.agentReadiness.isitagentready, lvl = iar.level;
// The category set is stated on six surfaces and facts.json is the only one of them
// that is a source of truth. Read defensively: if the array ever goes missing the
// checks below must name that and fail, not compare undefined against undefined and
// report a pass, which is how a repaired gate went green in round 7.
const CATS = Array.isArray(iar.categories) ? iar.categories : [];
for (const k of Object.keys(src)) {
  check(containsAny(src[k].text, slashVariants(iar.score)), `${src[k].rel} shows ${iar.score}`);
  check(src[k].text.includes(lvl), `${src[k].rel} shows "${lvl}"`);
}

// B2-20 (round 12, batch E16). The two files read into `doc` above are checked here against
// facts.json, each on what it actually claims. agent-readiness.md states the scanner numbers
// and the measurement date; SECURITY.md states neither, and its one volatile value is the day
// the advisories were last cleared, which had no canonical home at all and was 14 days old.
// It has one now (facts.security.advisoriesCheckedAt), so the date can no longer drift
// silently in a published file.
console.log('\nPublished docs that state a fact (SECURITY.md, docs/agent-readiness.md)');
check(containsAny(doc.readiness.text, slashVariants(iar.score)), `${doc.readiness.rel} shows ${iar.score}`);
check(doc.readiness.text.includes(lvl), `${doc.readiness.rel} shows "${lvl}"`);
check(doc.readiness.text.includes(ar), `${doc.readiness.rel} carries ${ar}`);
{
  const checkedAt = facts.security.advisoriesCheckedAt;
  check(typeof checkedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(checkedAt),
    `facts.json records when the advisories were last checked (${checkedAt})`);
  check(doc.security.text.includes(`Checked ${checkedAt}`), `${doc.security.rel} carries Checked ${checkedAt}`);
}

console.log('\nCategory set (facts.json owns which categories exist)');
// Five checks and one board proved the score. Nothing proved the SET. The five
// categories are stated on six surfaces, in six different spellings, and until
// 2026-08-01 only the MCP tools/call gate and the static index.ts driver compared any
// of them to anything. A six-category model shipped in guide prose and in the FAQ
// JSON-LD once (v3.79.0), and a fifth category name that existed on no other surface
// shipped in MCP once (v3.80.0), so both failure modes are real.
//
// The split: facts.json owns WHICH categories exist and how many checks each carries.
// Each surface owns HOW it spells them, because "bot_access_control" is a machine key
// and "bot access control" is user interface text. category.label is the board's
// spelling, category.prose lists every other spelling in use, and every declared
// prose spelling must be used somewhere or this section fails.
//
// EVERY surface here is read as a bounded region and its members are ENUMERATED, not
// searched for. The first version of this section searched: it asked whether all five
// were named and it never asked what else was named, so a sixth category passed on
// three of the four surfaces. Measured, all three, on the day it was written.
{
  // Tek-225 (2026-08-16). The three surfaces below used to have their sentence shape written
  // into this file. It now lives in facts.json next to the categories it describes, and this
  // block fails loudly if a field is missing, so the move cannot silently turn into a gate
  // that reads nothing. Same reason category.prose has to be USED somewhere: a declared value
  // nobody reads is not evidence.
  const SW = (iar && iar.surfaceWording) || {};
  const swMissing = [];
  for (const [k, keys] of [['evidenceTwin', ['spanFrom', 'spanTo', 'spellingIndex', 'template']],
                           ['auditGuide', ['introVerb', 'locatingSentence']],
                           ['readme', ['countSentence', 'allSentence']]]) {
    if (!SW[k]) { swMissing.push(k); continue; }
    for (const kk of keys) if (!SW[k][kk]) swMissing.push(`${k}.${kk}`);
  }
  check(swMissing.length === 0,
    `facts.json declares the wording of all three gate-owned surfaces${swMissing.length ? ' :: missing ' + swMissing.join(', ') : ''}`);
  check(Array.isArray(SW.evidenceTwin && SW.evidenceTwin.spellingIndex) && SW.evidenceTwin.spellingIndex.length === CATS.length,
    `evidence twin spellingIndex has one entry per category (${(SW.evidenceTwin && SW.evidenceTwin.spellingIndex || []).length} of ${CATS.length})`);

  const spellings = (c) => [c.label, ...(Array.isArray(c.prose) ? c.prose : [])].map((x) => String(x).toLowerCase());
  const resolve = (item) => CATS.find((c) => spellings(c).includes(String(item).trim().toLowerCase()));
  check(CATS.length > 0, `facts.json records the category set (${CATS.length})`);
  check(CATS.length > 0 && CATS.every((c) => typeof c.label === 'string' && c.label.trim().length > 0),
    'every category carries a non-empty board label');
  check(CATS.length > 0 && CATS.every((c) => Array.isArray(c.prose) && c.prose.every((x) => typeof x === 'string' && x.trim().length > 0)),
    'every category carries a prose spelling list with no empty entries');
  check(new Set(CATS.map((c) => c.id)).size === CATS.length,
    `category ids are unique (${CATS.length} categories, ${new Set(CATS.map((c) => c.id)).size} distinct ids)`);
  // The per-category check COUNT was dropped from facts.json on 2026-08-29. The scanner
  // reports a different check set through its MCP tool than through its public page
  // (commerce 5/5 with ap2 versus 4/4 without it, api/auth 9 versus 8), so a count is a
  // figure a buyer cannot reproduce on the surface he checks. The category set and the
  // per-category score stay, because those agree on both surfaces.
  check(CATS.length > 0 && CATS.every((c) => c.checks === undefined),
    'no category carries a check count (dropped 2026-08-29, see decisions.md)');
  // Resolution has to be unambiguous. Containment is the obvious collision and it is
  // not the only one: two spellings that merely OVERLAP, "bot access" and "access
  // control", both resolve inside the single phrase "bot access control" while neither
  // contains the other. So the rule below is containment, and every enumerating
  // surface resolves by exact equality rather than by substring, which is what
  // actually closes the overlap case.
  const collide = [];
  for (const a of CATS) for (const b of CATS) {
    if (a.id === b.id) continue;
    for (const x of spellings(a)) for (const y of spellings(b)) if (x.includes(y)) collide.push(`${a.id}:"${x}" contains ${b.id}:"${y}"`);
  }
  check(collide.length === 0, `category spellings do not collide across categories${collide.length ? ' :: ' + collide.join(' | ') : ''}`);

  const used = new Set();
  // Compare an enumerated list against the category set: same length, every item
  // resolves, every category hit exactly once, and in the declared order.
  const enumerated = (items, label, ordered) => {
    const got = items.map((x) => String(x).trim());
    const res = got.map(resolve);
    check(got.length === CATS.length, `${label} enumerates exactly ${CATS.length} categories (saw ${got.length}: ${got.join(' / ') || 'none'})`);
    const bad0 = got.filter((x, i) => !res[i]);
    check(bad0.length === 0, `${label}: every item resolves to a category${bad0.length ? ' :: unknown ' + bad0.map((x) => `"${x}"`).join(', ') : ''}`);
    check(got.length === CATS.length && res.every(Boolean) && new Set(res.map((c) => c.id)).size === CATS.length,
      `${label}: no category is named twice`);
    if (ordered) {
      check(got.length === CATS.length && res.every(Boolean) && res.map((c) => c.id).join(',') === CATS.map((c) => c.id).join(','),
        `${label}: in the facts.json order (saw [${got.join(', ')}])`);
    }
    got.forEach((x, i) => { if (res[i]) used.add(x.toLowerCase()); });
  };
  const span = (text, from, to, label) => {
    const i = text.indexOf(from);
    const j = i < 0 ? -1 : text.indexOf(to, i + from.length);
    if (i < 0 || j < 0) { bad(`${label}: anchor not found (${i < 0 ? 'start' : 'end'})`); return null; }
    return text.slice(i, j);
  };
  // The markdown section around a unique sentence, heading to heading. Anchoring a
  // section by its own heading text does not work in this file: "## Frequently asked"
  // appears in many guides, indexOf finds the first one, and the span then covers a
  // different page entirely and captures nothing. The section is therefore located
  // from a sentence that occurs once and expanded outward.
  const sectionAround = (text, unique, label) => {
    const i = text.indexOf(unique);
    if (i < 0) { bad(`${label}: locating sentence not found`); return null; }
    if (text.indexOf(unique, i + 1) >= 0) { bad(`${label}: locating sentence is not unique`); return null; }
    const heads = [...text.matchAll(/^#{1,6} .+$/gm)];
    const before = heads.filter((m) => m.index < i).slice(-1)[0];
    const after = heads.find((m) => m.index > i);
    return text.slice(before ? before.index : 0, after ? after.index : text.length);
  };
  const sc = iar.score.toLowerCase(), lv = lvl.toLowerCase();

  // A. The evidence twin in PAGE_MARKDOWN. Short and stable enough to reconstruct
  // WHOLE from facts.json, and compared by equality rather than by includes: an
  // includes() let a sixth category be prepended to the list and still pass, because
  // the wanted string was still in there further along. Measured 2026-08-01.
  {
    const A = span(src.worker.text, SW.evidenceTwin.spanFrom, SW.evidenceTwin.spanTo, 'evidence twin');
    // B2-10 (round 12, batch E16). The line below indexes sp[4] directly, so a facts.json
    // that lost a category threw a TypeError out of the whole static run instead of naming
    // the missing set and failing on it. Two places in this file promise the opposite
    // behaviour in prose. The live twin already guards the same string with CATS.length === 5;
    // this is that guard on the static side, and it is a guard on the CONSTRUCTION, because
    // the throw happens while `want` is built rather than when it is compared.
    if (CATS.length !== 5) bad(`evidence twin: facts.json names ${CATS.length} categories, the twin sentence is written for 5`);
    else if (A) {
      const sp = CATS.map(spellings);
      // The sentence shape comes from facts.json (surfaceWording.evidenceTwin), not from
      // this file. spellingIndex says WHICH declared spelling each position uses, so a
      // surface that changes its wording changes it in the data the gate reads.
      const picked = SW.evidenceTwin.spellingIndex.map((ix, i) => sp[i][ix]);
      const want = SW.evidenceTwin.template
        .replace(/\{(\d)\}/g, (_, i) => picked[Number(i)])
        .replace(/\{score\}/g, sc)
        .replace(/\{level\}/g, lv);
      const gotA = A.toLowerCase().replace(/\s+/g, ' ');
      check(gotA === want, `evidence twin is exactly the set and both scores${gotA === want ? '' : `\n        want: "${want}"\n        got:  "${gotA}"`}`);
      picked.forEach((x) => used.add(x));
    }
  }

  // B. The audit guide introduces each category as "<name> covers ...". The subjects
  // are extracted and resolved, rather than the five known names being searched for:
  // the first version counted the word "covers" inside a span that ENDED at the last
  // category's own sentence, so a sixth category appended right after it fell outside
  // the span entirely and passed. Measured 2026-08-01. The span is now the whole
  // markdown section, heading to heading.
  {
    const B = sectionAround(src.worker.text, SW.auditGuide.locatingSentence, 'audit guide');
    const VERB = SW.auditGuide.introVerb;
    if (B) {
      const subjects = [...B.matchAll(new RegExp(`(?:^|\\.\\s+)([A-Z][^.\\r\\n]{0,60}?) ${VERB} `, 'gm'))].map((m) => m[1]);
      enumerated(subjects, `audit guide "<name> ${VERB}"`, true);
      // And nothing else in the section may use that introduction form, or a sixth
      // category could hide behind a subject the regex above declines to capture.
      const covers = (B.match(new RegExp(`\\b${VERB}\\b`, 'g')) || []).length;
      check(covers === subjects.length,
        `audit guide: every "${VERB}" in the section is a category introduction (${covers} occurrences, ${subjects.length} captured)`);
    }
  }

  // C. The FAQ answer in GUIDE_PAGE_FAQ (not SCHEMA_HOME, which carries its own
  // FAQPage and does not name the category set at all). A plain comma list whose only
  // internal punctuation is slashes, so it parses exactly.
  {
    const C = span(src.worker.text, 'It checks the surfaces an agent reaches first, covering ', '. Each check passes or fails', 'FAQ JSON-LD');
    if (C) {
      const list = C.slice(C.indexOf('covering ') + 'covering '.length)
        .split(',').map((x) => x.replace(/^\s*and\s+/i, '').trim()).filter(Boolean);
      enumerated(list, 'FAQ JSON-LD list', true);
    }
  }

  // D. The README states the count in words and repeats the set as a table. The table
  // rows are ALL parsed and then resolved; the first version filtered to resolvable
  // rows before counting them, which made a sixth row literally invisible to its own
  // count. Measured 2026-08-01, and it is the same defect as the two above.
  {
    const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
    const word = WORDS[CATS.length] || String(CATS.length);
    const countS = SW.readme.countSentence.replace(/\{countWord\}/g, word);
    const allS = SW.readme.allSentence.replace(/\{countWord\}/g, word);
    check(src.readme.text.includes(countS),
      `README states the set size in words as "${word}" (${CATS.length} categories in facts.json)`);
    check(src.readme.text.includes(allS), `README's "all ${word}" agrees with the set size`);
    const D = span(src.readme.text, '### isitagentready.com category breakdown', '## Web security', 'README table');
    if (D) {
      const rows = [...D.matchAll(/^\| ([^|]+?) \| ([^|]+?) \|\s*$/gm)]
        .map((m) => ({ cat: m[1].trim(), val: m[2].trim() }))
        .filter((r) => r.cat !== 'Category' && !/^-+$/.test(r.cat));
      enumerated(rows.map((r) => r.cat), 'README table', true);
      const wrong = rows.filter((r) => r.val !== iar.score);
      check(rows.length > 0 && wrong.length === 0,
        `every README table row reads ${iar.score} (${wrong.length ? 'wrong: ' + wrong.map((r) => r.cat + ' = ' + r.val).join(', ') : 'all ' + rows.length + ' rows'})`);
    }
  }

  // The dead-spelling rule. A spelling nobody uses is either a leftover from copy that
  // has since changed, or room for a future mismatch to resolve into. Scoped to
  // category.prose: the labels are the board's spelling, the board is a served
  // surface, and the live gate proves every label is used by matching all of them
  // against the served cells in order. A static run cannot see an unused label, and
  // saying so is cheaper than a rule that fails offline for a reason that is not a
  // defect.
  const declared = CATS.flatMap((c) => (Array.isArray(c.prose) ? c.prose : []).map((x) => String(x).toLowerCase()));
  const unused = declared.filter((x) => !used.has(x));
  check(unused.length === 0, `every declared prose spelling is used on a surface${unused.length ? ' :: unused ' + unused.map((x) => `"${x}"`).join(', ') : ` (${declared.length} spellings)`}`);
}

console.log('\nService set (facts.json owns which services exist)');
// Checked statically as well as live, because this file is the deploy gate and a
// static run has to be able to see a corrupted facts.json. The served surfaces that
// state the service set are checked in the live block.
{
  const S = Array.isArray(facts.services) ? facts.services : [];
  check(S.length > 0, `facts.json records the service set (${S.length})`);
  check(S.length > 0 && S.every((x) => typeof x.name === 'string' && x.name.trim()), 'every service carries a non-empty name');
  check(new Set(S.map((x) => x.name)).size === S.length, 'service names are unique');
  check(S.length > 0 && S.every((x) => x.priceKey === null || Number.isFinite(facts.prices[x.priceKey])),
    'every service priceKey is null or resolves to a number in facts.json prices');
  // B2-11 (round 12, batch E16). facts.json carried no service id at all, which is why the
  // MCP gate below had two of them hardcoded. The ids are canonical here now, so both the
  // priced and the unpriced set are derived rather than copied.
  check(S.length > 0 && S.every((x) => typeof x.id === 'string' && /^[a-z0-9-]+$/.test(x.id)),
    'every service carries a lowercase id');
  check(new Set(S.map((x) => x.id)).size === S.length, 'service ids are unique');
  check(S.length > 0 && S.every((x) => x.priceKey === null || x.priceKey === x.id),
    'a priced service uses its own id as its price key');
  const keys = S.filter((x) => x.priceKey).map((x) => x.priceKey);
  const priceKeys = Object.keys(facts.prices).filter((k) => k !== 'currency');
  check(keys.slice().sort().join(',') === priceKeys.slice().sort().join(','),
    `the priced services and facts.json prices name the same keys (services [${keys}], prices [${priceKeys}])`);
}

console.log('\nSecurity evidence');
const H = facts.security.hardenize, I = facts.security.internetnl;
for (const k of Object.keys(src)) check(src[k].text.includes(H.url), `${src[k].rel} links canonical Hardenize URL`);
for (const k of Object.keys(src)) check(containsAny(src[k].text, slashVariants(I.score)), `${src[k].rel} shows Internet.nl ${I.score}`);
check(src.worker.text.includes(I.url), `Internet.nl URL in worker.js`);
const IM = facts.security.internetnlMail;
for (const k of Object.keys(src)) check(containsAny(src[k].text, slashVariants(IM.score)), `${src[k].rel} shows the Internet.nl mail test ${IM.score}`);
check(src.worker.text.includes(IM.url), `Internet.nl mail URL in worker.js`);
// Fixed 2026-08-16 (round 12, finding B4-19, surface B2-07). The number 13 was hardcoded into
// this regex while its canonical home is facts.security.hardenize.result ("all 13 categories
// passed"), and the Rot gates block lower in this same file already derives it correctly. A
// second copy of a measured number is not a second proof; it is the place the number rots.
const HZ_CATS = (/(\d+)\s+categories/.exec(H.result) || [])[1];
check(!!HZ_CATS, `facts.security.hardenize.result carries the category count (${H.result})`);
for (const k of Object.keys(src)) check(new RegExp(HZ_CATS + ' categories').test(src[k].text), `${src[k].rel} states ${HZ_CATS} categories`);
// Timestamped or per-domain report URLs rot: Hardenize report snapshots expire
// and isitagentready is a SPA whose per-domain URLs render an empty page.
// Only the canonical forms may appear.
const deadHz = /hardenize\.com\/report\/turva\.dev\/\S/;
for (const f of Object.values(src)) check(!deadHz.test(f.text), `${f.rel}: no dead/timestamped Hardenize URL`);
const deadIar = /isitagentready\.com\/[A-Za-z0-9]/;
for (const f of Object.values(src)) check(!deadIar.test(f.text), `${f.rel}: no dead per-domain isitagentready URL`);

console.log('\nPricing');
// Fixed 2026-08-16 (round 12, finding B4-14, surface B2-07). Three keys were hardcoded here
// while facts.json's services table names FOUR priceKey rows: shopify was never checked on
// this path, and the loop bound a price to a bare string rather than to a named service. The
// Rot gates block lower in this same file already derives its set from
// facts.services.filter(s => s.priceKey), so this block was the one copy that could drift.
// Enumerate, do not search: a search for each expected name passes a list missing one.
const PRICED_STATIC = (facts.services || []).filter((s) => s.priceKey);
check(PRICED_STATIC.length > 0, `facts.json names at least one priced service (${PRICED_STATIC.length})`);
for (const svc of PRICED_STATIC) {
  const val = facts.prices[svc.priceKey];
  check(Number.isFinite(val), `facts.prices resolves ${svc.priceKey} to a number (${svc.name})`);
  if (!Number.isFinite(val)) continue;
  const euro = '€' + val.toLocaleString('en-US');
  check(src.worker.text.includes(`"price": ${val}`), `worker.js "price": ${val} (${svc.name})`);
  check(src.worker.text.includes(euro), `worker.js ${euro} (${svc.name})`);
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
    // B2-08 (round 12, batch E16). The comment at the top of this block rests the whole
    // argument on script-src carrying no 'unsafe-inline', and nothing here asked. The hash
    // is only the sole permission the inline script has if that is true, so it is a check.
    // Read from the same directive string as the hash, never from the file: the hash check
    // itself was once a file-wide search and went green on a mutation that moved the hash
    // into style-src (agent-memory/project-do-not-fix.md, 2026-08-01).
    check(!dir.includes(`'unsafe-inline'`), `CSP script-src carries no 'unsafe-inline' (script-src is "${dir}")`);
    // A substitution or an escape in the body would make the source slice and
    // the served string differ, and the hash above would then be computed over
    // the wrong bytes. Neither appears today; this fails the run if one lands.
    check(!/[\\`]|\$\{/.test(body), 'WEBMCP_SCRIPT body has no escape or substitution (source slice == served string)');
  }
}

// The pages that publish a FAQPage, enumerated from the twins by the static gate and
// re-read from the served HTML by the live one.
const faqPaths = [];
const setSameLive = (label, found, want) => {
  const seen = new Set(), dupes = [];
  for (const n of found) { if (seen.has(n)) dupes.push(n); else seen.add(n); }
  const unknown = found.filter((n) => !want.includes(n));
  const missing = want.filter((n) => !found.includes(n));
  check(want.length > 0 && found.length === want.length && !unknown.length && !dupes.length && !missing.length,
    `${label} enumerates exactly ${want.length} (saw ${found.length}`
    + `${missing.length ? ', missing: ' + missing.join(' | ') : ''}`
    + `${unknown.length ? ', unknown: ' + unknown.join(' | ') : ''}`
    + `${dupes.length ? ', duplicated: ' + dupes.join(' | ') : ''})`);
};

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
// Same family, used by the h1 twin comparison below. Two rules. Strip tags to a
// FIXED POINT rather than in one pass: deleting the match is what CodeQL flags
// as incomplete multi-character sanitization (js/incomplete-multi-character-
// sanitization, turva-worker alert #6, 2026-08-17), because a delete can move a
// surviving < next to a surviving >. And decode in ONE pass over the entity set
// instead of a chain of replaces, the same rule as twDecode above (alert #1,
// 2026-07-26). Strip runs before decode, never after: decoding first would turn
// &lt;b&gt; into a tag and hand it to the stripper. The entity set is deliberately
// only these two, exactly what the h1 comparison decoded before, because adding
// &lt; and friends would decide that new h1 pairs match, which moves the set that
// passes the gate and is a decision, not a fix (Tek-160).
const H1_ENTITIES = { '&middot;': '\u00b7', '&amp;': '&' };
const h1Strip = (s) => { let prev; do { prev = s; s = s.replace(/<[^>]+>/g, ''); } while (s !== prev); return s; };
const h1Decode = (s) => s.replace(/&(?:middot|amp);/g, (m) => H1_ENTITIES[m]);
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
  // 'Independent agent-readiness scan of turva.dev' is hand-rendered as the scan board, not as prose.
  // It was previously 'covered' by a mdParas() call in serveHomeHtml whose result nothing interpolated,
  // so this gate read a no-op as proof the section was rendered (2026-08-01).
  '/': { fn: 'serveHomeHtml', mdOnly: ['Markdown views', 'More', 'Guides'], hand: ['Contact', 'Independent agent-readiness scan of turva.dev'],
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
  '/shopify-agent-storefront-check': { fn: 'serveShopifyHtml', mdOnly: [] },
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
// B2-09 (round 12, batch E16). This compared the loop counter to the length of the same
// literal, so both operands came from one object and a page missing from twConverted was
// invisible to the gate. The message read as a coverage proof and proved nothing: the only
// way it could go red was a `continue` above that had already printed its own FAIL. The set
// is derived from worker.js now, in both directions.
//
// serveGuideHtml is a named exception with a reason: it renders any guide path rather than
// one fixed path, and its twin is gated separately below (the FAQ and guide sections read
// twMdTwin for the guide pages by name). The exception list is itself checked against
// worker.js, so a renamed renderer cannot hide inside it.
const twServeFns = [...new Set([...src.worker.text.matchAll(/function (serve\w*Html)\s*\(/g)].map((m) => m[1]))];
const twSkipFns = ['serveGuideHtml'];
const twGated = new Set(Object.values(twConverted).map((c) => c.fn));
const twUngated = twServeFns.filter((f) => !twGated.has(f) && !twSkipFns.includes(f));
const twNoRenderer = [...twGated].filter((f) => !twServeFns.includes(f));
const twSkipStale = twSkipFns.filter((f) => !twServeFns.includes(f));
check(twServeFns.length > 0 && twcPages === Object.keys(twConverted).length
  && twUngated.length === 0 && twNoRenderer.length === 0 && twSkipStale.length === 0,
  `converted gate covered ${twcPages} of ${twServeFns.length} worker.js page renderers`
  + `${twUngated.length ? ', ungated: ' + twUngated.join(', ') : ''}`
  + `${twNoRenderer.length ? ', names no renderer: ' + twNoRenderer.join(', ') : ''}`
  + `${twSkipStale.length ? ', exception names no renderer: ' + twSkipStale.join(', ') : ''}`);
// Negative control: the extractor must read a planted paragraph as long prose.
const twPlanted = twHtml('<p>Planted twin gate self test paragraph that must read as literal prose well over the eighty character floor.</p>');
check(twPlanted.length >= 80, 'twin gate self-test: planted paragraph reads as long prose');

// --- Card checkout links. Every other surface conditions payment on a scope agreed in
// writing, and on 2026-08-02 one published post did not: it carried these three links
// under "The services, payable now" and told the reader the audit "can be paid up
// front". Nothing caught it, because a live payment link is not a claim any checker
// reads and the post is dated, which is normally the reason to leave a page alone.
// The rule this gates is the class rather than that sentence: wherever the site names
// a checkout URL, the paragraph around it has to carry the condition too.
{
  const w = src.worker.text;
  // The condition is matched as whole sentences, not as the phrase "agreed in writing".
  // The loose version passed a planted naked link, because an unrelated sentence about
  // bespoke work carries the same phrase 400 characters up the page. A gate that any
  // nearby wording can satisfy is not measuring the thing it was built for.
  const CONDITIONS = [
    'Scope is agreed in writing before any of the three is paid.',
    'completed by a person after the scope is agreed in writing',
  ];
  const WINDOW = 400;
  const naked = [];
  for (const [name, text] of [['worker.js', w], ['README.md', src.readme.text]]) {
    for (const m of text.matchAll(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g)) {
      const near = text.slice(Math.max(0, m.index - WINDOW), m.index + WINDOW);
      if (!CONDITIONS.some((c) => near.includes(c))) naked.push(name + ' ' + m[0]);
    }
  }
  const hits = [...w.matchAll(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g)];
  check(hits.length > 0, 'worker.js names at least one card checkout link');
  check(CONDITIONS.every((c) => w.includes(c)), 'both condition sentences are present to match against');
  check(naked.length === 0,
    `every checkout link sits within ${WINDOW} characters of a condition sentence${naked.length ? ' :: naked: ' + [...new Set(naked)].join(', ') : ''}`);
  const lines = w.split(/\r?\n/);
  let h = 0; while (h < lines.length && (lines[h].startsWith('//') || lines[h].trim() === '')) h++;
  const body = lines.slice(h).join('\n');
  check(h > 0 && body.length > 0 && !/^\s*\/\//.test(body), `release-log header skipped before the wording test (${h} lines)`);
  const invites = [...body.matchAll(/payable now|paid up front/gi)].map((m) => m[0]);
  check(invites.length === 0,
    `nothing the Worker serves invites payment before scope${invites.length ? ' :: ' + [...new Set(invites)].join(', ') : ''}`);
}

// --- CHANNELS, added 2026-08-16 (Tek-238), the last of round 8 section 3's open items.
// The declared VALUES other than prices were compared to nothing: facts.json owned the money and
// the category set, while the contact channels were repeated by hand across the footer, the
// JSON-LD sameAs list, the agent manifests and the profile READMEs. That is the same shape as the
// priced services drifting from four to three, only with no gate anywhere.
//
// WHAT IS CHECKED, stated narrowly. Every channel declared in facts.json.channels appears in
// worker.js, and every sameAs entry in the JSON-LD resolves to a declared channel. It is a
// membership and cardinality check, not a per-surface map: proving that each surface names the
// right SUBSET would need each surface to declare which subset it owns, and inventing that
// declaration now would be building a schema to satisfy a gate rather than to describe the site.
// The second half is the one that earns its keep: it is what stops a seventh link appearing in
// sameAs without anyone declaring it, which is the direction this kind of list actually drifts.
{
  const CH = facts.channels || {};
  const chKeys = Object.keys(CH);
  check(chKeys.length > 0, `facts.json declares the contact channels (${chKeys.length})`);
  const puuttuu = chKeys.filter((k) => !src.worker.text.includes(CH[k]));
  check(chKeys.length > 0 && puuttuu.length === 0,
    `every declared channel appears in worker.js${puuttuu.length ? ' :: missing ' + puuttuu.join(', ') : ''}`);
  // sameAs is the union of two declared lists, not one. The first version of this check assumed
  // every sameAs entry is a contact channel and failed on its first run against the business
  // registry and Wikidata entries, which are identity references rather than ways to reach a
  // person. That failure is the reason facts.json now carries both lists: the gate found the
  // missing distinction, and the distinction is what lets a future addition be classified.
  const ID = facts.identityRefs || {};
  const sallitut = new Set([...Object.values(CH), ...Object.values(ID)].filter((v) => String(v).startsWith('https://')));
  check(Object.keys(ID).length > 0, `facts.json declares the identity references (${Object.keys(ID).length})`);
  const idPuuttuu = Object.keys(ID).filter((k) => !src.worker.text.includes(ID[k]));
  check(Object.keys(ID).length > 0 && idPuuttuu.length === 0,
    `every declared identity reference appears in worker.js${idPuuttuu.length ? ' :: missing ' + idPuuttuu.join(', ') : ''}`);
  // matchAll, not match. The first version used .match() and read only the FIRST of the five
  // sameAs blocks in worker.js, so four fifths of the surface it claims to cover were invisible
  // to it, including the Person block on every article. An independent review found that on the
  // same day it was written, and it is the reason the count below is printed: a gate that says
  // "4 entries" when the file holds five blocks is telling you where it stopped looking.
  const lohkot = [...src.worker.text.matchAll(/"sameAs":\s*\[([\s\S]*?)\]/g)];
  const sameAs = [...new Set(lohkot.flatMap((m) => [...m[1].matchAll(/"(https:[^"]+)"/g)].map((x) => x[1])))];
  const vieraat = sameAs.filter((u) => !sallitut.has(u));
  check(sameAs.length > 0 && vieraat.length === 0,
    `every sameAs entry is a declared channel or identity reference (${lohkot.length} blocks, ${sameAs.length} distinct entries${vieraat.length ? ', undeclared: ' + vieraat.join(', ') : ''})`);
}

// --- VAT ID. It lived only in the ProfessionalService JSON-LD until 2026-08-02, on no
// page a person reads, while /company promises reverse charge to EU B2B buyers, who are
// exactly the people who need it. Now that it is prose on two pages it needs the same
// treatment as every other number: one owner in facts.json, and no second spelling
// anywhere. The third check is the one that matters. Asserting the value is present
// says nothing about a mistyped copy sitting beside it, which is the defect shape the
// agent-skills Business ID check found on 2026-08-01.
{
  const w = src.worker.text;
  const want = facts.vatId;
  check(typeof want === 'string' && /^FI\d{8}$/.test(want), `facts.json vatId is well formed (saw ${JSON.stringify(want)})`);
  check(w.includes(`"vatID":"${want}"`), `JSON-LD vatID == facts.json ${want}`);
  const seen = [...new Set([...w.matchAll(/\bFI\d{8}\b/g)].map((m) => m[0]))];
  check(seen.length === 1 && seen[0] === want,
    `worker.js spells one VAT ID and it is ${want} (saw ${JSON.stringify(seen)})`);
  // Derivable from the business ID, so a drift between the two is the likelier error
  // than a typo in either alone.
  check(want === 'FI' + facts.businessId.replace('-', ''),
    `vatId matches businessId ${facts.businessId} with the hyphen removed`);
  const readers = ['VAT-registered, VAT ID ' + want + '.', "turva.dev's own VAT ID is " + want + '.'];
  check(readers.every((t) => w.includes(t)),
    'the VAT ID is stated in prose on /legal and /company, not only in JSON-LD');
}

// ============================================================================
// Rot gates. Round 12 package B1 (2026-08-10) found seven values that are right
// today and watched by nothing, plus one published price list that had already
// drifted. Every check below answers "would anyone notice if this stopped being
// true", not "is it true now". The finding each one closes is named.
//
// Enumerate, do not search: same length, every element a member, none matched
// twice. A search for each expected name passes a list missing one, and a length
// check alone passes a list carrying one name twice. See B1-02.
// ============================================================================
{
  const w = src.worker.text;
  const PRICED = (facts.services || []).filter((s) => s.priceKey);
  const euroOf = (k) => '€' + facts.prices[k].toLocaleString('en-US');
  const today = new Date().toISOString().slice(0, 10);
  const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
  const constOf = (name) => (w.match(new RegExp('var ' + name + ' = "([^"]*)"')) || [])[1];
  // A missing end anchor used to slice to the end of the file, silently handing a
  // 186 kB region to a check whose name promised one constant. Anchors are data too:
  // a gate reading the wrong block is the failure mode this file exists to catch.
  const anchorFails = [];
  const region = (start, end) => {
    const i = w.indexOf(start);
    if (i < 0) { anchorFails.push('start missing: ' + start.slice(0, 44)); return ''; }
    if (!end) return w.slice(i);
    const j = w.indexOf(end, i + start.length);
    if (j < 0) { anchorFails.push('end missing after ' + start.slice(0, 30) + ': ' + end.slice(0, 30)); return ''; }
    return w.slice(i, j);
  };
  const setSame = (label, found, want) => {
    const seen = new Set(), dupes = [];
    for (const n of found) { if (seen.has(n)) dupes.push(n); else seen.add(n); }
    const unknown = found.filter((n) => !want.includes(n));
    const missing = want.filter((n) => !found.includes(n));
    check(want.length > 0 && found.length === want.length && !unknown.length && !dupes.length && !missing.length,
      `${label} enumerates exactly ${want.length} (saw ${found.length}: [${found.join(', ')}]`
      + `${missing.length ? ', missing: ' + missing.join(', ') : ''}`
      + `${unknown.length ? ', unknown: ' + unknown.join(', ') : ''}`
      + `${dupes.length ? ', duplicated: ' + dupes.join(', ') : ''})`);
  };
  // Every euro amount in a passage, resolved back to the service it prices. Prose
  // cannot be parsed into a list, but the amounts in it can be, and a fourth service
  // missing from a sentence changes the set.
  const euroKeys = (text) => (text.match(/€\d{1,3}(?:,\d{3})*/g) || [])
    .map((a) => (PRICED.find((s) => euroOf(s.priceKey) === a) || {}).priceKey || a);

  console.log('\nPublished price lists in worker.js (B1-02)');
  // The v3.90.0 gate reads six manifests and the /services markdown. It reads no page
  // prose, no JSON-LD and no META_BY_PATH, and on 2026-08-09 the buyer guide shipped a
  // three-service price list while its own FAQ JSON-LD on the same URL listed four.
  {
    const home = region('var SCHEMA_HOME', '\nfunction appendAgentLinks');
    const cat = region('"hasOfferCatalog"', '\n{"@type":"FAQPage"');
    const offers = [...cat.matchAll(/\{"@type":"Offer","name":"([^"]+)"[\s\S]*?"price":"(\d+)"/g)];
    setSame('SCHEMA_HOME OfferCatalog', offers.map((m) => m[1]), PRICED.map((s) => s.name));
    for (const s of PRICED) {
      const got = (offers.find((m) => m[1] === s.name) || [])[2];
      check(got === String(facts.prices[s.priceKey]),
        `SCHEMA_HOME Offer ${s.name} priced ${facts.prices[s.priceKey]} (saw ${JSON.stringify(got)})`);
    }
    const agg = (home.match(/"@type":"AggregateOffer"[^}]*}/) || [''])[0];
    const nums = PRICED.map((s) => facts.prices[s.priceKey]);
    check(agg.includes(`"offerCount":"${PRICED.length}"`), `AggregateOffer offerCount == ${PRICED.length}`);
    check(agg.includes(`"lowPrice":"${Math.min(...nums)}"`), `AggregateOffer lowPrice == ${Math.min(...nums)}`);
    check(agg.includes(`"highPrice":"${Math.max(...nums)}"`), `AggregateOffer highPrice == ${Math.max(...nums)}`);
  }
  {
    // The buyer guide used to state its prices twice on one URL, in a prose section and in
    // a BUYER_FAQ answer beside it, and on 2026-08-09 the prose said three services while
    // the FAQ said four. Since v3.92.0 the page's Frequently asked section is the only home
    // and the FAQPage is derived from it, so there is one passage and it is the one a
    // reader sees. Two checks became one because one of the two homes ceased to exist.
    const md = (twMdTwin('/guides/choosing-an-agent-readiness-audit') || '').replace(/\r\n/g, '\n');
    const sec = md.split('\n## ').find((s) => s.startsWith('Frequently asked')) || '';
    const blocks = sec.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
    const qi = blocks.indexOf('**What does an agent-readiness audit cost?**');
    check(qi > 0, 'the buyer guide carries its cost question in the twin');
    setSame('buyer guide cost answer', euroKeys(qi > 0 ? blocks[qi + 1] || '' : ''), PRICED.map((s) => s.priceKey));
  }
  {
    const acp = region('var ACP_SERVICES', '\nfunction buildAcpCheckoutSession');
    const rows = [...acp.matchAll(/^  (\w+): \{ item: "(\w+)", name: "([^"]+)", amount: (\d+)/gm)];
    setSame('ACP_SERVICES', rows.map((m) => m[1]), PRICED.map((s) => s.priceKey));
    for (const m of rows) {
      check(m[1] === m[2], `ACP_SERVICES ${m[1]} key == item id (saw ${m[2]})`);
      check(Number(m[4]) === facts.prices[m[1]] * 100,
        `ACP_SERVICES ${m[1]} amount == ${facts.prices[m[1]] * 100} cents (saw ${m[4]})`);
    }
    // HOME_JSON is the surface project-do-not-fix.md points at when it says the catalogue
    // is deliberately narrower than the service set. That sentence is only true while this
    // list holds every service, and it named the wrong count for a day (B1-21).
    const home = (w.match(/var HOME_JSON = JSON\.stringify\(([\s\S]*?), null, 2\);/) || [])[1] || '{}';
    const hs = JSON.parse(home).services || [];
    setSame('HOME_JSON services', hs.map((s) => s.name), (facts.services || []).map((s) => s.name));
    for (const s of facts.services || []) {
      const got = hs.find((x) => x.name === s.name) || {};
      check(s.priceKey ? got.price === facts.prices[s.priceKey] : got.pricing === 'on request',
        `HOME_JSON ${s.name} ${s.priceKey ? 'priced ' + facts.prices[s.priceKey] : 'stays on request'} (saw ${JSON.stringify(s.priceKey ? got.price : got.pricing)})`);
    }
    const shop = region('function buildShopifyServiceJsonLd', '\nfunction ');
    const prices = [...shop.matchAll(/"price": "(\d+)"/g)].map((m) => m[1]);
    check(prices.length === 2 && prices.every((p) => p === String(facts.prices.shopify)),
      `buildShopifyServiceJsonLd states ${facts.prices.shopify} in both price fields (saw [${prices.join(', ')}])`);
  }

  console.log('\nNavigation menus (B1-15)');
  // The same eight-item menu is five independent copies, and /tools shipped in v3.34.0
  // with no menu linking it until v3.37.0 added it to all five by hand. Nothing compared
  // them. Order is part of the claim, so the sequences are compared, not the sets.
  {
    const uls = [...w.matchAll(/<ul class="nv-menu">\r?\n([\s\S]*?)<\/ul>/g)]
      .map((m) => [...m[1].matchAll(/<li><a href="([^"]+)"/g)].map((x) => x[1]));
    const itemsSrc = (w.match(/const items = (\[\[[\s\S]*?\]\]);/) || [])[1] || '[]';
    const generated = JSON.parse(itemsSrc).map((p) => p[0]);
    const inline = uls.filter((u) => u.length > 0);
    check(uls.length === 5, `five nv-menu blocks in worker.js (saw ${uls.length})`);
    check(uls.length - inline.length === 1, `exactly one nv-menu is generated from an items array (saw ${uls.length - inline.length})`);
    check(generated.length === 8, `cardPageNav items array has 8 entries (saw ${generated.length})`);
    const want = generated.join(' ');
    for (let i = 0; i < inline.length; i++) {
      check(inline[i].join(' ') === want,
        `inline nav ${i + 1} carries the same paths in the same order as cardPageNav (saw [${inline[i].join(', ')}])`);
    }
    // aria-current="page" is a claim that this menu item IS the page being served, and
    // /shopify-agent-storefront-check made it about /services for a screen reader until
    // 2026-08-10 (B1-13). Every cardPageNav argument must be a path the router serves.
    // Not "the path exists somewhere" but "the page passes its OWN path", which is the
    // claim aria-current="page" makes. The Shopify page passed /services for a week.
    const navCalls = [];
    for (const m of w.matchAll(/cardPageNav\("([^"]*)"\)/g)) {
      const head = w.lastIndexOf('\nfunction ', m.index);
      const upto = w.slice(head, m.index);
      navCalls.push({ arg: m[1], fn: (upto.match(/^\nfunction (\w+)/) || [])[1] || '?', page: (upto.match(/buildMetaBlock\("([^"]*)"/) || [])[1] });
    }
    // 2026-08-24, Tek-269. briefHtmlPage on ensimmainen sivu joka EI kuulu valikkoon:
    // se palvelee polkua /brief/<tunnus>, jota ei ole nv-menussa eika saa olla, koska
    // sivu on yhden asiakkaan eika julkinen. Oikea arvo sille on tyhja, jolloin yksikaan
    // valikon kohta ei saa aria-current="page". Ehto EI ole loysatty muotoon "tyhja
    // kelpaa aina", koska silloin sivu joka vain unohtaa oman polkunsa lapaisisi. Poikkeus
    // on nimetty funktiokohtaisesti, ja alla oleva erillinen ehto kaataa ajon jos nimetty
    // funktio katoaa, jotta poikkeus ei jaa elamaan uudelleennimeamisen yli.
    const NAV_ULKOPUOLELLA = new Set(['briefHtmlPage']);
    for (const nimi of NAV_ULKOPUOLELLA) {
      check(navCalls.some((c) => c.fn === nimi),
        `cardPageNav exception ${nimi} still exists (a rename must not keep the exception alive)`);
    }
    const wrongNav = navCalls.filter((c) => (NAV_ULKOPUOLELLA.has(c.fn) ? c.arg !== '' : c.page !== c.arg));
    check(navCalls.length > 0 && wrongNav.length === 0,
      `every cardPageNav call passes the path its own page serves (${navCalls.length} calls`
      + `${wrongNav.length ? ' :: ' + wrongNav.map((c) => `${c.fn} serves ${c.page} but passes ${c.arg}`).join(', ') : ''})`);
  }

  console.log('\nHand-maintained dates (B1-16)');
  // Three constants that turn into a false claim by the calendar passing rather than by
  // anyone editing them. SITEMAP_LASTMOD was stuck at 2026-07-02 once already (v3.36.0).
  {
    const lastmod = constOf('SITEMAP_LASTMOD');
    const released = (facts.released || {}).site;
    check(!!released && days(released, today) >= 0, `facts.json released.site ${released} is not in the future`);
    check(lastmod === released, `SITEMAP_LASTMOD == facts.json released.site ${released} (saw ${lastmod})`);
    const metaDates = [...w.matchAll(/\n    date: "(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]).sort();
    const newest = metaDates[metaDates.length - 1];
    check(!!newest && days(newest, lastmod) >= 0,
      `SITEMAP_LASTMOD ${lastmod} is not older than the newest dated page ${newest}`);
    const pvu = constOf('PRICE_VALID_UNTIL');
    check(days(today, pvu) > 30, `PRICE_VALID_UNTIL ${pvu} is more than 30 days away (Google reads a past one as a withdrawn offer)`);
    const exp = (w.match(/\nExpires: (\S+)/) || [])[1] || '';
    const expDay = exp.slice(0, 10);
    check(days(today, expDay) > 30 && days(today, expDay) <= 366,
      `security.txt Expires ${expDay} is 31 to 366 days out, per RFC 9116 (saw ${days(today, expDay)} days)`);
  }

  console.log('\nMarkdown the renderer drops silently (B1-18)');
  // markdownToHtml knows ##, paragraphs, "- " lists and four-space code. A ### heading,
  // a numbered list, a fenced block or a wrapped list item renders as literal markup on
  // a published page, and node --check, node --test and this file all stay green. The
  // card pages use the md* helpers instead and are excluded by name, not by guess.
  {
    const cards = new Set(Object.keys(twConverted));
    const keys = [...w.slice(twPmStart).matchAll(/\n  "(\/[^"]*)": `/g)].map((m) => m[1]);
    check(keys.length > 20, `PAGE_MARKDOWN twins found (${keys.length})`);
    const probs = [];
    for (const k of keys.filter((k) => !cards.has(k))) {
      const md = (twMdTwin(k) || '').replace(/\r\n/g, '\n');
      if (/^### /m.test(md)) probs.push(k + ': ### heading');
      if (/^\d+\. /m.test(md)) probs.push(k + ': numbered list');
      if (/^```/m.test(md)) probs.push(k + ': fenced code block');
      for (const block of md.split(/\n{2,}/)) {
        const lines = block.split('\n').filter((l) => l.trim() !== '');
        if (lines.length > 1 && /^- /.test(lines[0]) && lines.some((l) => !/^- /.test(l))) {
          probs.push(k + ': wrapped list item (' + lines.find((l) => !/^- /.test(l)).trim().slice(0, 40) + ')');
        }
      }
    }
    check(probs.length === 0, `no twin rendered by markdownToHtml uses a construct it drops${probs.length ? ' :: ' + probs.join(' | ') : ''}`);
    // And the FAQ half: mdFaqBlocks now throws on an answerless question, which is a
    // build failure at request time. This names the page before a deploy can.
    const empties = [];
    for (const k of keys) {
      const md = (twMdTwin(k) || '').replace(/\r\n/g, '\n');
      const sec = md.split('\n## ').find((s) => s.startsWith('Frequently asked'));
      if (!sec) continue;
      const blocks = sec.split('\n\n').slice(1).map((b) => b.trim()).filter(Boolean);
      for (let i = 0; i < blocks.length; i++) {
        const q = blocks[i].match(/^\*\*(.+?)\*\*$/s);
        if (q && (i + 1 >= blocks.length || /^\*\*(.+?)\*\*$/s.test(blocks[i + 1]))) empties.push(k + ': ' + q[1].slice(0, 40));
      }
    }
    check(empties.length === 0, `every published FAQ question is followed by an answer${empties.length ? ' :: ' + empties.join(' | ') : ''}`);
  }

  console.log('\nFAQ, one home per page (B1-03)');
  // Nineteen pages published a FAQPage whose questions appeared on no page in any form, so
  // a crawler read a question and answer a reader could not see. Finding that needs an
  // enumeration rather than a search, and in both directions: the twins that carry a
  // Frequently asked section and the pages that publish a FAQPage are the same set, and
  // every published pair is read from its own twin rather than typed beside it. Run against
  // the tree before v3.92.0 this section fails, which is the reason it is written this way.
  {
    // A lone trailing CR survives a \r\n replace here, because region() ends on the \n.
    const gpf = region('var GUIDE_PAGE_FAQ = {', '\n};').replace(/\r/g, '');
    const rows = [...gpf.matchAll(/\n  "([^"]+)": mdFaqBlocks\("([^"]+)", "Frequently asked"\)\.pairs,/g)];
    const crossed = rows.filter((m) => m[1] !== m[2]).map((m) => `${m[1]} reads ${m[2]}`);
    check(rows.length > 0 && crossed.length === 0,
      `every GUIDE_PAGE_FAQ entry reads its own twin (${rows.length} entries)${crossed.length ? ' :: ' + crossed.join(', ') : ''}`);
    // A pair typed here rather than in the twin is the whole defect, so the shape is banned
    // rather than counted: the block may hold nothing but the derivation lines.
    const strays = gpf.split('\n').slice(1)
      .filter((l) => l.trim() && !/^  "[^"]+": mdFaqBlocks\("[^"]+", "Frequently asked"\)\.pairs,$/.test(l));
    check(strays.length === 0,
      `GUIDE_PAGE_FAQ holds no FAQ typed beside the twin${strays.length ? ' :: ' + strays[0].trim().slice(0, 60) : ''}`);
    check(!/\bvar BUYER_FAQ\b/.test(w), 'no page keeps a second FAQ home beside its twin (BUYER_FAQ is gone)');

    const twinKeys = [...w.slice(twPmStart).matchAll(/\n  "(\/[^"]*)": `/g)].map((m) => m[1]);
    const hasFaq = (p) => /\n## Frequently asked\n/.test((twMdTwin(p) || '').replace(/\r\n/g, '\n'));
    const faqTwins = twinKeys.filter(hasFaq);
    // mdSection reads the first section of a given name, so a twin with two of them
    // publishes one and renders the other as loose prose, and every count above still
    // agrees with itself. A mutation test went green on exactly that (2026-08-10).
    const twice = twinKeys.filter((p) => ((twMdTwin(p) || '').replace(/\r\n/g, '\n').match(/\n## Frequently asked\n/g) || []).length > 1);
    check(twice.length === 0, `no twin carries the section twice${twice.length ? ' :: ' + twice.join(', ') : ''}`);
    // A card page builds its FAQ by name. Every other twin carrying a section is a guide,
    // rendered by the one generic path in serveGuideHtml, so the two lists together are
    // every page that can publish one.
    const byName = [...new Set([...w.matchAll(/\bmdFaq(?:Card|Rows)\("([^"]+)", "Frequently asked"\)/g)].map((m) => m[1]))];
    setSame('FAQ rendered by name vs card pages carrying a section', byName, Object.keys(twConverted).filter(hasFaq));
    setSame('twins with a Frequently asked section vs pages publishing a FAQPage',
      faqTwins, [...new Set([...rows.map((m) => m[1]), ...byName])]);

    const gfn = twFnBody('serveGuideHtml') || '';
    check(gfn.includes('const faqHead = "\\n## Frequently asked\\n";') && gfn.includes('mdFaqCard(pathname, "Frequently asked")'),
      'serveGuideHtml renders the section as a card for any guide twin that carries one');
    check(gfn.includes('markdownToHtml(md.slice(0, faqAt))') && gfn.includes('markdownToHtml(md.slice(faqEnd))'),
      'serveGuideHtml renders the article around the card, so a question is not published twice');
    // 27 of the 46 pages this template serves render no card at all (22 blog posts and the
    // five guides with no FAQ), and the first version handed all 46 the card rules: 1 010
    // bytes of CSS with no element to match, on a site that sells cheap pages for agents.
    check(gfn.includes('${faqAt === -1 ? "" : SCARD_CSS + "\\n" + FAQ_CSS + "\\n"}'),
      'the guide template serves the card styles only to the pages that render a card');
    faqPaths.push(...faqTwins);
  }

  console.log('\nBlog index, three homes (B1-19)');
  // LLMS_TXT, the /blog twin and META_BY_PATH each carry the post list. The twin gate
  // compares "## " headings and /blog has none, so it passes on an empty comparison and
  // the reader never sees the twin list anyway (mdLead drops it).
  {
    const llms = region('var LLMS_TXT', '\nvar ');
    // The .md suffix arrived with llms.txt v2 (2026-08-24): the file's links point at the
    // markdown twin of each page now. The gate compares PATHS, so the suffix is optional in
    // the pattern and never part of the captured path. Without this the regex matched zero
    // links and the gate would have passed on two empty sets.
    const a = [...llms.matchAll(/\n- \[[^\]]*\]\(https:\/\/turva\.dev(\/blog\/[a-z0-9-]+)(?:\.md)?\)/g)].map((m) => m[1]);
    const twin = (twMdTwin('/blog') || '').replace(/\r\n/g, '\n');
    const b = [...twin.matchAll(/\n- \[[^\]]*\]\((\/blog\/[a-z0-9-]+)\)\. (\d{4}-\d{2}-\d{2})\./g)];
    const meta = [...w.slice(w.indexOf('var META_BY_PATH')).matchAll(/\n  "(\/blog\/[a-z0-9-]+)": \{/g)].map((m) => m[1]);
    setSame('LLMS_TXT blog list vs META_BY_PATH', a, meta);
    setSame('/blog twin list vs META_BY_PATH', b.map((m) => m[1]), meta);
    const wrong = b.filter((m) => !w.includes(`"${m[1]}": {`) || !region(`  "${m[1]}": {`, '\n  },').includes(`date: "${m[2]}"`));
    check(b.length > 0 && wrong.length === 0,
      `every /blog index date matches META_BY_PATH${wrong.length ? ' :: ' + wrong.map((m) => m[1] + ' says ' + m[2]).join(', ') : ''}`);
  }

  console.log('\nBlog modification dates (B1-11)');
  // dateModified was datePublished for every post, including one whose own body reads
  // "Corrected 2026-08-02": structured data telling a reader the page had not been
  // touched while the page said it had. The marker in the prose owns the date.
  {
    const MONTHS = { January: '01', February: '02', March: '03', April: '04', May: '05', June: '06', July: '07', August: '08', September: '09', October: '10', November: '11', December: '12' };
    const bad2 = [];
    for (const m of w.slice(w.indexOf('var META_BY_PATH')).matchAll(/\n  "(\/blog\/[a-z0-9-]+)": \{/g)) {
      const path = m[1];
      const entry = region(`  "${path}": {`, '\n  },');
      const declared = (entry.match(/modified: "(\d{4}-\d{2}-\d{2})"/) || [])[1] || null;
      const date = (entry.match(/date: "(\d{4}-\d{2}-\d{2})"/) || [])[1] || '';
      const md = (twMdTwin(path) || '').replace(/\r\n/g, '\n');
      const marks = [];
      for (const x of md.matchAll(/^Corrected (\d{4}-\d{2}-\d{2})/gm)) marks.push(x[1]);
      for (const x of md.matchAll(/^(?:Note added|Update,|Status,) ([A-Z][a-z]+) (\d{1,2})[:,]/gm)) {
        if (MONTHS[x[1]]) marks.push(date.slice(0, 4) + '-' + MONTHS[x[1]] + '-' + String(x[2]).padStart(2, '0'));
      }
      const want = marks.sort().pop() || null;
      if (want !== declared) bad2.push(`${path}: prose says ${want || 'no modification'}, META_BY_PATH says ${declared || 'none'}`);
    }
    check(bad2.length === 0, `every post that declares a modification in its prose carries the same modified date${bad2.length ? ' :: ' + bad2.join(' | ') : ''}`);
    // The first version of this check searched for one line of source and passed while
    // the /blog hub, forty lines below it, still copied datePublished into dateModified
    // for all 22 posts. Every assignment is enumerated instead.
    const dm = [...w.matchAll(/dateModified = ([^;]+);/g)].map((x) => x[1].trim());
    check(dm.length >= 2 && dm.every((x) => /\.modified \|\|/.test(x)),
      `every dateModified assignment reads the modified field first (saw ${dm.length}: [${dm.join(' | ')}])`);
  }

  console.log('\nx402 amounts, two constants (B1-20)');
  // The same three USDC amounts live in X402_MANIFEST and X402_ROUTES with nothing
  // comparing them, and they encode a EUR/USDC rate that has no source and no
  // measurement date anywhere. Consistency is checkable; the rate itself is not.
  {
    const man = region('var X402_MANIFEST', '\nvar ');
    const acc = [...man.matchAll(/"amount": "(\d+)",\s*\n\s*"resource": "https:\/\/turva\.dev(\/api\/agent\/\w+)"/g)]
      .map((m) => ({ path: m[2], amount: m[1] }));
    const routesSrc = region('var X402_ROUTES', 'var ACP_SERVICES');
    const routes = [...routesSrc.matchAll(/"(\/api\/agent\/(\w+))": \{[\s\S]*?amountUsdcMicro: "(\d+)",\s*\n\s*amountEurCents: (\d+)/g)]
      .map((m) => ({ path: m[1], key: m[2], usdc: m[3], cents: Number(m[4]) }));
    setSame('X402_MANIFEST priced resources vs X402_ROUTES', acc.map((x) => x.path), routes.map((r) => r.path));
    const rates = [];
    for (const r of routes) {
      const fromManifest = (acc.find((x) => x.path === r.path) || {}).amount;
      check(fromManifest === r.usdc, `x402 ${r.path} amount identical in both constants (manifest ${fromManifest}, route ${r.usdc})`);
      check(r.cents === facts.prices[r.key] * 100, `x402 ${r.path} EUR cents == facts.json ${facts.prices[r.key] * 100} (saw ${r.cents})`);
      check(man.includes(`(€${facts.prices[r.key].toLocaleString('en-US')} / ${Number(r.usdc) / 1e6} USDC)`),
        `x402 manifest description for ${r.path} states €${facts.prices[r.key].toLocaleString('en-US')} and ${Number(r.usdc) / 1e6} USDC`);
      rates.push((Number(r.usdc) / 1e6) / facts.prices[r.key]);
    }
    const spread = rates.length ? (Math.max(...rates) - Math.min(...rates)) / Math.min(...rates) : 1;
    check(rates.length === routes.length && routes.length > 0 && spread < 0.001,
      `one USDC per EUR rate across all ${routes.length} amounts (${rates.map((x) => x.toFixed(4)).join(', ')}, spread ${(spread * 100).toFixed(3)} %)`);
  }

  console.log('\nStateless checkout says so (B1-10)');
  // The surface holds no state, which the 404 body explained and no successful response
  // did: cancel returned 200 "canceled" and the next GET on the same id returned
  // not_ready_for_payment, two live answers about one resource that read as a contradiction.
  {
    const acp = region('function buildAcpCheckoutSession', '\nfunction acpHeaders');
    const cancel = region('if (action === "cancel")', 'if (action === "complete")');
    check(/Sessions are stateless/.test(acp), 'a created or retrieved checkout session states that sessions are stateless');
    check(/Sessions are stateless/.test(cancel), 'a canceled checkout session states that sessions are stateless');
    check(/Sessions are stateless/.test(region('code": "not_found", "message": "Unknown checkout session id', '\n')), 'the 404 body still explains statelessness');
  }

  check(anchorFails.length === 0,
    `every source anchor these gates read resolves${anchorFails.length ? ' :: ' + anchorFails.join(' | ') : ''}`);
}

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

  console.log('\nFAQ published where a reader can see it (B1-03)');
  // Read from the served page, not from worker.js: a gate that greps the source proves the
  // string is in the source, which was true all along while the reader saw nothing. The
  // list of pages comes from the twins, so a page that stops publishing its FAQ is a
  // missing card here rather than a page nobody checks.
  {
    const faqNodes = (html) => {
      const out = [];
      for (const m of html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)) {
        let j; try { j = JSON.parse(m[1].replace(/<\\\/script/g, '</script')); } catch { continue; }
        const walk = (n) => {
          if (Array.isArray(n)) { n.forEach(walk); return; }
          if (!n || typeof n !== 'object') return;
          if (n['@type'] === 'FAQPage') for (const q of n.mainEntity || []) out.push({ q: twSquash(q.name), a: twSquash((q.acceptedAnswer || {}).text || '') });
          if (n['@graph']) walk(n['@graph']);
        };
        walk(j);
      }
      return out;
    };
    check(faqPaths.length > 0, `pages publishing a FAQPage, enumerated from the twins (${faqPaths.length})`);
    for (const p of faqPaths) {
      let page;
      try { page = await (await fetch(base + p)).text(); }
      catch (e) { bad(`GET ${p} -> ${e.code || e.message}`); continue; }
      const cards = [...page.matchAll(/<div class="faq">([\s\S]*?)<\/div>/g)];
      check(cards.length === 1, `${p}: exactly one FAQ card on the page (saw ${cards.length})`);
      const vis = cards.length === 1
        ? [...cards[0][1].matchAll(/<p class="q">([\s\S]*?)<\/p>\s*<p>([\s\S]*?)<\/p>/g)].map((m) => ({ q: twHtml(m[1]), a: twHtml(m[2]) }))
        : [];
      const jl = faqNodes(page);
      setSameLive(`${p}: questions on the page vs in the FAQPage`, vis.map((x) => x.q), jl.map((x) => x.q));
      const wrong = jl.filter((n) => !vis.some((v) => v.q === n.q && v.a === n.a));
      check(jl.length > 0 && wrong.length === 0,
        `${p}: every published answer is the text the reader sees${wrong.length ? ' :: ' + wrong.map((x) => x.q).join('; ') : ''}`);
    }
  }
  // The homepage scan board is a surface that states the category set, and nothing
  // compared it to anything until 2026-08-01. It is read from the SERVED page rather
  // than from worker.js on purpose: a gate that greps the source proves the string is
  // in the source, which is a different claim from what a buyer's browser receives.
  // The cells are read as a shaped list in order, so a dropped cell, an extra cell, a
  // reordered cell and a changed score each fail on their own line. facts.json owns
  // WHICH categories exist; category.label owns how the board spells them, because the
  // board wording is user interface text and the id is a machine key, and forcing one
  // to equal the other would change the page to suit the gate.
  try {
    const homeHtml = await (await fetch(base + '/')).text();
    const gridM = homeHtml.match(/<div class="board-grid">([\s\S]*?)<\/div>\s*<div class="board-sum">([\s\S]*?)<\/div>/);
    if (!gridM) bad('board: board-grid / board-sum not found in the served homepage');
    else {
      const cells = [...gridM[1].matchAll(/<div class="cell"><span class="cat">([^<]*)<\/span><span class="val">([^<]*)<\/span><\/div>/g)]
        .map((m) => ({ cat: twDecode(m[1]).trim(), val: twDecode(m[2]).trim() }));
      const wantLabels = CATS.map((c) => c.label);
      // Both sides can go empty at once, and then two empty joins compare equal. The
      // label check and the count check are separate lines so an empty facts.json
      // cannot make the order check below vacuously true.
      check(CATS.length > 0 && wantLabels.every((l) => typeof l === 'string' && l.length > 0),
        `facts.json gives all ${CATS.length} categories a board label`);
      check(cells.length === CATS.length, `board shows ${CATS.length} cells (saw ${cells.length})`);
      check(cells.length > 0 && cells.length === CATS.length && cells.map((c) => c.cat).join(' | ') === wantLabels.join(' | '),
        `board labels == facts.json labels, in order (saw [${cells.map((c) => c.cat).join(', ')}])`);
      const wrongVal = cells.filter((c) => c.val !== iar.score);
      check(cells.length > 0 && wrongVal.length === 0,
        `every board cell reads ${iar.score} (${wrongVal.length ? 'wrong: ' + wrongVal.map((c) => c.cat + ' = ' + c.val).join(', ') : 'all ' + cells.length + ' cells'})`);
      // The summary carries the same two claims the hero carries, so it is read as a
      // whole string rather than as two independent substring searches: "100/100" and
      // "Level 5" both appearing somewhere in the block does not prove they are the
      // claim the block makes.
      const sum = twSquash(twDecode(gridM[2].replace(/<[^>]+>/g, ' ')));
      const wantSum = `verified ${iar.score} ${lvl} Agent-Native`;
      check(sum === wantSum, `board summary reads "${wantSum}" (saw "${sum}")`);
    }
  } catch (e) { bad('board: ' + (e.code || e.message)); }

  // --- A2A, WebMCP and the agent skills: three surfaces that SERVE data, none of
  // which was compared to anything before 2026-08-01. The MCP gate below proved that
  // names are not data; these are the same question asked of the other transports.
  // facts.json owns the prices, the business ID and the service set. Every check calls
  // the surface and reads the answer, rather than reading the source that produces it.
  const SERVICES = Array.isArray(facts.services) ? facts.services : [];
  const priceOf = (svc) => (svc.priceKey ? facts.prices[svc.priceKey] : 'on request');
  const PRICED = SERVICES.filter((x) => x.priceKey);
  const euroOf = (key) => '€' + facts.prices[key].toLocaleString('en-US');
  // Every length comparison below is guarded by a positive floor as well. Two empty
  // lists compare equal, two empty joins compare equal, and every() over an empty
  // array is true, so an empty facts.json plus an empty answer reads as agreement.
  // The board block above says this in its own comment and the first version of this
  // block did not do it.
  const nonEmpty = SERVICES.length > 0;

  // The evidence twin, read as SERVED. The static section checks it in worker.js, and
  // the board block's own argument applies here too: a source read proves the string
  // is in the source. Agents read the markdown twin, so it is fetched the way they
  // fetch it.
  try {
    const md = await (await fetch(base + '/', { headers: { accept: 'text/markdown' } })).text();
    const sp = CATS.map((c) => [c.label, ...(Array.isArray(c.prose) ? c.prose : [])].map((x) => String(x).toLowerCase()));
    const sc = iar.score.toLowerCase(), lv = lvl.toLowerCase();
    const want = `scanner: isitagentready.com (third party, cloudflare). ${sp[0][0]}, ${sp[1][1]}, ${sp[2][0]}, and ${sp[3][1]}: ${sc}. ${sp[4][0]}: ${sc}. verified ${sc}, ${lv}, agent-native.`;
    const i = md.toLowerCase().replace(/\s+/g, ' ').indexOf('scanner: isitagentready.com');
    const gotMd = i < 0 ? '' : md.toLowerCase().replace(/\s+/g, ' ').slice(i, i + want.length);
    check(CATS.length === 5 && gotMd === want,
      `served markdown twin states the set and both scores${gotMd === want ? '' : `\n        want: "${want}"\n        got:  "${gotMd}"`}`);
  } catch (e) { bad('served markdown twin: ' + (e.code || e.message)); }

  // EVERY canonical path's markdown twin, not just two of them. Added 2026-08-16 (Tek-237),
  // and this closes round 8 section 3's last open item together with the two checks above it.
  //
  // WHAT THIS ASKS, stated narrowly so it is not read as more than it is. For every path in
  // CANONICAL_PATHS it asks the page the way an agent asks: GET with `accept: text/markdown`.
  // It then checks four things per path. The response is 200. The content type is markdown
  // rather than HTML, because the real failure mode here is silent fallback: a path where
  // negotiation is not wired answers 200 with a full HTML document and looks fine to anything
  // that only checks the status. The body carries no `<!DOCTYPE`, which catches the same
  // fallback from the other side. And the markdown's first heading matches the served HTML's
  // <h1>, which is what makes this a comparison rather than a liveness probe.
  //
  // WHAT IT DOES NOT ASK. It does not compare the served markdown byte for byte against the
  // PAGE_MARKDOWN twin in worker.js. That would need a parser for a JS object of template
  // literals, and a parser that is subtly wrong reports subtly wrong results forever. Two
  // paths ARE compared against their source content above, and those two stay the deep check.
  // This is the wide one. Saying which is which is the point: a wide check presented as a deep
  // one is how a gate passes for the wrong reason.
  //
  // WHY IT IS OPT-IN, and this was measured before the check ever ran. Fifty-seven paths at two
  // requests each is 114 requests, and this site enforces its own advertised rate limit of 100
  // requests per 60 s per IP (verified against the zone on 2026-08-16: action block, 600 s
  // mitigation). A gate that trips the control it is verifying would fail for a reason that has
  // nothing to do with the twins, and would block the operator's own IP for ten minutes while
  // doing it. So it runs only with `--twins`, and it paces itself under the limit. Erik's call
  // 2026-08-16 was to take the three new gates into trial use and drop any that cause trouble;
  // an opt-in flag is what makes dropping it a decision rather than an incident.
  if (LIVE && process.argv.includes('--twins')) try {
    const cpM = src.worker.text.match(/var CANONICAL_PATHS = new Set\(\[([\s\S]*?)\]\)/);
    const paths = cpM ? [...cpM[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
    check(paths.length > 2, `CANONICAL_PATHS parsed from worker.js (${paths.length} paths)`);
    const rikki = [];
    const rajoitettu = [];
    // 1100 ms between requests: 114 requests spread over about 125 s, roughly 55 in any 60 s window.
    // The first version used 700 ms and justified it with this block's own 114 requests alone. An
    // independent review pointed out the obvious omission: the same --live run makes 40 to 65 other
    // requests with no pacing at all, and they share the quota. 55 leaves room for those.
    const odota = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const pth of paths) {
      try {
        await odota(1100);
        const r = await fetch(base + pth, { headers: { accept: 'text/markdown' } });
        const ct = (r.headers.get('content-type') || '').toLowerCase();
        const body = await r.text();
        // 429 on eri asia kuin rikkinainen kaksonen, ja ilman tata eroa portti raportoi oman
        // liikenteensa sivuston vikana. Riippumaton tarkastus nosti taman 2026-08-16: 700 ms
        // tahdistus laskettiin vain taman lohkon 114 pyynnosta, mutta samassa --live-ajossa on
        // 40 to 65 muuta tahdistamatonta pyyntoa, jotka kaikki lasketaan samaan 100/60 s
        // kiintioon. Tahdistus nostettiin 1100 millisekuntiin ja 429 raportoidaan omanaan.
        if (r.status === 429) { rajoitettu.push(pth); continue; }
        if (!r.ok) { rikki.push(`${pth}: HTTP ${r.status}`); continue; }
        if (!ct.includes('markdown')) { rikki.push(`${pth}: content-type ${ct || 'none'}`); continue; }
        if (/<!DOCTYPE/i.test(body)) { rikki.push(`${pth}: body is an HTML document`); continue; }
        if (!body.trim()) { rikki.push(`${pth}: empty body`); continue; }
        const mdH1 = (body.match(/^#\s+(.+)$/m) || [])[1];
        await odota(1100);
        const htmlRes = await fetch(base + pth);
        const html = await htmlRes.text();
        const htmlH1raw = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
        if (!mdH1 || !htmlH1raw) { rikki.push(`${pth}: no h1 in ${!mdH1 ? 'markdown' : 'html'}`); continue; }
        const norm = (s) => h1Decode(h1Strip(s))
          .replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (norm(mdH1) !== norm(htmlH1raw)) rikki.push(`${pth}: h1 differs, md "${norm(mdH1)}" vs html "${norm(htmlH1raw)}"`);
      } catch (e) { rikki.push(`${pth}: ${e.code || e.message}`); }
    }
    check(paths.length > 2 && rikki.length === 0 && rajoitettu.length === 0,
      `every canonical path serves a markdown twin whose h1 matches the HTML (${paths.length} paths`
      + `${rikki.length ? ', broken: ' + rikki.slice(0, 6).join('; ') + (rikki.length > 6 ? ` and ${rikki.length - 6} more` : '') : ''}`
      + `${rajoitettu.length ? `; RATE LIMITED on ${rajoitettu.length} paths, this run measured the limiter and not the twins, raise the pacing and re-run` : ''})`);
  } catch (e) { bad('canonical markdown twins: ' + (e.code || e.message)); }
  else if (LIVE) console.log('  skip  canonical markdown twins (add --twins; 114 paced requests, see the note above)');

  // A2A HTTP+JSON transport. The card declares three skills and the endpoint answers
  // them, so the question is whether what it answers agrees with facts.json. The skill
  // is named in the request AND read back out of the answer, and the answer must carry
  // exactly one part carrying only that skill's own fields: echoing the requested id
  // beside the union of all three payloads would otherwise satisfy every value check
  // below while answering a different question from the one asked.
  try {
    const a2a = async (skillId) => {
      const body = { message: { kind: 'message', role: 'user', messageId: 'verify-' + (skillId || 'none'),
        parts: [{ kind: 'text', text: 'verify' }], ...(skillId ? { metadata: { skillId } } : {}) } };
      const r = await fetch(base + '/v1/message:send', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      const msg = j.message || {};
      const parts = Array.isArray(msg.parts) ? msg.parts : [];
      return { status: r.status, skills: (msg.metadata || {}).skills, parts, data: (parts[0] || {}).data };
    };
    // One field that belongs to exactly one skill. Present in its own answer, absent
    // from the other two, which is what a union payload cannot satisfy.
    const OWN = { services: 'services', 'contact-info': 'email', 'company-info': 'sameAs' };
    const card = JSON.parse(await (await fetch(base + '/.well-known/agent-card.json')).text());
    const cardSkills = (card.skills || []).map((x) => x.id).sort();
    check(cardSkills.length > 0, `A2A card declares skills (${cardSkills.join(', ') || 'none'})`);
    check(cardSkills.join(',') === Object.keys(OWN).sort().join(','),
      `A2A card declares the skills this gate knows how to read (saw [${cardSkills}])`);

    const answers = {};
    for (const id of Object.keys(OWN)) {
      const r = await a2a(id);
      answers[id] = r;
      check(r.status === 200 && r.parts.length === 1 && r.data && r.data.skill === id
        && Array.isArray(r.skills) && r.skills.join(',') === id,
        `A2A answers ${id} with one part for the skill it was asked for (status ${r.status}, parts ${r.parts.length}, skill ${JSON.stringify(r.data && r.data.skill)}, metadata ${JSON.stringify(r.skills)})`);
      const own = OWN[id];
      const foreign = Object.entries(OWN).filter(([k]) => k !== id).map(([, f]) => f).filter((f) => r.data && f in r.data);
      check(!!r.data && own in r.data && foreign.length === 0,
        `A2A ${id} carries its own field "${own}" and no other skill's${foreign.length ? ' :: also carries ' + foreign.join(', ') : ''}`);
    }

    const aList = (answers.services.data && Array.isArray(answers.services.data.services)) ? answers.services.data.services : [];
    check(nonEmpty && aList.length === SERVICES.length,
      `A2A services lists all ${SERVICES.length} services (saw ${aList.length})`);
    check(nonEmpty && aList.length === SERVICES.length && aList.map((x) => x.name).join(' | ') === SERVICES.map((x) => x.name).join(' | '),
      `A2A service names == facts.json, in order (saw [${aList.map((x) => x.name).join(', ')}])`);
    for (const want of SERVICES) {
      const got = aList.find((x) => x.name === want.name);
      const p = want.priceKey ? (got && got.price) : (got && got.pricing);
      check(!!got && p === priceOf(want), `A2A services ${want.name} == ${priceOf(want)} (saw ${JSON.stringify(p)})`);
    }
    const pricedA = aList.filter((x) => typeof x.price === 'number').length;
    check(PRICED.length > 0 && pricedA === PRICED.length, `A2A prices exactly ${PRICED.length} of ${aList.length} services (saw ${pricedA})`);
    check(aList.length > 0 && aList.every((x) => typeof x.price !== 'number' || x.currency === facts.prices.currency),
      `A2A priced services all carry currency ${facts.prices.currency}`);

    for (const id of ['contact-info', 'company-info']) {
      const d = answers[id].data || {};
      check(d.businessId === facts.businessId, `A2A ${id} states Business ID ${facts.businessId} (saw ${JSON.stringify(d.businessId)})`);
    }
    // Every channel an agent is handed has to be one it can act on. A bare username is
    // not, and that shipped once inside two quote manifests (v3.73.0).
    const con = answers['contact-info'].data || {};
    check(/^[^@\s]+@[^@\s]+$/.test(String(con.email || '')), `A2A contact-info email is an address (saw ${JSON.stringify(con.email)})`);
    for (const k of ['signal', 'linkedin']) {
      check(/^https:\/\//.test(String(con[k] || '')), `A2A contact-info ${k} is an https URL (saw ${JSON.stringify(con[k])})`);
    }
    // Card and transport must declare the same skills in BOTH directions. Card to
    // transport is the loop above. Transport to card is this: with no skillId the
    // endpoint returns everything it implements, so its own set is readable, and a
    // fourth skill the card never declares would be a surface no agent can find.
    const all = await a2a(null);
    check(Array.isArray(all.skills) && all.skills.length > 0 && all.skills.slice().sort().join(',') === cardSkills.join(','),
      `A2A transport implements exactly the card's skills (transport [${all.skills}], card [${cardSkills}])`);
    check(Array.isArray(all.parts) && all.parts.length === cardSkills.length,
      `A2A returns one part per skill when none is named (saw ${all.parts.length} of ${cardSkills.length})`);
    const bogus = await a2a('trust-and-safety');
    check(bogus.status === 400, `A2A refuses an undeclared skillId with 400 (saw ${bogus.status})`);
  } catch (e) { bad('A2A message:send: ' + (e.code || e.message)); }

  // WebMCP in-page tools. Structurally these run in a browser, so a gate is tempted to
  // read WEBMCP_SCRIPT out of worker.js and call that proof. It is not: the CSP hash
  // gate proves the script is intact in the SOURCE, and what was never proved is what
  // the tools RETURN. So the script is taken from the SERVED page and executed.
  //
  // Executing bytes fetched from the network is the dangerous half of that idea, and
  // node:vm is not a security boundary: any host function handed into the context
  // gives back the host realm through its own .constructor, which was measured working
  // here on 2026-08-01 (fetch.constructor('return process')() returned the real
  // process, and reading a file off the machine followed from it). Two changes make
  // this safe. First, the served script must be byte-identical to WEBMCP_SCRIPT in
  // this repo before a single line of it is executed, so what runs is code already in
  // the tree and the difference this gate exists to find is reported rather than run.
  // Second, the context is built with no host object and no host prototype reachable
  // from it: the stubs are constructed inside the context from a bootstrap string, the
  // /services markdown is fetched out here and passed in as a string, and the context
  // object itself has a null prototype.
  try {
    const { createContext, runInContext } = await import('node:vm');
    const homeHtml2 = await (await fetch(base + '/')).text();
    // Every script element, typed or not, plus any external one. The first version
    // skipped elements carrying any type= attribute, so a second modelContext script
    // with type="module", or one loaded with src=, was invisible to a check whose own
    // message claimed the page carries exactly one.
    // A regexp cannot do this job, and two CodeQL alerts said so in a row: browsers
    // accept <SCRIPT> and end tags such as </script foo="bar">, so every pattern that
    // looked right still missed one corner. This scans by index, the way a parser reads
    // this one element: the opening tag ends at the first >, and the element ends at the
    // first </script that is followed by whitespace, a slash or >. It is a scan and not
    // a parser, and the remaining differences from a browser all make this gate louder
    // rather than quieter: a script written inside an HTML comment or inside <textarea>
    // is counted, script data double escaping ends the element early, and an unclosed
    // element is not counted at all. The one case that can still hand this gate a wrong
    // body is an unclosed <script inside a comment, and the byte-identity check below
    // is what catches that.
    const scriptElements = (html) => {
      const low = html.toLowerCase();
      const out = [];
      let i = 0;
      while ((i = low.indexOf('<script', i)) !== -1) {
        const nameEnd = i + 7;
        if (!/[\s/>]/.test(html[nameEnd] || '')) { i = nameEnd; continue; }
        // The opening tag ends at the first > that is NOT inside a quoted attribute
        // value. A hostile read of this function found that case: in
        // <script data-x="a>b" src="https://cdn.example/x.js"> the attribute list was
        // cut at the quoted >, src= fell outside it, and the gate reported "no external
        // script" about a page that loads one. That was the only difference from a
        // browser parser that made this gate quieter instead of louder.
        let openEnd = -1;
        let quote = '';
        for (let j = nameEnd; j < html.length; j++) {
          const ch = html[j];
          if (quote) { if (ch === quote) quote = ''; continue; }
          if (ch === '"' || ch === "'") { quote = ch; continue; }
          if (ch === '>') { openEnd = j; break; }
        }
        if (openEnd === -1) break;
        let close = low.indexOf('</script', openEnd);
        while (close !== -1 && !/[\s/>]/.test(html[close + 8] || '')) close = low.indexOf('</script', close + 8);
        if (close === -1) break;
        const closeEnd = html.indexOf('>', close);
        if (closeEnd === -1) break;
        out.push({ attrs: html.slice(nameEnd, openEnd), body: html.slice(openEnd + 1, close) });
        i = closeEnd + 1;
      }
      return out;
    };
    const allScripts = scriptElements(homeHtml2);
    // \b would also fire on data-src=, so the boundary is spelled out: start of the
    // attribute list, whitespace, a slash, or the quote that closed the previous value.
    const external = allScripts.filter((s) => /(?:^|[\s/"'])src\s*=/i.test(s.attrs));
    check(external.length === 0, `served homepage loads no external script (saw ${external.length})`);
    const inline = allScripts.filter((s) => s.body.includes('modelContext')).map((s) => s.body);
    check(inline.length === 1, `served homepage carries exactly one script mentioning modelContext (saw ${inline.length})`);

    // Source side, sliced the same way the CSP hash check slices it.
    const w = src.worker.text;
    const at = w.indexOf('var WEBMCP_SCRIPT = `<script>');
    const from = at < 0 ? -1 : w.indexOf('<script>', at) + '<script>'.length;
    const to = from < 0 ? -1 : w.indexOf('<\\/script>', from);
    const sourceBody = (at < 0 || to < 0) ? null : w.slice(from, to).replace(/\r\n/g, '\n');
    check(!!sourceBody, 'WEBMCP_SCRIPT body found in worker.js');

    const servedBody = inline.length === 1 ? inline[0] : null;
    const identical = !!sourceBody && servedBody === sourceBody;
    check(identical, `served WebMCP script is byte-identical to WEBMCP_SCRIPT in this repo${identical ? '' : ` (source ${sourceBody ? sourceBody.length : 'n/a'} bytes, served ${servedBody ? servedBody.length : 'n/a'} bytes)`}`);

    if (identical) {
      const svcMdForTool = await (await fetch(base + '/services', { headers: { accept: 'text/markdown' } })).text();
      // Object.create(null), not {}. createContext contextifies the object it is given,
      // and that object is made in THIS realm, so `this.constructor.constructor` inside
      // the context walks back out to the host Function and reaches process. Measured
      // both ways on 2026-08-01: createContext({}) leaks, createContext(Object.create(null))
      // does not, because a null-prototype object has no constructor to walk.
      const ctx = createContext(Object.create(null));
      runInContext(`
        globalThis.__md = ${JSON.stringify(svcMdForTool)};
        globalThis.__provided = null;
        globalThis.navigator = { modelContext: { provideContext: function (a) { globalThis.__provided = a; } } };
        globalThis.fetch = function () { return Promise.resolve({ ok: true, status: 200, text: function () { return Promise.resolve(globalThis.__md); } }); };
      `, ctx, { timeout: 5000 });
      runInContext(servedBody, ctx, { timeout: 5000 });
      const provided = ctx.__provided;
      const tools = (provided && Array.isArray(provided.tools)) ? provided.tools : [];
      check(tools.length > 0, `WebMCP script registers tools when executed (saw ${tools.length})`);
      const byName = Object.fromEntries(tools.map((t) => [t.name, t]));
      const answers = {};
      // runInContext's timeout does not cover a promise settled after it returns, so
      // the await gets its own deadline.
      const deadline = (p, ms, what) => Promise.race([p,
        new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after ' + ms + ' ms')), ms).unref?.())]);
      for (const t of tools) {
        try { answers[t.name] = await deadline(t.execute({}), 10000, t.name); }
        catch (e) { bad(`WebMCP ${t.name} failed when called: ${e.message}`); }
      }
      check(tools.length > 0 && tools.every((t) => answers[t.name] && typeof answers[t.name] === 'object'),
        `every WebMCP tool returns an object (${tools.map((t) => t.name).join(', ') || 'none'})`);

      const wc = answers.get_contact || {};
      check(!!byName.get_contact && wc.businessId === facts.businessId,
        `WebMCP get_contact Business ID == ${facts.businessId} (saw ${JSON.stringify(wc.businessId)})`);
      check(/^https:\/\//.test(String(wc.signalUrl || '')), `WebMCP get_contact signalUrl is an https URL (saw ${JSON.stringify(wc.signalUrl)})`);
      check(/^https:\/\//.test(String(wc.linkedin || '')), `WebMCP get_contact linkedin is an https URL (saw ${JSON.stringify(wc.linkedin)})`);

      const ws = answers.get_services || {};
      const wp = ws.pricing || {};
      check(!!byName.get_services && wp.currency === facts.prices.currency,
        `WebMCP get_services currency == ${facts.prices.currency} (saw ${JSON.stringify(wp.currency)})`);
      for (const svc of PRICED) {
        const got = (wp[svc.priceKey] || {}).price;
        check(got === facts.prices[svc.priceKey],
          `WebMCP get_services ${svc.priceKey} price == ${facts.prices[svc.priceKey]} (saw ${JSON.stringify(got)})`);
      }
      // The markdown it hands back is the page a person reads, and the price is bound
      // to its own heading. An unbound search for the amount passed a markdown with
      // the three prices swapped between the three services, because all three numbers
      // were still somewhere on the page.
      const wmd = String(ws.markdown || '');
      check(wmd.length > 0, `WebMCP get_services returns the /services markdown (${wmd.length} bytes)`);
      for (const svc of PRICED) {
        const re = new RegExp(`##\\s+${svc.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+\\*\\*${euroOf(svc.priceKey).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        check(re.test(wmd), `WebMCP get_services markdown prices ${svc.name} at ${euroOf(svc.priceKey)} under its own heading`);
      }
      const wco = answers.get_company || {};
      check(!!byName.get_company && wco.businessId === facts.businessId,
        `WebMCP get_company Business ID == ${facts.businessId} (saw ${JSON.stringify(wco.businessId)})`);
    }
  } catch (e) { bad('WebMCP tools: ' + (e.code || e.message)); }

  // --- Published price lists. Five documents carry a catalogue of priced services, and until
  // 2026-08-09 nothing compared any of them to facts.json. The service set moved to four priced
  // services and all five stayed at three, including a SIGNED server card whose own
  // serverInfo.description already named the fourth: one document contradicting itself. The change
  // that caused it touched every surface this file already watched and no surface it did not, which
  // is the finding rather than the drift.
  //
  // Enumerate, do not search. The set is read off the document and compared to facts.json PRICED
  // three ways at once: same length, every element found resolves to a member, no member resolved
  // twice. A search for each expected name passes a list that is missing one, and a length check
  // alone passes a list with one name twice and another absent. See /blog/my-gate-could-not-see-a-sixth.
  //
  // These are catalogues and not payable-rail lists, which is why all five belong here. The
  // surfaces deliberately left at three are /openapi.json, /.well-known/x402 and the x402 challenge:
  // those enumerate what an agent can actually pay for, and the Shopify check has no card link and
  // no on-chain resource by decision (mds/decisions.md Tek-176).
  const priceList = (label, found) => {
    const want = PRICED.map((s) => s.name);
    const seen = new Set(), dupes = [];
    for (const n of found) { if (seen.has(n)) dupes.push(n); else seen.add(n); }
    const unknown = found.filter((n) => !want.includes(n));
    const missing = want.filter((n) => !found.includes(n));
    const ok = nonEmpty && found.length === want.length && !unknown.length && !dupes.length && !missing.length;
    check(ok, `${label} enumerates exactly the ${want.length} priced services (saw ${found.length}: [${found.join(', ')}]`
      + `${missing.length ? ', missing: ' + missing.join(', ') : ''}`
      + `${unknown.length ? ', unknown: ' + unknown.join(', ') : ''}`
      + `${dupes.length ? ', duplicated: ' + dupes.join(', ') : ''})`);
  };
  const byKey = Object.fromEntries(PRICED.map((s) => [s.priceKey, s.name]));
  // Each surface names the block it owns, so the amount check reads the same object the name
  // check read. An earlier draft re-derived the block with a conditional on the picker function,
  // which is the kind of cleverness this file exists to catch.
  const priceListSurfaces = [
    ['/.well-known/mcp/server-card.json', (d) => (d.meta || {}).pricing || {},
      (p) => Object.keys(p).filter((k) => k !== 'currency' && k !== 'vatIncluded').map((k) => byKey[k] || k),
      (p, key) => (p[key] || {}).price],
    ['/.well-known/ap2', (d) => d.pricing || {}, (p) => (p.items || []).map((i) => i.name),
      (p, key) => ((p.items || []).find((i) => i.name === byKey[key]) || {}).price],
    ['/.well-known/mpp', (d) => d.pricing || {}, (p) => (p.items || []).map((i) => i.name),
      (p, key) => ((p.items || []).find((i) => i.name === byKey[key]) || {}).price],
    ['/.well-known/ucp', (d) => ((d.ucp || {}).pricing || {}), (p) => (p.items || []).map((i) => i.name),
      (p, key) => ((p.items || []).find((i) => i.name === byKey[key]) || {}).price],
  ];
  for (const [path, block, names, amountOf] of priceListSurfaces) {
    try {
      const p = block(JSON.parse(await (await fetch(base + path)).text()));
      priceList(path, names(p));
      for (const s of PRICED) check(amountOf(p, s.priceKey) === facts.prices[s.priceKey],
        `${path} prices ${s.name} at ${facts.prices[s.priceKey]} (saw ${JSON.stringify(amountOf(p, s.priceKey))})`);
    } catch (e) { bad(`price list ${path}: ` + (e.code || e.message)); }
  }
  // The two signed plugin manifests state the price list as prose for a model to read, so the
  // enumeration is the count of euro amounts plus membership of every one of them. Prose cannot be
  // parsed into a list, but it can be counted, and a fourth service missing from a sentence changes
  // the count.
  for (const path of ['/.well-known/ai-plugin.json', '/.well-known/agent.json']) {
    try {
      const d = JSON.parse(await (await fetch(base + path)).text());
      const desc = String(d.description_for_model || '');
      const amounts = desc.match(/\u20ac[\d,]+/g) || [];
      check(nonEmpty && amounts.length === PRICED.length,
        `${path} description_for_model states ${PRICED.length} prices (saw ${amounts.length}: [${amounts.join(', ')}])`);
      for (const s of PRICED) check(amounts.includes(euroOf(s.priceKey)),
        `${path} description_for_model prices ${s.name} at ${euroOf(s.priceKey)}`);
    } catch (e) { bad(`plugin manifest ${path}: ` + (e.code || e.message)); }
  }

  // Agent skills. This surface has already served the wrong thing once: the services
  // skill listed three offerings on a site that sells five, and it was caught by a
  // person reading (v3.81.0). The index digest is computed at request time from the
  // same string it indexes, so it proves the index and the file agree as served and
  // nothing about drift from facts.json; the content checks below do that work.
  try {
    const idx = JSON.parse(await (await fetch(base + '/.well-known/agent-skills/index.json')).text());
    const skills = Array.isArray(idx.skills) ? idx.skills : [];
    check(skills.length > 0, `agent-skills index lists skills (${skills.map((s) => s.name).join(', ') || 'none'})`);
    const bodies = {};
    for (const s of skills) {
      const r = await fetch(base + s.url);
      const text = await r.text();
      bodies[s.name] = text;
      check(r.ok, `agent-skills ${s.name} GET ${s.url} -> ${r.status}`);
      const want = 'sha256:' + createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
      check(!!s.digest && s.digest === want, `agent-skills ${s.name} digest matches the served file (${s.digest === want ? 'ok' : s.digest + ' vs ' + want})`);
    }
    const svcMd = bodies.services || '';
    check(svcMd.length > 0, 'agent-skills services skill was served');
    // All five, not three, and enumerated rather than searched for: the bullets are
    // read out of the file and compared to the set, so a sixth offering is as visible
    // as a missing one.
    const bullets = [...svcMd.matchAll(/^- \*\*([^*]+?)\.\*\*/gm)].map((m) => m[1].trim());
    check(nonEmpty && bullets.length === SERVICES.length && bullets.join(' | ') === SERVICES.map((x) => x.name).join(' | '),
      `agent-skills services skill lists exactly the ${SERVICES.length} services, in order (saw [${bullets.join(', ')}])`);
    for (const svc of PRICED) {
      check(svcMd.includes(`**${svc.name}.** ${euroOf(svc.priceKey)}`), `agent-skills services skill prices ${svc.name} at ${euroOf(svc.priceKey)}`);
    }
    // And the reverse, because "on request" is a claim too: neither unpriced service
    // may acquire a number here.
    for (const svc of SERVICES.filter((x) => !x.priceKey)) {
      check(svcMd.includes(`**${svc.name}.** On request.`), `agent-skills services skill keeps ${svc.name} on request`);
    }
    // Read the form, not the value. An earlier version searched the whole file for the
    // number and passed while the stated Business ID was wrong, because the same digits
    // also sit inside the YTJ register URL two lines down: one occurrence changed, one
    // did not, and a substring search cannot tell a claim from a link. Caught by
    // mutation on 2026-08-01, and it is the same defect as pulling loose integers out
    // of a scanner string.
    const esc = (x) => String(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const bidRe = new RegExp('\\*\\*Business ID[^*]*\\*\\*\\s*' + esc(facts.businessId));
    for (const name of ['contact-info', 'company-info']) {
      const body = bodies[name] || '';
      check(bidRe.test(body), `agent-skills ${name} states Business ID ${facts.businessId} as its own field`);
      const stray = [...body.matchAll(/\*\*Business ID[^*]*\*\*\s*(\S+)/g)].map((m) => m[1]).filter((v) => v !== facts.businessId);
      check(stray.length === 0, `agent-skills ${name} states no other Business ID${stray.length ? ' :: ' + stray.join(', ') : ''}`);
    }
  } catch (e) { bad('agent skills: ' + (e.code || e.message)); }

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
    const delRes = await fetch(MCP, { method: 'DELETE', headers: { accept: 'application/json, text/event-stream' } });
    check(delRes.status === 405, `DELETE ${MCP} answers 405 (saw ${delRes.status})`);

    // Names are not data. Everything above proves the card and the server agree on
    // WHICH tools exist. Nothing proved what those tools SERVE, and that gap shipped
    // three times: a two-scanner sentence, a commerce sub-score beside the wrong
    // measured date, and a category key that existed on no other surface. Each was caught
    // by a person reading, which is not a gate. So call every data tool and diff the
    // answer against facts.json, which is where these numbers are canonical.
    //
    // Every answer must carry resultType. That field is the lane discriminator, not a
    // formality: measured 2026-08-01, a get_services call sent without the revision
    // envelope lands on the SDK compatibility lane and returns the same 2486 bytes with a
    // 200 and no resultType. A gate that only read the payload would pass while measuring
    // a lane this server no longer claims to serve.
    const callTool = async (name) => {
      const r = await rpc('tools/call', { name, arguments: {} }, { 'mcp-name': name });
      const result = r.body.result || {};
      const first = (result.content || [])[0] || {};
      if (r.body.error || first.type !== 'text') {
        bad(`tools/call ${name} -> ${r.res.status} ${JSON.stringify(r.body.error || first)}`);
        return null;
      }
      check(result.resultType === 'complete',
        `tools/call ${name} answers on revision ${REV} (resultType ${JSON.stringify(result.resultType)})`);
      try { return JSON.parse(first.text); } catch { bad(`tools/call ${name} answer is not JSON`); return null; }
    };
    const ints = (v) => (String(v).match(/\d+/g) || []).map(Number);

    const svc = await callTool('get_services');
    if (svc) {
      check(svc.currency === facts.prices.currency,
        `get_services currency == facts.json ${facts.prices.currency} (saw ${svc.currency})`);
      const byId = Object.fromEntries((svc.services || []).map((s) => [s.id, s]));
      // The id list is derived from facts.json rather than written out here. It was a
      // literal ['audit', 'advisory', 'implementation'] until 2026-08-09, so a fourth
      // priced service was invisible to this gate: the loop asked only about the three
      // it already knew, and the count below was a hardcoded 3. Same defect as
      // /blog/my-gate-could-not-see-a-sixth, in a gate that post did not read. priceKey
      // doubles as the MCP service id; the reverse check below keeps the unpriced ones honest.
      for (const s of PRICED) {
        const id = s.priceKey;
        const got = byId[id] && byId[id].price;
        check(got === facts.prices[id],
          `get_services ${id} price == facts.json ${facts.prices[id]} (saw ${JSON.stringify(got)})`);
      }
      // Quote-on-request is a claim in its own right, so the reverse is a check too: a
      // number on either of these two is a price this business never agreed to.
      //
      // B2-11 (round 12, batch E16). These two ids were written out by hand, so a third
      // quote-on-request service would have been unchecked, and facts.json carried no id to
      // derive them from. It does now, and the set comes from there.
      const UNPRICED = SERVICES.filter((x) => !x.priceKey);
      check(UNPRICED.length > 0, `facts.json names at least one quote-on-request service (${UNPRICED.length})`);
      for (const s of UNPRICED) {
        const got = byId[s.id] && byId[s.id].price;
        check(got === 'on request', `get_services ${s.id} stays on request (saw ${JSON.stringify(got)})`);
      }
      const priced = (svc.services || []).filter((s) => typeof s.price === 'number').length;
      check(priced === PRICED.length,
        `get_services prices exactly ${PRICED.length} of ${(svc.services || []).length} services (saw ${priced})`);
      // And the total, which this block printed without comparing it to anything: a seventh
      // service in the answer changed the message and no check.
      check(nonEmpty && (svc.services || []).length === SERVICES.length,
        `get_services answers with exactly the facts.json service set (${SERVICES.length} services, saw ${(svc.services || []).length})`);
      const gotIds = (svc.services || []).map((s) => s.id).sort().join(',');
      const wantIds = SERVICES.map((s) => s.id).sort().join(',');
      check(nonEmpty && gotIds === wantIds,
        `get_services names the facts.json service ids (want [${wantIds}], saw [${gotIds}])`);
    }

    const rdy = await callTool('get_agent_readiness');
    if (rdy) {
      const scanner = facts.agentReadiness.isitagentready;
      check(rdy.measured_at === facts.agentReadiness.measuredAt,
        `get_agent_readiness measured_at == facts.json ${facts.agentReadiness.measuredAt} (saw ${rdy.measured_at})`);
      const scan = (rdy.scans || []).find((s) => s.provider === 'isitagentready.com') || {};
      check(String(scan.result || '').includes(scanner.score) && String(scanner.level) && String(scan.result || '').includes(scanner.level),
        `get_agent_readiness states ${scanner.score} and ${scanner.level} (saw ${JSON.stringify(scan.result)})`);
      // Read the category set defensively: if facts.json ever loses it, the failure
      // should name that and let the other checks still run, not throw out of the
      // whole MCP block and take thirty passes with it.
      const cats = Array.isArray(scanner.categories) ? scanner.categories : [];
      check(cats.length > 0, 'facts.json records the isitagentready category set');
      const gotCats = scan.categories || {};
      check(cats.length > 0 && Object.keys(gotCats).sort().join(',') === cats.map((c) => c.id).sort().join(','),
        `get_agent_readiness category keys == facts.json [${cats.map((c) => c.id)}] (saw [${Object.keys(gotCats)}])`);
      for (const c of cats) {
        // Shaped, not scraped. Pulling loose integers accepted "100 (4/4 checks failed)"
        // as a pass, and it broke on any added word. The score is derived from this
        // category's own two counts rather than borrowed from the site total, which are
        // different numbers that happen to agree while everything passes.
        const m = String(gotCats[c.id]).match(/^(\d+)$/);
        check(!!m && Number(m[1]) === 100,
          `get_agent_readiness ${c.id} reads 100 with no check count (saw ${JSON.stringify(gotCats[c.id])})`);
      }
    }

    const secEv = await callTool('get_security_evidence');
    if (secEv) {
      check(secEv.measured_at === facts.security.measuredAt,
        `get_security_evidence measured_at == facts.json ${facts.security.measuredAt} (saw ${secEv.measured_at})`);
      // The two records state the same measurement in different words on purpose
      // ("all 13 categories passed" against "13/13 categories passed", "98/100" against
      // a score beside a scale), so the numbers are compared and the prose is not.
      const hz = (secEv.scans || []).find((s) => s.provider === 'Hardenize') || {};
      const wantHz = ints(facts.security.hardenize.result)[0];
      // The word carries as much of the claim as the number does: reading loose integers
      // passed "13/13 categories failed" without complaint.
      const hzM = String(hz.result).match(/^(\d+)\/(\d+) categories passed$/);
      check(Number.isFinite(wantHz) && !!hzM && Number(hzM[1]) === wantHz && Number(hzM[2]) === wantHz,
        `get_security_evidence Hardenize reads ${wantHz}/${wantHz} categories passed (saw ${JSON.stringify(hz.result)})`);
      check(hz.url === facts.security.hardenize.url,
        `get_security_evidence Hardenize url == facts.json (saw ${hz.url})`);
      const inl = (secEv.scans || []).find((s) => s.provider === 'Internet.nl') || {};
      const wantInl = ints(facts.security.internetnl.score);
      check(Number.isFinite(wantInl[0]) && inl.score === wantInl[0],
        `get_security_evidence Internet.nl score == facts.json ${wantInl[0]} (saw ${JSON.stringify(inl.score)})`);
      // Both sides can go missing at once, and then undefined equals undefined: facts
      // losing the "/100" and the served scale disappearing together read as a pass.
      check(Number.isFinite(wantInl[1]) && ints(inl.scale).slice(-1)[0] === wantInl[1],
        `get_security_evidence Internet.nl scale tops out at ${wantInl[1]} (saw ${JSON.stringify(inl.scale)})`);
      check(inl.url === facts.security.internetnl.url,
        `get_security_evidence Internet.nl url == facts.json (saw ${inl.url})`);
      const inlM = (secEv.scans || []).find((s) => s.provider === 'Internet.nl (email)') || {};
      const wantInlM = ints(facts.security.internetnlMail.score);
      check(Number.isFinite(wantInlM[0]) && inlM.score === wantInlM[0],
        `get_security_evidence Internet.nl mail score == facts.json ${wantInlM[0]} (saw ${JSON.stringify(inlM.score)})`);
      check(Number.isFinite(wantInlM[1]) && ints(inlM.scale).slice(-1)[0] === wantInlM[1],
        `get_security_evidence Internet.nl mail scale tops out at ${wantInlM[1]} (saw ${JSON.stringify(inlM.scale)})`);
      check(inlM.url === facts.security.internetnlMail.url,
        `get_security_evidence Internet.nl mail url == facts.json (saw ${inlM.url})`);
    }

    const pri = await callTool('get_principles');
    if (pri) {
      // Anchored to the phrase that makes it a claim. A bare includes() would also be
      // satisfied by the digits inside a YTJ register URL, which is the same defect
      // that was measured and fixed in the agent-skills block above on 2026-08-01;
      // nothing in get_principles carries that URL today, so this is closing the door
      // before it opens.
      const priTxt = JSON.stringify(pri);
      check(priTxt.includes(`Business ID ${facts.businessId}`),
        `get_principles states "Business ID ${facts.businessId}" as a claim, not as a URL fragment`);
    }

    // The name-agreement rule, proven rather than assumed. Without this a server that
    // ignored Mcp-Name would answer get_services to a header asking for get_principles,
    // and every check above would still pass because the body asked for the right tool.
    const nameMismatch = await rpc('tools/call', { name: 'get_services', arguments: {} }, { 'mcp-name': 'get_principles' });
    check(nameMismatch.res.status === 400 && nameMismatch.body.error && nameMismatch.body.error.code === -32020,
      `Mcp-Name/body mismatch refused with 400 and -32020 (saw ${nameMismatch.res.status} / ${nameMismatch.body.error && nameMismatch.body.error.code})`);
  } catch (e) { bad('MCP parity: ' + (e.code || e.message)); }

  // --- MTA-STS. The policy is mode: enforce, so a wrong MX list here does not produce an
  // error message, it stops inbound mail: a sender that cannot match the receiving MX against
  // this file refuses to deliver. The four names lived only in MTA_STS_POLICY and nothing
  // compared them to the zone (round 12, B1-17). Three sources are compared here because they
  // can disagree in three ways: DNS is the authority, the constant is the claim in the repo,
  // and the served file is what a sending MTA actually reads.
  try {
    const dns = (await import('node:dns')).promises;
    const mailDomain = 'turva.dev';
    const polSrc = (src.worker.text.match(/var MTA_STS_POLICY = `([\s\S]*?)`;/) || [])[1] || '';
    // The source is CRLF and a JS template literal is LF at runtime, so the served bytes are
    // LF. RFC 8461 allows either (sts-policy-term = LF / CRLF), so this normalises and
    // everything else has to match exactly.
    const pol = polSrc.replace(/\r\n/g, '\n');
    // \s spans the line break, so ':\s*(.+)' read a value off the NEXT line and passed a policy
    // the receiving end rejects (sts-policy-field-delim is ":" *WSP, and WSP is SP/HTAB only).
    // The trailing [ \t]* is the other half: RFC 8461 allows *WSP after a field, so a stray space
    // must not fail. Both measured 2026-08-10.
    const field = (k) => (pol.match(new RegExp('^' + k + ':[ \\t]*(.+?)[ \\t]*$', 'm')) || [])[1];
    const polMx = [...pol.matchAll(/^mx:[ \t]*(\S+)[ \t]*$/gm)].map((m) => m[1].toLowerCase().replace(/\.$/, ''));
    check(field('version') === 'STSv1', `MTA_STS_POLICY version: STSv1 (saw ${JSON.stringify(field('version'))})`);
    check(field('mode') === 'enforce', `MTA_STS_POLICY mode: enforce (saw ${JSON.stringify(field('mode'))})`);
    // RFC 8461 sets no floor for max_age (the text only says implementers SHOULD prefer values
    // as long as is practical), but it does set a ceiling: section 3.2 defines the value as a
    // non-negative integer with a maximum of 31557600. The floor here is the site's own claim,
    // not the RFC's: a policy of 0 seconds would be legal and would mean nothing is cached.
    const maxAge = Number(field('max_age'));
    check(/^\d{1,10}$/.test(field('max_age') || '') && maxAge > 0 && maxAge <= 31557600,
      `MTA_STS_POLICY max_age is a positive integer no greater than the RFC 8461 maximum of 31557600 (saw ${JSON.stringify(field('max_age'))})`);
    check(polMx.length > 0, `MTA_STS_POLICY names at least one mx (saw ${polMx.length})`);

    const zoneMx = (await dns.resolveMx(mailDomain)).map((r) => r.exchange.toLowerCase().replace(/\.$/, ''));
    // An mx: entry may be a wildcard covering exactly one label (RFC 8461 section 4.1), so
    // membership is covered-by rather than string equality, and it is read in both directions:
    // every host the zone hands a sender must be allowed by the policy, and every line in the
    // policy must still match something. A one-way check passes a policy with a dead name in it.
    const covers = (pat, host) => pat.startsWith('*.')
      ? host.endsWith(pat.slice(1)) && host.split('.').length === pat.split('.').length
      : pat === host;
    const uncovered = zoneMx.filter((h) => !polMx.some((p) => covers(p, h)));
    const unused = polMx.filter((p) => !zoneMx.some((h) => covers(p, h)));
    check(zoneMx.length > 0 && uncovered.length === 0 && unused.length === 0,
      `MTA-STS policy allows exactly the ${mailDomain} MX set, and no line of it is dead (zone: [${zoneMx.join(', ')}], policy: [${polMx.join(', ')}]`
      + `${uncovered.length ? ', MX the policy does not allow: ' + uncovered.join(', ') : ''}`
      + `${unused.length ? ', policy lines matching no MX: ' + unused.join(', ') : ''})`);

    const stsUrl = `https://mta-sts.${mailDomain}/.well-known/mta-sts.txt`;
    // RFC 8461 section 3.3: "Policies fetched via HTTPS are only valid if the HTTP response code
    // is 200 (OK). HTTP 3xx redirects MUST NOT be followed." node fetch follows them by default,
    // so the gate has to refuse them the way a conforming sender does; otherwise it would read a
    // policy through a redirect and report green on a host no sender can fetch from.
    const stsRes = await fetch(stsUrl, { redirect: 'manual', headers: { 'cache-control': 'no-cache' } });
    const stsBody = await stsRes.text();
    check(stsRes.status === 200, `${stsUrl} -> ${stsRes.status} (RFC 8461 accepts 200 only, and no redirect)`);
    check(String(stsRes.headers.get('content-type') || '').startsWith('text/plain'),
      `policy content-type is text/plain (saw ${JSON.stringify(stsRes.headers.get('content-type'))})`);
    const stsNorm = stsBody.replace(/\r\n/g, '\n');
    check(pol.length > 0 && stsNorm === pol,
      `served policy is identical to MTA_STS_POLICY after CRLF normalisation (${stsNorm.length} served vs ${pol.length} in source)`);

    // The TXT id is the cache key. In enforce mode a sender keeps its cached policy until the
    // id changes, so a policy edited without a new id reaches nobody for up to max_age. This
    // proves the record is there and well formed; it cannot prove the id was bumped.
    const txt = (await dns.resolveTxt(`_mta-sts.${mailDomain}`)).map((r) => r.join(''));
    const sts = txt.filter((r) => r.startsWith('v=STSv1'));
    // RFC 8461 section 3.1: sts-field-delim = *WSP ";" *WSP, extension fields are allowed and
    // field order is not significant. The first regex here was turva's own exact spelling while
    // the message claimed RFC well-formedness, which is a narrower thing wearing a wider name.
    const stsOk = /^v=STSv1(?:[ \t]*;[ \t]*[A-Za-z0-9_.-]+=[^;\s]+)+[ \t]*;?[ \t]*$/.test(sts[0] || '')
      && /(?:^|;)[ \t]*id=[A-Za-z0-9]{1,32}[ \t]*(?:;|$)/.test(sts[0] || '');
    check(sts.length === 1 && stsOk,
      `_mta-sts.${mailDomain} has exactly one STSv1 record carrying an id, per RFC 8461 section 3.1 (saw ${JSON.stringify(txt)})`);

    // And the half the record alone cannot prove. The id is the cache key: a sender keeps its
    // cached policy until the id changes, so a policy edited without a new id reaches nobody
    // for up to max_age, and in enforce mode that is mail that does not arrive. facts.json
    // owns both halves on one line. Editing the policy turns the hash red, and updating the hash
    // to clear it puts the id to bump in Cloudflare DNS under the same cursor. That is a prompt
    // to a person and NOT a check: whoever updates the hash can still leave the id alone, and
    // all four checks here would be green with a changed policy behind an unchanged cache key.
    // Measured 2026-08-10. Deriving the id from the policy would make it a check, and that is a
    // DNS format change and Erik's decision (mds/decisions.md Tek-188).
    const ms = facts.mtaSts || {};
    const polSha = createHash('sha256').update(Buffer.from(pol, 'utf8')).digest('hex');
    check(ms.policySha256 === polSha,
      `facts.json mtaSts.policySha256 == the policy in worker.js (facts ${String(ms.policySha256).slice(0, 16)}..., worker.js ${polSha.slice(0, 16)}...)`);
    const liveId = ((sts[0] || '').match(/id=([A-Za-z0-9]+)/) || [])[1];
    check(!!ms.txtId && ms.txtId === liveId,
      `facts.json mtaSts.txtId == the id served in DNS (facts ${JSON.stringify(ms.txtId)}, DNS ${JSON.stringify(liveId)})`);
  } catch (e) { bad('MTA-STS: ' + (e.code || e.message)); }
} else {
  console.log('\n(static run - add --live on a networked machine to GET every declared URL and verify signatures)');
}

console.log(`\n${fails ? 'RESULT: FAIL' : 'RESULT: OK'}  -  ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
