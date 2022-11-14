import './App.scss';

import { useCookies } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { SettingsContext } from './settings';
import Header from './components/Header/Header'
import Routes from './components/Routes'
import GlobalNav from './components/GlobalNav/GlobalNav';
import Footer from './components/Footer/Footer';
import BetaBanner from './components/BetaBanner/BetaBanner';
import BetaModal from './components/Modals/BetaModal';

function App() {
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const [cookies] = useCookies(['theme', 'fontSize'])
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"
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
      </SettingsContext.Provider>
    </div>
  );
}

export default App;
