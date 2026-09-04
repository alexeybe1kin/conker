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

## Status: planning, not building

Nothing is being implemented yet. The project is being charted with the `wayfinder` skill:
a map of decision tickets on the issue tracker, resolved one at a time until the route is
clear. Do not write implementation code until the map says the way is clear.

**Order of work: architecture and plan → roadmap → build.**

**There are no product versions.** The system ships as a sequence of **roadmap checkpoints**.
Everything in the idea archive is eventually built; the roadmap decides order, never inclusion.
"Later" never means "cut". Older tickets that say `v1` mean *the first checkpoints*, and `v2`
means *a later checkpoint* — they predate this framing and their substance still stands.

**The architecture must hold the whole system.** Every decision is tested against the end state —
voice, video, avatar, teams, flows, spatial presence, the eight domain products — before it is
recorded. A decision that only works for the early checkpoints is not finished.

## Source of truth

Read in this order:

1. Resolved wayfinder decision tickets (the map's "Decisions so far") and the map's Notes.
2. [`docs/concept/the-idea.md`](docs/concept/the-idea.md) — **primary.** The idea, and what
   already exists. Supersedes the three notes below wherever they disagree.
3. [`docs/concept/vision.md`](docs/concept/vision.md) — earlier notes: the experience, the
   four boundaries, the ownership rule. Partly superseded; header says what was corrected.
4. [`docs/concept/features.md`](docs/concept/features.md) — complete inventory of every
   feature idea. Unordered, uncommitted, unprioritised.
5. [`docs/concept/principles.md`](docs/concept/principles.md) — constraints carried over,
   all open to challenge.
6. [`docs/research/`](docs/research/) — verified findings about the gates and about prior art.

The concept docs are **raw material, not requirements**. An idea in `features.md` becomes
a requirement only when a decision ticket resolves it into one.

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
