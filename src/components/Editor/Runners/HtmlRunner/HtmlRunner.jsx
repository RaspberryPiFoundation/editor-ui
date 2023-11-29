/* eslint-disable react-hooks/exhaustive-deps */
import "../../../../assets/stylesheets/HtmlRunner.scss";
import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parse } from "node-html-parser";
import { useMediaQuery } from "react-responsive";
import mimeTypes from "mime-types";

import {
  setError,
  setPage,
  showErrorModal,
  codeRunHandled,
  triggerCodeRun,
} from "../../../../redux/EditorSlice";
import { useTranslation } from "react-i18next";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import OpenInNewTabIcon from "../../../../assets/icons/open_in_new_tab.svg";
import RunnerControls from "../../../RunButton/RunnerControls";
import { MOBILE_MEDIA_QUERY } from "../../../../utils/mediaQueryBreakpoints";

function HtmlRunner() {
  const webComponent = useSelector((state) => state.editor.webComponent);
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
  const browserPreview = useSelector((state) => state.editor.browserPreview);
  const page = useSelector((state) => state.editor.page);

  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const dispatch = useDispatch();
  const output = useRef(null);
  const domain = `https://rpf.io/`;
  const rpfDomain = new RegExp(`^${domain}`);
  const allowedInternalLinks = [new RegExp(`^#[a-zA-Z0-9]+`)];
  const allowedExternalHrefs = [rpfDomain];

  const matchingRegexes = (regexArray, testString) => {
    return regexArray.some((reg) => reg.test(testString));
  };

  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  const focussedComponent = (fileName = "index.html") =>
    projectCode.filter(
      (component) => `${component.name}.${component.extension}` === fileName,
    )[0];

  const previewable = (file) => file.endsWith(".html");
  let defaultPreviewFile = "index.html";

  if (isEmbedded && browserPreview && page && previewable(page)) {
    defaultPreviewFile = page;
  } else if (!isEmbedded && previewable(openFiles[focussedFileIndex])) {
    defaultPreviewFile = openFiles[focussedFileIndex];
  }

  const [previewFile, setPreviewFile] = useState(defaultPreviewFile);
  const [runningFile, setRunningFile] = useState(previewFile);
  const [externalLink, setExternalLink] = useState();

  const showModal = () => {
    dispatch(showErrorModal());
    eventListener();
  };

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
          dispatch(setError("externalLink"));
          showModal();
        } else if (event.data?.msg === "Allowed external link") {
          setExternalLink(event.data.payload.linkTo);
          dispatch(triggerCodeRun());
        } else {
          setExternalLink(null);
          setPreviewFile(`${event.data.payload.linkTo}.html`);
          dispatch(triggerCodeRun());
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

  const runCode = () => {
    setRunningFile(previewFile);
    if (!externalLink) {
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
              mimeTypes.lookup(
                `${projectFile[0].name}.${projectFile[0].extension}`,
              ),
            );
            hrefNode.setAttribute("href", projectFileBlob);
          } else {
            // eslint-disable-next-line no-script-url
            hrefNode.setAttribute("href", "javascript:void(0)");
            onClick = `window.parent.postMessage({msg: 'RELOAD', payload: { linkTo: '${projectFile[0].name}' }})`;
          }
        } else {
          const matchingExternalHref = matchingRegexes(
            allowedExternalHrefs,
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
            onClick =
              "window.parent.postMessage({msg: 'ERROR: External link'})";
          } else if (matchingExternalHref) {
            onClick = `window.parent.postMessage({msg: 'Allowed external link', payload: { linkTo: '${hrefNode.attrs.href}' }})`;
          }
        }

        if (onClick) {
          hrefNode.removeAttribute("target");
          hrefNode.setAttribute("onclick", onClick);
        }
      });

      const srcNodes = indexPage.querySelectorAll("[src]");
      srcNodes.forEach((srcNode) => {
        const projectImage = projectImages.filter(
          (component) => component.filename === srcNode.attrs.src,
        );
        const projectFile = projectCode.filter(
          (file) => `${file.name}.${file.extension}` === srcNode.attrs.src,
        );
        let src = "";
        if (projectImage.length) {
          src = projectImage[0].url;
        } else if (projectFile.length) {
          src = getBlobURL(
            projectFile[0].content,
            mimeTypes.lookup(
              `${projectFile[0].name}.${projectFile[0].extension}`,
            ),
          );
        }
        srcNode.setAttribute("src", src);
      });

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
              {!!!isEmbedded ||
                (!!!webComponent && (
                  <a
                    className="btn btn--tertiary htmlrunner-link"
                    target="_blank"
                    href={`${process.env.PUBLIC_URL}/${locale}/embed/viewer/${
                      project.identifier
                    }?browserPreview=true&page=${encodeURI(runningFile)}`}
                    rel="noreferrer"
                  >
                    <span className="htmlrunner-link__text">
                      {t("output.newTab")}
                    </span>
                    <OpenInNewTabIcon />
                  </a>
                ))}
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
