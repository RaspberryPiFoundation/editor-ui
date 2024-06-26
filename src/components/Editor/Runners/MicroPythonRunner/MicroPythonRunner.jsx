/* eslint-disable react-hooks/exhaustive-deps */
import "../../../../assets/stylesheets/PythonRunner.scss";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useMediaQuery } from "react-responsive";
import { codeRunHandled, stopCodeRun } from "../../../../redux/EditorSlice";
import { runOnPico, stopPico } from "../../../../utils/picoHelpers";
import ErrorMessage from "../../ErrorMessage/ErrorMessage";
import MicroPython from "./micropython/micropython";
import OutputViewToggle from "./OutputViewToggle";
import { SettingsContext } from "../../../../utils/settings";
import RunnerControls from "../../../RunButton/RunnerControls";
import { MOBILE_MEDIA_QUERY } from "../../../../utils/mediaQueryBreakpoints";

const MicroPythonRunner = () => {
  const [microPython, setMicroPython] = useState(null);
  const [port, setPort] = useState(null);
  const project = useSelector((state) => state.editor.project);
  const picoConnected = useSelector((state) => state.editor.picoConnected);

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

  const [picoOutput, setPicoOutput] = useState("Pico connected");

  const getInput = () => {
    const pageInput = document.getElementById("input");
    const webComponentInput = document.querySelector("editor-wc")
      ? document.querySelector("editor-wc").shadowRoot.getElementById("input")
      : null;
    return pageInput || webComponentInput;
  };

  useEffect(() => {
    const getPicoPort = async () => {
      const ports = await navigator.serial.getPorts();
      const port = ports.find((port) => port.readable !== null);
      if (port) {
        setPort(port);
      } else {
        console.log("No port with a non-null readable stream was found.");
      }
      setPort(port);
    };
    if (picoConnected) {
      getPicoPort();
    } else {
      setPort(null);
    }
  }, [picoConnected]);

  useEffect(() => {
    if (port) {
      (async () => {
        const microPython = new MicroPython();
        await microPython.configurePort(port);
        setMicroPython(microPython);
      })();
    }
    return () => {
      if (!port && microPython) {
        (async () => {
          console.log("CLOSING PORT");
          await microPython.closePort();
          setMicroPython(null);
        })();
      }
    };
  }, [port]);

  useEffect(() => {
    if (codeRunTriggered && port) {
      microPython.runCode(project.components[0].content);
    }
  }, [codeRunTriggered, port, microPython]);

  useEffect(() => {
    const readFromPico = async () => {
      setPicoOutput("Reading from Pico");
      try {
        let output = await microPython.read();
        setPicoOutput(output);
      } catch (error) {
        console.log(error);
      }
    };

    if (!codeRunStopped) {
      console.log("Ready to read");
      readFromPico();
    }
  }, [codeRunTriggered, codeRunStopped]);

  useEffect(() => {
    dispatch(codeRunHandled());
  }, [codeRunStopped]);

  useEffect(() => {
    console.log("Setting output in useeffect", picoOutput);
    const node = output.current;

    const div = document.createElement("span");
    div.classList.add("pythonrunner-console-output-line");
    div.innerHTML = new Option(picoOutput).innerHTML;
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
