import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Hooks/useProject'
import { useEmbeddedMode } from '../Hooks/useEmbeddedMode'
import Project from '../Project/Project'
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import i18next from 'i18next';

const ProjectComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const { identifier, locale } = useParams()
  const embedded = props.embedded || false;
  const user = useSelector((state) => state.auth.user)
  const accessToken = user ? user.access_token : null

  // i18n.changeLanguage(locale, (err, t) => {
  //   if (err) return console.log('something went wrong loading', err);
  //   t('key'); // -> same as i18next.t
  // });
  // console.log('changed language to', locale)

  useEmbeddedMode(embedded);
  useProject(identifier, locale, accessToken);

  const project = useSelector((state) => state.editor.project)
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (loading === 'idle' && project.identifier) {
      navigate(`/${locale}/projects/${project.identifier}`)
    }
    if (loading === 'failed') {
      navigate('/')
    }
  }, [loading, locale, project, navigate])

  return loading === 'success' ? (
    <Project />
  ) : loading === 'pending' ? (
    <p>{t('project.loading')}</p>
  ) : null
};

export default ProjectComponentLoader;
