import React from "react";
import { fireEvent, render } from "@testing-library/react"
import { toHaveAttribute } from "@testing-library/jest-dom"
import { Provider } from 'react-redux';
import configureStore, {getActions} from 'redux-mock-store';

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
  const {getByText} = render(<Provider store={store}><div id='root'><Login /></div></Provider>)

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
  const {getByText} = render(<Provider store={store}><div id='root'><Login /></div></Provider>)

  expect(getByText(/Log/).textContent).toBe("Logout")

})
