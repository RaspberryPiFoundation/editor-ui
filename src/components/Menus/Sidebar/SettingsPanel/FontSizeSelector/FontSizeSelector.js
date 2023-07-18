import React from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { FontIcon } from "./../../../../../Icons";
import "./FontSizeSelector.scss";

const COOKIE_PATHS = ["/", "/projects", "/python"];

const FontSizeSelector = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["fontSize"]);
  const fontSize = cookies.fontSize || "small";
  const { t } = useTranslation();

  const setFontSize = (fontSize) => {
    if (cookies.fontSize) {
      COOKIE_PATHS.forEach((path) => {
        removeCookie("fontSize", { path });
      });
    }
    setCookie("fontSize", fontSize, { path: "/" });
  };

  return (
    <div className="font-size-selector">
      <div
        className="font-btn font-btn--small"
        onClick={() => setFontSize("small")}
      >
        <button
          className={`font-btn__icon font-btn__icon--small ${
            fontSize === "small" ? "font-btn__icon--active" : ""
          }`}
        >
          <span className="font-btn__icon--text">
            <FontIcon size={15} />
            {t("sidebar.settingsMenu.textSizeOptions.small")}
          </span>
        </button>
      </div>
      <div
        className="font-btn font-btn--medium"
        onClick={() => setFontSize("medium")}
      >
        <button
          className={`font-btn__icon font-btn__icon--medium ${
            fontSize === "medium" ? "font-btn__icon--active" : ""
          }`}
        >
          <span className="font-btn__icon--text">
            {" "}
            <FontIcon size={18} />
            {t("sidebar.settingsMenu.textSizeOptions.medium")}
          </span>
        </button>
      </div>
      <div
        className="font-btn font-btn--large"
        onClick={() => setFontSize("large")}
      >
        <button
          className={`font-btn__icon font-btn__icon--large ${
            fontSize === "large" ? "font-btn__icon--active" : ""
          }`}
        >
          <span className="font-btn__icon--text">
            {" "}
            <FontIcon size={21} />
            {t("sidebar.settingsMenu.textSizeOptions.large")}
          </span>
        </button>
      </div>
    </div>
  );
};

export default FontSizeSelector;
