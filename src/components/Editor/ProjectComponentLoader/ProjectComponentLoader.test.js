import React from "react";
import { render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ProjectComponentLoader from "./ProjectComponentLoader";
import { setProject } from "../EditorSlice";
import { legacyDefaultPythonProject } from "../../../utils/defaultProjects";
import { MockedProvider } from "@apollo/client/testing";

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn()
}));

test("Renders loading message if loading is pending", () => {
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

test("Loads default project if loading fails", () => {
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
  const expectedActions = [setProject(legacyDefaultPythonProject)]
  expect(store.getActions()).toEqual(expectedActions)
})

test("Does not render loading message if loading is success", () => {
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
  render(<Provider store={store}><MockedProvider><div id='app'></div><ProjectComponentLoader match={{params: {}}}/></MockedProvider></Provider>)
  expect(screen.queryByText('project.loading')).not.toBeInTheDocument()
})
