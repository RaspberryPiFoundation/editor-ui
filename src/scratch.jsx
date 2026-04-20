import React from "react";
import { createRoot } from "react-dom/client";
import process from "process";
import dedupeScratchWarnings from "./utils/dedupeScratchWarnings.js";

import ScratchStyles from "./assets/stylesheets/Scratch.scss";
import ScratchEditor from "./components/ScratchEditor/ScratchEditor.jsx";
import { postScratchGuiEvent } from "./components/ScratchEditor/events.js";
dedupeScratchWarnings();

const appTarget = document.getElementById("app");
const scratchLoading = document.getElementById("scratch-loading");

if (process.env.NODE_ENV === "production" && typeof window === "object") {
  // Warn before navigating away
  window.onbeforeunload = () => true;
}

const searchParams = new URLSearchParams(window.location.search);
const projectId = searchParams.get("project_id");
const apiUrl = searchParams.get("api_url");
const parentOriginFromQuery = searchParams.get("parent_origin");
const allowedParentOrigin = parentOriginFromQuery || window.location.origin;

const defaultLocale = "en";
const locale = appTarget.dataset.locale || defaultLocale;

const generateNonce = () =>
  `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;

if (!projectId) {
  console.error("project_id is required but not set");
} else if (!apiUrl) {
  console.error("api_url is required but not set");
} else {
  const READY_RETRY_TIMEOUT_MS = 15000;
  const READY_RETRY_INTERVAL_MS = 1000;
  const nonce = generateNonce();
  let isMounted = false;
  let root;
  let readyRetryIntervalId = null;
  let hasTimedOut = false;
  const readyHandshakeStartedAt = Date.now();
  const authHandshake = {
    requiresAuth: false,
    latestAccessToken: null,
  };
  const getTimeoutMessage = (handshake) =>
    handshake.requiresAuth && !handshake.latestAccessToken
      ? "[scratch iframe] auth required but access token missing before timeout"
      : "[scratch iframe] no scratch-gui-set-token message received before timeout";

  const isValidScratchSetTokenMessage = (event) =>
    event.source === window.parent &&
    event.origin === allowedParentOrigin &&
    event.data?.type === "scratch-gui-set-token" &&
    event.data?.nonce === nonce;

  const mountGui = (accessToken) => {
    if (isMounted) return;
    isMounted = true;
    root = root || createRoot(appTarget);

    root.render(
      <>
        <style>{ScratchStyles}</style>
        <ScratchEditor
          projectId={projectId}
          locale={locale}
          apiUrl={apiUrl}
          accessToken={accessToken}
        />
      </>,
    );

    scratchLoading?.remove();
  };

  const handleMessage = (event) => {
    if (hasTimedOut) return;
    if (!isValidScratchSetTokenMessage(event)) return;

    const { requiresAuth, accessToken } = event.data || {};
    authHandshake.requiresAuth = Boolean(requiresAuth);
    authHandshake.latestAccessToken = accessToken || null;

    if (authHandshake.requiresAuth && !authHandshake.latestAccessToken) {
      return;
    }

    if (readyRetryIntervalId) {
      clearInterval(readyRetryIntervalId);
      readyRetryIntervalId = null;
    }
    mountGui(authHandshake.latestAccessToken);
    authHandshake.latestAccessToken = null;
    window.removeEventListener("message", handleMessage);
  };

  window.addEventListener("message", handleMessage);
  postScratchGuiEvent("scratch-gui-ready", { nonce });

  readyRetryIntervalId = window.setInterval(() => {
    if (!isMounted) {
      const retryElapsedMs = Date.now() - readyHandshakeStartedAt;
      if (retryElapsedMs >= READY_RETRY_TIMEOUT_MS) {
        hasTimedOut = true;
        clearInterval(readyRetryIntervalId);
        readyRetryIntervalId = null;
        window.removeEventListener("message", handleMessage);
        console.error(getTimeoutMessage(authHandshake));
        return;
      }
      postScratchGuiEvent("scratch-gui-ready", { nonce });
      return;
    }
    clearInterval(readyRetryIntervalId);
    readyRetryIntervalId = null;
  }, READY_RETRY_INTERVAL_MS);
}
