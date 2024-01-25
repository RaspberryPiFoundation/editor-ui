import React from "react";
import { useEffect, useState, startTransition } from "react";
import "../../../assets/stylesheets/AstroPiModel.scss";

const SliderInput = ({ name, label, unit, min, max, defaultValue, Icon, setSenseHatConfig }) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    startTransition(() => {
      setSenseHatConfig((config) => {
        config.rtimu[name][1] = value + Math.random() - 0.5;
        return config;
      });
    });
  }, [name, value, setSenseHatConfig]);

  return (
    <div className="sense-hat-controls-panel__control">
      <label
        className="sense-hat-controls-panel__control-name"
        htmlFor={`sense_hat_${name}`}
      >
        {label}
      </label>
      <input
        id={`sense_hat_${name}`}
        className="sense-hat-controls-panel__control-input"
        type="range"
        min={min}
        max={max}
        step="1"
        defaultValue={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
      />
      <div className="sense-hat-controls-panel__control-reading">
        {Icon ? <Icon /> : null}
        <span className="sense-hat-controls-panel__control-value">
          {value}
          {unit}
        </span>
      </div>
    </div>
  );
};

export default SliderInput;
