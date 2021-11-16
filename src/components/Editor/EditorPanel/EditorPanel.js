/* eslint-disable react-hooks/exhaustive-deps */
// import './EditorPanel.css'
import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateProject } from '../EditorSlice'

import { EditorState, basicSetup } from '@codemirror/basic-setup';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';

import { editorTheme } from '../editorTheme';

const EditorPanel = ({
  extension = 'html',
  fileName = 'index'
}) => {
  const editor = useRef();
  const project = useSelector((state) => state.editor.project);
  const dispatch = useDispatch();
  let timeout;

  const updateStoredProject = (content) => {
    dispatch(updateProject({ extension: extension, name: fileName, code: content}));
  }

  const onUpdate = EditorView.updateListener.of((viewUpdate) => {
    if(viewUpdate.docChanged) {
      if (['html', 'css'].includes(extension)) {
        if(timeout) clearTimeout(timeout);
        timeout = window.setTimeout(
          function() {
            updateStoredProject(viewUpdate.state.doc.toString());
          }, 2000);
      } else {
        updateStoredProject(viewUpdate.state.doc.toString());
      }
    }
  });

  const getMode = () => {
    switch (extension) {
      case 'html':
        return html();
      case 'css':
        return css();
      case 'py':
        return python();
      default:
        return html();
    }
  }


  useEffect(() => {
    const code = project.components.find(item => item.extension === extension && item.name === fileName).content;
    const mode = getMode();
    const startState = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        keymap.of(defaultKeymap),
        mode,
        onUpdate,
        editorTheme,
      ],
    });

    const view = new EditorView({
      lineWrapping: true,
      state: startState,
      parent: editor.current,
    });

    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div className='foo' ref={editor}></div>
  );
}

export default EditorPanel;
