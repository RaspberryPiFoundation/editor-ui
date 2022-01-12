import { triggerCodeRun } from '../EditorSlice'
import { useDispatch } from 'react-redux'

// const dispatch = useDispatch();

const runCodeFunction = () => {
    console.log("Key press registered");
    triggerCodeRun();
  };

export const runCodeKeymap = {
    key: 'Ctrl-Enter',
    run: runCodeFunction(),
  };
