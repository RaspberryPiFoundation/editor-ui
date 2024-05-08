import React from "react";
import userManager from "../../utils/userManager";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";

const LogoutButton = ({ className, user, ...props }) => {
  const { t } = useTranslation();

  const onLogoutButtonClick = async (event) => {
    event.preventDefault();
    userManager.signoutRedirect({ id_token_hint: user?.id_token });
    await userManager.removeUser();
    localStorage.clear();
  };

  return (
    <DesignSystemButton
      text={t("globalNav.accountMenu.logout")}
      className={className}
      onClick={onLogoutButtonClick}
      {...props}
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
