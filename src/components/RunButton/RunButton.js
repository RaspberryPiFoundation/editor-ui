import Button from '../Button/Button'

import React from 'react';
import { useDispatch } from 'react-redux'
import { triggerCodeRun } from '../Editor/EditorSlice'

const RunButton = (props) => {
  const dispatch = useDispatch();

  const onClickRun = () => {
    window.plausible('Run button')
    dispatch(triggerCodeRun());
  }

  return (
    <Button className={"btn--run"} onClickHandler={onClickRun} {...props} />
  )
};

export default RunButton;

