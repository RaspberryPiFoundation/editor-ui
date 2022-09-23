import './App.scss';

import Header from './components/Header/Header'
import Routes from './components/Routes'
import { useCookies } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import GlobalNav from './components/GlobalNav/GlobalNav';

function App() {
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const [cookies] = useCookies(['theme', 'fontSize'])
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"
  return (
    <div 
    id='app'
    className = {`--${cookies.theme || themeDefault } font-size-${cookies.fontSize || 'small' }`}>
      <BrowserRouter>
        { isEmbedded ? null : <><GlobalNav/><Header/></> }
        <Routes />
      </BrowserRouter>
    </div>
  );
}

export default App;
