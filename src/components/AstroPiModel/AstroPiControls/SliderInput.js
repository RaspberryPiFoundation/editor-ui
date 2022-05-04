import { useEffect, useState } from 'react';
import '../AstroPiModel.scss';
import Sk from 'skulpt';

const SliderInput = (props) => {
  const { name, unit, iconClass, min, max, defaultValue} = props;
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    Sk.sense_hat.rtimu[name][1] = value+Math.random()-0.5
  }, [value])

  return (
    <div className="rangeslider-container">
      <div className="readings-container">
        <i className={iconClass}></i>
        <span className={`sensor-value sense-hat-${name}`}>{value}{unit}</span>
      </div>
      <input id={`sense_hat_${name}`} className="rangeslider" type="range" min={min} max={max} step="1" defaultValue={value} onChange={e => setValue(parseFloat(e.target.value))}/>
    </div>
  )
};

export default SliderInput
