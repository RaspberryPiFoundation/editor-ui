import React from "react";
import { createRoot } from "react-dom/client";
import { HtmlRenderer } from "./components/Editor/Runners/HtmlRunner/HtmlRenderer";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <HtmlRenderer />
  </React.StrictMode>,
);
