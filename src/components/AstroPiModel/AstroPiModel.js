import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import './AstroPiModel.scss';
import Simulator from './Simulator';
import Sk from 'skulpt';
import AstroPiControls from './AstroPiControls/AstroPiControls';
import OrientationPanel from './OrientationPanel/OrientationPanel';

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
        <AstroPiControls />
        
        <Simulator />
        
        {/* <!-- Orientation Values --> */}
        <OrientationPanel />

      </div>
        
    )
  };
  
  export default AstroPiModel;
