import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import VisualOutputPane from "./VisualOutputPane";
import Sk from "skulpt";

describe("When Sense Hat library used", () => {
  let canvas;
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "import _internal_sense_hat",
            },
          ],
          images: [],
        },
        codeRunTriggered: true,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <VisualOutputPane />
      </Provider>,
    );
    canvas = document.getElementsByClassName("sense-hat")[0];
  });

  test("Astro Pi component appears", () => {
    expect(canvas).not.toBeNull();
  });
});

describe("When Sense Hat library not used", () => {
  let canvas;
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "print('Hello world')",
            },
          ],
          images: [],
        },
        codeRunTriggered: true,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <VisualOutputPane />
      </Provider>,
    );
    canvas = document.getElementsByClassName("sense-hat")[0];
  });

  test("Astro Pi component does not appear", () => {
    expect(canvas).not.toBeDefined();
  });
});

describe("When code run is triggered", () => {
  let store;
  let container;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [],
          images: [],
        },
        codeRunTriggered: true,
      },
    };
    store = mockStore(initialState);
    const renderResult = render(
      <Provider store={store}>
        <VisualOutputPane />
      </Provider>,
    );
    container = renderResult.container;
  });

  test("Sets up p5 canvas", () => {
    const p5Sketch = container.querySelector("#p5Sketch");
    expect(p5Sketch).not.toBeNull();
  });

  test("Sets up pygal canvas", () => {
    expect(Sk.pygal.outputCanvas).not.toBeNull();
  });

  test("Sets up turtle canvas", () => {
    expect(Sk.TurtleGraphics.target).not.toBeNull();
  });
});
