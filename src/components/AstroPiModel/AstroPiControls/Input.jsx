import React from "react";
import { useEffect, useState, startTransition } from "react";
import Sk from "skulpt";
import "../../../assets/stylesheets/AstroPiModel.scss";

const Input = (props) => {
  const { name, label, type, defaultValue } = props;
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (Sk.sense_hat) {
      startTransition(() => {
        Sk.sense_hat[name] = value;
      });
    }
  }, [name, value]);

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
