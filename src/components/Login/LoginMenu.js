import React from "react";
import userManager from "../../utils/userManager";

const LoginMenu = () => {

  const onLogoutButtonClick = (event) => {
    event.preventDefault();
    userManager.removeUser()
  }
  return (
    <div>
      <a>My profile</a>
      <a href='/projects'>My projects</a>
      <p onClick={onLogoutButtonClick}>Log out</p>
    </div>
  ) 
}

export default LoginMenu
