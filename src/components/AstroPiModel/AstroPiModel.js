import './AstroPiModel.scss';
import Simulator from './Simulator';
import Sk from 'skulpt';
import AstroPiControls from './AstroPiControls/AstroPiControls';
import OrientationPanel from './OrientationPanel/OrientationPanel';

const AstroPiModel = () => {

  const defaultPressure = 1013
  const defaultTemperature = 13
  const defaultHumidity = 45

  if (!Sk.sense_hat){
    Sk.sense_hat = {}
    Sk.sense_hat.rtimu = {
        pressure: [1, defaultPressure+Math.random()-0.5], /* isValid, pressure*/
        temperature: [1, defaultTemperature+Math.random()-0.5], /* isValid, temperature */
        humidity: [1, defaultHumidity+Math.random()-0.5], /* isValid, humidity */
        gyro: [0, 0, 0], /* all 3 gyro values */
        accel: [0, 0, 0], /* all 3 accel values */
        compass: [0, 0, 33], /* all compass values */
        raw_orientation: [0, 90, 0]
    }
  }
    return (
      <div className='sense-hat-canvas-container'>
        {/* <!-- Full sensor controls --> */}
        <AstroPiControls pressure={defaultPressure} temperature={defaultTemperature} humidity={defaultHumidity} />
        
        <Simulator />
        
        {/* <!-- Orientation Values --> */}
        <OrientationPanel />

      </div>
    )
  };
  
  export default AstroPiModel;
