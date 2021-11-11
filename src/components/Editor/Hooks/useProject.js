/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { setProject, setProjectLoaded } from '../EditorSlice'

const pythonCode = {
  type: 'python',
  components: [
    { lang: 'py', name: 'main',
      content: "import turtle\nt = turtle.Turtle()\nt.forward(100)\nprint(\"Oh yeah!\")" }
  ]
}

const htmlCode = {
  type: 'html',
  components: [
    { lang: 'html', name: 'index',
      content: "<html>\n  <head>\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">\n  </head> <body>\n    <h1>Heading</h1>\n    <p>Paragraph</p>\n  </body>\n</html>" },
    { lang: 'css', name: 'style', content: "h1 {\n  color: blue;\n}" },
    { lang: 'css', name: 'test', content: "p {\n  background-color: red;\n}" }
  ]
}

export const useProject = (projectType) => {
  const dispatch = useDispatch();

  useEffect(() => {
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

