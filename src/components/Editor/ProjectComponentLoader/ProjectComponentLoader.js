import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Hooks/useProject'
import { useEmbeddedMode } from '../Hooks/useEmbeddedMode'
import Project from '../Project/Project'
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DEFAULT_PROJECT_TYPE = 'python'

const ProjectComponentLoader = (props) => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const initialProjectIdentifier = props.match.params.identifier;
  const initialProjectType = props.match.params.projectType || DEFAULT_PROJECT_TYPE;
  const embedded = props.embedded || false;
  const user = useSelector((state) => state.auth.user)
  const accessToken = user ? user.access_token : null

  useEmbeddedMode(embedded);
  useProject(initialProjectType, initialProjectIdentifier, accessToken);

  const project = useSelector((state) => state.editor.project)
  const history = useHistory()
  const { t } = useTranslation()

  useEffect(() => {
    if (projectLoaded === 'idle' && project.identifier) {
      history.push(`/${project.project_type}/${project.identifier}`)
    }
    if (projectLoaded === 'failed') {
      history.push('/')
    }
  }, [projectLoaded, project, history])


  return projectLoaded === 'success' ? (
    <Project />
  ) : projectLoaded === 'pending' ? (
    <p>{t('project.loading')}</p>
  ) : null
};

export default ProjectComponentLoader;
