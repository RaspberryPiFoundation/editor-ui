export const getScratchIframeContentWindow = () => {
  const webComponent = document.querySelector("editor-wc");
  return webComponent.shadowRoot.querySelector("iframe[title='Scratch']")
    .contentWindow;
};

export const getScratchAllowedOrigin = () => {
  const fallbackOrigin = window.location.origin;
  const configuredAssetsUrl = process.env.ASSETS_URL;

  if (!configuredAssetsUrl) {
    return fallbackOrigin;
  }

  try {
    return new URL(configuredAssetsUrl).origin;
  } catch (error) {
    return fallbackOrigin;
  }
};

export const postMessageToScratchIframe = (message) => {
  const allowedOrigin = getScratchAllowedOrigin();
  getScratchIframeContentWindow().postMessage(message, allowedOrigin);
};

export const shouldRemixScratchProjectOnSave = ({
  user,
  identifier,
  projectOwner,
  scratchIframeProjectIdentifier,
}) => {
  return Boolean(
    !projectOwner &&
    user &&
    identifier &&
    identifier === scratchIframeProjectIdentifier,
  );
};

export const subscribeToScratchProjectIdentifierUpdates = (handler) => {
  const allowedOrigin = getScratchAllowedOrigin();

  const handleScratchMessage = ({ origin, data }) => {
    if (origin !== allowedOrigin) return;
    if (data?.type !== "scratch-gui-project-id-updated") return;
    if (!data.projectId) return;

    handler(data.projectId);
  };

  window.addEventListener("message", handleScratchMessage);
  return () => window.removeEventListener("message", handleScratchMessage);
};
