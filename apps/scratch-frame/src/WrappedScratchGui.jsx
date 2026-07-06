import ScratchIntegrationHOC from "./ScratchIntegrationHOC.jsx";
import { compose } from "redux";

const scratchGui = window.GUI;
const ScratchComponent = scratchGui.default;

const appTarget = document.getElementById("app");
scratchGui.setAppElement(appTarget);
const WrappedScratchGui = compose(
  scratchGui.AppStateHOC,
  ScratchIntegrationHOC,
)(ScratchComponent);

export default WrappedScratchGui;
