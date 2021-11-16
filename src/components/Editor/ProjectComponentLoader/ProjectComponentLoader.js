import React from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Hooks/useProject'
import Project from '../Project/Project'

const DEFAULT_PROJECT_TYPE = 'python'

const ProjectComponentLoader = (props) => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const projectIdentifier = props.match.params.identifier;
  const projectType = props.match.params.projectType || DEFAULT_PROJECT_TYPE;
  useProject(projectType, projectIdentifier);

  return projectLoaded === true ? (
    <>
      <Project />
    </>
  ) : <p>Loading</p>;
};

export default ProjectComponentLoader;
