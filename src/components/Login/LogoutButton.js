import React from 'react';
import userManager from '../../utils/userManager'
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';
import { useNavigate } from 'react-router-dom';

const LogoutButton = (props) => {
  const { className } = props;
  const { t } = useTranslation()
  const navigate = useNavigate()

  const onLogoutButtonClick = async (event) => {
    event.preventDefault();
    await userManager.removeUser()
    localStorage.clear()
    navigate('/')
  }

  return (
    <Button buttonText={t('globalNav.accountMenu.logout')} className={className} onClickHandler={onLogoutButtonClick} />
  )
}

export default LogoutButton;
