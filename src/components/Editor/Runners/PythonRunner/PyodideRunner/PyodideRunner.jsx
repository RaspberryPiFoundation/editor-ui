import "../../../../../assets/stylesheets/PythonRunner.scss";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  setError,
  codeRunHandled,
  loadingRunner,
} from "../../../../../redux/EditorSlice";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useMediaQuery } from "react-responsive";
import { MOBILE_MEDIA_QUERY } from "../../../../../utils/mediaQueryBreakpoints";
import ErrorMessage from "../../../ErrorMessage/ErrorMessage";
import { createError } from "../../../../../utils/apiCallHandler";
import VisualOutputPane from "./VisualOutputPane";
import OutputViewToggle from "../OutputViewToggle";
import { SettingsContext } from "../../../../../utils/settings";
import RunnerControls from "../../../../RunButton/RunnerControls";

/**
 * A Worker that can be run on a different origin by respecting CORS
 * By default, a Worker constructor that uses an url as its parameters ignores CORS
 * and fails on a different origin.
 * This way we can run web worker on scripts served by a CDN
 */
export class CorsWorker {
  /**
   * @param {string | URL} url - worker script URL
   * @param {WorkerOptions} [options] - worker options
   */
  constructor(url, options) {
    this.url = url;
    this.options = options;
    // const absoluteUrl = new URL(url, window.location.href).toString();
    // const workerSource = `\
    //   const urlString = ${JSON.stringify(absoluteUrl)}
    //   const originURL = new URL(urlString)
    //   const isValidUrl = (urlString) => {
    //     try { return Boolean(new URL(urlString, originURL)) } catch(e){ return false }
    //   }
    //   const originalImportScripts = self.importScripts
    //   self.importScripts = (url) => {
    //     /* see note 1 below */
    //     if(url.startsWith("blob:") && isValidUrl(url.replace("blob:", ""))){
    //       const urlWithoutBlob = url.replace("blob:", "")
    //       const { pathname } = new URL(urlWithoutBlob, originURL)
    //       url = pathname && pathname.substring(1) /* see note 2 below */
    //     }
    //     originalImportScripts.call(self, new URL(url, originURL).toString())
    //   }
    //   importScripts(urlString);
    // `;
    // const blob = new Blob([workerSource], { type: "application/javascript" });
    // const objectURL = URL.createObjectURL(blob);
    // this.worker = new Worker(objectURL, options);
    // URL.revokeObjectURL(objectURL);
  }

  getWorker() {
    return this.worker;
  }

  async createWorker() {
    if (!this.url) {
      console.error("Worker URL is undefined");
      return;
    }

    if (!this.options) {
      console.warn("Worker options are undefined, using default options");
      this.options = {};
    }

    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch worker script: ${response.statusText}`,
        );
      }

      const scriptText = await response.text();
      const extendedScript = `
        /* global PyodideWorker */
        console.log("Worker loading");
        ${scriptText}
        const pyodide = PyodideWorker();
      `;

      const blob = new Blob([extendedScript], {
        type: "application/javascript",
      });
      const objectURL = URL.createObjectURL(blob);
      const worker = new Worker(objectURL, this.options);

      console.log("Worker created successfully");
      return worker;
    } catch (error) {
      console.error("Error creating worker:", error);
    }
  }

  /*
      The notes here are outside workerSource to not increase the ObjectURL size with
    long explanations as comments

    Note 1
    ======
      Sometimes Webpack will try to import url with "blob:" prefixed and with relative
    path as absolute path.

      Not only this will cause a security error due to different url, such as a "blob:" 
    protocol (meaning a CORS error), the path will be wrong. Any of those 2 problems 
    fails the importScripts. Since we can import JS with blobs, lets just remove "blob:"
    prefix and fix the URL its content is a valid URL

    Note 2
    ======
       URL#pathname always starts with "/", we want to remove the / to be a relative path
     to the Worker file URL

   */
}

export class CorsWorker2 {
  constructor(url) {
    // Get the public path (if available) - this might be specific to your environment
    const publicPath =
      typeof __webpack_public_path__ !== "undefined"
        ? __webpack_public_path__
        : "";

    // Create a blob with the worker code, including the public path and imported script
    const workerCode = `
      /* global PyodideWorker */
      const publicPath = ${JSON.stringify(publicPath)};
      globalThis = new Proxy(globalThis, {
        get: (target, prop) => prop === 'location' ? publicPath : target[prop]
      });
      try {
        importScripts(${JSON.stringify(url.toString())});
        const pyodide = PyodideWorker();
      } catch (e) {
        console.error('Failed to load script:', e);
      }
    `;
    const blob = new Blob([workerCode], { type: "application/javascript" });

    // Create an object URL for the blob
    const objectURL = URL.createObjectURL(blob);

    // Create the worker using the object URL
    this._worker = new Worker(objectURL);

    // Revoke the object URL to release resources
    URL.revokeObjectURL(objectURL);
  }

  getWorker() {
    return this._worker;
  }
}

const PyodideRunner = (props) => {
  // const pyodideWorker = new Worker(
  //   new URL("./PyodideWorker.js", import.meta.url),
  // );

  // if (!props) {
  //   return null;
  // }

  const { active } = props;

  const getWorkerURL = (url) => {
    const content = `
      /* global PyodideWorker */
      console.log("Worker loading");
      importScripts("${url}");
      const pyodide = PyodideWorker();
      console.log("Worker loaded");
    `;
    const blob = new Blob([content], { type: "application/javascript" });
    return URL.createObjectURL(blob);
  };

  // const pyodideWorker = useMemo(
  //   () =>
  //     new CorsWorker(new URL("./PyodideWorker.js", import.meta.url), {
  //       type: "classic",
  //       name: "PyodideWorker",
  //     }).getWorker(),
  //   [],
  // );

  // Blob approach - works in web component but not in the editor
  // Uncaught NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'http://localhost:3011/PyodideWorker.js' failed to load.
  // const workerUrl = getWorkerURL(`${process.env.PUBLIC_URL}/PyodideWorker.js`);
  // const pyodideWorker = useMemo(() => new Worker(workerUrl), []);

  // CORS worker - works in web component but not in the editor
  // Uncaught NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'http://localhost:3012/en/projects/PyodideWorker.js' failed to load.
  // const workerUrl = new CorsWorker("./PyodideWorker.js", {
  // const workerUrl = new CorsWorker(
  //   `${process.env.PUBLIC_URL}/PyodideWorker.js`,
  //   {
  //     type: "classic",
  //   },
  // );
  // const workerUrl = new CorsWorker(
  //   `${process.env.PUBLIC_URL}/PyodideWorker.js`,
  // );
  // const pyodideWorker = useMemo(() => workerUrl.getWorker(), []);

  // CORS worker - async fetch approach - works in both but targeted headers needed for pygal and sense_hat imports
  // const [pyodideWorker, setPyodideWorker] = useState(null);

  // useMemo(() => {
  //   const workerUrl = new CorsWorker(
  //     new URL("/PyodideWorker.js", process.env.PUBLIC_URL),
  //     { type: "classic" },
  //   );
  //   workerUrl
  //     .createWorker()
  //     .then((worker) => {
  //       setPyodideWorker(worker);
  //     })
  //     .catch((error) => {
  //       console.error("Failed to create worker:", error);
  //     });
  // }, []);

  // Blob approach + targeted headers - no errors but headers required in host app to interrupt code
  const workerUrl = getWorkerURL(`${process.env.PUBLIC_URL}/PyodideWorker.js`);
  const pyodideWorker = useMemo(() => new Worker(workerUrl), []);

  // Altered CORS worker 2 - works in web component but not in the editor
  // const pyodideWorker = new CorsWorker2(
  //   new URL("http://localhost:3011/PyodideWorker.js"),
  // ).getWorker();

  // pyodideWorker.onerror = (event) => {
  //   console.error("Worker error:", event);
  // };

  // DOESN'T WORK
  // const pyodideWorker = await workerUrl.createWorker();
  // const pyodideWorker = useMemo(() => workerUrl.createWorker(), []);
  // const pyodideWorker = useMemo(() => new Worker(PyodideWorker), []);
  // const pyodideWorker = useMemo(() => new Worker(`./PyodideWorker.js`, []));

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
  const [showRunner, setShowRunner] = useState(active);

  useEffect(() => {
    if (pyodideWorker) {
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
            handleError(
              data.file,
              data.line,
              data.mistake,
              data.type,
              data.info,
            );
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
    }
  }, []);

  useEffect(() => {
    if (codeRunTriggered && active) {
      console.log("running with pyodide");
      handleRun();
    }
  }, [codeRunTriggered]);

  useEffect(() => {
    if (codeRunTriggered) {
      setShowRunner(active);
    }
  }, [codeRunTriggered]);

  useEffect(() => {
    if (codeRunStopped && active) {
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
    if (stdinClosed.current) {
      stdinBuffer.current[0] = -1;
      return;
    }

    const outputPane = output.current;
    outputPane.appendChild(inputSpan());

    const element = getInputElement();
    const { content, ctrlD } = await getInputContent(element);

    const encoder = new TextEncoder();
    const bytes = encoder.encode(content + "\n");

    const previousLength = stdinBuffer.current[0];
    stdinBuffer.current.set(bytes, previousLength);

    const currentLength = previousLength + bytes.length;
    stdinBuffer.current[0] = currentLength;

    if (ctrlD) {
      stdinClosed.current = true;
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

    const program = projectCode.find(
      (component) => component.name === "main" && component.extension === "py",
    ).content;

    if (interruptBuffer.current) {
      interruptBuffer.current[0] = 0;
    }
    pyodideWorker.postMessage({ method: "runPython", python: program });
  };

  const handleStop = () => {
    if (interruptBuffer.current) {
      interruptBuffer.current[0] = 2;
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

  if (!pyodideWorker) {
    console.error("PyodideWorker is not initialized");
    return;
  } else {
    console.log("IT WORKED!!");
  }

  return (
    <div
      className={`pythonrunner-container pyodiderunner${
        active ? " pyodiderunner--active" : ""
      }`}
      style={{ display: showRunner ? "flex" : "none" }}
    >
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
