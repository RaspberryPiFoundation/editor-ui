/* eslint-disable react-hooks/exhaustive-deps */
import "./HtmlRunner.scss";
import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { codeRunHandled, expireJustLoaded } from "../../EditorSlice";

function HtmlRunner() {
  const projectCode = useSelector((state) => state.editor.project.components);
  const focussedFileIndex = useSelector((state) => state.editor.focussedFileIndex);
  const openFiles = useSelector((state) => state.editor.openFiles);
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered)
  const justLoaded = useSelector((state) => state.editor.justLoaded)

  const dispatch = useDispatch()
  const output = useRef();


  const htmlFiles = projectCode.filter(
    (component) => component.extension === 'html'
  )

  const cssFiles = projectCode.filter(
    (component) => component.extension === "css"
  );

  const fileName = openFiles[focussedFileIndex]
  const focussedComponent = projectCode.find((component) => `${component.name}.${component.extension}` === fileName)


  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type });
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    if (justLoaded) {
      runCode()
      dispatch(expireJustLoaded())
    } else {
      let timeout = setTimeout(() => {
        runCode()
      }, 2000);
      return () => clearTimeout(timeout)
    }
  }, [projectCode]);

  useEffect(() => {
    if (codeRunTriggered) {
      runCode()
    }
  }, [codeRunTriggered])

  useEffect(() => {
    runCode()
  }, [focussedFileIndex])

  const runCode = () => {
    // TODO: get html files and handle urls for non index pages
    const indexHTML = htmlFiles.find((component) => `${component.name}.${component.extension}` === 'index.html')
    const componentToPreview = focussedComponent.extension === 'html' ? focussedComponent : indexHTML
    let indexPage = componentToPreview.content;

    cssFiles.forEach((cssFile) => {
      const cssFileBlob = getBlobURL(cssFile.content, "text/css");
      indexPage = indexPage.replace(
        `href="${cssFile.name}.css"`,
        `href="${cssFileBlob}"`
      );
    });

    const blob = getBlobURL(indexPage, "text/html");
    output.current.src = blob;
    dispatch(codeRunHandled())
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
