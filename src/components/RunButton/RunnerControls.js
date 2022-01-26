import RunButton from "./RunButton";
import StopButton from "./StopButton";
import { useSelector } from 'react-redux';

const RunnerControls = (props) => {
    const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);
    if (codeRunTriggered) {
        return <StopButton buttonText="Stop Code"/>;
    }
    else {
        return <RunButton buttonText="Run Code"/>;
    }
}

export default RunnerControls;