import React from 'react';
import '../AstroPiModel.scss';

const OrientationReading = (props) => {
  const {name, value} = props

  return (
      <span className="sense-hat-model-orientation__reading">
        {name}: {Math.round(value*10)/10}
      </span>
  )
}

export default OrientationReading
