import './App.scss';
import './typography.scss';
import './utils/Notifications.scss';

import { useCookies } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import { SettingsContext } from './settings';
import Header from './components/Header/Header'
import AppRoutes from './components/AppRoutes'
import GlobalNav from './components/GlobalNav/GlobalNav';
import Footer from './components/Footer/Footer';
import BetaBanner from './components/BetaBanner/BetaBanner';
import BetaModal from './components/Modals/BetaModal';
import LoginToSaveModal from './components/Modals/LoginToSaveModal';
import ToastCloseButton from './utils/ToastCloseButton';

function App() {
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const [cookies] = useCookies(['theme', 'fontSize'])
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"

  return (
    <div 
    id='app'
    className = {`--${cookies.theme || themeDefault } font-size-${cookies.fontSize || 'small' }`}>
      
      <SettingsContext.Provider value={{theme: cookies.theme || themeDefault, fontSize: cookies.fontSize || 'small' }}>
        <ToastContainer enableMultiContainer containerId='top-center' position='top-center' className='toast--top-center' closeButton={ToastCloseButton}/>
        <BrowserRouter>
          { isEmbedded ? null : <><GlobalNav/><BetaBanner/><Header/></> }
          <AppRoutes />
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
