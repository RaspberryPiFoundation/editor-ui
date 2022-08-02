import React from 'react';
import RunButton from "./RunButton";
import StopButton from "./StopButton";
import { useSelector } from 'react-redux';
import { RunIcon } from '../../Icons';

const RunnerControls = () => {
    const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);
    const drawTriggered = useSelector((state) => state.editor.drawTriggered);
    if (codeRunTriggered || drawTriggered) {
        return <StopButton buttonText="Stop Code"/>;
    }
    else {
        return <RunButton buttonText={<><RunIcon />Run</>}/>;
    }
}

export default RunnerControls;
