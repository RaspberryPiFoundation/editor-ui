import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import { setProject, setProjectLoaded } from '../Editor/EditorSlice'
import HtmlEditor from '../HtmlEditor/HtmlEditor'
import EditorPanel from '../Editor/EditorPanel/EditorPanel'
import HtmlViewer from '../viewers/HtmlViewer/HtmlViewer'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const HtmlProject = () => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const project = useSelector((state) => state.editor.project);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setProject(
      {
        type: 'html',
        components: [
        { lang: 'html', name: 'index', content: "<html>\n  <head>\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">\n  </head> <body>\n    <h1>New heading</h1>\n    <p>Paragraph</p>\n  </body>\n</html>" },
        { lang: 'css', name: 'style', content: "h1 {\n  color: blue;\n}" },
        { lang: 'css', name: 'test', content: "p {\n  background-color: red;\n}" },
      ]}));
    dispatch(setProjectLoaded(true));
  }, []);

  return projectLoaded === true ? (
    <>
    <div>
      <div>
        <h1>HTML Project</h1>
      </div>
    </div>
    <Tabs>
      <TabList>
        { project.components.map(file => (
            <Tab>{file.name}.{file.lang}</Tab>
          )
        )}
      </TabList>


      { project.components.map(file => (
        <TabPanel>
          <EditorPanel fileName={file.name} lang={file.lang} />
        </TabPanel>
        )
      )}
    </Tabs>
    <HtmlViewer />
    </>
  ) : <p>Loading</p>;
}

export default HtmlProject;
