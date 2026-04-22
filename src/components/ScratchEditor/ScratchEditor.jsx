import scratchProjectSave from "../../utils/scratchProjectSave.js";
import { useCallback, useRef, useEffect, useState } from "react";

import WrapperdScratchGui from "./WrappedScratchGui.jsx";
import { postScratchGuiEvent, allowedParentOrigin } from "./events.js";

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

const ScratchEditor = ({
  projectId,
  locale,
  apiUrl,
  accessToken: initialAccessToken,
}) => {
  const [accessToken, setAccessToken] = useState(initialAccessToken);

  const scratchFetchApiRef = useRef(null);

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
      projectId={projectId}
      locale={locale}
      menuBarHidden={true}
      projectHost={`${apiUrl}/api/scratch/projects`}
      assetHost={`${apiUrl}/api/scratch/assets`}
      basePath={`${process.env.ASSETS_URL}/scratch-gui/`}
      onStorageInit={(storage) => {
        scratchFetchApiRef.current = storage.scratchFetch;
        if (accessToken) {
          scratchFetchApiRef.current.setMetadata("Authorization", accessToken);
        }
      }}
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
