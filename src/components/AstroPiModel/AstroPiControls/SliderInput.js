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
  const iconColour = cookies.theme === 'dark' ? "white" : "black"

  useEffect(() => {
    if (Sk.sense_hat) {
      Sk.sense_hat.rtimu[name][1] = value+Math.random()-0.5
    }
  }, [name, value])

  return (
    <div className="rangeslider-container">
      <div className="readings-container">
        {name==="temperature" ? <Thermometer color={iconColour}/> : name==="pressure" ? <Barometer color={iconColour}/>: name==="humidity"? <Humidity color={iconColour} /> : null}
        <span className={`sensor-value sense-hat-${name}`}>{value}{unit}</span>
      </div>
      <input id={`sense_hat_${name}`} className="rangeslider" type="range" min={min} max={max} step="1" defaultValue={value} onChange={e => setValue(parseFloat(e.target.value))}/>
    </div>
  )
};

export default SliderInput
