import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  remixProject,
  manualUpdateProject,
  setStageSize,
} from "@scratch/scratch-gui";

const ScratchIntegrationHOC = function (WrappedComponent) {
  class ScratchIntegrationComponent extends React.Component {
    constructor(props) {
      super(props);

      this.handleMessage = this.handleMessage.bind(this);
      this.handleDownload = this.handleDownload.bind(this);
      this.handleUpload = this.handleUpload.bind(this);
      this.handleRemix = this.handleRemix.bind(this);
      this.handleSave = this.handleSave.bind(this);
    }
    componentDidMount() {
      window.addEventListener("message", this.handleMessage);
      this.props.setStageSize();
    }
    componentWillUnmount() {
      window.removeEventListener("message", this.handleMessage);
    }

    allowedIframeHost(origin) {
      const allowedHosts = process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS
        ? process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS.split(",")
        : [];
      return allowedHosts.includes(origin);
    }

    handleMessage(event) {
      if (!this.allowedIframeHost(event.origin)) {
        console.warn(
          "iFrame received message from unknown origin:",
          event.origin,
        );
        return;
      }

      switch (event.data.type) {
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
        default:
          console.warn("Unknown message type:", event.data.type);
          break;
      }
    }
    handleDownload(event) {
      const filename = event.data.filename;
      this.props.saveProjectSb3().then((content) => {
        console.log("Downloading project as", content, filename);
      });
    }
    handleUpload(event) {
      const file = event.data.file;
      file.arrayBuffer().then((blob) => {
        this.props.loadProject(blob).then(() => {
          console.log("done uploading");
        });
      });
    }
    handleRemix() {
      this.props.onClickRemix();
    }
    handleSave() {
      this.props.onClickSave();
    }
    render() {
      const { ...componentProps } = this.props;
      return <WrappedComponent {...componentProps} />;
    }
  }

  const mapStateToProps = (state) => ({
    saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(
      state.scratchGui.vm,
    ),
    loadProject: state.scratchGui.vm.loadProject.bind(state.scratchGui.vm),
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
  };
  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ScratchIntegrationComponent);
};

export { ScratchIntegrationHOC as default };
