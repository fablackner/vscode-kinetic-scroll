# Change Log

All notable changes to **kinetic-scroll** are documented in this file.

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
