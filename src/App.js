import './App.scss';
import { useSelector } from 'react-redux';

import Header from './components/Header/Header'
import Routes from './components/Routes'

function App() {
  const isDarkMode = useSelector((state) => state.editor.darkModeEnabled)
  return (
    <div id='app' className = {isDarkMode ? '--dark': '--light'}>
      <Header />
      <Routes />
    </div>
  );
}

export default App;
