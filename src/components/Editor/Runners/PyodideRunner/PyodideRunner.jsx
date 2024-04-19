/* eslint import/no-webpack-loader-syntax: off */
/* eslint-disable react-hooks/exhaustive-deps */

import "../../../../assets/stylesheets/PythonRunner.scss";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
import { createError } from "../../../../utils/apiCallHandler";
import VisualOutputPane from "./VisualOutputPane";
import OutputViewToggle from "../PythonRunner/OutputViewToggle";
import { SettingsContext } from "../../../../utils/settings";
import RunnerControls from "../../../RunButton/RunnerControls";
// import PyodideWorker from "worker-loader!./PyodideWorker.js";
// import PyodideWorker from "worker-plugin/loader!?esModule./PyodideWorkerObj.js";
// import PyodideWorker from "worker-plugin/loader!./PyodideWorker.js"; // outputs a string like 0.web-component.worker.js
// import serviceWorker from "worker-loader!../../../../utils/PyodideServiceWorker.js";
// import serviceWorker from "../../../../utils/PyodideServiceWorker.js";

// import fileContent from "./PyodideWorkerObj.js";
// import fileContent from "./PyodideWorker.js";

// const blob = new Blob([fileContent], { type: "application/javascript" }); // Create a blob from the imported file
// const url = URL.createObjectURL(blob); // Create a blob URL

const getWorkerURL = (url) => {
  const content = `importScripts("${url}");`;
  const blob = new Blob([content], { type: "application/javascript" });
  return URL.createObjectURL(blob);
};

const workerUrl = getWorkerURL(`${process.env.PUBLIC_URL}/PyodideWorker.js`);
// const serviceWorkerUrl = getWorkerURL(
//   `${process.env.PUBLIC_URL}/PyodideServiceWorker.js`,
// );

const PyodideRunner = () => {
  // const pyodideWorker = useMemo(
  //   () =>
  //     // new Worker(`${process.env.PUBLIC_URL}/PyodideWorker.js`, {
  //     // new Worker(new URL("./PyodideWorker.js", import.meta.url), {
  //     new Worker(`./PyodideWorker.js`, {
  //       type: "module",
  //       // credentials: "omit", // or "same-origin" if your server requires cookies or HTTP authentication
  //     }),
  //   [],
  // );
  // const pyodideWorker = useMemo(() => new PyodideWorker(), []);
  // const pyodideWorker = useMemo(() => new Worker(PyodideWorker), []);
  // const pyodideWorker = useMemo(() => PyodideWorker, []);
  // const pyodideWorker = useMemo(() => new Worker(url, { type: "module" }), []);
  const pyodideWorker = useMemo(() => new Worker(workerUrl), []);
  // const pyodideWorker = useMemo(() => new Worker(PyodideWorker()), []);
  const interruptBuffer = useRef();
  const stdinBuffer = useRef();
  const stdinClosed = useRef();
  const projectImages = useSelector((s) => s.editor.project.image_list);
  const projectCode = useSelector((s) => s.editor.project.components);
  const projectIdentifier = useSelector((s) => s.editor.project.identifier);
  const user = useSelector((s) => s.auth.user);
  const userId = user?.profile?.user;
  const isSplitView = useSelector((s) => s.editor.isSplitView);
  const isEmbedded = useSelector((s) => s.editor.isEmbedded);
  const codeRunTriggered = useSelector((s) => s.editor.codeRunTriggered);
  const codeRunStopped = useSelector((s) => s.editor.codeRunStopped);
  const output = useRef();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const senseHatAlways = useSelector((s) => s.editor.senseHatAlwaysEnabled);
  const queryParams = new URLSearchParams(window.location.search);
  const showVisualTab = queryParams.get("show_visual_tab") === "true";
  const [hasVisual, setHasVisual] = useState(showVisualTab || senseHatAlways);
  const [visuals, setVisuals] = useState([]);

  // const getBlobURL = (code, type) => {
  //   const blob = new Blob([code], { type });
  //   return URL.createObjectURL(blob);
  // };

  useEffect(() => {
    console.log("trying registering service worker");
    if ("serviceWorker" in navigator) {
      console.log("registering service worker");
      navigator.serviceWorker
        // .register("./PyodideServiceWorker.js")
        // .register(`${process.env.PUBLIC_URL}/PyodideServiceWorker.js`)
        .register(`${window.location.origin}/PyodideServiceWorker.js`)
        // .register(serviceWorker)
        // .register(getBlobURL(serviceWorker, "application/javascript"))
        // .register(serviceWorkerUrl)
        .then((registration) => {
          if (!registration.active || !navigator.serviceWorker.controller) {
            console.log("registered");
            window.location.reload();
          }
        });
    }
  }, []);

  useEffect(() => {
    pyodideWorker.onmessage = ({ data }) => {
      switch (data.method) {
        case "handleLoading":
          handleLoading();
          break;
        case "handleLoaded":
          handleLoaded(data.stdinBuffer, data.interruptBuffer);
          break;
        case "handleInput":
          handleInput();
          break;
        case "handleOutput":
          handleOutput(data.stream, data.content);
          break;
        case "handleError":
          handleError(data.file, data.line, data.mistake, data.type, data.info);
          break;
        case "handleVisual":
          handleVisual(data.origin, data.content);
          break;
        case "handleSenseHatEvent":
          handleSenseHatEvent(data.type);
          break;
        default:
          throw new Error(`Unsupported method: ${data.method}`);
      }
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
    disableInput();
  };

  const handleInput = async () => {
    // TODO: Sk.sense_hat.mz_criteria.noInputEvents = false;

    if (stdinClosed.current) {
      stdinBuffer.current[0] = -1;
      return;
    }

    const outputPane = output.current;
    outputPane.appendChild(inputSpan());

    const element = getInputElement();
    const { content, ctrlD } = await getInputContent(element);

    const encoder = new TextEncoder();
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

  const handleError = (file, line, mistake, type, info) => {
    let errorMessage;

    if (type === "KeyboardInterrupt") {
      errorMessage = t("output.errors.interrupted");
    } else {
      const message = [type, info].filter((s) => s).join(": ");
      errorMessage = [message, `on line ${line} of ${file}`].join(" ");

      if (mistake) {
        errorMessage += `:\n${mistake}`;
      }

      createError(projectIdentifier, userId, { errorType: type, errorMessage });
    }

    dispatch(setError(errorMessage));
    disableInput();
  };

  const handleVisual = (origin, content) => {
    setHasVisual(true);
    setVisuals((array) => [...array, { origin, content }]);
  };

  const handleSenseHatEvent = (type) => {
    console.log("handleSenseHatEvent");
  };

  const handleRun = async () => {
    output.current.innerHTML = "";
    dispatch(setError(""));
    setVisuals([]);
    stdinClosed.current = false;

    await Promise.allSettled(
      projectImages.map(({ filename, url }) =>
        fetch(url)
          .then((response) => response.arrayBuffer())
          .then((buffer) => writeFile(filename, buffer)),
      ),
    );

    for (const { name, extension, content } of projectCode) {
      writeFile([name, extension].join("."), content);
    }

    const program = projectCode[0].content;

    if (interruptBuffer.current) {
      interruptBuffer.current[0] = 0; // Clear previous signals.
    }
    pyodideWorker.postMessage({ method: "runPython", python: program });
  };

  const handleStop = () => {
    if (interruptBuffer.current) {
      interruptBuffer.current[0] = 2; // Send a SIGINT signal.
    }
    pyodideWorker.postMessage({ method: "stopPython" });
    disableInput();
  };

  const writeFile = (filename, content) => {
    pyodideWorker.postMessage({ method: "writeFile", filename, content });
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
    return document.querySelector("editor-wc")
      ? document.querySelector("editor-wc").shadowRoot.getElementById("input")
      : document.getElementById("input");
  };

  const getInputContent = async (element) => {
    element.focus();

    return new Promise(function (resolve, reject) {
      element.addEventListener("keydown", function removeInput(e) {
        const ctrlD = e.ctrlKey && e.key.toLowerCase() === "d";
        const lineEnded = e.key === "Enter" || ctrlD;

        if (lineEnded) {
          element.removeEventListener(e.type, removeInput);
          const content = element.innerText;
          element.removeAttribute("id");
          element.removeAttribute("contentEditable");
          element.innerText = content + "\n";

          document.addEventListener("keyup", function storeInput(e) {
            if (lineEnded) {
              document.removeEventListener(e.type, storeInput);
              resolve({ content, ctrlD });
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
  };

  const disableInput = () => {
    const element = getInputElement();

    if (element) {
      element.removeAttribute("id");
      element.removeAttribute("contentEditable");
    }
  };

  return (
    <div className={`pythonrunner-container`}>
      {isSplitView ? (
        <>
          {hasVisual && (
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
                  {!isEmbedded && hasVisual && <OutputViewToggle />}
                  {!isEmbedded && isMobile && <RunnerControls skinny />}
                </div>
                <TabPanel key={0}>
                  <VisualOutputPane visuals={visuals} setVisuals={setVisuals} />
                </TabPanel>
              </Tabs>
            </div>
          )}
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
                {!hasVisual && !isEmbedded && isMobile && (
                  <RunnerControls skinny />
                )}
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
        <Tabs forceRenderTabPanel={true} defaultIndex={hasVisual ? 0 : 1}>
          <div className="react-tabs__tab-container">
            <TabList>
              {hasVisual && (
                <Tab key={0}>
                  <span className="react-tabs__tab-text">
                    {t("output.visualOutput")}
                  </span>
                </Tab>
              )}
              <Tab key={1}>
                <span className="react-tabs__tab-text">
                  {t("output.textOutput")}
                </span>
              </Tab>
            </TabList>
            {!isEmbedded && hasVisual && <OutputViewToggle />}
            {!isEmbedded && isMobile && <RunnerControls skinny />}
          </div>
          <ErrorMessage />
          {hasVisual && (
            <TabPanel key={0}>
              <VisualOutputPane visuals={visuals} setVisuals={setVisuals} />
            </TabPanel>
          )}
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
