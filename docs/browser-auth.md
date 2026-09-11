# Browser authentication (B4)

Backend and deployment changes are on `feat/browser-auth`. **Release activation
is gated:** the pinned Pi 0.3.0 image predates the gateway, and ToolGate's owner
channel is still a separate dependency. The installer refuses a stale Pi image.

The browser connects to a separate HTTPS gateway. The Pi execution worker has
neither the owner's ToolGate approval credential nor access to the gateway volume.
The gateway sends approval traffic to ToolGate on a separate internal Docker
network that Pi does not join. Pi and the gateway drop Linux capabilities.
The gateway volume contains the password verifier, sessions and TLS material and
must be captured by backup. Restore must invalidate sessions before any gateway
can be started. Existing service admin keys remain host recovery credentials.

First setup and a forgotten password are handled from the host terminal. The
password protects browser access to conversations and owner decisions; only a
salted password verifier is stored on this machine. Someone controlling the host
can reset it. A reset cannot recover missing data, vault keys or forgotten content.

No screens are part of B4. Backend requests and an executable mutation drill
provide the review surface. ToolGate's separate owner endpoint is being handled
in its repository by another instance; there will be no admin-key fallback.

## Password and recovery, for the owner

Run `./conker auth setup` in the terminal on the machine running Conker. Choose a
passphrase of at least 15 characters; spaces and Russian text are supported.
This protects browser access to your conversations and approval decisions. Conker
stores a salted password verifier in its private `gateway_data` Docker volume,
not your password and not an account on someone else's server.

If you forget it, run `./conker auth reset-password` on that machine. This sets a
new password and signs out every browser. Someone who controls the host can do
the same thing; the password does not protect against that person. A reset cannot
restore lost conversations, lost vault keys, deleted memories or a missing backup,
and cannot undo an action already sent. There is no email recovery service.

`./conker auth revoke-all` signs out every browser without changing the password.
Sessions also expire after 30 minutes without use or after 24 hours in total.
Backup captures the auth database using SQLite's backup API, plus its TLS material
and service configuration. Restore retains the password verifier, invalidates all
browser sessions and stays isolated under the existing recovery hold. Backups from
before B4 remain readable; they do not contain browser authentication data.

## HTTPS and other devices

The default address is `https://localhost:8050`. The local TLS certificate is
self-signed: the browser cannot know that it is yours until you trust it. Export
the **public certificate** from the host with
`./conker auth certificate > conker-local.crt` and import that certificate into
your client's trusted certificate store. Keep the TLS private key on the host.
Browser/OS trust installation is not automated by this patch. Do not enter the
password through HTTP or disable certificate verification to bypass a mismatch.

The local certificate lasts one year. Run `./conker auth renew-certificate`,
then restart the gateway with the normal Compose command and export/trust the new
certificate. A renewal never silently replaces your password or session data.

Tailscale membership alone cannot reach a localhost-bound port. Remote use needs
an HTTPS reverse proxy forwarding to the local HTTPS gateway; configure its exact
public browser origin as `GATEWAY_ORIGIN`. Preserve that origin as the Host and
Origin headers, trust the gateway certificate on the proxy, and leave the worker
unpublished. Forwarded scheme/IP headers cannot authenticate a request. Automatic
remote HTTPS setup and a browser trust wizard are outside this backend patch.

## Rollout and review

1. Review and publish the Pi branch as a versioned image; update `PI_VERSION` in
   `versions.env` to that published version. The existing 0.3.0 pin is deliberately
   unchanged; inventing an unpublished release tag would conceal a broken install.
2. Re-run `./install.sh`. It preserves the runtime credential and writes its hash
   for Pi, starts the separate gateway, and reports password setup as degraded
   until the host setup command is completed. No admin key is placed in the browser.
3. Have ToolGate issue a credential for `GET /v2/owner/requests` and
   `POST /v2/owner/requests/{id}/decision`, using `X-ToolGate-Owner-Key`.
   Set it as `GATEWAY_TOOLGATE_OWNER_KEY` in the host `.env`, then recreate only
   the gateway. This is an operator provisioning step pending ToolGate's contract;
   the installer preserves an existing value and never manufactures a replacement.
4. Complete a real approval round trip and prove that Pi's execution key is denied
   on the owner endpoint before closing B4. Missing owner configuration returns
   503; there is no admin-key fallback.

For a source review before publishing, build `../gates/pi` with a distinct local
image tag and use a temporary Compose override for **both** gateway and Pi. Do not
retag the old published 0.3.0 image or present this as testing the pinned release.
Deployment tests run the real `docker compose config` CLI without starting services.
`python scripts/auth_mutation_drill.py` tests missing auth capture, revived sessions,
owner credentials or auth storage leaking into Pi, and publishing the worker port.
The real Docker recovery drill also checks browser-session invalidation; it requires
Linux with Docker and `CONKER_RECOVERY_DOCKER=1`.
