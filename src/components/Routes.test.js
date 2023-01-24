import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { BrowserRouter, Route, Router, Redirect, MemoryRouter, Link } from "react-router-dom";
import { Provider } from 'react-redux'
import { createMemoryHistory } from 'history';
import configureStore from 'redux-mock-store';

let store

const project = {
  name: 'hello world',
    project_type: 'python',
    identifier: 'hello-world-project',
    components: [
      {
        name: 'main',
        extension: 'py',
        content: '# hello'
      }
    ]
}

beforeEach(() => {
  const mockStore = configureStore([])
  const initialState = {
    editor: {
      project
    },
    auth: {}
  }
  store = mockStore(initialState);
})


test('using a stale project link', async () => {
  const history = createMemoryHistory()

  render(
    <Provider store={store}>
      <Router history={history}>
        <Redirect exact path={`/${project.project_type}/${project.identifier}`} to={`/projects/${project.identifier}`}/>
      </Router>
    </Provider>
  )

  act(() => history.push(`/${project.project_type}/${project.identifier}`))
  expect(history.entries[0].pathname).toEqual(`/projects/${project.identifier}`)
})
