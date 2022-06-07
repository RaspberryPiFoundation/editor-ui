import './App.scss';

import Header from './components/Header/Header'
import Routes from './components/Routes'
import { useCookies } from 'react-cookie';

function App() {
  const [cookies] = useCookies(['theme', 'fontSize'])
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"
  return (
    <div 
    id='app'
    className = {`--${cookies.theme || themeDefault } font-size-${cookies.fontSize || 'small' }`}>
      <Header />
      <Routes />
    </div>
  );
}

export default App;
