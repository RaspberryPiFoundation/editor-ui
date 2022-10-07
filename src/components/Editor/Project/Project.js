import './Project.scss';

import React from 'react';
import { useSelector } from 'react-redux'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';

import EditorPanel from '../EditorPanel/EditorPanel'
import FilePane from '../../FilePane/FilePane';
import Output from '../Output/Output';
import RenameFile from '../../Modals/RenameFile'
import RunnerControls from '../../RunButton/RunnerControls';

const Project = (props) => {
  const project = useSelector((state) => state.editor.project);
  const modals = useSelector((state) => state.editor.modals);
  const renameFileModalShowing = useSelector((state) => state.editor.renameFileModalShowing);
  const {forWebComponent} = props;

  return (
    <div className='proj'>
      <div className={`proj-container${forWebComponent ? ' proj-container--wc': ''}`}>
      {!forWebComponent ? <FilePane /> : null}
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
      {(renameFileModalShowing && modals.renameFile) ? <RenameFile /> : null}
    </div>
  )
};

export default Project;

