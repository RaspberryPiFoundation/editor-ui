import { EditorView } from '@codemirror/view';

export const editorLightTheme = EditorView.theme({
  "&": {
    "height": "400px",
    // "background-color": "white"
  },
  ".cm-line": {
    "font-size": "inherit",
    "line-height": "var(--line-height-regular)"
  },
  ".cm-scroller": {overflow: "auto"},
  ".cm-gutter": {
    // "background-color": "#565555",
    // "color": "#C1C1C1",
    "font-size": "inherit",
    // "line-height": "var(--line-height-regular)"
  },
  // ".cm-linenumber" : {
  //   "line-height": "inherit"
  // },
  ".cm-gutters": {
    "border": "none"
  },
  ".cm-activeLine": {
    // "background-color": "#565555",
    // "caret-color": "white"
  },
  ".cm-activeLineGutter": {
    // "background-color": "#C1C1C1",
    // "color": "#333333"
  },
  // ".ͼa": {color: "#FF00A4"},
  // ".ͼc": {color: "#1498D0"},
  // ".ͼd": {color: "#6CE68D"},
  // ".ͼl": {color: "#C1C1C1"},
})
