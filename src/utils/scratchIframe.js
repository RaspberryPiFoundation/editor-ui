export const getScratchIframeContentWindow = () => {
  const webComponent = document.querySelector("editor-wc");
  return webComponent.shadowRoot.querySelector("iframe[title='Scratch']")
    .contentWindow;
};

export const postMessageToScratchIframe = (message) => {
  const allowedOrigin = process.env.ASSETS_URL || window.location.origin;
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
  const allowedOrigin = process.env.ASSETS_URL || window.location.origin;

  const handleScratchMessage = ({ origin, data }) => {
    if (origin !== allowedOrigin) return;
    if (data?.type !== "scratch-gui-project-id-updated") return;
    if (!data.projectId) return;

    handler(data.projectId);
  };

  window.addEventListener("message", handleScratchMessage);
  return () => window.removeEventListener("message", handleScratchMessage);
};
