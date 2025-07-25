/* eslint-disable react-hooks/exhaustive-deps */
import "../../../assets/stylesheets/EditorPanel.scss";
import React, { useRef, useEffect, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setCascadeUpdate,
  updateProjectComponent,
} from "../../../redux/EditorSlice";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { indentUnit } from "@codemirror/language";
import "material-symbols";

import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";

import { Alert } from "@raspberrypifoundation/design-system-react";
import { editorLightTheme } from "../../../assets/themes/editorLightTheme";
import { editorDarkTheme } from "../../../assets/themes/editorDarkTheme";
import { SettingsContext } from "../../../utils/settings";

const MAX_CHARACTERS = 8500000;

const EditorPanel = ({ extension = "html", fileName = "index" }) => {
  const editor = useRef();
  const editorViewRef = useRef();
  const project = useSelector((state) => state.editor.project);
  const readOnly = useSelector((state) => state.editor.readOnly);
  const cascadeUpdate = useSelector((state) => state.editor.cascadeUpdate);
  const [cookies] = useCookies(["theme", "fontSize"]);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);
  const [characterLimitExceeded, setCharacterLimitExceeded] = useState(false);

  const updateStoredProject = (content) => {
    dispatch(
      updateProjectComponent({
        extension: extension,
        name: fileName,
        content,
        cascadeUpdate: false,
      }),
    );
  };

  const label = EditorView.contentAttributes.of({
    "aria-label": t("editorPanel.ariaLabel"),
  });
  const onUpdate = EditorView.updateListener.of((viewUpdate) => {
    if (viewUpdate.docChanged) {
      updateStoredProject(viewUpdate.state.doc.toString());
    }
  });

  const getMode = () => {
    switch (extension) {
      case "html":
        return html();
      case "css":
        return css();
      case "py":
        return python();
      case "js":
        return javascript();
      default:
        return html();
    }
  };
  const isDarkMode =
    cookies.theme === "dark" ||
    (!cookies.theme &&
      window.matchMedia("(prefers-color-scheme:dark)").matches);
  const editorTheme = isDarkMode ? editorDarkTheme : editorLightTheme;

  const file = project.components.find(
    (item) => item.extension === extension && item.name === fileName,
  );

  useEffect(() => {
    if (!file) {
      return;
    }

    const code = file.content;
    const mode = getMode();

    let customIndentUnit = "  ";
    if (extension === "py") {
      customIndentUnit = "    ";
    }

    const limitCharacters = EditorState.transactionFilter.of((transaction) => {
      const newDoc = transaction.newDoc;
      if (newDoc.length > MAX_CHARACTERS) {
        setCharacterLimitExceeded(true);
        return [];
      }
      setCharacterLimitExceeded(false);
      return transaction;
    });

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
        indentUnit.of(customIndentUnit),
        EditorView.editable.of(!readOnly),
        limitCharacters,
      ],
    });

    const view = new EditorView({
      lineWrapping: true,
      state: startState,
      parent: editor.current,
    });

    editorViewRef.current = view;

    // 'aria-hidden' to fix keyboard access accessibility error
    view.scrollDOM.setAttribute("aria-hidden", "true");

    // Add alt text to hidden images to fix accessibility error
    const hiddenImages =
      view.contentDOM.getElementsByClassName("cm-widgetBuffer");
    for (let img of hiddenImages) {
      img.setAttribute("role", "presentation");
    }

    return () => {
      view.destroy();
    };
  }, [cookies]);

  useEffect(() => {
    if (
      cascadeUpdate &&
      editorViewRef.current &&
      file.content !== editorViewRef.current.state.doc.toString()
    ) {
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: file.content,
        },
      });
      dispatch(setCascadeUpdate(false));
    }
  }, [file, cascadeUpdate, editorViewRef]);

  return (
    <div className="editor-wrapper">
      <div className={`editor editor--${settings.fontSize}`} ref={editor}></div>
      {characterLimitExceeded && (
        <Alert
          title={t("editorPanel.characterLimitError")}
          type="error"
          text={t("editorPanel.characterLimitExplanation", {
            maxCharacters: MAX_CHARACTERS,
          })}
        />
      )}
    </div>
  );
};

export default EditorPanel;
