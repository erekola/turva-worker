# Agent-readiness reference

Agent-readiness is the degree to which an AI agent can discover, read, and act on a website or API without a person in the loop. It is measured against the machine-readable surfaces that agents consult: head metadata, JSON-LD, the `/.well-known/` directory, llms.txt, robots and sitemap rules, and protocol endpoints for tools and payments. A site can rank on Google and still be unreadable to an agent, because search ranking and agent legibility depend on different signals.

This file is a consolidated reference to those surfaces. Each entry gives a short definition and links to the full explanation on turva.dev. It is maintained by Erik Rekola of turva.dev, who runs agent-readiness audits and advisory for product teams. The Cloudflare Worker in this repository is the open-source reference build that produces these surfaces for turva.dev.

## What an agent-readiness audit is

An agent-readiness audit measures how well AI agents can discover, read, and act on a website or API, scored against current standards by independent scanners rather than a self-assessment. The output is a list of the surfaces an agent looks for, what it found on each, and where the gaps are. Full guide: https://turva.dev/guides/agent-readiness-audit

## Why this is separate from SEO

SEO makes a page rank so a person will click it. Agent-readiness makes the same page legible and usable to an automated client that reads structure rather than rendered prose. A high Google ranking does not predict whether a site appears inside an AI answer, because the agent reads different signals and often never renders the page at all. Full guide: https://turva.dev/guides/seo-vs-agent-readiness

## The surfaces agents read

### Discovery and access

**llms.txt.** A plain text file at the site root that tells an AI agent what the site contains and where its key content lives. It differs from robots.txt, which controls crawler access, and from a sitemap, which lists URLs. Full guide: https://turva.dev/guides/llms-txt

**robots.txt and sitemap.** Together they decide whether an agent is allowed in and what it can find. Agent access also depends on explicit AI bot rules and Content Signals, and on a sitemap that is actually complete. Full guide: https://turva.dev/guides/sitemaps-and-robots-for-agents

**The /.well-known directory.** The standard location where agents look for a site's machine-readable manifests, from the API catalog (RFC 9727) to MCP server cards and OAuth metadata. Full guide: https://turva.dev/guides/well-known-for-agents

### Reading the content

**Prerendering.** A JavaScript-rendered site returns an empty shell to an agent that does not run scripts, so the content never arrives. Prerendering, or serving a static version, is the fix for the most common agent gap. Full guide: https://turva.dev/guides/prerendering-for-agents

**Markdown for agents.** Serving a markdown version of a page through content negotiation gives an agent the content without the markup, at a fraction of the tokens. An llms-full.txt can carry the whole corpus in one file. Full guide: https://turva.dev/guides/markdown-for-agents

**JSON-LD and structured data.** JSON-LD states a page's facts, such as prices, organisation details, and services, as data an agent can read without parsing prose. Full guide: https://turva.dev/guides/json-ld-structured-data

**Response headers.** The right HTTP response headers let an agent work without parsing full HTML. Link, Vary, RateLimit, and content type headers each carry a signal an agent uses. Full guide: https://turva.dev/guides/response-headers-for-agents

### Acting on the site

**agents.json.** A manifest that declares the actions and endpoints an AI agent can use on a site, which turns a readable site into an operable one. Full guide: https://turva.dev/guides/agents-json

**MCP server cards.** A JSON file that lets an agent discover a site's Model Context Protocol server and the tools it exposes. Full guide: https://turva.dev/guides/mcp-server-card

**Agent authentication.** The surface that lets an automated client gain scoped access without a human login, through OAuth discovery, protected resource metadata, and agent registration. Full guide: https://turva.dev/guides/agent-authentication

**x402 and agent payments.** x402 uses the HTTP 402 Payment Required status so an agent can discover a price, pay, and continue without a human checkout. Full guide: https://turva.dev/guides/x402-agent-payments

## How agent-readiness should be measured

A hand-filled checklist records what a team intended to ship. An independent scanner records what an agent actually finds when it visits. Measured agent-readiness relies on the second, because the signals that matter are the ones present in the live response, not the ones noted in a plan. Full guide: https://turva.dev/guides/measurement-led-agent-readiness

## Common gaps on marketing sites

Most marketing sites are strong for human readers and weak for agents. The recurring gaps are in rendering (an empty shell), discovery (no llms.txt or an incomplete sitemap), cost (no machine-readable pricing), capability (no agents.json or MCP card), and structured data (missing or contradicted JSON-LD). Full guide: https://turva.dev/guides/agent-readiness-gaps

## Reference measurements for turva.dev

turva.dev is the reference build maintained alongside this repository. Measured on `https://turva.dev` on 2026-07-17:

- Cloudflare Agent-Ready (isitagentready.com): 100 / 100, Level 5 Agent-Native.
- startuphub.ai agent-readiness leaderboard: 99 / 100 (A+), first of the publicly-scanned sites on the leaderboard.

The startuphub.ai scan reports six category scores: Discoverability, Content, Access Control, Capabilities, and Commerce at 100 / 100 each, and Quality at 96 / 100. Quality is 96 because the rate_limit_headers check asks for RateLimit headers in a syntax that appears in no revision of the active IETF draft, while the site sends RateLimit-Policy as that draft defines it. Those six categories belong to StartupHub's model and are reported here as StartupHub's result, not the Cloudflare scan's. The Cloudflare Agent-Ready model uses different categories.

These figures describe one site. They are a worked example rather than a target every site needs to match.

## Provenance and identity

turva.dev is a registered Finnish business (Business ID 3600281-7) and a Wikidata entity (Q140276251), with its founder Erik Rekola as Q140276321. The site's JSON-LD links the Wikidata entities, the company register, LinkedIn, and Codeberg through sameAs, so an agent can resolve the same entity across sources.

The site also signs several of its machine-readable manifests. An Ed25519 public key is published at /.well-known/jwks.json, and detached signatures for the ai-plugin, agent, MCP server card, and llms.txt manifests are listed at /.well-known/signatures.json. An agent can fetch a manifest, its signature, and the key, then confirm the manifest is authentic and unmodified. This runs ahead of any single published standard for self-signed manifests, and is offered as a verifiable provenance signal.

## Verify

- StartupHub leaderboard: https://www.startuphub.ai/agent-readiness
- isitagentready scanner: https://isitagentready.com/
- Guides index: https://turva.dev/guides
- Company record (Finnish Business Information System): https://tietopalvelu.ytj.fi/yritys/3600281-7

## Source and contact

Maintained by Erik Rekola, turva.dev. Agent-readiness audits, advisory, and implementation, async only. Email info@turva.dev, web https://turva.dev, LinkedIn https://www.linkedin.com/in/erikrekola. Licensed for reuse under the repository's MIT license.
