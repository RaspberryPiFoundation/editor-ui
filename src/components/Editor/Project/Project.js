import './Project.scss';

import React from 'react';
import { useSelector } from 'react-redux'

import EditorPanel from '../EditorPanel/EditorPanel'
import RunnerFactory from '../Runners/RunnerFactory'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import RunnerControls from '../../RunButton/RunnerControls';
import ExternalFiles from '../../ExternalFiles/ExternalFiles';
import FileMenu from '../../Menus/FileMenu/FileMenu';
import Output from '../Output/Output';

const Project = (props) => {
  const project = useSelector((state) => state.editor.project);
  const {forWebComponent} = props;

  return (
    <div className='proj'>
      <div className={`proj-container${forWebComponent ? ' proj-container--wc': ''}`}>
      {!forWebComponent ? <FileMenu /> : null}
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
            <RunnerControls />
          </Tabs>
        </div>
        <Output />
      </div>
    </div>
  )
};

export default Project;

