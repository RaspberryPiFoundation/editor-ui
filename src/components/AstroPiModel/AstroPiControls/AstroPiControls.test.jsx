import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import AstroPiControls from "./AstroPiControls";
import Sk from "skulpt";

let container;
let store;

beforeEach(() => {
  Sk.sense_hat = {
    mz_criteria: {},
    rtimu: {
      temperature: [0, 0],
      pressure: [0, 0],
      humidity: [0, 0],
    },
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
      <AstroPiControls
        temperature={65}
        pressure={456}
        humidity={37}
        motion={true}
        colour="#e01010"
      />
    </Provider>,
  );
});

test("Renders temperature with units", () => {
  expect(container.queryByText("65°C")).not.toBeNull();
});

test("Renders pressure with units", () => {
  expect(container.getByText("456hPa")).not.toBeNull();
});

test("Renders humidity with units", () => {
  expect(container.getByText("37%")).not.toBeNull();
});

test("Renders temperature input with correct value", () => {
  expect(container.queryByDisplayValue(65)).not.toBeNull();
});

test("Renders pressure input with correct value", () => {
  expect(container.queryByDisplayValue(456)).not.toBeNull();
});

test("Renders humidity input with correct value", () => {
  expect(container.queryByDisplayValue(37)).not.toBeNull();
});

test("Renders motion input with correct value", () => {
  expect(
    container.queryByLabelText("output.senseHat.controls.motion").checked,
  ).toBe(true);
});

test("Renders colour input with correct value", () => {
  expect(container.queryByDisplayValue("#e01010")).not.toBeNull();
});
