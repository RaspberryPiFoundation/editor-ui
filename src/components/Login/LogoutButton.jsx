import React from "react";
import UserManager from "../../utils/userManager";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button";
import PropTypes from "prop-types";

const LogoutButton = ({ className, user }) => {
  const { t } = useTranslation();
  const userManager = UserManager({ reactAppAuthenticationUrl: "TODO" });

  const onLogoutButtonClick = async (event) => {
    event.preventDefault();
    userManager.signoutRedirect({
      id_token_hint: user?.id_token,
    });
    await userManager.removeUser();
    localStorage.clear();
  };

  return (
    <Button
      buttonText={t("globalNav.accountMenu.logout")}
      className={className}
      onClickHandler={onLogoutButtonClick}
    />
  );
};

LogoutButton.propTypes = {
  className: PropTypes.string,
  user: PropTypes.shape({
    id_token: PropTypes.string.isRequired,
  }).isRequired,
};

export default LogoutButton;
