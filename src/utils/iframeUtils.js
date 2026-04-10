export function allowedIframeHost(origin) {
  const allowedHosts = process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS
    ? process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS.split(",")
    : [];
  return process.env.NODE_ENV === "test" || allowedHosts.includes(origin);
}

export const MSG_HTML_PREVIEW_READY = "editor-html-ready";
export const MSG_HTML_PROJECT_UPDATE = "editor-html-preview";
export const MSG_HTML_PREVIEW_EVENT = "editor-html-event";
