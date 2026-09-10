# Open issues

Everything unresolved, in one place, one line each. Fix, tick, repeat.

The design was settled on 2026-09-10 in a two-engineer review. Section A is now decisions rather
than questions; what remains is building them.

---

## Closed

**Philosophy (2026-09-08)** — attention accounting · waste as a judgement · belief revision ·
five safety layers · engine general / domains yours · sovereignty vs confidentiality · being wrong
about you · promised vs not promised.

**Verified rather than assumed** — `@theme inline` was recorded backwards · Radix chosen over a
release-candidate Base UI (ADR-0009) · **all nine containers total 704 MB**, so the service split
is nearly free and stays · the model is 4–5× the entire rest of the stack.

---

## A. Decided

| # | Decision |
|---|---|
| **A1** | **Conker may never modify itself, its gates, or its own permissions.** Anything it builds runs with its own keys, never Conker's. |
| **A2** | **ToolGate's AI layer dies** — `/v2/ai/*`, `planner.py`, `research.py`. Pi becomes the only thing that thinks. No dormant second engine behind a flag. |
| **A3** | **Money and calendar keep a hard owner-approval floor.** No tier and no grant overrides it. |
| **A4** | **SystemGate stays a service, loses the Docker socket.** A fixed collector publishes a sanitised snapshot; it accepts no agent-supplied commands, paths or queries. |
| **A5** | **Proposal lifetime and execution authority are separate records.** A proposal stays reviewable ~7 days; approving it mints a **120-second** single-use execution token. Not one stretched clock. |
| **A6** | **Sensitivity is structured effect metadata on the tool** — external communication, money, deletion, public exposure, credential access — never a score an agent's level can outrank. |
| **A7** | **Three tiers, one chain.** `identity → scope → operation limits → grant → live limits → execute`. **Available** runs under a grant. **Ask AI** is a *pre-queue filter* that declines slop and duplicates so the owner's list stays clean — it can withhold, never widen, never approve. **Ask User** is the owner on the exact action. |
| **A8** | **Creating a tool is always Ask User.** A new tool is a new power, so approving one is modifying permissions — which A1 forbids anything else from doing. Tool existence and agent scope are **two separate approvals**. |
| **A9** | **Embeddings stops being a service.** It is 197 lines wrapping one call — `POST /api/embed` to Ollama. MemoryGate does it directly, recording model and version per vector so re-indexing is knowable. |
| **A10** | **Approval cards render from structured data, never model prose.** Three layers: glance (icon, effect badge, one line from the tool's own template filled with real arguments) · judgement (the arguments that vary, provenance, reversibility, why you are being asked) · full detail behind `⋯` (exact arguments, digest, grant, budget remaining, executor, destination, both clocks, evidence chain). |
| **A11** | **No 3D, avatars or video.** No GPU. Voice stays a later question. Text and browser only. |
| **A12** | **The autonomy dial is dead.** Replaced by standing grants: subject, operation and version, permitted resources and argument bounds, tier, frequency, aggregate budget, expiry, failure behaviour. |

---

## B. Build — security and recovery first

| # | | |
|---|---|---|
| **B1** | **Coordinated backup implemented; Linux drill required before release** | `fix/backup-and-restore` captures ToolGate's volume/key, PostgreSQL, SQLite through its backup API, runtime/configuration material, models/indexes and image-declared volumes. Required-store checks, vault decryption verification and a complete manifest precede success. See [recovery](recovery.md). |
| **B2** | **Isolated restore implemented; resumption remains blocked** | Fresh volumes, networking disabled, no application startup, pending approvals cancelled, ToolGate locked down, unfinished work held. Exit 3 is an explicit hold. Complete deletion replay needs B3/C2; ambiguous external effects need B6. No automatic promotion or invented reconciliation. Linux/Docker drill must pass before release. |
| **B3** | **Immutable transcripts contradict forgetting** | Pi's triggers `RAISE(ABORT)` on both UPDATE and DELETE, so a message can never be removed — while the philosophy promises forgetting is real. Both cannot be true. Needs a narrow owner-authorised deletion path with a content-free receipt, append-only everywhere else. |
| **B4** | **Browser auth** | One static admin key, held forever, no sessions or revocation. Needs a gateway owning login and server-side sessions: HttpOnly SameSite cookie, CSRF, expiry, logout, revocation. **The owner-approval credential must never be reachable by Pi.** Blocks first-run setup. |
| **B5** | **MCP bridge bypasses everything** | No scope, no identity, whole catalogue. Disable in normal installs; replace with an authenticated bridge on the same scoped path. |
| **B6** | **No durable execution record** | Approval-consumed-once does not cover *the external action succeeded and the receipt was never written*. Needs a stable action ID and a durable dispatch record created **before** dispatch; same ID and arguments returns existing status, different arguments fails. Ambiguous interruption holds as outcome-unknown. Never infer "did not run" from "no receipt". |
| **B7** | **Limits are unenforced by default** | `enforce_usage_limits` works — rate, hourly, cooldown, returning 429 — but every limit defaults to `None`. Tools need finite defaults at registration. Reserve atomically **before** dispatch, across a workflow **and its children**, so budgets cannot be evaded by spawning. Retry does not reset. |
| **B8** | **No provenance on approvals** | Show the owner's originating words beside what Conker wants. Catches the whole injection class by making mismatch visible in a second. Must distinguish owner input from model rationale from external evidence. |
| **B9** | **No spend cap anywhere** | Limits count invocations, never cost. Paid routes stay disabled until a per-job ceiling and cumulative cap are enforceable. Reserve a conservative upper bound before each request; unknown pricing blocks it. Reconcile after. |
| **B10** | **Free ≠ private** | Local-only must be an enforceable setting, and external inference must visibly disclose that data left the machine — per turn. |
| **B11** | **MemoryGate runtime encryption key is unmounted** | `/data/runtime-fernet.key` encrypts provider keys in PostgreSQL but is outside the mounted `/data/backups`. B1 captures it from the original stopped container. Migrate it to persistent storage before recreating that container; adding an empty mount first would hide the surviving key. |

## C. Build — the product

| # | | |
|---|---|---|
| **C1** | **Pi has no MemoryGate integration** | The checkpoint is named "it talks and it remembers". Needs a durable outbox: committed evidence queues under a stable ID, retries cannot duplicate. Retrieval before an applicable turn, tied to that turn. Ingestion failure says *saved, long-term memory pending*; retrieval failure continues while exposing the gap — without depending on the model choosing to mention it. **Not claimed done until it passes end to end in Russian and English.** |
| **C2** | **Memory needs claim semantics** | Claims cite specific evidence and distinguish stated / observed / inferred. Record **when it was true** and **when the system learned it**. Support disputed, superseded, retracted. Derived summaries record their inputs so corrections invalidate them. Postgres checks authorisation and current status before any text leaves; a stale vector must never resurrect deleted content. |
| **C3** | **Interactive latency fails** | 31–103s per turn. Instrument queue wait, model load, prompt processing, first token, generation, tool time. Test `qwen3:4b` with thinking genuinely **disabled** — not hidden — against a small non-reasoning multilingual model. Choose on measurement. |
| **C4** | **Nothing is measured** | Denials, unknown outcomes, approval age and expiry, parse failures, memory lag, retrieval failures, latency, spend reservations, outbound destinations. Starts at B1, not after C6. Do not copy private payloads into a second accidental memory called "logs". |
| **C5** | **No notification path** | An approval nobody sees is an action that silently never happens. Record attempted delivery, actual delivery, and acknowledgement separately. Nothing private on a lock screen. |
| **C6** | **The proactive slice** | Durable schedules and an attention inbox in Pi. Start with server changes, pending approvals, one commitment source. Prepared state on open. |
| **C7** | **Four screens have no backend** | Proposals, Journal, Jobs, half of Memory. Missing backend must be **visibly unavailable**, never a hollow screen. |
| **C8** | **README oversells** | Describes nine screens and a nightly engine that do not exist. Truthful status, broken on the front page. |

## D. Cheap

| # | |
|---|---|
| **D1** | Qdrant → `pgvector`, one less database to run, back up and upgrade |
| **D2** | SearXNG behind a compose profile — 124 MB, only for web search |

---

## The loop

Take the top unticked item, fix it, tick it, add what the fix revealed.
