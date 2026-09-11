# Conker design system

React 19, TypeScript, Vite, Tailwind v4 and shadcn's Radix components. This package
contains the foundation and a fixture gallery. It has no dashboard shell, Chat
screen, service client, credentials, fetch calls or remote fonts.

## Run and check

Node 22.12 or newer:

```sh
cd design-system
npm install
npm run dev
```

Open the localhost URL. Every example is explicitly a fixture; a green example
does not claim a running service was checked.

```sh
npx playwright install chromium
npm run check
npm run build
npm test
npm run test:mutations
```

**Dependency validation still required before merge:** this session installed from
cached npm tarballs because shell HTTPS was unavailable. The lockfile lacks some
optional native packages for Linux/macOS. On a networked machine, regenerate it
from `package.json` in a clean temporary directory with `npm install
--package-lock-only`, replace this lockfile, then verify `npm ci` and the commands
above on Linux. Do not treat this Windows build as proof of a clean Linux install.

Tests compare actual computed browser colors, including a nested `.dark`
container. The mutation drill replaces `@theme inline` with `@theme`, bypasses
evidence validation, and disables expiry. Each must fail its behavioral assertion;
a launch or compilation failure does not count. The drill restores the sources
after each mutation. Run it in a worktree nobody else is editing.

Tests use port 4178 and reuse a local fixture server outside CI. On Windows, if
automatic server teardown hangs, run `npm run dev -- --port 4178 --strictPort` in a
separate terminal before testing. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` optionally names
an already installed Chromium executable. Otherwise Playwright uses its own
download. This session used installed Chromium 151.0.7922.34.

## Consume

Import `src/styles.css` once at the application entry point, then import components
from this package. The source exports are intended for a Vite/TypeScript consumer;
the gallery's `dist/` is not a precompiled component library.

```tsx
import { Status, ThemeProvider, ThemeToggle } from "@conker/design-system"
import { Button } from "@conker/design-system/ui/button"
import "@conker/design-system/styles.css"

<ThemeProvider initialTheme="light">
  <ThemeToggle />
  <Status evidence={{ state: "empty", detail: "No conversations yet." }} />
  <Button>Start a conversation</Button>
</ThemeProvider>
```

Use one root `ThemeProvider`. It themes the document, including Radix portals.
The provider does not fetch or persist preferences; the future owner interface
can supply its initial theme. Layout classes may compose components, but color
and typography belong to this package.

## Status contract

`Status` is the single status renderer. It always shows a word and an icon;
meaning never depends on color alone. Reasons and ages are visible, not hidden in
tooltips. It does not announce every second through an ARIA live region.

| State | Required evidence |
| --- | --- |
| `live` | Public source label, ISO check time, positive `staleAfterMs` |
| `stale` | Public source label and ISO check time |
| `degraded`, `offline`, `blocked` | A reason in `detail` |
| `empty`, `planned`, `unknown` | Optional `detail` |

Expired live evidence becomes stale automatically. Missing source, invalid or
future time, or invalid freshness policy becomes unknown. One shared clock keeps
all mounted statuses aging; it stops when the last status unmounts. Empty has a
different label, icon, border treatment and color pair from degraded.

This is a rendering contract, not verification of a service. The future boundary
adapter must supply actual check evidence, normalize transport vocabularies and
redact sensitive source details. Never translate `configured: true` into live.
No backend adapter is invented here.

## Tokens and registry ownership

`src/styles.css` owns OKLCH semantic pairs in `:root` and `.dark`, including all
eight status pairs, type families, radius, charts and sidebar roles. References
are mapped through `@theme inline`. Tailwind's named color palette is disabled.
`npm run check` rejects literal colors and font families in components/fixtures.

All eleven requested primitives came from shadcn's `new-york-v4` registry:
button, card, dialog, sheet, input, field, badge, table, tabs, tooltip, skeleton.
Label and separator are field dependencies. `registry-provenance.json` records
source URLs, retrieval details and original source hashes.

Shell registry requests failed with EACCES. The GitHub connector could read the
official registry sources; these were assembled into a local registry item and
installed with `shadcn add`. No primitive was handwritten. Local adaptations:

- The CLI rewrote registry imports to this package's component paths.
- Destructive button/badge foregrounds use `destructive-foreground` instead of
  `text-white`; dialog/sheet backdrops use `overlay` instead of `bg-black/50`.
- Explicit dark color overrides were removed so the semantic palette controls
  both themes. Radix behavior and component composition remain upstream.
- Formatting follows the package's Prettier configuration.

Conker owns `Status`, the shared aging clock, theme controls, the palette,
fixtures and verification. `cn` is the registry's actual npm dependency, not a
locally rewritten utility.

CLI 4.21.0 rejects a top-level `base` key. `style: "new-york"` with Tailwind v4
selects the Radix `new-york-v4` registry; all installed primitives import
`radix-ui`. `tailwind.baseColor` is empty because Conker owns the palette and must
not fetch/apply a stock palette during imports. Changing styles does not migrate
existing component source.

With shadcn CLI 4.21.0 installed, `npm run registry:build` creates the local
`public/r/conker-foundation.json` distribution from `registry.json`. It is not
published. Consumers import its `src/styles/conker.css` once; registry installation
does not wire a product entry point. Keep local token adaptations when reviewing
future registry updates.
