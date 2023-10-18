import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WebComponentProject from "./WebComponentProject";

let store;

beforeEach(() => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [],
      },
      openFiles: [],
      focussedFileIndices: [],
    },
    auth: {},
  };
  store = mockStore(initialState);

  render(
    <Provider store={store}>
      <WebComponentProject />
    </Provider>,
  );
});

test("Does stuff", () => {});
