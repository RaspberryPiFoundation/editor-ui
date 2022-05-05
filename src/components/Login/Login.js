import React from 'react';
import userManager from '../../utils/userManager'
import Button from '../../components/Button/Button'

const Login = (props) => {
  const { user } = props;

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
