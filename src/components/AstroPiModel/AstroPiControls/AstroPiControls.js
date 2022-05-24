import React from 'react';
import Input from './Input';
import MotionInput from './MotionInput';
import SliderInput from './SliderInput';
import '../AstroPiModel.scss';

const AstroPiControls = (props) => {
  const {temperature, pressure, humidity, colour, motion} = props

  return (
    <div id="sense-hat-sensor-controls-container" className="top hide-for-snapshot">
      <div className="controls-container">
        <SliderInput name="temperature" unit="°C" min={-40} max={120} defaultValue={temperature} />
        <SliderInput name="pressure" unit="hPa" min={260} max={1260} defaultValue={pressure} />
        <SliderInput name="humidity" unit="%" min={0} max={100} defaultValue={humidity} />
      </div>
    
      <div className="controls-container motion-colour">
        <MotionInput defaultValue={motion} />
        <Input name="colour" label="Colour" type="color" defaultValue={colour} />
      </div>
    </div>
  )
};

export default AstroPiControls
