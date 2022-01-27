import Button from '../Button/Button'

import { useDispatch } from 'react-redux'
import { codeRunHandled, setError, stopCodeRun } from '../Editor/EditorSlice'

function StopButton(props) {
  
  const dispatch = useDispatch();
  
  const onClickStop = () => {
    dispatch(stopCodeRun());

    if (document.getElementById("input")) {
      const input = document.getElementById("input")
      input.removeAttribute("id")
      input.removeAttribute("contentEditable")
      dispatch(setError("Execution interrupted"));
      dispatch(codeRunHandled())
    }
  }

  return (
    <Button onClickHandler={onClickStop} {...props} />
  )
};

export {StopButton};
