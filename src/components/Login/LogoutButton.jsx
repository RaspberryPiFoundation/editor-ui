import React from "react";
import userManager from "../../utils/userManager";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const LogoutButton = ({ className, user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onLogoutButtonClick = async (event) => {
    event.preventDefault();
    userManager.signoutRedirect({ id_token_hint: user?.id_token });
    await userManager.removeUser();
    localStorage.clear();
    navigate("/");
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
