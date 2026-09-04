# Project Rules

## What this is

**Conker** — a self-hosted personal AI companion and control plane. `Conker` is both the
product and the default name of the Companion itself; both are owner-changeable.

**The foundation is three built, running, public services** — MemoryGate, ToolGate and
SystemGate (`belka0fficial`). They are inherited as working assets but **not frozen**: where a
real architectural problem is found, fixing or replacing a component is in scope. A fourth,
**Pi**, is being built in-house to run agent turns, sessions, jobs and model routing.

The **clean-slate rule applies to `agentgate`** — an abandoned earlier prototype under a
different brand. Nothing from it is inherited or authoritative; it is reference only.

**Quality is the deliverable.** This repo is meant to be published. A stranger must be able to
fork it, run it, understand it, and be glad they did — clean, modular, documented, organised.
No slop. This outranks speed.

## Status: charted, ready to build

**Charting is complete.** Eighteen decision tickets were resolved; the architecture is settled and
the roadmap is written. The way is clear, and implementation of **C1** may begin — see
[`docs/roadmap.md`](docs/roadmap.md) for what it contains and in what order.

C1 starts with a hard prerequisite: **the gate repositories must publish versioned images to GHCR
from CI.** They ship source only today, so `docker-compose` has nothing to pin and nothing is
installable. That is the first line of work, before any Conker code.

**Order of work: architecture and plan → roadmap → build.**

**There are no product versions.** The system ships as a sequence of **roadmap checkpoints**.
Every Conker capability is eventually built; the roadmap decides order, never inclusion.
"Later" never means "cut". Older tickets that say `v1` mean *the first checkpoints*, and `v2`
means *a later checkpoint* — they predate this framing and their substance still stands.

**The architecture must hold the whole system.** Every decision is tested against the end state —
voice, video, avatar, teams, flows, spatial presence — before it is recorded. A decision that only
works for the early checkpoints is not finished.

**Conker is the universal layer and nothing else.** The eight domain products in the idea archive
are **not parts of Conker** — they are among the things Conker will be *asked to build* once it
works. Nothing in this repository designs one.

## Source of truth

**Everything needed to work on Conker is in this repository.** Read in this order:

1. [`CONTEXT.md`](CONTEXT.md) — the vocabulary. Use these words; they are load-bearing.
2. [`docs/architecture.md`](docs/architecture.md) — how the system is shaped. Start here.
3. [`docs/roadmap.md`](docs/roadmap.md) — what gets built, in what order. **C1 is next.**
4. [`docs/adr/`](docs/adr/) — why each hard-to-reverse decision was made. Read the ones that touch
   what you are about to change; contradicting one is allowed, doing it silently is not.
5. [`docs/research/`](docs/research/) — verified findings about the gates and about prior art,
   with `path:line` citations. Facts, not opinions.

Then the concept notes, which are **raw material, not requirements**:

6. [`docs/concept/the-idea.md`](docs/concept/the-idea.md) — the idea and what already exists.
7. [`docs/concept/vision.md`](docs/concept/vision.md) — earlier notes, partly superseded; its
   header says what was corrected.
8. [`docs/concept/features.md`](docs/concept/features.md) — the complete inventory of feature
   ideas. Unordered, uncommitted, unprioritised.
9. [`docs/concept/principles.md`](docs/concept/principles.md) — constraints carried over, all
   open to challenge.

An idea in `features.md` becomes a requirement only when a decision resolves it into one.

The full reasoning behind every decision, including ones too reversible to earn an ADR, lives in
the resolved tickets on the issue tracker — the map's "Decisions so far" is the index.

## Working rules

- Ideas from conversation must be written into a doc or a ticket before they count.
- Never invent a live backend capability from a product idea — mark it planned or blocked
  until a real contract exists.
- Keep the repo root clean. No one-off patch scripts, no orphaned source files, no
  scratch output committed.
- `main` is stable. Work happens on branches.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `alexeybe1kin/conker`, driven via the `gh` CLI;
wayfinder maps and tickets use sub-issues and native issue dependencies.
See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `CONTEXT.md` and one `docs/adr/` at the repo root, both created
lazily by `/domain-modeling`. See `docs/agents/domain.md`.
