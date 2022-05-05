import { useEffect } from 'react';
import { useSelector } from 'react-redux'
import Sk from 'skulpt';
import Input from './Input';
import SliderInput from './SliderInput';
import '../AstroPiModel.scss';

const AstroPiControls = (props) => {
  const {temperature, pressure, humidity, colour, motion} = props
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);

  useEffect(() => {
    if (!codeRunTriggered) {
      if (Sk.sense_hat.start_motion_callback) {
        document.getElementById('sense_hat_motion').removeEventListener('change', Sk.sense_hat.start_motion_callback)
      }
      if (Sk.sense_hat.stop_motion_callback) {
        document.getElementById('sense_hat_motion').removeEventListener('change', Sk.sense_hat.stop_motion_callback)
      }
    }
  }, [codeRunTriggered])

  return (
    <div id="sense-hat-sensor-controls-container" className="top hide-for-snapshot">
      <div className="controls-container">
        <SliderInput name="temperature" unit="°C" min={-40} max={120} defaultValue={temperature} iconClass="wi wi-thermometer" />
        <SliderInput name="pressure" unit="hPa" min={260} max={1260} defaultValue={pressure} iconClass="wi wi-barometer" />
        <SliderInput name="humidity" unit="%" min={0} max={100} defaultValue={humidity} iconClass="wi wi-humidity" />
      </div>
    
      <div className="controls-container motion-colour">
        <Input name="motion" label="Motion" type="checkbox" defaultValue={motion} />
        <Input name="colour" label="Colour" type="color" defaultValue={colour} />
      </div>
    </div>
  )
};

export default AstroPiControls
