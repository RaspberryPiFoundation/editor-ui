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
          image_list: [],
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
          image_list: [],
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

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [],
          image_list: [],
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
  });

  test("Sets up p5 canvas", () => {
    expect(Sk.py5.sketch).not.toBeNull();
  });

  test("Sets up pygal canvas", () => {
    expect(Sk.pygal.outputCanvas).not.toBeNull();
  });

  test("Sets up turtle canvas", () => {
    expect(Sk.TurtleGraphics.target).not.toBeNull();
  });
});
