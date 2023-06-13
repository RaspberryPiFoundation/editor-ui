import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Output from "./Output";
import { MemoryRouter } from "react-router-dom";

test("Component renders", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [],
      },
    },
  };
  const store = mockStore(initialState);
  const { container } = render(
    <Provider store={store}>
      <MemoryRouter>
        <Output />
      </MemoryRouter>
    </Provider>,
  );
  expect(container.lastChild).toHaveClass("proj-runner-container");
});
