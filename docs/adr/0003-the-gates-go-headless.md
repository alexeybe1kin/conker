# ADR-0003 — The gates go headless; Conker's dashboard is the only UI

**Status:** Accepted · 2026-09-04 · [issue #18](https://github.com/alexeybe1kin/conker/issues/18)

## Context

MemoryGate and ToolGate each ship their own React dashboard, built separately. They do not look like
the same product because they were not built as one, and anyone installing Conker notices in the
first minute. The quality bar — *a stranger must fork it, run it, and be glad they did* — is not met
by a system that looks assembled from parts.

The obvious fix, restyling three UIs to resemble each other, is discipline-based: it must be
maintained forever across three release cycles, and it decays the first time someone is in a hurry.

There is also a hard constraint that removes the choice. `principles.md` §3 keeps credentials and
host detail off the browser, which Conker implements as **the dashboard talks only to Pi**. A gate
dashboard calling its own gate directly violates that rule. The existing dashboards cannot survive
in the composed product regardless of how they look.

## Decision

**The gates become headless. Conker's dashboard is the only UI an owner installs.**

Their function moves into Conker's dashboard as screens — Memory, Tools, System — reading through
Pi. The dashboards stay in their own repositories as **standalone development surfaces**, clearly
marked, because each gate must remain runnable and inspectable on its own.

The design system lives as a package **in this repository**. With one consumer there is no
cross-repo publishing and no version skew; if a second real consumer ever appears, publish it then.

Every module additionally presents identically from outside — same README sections, same `/health`
shape, generated OpenAPI, same changelog and config discipline — **enforced in CI**, including a
lint rule that fails the build on a raw hex value or font-family in application code.

## Consequences

**One product by construction, not by discipline.** There is nothing to keep in sync because there
is only one surface.

**Work already built gets shelved.** Two dashboards leave the product. This is the real cost and it
is accepted: the alternative is three UIs to synchronise forever.

**A gate must stay independently runnable.** If a gate becomes usable only inside Conker, the
boundaries were never as clean as the architecture claims. The standalone dev dashboards are the
practical test of that.

**Naming stays semantic.** The three boundaries end in `-Gate` because that is what they are. Pi is
the runtime passing *through* them and deliberately does not take the suffix — a scheme where the
name says what a thing is beats one where everything merely rhymes. Uniformity belongs in frames,
docs, health endpoints and design, not word endings.
