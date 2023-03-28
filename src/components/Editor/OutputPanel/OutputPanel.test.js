import React from "react";
import { render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import OutputPanel from "./OutputPanel";

test("Component renders", () => {
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: []
        }
      }
    }
    const store = mockStore(initialState);
  const {container} = render(<Provider store={store}><OutputPanel/></Provider>)
  expect(container.lastChild).toHaveClass("proj-runner-container");
})
