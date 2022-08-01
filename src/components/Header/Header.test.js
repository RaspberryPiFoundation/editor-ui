import React from "react";
import { render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from "react-router-dom";

import Header from "./Header";

test("Login button shown when not embedded", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      isEmbedded: false
    },
    auth: {
      user: null 
    }
  }
  const store = mockStore(initialState);
  const {queryByText} = render(<Provider store={store}><MemoryRouter><Header /></MemoryRouter></Provider>)

  expect(queryByText(/Login/)).not.toBeNull()
})

test("Login button not shown when embedded", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      isEmbedded: true
    },
    auth: {
      user: null 
    }
  }
  const store = mockStore(initialState);
  const {queryByText} = render(<Provider store={store}><Header /></Provider>)

  expect(queryByText(/Login/)).toBeNull()
})
