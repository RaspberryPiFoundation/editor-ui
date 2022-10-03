import React from "react";
// import store from '../../app/store'
import { MemoryRouter } from "react-router-dom";
import configureStore from 'redux-mock-store';
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';

import Login from "./Login";

const mockSignIn = jest.fn()

jest.mock('redux-oidc', () => ({
  ...jest.requireActual('redux-oidc'),
  createUserManager: jest.fn().mockImplementation(() => {
    return {events: {addAccessTokenExpired: jest.fn()}}
  })
}))

// jest.mock('redux-oidc')

jest.mock('oidc-client', () => ({
  ...jest.requireActual('oidc-client'),
  UserManager: () => ({
    signinRedirect: mockSignIn,
    // createUserManager: jest.fn()
  })
}));

// test("Clicking Login button triggers signinRedirect", () => {
//   const user = null
//   const { getByText} = render(<MemoryRouter initialEntries={['/']}><Provider store={store}><Login user={user} /></Provider></MemoryRouter>);
//   const loginButton = getByText("Login")
//   fireEvent.click(loginButton)
//   expect(mockSignIn).toHaveBeenCalled()
// })

// test("Logout button shown when user logged in", () => {
//   const user = { profile: { email: 'test@example.com' }}
//   const {getByText} = render(<MemoryRouter initialEntries={['/']}><Provider store={store}><Login user={user} /></Provider></MemoryRouter>)

//   expect(getByText(/Log/).textContent).toBe("Logout")
// })

describe('When not logged in', () => {
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {}
      },
      auth: {
        user: null
      }
    }
    const store = mockStore(initialState);
    render(<MemoryRouter initialEntries={['/']}><Provider store={store}><Login /></Provider></MemoryRouter>)
  })

  test("Login button shown", () => {
    expect(screen.getByText(/Log/).textContent).toBe("Login")
  })

  test("Clicking Login button triggers signinRedirect", () => {
    const loginButton = screen.getByText("Login")
    fireEvent.click(loginButton)
    expect(mockSignIn).toHaveBeenCalled()
})

})

describe('When logged in', () => {
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {}
      },
      auth: {
        user: {}
      }
    }
    const store = mockStore(initialState);
    render(<MemoryRouter initialEntries={['/']}><Provider store={store}><Login /></Provider></MemoryRouter>)
  })

  test("Log out button shown", () => {
    expect(screen.getByText(/Log/).textContent).toBe("Logout")
  })

})
