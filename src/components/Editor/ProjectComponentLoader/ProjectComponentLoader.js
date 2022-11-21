import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Hooks/useProject'
import { useEmbeddedMode } from '../Hooks/useEmbeddedMode'
import Project from '../Project/Project'
import { useHistory } from 'react-router-dom';

const DEFAULT_PROJECT_TYPE = 'python'

const ProjectComponentLoader = (props) => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const initialProjectIdentifier = props.match.params.identifier;
  const initialProjectType = props.match.params.projectType || DEFAULT_PROJECT_TYPE;
  const embedded = props.embedded || false;

  useEmbeddedMode(embedded);
  console.log(`using the ${initialProjectType} project ${initialProjectIdentifier}`)
  useProject(initialProjectType, initialProjectIdentifier);

  const project = useSelector((state) => state.editor.project)
  const history = useHistory()

  useEffect(() => {
    if (projectLoaded === 'idle' && project.identifier) {
      console.log(project.identifier)
      history.push(`/${project.project_type}/${project.identifier}`)
    }
  }, [projectLoaded])


  return projectLoaded === 'success' ? (
    <Project />
  ) : projectLoaded === 'failed' ? (
    <p>Oops we couldn't find that project</p>
  ) : <p>Loading</p>;
};

export default ProjectComponentLoader;
