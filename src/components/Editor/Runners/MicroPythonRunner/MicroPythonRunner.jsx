/* eslint-disable react-hooks/exhaustive-deps */
import "../../../../assets/stylesheets/PythonRunner.scss";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useMediaQuery } from "react-responsive";
import { codeRunHandled } from "../../../../redux/EditorSlice";
import { runOnPico, stopPico } from "../../../../utils/picoHelpers";
import ErrorMessage from "../../ErrorMessage/ErrorMessage";

import OutputViewToggle from "./OutputViewToggle";
import { SettingsContext } from "../../../../utils/settings";
import RunnerControls from "../../../RunButton/RunnerControls";
import { MOBILE_MEDIA_QUERY } from "../../../../utils/mediaQueryBreakpoints";
import { set } from "date-fns";

const MicroPythonRunner = () => {
  const project = useSelector((state) => state.editor.project);
  const picoConnected = useSelector((state) => state.editor.picoConnected);

  const projectIdentifier = useSelector(
    (state) => state.editor.project.identifier
  );
  const user = useSelector((state) => state.auth.user);
  const isSplitView = useSelector((state) => state.editor.isSplitView);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered
  );
  const codeRunStopped = useSelector((state) => state.editor.codeRunStopped);

  const output = useRef();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  const [port, setPort] = useState(null);
  const [timerId, setTimerId] = useState(null);
  const [reader, setReader] = useState(null);
  const [picoOutput, setPicoOutput] = useState({
    time: new Date().getTime(),
    string: "Pico connected",
  });

  const getInput = () => {
    const pageInput = document.getElementById("input");
    const webComponentInput = document.querySelector("editor-wc")
      ? document.querySelector("editor-wc").shadowRoot.getElementById("input")
      : null;
    return pageInput || webComponentInput;
  };

  const getReader = async () => {
    console.log("Getting reader");
    if (!port) {
      console.log("No port");
      return;
    }
    try {
      console.log("Getting reader");
      const reader = await port.readable.getReader();
      setReader(reader);
      return reader;
    } catch (error) {
      console.log(error);
    }
  };

  const releaseReader = async () => {
    if (reader && reader.locked) {
      await reader.releaseLock();
      setReader(null);
    }
  };

  const stopTimer = () => {
    clearInterval(timerId);
  };

  useEffect(() => {
    const getPicoPort = async () => {
      const ports = await navigator.serial.getPorts();
      const port = ports[0];
      setPort(port);
    };
    if (picoConnected) {
      console.log("Getting port");
      getPicoPort();
    } else {
      setPort(null);
    }
  }, [picoConnected]);

  useEffect(() => {
    if (port) {
      getReader();
    }

    return () => {
      releaseReader(reader);
    };
  }, [port]);

  useEffect(() => {
    if (codeRunTriggered) {
      runOnPico(port, project, dispatch);
    }
  }, [codeRunTriggered]);

  useEffect(() => {
    const readFromPico = async () => {
      if (!port) {
        return;
      }
      console.log("Ready to read from Pico");
      try {
        while (true) {
          const { value, done } = await Promise.race([
            reader.read(),
            new Promise((resolve, reject) => {
              setTimeout(() => resolve({ value: { timeout: true } }), 5000);
            }),
          ]);
          if (done || value.timeout) {
            releaseReader(reader);
            console.log("No more output");
            break;
          }

          const decoder = new TextDecoder();
          const decodedValue = decoder.decode(value);
          console.log(decodedValue);
          setPicoOutput({ time: new Date().getTime(), string: decodedValue });
        }
      } catch (error) {
        releaseReader();
        console.log(error);
      }
    };

    if (codeRunTriggered && reader) {
      console.log("Ready to read");
      readFromPico();
    }

    if (codeRunStopped) {
      releaseReader();
    }

    // Clean-up function
    return () => {
      releaseReader(reader);
    };
  }, [codeRunTriggered, codeRunStopped, reader]);

  // useEffect(() => {
  //   const readFromPico = async () => {
  //     try {
  //       const reader = await getReader();
  //       const { value, done } = await reader.read();
  //       if (value) {
  //         const decoder = new TextDecoder();
  //         const decodedValue = decoder.decode(value);
  //         console.log(decodedValue);
  //         setPicoOutput({ time: new Date().getTime(), string: decodedValue });
  //       }
  //     }
  //       reader.releaseLock();
  //     } catch (error) {
  //       setPicoOutput({
  //         time: new Date().getTime(),
  //         output: error.message,
  //       });
  //     }
  //   };
  //   if (codeRunTriggered && !codeRunStopped && port) {
  //     output.current.innerHTML = "";
  //     runOnPico(port, project, dispatch);
  //     readFromPico();
  //   }
  // }, [codeRunTriggered, codeRunStopped]);

  useEffect(() => {
    const stopPicoRunning = async () => {
      await stopPico(port);
    };

    if (codeRunStopped) {
      stopTimer();
      stopPicoRunning();
      console.log("Code run stopped");
      dispatch(codeRunHandled());
    }
  }, [codeRunStopped]);

  useEffect(() => {
    const node = output.current;

    const div = document.createElement("span");
    div.classList.add("pythonrunner-console-output-line");
    div.innerHTML = new Option(picoOutput.string).innerHTML;
    node.appendChild(div);
    node.scrollTop = node.scrollHeight;
  }, [picoOutput]);

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

  return (
    <div className={`pythonrunner-container`}>
      {isSplitView ? (
        <>
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
                {!isEmbedded && isMobile ? <RunnerControls skinny /> : null}
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
        <Tabs forceRenderTabPanel={true} defaultIndex={1}>
          <div className="react-tabs__tab-container">
            <TabList>
              <Tab key={1}>
                <span className="react-tabs__tab-text">
                  {t("output.textOutput")}
                </span>
              </Tab>
            </TabList>
            {!isEmbedded ? <OutputViewToggle /> : null}
            {!isEmbedded && isMobile ? <RunnerControls skinny /> : null}
          </div>
          <ErrorMessage />
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

export default MicroPythonRunner;
