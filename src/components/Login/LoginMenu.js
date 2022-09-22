import React from "react";
import { useSelector } from "react-redux";
import userManager from "../../utils/userManager";
import Login from "./Login";
import './LoginMenu.scss'

const LoginMenu = () => {

  const user = useSelector((state) => state.auth.user)

  return (
    <div className = 'dropdown-container dropdown-container--bottom dropdown-container--list login-menu'>
      {user !== null ?
      <>
        <a className='dropdown-container--list__item' href={`${user.profile.profile}/edit`}>My profile</a>
        <a className='dropdown-container--list__item' href='/projects'>My projects</a>
      </>
      : null
    }
      <Login className='dropdown-container--list__item' user={user}/>
    </div>
  ) 
}

export default LoginMenu
