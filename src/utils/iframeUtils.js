import { getRuntimeEnv, isTest } from "./runtimeConfig";

export function allowedIframeHost(origin) {
  const allowedHosts = getRuntimeEnv("REACT_APP_ALLOWED_IFRAME_ORIGINS")
    .split(",")
    .filter(Boolean);
  return isTest() || allowedHosts.includes(origin);
}

export const MSG_HTML_PREVIEW_READY = "editor-html-ready";
export const MSG_HTML_PROJECT_UPDATE = "editor-html-preview";
export const MSG_HTML_PREVIEW_EVENT = "editor-html-event";
