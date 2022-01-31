import { triggerCodeRun } from '../EditorSlice'
import { useDispatch } from 'react-redux'


const RunCodeFunction = () => {
    const dispatch = useDispatch();
    console.log("Key press registered");
    dispatch(triggerCodeRun());
  };

  export const runCodeKeymap = {
    key: 'Ctrl-Enter',
    run: RunCodeFunction,
  };