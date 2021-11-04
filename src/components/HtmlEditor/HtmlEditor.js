// import './editor.css'
import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateCodeDict } from '../Editor/EditorSlice'

import { EditorState, basicSetup } from '@codemirror/basic-setup';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';

const HtmlEditor = ({
  lang = 'html'
}) => {
  const editor = useRef();
  // const [code, setCode] = useState('');

  // set 'index'/filename somehow when creating new 'files'
  const code = useSelector((state) => state.editor.code_dict.html['index'])
  const dispatch = useDispatch()

  const onUpdate = EditorView.updateListener.of((v) => {
    // dispatch(updateHtml(v.state.doc.toString()));
    dispatch(updateCodeDict({ lang: 'html', name: 'index', code: v.state.doc.toString()}));
    // console.log(v.state.doc.toString());
  });

  useEffect(() => {
    const mode = html();
    const startState = EditorState.create({
      doc: code,
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

export default HtmlEditor;
