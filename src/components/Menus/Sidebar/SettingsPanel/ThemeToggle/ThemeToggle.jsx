import React, { startTransition } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import SelectButtons from "../../../../../utils/SelectButtons";
import { themeUpdatedEvent } from "../../../../../events/WebComponentCustomEvents";
import { useUpdateUserSettings } from "../../../../../hooks/useUserSettings";

const ThemeToggle = () => {
  const theme = useSelector((state) => state.userSettings.theme);
  const updateSettings = useUpdateUserSettings();
  const isDarkMode =
    theme === "dark" ||
    (!theme && window.matchMedia("(prefers-color-scheme:dark)").matches);
  const { t } = useTranslation();

  const setTheme = (theme) => {
    startTransition(() => {
      updateSettings({ theme });
    });
    // Fire custom event
    document.dispatchEvent(themeUpdatedEvent(theme));
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
