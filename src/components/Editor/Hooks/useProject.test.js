import { renderHook } from "@testing-library/react";
import {useProject} from './useProject';
import { loadProject, setProject } from "../EditorSlice";
import { waitFor } from "@testing-library/react";
import { defaultHtmlProject, defaultPythonProject } from '../../../utils/defaultProjects'


jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => { return jest.fn() }
}))

jest.mock('../EditorSlice', () => ({
  loadProject: jest.fn(),
  setProject: jest.fn(),
  setProjectLoaded: jest.fn()
}))

jest.mock('../../../utils/apiCallHandler', () => ({
  readProject: async (identifier) => Promise.resolve({'data': {'identifier': identifier, 'project_type': 'python'}})
}))

const cachedProject = {
  project_type: 'python',
  identifier: 'hello-world-project',
  components: []
}

const uncachedProject = {
  project_type: 'python',
  identifier: 'hello-world-project',
}

const project1 = {
  project_type: 'python',
  identifier: 'my-favourite-project',
}

test("If no identifier and project type is HTML uses default HTML project", () => {
  renderHook(() => useProject('html'))
  expect(setProject).toHaveBeenCalledWith(defaultHtmlProject)
})

test("If no identifier and project type is not HTML uses default python project", () => {
  renderHook(() => useProject('blah'))
  expect(setProject).toHaveBeenCalledWith(defaultPythonProject)
})

test("If cached project matches identifer uses cached project", () => {
  localStorage.setItem(cachedProject.identifier, JSON.stringify(cachedProject))
  renderHook(() => useProject('python', cachedProject.identifier))
  expect(setProject).toHaveBeenCalledWith(cachedProject)
})

test("If cached project matches identifer clears cached project", () => {
  localStorage.setItem(cachedProject.identifier, JSON.stringify(cachedProject))
  renderHook(() => useProject('python', cachedProject.identifier))
  expect(localStorage.getItem('project')).toBeNull()
})

test("If cached project does not match identifer does not use cached project", async () => {
  localStorage.setItem('project', JSON.stringify(cachedProject))
  renderHook(() => useProject('python', 'my-favourite-project'))
  await waitFor(() => expect(setProject).not.toHaveBeenCalledWith(cachedProject))
})

test("If cached project does not match identifer loads correct uncached project", async () => {
  localStorage.setItem('project', JSON.stringify(cachedProject))
  renderHook(() => useProject('python', project1.identifier))
  await waitFor(() => expect(loadProject).toHaveBeenCalledWith(project1.identifier))
})

test("If cached project does not match identifer clears cached project", () => {
  localStorage.setItem(cachedProject.identifier, JSON.stringify(cachedProject))
  renderHook(() => useProject('python', cachedProject.identifier))
  expect(localStorage.getItem(cachedProject.identifier)).toBeNull()
})

test("If no cached project loads uncached project", async () => {
  renderHook(() => useProject('python', 'hello-world-project'))
  await waitFor(() => expect(loadProject).toHaveBeenCalledWith('hello-world-project'))
})

afterEach(() => {
  localStorage.clear()
})
