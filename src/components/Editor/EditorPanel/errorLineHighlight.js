import { RangeSet, StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  GutterMarker,
  gutterLineClass,
} from "@codemirror/view";

const ERROR_LINE_CLASS = "cm-error-line";
const ERROR_LINE_GUTTER_CLASS = "cm-error-line-gutter";

// Dispatch with the line number to highlight it, or null to clear.
export const setErrorLine = StateEffect.define();

const errorLineDecoration = Decoration.line({ class: ERROR_LINE_CLASS });

const errorLineField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, transaction) {
    if (transaction.docChanged) {
      decorations = Decoration.none;
    }
    for (const effect of transaction.effects) {
      if (!effect.is(setErrorLine)) {
        continue;
      }
      const lineNumber = effect.value;
      const { doc } = transaction.state;
      if (!lineNumber || lineNumber < 1 || lineNumber > doc.lines) {
        decorations = Decoration.none;
      } else {
        const line = doc.line(lineNumber);
        decorations = Decoration.set([errorLineDecoration.range(line.from)]);
      }
    }
    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

class ErrorLineGutterMarker extends GutterMarker {
  elementClass = ERROR_LINE_GUTTER_CLASS;
}

const errorLineGutterMarker = new ErrorLineGutterMarker();

// Hightlight in the gutter
const errorLineGutter = gutterLineClass.compute([errorLineField], (state) => {
  const markers = [];
  state.field(errorLineField).between(0, state.doc.length, (from) => {
    markers.push(errorLineGutterMarker.range(from));
  });
  return RangeSet.of(markers);
});

const errorLineTheme = EditorView.baseTheme({
  [`.cm-line.${ERROR_LINE_CLASS}`]: {
    backgroundColor: "var(--editor-color-error-line)",
  },
  [`.cm-gutterElement.${ERROR_LINE_GUTTER_CLASS}`]: {
    backgroundColor: "var(--editor-color-error-line)",
  },
  [`.cm-lineNumbers .cm-gutterElement.${ERROR_LINE_GUTTER_CLASS}`]: {
    position: "relative",
  },
  [`.cm-lineNumbers .cm-gutterElement.${ERROR_LINE_GUTTER_CLASS}::before`]: {
    content: '""',
    position: "absolute",
    insetBlock: 0,
    insetInlineStart: 0,
    inlineSize: "3px",
    backgroundColor: "var(--editor-color-error-line-bar)",
  },
});

export const errorLineHighlight = [
  errorLineField,
  errorLineGutter,
  errorLineTheme,
];
