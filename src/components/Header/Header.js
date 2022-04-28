import './Header.css'
import { useSelector, connect } from 'react-redux'
import Login from '../Login/Login'

const Header = (props) => {
  const { user } = props;
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  return isEmbedded === false ? (
    <div className='main-container'>
      <Login user={user} />
      { user !== null ? (
        <a href='/projects'>Projects</a>
      ) : null }
    </div>
  ):<></>
};

function mapStateToProps(state) {
  return {
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(Header);
