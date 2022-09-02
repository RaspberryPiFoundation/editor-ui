import React from "react";
import { fireEvent, render } from "@testing-library/react"
import { Provider } from 'react-redux';
import AstroPiModel from "./AstroPiModel";
import configureStore from 'redux-mock-store';
import Sk from 'skulpt';

let container;
let store;

beforeEach(() => {
  Sk.sense_hat={
    mz_criteria: {},
    rtimu: {
      temperature: [0,0],
      pressure: [0,0],
      humidity: [0,0]
    }
  }
  window.mod={
    rotation: {}
  }
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        codeRunTriggered: false
      },
    }
    store = mockStore(initialState);
    container = render(<Provider store={store}> <AstroPiModel/> </Provider>)
})

test("Component renders", () => {
  expect(container).not.toBeNull()
})

test("Update orientation function resets the model", () => {
  fireEvent.click(container.getByRole("button"))
  expect(window.mod.rotation).toStrictEqual({x: 0, y: 0, z:0})
})
