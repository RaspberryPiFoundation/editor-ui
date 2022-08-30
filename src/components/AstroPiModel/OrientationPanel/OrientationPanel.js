import React from 'react';
import '../AstroPiModel.scss';
import OrientationReading from './OrientationReading';
import OrientationResetButton from './OrientationResetButton';

const OrientationPanel = (props) => {

  const {orientation, resetOrientation} = props

  return (
    <div className="sense-hat-orientation">
      <div className="sense-hat-orientation__values">
        <OrientationReading name="roll" value={orientation[0]} />
        <OrientationReading name="pitch" value={orientation[1]} />
        <OrientationReading name="yaw" value={orientation[2]} />
      </div>
      <div id="ense-hat-orientation__reset-btn">
        <OrientationResetButton resetOrientation={resetOrientation}/>
      </div>
    </div>
  )
};

export default OrientationPanel
