# Kinetic Scroll

`kinetic-scroll` enables sustained, hands-free viewport scrolling triggered by a single keypress, with dynamic velocity control.

Press a designated key to initiate continuous scrolling. 
Press it again to increase the scroll velocity. 
Press the opposite directional key to brake and stop.

## Commands

Map these commands in your `keybindings.json` (no default bindings are enforced):

- `kineticScroll.startKineticScrollDown`
- `kineticScroll.startKineticScrollUp`
- `kineticScroll.stopKineticScrolling`
- `kineticScroll.placeCursorMiddle`

## Kinematic Behavior

When scrolling is active:
- **Accelerate:** Pressing the current direction's keybinding again increases the number of wrapped lines moved on each trigger.
- **Brake/Stop:** Pressing the opposite direction's keybinding arrests the movement immediately.
- **Halt:** `kineticScroll.stopKineticScrolling` halts movement regardless of the current vector.
- **Boundary Stop:** Scrolling stops automatically when the editor reaches the full top or full bottom.
- **Re-anchor Cursor:** `kineticScroll.placeCursorMiddle` stops kinetic scrolling (if active) and moves the cursor to the middle of the current viewport. Use this when scrolling has moved the viewport away from the cursor.

## Configuration Setup

Example `keybindings.json` mapping:

```json
[
    {
        "key": "PageDown",
        "command": "kineticScroll.startKineticScrollDown",
        "when": "editorTextFocus"
    },
    {
        "key": "PageUp",
        "command": "kineticScroll.startKineticScrollUp",
        "when": "editorTextFocus"
    },
    {
        "key": "Insert",
        "command": "kineticScroll.placeCursorMiddle",
        "when": "editorTextFocus"
    }
]
```

## Settings Parameters

You can fine-tune trigger frequency and displacement behavior in your `settings.json`:

- `kineticScroll.triggerFrequencyMs` (default: `16`)  
  The delay between scroll triggers in milliseconds. You usually do not need to change this.

- `kineticScroll.initialScrollLinesPerTrigger` (default: `2`)  
  The displacement (Δx) in wrapped lines moved per trigger at initial start.

- `kineticScroll.accelerationStepLines` (default: `2`)  
  The number of lines added to the displacement per trigger upon repeated same-direction triggers.
