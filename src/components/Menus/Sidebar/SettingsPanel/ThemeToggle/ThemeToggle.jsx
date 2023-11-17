import React, { startTransition } from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";

import "../../../../../assets/stylesheets/ThemeToggle.scss";
import SelectButtons from "../../../../../utils/SelectButtons";

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
    startTransition(() => {
      setCookie("theme", theme, { path: "/" });
    });
  };

  return (
    <SelectButtons
      label={t("sidebar.settingsMenu.theme")}
      options={[
        {
          value: "light",
          label: t("sidebar.settingsMenu.themeOptions.light"),
        },
        {
          value: "dark",
          label: t("sidebar.settingsMenu.themeOptions.dark"),
        },
      ]}
      value={isDarkMode ? "dark" : "light"}
      setValue={setTheme}
    />
  );
};

export default ThemeToggle;
