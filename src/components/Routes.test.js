import { fireEvent, render, screen } from "@testing-library/react"
import { Route, Router, MemoryRouter, Link } from "react-router-dom";
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux'
import { createMemoryHistory } from 'history';
import configureStore from 'redux-mock-store';
import App from '../App';

let store
let project = {identifier: 'hello-world-project', name: 'my amazing project', project_type: 'python'}
let testHistory, testLocation;

beforeEach(() => {
  const mockStore = configureStore([])
  const initialState = {
    editor: {
      project: project,
    },
    auth: {}
  }
  store = mockStore(initialState);
})

const ProjectRoute = () => (
  <div>
    <Route
      path='/'
      render={({ history, location }) => {
        testHistory = history;
        testLocation = location;
        return (
          <div>
            <Link to='/python/hello-world-project' id='click-me'>
              Project Page
            </Link>
          </div>
        )
      }}
    />
  </div>
);

test('shows the redirected project page', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Provider store={store}>
        <ProjectRoute />
      </Provider>
    </MemoryRouter>
  );


  act(() => {
      const goToProjectPage = document.querySelector('#click-me');
      fireEvent.click(goToProjectPage)
  });

  console.log('YOYO')
  console.log(testHistory.pathname)
  console.log(testLocation.pathname)
  console.log(window.location.pathname)
  // expect(screen.queryByText(project.name)).toBeInTheDocument()
});