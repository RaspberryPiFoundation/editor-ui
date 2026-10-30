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
    fireEvent.click(container.getByRole("button", { name: "3D" }));
    container.getByRole("button", { name: "2D" });
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
        name: "Reset Astro Pi orientation",
      }),
    );
    expect(window.mod.rotation).toStrictEqual({ x: 0, y: 0, z: 0 });
  });

  test("Dimension button switches to 2D", () => {
    fireEvent.click(container.getByRole("button", { name: "2D" }));
    container.getByRole("button", { name: "3D" });
  });
});
