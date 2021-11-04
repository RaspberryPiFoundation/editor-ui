// import './EditorPanel.css'
import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateCodeDict, updateProject } from '../EditorSlice'

import { EditorState, basicSetup } from '@codemirror/basic-setup';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';

const EditorPanel = ({
  lang = 'html',
  fileName = 'index'
}) => {
  const editor = useRef();
  const project = useSelector((state) => state.editor.project)
  // const code = useSelector((state) => state.editor.project[lang][fileName])

  // const code = project.find(item => item.lang === lang && item.name === fileName);
  const dispatch = useDispatch()

  const onUpdate = EditorView.updateListener.of((v) => {
    // dispatch(updateHtml(v.state.doc.toString()));
    // dispatch(updateCodeDict({ lang: lang, name: fileName, code: v.state.doc.toString()}));
    dispatch(updateProject({ lang: lang, name: fileName, code: v.state.doc.toString()}));
    console.log(project[0]);
    // console.log(v.state.doc.toString());
  });

  const setMode = () => {
    switch (lang) {
      case 'html':
        return html();
      case 'css':
        return css();
      default:
        return html();
    }
  }


  useEffect(() => {
    const code = project.components.find(item => item.lang === lang && item.name === fileName)
    var foo = code ? code.content : "";
    const mode = setMode();
    const startState = EditorState.create({
      doc: foo,
      extensions: [
        basicSetup,
        keymap.of(defaultKeymap),
        mode,
        onUpdate,
      ],
    });

    const view = new EditorView({ state: startState, parent: editor.current });

    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div ref={editor}></div>
  );
}

export default EditorPanel;
