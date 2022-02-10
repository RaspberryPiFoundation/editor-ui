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
import { addProjectComponent, setProjectLoaded, updateComponentName } from '../EditorSlice';
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

  const onClickAddComponent = () => {
    dispatch(addProjectComponent({extension: "py", name: "", new: true}));
    // const nameFields=document.getElementsByClassName("proj-component-name-input");
    // console.log(nameFields)
    // const newNameField = nameFields[nameFields.length];
    // console.log(nameFields.length)
    // newNameField.focus();
    // // console.log(nameFields[nameFields.length-1]);
    // // document.getElementsByClassName("proj-component-name-input")[-1].focus();
    // // console.log(document)
  }

  const updateName = (e) => {
      if (e.key === "Enter") {
        const nameField = e.target;
        const fileName = e.target.innerText;
        nameField.removeEventListener(e.type, updateName)
        nameField.removeAttribute("contentEditable");

        document.addEventListener("keyup", function storeInput(e) {
          if (e.key === "Enter") {
            document.removeEventListener(e.type, storeInput);
            dispatch(updateComponentName({key: nameField.getAttribute("id"), name: fileName}))
          }
        })
      }
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
      { project.identifier && (
        <div className='proj-share-link'>
          <p>Share your project with this link:&nbsp;
            <a href={`/python/share/${project.identifier}`} target="_blank" rel="noreferrer">
              {`${host}/python/share/${project.identifier}`}
            </a>
          </p>
        </div>
      )}
      <div>
        <RunnerControls/>
      </div>
      <div className='proj-container'>
        <div className='proj-editor-container'>
          <Tabs>
            <TabList>
              { project.components.map((file, i) => (
                  <Tab key={i}>{file.new ? <span id={i} role="textbox" className="proj-component-name-input" contentEditable autoFocus={true} onKeyDown={updateName}>{file.name}</span>:file.name }.{file.extension}</Tab>
                )
              )}
              <Button buttonText="+" onClickHandler={onClickAddComponent} className="proj-new-component-button"/>
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

