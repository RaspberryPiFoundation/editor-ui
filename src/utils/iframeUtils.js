import { getRuntimeEnv, isTest } from "./runtimeConfig";

const isSameOrigin = (origin) =>
  typeof window !== "undefined" && origin === window.location.origin;

export function allowedIframeHost(origin) {
  const allowedHosts = getRuntimeEnv("REACT_APP_ALLOWED_IFRAME_ORIGINS")
    .split(",")
    .filter(Boolean);
  return isTest() || isSameOrigin(origin) || allowedHosts.includes(origin);
}

export const MSG_HTML_PREVIEW_READY = "editor-html-ready";
export const MSG_HTML_PROJECT_UPDATE = "editor-html-preview";
export const MSG_HTML_PREVIEW_EVENT = "editor-html-event";
