import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Hooks/useProject'
import { useEmbeddedMode } from '../Hooks/useEmbeddedMode'
import Project from '../Project/Project'
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import LocaleWrapper from '../../LocaleWrapper/LocaleWrapper';

const ProjectComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const { identifier } = useParams()
  const embedded = props.embedded || false;
  const user = useSelector((state) => state.auth.user)
  const accessToken = user ? user.access_token : null

  useEmbeddedMode(embedded);
  useProject(identifier, i18n.language, accessToken);

  const project = useSelector((state) => state.editor.project)
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (loading === 'idle' && project.identifier) {
      navigate(`/${i18n.language}/projects/${project.identifier}`)
    }
    if (loading === 'failed') {
      navigate('/')
    }
  }, [loading, project, navigate])

  return (
    <LocaleWrapper>
      {
        loading === 'success' ? (
          <Project />
        ) : loading === 'pending' ? (
          <p>{t('project.loading')}</p>
        ) : null
      }
    </LocaleWrapper>
  )
};

export default ProjectComponentLoader;
