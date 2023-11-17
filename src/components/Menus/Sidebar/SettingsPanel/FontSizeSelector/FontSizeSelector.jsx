import React from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import FontIconLg from "../../../../../assets/icons/font_icon_lg.svg";
import FontIconRg from "../../../../../assets/icons/font_icon_rg.svg";
import FontIconSm from "../../../../../assets/icons/font_icon_sm.svg";
import "../../../../../assets/stylesheets/FontSizeSelector.scss";
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
          icon: FontIconSm,
        },
        {
          value: "medium",
          label: t("sidebar.settingsMenu.textSizeOptions.medium"),
          icon: FontIconRg,
        },
        {
          value: "large",
          label: t("sidebar.settingsMenu.textSizeOptions.large"),
          icon: FontIconLg,
        },
      ]}
      value={fontSize}
      setValue={setFontSize}
    />
    // <div className="font-size-selector settings-panel__items">
    //   <div
    //     className="font-btn font-btn--small"
    //     onClick={() => setFontSize("small")}
    //   >
    //     <button
    //       className={`font-btn__icon font-btn__icon--small ${
    //         fontSize === "small" ? "font-btn__icon--active" : ""
    //       }`}
    //     >
    //       <span className="font-btn__icon--text">
    //         <FontIconSm />
    //         {t("sidebar.settingsMenu.textSizeOptions.small")}
    //       </span>
    //     </button>
    //   </div>
    //   <div
    //     className="font-btn font-btn--medium"
    //     onClick={() => setFontSize("medium")}
    //   >
    //     <button
    //       className={`font-btn__icon font-btn__icon--medium ${
    //         fontSize === "medium" ? "font-btn__icon--active" : ""
    //       }`}
    //     >
    //       <span className="font-btn__icon--text">
    //         {" "}
    //         <FontIconRg />
    //         {t("sidebar.settingsMenu.textSizeOptions.medium")}
    //       </span>
    //     </button>
    //   </div>
    //   <div
    //     className="font-btn font-btn--large"
    //     onClick={() => setFontSize("large")}
    //   >
    //     <button
    //       className={`font-btn__icon font-btn__icon--large ${
    //         fontSize === "large" ? "font-btn__icon--active" : ""
    //       }`}
    //     >
    //       <span className="font-btn__icon--text">
    //         {" "}
    //         <FontIconLg />
    //         {t("sidebar.settingsMenu.textSizeOptions.large")}
    //       </span>
    //     </button>
    //   </div>
    // </div>
  );
};

export default FontSizeSelector;
