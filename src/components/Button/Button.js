import './Button.scss';

import React from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const Button = (props) => {
  const { className, onClickHandler, ButtonIcon, buttonText, disabled, confirmText } = props;

  var buttonClass="btn"
  buttonClass = (className ? buttonClass += ` ${className}`: buttonClass)
  buttonClass = (disabled ? buttonClass += " btn--disabled" : buttonClass)

  const onButtonClick = (e) => {
    if (!confirmText) {
      onClickHandler(e);
      return;
    }

    confirmAlert({
      message: confirmText,
      buttons: [
        {
          label: 'Yes',
          onClick: () => onClickHandler(e)
        },
        {
          label: 'No',
        }
      ]
    });
  }

  return (
    <button className={buttonClass} onClick={onButtonClick}>{buttonText}</button>
  )
};

export default Button;

