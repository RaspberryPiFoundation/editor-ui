import RunButton from "./RunButton";
import StopButton from "./StopButton";
import { useSelector } from 'react-redux';
import { useEffect } from "react";

const RunnerControls = (props) => {
    const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);
    // const codeRunTriggered = false;
    // var button = <RunButton buttonText="Run Code"/>;
    // useEffect(() => {
    //     if (codeRunTriggered) {
    //         button = <StopButton buttonText="Stop Code"/>;
    //     }
    //     else {
    //         button = <RunButton buttonText="Run Code"/>;
    //     }
    //   }, [codeRunTriggered]);
    if (codeRunTriggered) {
        return <StopButton buttonText="Stop Code"/>;
    }
    else {
        return <RunButton buttonText="Run Code"/>;
    }
    // return button;


}

export default RunnerControls;