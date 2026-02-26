/* eslint-disable react-hooks/exhaustive-deps */
import "../../../../../assets/stylesheets/PythonRunner.scss";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Sk from "skulpt";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";
import {
  setError,
  setErrorDetails,
  codeRunHandled,
  stopDraw,
  setSenseHatEnabled,
  triggerDraw,
  setLoadedRunner,
} from "../../../../../redux/EditorSlice";
import ErrorMessage from "../../../ErrorMessage/ErrorMessage";
import ApiCallHandler from "../../../../../utils/apiCallHandler";
import store from "../../../../../redux/stores/WebComponentStore";
import VisualOutputPane from "../VisualOutputPane";
import OutputViewToggle from "../OutputViewToggle";
import { SettingsContext } from "../../../../../utils/settings";
import RunnerControls from "../../../../RunButton/RunnerControls";
import { MOBILE_MEDIA_QUERY } from "../../../../../utils/mediaQueryBreakpoints";
import { getPythonImports } from "../../../../../utils/getPythonImports";

const externalLibraries = {
  "./pygal/__init__.js": {
    path: `${process.env.ASSETS_URL}/shims/pygal/pygal.js`,
    dependencies: [
      "https://cdnjs.cloudflare.com/ajax/libs/highcharts/6.0.2/highcharts.js",
      "https://cdnjs.cloudflare.com/ajax/libs/highcharts/6.0.2/js/highcharts-more.js",
    ],
  },
  "./py5/__init__.js": {
    path: `${process.env.ASSETS_URL}/shims/processing/py5/py5-shim.js`,
    dependencies: [`${process.env.ASSETS_URL}/libraries/processing/p5/p5.js`],
  },
  "./py5_imported/__init__.js": {
    path: `${process.env.ASSETS_URL}/shims/processing/py5_imported_mode/py5_imported.js`,
  },
  "./py5_imported_mode.py": {
    path: `${process.env.ASSETS_URL}/shims/processing/py5_imported_mode/py5_imported_mode.py`,
  },
  "./p5/__init__.js": {
    path: `${process.env.ASSETS_URL}/shims/processing/p5/p5-shim.js`,
    dependencies: [`${process.env.ASSETS_URL}/libraries/processing/p5/p5.js`],
  },
  "./_internal_sense_hat/__init__.js": {
    path: `${process.env.ASSETS_URL}/shims/sense_hat/_internal_sense_hat.js`,
  },
  "./sense_hat.py": {
    path: `${process.env.ASSETS_URL}/shims/sense_hat/sense_hat_blob.py`,
  },
};

const VISUAL_LIBRARIES = [
  "pygal",
  "py5",
  "py5_imported",
  "p5",
  "sense_hat",
  "turtle",
];

const SkulptRunner = ({ active, outputPanels = ["text", "visual"] }) => {
  const loadedRunner = useSelector((state) => state.editor.loadedRunner);
  const projectCode = useSelector((state) => state.editor.project.components);
  const mainComponent = projectCode?.find(
    (component) => component.name === "main" && component.extension === "py",
  );
  const projectIdentifier = useSelector(
    (state) => state.editor.project.identifier,
  );
  const user = useSelector((state) => state.auth.user);
  const isSplitView = useSelector((state) => state.editor.isSplitView);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const isOutputOnly = useSelector((state) => state.editor.isOutputOnly);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const codeRunStopped = useSelector((state) => state.editor.codeRunStopped);
  const drawTriggered = useSelector((state) => state.editor.drawTriggered);
  const senseHatAlwaysEnabled = useSelector(
    (state) => state.editor.senseHatAlwaysEnabled,
  );
  const reactAppApiEndpoint = useSelector((s) => s.editor.reactAppApiEndpoint);
  const output = useRef();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  const project = useSelector((state) => state.editor.project);

  const testForVisualImports = (project) => {
    for (const component of project.components || []) {
      if (component.extension === "py") {
        try {
          const imports = getPythonImports(component.content, t);
          const hasVisualImports = imports.some((name) =>
            VISUAL_LIBRARIES.includes(name),
          );
          if (hasVisualImports) {
            return true;
          }
        } catch (error) {
          console.error("Error occurred while getting imports:", error);
        }
      }
    }
    return false;
  };

  const [codeHasVisualOutput, setCodeHasVisualOutput] = useState(
    !!senseHatAlwaysEnabled || testForVisualImports(project),
  );
  const [showVisualOutput, setShowVisualOutput] = useState(codeHasVisualOutput);

  const getInput = () => {
    const pageInput = document.getElementById("input");
    const webComponentInput = document.querySelector("editor-wc")
      ? document.querySelector("editor-wc").shadowRoot.getElementById("input")
      : null;
    return pageInput || webComponentInput;
  };

  useEffect(() => {
    if (!codeRunTriggered) {
      setCodeHasVisualOutput(
        !!senseHatAlwaysEnabled || testForVisualImports(project),
      );
    }
  }, [project, codeRunTriggered, senseHatAlwaysEnabled, t]);

  useEffect(() => {
    if (active && loadedRunner !== "skulpt") {
      dispatch(setLoadedRunner("skulpt"));
    }
  }, [active]);

  useEffect(() => {
    if (active) {
      if (codeRunTriggered) {
        runCode();
      }
    }
  }, [codeRunTriggered, active]);

  useEffect(() => {
    if (codeRunTriggered && !senseHatAlwaysEnabled) {
      setShowVisualOutput(!!codeHasVisualOutput);
    }
  }, [codeRunTriggered, codeHasVisualOutput]);

  useEffect(() => {
    if (codeRunStopped && active && getInput()) {
      const input = getInput();
      input.removeAttribute("id");
      input.removeAttribute("contentEditable");
      dispatch(setError(t("output.errors.interrupted")));
      dispatch(codeRunHandled());
    }
  }, [codeRunStopped]);

  useEffect(() => {
    if (!codeRunTriggered && !drawTriggered && active) {
      if (getInput()) {
        const input = getInput();
        input.removeAttribute("id");
        input.removeAttribute("contentEditable");
      }
    }
  }, [drawTriggered, codeRunTriggered]);

  const outf = (text) => {
    if (text !== "") {
      const node = output.current;
      if (node) {
        const div = document.createElement("span");
        div.classList.add("pythonrunner-console-output-line");
        div.innerHTML = new Option(text).innerHTML;
        node.appendChild(div);
        node.scrollTop = node.scrollHeight;
      }
    }
  };

  const builtinRead = (library) => {
    if (library === "./_internal_sense_hat/__init__.js") {
      dispatch(setSenseHatEnabled(true));
    }

    if (library === "./p5/__init__.js" || library === "./py5/__init__.js") {
      dispatch(triggerDraw());
    }

    // TODO: Handle pre-importing py5_imported when refactored py5 shim imported

    let localProjectFiles = projectCode
      .filter((component) => component.name !== "main")
      .map((component) => `./${component.name}.py`);

    if (localProjectFiles.includes(library)) {
      let filename = library.slice(2, -3);
      let component = projectCode.find((x) => x.name === filename);
      if (component) {
        return component.content;
      }
    }

    if (
      Sk.builtinFiles !== undefined &&
      Sk.builtinFiles["files"][library] !== undefined
    ) {
      return Sk.builtinFiles["files"][library];
    }

    if (externalLibraries[library]) {
      var externalLibraryInfo = externalLibraries[library];

      return (
        externalLibraries[library].code ||
        Sk.misceval.promiseToSuspension(
          fetch(externalLibraryInfo.path)
            .then((response) => response.text())
            .then((code) => {
              if (!code) {
                throw new Sk.builtin.ImportError(
                  "Failed to load remote module",
                );
              }
              externalLibraries[library].code = code;
              var promise;

              function mapUrlToPromise(path) {
                // If the script is already in the DOM don't add it again.
                const existingScriptElement = document.querySelector(
                  `script[src="${path}"]`,
                );
                if (!existingScriptElement) {
                  return new Promise(function (resolve, _reject) {
                    let scriptElement = document.createElement("script");
                    scriptElement.type = "text/javascript";
                    scriptElement.src = path;
                    scriptElement.async = true;
                    scriptElement.crossOrigin = "";
                    scriptElement.onload = function () {
                      resolve(true);
                    };

                    document.body.appendChild(scriptElement);
                  });
                }
              }
              if (externalLibraryInfo.loadDepsSynchronously) {
                promise = (externalLibraryInfo.dependencies || []).reduce(
                  (p, url) => {
                    return p.then(() => mapUrlToPromise(url));
                  },
                  Promise.resolve(),
                ); // initial
              } else {
                promise = Promise.all(
                  (externalLibraryInfo.dependencies || []).map(mapUrlToPromise),
                );
              }

              return promise
                .then(function () {
                  return code;
                })
                .catch(function () {
                  throw new Sk.builtin.ImportError(
                    "Failed to load dependencies required",
                  );
                });
            }),
        )
      );
    }

    throw new Error("File not found: '" + library + "'");
  };

  const inputSpan = () => {
    const span = document.createElement("span");
    span.setAttribute("id", "input");
    span.setAttribute("spellCheck", "false");
    span.setAttribute("class", "pythonrunner-input");
    span.setAttribute("contentEditable", "true");
    return span;
  };

  const inf = function () {
    if (Sk.sense_hat) {
      Sk.sense_hat.mz_criteria.noInputEvents = false;
    }
    const outputPane = output.current;
    outputPane.appendChild(inputSpan());

    const input = getInput();
    input.focus();

    return new Promise(function (resolve, reject) {
      input.addEventListener("keydown", function removeInput(e) {
        if (e.key === "Enter") {
          input.removeEventListener(e.type, removeInput);
          // resolve the promise with the value of the input field
          const answer = input.innerText;
          input.removeAttribute("id");
          input.removeAttribute("contentEditable");
          input.innerText = answer + "\n";

          document.addEventListener("keyup", function storeInput(e) {
            if (e.key === "Enter") {
              document.removeEventListener(e.type, storeInput);
              resolve(answer);
            }
          });
        }
      });
    });
  };

  const handleError = (err) => {
    let errorDetails = {};
    let errorMessage;
    let explanation;
    if (err.message === t("output.errors.interrupted")) {
      errorMessage = err.message;
      errorDetails = {
        type: "Interrupted",
        message: errorMessage,
      };
    } else {
      const errorDescription = (err.tp$str && err.tp$str().v)
        .replace(/\[(.*?)\]/, "")
        .replace(/\.$/, "");
      const errorType = err.tp$name || err.constructor.name;

      // If this is an error in the sense_hat.py shim, remove the first line of
      // the traceback as this will be the line in the shim which we don't want
      // to show to users, so that the error message will instead point to the
      // line in the user's code which caused the error.
      if (err.traceback[0].filename === "./sense_hat.py") {
        err.traceback.shift();
      }

      const lineNumber = err.traceback[0].lineno;
      const fileName = err.traceback[0].filename.replace(/^\.\//, "");

      if (errorType === "ImportError" && window.crossOriginIsolated) {
        const articleLink = `https://help.editor.raspberrypi.org/hc/en-us/articles/30841379339924-What-Python-libraries-are-available-in-the-Code-Editor`;
        const moduleName = errorDescription.replace(/No module named /, "");
        explanation = `You should check your code for typos. If you are using p5, py5, sense_hat or turtle, ${moduleName} might not work - read this <a href=${articleLink}>article</a> for more information.`;
      }

      let userId;
      if (user?.profile) {
        userId = user.profile?.user;
      }

      const { createError } = ApiCallHandler({ reactAppApiEndpoint });

      errorMessage = `${errorType}: ${errorDescription} on line ${lineNumber} of ${fileName}${
        explanation ? `. ${explanation}` : ""
      }`;
      createError(projectIdentifier, userId, {
        errorType,
        errorMessage,
      });

      errorDetails = {
        type: errorType,
        line: lineNumber,
        file: fileName,
        description: errorDescription,
        message: errorMessage,
      };
    }

    dispatch(setError(errorMessage));
    dispatch(setErrorDetails(errorDetails));
    dispatch(stopDraw());
    if (getInput()) {
      const input = getInput();
      input.removeAttribute("id");
      input.removeAttribute("contentEditable");
    }
  };

  const runCode = () => {
    // clear previous output
    dispatch(setError(""));
    dispatch(setErrorDetails({}));
    if (output.current) {
      output.current.innerHTML = "";
    }
    dispatch(setSenseHatEnabled(false));

    var prog = mainComponent?.content || "";

    if (prog.includes(`# ${t("input.comment.py5")}`)) {
      prog = prog.replace(
        `# ${t("input.comment.py5")}`,
        "from py5_imported_mode import *",
      );

      if (!prog.match(/(\nrun_sketch)/)) {
        prog = prog.concat("\nrun_sketch()");
      }
    }

    Sk.configure({
      inputfun: inf,
      output: outf,
      read: builtinRead,
      debugging: true,
      inputTakesPrompt: true,
      uncaughtException: handleError,
    });

    var myPromise = Sk.misceval
      .asyncToPromise(() => Sk.importMainWithBody("main", false, prog, true), {
        "*": () => {
          if (store.getState().editor.codeRunStopped) {
            throw new Error(t("output.errors.interrupted"));
          }
        },
      })
      .catch((err) => {
        handleError(err);
      })
      .finally(() => {
        dispatch(codeRunHandled());
      });
    myPromise.then(function (_mod) {});
  };

  function shiftFocusToInput(e) {
    if (document.getSelection().toString().length > 0) {
      return;
    }

    const inputBox = getInput();
    if (inputBox && e.target !== inputBox) {
      const input = getInput();
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

  const singleOutputPanel = outputPanels.length === 1;
  const showVisualOutputPanel = outputPanels.includes("visual");
  const showTextOutputPanel = outputPanels.includes("text");

  const outputPanelClasses = (panelType) => {
    return classNames("output-panel", `output-panel--${panelType}`, {
      "output-panel--single": singleOutputPanel,
    });
  };

  const [tabbedViewSelectedIndex, setTabbedViewSelectedIndex] = useState(
    showVisualOutput ? 0 : 1,
  );

  useEffect(() => {
    if (showVisualOutput) {
      setTabbedViewSelectedIndex(0);
    } else {
      setTabbedViewSelectedIndex(1);
    }
  }, [showVisualOutput]);

  return (
    <div
      className={classNames("pythonrunner-container", "skulptrunner", {
        "skulptrunner--active": active,
      })}
    >
      {isSplitView || singleOutputPanel ? (
        <>
          {showVisualOutputPanel && (
            <div
              className={outputPanelClasses("visual")}
              style={{ display: showVisualOutput ? undefined : "none" }}
            >
              <Tabs forceRenderTabPanel={true}>
                <div
                  className={classNames("react-tabs__tab-container", {
                    "react-tabs__tab-container--hidden": singleOutputPanel,
                  })}
                >
                  <TabList>
                    <Tab key={0}>
                      <span className="react-tabs__tab-text">
                        {t("output.visualOutput")}
                      </span>
                    </Tab>
                  </TabList>
                  {!isEmbedded && showVisualOutput && <OutputViewToggle />}
                  {!isEmbedded && isMobile && <RunnerControls skinny />}
                </div>
                <TabPanel key={0}>
                  <VisualOutputPane />
                </TabPanel>
              </Tabs>
            </div>
          )}
          {showTextOutputPanel && (
            <div className={outputPanelClasses("text")}>
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
                  {!showVisualOutput && !isEmbedded && isMobile && (
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
          )}
        </>
      ) : (
        <Tabs
          forceRenderTabPanel={true}
          defaultIndex={showVisualOutput ? 0 : 1}
          selectedIndex={tabbedViewSelectedIndex}
          onSelect={setTabbedViewSelectedIndex}
        >
          <div className="react-tabs__tab-container">
            <TabList>
              <Tab
                key={0}
                style={{ display: showVisualOutput ? undefined : "none" }}
              >
                <span className="react-tabs__tab-text">
                  {t("output.visualOutput")}
                </span>
              </Tab>
              <Tab key={1}>
                <span className="react-tabs__tab-text">
                  {t("output.textOutput")}
                </span>
              </Tab>
            </TabList>
            {!isEmbedded && showVisualOutput && <OutputViewToggle />}
            {!isEmbedded && isMobile && <RunnerControls skinny />}
          </div>
          {!isOutputOnly && <ErrorMessage />}
          <TabPanel key={0}>
            <VisualOutputPane />
          </TabPanel>
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

export default SkulptRunner;
