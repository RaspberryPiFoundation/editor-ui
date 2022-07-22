import { EditorView } from '@codemirror/view';

export const editorLightTheme = EditorView.theme({
  // "&": {
  //   "height": "400px",
  // },
  ".cm-scroller": {overflow: "auto"},
  ".cm-gutters": {
    "border": "none"
  },
}, {dark: false})
