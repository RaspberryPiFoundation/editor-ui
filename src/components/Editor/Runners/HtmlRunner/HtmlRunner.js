/* eslint-disable react-hooks/exhaustive-deps */
import "./HtmlRunner.scss";
import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parse } from "node-html-parser";

import ErrorModal from "../../../Modals/ErrorModal";
import { showErrorModal, closeErrorModal } from "../../EditorSlice";

function HtmlRunner() {
  const dispatch = useDispatch();
  const projectCode = useSelector((state) => state.editor.project.components);
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const output = useRef();
  const [error, setError] = useState(null);

  const showModal = () => {
    dispatch(showErrorModal());
  };

  const closeModal = () => setError(null);

  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type });
    return URL.createObjectURL(blob);
  };

  const errorListener = () => {
    window.addEventListener("message", (event) => {
      if (event.data === "ERROR: External link") {
        setError("externalLink");
      }
    });
  };

  useEffect(() => errorListener(), []);

  useEffect(() => {
    runCode();
  }, [projectCode]);

  useEffect(() => {
    if (error) {
      showModal();
      errorListener();
    }
  }, [error]);

  const runCode = () => {
    // TODO: get html files and handle urls for non index pages
    let indexPage = parse(projectCode[0].content);

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
        if (hrefNode.parentNode.tagName.toLowerCase() !== "head") {
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

    const blob = getBlobURL(indexPage, "text/html");
    output.current.src = blob;
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
