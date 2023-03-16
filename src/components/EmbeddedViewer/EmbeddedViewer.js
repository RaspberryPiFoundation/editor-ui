/* eslint-disable react-hooks/exhaustive-deps */
import './EmbeddedViewer.scss';
import '../Editor/Project/Project.scss'
import React from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Editor/Hooks/useProject'
import { useEmbeddedMode } from '../Editor/Hooks/useEmbeddedMode'
import Output from '../Editor/Output/Output';
import RunnerControls from '../RunButton/RunnerControls';
import { useParams } from 'react-router-dom';
import LocaleWrapper from '../LocaleWrapper/LocaleWrapper';
import { useTranslation } from 'react-i18next';

const EmbeddedViewer = () => {
  const loading = useSelector((state) => state.editor.loading);
  const { identifier } = useParams();
  const { i18n } = useTranslation()

  useProject(identifier, i18n.language);
  useEmbeddedMode(true);

  window.addEventListener(
    "CookiebotOnDialogInit",
    () => {
      if (window.Cookiebot.consent.stamp === '0') {
        window.Cookiebot.submitCustomConsent(!1, !1, !1);
        window.addEventListener(
          "CookiebotOnLoad",
          () => {
            window.Cookiebot.deleteConsentCookie();
          },
          false
        );
      }
    },
    false
  );

  return loading === 'success' ? (
    <div className='embedded-viewer'>
      <LocaleWrapper>
        <Output />
        <RunnerControls />
      </LocaleWrapper>
    </div>
  ) : null;
};

export default EmbeddedViewer;
