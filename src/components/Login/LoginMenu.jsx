import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";
import "../../assets/stylesheets/LoginMenu.scss";
import { Link } from "react-router-dom";
import { getMySchool } from "../../utils/apiCallHandler";

const LoginMenu = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.user?.access_token);
  const [school, setSchool] = useState();

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const school = await getMySchool(accessToken);
        setSchool(school);
      };
      fetchData();
    }
  }, [user, accessToken]);

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
          <Link
            className="dropdown-container--list__item"
            to={`${locale}/projects`}
          >
            {t("globalNav.accountMenu.projects")}
          </Link>
          {school && (
            <Link
              className="dropdown-container--list__item"
              to={`${locale}/schools/${school.id}`}
            >
              {school.name}
            </Link>
          )}
          <LogoutButton
            user={user}
            className="btn--tertiary dropdown-container--list__item"
          />
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
