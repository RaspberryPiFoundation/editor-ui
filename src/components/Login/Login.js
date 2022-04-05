import React from 'react';
import { useSelector } from 'react-redux'
import userManager from '../../utils/userManager'
import Button from '../../components/Button/Button'

const Login = () => {
  const stateAuth = useSelector(state => state.auth);
  const user = stateAuth.user;

  const onLoginButtonClick = (event) => {
    event.preventDefault();
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
