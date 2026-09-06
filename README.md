# Conker

Your own AI companion, running on your own machine. It talks, it remembers, and every action it
takes passes a boundary you control.

Nothing here calls home. There is no account, no hosted service, and no public-internet path at
all — not as a setting, but by construction.

```bash
curl -fsSL https://raw.githubusercontent.com/alexeybe1kin/conker/main/install.sh | bash
```

That is the whole installation. It checks the machine, asks three questions in plain words,
generates every secret itself, pulls pinned images, starts them, tells you honestly which services
came up, and prints one URL.

---

## What you need

- **Linux or macOS.** On Windows, install inside WSL2.
- **Docker** with Compose v2. The installer says how to get it if you do not have it.
- **~20GB of disk**, mostly for local models.
- **6GB of memory** for the default model. Less is fine — the installer notices and picks a smaller
  one rather than letting you find out by running out.

No API key is required. No payment is required. Conker runs entirely on your machine by default,
and only reaches a hosted model if you give it a key and ask it to.

## What gets installed

Five services, each its own module with its own repository, composed into one product.

| | What it is |
|---|---|
| **Pi** | The runtime. Turns, sessions, model routing, execution history. **The only service your browser talks to** — which is what keeps keys and host paths off the client. |
| **ToolGate** | The action boundary. The only thing that can *do* anything, and the only thing that can approve it. |
| **MemoryGate** | The memory boundary. What Conker knows about you, as evidence with citations. |
| **SystemGate** | Read-only observation of the machine. |
| **Embeddings** | Turns text into vectors so memory can be searched by meaning, in any language. |

Plus PostgreSQL, Qdrant, Ollama and SearXNG, all pinned by digest.

Each gate stays independently forkable and runnable on its own — see
[ADR-0003](docs/adr/0003-the-gates-go-headless.md). This repository is how they become one thing.

## After it is running

```bash
./conker status      # is it working, and what is not
./conker tailscale   # reach it from your phone or laptop
./conker backup      # copy everything to your backup folder
./conker logs pi     # what a service has been saying
./conker update      # pull the pinned versions and restart
```

## Three promises, and what they cost

**It tells you the truth about itself.** A service that is degraded says `degraded` and says why. A
value it cannot determine is `unknown`, never a plausible-looking default. A cost it cannot know is
blank, never `0`. This is the failure the whole product exists to avoid, so it is enforced in code
rather than promised in documentation.

**It never acts without a boundary.** Pi executes nothing itself. Every action goes through
ToolGate, which binds an approval to one exact action — that object, that version, that argument
digest, that nonce — and consumes it once. There is no "always allow", because the whole value of
the boundary is that it is asked every time.

**Your data does not leave.** Every port binds to `127.0.0.1`. Conker will not bind to `0.0.0.0`
for you, and `conker tailscale` builds a private network between your own devices instead of
opening a door in front of everyone else's.

## Where your data lives

In Docker volumes on this machine, and copied to the backup folder you chose during install.

**That folder is the only copy.** It holds your conversations, everything Conker remembers, and
`.env` — which contains the keys to the encrypted vault and the database. Losing `.env` means
losing access to your own data. Put the folder somewhere that is not this machine.

## Configuration

`.env` is written by the installer and is not meant to be edited by hand; re-running `./install.sh`
repairs it and keeps every key it already has. Image versions live in
[`versions.env`](versions.env), pinned exactly — never `latest`, for anything you run.

Precedence is the same everywhere: **environment → file → default**.

## Understanding it

- [`CONTEXT.md`](CONTEXT.md) — the vocabulary. These words are load-bearing.
- [`docs/architecture.md`](docs/architecture.md) — how the system is shaped.
- [`docs/roadmap.md`](docs/roadmap.md) — what is built, and in what order.
- [`docs/adr/`](docs/adr/) — why each hard-to-reverse decision was made, and what it cost.

## Licence

MIT.
