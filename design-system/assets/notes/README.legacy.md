# Aurora — Design System

The design system for **Aurora**, the GPS fleet-monitoring product built by
aurora-soft.by. Product context, vocabulary and assets are lifted from
the real frontend source; the visual system is the 2026 refresh.

**One layer.** The legacy recreation of the shipped Angular product (`--color-*`
tokens, `Button`/`FormField`/`Card`, the two portal recreations) was removed in
September 2026. One token set, one component set, one way to build a screen.
`MIGRATION.md` maps the old Angular names — a handoff document, not a design source.

## Start here

1. Link one file: `<link rel="stylesheet" href="styles.css">`.
2. Set the three scopes on the root:
   `<body data-ds-theme="RED2" data-ds-appearance="dark" data-ds-density="compact">`.
   In production Angular the theme equivalent is `<body class="theme-RED2">`.
3. Read a reference screen before building — `copy-a-screen/app-shell.html` for the
   shell wiring, `ui_kits/` for a whole screen. There are no copyable templates.
4. **Colour only through tokens. Sizes only in px.** A hard-coded hex or a `rem`
   in a component is a review failure.
5. **Four renders are the acceptance criteria:** DEFAULT/light/cozy and
   RED2/dark/compact, for every screen, dialog and card.

---

## 1. Sources

| Source | What it gave us |
|---|---|
| `locator-front/` (Angular 19 workspace) | product structure, screens, icons, fonts, logos, the theme mechanism and the brand palettes (two of them — `DEFAULT` and `RED2` — ship here) |
| `locator-front/docs/ui-kit/README.md` | the team's own UI-kit guide — the basis of most component contracts |
| `locator-front/projects/common-module/src/i18n/en.json` (+ 23 locales) | all product copy; the tone reference |
| `locator-front/AGENTS.md`, `CLAUDE.md`, `README.md` | architecture, conventions, code style, i18n rules |

No Figma file, no deck, no brand guideline document. Product copy comes
exclusively from the i18n catalogues.

## 2. Product context

**Aurora** is a GPS/telematics monitoring platform
for commercial fleets: vehicles ("objects" / *units*), drivers, sensors, geofences,
routes, runs, reports, eco-driving scores, video, notifications. Dense, data-first,
desktop-first — closer to an air-traffic console than to a consumer app. Screens
are long-lived: an operator keeps the map open all day.

| Surface | Port | Who uses it | Shape |
|---|---|---|---|
| **user-portal** — Monitoring | 4200 | fleet operators, dispatchers | app header, left object panel, full-bleed map, feature tabs |
| **admin-portal** — Administration | 4201 | integrators, support, resellers | same header, then one big filterable table per entity |
| **common-module** | — | both | buttons, inputs, filters, banners, tables, header shell, themes |

Stack: Angular 19, OpenLayers maps via the in-house `aur-openlayers` library,
Keycloak auth, ngx-translate + Crowdin (23 locales), ECharts for charts.

**Multi-tenant white-labelling is a first-class constraint.** The colour theme and
the per-brand logo are selected at container runtime via `FRONT_BRAND`, not at
build time. Two palettes ship — `DEFAULT` and `RED2`, the brands actually in
production, and the two contrast extremes; since 2026 light/dark and both
densities are extremes too. A new tenant gets its own palette, derived from its real
brand colours; there is no pre-baked set to pick from.

---

## 3. Content fundamentals

Copy lives in `en.json`/`ru.json`, is written by developers, reviewed by support,
and translated into 21 further locales via Crowdin. That pipeline shapes the voice
more than any style guide does.

| Rule | |
|---|---|
| **Register** | Terse, literal, operator-facing. The shortest correct noun or imperative verb. No marketing surface, no marketing voice. |
| **Casing** | Sentence case everywhere — `Add object`, `Move to archive`, `Show / hide invalid data`. Never Title Case; ALL-CAPS only for the logo wordmark and the one eco-driving band label `THE BEST`. |
| **Person** | Impersonal. Bare imperatives for actions (`Save`, `Generate`, `Clear map`), bare declaratives for states (`Driver is not assigned`, `Data not available`). "You" only to explain a permission: `You are not allowed to edit eco-driving parameters.` |
| **Confirmations** | A question with the object in typographic quotes: `Assign “{{driverName}}” to “{{unitName}}”?` Destructive copy states the consequence as a fact instead of asking for bravery. |
| **Errors** | Name the rule, not the blame: `Can not be empty`, `Not valid`, `No data`. Interpolation is `{{amount}}`, `{{entity}}`, `{{value}}`. |
| **Units** | Separate tokens from numbers (`km/h`, `кг`, `сек`, `км`), rendered as a field `suffix` — never baked into a label. |
| **Punctuation** | No terminal period on labels, buttons, table headers, short hints; full sentences in banners and dialogs get one. `/` with spaces for either-or. Ellipsis is rare. |
| **Length** | A hard layout rule: `Save` → `Сохранить` → `Speichern`. Never draw a button tight to the English string. |
| **Emoji** | None, anywhere, in copy or UI. Status is an icon plus colour. |

**Domain vocabulary is fixed and slightly unusual — use it.**

| Say | Not |
|---|---|
| **object** (`Add object`, `Selected objects`) | vehicle, asset — even though the code calls it a `unit` |
| **Generate** (`action.build`) | Build, Create, Run |
| **Move to archive** / **Restore** | Delete |
| **geofence**, **retranslator**, **template set**, **run**, **trip**, **eco-driving**, **violation**, **sensor**, **mechanism**, **norm consumption** | any synonym |

**Card language follows the card's job.** A specification card — anything a
consumer builds from — is English, like the token and component names it
describes. A *decision* card, which exists to stop someone re-opening a settled
argument, is Russian, because its reader is the internal team. Write a new card in
the language of its purpose; do not translate either kind to match the other.

**Languages inside the repo:** commit subjects English; `docs/` prose and in-code
comments Russian; user-facing strings English source + Russian hand-maintained,
the rest machine-synced. Deliverables are commonly bilingual.

---

## 4. Visual foundations

### 4.1 The three scopes

```html
<body data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy">
```

| attribute | values |
|---|---|
| `data-ds-theme` | DEFAULT · RED2 (one block per real tenant — add, never pick) |
| `data-ds-appearance` | light · dark |
| `data-ds-density` | cozy · compact |

All three are independent and inheritable, so any subtree can override them — a
compact table inside a cozy page is one attribute. In production Angular, keep
setting the existing `theme-*` class from `FRONT_BRAND` and map it to the same
custom properties; the white-label mechanism itself does not change.

### 4.2 Colour

- **Brand** — three roles per theme (`--ds-brand` fill, `-subtle` tint, `-border`)
  plus `--ds-brand-text` for ink. **Never use the fill value for text.** There are no
  `-hover` / `-active` brand values: hover and press are the universal ink overlay
  (`--ds-overlay-hover` 10% / `--ds-overlay-press` 16%) on every filled tone.
- **Accent** — attention only, AA-safe via `--ds-accent-on`. Selection controls use
  brand, not accent. Where the accent *is* the mark rather than a ground for text —
  the unread dot, the unread badge — use `--ds-accent-mark` / `-mark-on`: a shape
  owes 3:1 against the surface (WCAG 1.4.11), and DEFAULT's yellow accent cannot
  meet that at its fill value. In dark the mark token is the accent.
  The list unread badge is the mark token too. In the header the notification count is
  the accent fill itself (`--ds-header-badge-*` → `--ds-accent` / `-on`), the same value
  on all three bands, with a 1px outline in `--ds-header-badge-fg` (the badge's own ink) that
  gives the pill its 3:1 on light chrome — one colour, every band. The env badge uses the accent fill proper
  (`--ds-accent` / `-on`): it is a tenant label with text on it, not a mark.
- **Neutrals** — one 13-step cool ramp, `--ds-n-0` → `--ds-n-950`, plus alpha
  neutrals. Aliased as `--ds-bg` / `-surface` / `-fg` / `-fg-muted` / `-border` /
  `-divider`: a screen never names a step directly.
- **Status** — `success` / `warning` / `danger` / `info`, each with `-bg` / `-fg` /
  `-line` / `-solid`. **Theme-independent on purpose:** an offline object must read
  as offline in both brands and in dark.
- **Fleet vocabulary** — `--ds-state-*` maps object state onto the status palette and
  is what `DsStateIcon` / `DsObjectRow` actually read for the glyph ink, so the state
  colour lives in one place; the tinted disc behind it stays on the status tone.
  `nodata` is neutral like `parked` — the two are told apart by glyph, not by a step
  of grey.
  `--ds-fresh-live` / `-recent` / `-late` / `-none` is *data freshness* (how long ago
  the last message arrived) and colours the object-row disc, with its own ink
  `--ds-fresh-on`. State and freshness are different facts — a parked object can be
  perfectly fresh.
- **Selection is tri-state everywhere** — `'off' | 'on' | 'some'`, drawn by one
  primitive (`DsCheck`). A form checkbox maps `checked` + `indeterminate` onto it;
  an aggregate row (user, group, select-all) needs `some` and cannot invent its own.
- **Disabled is a colour token, never an opacity.**
- **Ink on a filled surface is a token** — `--ds-on-brand` on a brand fill,
  `--ds-on-solid` on any `*-solid` status fill. Both flip in dark, because the fills
  themselves lighten there.

No gradients anywhere. See [neutrals](guidelines/v2-neutrals.html),
[brand themes](guidelines/v2-brand-themes.html),
[status](guidelines/v2-status.html),
[appearance](guidelines/v2-appearance.html).

### 4.3 Type

**Inter Tight** for UI, **JetBrains Mono** for telemetry digits.

**Font delivery is one switchable `@import` in `styles.css`.** `design-system/tokens/webfonts-cdn.css`
(the default) fetches both families from Google Fonts — right for this system and for
mocks, wrong for the product: Aurora ships as a container into customer
infrastructure that often has no egress, and a CDN font there fails quietly into
the Helvetica fallback while the whole px scale is measured on Inter Tight's
metrics. **For any real deployment swap the line to `design-system/tokens/webfonts-selfhost.css`**
and drop the six `.woff2` files in — the exact names, the Cyrillic requirement and
the licence are in `design-system/assets/fonts/README.md`. `design-system/tokens/type.css` only names the
families, so nothing else changes. Material Symbols is self-hosted already.

Nine type roles (`--ds-type-display`, `-title`, `-body`, `-body-strong`, `-caption`,
`-eyebrow`, `-mono`, …) set the whole font shorthand; do not assemble sizes by hand.
When copying a `rem` value out of the Angular source, multiply by 10 once — the
portals set `html { font-size: 10px }` — and keep px.
See [type](guidelines/v2-type.html).

### 4.4 Header chrome

**The header is neutral.** Brand appears as the logo plate and the active-tab
indicator, not as a filled band. Every header colour resolves through
`--ds-header-*` semantic aliases, so `data-ds-appearance` relights it like anything
else.

**Editing a token that holds `var()`:** a custom property containing `var()` is
substituted where it is DECLARED, not where it is used, so an alias must be restated
in every scope that redefines what it points at. Brand- and accent-derived aliases
(`--ds-header-indicator`, `-tab-fg-active`, `-plate`, `-env-*`, `-badge-*`,
`--ds-surface-selected`, `--ds-focus-ring`, `--ds-focus-color`, the chart zoom pair)
therefore appear twice: once on `:root` and once on `[data-ds-theme]`. Without the
second block a nested theme scope kept the root tenant's colour — a RED2 header drew a
DEFAULT-blue tab indicator. Add both when you add such an alias.

A tenant that contractually needs its colour up there overrides the `--ds-header-*`
aliases in its own theme block; the system ships no pre-built coloured band.

The stock tenant mark is white-on-transparent, so on neutral chrome it sits on a
34px `--ds-header-plate` square; a tenant supplying a dark mark sets
`--ds-header-plate: transparent`.

Header tabs stack the icon over the label and put the notification count on the
glyph — horizontal room is the scarce axis across 23 locales. `stack={false}` for
two or three short labels. The selected tab tints glyph and label with
`--ds-header-tab-fg-active` (brand *ink*, `#fff` on either band) so the selection
reads before the 3px indicator does; in theme RED2 brand ink is near-neutral, so there
the indicator and the hover ground carry it alone. At rest the header separates on a 1px border; pass
`scrolled` once content runs under it and it raises `--ds-shadow-sm`.

Why neutral: [header](guidelines/v2-header.html).

### 4.5 Shape, borders, shadow

Hierarchy is a **1px `--ds-border` on a rounded surface**. Shadow is only for things
that actually float — dialogs, menus, toasts, the FAB. Radius: controls 8px
(`--ds-radius-control`), containers 12px (`--ds-radius-container`), dialogs 16px,
chips and badges pill. Adjacent panels need no separator: the page ground shows
through the gap. See [shape](guidelines/v2-shape.html).

### 4.6 Density

`[data-ds-density]` drives control height, field height, row height, cell padding,
header height, gaps, pads and icon size. Nothing in a component hard-codes a
height. Cozy rows are 44px, compact 34px.
See [density](guidelines/v2-density.html).

### 4.7 Backgrounds and imagery

Flat grounds only. **No hero images, no full-bleed photography, no patterns, no
textures, no hand-drawn illustration, no blur.** The only imagery is functional:
the OpenLayers map, map markers and point SVGs, the driver avatar, country flags
for the language picker.

### 4.8 Interaction states

- **Hover / press on any filled or tinted control:** an overlay in the control's
  **own ink** over its own ground — `--ds-overlay-hover` (10%),
  `--ds-overlay-press` (16%). No filled tone carries hover or active colour tokens.
- **`secondary` and `ghost` move their ground instead** (`--ds-surface-hover` /
  `-active`): an overlay over transparent is invisible, and ghost has to match the
  row hover. `DsTabs tone="onHeader"` keeps `--ds-header-hover`.
- **Row hover** `--ds-surface-hover`; **selected** `--ds-surface-selected`.
- **Nothing scales or shrinks** — no transform-based press feedback.
- **Focus is CSS, in two files, one mechanism.** `design-system/tokens/focus.css` holds the
  `:focus-visible` outline for everything clickable; `design-system/tokens/field.css` lights a
  text-entry shell from `:focus-within` on `[data-ds-field]` (`"default"` /
  `"error"` / `"warning"`), which also owns that shell's border and hover. **No
  component tracks focus in order to draw a ring** — a JS `onFocus` fires on a mouse
  click too, so the three fields that used to do it disagreed with every other
  control in the system.
- **Loading is per-button and mandatory in every mock.** Inside a table prefer
  `DsSkeleton` over a spinner: a spinner tells the operator nothing about shape.

The white-overlay and move-the-fill variants and why both fail in dark:
[ховер и нажатие](guidelines/v2-hover.html).

### 4.9 Motion

Almost none, deliberately. Four durations, two easings, `ds-spin` and `ds-pulse`.
No bounces, no page transitions, no entrance animations, no parallax. Reduced
motion is respected.

### 4.10 Layout rules

- `DsPageLayout` is the shell for both portals: `left` + `children` + `right`.
- The user portal's object panel is `--ds-panel-w` (340px cozy, 300px compact) —
  v1 hard-coded 350px and positioned the header's tab rail on the same axis; the
  token is the only place that number lives now. Standard field width 250px.
- Dialog height is content-driven; actions right-aligned, cancel then confirm (§4.13).
- CSS Grid for form and metric grids, flexbox for everything else. Negative margins
  are banned.
- **Reusable components never set their own external margins — the parent owns
  spacing.**
- **Region props also take slots.** `DsPageLayout` (`header` / `pageHeader` / `left`
  / `right` / `footer`), `DsPanel` (`actions` / `footer`), `DsAppHeader` (`actions`),
  `DsPageHeader` (`actions` / `meta` / `tabs`), `DsDialog` (`actions`), `DsBanner`
  (`actions`), `DsEmptyState` (`action` / `secondary`), `DsTable` (`empty` /
  `footer`), `DsBulkBar` (`actions`), `DsSelectionBar` (`actions`) and `DsListRow`
  (`actions` / `badge`) accept either a React node in the prop or a child carrying
  `slot="<name>"` (`data-slot` works too). That is what lets a screen be composed
  from static markup instead of assembled in code — which is why the reference
  screens' regions stay editable. A prop wins when both are given;
  unslotted children are the main region.
- Breakpoints come from `ViewBreakpointService` with named sizes `s`/`m`/`l`/`xl`;
  components branch on `size.more('m')`, not on media queries. See
  [breakpoints](guidelines/v2-breakpoints.html) and the
  [принятые решения](guidelines/v2-breakpoints-decisions.html).

### 4.11 Charts

The product's graphs are ECharts. v2 owns their appearance and nothing else — the
library, the data pipeline and the toolbox behaviour stay as they are.

- **Series colour is theme-independent** — `--ds-series-1` … `-8`, one lightness
  band, eight hues, stable across every brand; only the light/dark pair
  changes. An operator learns that speed is blue.
- **Series colour is not status colour.** Series encodes a *quantity*, status a
  *state*; that is why the ramps are separate.
- **A gap in telemetry stays a gap.** `connectNulls` off by default; the product's
  "Show / hide invalid data" tool is what turns it on.
- **A filled series reaches its own zero.** `area` and `bar` extend the value axis
  to 0. Only a line may be truncated — pin it with `yMin` / `yMax` when the scale
  comes from the sensor rather than from the day.
- **Axis, grid, crosshair, tooltip and zoom chrome are semantic aliases.** No
  hard-coded `#808080` split line.
- **The plot has no ground of its own** — it sits on the panel surface. Split lines
  dotted, value axis without an axis line, category axis with one.
- **Animation is off.** An operator screen redraws on every incoming message.
- **No pie, donut, radar, radial gauge, 3D or gradient fill.** Fleet questions are
  comparisons over time; one value against bands is a `DsScoreBar`.
- Chart titles are **left-aligned** like every other v2 header; period and sample
  count are the subtitle.
- For production, `design-system/components/charts/echartsTheme.js` reads these tokens off the
  DOM and returns the chrome half of an `EChartsOption`. Call it again after a
  theme, appearance or density change and re-`setOption` — never register a static
  JSON theme, which cannot follow the attribute.

See [charts](guidelines/v2-charts.html).

### 4.12 Accessibility

WCAG AA minimums are a stated rule and new UI must pass AXE: `role="img"` +
`aria-label` on every status glyph, `aria-current="page"` on the active nav tab, a
required `label` on every icon-only button, `role="status"`/`role="alert"` on banners
by severity, real `:focus-visible` outlines.

### 4.13 Dialogs and overlays

A modal stops the operator's world, so it is spent on three jobs only:

1. **Confirming something irreversible or wide-reaching** — archive, restore,
   unassign, send a command to a device, delete a template set.
2. **Creating or editing one object** when the operator must stay on the map or the
   list behind it — `Add object`, `Change owner`, `Assign driver`.
3. **A short task with steps** — import, export, generating a template set; three
   steps at most.

Everything else has a better surface: inspecting an object is the **object panel**,
the result of an action is a **toast**, a condition that stays true is a **banner**,
filtering is the **filter bar or menu**, and a form longer than eight fields or with
its own tabs is a **screen** with `DsPageHeader`.

**Anatomy is fixed** (`DsDialog`): header — optional `tone` glyph, title, one-line
`description`, close button; body — the only scrolling region; footer — actions.
Height follows content up to `min(90vh,760px)`; nothing else sets a height. Radius
16px, `--ds-shadow-lg`, scrim `--ds-n-a60`.

**Size is a decision, not a fit:** `sm` 420 for a confirmation (title + one
sentence, no body), `md` 560 for a single-object form, `lg` 760 for two columns or a
stepper, `xl` 960 for a table or a map inside the sheet. If `xl` still crowds, the
task was a screen.

**Actions.** Right-aligned, reading order cancel → confirm, exactly one primary tone
(`danger` when the confirm destroys). A third action goes to `ghost` on the far left.
The confirm button repeats the verb from the title — `Move to archive`, `Assign`,
`Send command` — never `OK`, `Yes`, `Submit`.

**Copy** follows §3: a sentence-case question with the object in typographic quotes —
`Move object “Volvo FH16” to archive?` — and a description that states the consequence
as a fact, terminal period included, plus what survives: `Its history stays available
in reports.` No `Are you sure`, no `Warning!`.

**Dismissal.** `onClose` buys the full set — Escape, scrim click, close button — and is
the default. `dismissable={false}` keeps the button but ignores Escape and the scrim:
for a request in flight or typed work that would be lost. No `onClose` at all makes the
dialog fully non-dismissable — for a blocking system state, never for a form.

**Focus and stacking.** `aria-modal` is a promise: the sheet takes focus on open, traps
Tab and returns focus to the trigger — no screen adds its own handlers. Never stack two
dialogs; a second decision means the first becomes a step. Menus, selects and toasts may
open above a dialog, and toasts stay in `DsToastStack` at page level.

### 4.14 Sorting

Every list surface **always has an order, and always exactly one**: one field, one
direction. Two ways to set it, no third.

- **A table's column header owns it** — a real `<button>` inside the `<th>`, `aria-sort`
  on the `<th>`, cycle ascending ⇄ descending. No "unsorted" step: the default order
  is itself a sort. One key at a time, `sort=desc#name`.
- **Sortable only if whoever returns the rows can order by it.** Admin tables page on
  the server, so a client-side sort would reorder the current page only — that is not
  an order. Composite cells declare the underlying field (`sortBy`); computed,
  selection and action columns never sort, and a non-sortable header gets no icon, no
  pointer, no hover.
- **Status sorts by the severity ramp, not by the alphabet of its label.**
- **Missing values are always the weak end** of the scale, whichever direction is active.
- Changing the order returns to page one, lives in the **URL** next to the filters, and
  keeps the rows in place under `DsSkeleton` during the re-query.
- **Without column headers the sort menu owns it** — the object panel, the tree and card
  lists use `DsFilterMenu type="sort-by"`. Those lists are fully loaded, so sorting is
  honestly client-side. **Field and direction are separate:** a radio list of fields plus
  one direction pair, labelled from the field (`Newest first`, `A → Z`, `Highest first`).
  Grouping is not sorting; `Clear` restores the default.
- **Sorting is not a filter** — never a chip in `DsFilterBar`. It shows as the active
  header, or as a dot on the `sort` icon while it differs from the default.
- **Some orders are not the operator's to change:** the user → group → object hierarchy,
  sensors in an object card, chronological rows (direction may flip, field may not),
  stepper steps, report rows whose order is part of the report.

Defaults per surface, the per-column table and the reasoning:
[sorting in a table](guidelines/v2-sorting.html),
[sorting without column headers](guidelines/v2-sorting-menu.html).

---

## 5. Iconography

**Material Symbols Outlined**, self-hosted as a font and the only icon font in the
system — the glyph is the element's text content, not an SVG. In a component that span is **`DsIcon`**
(`<DsIcon name="delete"/>`), the only icon primitive: it owns the size default, the
`wght` axis, the optical nudge table and the `aria-hidden` / `role="img"` decision.
Glyph size is always a `--ds-icon-*` token, never a literal: 20px inside controls
(`--ds-icon`), 24px standalone (`--ds-icon-lg`), 16px for dense rows and chip-remove
(`--ds-icon-sm`), 14px for a glyph subordinate to 11–12px text — sort arrow, badge,
breadcrumb chevron, stepper tick (`--ds-icon-xs`). All four halve a step in compact.
A component's own *dimensions* are a different thing and stay numeric props: the
`DsStateIcon` disc (28), the `DsFab` diameters (40/48/56), the `DsSpinner` size.

Reuse this vocabulary rather than picking new glyphs:

| Group | Glyphs |
|---|---|
| Actions | `add` `edit` `delete` `clear` `close` `check` `search` `settings` `refresh` `undo` `autorenew` `print` `share` `build` `open_with` |
| Files & data | `download` `file_upload` `attach_file` `content_paste` `table_chart` `assessment` `event_note` `straighten` `crop_free` |
| Messaging | `info` `error` `warning` `check_circle` `help` `priority_high` `notifications` |
| Navigation | `arrow_back` `chevron_left` `chevron_right` `expand_more` `unfold_less` `unfold_more` `apps` `exit_to_app` |
| Lists & order | `sort` `filter_alt` `filter_list` `label` `bookmark` `account_tree` `format_list_bulleted` `view_list` |
| Map & fleet | `place` `map` `layers` `layers_clear` `navigation` `local_parking` `local_shipping` `speed` `timer` |
| Access | `visibility` / `visibility_off` `lock` / `lock_open` `vpn_key` `person_add` `more_vert` |

**Rotation carries meaning:** `navigation` rotates by the object's course to show
heading; `straighten` rotates −45° to read as a measuring line; `priority_high`
rotates 180°. See [arrows](guidelines/icons-arrows.html).

**The one legitimate vector exception** is the map layer: geofence and point markers
are real SVG assets in `design-system/assets/images/` plus two rasters
([map assets](guidelines/icons-map-assets.html)). Country flags in `design-system/assets/flags/`
are the language picker's only other imagery. No emoji, ever; no Unicode characters
used as icons.

## 6. Logo

The mark ships as a PNG — a white navigator arrow inside a white ring with three
radiating yellow arcs. `design-system/assets/logo/AuroraWhite.png` (256×256, transparent).

- Drawn white-on-dark and invisible on white — **always place it on `--ds-brand` or
  another dark ground.**
- Header lockup: a 34px `--ds-header-plate` square holding the mark at 26px, 8px
  gap, then the product title in the UI face (`--ds-type-section`, ink
  `--ds-header-fg`). Under the `s` breakpoint the title drops and only the plate shows.
- An environment badge (`DEV`, `LOCAL`) may sit 8px right of the title on an accent
  ground.
- Both mark and title are runtime-customisable per tenant (`customization.logoUrl`,
  `customization.title`, `FRONT_BRAND`) — **never treat the lockup as fixed**; leave
  room for a longer title and a different mark.

No SVG logo, no wordmark-only lockup, no monochrome variant and no clear-space spec
were provided. The title is set in the UI face; the old wordmark fonts are not shipped. See [mark](guidelines/brand-logo-mark.html) and
[lockup](guidelines/brand-logo-lockup.html).

---

## 7. Index

```
styles.css                  ← the only file consumers link; @import list only
thumbnail.html              ← project tile
overview.html               ← start here
readme.md                   ← this file
MIGRATION.md                ← old Angular name → system name, for engineering handoff
SKILL.md                    ← Agent-Skills entry point
REVIEW.md                   ← readiness verdict and open owner decisions

package.json                ← npm package: entry points, peer React, publish config
index.js                    ← package entry — every component re-exported by name
PUBLISHING.md               ← как вынести систему в GitHub и поставить тег
ANGULAR.md                  ← подключение в Angular-воркспейсе: styles, скоупы, ECharts
design-system/templates/angular/          ← Angular-слой: сервис скоупов, [auroraScope], мост ECharts,
                              миксины SCSS, ng-package.json
VERSIONING.md               ← semver policy: what is major / minor / patch here
CHANGELOG.md                ← one section per tag
CONTRIBUTING.md             ← review criteria, PR rules, release command
.github/workflows/publish.yml  tag v* → GitHub Packages + Release

design-system/tokens/
  webfonts-cdn.css          UI faces from Google Fonts — design time, the default
  webfonts-selfhost.css     UI faces self-hosted — production; swap one line in styles.css
  type.css                  Inter Tight + JetBrains Mono, 9 type roles, tracking
  neutrals.css              the 13-step ramp + alpha neutrals
  brand.css                 DEFAULT + RED2: 3 brand fill roles + --ds-brand-text, 5 accent roles, light and dark
  semantic.css              ink / ground / line aliases, header chrome, status, fleet states
  shape.css                 radius scale, role radii, shadows
  focus.css                 the one :focus-visible rule + --ds-focus-color / -offset
  field.css                 the one text-entry shell rule: border, hover, :focus-within ring
  density.css               cozy + compact: control, field, row, cell, header, gap, pad
  layout.css                the ViewBreakpointService thresholds + content max widths
  chart.css                 series hues (theme-independent), axis / grid / zoom / tooltip chrome
  motion.css                4 durations, 2 easings, ds-spin / ds-pulse

design-system/assets/
  logo/ images/ flags/      mark, map markers, language flags
  design-system/fonts/README.md           the self-hosting ops step (no font files committed)
  icons/material-symbols/   Material Symbols Outlined — the only icon font

guidelines/                 cards: brand (logo, arrows, map assets, track);
                            foundations (type, neutrals, brand themes, status,
                            appearance, density, shape, header, hover, breakpoints,
                            charts, sorting); decisions (breakpoint decisions)

design-system/components/                 React components, each with a .d.ts contract
  primitives/               DsIcon, DsCheck — the shared glyph and selection box
  buttons/ forms/ data/ feedback/ layout/ navigation/ charts/
  charts/echartsTheme.js    the token → EChartsOption bridge production Angular uses

copy-a-screen/              app-shell.html — the shell wired and empty
ui_kits/                    monitoring.html, admin.html — the two whole screens
                            (live theme / density switch)

_ds_bundle.js               generated — never edit
_ds_manifest.json           generated — never edit
_adherence.oxlintrc.json    generated — never edit
```

### Components

The `V2` prefix (and `--ds-` on tokens) is kept on purpose: it is what distinguishes a
system component from the same-named Angular class still in the product source. The
`v2/` folders were flattened in September 2026 — there is nothing else to tell apart. Props are the component's
`.d.ts`, appearance is the `@dsCard` in its folder — those are the contract; this is
only the index.

| Group | Components |
|---|---|
| `primitives/` | DsIcon · DsCheck · DsCheckButton |
| `buttons/` | DsButton · DsIconButton · DsFab |
| `forms/` | DsField · DsCheckbox · DsSelectBox · DsSwitch · DsDuration · DsFilterMenu |
| `data/` | DsTable · DsFilterBar · DsPagination · DsChip · DsBadge · DsListRow · DsObjectRow · DsTreeRow · DsSelectionBar · DsBulkBar · DsStateIcon |
| `feedback/` | DsBanner · DsToast · DsToastStack · DsEmptyState · DsSpinner · DsSkeleton |
| `charts/` | DsChart · DsChartLegend · DsChartTooltip · DsSparkline · DsScoreBar |
| `layout/` | DsPanel · DsDialog · DsPageLayout |
| `navigation/` | DsAppHeader · DsTabs · DsPageHeader · DsStepper · DsMenu · DsUserMenu · DsHeaderChip |

**`DsBadge` is spec, not shipped.** Status chips exist as an approved written spec in
`docs/ui-kit/README.md` §4.1 with every value fixed, but had no implementation in the
product when this system was built. Flag that when handing designs to engineering.

## 8. What is NOT here

- **No mobile app.** An Android app exists but no source was provided, so there is no
  mobile UI kit and no mobile patterns. Sub-`l` breakpoint behaviour is documented but
  not recreated.
- **No marketing site, no docs site.** The product has neither.
- **No slide template.** No deck was provided.
- **No copyable templates.** The three `design-system/templates/` folders were removed in
  September 2026: they mirrored the reference screens instead of starting real work.
  The reference screens in `ui_kits/` and `copy-a-screen/` are the layout source.
- **No map library styling.** Track colours, geofence fills, clustering and the
  weather legend live in `aur-openlayers`, a separate repository not provided.
- **No legacy layer.** The v1 recreation was deleted in September 2026. `MIGRATION.md`
  keeps the name map; the visuals are gone. To see what a screen looks like today, run
  the Angular app.
- **No legacy fonts.** The baseline Material Icons font and the wordmark faces
  (Nasalization, MTSText) live in the Angular repo, not here.


## Starters

In the standalone version, this design system came with 1 starter template(s). Each is a small project of its own, not a part of the design system the page shows; its files are kept in this artifact as they were, under its folder, for a later migration of its own.

- **Презентация для руководства** — Дека о дизайн-системе Aurora простым языком: было / стало, любой клиент, эффект, статус, решения (4 files, entry `design-system/templates/leadership-deck/LeadershipDeck.dc.html`)

## Migrated from a legacy design system

This system was carried over from the standalone version on 2026-09-18. The part of this README the author wrote predates the move, so any file names in it are the old ones. Where things are now:

- `styles.css`, `design-system/tokens/webfonts-cdn.css`, `design-system/tokens/type.css`, `design-system/tokens/neutrals.css`, `design-system/tokens/brand.css`, `design-system/tokens/semantic.css`, … and 8 more (the global stylesheets) → `project/components/bundle.css`, with the token declarations moved to `project/tokens.json` (`project/tokens.css` is generated from them)
- `_ds_bundle.js` → `project/components/bundle.js`
- showcase pages, each kept whole as one component’s preview (a page of examples, not an export of the bundle): `guidelines/v2-appearance.html` → `project/components/DsAppearance/preview.html`; `guidelines/v2-brand-pick.html` → `project/components/DsBrandPick/preview.html`; `guidelines/v2-brand-themes.html` → `project/components/DsBrandThemes/preview.html`; `guidelines/v2-breakpoints.html` → `project/components/DsBreakpoints/preview.html`; `guidelines/v2-charts.html` → `project/components/DsCharts/preview.html`; `guidelines/v2-density.html` → `project/components/DsDensity/preview.html`; `guidelines/v2-header.html` → `project/components/DsHeader/preview.html`; `guidelines/v2-hover.html` → `project/components/DsHover/preview.html`; … and 30 more
- the migration report, which lists what did not come across: `project/assets/notes/MIGRATION-REPORT.md`
