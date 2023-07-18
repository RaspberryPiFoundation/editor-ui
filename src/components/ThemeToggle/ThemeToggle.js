import React from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";

import "./ThemeToggle.scss";

const COOKIE_PATHS = ["/", "/projects", "/python"];

const ThemeToggle = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["theme"]);
  const isDarkMode =
    cookies.theme === "dark" ||
    (!cookies.theme &&
      window.matchMedia("(prefers-color-scheme:dark)").matches);
  const { t } = useTranslation();

  const setTheme = (theme) => {
    if (cookies.theme) {
      COOKIE_PATHS.forEach((path) => {
        removeCookie("theme", { path });
      });
    }
    setCookie("theme", theme, { path: "/" });
  };

  return (
    <div className="theme-toggle">
      <div
        className="theme-btn theme-btn--light"
        onClick={() => setTheme("light")}
      >
        <button
          className={`theme-btn__icon theme-btn__icon--light ${
            !isDarkMode ? "theme-btn__icon--active" : null
          }`}
        >
          <span className="theme-btn__icon--text">
            {t("sidebar.settingsMenu.themeOptions.light")}
          </span>
        </button>
      </div>
      <div
        className="theme-btn theme-btn--dark"
        onClick={() => setTheme("dark")}
      >
        <button
          className={`theme-btn__icon theme-btn__icon--dark ${
            isDarkMode ? "theme-btn__icon--active" : null
          }`}
        >
          <span className="theme-btn__icon--text">
            {t("sidebar.settingsMenu.themeOptions.dark")}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;
