/* eslint-disable react-hooks/exhaustive-deps */
import './EmbeddedViewer.css';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useProject } from '../Editor/Hooks/useProject'
import PythonRunner from '../Editor/Runners/PythonRunner/PythonRunner'
import EmbeddedControls from './EmbeddedControls/EmbeddedControls'
import { setEmbedded } from '../Editor/EditorSlice'

const EmbeddedViewer = (props) => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const projectIdentifier = props.match.params.identifier;
  const dispatch = useDispatch();
  useProject('python', projectIdentifier);

  useEffect(() => {
    dispatch(setEmbedded());
  }, []);

  return projectLoaded === true ? (
    <>
      <div className='embedded-container' >
        <EmbeddedControls />
        <div>
          <PythonRunner />
        </div>
      </div>
    </>
  ) : <p>Loading</p>;
};

export default EmbeddedViewer;
