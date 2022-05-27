import React from 'react';
import '../AstroPiModel.scss';
import OrientationReading from './OrientationReading';
import OrientationResetButton from './OrientationResetButton';

const OrientationPanel = (props) => {

  const {orientation, resetOrientation} = props

  return (
    <div id="orientation-overlay" className="bottom 3d hide hide-for-snapshot">
      <div className="controls-container">
        <OrientationReading name="roll" value={orientation[0]} />
        <OrientationReading name="pitch" value={orientation[1]} />
        <OrientationReading name="yaw" value={orientation[2]} />
      </div>
      <div id="imu-buttons-container">
        <OrientationResetButton resetOrientation={resetOrientation}/>
      </div>
    </div>
  )
};

export default OrientationPanel
