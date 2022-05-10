import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Style from 'style-it';
// import styles from './Project.css';
import tabStyles from 'react-tabs/style/react-tabs.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import EditorPanel from '../../Editor/EditorPanel/EditorPanel'
import RunnerFactory from '../../Editor/Runners/RunnerFactory'
import RunnerControls from '../../RunButton/RunnerControls';

const Project = (props) => {
  const project = useSelector((state) => state.editor.project);


  return (
    <Style>
      {tabStyles.toString()}
      <div>
        <div>
          <RunnerControls/>
        </div>
        <div className='proj-container'>
          <div className='proj-editor-container'>
            <Tabs>
              <TabList>
                { project.components.map((file, i) => (
                    <Tab key={i}>{file.name}.{file.extension}</Tab>
                  )
                )}
              </TabList>
              { project.components.map((file,i) => (
                <TabPanel key={i}>
                  <EditorPanel fileName={file.name} extension={file.extension} />
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

    </Style>
  );
}

export default Project
