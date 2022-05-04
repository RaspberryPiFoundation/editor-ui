import { useEffect, useState } from 'react';
import './AstroPiModel.scss';
import Sk from 'skulpt';

const Input = (props) => {
  const { name, label, type, defaultValue} = props;

  return (
  <div className="rangeslider-container">
    <div className={`readings-container ${name}-sensor`}>
      <label htmlFor={`sense_hat_${name}`}>{label}:</label>
      <input type={type} id={`sense_hat_${name}`} name={`sense_hat_${name}`} defaultValue={defaultValue} />
    </div>
  </div>
  )
};

export default Input
