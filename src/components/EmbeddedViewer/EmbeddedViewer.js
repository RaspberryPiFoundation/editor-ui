/* eslint-disable react-hooks/exhaustive-deps */
// import './EmbeddedViewer.css';
import '../Editor/Project/Project.scss'
import React from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Editor/Hooks/useProject'
import { useEmbeddedMode } from '../Editor/Hooks/useEmbeddedMode'
import PythonRunner from '../Editor/Runners/PythonRunner/PythonRunner'
import EmbeddedControls from './EmbeddedControls/EmbeddedControls'
import ExternalFiles from '../ExternalFiles/ExternalFiles';
import RunnerFactory from '../Editor/Runners/RunnerFactory';
import Output from '../Editor/Output/Output';
import RunnerControls from '../RunButton/RunnerControls';

const EmbeddedViewer = (props) => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const project = useSelector((state) => state.editor.project);
  const projectIdentifier = props.match.params.identifier;
  useProject('python', projectIdentifier);
  useEmbeddedMode(true);

  return projectLoaded === true ? (
    <>
      <Output />
      <RunnerControls />
    </>
  ) : null;
};

export default EmbeddedViewer;
