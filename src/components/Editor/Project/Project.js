import './Project.scss';

import React, { useEffect } from 'react';
import { useDispatch, useSelector} from 'react-redux'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import 'react-toastify/dist/ReactToastify.css'

import EditorPanel from '../EditorPanel/EditorPanel'
import FilePane from '../../FilePane/FilePane'
import Output from '../Output/Output'
import RenameFile from '../../Modals/RenameFile'
import RunnerControls from '../../RunButton/RunnerControls'
import { closeFile, syncProject } from '../EditorSlice';
import { isOwner } from '../../../utils/projectHelpers'
import { CloseIcon } from '../../../Icons';


const Project = (props) => {
  const dispatch = useDispatch()
  const { forWebComponent } = props;
  const user = useSelector((state) => state.auth.user)
  const project = useSelector((state) => state.editor.project)
  const modals = useSelector((state) => state.editor.modals)
  const renameFileModalShowing = useSelector((state) => state.editor.renameFileModalShowing)
  const openFiles = useSelector((state) => state.editor.openFiles)

  const closeFileTab = (file) => {
    const fileName = `${file.name}.${file.extension}`
    dispatch(closeFile(fileName))
  }

  useEffect(() => {
    if (forWebComponent) {
      return
    }
  
    let debouncer = setTimeout(() => {
      if (isOwner(user, project) && project.identifier) {
        dispatch(syncProject('save')({ project, accessToken: user.access_token, autosave: true }));
      }
      else {
        localStorage.setItem(project.identifier || 'project', JSON.stringify(project))
      }
    }, 2000);
     
    return () => clearTimeout(debouncer)
  }, [dispatch, forWebComponent, project, user])


  return (
    <div className='proj'>
      <div className={`proj-container${forWebComponent ? ' proj-container--wc': ''}`}>
      {!forWebComponent ? <FilePane /> : null}
        <div className='proj-editor-container'>
          <Tabs>
            <TabList>
            { project.components.filter(file => openFiles.includes(`${file.name}.${file.extension}`)).map((file, i) => (
              <Tab key={i}>
                <span>{file.name}.{file.extension}</span>
                {file.name!=='main' || file.extension!=='py' ?
                  <button onClick={() => closeFileTab(file)}><CloseIcon scaleFactor={0.75}/></button>
                : null
                }
              </Tab>
            ))}
            {/* {openFiles.map(file => project.components.filter(component => component.name===file.split('.')[0] && component.extension === file.split('.').slice(1).join('.')).map((file, i) => {
              <Tab key={i}>
                <span>{file.name}.{file.extension}</span>
                {file.name!=='main' || file.extension!=='py' ?
                  <button onClick={() => closeFileTab(file)}><CloseIcon scaleFactor={0.75}/></button>
                : null
                }
            </Tab>
            }))} */}
            </TabList>
            { project.components.filter(file => openFiles.includes(`${file.name}.${file.extension}`)).map((file, i) => (
            // {openFiles.map(file => project.components.filter(component => component.name===file.split('.')[0] && component.extension === file.split('.').slice(1).join('.')).map((file, i) => {
              <TabPanel key={i}>
                <EditorPanel fileName={file.name} extension={file.extension} />
              </TabPanel>
            ))}
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
