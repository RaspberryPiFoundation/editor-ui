/* eslint-disable react-hooks/exhaustive-deps */
import "./HtmlRunner.scss";
import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parse } from "node-html-parser";

import ErrorModal from "../../../Modals/ErrorModal";
import {
  showErrorModal,
  codeRunHandled,
  triggerCodeRun,
} from "../../EditorSlice";

function HtmlRunner() {
  const projectCode = useSelector((state) => state.editor.project.components);
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered
  );
  const firstPanelIndex = 0;
  const focussedFileIndex = useSelector(
    (state) => state.editor.focussedFileIndices
  )[firstPanelIndex];
  const openFiles = useSelector((state) => state.editor.openFiles)[
    firstPanelIndex
  ];

  const dispatch = useDispatch();
  const output = useRef();
  const [error, setError] = useState(null);
  const allowedHrefs = ["#"];

  const focussedComponent = (fileName = "index.html") =>
    projectCode.filter(
      (component) => `${component.name}.${component.extension}` === fileName
    )[0];

  const previewable = (file) => file.endsWith(".html");

  const [previewFile, setPreviewFile] = useState(
    focussedComponent(
      previewable(openFiles[focussedFileIndex])
        ? openFiles[focussedFileIndex]
        : "index.html"
    )
  );

  const showModal = () => {
    dispatch(showErrorModal());
  };

  const closeModal = () => setError(null);

  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type });
    return URL.createObjectURL(blob);
  };

  const cssProjectImgs = (projectFile) => {
    var updatedProjectFile = { ...projectFile };
    if (projectFile.extension === "css") {
      projectImages.forEach((image) => {
        updatedProjectFile.content = updatedProjectFile.content.replace(
          image.filename,
          image.url
        );
      });
    }
    console.log(updatedProjectFile);
    return updatedProjectFile;
  };

  const parentTag = (node, tag) =>
    node.parentNode?.tagName && node.parentNode.tagName.toLowerCase() === tag;

  const eventListener = () => {
    window.addEventListener("message", (event) => {
      if (typeof event.data === "string" || typeof event.data === "string") {
        if (event.data === "ERROR: External link") {
          setError("externalLink");
        }
      } else if (event.data?.msg && typeof event.data?.msg === "string") {
        setPreviewFile(focussedComponent(`${event.data.payload.linkTo}.html`));
        dispatch(triggerCodeRun());
      }
    });
  };

  useEffect(() => eventListener(), []);

  useEffect(() => {
    if (previewable(openFiles[focussedFileIndex])) {
      setPreviewFile(focussedComponent(openFiles[focussedFileIndex]));
    }
  }, [projectCode, focussedFileIndex, openFiles]);

  useEffect(() => {
    if (codeRunTriggered) {
      runCode();
    }
  }, [codeRunTriggered]);

  useEffect(() => {
    // setPreviewFile(openFiles[focussedFileIndex]);
    runCode();
  }, [previewFile]);

  useEffect(() => {
    if (error) {
      showModal();
      eventListener();
    }
  }, [error]);

  const runCode = () => {
    let indexPage = parse(previewFile.content);

    const hrefNodes = indexPage.querySelectorAll("[href]");

    // replace href's with blob urls
    hrefNodes.forEach((hrefNode) => {
      const projectFile = projectCode.filter(
        (file) => `${file.name}.${file.extension}` === hrefNode.attrs.href
      );
      // remove target blanks
      if (hrefNode.attrs?.target === "_blank") {
        hrefNode.removeAttribute("target");
      }

      let onClickMsg;

      if (!!projectFile.length) {
        if (parentTag(hrefNode, "head")) {
          const projectFileBlob = getBlobURL(
            cssProjectImgs(projectFile[0]).content,
            `text/${projectFile[0].extension}`
          );
          hrefNode.setAttribute("href", projectFileBlob);
        } else {
          hrefNode.setAttribute("href", "javascript:void(0)");
          onClickMsg = `window.parent.postMessage({msg: 'RELOAD', payload: { linkTo: '${projectFile[0].name}' }})`;
        }
      } else {
        if (
          !allowedHrefs.includes(hrefNode.attrs.href) &&
          !parentTag(hrefNode, "head")
        ) {
          hrefNode.setAttribute("href", "javascript:void(0)");
          onClickMsg = "window.parent.postMessage('ERROR: External link')";
        }
      }
      hrefNode.setAttribute("onclick", onClickMsg);
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
