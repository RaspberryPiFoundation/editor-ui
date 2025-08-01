import { EditorView } from "@codemirror/view";

export const editorLightTheme = EditorView.theme(
  {
    ".cm-activeLine": {
      "background-color": "inherit",
    },
    ".cm-activeLineGutter": {
      "background-color": "inherit",
      color: "inherit",
    },
    ".cm-gutters": {
      border: "none",
      color: "black",
      "background-color": "white",
    },
    ".cm-line .cm-indentation-marker": {
      background: "none",
      "border-inline-start": "solid lightgrey",
      "&.active": {
        background: "none",
        "border-inline-start": "solid grey",
      },
    },
    ".cm-selectionMatch": {
      backgroundColor: "transparent",
    },
    ".ͼf": { color: "#AA1111" },
  },
  { dark: false },
);
