import RunButton from "./RunButton";
import StopButton from "./StopButton";
import { useSelector } from 'react-redux';

const RunnerControls = () => {
    const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);
    const drawTriggered = useSelector((state) => state.editor.drawTriggered);
    if (codeRunTriggered || drawTriggered) {
        return <StopButton buttonText="Stop Code"/>;
    }
    else {
        return <RunButton buttonText="Run Code"/>;
    }
}

export default RunnerControls;
