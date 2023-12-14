import React from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import FontIconLg from "../../../../../assets/icons/font_icon_lg.svg";
import FontIconRg from "../../../../../assets/icons/font_icon_rg.svg";
import FontIconSm from "../../../../../assets/icons/font_icon_sm.svg";
import SelectButtons from "../../../../../utils/SelectButtons";

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
