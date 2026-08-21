// Single source of truth for which test files still run under Jest.
// Populated as a snapshot of every test file when Jest/Vitest started
// running side by side (see vite.config.js and jest.config.js). Remove a
// path once its Jest-only APIs (jest.fn/jest.mock/etc.) have been ported to
// Vitest equivalents (vi.fn/vi.mock/etc.) and its assertions verified under
// Vitest - anything not listed here runs under Vitest by default, including
// any new test file.
const JEST_ONLY_TEST_FILES = [
  "src/components/Editor/Project/Project.test.jsx",
  "src/components/Editor/Project/ScratchContainer.test.jsx",
  "src/components/Editor/Runners/HtmlRunner/HtmlRunner.test.jsx",
  "src/components/Editor/Runners/PythonRunner/PyodideRunner/PyodideRunner.test.jsx",
  "src/components/Editor/Runners/PythonRunner/PyodideRunner/PyodideWorker.test.js",
  "src/components/Editor/Runners/PythonRunner/PyodideRunner/VisualOutputPane.test.jsx",
  "src/components/Editor/Runners/PythonRunner/PythonRunner.test.jsx",
  "src/components/Editor/Runners/PythonRunner/SkulptRunner/SkulptRunner.test.jsx",
  "src/components/RunButton/StopButton.test.jsx",
  "src/components/WebComponentProject/WebComponentProject.integration.test.jsx",
  "src/containers/WebComponentLoader.test.jsx",
  "src/redux/EditorSlice.test.js",
  "src/redux/reducers/loadProjectReducers.test.js",
  "src/utils/Notifications.test.js",
  "src/utils/ResizableWithHandle.test.jsx",
  "src/utils/SelectButtons.test.jsx",
  "src/utils/ToastCloseButton.test.jsx",
  "src/utils/apiCallHandler.test.js",
  "src/utils/save/autoSaveHostApi.test.js",
  "src/utils/save/autoSaveLifecycle.test.js",
  "src/utils/scratchIframe.test.js",
];

module.exports = { JEST_ONLY_TEST_FILES };
