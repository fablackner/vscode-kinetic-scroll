# Change Log

All notable changes to **kinetic-scroll** are documented in this file.

## [Unreleased]

## [1.0.1]

### Added

- A 0.45 second opposite-direction lock after auto-stopping at the top or bottom boundary.

## [1.0.0]

### Added

- Kinetic scrolling commands:
  - `kineticScroll.startKineticScrollDown`
  - `kineticScroll.startKineticScrollUp`
  - `kineticScroll.stopKineticScrolling`
  - `kineticScroll.placeCursorMiddle`
- Same-direction acceleration and opposite-direction stop behavior.
- Automatic stop at full top and full bottom boundaries.
- User-facing settings:
  - `kineticScroll.triggerFrequencyMs`
  - `kineticScroll.initialScrollLinesPerTrigger`
  - `kineticScroll.accelerationStepLines`
