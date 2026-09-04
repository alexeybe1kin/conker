# ADR-0006 — Autonomy is an owner-configured policy, not an architectural line

**Status:** Accepted · 2026-09-04 · [issue #5](https://github.com/alexeybe1kin/conker/issues/5)

## Context

`features.md` A10 wants Conker to notice a gap and **build and deploy software on the owner's own
server** as prepared work, and closes by refusing to settle where the line sits: *"Open tension, not
a settled design."*

It pulls against `principles.md` §5 (an approval authorises one exact action, consumed once) and
§10 (no autonomous messaging, posting or spending by default). *"The Companion built and deployed
something on my server because it thought I'd want it"* is either the best feature here or the
worst.

Fixing one line in the architecture would be wrong twice over: the right appetite genuinely differs
between people, and a product strangers will fork and install cannot assume one.

## Decision

**Autonomy is a setting the owner controls — bounded, specific and visible.**

A single global slider would be useless, since reading a file and deploying a service have nothing
in common. Autonomy is configured **per action class**:

| Class | Covers | Default | Configurable |
|---|---|---|---|
| **Observe** | Read, analyse, search memory, draft, propose | Always free | — |
| **Prepare** | Build, stage, write files that are not executed | Free | Can be tightened |
| **Act locally** | Run a service, execute a script, change local state | Approval required | Can be loosened |
| **Act outward** | Send, post, spend, touch an external account | Approval required | Per capability, with a limit |

**The whole nightly engine lives in Observe** — which is why Conker earns its keep before any
permission is granted at all.

**Prepared means built and staged, not running, not reachable** — one approval away, zero surprises.
Preparation that consumes real resources is budgeted and reported; "preparing is free" is true about
consequences, not about resources.

**Act outward is never a toggle.** Enabling it requires, per capability: an explicit separate
confirmation, a hard limit the owner sets, and a permanent indicator in the dashboard. Never offered
during onboarding, never enabled by a single click. The asymmetry is deliberate — local mistakes are
recoverable, sent messages and spent money are not.

**Some things are not settings.** `principles.md` §10's refusals never appear in configuration: no
impersonation, no fake engagement, no offensive security capability, no covert recording, no
experiments involving harm; Conker always identifies itself as AI. A safety story that can be
switched off is decoration.

## Consequences

**§5 survives intact.** Raising a level does **not** create a standing approval — it changes *which
class of action requires one at all*. When an approval is required it still binds to an exact
object, version, argument digest and nonce, consumed once. The setting decides *whether this class
must ask*, never *how long a yes lasts*. That distinction is the entire reason autonomy can be
configurable without weakening the approval model.

**The policy must be visible and recorded.** The dashboard always answers, in one place and in plain
language, *"what can Conker do right now without asking me?"*. Every change is written to execution
history with what changed and when. Permissions that drift silently are permissions nobody can
trust, in a product whose value rests on being trusted with a server.

**A quietness budget is still needed**, separately from permission: a ceiling on unprompted contact,
and rules for what interrupts now versus what waits for the next briefing versus what is only
logged. Proactivity that becomes noise gets switched off entirely, which costs more than being
slightly too quiet.
