import React from 'react';
import '../AstroPiModel.scss';
import OrientationReading from './OrientationReading';
import OrientationResetButton from './OrientationResetButton';
import { ResetIcon } from '../../../Icons';

const OrientationPanel = (props) => {

  const {orientation, resetOrientation} = props

  return (
    <div className="sense-hat-model-orientation">
      <div className="sense-hat-model-orientation__values">
        <OrientationReading name="roll" value={orientation[0]} />
        <OrientationReading name="pitch" value={orientation[1]} />
        <OrientationReading name="yaw" value={orientation[2]} />
      </div>
      <div className="sense-hat-model-orientation__reset-btn" onClick={e => resetOrientation(e)}>
        <ResetIcon/>
      </div>
    </div>
  )
};

export default OrientationPanel
