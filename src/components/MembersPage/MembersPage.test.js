import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/LandingPage.scss";
import LoginButton from "../Login/LoginButton";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import startIconDark from "../../assets/start_icon_dark.svg";
import startIconLight from "../../assets/start_icon_light.svg";
import { ReactComponent as HtmlFileIcon } from "../../assets/icons/html_file.svg";
import { ReactComponent as PythonFileIcon } from "../../assets/icons/python_file.svg";

const MembersPage = () => {
  return <div className="">Members page</div>;
};

export default MembersPage;
