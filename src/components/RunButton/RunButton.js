import Button from '../Button/Button'

import { useDispatch } from 'react-redux'
import { triggerCodeRun, triggerDraw } from '../Editor/EditorSlice'

const RunButton = (props) => {
  const dispatch = useDispatch();

  const onClickRun = () => {
    dispatch(triggerCodeRun());
    dispatch(triggerDraw());
  }

  return (
    <Button onClickHandler={onClickRun} {...props} />
  )
};

export default RunButton;

