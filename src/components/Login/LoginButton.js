import React from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "../Button/Button";
import { login } from "../../utils/login";

const LoginButton = (props) => {
  const { buttonText, className, triggerSave } = props;
  const location = useLocation();
  const project = useSelector((state) => state.editor.project);
  const accessDeniedData = useSelector(
    (state) => state.editor.modals?.accessDenied || null,
  );

  const onLoginButtonClick = (event) => {
    event.preventDefault();
    login({ project, location, triggerSave, accessDeniedData });
  };

  return (
    <Button
      buttonText={buttonText}
      className={className}
      onClickHandler={onLoginButtonClick}
    />
  );
};

export default LoginButton;
