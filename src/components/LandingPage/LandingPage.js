import React from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import "./LandingPage.scss";
import "../Button/Button.scss";
import LoginButton from "../Login/LoginButton";
//import Button from "../Button/Button";
import { Button } from "@RaspberryPiFoundation/design-system-react/";
import startIconDark from "../../assets/start_icon_dark.svg";
import startIconLight from "../../assets/start_icon_light.svg";
import { FileIconHtml, FileIconPython } from "../../Icons";

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const [cookies] = useCookies(["theme"]);
  const locale = i18n.language;
  const isDarkMode =
    cookies.theme === "dark" ||
    (!cookies.theme &&
      window.matchMedia("(prefers-color-scheme:dark)").matches);
  return (
    <div className="landing-page-wrapper">
      <div className="landing-page__projects">
        <h1 className="landing-page__projects--title">
          {t("landingPage.title")}
        </h1>
        <h2 className="landing-page__projects--subtitle">
          {t("landingPage.subtitle")}
        </h2>
        <div className="landing-page__projects--buttons">
          <Button
            className="rpf-button--primary"
            href={`/${locale}/projects/blank-python-starter`}
            text={t("landingPage.python")}
            textAlways
            icon={PythonIcon}
          />
          <Button
            className="rpf-button"
            href={`/${locale}/projects/blank-html-starter`}
            text={t("landingPage.html")}
            textAlways
            icon={HtmlIcon}
          />
        </div>
        <p className="landing-page__projects--login">
          Have an account?
          <LoginButton
            key="login"
            className=""
            buttonText={t("landingPage.login")}
          />
          and continue your projects
        </p>
      </div>
      <div className="landing-page__paths">
        <div className="landing-page__paths-copy">
          <h2 className="landing-page__paths--title">
            {t("landingPage.start")}
          </h2>
          <p className="landing-page__paths--description">
            Follow a{" "}
            <Link
              className="landing-page__link"
              to="https://projects.raspberrypi.org/en/pathways/python-intro"
            >
              {t("landingPage.projectPython")}
            </Link>{" "}
            or{" "}
            <Link
              className="landing-page__link"
              to="https://projects.raspberrypi.org/en/pathways/web-intro"
            >
              {t("landingPage.projectHtml")}
            </Link>{" "}
            on our Projects site.
          </p>
        </div>
        <div className="landing-page__paths-media">
          <img src={isDarkMode ? startIconDark : startIconLight} alt={""} />
        </div>
      </div>
    </div>
  );
};

const HtmlIcon = (
  <svg
    data-testid="htmlIcon"
    transform="1"
    width="20"
    height="17"
    viewBox="0 0 20 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 7.125L7.5 0.124999V3.375L1.875 8.375L7.5 13.375V16.625L0 9.625V7.125ZM20 9.75L12.5 16.75V13.375L18.25 8.375L12.5 3.375V0L20 7V9.75Z" />
  </svg>
);

const PythonIcon = (
  <svg
    data-testid="pythonIcon"
    width="20"
    height="21"
    viewBox="0 0 20 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.52694 9.62608H7.16163C5.50591 9.62608 4.44152 10.6905 4.44152 12.3462V14.475C4.44152 14.7115 4.32326 14.8298 4.08673 14.8298H3.02234C1.95795 14.8298 1.13009 14.3567 0.657031 13.4106C0.302234 12.701 0.065703 11.9914 0.065703 11.2818C-0.0525625 9.98088 -0.0525622 8.67996 0.4205 7.37904C0.775296 6.31465 1.48489 5.48679 2.66754 5.25026H9.52694C9.6452 5.25026 9.88173 5.25026 9.88173 5.132V4.54067C9.88173 4.54067 9.6452 4.4224 9.52694 4.4224H5.50591C5.15112 4.4224 5.03285 4.30414 5.03285 3.94934V2.41189C5.03285 1.58403 5.38765 0.992705 6.09724 0.756175C6.68857 0.519644 7.27989 0.283113 7.87122 0.164848C9.29041 -0.0716833 10.7096 -0.0716835 12.1288 0.283113C12.7201 0.401378 13.3114 0.637909 13.7845 0.992705C14.2576 1.46577 14.6124 1.93883 14.4941 2.64842V6.90598C14.4941 8.56169 13.548 9.50782 11.8922 9.50782C11.0644 9.62608 10.2365 9.62608 9.52694 9.62608ZM6.21551 2.53016C6.21551 3.00322 6.5703 3.47628 7.16163 3.47628C7.63469 3.47628 8.10775 3.00322 8.10775 2.53016C8.10775 2.05709 7.63469 1.7023 7.16163 1.58403C6.5703 1.58403 6.21551 2.05709 6.21551 2.53016ZM10.4731 10.8087H12.8384C14.4941 10.8087 15.5585 9.74435 15.5585 8.08863V5.95985C15.5585 5.72332 15.6767 5.60506 15.9133 5.60506H16.9777C18.042 5.60506 18.8699 6.07812 19.343 7.02424C19.6978 7.73383 19.9343 8.44343 19.9343 9.15302C20.0526 10.4539 20.0526 11.7549 19.5795 13.0558C19.2247 14.1202 18.5151 14.948 17.3325 15.1846H10.4731C10.3548 15.1846 10.1183 15.1846 10.1183 15.3028V15.8941C10.1183 15.8941 10.3548 16.0124 10.4731 16.0124H14.4941C14.8489 16.0124 14.9671 16.1307 14.9671 16.4855V18.0229C14.9671 18.8508 14.6124 19.4421 13.9028 19.6786C13.3114 19.9152 12.7201 20.1517 12.1288 20.27C10.7096 20.5065 9.29041 20.5065 7.87122 20.1517C7.27989 20.0334 6.68857 19.7969 6.21551 19.4421C5.74244 18.969 5.38765 18.496 5.50591 17.7864V13.5288C5.50591 11.8731 6.45204 10.927 8.10775 10.927C8.93561 10.8087 9.76347 10.8087 10.4731 10.8087ZM13.7845 17.9047C13.7845 17.4316 13.4297 16.9585 12.8384 16.9585C12.3653 16.9585 11.8922 17.4316 11.8922 17.9047C11.8922 18.3777 12.3653 18.7325 12.8384 18.8508C13.4297 18.8508 13.7845 18.3777 13.7845 17.9047Z" />
  </svg>
);
export default LandingPage;
