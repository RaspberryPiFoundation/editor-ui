import scratchProjectSave from "./utils/scratchProjectSave.js";
import React from "react";
import { useCallback, useRef, useEffect, useState } from "react";

import WrapperdScratchGui from "./WrappedScratchGui.jsx";
import { postScratchGuiEvent, allowedParentOrigin } from "./utils/events.js";
import { createAssetUploadErrorTracker } from "./utils/assetUploadError.js";

const handleRemixingSucceeded = () =>
  postScratchGuiEvent("scratch-gui-remixing-succeeded");

const handleSavingSucceeded = () =>
  postScratchGuiEvent("scratch-gui-saving-succeeded");

const ScratchEditor = ({
  projectId,
  locale,
  apiUrl,
  accessToken: initialAccessToken,
  projectLocale,
}) => {
  const [accessToken, setAccessToken] = useState(initialAccessToken);
  const [currentProjectId, setCurrentProjectId] = useState(projectId);

  const scratchFetchApiRef = useRef(null);
  const assetErrorRef = useRef(null);
  if (!assetErrorRef.current) {
    assetErrorRef.current = createAssetUploadErrorTracker();
  }

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.source !== window.parent) return;
      if (event.origin !== allowedParentOrigin()) return;
      if (event.data?.type === "scratch-gui-update-token") {
        setAccessToken(event.data?.accessToken);
        scratchFetchApiRef.current?.setMetadata(
          "Authorization",
          event.data?.accessToken,
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleUpdateProjectId = useCallback((updatedProjectId) => {
    setCurrentProjectId(updatedProjectId);
    postScratchGuiEvent("scratch-gui-project-id-updated", {
      projectId: updatedProjectId,
    });
  }, []);

  const handleStorageInit = useCallback(
    (storage) => {
      scratchFetchApiRef.current = storage.scratchFetch;
      scratchFetchApiRef.current.setMetadata("X-Project-Locale", projectLocale);
      if (accessToken) {
        scratchFetchApiRef.current.setMetadata("Authorization", accessToken);
      }

      const originalStore = storage.store.bind(storage);
      storage.store = (...args) =>
        originalStore(...args).catch((error) => {
          assetErrorRef.current.record(error);
          throw error;
        });
    },
    [accessToken, projectLocale],
  );

  const handleSavingStarted = useCallback(() => {
    assetErrorRef.current.clear();
    postScratchGuiEvent("scratch-gui-saving-started");
  }, []);

  const handleRemixingStarted = useCallback(() => {
    assetErrorRef.current.clear();
    postScratchGuiEvent("scratch-gui-remixing-started");
  }, []);

  const handleScratchGuiAlert = useCallback((alertType) => {
    const reason = assetErrorRef.current.consume();
    const payload = reason ? { reason } : {};

    if (alertType === "savingError") {
      postScratchGuiEvent("scratch-gui-saving-failed", payload);
    } else if (alertType === "creatingError") {
      postScratchGuiEvent("scratch-gui-remixing-failed", payload);
    }
  }, []);

  const handleUpdateProjectData = useCallback(
    async (currentProjectId, vmState, params) => {
      return scratchProjectSave({
        scratchFetchApi: scratchFetchApiRef.current,
        apiUrl,
        currentProjectId,
        vmState,
        params,
      });
    },
    [apiUrl],
  );

  return (
    <WrapperdScratchGui
      projectId={currentProjectId}
      locale={locale}
      menuBarHidden={true}
      noBeforeUnloadHandler={true}
      projectHost={`${apiUrl}/api/scratch/projects`}
      assetHost={`${apiUrl}/api/scratch/assets`}
      basePath={`${import.meta.env.REACT_APP_SCRATCH_FRAME_URL}/scratch-gui/`}
      onStorageInit={handleStorageInit}
      onUpdateProjectData={handleUpdateProjectData}
      onUpdateProjectId={handleUpdateProjectId}
      onShowCreatingRemixAlert={handleRemixingStarted}
      onShowRemixSuccessAlert={handleRemixingSucceeded}
      onShowSavingAlert={handleSavingStarted}
      onShowSaveSuccessAlert={handleSavingSucceeded}
      onShowAlert={handleScratchGuiAlert}
    />
  );
};

export default ScratchEditor;
