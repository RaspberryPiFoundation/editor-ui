import React from "react";
import { MemoryRouter } from "react-router-dom";
import configureStore from 'redux-mock-store';
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import userManager from "../../utils/userManager";
import Login from "./Login";

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
  })

  test("Login button shown", () => {
    expect(screen.getByText(/Log/).textContent).toBe("Login")
  })

  test("Clicking login button signs the user in", () => {
    const loginButton = screen.getByText("Login")
    fireEvent.click(loginButton)
    expect(userManager.signinRedirect).toHaveBeenCalled()
  })

  test("Clicking login button saves the user's project content in local storage", () => {
    const loginButton = screen.getByText("Login")
    fireEvent.click(loginButton)
    expect(localStorage.getItem('project')).toBe(JSON.stringify(project))
  })

  test("Clicking login button saves user's location to local storage", () => {
    const loginButton = screen.getByText("Login")
    fireEvent.click(loginButton)
    expect(localStorage.getItem('location')).toBe('/my_project')
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

  test("Clicking log out button signs the user out", () => {
    const loginButton = screen.getByText("Logout")
    fireEvent.click(loginButton)
    expect(userManager.removeUser).toHaveBeenCalled()
  })

})
