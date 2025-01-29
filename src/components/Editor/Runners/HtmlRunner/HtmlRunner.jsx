/* eslint-disable react-hooks/exhaustive-deps */
import "../../../../assets/stylesheets/HtmlRunner.scss";
import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parse } from "node-html-parser";
import { useMediaQuery } from "react-responsive";
import mimeTypes from "mime-types";

import {
  setPage,
  showErrorModal,
  codeRunHandled,
  triggerCodeRun,
  loadingRunner,
  setLoadedRunner,
} from "../../../../redux/EditorSlice";

import {
  useExternalLinkState,
  matchingRegexes,
  allowedExternalLinks,
  allowedInternalLinks,
} from "../../../../utils/externalLinkHelper";

import { useTranslation } from "react-i18next";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import OpenInNewTabIcon from "../../../../assets/icons/open_in_new_tab.svg";
import RunnerControls from "../../../RunButton/RunnerControls";
import { MOBILE_MEDIA_QUERY } from "../../../../utils/mediaQueryBreakpoints";

function HtmlRunner() {
  const project = useSelector((state) => state.editor.project);
  const projectCode = project.components;
  // const projectImages = project.image_list;
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

  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const dispatch = useDispatch();
  const output = useRef(null);

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

  const showModal = () => {
    dispatch(showErrorModal());
    eventListener();
  };

  const {
    externalLink,
    setExternalLink,
    handleAllowedExternalLink,
    handleRegularExternalLink,
    handleExternalLinkError,
  } = useExternalLinkState(showModal);

  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type });
    return URL.createObjectURL(blob);
  };

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

  const cssProjectImgs = (projectFile) => {
    var updatedProjectFile = { ...projectFile };
    if (projectFile.extension === "css") {
      projectMedia.forEach((image) => {
        const find = new RegExp(`['"]${image.filename}['"]`, "g"); // prevent substring matches
        const replace = `"${image.url}"`;
        updatedProjectFile.content = updatedProjectFile.content.replaceAll(
          find,
          replace,
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
          handleExternalLinkError(showModal);
        } else if (event.data?.msg === "Allowed external link") {
          handleAllowedExternalLink(event.data.payload.linkTo);
        } else {
          handleRegularExternalLink(event.data.payload.linkTo, setPreviewFile);
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
    if (codeRunTriggered) {
      runCode();
    }
  }, [codeRunTriggered]);

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
    if (isEmbedded && browserPreview) {
      dispatch(setPage(runningFile));
    }
  }, [runningFile]);

  const replaceHrefNodes = (indexPage, projectCode) => {
    const hrefNodes = indexPage.querySelectorAll("[href]");

    hrefNodes.forEach((hrefNode) => {
      const projectFile = projectCode.find(
        (file) => `${file.name}.${file.extension}` === hrefNode.attrs.href,
      );

      if (hrefNode.attrs?.target === "_blank") {
        hrefNode.removeAttribute("target");
      }

      let onClick;

      if (!!projectFile) {
        if (parentTag(hrefNode, "head")) {
          const projectFileBlob = getBlobURL(
            cssProjectImgs(projectFile).content,
            mimeTypes.lookup(`${projectFile.name}.${projectFile.extension}`),
          );
          hrefNode.setAttribute("href", projectFileBlob);
        } else {
          // eslint-disable-next-line no-script-url
          hrefNode.setAttribute("href", "javascript:void(0)");
          onClick = `window.parent.postMessage({msg: 'RELOAD', payload: { linkTo: '${projectFile.name}' }})`;
        }
      } else {
        const matchingExternalHref = matchingRegexes(
          allowedExternalLinks,
          hrefNode.attrs.href,
        );
        const matchingInternalHref = matchingRegexes(
          allowedInternalLinks,
          hrefNode.attrs.href,
        );
        if (
          !matchingInternalHref &&
          !matchingExternalHref &&
          !parentTag(hrefNode, "head")
        ) {
          // eslint-disable-next-line no-script-url
          hrefNode.setAttribute("href", "javascript:void(0)");
          onClick = "window.parent.postMessage({msg: 'ERROR: External link'})";
        } else if (matchingExternalHref) {
          onClick = `window.parent.postMessage({msg: 'Allowed external link', payload: { linkTo: '${hrefNode.attrs.href}' }})`;
        }
      }

      if (onClick) {
        hrefNode.removeAttribute("target");
        hrefNode.setAttribute("onclick", onClick);
      }
    });
  };

  const replaceSrcNodes = (
    indexPage,
    projectMedia,
    projectCode,
    attr = "src",
  ) => {
    const srcNodes = indexPage.querySelectorAll(`[${attr}]`);

    srcNodes.forEach((srcNode) => {
      const projectImage = projectMedia.find(
        (component) => component.filename === srcNode.attrs[attr],
      );
      const projectFile = projectCode.find(
        (file) => `${file.name}.${file.extension}` === srcNode.attrs[attr],
      );

      let src = "";
      if (!!projectImage) {
        src = projectImage.url;
      } else if (!!projectFile) {
        src = getBlobURL(
          projectFile.content,
          mimeTypes.lookup(`${projectFile.name}.${projectFile.extension}`),
        );
      } else if (matchingRegexes(allowedExternalLinks, srcNode.attrs[attr])) {
        src = srcNode.attrs[attr];
      }
      srcNode.setAttribute(attr, src);
      srcNode.setAttribute("crossorigin", true);
    });
  };

  const runCode = () => {
    setRunningFile(previewFile);

    if (!externalLink) {
      const indexPage = parse(focussedComponent(previewFile).content);
      const body = indexPage.querySelector("body") || indexPage;

      // insert script to disable access to specific localStorage keys
      // localstorage.getItem() is a potential security risk when executing untrusted code
      const disableLocalStorageScript = `
      <script>
        (function() {
          const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
          const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
          const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);
          const originalClear = window.localStorage.clear.bind(window.localStorage);

          const isDisallowedKey = (key) => key === 'authKey' || key.startsWith('oidc.');

          Object.defineProperty(window, 'localStorage', {
            value: {
              getItem: function(key) {
                if (isDisallowedKey(key)) {
                  console.log(\`localStorage.getItem for "\${key}" is disabled\`);
                  return null;
                }
                return originalGetItem(key);
              },
              setItem: function(key, value) {
                if (isDisallowedKey(key)) {
                  console.log(\`localStorage.setItem for "\${key}" is disabled\`);
                  return;
                }
                return originalSetItem(key, value);
              },
              removeItem: function(key) {
                if (isDisallowedKey(key)) {
                  console.log(\`localStorage.removeItem for "\${key}" is disabled\`);
                  return;
                }
                return originalRemoveItem(key);
              },
              clear: function() {
                console.log('localStorage.clear is disabled');
                return;
              }
            },
            writable: false,
            configurable: false
          });
        })();
      </script>
    `;

      body.insertAdjacentHTML("afterbegin", disableLocalStorageScript);

      replaceHrefNodes(indexPage, projectCode);
      replaceSrcNodes(indexPage, projectMedia, projectCode);
      replaceSrcNodes(indexPage, projectMedia, projectCode, "data-src");

      body.appendChild(parse(`<meta filename="${previewFile}" />`));

      const blob = getBlobURL(indexPage.toString(), "text/html");
      output.current.src = blob;

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
              onLoad={iframeReload}
            />
          </TabPanel>
        </Tabs>
      ) : null}
    </div>
  );
}

export default HtmlRunner;
