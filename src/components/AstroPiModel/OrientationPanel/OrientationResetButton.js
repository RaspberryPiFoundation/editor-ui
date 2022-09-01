import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import '../AstroPiModel.scss';
import { useCookies } from 'react-cookie';
import { ResetIcon } from '../../../Icons';

const OrientationResetButton = (props) => {

  const {resetOrientation} = props;
  const [cookies] = useCookies(['theme'])
  const isDarkMode = cookies.theme==="dark" || (!cookies.theme && window.matchMedia("(prefers-color-scheme:dark)").matches)

  return (
    <ResetIcon onClick={e => resetOrientation(e)}/>
  )
}

export default OrientationResetButton
