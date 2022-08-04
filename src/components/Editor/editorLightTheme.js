import { EditorView } from '@codemirror/view';

export const editorLightTheme = EditorView.theme({
  // "&": {
  //   "height": "400px",
  // },
  ".cm-scroller": {overflow: "auto"},
  ".cm-gutters": {
    "border": "none",
    "color": "black",
    "background-color": "white"
  },
}, {dark: false})
