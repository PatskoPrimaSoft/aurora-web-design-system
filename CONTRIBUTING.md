# Contributing

Start with the relevant [design rules](design-system/docs/design.md) and component card.
Consumer setup belongs in [the usage guide](design-system/docs/usage.md); this file describes
changes to the design system itself.

Angular UI kit development follows [its component rules](ng-ui-kit/docs/development.md).
The library compiler is Angular 19.2.25 with TypeScript 5.8.3. Installed consumers
verify Angular 19.2.25 and 20.3.34. Do not expand compatibility by changing peer
dependencies alone; add a real tarball/AOT consumer check.

## Development

Use Node 22 through mise. Run commands from the repository root:

```bash
mise exec -- npm ci
mise exec -- npm run dev
```

The catalogue runs at http://127.0.0.1:5173 and rebuilds when sources change.

| Source | Purpose |
|---|---|
| `design-system/tokens/source.json` | Token values, roles and scopes; follow the [naming rules](design-system/docs/tokens.md) |
| `design-system/styles/` | Shared styles |
| `design-system/components/src/` | Component implementations |
| `ng-ui-kit/src/` | Angular integration and future standalone UI components |
| `design-system/components/<Name>/` | Declarations, README and preview with `@dsCard` metadata |
| `design-system/docs/` | Usage, design, token naming and migration guides |
| `docs/` | Release guide and implementation plans |

The catalogue discovers previews automatically and derives API props from public
sources and declarations. A prop change updates the implementation, `.d.ts` and
`@dsCard` together. Preserve public names, paths, CSS variables and behaviour.

## Checks

Browser tests prepare one catalogue in a unique `.tmp/migration/browser-run-*`
directory per Playwright invocation. They do not require an existing root `site/`.
Use `siteRoot()` and `catalogueCards()` from `tests/helpers/browser-snapshot.mjs`
for scenarios that read the catalogue. Do not build it again inside those tests.
Teardown checks that the shared sources, site and pinned baseline stayed unchanged.

Tests that edit a generated page must copy it with `copyTree()` into
`testInfo.outputPath(...)`; use that location for screenshots and other diagnostics
as well. Dev-server tests keep independent `fixtureRoot()` source trees because
rebuilding and recovery are the behaviour under test.

For example, run a single scenario with
`mise exec -- npx playwright test tests/browser/menu.spec.js`.
The compatibility configuration prepares its own catalogue:
`mise exec -- npx playwright test --config=playwright.compat.config.mjs`.
The default remains one worker. Isolated scenarios can also be checked with
`--workers=2`; do not restore writes into shared paths when adding tests.

`npm test` builds the project and runs lint, UI, package and release-guard checks.
`npm run verify` also checks the catalogue, documentation links, browser CSS cascade
and installed tarball consumers. Before the first full run, prepare the browser engines and
consumer caches (this preparation uses the network):

```bash
mise exec -- npx playwright install chromium firefox webkit
mise exec -- npm ci --prefix ng-ui-kit/tests/consumers/angular-19
mise exec -- npm ci --prefix ng-ui-kit/tests/consumers/angular-base
mise exec -- npm ci --prefix ng-ui-kit/tests/consumers/angular-charts
mise exec -- npm ci --prefix ng-ui-kit/tests/consumers/angular-legacy
mise exec -- npm run verify
```

For Angular alone: `mise exec -- npm run build`, then
`mise exec -- npm run check:angular` to check the built tarball.
`npm run check:names` checks token names, ladders, status slots and uniqueness.

For every affected example, apply the [screen acceptance criteria](design-system/docs/usage.md#приёмка-экрана):
four theme/appearance/density combinations, AXE, keyboard focus and loading states.
Use the [copy rules](design-system/docs/design.md#язык-и-тексты) as well.

## Dependency security

The root and all four Angular consumer locks are audited separately. Consumer
fixtures use Angular 19.2.25 / 20.3.34 and ECharts 6.1.0; their development toolchains are part
of the audit too. Update fixtures together with the package and check real tarball
installation/AOT compilation, not just dependency resolution.

One upstream issue currently has no patched release: nested untrusted glob patterns
can exhaust the stack in `braces` 3.0.3, used by Stylelint through `fast-glob` and
`micromatch` ([advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)).
Only use repository-controlled lint patterns; do not expose lint as a service that
accepts external glob input. This affects the development lint process, not the
browser bundle. Recheck the advisory when upgrading tooling; do not downgrade
Stylelint or apply unrelated dependency overrides to silence the audit.

## Browser support

The target is current stable desktop Chrome/Edge (Chromium), Firefox and Safari
(WebKit). Older releases, Internet Explorer, embedded WebViews and mobile browsers
are outside the tested contract. A 390 px viewport checks responsive layout, not
mobile-device certification.

`playwright.compat.config.mjs` runs the same behavioral smoke tests in Chromium,
Firefox and WebKit: keyboard menus, select validation/submission/reset, popovers
inside dialogs and Escape/focus handling, four theme/density scopes, and narrow
contents navigation without horizontal overflow. The Playwright version in the
lockfile pins the actual engine builds. Update Playwright and reinstall all three
engines when checking a new browser generation.

Playwright WebKit is an engine-level check, not a test of the shipping Safari app
or its macOS integration. Changes to browser-sensitive features need a manual
check in current Safari on macOS before claiming Safari certification. Likewise,
the bundled Chromium check does not certify every Chrome/Edge integration.

Run the short cross-engine suite independently after building:

```bash
mise exec -- npm run build
mise exec -- npm run build:catalog
mise exec -- npx playwright test --config=playwright.compat.config.mjs
```

`npm run verify` includes this suite. CI installs all engines with their Linux
dependencies (`playwright install --with-deps chromium firefox webkit`). The full
browser suite and raster baselines retain their existing Chromium configuration;
pixel comparisons are not shared across engines. Failed smoke tests retain traces
in `.tmp/browser-compat-results/`, included in CI failure artifacts.

## Pull requests

- Branch from `develop`; keep one concern per PR. Commit messages are in English.
- Add a consumer-facing line under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md).
- Label the PR `major` / `minor` / `patch` using the [version policy](docs/release.md#versioning).
- Colour only through tokens, dimensions in px, external spacing owned by the parent.

## Generated files

`npm run build` creates `dist/`, `site/`, compatible token CSS/JSON, scoped CSS
and component bundles. Edit their source files, never generated copies.

## Releasing

Follow [versions and publishing](docs/release.md). Agent restrictions are in
[AGENTS.md](AGENTS.md).

## Documentation

New and reworked component pages follow the [component page standard](design-system/docs/component-pages.md),
with `DsCheckbox` as the reference and `layout="component"` in `@dsCard`.
The shared catalogue renders examples, usage, one code example, generated props
and component tokens on the same page. Do not duplicate API tables in README files.

README is the entry point; each guide owns one subject. Link to an existing rule
instead of repeating it. Component READMEs hold usage and design decisions;
generated API pages show checked props. Keep guide links and package documentation
in sync when moving files.

Completed plans live in `docs/plans/` and `docs/superpowers/`; migration notes are
in `design-system/assets/notes/`. The historical presentation is in `design-system/templates/leadership-deck/`.
These record past decisions; current instructions are the guides linked above.
