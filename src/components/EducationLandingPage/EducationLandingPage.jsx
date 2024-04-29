import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/EducationLandingPage.scss";
import TextImage from "../TextImage/TextImage";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";

const EducationLandingPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { t, i18n } = useTranslation();
  // const [cookies] = useCookies(["theme"]);
  const locale = i18n.language;
  // const isDarkMode =
  //   cookies.theme === "dark" ||
  //   (!cookies.theme &&
  //     window.matchMedia("(prefers-color-scheme:dark)").matches);

  const onClickPlausible = (msg) => () => {
    if (window.plausible) {
      window.plausible(msg);
    }
  };

  useEffect(() => {
    if (user) {
      navigate(`/${locale}/projects`);
    }
  }, [user, locale, navigate]);

  return (
    <div className="education-landing-page-wrapper">
      <h1>header</h1>
      <TextImage />
      <div className="education-landing-page__get-started">
        {" "}
        <h2 className="school-onboarding__subtitle">
          {t("educationLandingPage.title")}
        </h2>
        <DesignSystemButton
          className="landing-page__button"
          href={`/${locale}/`}
          text={t("educationLandingPage.start")}
          textAlways
          onClick={onClickPlausible("Ecreate your school accout")}
        />
      </div>
    </div>
  );
};

export default EducationLandingPage;
