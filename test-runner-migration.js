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
];

module.exports = { JEST_ONLY_TEST_FILES };
