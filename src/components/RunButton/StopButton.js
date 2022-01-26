import Button from '../Button/Button'

import { useDispatch } from 'react-redux'
import { stopCodeRun } from '../Editor/EditorSlice'

const StopButton = (props) => {
  
  const dispatch = useDispatch();
  
  const onClickStop = () => {
    dispatch(stopCodeRun());
  }

  return (
    <Button onClickHandler={onClickStop} {...props} />
  )
};

export default StopButton;
