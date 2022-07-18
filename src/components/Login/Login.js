import React from 'react';
import userManager from '../../utils/userManager'
import Button from '../../components/Button/Button'
import { useLocation } from 'react-router-dom';

const Login = (props) => {
  const { user } = props;
  const location = useLocation()

  const onLoginButtonClick = (event) => {
    event.preventDefault();
    localStorage.setItem('location', location.pathname)
    console.log(location.pathname)
    userManager.signinRedirect();
  }

  const onLogoutButtonClick = (event) => {
    event.preventDefault();
    userManager.removeUser()
  }

  return (user === null ? (
      <Button onClickHandler={onLoginButtonClick} buttonText='Login' />
    ) :  (
      <Button onClickHandler={onLogoutButtonClick} buttonText='Logout' />
    )
  )
}

export default Login;
