import Button from '../Button/Button'

import { useDispatch } from 'react-redux'
import { setSenseHatEnabled, triggerCodeRun, triggerDraw } from '../Editor/EditorSlice'

const RunButton = (props) => {
  // const { buttonText, leftAlign } = props;
  const dispatch = useDispatch();

  const onClickRun = () => {
    dispatch(setSenseHatEnabled(false))
    dispatch(triggerCodeRun());
    dispatch(triggerDraw());
  }

  return (
    <Button onClickHandler={onClickRun} {...props} />
  )
};

export default RunButton;

