import React from "react";
import EmbeddedViewer from "./EmbeddedViewer";

import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

let store;

beforeEach(() => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);

  const initialState = {
    editor: {
      loading: "success",
      project: {
        components: [],
      },
    },
    auth: {},
  };
  store = mockStore(initialState);
});

test("Renders without crashing", () => {
  const { asFragment } = render(
    <Provider store={store}>
      <MemoryRouter>
        <EmbeddedViewer />
      </MemoryRouter>
    </Provider>,
  );
  expect(asFragment()).toMatchSnapshot();
});
