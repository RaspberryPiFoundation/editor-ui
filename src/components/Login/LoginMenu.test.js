import React from "react";
import { render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from "react-router-dom";
import LoginMenu from "./LoginMenu";

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
    render(<MemoryRouter initialEntries={['/']}><Provider store={store}><LoginMenu/></Provider></MemoryRouter>);
  })

  test('Login button renders', () => {
    expect(screen.queryByText('Login')).toBeInTheDocument()
  })

  test('My profile does not render', () => {
    expect(screen.queryByText('My profile')).not.toBeInTheDocument()
  })

  test('My projects does not render', () => {
    expect(screen.queryByText('My projects')).not.toBeInTheDocument()
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
        user: {
          profile: {
            profile: 'profile_url'
          }
        }
      }
    }
    const store = mockStore(initialState);
    render(<MemoryRouter initialEntries={['/']}><Provider store={store}><LoginMenu/></Provider></MemoryRouter>);
  })

  test('Logout button renders', () => {
    expect(screen.queryByText('Logout')).toBeInTheDocument()
  })

  test('My profile renders with correct link', () => {
    expect(screen.queryByText('My profile')).toHaveAttribute('href', 'profile_url/edit')
  })

  test('My projects renders with correct link', () => {
    expect(screen.queryByText('My projects')).toHaveAttribute('href', '/projects')
  })
})
