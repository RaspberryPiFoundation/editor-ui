import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { saveAs } from "file-saver";
import {
  remixProject,
  manualUpdateProject,
  setStageSize,
} from "@scratch/scratch-gui";
import { allowedIframeHost } from "../../utils/iframeUtils";
import { postScratchGuiEvent } from "./events.js";

const ScratchIntegrationHOC = function (WrappedComponent) {
  class ScratchIntegrationComponent extends React.Component {
    constructor(props) {
      super(props);

      this.handleMessage = this.handleMessage.bind(this);
      this.handleDownload = this.handleDownload.bind(this);
      this.handleUpload = this.handleUpload.bind(this);
      this.handleRemix = this.handleRemix.bind(this);
      this.handleSave = this.handleSave.bind(this);
      this.handleProjectChanged = this.handleProjectChanged.bind(this);
    }
    componentDidMount() {
      window.addEventListener("message", this.handleMessage);
      this.props.vm.on("PROJECT_CHANGED", this.handleProjectChanged);
      this.props.setStageSize();
    }
    componentWillUnmount() {
      window.removeEventListener("message", this.handleMessage);
      this.props.vm.removeListener(
        "PROJECT_CHANGED",
        this.handleProjectChanged,
      );
    }

    handleMessage(event) {
      if (!allowedIframeHost(event.origin)) {
        console.warn(
          "iFrame received message from unknown origin:",
          event.origin,
        );
        return;
      }
      if (event.data?.type === "webpackOk") {
        return;
      }

      switch (event.data?.type) {
        case "scratch-gui-download":
          this.handleDownload(event);
          break;
        case "scratch-gui-upload":
          this.handleUpload(event);
          break;
        case "scratch-gui-remix":
          this.handleRemix(event);
          break;
        case "scratch-gui-save":
          this.handleSave(event);
          break;
        case "scratch-gui-update-token":
          // handled elsewhere
          break;
        default:
          console.warn("Unknown message type:", event.data.type);
          break;
      }
    }
    handleDownload(event) {
      const filename = event.data.filename;
      this.props.saveProjectSb3().then((content) => {
        saveAs(content, filename);
      });
    }
    handleUpload(event) {
      const file = event.data.file;
      file
        ?.arrayBuffer()
        ?.then((arrayBuffer) => this.props.loadProject(arrayBuffer))
        ?.then(this.handleProjectChanged);
    }
    handleRemix() {
      this.props.onClickRemix();
    }
    handleSave() {
      this.props.onClickSave();
    }
    handleProjectChanged() {
      postScratchGuiEvent("scratch-gui-project-changed");
    }
    render() {
      const {
        loadProject,
        localesOnly,
        onClickRemix,
        onClickSave,
        saveProjectSb3,
        setStageSize,
        ...componentProps
      } = this.props;

      return <WrappedComponent {...componentProps} />;
    }
  }

  const mapStateToProps = (state) => ({
    saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(
      state.scratchGui.vm,
    ),
    loadProject: state.scratchGui.vm.loadProject.bind(state.scratchGui.vm),
    vm: state.scratchGui.vm,
  });

  const mapDispatchToProps = (dispatch) => ({
    onClickRemix: () => dispatch(remixProject()),
    onClickSave: () => dispatch(manualUpdateProject()),
    setStageSize: () => dispatch(setStageSize("small")),
  });

  ScratchIntegrationComponent.propTypes = {
    saveProjectSb3: PropTypes.func,
    loadProject: PropTypes.func,
    onClickRemix: PropTypes.func,
    onClickSave: PropTypes.func,
    setStageSize: PropTypes.func,
    vm: PropTypes.object,
  };
  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ScratchIntegrationComponent);
};

export { ScratchIntegrationHOC as default };
