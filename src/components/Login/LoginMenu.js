import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";
import "./LoginMenu.scss";

const LoginMenu = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="dropdown-container dropdown-container--bottom dropdown-container--list login-menu">
      {user !== null ? (
        <>
          <a
            className="dropdown-container--list__item"
            href={`${user.profile.profile}/edit`}
          >
            {t("globalNav.accountMenu.profile")}
          </a>
          <a className="dropdown-container--list__item" href="/projects">
            {t("globalNav.accountMenu.projects")}
          </a>
          <LogoutButton className="btn--tertiary dropdown-container--list__item" />
        </>
      ) : (
        <LoginButton
          buttonText={t("globalNav.accountMenu.login")}
          className="btn--tertiary dropdown-container--list__item"
        />
      )}
    </div>
  );
};

export default LoginMenu;
