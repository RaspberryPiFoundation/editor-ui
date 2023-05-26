import { EditorView } from "@codemirror/view";
import "../../font-weight.scss";
import "../../font-size.scss";
import "../../line-height.scss";

export const editorDarkTheme = EditorView.theme(
  {
    ".cm-gutters": {
      "background-color": "#2A2B32",
      color: "white",
      border: "none",
    },
    ".cm-activeLine": {
      "background-color": "inherit",
    },
    ".cm-activeLineGutter": {
      "background-color": "inherit",
      color: "inherit",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      background: "#144866",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "white",
    },
    ".cm-line .cm-indentation-marker": {
      background: "none",
      "border-left": "solid grey",
      "&.active": {
        background: "none",
        "border-left": "solid lightgrey",
      },
    },
    ".ͼb": { color: "#FF00A4" },
    ".ͼc": { color: "#1498D0" },
    ".ͼd": { color: "#1498D0" },
    ".ͼe": { color: "#6CE68D" },
    ".ͼg": { color: "#1498D0" },
    ".ͼj": { color: "#1498D0" },
    ".ͼm": { color: "#C1C1C1" },
  },
  { dark: true },
);
