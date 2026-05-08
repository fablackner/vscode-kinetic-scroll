# AGENTS.md

Quick onboarding notes for contributors and AI agents working in this repository.

## Project at a glance

- VS Code extension: **kinetic-scroll**
- Main code: `extension.js`
- Extension manifest and settings: `package.json`
- User docs: `README.md`
- Change history: `CHANGELOG.md`

## Command behavior

- `kineticScroll.startKineticScrollDown` starts kinetic scrolling down.
- `kineticScroll.startKineticScrollUp` starts kinetic scrolling up.
- `kineticScroll.stopKineticScrolling` stops active kinetic scrolling.
- `kineticScroll.placeCursorMiddle` re-anchors the cursor to the middle of the current viewport.
- Re-triggering the same direction accelerates scrolling.
- Triggering the opposite direction stops scrolling.

## Key architecture notes

- Runtime state is tracked by `scrollInterval`, `scrollLinesPerTrigger`, `triggerFrequencyMs`, and `lastScrollDirection`.
- Trigger frequency is configurable via `kineticScroll.triggerFrequencyMs`; acceleration only increases `scrollLinesPerTrigger`.
- Scrolling stops automatically when the viewport reaches the full top or full bottom.
- `stopScrolling()` is the central reset path and should stay safe to call repeatedly.
- Editor selection changes, text changes, and active editor changes all stop kinetic scrolling.

## Local workflow

- Package VSIX: `npx @vscode/vsce package`
- VSIX files are intentionally not tracked by git (`*.vsix` in `.gitignore`).

## Release workflow

1. Keep `version` in `package.json` at the intended release value.
2. Update `CHANGELOG.md`.
3. Commit and push.
4. Create and push a tag like `v1.0.0`.
5. GitHub Action `.github/workflows/release.yml` builds and uploads the VSIX release artifact.
