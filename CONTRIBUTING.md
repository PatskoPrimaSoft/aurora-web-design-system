# Contributing

Start with the relevant [design rules](docs/design.md) and component card.
Consumer setup belongs in [the usage guide](docs/usage.md); this file describes
changes to the design system itself.

## Development

Use Node 22 through mise. Run commands from the repository root:

```bash
mise exec -- npm ci
mise exec -- npm run dev
```

The catalogue runs at http://127.0.0.1:5173 and rebuilds when sources change.

| Source | Purpose |
|---|---|
| `tokens/source.json` | Token values, roles and scopes; follow the [naming rules](docs/tokens.md) |
| `styles/` | Shared styles |
| `components/src/` | Component implementations |
| `components/<Name>/` | Declarations, README and preview with `@dsCard` metadata |
| `docs/` | Usage, design, token naming, migration and release guides |

The catalogue discovers previews automatically and derives API props from public
sources and declarations. A prop change updates the implementation, `.d.ts` and
`@dsCard` together. Preserve public names, paths, CSS variables and behaviour.

## Checks

`npm test` builds the project and runs lint, UI, package and release-guard checks.
`npm run verify` also checks the catalogue, documentation links, browser CSS cascade
and installed tarball consumers. Before the first full run, prepare Chromium and
consumer caches (this preparation uses the network):

```bash
mise exec -- npx playwright install chromium
mise exec -- npm ci --prefix tests/consumers/angular-base
mise exec -- npm ci --prefix tests/consumers/angular-charts
mise exec -- npm ci --prefix tests/consumers/angular-legacy
mise exec -- npm run verify
```

For Angular alone: `mise exec -- npm run build`, then
`mise exec -- npm run check:angular` to check the built tarball.
`npm run check:names` checks token names, ladders, status slots and uniqueness.

For every affected example, apply the [screen acceptance criteria](docs/usage.md#приёмка-экрана):
four theme/appearance/density combinations, AXE, keyboard focus and loading states.
Use the [copy rules](docs/design.md#язык-и-тексты) as well.

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

New and reworked component pages follow the [component page standard](docs/component-pages.md),
with `DsCheckbox` as the reference and `layout="component"` in `@dsCard`.
The shared catalogue renders examples, usage, one code example, generated props
and component tokens on the same page. Do not duplicate API tables in README files.

README is the entry point; each guide owns one subject. Link to an existing rule
instead of repeating it. Component READMEs hold usage and design decisions;
generated API pages show checked props. Keep guide links and package documentation
in sync when moving files.

Completed plans live in `docs/plans/` and `docs/superpowers/`; migration notes are
in `assets/notes/`. The historical presentation is in `templates/leadership-deck/`.
These record past decisions; current instructions are the guides linked above.
