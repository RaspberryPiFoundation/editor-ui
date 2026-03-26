import React from "react";
import { createRoot } from "react-dom/client";
import process from "process";
import { compose } from "redux";

import GUI, { AppStateHOC } from "@scratch/scratch-gui";
import ScratchIntegrationHOC from "./components/ScratchEditor/ScratchIntegrationHOC.jsx";
import dedupeScratchWarnings from "./utils/dedupeScratchWarnings.js";

import ScratchStyles from "./assets/stylesheets/Scratch.scss";

dedupeScratchWarnings();

const appTarget = document.getElementById("app");
const scratchLoading = document.getElementById("scratch-loading");
GUI.setAppElement(appTarget);
const WrappedGui = compose(AppStateHOC, ScratchIntegrationHOC)(GUI);

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

const postScratchGuiEvent = (type, payload = {}) => {
  window.parent.postMessage({ type, ...payload }, allowedParentOrigin);
};

const handleUpdateProjectId = (updatedProjectId) => {
  postScratchGuiEvent("scratch-gui-project-id-updated", {
    projectId: updatedProjectId,
  });
};

const handleRemixingStarted = () =>
  postScratchGuiEvent("scratch-gui-remixing-started");

const handleRemixingSucceeded = () =>
  postScratchGuiEvent("scratch-gui-remixing-succeeded");

const handleSavingStarted = () =>
  postScratchGuiEvent("scratch-gui-saving-started");

const handleSavingSucceeded = () =>
  postScratchGuiEvent("scratch-gui-saving-succeeded");

const handleScratchGuiAlert = (alertType) => {
  if (alertType === "savingError") {
    postScratchGuiEvent("scratch-gui-saving-failed");
  } else if (alertType === "creatingError") {
    postScratchGuiEvent("scratch-gui-remixing-failed");
  }
};

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
  const readyHandshakeStartedAt = Date.now();
  let requiresAuth = false;
  let latestAccessToken = null;

  const mountGui = (accessToken) => {
    if (isMounted) return;
    isMounted = true;
    root = root || createRoot(appTarget);

    root.render(
      <>
        <style>{ScratchStyles}</style>
        <WrappedGui
          projectId={projectId}
          locale={locale}
          menuBarHidden={true}
          projectHost={`${apiUrl}/api/scratch/projects`}
          assetHost={`${apiUrl}/api/scratch/assets`}
          basePath={`${process.env.ASSETS_URL}/scratch-gui/`}
          onStorageInit={(storage) => {
            if (accessToken) {
              storage.scratchFetch.setMetadata("Authorization", accessToken);
            }
          }}
          onUpdateProjectId={handleUpdateProjectId}
          onShowCreatingRemixAlert={handleRemixingStarted}
          onShowRemixSuccessAlert={handleRemixingSucceeded}
          onShowSavingAlert={handleSavingStarted}
          onShowSaveSuccessAlert={handleSavingSucceeded}
          onShowAlert={handleScratchGuiAlert}
        />
      </>,
    );

    scratchLoading?.remove();
  };

  const handleMessage = (event) => {
    if (event.source !== window.parent) return;
    if (event.origin !== allowedParentOrigin) return;
    if (event.data?.type !== "scratch-gui-set-token") return;
    if (event.data?.nonce !== nonce) return;

    requiresAuth = Boolean(event.data?.requiresAuth);
    latestAccessToken = event.data?.accessToken || null;

    if (requiresAuth && !latestAccessToken) {
      return;
    }

    if (readyRetryIntervalId) {
      clearInterval(readyRetryIntervalId);
      readyRetryIntervalId = null;
    }
    mountGui(latestAccessToken);
    window.removeEventListener("message", handleMessage);
  };

  window.addEventListener("message", handleMessage);
  postScratchGuiEvent("scratch-gui-ready", { nonce });

  readyRetryIntervalId = window.setInterval(() => {
    if (!isMounted) {
      const retryElapsedMs = Date.now() - readyHandshakeStartedAt;
      if (retryElapsedMs >= READY_RETRY_TIMEOUT_MS) {
        clearInterval(readyRetryIntervalId);
        readyRetryIntervalId = null;
        const timeoutMessage =
          requiresAuth && !latestAccessToken
            ? "[scratch iframe] auth required but access token missing before timeout"
            : "[scratch iframe] no scratch-gui-set-token message received before timeout";
        console.error(timeoutMessage);
        return;
      }
      postScratchGuiEvent("scratch-gui-ready", { nonce });
      return;
    }
    clearInterval(readyRetryIntervalId);
    readyRetryIntervalId = null;
  }, READY_RETRY_INTERVAL_MS);
}
