import "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
import * as pygal from "./packages/pygal.js";
import * as _internal_sense_hat from "./packages/_internal_sense_hat.js";

let pyodide, pyodidePromise, interruptBuffer, stopped;

self.onmessage = async ({ data }) => {
  pyodide = await pyodidePromise;

  if (data.method === "runPython") { runPython(pyodide, data.python); }
  if (data.method === "stopPython") { stopped = true; }
};

const runPython = async (pyodide, python) => {
  stopped = false;

  try {
    await withSupportForPackages(python, async () => {
      await pyodide.runPython(python);
    });
  } catch (content) {
    self.postMessage({ method: "handleOutput", stream: "stderr", content });
  }

  await reloadPyodideToClearState();
};

const checkIfStopped = () => {
  if (stopped) { throw "KeyboardInterrupt"; }
};

const withSupportForPackages = async (python, runPythonFn) => {
  const imports = await pyodide._api.pyodide_code.find_imports(python).toJs();
  await Promise.all(imports.map(name => loadDependency(name)));

  checkIfStopped();
  await pyodide.loadPackagesFromImports(python);

  checkIfStopped();
  await runPythonFn();

  for (name of imports) {
    checkIfStopped();
    await vendoredPackages[name]?.after();
  }
};

const loadDependency = async (name) => {
  checkIfStopped();

  // If the import is for a vendored package then run its .before() hook.
  const vendoredPackage = vendoredPackages[name];
  await vendoredPackage?.before();
  if (vendoredPackage) { return; }

  // If the import is for a module built into Python then do nothing.
  let pythonModule;
  try { pythonModule = pyodide.pyimport(name); } catch(_) { }
  if (pythonModule) { return; }

  // If the import is for a package built into Pyodide then load it.
  // Built-ins: https://pyodide.org/en/stable/usage/packages-in-pyodide.html
  await pyodide.loadPackage(name).catch(() => {});
  let pyodidePackage;
  try { pyodidePackage = pyodide.pyimport(name); } catch(_) { }
  if (pyodidePackage) { return; }

  // Ensure micropip is loaded which can fetch packages from PyPi.
  // See: https://pyodide.org/en/stable/usage/loading-packages.html
  if (!pyodide.micropip) {
    await pyodide.loadPackage("micropip");
    pyodide.micropip = pyodide.pyimport("micropip");
  }

  // If the import is for a PyPi package then load it.
  // Otherwise, don't error now so that we get an error later from Python.
  await pyodide.micropip.install(name).catch(() => {});
};

const vendoredPackages = {
  turtle: {
    before: async () => {
      pyodide.registerJsModule("basthon", fakeBasthonPackage);
      await pyodide.loadPackage("./packages/turtle-0.0.1-py3-none-any.whl");
    },
    after: () => pyodide.runPython(`
      import turtle
      import basthon

      svg_dict = turtle.Screen().show_scene()
      basthon.kernel.display_event({ "display_type": "turtle", "content": svg_dict })
      turtle.restart()
    `),
  },
  p5: {
    before: async () => {
      pyodide.registerJsModule("basthon", fakeBasthonPackage);
      await pyodide.loadPackage(["setuptools", "./packages/p5-0.0.1-py3-none-any.whl"]);
    },
    after: () => {},
  },
  pygal: {
    before: () => {
      pyodide.registerJsModule("pygal", { ...pygal });
      pygal.config.renderChart = (content) => postMessage({ method: "handleVisual", origin: "pygal", content });
    },
    after: () => {},
  },
  sqlite3: {
    before: async () => {
      const response = await fetch("https://cdn.adacomputerscience.org/ada/example_databases/sports_club.sqlite");
      const buffer = await response.arrayBuffer();

      pyodide.FS.writeFile("sports_club.sqlite", new Uint8Array(buffer));
    },
    after: () => {},
  },
  sense_hat: {
    before: async () => {
      pyodide.registerJsModule("_internal_sense_hat", { ..._internal_sense_hat });
      await pyodide.loadPackage(["pillow", "./packages/sense_hat-0.0.1-py3-none-any.whl"]);

      _internal_sense_hat.config.pyodide = pyodide;
      _internal_sense_hat.config.emit = (type) => postMessage({ method: "handleSenseHatEvent", type });
    },
    after: () => {
      const { pyodide, emit, sensestick, start_motion_callback, stop_motion_callback, ...config } = _internal_sense_hat.config;
      postMessage({ method: "handleVisual", origin: "sense_hat", content: config });
    },
  }
};

const fakeBasthonPackage = {
  kernel: {
    display_event: (event) => {
      const origin = event.toJs().get("display_type");
      const content = event.toJs().get("content");

      postMessage({ method: "handleVisual", origin, content });
    },
    locals: () => pyodide.runPython("globals()"),
  },
};

const reloadPyodideToClearState = async () => {
  postMessage({ method: "handleLoading" });

  pyodidePromise = loadPyodide({
    stdout: (content) => postMessage({ method: "handleOutput", stream: "stdout", content }),
    stderr: (content) => postMessage({ method: "handleOutput", stream: "stderr", content }),
  });

  const pyodide = await pyodidePromise;

  interruptBuffer ||= new Uint8Array(new SharedArrayBuffer(1));
  pyodide.setInterruptBuffer(interruptBuffer);

  postMessage({ method: "handleLoaded", interruptBuffer });
};

if (typeof SharedArrayBuffer === "undefined") {
  throw new Error(`Please set the following HTTP headers for webworker.js to support the stop button:
    Cross-Origin-Opener-Policy: same-origin
    Cross-Origin-Embedder-Policy: require-corp
  `);
}

reloadPyodideToClearState();
