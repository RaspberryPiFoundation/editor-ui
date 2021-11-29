import './Project.css';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux'

import EditorPanel from '../EditorPanel/EditorPanel'
import RunnerFactory from '../Runners/RunnerFactory'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '../../Button/Button'

import { triggerCodeRun } from '../EditorSlice'

const Project = () => {
  const project = useSelector((state) => state.editor.project);
  const dispatch = useDispatch();

  const onClickRun = () => {
    dispatch(triggerCodeRun());
  }

  const onClickSave = async (e) => {
    if (!project.identifier) {
      return;
    }

    const api_host = process.env.REACT_APP_API_ENDPOINT;
    const response = await axios.put(
      `${api_host}/api/projects/phrases/${project.identifier}`,
      { project: project }
    );

    if(response.status === 200) {
      toast("Project saved!", {
        position: toast.POSITION.TOP_CENTER
      });
    }
  }

  const host = `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? `:${window.location.port}` : ''
  }`

  return (
    <div className='proj'>
      <div className='proj-header'>
        <div>
          <h1>{project.type} Project</h1>
        </div>
        <div className='proj-controls'>
          { project.identifier && (
            <Button onClickHandler={onClickSave} buttonText="Save Project" />
          )}
        </div>
      </div>
      { project.identifier && (
        <div>
          <p>Share your project with this link:&nbsp;
            <a href={`/python/share/${project.identifier}`} target="_blank" rel="noreferrer">
              {`${host}/python/share/${project.identifier}`}
            </a>
          </p>
        </div>
      )}
      <div>
        <Button onClickHandler={onClickRun} buttonText="Run code" leftAlign={true} />
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
          <Button />
        </div>
        <div className='proj-runner-container'>
          <RunnerFactory projectType={project.type} />
        </div>
      </div>
      <ToastContainer />
    </div>
  )
};

export default Project;

