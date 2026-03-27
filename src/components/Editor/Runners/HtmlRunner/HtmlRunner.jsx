/* eslint-disable react-hooks/exhaustive-deps */
import "../../../../assets/stylesheets/HtmlRunner.scss";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parse } from "node-html-parser";
import { useMediaQuery } from "react-responsive";

import {
  setPage,
  showErrorModal,
  codeRunHandled,
  triggerCodeRun,
  loadingRunner,
  setLoadedRunner,
} from "../../../../redux/EditorSlice";

import { useExternalLinkState } from "../../../../utils/externalLinkHelper";

import { useTranslation } from "react-i18next";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import OpenInNewTabIcon from "../../../../assets/icons/open_in_new_tab.svg";
import RunnerControls from "../../../RunButton/RunnerControls";
import { MOBILE_MEDIA_QUERY } from "../../../../utils/mediaQueryBreakpoints";

function HtmlRunner() {
  const project = useSelector((state) => state.editor.project);
  const projectCode = project.components;
  const projectMedia = [
    ...(project.image_list || []),
    ...(project.audio || []),
    ...(project.videos || []),
  ];

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
  const browserPreview = useSelector((state) => state.editor.browserPreview);
  const page = useSelector((state) => state.editor.page);

  const [rendererReady, setRendererReady] = useState(false);

  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const dispatch = useDispatch();
  const output = useRef(null);
  const reloadAfterPreviewChange = useRef(false);

  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  const focussedComponent = (fileName = "index.html") =>
    projectCode.filter(
      (component) => `${component.name}.${component.extension}` === fileName,
    )[0];

  const previewable = (file = "") => file.endsWith(".html");
  let defaultPreviewFile = "index.html";

  const pageExists = (page) => {
    return projectCode.some(
      (file) => `${file.name}.${file.extension}` === page,
    );
  };

  if (isEmbedded && page && previewable(page) && pageExists(page)) {
    defaultPreviewFile = page;
  } else if (!isEmbedded && previewable(openFiles[focussedFileIndex])) {
    defaultPreviewFile = openFiles[focussedFileIndex];
  }

  const [previewFile, setPreviewFile] = useState(defaultPreviewFile);
  const [runningFile, setRunningFile] = useState(previewFile);
  const previewFileRef = useRef(previewFile);

  const showModal = () => {
    dispatch(showErrorModal());
    eventListener();
  };

  const {
    externalLink,
    setExternalLink,
    handleAllowedExternalLink,
    handleExternalLinkError,
  } = useExternalLinkState(showModal);

  const getFilename = (iframe) => {
    let filename;
    if (iframe) {
      filename = iframe.querySelectorAll("meta[filename]")[0]
        ? iframe.querySelectorAll("meta[filename]")[0].getAttribute("filename")
        : externalLink;
    } else {
      filename = externalLink;
    }
    return filename;
  };

  const eventListener = () => {
    window.addEventListener("message", (event) => {
      if (typeof event.data?.msg === "string") {
        if (event.data?.msg === "ERROR: External link") {
          handleExternalLinkError(showModal);
        } else if (event.data?.msg === "Allowed external link") {
          handleAllowedExternalLink(event.data.payload.linkTo);
        } else if (event.data?.msg === "RELOAD") {
          const nextPreviewFile = `${event.data.payload.linkTo}.html`;
          setExternalLink(null);

          if (nextPreviewFile === previewFileRef.current) {
            reloadAfterPreviewChange.current = false;
            dispatch(triggerCodeRun());
          } else {
            reloadAfterPreviewChange.current = true;
            setPreviewFile(nextPreviewFile);
          }
        }
      }
    });
  };

  const iframeReload = () => {
    const iframe = output.current.contentDocument;
    let filename = getFilename(iframe);

    if (runningFile !== filename) {
      setRunningFile(filename);
    }

    if (iframe) {
      const linkElement = iframe.querySelector("a");

      if (linkElement) {
        linkElement.addEventListener("click", (e) => {
          e.preventDefault();

          output.current.contentDocument.href =
            linkElement.getAttribute("href");
        });
      }
    }
    setExternalLink(null);
  };

  useEffect(() => {
    eventListener();
    dispatch(loadingRunner("html"));
    dispatch(setLoadedRunner("html"));
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
    if (codeRunTriggered && rendererReady) {
      runCode();
    }
  }, [codeRunTriggered, rendererReady]);

  useEffect(() => {
    if (
      !externalLink &&
      !isEmbedded &&
      previewable(openFiles[focussedFileIndex])
    ) {
      setPreviewFile(openFiles[focussedFileIndex]);
    }
  }, [focussedFileIndex, openFiles]);

  useEffect(() => {
    previewFileRef.current = previewFile;
    if (reloadAfterPreviewChange.current) {
      reloadAfterPreviewChange.current = false;
      dispatch(triggerCodeRun());
    }
  }, [previewFile]);

  useEffect(() => {
    if (isEmbedded && browserPreview) {
      dispatch(setPage(runningFile));
    }
  }, [runningFile]);

  useEffect(() => {
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  });

  const listener = useCallback(
    (event) => {
      const message = event.data;
      // todo: validate message source
      if (message.ready === true) {
        setRendererReady(true);
      }
    },
    [setRendererReady],
  );

  const runCode = () => {
    setRunningFile(previewFile);

    if (!externalLink) {
      const indexPage = parse(focussedComponent(previewFile).content);
      const body = indexPage.querySelector("body") || indexPage;
      body.appendChild(parse(`<meta filename="${previewFile}" />`));

      output.current.contentWindow.postMessage(
        {
          type: "editor-html-preview",
          code: projectCode,
          media: projectMedia,
          current: indexPage.toString(),
        },
        // todo: set correct targetOrigin value
        "*",
      );

      if (codeRunTriggered) {
        dispatch(codeRunHandled());
      }
    } else {
      output.current.src = externalLink;
      dispatch(codeRunHandled());
    }
  };

  return (
    <div className="htmlrunner-container">
      {isEmbedded || autorunEnabled || codeHasBeenRun ? (
        <Tabs>
          <div className="react-tabs__tab-container">
            <TabList>
              <Tab>
                <span className="react-tabs__tab-text">{`${runningFile} ${t(
                  "output.preview",
                )}`}</span>
              </Tab>
              {!!!isEmbedded && (
                <a
                  className="btn btn--tertiary htmlrunner-link"
                  target="_blank"
                  href={`/${locale}/embed/viewer/${
                    project.identifier
                  }?browserPreview=true&page=${encodeURI(runningFile)}`}
                  rel="noreferrer"
                >
                  <span className="htmlrunner-link__text">
                    {t("output.newTab")}
                  </span>
                  <OpenInNewTabIcon />
                </a>
              )}
            </TabList>
            {!isEmbedded && isMobile ? <RunnerControls skinny /> : null}
          </div>
          <TabPanel>
            <iframe
              className="htmlrunner-iframe"
              id="output-frame"
              title={t("runners.HtmlOutput")}
              ref={output}
              src={process.env.HTML_RENDERER_URL}
              onLoad={iframeReload}
            />
          </TabPanel>
        </Tabs>
      ) : null}
    </div>
  );
}

export default HtmlRunner;
