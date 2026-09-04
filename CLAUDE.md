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

## Engineering rules

These exist because the quality bar is the deliverable. A stranger forks this repo and has to be
glad they did — that is a property of the code, not of the README.

### Definition of done

A change is done when **all** of these are true. Not most.

1. It works, and you have **run it** — not reasoned that it should work.
2. Tests cover the behaviour, and they fail if the behaviour breaks.
3. The module still satisfies its contract: `README.md` current, `/health` unchanged in shape,
   `openapi.json` regenerated, `CHANGELOG.md` updated if the contract moved.
4. No new raw hex value or font-family in application code — colour and type come from the design
   system, always.
5. Nothing left behind: no commented-out code, no `TODO` without an issue number, no debug prints,
   no scratch files.

### Testing

Test the **boundary**, not the implementation. Every module's contract operations get tests; a test
that breaks when you rename a private function is a liability, not coverage.

Three things must always be tested because they are the things that silently rot:

- **The degraded path.** Every contract can report degraded, and callers must handle it. A service
  that only has a happy-path test will lie to the owner the first time a dependency is down.
- **Approval binding.** An approval is consumed exactly once. Replays fail closed. Test the replay.
- **Append-only history.** Nothing rewrites an earlier turn.

Do not mock what you can run. The gates ship `docker-compose` for exactly this reason.

### Code

Python 3.11+, FastAPI, `ruff` for lint and format, type hints on anything crossing a module
boundary. React with TypeScript for the dashboard. Match the surrounding file's style over any
personal preference — a diff that reformats unrelated lines is a bad diff.

Configuration precedence is the same everywhere: **environment → file → default**, documented.
Errors share one shape across every service, so the dashboard renders failures uniformly.

**Secure by default, or refuse to start.** A service with no key configured does not fall back to
open; it exits with an error naming the exact fix. This rule already has one scar behind it — see
[ADR-0005](docs/adr/0005-toolgate-is-the-only-action-path.md).

### Truthful status applies to code

`principles.md` §1 is not only about the UI. A function that cannot determine a value returns
`unknown`, never a plausible default. A health check that cannot reach its dependency reports
`degraded` with the reason, never `ok`. A cached value carries its age.

Silent fallbacks are the failure this whole product exists to avoid. If you find yourself writing
one, that is the bug.

### Git

Branch per unit of work, named `<type>/<subject>`. `main` stays green. Commit messages say **why**,
not what the diff already shows. Never skip hooks.

### When you disagree with a decision

The ADRs are decisions, not scripture — but they were expensive, and each records what it cost.
Contradicting one is allowed; doing it silently is not. Say which ADR, say why it is wrong, and
write the replacement decision down before the code that assumes it.

## Agent skills

### Reach for these

Not a list of what exists — a list of what this project's work actually needs.
**What to install and when is in [`docs/agents/toolchain.md`](docs/agents/toolchain.md)** — install
a server when the work needs it, never in advance, and keep the total under five.

| When you are | Use | Why it matters here |
|---|---|---|
| Writing anything that calls a model — Pi's turn loop, routing, caching, cost | **`claude-api`** | Model IDs, pricing, caching and tool-use shapes drift fast. Answering from memory produces code that is subtly wrong and expensive. Non-optional for Pi. |
| Designing a screen or the onboarding tour | **`mobbin` MCP** + **`design`** | Mobbin searches real shipped app flows and screens — reference before invention. `design` produces an editable multi-artboard canvas to react to before any code exists. |
| Unsure whether a state model or a flow feels right | **`prototype`** | Cheap, throwaway, answers the question. Much cheaper than discovering it in C4. |
| A decision needs an outside fact | **`research`** | Findings land in `docs/research/` with citations. See what it produced about the gates and about Hermes. |
| Code exists and is about to be merged | **`code-review`**, then **`security-review`** | The quality bar is the deliverable, and this product holds someone's whole life on their own server. |
| Claiming a change works | **`run`** | Launch it and look. "Should work" is not done — see the definition of done above. |
| Terminology is drifting | **`domain-modeling`** | `CONTEXT.md` is the vocabulary. Update it when a term resolves, do not batch it. |
| Stress-testing a plan before committing | **`grilling`** | Every decision on this project went through it, which is why the ADRs have real trade-offs in them. |

### Issue tracker

Issues live as GitHub issues in `alexeybe1kin/conker`, driven via the `gh` CLI;
wayfinder maps and tickets use sub-issues and native issue dependencies.
See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `CONTEXT.md` and one `docs/adr/` at the repo root, both created
lazily by `/domain-modeling`. See `docs/agents/domain.md`.
