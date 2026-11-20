import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import FontIconLg from "../../../../../assets/icons/font_icon_lg.svg";
import FontIconRg from "../../../../../assets/icons/font_icon_rg.svg";
import FontIconSm from "../../../../../assets/icons/font_icon_sm.svg";
import SelectButtons from "../../../../../utils/SelectButtons";
import { useUpdateUserSettings } from "../../../../../hooks/useUserSettings";

const FontSizeSelector = () => {
  const fontSize = useSelector((state) => state.userSettings.fontSize);
  const updateSettings = useUpdateUserSettings();
  const { t } = useTranslation();

  const setFontSize = (fontSize) => {
    updateSettings({ fontSize });
  };

  return (
    <SelectButtons
      label={t("sidebar.settingsMenu.textSize")}
      options={[
        {
          value: "small",
          label: t("sidebar.settingsMenu.textSizeOptions.small"),
          Icon: FontIconSm,
        },
        {
          value: "medium",
          label: t("sidebar.settingsMenu.textSizeOptions.medium"),
          Icon: FontIconRg,
        },
        {
          value: "large",
          label: t("sidebar.settingsMenu.textSizeOptions.large"),
          Icon: FontIconLg,
        },
      ]}
      value={fontSize}
      setValue={setFontSize}
    />
  );
};

export default FontSizeSelector;
