const vscode = require("vscode");

const DIRECTION = {
  UP: "up",
  DOWN: "down"
};
const BOUNDARY_OPPOSITE_DIRECTION_LOCK_MS = 450;

class KineticScroller {
  constructor() {
    this.scrollInterval = null;
    this.lastScrollDirection = null;
    this.scrollLinesPerTrigger = null;
    this.triggerFrequencyMs = null;
    this.isScrollTickInProgress = false;
    this.temporarilyBlockedDirection = null;
    this.temporarilyBlockedDirectionUntil = 0;
    this.disposables = [];

    this.resetRuntimeScrollValues();
  }

  readNumberSetting(key, fallback, minimum = 1) {
    const value = vscode.workspace.getConfiguration("kineticScroll").get(key, fallback);
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return fallback;
    }
    return Math.max(minimum, Math.floor(value));
  }

  resetRuntimeScrollValues() {
    this.scrollLinesPerTrigger = this.readNumberSetting("initialScrollLinesPerTrigger", 2);
    this.triggerFrequencyMs = this.readNumberSetting("triggerFrequencyMs", 16);
  }

  clearStopListeners() {
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables = [];
  }

  runScroll(direction) {
    return vscode.commands.executeCommand("editorScroll", {
      to: direction,
      by: "wrappedLine",
      value: this.scrollLinesPerTrigger
    });
  }

  getPrimaryVisibleRange(editor) {
    return editor?.visibleRanges?.length > 0 ? editor.visibleRanges[0] : null;
  }

  isAtBoundary(editor, direction) {
    const visibleRange = this.getPrimaryVisibleRange(editor);
    if (!editor || !visibleRange) {
      return true;
    }

    if (direction === DIRECTION.UP) {
      return visibleRange.start.line === 0 && visibleRange.start.character === 0;
    }

    const lastLineIndex = editor.document.lineCount - 1;
    const lastLineLength = editor.document.lineAt(lastLineIndex).text.length;

    return (
      visibleRange.end.line > lastLineIndex ||
      (visibleRange.end.line === lastLineIndex && visibleRange.end.character >= lastLineLength)
    );
  }

  getOppositeDirection(direction) {
    return direction === DIRECTION.UP ? DIRECTION.DOWN : DIRECTION.UP;
  }

  setBoundaryOppositeDirectionLock(boundaryDirection) {
    this.temporarilyBlockedDirection = this.getOppositeDirection(boundaryDirection);
    this.temporarilyBlockedDirectionUntil = Date.now() + BOUNDARY_OPPOSITE_DIRECTION_LOCK_MS;
  }

  isDirectionTemporarilyBlocked(direction) {
    if (Date.now() >= this.temporarilyBlockedDirectionUntil) {
      this.temporarilyBlockedDirection = null;
      this.temporarilyBlockedDirectionUntil = 0;
      return false;
    }

    return this.temporarilyBlockedDirection === direction;
  }

  async runScrollTick(direction) {
    if (this.isScrollTickInProgress) {
      return;
    }

    const activeTextEditor = vscode.window.activeTextEditor;
    const reachedBoundaryBeforeScroll = activeTextEditor && this.isAtBoundary(activeTextEditor, direction);
    if (!activeTextEditor || reachedBoundaryBeforeScroll) {
      if (reachedBoundaryBeforeScroll) {
        this.setBoundaryOppositeDirectionLock(direction);
      }
      this.stopScrolling();
      return;
    }

    this.isScrollTickInProgress = true;
    try {
      await this.runScroll(direction);
      const latestActiveTextEditor = vscode.window.activeTextEditor;
      const reachedBoundaryAfterScroll =
        latestActiveTextEditor && this.isAtBoundary(latestActiveTextEditor, direction);

      if (!latestActiveTextEditor || reachedBoundaryAfterScroll) {
        if (reachedBoundaryAfterScroll) {
          this.setBoundaryOppositeDirectionLock(direction);
        }
        this.stopScrolling();
      }
    } finally {
      this.isScrollTickInProgress = false;
    }
  }

  restartScrollInterval(direction) {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }

    this.scrollInterval = setInterval(() => {
      void this.runScrollTick(direction);
    }, this.triggerFrequencyMs);
  }

  // Defined as an arrow function to preserve 'this' context when used as a callback
  stopScrolling = () => {
    if (!this.scrollInterval) {
      return;
    }

    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
    this.lastScrollDirection = null;
    this.isScrollTickInProgress = false;

    this.clearStopListeners();
    this.resetRuntimeScrollValues();
  }

  startScrolling(direction) {
    if (!this.scrollInterval && this.isDirectionTemporarilyBlocked(direction)) {
      return;
    }

    if (this.scrollInterval) {
      if (this.lastScrollDirection !== direction) {
        this.stopScrolling();
        return;
      }

      const accelerationStepLines = this.readNumberSetting("accelerationStepLines", 2);
      this.scrollLinesPerTrigger += accelerationStepLines;
      return;
    }

    this.resetRuntimeScrollValues();
    this.lastScrollDirection = direction;
    this.restartScrollInterval(direction);

    this.disposables.push(
      vscode.window.onDidChangeTextEditorSelection(this.stopScrolling),
      vscode.workspace.onDidChangeTextDocument(this.stopScrolling),
      vscode.window.onDidChangeActiveTextEditor(this.stopScrolling)
    );
  }

  placeCursorMiddle() {
    const activeTextEditor = vscode.window.activeTextEditor;
    const visibleRange = this.getPrimaryVisibleRange(activeTextEditor);

    if (!activeTextEditor || !visibleRange) {
      console.error("No active text editor or visible ranges!");
      return;
    }

    this.stopScrolling();

    const { start, end } = visibleRange;
    const middleLineNumber = Math.min(
      Math.floor((start.line + end.line) / 2) + 1,
      activeTextEditor.document.lineCount - 1
    );

    const newPosition = new vscode.Position(middleLineNumber, 0);
    activeTextEditor.selection = new vscode.Selection(newPosition, newPosition);

    console.log("Placed cursor in the middle of the viewport");
  }

  dispose() {
    this.stopScrolling();
  }
}

let scroller;

function activate(context) {
  scroller = new KineticScroller();

  context.subscriptions.push(
    vscode.commands.registerCommand("kineticScroll.startKineticScrollDown", () => scroller.startScrolling(DIRECTION.DOWN)),
    vscode.commands.registerCommand("kineticScroll.startKineticScrollUp", () => scroller.startScrolling(DIRECTION.UP)),
    vscode.commands.registerCommand("kineticScroll.stopKineticScrolling", () => scroller.stopScrolling()),
    vscode.commands.registerCommand("kineticScroll.placeCursorMiddle", () => scroller.placeCursorMiddle())
  );
}

function deactivate() {
  if (scroller) {
    scroller.dispose();
  }
}

module.exports = {
  activate,
  deactivate
};
