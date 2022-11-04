import React from 'react';
import { useTranslation } from 'react-i18next';
import '../AstroPiModel.scss';
import OrientationReading from './OrientationReading';
import OrientationResetButton from './OrientationResetButton';

const OrientationPanel = (props) => {

  const { t } = useTranslation()
  const {orientation, resetOrientation} = props

  return (
    <div className="sense-hat-model-orientation">
      <div className="sense-hat-model-orientation__spacing"></div>
      <div className="sense-hat-model-orientation__values">
        <OrientationReading name={t('output.senseHat.model.roll')} value={orientation[0]} />
        <OrientationReading name={t('output.senseHat.model.pitch')} value={orientation[1]} />
        <OrientationReading name={t('output.senseHat.model.yaw')} value={orientation[2]} />
      </div>
      <div className="sense-hat-model-orientation__reset-btn">
        <OrientationResetButton resetOrientation={resetOrientation}/>
      </div>
    </div>
  )
};

export default OrientationPanel
