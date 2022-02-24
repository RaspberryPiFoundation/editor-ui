import React from "react";
import { render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import Login from "./Login";

test("Login button shown when not logged in", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    auth: {
      user: null 
    }
  }
  const store = mockStore(initialState);
  const { getByText} = render(<Provider store={store}><Login /></Provider>);

  expect(getByText(/Log/).textContent).toBe("Login")
    
})

test("Logout button shown when logged in", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    auth: {
      user: []
    }
  }
  const store = mockStore(initialState);
  const {getByText} = render(<Provider store={store}><Login /></Provider>)

  expect(getByText(/Log/).textContent).toBe("Logout")

})
