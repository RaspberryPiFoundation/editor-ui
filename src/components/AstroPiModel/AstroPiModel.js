import { useEffect, useState } from 'react';
import './AstroPiModel.scss';
import Simulator from './Simulator';
import Sk from 'skulpt';

const AstroPiModel = (props) => {

  const [temperature, setTemperature] = useState(13);
  const [pressure, setPressure] = useState(1013);
  const [humidity, setHumidity] = useState(45);

  useEffect(() => {
    Sk.sense_hat.rtimu.temperature[1] = temperature+Math.random()-0.5
    Sk.sense_hat.rtimu.pressure[1] = pressure+Math.random()-0.5
    Sk.sense_hat.rtimu.humidity[1] = humidity+Math.random()-0.5

  }, [temperature, pressure, humidity])

  // const updateTemperature = (e) => {
  //   setTemperature(parseFloat(e.target.value))
  //   // Sk.sense_hat.rtimu.temperature[1] = parseFloat(e.target.value)+Math.random()-0.5
  //   // console.log(Sk.sense_hat.rtimu.temperature)
  // }

    return (
        <div className='sense-hat-canvas-container'>
        {/* <!-- Full sensor controls --> */}
        <div id="sense-hat-sensor-controls-container" className="top hide-for-snapshot">
          <div className="controls-container">
        
            {/* <!--Temperature--> */}
            <div className="rangeslider-container">
              <div className="readings-container">
                <i className="wi wi-thermometer"></i>
                <span className="sensor-value sense-hat-temperature">{temperature}°C</span>
              </div>
              <input id="sense_hat_temperature" className="rangeslider" type="range" min="-40" max="120" step="1" defaultValue={temperature} onChange={e => setTemperature(parseFloat(e.target.value))}/>
            </div>
        
            {/* <!--Pressure--> */}
            <div className="rangeslider-container">
              <div className="readings-container">
                <i className="wi wi-barometer"></i>
                <span className="sensor-value sense-hat-pressure">{pressure}hPa</span>
              </div>
              <input id="sense_hat_pressure" className="rangeslider" type="range" min="260" max="1260" step="1" defaultValue={pressure} onChange={(e)=>setPressure(parseFloat(e.target.value))}/>
            </div>
        
            {/* <!--Humidity--> */}
            <div className="rangeslider-container">
              <div className="readings-container">
                <i className="wi wi-humidity"></i>
                <span className="sensor-value sense-hat-humidity">{humidity}%</span>
              </div>
              <input id="sense_hat_humidity" className="rangeslider" type="range" min="0" max="100" step="1" defaultValue={humidity} onChange={(e)=>setHumidity(parseFloat(e.target.value))}/>
            </div>
          </div>
        
          <div className="controls-container motion-colour">
            {/* <!--Motion--> */}
            <div className="rangeslider-container">
              <div className="readings-container motion-sensor">
                <label htmlFor="sense_hat_motion">Motion:</label>
                <input type="checkbox" id="sense_hat_motion" name="sense_hat_motion" />
              </div>
            </div>
        
            {/* <!--Colour--> */}
            <div className="rangeslider-container">
              <div className="readings-container colour-sensor">
                <label htmlFor="sense_hat_colour">Colour:</label>
                <input type="color" id="sense_hat_colour" name="sense_hat_colour" defaultValue="#000000"/>
              </div>
            </div>
          </div>
        
        </div>

        <Simulator message='Hello there :)'/>
        
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
        
            {/* <div className="rangeslider-container spacer"></div> */}
        
            {/* <!-- roll --> */}
            <div className="rangeslider-container">
              <div className="readings-container">
                <span className="orientation-reading">
                  roll:
                </span>
                <span className="sense-hat-roll right">0</span>
              </div>
              <input id="sense_hat_roll" type="hidden" value="0" />
            </div>
        
            {/* <!-- pitch --> */}
            <div className="rangeslider-container">
              <div className="readings-container">
                <span className="orientation-reading">
                  pitch:
                </span>
                <span className="sense-hat-pitch right">100</span>
              </div>
              <input id="sense_hat_pitch" type="hidden" value="100" />
            </div>
        
            {/* <!-- yaw --> */}
            <div className="rangeslider-container">
              <div className="readings-container">
                <span className="orientation-reading">
                  yaw:
                </span>
                <span className="sense-hat-yaw right">90</span>
              </div>
              <input id="sense_hat_yaw" type="hidden" value="90" />
            </div>
        
            {/* <div className="rangeslider-container spacer"></div> */}
        
          </div>
          <div id="imu-buttons-container">
            <div id="close-sense-hat-orientation-controls">
              <button id="orientation-reset-btn" ><i className="fa fa-refresh fa-2x"></i></button>
            </div>
            <div id="enclosure-toggle-container">
              <span>
                <img id="enclosure-toggle" />
              </span>
              <input id="sense_hat_enclosure" type="hidden" />
            </div>
            {/* <!--<div id="3d-info-toggle" class="text-center">-->
              <!--TODO: hook this up-->
            <!--  <a id="3d-info-button"><i class="fa fa-info fa-2x"></i></a>-->
            <!--</div>--> */}
          </div>
        </div>
        
        <input id="sense-hat-listener" type="text" tabIndex="-1" readOnly />
        <input id="sense_hat_rotation_matrix" type="hidden" readOnly />
        <input id="sense_hat_angle" type="hidden" readOnly />
        </div>
        
    )
  };
  
  export default AstroPiModel;
