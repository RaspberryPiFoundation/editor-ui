import { EditorView } from '@codemirror/view';

export const editorDarkTheme = EditorView.theme({
  "&": {
    "height": "400px",
    "background-color": "#333333"
  },
  ".cm-line": {
    "color": "white",
    "font-size": "16px",
    "font-weight": "550",
    "line-height": "21px"
  },
  ".cm-scroller": {overflow: "auto"},
  ".cm-gutter": {
    "background-color": "#565555",
    "color": "#C1C1C1",
    "font-size": "16px"
  },
  ".cm-gutters": {
    "border": "none"
  },
  ".cm-activeLine": {
    "background-color": "#565555",
    "caret-color": "white"
  },
  ".cm-activeLineGutter": {
    "background-color": "#C1C1C1",
    "color": "#333333"
  },
  ".ͼa": {color: "#FF00A4"},
  ".ͼc": {color: "#1498D0"},
  ".ͼd": {color: "#1498D0"},
  ".ͼl": {color: "#C1C1C1"},
})
