import React from 'react';
import { useSelector } from 'react-redux'
import userManager from '../../utils/userManager'
import Button from '../../components/Button/Button'

const Login = () => {
  const stateAuth = useSelector(state => state.auth);
  const user = stateAuth.user;
  const enabled = process.env.REACT_APP_LOGIN_ENABLED === 'true'


  const onLoginButtonClick = (event) => {
    event.preventDefault();
    userManager.signinRedirect();
  }

  const onLogoutButtonClick = (event) => {
    event.preventDefault();
    userManager.removeUser()
  }

  return ( enabled ? (
    user === null ? (
      <Button onClickHandler={onLoginButtonClick} buttonText='Login' />
    ) :  (
      <Button onClickHandler={onLogoutButtonClick} buttonText='Logout' />
    )
  ) : null)
}

export default Login;
