import GUI, { AppStateHOC } from "@scratch/scratch-gui";
import ScratchIntegrationHOC from "./ScratchIntegrationHOC.jsx";
import { compose } from "redux";

const appTarget = document.getElementById("app");
GUI.setAppElement(appTarget);
const WrappedScratchGui = compose(AppStateHOC, ScratchIntegrationHOC)(GUI);

export default WrappedScratchGui;
