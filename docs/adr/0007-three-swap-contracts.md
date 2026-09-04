# ADR-0007 — Three swap contracts, not four

**Status:** Accepted · 2026-09-04 · [issue #11](https://github.com/alexeybe1kin/conker/issues/11)

## Context

The owner requires that a forker be able to replace the **memory**, **tools**, **dashboard** and
**harness** behind documented interfaces — open code alone is not enough.

That requirement was accepted with its risk stated: defining interfaces before they have consumers
is the usual way abstractions go wrong. The ticket therefore carried an explicit guard — *any
contract with exactly one conceivable implementation is a premature abstraction; name a second
plausible implementation, or recommend deferring.*

## Decision

**Three contracts, each with a named second implementation.**

| Proposed | Second implementation? | Verdict |
|---|---|---|
| Memory | pgvector-only, Chroma, a file-backed store, a hosted memory service | **Real** |
| Tools / actions | a plain MCP server set, or another action service | **Real** |
| Embedding | a different local model, or a hosted embedding API | **Real** |
| Dashboard | yes — but it consumes Pi's API, which already exists | **Not separate** |
| Harness / Pi | replacing Pi means replacing the product | **Deferred** |

The **dashboard contract is Pi's generated OpenAPI**, already required of every module by
[ADR-0003](0003-the-gates-go-headless.md) — delivered by a rule that exists rather than by a new
abstraction. A **separate Pi contract is deferred**: a replacement consumes the gate APIs, which
already exist, so there is no distinct artefact to define.

The three:

- **Memory** — write evidence · request a bounded context package · run an analysis pass · correct ·
  delete, propagating down the lineage · report health and which retrieval paths are available.
- **Tools** — list · invoke · receive an approval requirement with request id and redacted detail ·
  invoke-with-approval, consumed once · report health. **A valid implementation must be able to
  refuse** — an action boundary that cannot say no is not one.
- **Embedding** — embed one or many · report model identity and dimension · report health.

All three are **network contracts** — HTTP with generated OpenAPI — not code-level interfaces. The
components are already separate processes, and a language-level plugin API would quietly require
every replacement to be written in Python.

## Consequences

**The owner's requirement is narrowed without being weakened.** Memory, tools, embedding and the UI
all stay swappable. What was dropped is a wrapper around Pi that nobody would implement.

**`degraded` is expressible in every contract**, and callers must handle it rather than treating
absence as zero. [ADR-0004](0004-multilingual-embeddings-from-a-sidecar.md) already depends on this.

**Versioned in the URL path**, one breaking change at a time, previous version served until the
composed product has moved. `CHANGELOG.md` is where a break becomes visible.

**Conker owns the contract; the implementation does not.** The contract describes what Conker needs
in domain terms, not what MemoryGate happens to expose today. Where the built gates diverge, the
gates change — they are inherited working, not frozen.
