# Toolchain

What to install, **when**, and why. Verified against primary sources September 2026.

One discipline rule governs this list: **three to five MCP servers, maximum.** Every server adds
tool schemas to every session, and more servers measurably worsens agent focus. Install a server
when the work needs it, not in advance.

---

## Install now

### Matt Pocock's engineering skills

```
/plugin install mattpocock-skills
```

Official marketplace, managed bundle, updates automatically.

The repository already assumes these exist — `docs/agents/issue-tracker.md` and
`docs/agents/domain.md` were scaffolded by `setup-matt-pocock-skills` from the same set. The
build-phase ones matter most:

| Skill | Use |
|---|---|
| `tdd` | Red-green-refactor, one vertical slice at a time. The definition of done in `CLAUDE.md` assumes this shape. |
| `implement` | Builds work from a spec or ticket — the C1 tickets are written to be consumed this way. |
| `to-tickets` | Breaks a plan into tickets **with blocking edges**. C1 was wired by hand; use this for C2–C8. |
| `to-spec` | Turns a conversation into a spec on the tracker without an interview. |
| `code-review` | Two-axis: coding standards **and** faithfulness to the originating spec. Distinct from the built-in `/code-review`, which hunts correctness bugs. Both are useful; they check different things. |
| `diagnosing-bugs` | Structured debugging rather than guess-and-check. |

### Context7 — up-to-date library documentation

**Installed.** On Windows the documented routes do not work: `npx -y @upstash/context7-mcp` times
out on the 30-second health check while npm downloads the package, and the `.cmd` shim path is
mangled by MSYS. What connects:

```
npm install -g @upstash/context7-mcp
claude mcp add --scope user context7 -- node <npm-global>/node_modules/@upstash/context7-mcp/dist/index.js
```

The highest-value MCP for this project. It serves **version-specific documentation pulled from
source repositories**, which is the single largest source of accuracy loss in AI-written code:
models confidently produce APIs that were renamed or removed.

Conker's build touches FastAPI, Pydantic, SQLAlchemy, psycopg, Qdrant, React, Vite and Docker
Compose. Every one of those has moved since any model's training cutoff.

An API key is **optional** — anonymous access works on shared rate limits. Set `CONTEXT7_API_KEY`
for your own tier.

---

## Install at the ticket that needs it

### Playwright MCP — at [#31](https://github.com/alexeybe1kin/conker/issues/31), the Chat screen

```
claude mcp add --scope project playwright npx @playwright/mcp@latest
```

Microsoft's official `@playwright/mcp`. Drives a real browser through the **accessibility tree**
rather than screenshots, which is both faster and more reliable — and the accessibility tree is
exactly what should be tested anyway, given the design system owns focus states and keyboard paths.

`--scope project` writes `.mcp.json` into this repository, so the configuration is version
controlled and does not follow you into unrelated projects. Needs Node 18+.

Not before #31. There is no UI to drive until then.

### PostgreSQL MCP — only if inspecting MemoryGate by hand becomes painful

Read-only credentials, never write. MemoryGate's contract is the supported way in; a database MCP
is for looking, not for reaching around the boundary. Skip it unless the need is real — this is the
server most likely to push the count past five for the least benefit.

---

## Already configured

**`mobbin`** — searches real shipped app flows, screens and sections. Reference before invention
when designing the nine screens and the guided tour. Reach for it at [#31](https://github.com/alexeybe1kin/conker/issues/31)
and again in C3.

---

## Runtime choices, not agent tooling

### Embedding sidecar: Ollama

For the embedding service ([#25](https://github.com/alexeybe1kin/conker/issues/25)), **Ollama**
serves the model over HTTP.

One command downloads and serves any supported model with automatic hardware optimisation — no
configuration files, no Docker required. `Qwen3-Embedding-0.6B`, the default chosen in
[ADR-0004](../adr/0004-multilingual-embeddings-from-a-sidecar.md), is Ollama-native.

The trade is throughput and batching control, which do not matter here: this is one person's memory
on one box, not a multi-tenant service. Simplicity is worth more, and the install story has to stay
kind to someone who does not write code.

**The upgrade path, if volume ever justifies it:** Hugging Face **TEI** — purpose-built for
embeddings and rerankers, Flash Attention 2, dynamic batching, gRPC and HTTP. One instance per
model. The sidecar contract in [ADR-0007](../adr/0007-three-swap-contracts.md) means swapping it is
a deployment change, not a code change. That is the contract earning its keep.

### Model routing: no gateway dependency

Pi writes its own thin provider adapters over OpenRouter and local endpoints. **Do not add a
gateway library for this** — see [ADR-0008](../adr/0008-supply-chain-policy.md) for why the obvious
candidate is disqualified.

If a gateway is ever genuinely needed, the self-hosted field is Portkey, Bifrost (Go) and LLM
Gateway (AGPLv3). Evaluate at that point, not now.
