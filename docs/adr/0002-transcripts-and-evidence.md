# ADR-0002 — Pi owns transcripts, MemoryGate owns evidence

**Status:** Accepted · 2026-09-03 · [issue #16](https://github.com/alexeybe1kin/conker/issues/16),
[issue #8](https://github.com/alexeybe1kin/conker/issues/8)

## Context

The concept documents contradict each other on what memory holds.

`the-idea.md` §7: *"Every session inside it becomes memory."*
`features.md` A2: memory is explicitly **not** *"a dump of every conversation."*

Both cannot be literally true, and the difference is not cosmetic — it decides how much data
accumulates, what the nightly job reads, and whether memory stays useful as it grows.

## Decision

**Pi owns transcripts. MemoryGate owns evidence. A session becoming memory means it is *mined*, not
*copied*.**

Raw conversation is Pi's session state and stays in Pi. What crosses into MemoryGate is **derived**:
facts, decisions, preferences, people, patterns — each carrying source, timestamp, confidence, scope
and retention, as A2 requires.

Two write paths, following MemoryGate's own Evidence → Analysis → Memory layering:

1. **Pi writes evidence asynchronously after each turn.** One record per turn — what was asked, what
   was answered in substance, which tools ran, what came back, and a **stable reference to the full
   transcript in Pi**. Never the raw messages. A turn never waits on this write.
2. **A scheduled analysis pass promotes evidence to memory.** Interpretation happens deliberately,
   never inline in a turn.

## Consequences

Evidence is cheap and complete; memory is considered and small. That separation is what stops memory
degenerating into a transcript dump that nothing can search usefully.

**A deliberate coupling:** MemoryGate's lineage points into Pi's transcripts by id. Transcript ids
must therefore be **stable and never reused**, and deleting a transcript must *invalidate* rather
than orphan the evidence citing it.

**Deletion propagates down the lineage.** Deleting a memory must also mark the evidence it derived
from, or the next analysis pass cheerfully recreates it. `principles.md` §9 requires the deletion
path to actually work, and this is what "actually" means here.

**This is the line most likely to be tested** as the system grows. It is written down precisely so
that moving it later is a visible decision rather than a drift.
