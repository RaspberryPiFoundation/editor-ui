import './Project.scss';

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
import { setProjectLoaded, setProject } from '../EditorSlice';
import NewComponentButton from '../NewComponentButton/NewComponentButton';
import RunnerControls from '../../RunButton/RunnerControls';
import { saveProject, remixProject, updateProject } from '../../../utils/apiCallHandler';
import ProjectImages from '../../Menus/FileMenu/ProjectImages/ProjectImages';
import ExternalFiles from '../../ExternalFiles/ExternalFiles';
import ProjectName from './ProjectName.js';
import ThemeToggle from '../../ThemeToggle/ThemeToggle';
import FontSizeSelector from '../FontSizeSelector/FontSizeSelector';

import FileMenu from '../../Menus/FileMenu/FileMenu';

const Project = (props) => {
  const project = useSelector((state) => state.editor.project);
  const embedded = useSelector((state) => state.editor.isEmbedded);
  const dispatch = useDispatch();
  let history = useHistory()
  const stateAuth = useSelector(state => state.auth);
  const user = stateAuth.user;
  const {forWebComponent} = props;

  const onClickSave = async () => {
    if (!project.identifier) {
      const response = await saveProject(project, user.access_token)
      const identifier = response.data.identifier;
      const project_type = response.data.project_type;
      dispatch(setProjectLoaded(false));
      history.push(`/${project_type}/${identifier}`)
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
      <div className='proj-container'>
      <FileMenu />
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
        <ExternalFiles />
        <div className='proj-runner-container'>
          <RunnerFactory projectType={project.type} />
        </div>
      </div>
      <ToastContainer />
    </div>
  )
};

export default Project;

