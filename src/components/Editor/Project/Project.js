/* eslint-disable react-hooks/exhaustive-deps */
import React, { createRef, useEffect, useRef } from 'react';
import { useDispatch, useSelector} from 'react-redux'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import 'react-toastify/dist/ReactToastify.css'

import './Project.scss';
import EditorPanel from '../EditorPanel/EditorPanel'
import FilePane from '../../FilePane/FilePane'
import Output from '../Output/Output'
import RenameFile from '../../Modals/RenameFile'
import RunnerControls from '../../RunButton/RunnerControls'
import { closeFile, expireJustLoaded, setHasShownSavePrompt, setFocussedFileIndex, syncProject } from '../EditorSlice';
import { isOwner } from '../../../utils/projectHelpers'
import { CloseIcon } from '../../../Icons';
import NotFoundModal from '../../Modals/NotFoundModal';
import AccessDeniedNoAuthModal from '../../Modals/AccessDeniedNoAuthModal';
import AccessDeniedWithAuthModal from '../../Modals/AccessDeniedWithAuthModal';
import { showLoginPrompt, showSavePrompt } from '../../../utils/Notifications';
import Button from '../../Button/Button';

const Project = (props) => {
  const dispatch = useDispatch()
  const { forWebComponent } = props;
  const user = useSelector((state) => state.auth.user)
  const project = useSelector((state) => state.editor.project)
  const modals = useSelector((state) => state.editor.modals)
  const renameFileModalShowing = useSelector((state) => state.editor.renameFileModalShowing)
  const notFoundModalShowing = useSelector((state) => state.editor.notFoundModalShowing)
  const accessDeniedNoAuthModalShowing = useSelector((state) => state.editor.accessDeniedNoAuthModalShowing)
  const accessDeniedWithAuthModalShowing = useSelector((state) => state.editor.accessDeniedWithAuthModalShowing)
  const justLoaded = useSelector((state) => state.editor.justLoaded)
  const hasShownSavePrompt = useSelector((state) => state.editor.hasShownSavePrompt)
  const openFiles = useSelector((state) => state.editor.openFiles)
  const focussedFileIndex = useSelector((state) => state.editor.focussedFileIndex)

  let tabRefs = useRef(openFiles.map(createRef))

  const switchToFileTab = (index) => {
    dispatch(setFocussedFileIndex(index))
    // console.log(tabRefs.current[index])
    // console.log(index)
    // tabRefs.current[index].current.parentElement.scrollIntoView()
  }

  // const openFileTab = (fileName) => {
  //   if (openFiles.includes(fileName)) {
  //     switchToFileTab(openFiles.indexOf(fileName))
  //   } else {
  //     dispatch(openFile(fileName))
  //     tabRefs.current[tabRefs.current.length] = createRef()
  //     switchToFileTab(openFiles.length)
  //   }
  // }

  const closeFileTab = (e, fileName) => {
    e.stopPropagation()
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
        if (justLoaded) {
          dispatch(expireJustLoaded())
        } else if (!hasShownSavePrompt) {
          user ? showSavePrompt() : showLoginPrompt()
          dispatch(setHasShownSavePrompt())
        }
      }
    }, 2000);
     
    return () => clearTimeout(debouncer)
  }, [dispatch, forWebComponent, project, user])

  return (
    <div className='proj'>
      <div className={`proj-container${forWebComponent ? ' proj-container--wc': ''}`}>
      {/* {!forWebComponent ? <FilePane openFileTab={openFileTab}/> : null} */}
      {!forWebComponent ? <FilePane /> : null}
        <div className='proj-editor-container'>
          <Tabs selectedIndex={focussedFileIndex} onSelect={index => switchToFileTab(index)}>
            <TabList>
              {openFiles.map((fileName, i) => (
                <Tab key={i}>
                  <span className={`react-tabs__tab-inner${fileName !== 'main.py'? ' react-tabs__tab-inner--split': ''}`} ref={tabRefs.current[i]}>{fileName}
                  {fileName !== 'main.py' ?
                    <Button className='btn--tertiary react-tabs__tab-inner-close-btn' onClickHandler={(e) => closeFileTab(e, fileName)} ButtonIcon={() => <CloseIcon scaleFactor={0.75}/> }/>
                  : null
                  }
                  </span>
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
      {(notFoundModalShowing) ? <NotFoundModal /> : null}
      {(accessDeniedNoAuthModalShowing) ? <AccessDeniedNoAuthModal /> : null}
      {(accessDeniedWithAuthModalShowing) ? <AccessDeniedWithAuthModal /> : null}
    </div>
  )
};

export default Project;
