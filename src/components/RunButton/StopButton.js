import Button from '../Button/Button'

import { useDispatch } from 'react-redux'
import { codeRunHandled, stopCodeRun } from '../Editor/EditorSlice'

const StopButton = (props) => {
  
  const dispatch = useDispatch();
  
  const onClickStop = () => {
    dispatch(stopCodeRun());

    if (document.getElementById("input")) {
      const input = document.getElementById("input")
      input.removeAttribute("id")
      input.removeAttribute("contentEditable")
      dispatch(codeRunHandled())
    }
  }

  return (
    <Button onClickHandler={onClickStop} {...props} />
  )
};

export default StopButton;
