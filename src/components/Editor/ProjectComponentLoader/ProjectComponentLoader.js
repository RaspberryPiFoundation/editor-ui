import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Hooks/useProject'
import { useEmbeddedMode } from '../Hooks/useEmbeddedMode'
import Project from '../Project/Project'
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProjectComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const { locale, identifier } = useParams()
  const embedded = props.embedded || false;
  const user = useSelector((state) => state.auth.user)
  const accessToken = user ? user.access_token : null

  const project = useSelector((state) => state.editor.project)
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language

  console.log('rendering project component loader with locale', i18n.language, loading)
  useEmbeddedMode(embedded);
  useProject(identifier, locale, accessToken);

  useEffect(() => {
    if (loading === 'idle' && project.identifier) {
      navigate(`/${currentLanguage}/projects/${project.identifier}`)
    }
    if (loading === 'failed') {
      navigate('/')
    }
  }, [loading, project, currentLanguage, navigate])

  return (
    loading === 'success' ? (
      <Project />
    ) : loading === 'pending' ? (
      <p>{t('project.loading')}</p>
    ) : null
  )
};

export default ProjectComponentLoader;
