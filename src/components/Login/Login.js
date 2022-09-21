import React from 'react';
import userManager from '../../utils/userManager'
import Button from '../../components/Button/Button'
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Login = () => {
  const location = useLocation()
  const project = useSelector((state) => state.editor.project)

  const onLoginButtonClick = (event) => {
    event.preventDefault();
    localStorage.setItem('location', location.pathname)
    localStorage.setItem('project', JSON.stringify(project))
    userManager.signinRedirect();
  }

  return (
    <Button onClickHandler={onLoginButtonClick} buttonText='Login' />
  )
}

export default Login;
