import { act, render } from "@testing-library/react"
import { Router, Redirect } from "react-router-dom";
import { Provider } from 'react-redux'
import { createMemoryHistory } from 'history';
import configureStore from 'redux-mock-store';

let store

beforeEach(() => {
  const mockStore = configureStore([])
  const initialState = {
    editor: {},
    auth: {}
  }
  store = mockStore(initialState);
})


test('using a stale project link', async () => {
  const history = createMemoryHistory()

  render(
    <Provider store={store}>
      <Router history={history}>
        <Redirect exact path='/python/hello-world-project' to='/projects/hello-world-project'/>
      </Router>
    </Provider>
  )

  act(() => history.push('/python/hello-world-project'))
  expect(history.entries[0].pathname).toEqual('/projects/hello-world-project')
})
