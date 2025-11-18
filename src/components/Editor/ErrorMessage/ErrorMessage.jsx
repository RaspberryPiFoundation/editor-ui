import React, { useContext, useEffect, useRef, useState } from "react";

import "../../../assets/stylesheets/ErrorMessage.scss";

import { useSelector } from "react-redux";

import { SettingsContext } from "../../../utils/settings";

import {
  loadCopydeckFor,
  registerAdapter,
  pyodideAdapter,
  explain,
} from "@raspberrypifoundation/python-friendly-error-messages";

const ErrorMessage = () => {
  const message = useRef();
  const errorExplanation = useRef();
  const error = useSelector((state) => state.editor.error);
  const errorLine = useSelector((state) => state.editor.errorLine);
  // TODO: highlight the error line in the code editor
  // const errorLineNumber = useSelector((state) => state.editor.errorLineNumber);
  const settings = useContext(SettingsContext);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadCopydeckFor(navigator.language).then(() => {
      // TODO: adapt based on runner
      // state.editor.activeRunner (and/or loadedRunner) will provide either "pyodide" or "skulpt"
      registerAdapter("pyodide", pyodideAdapter);
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!message.current || !error || !isReady) return;
    try {
      const explanation = explain({
        error: error,
        code: errorLine,
        // TODO: set dynamically (based on what?)
        audience: "beginner",
        verbosity: "guided",
      });
      const explained = explanation.html || explanation.summary;
      message.current.innerHTML = error;
      if (explained) {
        errorExplanation.current.innerHTML += `${explained}`;
      }
    } catch {
      message.current.innerHTML = error;
    }
  }, [error, errorLine, isReady]);

  return error ? (
    <div className={`error-message error-message--${settings.fontSize}`}>
      <pre ref={message} className="error-message__content"></pre>
      <div
        className={`error-explanation error-explanation--${settings.fontSize}`}
      >
        <div
          ref={errorExplanation}
          className="error-explanation__content"
        ></div>
      </div>
    </div>
  ) : null;
};

export default ErrorMessage;
