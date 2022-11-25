import React from 'react';
import userManager from '../../utils/userManager'
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';

const LogoutButton = (props) => {
  const { className } = props;
  const { t } = useTranslation()

  const onLogoutButtonClick = (event) => {
    event.preventDefault();
    userManager.removeUser()
  }

  return (
    <Button buttonText={t('globalNav.accountMenu.logout')} className={className} onClickHandler={onLogoutButtonClick} />
  )
}

export default LogoutButton;
