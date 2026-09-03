# Project Rules

## What this is

A self-hosted personal AI companion and control plane. **The product has no name yet** —
`companion` is a working codename and the repo will be renamed once naming is decided.

This is a **clean-slate rebuild**. A prior prototype existed under a different brand; only
its *ideas* were carried forward. No code, architecture, infrastructure, or naming from it
is inherited or authoritative.

## Status: planning, not building

Nothing is being implemented yet. The project is being charted with the `wayfinder` skill:
a map of decision tickets on the issue tracker, resolved one at a time until the route is
clear. Do not write implementation code until the map says the way is clear.

## Source of truth

Read in this order:

1. Resolved wayfinder decision tickets (the map's "Decisions so far").
2. [`docs/concept/vision.md`](docs/concept/vision.md) — the one-sentence idea, the
   experience, the four boundaries, the ownership rule.
3. [`docs/concept/features.md`](docs/concept/features.md) — complete inventory of every
   feature idea. Unordered, uncommitted, unprioritised.
4. [`docs/concept/principles.md`](docs/concept/principles.md) — constraints carried over,
   all open to challenge.

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

Issues live as GitHub issues in `alexeybe1kin/companion`, driven via the `gh` CLI;
wayfinder maps and tickets use sub-issues and native issue dependencies.
See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `CONTEXT.md` and one `docs/adr/` at the repo root, both created
lazily by `/domain-modeling`. See `docs/agents/domain.md`.
