import React from "react";
import { useEffect, useState, startTransition } from "react";
import "../../../assets/stylesheets/AstroPiModel.scss";

const Input = ({ name, label, type, defaultValue, setSenseHatConfig }) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    startTransition(() => {
      setSenseHatConfig((config) => {
        config[name] = value;
        return config;
      });
    });
  }, [name, value, setSenseHatConfig]);

  return (
    <div className="sense-hat-controls-panel__container">
      <label
        className="sense-hat-controls-panel__control-name"
        htmlFor={`sense_hat_${name}`}
      >
        {label}
      </label>
      <input
        type={type}
        id={`sense_hat_${name}`}
        defaultValue={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default Input;
