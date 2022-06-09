import React from 'react';
import './AstroPiModel.scss';
import Simulator from './Simulator';
import Sk from 'skulpt';
import AstroPiControls from './AstroPiControls/AstroPiControls';
import OrientationPanel from './OrientationPanel/OrientationPanel';
import { useEffect, useState } from 'react';
import { resetModel, updateRTIMU } from '../../utils/Orientation';

const AstroPiModel = () => {
  const [orientation, setOrientation] = useState([0,90,0])
  const resetOrientation = (e) => {
    resetModel(e)
    setOrientation([0,90,0])
  }

  const defaultPressure = 1013
  const defaultTemperature = 13
  const defaultHumidity = 45

  if (!Sk.sense_hat){
    Sk.sense_hat = {
      colour: "#000000",
      gamma: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      low_light: false,
      motion: false,
      pixels: [],
      readHumidity: false,
      rtimu: {
        pressure: [1, defaultPressure+Math.random()-0.5], /* isValid, pressure*/
        temperature: [1, defaultTemperature+Math.random()-0.5], /* isValid, temperature */
        humidity: [1, defaultHumidity+Math.random()-0.5], /* isValid, humidity */
        gyro: [0, 0, 0], /* all 3 gyro values */
        accel: [0, 0, 0], /* all 3 accel values */
        compass: [0, 0, 33], /* all compass values */
        raw_orientation: [0, 90, 0]
      },
      sensestick: {
        _eventQueue: [],
        off: () => {},
        once: () => {}
      },
      start_motion_callback: () => {},
      stop_motion_callback: () => {},
      usedLEDs: false
    }
    for (var i = 0; i < 64; i++) {
      Sk.sense_hat.pixels.push([0, 0, 0]);
    }
  }

  useEffect(() => {
    Sk.sense_hat.rtimu.raw_orientation = orientation
    updateRTIMU()
  }, [orientation])

    return (
      <div className='sense-hat-canvas-container'>
        {/* <!-- Full sensor controls --> */}
        <AstroPiControls pressure={defaultPressure} temperature={defaultTemperature} humidity={defaultHumidity} colour={Sk.sense_hat.colour} motion={Sk.sense_hat.motion} />
        
        <Simulator updateOrientation={setOrientation}/>
        
        {/* <!-- Orientation Values --> */}
        <OrientationPanel orientation={orientation} resetOrientation={resetOrientation}/>

      </div>
    )
  };
  
  export default AstroPiModel;
