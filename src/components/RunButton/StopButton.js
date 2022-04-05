import Button from '../Button/Button'
import React from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { stopCodeRun, stopDraw } from '../Editor/EditorSlice'

const StopButton = (props) => {

  const codeRunStopped = useSelector((state) => state.editor.codeRunStopped);
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);
  const dispatch = useDispatch();

  const onClickStop = () => {
    if (codeRunTriggered) {
      dispatch(stopCodeRun());
    }
    dispatch(stopDraw());
  }

  if (codeRunStopped) {
    return (
      <Button buttonText="Stopping..." disabled="true"/>
    )
  } else {
    return (
    <Button onClickHandler={onClickStop} {...props} />
    )
  }
};

export default StopButton;
