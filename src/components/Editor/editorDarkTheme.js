import { EditorView } from '@codemirror/view';
import '@rpf/sauce/scss/properties/_font-weight.scss';
import '@rpf/sauce/scss/properties/_font-size.scss';
import '@rpf/sauce/scss/properties/_line-height.scss';

export const editorDarkTheme = EditorView.theme({
  ".cm-scroller": {overflow: "auto"},
  ".cm-gutters": {
    "background-color": "inherit",
    "border": "none"
  },
  ".cm-activeLine": {
    "background-color": "inherit",
  },
  ".cm-activeLineGutter": {
    "background-color": "inherit",
    "color": "inherit"
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    "background": "#144866"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "white"
  },
  ".cm-line .cm-indentation-marker": {
    'background': 'none',
    'border-left': '1px solid grey',
    "&.active": {
      'background': 'none',
      'border-left': '1px solid lightgrey',
    }
  },
  ".ͼb": {color: "#FF00A4"},
  ".ͼc": {color: "#1498D0"},
  ".ͼd": {color: "#1498D0"},
  ".ͼe": {color: "#6CE68D"},
  ".ͼg": {color: "#1498D0"},
  ".ͼj": {color: "#1498D0"},
  ".ͼm": {color: "#C1C1C1"},
}, {dark: true})
