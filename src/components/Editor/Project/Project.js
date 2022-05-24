import './Project.css';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux'

import EditorPanel from '../EditorPanel/EditorPanel'
import RunnerFactory from '../Runners/RunnerFactory'

import { useHistory } from 'react-router-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '../../Button/Button';
import { setDarkMode, setProjectLoaded, setProject } from '../EditorSlice';
import ImageUploadButton from '../ImageUploadButton/ImageUploadButton';
import NewComponentButton from '../NewComponentButton/NewComponentButton';
import RunnerControls from '../../RunButton/RunnerControls';
import { remixProject, updateProject } from '../../../utils/apiCallHandler';
import ProjectImages from '../ProjectImages/ProjectImages';
import ExternalFiles from '../../ExternalFiles/ExternalFiles';
import ProjectName from './ProjectName.js'

const Project = () => {
  const project = useSelector((state) => state.editor.project);
  const isDarkMode = useSelector((state) => state.editor.darkModeEnabled);
  const embedded = useSelector((state) => state.editor.isEmbedded);
  const dispatch = useDispatch();
  let history = useHistory()
  const stateAuth = useSelector(state => state.auth);
  const user = stateAuth.user;

  const onClickSave = async () => {
    if (!project.identifier) {
      return;
    }

    const response = await updateProject(project, user.access_token)

    if(response.status === 200) {
      dispatch(setProject(response.data));
      toast("Project saved!", {
        position: toast.POSITION.TOP_CENTER
      });
    }
  }

  const onClickRemix = async () => {
    if (!project.identifier || !user) {
      return;
    }

    const response = await remixProject(project, user.access_token)

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
      { embedded !== true ? (
        <div className='proj-header'>
          <div>
            <div>
              {user && (project.user_id === user.profile.user) ? (<ProjectName name={project.name} />) : (<h1>{project.name}</h1>)}
            </div>
            { project.parent ? (
            <p>Remixed from <a href={host+'/'+project.project_type+'/'+project.parent.identifier}>{project.parent.name}</a></p>
          ) : null }
          </div>
          <div className='proj-controls'>
            { project.identifier && (
              user !== null ? (
              <>
                {project.user_id === user.profile.user ? (<Button onClickHandler={onClickSave} buttonText="Save Project" />) : (<Button onClickHandler={onClickRemix} buttonText="Remix Project" />)}
              </>
              ) : null
            )}
          </div>
        </div>
      ) : null }
      <div>
        <RunnerControls/>
        <Button buttonText={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`} onClickHandler={() => dispatch(setDarkMode(!isDarkMode))}/>
      </div>
      <div className='proj-container'>
        <div className='proj-editor-container'>
          <Tabs>
            <TabList>
              { project.components.map((file, i) => (
                  <Tab key={i}>{file.name}.{file.extension}</Tab>
                )
              )}
              { project.project_type === "python" ? <NewComponentButton /> : null }
              { user !== null &&  project.user_id === user.profile.user? (<ImageUploadButton />): null}
            </TabList>
            { project.components.map((file,i) => (
              <TabPanel key={i}>
                <EditorPanel fileName={file.name} extension={file.extension} />
              </TabPanel>
              )
            )}
          </Tabs>
        </div>
        <ExternalFiles />
        <div className='proj-runner-container'>
          <RunnerFactory projectType={project.type} />
        </div>
      </div>
      {project.image_list && project.image_list.length>0? <ProjectImages /> : null}
      <ToastContainer />
    </div>
  )
};

export default Project;

