# Browser authentication (B4)

Implementation in progress on `feat/browser-auth`; not yet a deployment claim.

The browser connects to a separate HTTPS gateway. The Pi execution worker has
neither the owner's ToolGate approval credential nor access to the gateway volume.
The gateway volume contains the password verifier, sessions and TLS material and
must be captured by backup. Restore must invalidate sessions before any gateway
can be started. Existing service admin keys remain host recovery credentials.

First setup and a forgotten password are handled from the host terminal. The
password protects browser access to conversations and owner decisions; only a
salted password verifier is stored on this machine. Someone controlling the host
can reset it. A reset cannot recover missing data, vault keys or forgotten content.

No screens are part of B4. Backend requests and an executable mutation drill will
provide the review surface. ToolGate's separate owner endpoint is being handled
in its repository by another instance; there will be no admin-key fallback.
