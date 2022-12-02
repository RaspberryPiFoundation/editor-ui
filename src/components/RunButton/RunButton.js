import Button from '../Button/Button'

import React from 'react';
import { useDispatch } from 'react-redux'
import { triggerCodeRun } from '../Editor/EditorSlice'

const RunButton = (props) => {
  const dispatch = useDispatch();

  const onClickRun = () => {
    dispatch(triggerCodeRun());
  }

  return (
    <Button className={"btn--primary btn--run"} onClickHandler={onClickRun} {...props} />
  )
};

export default RunButton;

