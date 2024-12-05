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
    "&.cm-focused.ͼ3 .cm-selectionLayer .cm-selectionBackground": {
      backgroundColor: "#144866",
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
    ".ͼ5": { color: "#FFCA99" },
    ".ͼb": { color: "#EECCFF" },
    ".ͼc": { color: "#9EE8FF" },
    ".ͼd": { color: "#9EE8FF" },
    ".ͼe": { color: "#94F9AF" },
    ".ͼf": { color: "#94F9AF" },
    ".ͼg": { color: "#9EE8FF" },
    ".ͼi": { color: "#EECCFF" },
    ".ͼj": { color: "#9EE8FF" },
    ".ͼm": { color: "#FFCA99" },
  },
  { dark: true }
);
