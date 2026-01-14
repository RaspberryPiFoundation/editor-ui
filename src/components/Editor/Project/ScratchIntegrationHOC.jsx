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
        "handleBlocksChanged",
      ]);
    }
    componentDidMount() {
      window.addEventListener("message", this.handleMessage);
      this.props.setStageSize();
      if (this.props.vm) {
        console.log("Setting up VM listeners in componentDidMount...");
        this.setupVMListeners();
      } else {
        console.log("VM not available yet in componentDidMount.");
      }
    }

    componentDidUpdate(prevProps) {
      // Set up listeners when VM becomes available
      if (!prevProps.vm && this.props.vm) {
        console.log("Setting up VM listeners in componentDidUpdate...");
        this.setupVMListeners();
      }
    }

    componentWillUnmount() {
      window.removeEventListener("message", this.handleMessage);
      this.removeVMListeners();
    }

    setupVMListeners() {
      const vm = this.props.vm;
      if (!vm) return;

      console.log("=== Looking for Blockly workspace ===");
      
      // Method 1: Check for global Blockly
      if (window.Blockly) {
        console.log("Found global Blockly:", window.Blockly);
        const workspace = window.Blockly.getMainWorkspace?.();
        console.log("Blockly main workspace:", workspace);
        
        if (workspace) {
          workspace.addChangeListener((event) => {
            console.log("Blockly workspace change event:", event);
            console.log("Event type:", event.type);
            if (event.type === "endDrag") {
              this.handleBlocksChanged();
            }
          });
          console.log("✓ Added Blockly workspace change listener");
          return; // Success!
        }
      }
      // const vm = this.props.vm;
      // if (!vm) return;

      // // if (vm.runtime.getEditingTarget()) {
      //   // const workspace = vm.runtime.getEditingTarget().blocks;
      //   console.log(vm);
      //   console.log(vm.runtime);
      //   console.log(vm.runtime.constructor.PROJECT_CHANGED);
      //   vm.runtime.on('BLOCK_DRAG_UPDATE', this.handleBlocksChanged);
      //   // workspace.on('BLOCK_CREATE', this.handleBlocksChanged);
      //   // workspace.on('BLOCK_DELETE', this.handleBlocksChanged);
      // // }
      // console.log("Blocks changed listener set up...")
      // // this.startPolling();
    }

    removeVMListeners() {
      // Clean up any listeners set up in setupVMListeners
      const vm = this.props.vm;
      if (!vm) return;

      // const workspace = vm.runtime.getEditingTarget()?.blocks;
      vm.runtime.removeListener('BLOCK_DRAG_UPDATE', this.handleBlocksChanged);
    }
    handleBlocksChanged() {
      console.log("Blocks have changed");
      
      // Debounce to avoid saving on every tiny change
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      
      this.saveTimeout = setTimeout(() => {
        if (this.props.saveProjectSb3) {
          this.props.saveProjectSb3().then((sb3Content) => {
            console.log("Autosaving project...", sb3Content);
            
            // Convert Blob/ArrayBuffer to base64 for localStorage
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result.split(',')[1]; // Remove data:application/octet-stream;base64, prefix
              localStorage.setItem("autosavedProject", base64String);
              console.log("Project saved to localStorage (base64)");
            };
            reader.readAsDataURL(sb3Content);
            
            // This sb3Content is what you'd send to your save API
            // It's the complete .sb3 file content
          });
        }
      }, 2000); // Wait 2 seconds after last change
    };

    handleMessage(event) {
      // These are events sent from the page telling Scratch GUI to do certain things.
      // Here we are telling Scratch GUI how to do those things.
      // We want this the other way around in some of these cases.
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
        vm: null,
      };
    } else {
      console.log("Scratch VM is initialized");
    }

    return {
      saveProjectSb3: vm.saveProjectSb3?.bind(vm),
      loadProject: vm.loadProject?.bind(vm),
      vmReady: true,
      vm: vm,
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
