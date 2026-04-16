import React, { useCallback, useEffect, useRef, useState } from "react";
import { parse } from "node-html-parser";
import mimeTypes from "mime-types";
import {
  allowedExternalLinks,
  allowedInternalLinks,
  matchingRegexes,
} from "../../../../utils/externalLinkHelper";
import htmlRunnerStyles from "../../../../assets/stylesheets/HtmlRunner.scss";
import {
  allowedIframeHost,
  MSG_HTML_PREVIEW_EVENT,
  MSG_HTML_PREVIEW_READY,
  MSG_HTML_PROJECT_UPDATE,
} from "../../../../utils/iframeUtils";

const parentTag = (node, tag) =>
  node.parentNode?.tagName && node.parentNode.tagName.toLowerCase() === tag;

const cssProjectImgs = (projectFile, projectMedia) => {
  let updatedProjectFile = { ...projectFile };
  if (projectFile.extension === "css") {
    projectMedia.forEach((media_file) => {
      const find = new RegExp(`['"]${media_file.filename}['"]`, "g"); // prevent substring matches
      const replace = `"${media_file.url}"`;
      updatedProjectFile.content = updatedProjectFile.content.replaceAll(
        find,
        replace,
      );
    });
  }
  return updatedProjectFile;
};

const getBlobURL = (code, type) => {
  const blob = new Blob([code], { type });
  return URL.createObjectURL(blob);
};

const replaceHrefNodes = (indexPage, projectMedia, projectCode) => {
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
          cssProjectImgs(projectFile, projectMedia).content,
          mimeTypes.lookup(`${projectFile.name}.${projectFile.extension}`),
        );
        hrefNode.setAttribute("href", projectFileBlob);
      } else {
        // eslint-disable-next-line no-script-url
        hrefNode.setAttribute("href", "javascript:void(0)");
        onClick = `window.parent.postMessage({type: '${MSG_HTML_PREVIEW_EVENT}', msg: 'RELOAD', payload: { linkTo: '${projectFile.name}' }}, '${process.env.HTML_RENDERER_URL}')`;
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
        onClick = `window.parent.postMessage({type: '${MSG_HTML_PREVIEW_EVENT}', msg: 'ERROR: External link'}, '${process.env.HTML_RENDERER_URL}')`;
      } else if (matchingExternalHref) {
        onClick = `window.parent.postMessage({type: '${MSG_HTML_PREVIEW_EVENT}', msg: 'Allowed external link', payload: { linkTo: '${hrefNode.attrs.href}' }}, '${process.env.HTML_RENDERER_URL}')`;
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
    const projectMediaFile = projectMedia.find(
      (component) => component.filename === srcNode.attrs[attr],
    );
    const projectTextFile = projectCode.find(
      (file) => `${file.name}.${file.extension}` === srcNode.attrs[attr],
    );

    let src = "";
    if (!!projectMediaFile) {
      src = projectMediaFile.url;
    } else if (!!projectTextFile) {
      src = getBlobURL(
        projectTextFile.content,
        mimeTypes.lookup(
          `${projectTextFile.name}.${projectTextFile.extension}`,
        ),
      );
    } else if (matchingRegexes(allowedExternalLinks, srcNode.attrs[attr])) {
      src = srcNode.attrs[attr];
    }
    srcNode.setAttribute(attr, src);
    srcNode.setAttribute("crossorigin", true);
  });
};

export function HtmlRenderer() {
  const [previewHtml, setPreviewHtml] = useState();
  const iframeHostOrigin = useRef();

  const handlePreviewUpdateFromHost = useCallback(
    (event) => {
      const message = event.data;
      if (
        allowedIframeHost(event.origin) &&
        message?.type === MSG_HTML_PROJECT_UPDATE &&
        message?.current
      ) {
        if (!iframeHostOrigin.current) {
          // Record the host's origin, so we can use it as a target for future messages.
          iframeHostOrigin.current = event.origin;
        }

        const transformedHtml = parse(message.current);

        replaceHrefNodes(transformedHtml, message.media, message.code);
        replaceSrcNodes(transformedHtml, message.media, message.code);
        replaceSrcNodes(
          transformedHtml,
          message.media,
          message.code,
          "data-src",
        );

        setPreviewHtml(transformedHtml);
      }
    },
    [setPreviewHtml],
  );

  const handleEventFromPreview = (event) => {
    const message = event.data;
    if (
      message?.type === MSG_HTML_PREVIEW_EVENT &&
      !!iframeHostOrigin.current
    ) {
      // Forward events originating from the previewed code back to the host.
      window.parent.postMessage(message, iframeHostOrigin.current);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handlePreviewUpdateFromHost);
    window.addEventListener("message", handleEventFromPreview);

    const source = window.opener || window.parent;
    if (source) {
      source.postMessage({ type: MSG_HTML_PREVIEW_READY }, "*");
    }
    return () => {
      window.removeEventListener("message", handlePreviewUpdateFromHost);
      window.removeEventListener("message", handleEventFromPreview);
    };
  }, [handlePreviewUpdateFromHost]);

  return (
    <>
      <style>{htmlRunnerStyles.toString()}</style>
      <div className="htmlrenderer-root">
        <iframe
          className="htmlrunner-iframe"
          title="preview-sandbox"
          srcDoc={previewHtml ?? ""}
        />
      </div>
    </>
  );
}

export default HtmlRenderer;
