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
import { EditorState, StateField } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
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
import useTreeSitterParser from "../../../hooks/useTreeSitterParser";

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

  // Use the new Tree Sitter hook
  const {
    treeSitterParser,
    parserInitialized,
    analyzePythonCode,
    createProblemDecorations,
    problemDecorationsEffect
  } = useTreeSitterParser(extension, fileName);

  // Create a state field for problem decorations
  const problemDecorationsField = StateField.define({
    create() {
      return Decoration.none;
    },
    update(decorations, transaction) {
      decorations = decorations.map(transaction.changes);

      for (let effect of transaction.effects) {
        if (effect.is(problemDecorationsEffect)) {
          decorations = effect.value;
        }
      }

      return decorations;
    },
    provide: (f) => EditorView.decorations.from(f),
  });

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
      const content = viewUpdate.state.doc.toString();
      updateStoredProject(content);

      // Analyze Python code if applicable
      if (extension === "py" && treeSitterParser) {
        analyzePythonCode(content).then((problems) => {
          // Create decorations for problem areas
          if (editorViewRef.current && problems.length > 0) {
            const decorationSet = createProblemDecorations(
              viewUpdate.state,
              problems,
            );

            // Update the editor view with decorations
            editorViewRef.current.dispatch({
              effects: [problemDecorationsEffect.of(decorationSet)],
            });
          } else if (editorViewRef.current) {
            // Clear decorations if no problems
            editorViewRef.current.dispatch({
              effects: [problemDecorationsEffect.of(Decoration.none)],
            });
          }
        });
      }
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
        problemDecorationsField,
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

    // Initial analysis for Python files when the editor is first created
    if (extension === "py" && treeSitterParser && parserInitialized) {
      analyzePythonCode(code).then((problems) => {
        if (problems.length > 0 && view) {
          const decorationSet = createProblemDecorations(view.state, problems);
          view.dispatch({
            effects: [problemDecorationsEffect.of(decorationSet)],
          });
        }
      });
    }

    return () => {
      view.destroy();
    };
  }, [cookies, treeSitterParser, parserInitialized]);

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

      // Re-analyze Python code after cascade update
      if (extension === "py" && treeSitterParser) {
        analyzePythonCode(file.content).then((problems) => {
          if (problems.length > 0) {
            const decorationSet = createProblemDecorations(
              editorViewRef.current.state,
              problems,
            );
            editorViewRef.current.dispatch({
              effects: [problemDecorationsEffect.of(decorationSet)],
            });
          } else {
            editorViewRef.current.dispatch({
              effects: [problemDecorationsEffect.of(Decoration.none)],
            });
          }
        });
      }
    }
  }, [file, cascadeUpdate, editorViewRef, treeSitterParser, extension]);

  return (
    <div className="editor-wrapper">
      <div className={`editor editor--${settings.fontSize}`} ref={editor}></div>
      {extension === "py" && !parserInitialized && (
        <div className="python-parser-loader">
          {t("editorPanel.pythonSyntaxErrors.loadingParser")}
        </div>
      )}
      {characterLimitExceeded && (
        <Alert
          title={t("editorPanel.characterLimitError")}
          type="error"
          text={t("editorPanel.characterLimitExplanation", {
            count: MAX_CHARACTERS,
          })}
        />
      )}
    </div>
  );
};

export default EditorPanel;
