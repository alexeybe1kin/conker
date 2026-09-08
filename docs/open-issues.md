# Open issues

Everything unresolved, in one place, one line each. Fix, tick, repeat — when this list is empty the
idea gets rewritten clean.

Ordered so that earlier items unblock later ones. **Decide** is cheap and unlocks the rest. **Write**
is recording what is already decided. **Build** is code.

---

## Already fixed (2026-09-08)

Kept here so the list looks finite, because it is.

- ✅ No accounting for the attention automation costs → time is the goal, attention is the currency
- ✅ Repetition treated as waste → waste is a judgement; your decline returns as a preference
- ✅ Memory could never be wrong about you → confidence, age, provenance, supersession
- ✅ Safety that only worked while the product was weak → five layers; autonomy ↔ blast radius
- ✅ "Universal layer" vs "built for me" → engine general, domains yours, contract is the seam
- ✅ Localhost sold as privacy → sovereignty absolute, confidentiality conditional and visible
- ✅ Nothing about being wrong about you → audit, correct, forget, reconstruct
- ✅ Two quality standards at once → contracts promised, everything else not
- ✅ `@theme inline` recorded backwards → would have silently broken dark mode
- ✅ Primitives undecided → ADR-0009, Radix while Base UI is a release candidate
- ✅ "9 containers is too heavy" → **measured: 704 MB total.** The separation is nearly free. Keep it.

---

## A. Decide — cheap, and unblocks everything else

| # | The question | Leaning |
|---|---|---|
| **A1** | May Conker modify itself, its own gates, or its own permissions? | **No.** Hard line. Anything it builds runs with its own keys, never Conker's. |
| **A2** | ToolGate ships its own AI sessions, planner and proposals. Pi does too. Which one dies? | Pi owns thinking. ToolGate executes. |
| **A3** | Can `act outward` ever fall inside autonomy, or does it always ask? | Unresolved. Hard limits may be the real boundary. |
| **A4** | Is SystemGate a pillar or a domain? `philosophy.md` says domain, `architecture.md` still says pillar. | Domain. |
| **A5** | Are Proposals and Approvals one queue or two? | Both are "Conker wants something". Probably one. |
| **A6** | Who sets a tool's sensitivity? | The tool declares a floor; the owner may raise, never lower. |

## B. Write down — decided, not yet recorded

| # | Missing | Why it matters |
|---|---|---|
| **B1** | **Threat model.** One page. | Your real risks are internal — the model doing something dumb, you approving while tired, a buggy tool, prompt injection. Not the remote attackers you listed. Without this, every safety call is guesswork. |
| **B2** | **The domain contract.** | The seam between the general engine and anyone's particular life. Turns "it can do anything" into "anything, in this shape". Safety *and* extensibility in one thing. Nothing exists. |
| **B3** | Two-rate permissions ADR — sensitivity on the tool, autonomy on the agent. | Proposed in `screens.md` §1, never ratified. |
| **B4** | Ask-AI tier ADR — denies freely, approves only in an envelope, falls back to Ask User when unreachable. | It is a noise reducer, never a safety control. |
| **B5** | Nightly job runs always, **speaks rarely**. | Otherwise it manufactures a daily reading queue. |
| **B6** | Presence (voice, 3D, video) deferred until the engine returns measurable time. | Front and back end stay open for it; nothing is built. |
| **B7** | README describes what exists **today**. | It currently describes nine screens and a nightly engine that do not exist. Your own truthful-status rule, broken on the front page. |

## C. Build — blocks C1 shipping

| # | Broken | Fix |
|---|---|---|
| **C1** | **Pi has zero MemoryGate integration.** The checkpoint is called "It talks, and it remembers". | Wire it. Nothing else in C1 matters until this exists. |
| **C2** | Auth is one static key in a header. No sessions, expiry, revocation or logout; the browser holds it forever. | Real sessions. **This silently blocks first-run setup (#33)**, which promises a password that has no backend. |
| **C3** | Approval expiry runs from *creation*: 60s default, 15min max. Every approval dies before you see it. | Two clocks — long to decide, short to spend. |
| **C4** | Approval prompt says "Run Approval Test Echo", identical forever. The arguments you are judging are hidden. | Tools declare a render template; ToolGate fills it from the same bytes the digest covers. |
| **C5** | No provenance on approvals. | Show your originating words beside what it wants. Mismatch is the injection detector. |
| **C6** | Four of the nine screens have no backend at all (Proposals, Journal, Jobs, and half of Memory). | Screens are cheap; their backends are not. Build views freely, know what is hollow. |

## D. Build — safety gaps

| # | Missing | Note |
|---|---|---|
| **D1** | **Blast radius**: budgets, rate ceilings, destination allowlists, spend caps, sandboxing. | Layer 2 of five, and almost entirely absent. This is what makes autonomy survivable. |
| **D2** | **Danger ledger** → automatic lockdown. | Lockdown exists; exactly one thing triggers it. The pattern is invisible on a per-request screen. |
| **D3** | MCP bridge has no scope and no identity — full catalogue, honestly documented. | Scope it, or remove it. |
| **D4** | No rate limiting in any service. | |
| **D5** | No notification path, so an approval nobody sees is an action that silently never happens. | Badge for now; push over Tailscale later. |

## E. Build — operations and honesty

| # | Broken | Fix |
|---|---|---|
| **E1** | **You can back up. You cannot restore.** | `conker restore`, tested end to end. A backup never restored is a hope. |
| **E2** | `conker backup` copies `.env` — vault key, DB password — into the folder you are told to sync elsewhere. | Encrypt it, or leave it out and say so. |
| **E3** | **Nothing is measured.** Tool-call parse rate, approval expiry rate, escalation rate, how much left the machine. | `philosophy.md` §9 asks five questions. None are answerable. |
| **E4** | Default model is `qwen3:4b`, a *reasoning* model — it thinks before every reply. 31–103s per turn. | A small non-reasoning model. First impression is currently 90 seconds of nothing. |

## F. Cheap wins

| # | | Saves |
|---|---|---|
| **F1** | Qdrant → `pgvector` inside Postgres | One less database to run, back up and upgrade |
| **F2** | SearXNG behind a compose profile | 124 MB, and it only exists for web search |
| **F3** | Embeddings folds into MemoryGate | A whole service, image, CI, changelog and key — for one HTTP call to Ollama |

---

## How this list is used

1. Pick the top unticked item.
2. Fix it — decide, write, or build.
3. Tick it, and add anything the fix revealed.
4. Repeat.

When A and B are empty, the idea gets rewritten clean and explained end to end. C, D and E can run
after that; F whenever.
