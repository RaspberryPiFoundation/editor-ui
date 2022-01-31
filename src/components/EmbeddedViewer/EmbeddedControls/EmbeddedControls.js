/* eslint-disable react-hooks/exhaustive-deps */
import './EmbeddedControls.css';
import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux'
// import { useProject } from '../Editor/Hooks/useProject'
// import PythonRunner from '../Editor/Runners/PythonRunner/PythonRunner'
import RunButton from '../../RunButton/RunButton'
// import { setEmbedded, triggerCodeRun } from '../Editor/EditorSlice'


const EmbeddedControls = (props) => {
    return  <div className = "embedded-controls">
                <RunButton buttonText="Run code" leftAlign={true} />
            </div>
}

export default EmbeddedControls;