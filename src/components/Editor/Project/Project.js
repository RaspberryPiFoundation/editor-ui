import './Project.css';

import React from 'react';
import { useSelector } from 'react-redux'

import EditorPanel from '../EditorPanel/EditorPanel'
import RunnerFactory from '../Runners/RunnerFactory/RunnerFactory'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const Project = () => {
  const project = useSelector((state) => state.editor.project);
  return (
    <div className='proj'>
    <div>
      <div>
        <h1>{project.type} Project</h1>
      </div>
    </div>
    <div className='proj-container'>
      <div className='proj-editor-container'>
        <Tabs>
          <TabList>
            { project.components.map((file, i) => (
                <Tab key={i}>{file.name}.{file.lang}</Tab>
              )
            )}
          </TabList>


          { project.components.map((file,i) => (
            <TabPanel key={i}>
              <EditorPanel fileName={file.name} lang={file.lang} />
            </TabPanel>
            )
          )}
        </Tabs>
      </div>
      <div className='proj-runner-container'>
        <RunnerFactory projectType={project.type} />
      </div>
    </div>
    </div>
  )
};

export default Project;

