import React from 'react';
import Input from './Input';
import MotionInput from './MotionInput';
import SliderInput from './SliderInput';
import '../AstroPiModel.scss';
import Stopwatch from './Stopwatch';
import { TemperatureIcon } from '../../../Icons';

const AstroPiControls = (props) => {
  const {temperature, pressure, humidity, colour, motion} = props

  return (
    <div className='sense-hat-controls'>
      <h2 className='sense-hat-controls-heading'>Space Station Control Panel</h2>
      <div className="sense-hat-controls-panel">
          <SliderInput name="temperature" unit="°C" min={-40} max={120} defaultValue={temperature} />
          <SliderInput name="pressure" unit="hPa" min={260} max={1260} defaultValue={pressure} />
          <SliderInput name="humidity" unit="%" min={0} max={100} defaultValue={humidity} />
      
        <div className="sense-hat-controls-panel__control">
          <Input name="colour" label="Colour Picker" type="color" defaultValue={colour} />
          <MotionInput defaultValue={motion} />
          <Stopwatch />
        </div>
      </div>
    </div>
  )
};

export default AstroPiControls
