/* eslint-disable react-hooks/exhaustive-deps */
import "../../../../assets/stylesheets/PythonRunner.scss";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import {
  codeRunHandled,
  loadingRunner,
  setError,
  setLoadedRunner,
} from "../../../../redux/EditorSlice";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { useMediaQuery } from "react-responsive";
import { MOBILE_MEDIA_QUERY } from "../../../../utils/mediaQueryBreakpoints";
import ErrorMessage from "../../ErrorMessage/ErrorMessage";
import ApiCallHandler from "../../../../utils/apiCallHandler";
import { SettingsContext } from "../../../../utils/settings";
import RunnerControls from "../../../RunButton/RunnerControls";

const toBase64ArrayBuffer = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const findEntryFile = ({ projectCode, openFiles, focussedFileIndex }) => {
  const focusedOpenFile = openFiles?.[focussedFileIndex];
  if (focusedOpenFile && focusedOpenFile.endsWith(".rb")) {
    return focusedOpenFile;
  }

  const mainRuby = projectCode.find(
    (component) =>
      component?.name === "main" &&
      component?.extension?.toLowerCase() === "rb",
  );
  if (mainRuby) {
    return "main.rb";
  }

  const firstRuby = projectCode.find(
    (component) => component?.extension?.toLowerCase() === "rb",
  );
  if (firstRuby) {
    return `${firstRuby.name}.${firstRuby.extension}`;
  }

  const firstFile = projectCode[0];
  if (firstFile) {
    return `${firstFile.name}.${firstFile.extension}`;
  }

  return "main.rb";
};

const RubyRunner = ({ outputPanels = ["text", "visual"] }) => {
  const [rubyWorker, setRubyWorker] = useState(null);
  const workerRef = useRef(null);
  const debugRubyRunner =
    new URLSearchParams(window.location.search).get("debug_ruby_runner") ===
    "true";

  const loadedRunner = useSelector((state) => state.editor.loadedRunner);
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const projectCode = useSelector((state) => state.editor.project.components);
  const projectIdentifier = useSelector((s) => s.editor.project.identifier);
  const focussedFileIndex = useSelector(
    (state) => state.editor.focussedFileIndices,
  )[0];
  const openFiles = useSelector((state) => state.editor.openFiles)[0];
  const user = useSelector((s) => s.auth.user);
  const userId = user?.profile?.user;
  const isEmbedded = useSelector((s) => s.editor.isEmbedded);
  const reactAppApiEndpoint = useSelector((s) => s.editor.reactAppApiEndpoint);
  const codeRunTriggered = useSelector((s) => s.editor.codeRunTriggered);
  const codeRunStopped = useSelector((s) => s.editor.codeRunStopped);
  const output = useRef();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const singleOutputPanel = outputPanels.length === 1;
  const showTextOutputPanel =
    outputPanels.includes("text") || outputPanels.length === 0;

  const appendOutput = (stream, content) => {
    const node = output.current;
    if (!node) {
      return;
    }

    const span = document.createElement("span");
    span.classList.add("pythonrunner-console-output-line");
    span.classList.add(stream || "stdout");
    span.textContent = content || "";
    node.appendChild(span);
    node.scrollTop = node.scrollHeight;
  };

  const appendDebug = (message) => {
    if (!message) {
      return;
    }

    console.debug(`[RubyRunner] ${message}`);

    if (debugRubyRunner) {
      appendOutput("stderr", `[ruby-debug] ${message}\n`);
    }
  };

  const handleWorkerError = (errorMessage) => {
    const message = errorMessage || "Ruby runtime error";

    const { createError } = ApiCallHandler({
      reactAppApiEndpoint,
    });
    createError(projectIdentifier, userId, {
      errorType: "RubyError",
      errorMessage: message,
    });

    dispatch(setError(message));
    dispatch(codeRunHandled());
  };

  const initialiseWorker = () => {
    dispatch(loadingRunner("ruby"));

    const worker = new window.Worker(
      `${process.env.PUBLIC_URL}/RubyWorker.js`,
      {
        type: "module",
      },
    );
    workerRef.current = worker;
    setRubyWorker(worker);

    worker.onmessage = ({ data }) => {
      switch (data.method) {
        case "handleLoaded":
          appendDebug("Worker loaded");
          if (loadedRunner !== "ruby") {
            dispatch(setLoadedRunner("ruby"));
          }
          dispatch(codeRunHandled());
          break;
        case "handleDebug":
          appendDebug(data.message);
          break;
        case "handleOutput":
          appendOutput(data.stream, data.content);
          break;
        case "handleError":
          appendDebug(`Worker error: ${data.message}`);
          handleWorkerError(data.message);
          break;
        case "handleDone":
          appendDebug("Worker done");
          dispatch(codeRunHandled());
          break;
        default:
          throw new Error(`Unsupported method: ${data.method}`);
      }
    };

    worker.onerror = (event) => {
      appendDebug(`Worker crashed: ${event?.message || "unknown error"}`);
      handleWorkerError(event?.message || "Ruby worker crashed");
    };
  };

  useEffect(() => {
    initialiseWorker();

    return () => {
      if (typeof workerRef.current?.terminate === "function") {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (codeRunTriggered && rubyWorker && output.current) {
      handleRun();
    }
  }, [codeRunTriggered, rubyWorker]);

  useEffect(() => {
    if (codeRunStopped && rubyWorker) {
      handleStop();
    }
  }, [codeRunStopped, rubyWorker]);

  const handleRun = async () => {
    output.current.innerHTML = "";
    dispatch(setError(""));

    appendDebug("Preparing files for Ruby run");

    const files = {};
    for (const { name, extension, content } of projectCode) {
      files[`${name}.${extension}`] = content;
    }

    const imageWrites = await Promise.allSettled(
      (projectImages || []).map(async ({ filename, url }) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return {
          filename,
          content: {
            encoding: "base64",
            content: toBase64ArrayBuffer(buffer),
          },
        };
      }),
    );

    for (const write of imageWrites) {
      if (write.status === "fulfilled") {
        files[write.value.filename] = write.value.content;
      }
    }

    rubyWorker.postMessage({
      method: "runRuby",
      files,
      activeFile: findEntryFile({
        projectCode,
        openFiles,
        focussedFileIndex,
      }),
    });

    appendDebug("Posted runRuby message to worker");
  };

  const handleStop = () => {
    if (typeof workerRef.current?.terminate !== "function") {
      return;
    }

    workerRef.current.terminate();
    workerRef.current = null;
    setRubyWorker(null);

    dispatch(setError(t("output.errors.interrupted")));
    dispatch(codeRunHandled());
    initialiseWorker();
  };

  if (!showTextOutputPanel) {
    return null;
  }

  return (
    <div
      className={classNames(
        "pythonrunner-container",
        "pyodiderunner",
        "pyodiderunner--active",
      )}
    >
      <div className="output-panel output-panel--text">
        <Tabs forceRenderTabPanel={true}>
          <div
            className={classNames("react-tabs__tab-container", {
              "react-tabs__tab-container--hidden": singleOutputPanel,
            })}
          >
            <TabList>
              <Tab key={0}>
                <span className="react-tabs__tab-text">
                  {t("output.textOutput")}
                </span>
              </Tab>
            </TabList>
            {!isEmbedded && isMobile && <RunnerControls skinny />}
          </div>
          <ErrorMessage />
          <TabPanel key={0}>
            <pre
              className={`pythonrunner-console pythonrunner-console--${settings.fontSize}`}
              ref={output}
            ></pre>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default RubyRunner;
