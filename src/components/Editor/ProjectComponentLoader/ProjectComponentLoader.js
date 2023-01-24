import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Hooks/useProject'
import { useEmbeddedMode } from '../Hooks/useEmbeddedMode'
import Project from '../Project/Project'
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DEFAULT_PROJECT_TYPE = 'python'

const ProjectComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const { identifier } = useParams()
  const embedded = props.embedded || false;
  const user = useSelector((state) => state.auth.user)
  const accessToken = user ? user.access_token : null
  const project = useSelector((state) => state.editor.project)

  useEmbeddedMode(embedded);
  useProject(project.project_type || DEFAULT_PROJECT_TYPE, identifier, accessToken);

  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (loading === 'idle' && project.identifier) {
      navigate(`/projects/${project.identifier}`)
    }
    if (loading === 'failed') {
      navigate('/')
    }
  }, [loading, project, navigate])

  return loading === 'success' ? (
    <Project />
  ) : loading === 'pending' ? (
    <p>{t('project.loading')}</p>
  ) : null
};

export default ProjectComponentLoader;
