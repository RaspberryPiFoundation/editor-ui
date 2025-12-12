import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import bindAll from "lodash.bindall";
import { remixProject, manualUpdateProject, setStageSize } from "scratch-gui";

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
      const filename = event.data.filename;
      this.props.saveProjectSb3().then((content) => {
        fileDownload(content, filename);
      });
    }
    handleUpload(event) {
      const file = event.data.file;
      file.arrayBuffer().then((blob) => {
        this.props.loadProject(blob).then(() => {
          console.log("done");
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
