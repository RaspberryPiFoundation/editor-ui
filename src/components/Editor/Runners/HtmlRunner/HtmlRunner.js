/* eslint-disable react-hooks/exhaustive-deps */
import "./HtmlRunner.scss";
import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { parse } from "node-html-parser";

function HtmlRunner() {
  const projectCode = useSelector((state) => state.editor.project.components);
  const projectImages = useSelector((state) => state.editor.project.image_list);
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
    let indexPage = parse(projectCode[0].content);

    // get all href's
    const hrefNodes = indexPage.querySelectorAll("[href]");

    // replace href's with blob urls
    hrefNodes.forEach((hrefNode) => {
      const projectFile = projectCode.filter(
        (file) => `${file.name}.${file.extension}` === hrefNode.attrs.href
      );
      if (!!projectFile.length) {
        console.log("ALLOWED");
        const projectFileBlob = getBlobURL(
          projectFile[0].content,
          `text/${projectFile[0].extension}`
        );
        hrefNode.setAttribute("href", projectFileBlob);
      } else if (hrefNode.parentNode.tagName.toLowerCase() === "head") {
        console.log("STYLE ALLOWED");
      } else {
        console.log("BLOCKED");
        hrefNode.setAttribute("href", "#");
        hrefNode.setAttribute(
          "title",
          "Unfortunately external links are not allowed"
        );
        // hrefNode.setAttribute("onclick", () => setBlocked(true));
      }
    });

    // get all src's
    const srcNodes = indexPage.querySelectorAll("[src]");

    // replace src's with image urls
    srcNodes.forEach((srcNode) => {
      const projectImage = projectImages.filter(
        (component) => component.filename === srcNode.attrs.src
      );
      if (!!projectImage.length) {
        console.log("ALLOWED");
        srcNode.setAttribute("src", projectImage[0].url);
      } else {
        console.log("BLOCKED");
        srcNode.setAttribute("src", "");
      }
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
