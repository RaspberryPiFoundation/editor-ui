/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { setProject, setProjectLoaded } from '../EditorSlice'
import { readProject } from '../../../utils/apiCallHandler';

// const pythonCode = {
//   type: 'python',
//   components: [
//     { extension: 'py', name: 'main',
//       content: "import turtle\nt = turtle.Turtle()\nt.forward(100)\nprint(\"Oh yeah!\")" },
//   ]
// }

const pythonCode = {
  project_type: 'python',
  components: [
    { extension: 'py', name: 'main',
      content: "", index: 0, default: true },
  ]
}

const htmlCode = {
  project_type: 'html',
  components: [
    { extension: 'html', name: 'index',
      content: "<html>\n  <head>\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">\n  </head> <body>\n    <h1>Heading</h1>\n    <p>Paragraph</p>\n  </body>\n</html>" },
    { extension: 'css', name: 'style', content: "h1 {\n  color: blue;\n}" },
    { extension: 'css', name: 'test', content: "p {\n  background-color: red;\n}" }
  ]
}

export const useProject = (projectType, projectIdentifier = '') => {
  const dispatch = useDispatch();

  const loadProject = () => {
    (async () => {
      const response = await readProject(projectIdentifier)
      dispatch(setProject(response.data));
      dispatch(setProjectLoaded(true));
    })();
  }

  const cachedProject = JSON.parse(localStorage.getItem('project'))
  const loadCachedProject = () => {
    dispatch(setProject(cachedProject))
    dispatch(setProjectLoaded(true));
    localStorage.removeItem('project')
  }

  useEffect(() => {
    var is_cached_saved_project = (projectIdentifier && cachedProject && cachedProject.identifier === projectIdentifier)
    var is_cached_unsaved_project = (!projectIdentifier && cachedProject)
    if (is_cached_saved_project || is_cached_unsaved_project) {
      loadCachedProject()
      return
    }
    else if (cachedProject) {
      localStorage.removeItem('project')
    }

    if (projectIdentifier) {
      loadProject();
      return;
    }

    let data = {};
    if(projectType === 'html') {
      data = htmlCode;
    } else {
      data = pythonCode;
    }

    dispatch(setProject(data));
    dispatch(setProjectLoaded(true));
  }, [projectIdentifier]);
};

