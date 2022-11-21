import './App.scss';

import { useCookies } from 'react-cookie';
import { BrowserRouter, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { SettingsContext } from './settings';
import Header from './components/Header/Header'
import Routes from './components/Routes'
import GlobalNav from './components/GlobalNav/GlobalNav';
import Footer from './components/Footer/Footer';
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react';
import { saveProject, setProject, setProjectLoaded } from './components/Editor/EditorSlice';
import { createProject, updateProject } from './utils/apiCallHandler';
import { showSavedMessage } from './utils/Notifications';
import _ from 'lodash';
import { defaultPythonProject } from './utils/defaultProjects';

function App() {
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const [cookies] = useCookies(['theme', 'fontSize'])
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"

  const project = useSelector((state) => state.editor.project)
  const user = useSelector((state) => state.auth.user)
  const projectLoaded = useSelector((state) => state.editor.projectLoaded)
  const [timeoutId, setTimeoutId] = useState(null);

  const dispatch = useDispatch()
  // const history = useHistory()

  // const autoSaveProject = async () => {
  //   if (!project.identifier) {
  //     const response = await createProject(project, user.access_token)

  //     if (response.status === 200) {
  //       const identifier = response.data.identifier;
  //       const project_type = response.data.project_type;
  //       dispatch(setProjectLoaded(false));
  //       history.push(`/${project_type}/${identifier}`)
  //       showSavedMessage()
  //     }
  //   }
  //   else {
  //     const response = await updateProject(project, user.access_token)

  //     if(response.status === 200) {
  //       dispatch(setProject(response.data));
  //       showSavedMessage()
  //     }
  //   }
  // }

  useEffect(() => {
    if(timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(async () => {
      if (user && (project.user_id === user.profile.user || !project.identifier ) && projectLoaded === 'success' && !_.isEqual(project, defaultPythonProject)) {
        console.log('saving..........')
        dispatch(saveProject({project: project, user: user}))

        // if (!project.identifier) {
        //   await createProject(project, user.access_token)
        // } else {
        // updateProject(project, user.access_token)
        // }
        // console.log(history)
        // await autoSaveProject()
      }
    }, 2000);
    setTimeoutId(id);

  }, [project])

  // useEffect(() => {
  //   if (projectLoaded === 'idle')
  //     history.push(`/${project.project_type}/${project.identifier}`)
  // }, [projectLoaded])

  return (
    <div 
    id='app'
    className = {`--${cookies.theme || themeDefault } font-size-${cookies.fontSize || 'small' }`}>
      
      <SettingsContext.Provider value={{theme: cookies.theme || themeDefault, fontSize: cookies.fontSize || 'small' }}>
        <BrowserRouter>
          { isEmbedded ? null : <><GlobalNav/><Header/></> }
          <Routes />
          { isEmbedded ? null : <Footer/> }
        </BrowserRouter>
        <ToastContainer position='bottom-center' className='toast--bottom-center' />
      </SettingsContext.Provider>
    </div>
  );
}

export default App;
