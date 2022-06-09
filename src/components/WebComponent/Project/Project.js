import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useCookies } from 'react-cookie';
import Style from 'style-it';
import spacing from '../../../../node_modules/@rpf/sauce/scss/properties/_spacing.scss'
import fontSize from '../../../../node_modules/@rpf/sauce/scss/properties/_font-size.scss'
import lineHeight from '../../../../node_modules/@rpf/sauce/scss/properties/_line-height.scss'
import styles from '../WebComponent.scss';
import projectStyles from '../../Editor/Project/Project.scss'
import tabStyles from 'react-tabs/style/react-tabs.css';
import buttonStyles from '../../Button/Button.css'
import themeToggleStyles from '../../ThemeToggle/ThemeToggle.scss'
import fontSizeSelectorStyles from '../../Editor/FontSizeSelector/FontSizeSelector.scss';
import editorStyles from '../../Editor/EditorPanel/EditorPanel.css';
import runnerStyles from '../../Editor/Runners/PythonRunner/PythonRunner.css';
import errorStyles from '../../Editor/ErrorMessage/ErrorMessage.css'
import astroPiStyles from '../../AstroPiModel/AstroPiModel.scss'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import EditorPanel from '../../Editor/EditorPanel/EditorPanel'
import RunnerFactory from '../../Editor/Runners/RunnerFactory'
import RunnerControls from '../../RunButton/RunnerControls';
import ThemeToggle from '../../ThemeToggle/ThemeToggle';
import FontSizeSelector from '../../Editor/FontSizeSelector/FontSizeSelector';
import fontAwesomeStyles from '@fortawesome/fontawesome-svg-core/styles.css';
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
    if (Sk.sense_hat) {
      Sk.sense_hat.usedLEDs = null
      Sk.sense_hat.readHumidity = null
      Sk.sense_hat.readPressure = null
      Sk.sense_hat.readTemperature = null
    }
    if(timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(
      function() {
        const customEvent = new CustomEvent("custom", {
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
      const runCompletedEvent = new CustomEvent("runCompleted", {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          isErrorFree: state.editor.error === "",
          usedLEDs: Sk.sense_hat && Sk.sense_hat.usedLEDs ? true : false,
          readHumidity: Sk.sense_hat && Sk.sense_hat.readHumidity ? true : false,
          readPressure: Sk.sense_hat && Sk.sense_hat.readPressure ? true : false,
          readTemperature: Sk.sense_hat && Sk.sense_hat.readTemperature ? true : false,
        }
      });
      webComponent.dispatchEvent(runCompletedEvent)
    }

  }, [codeRunTriggered] )

  return (
    <>
    <style>{spacing.toString()}</style>
    <style>{fontSize.toString()}</style>
    <style>{lineHeight.toString()}</style>
    <style>{":host, "+fontAwesomeStyles.toString()}</style>
    <Style>
      { 
        styles.toString() + 
        tabStyles.toString() + 
        projectStyles.toString() + 
        buttonStyles.toString() +
        themeToggleStyles.toString() +
        fontSizeSelectorStyles.toString() +
        editorStyles.toString() +
        runnerStyles.toString()+
        errorStyles.toString()+
        astroPiStyles.toString()
      }
      <div id='wc' className = {`--${cookies.theme || defaultTheme} font-size-${cookies.fontSize || 'small'}`}>
        <div className='editor-controls'>
          <RunnerControls/>
          <ThemeToggle />
          <FontSizeSelector />
        </div>
        <div className='proj-container'>
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
