# ADR-0008 — Own the thin layers; take dependencies only where they carry real weight

**Status:** Accepted · 2026-09-05

## Context

Conker runs unattended on the owner's own server, holds their memory, and — from C4 — can act on
their behalf. Its dependency tree is therefore part of its threat model, not a packaging detail.
`features.md` A9 already names software supply chain ownership as a capability the product must
have: packages, libraries, containers, SBOMs, vulnerabilities, licenses.

The concrete case that forced this to be written down: **Pi needs multi-provider model routing.**
The obvious dependency is a gateway library, and the obvious gateway library is LiteLLM.

**In March 2026, LiteLLM versions 1.82.7 and 1.82.8 were compromised on PyPI in a supply chain
attack.** A library sitting on the path of every model call, holding every provider key, is close to
the worst possible place for that to happen.

This is not an argument that LiteLLM is uniquely unsafe — any widely-used package is a target, and
being compromised once is evidence of attention, not of negligence. It is an argument about **where
a dependency sits**.

## Decision

**Own the thin layers. Take dependencies where they carry real weight.**

Two questions decide it:

1. **How much would we write ourselves?** A provider adapter is a few hundred lines of translation.
   An embedding model, a database, a web framework is not.
2. **Where does it sit?** Code on the path of every credential, every action, or every model call is
   held to a far higher bar than code that renders a chart.

Applied:

| | Decision |
|---|---|
| Provider routing / LLM gateway | **Own it.** Thin adapters in Pi, over OpenRouter and local endpoints. Small, and it sits on the credential path. |
| FastAPI, Pydantic, SQLAlchemy, React | **Depend.** Enormous, mature, and replacing them would be absurd. |
| Embedding model and its server | **Depend**, behind the sidecar contract — so swapping it is a deployment change, not a rewrite. |
| Anything holding provider keys or executing actions | **Own it, or route it through ToolGate.** No exceptions. |

Supporting rules:

- **Pin exact versions**, including container image tags. Never `latest` in anything an owner runs —
  a moving tag is a supply chain attack that needs no attacker.
- **Every dependency added is a decision**, not a convenience. Say why in the commit.
- The **module contract** already requires a changelog per module; dependency changes belong there
  where they are visible.

## Consequences

**Pi carries more code.** Provider adapters, retry and fallback behaviour become ours to write and
maintain. That is the cost, accepted: it is a small surface, and it is a surface that holds keys.

**This reinforces [ADR-0001](0001-build-pi-in-house.md)** from a different direction. That ADR
rejected an adopted runtime because the action boundary could not stay whole. This one says the same
about the credential path — and both point at Pi being ours.

**It is not an excuse to rewrite everything.** The failure mode of this policy is a project that
reimplements a web framework badly. The test is the pair of questions above, applied honestly, and
"we would write four hundred lines" is a very different answer from "we would write forty thousand".

**Revisit if a gateway is ever genuinely needed** — the self-hosted field is Portkey, Bifrost and
LLM Gateway. At that point this ADR is the thing to argue against, with the two questions.
