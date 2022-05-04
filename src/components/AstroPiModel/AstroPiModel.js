import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import './AstroPiModel.scss';
import Simulator from './Simulator';
import Input from './Input';
import SliderInput from './SliderInput';
import Sk from 'skulpt';

const AstroPiModel = (props) => {

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

  if (!Sk.sense_hat) {
    Sk.sense_hat = {
      rtimu: {
        temperature: [0,0],
        pressure: [0,0],
        humidity: [0,0]
      }
    }
  }
    return (
      <div className='sense-hat-canvas-container'>
        {/* <!-- Full sensor controls --> */}
        <div id="sense-hat-sensor-controls-container" className="top hide-for-snapshot">
          <div className="controls-container">
            <SliderInput name="temperature" unit="°C" min={-40} max={120} defaultValue={13} iconClass="wi wi-thermometer" />
            <SliderInput name="pressure" unit="hPa" min={260} max={1260} defaultValue={1013} iconClass="wi wi-barometer" />
            <SliderInput name="humidity" unit="%" min={0} max={100} defaultValue={45} iconClass="wi wi-humidity" />
          </div>
        
          <div className="controls-container motion-colour">
            <Input name="motion" label="Motion" type="checkbox" defaultValue={false} />
            <Input name="colour" label="Colour" type="color" defaultValue="#000000" />
          </div>
        </div>

        <Simulator />
        
        <div className="orientation-stage" id="orientation-stage">
          {/* <!--Solid Axis Removed--> */}
          <div className="orientation-layer" id="orientation-layer">
            <div className="scene scene3d" id="sensehat-node">
            </div>
          </div>
        </div>
        
        {/* <!-- Orientation Values --> */}
        <div id="orientation-overlay" className="bottom 3d hide hide-for-snapshot">
          <div className="controls-container">
        
            {/* <!-- roll --> */}
            <div className="rangeslider-container">
              <div className="readings-container">
                <span className="orientation-reading">
                  roll:
                </span>
                <span className="sense-hat-roll right"></span>
              </div>
            </div>
        
            {/* <!-- pitch --> */}
            <div className="rangeslider-container">
              <div className="readings-container">
                <span className="orientation-reading">
                  pitch:
                </span>
                <span className="sense-hat-pitch right"></span>
              </div>
            </div>
        
            {/* <!-- yaw --> */}
            <div className="rangeslider-container">
              <div className="readings-container">
                <span className="orientation-reading">
                  yaw:
                </span>
                <span className="sense-hat-yaw right"></span>
              </div>
            </div>
        
          </div>
          <div id="imu-buttons-container">
            <div id="close-sense-hat-orientation-controls">
              <button id="orientation-reset-btn" ><i className="fa fa-refresh fa-2x"></i></button>
            </div>
          </div>
        </div>
      </div>
        
    )
  };
  
  export default AstroPiModel;
