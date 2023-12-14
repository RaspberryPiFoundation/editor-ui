import { EditorView } from "@codemirror/view";
import "../stylesheets/rpf_design_system/font-weight.scss";
import "../stylesheets/rpf_design_system/font-size.scss";
import "../stylesheets/rpf_design_system/line-height.scss";

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
      "border-inline-start": "solid grey",
      "&.active": {
        background: "none",
        "border-inline-start": "solid lightgrey",
      },
    },
    ".ͼ5": { color: "#C1C1C1" },
    ".ͼb": { color: "#FF00A4" },
    ".ͼc": { color: "#1498D0" },
    ".ͼd": { color: "#1498D0" },
    ".ͼe": { color: "#6CE68D" },
    ".ͼf": { color: "#6CE68D" },
    ".ͼg": { color: "#1498D0" },
    ".ͼi": { color: "#FF00A4" },
    ".ͼj": { color: "#1498D0" },
    ".ͼm": { color: "#C1C1C1" },
  },
  { dark: true },
);
