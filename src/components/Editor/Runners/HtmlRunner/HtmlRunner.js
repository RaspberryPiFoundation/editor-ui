/* eslint-disable react-hooks/exhaustive-deps */
import "./HtmlRunner.scss";
import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";

function HtmlRunner() {
  const projectCode = useSelector((state) => state.editor.project.components);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered
  );
  const justLoaded = useSelector((state) => state.editor.justLoaded);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const autorunEnabled = useSelector((state) => state.editor.autorunEnabled);

  const dispatch = useDispatch();
  const output = useRef();

  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type });
    return URL.createObjectURL(blob);
  };

  const errorListener = () => {
    window.addEventListener("message", (event) => {
      if (typeof event.data === "string" || event.data instanceof String) {
        if (event.data === "ERROR: External link") {
          setError("externalLink");
        }
      }
    });
  };

  useEffect(() => errorListener(), []);
  let timeout;

  useEffect(() => {
    if (justLoaded && isEmbedded) {
      runCode();
    } else if (!justLoaded && autorunEnabled) {
      timeout = setTimeout(() => {
        runCode();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [projectCode]);

  useEffect(() => {
    if (codeRunTriggered) {
      runCode();
    }
  }, [codeRunTriggered]);

  useEffect(() => {
    if (error) {
      showModal();
      errorListener();
    }
  }, [error]);

  const runCode = () => {
    // TODO: get html files and handle urls for non index pages
    let indexPage = projectCode[0].content;

    const cssFiles = projectCode.filter(
      (component) => component.extension === "css"
    );
    cssFiles.forEach((cssFile) => {
      const cssFileBlob = getBlobURL(cssFile.content, "text/css");
      indexPage = indexPage.replace(
        `href="${cssFile.name}.css"`,
        `href="${cssFileBlob}"`
      );
    });

    const blob = getBlobURL(indexPage, "text/html");
    output.current.src = blob;
  };

  return (
    <div className="htmlrunner-container">
      <iframe
        className="htmlrunner-iframe"
        id="output-frame"
        title="html-output-frame"
        ref={output}
      />
    </div>
  );
}

export default HtmlRunner;
