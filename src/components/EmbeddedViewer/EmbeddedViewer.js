/* eslint-disable react-hooks/exhaustive-deps */
import './EmbeddedViewer.css';
import React from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Editor/Hooks/useProject'
import { useEmbeddedMode } from '../Editor/Hooks/useEmbeddedMode'
import PythonRunner from '../Editor/Runners/PythonRunner/PythonRunner'
import EmbeddedControls from './EmbeddedControls/EmbeddedControls'

const EmbeddedViewer = (props) => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const projectIdentifier = props.match.params.identifier;
  useProject('python', projectIdentifier);
  useEmbeddedMode(true);

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
