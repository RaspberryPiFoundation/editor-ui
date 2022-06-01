import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import '../AstroPiModel.scss';
import { useCookies } from 'react-cookie';

const OrientationResetButton = (props) => {

  const {resetOrientation} = props;
  const [cookies] = useCookies(['theme'])

  return (
    <div id="close-sense-hat-orientation-controls">
      <button id="orientation-reset-btn" onClick={e => resetOrientation(e)}><FontAwesomeIcon icon={faRefresh} color={cookies.theme==='dark'?"white":"black"}/></button>
    </div>
  )
}

export default OrientationResetButton
