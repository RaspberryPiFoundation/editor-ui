import { renderHook } from "@testing-library/react";
import { useProjectList } from './useProjectList';
import { loadProjectList } from "../EditorSlice";
import { Provider } from "react-redux";
import configureStore from 'redux-mock-store';


jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => (jest.fn())
}))

jest.mock('../EditorSlice')

const project1 = { project_type: 'python', identifier: 'my-favourite-project' }
const project2 = { project_type: 'html', identifier: 'my-html-project' }

jest.mock('../../../utils/apiCallHandler', () => ({
  readProjectList: async (page) => Promise.resolve({'data': {projects: [project1, project2]}, page})
}))

const accessToken = 'my_access_token'
const user = {access_token: accessToken}

test("When logged in and loading idle", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      projectList: [],
      projectListLoaded: 'idle',
      projectIndexCurrentPage: 5
    },
    auth: {user}
  }
  const store = mockStore(initialState);
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>
  renderHook(() => useProjectList(user), {wrapper})
  expect(loadProjectList).toHaveBeenCalledWith({ accessToken, page: 5 })
})

test("When logged in and loading success", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      projectList: [],
      projectListLoaded: 'success',
      projectIndexCurrentPage: 5
    },
    auth: {user}
  }
  const store = mockStore(initialState);
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>
  renderHook(() => useProjectList(user), {wrapper})
  expect(loadProjectList).not.toHaveBeenCalled()
})

test("When not logged in", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      projectList: [],
      projectListLoaded: 'idle',
      projectIndexCurrentPage: 5
    },
    auth: {
      user: {}
    }
  }
  const store = mockStore(initialState);
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>
  renderHook(() => useProjectList(), {wrapper})
  expect(loadProjectList).not.toHaveBeenCalled()
})
