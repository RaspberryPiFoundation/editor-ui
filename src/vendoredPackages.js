/* global pygal, _internal_sense_hat */

// importScripts(`${process.env.ASSETS_URL}/pyodide/shims/_internal_sense_hat.js`);
// importScripts(`${process.env.ASSETS_URL}/pyodide/shims/pygal.js`);

const setupVendoredPackages = async (pyodide) => {
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

  return {
    turtle: {
      before: async () => {
        pyodide.registerJsModule("basthon", fakeBasthonPackage);
        await pyodide.loadPackage(
          `${process.env.ASSETS_URL}/pyodide/packages/turtle-0.0.1-py3-none-any.whl`,
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
          `${process.env.ASSETS_URL}/pyodide/packages/p5-0.0.1-py3-none-any.whl`,
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
          `${process.env.ASSETS_URL}/pyodide/packages/sense_hat-0.0.1-py3-none-any.whl`,
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
        // Patch the document object to prevent matplotlib from trying to render. Since we are running in a web worker,
        // the document object is not available. We will instead capture the image and send it back to the main thread.
        pyodide.runPython(`
        import js

        class DummyDocument:
            def __init__(self, *args, **kwargs) -> None:
                return
            def __getattr__(self, __name: str):
                return DummyDocument
        js.document = DummyDocument()
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
        import basthon

        bytes_io = io.BytesIO()
        plt.savefig(bytes_io, format='jpg')
        bytes_io.seek(0)
        basthon.kernel.display_event({ "display_type": "matplotlib", "content": bytes_io.read() })
        `);
      },
    },
  };
};

export default setupVendoredPackages;
