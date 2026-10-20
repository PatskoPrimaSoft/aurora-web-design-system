---
name: aurora-locator-design
description: Use this skill to generate well-branded interfaces and assets for Aurora (the GPS fleet-monitoring portals), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for protoyping.
user-invocable: true
---

Read `readme.md` first — it is the guide. If the user invokes this skill without other
guidance, ask what they want to build, then act as an expert designer who outputs HTML
artifacts or production code, depending on the need.

## Four rules that decide whether a screen is right
1. **Three scopes on the root:** `<body data-ds-theme="DEFAULT" data-ds-appearance="light" data-ds-density="cozy">`.
   A screen is done only when it holds up in DEFAULT *and* RED2, light *and* dark, both densities.
2. **Colour only through tokens, size only in px.** Text on brand uses `--ds-brand-text`, never the fill.
   Status colours are theme-independent. Disabled is a colour token, never an opacity.
3. **Hierarchy is a 1px border on a rounded surface** (controls 8px, containers 12px, dialogs 16px);
   shadow only for what floats. Icons are Material Symbols via `DsIcon`, sized from `--ds-icon-*`.
   No gradients, no emoji.
4. **Fonts and focus are delivery, not design.** UI faces come from one `@import` in `styles.css`
   (CDN for mocks, `design-system/tokens/webfonts-selfhost.css` for anything deployed). Focus is CSS only
   (`design-system/tokens/focus.css`, `design-system/tokens/field.css`) — never a React state.

## Where things are
`styles.css` (link this one file) · `design-system/tokens/` · `design-system/components/` (React, each with a `.d.ts`) ·
`ui_kits/monitoring.html`, `admin.html` (whole screens) · `copy-a-screen/app-shell.html` (empty shell) ·
`guidelines/` (cards) · `MIGRATION.md` (old Angular names → system names, for handoff only).
There are no templates: read a reference screen, then build the screen the task needs.
