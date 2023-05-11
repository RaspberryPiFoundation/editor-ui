/* eslint-disable react-hooks/exhaustive-deps */
import React, { createRef, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector} from 'react-redux'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import 'react-toastify/dist/ReactToastify.css'

import './Project.scss';
import EditorPanel from '../EditorPanel/EditorPanel'
import Output from '../Output/Output'
import RenameFile from '../../Modals/RenameFile'
import { closeFile, expireJustLoaded, setHasShownSavePrompt, setFocussedFileIndex, syncProject, openFile } from '../EditorSlice';
import { isOwner } from '../../../utils/projectHelpers'
import { CloseIcon } from '../../../Icons';
import NotFoundModal from '../../Modals/NotFoundModal';
import AccessDeniedNoAuthModal from '../../Modals/AccessDeniedNoAuthModal';
import AccessDeniedWithAuthModal from '../../Modals/AccessDeniedWithAuthModal';
import { showLoginPrompt, showSavedMessage, showSavePrompt } from '../../../utils/Notifications';
import SideMenu from '../../Menus/SideMenu/SideMenu';
import Button from '../../Button/Button';
import NewFileModal from '../../Modals/NewFileModal';
import RunBar from '../../RunButton/RunBar';
import ResizableWithHandle from '../../../utils/ResizableWithHandle';

const Project = (props) => {
  const dispatch = useDispatch()
  const { forWebComponent } = props;
  const user = useSelector((state) => state.auth.user)
  const project = useSelector((state) => state.editor.project)
  const modals = useSelector((state) => state.editor.modals)
  const newFileModalShowing = useSelector((state) => state.editor.newFileModalShowing)
  const renameFileModalShowing = useSelector((state) => state.editor.renameFileModalShowing)
  const notFoundModalShowing = useSelector((state) => state.editor.notFoundModalShowing)
  const accessDeniedNoAuthModalShowing = useSelector((state) => state.editor.accessDeniedNoAuthModalShowing)
  const accessDeniedWithAuthModalShowing = useSelector((state) => state.editor.accessDeniedWithAuthModalShowing)
  const justLoaded = useSelector((state) => state.editor.justLoaded)
  const hasShownSavePrompt = useSelector((state) => state.editor.hasShownSavePrompt)
  const openFiles = useSelector((state) => state.editor.openFiles)
  const focussedFileIndex = useSelector((state) => state.editor.focussedFileIndex)

  const saving = useSelector((state) => state.editor.saving)
  const autosave = useSelector((state) => state.editor.lastSaveAutosave)

  useEffect(() => {
    if (saving === 'success' && autosave === false) {
      showSavedMessage()
    }
  }, [saving, autosave])

  const [numberOfComponents, setNumberOfComponents] = useState(project.components.length)
  let tabRefs = useRef(project.components.map(createRef))

  useEffect(() => {
    setNumberOfComponents(project.components.length)
    Array(project.components.length).fill().forEach((_, i) => {
      tabRefs.current[i] = tabRefs.current[i] || React.createRef();
    })
  }, [project])

  useEffect(() => {
    const fileName = openFiles[focussedFileIndex]
    const componentIndex = project.components.findIndex(file => `${file.name}.${file.extension}`=== fileName)
    const fileRef = tabRefs.current[componentIndex]
    if (fileRef && fileRef.current) {
      fileRef.current.parentElement.scrollIntoView()
    }
  }, [focussedFileIndex, openFiles, numberOfComponents])

  const switchToFileTab = (index) => {
    dispatch(setFocussedFileIndex(index))
  }

  const openFileTab = (fileName) => {
    if (openFiles.includes(fileName)) {
      switchToFileTab(openFiles.indexOf(fileName), fileName)
    } else {
      dispatch(openFile(fileName))
      switchToFileTab(openFiles.length)
    }
  }

  const closeFileTab = (e, fileName) => {
    e.stopPropagation()
    dispatch(closeFile(fileName))
  }

  useEffect(() => {
    if (forWebComponent) {
      return
    }
    if (user && localStorage.getItem('awaitingSave')) {
      if (isOwner(user, project)) {
        dispatch(syncProject('save')({project, accessToken: user.access_token, autosave: false}))
      } else if (user && project.identifier) {
        dispatch(syncProject('remix')({project, accessToken: user.access_token}))
      }
      localStorage.removeItem('awaitingSave')
      return
    }
    let debouncer = setTimeout(() => {
      if (isOwner(user, project) && project.identifier) {
        if (justLoaded) {
          dispatch(expireJustLoaded())
        }
        dispatch(syncProject('save')({ project, accessToken: user.access_token, autosave: true }));
      }
      else {
        if (justLoaded) {
          dispatch(expireJustLoaded())
        } else {
          localStorage.setItem(project.identifier || 'project', JSON.stringify(project))
          if (!hasShownSavePrompt) {
            user ? showSavePrompt() : showLoginPrompt()
            dispatch(setHasShownSavePrompt())
          }
        }
      }
    }, 2000);

    return () => clearTimeout(debouncer)
  }, [dispatch, forWebComponent, project, user])

  return (
    <div className='proj'>
      <div className={`proj-container${forWebComponent ? ' proj-container--wc': ''}`}>
      {!forWebComponent ? <SideMenu openFileTab={openFileTab}/> : null}
        <ResizableWithHandle className='proj-editor-container' minWidth='15%' maxWidth='75%'>
          <Tabs selectedIndex={focussedFileIndex} onSelect={index => switchToFileTab(index)}>
            <div className='react-tabs__tab-container'>
              <TabList>
                {openFiles.map((fileName, i) => (
                  <Tab key={i}>
                    <span
                      className={`react-tabs__tab-inner${fileName !== 'main.py'? ' react-tabs__tab-inner--split': ''}`}
                      ref={tabRefs.current[project.components.findIndex(file => `${file.name}.${file.extension}`===fileName)]}>
                        {fileName}
                        {fileName !== 'main.py' ?
                          <Button className='btn--tertiary react-tabs__tab-inner-close-btn' label='close' onClickHandler={(e) => closeFileTab(e, fileName)} ButtonIcon={() => <CloseIcon scaleFactor={0.85}/> }/>
                        : null
                        }
                    </span>
                  </Tab>
                ))}
              </TabList>
            </div>
            {openFiles.map((fileName, i) => (
              <TabPanel key={i}>
                <EditorPanel fileName={fileName.split('.')[0]} extension={fileName.split('.').slice(1).join('.')} />
              </TabPanel>
            ))}
            <RunBar/>
          </Tabs>
        </ResizableWithHandle>
        <Output />
      </div>
      {(newFileModalShowing) ? <NewFileModal /> : null}
      {(renameFileModalShowing && modals.renameFile) ? <RenameFile /> : null}
      {(notFoundModalShowing) ? <NotFoundModal /> : null}
      {(accessDeniedNoAuthModalShowing) ? <AccessDeniedNoAuthModal /> : null}
      {(accessDeniedWithAuthModalShowing) ? <AccessDeniedWithAuthModal /> : null}
    </div>
  )
};

export default Project;
