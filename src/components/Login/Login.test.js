import React from "react";
import { MemoryRouter } from "react-router-dom";
import configureStore from 'redux-mock-store';
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import userManager from "../../utils/userManager";
import Login from "./LoginButton";

jest.mock("../../utils/userManager", () => ({
  signinRedirect: jest.fn(),
  removeUser: jest.fn()
}))

describe('When not logged in', () => {
  const project = {
    components: [
      {
        name: 'main',
        extension: 'py',
        content: 'print("hello world")'
      }
    ]
  }
  let loginButton;
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: project
      },
      auth: {
        user: null
      }
    }
    const store = mockStore(initialState);
    render(<MemoryRouter initialEntries={['/my_project']}><Provider store={store}><Login /></Provider></MemoryRouter>)
    loginButton = screen.queryByText('globalNav.accountMenu.login')
  })

  test("Login button shown", () => {
    expect(loginButton).toBeInTheDocument()
  })

  test("Clicking login button signs the user in", () => {
    fireEvent.click(loginButton)
    expect(userManager.signinRedirect).toHaveBeenCalled()
  })

  test("Clicking login button saves the user's project content in local storage", () => {
    fireEvent.click(loginButton)
    expect(localStorage.getItem('project')).toBe(JSON.stringify(project))
  })

  test("Clicking login button saves user's location to local storage", () => {
    fireEvent.click(loginButton)
    expect(localStorage.getItem('location')).toBe('/my_project')
  })

})

describe('When logged in', () => {
  let logoutButton;

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
    logoutButton = screen.queryByText('globalNav.accountMenu.logout')
  })

  test("Log out button shown", () => {
    expect(logoutButton).toBeInTheDocument()
  })

  test("Clicking log out button signs the user out", () => {
    fireEvent.click(logoutButton)
    expect(userManager.removeUser).toHaveBeenCalled()
  })

})
