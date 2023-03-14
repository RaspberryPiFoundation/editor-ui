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
import i18n from 'i18next';
import LocaleWrapper from '../LocaleWrapper/LocaleWrapper';

const EmbeddedViewer = () => {
  const loading = useSelector((state) => state.editor.loading);
  const { identifier } = useParams();

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
