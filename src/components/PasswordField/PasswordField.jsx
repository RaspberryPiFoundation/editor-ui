import { InputField } from "@raspberrypifoundation/design-system-react";
import React, { useState } from "react";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import "../../assets/stylesheets/PasswordField.scss";

const PasswordField = ({ label, hint, name, id }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <InputField label={label} hint={hint} name={name}>
      <div className="password-field">
        <input
          className="rpf-input rpf-input--full-width password-field__input"
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
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
