import React from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css?inline";
import { Link } from "react-router-dom";
import classNames from "classnames";

import "../../assets/stylesheets/Button.scss?inline";
import { useTranslation } from "react-i18next";

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
    buttonRef,
    disabled,
    ariaDisabled,
    confirmText,
    href,
    text,
    title,
    label,
    role,
    id,
    tabIndex,
    ariaSelected,
    ariaControls,
    onKeyDown: onKeyDownHandler,
    onKeyUp,
    buttonIconPosition = "left",
  } = props;

  const { t } = useTranslation();

  const buttonClass = classNames("btn", className, {
    "btn--svg-only": !buttonText,
  });

  const onButtonClick = (e) => {
    if (!confirmText) {
      onClickHandler(e);
      return;
    }

    confirmAlert({
      message: confirmText,
      buttons: [
        {
          label: t("button.yes"),
          onClick: () => onClickHandler(e),
        },
        {
          label: t("button.no"),
        },
      ],
    });
  };

  const onKeyDown = (e) => {
    onKeyDownHandler?.(e);
    e.stopPropagation();
  };

  const button = href ? (
    <Link
      ref={buttonRef}
      className={buttonClass}
      disabled={disabled}
      aria-label={label}
      title={title}
      to={href}
      onClick={buttonOuter ? null : onButtonClick}
      onKeyDown={onKeyDown}
    >
      {buttonImage && (
        <img src={buttonImage} alt={buttonImageAltText} crossOrigin="true" />
      )}
      {ButtonIcon && buttonIconPosition === "left" && <ButtonIcon />}
      {text && <span>{text}</span>}
      {ButtonIcon && buttonIconPosition === "right" && <ButtonIcon />}
    </Link>
  ) : (
    <button
      ref={buttonRef}
      className={buttonClass}
      disabled={disabled}
      aria-disabled={ariaDisabled || undefined}
      aria-label={label}
      title={title}
      text={text}
      role={role}
      id={id}
      tabIndex={tabIndex}
      aria-selected={ariaSelected}
      aria-controls={ariaControls}
      onClick={buttonOuter ? null : onButtonClick}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      {buttonImage && (
        <img src={buttonImage} alt={buttonImageAltText} crossOrigin="true" />
      )}
      {ButtonIcon && buttonIconPosition === "left" && <ButtonIcon />}
      {buttonText && <span>{buttonText}</span>}
      {ButtonIcon && buttonIconPosition === "right" && <ButtonIcon />}
    </button>
  );

  if (buttonOuter) {
    return (
      <div
        className={classNames("btn-outer", {
          buttonOuterClassName,
        })}
        onClick={onButtonClick}
      >
        {button}
      </div>
    );
  }

  return button;
};

export default Button;
