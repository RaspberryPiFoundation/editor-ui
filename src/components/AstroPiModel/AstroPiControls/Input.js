import { useEffect, useState } from 'react';
import Sk from 'skulpt';
import '../AstroPiModel.scss';

const Input = (props) => {
  const { name, label, type, defaultValue} = props;
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (Sk.sense_hat) {
      Sk.sense_hat[name] = value
    }
  }, [value])

  return (
  <div className="rangeslider-container">
    <div className={`readings-container ${name}-sensor`}>
      <label htmlFor={`sense_hat_${name}`}>{label}:</label>
      <input type={type} id={`sense_hat_${name}`} name={`sense_hat_${name}`} defaultValue={value} onChange={e => setValue(e.target.value)} />
    </div>
  </div>
  )
};

export default Input
