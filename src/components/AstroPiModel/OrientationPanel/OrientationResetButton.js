import '../AstroPiModel.scss';

const OrientationResetButton = (props) => {

  const {resetOrientation} = props;

  return (
    <div id="close-sense-hat-orientation-controls">
      <button id="orientation-reset-btn" onClick={e => resetOrientation(e)}><i className="fa fa-refresh fa-2x"></i></button>
    </div>
  )
}

export default OrientationResetButton
