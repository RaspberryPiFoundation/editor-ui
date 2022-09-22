import React, { useEffect } from 'react';
import userManager from '../../utils/userManager'
import Button from '../../components/Button/Button'
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Login = (props) => {
  const { className, user } = props;
  const location = useLocation()
  const project = useSelector((state) => state.editor.project)

  const onLoginButtonClick = (event) => {
    event.preventDefault();
    localStorage.setItem('location', location.pathname)
    localStorage.setItem('project', JSON.stringify(project))
    userManager.signinRedirect();
  }

  const onLogoutButtonClick = (event) => {
    event.preventDefault();
    userManager.removeUser()
  }

  return (user === null ? (
      <span className={className} onClick={onLoginButtonClick}>Login</span>
    ) :  (
      <span className={className} onClick={onLogoutButtonClick}>Logout</span>
    )
  )
}

export default Login;
