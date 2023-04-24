import "./Button.scss";

import React from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const Button = (props) => {
  const {
    className,
    onClickHandler,
    ButtonIcon,
    buttonImage,
    buttonImageAltText,
    buttonText,
    buttonOuter,
    buttonOuterClassName,
    disabled,
    confirmText,
    title,
    label,
    buttonIconLeft = true,
  } = props;

  const buttonClass = `btn${className ? ` ${className}` : ""}${
    buttonText ? "" : " btn--svg-only"
  }`;

  const onButtonClick = (e) => {
    if (!confirmText) {
      onClickHandler(e);
      return;
    }

    confirmAlert({
      message: confirmText,
      buttons: [
        {
          label: "Yes",
          onClick: () => onClickHandler(e),
        },
        {
          label: "No",
        },
      ],
    });
  };

  const button = (
    <button
      className={buttonClass}
      disabled={disabled}
      aria-label={label}
      title={title}
      onClick={buttonOuter ? null : onButtonClick}
    >
      {buttonImage ? <img src={buttonImage} alt={buttonImageAltText} /> : null}
      {ButtonIcon && buttonIconLeft ? <ButtonIcon /> : null}
      {buttonText ? <span>{buttonText}</span> : null}
      {ButtonIcon && !buttonIconLeft ? <ButtonIcon /> : null}
    </button>
  );

  if (buttonOuter) {
    return (
      <div
        className={`btn-outer${
          buttonOuterClassName ? ` ${buttonOuterClassName}` : ""
        }`}
        onClick={onButtonClick}
      >
        {button}
      </div>
    );
  }

  return button;
};

export default Button;
