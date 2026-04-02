import React, { useCallback, useEffect, useState } from "react";
import { parse } from "node-html-parser";
import mimeTypes from "mime-types";
import {
  allowedExternalLinks,
  allowedInternalLinks,
  matchingRegexes,
} from "../../../../utils/externalLinkHelper";
import "../../../../assets/stylesheets/HtmlRunner.scss";

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

  const handlePreviewUpdateFromHost = useCallback(
    (event) => {
      // todo: validate message origin
      // todo: use "type" to check what kind of message this is
      const message = event.data;
      if (message?.current) {
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
    // todo: validate message origin
    const message = event.data;
    // todo: use "type" to check what kind of message this is
    if (typeof event.data?.msg === "string") {
      // Forward events originating from the previewed code back to the host
      // todo: set appropriate target origin
      window.parent.postMessage(message, "*");
    }
  };

  useEffect(() => {
    window.addEventListener("message", handlePreviewUpdateFromHost);
    window.addEventListener("message", handleEventFromPreview);

    const source = window.opener || window.parent;
    if (source) {
      // todo: set appropriate target origin
      source.postMessage({ ready: true }, "*");
    }
    return () => {
      window.removeEventListener("message", handlePreviewUpdateFromHost);
      window.removeEventListener("message", handleEventFromPreview);
    };
  }, [handlePreviewUpdateFromHost]);

  return previewHtml ? (
    <iframe
      className={"htmlrunner-iframe"}
      title={"preview-sandbox"}
      srcDoc={previewHtml}
    />
  ) : (
    <></>
  );
}

export default HtmlRenderer;
