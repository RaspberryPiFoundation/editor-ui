import { EditorView } from '@codemirror/view';
import '@rpf/sauce/scss/properties/_font-weight.scss';
import '@rpf/sauce/scss/properties/_font-size.scss';
import '@rpf/sauce/scss/properties/_line-height.scss';

export const editorDarkTheme = EditorView.theme({
  "&": {
    "background-color": "#333333"
  },
  ".cm-scroller": {overflow: "auto"},
  ".cm-gutter": {
    "background-color": "#565555",
    "color": "#C1C1C1"
  },
  ".cm-gutters": {
    "border": "none"
  },
  ".cm-activeLine": {
    "background-color": "#565555",
    // "caret-color": "white"
  },
  ".cm-activeLineGutter": {
    "background-color": "#C1C1C1",
    "color": "#333333"
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    "background": "#144866"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "white"
  },
  ".ͼb": {color: "#FF00A4"},
  ".ͼc": {color: "#1498D0"},
  ".ͼd": {color: "#1498D0"},
  ".ͼe": {color: "#6CE68D"},
  ".ͼg": {color: "#1498D0"},
  ".ͼj": {color: "#1498D0"},
  ".ͼm": {color: "#C1C1C1"},
}, {dark: true})
