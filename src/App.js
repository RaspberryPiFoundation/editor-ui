/* eslint-disable react-hooks/exhaustive-deps */
import './App.scss';
import './utils/Notifications.scss';

import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import { SettingsContext } from './settings';
import Header from './components/Header/Header'
import Routes from './components/Routes'
import GlobalNav from './components/GlobalNav/GlobalNav';
import Footer from './components/Footer/Footer';
import { expireJustLoaded, saveProject } from './components/Editor/EditorSlice';

import BetaBanner from './components/BetaBanner/BetaBanner';
import BetaModal from './components/Modals/BetaModal';
import LoginToSaveModal from './components/Modals/LoginToSaveModal';
import { showLoginPrompt, showSavedMessage, showSavePrompt } from './utils/Notifications';
import Button from './components/Button/Button';
import { CloseIcon } from './Icons';
import CloseButton from './utils/ToastCloseButton';

function App() {
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const [cookies] = useCookies(['theme', 'fontSize'])
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"

  const saving = useSelector((state) => state.editor.saving)
  // const autosaved = useSelector((state) => state.editor.lastSaveAutosaved)
  // const justLoaded = useSelector((state) => state.editor.justLoaded)
  // const [timeoutId, setTimeoutId] = useState(null);

  // const dispatch = useDispatch()

  // useEffect(() => {
    // if (timeoutId) clearTimeout(timeoutId);
    // const id = setTimeout(async () => {
      // console.log('saving')
      // if (user && project.user_id === user.profile.user && projectLoaded === 'success') {
        // dispatch(saveProject({project: project, user: user, autosave: true}))
      // } else if (projectLoaded === 'success') {
        // user & !justLoaded ? showSavePrompt() : showLoginPrompt()
       //  localStorage.setItem(project.identifier || 'project', JSON.stringify(project))
     //  }
    // }, 2000);
   //  setTimeoutId(id);
    // if (justLoaded && projectLoaded === 'success') dispatch(expireJustLoaded())

  // }, [project, user, projectLoaded, dispatch])
  const autosave = useSelector((state) => state.editor.lastSaveAutosave)

  useEffect(() => {
    if (saving === 'success' && autosave === false) {
      showSavedMessage()
    }
  }, [saving, autosave])

  return (
    <div 
    id='app'
    className = {`--${cookies.theme || themeDefault } font-size-${cookies.fontSize || 'small' }`}>
      
      <SettingsContext.Provider value={{theme: cookies.theme || themeDefault, fontSize: cookies.fontSize || 'small' }}>
        <ToastContainer enableMultiContainer containerId='top-center' position='top-center' className='toast--top-center' closeButton={CloseButton}/>
        <BrowserRouter>
          { isEmbedded ? null : <><GlobalNav/><BetaBanner/><Header/></> }
          <Routes />
          { isEmbedded ? null : <Footer/> }
          <BetaModal/>
          <LoginToSaveModal/>
        </BrowserRouter>
        <ToastContainer enableMultiContainer containerId='bottom-center' position='bottom-center' className='toast--bottom-center' />
      </SettingsContext.Provider>
    </div>
  );
}

export default App;
