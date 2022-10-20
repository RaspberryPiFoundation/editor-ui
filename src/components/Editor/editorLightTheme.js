import { EditorView } from '@codemirror/view';

export const editorLightTheme = EditorView.theme({
  ".cm-activeLine": {
    "background-color": "inherit",
  },
  ".cm-activeLineGutter": {
    "background-color": "inherit",
    "color": "inherit"
  },
  ".cm-gutters": {
    "border": "none",
    "color": "black",
    "background-color": "white"
  },
}, {dark: false})
