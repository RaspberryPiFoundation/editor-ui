import Button from '../Button/Button'
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { stopCodeRun, stopDraw } from '../Editor/EditorSlice'

const StopButton = (props) => {

  const codeRunStopped = useSelector((state) => state.editor.codeRunStopped);
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);
  const [timeoutId, setTimeoutId] = useState(null);
  const dispatch = useDispatch();

  const onClickStop = () => {
    if (codeRunTriggered) {
      dispatch(stopCodeRun());
    }
    dispatch(stopDraw());
  }

  const stop = <Button className={"btn--stop"} onClickHandler={onClickStop} {...props} />
  const [button, setButton] = useState(stop)

  useEffect(() => {
    const stopping = <Button buttonText="Stopping..." disabled />
    if(timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(
      function() {
        if (codeRunStopped) {
          setButton(stopping)
        }
      }, 100);
    setTimeoutId(id);
  }, [codeRunStopped]);
  
    return (
    button
    )
  };

export default StopButton;
