import React from 'react';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Barometer, Humidity, Thermometer } from "@intern0t/react-weather-icons";
import '../AstroPiModel.scss';
import Sk from 'skulpt';

const SliderInput = (props) => {
  const { name, unit, min, max, defaultValue} = props;
  const [value, setValue] = useState(defaultValue);
  const [cookies] = useCookies(['theme'])
  const isDarkMode = cookies.theme==="dark" || (!cookies.theme && window.matchMedia("(prefers-color-scheme:dark)").matches)
  const iconColour = isDarkMode ? "white" : "black"

  useEffect(() => {
    if (Sk.sense_hat) {
      Sk.sense_hat.rtimu[name][1] = value+Math.random()-0.5
    }
  }, [name, value])

  return (
    <div className="sense-hat-controls__control">
      <label className='sense-hat-controls__control-name' htmlFor={`sense_hat_${name}`}>{name}</label>
      <input id={`sense_hat_${name}`} className="sense-hat-controls__control-input" type="range" min={min} max={max} step="1" defaultValue={value} onChange={e => setValue(parseFloat(e.target.value))}/>
      <div className="sense-hat-controls__control-icon">
        {name==="temperature" ?
        <Thermometer color={iconColour} size={"1.5em"}/>
        :
        name==="pressure" ?
        <Barometer color={iconColour} size={"1.5em"}/>
        :
        name==="humidity" ?
        <Humidity color={iconColour} size={"1.5em"}/>
        :
        null}
        <span className={`sense-hat-controls__control-value sense-hat-${name}`}>{value}{unit}</span>
      </div>
    </div>
  )
};

export default SliderInput
