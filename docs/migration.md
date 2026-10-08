# Old Angular names → system names

**The v1 layer was deleted from this design system in September 2026.** The design
system is v2-only: one token set, one component set, one way to build a screen.

The *product* is not. The shipped Angular code still uses the old component and
token names, and will until every screen is migrated. This document is the name map
for that work — read it when you hand a design to engineering or migrate a screen,
not when you design. Every old name below has a named destination; nothing was
lost in the deletion except the visuals, which are recoverable by running the
Angular app.

---

## 1. Scope the switch

### Upcoming breaking change: object row

`DsObjectRow`, `DsObjectRowProps` and `dsObjectRowDescription` have been removed.
Use `DsListRow` with `title` instead of `name` and `subtitle` instead of `details`.
Compose a separate `DsCheckbox` when selection is needed. Avatar, signal, freshness,
service and unread indicators belong to the application until their design is approved.
There is no compatibility alias.


### Upcoming breaking change: user menu

`DsHeaderChip`, `DsHeaderChipProps` and `DsAppHeader.user` have been removed.
Render `DsUserMenu` in the header's `actions` prop or slot instead:

```jsx
<DsAppHeader actions={
  <DsUserMenu name="a.ivanov" items={userItems} onSelect={handleUserAction} />
} />
```

The menu owns its trigger, including the optional `avatarSrc`. There is no
standalone chip, compatibility export or redirect for the removed card.

### Theme scope

v2 is scoped by three independent, inheritable attributes:

```html
<body data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy">
```

| attribute | values | v1 equivalent |
|---|---|---|
| `data-ds-theme` | DEFAULT · RED2 | the `theme-*` class. Only the two brands in production ship; a new tenant gets its own block |
| `data-ds-appearance` | light · dark | none — v1 has no dark mode |
| `data-ds-density` | cozy · compact | none — v1 heights are hard-coded |

In production Angular, keep setting the existing `theme-*` class from `FRONT_BRAND`
and map it to the same custom properties; nothing about the white-label mechanism
changes.

---

## 2. Component map

30 v1 components map onto 26 of the system's 44 v2 components (the other 18 have no
v1 ancestor — see the end of this section and the readme index). Nothing is lost; the
reduction on the v1 side comes from v1 encoding variants as separate components.

| v1 | v2 | | notes |
|---|---|---|---|
| `Button` | `DsButton` | 1:1 | `variant` → `tone`. `stroked` + `strokedColor` collapse into `secondary` / `ghost` / `danger`; `alignLeft` and `overflow` are plain style props now. |
| `IconButton + ICON_BUTTON_PRESETS` | `DsIconButton` | folded in | The 12 semantic presets are gone — pass `icon` and a required `label`. `rotate` survives (course, measuring line). |
| `FabButton` | `DsFab` | 1:1 | v1 forced `box-shadow:none`; v2 restores the shadow and adds `extended`. |
| `IconTextButtonFixedWidth` | `DsButton` | folded in | `<DsButton icon=… fullWidth>` inside a fixed-width parent. The 250px literal is not a component concern. |
| `FormField` | `DsField` | 1:1 | Floating label → static label (`labelMode="notch"` restores the `mat-form-field` outline notch where parity is needed). `errors[]` → one `error`; several simultaneous messages were never readable. |
| `SelectField` | `DsField` | folded in | `as="select"` + `options`. |
| `Search` | `DsField` | folded in | Use `<DsField icon="search">` with an accessible search label. Compose the surrounding actions in the screen. |
| `TimePicker` | `DsDuration` | 1:1 | Rebuilt on the shared field tokens; the `дд d чч : мм` mask is now translatable unit labels. |
| `Checkbox` | `DsCheckbox` | 1:1 | Selected state is brand, not accent. |
| `RadioButton` | `DsCheckbox` | folded in | `radio` flag. |
| `SlideToggle` | `DsSwitch` | 1:1 | — |
| `CommonFilter` | `DsFilterMenu + DsChipGroup` | split | The editor moves into a popover (all eight types); applied values become removable DsChip elements in DsChipGroup next to the table. |
| `MessageBanner` | `DsBanner` | 1:1 | `type="WARNING"` → `tone="warning"`. No 4px left bar; `role` still derives from tone. |
| `StatusChip` | `DsLozenge` | 1:1 | v1 was a written spec with no implementation. v2 ships it, plus `solid` and `dot`. |
| `SnackBar` | `DsToast` | 1:1 | Inverse ground so a toast can never be confused with a banner. `DsToastStack` positions them. |
| `Spinner` | `DsSpinner` | 1:1 | v1 was raw `mat-spinner`. `DsSkeleton` is new and is preferred inside tables. |
| `Table` | `DsTable` | 1:1 | No 2px primary rules, no `mat-elevation-z3`. Adds sorting, selection, sticky header, mono columns, density-driven rows. |
| `Paginator` | `DsPagination` | 1:1 | No longer its own 56px band — pass it as `DsTable footer` or `DsPanel footer`. |
| `Chip` | `DsChip` | 1:1 | Now themed. v1 chips came from Angular Material and ignored theming entirely. |
| `UnitStatusIcon` | `DsStateIcon` | 1:1 | Keeps course rotation; drops the `opacity:0.5` de-emphasis, which failed contrast. |
| `UnitListRow` | `DsListRow` | 1:1 | Height from `--ds-row-h-lg` (44px cozy / 34px compact) instead of a fixed 56px. |
| `Header` | `DsAppHeader` | 1:1 | Density-sized; title in the UI face, not Nasalization; rail no longer pinned to the 350px axis. |
| `HeaderNav` | `DsTabs` | folded in | `tone="onHeader"`. Adds `underline` and `segmented` so content tabs stop borrowing header styling. |
| `AuthUserChip + HeaderMenuItem` | `DsUserMenu` | folded in | Built on DsMenu, so the user menu and a table row menu are the same object. |
| `HeaderDivider` | — | dropped | A 1px `rgba(255,255,255,0.15)` rule is one span; it does not need a component. |
| `PageHeader` | `DsPageHeader` | 1:1 | Absorbs the breadcrumbs, back arrow, meta badges, actions and tab strip every screen used to hand-assemble around it. |
| `StepperHeader` | `DsStepper` | 1:1 | Completed steps stay clickable; future steps are inert. |
| `Card` | `DsPanel` | 1:1 | Radius 0 + 2px primary rule → 12px radius + 1px border. Adds header / footer / `flush` / `scroll`. |
| `Dialog` | `DsDialog` | 1:1 | Content-driven height instead of a fixed 65vh; actions right-aligned, not centred; `tone` glyph for destructive confirms. |
| `TwoColumnPageLayout` | `DsPageLayout` | 1:1 | One shell for both portals: `left` + `children` + `right`. |

### Exports that have no v1 ancestor

| v2 | why it exists |
|---|---|
| `DsSkeleton` | A spinner inside a table tells the operator nothing about shape. |
| `DsMenu` | v1 had no menu component, so every row-actions menu was styled per screen. |
| `DsToastStack` | Positioning for toasts, which v1 left to each screen. |

---

## 3. Token map

| v1 | v2 | notes |
|---|---|---|
| `--color-primary` | `--ds-brand` | Plus `-subtle` / `-border` / `-text`. There are no `-hover` / `-active` brand values: hover and press are the ink overlay. Never use the fill value for text. |
| `--color-accent` | `--ds-accent` | Now AA-safe with `--ds-accent-on`. Selection controls moved to brand; accent is attention only. |
| `--color-minor` | — | Dropped — it was a Material palette leftover used by nothing load-bearing. |
| `--color-text` | `--ds-fg` | `--ds-fg-strong` for headings. |
| `--color-secondary` | `--ds-fg-muted` | — |
| `--color-divider` | `--ds-border / --ds-fg-disabled` | v1 used one grey for both a line and disabled ink. v2 splits them. |
| `--color-light-opacity` | `--ds-surface-hover / --ds-surface-selected` | The `rgba(230,230,230,.85)` that did hover, selection, disabled fill and button borders is now four separate tokens. |
| `--color-almost-white` | `--ds-bg` | — |
| `--color-white` | `--ds-surface` | — |
| `--color-green / -red / -orange / -yellow` | `--ds-success- / danger- / warning-solid` | `forestgreen` and `red` keywords are gone; one status ramp with `-bg` / `-fg` / `-line` / `-solid`. |
| `--status-*-bg / -fg` | `--ds-*-bg / -fg / -line / -solid` | Same idea, one extra line and solid step, plus dark-mode values. |
| `--color-map-basic` | `--ds-info-solid` | — |
| `$border-radius: 2px` | `--ds-radius-control / -container` | 8px controls, 12px containers. |
| `$border-basic: 2px solid primary` | `--ds-border` | The 2px primary rule is deleted outright — it was the main dating device. |
| `--elevation-1 / -3 / -8` | `--ds-shadow-sm / -md / -lg` | Material z-levels dropped; shadow is only for floating surfaces. |
| `--font-base (Helvetica)` | `--ds-font-sans (Inter Tight)` | Fonts ship locally with the package and are loaded by `dist/styles.css`; see [font delivery](../assets/fonts/README.md). `--ds-font-mono` is new. |
| `1rem = 10px` | `px only` | No rem anywhere in v2. If you copy a rem value out of the Angular source, multiply by 10 once and keep px. |
| `spacing utility classes` | `--ds-gap* / --ds-pad*` | Density-scoped, so one page can hold two densities. |
| `fixed heights (60 / 55 / 56 / 35px)` | `--ds-header-h / -toolbar-h / -row-h / -control-h` | All density-driven. |
| header `--color-primary` band | `--ds-header-*` | The filled brand header is gone. Chrome is neutral; brand shows as the logo plate and the active-tab indicator. A tenant that needs a coloured band overrides the `--ds-header-*` aliases in its theme block. |
| `.theme-RED2 (class)` | `[data-ds-theme="RED2"]` | Plus the independent `[data-ds-appearance]` and `[data-ds-density]` scopes. |

### Rules that did not change

- Colour is only ever referenced through a custom property. A hard-coded hex in a
  component is still a review failure.
- Status colours are theme-independent on purpose: an offline object must read as
  offline in both brands **and** in dark.
- Reusable components never set their own external margins — the parent owns spacing.
- Copy stays sentence case, impersonal, and uses the product's fixed vocabulary
  (*object*, *geofence*, *retranslator*, *Generate*, *Move to archive*). Units stay
  separate tokens from numbers — pass them as `suffix`.
- No emoji, anywhere.

### Rules that did change

| | v1 | v2 |
|---|---|---|
| selection colour | accent, except the calendar date which was primary | always `--ds-brand` |
| dialog footer | centre-aligned, cancel left | right-aligned, cancel then confirm |
| icon set | Material Icons, filled | Material Symbols Outlined |
| de-emphasis | `opacity: 0.5` on secondary row icons | full contrast; only row *actions* fade |
| hierarchy | 2px primary rules + Material elevation | 1px border on a rounded surface |
| layout engine | flexbox by team rule, CSS Grid needs discussion | Grid is fine for form and metric grids |

---

## 4. Per-screen recipe

1. Wrap the screen in `DsPageLayout` and put a `DsAppHeader` in `header`.
2. Replace `Card` with `DsPanel`, and delete every 2px primary rule you find —
   adjacent panels are separated by the page ground showing through the gap.
3. Replace the table: `DsTable` + `DsField` + `DsChipGroup` + `DsPagination`. Move each
   per-column `CommonFilter` into a `DsFilterMenu` and let the applied value render
   as a removable `DsChip` in the group. Leave the header sorting only.
4. Replace fields one for one with `DsField`; collapse multi-`mat-error` stacks to
   the single most actionable message.
5. Swap buttons: `variant` → `tone`, and drop every semantic wrapper — `Save` and
   `Add` are the same primary button with different text.
6. Check the screen against theme `DEFAULT` and theme `RED2`, in light and dark,
   at both densities. That is four renders, and they are the acceptance criteria.

---

## 5. What is no longer in this project

Removed in September 2026: the whole v1 layer (`tokens/colors.css`, the v1
`components/*`, v1 specimen cards, `ui_kits/user-portal/`, `ui_kits/admin-portal/`),
the three `templates/`, the wordmark faces (Nasalization, MTSText, Orbitron) and the
baseline Material Icons font — both still live in the Angular repo for unmigrated
screens — and the two opt-in header bands (`data-ds-header="tinted"` / `"brand"`),
which no tenant used. The `v2/` sub-folders were flattened at the same time.

The system prefix is `Ds` / `--ds-`; it was `V2` / `--v2-` until the rename (see
`CHANGELOG.md`). The prefix distinguishes a system name from the same-named Angular
class still in the product source — `v2` additionally read as a version number of
the system itself, which it never was. Everything an engineer needs from the deleted
layer is the name map above.

## Deprecated token aliases (2.0 → 3.0)

These aliases were scheduled for removal in 3.0.0, but their entries remain in `lint/naming.config.json`.
`aurora/no-deprecated-token` warns on them. Replace them when upgrading; check the installed token inventory and CHANGELOG for actual removal.

| deprecated | use instead |
|---|---|
| `--ds-gap` | `--ds-gap-sm-plus` |
| `--ds-pad` | `--ds-pad-sm` |
| `--ds-fresh-on` | `--ds-fresh-fg` |

Mechanical replace is safe — values are identical in every theme and density:
`sed -i 's/var(--ds-gap)/var(--ds-gap-sm-plus)/g; s/var(--ds-pad)/var(--ds-pad-sm)/g; s/var(--ds-fresh-on)/var(--ds-fresh-fg)/g'`.
