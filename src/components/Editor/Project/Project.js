/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useDispatch, useSelector} from 'react-redux'
import { useTranslation } from 'react-i18next';
import { gql, useQuery } from '@apollo/client';
import 'react-toastify/dist/ReactToastify.css'
import { Header, HEADER_FRAGMENT } from '../../Header/Header.js'
import './Project.scss';
import { InputPanel, INPUT_PANEL_FRAGMENT } from '../InputPanel/InputPanel'
import OutputPanel from '../OutputPanel/OutputPanel'
import RenameFile from '../../Modals/RenameFile'
import { expireJustLoaded, setHasShownSavePrompt, setFocussedFileIndex, syncProject, openFile } from '../EditorSlice';
import { isOwner } from '../../../utils/projectHelpers'
import { defaultPythonProject } from '../../../utils/defaultProjects'
import NotFoundModal from '../../Modals/NotFoundModal';
import AccessDeniedNoAuthModal from '../../Modals/AccessDeniedNoAuthModal';
import AccessDeniedWithAuthModal from '../../Modals/AccessDeniedWithAuthModal';
import { showLoginPrompt, showSavedMessage, showSavePrompt } from '../../../utils/Notifications';
import SideMenu from '../../Menus/SideMenu/SideMenu';

export const PROJECT_QUERY = gql`
  query ProjectQuery($identifier: String!) {
    project(identifier: $identifier){
      id
      ...HeaderFragment
      ...InputPanelFragment
    }
  }
  ${HEADER_FRAGMENT}
  ${INPUT_PANEL_FRAGMENT}
`;

export const Project = (props) => {
  const dispatch = useDispatch()
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
  const isEmbedded = useSelector((state) => state.editor.isEmbedded)

  const { t } = useTranslation();

  const saving = useSelector((state) => state.editor.saving)
  const autosave = useSelector((state) => state.editor.lastSaveAutosave)

  const { loading, error, data } = useQuery(PROJECT_QUERY, {
    variables: { identifier: project.identifier },
    skip: (project.identifier === undefined)
  })

  const projectData = data ? data.project : defaultPythonProject

  useEffect(() => {
    if (saving === 'success' && autosave === false) {
      showSavedMessage()
    }
  }, [saving, autosave])

  useEffect(() => {
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
  }, [dispatch, project, user])

  const openFileTab = (fileName) => {
    if (openFiles.includes(fileName)) {
      switchToFileTab(openFiles.indexOf(fileName), fileName)
    } else {
      dispatch(openFile(fileName))
      switchToFileTab(openFiles.length)
    }
  }

  const switchToFileTab = (index) => {
    dispatch(setFocussedFileIndex(index))
  }

  return (
    <>
      { !loading && projectData ?
        <>
          { isEmbedded ? null : <Header headerData={projectData} /> }
          <div className='proj'>
            <div className='proj-container'>
              <SideMenu openFileTab={openFileTab} />
              <InputPanel inputPanelData={projectData} />
              <OutputPanel />
            </div>
            {(renameFileModalShowing && modals.renameFile) ? <RenameFile /> : null}
            {(notFoundModalShowing) ? <NotFoundModal /> : null}
            {(accessDeniedNoAuthModalShowing) ? <AccessDeniedNoAuthModal /> : null}
            {(accessDeniedWithAuthModalShowing) ? <AccessDeniedWithAuthModal /> : null}
          </div>
        </>
        : null
      }
      { loading ? <p>{t('project.loading')}</p> : null }
    </>
  )
};
