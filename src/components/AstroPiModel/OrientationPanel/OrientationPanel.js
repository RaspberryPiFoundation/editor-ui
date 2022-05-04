import '../AstroPiModel.scss';
import OrientationReading from './OrientationReading';
import OrientationResetButton from './OrientationResetButton';

const OrientationPanel = () => {

  return (
    <div id="orientation-overlay" className="bottom 3d hide hide-for-snapshot">
      <div className="controls-container">
        <OrientationReading name="roll" />
        <OrientationReading name="pitch" />
        <OrientationReading name="yaw" />
      </div>
      <div id="imu-buttons-container">
        <OrientationResetButton />
      </div>
    </div>
  )
};

export default OrientationPanel
