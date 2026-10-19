# Component expansion implementation plan

> **For agentic workers:** Use executing-plans with independent domains delegated through dispatching-parallel-agents. No concurrent catalogue builds or shared-file edits.

**Goal:** Deliver the user-requested RadioGroup, date/time/period controls, Tooltip, ProgressBar, Breadcrumbs, Link and Popover according to Aurora foundations, using Atlassian behavior as reference. PageHeader was excluded at the user's request.
**Architecture:** React source components and canonical declarations; native semantic controls; existing tokens and shared catalogue examples. Preserve all existing APIs. Independent implementation domains share integration only through the coordinator.
**Tech Stack:** React 18, TypeScript declarations, esbuild, Node 22 from mise, Playwright.
**Spec:** User request in this chat and the previously approved component recommendations; AGENTS.md and docs/component-pages.md.

## Global constraints

- No new runtime dependencies, version changes or publishing. Work on feature/component-expansion.
- Russian documentation and ru/en strings through DsStringsProvider. All colors use existing tokens; dimensions use px; external spacing belongs to parent.
- Each new card has layout=component, scopeMode=inherit, shared LiveExamples, complete executable examples.json, README rules/example and API token reference.
- Check DEFAULT/light/cozy, DEFAULT/dark/compact, RED2/light/cozy, RED2/dark/compact, 390 px, keyboard and accessible naming.
- The coordinator owns exports, catalogue families, strings, shared styles, changelog and verification wiring. Implementers own only their assigned files.

## Design decisions

- DsRadioGroup composes native radios with one shared name, group label, descriptions, validation, disabled options, controlled/uncontrolled values and form reset. Existing DsCheckbox radio remains supported.
- DsDatePicker, DsTimePicker and DsDateTimePicker wrap native date/time/datetime-local fields. Values are date-only/local wall-clock strings, never implicitly converted to UTC. DsDateRangePicker exposes from/to, date or datetime granularity, application-provided presets and an explicit timezone caption. The application owns timezone conversion and resolving calendar-day presets. Native picker appearance follows the browser; Aurora styles the fields.
- DsTooltip provides text only on hover/focus, dismisses with Escape, persists over tooltip content, and does not hide critical information. Extract IconButton tooltip behavior without changing existing public API.
- DsPopover is a nonmodal, anchored interactive layer, with controlled/uncontrolled open state, focus movement/restoration, outside dismissal, Escape and viewport-aware placement; works in a dialog and scoped themes. Do not relabel arbitrary content as a menu.
- DsLink remains a real anchor, preserving native navigation and modifier clicks. DsBreadcrumbs is a named navigation landmark, ordered links and a non-link current page; long labels wrap. Applications compose page headings and actions through the existing DsPageLayout.pageHeader slot.
- DsProgressBar is process progress, not a score meter. Defined value/max produce progressbar semantics; absent value is indeterminate. Handle zero, clamp finite values, show descriptive value text, honor reduced motion.

## Review focus

- Keyboard/focus around nested popup/dialog and tooltip escape; no clipping or lost scoped tokens.
- FormData, required validation, controlled values and reset behavior for new inputs.
- Date-only values, invalid ranges, bounds and timezone caption without accidental UTC conversion.
- 390px, long unbroken labels and breadcrumb/action wrapping without page overflow.
- Public declarations match runtime and copied examples render independently.

## Tasks

- [x] Forms/date domain: source, declarations, docs, examples and focused regressions for four date/time controls.
- [x] Overlay domain: source, declarations, docs, examples and regressions for Tooltip and Popover; reuse tooltip in IconButton.
- [x] Navigation domain: source, declarations, docs, examples and regressions for Link and Breadcrumbs.
- [x] Coordinator: RadioGroup and ProgressBar with docs/examples/regressions; integrate exports, strings and catalogue families.
- [x] Run targeted red/green checks, public type checks and new card contracts; repair integration failures.
- [x] Independent review and resolve actionable findings.
- [x] Run canonical npm run verify; inspect new pages in the built-in browser and record results.

## Verification before PageHeader scope reduction

- Canonical `npm run verify` completed with exit code 0 on 2026-10-19 (installed mise Node 22.23.2). All package, lint, types, documentation, unit, clean-build and deterministic-build checks passed; 203 Chromium tests and 12 Chromium/Firefox/WebKit compatibility tests passed. Installed tarball import, rendering and strict consumer types passed.
- Catalogue contains 73 cards, including 11 new cards and 35 new executable example scenarios. Copied snippets render; new cards pass four-mode and narrow-layout checks.
- Built-in browser inspection covered native period fields at 390 px, PageHeader on narrow/wide screens, and Popover in RED2/dark/compact with checkbox selection, persistence and restored focus. The IAB locator click anomaly inside an off-screen iframe was checked through accessible controls and an actual-catalog Chromium regression; no component defect reproduced.
- Independent review findings were repaired: controlled radio reset reconciles native FormData with the latest value; first-focus tooltip registers above Popover. Existing IconButton consumer Escape callbacks and immediate keyboard-blur dismissal remain compatible.
- Updated historical export expectations for the reintroduced PageHeader and search-status assertions for additional related documentation. Migration guidance distinguishes the new PageHeader API and time-of-day input from the former duration control.

## PageHeader removal — 2026-10-19

- Removed DsPageHeader source, declarations, catalogue card and examples at the user's request. Kept the existing DsPageLayout.pageHeader slot and restored the historical removal contract and migration guidance.
- Rebuilt the catalogue: 72 cards, including 10 new components. No DsPageHeader remains in runtime exports, generated declarations or catalogue inventory.
- Passed component-build, react-build (strict declarations and runtime parity), docs-api, docs-links and page-layout checks; all 53 component-examples and navigation-primitives browser tests passed, including four modes and navigation layouts at 390 px and 1440 px.
- Full `npm run verify` was repeated after the scope reduction on 2026-10-19 and completed with exit code 0: 202 Chromium tests (28.6 minutes), 12 Chromium/Firefox/WebKit compatibility tests, all unit/documentation/build checks and installed tarball consumer checks passed. Evidence: `.tmp/component-expansion-final-verify.log`.

## References

- https://atlassian.design/components/radio
- https://atlassian.design/components/datetime-picker/usage
- https://atlassian.design/components/tooltip/usage
- https://atlassian.design/components/progress-bar/usage
- https://atlassian.design/components/breadcrumbs/usage
- https://atlassian.design/components/link
- https://atlassian.design/components/popup/usage
