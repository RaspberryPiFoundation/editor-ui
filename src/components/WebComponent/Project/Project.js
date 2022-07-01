import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useCookies } from 'react-cookie';
import Style from 'style-it';
import externalStyles from '../ExternalStyles.scss';
import internalStyles from '../WebComponent.scss';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import EditorPanel from '../../Editor/EditorPanel/EditorPanel'
import RunnerFactory from '../../Editor/Runners/RunnerFactory'
import RunnerControls from '../../RunButton/RunnerControls';
import { defaultMZCriteria } from '../../AstroPiModel/DefaultMZCriteria'
import Menu from '../../Menu/Menu';
import Sk from 'skulpt';
import store from '../../../app/store';

const Project = () => {
  const project = useSelector((state) => state.editor.project);
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered)
  const [cookies] = useCookies(['theme', 'fontSize'])
  const defaultTheme = window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"
  const [timeoutId, setTimeoutId] = React.useState(null);
  const webComponent = document.querySelector('editor-wc')
  const [codeHasRun, setCodeHasRun] = React.useState(false);

  useEffect(() => {
    setCodeHasRun(false)
    if(timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(
      function() {
        const customEvent = new CustomEvent("codeChanged", {
          bubbles: true,
          cancelable: false,
          composed: true
        });
        webComponent.dispatchEvent(customEvent)
      }, 2000);
    setTimeoutId(id);
  }, [project]);

  useEffect(() => {
    if (codeRunTriggered) {
      const runStartedEvent = new CustomEvent("runStarted", {
        bubbles: true,
        cancelable: false,
        composed: true
      });
      webComponent.dispatchEvent(runStartedEvent)
      setCodeHasRun(true)
    } else if (codeHasRun) {
      const state = store.getState();
      const mz_criteria = Sk.sense_hat ? Sk.sense_hat.mz_criteria : {...defaultMZCriteria}
      const runCompletedEvent = new CustomEvent("runCompleted", {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          isErrorFree: state.editor.error === "",
          ...mz_criteria
        }
      });
      webComponent.dispatchEvent(runCompletedEvent)
    }

  }, [codeRunTriggered] )

  return (
    <>
    <style>{externalStyles}</style>
    <Style>
      {internalStyles}
      <div id='wc' className = {`--${cookies.theme || defaultTheme} font-size-${cookies.fontSize || 'small'}`}>
        <div className='editor-controls'>
          <RunnerControls/>
        </div>
        <div className='proj-container'>
          <Menu />
          <div className='proj-editor-container'>
            <Tabs>
              <TabList>
                { project.components.map((file, i) => (
                    <Tab key={i}>{file.name}.{file.extension}</Tab>
                  )
                )}
              </TabList>
              { project.components.map((file,i) => (
                <TabPanel key={i}>
                  <EditorPanel fileName={file.name} extension={file.extension} />
                </TabPanel>
                )
              )}
            </Tabs>
          </div>

          <div className='proj-runner-container'>
            <RunnerFactory projectType={project.type} />
          </div>
        </div>
      </div>

    </Style>
    </>
  );
}

export default Project
