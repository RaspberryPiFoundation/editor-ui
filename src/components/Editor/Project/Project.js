import './Project.css';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux'

import EditorPanel from '../EditorPanel/EditorPanel'
import RunnerFactory from '../Runners/RunnerFactory'

import { useHistory } from 'react-router-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '../../Button/Button';
import { setProjectLoaded } from '../EditorSlice';
import NewComponentButton from '../NewComponentButton/NewComponentButton';
import RunnerControls from '../../RunButton/RunnerControls';

const Project = () => {
  const project = useSelector((state) => state.editor.project);
  const dispatch = useDispatch();
  let history = useHistory()
  const stateAuth = useSelector(state => state.auth);
  const user = stateAuth.user;

  // Not currently using this, will be reinstated later
  // const onClickSave = async () => {
  //   if (!project.identifier) {
  //     return;
  //   }
  //
  //   const api_host = process.env.REACT_APP_API_ENDPOINT;
  //   const response = await axios.put(
  //     `${api_host}/api/projects/phrases/${project.identifier}`,
  //     { project: project }
  //   );
  //
  //   if(response.status === 200) {
  //     toast("Project saved!", {
  //       position: toast.POSITION.TOP_CENTER
  //     });
  //   }
  // }

  const onClickRemix = async () => {
    if (!project.identifier) {
      return;
    }

    const api_host = process.env.REACT_APP_API_ENDPOINT;
    const response = await axios.post(
      `${api_host}/api/projects/phrases/${project.identifier}/remix`
    );

    const identifier = response.data.identifier;
    const project_type = response.data.project_type;
    dispatch(setProjectLoaded(false));
    history.push(`/${project_type}/${identifier}`)
  }

  const host = `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? `:${window.location.port}` : ''
  }`

  return (
    <div className='proj'>
      <div className='proj-header'>
        <div>
          <h1>{project.name}</h1>
        </div>
        <div className='proj-controls'>
          { project.identifier && (
            user !== null ? (
            <>
              <Button onClickHandler={onClickRemix} buttonText="Remix Project" />
            </>
            ) : null
          )}
        </div>
      </div>
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
              { project.project_type=="python" ? <NewComponentButton /> : null }
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
      <ToastContainer />
    </div>
  )
};

export default Project;

