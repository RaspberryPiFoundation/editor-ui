/* eslint-disable react-hooks/exhaustive-deps */
import "./HtmlRunner.scss";
import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";

function HtmlRunner() {
  const projectCode = useSelector((state) => state.editor.project.components);
  const output = useRef();

  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type });
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    runCode();
  }, [projectCode]);

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
