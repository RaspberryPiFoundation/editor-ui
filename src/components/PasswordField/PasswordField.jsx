import { InputField } from "@raspberrypifoundation/design-system-react";
import React, { useState } from "react";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import "../../assets/stylesheets/PasswordField.scss";

const PasswordField = ({ label, hint, name, id = "password", onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <InputField label={label} hint={hint} name={id}>
      <div className="password-field">
        <input
          className="rpf-input rpf-input--full-width password-field__input"
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          onChange={onChange}
        />
        <DesignSystemButton
          className="password-field__button"
          text={showPassword ? "Hide" : "Show"}
          onClick={() => setShowPassword(!showPassword)}
          type="tertiary"
        />
      </div>
    </InputField>
  );
};

export default PasswordField;
