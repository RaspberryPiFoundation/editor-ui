import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import AstroPiModel from "./AstroPiModel";
import configureStore from "redux-mock-store";
import Sk from "skulpt";

let container;
let store;

const getBeforeEach =
  ({ mode3d = false }) =>
  () => {
    Sk.sense_hat = {
      mz_criteria: {},
      rtimu: {
        temperature: [0, 0],
        pressure: [0, 0],
        humidity: [0, 0],
      },
    };
    window.mod = {
      rotation: {},
    };
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        codeRunTriggered: false,
      },
    };
    store = mockStore(initialState);
    container = render(
      <Provider store={store}>
        {" "}
        <AstroPiModel initialIs3d={mode3d} />{" "}
      </Provider>,
    );
  };

describe("2D mode", () => {
  beforeEach(getBeforeEach({ mode3d: false }));

  test("Component renders", () => {
    expect(container).not.toBeNull();
  });

  test("Dimension button switches to 3D", () => {
    fireEvent.click(
      container.getByRole("button", {
        name: "output.senseHat.view.toggleTo3D",
      }),
    );
    container.getByRole("button", { name: "output.senseHat.view.toggleTo2D" });
  });
});

describe("3D mode", () => {
  beforeEach(getBeforeEach({ mode3d: true }));

  test("Component renders", () => {
    expect(container).not.toBeNull();
  });

  test("Update orientation function resets the model", () => {
    fireEvent.click(
      container.getByRole("button", {
        name: "output.senseHat.view.resetOrientation",
      }),
    );
    expect(window.mod.rotation).toStrictEqual({ x: 0, y: 0, z: 0 });
  });

  test("Dimension button switches to 2D", () => {
    fireEvent.click(
      container.getByRole("button", {
        name: "output.senseHat.view.toggleTo2D",
      }),
    );
    container.getByRole("button", { name: "output.senseHat.view.toggleTo3D" });
  });

  test("Switching to 2D preserves framebuffer orientation after a rotated set_pixels", () => {
    // Index mapping emitted by `set_pixels` after `set_rotation(90)`
    // (pix_map90 in sense_hat_blob.py, flattened)
    const rotation90Indexes = Array.from(
      { length: 64 },
      (_, i) => 7 - Math.floor(i / 8) + 8 * (i % 8),
    );
    const red = [248, 0, 0];
    const green = [0, 252, 0];
    const off = [0, 0, 0];
    // Asymmetric image: only the first two pixels of the top row are lit
    const image = Array(64).fill(off);
    image[0] = red;
    image[1] = green;

    // State left behind by the 3D view after handling `setpixels`
    Sk.sense_hat.pixels = [...image];
    Sk.sense_hat.rotation_mapping = rotation90Indexes;

    fireEvent.click(
      container.getByRole("button", {
        name: "output.senseHat.view.toggleTo2D",
      }),
    );

    // Pixels are normalised back to framebuffer order
    expect(Sk.sense_hat.pixels[7]).toEqual(red);
    expect(Sk.sense_hat.pixels[15]).toEqual(green);
    expect(Sk.sense_hat.pixels[0]).toEqual(off);
    expect(Sk.sense_hat.pixels[1]).toEqual(off);
    expect(Sk.sense_hat.rotation_mapping).toBeNull();

    // Framebuffer indexes 7 and 15 are rendered in the bottom-right corner
    const leds = container.container.querySelectorAll(
      ".sense-hat-model-2d-matrix__led-bulb",
    );
    expect(leds).toHaveLength(64);
    expect(leds[63]).toHaveStyle({ backgroundColor: "rgb(248, 0, 0)" });
    expect(leds[62]).toHaveStyle({ backgroundColor: "rgb(0, 252, 0)" });
    expect(leds[7]).toHaveStyle({ backgroundColor: "rgb(0, 0, 0)" });
    expect(leds[15]).toHaveStyle({ backgroundColor: "rgb(0, 0, 0)" });
  });
});
