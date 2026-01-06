import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import bindAll from "lodash.bindall";
import {
  remixProject,
  manualUpdateProject,
  setStageSize,
} from "@RaspberryPiFoundation/scratch-gui";

import fileDownload from "js-file-download";

const ScratchIntegrationHOC = function (WrappedComponent) {
  class ScratchIntegrationComponent extends React.Component {
    constructor(props) {
      super(props);
      bindAll(this, [
        "handleMessage",
        "handleDownload",
        "handleUpload",
        "handleRemix",
        "handleSave",
      ]);
    }
    componentDidMount() {
      window.addEventListener("message", this.handleMessage);
      this.props.setStageSize();
    }
    componentWillUnmount() {
      window.removeEventListener("message", this.handleMessage);
    }
    handleMessage(event) {
      if (event.origin !== window.location.origin) return;

      switch (event.data.type) {
        case "scratch-gui-download":
          this.handleDownload(event);
          break;
        case "scratch-gui-upload":
          console.log("trying to upload...");
          this.handleUpload(event);
          break;
        case "scratch-gui-remix":
          this.handleRemix(event);
          break;
        case "scratch-gui-save":
          this.handleSave(event);
          break;
      }
    }
    handleDownload(event) {
      if (!this.props.vmReady || !this.props.saveProjectSb3) {
        console.error("Cannot download: Scratch VM not ready");
        return;
      }

      const filename = event.data.filename;
      this.props.saveProjectSb3().then((content) => {
        fileDownload(content, filename);
      });
    }
    handleUpload(event) {
      if (!this.props.vmReady || !this.props.loadProject) {
        console.error("Cannot upload: Scratch VM not ready");
        return;
      }

      console.log("it's uploading...");
      const file = event.data.file;
      file.arrayBuffer().then((blob) => {
        this.props.loadProject(blob).then(() => {
          console.log("upload complete!");
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
      const {
        vmReady,
        saveProjectSb3,
        loadProject,
        onClickRemix,
        onClickSave,
        setStageSize,
        ...componentProps
      } = this.props;
      return <WrappedComponent {...componentProps} />;
    }
  }

  const mapStateToProps = (state) => {
    // Check if scratchGui and vm exist before trying to access them
    const vm = state.scratchGui?.vm;

    if (!vm) {
      console.warn("Scratch VM not initialized yet");
      return {
        saveProjectSb3: null,
        loadProject: null,
        vmReady: false,
      };
    }

    return {
      saveProjectSb3: vm.saveProjectSb3?.bind(vm),
      loadProject: vm.loadProject?.bind(vm),
      vmReady: true,
    };
  };

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
    vmReady: PropTypes.bool,
  };
  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ScratchIntegrationComponent);
};

export { ScratchIntegrationHOC as default };
