export const getEditorPortalTarget = () => {
  const reactRoot = document.getElementById("editor-react-root");
  if (reactRoot) {
    return reactRoot.querySelector("#wc") || reactRoot;
  }

  const webComponent = document.querySelector("editor-wc");
  if (webComponent?.shadowRoot) {
    return webComponent.shadowRoot.querySelector("#wc") || webComponent.shadowRoot;
  }

  return document.querySelector("#app");
};

export const getEditorAppElement = () => {
  const reactRoot = document.getElementById("editor-react-root");
  if (reactRoot) {
    return reactRoot;
  }

  return (
    document.querySelector("editor-wc") ||
    document.getElementById("app") ||
    undefined
  );
};

export const getEditorInputElement = () => {
  const portalTarget = getEditorPortalTarget();
  return portalTarget?.querySelector("#input") || document.getElementById("input");
};

const stripTrailingSlash = (url) => (url ? url.replace(/\/$/, "") : "");

export const getEditorAssetsBaseUrl = () =>
  stripTrailingSlash(
    process.env.REACT_APP_EDITOR_UI_ASSETS_URL ||
      process.env.REACT_APP_EDITOR_WEB_COMPONENT_URL ||
      process.env.PUBLIC_URL ||
      "",
  );

export const resolveEditorAssetUrl = (assetPath) => {
  const baseUrl = getEditorAssetsBaseUrl();
  const normalisedPath = assetPath.startsWith("/")
    ? assetPath.slice(1)
    : assetPath;

  if (!baseUrl) {
    return `/${normalisedPath}`;
  }

  return new URL(normalisedPath, `${baseUrl}/`).href;
};
