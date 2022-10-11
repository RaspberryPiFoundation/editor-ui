/* eslint-disable react-hooks/exhaustive-deps */
import './EmbeddedViewer.scss';
import '../Editor/Project/Project.scss'
import React from 'react';
import { useSelector } from 'react-redux'
import { useProject } from '../Editor/Hooks/useProject'
import { useEmbeddedMode } from '../Editor/Hooks/useEmbeddedMode'
import Output from '../Editor/Output/Output';
import RunnerControls from '../RunButton/RunnerControls';

const EmbeddedViewer = (props) => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const projectIdentifier = props.match.params.identifier;
  useProject('python', projectIdentifier);
  useEmbeddedMode(true);

  window.addEventListener(
      "CookiebotOnDialogInit",
      function (e) {
        console.log('firing event to bypass cookie banner')
          if (window.Cookiebot.consent.stamp == 0) {
            console.log('setting custom consent')
              window.Cookiebot.submitCustomConsent(!0, !0, !0);
              window.addEventListener(
                  "CookiebotOnLoad",
                  function (e) {
                      window.Cookiebot.deleteConsentCookie();
                  },
                  false
              );
          }
      },
      false
  );

  return projectLoaded === true ? (
    <div className='embedded-viewer'>
      <Output />
      <RunnerControls />
    </div>
  ) : null;
};

export default EmbeddedViewer;
