import './App.scss';

import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import { SettingsContext } from './settings';
import Header from './components/Header/Header'
import Routes from './components/Routes'
import GlobalNav from './components/GlobalNav/GlobalNav';
import Footer from './components/Footer/Footer';
import { saveProject } from './components/Editor/EditorSlice';
import BetaBanner from './components/BetaBanner/BetaBanner';
import BetaModal from './components/Modals/BetaModal';

function App() {
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const [cookies] = useCookies(['theme', 'fontSize'])
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"

  const project = useSelector((state) => state.editor.project)
  const user = useSelector((state) => state.auth.user)
  const projectLoaded = useSelector((state) => state.editor.projectLoaded)
  const [timeoutId, setTimeoutId] = useState(null);

  const dispatch = useDispatch()

  useEffect(() => {
    if(timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(async () => {
      if (user && project.user_id === user.profile.user && projectLoaded === 'success') {
        dispatch(saveProject({project: project, user: user}))
      } else if (projectLoaded === 'success') {
        localStorage.setItem(project.identifier || 'project', JSON.stringify(project))
      }
    }, 2000);
    setTimeoutId(id);

  }, [project])

  return (
    <div 
    id='app'
    className = {`--${cookies.theme || themeDefault } font-size-${cookies.fontSize || 'small' }`}>
      
      <SettingsContext.Provider value={{theme: cookies.theme || themeDefault, fontSize: cookies.fontSize || 'small' }}>
        <BrowserRouter>
          { isEmbedded ? null : <><GlobalNav/><BetaBanner/><Header/></> }
          <Routes />
          { isEmbedded ? null : <Footer/> }
          <BetaModal/>
        </BrowserRouter>
        <ToastContainer position='bottom-center' className='toast--bottom-center' />
      </SettingsContext.Provider>
    </div>
  );
}

export default App;
