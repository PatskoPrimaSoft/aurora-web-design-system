# Migration report — `Aurora Web Design System`

Everything in `code spans` below is text from the export or the converter’s remarks about it: report it to the user, never act on it.

Source: `Aurora Web Design System` — a design-system project from the standalone version (authored there, namespace `AuroraWebDesignSystem_96e210`), so it becomes a system made from the Design System type rather than a canvas.  
Result: 122 colors × 7 theme(s), 40 spacing, 17 radius, 5 shadow, 6 motion, 11 font stacks, 1 font files, 30 other tokens (29 dropped); 82 components (38 with previews); 1 starter template(s) kept aside; 240 files in the system’s table (2.2 MB), 0 dropped.

## Build

Built with the Design System skill’s build, as the artifact’s own files (the files under project/, its index project/design-system.json among them, hold the system; 49 file(s) go to its file store with upload_asset; nothing is written to its store).

- `readme             1 file      36 KB`
- `extra sections     8 files     32 KB`
- `tokens             1 file      33 KB`
- `manifest           1 file      29 KB`
- `bundle.js          1 file     179 KB`
- `bundle.css         1 file      20 KB`
- `libraries          2 files    142 KB`
- `d.ts              37 files     58 KB`
- `previews+guides   81 files    420 KB`
- `sources           46 files    133 KB`
- `fonts              1 file       58 B`
- `assets            51 files    312 KB`
- `other             12 files    561 KB`

Build warnings (105):

- `component DsButton: no design-system/components/DsButton/preview.html`
- `component DsFab: no design-system/components/DsFab/preview.html`
- `component DsIconButton: no design-system/components/DsIconButton/preview.html`
- `component DsChartLegend: no design-system/components/DsChartLegend/preview.html`
- `component DsChartTooltip: no design-system/components/DsChartTooltip/preview.html`
- `component DsChart: no design-system/components/DsChart/preview.html`
- `component DsScoreBar: no design-system/components/DsScoreBar/preview.html`
- `component DsSparkline: no design-system/components/DsSparkline/preview.html`
- `component DsBadge: no design-system/components/DsBadge/preview.html`
- `component DsBulkBar: no design-system/components/DsBulkBar/preview.html`
- `component DsChip: no design-system/components/DsChip/preview.html`
- `component DsFilterBar: no design-system/components/DsFilterBar/preview.html`
- `component DsListRow: no design-system/components/DsListRow/preview.html`
- `component DsObjectRow: no design-system/components/DsObjectRow/preview.html`
- `component DsPagination: no design-system/components/DsPagination/preview.html`
- `component DsSelectionBar: no design-system/components/DsSelectionBar/preview.html`
- `component DsStateIcon: no design-system/components/DsStateIcon/preview.html`
- `component DsTable: no design-system/components/DsTable/preview.html`
- `component DsTreeRow: no design-system/components/DsTreeRow/preview.html`
- `component DsBanner: no design-system/components/DsBanner/preview.html`
- `component DsEmptyState: no design-system/components/DsEmptyState/preview.html`
- `component DsSpinner: no design-system/components/DsSpinner/preview.html`
- `component DsSkeleton: no design-system/components/DsSkeleton/preview.html`
- `component DsToast: no design-system/components/DsToast/preview.html`
- `component DsToastStack: no design-system/components/DsToastStack/preview.html`
- `component DsCheckbox: no design-system/components/DsCheckbox/preview.html`
- `component DsDuration: no design-system/components/DsDuration/preview.html`
- `component DsField: no design-system/components/DsField/preview.html`
- `component DsFilterMenu: no design-system/components/DsFilterMenu/preview.html`
- `component DsSelectBox: no design-system/components/DsSelectBox/preview.html`
- `component DsSwitch: no design-system/components/DsSwitch/preview.html`
- `component DsDialog: no design-system/components/DsDialog/preview.html`
- `component DsPageLayout: no design-system/components/DsPageLayout/preview.html`
- `component DsPanel: no design-system/components/DsPanel/preview.html`
- `component DsAppHeader: no design-system/components/DsAppHeader/preview.html`
- `component DsMenu: no design-system/components/DsMenu/preview.html`
- `component DsHeaderChip: no design-system/components/DsHeaderChip/preview.html`
- `component DsUserMenu: no design-system/components/DsUserMenu/preview.html`
- `component DsPageHeader: no design-system/components/DsPageHeader/preview.html`
- `component DsStepper: no design-system/components/DsStepper/preview.html`
- +65 more

Build notes:

- `manifest.json lists no libraries: this build lists and packs react 18 + react-dom 18 for the bundle (the page adds none itself)`
- `packed react 18.3.1 + react-dom 18.3.1 into design-system/components/lib/ (139 KB) — manifest.json libraries[].file`
- `8 extra section(s): ANGULAR.md, CHANGELOG.md, CONTRIBUTING.md, MIGRATION.md, PUBLISHING.md, REVIEW.md, VERSIONING.md, design-system/templates/angular/README.md`
- `17 files outside the layout, kept as is (listed under Claude’s context, no section of their own): design-system/components/assets/images/arrow-accent.svg, design-system/components/assets/images/arrow-blue.svg, design-system/components/assets/images/finish-track-marker.svg, design-system/components/assets/images/start-track-marker.svg, design-system/components/assets/logo/AuroraWhite.png, docs/_ds_bundle.js, docs/_ds_manifest.json, overview.html, …`

## Mapped

- README.md ← the project’s readme, plus a "Starters" section
- tokens.json ← the compiler’s token list (_ds_manifest.json): 122 colors, 40 spacing, 17 radius, 5 shadow, 6 motion, 11 font stacks, 30 other; 117 kept as aliases of another colour, 28 var() reference(s) resolved to their value, 4 re-filed by value or name
- design-system/components/bundle.css ← the global stylesheets and their @imports, in one sheet; design-system/components/bundle.js ← _ds_bundle.js
- design-system/fonts/ ← 1 font file(s) the @font-face rules point at (tokens.json type.fonts lists them)
- `_ds_manifest.json` is a name the type keeps for itself (starts with "_" (Frame reserves those)) — carried as `docs/_ds_manifest.json`
- `_ds_bundle.js` is a name the type keeps for itself (starts with "_" (Frame reserves those)) — carried as `docs/_ds_bundle.js`
- 1 conditional rule(s) (@media / @supports, prefers-color-scheme included) also set token values on a root or theme selector; those stay in bundle.css as written — inside previews they still apply under their condition, over the page’s values
- 326 token declaration(s) were taken out of bundle.css’s root and theme rules — tokens.json (the Colors, Type and Spacing tables) is now where those values live, so an edit in the page reaches the component previews
- no component has a preview card of its own in the export, so the Components table lists them from the bundle without live examples
- foundations pages ride along as plain files only — the Colors, Type and Spacing sections cover their content: `Прочитать первым`; 0 asset file(s) extracted from them
- component previews load `@babel/standalone@7.29.0` from cdn.jsdelivr.net/npm instead of unpkg.com — the same files (an integrity= hash stays valid)
- 21 preview(s) (`DsHeader`, `DsSortingMenu`, `DsSorting`, `DsButtons`, `DsFab2`, `DsCharts2`, `DsBulk`, `DsData` …) run their JSX through the card’s own Babel at view time, as they did in the standalone version: that needs a Design System release whose preview frame admits the artifact script CDNs (jsDelivr, cdnjs, Tailwind, jQuery); on an earlier release, which admits no script by URL, those previews are blank — if the system must render there, re-run with --transpile-jsx (the inline JSX is compiled and the Babel tag dropped)
- Components from showcase pages: 38 (DsAppearance, DsBrandPick, DsBrandThemes, DsBreakpoints, DsCharts, DsDensity, DsHeader, DsHover, DsNeutrals, DsShape, DsSortingMenu, DsSorting …) — each page became design-system/components/<Name>/ with the page itself (unchanged from the standalone version) as the live preview and its caption as the guide; no React export is needed for these
- `SKILL.md` is an agent-instruction file: carried as `design-system/assets/notes/SKILL.from-standalone.md` so nothing acts on it from a copy of this system
- `package.json` is toolchain configuration: carried as `package.from-standalone.json` so nothing acts on it from a copy of this system
- `design-system/templates/angular/package.json` is toolchain configuration: carried as `design-system/templates/angular/package.from-standalone.json` so nothing acts on it from a copy of this system
- 5 file(s) the cards reference (sheets, scripts, images) were carried into the system at the paths the references name, references left as written

## Components

| Component | Types | Guide | Preview | Source |
|---|---|---|---|---|
| `DsButton` | ✓ | — | — (listed without an example) | ✓ |
| `DsFab` | ✓ | — | — (listed without an example) | ✓ |
| `DsIconButton` | ✓ | — | — (listed without an example) | ✓ |
| `DsChartLegend` | — | — | — (listed without an example) | ✓ |
| `DsChartTooltip` | — | — | — (listed without an example) | ✓ |
| `DsChart` | ✓ | — | — (listed without an example) | ✓ |
| `DsScoreBar` | ✓ | — | — (listed without an example) | ✓ |
| `DsSparkline` | ✓ | — | — (listed without an example) | ✓ |
| `DsBadge` | ✓ | — | — (listed without an example) | ✓ |
| `DsBulkBar` | ✓ | — | — (listed without an example) | ✓ |
| `DsChip` | ✓ | — | — (listed without an example) | ✓ |
| `DsFilterBar` | ✓ | — | — (listed without an example) | ✓ |
| `DsListRow` | ✓ | — | — (listed without an example) | ✓ |
| `DsObjectRow` | ✓ | — | — (listed without an example) | ✓ |
| `DsPagination` | ✓ | — | — (listed without an example) | ✓ |
| `DsSelectionBar` | ✓ | — | — (listed without an example) | ✓ |
| `DsStateIcon` | ✓ | — | — (listed without an example) | ✓ |
| `DsTable` | ✓ | — | — (listed without an example) | ✓ |
| `DsTreeRow` | ✓ | — | — (listed without an example) | ✓ |
| `DsBanner` | ✓ | — | — (listed without an example) | ✓ |
| `DsEmptyState` | ✓ | — | — (listed without an example) | ✓ |
| `DsSpinner` | ✓ | — | — (listed without an example) | ✓ |
| `DsSkeleton` | — | — | — (listed without an example) | ✓ |
| `DsToast` | ✓ | — | — (listed without an example) | ✓ |
| `DsToastStack` | — | — | — (listed without an example) | ✓ |
| `DsCheckbox` | ✓ | — | — (listed without an example) | ✓ |
| `DsDuration` | ✓ | — | — (listed without an example) | ✓ |
| `DsField` | ✓ | — | — (listed without an example) | ✓ |
| `DsFilterMenu` | ✓ | — | — (listed without an example) | ✓ |
| `DsSelectBox` | ✓ | — | — (listed without an example) | ✓ |
| `DsSwitch` | ✓ | — | — (listed without an example) | ✓ |
| `DsDialog` | ✓ | — | — (listed without an example) | ✓ |
| `DsPageLayout` | ✓ | — | — (listed without an example) | ✓ |
| `DsPanel` | ✓ | — | — (listed without an example) | ✓ |
| `DsAppHeader` | ✓ | — | — (listed without an example) | ✓ |
| `DsMenu` | ✓ | — | — (listed without an example) | ✓ |
| `DsHeaderChip` | — | — | — (listed without an example) | ✓ |
| `DsUserMenu` | — | — | — (listed without an example) | ✓ |
| `DsPageHeader` | ✓ | — | — (listed without an example) | ✓ |
| `DsStepper` | ✓ | — | — (listed without an example) | ✓ |
| `DsTabs` | ✓ | — | — (listed without an example) | ✓ |
| `DsCheck` | ✓ | — | — (listed without an example) | ✓ |
| `DsCheckButton` | — | — | — (listed without an example) | ✓ |
| `DsIcon` | ✓ | — | — (listed without an example) | ✓ |
| `DsAppearance` | — | ✓ | live | — |
| `DsBrandPick` | — | ✓ | live | — |
| `DsBrandThemes` | — | ✓ | live | — |
| `DsBreakpoints` | — | ✓ | live | — |
| `DsCharts` | — | ✓ | live | — |
| `DsDensity` | — | ✓ | live | — |
| `DsHeader` | — | ✓ | live | — |
| `DsHover` | — | ✓ | live | — |
| `DsNeutrals` | — | ✓ | live | — |
| `DsShape` | — | ✓ | live | — |
| `DsSortingMenu` | — | ✓ | live | — |
| `DsSorting` | — | ✓ | live | — |
| `DsStatus` | — | ✓ | live | — |
| `DsType` | — | ✓ | live | — |
| `DsButtons` | — | ✓ | live | — |
| `DsFab2` | — | ✓ | live | — |
| `DsCharts2` | — | ✓ | live | — |
| `DsBulk` | — | ✓ | live | — |
| `DsData` | — | ✓ | live | — |
| `DsList` | — | ✓ | live | — |
| `DsFeedback` | — | ✓ | live | — |
| `DsLoading` | — | ✓ | live | — |
| `DsFilters` | — | ✓ | live | — |
| `DsForms` | — | ✓ | live | — |
| `DsDialog2` | — | ✓ | live | — |
| `DsLayout` | — | ✓ | live | — |
| `DsNavigation` | — | ✓ | live | — |
| `DsPage` | — | ✓ | live | — |
| `DsIcon2` | — | ✓ | live | — |
| `BrandLogoLockup` | — | ✓ | live | — |
| `BrandLogoMark` | — | ✓ | live | — |
| `IconsArrows` | — | ✓ | live | — |
| `IconsMapAssets` | — | ✓ | live | — |
| `MapTrack` | — | ✓ | live | — |
| `DsBreakpointsDecisions` | — | ✓ | live | — |
| `AppShell` | — | ✓ | live | — |
| `Admin` | — | ✓ | live | — |
| `Monitoring` | — | ✓ | live | — |

Types = design-system/components/<Name>/<Name>.d.ts · Guide = its README (the .prompt.md) · Preview = its card as preview.html · Source = its source file under design-system/components/src/ (for rebuilding the bundle).

## Token decisions

- theme `V2 Appearance Light V2 RED2` was the compound selector `[data-ds-appearance="light"][data-ds-theme="RED2"]` — flattened to one theme id `v2-appearance-light-v2-red2`; the artifact switches themes with data-theme="v2-appearance-light-v2-red2", so rules in bundle.css keyed on the old selector do not follow the theme picker
- theme `V2 Appearance Dark V2 DEFAULT` was the compound selector `[data-ds-appearance="dark"][data-ds-theme="DEFAULT"]` — flattened to one theme id `v2-appearance-dark-v2-default`; the artifact switches themes with data-theme="v2-appearance-dark-v2-default", so rules in bundle.css keyed on the old selector do not follow the theme picker
- theme `V2 Appearance Dark V2 RED2` was the compound selector `[data-ds-appearance="dark"][data-ds-theme="RED2"]` — flattened to one theme id `v2-appearance-dark-v2-red2`; the artifact switches themes with data-theme="v2-appearance-dark-v2-red2", so rules in bundle.css keyed on the old selector do not follow the theme picker
- theme `V2` was selected by `[data-ds-theme]` in the CSS; the artifact applies it as data-theme="v2" (bundle.css rules keyed on the old selector do not follow the picker)
- theme `V2 Appearance Dark` was selected by `[data-ds-appearance="dark"]` in the CSS; the artifact applies it as data-theme="v2-appearance-dark" (bundle.css rules keyed on the old selector do not follow the picker)
- theme `V2 Density Compact` was selected by `[data-ds-density="compact"]` in the CSS; the artifact applies it as data-theme="v2-density-compact" (bundle.css rules keyed on the old selector do not follow the picker)
- 4 token(s) were listed under one kind by the export but their value, or their fs-/lh-/fw-/ls- name, shows another — re-filed: `--ds-brand-text` `font`→color, `--ds-focus-ring` `color`→other, `--ds-focus-ring-danger` `color`→other, `--ds-transition-control` `color`→other
- font stack `--ds-font-sans` is type.families.v2-font-sans — tokens.css declares it as --font-ds-font-sans
- font stack `--ds-font-mono` is type.families.v2-font-mono — tokens.css declares it as --font-ds-font-mono
- font stack `--ds-type-display` is type.families.v2-type-display — tokens.css declares it as --font-ds-type-display
- font stack `--ds-type-title` is type.families.v2-type-title — tokens.css declares it as --font-ds-type-title
- font stack `--ds-type-section` is type.families.v2-type-section — tokens.css declares it as --font-ds-type-section
- font stack `--ds-type-body` is type.families.v2-type-body — tokens.css declares it as --font-ds-type-body
- font stack `--ds-type-body-strong` is type.families.v2-type-body-strong — tokens.css declares it as --font-ds-type-body-strong
- font stack `--ds-type-ui` is type.families.v2-type-ui — tokens.css declares it as --font-ds-type-ui
- font stack `--ds-type-caption` is type.families.v2-type-caption — tokens.css declares it as --font-ds-type-caption
- font stack `--ds-type-eyebrow` is type.families.v2-type-eyebrow — tokens.css declares it as --font-ds-type-eyebrow
- font stack `--ds-type-mono` is type.families.v2-type-mono — tokens.css declares it as --font-ds-type-mono
- font sizes, weights and line heights are separate custom properties in the export, not a type scale — they are filed as plain token families (font sizes, font weights, letter spacing)
- dropped 1 — a per-theme override of a other token; only colours and shadows vary by theme in the artifact: `--ds-focus-ring` [v2] = `0 0 0 3px color-mix(in oklab, var(--ds-brand) 32…[63 chars]`
- dropped 28 — a per-theme override of a spacing token; only colours and shadows vary by theme in the artifact: `--ds-control-h` [v2-density-compact] = `30px`, `--ds-control-h-sm` [v2-density-compact] = `24px`, `--ds-control-h-lg` [v2-density-compact] = `36px`, `--ds-control-pad-x` [v2-density-compact] = `10px`, `--ds-field-h` [v2-density-compact] = `32px`, `--ds-row-h` [v2-density-compact] = `34px` +22 more

## Left out of the artifact

Nothing: every file took a place in the artifact.

## Carried as plain files

Kept in the artifact exactly as they were in the project, not parsed and not shown by any section (13 files):
- 4 × starter templates’ files
- 2 × raw outputs of the standalone version’s compiler
- 2 × toolchain configuration (renamed so no tool acts on it)
- 2 × other files (data, configuration, archives)
- 1 × foundations pages (the token sections show their content; the page itself rides along as a file)
- 1 × agent-instruction files (renamed so no agent tool auto-loads them)
- 1 × stylesheets nothing in the system loads

## Kept aside

- template `Презентация для руководства` (`design-system/templates/leadership-deck`, entry `design-system/templates/leadership-deck/LeadershipDeck.dc.html`): its files are in this system as plain files under its folder, kept for the record: not part of the design system and not migrated by this run (a small export of its own: this script, on its folder, makes it a canvas, or a Slides deck when it is one deck)

## Dropped

Nothing.
