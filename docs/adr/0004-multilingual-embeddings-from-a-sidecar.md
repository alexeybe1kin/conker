# ADR-0004 — Multilingual embeddings, served from a sidecar

**Status:** Accepted · 2026-09-04 · [issue #14](https://github.com/alexeybe1kin/conker/issues/14)

## Context

MemoryGate's semantic retrieval does not work as shipped. `sentence-transformers` is absent from
`services/api/requirements.txt`, so `get_embedding_model()` raises unless `EMBED_MODEL=hash`, and
the hash fallback embeds `sha256(f"{index}:{text}")` per dimension. That is a hash of the text, not
a representation of it: near-identical sentences produce uncorrelated vectors, so cosine similarity
over them is noise.

`the-idea.md` describes `sentence-transformers/all-MiniLM-L6-v2`, 384 dimensions, as a built
capability. It is **planned, not live** — exactly the failure `principles.md` §2 exists to prevent,
found in the project's own foundation.

The engine depends on this. Pattern recognition works by noticing that things repeat, and things
repeat *in different words*. Lexical search finds "the deploy script failed"; only semantic search
finds it from "the release broke again".

## Decision

**Restore semantic retrieval — but not with the documented model, and not in-process.**

**Multilingual, not MiniLM.** The rejection is specific to this owner rather than to benchmarks:
Conker's memory will be substantially Russian, and MiniLM is an English-first model from 2021.
Retrieval that degrades on half the corpus fails silently and asymmetrically, which is worse than
failing outright.

| Model | Dims | Footprint | Role |
|---|---|---|---|
| **Qwen3-Embedding-0.6B** | 1024 | ~1.5 GB | Default. ~70.7 MTEB-eng-v2, 100+ languages, Ollama-native |
| **EmbeddingGemma-300M** | 768 | <200 MB | Low-resource preset for small machines |
| ~~all-MiniLM-L6-v2~~ | 384 | ~80 MB | Rejected: English-first, wrong for a bilingual corpus |

The model is **configuration, not code**, shipped with those presets.

**Served by Ollama.** One command downloads and serves the model with automatic hardware
optimisation — no config files, no Docker required — and `Qwen3-Embedding-0.6B` is Ollama-native.
The trade is throughput and batching control, which do not matter for one person's memory on one
box, and the install story has to stay kind to someone who does not write code. Hugging Face **TEI**
is the upgrade path if volume ever justifies it; the sidecar contract makes that a deployment change
rather than a rewrite. See [`../agents/toolchain.md`](../agents/toolchain.md).

**A sidecar, not an import.** A separate service with an HTTP interface, called by MemoryGate. It
keeps MemoryGate's image small and its startup fast, makes the embedding provider swappable without
touching MemoryGate, and adds one more module of the same shape rather than a special case.

**The `hash` mode is deleted.** If the embedding service is unreachable, MemoryGate reports
`degraded` and falls back to lexical search **saying so**, and results carry which path produced
them. Returning confident nonsense is the precise failure this product exists to avoid.

## Consequences

**Re-embedding is required, and it is free today.** Existing vectors are unrecoverable noise, so
nothing is lost. The dimension change (384 → 1024) forces a Qdrant collection rebuild regardless.
Every day of real use makes this migration more expensive; it will never be cheaper than now.

**Embedding becomes the third swap contract** — embed one or many, report model identity and
dimension, report health. Model identity is part of the contract because changing it invalidates
every stored vector.

**One thing to check on the box:** the live `EMBED_MODEL` value decides whether the running instance
is crash-looping or silently returning noise. It does not change the decision — both are broken.
