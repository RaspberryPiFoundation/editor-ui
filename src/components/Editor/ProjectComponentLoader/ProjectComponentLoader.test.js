import React from "react";
import { render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ProjectComponentLoader from "./ProjectComponentLoader";

test("Renders loading message if projectloaded is pending", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      loading: 'pending'
    },
    auth: {}
  }
  const store = mockStore(initialState);
  render(<Provider store={store}><ProjectComponentLoader match={{params: {}}}/></Provider>)
  expect(screen.queryByText('project.loading')).toBeInTheDocument()
})

test("Renders failed message if projectloaded is failed", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      loading: 'failed'
    },
    auth: {}
  }
  const store = mockStore(initialState);
  render(<Provider store={store}><ProjectComponentLoader match={{params: {}}}/></Provider>)
  expect(screen.queryByText('project.notFound')).toBeInTheDocument()
})

test("Does not render loading or failed message if projectloaded is success", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      project: {
        components: []
      },
      openFiles: [],
      loading: 'success'
    },
    auth: {}
  }
  const store = mockStore(initialState);
  render(<Provider store={store}><div id='app'></div><ProjectComponentLoader match={{params: {}}}/></Provider>)
  expect(screen.queryByText('project.loading')).not.toBeInTheDocument()
  expect(screen.queryByText('project.notFound')).not.toBeInTheDocument()
})
