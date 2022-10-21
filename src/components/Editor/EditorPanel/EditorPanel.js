/* eslint-disable react-hooks/exhaustive-deps */
import './EditorPanel.scss'
import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateProjectComponent } from '../EditorSlice'
import { useCookies } from 'react-cookie';

import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
<<<<<<< Updated upstream
import { indentationMarkers } from '@replit/codemirror-indentation-markers'
=======
import { indentUnit } from '@codemirror/language';
>>>>>>> Stashed changes

import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { python } from '@codemirror/lang-python'

import { editorLightTheme } from '../editorLightTheme'
import { editorDarkTheme } from '../editorDarkTheme'

const EditorPanel = ({
  extension = 'html',
  fileName = 'index'
}) => {
  const editor = useRef();
  const project = useSelector((state) => state.editor.project);
  const [cookies] = useCookies(['theme', 'fontSize'])
  const dispatch = useDispatch();
  let timeout;

  const updateStoredProject = (content) => {
    dispatch(updateProjectComponent({ extension: extension, name: fileName, code: content}));
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
  const isDarkMode = cookies.theme==="dark" || (!cookies.theme && window.matchMedia("(prefers-color-scheme:dark)").matches)
  const editorTheme = isDarkMode ? editorDarkTheme : editorLightTheme

  useEffect(() => {
    const code = project.components.find(item => item.extension === extension && item.name === fileName).content;
    const mode = getMode();
    const startState = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        keymap.of([defaultKeymap, indentWithTab]),
        mode,
        onUpdate,
        editorTheme,
        indentationMarkers(),
        indentUnit.of('    '),
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
  }, [cookies]);

  return (
    <div className='editor' ref={editor}></div>
  );
}

export default EditorPanel;
