import './Header.css'
import { useSelector } from 'react-redux'
import Login from '../Login/Login'

const Header = () => {
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  return isEmbedded === false ? (
    <div className='main-container'>
      <Login />
      <a href='/projects'>Projects</a>
    </div>
  ):<></>
};

export default Header;
