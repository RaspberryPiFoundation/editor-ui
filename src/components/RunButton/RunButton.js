import Button from '../Button/Button'

import { useDispatch } from 'react-redux'
import { triggerCodeRun } from '../Editor/EditorSlice'

const RunButton = (props) => {
  // const { buttonText, leftAlign } = props;
  const dispatch = useDispatch();

  const onClickRun = () => {
    dispatch(triggerCodeRun());
  }

  return (
    <Button onClickHandler={onClickRun} {...props} />
  )
};

export default RunButton;

