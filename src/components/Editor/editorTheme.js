import { EditorView } from '@codemirror/view';

export const editorTheme = EditorView.theme({
  "&": {height: "400px"},
  ".cm-scroller": {overflow: "auto"}
})
