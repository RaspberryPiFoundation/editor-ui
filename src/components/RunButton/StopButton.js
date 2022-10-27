import Button from '../Button/Button'
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { stopCodeRun, stopDraw } from '../Editor/EditorSlice'
import { useTranslation } from 'react-i18next'

const StopButton = (props) => {

  const codeRunStopped = useSelector((state) => state.editor.codeRunStopped);
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);
  const dispatch = useDispatch();
  const { t } = useTranslation()

  const onClickStop = () => {
    if (codeRunTriggered) {
      dispatch(stopCodeRun());
    }
    dispatch(stopDraw());
  }

  const stop = <Button className={"btn--stop"} onClickHandler={onClickStop} {...props} />
  const [button, setButton] = useState(stop)

  useEffect(() => {
    if (codeRunStopped) {
      const stopping = <Button buttonText={t('runButton.stopping')} disabled />
      setTimeout(() => { setButton(stopping) }, 100);
    }
  }, [codeRunStopped]);

  return (
    button
  )
};

export default StopButton;
