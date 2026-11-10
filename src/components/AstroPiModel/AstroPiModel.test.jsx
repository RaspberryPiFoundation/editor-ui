import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import AstroPiModel from "./AstroPiModel";
import configureStore from "redux-mock-store";
import Sk from "skulpt";
import { act } from "react";
import {
  quantisePixel,
  rotate,
  rotationAnticlockwise90degrees,
  rotationClockwise90degrees,
} from "../../utils/senseHatUtils";

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
});

describe("SenseHAT LED matrix rotations", () => {
  beforeEach(getBeforeEach({ mode3d: true }));

  const R = [255, 0, 0];
  const G = [0, 255, 0];
  const O = [0, 0, 0];
  // prettier-ignore
  const image = [
    O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O,
    O, O, O, O, O, O, O, O,
    R, O, O, O, O, O, O, O,
    G, O, O, O, O, O, O, O,
  ];

  test("rotates Sk.sense_hat.pixels back into framebuffer order on setpixels", async () => {
    Sk.sense_hat.pixels = image;

    // when
    act(() => {
      const setRotation270 = rotationAnticlockwise90degrees;
      Sk.sense_hat_emit("setpixels", setRotation270);
    });

    // then
    const rotatedClockwise = rotate(rotationClockwise90degrees, image).map(
      quantisePixel,
    );
    // should be rotated clockwise
    expect(Sk.sense_hat.pixels).toEqual(rotatedClockwise);
  });

  test("rotated orientation is preserved on switch from 3D to 2D", async () => {
    // Given a rotated image
    Sk.sense_hat.pixels = image;
    act(() => {
      const setRotation270 = rotationAnticlockwise90degrees;
      Sk.sense_hat_emit("setpixels", setRotation270);
    });

    const rotatedClockwise = rotate(rotationClockwise90degrees, image).map(
      quantisePixel,
    );

    expect(Sk.sense_hat.pixels).toEqual(rotatedClockwise);

    // when switched to 2D
    fireEvent.click(
      container.getByRole("button", {
        name: "output.senseHat.view.toggleTo2D",
      }),
    );

    // then orientation is preserved
    expect(Sk.sense_hat.pixels).toEqual(rotatedClockwise);
  });
});
