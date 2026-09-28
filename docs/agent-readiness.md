# Agent-readiness reference

Agent-readiness is the degree to which an AI agent can discover, read, and act on a website or API without a person in the loop. It is measured against the machine-readable surfaces that agents consult: head metadata, JSON-LD, the `/.well-known/` directory, llms.txt, robots and sitemap rules, and protocol endpoints for tools and payments. A site can rank on Google and still be unreadable to an agent, because search ranking and agent legibility depend on different signals.

This file is a consolidated reference to those surfaces. Each entry gives a short definition and links to the full explanation on turva.dev. It is maintained by Erik Rekola of turva.dev, who runs agent-readiness audits and advisory for product teams. The Cloudflare Worker in this repository is the open-source reference build that produces these surfaces for turva.dev.

## What an agent-readiness audit is

An agent-readiness audit measures how well AI agents can discover, read, and act on a website or API, scored by an independent scanner against its published checks rather than a self-assessment. The output is a list of the surfaces an agent looks for, what it found on each, and where the gaps are. Full guide: https://turva.dev/guides/agent-readiness-audit

## Why this is separate from SEO

SEO makes a page rank so a person will click it. Agent-readiness makes the same page legible and usable to an automated client that reads structure rather than rendered prose. A high Google ranking does not predict whether a site appears inside an AI answer, because the agent reads different signals and often never renders the page at all. Full guide: https://turva.dev/guides/seo-vs-agent-readiness

## The surfaces agents read

Status below names, for the underlying mechanism, whether it is a ratified standard from a body such as the IETF or W3C, an actively versioned draft with its own issue process, a de facto convention with no ratifying body, or an early-stage pilot with limited adoption. A surface can combine more than one mechanism at different statuses; where it does, the table names the piece that status describes. Checked 2026-09-28 against each mechanism's own current page, cited in the Status column.

### Discovery and access

| Surface | What it does | Status | Guide |
| --- | --- | --- | --- |
| llms.txt | A plain text file at the site root that tells an AI agent what the site contains and where its key content lives. It differs from robots.txt, which controls crawler access, and from a sitemap, which lists URLs. | Convention. [llmstxt.org](https://llmstxt.org/) is an independent community proposal with no IETF or W3C ratification. | https://turva.dev/guides/llms-txt |
| robots.txt | Decides whether an agent is allowed in, and can name AI bot rules and Content Signals explicitly. | Standard. [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html), IETF Standards Track. | https://turva.dev/guides/sitemaps-and-robots-for-agents |
| sitemap | Lists the URLs a site wants an agent or crawler to find; a scan checks that the file exists and parses, not that it is complete. | Convention. The [Sitemaps protocol](https://www.sitemaps.org/protocol.html) is a cross-vendor convention with no IETF or W3C ratification. | https://turva.dev/guides/sitemaps-and-robots-for-agents |
| The /.well-known directory | The standard location where agents look for a site's machine-readable manifests, from the API catalog (RFC 9727) to MCP server cards and OAuth metadata. | Standard. [RFC 8615](https://www.rfc-editor.org/rfc/rfc8615.html), IETF Standards Track. | https://turva.dev/guides/well-known-for-agents |

### Reading the content

| Surface | What it does | Status | Guide |
| --- | --- | --- | --- |
| Prerendering | Serving a static version of a JavaScript-rendered page so an agent that does not run scripts still gets the content. | Not a specification. It is an implementation technique, so it carries no standards-body status. | https://turva.dev/guides/prerendering-for-agents |
| Markdown for agents | Serving a markdown version of a page through content negotiation, at a fraction of the tokens an HTML page costs. | Standard for the mechanism. [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), IETF Standards Track, defines content negotiation; the text/markdown media type itself is registered by [RFC 7763](https://www.rfc-editor.org/rfc/rfc7763.html), Informational rather than Standards Track. | https://turva.dev/guides/markdown-for-agents |
| JSON-LD and structured data | States a page's facts, such as prices, organisation details, and services, as data an agent can read without parsing prose. | Standard. JSON-LD 1.1 is a [W3C Recommendation](https://www.w3.org/TR/json-ld11/). | https://turva.dev/guides/json-ld-structured-data |
| Response headers | The right HTTP response headers let an agent work without parsing full HTML. | Mixed. Link ([RFC 8288](https://www.rfc-editor.org/rfc/rfc8288.html)) and Vary and content type (both in [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)) are IETF Standards Track; the RateLimit and RateLimit-Policy fields remain an active [IETF Internet-Draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/) rather than an RFC. | https://turva.dev/guides/response-headers-for-agents |

### Acting on the site

| Surface | What it does | Status | Guide |
| --- | --- | --- | --- |
| agents.json | A manifest that declares the actions and endpoints an AI agent can use on a site, which turns a readable site into an operable one. | Pilot. The [specification](https://github.com/wild-card-ai/agents-json) has stayed at version 0.1.0 since early 2025, outside any standards body, with adoption shifting toward MCP since. | https://turva.dev/guides/agents-json |
| MCP server cards | A JSON file that lets an agent discover a site's Model Context Protocol server and the tools it exposes. | Draft. The current form develops as an [experimental MCP extension](https://github.com/modelcontextprotocol/ext-server-card), [SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127), with its default location still unsettled. | https://turva.dev/guides/mcp-server-card |
| Agent authentication | The surface that lets an automated client gain scoped access without a human login, through OAuth discovery, protected resource metadata, and agent registration. | Standard for OAuth discovery. [RFC 8414](https://www.rfc-editor.org/rfc/rfc8414.html), IETF Standards Track; the human-readable auth.md entry point is a convention with two rival field-naming schemes, not a ratified format. | https://turva.dev/guides/agent-authentication |
| x402 and agent payments | x402 uses the HTTP 402 Payment Required status so an agent can discover a price, pay, and continue without a human checkout. | Pilot. [x402.org](https://x402.org/) is an open protocol led by its contributing companies, not an IETF or W3C specification; RFC 9110 reserves status code 402 but defines no payment protocol. | https://turva.dev/guides/x402-agent-payments |

## How agent-readiness should be measured

A hand-filled checklist records what a team intended to ship. An independent scanner records what an agent actually finds when it visits. Measured agent-readiness relies on the second, because the signals that matter are the ones present in the live response, not the ones noted in a plan. Full guide: https://turva.dev/guides/measurement-led-agent-readiness

## Common gaps on marketing sites

Most marketing sites are strong for human readers and weak for agents. The recurring gaps are in rendering (an empty shell), discovery (no llms.txt or an incomplete sitemap), cost (no machine-readable pricing), capability (no agents.json or MCP card), and structured data (missing or contradicted JSON-LD). Full guide: https://turva.dev/guides/agent-readiness-gaps

## Reference measurements for turva.dev

turva.dev is the reference build maintained alongside this repository. Measured on `https://turva.dev` on 2026-09-23:

- isitagentready.com (Cloudflare’s agent-readiness scanner): 100 / 100, Level 5 Agent-Native.

isitagentready.com groups its checks into five categories: Discoverability, Content Accessibility, Bot Access Control, API/Auth/MCP & A2A Discovery, and Commerce. turva.dev passes every check in all five, Commerce included since 2026-07-20. The commerce surface declares a real x402 challenge and real card payment links, so the discovery checks read what the site actually accepts. Settlement is still quote-on-request rather than automatic, which the checks do not test.

These figures describe one site. They are a worked example rather than a target every site needs to match.

## Provenance and identity

turva.dev is a registered Finnish business (Business ID 3600281-7) and a Wikidata entity (Q140276251), with its founder Erik Rekola as Q140276321. The site's JSON-LD links the Wikidata entities, the company register, LinkedIn, and GitHub through sameAs, so an agent can resolve the same entity across sources.

The site also signs several of its machine-readable manifests. An Ed25519 public key is published at /.well-known/jwks.json, and detached signatures for the ai-plugin, agent, MCP server card, and llms.txt manifests are listed at /.well-known/signatures.json. An agent can fetch a manifest, its signature, and the key, then confirm the manifest is authentic and unmodified. The signed input is the response body exactly as served, byte for byte: verify the raw bytes, not a parsed and re-serialised copy, because re-serialising changes the whitespace and the signature stops matching (the `signed_bytes` field in signatures.json says the same). This runs ahead of any single published standard for self-signed manifests, and is offered as a verifiable provenance signal.

## Verify

- isitagentready scanner: https://isitagentready.com/
- Guides index: https://turva.dev/guides
- Company record (Finnish Business Information System): https://tietopalvelu.ytj.fi/yritys/3600281-7

## Source and contact

Maintained by Erik Rekola, turva.dev. Agent-readiness audits, advisory, and implementation, async only. Email info@turva.dev, web https://turva.dev, LinkedIn https://www.linkedin.com/in/erikrekola. Licensed for reuse under the repository's MIT license.
