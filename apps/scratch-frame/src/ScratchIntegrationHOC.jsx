import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { saveAs } from "file-saver";
import { allowedIframeHost } from "./utils/iframeUtils";
import { postScratchGuiEvent } from "./utils/events.js";

const ScratchGui = window.GUI;

const SCRATCH_LOADING_VM_STATES = new Set([
  "LOADING_VM_FILE_UPLOAD",
  "LOADING_VM_WITH_ID",
  "LOADING_VM_NEW_DEFAULT",
]);

const isScratchProjectLoading = (loadingState) =>
  SCRATCH_LOADING_VM_STATES.has(loadingState);

const isScratchProjectShowingWithId = (loadingState) =>
  loadingState === "SHOWING_WITH_ID";

const ScratchIntegrationHOC = function (WrappedComponent) {
  class ScratchIntegrationComponent extends React.Component {
    constructor(props) {
      super(props);

      this.loadSettled = false;
      this.handleMessage = this.handleMessage.bind(this);
      this.handleDownload = this.handleDownload.bind(this);
      this.handleUpload = this.handleUpload.bind(this);
      this.handleRemix = this.handleRemix.bind(this);
      this.handleSave = this.handleSave.bind(this);
      this.handleProjectChanged = this.handleProjectChanged.bind(this);
      this.handleProjectRunStart = this.handleProjectRunStart.bind(this);
      this.handleProjectRunStop = this.handleProjectRunStop.bind(this);
      this.syncLoadSettled = this.syncLoadSettled.bind(this);
    }
    componentDidMount() {
      window.addEventListener("message", this.handleMessage);
      this.props.vm.on("PROJECT_CHANGED", this.handleProjectChanged);
      this.props.vm.on("PROJECT_RUN_START", this.handleProjectRunStart);
      this.props.vm.on("PROJECT_RUN_STOP", this.handleProjectRunStop);
      this.props.setStageSize();
      this.syncLoadSettled(null);
    }
    componentDidUpdate(prevProps) {
      this.syncLoadSettled(prevProps);
    }
    // Scratch fires PROJECT_CHANGED during load, before setProjectUnchanged runs.
    // Wait until the project is showing and that initial dirty spell has cleared.
    syncLoadSettled(prevProps) {
      const { isLoading, isShowingWithId, projectChanged } = this.props;
      const prev = prevProps || {};

      if (isLoading || !isShowingWithId) {
        this.loadSettled = false;
        return;
      }

      if (this.loadSettled) {
        return;
      }

      const loadJustFinished = !prev.isShowingWithId || prev.isLoading;
      const projectMarkedUnchanged = prev.projectChanged && !projectChanged;

      if (projectMarkedUnchanged || (loadJustFinished && !projectChanged)) {
        this.loadSettled = true;
      }
    }
    componentWillUnmount() {
      window.removeEventListener("message", this.handleMessage);
      this.props.vm.removeListener(
        "PROJECT_CHANGED",
        this.handleProjectChanged,
      );
      this.props.vm.removeListener(
        "PROJECT_RUN_START",
        this.handleProjectRunStart,
      );
      this.props.vm.removeListener(
        "PROJECT_RUN_STOP",
        this.handleProjectRunStop,
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
        ?.then(() => {
          this.loadSettled = true;
          this.handleProjectChanged();
        });
    }
    handleRemix() {
      this.props.onClickRemix();
    }
    handleSave() {
      this.props.onClickSave();
    }
    handleProjectChanged() {
      if (!this.loadSettled) {
        return;
      }

      postScratchGuiEvent("scratch-gui-project-changed");
    }
    handleProjectRunStart() {
      postScratchGuiEvent("scratch-gui-project-run-started");
    }
    handleProjectRunStop() {
      postScratchGuiEvent("scratch-gui-project-run-stopped");
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

  const mapStateToProps = (state) => {
    const loadingState = state.scratchGui.projectState?.loadingState;

    return {
      saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(
        state.scratchGui.vm,
      ),
      loadProject: state.scratchGui.vm.loadProject.bind(state.scratchGui.vm),
      vm: state.scratchGui.vm,
      isLoading: isScratchProjectLoading(loadingState),
      isShowingWithId: isScratchProjectShowingWithId(loadingState),
      projectChanged: state.scratchGui.projectChanged,
    };
  };

  const mapDispatchToProps = (dispatch) => ({
    onClickRemix: () => dispatch(ScratchGui.remixProject()),
    onClickSave: () => dispatch(ScratchGui.manualUpdateProject()),
    setStageSize: () => dispatch(ScratchGui.setStageSize("small")),
  });

  ScratchIntegrationComponent.propTypes = {
    saveProjectSb3: PropTypes.func,
    loadProject: PropTypes.func,
    onClickRemix: PropTypes.func,
    onClickSave: PropTypes.func,
    setStageSize: PropTypes.func,
    vm: PropTypes.object,
    isLoading: PropTypes.bool,
    isShowingWithId: PropTypes.bool,
    projectChanged: PropTypes.bool,
  };
  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ScratchIntegrationComponent);
};

export { ScratchIntegrationHOC as default };
