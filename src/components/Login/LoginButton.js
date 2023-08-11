import React from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "../Button/Button";
import { login } from "../../utils/login";
import PropTypes from "prop-types";

const LoginButton = ({ buttonText, className, triggerSave, loginRedirect }) => {
  const location = useLocation();
  const project = useSelector((state) => state.editor.project);
  const accessDeniedData = useSelector(
    (state) => state.editor.modals?.accessDenied || null,
  );

  const onLoginButtonClick = (event) => {
    event.preventDefault();
    login({
      project,
      location,
      triggerSave,
      accessDeniedData,
      loginRedirect,
    });
  };

  return (
    <Button
      buttonText={buttonText}
      className={className}
      onClickHandler={onLoginButtonClick}
    />
  );
};

LoginButton.propTypes = {
  buttonText: PropTypes.string,
  className: PropTypes.string,
  triggerSave: PropTypes.bool,
  loginRedirect: PropTypes.string,
};

export default LoginButton;
