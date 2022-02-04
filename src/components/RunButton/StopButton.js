import Button from '../Button/Button'

import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux'
import { stopCodeRun } from '../Editor/EditorSlice'

const StopButton = (props) => {
  
  const codeRunStopped = useSelector((state) => state.editor.codeRunStopped);
  const dispatch = useDispatch();
  
  const onClickStop = () => {
    dispatch(stopCodeRun());
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
