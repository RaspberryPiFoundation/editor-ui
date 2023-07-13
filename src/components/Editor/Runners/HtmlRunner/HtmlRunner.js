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
import { useTranslation } from "react-i18next";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Link, useSearchParams } from "react-router-dom";
import { OpenInNewTabIcon } from "../../../../Icons";

function HtmlRunner() {
  const project = useSelector((state) => state.editor.project);
  const projectCode = project.components;
  const projectImages = project.image_list;

  const firstPanelIndex = 0;
  const focussedFileIndex = useSelector(
    (state) => state.editor.focussedFileIndices,
  )[firstPanelIndex];
  const openFiles = useSelector((state) => state.editor.openFiles)[
    firstPanelIndex
  ];
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const justLoaded = useSelector((state) => state.editor.justLoaded);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const autorunEnabled = useSelector((state) => state.editor.autorunEnabled);
  const codeHasBeenRun = useSelector((state) => state.editor.codeHasBeenRun);

  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const dispatch = useDispatch();
  const output = useRef();
  const [error, setError] = useState(null);
  const allowedHrefs = ["#"];

  const focussedComponent = (fileName = "index.html") =>
    projectCode.filter(
      (component) => `${component.name}.${component.extension}` === fileName,
    )[0];

  const previewable = (file) => file.endsWith(".html");
  let defaultPreviewFile;

  if (
    isEmbedded &&
    searchParams.get("browserPreview") === "true" &&
    searchParams.get("page")
  ) {
    defaultPreviewFile = searchParams.get("page");
  } else if (!isEmbedded && previewable(openFiles[focussedFileIndex])) {
    defaultPreviewFile = openFiles[focussedFileIndex];
  } else {
    defaultPreviewFile = "index.html";
  }

  const [previewFile, setPreviewFile] = useState(defaultPreviewFile);
  const [runningFile, setRunningFile] = useState(previewFile);

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
          image.url,
        );
      });
    }
    return updatedProjectFile;
  };

  const parentTag = (node, tag) =>
    node.parentNode?.tagName && node.parentNode.tagName.toLowerCase() === tag;

  const eventListener = () => {
    window.addEventListener("message", (event) => {
      if (typeof event.data?.msg === "string") {
        if (event.data?.msg === "ERROR: External link") {
          setError("externalLink");
        } else {
          setPreviewFile(`${event.data.payload.linkTo}.html`);
          dispatch(triggerCodeRun());
        }
      }
    });
  };

  const iframeReload = () => {
    const iframe = output.current.contentDocument;
    const filename = iframe.querySelectorAll("meta[filename]")[0]
      ? iframe.querySelectorAll("meta[filename]")[0].getAttribute("filename")
      : null;
    if (runningFile !== filename) {
      setRunningFile(filename);
    }
  };

  useEffect(() => {
    eventListener();
  }, []);

  let timeout;

  useEffect(() => {
    if (justLoaded && isEmbedded) {
      dispatch(triggerCodeRun());
    } else if (!justLoaded && autorunEnabled) {
      timeout = setTimeout(() => {
        dispatch(triggerCodeRun());
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [previewFile]);

  useEffect(() => {
    if (codeRunTriggered) {
      runCode();
    }
  }, [codeRunTriggered]);

  useEffect(() => {
    if (!isEmbedded && previewable(openFiles[focussedFileIndex])) {
      setPreviewFile(openFiles[focussedFileIndex]);
    }
  }, [focussedFileIndex, openFiles]);

  useEffect(() => {
    if (error) {
      showModal();
      eventListener();
    }
  }, [error]);

  useEffect(() => {
    if (isEmbedded && searchParams.get("browserPreview") === "true") {
      setSearchParams({
        ...Object.fromEntries([...searchParams]),
        page: runningFile,
      });
    }
  }, [runningFile]);

  const runCode = () => {
    setRunningFile(previewFile);

    let indexPage = parse(focussedComponent(previewFile).content);

    const body = indexPage.querySelector("body") || indexPage;

    const hrefNodes = indexPage.querySelectorAll("[href]");

    // replace href's with blob urls
    hrefNodes.forEach((hrefNode) => {
      const projectFile = projectCode.filter(
        (file) => `${file.name}.${file.extension}` === hrefNode.attrs.href,
      );

      // remove target blanks
      if (hrefNode.attrs?.target === "_blank") {
        hrefNode.removeAttribute("target");
      }

      let onClick;

      if (!!projectFile.length) {
        if (parentTag(hrefNode, "head")) {
          const projectFileBlob = getBlobURL(
            cssProjectImgs(projectFile[0]).content,
            `text/${projectFile[0].extension}`,
          );
          hrefNode.setAttribute("href", projectFileBlob);
        } else {
          // eslint-disable-next-line no-script-url
          hrefNode.setAttribute("href", "javascript:void(0)");
          onClick = `window.parent.postMessage({msg: 'RELOAD', payload: { linkTo: '${projectFile[0].name}' }})`;
        }
      } else {
        if (
          !allowedHrefs.includes(hrefNode.attrs.href) &&
          !parentTag(hrefNode, "head")
        ) {
          // eslint-disable-next-line no-script-url
          hrefNode.setAttribute("href", "javascript:void(0)");
          onClick = "window.parent.postMessage({msg: 'ERROR: External link'})";
        }
      }
      if (onClick) {
        hrefNode.setAttribute("onclick", onClick);
      }
    });

    const srcNodes = indexPage.querySelectorAll("[src]");
    srcNodes.forEach((srcNode) => {
      const projectImage = projectImages.filter(
        (component) => component.filename === srcNode.attrs.src,
      );
      srcNode.setAttribute(
        "src",
        !!projectImage.length ? projectImage[0].url : "",
      );
    });

    body.appendChild(parse(`<meta filename="${previewFile}" />`));

    const blob = getBlobURL(indexPage.toString(), "text/html");
    output.current.src = blob;
    if (codeRunTriggered) {
      dispatch(codeRunHandled());
    }
  };

  return (
    <div className="htmlrunner-container">
      <ErrorModal errorType={error} additionalOnClose={closeModal} />
      {isEmbedded || autorunEnabled || codeHasBeenRun ? (
        <Tabs>
          <div className="react-tabs__tab-container">
            <TabList>
              <Tab>
                <span className="react-tabs__tab-inner">{`${runningFile} ${t(
                  "output.preview",
                )}`}</span>
              </Tab>
              {isEmbedded ? null : (
                <Link
                  className="btn btn--tertiary htmlrunner-link"
                  target="_blank"
                  to={`/${locale}/embed/viewer/${
                    project.identifier
                  }?browserPreview=true&page=${encodeURI(runningFile)}`}
                >
                  <span className="htmlrunner-link__text">
                    {t("output.newTab")}
                  </span>
                  <OpenInNewTabIcon />
                </Link>
              )}
            </TabList>
          </div>
          <TabPanel>
            <iframe
              className="htmlrunner-iframe"
              id="output-frame"
              title={t("runners.HtmlOutput")}
              ref={output}
              onLoad={iframeReload}
            />
          </TabPanel>
        </Tabs>
      ) : null}
    </div>
  );
}

export default HtmlRunner;
