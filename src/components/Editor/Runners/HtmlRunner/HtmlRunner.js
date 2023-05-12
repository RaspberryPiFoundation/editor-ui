/* eslint-disable react-hooks/exhaustive-deps */
import "./HtmlRunner.scss";
import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parse } from "node-html-parser";

import ErrorModal from "../../../Modals/ErrorModal";
import { showErrorModal, codeRunHandled } from "../../EditorSlice";

function HtmlRunner() {
  const projectCode = useSelector((state) => state.editor.project.components);
  const projectImages = useSelector((state) => state.editor.project.image_list);

  const firstPanelIndex = 0;
  const focussedFileIndex = useSelector(
    (state) => state.editor.focussedFileIndices
  )[firstPanelIndex];
  const openFiles = useSelector((state) => state.editor.openFiles)[firstPanelIndex];
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered
  );
  const justLoaded = useSelector((state) => state.editor.justLoaded);

  const dispatch = useDispatch();
  const output = useRef();
  const [error, setError] = useState(null);

  const showModal = () => {
    dispatch(showErrorModal());
  };

  const closeModal = () => setError(null);

  const htmlFiles = projectCode.filter(
    (component) => component.extension === "html"
  );

  const fileName = openFiles[focussedFileIndex];
  const focussedComponent = projectCode.find(
    (component) => `${component.name}.${component.extension}` === fileName
  );

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
    if (justLoaded) {
      runCode();
    } else {
      timeout = setTimeout(() => {
        runCode();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [projectCode, focussedFileIndex]);

  useEffect(() => {
    if (codeRunTriggered) {
      runCode();
    }
  }, [codeRunTriggered]);

  useEffect(() => {
    runCode();
  }, [focussedFileIndex]);

  useEffect(() => {
    if (error) {
      showModal();
      errorListener();
    }
  }, [error]);

  const runCode = () => {
    const indexHTML = htmlFiles.find(
      (component) => `${component.name}.${component.extension}` === "index.html"
    );
    const componentToPreview =
      focussedComponent.extension === "html" ? focussedComponent : indexHTML;
    let indexPage = parse(componentToPreview.content);

    const hrefNodes = indexPage.querySelectorAll("[href]");

    // replace href's with blob urls
    hrefNodes.forEach((hrefNode) => {
      const projectFile = projectCode.filter(
        (file) => `${file.name}.${file.extension}` === hrefNode.attrs.href
      );
      if (!!projectFile.length) {
        const projectFileBlob = getBlobURL(
          projectFile[0].content,
          `text/${projectFile[0].extension}`
        );
        hrefNode.setAttribute("href", projectFileBlob);
      } else {
        if (
          !hrefNode.parentNode?.tagName ||
          hrefNode.parentNode.tagName.toLowerCase() !== "head"
        ) {
          hrefNode.setAttribute("href", "#");
          hrefNode.setAttribute(
            "onclick",
            "window.parent.postMessage('ERROR: External link')"
          );
        }
      }
    });

    const srcNodes = indexPage.querySelectorAll("[src]");
    srcNodes.forEach((srcNode) => {
      const projectImage = projectImages.filter(
        (component) => component.filename === srcNode.attrs.src
      );
      srcNode.setAttribute(
        "src",
        !!projectImage.length ? projectImage[0].url : ""
      );
    });

    const blob = getBlobURL(indexPage.toString(), "text/html");
    output.current.src = blob;
    if (codeRunTriggered) {
      dispatch(codeRunHandled());
    }
    clearTimeout(timeout);
  };

  return (
    <div className="htmlrunner-container">
      <ErrorModal errorType={error} additionalOnClose={closeModal} />
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
