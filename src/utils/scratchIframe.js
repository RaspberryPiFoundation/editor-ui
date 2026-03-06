export const getScratchIframeContentWindow = () => {
  const webComponent = document.querySelector("editor-wc");
  return webComponent.shadowRoot.querySelector("iframe[title='Scratch']")
    .contentWindow;
};

export const postMessageToScratchIframe = (message) => {
  getScratchIframeContentWindow().postMessage(message, process.env.ASSETS_URL);
};
