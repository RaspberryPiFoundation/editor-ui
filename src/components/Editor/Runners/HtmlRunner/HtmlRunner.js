/* eslint-disable react-hooks/exhaustive-deps */
import "./HtmlRunner.scss";
import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

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
    var indexPage = projectCode[0].content;

    var cssFiles = projectCode.filter(
      (component) => component.extension === "css"
    );
    cssFiles.forEach((cssFile) => {
      var cssFileBlob = getBlobURL(cssFile.content, "text/css");
      indexPage = indexPage.replace(
        `href="${cssFile.name}.css"`,
        `href="${cssFileBlob}"`
      );
    });

    var blob = getBlobURL(indexPage, "text/html");
    output.current.src = blob;
  };

  return (
    <div className="htmlrunner-container">
      <div className="react-tabs__tab-container">
        <TabList>
          <Tab><span>Website preview</span></Tab>
          <Tab><span>Preview size</span></Tab>
          <Tab><span>Open in a new tab</span></Tab>
        </TabList>
      </div>
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
