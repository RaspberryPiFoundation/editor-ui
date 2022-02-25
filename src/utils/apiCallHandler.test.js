import axios from "axios";

import { newProject, readProject, remixProject, updateProject } from "./apiCallHandler";

jest.mock('axios');
const host = process.env.REACT_APP_API_ENDPOINT;
const defaultHeaders = {'headers': {'Accept': 'application/json'}}

describe("Testing project API calls", () => {

  test("Creating project", async () => {
    const blankProject =  {'data': { 'project': {'identifier': 'new-hello-project', 'project_type': 'python'}}}
    axios.post.mockImplementationOnce(() => Promise.resolve(blankProject))
    
    await newProject()
    expect(axios.post).toHaveBeenCalledWith(`${host}/api/default_project/`, {}, defaultHeaders)
  })
    
  test("Remixing project", async () => {
    const originalProject = {'identifier': 'original-hello-project', 'project_type': 'python'}
    axios.post.mockImplementationOnce((url, body, headers) => {
      const remixedProject = {'identifier': 'remixed-hello-project', 'project_type': 'python'}
      Promise.resolve({data: {project: remixedProject}})
    })

    const accessToken = ""

    await remixProject(originalProject['identifier'], accessToken)
    expect(axios.post).toHaveBeenCalledWith((`${host}/api/projects/phrases/${originalProject['identifier']}/remix`), {"remix": {"user_id": accessToken}}, defaultHeaders)
  })

  test("Updating project", async () => {
    const project = {'identifier': 'my-wonderful-project', 'project_type': 'python', 'components': []}
    axios.put.mockImplementationOnce(() => Promise.resolve(200))

    await updateProject(project)
    expect(axios.put).toHaveBeenCalledWith(
      `${host}/api/projects/phrases/${project['identifier']}`,
      { project: project }, 
      defaultHeaders
    )
  })

  test("Read project", async () => {
    const projectIdentifier = "hello-world-project"
    const projectData =  {'data': { 'project': {'identifier': projectIdentifier, 'project_type': 'python'}}}
    axios.get.mockImplementationOnce(() => Promise.resolve(projectData))

    await readProject(projectIdentifier)
     expect(axios.get).toHaveBeenCalledWith(`${host}/api/projects/phrases/${projectIdentifier}`, defaultHeaders)
  })
})
