import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import '../AstroPiModel.scss';
import { useSelector } from 'react-redux';

const OrientationResetButton = (props) => {

  const {resetOrientation} = props;
  const isDarkMode = useSelector((state) => state.editor.darkModeEnabled)

  return (
    <div id="close-sense-hat-orientation-controls">
      <button id="orientation-reset-btn" onClick={e => resetOrientation(e)}><FontAwesomeIcon icon={faRefresh} size="2x" color={isDarkMode?"white":"black"}/></button>
    </div>
  )
}

export default OrientationResetButton
