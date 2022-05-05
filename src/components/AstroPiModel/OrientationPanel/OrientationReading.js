import { useEffect, useState } from 'react';
import Sk from 'skulpt';
import '../AstroPiModel.scss';

const OrientationReading = (props) => {
  const {name, value} = props

  return (
    <div className="rangeslider-container">
      <div className="readings-container">
        <span className="orientation-reading">
          {name}:
        </span>
        <span className={`sense-hat-${name} right`}>{Math.round(value*10)/10}</span>
      </div>
    </div>
  )
}

export default OrientationReading
