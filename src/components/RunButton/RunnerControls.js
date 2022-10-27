import React from 'react';
import RunButton from "./RunButton";
import StopButton from "./StopButton";
import { useSelector } from 'react-redux';
import { RunIcon, StopIcon } from '../../Icons';
import { useTranslation } from 'react-i18next';

import './RunnerControls.scss';

const RunnerControls = () => {
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);
  const drawTriggered = useSelector((state) => state.editor.drawTriggered);
  const { t } = useTranslation()

  return (
    <div className="runner-controls">
      {
        (codeRunTriggered || drawTriggered) ? <StopButton buttonText={<><StopIcon />{t('runButton.stop')}</>}/> : <RunButton buttonText={<><RunIcon />{t('runButton.run')}</>}/>
      }
    </div>
  )
}

export default RunnerControls;
