import React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import * as ReactRedux from "react-redux";
import * as Redux from "redux";

window.react = React;
window["react-dom"] = { ...ReactDOM, createRoot };
window.redux = Redux;
window["react-redux"] = ReactRedux;

const scratchFrameUrl = import.meta.env.REACT_APP_SCRATCH_FRAME_URL;
const scratchGuiScriptUrl = `${scratchFrameUrl}/vendor/scratch-gui.js`;

const loadScratchGuiScript = () => {
  if (window.GUI) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scratchGuiScriptUrl;
    script.onload = resolve;
    script.onerror = () => {
      reject(
        new Error(`Unable to load Scratch GUI from ${scratchGuiScriptUrl}`),
      );
    };
    document.head.appendChild(script);
  });
};

await loadScratchGuiScript();
await import("./scratch.jsx");
