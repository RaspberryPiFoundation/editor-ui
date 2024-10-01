import React from "react";
import { useSelector } from "react-redux";
import ChevronDown from "../../assets/icons/chevron_down.svg";
import LoginMenu from "../Login/LoginMenu";
import Dropdown from "../Menus/Dropdown/Dropdown";
import "../../assets/stylesheets/GlobalNav.scss";
import rpf_logo from "../../assets/raspberrypi_logo.svg";
import user_logo from "../../assets/unauthenticated_user.svg";
import { useTranslation } from "react-i18next";

const GlobalNav = () => {
  const { t } = useTranslation();

  const user = useSelector((state) => state.auth.user);
  return (
    <div className="editor-global-nav-wrapper">
      <div className="editor-global-nav">
        <a
          className="editor-global-nav__home"
          href="https://www.raspberrypi.org/"
          rel="noreferrer"
          target="_blank"
        >
          <img src={rpf_logo} alt={t("globalNav.raspberryPiLogoAltText")} />
          <span>Raspberry Pi Foundation</span>
        </a>
        <div className="editor-global-nav__account">
          <Dropdown
            buttonImage={user ? user.profile.picture : user_logo}
            buttonImageAltText={
              user
                ? t("globalNav.accountMenuProfileAltText", {
                    name: user.profile.name,
                  })
                : t("globalNav.accountMenuDefaultAltText")
            }
            ButtonIcon={ChevronDown}
            MenuContent={LoginMenu}
          />
        </div>
      </div>
    </div>
  );
};

export default GlobalNav;
