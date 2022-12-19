import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Hooks/useProject'
import { useEmbeddedMode } from '../Hooks/useEmbeddedMode'
import Project from '../Project/Project'
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DEFAULT_PROJECT_TYPE = 'python'

const ProjectComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
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
    if (loading === 'idle' && project.identifier) {
      history.push(`/${project.project_type}/${project.identifier}`)
    }
  }, [loading, project, history])


  return loading === 'success' ? (
    <Project />
  ) : loading === 'failed' ? (
    <p>{t('project.notFound')}</p>
  ) : <p>{t('project.loading')}</p>;
};

export default ProjectComponentLoader;
