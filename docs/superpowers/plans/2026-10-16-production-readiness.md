# Production readiness implementation plan

> **For agentic workers:** Use superpowers:subagent-driven-development or executing-plans to implement and review these tasks.

**Goal:** Resolve all five findings approved after the production readiness review.

**Architecture:** Keep the existing component API, catalogue IDs, Angular entry points and optional peers. Repair verification rather than deleting assertions. Ship a compiled typed React entry, update development/consumer dependencies, and test essential interactions in Chromium, Firefox and WebKit.

**Tech Stack:** Node 22, React 18, Angular, ECharts, TypeScript, Playwright.

**Spec:** The five approved findings in this conversation: failing release gate; omitted unit tests; dependency security baseline; missing root React types; undefined cross-browser support.

## Constraints and rulings

- Preserve pre-existing working changes to Focus, Shape, Status, catalogue and CHANGELOG; work in this user-selected checkout so these changes remain part of verification.
- No release, push, version bump or commit requested.
- Keep public component names and runtime behavior. Do not invent Angular UI components.
- React and ECharts remain optional for CSS/Angular-only consumers.
- Browser support is current stable desktop Chromium, Firefox and Safari/WebKit; raster baselines remain Chromium-specific.
- Preserve optional peers; raise the Angular and ECharts floors to patched releases and document the resulting MAJOR requirement. Do not bump the version or release in this task.
- Independent implementation ownership: dependencies/package locks; React build and consumer checks; browser contract/config/CI/docs. Integrate shared metadata centrally.

## Tasks

- [x] 1. Repair stale catalogue assertions in catalogue-layout/status/table-sorting and component-examples; use component layout metadata instead of group membership. Diagnose baseline timeout with bounded per-card diagnostics; preserve pinned baseline and negative control. Synchronize dev rebuild test with server generation, with a bounded timeout.
- [x] 2. Add all omitted unit tests to tools/verify.mjs and protect the inclusion of npm test:ui tests with a regression test.
- [x] 3. Update root and Angular consumer dependencies/locks to audited versions; validate real install and AOT builds, investigate audit results without blanket incompatible overrides.
- [x] 4. Build a compiled ESM React entry with declarations sourced from existing component contracts. Validate installed tarball imports, strict TypeScript positive/negative cases, runtime exports, and absence of automatically installed optional peers.
- [x] 5. Add Firefox/WebKit interaction smoke tests and CI installation; document browser support and React entry contract. Verify keyboard, popovers/dialog, forms, scopes and narrow layout.
- [x] 6. Review changes, update CHANGELOG, run focused checks then full verify once integration is complete. Fix failures and rerun only relevant checks before the final full verification.

## Review focus

- A CSS-only consumer must not acquire React or ECharts transitively.
- Existing public helpers and exports must retain runtime/type compatibility.
- Pixel comparisons must still reject intentionally changed renders.
- Browser smoke tests must exercise behavior, not merely load the page.
- Failed or slow builds must expose diagnostics, not silently pass or wait indefinitely.

## Validation ledger

- Baseline review: 148 browser tests passed, six failed; separate package check and omitted five unit suites passed. Root strict React import failed TS7016. Dev rebuild works with a longer wait. Old raster capture timed out at 600 seconds.
- Final validation on 2026-10-16: `npm run verify` exited 0 (`.tmp/readiness-final-verify.log`). All build, lint, unit, documentation, release guard, clean/deterministic build and package checks passed. Chromium: 153 tests passed in 31.8 minutes. Cross-engine behavioral suite: 12 tests passed in 29.5 seconds on Chromium, Firefox and WebKit against the generated site.
- Pinned baseline: two captures of 69 cards in four scopes matched; current 58-card catalogue rendered in four scopes; intentionally changed preview was rejected. The original timeout did not recur; bounded per-card diagnostics now identify future stalls without relaxing comparisons.
- Installed tarball: native React ESM import and SSR, strict positive/negative TypeScript consumer checks, runtime/declaration export agreement and optional-peer absence passed. All three Angular consumers installed and passed AOT/browser checks.
- Audits: root production dependencies and all three Angular consumer locks have zero reported vulnerabilities. Root development audit retains five high package entries from one unpatched braces advisory; scope and handling documented in CONTRIBUTING.md.
- WebKit smoke exposed an iframe ResizeObserver feedback loop. Coalesced deferred sizing, unchanged-height guard and cancellation fixed it; all three engines passed with strict page-error checks. Independent read-only reviews found no actionable issues, including a follow-up review of this fix.
- Existing Focus, Shape, Status and catalogue edits were preserved. No version bump, commit, push or release performed. Accessibility regression checks preserve their existing baseline; this run does not establish absence of all pre-existing accessibility findings or replace testing Safari on Apple devices.
