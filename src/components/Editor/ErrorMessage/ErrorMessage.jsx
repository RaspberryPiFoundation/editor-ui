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
  const error = useSelector((state) => state.editor.error);
  const settings = useContext(SettingsContext);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadCopydeckFor(navigator.language).then(() => {
      registerAdapter("pyodide", pyodideAdapter);
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!message.current || !error || !isReady) return;

    try {
      const result = explain({ error });
      const explained = result.html || result.summary;
      message.current.innerHTML =
        error + (explained ? `<br/><br/>${explained}` : "");
    } catch {
      message.current.innerHTML = error;
    }
  }, [error, isReady]);

  return error ? (
    <div className={`error-message error-message--${settings.fontSize}`}>
      <pre ref={message} className="error-message__content"></pre>
    </div>
  ) : null;
};

export default ErrorMessage;
