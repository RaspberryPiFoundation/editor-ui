import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/LandingPage.scss";
import LoginButton from "../Login/LoginButton";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import startIconDark from "../../assets/start_icon_dark.svg";
import startIconLight from "../../assets/start_icon_light.svg";
import { ReactComponent as HtmlFileIcon } from "../../assets/icons/html_file.svg";
import { ReactComponent as PythonFileIcon } from "../../assets/icons/python_file.svg";

const EducationLandingPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  // const { t, i18n } = useTranslation();
  const { i18n } = useTranslation();
  // const [cookies] = useCookies(["theme"]);
  const locale = i18n.language;
  // const isDarkMode =
  //   cookies.theme === "dark" ||
  //   (!cookies.theme &&
  //     window.matchMedia("(prefers-color-scheme:dark)").matches);

  // const onClickPlausible = (msg) => () => {
  //   if (window.plausible) {
  //     window.plausible(msg);
  //   }
  // };

  useEffect(() => {
    if (user) {
      navigate(`/${locale}/projects`);
    }
  }, [user, locale, navigate]);

  return (
    <div className="landing-page-wrapper">
      <h1>Education landing page</h1>
    </div>
  );
};

export default EducationLandingPage;
