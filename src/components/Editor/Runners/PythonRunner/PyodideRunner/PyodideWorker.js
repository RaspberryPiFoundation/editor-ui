/* global importScripts, loadPyodide, SharedArrayBuffer, Atomics */

import * as pygal from "./pygal.js";
import * as _internal_sense_hat from "./_internal_sense_hat.js";

const supportsAllFeatures = typeof SharedArrayBuffer !== "undefined";

// eslint-disable-next-line no-restricted-globals
if (!supportsAllFeatures && name !== "incremental-features") {
  console.warn(
    [
      "The code editor will not be able to capture standard input or stop execution because these HTTP headers are not set:",
      "  - Cross-Origin-Opener-Policy: same-origin",
      "  - Cross-Origin-Embedder-Policy: require-corp",
      "",
      "If your app can cope with or without these features, please initialize the web worker with { name: 'incremental-features' } to silence this warning.",
      "You can then check for the presence of { stdinBuffer, interruptBuffer } in the handleLoaded message to check whether these features are supported.",
      "",
      "If you definitely need these features, either configure your server to respond with the HTTP headers above, or register a service worker.",
      "Once the HTTP headers are set, the browser will block cross-domain resources so you will need to add 'crossorigin' to <script> and other tags.",
      "You may wish to scope the HTTP headers to only those pages that host the code editor to make the browser restriction easier to deal with.",
      "",
      "Please refer to these code snippets for registering a service worker:",
      "  - https://github.com/RaspberryPiFoundation/python-execution-prototypes/blob/fd2c50e032cba3bb0e92e19a88eb62e5b120fe7a/pyodide/index.html#L92-L98",
      "  - https://github.com/RaspberryPiFoundation/python-execution-prototypes/blob/fd2c50e032cba3bb0e92e19a88eb62e5b120fe7a/pyodide/serviceworker.js",
    ].join("\n"),
  );
}
importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");
let pyodide, pyodidePromise, stdinBuffer, interruptBuffer, stopped;

const onmessage = async ({ data }) => {
  pyodide = await pyodidePromise;

  switch (data.method) {
    case "writeFile":
      pyodide.FS.writeFile(data.filename, new Buffer(data.content));
      break;
    case "runPython":
      runPython(data.python);
      break;
    case "stopPython":
      stopped = true;
      break;
    default:
      throw new Error(`Unsupported method: ${data.method}`);
  }
};

// eslint-disable-next-line no-restricted-globals
addEventListener("message", async (event) => {
  onmessage(event);
});

const runPython = async (python) => {
  stopped = false;
  await pyodide.runPythonAsync(`
  old_input = input

  def patched_input(prompt=False):
      if (prompt):
          print(prompt)
      return old_input()

  __builtins__.input = patched_input
  `);

  try {
    await withSupportForPackages(python, async () => {
      await pyodide.runPython(python);
    });
  } catch (error) {
    if (!(error instanceof pyodide.ffi.PythonError)) {
      throw error;
    }
    postMessage({ method: "handleError", ...parsePythonError(error) });
  }

  await reloadPyodideToClearState();
};

const checkIfStopped = () => {
  if (stopped) {
    throw new pyodide.ffi.PythonError("KeyboardInterrupt");
  }
};

const withSupportForPackages = async (python, runPythonFn = async () => {}) => {
  const imports = await pyodide._api.pyodide_code.find_imports(python).toJs();
  await Promise.all(imports.map((name) => loadDependency(name)));

  checkIfStopped();
  await pyodide.loadPackagesFromImports(python);

  checkIfStopped();
  await runPythonFn();

  for (let name of imports) {
    checkIfStopped();
    await vendoredPackages[name]?.after();
  }
};

const loadDependency = async (name) => {
  checkIfStopped();

  // If the import is for another user file then open it and load its dependencies.
  if (pyodide.FS.readdir("/home/pyodide").includes(`${name}.py`)) {
    const fileContent = pyodide.FS.readFile(`/home/pyodide/${name}.py`, {
      encoding: "utf8",
    });
    await withSupportForPackages(fileContent);
    return;
  }

  // If the import is for a vendored package then run its .before() hook.
  const vendoredPackage = vendoredPackages[name];
  await vendoredPackage?.before();
  if (vendoredPackage) {
    return;
  }

  // If the import is for a module built into Python then do nothing.
  let pythonModule;
  try {
    pythonModule = pyodide.pyimport(name);
  } catch (_) {}
  if (pythonModule) {
    return;
  }

  // If the import is for a package built into Pyodide then load it.
  // Built-ins: https://pyodide.org/en/stable/usage/packages-in-pyodide.html
  await pyodide.loadPackage(name)?.catch(() => {});
  let pyodidePackage;
  try {
    pyodidePackage = pyodide.pyimport(name);
  } catch (_) {}
  if (pyodidePackage) {
    return;
  }

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
      await pyodide.loadPackage(
        `${process.env.ASSETS_URL}/packages/turtle-0.0.1-py3-none-any.whl`,
      );
    },
    after: () =>
      pyodide.runPython(`
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
      await pyodide.loadPackage([
        "setuptools",
        `${process.env.ASSETS_URL}/packages/p5-0.0.1-py3-none-any.whl`,
      ]);
    },
    after: () => {},
  },
  pygal: {
    before: () => {
      pyodide.registerJsModule("pygal", { ...pygal });
      pygal.config.renderChart = (content) => {
        postMessage({ method: "handleVisual", origin: "pygal", content });
      };
    },
    after: () => {},
  },
  sense_hat: {
    before: async () => {
      pyodide.registerJsModule("_internal_sense_hat", {
        ..._internal_sense_hat,
      });
      await pyodide.loadPackage([
        "pillow",
        `${process.env.ASSETS_URL}/packages/sense_hat-0.0.1-py3-none-any.whl`,
      ]);

      _internal_sense_hat.config.pyodide = pyodide;
      _internal_sense_hat.config.emit = (type) =>
        postMessage({ method: "handleSenseHatEvent", type });
    },
    after: () => {
      const {
        pyodide,
        emit,
        sensestick,
        start_motion_callback,
        stop_motion_callback,
        ...config
      } = _internal_sense_hat.config;
      postMessage({
        method: "handleVisual",
        origin: "sense_hat",
        content: config,
      });
    },
  },
  matplotlib: {
    before: async () => {
      pyodide.registerJsModule("basthon", fakeBasthonPackage);
      pyodide.runPython(`
      import js

      class Dud:
          def __init__(self, *args, **kwargs) -> None:
              return
          def __getattr__(self, __name: str):
              return Dud
      js.document = Dud()
      `);
      await pyodide.loadPackage("matplotlib")?.catch(() => {});
      let pyodidePackage;
      try {
        pyodidePackage = pyodide.pyimport("matplotlib");
      } catch (_) {}
      if (pyodidePackage) {
        return;
      }
    },
    after: () => {
      pyodide.runPython(`
      import matplotlib.pyplot as plt
      import io
      import base64
      import basthon

      bytes_io = io.BytesIO()
      plt.savefig(bytes_io, format='jpg')
      bytes_io.seek(0)
      basthon.kernel.display_event({ "display_type": "matplotlib", "content": bytes_io.read() })
      `);
    },
  },
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
    stdout: (content) =>
      postMessage({ method: "handleOutput", stream: "stdout", content }),
    stderr: (content) =>
      postMessage({ method: "handleOutput", stream: "stderr", content }),
  });

  pyodide = await pyodidePromise;

  if (supportsAllFeatures) {
    stdinBuffer =
      stdinBuffer || new Int32Array(new SharedArrayBuffer(1024 * 1024)); // 1 MiB
    stdinBuffer[0] = 1; // Store the length of content in the buffer at index 0.
    pyodide.setStdin({ isatty: true, read: readFromStdin });

    interruptBuffer =
      interruptBuffer || new Uint8Array(new SharedArrayBuffer(1));
    pyodide.setInterruptBuffer(interruptBuffer);
  }

  postMessage({ method: "handleLoaded", stdinBuffer, interruptBuffer });
};

const readFromStdin = (bufferToWrite) => {
  const previousLength = stdinBuffer[0];
  postMessage({ method: "handleInput" });

  while (true) {
    pyodide.checkInterrupt();
    const result = Atomics.wait(stdinBuffer, 0, previousLength, 100);
    if (result === "not-equal") {
      break;
    }
  }

  const currentLength = stdinBuffer[0];
  if (currentLength === -1) {
    return 0;
  } // Signals that stdin was closed.

  const addedBytes = stdinBuffer.slice(previousLength, currentLength);
  bufferToWrite.set(addedBytes);

  return addedBytes.length;
};

const parsePythonError = (error) => {
  const type = error.type;
  const [trace, info] = error.message.split(`${type}:`).map((s) => s?.trim());

  const lines = trace.split("\n");

  const snippetLine = lines[lines.length - 2]; //    print("hi")invalid
  const caretLine = lines[lines.length - 1]; //                 ^^^^^^^

  const showsMistake = caretLine.includes("^");
  const mistake = showsMistake
    ? [snippetLine.slice(4), caretLine.slice(4)].join("\n")
    : "";

  const matches = [...trace.matchAll(/File "(.*)", line (\d+)/g)];
  const match = matches[matches.length - 1];

  const path = match ? match[1] : "";
  const base = path.split("/").reverse()[0];
  const file = base === "<exec>" ? "main.py" : base;

  const line = match ? parseInt(match[2], 10) : "";

  return { file, line, mistake, type, info };
};

reloadPyodideToClearState();

module.exports = {
  onmessage,
  postMessage,
};
