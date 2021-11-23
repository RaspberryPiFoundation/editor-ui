/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { setProject, setProjectLoaded } from '../EditorSlice'
import axios from 'axios';

// const pythonCode = {
//   type: 'python',
//   components: [
//     { extension: 'py', name: 'main',
//       content: "import turtle\nt = turtle.Turtle()\nt.forward(100)\nprint(\"Oh yeah!\")" },
//   ]
// }

const pythonCode = {
  type: 'python',
  components: [
    { extension: 'py', name: 'main',
      content: "from emoji import *\nprint('Hello ', world)" },
    { extension: 'py', name: 'emoji',
      content: "world = '🌍🌎🌏'\npython = '🐍⌨️'\nsums = '✖️➗➖➕'"},
  ]
}

const htmlCode = {
  type: 'html',
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
      const host = process.env.REACT_APP_API_ENDPOINT;
      const response = await axios.get(`${host}/api/projects/phrases/${projectIdentifier}`, {
        headers: {
                'Accept': 'application/json'
        },
      });
      dispatch(setProject(response.data));
      dispatch(setProjectLoaded(true));
    })();
  }

  useEffect(() => {
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
  }, []);
};

