# Foundation compliance implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Correct the four audited foundation discrepancies and diagnose the 390 px browser failure.
**Architecture:** Preserve public props. Wrap long control labels rather than hide information behind hover. Distinguish absent scores from meters; include zero in filled sparkline domains; use the documented title role. Diagnose responsive measurement before changing the test.
**Tech Stack:** React, CSS tokens, Playwright, axe, Node 22 managed by mise.
**Spec:** User-approved findings in this chat; components/DsType/preview.html, components/DsCharts/preview.html, components/DsAccessibility/preview.html.

## Global constraints

- Keep public names, paths, props and theme tokens; update consumer docs and Unreleased changelog.
- Verify DEFAULT/light/cozy, DEFAULT/dark/compact, RED2/light/cozy, RED2/dark/compact; 390 px and wide layouts.
- No publishing, pushing or version changes.

## Review focus

- Long unbroken labels with icons, counters and disabled states must remain readable without triggering actions merely to read. Loading retains the existing centered spinner, accessible name and control geometry.
- Empty scores differ from measured zero; negative and mixed sparkline data keep their sign and gaps.
- Wrapped controls preserve compact short-label geometry and keyboard behavior.
- Panel/dialog headings keep their semantic HTML level while changing visual role.
- Responsive checks must wait for actual readiness, never ignore persistent overflow.

### Task 1: Reproduce and correct four component contracts

Files: tests/browser/foundation-compliance.spec.js; Button, Chip, Menu, ScoreBar, Sparkline, Panel and Dialog source files; their README/API/declaration text where affected.

- [x] Add browser regressions for full visible labels, valid empty score accessibility, zero-based sparkline geometry and title-role headings.
- [x] Run regressions against unchanged components and inspect expected failures.
- [x] Implement wrapping, empty-score semantics, signed zero-based fill and title roles.
- [x] Run regressions plus affected existing tests; update docs and changelog.

### Task 2: Diagnose responsive check

Files: tests/browser/foundation-guides.spec.js and production layout code only if evidence identifies a production defect.

- [x] Capture viewport/body dimensions and overflowing elements immediately after resize and after layout settles.
- [x] Reproduce the cause and fix readiness or production layout as warranted.
- [x] Run all four guides/modes at 390 px; repeat the formerly failing check.

### Task 3: Integration and review

- [x] Run npm test and npm run verify; inspect failures and repair within scope.
- [x] Review final diff independently, resolve material findings and verify browser presentation.
- [x] Leave the reviewed changes locally; report checks and remaining limitations.

## Execution record

### Follow-up: complete verification

User authorized fixing the three remaining verification blockers.

- [x] Resolve overview links against the generated catalogue while retaining legacy-name and missing-target checks.
- [x] Add a regression fixture covering generated links, missing targets, source-only targets and legacy names; observe RED then GREEN.
- [x] Update overview and foundation-navigation browser expectations to the current content; retain all-page runtime checks and scoped keyboard navigation.
- [x] Run the 76 lint checks and both previously failing browser scenarios successfully.
- [x] Independently review the four changed files; no actionable findings.
- [x] Run canonical npm run verify to completion.

Canonical verification finished with exit code 0 and `verify: all checks passed`.
All 171 browser tests passed, including the 390 px guide and all 17 component
regressions. Tarball consumer checks and all 12 Chromium/Firefox/WebKit
compatibility tests passed. Full log: `.tmp/foundations-fix/verify-complete.log`.
The three blockers recorded below are resolved; those entries describe the
earlier component-only validation.

### Original component work

- Baseline: c2afe91 on develop; work proceeds on feature/foundation-compliance in an isolated managed worktree.
- RED: all 13 new regression cases failed on the original components, each at the expected contract (labels, empty meter, heading role or zero-based fill).
- Resize evidence: diagnostic runs on unchanged components captured DsAccessibility DEFAULT/light/cozy with body client/scroll widths 70/119 immediately after resize, then 350/350 on the next animation frame. DsMotion RED2/dark/compact similarly changed from 70/71 to 350/350. Fonts were already loaded. The 280px catalogue sidebar is collapsed by DsPageLayout's ResizeObserver and React state update; the old assertion raced that commit.
- The responsive check now waits for the mobile navigation state and polls actual iframe viewport, body/document overflow and fitted height. It retains strict overflow checks and introduces no fixed sleep or overflow masking.
- GREEN: 14 targeted component/foundation tests passed; the responsive guide test then passed 3 full repetitions. Existing button/menu tests passed, including loading geometry, form safety, focus restoration and overlay placement.
- Independent review found no actionable regression. Clarification: the existing loading spinner intentionally hides the visual label while preserving the accessible name and geometry; this fix does not change that contract.
- Full npm test and npm run verify stop at the pre-existing delivery lint: overview.html links to generated index.html and docs HTML are checked as source paths. Neither overview.html nor the linter changed. Remaining verification stages are run separately without weakening that check.
- Full browser integration exposed a nested-label overflow in FilterMenu: its inline-flex summary could extend beyond the Button label and put its arrow beneath the adjacent clear action. Four added geometry/hit-target regressions failed before the fix. Constraining that summary to maxWidth:100% keeps the existing compact summary and arrow inside its button; all 17 regression cases now pass. Manual 390px inspection confirms arrow right=267px, button/clear boundary=282px.
- Two other browser checks contain unchanged expectations from before the foundations refresh: catalogue.spec.js expects the overview subtitle to contain the card count; foundations.spec.js omits the new “Общие правила” navigation group. They are outside the four component fixes and remain reported verification blockers.
- Final validation: build and npm run test:ui passed. The final targeted run passed 20/20, including both complete FilterMenu scenarios, all 17 regressions and foundation-guides at 390px. The broad browser run passed 164/167 before the FilterMenu correction; that failure is now covered by the passing final rerun, leaving the two unchanged text/navigation expectations above. All other verify stages passed when run separately, including all 62 current pages in four scopes, tarball consumer checks and 12/12 Chromium/Firefox/WebKit compatibility checks. git diff --check passed.
- Delivery: uncommitted changes remain in the attached feature/foundation-compliance worktree. The original develop checkout is unchanged. The corrected catalogue is running at http://127.0.0.1:5174/ and open in the built-in browser. No commits, pushes, publishing or version changes were performed.
