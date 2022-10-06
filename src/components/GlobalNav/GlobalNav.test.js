import React from "react";
import { render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import GlobalNav from "./GlobalNav";

test('Global nav renders', () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    auth: {}
  }
  const store = mockStore(initialState);
  render(<Provider store={store}><GlobalNav/></Provider>);
  expect(screen.queryByText("Raspberry Pi Foundation")).toBeInTheDocument()
})

test('When not logged in renders generic profile image', () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    auth: {}
  }
  const store = mockStore(initialState);
  render(<Provider store={store}><GlobalNav/></Provider>);
  expect(screen.queryByAltText(`Account menu`)).toBeInTheDocument()
})

test('When logged in renders user\'s profile image', () => {
  const name = "Joe Bloggs"
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    auth: {
      user: {
        profile: {
          name: name,
          picture: 'image_url'
        }
      }
    }
  }
  const store = mockStore(initialState);
  render(<Provider store={store}><GlobalNav/></Provider>);
  expect(screen.queryByAltText(`${name}'s account`)).toHaveAttribute('src', 'image_url')
})
