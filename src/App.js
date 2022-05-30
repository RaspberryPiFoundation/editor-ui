import './App.scss';
import { useSelector } from 'react-redux';

import Header from './components/Header/Header'
import Routes from './components/Routes'
import { withCookies } from 'react-cookie';

function App(props) {
  const { cookies } = props;
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"
  return (
    <div 
    id='app'
    className = {`--${cookies.get('theme') || themeDefault } font-size-${cookies.get('fontSize') || 'medium' }`}>
      <Header />
      <Routes />
    </div>
  );
}

export default withCookies(App);
