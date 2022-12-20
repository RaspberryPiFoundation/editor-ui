import './Project.scss';

import React, { createRef, useEffect, useRef } from 'react';
import { useDispatch, useSelector} from 'react-redux'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import 'react-toastify/dist/ReactToastify.css'

import EditorPanel from '../EditorPanel/EditorPanel'
import FilePane from '../../FilePane/FilePane'
import Output from '../Output/Output'
import RenameFile from '../../Modals/RenameFile'
import RunnerControls from '../../RunButton/RunnerControls'
import { closeFile, openFile, setFocussedFileIndex, syncProject } from '../EditorSlice';
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
  const focussedFileIndex = useSelector((state) => state.editor.focussedFileIndex)

  let tabRefs = useRef(openFiles.map(createRef))

  const switchToFileTab = (index) => {
    dispatch(setFocussedFileIndex(index))
    console.log(tabRefs.current[index])
    console.log(index)
    tabRefs.current[index].current.parentElement.scrollIntoView()
  }

  const openFileTab = (fileName) => {
    if (openFiles.includes(fileName)) {
      switchToFileTab(openFiles.indexOf(fileName))
    } else {
      dispatch(openFile(fileName))
      tabRefs.current[tabRefs.current.length] = createRef()
      switchToFileTab(openFiles.length)
    }
  }

  const closeFileTab = (fileName) => {
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
      {!forWebComponent ? <FilePane openFileTab={openFileTab}/> : null}
        <div className='proj-editor-container'>
          <Tabs selectedIndex={focussedFileIndex} onSelect={index => switchToFileTab(index)}>
            <TabList>
              {openFiles.map((fileName, i) => (
                <Tab key={i}>
                  <span ref={tabRefs.current[i]}>{fileName}</span>
                  {fileName !== 'main.py' ?
                    <button onClick={() => closeFileTab(fileName)}><CloseIcon scaleFactor={0.75}/></button>
                  : null
                  }
                </Tab>
              ))}
            </TabList>
            {openFiles.map((fileName, i) => (
              <TabPanel key={i}>
                <EditorPanel fileName={fileName.split('.')[0]} extension={fileName.split('.').slice(1).join('.')} />
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
