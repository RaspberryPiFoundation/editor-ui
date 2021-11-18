import React from 'react';
import userManager from '../../utils/userManager'
import Button from '../../components/Button/Button'

const Login = () => {

  const onLoginButtonClick = (event) => {
    // event.preventDefault();
    userManager.signinRedirect();
  }

  return(
    <Button onClickHandler={onLoginButtonClick} buttonText='Login' />
  )

}

export default Login;
