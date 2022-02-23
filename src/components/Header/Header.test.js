import React from "react";
import { fireEvent, render } from "@testing-library/react"
import { toHaveAttribute } from "@testing-library/jest-dom"
import { Provider } from 'react-redux';
import configureStore, {getActions} from 'redux-mock-store';

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
  const {queryByText} = render(<Provider store={store}><Header /></Provider>)
  
  console.log(document.getElementsByTagName("button")[0].textContent)

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
