/* eslint import/no-webpack-loader-syntax: off */
/* eslint-disable react-hooks/exhaustive-deps */

import "../../../../assets/stylesheets/PythonRunner.scss";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  setError,
  codeRunHandled,
  loadingRunner,
} from "../../../../redux/EditorSlice";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useMediaQuery } from "react-responsive";
import { MOBILE_MEDIA_QUERY } from "../../../../utils/mediaQueryBreakpoints";
import ErrorMessage from "../../ErrorMessage/ErrorMessage";
import VisualOutputPane from "./VisualOutputPane";
import OutputViewToggle from "../PythonRunner/OutputViewToggle";
import { SettingsContext } from "../../../../utils/settings";
import RunnerControls from "../../../RunButton/RunnerControls";
import PyodideWorker from "worker-loader!./PyodideWorker.js";

const PyodideRunner = () => {
  const pyodideWorker = useMemo(() => new PyodideWorker(), []);
  const interruptBuffer = useRef();
  const stdinBuffer = useRef();
  const stdinClosed = useRef();
  const projectCode = useSelector((s) => s.editor.project.components);
  const isSplitView = useSelector((s) => s.editor.isSplitView);
  const isEmbedded = useSelector((s) => s.editor.isEmbedded);
  const codeRunTriggered = useSelector((s) => s.editor.codeRunTriggered);
  const codeRunStopped = useSelector((s) => s.editor.codeRunStopped);
  const drawTriggered = useSelector((s) => s.editor.drawTriggered);
  const senseHatAlwaysEnabled = useSelector((s) => s.editor.senseHatAlwaysEnabled);
  const output = useRef();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const visualOutput = {};

  const queryParams = new URLSearchParams(window.location.search);
  const [hasVisualOutput, setHasVisualOutput] = useState(
    queryParams.get("show_visual_tab") === "true" || senseHatAlwaysEnabled,
  );

  useEffect(() => {
    pyodideWorker.onmessage = ({ data }) => {
      if (data.method === "handleLoading") { handleLoading(); }
      if (data.method === "handleLoaded") { handleLoaded(data.stdinBuffer, data.interruptBuffer) }
      if (data.method === "handleInput") { handleInput(); }
      if (data.method === "handleOutput") { handleOutput(data.stream, data.content); }
      if (data.method === "handleError") { handleError(data.file, data.line, data.mistake, data.type, data.content); }
      if (data.method === "handleVisual") { handleVisual(data.origin, data.content); }
      if (data.method === "handleSenseHatEvent") { handleSenseHatEvent(data.type); }
    };
  }, []);

  useEffect(() => {
    if (codeRunTriggered) {
      handleRun();
    }
  }, [codeRunTriggered]);

  useEffect(() => {
    if (codeRunStopped) {
      handleStop();
    }
  }, [codeRunStopped]);

  const handleLoading = () => {
    dispatch(loadingRunner());
  };

  const handleLoaded = (stdin, interrupt) => {
    stdinBuffer.current = stdin;
    interruptBuffer.current = interrupt;
    dispatch(codeRunHandled());
  };

  const handleInput = async () => {
    // TODO: Sk.sense_hat.mz_criteria.noInputEvents = false;

    const outputPane = output.current;
    outputPane.appendChild(inputSpan());

    const element = getInputElement();

    if (stdinClosed.current) {
      stdinBuffer.current[0] = -1;
      return;
    }

    const { content, ctrlC, ctrlD, ctrlZ } = await getInputContent(element);

    if (ctrlC || ctrlZ) {
      handleStop();
      return;
    }

    const encoder = new TextEncoder();

    const lineFeed = ctrlD ? "" : "\r\n";
    const bytes = encoder.encode(content + "\r\n");

    const previousLength = stdinBuffer.current[0];
    stdinBuffer.current.set(bytes, previousLength);

    const currentLength = previousLength + bytes.length;
    stdinBuffer.current[0] = currentLength;

    if (ctrlD) {
      stdinClosed.current = true; // Don't accept any more stdin this run.
    }
  };

  const handleOutput = (stream, content) => {
    const node = output.current;
    const div = document.createElement("span");
    div.classList.add("pythonrunner-console-output-line");
    div.classList.add(stream);
    div.innerHTML = new Option(content || " ").innerHTML + "\n";
    node.appendChild(div);
    node.scrollTop = node.scrollHeight;
  };

  const handleError = (file, line, mistake, type, content) => {
    let errorMessage;

    if (type === "KeyboardInterrupt") {
      errorMessage = "Execution interrupted";
    } else {
      const message = [type, content].filter(s => s).join(": ");
      errorMessage = [message, `on line ${line} of ${file}`].join(" ");

      if (mistake) {
        errorMessage += `:\n${mistake}`;
      }
    }

    dispatch(setError(errorMessage));
  };

  const handleVisual = (origin, content) => {
    visualOutput?.handleVisual?.(origin, content);
  };

  const handleSenseHatEvent = (type) => {
    console.log("handleSenseHatEvent");
  };

  const handleRun = () => {
    const program = projectCode[0].content;

    for (const { name, extension, content } of projectCode) {
      const filename = [name, extension].join(".");
      pyodideWorker.postMessage({ method: "writeFile", filename, content });
    }

    output.current.innerHTML = "";
    dispatch(setError(""));
    visualOutput?.clear?.();
    stdinClosed.current = false;

    interruptBuffer.current[0] = 0; // Clear previous signals.
    pyodideWorker.postMessage({ method: "runPython", python: program });
  };

  const handleStop = () => {
    interruptBuffer.current[0] = 2; // Send a SIGINT signal.
    pyodideWorker.postMessage({ method: "stopPython" });
  };

  const inputSpan = () => {
    const span = document.createElement("span");
    span.setAttribute("id", "input");
    span.setAttribute("spellCheck", "false");
    span.setAttribute("class", "pythonrunner-input");
    span.setAttribute("contentEditable", "true");
    return span;
  };

  const getInputElement = () => {
    const pageInput = document.getElementById("input");
    const webComponentInput = document.querySelector("editor-wc")
      ? document.querySelector("editor-wc").shadowRoot.getElementById("input")
      : null;
    return pageInput || webComponentInput;
  };

  const getInputContent = async (element) => {
    element.focus();

    return new Promise(function (resolve, reject) {
      element.addEventListener("keydown", function removeInput(e) {
        const ctrlC = e.ctrlKey && e.key.toLowerCase() === "c";
        const ctrlD = e.ctrlKey && e.key.toLowerCase() === "d";
        const ctrlZ = e.ctrlKey && e.key.toLowerCase() === "z";

        const lineEnded = e.key === "Enter" || ctrlC || ctrlD || ctrlZ;

        if (lineEnded) {
          element.removeEventListener(e.type, removeInput);
          // resolve the promise with the value of the input field
          const content = element.innerText;
          element.removeAttribute("id");
          element.removeAttribute("contentEditable");
          element.innerText = content + "\n";

          document.addEventListener("keyup", function storeInput(e) {
            if (lineEnded) {
              document.removeEventListener(e.type, storeInput);
              resolve({ content, ctrlC, ctrlD, ctrlZ });
            }
          });
        }
      });
    });
  };

  const shiftFocusToInput = (event) => {
    if (document.getSelection().toString().length > 0) {
      return;
    }

    const inputBox = getInputElement();
    if (inputBox && event.target !== inputBox) {
      const input = getInputElement();
      const selection = window.getSelection();
      selection.removeAllRanges();

      if (input.innerText && input.innerText.length > 0) {
        const range = document.createRange();
        range.setStart(input, 1);
        range.collapse(true);
        selection.addRange(range);
      }
      input.focus();
    }
  }

  return (
    <div className={`pythonrunner-container`}>
      {isSplitView ? (
        <>
          {hasVisualOutput ? (
            <div className="output-panel output-panel--visual">
              <Tabs forceRenderTabPanel={true}>
                <div className="react-tabs__tab-container">
                  <TabList>
                    <Tab key={0}>
                      <span className="react-tabs__tab-text">
                        {t("output.visualOutput")}
                      </span>
                    </Tab>
                  </TabList>
                  {!isEmbedded && hasVisualOutput ? <OutputViewToggle /> : null}
                  {!isEmbedded && isMobile ? <RunnerControls skinny /> : null}
                </div>
                <TabPanel key={0}>
                  <VisualOutputPane visualOutput={visualOutput} />
                </TabPanel>
              </Tabs>
            </div>
          ) : null}
          <div className="output-panel output-panel--text">
            <Tabs forceRenderTabPanel={true}>
              <div className="react-tabs__tab-container">
                <TabList>
                  <Tab key={0}>
                    <span className="react-tabs__tab-text">
                      {t("output.textOutput")}
                    </span>
                  </Tab>
                </TabList>
                {!hasVisualOutput && !isEmbedded && isMobile ? (
                  <RunnerControls skinny />
                ) : null}
              </div>
              <ErrorMessage />
              <TabPanel key={0}>
                <pre
                  className={`pythonrunner-console pythonrunner-console--${settings.fontSize}`}
                  onClick={shiftFocusToInput}
                  ref={output}
                ></pre>
              </TabPanel>
            </Tabs>
          </div>
        </>
      ) : (
        <Tabs forceRenderTabPanel={true} defaultIndex={hasVisualOutput ? 0 : 1}>
          <div className="react-tabs__tab-container">
            <TabList>
              {hasVisualOutput ? (
                <Tab key={0}>
                  <span className="react-tabs__tab-text">
                    {t("output.visualOutput")}
                  </span>
                </Tab>
              ) : null}
              <Tab key={1}>
                <span className="react-tabs__tab-text">
                  {t("output.textOutput")}
                </span>
              </Tab>
            </TabList>
            {!isEmbedded && hasVisualOutput ? <OutputViewToggle /> : null}
            {!isEmbedded && isMobile ? <RunnerControls skinny /> : null}
          </div>
          <ErrorMessage />
          {hasVisualOutput ? (
            <TabPanel key={0}>
              <VisualOutputPane visualOutput={visualOutput} />
            </TabPanel>
          ) : null}
          <TabPanel key={1}>
            <pre
              className={`pythonrunner-console pythonrunner-console--${settings.fontSize}`}
              onClick={shiftFocusToInput}
              ref={output}
            ></pre>
          </TabPanel>
        </Tabs>
      )}
    </div>
  );
};

export default PyodideRunner;
