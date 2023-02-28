/* eslint-disable react-hooks/exhaustive-deps */
import './EditorPanel.scss'
import React, { useRef, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateProjectComponent } from '../EditorSlice'
import { useCookies } from 'react-cookie';
import { useTranslation } from "react-i18next";
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { indentationMarkers } from '@replit/codemirror-indentation-markers'
import { indentUnit } from '@codemirror/language';

import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { python } from '@codemirror/lang-python'

import { editorLightTheme } from '../editorLightTheme'
import { editorDarkTheme } from '../editorDarkTheme'
import { SettingsContext } from '../../../settings';

const EditorPanel = ({
  extension = 'html',
  fileName = 'index'
}) => {
  const editor = useRef();
  const project = useSelector((state) => state.editor.project);
  const [cookies] = useCookies(['theme', 'fontSize'])
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const settings = useContext(SettingsContext)
  let timeout;

  const updateStoredProject = (content) => {
    dispatch(updateProjectComponent({ extension: extension, name: fileName, code: content}));
  }

  const label = EditorView.contentAttributes.of({ 'aria-label': t('editorPanel.ariaLabel') });
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
        label,
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

    // 'aria-hidden' to fix keyboard access accessibility error
    view.scrollDOM.setAttribute('aria-hidden', 'true')

    // Add alt text to hidden images to fix accessibility error
    const hiddenImages = view.contentDOM.getElementsByClassName('cm-widgetBuffer');
    for (let img of hiddenImages) {
      img.setAttribute('alt', null)
      img.style.visibility = 'hidden'
    }

    return () => {
      view.destroy();
    };
  }, [cookies]);

  return (
    <div className={`editor editor--${settings.fontSize}`} ref={editor}></div>
  );
}

export default EditorPanel;
