import { renderHook } from "@testing-library/react";
import {useProject} from './useProject';
import { syncProject, setProject } from "../EditorSlice";
import { waitFor } from "@testing-library/react";
import { defaultHtmlProject, defaultPythonProject } from '../../../utils/defaultProjects'


jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => (jest.fn())
}))

const loadProject = jest.fn()

jest.mock('../EditorSlice')

jest.mock('../../../utils/apiCallHandler', () => ({
  readProject: async (identifier, projectType) => Promise.resolve({'data': {'identifier': identifier, 'project_type': projectType}})
}))

const cachedProject = {
  project_type: 'python',
  identifier: 'hello-world-project',
  components: []
}

const project1 = {
  project_type: 'python',
  identifier: 'my-favourite-project',
}

const accessToken = 'my_access_token'

test("If no identifier uses default python project", () => {
  renderHook(() => useProject())
  expect(setProject).toHaveBeenCalledWith(defaultPythonProject)
})

test("If cached project matches identifer uses cached project", () => {
  localStorage.setItem(cachedProject.identifier, JSON.stringify(cachedProject))
  renderHook(() => useProject(cachedProject.identifier))
  expect(setProject).toHaveBeenCalledWith(cachedProject)
})

test("If cached project matches identifer clears cached project", () => {
  localStorage.setItem(cachedProject.identifier, JSON.stringify(cachedProject))
  renderHook(() => useProject(cachedProject.identifier))
  expect(localStorage.getItem('project')).toBeNull()
})

test("If cached project does not match identifer does not use cached project", async () => {
  syncProject.mockImplementationOnce(jest.fn((_) => (jest.fn())))
  localStorage.setItem('project', JSON.stringify(cachedProject))
  renderHook(() => useProject('my-favourite-project'))
  await waitFor(() => expect(setProject).not.toHaveBeenCalledWith(cachedProject))
})

test("If cached project does not match identifer loads correct uncached project", async () => {
  syncProject.mockImplementationOnce(jest.fn((_) => (loadProject)))
  localStorage.setItem('project', JSON.stringify(cachedProject))
  renderHook(() => useProject(project1.identifier, accessToken))
  await waitFor(() => expect(loadProject).toHaveBeenCalledWith({ identifier: project1.identifier, accessToken }))
})

test("If cached project does not match identifer clears cached project", () => {
  localStorage.setItem(cachedProject.identifier, JSON.stringify(cachedProject))
  renderHook(() => useProject(cachedProject.identifier))
  expect(localStorage.getItem(cachedProject.identifier)).toBeNull()
})

test("If no cached project loads uncached project", async () => {
  syncProject.mockImplementationOnce(jest.fn((_) => (loadProject)))
  renderHook(() => useProject('hello-world-project', accessToken))
  await waitFor(() => expect(loadProject).toHaveBeenCalledWith({ identifier: 'hello-world-project', accessToken }))
})

afterEach(() => {
  localStorage.clear()
})
