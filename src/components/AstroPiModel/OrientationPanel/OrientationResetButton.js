import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import '../AstroPiModel.scss';

const OrientationResetButton = (props) => {

  const {resetOrientation} = props;

  return (
    <div id="close-sense-hat-orientation-controls">
      <button id="orientation-reset-btn" onClick={e => resetOrientation(e)}><FontAwesomeIcon icon={faRefresh} size="2x"/></button>
    </div>
  )
}

export default OrientationResetButton
