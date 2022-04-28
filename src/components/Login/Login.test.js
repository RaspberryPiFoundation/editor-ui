import React from "react";
import { render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import Login from "./Login";

test("Login button shown when not logged in", () => {
  const user = null
  const { getByText} = render(<Login user={user} />);

  expect(getByText(/Log/).textContent).toBe("Login")
})

test("Logout button shown when user logged in", () => {
  const user = { profile: { email: 'test@example.com' }}
  const {getByText} = render(<Login user={user} />)

  expect(getByText(/Log/).textContent).toBe("Logout")
})
