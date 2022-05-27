import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Style from 'style-it';
import spacing from '../../../../node_modules/@rpf/sauce/scss/properties/_spacing.scss'
import styles from '../WebComponent.scss';
import projectStyles from '../../Editor/Project/Project.css'
import tabStyles from 'react-tabs/style/react-tabs.css';
import buttonStyles from '../../Button/Button.css'
import themeToggleStyles from '../../ThemeToggle/ThemeToggle.scss'
import runnerStyles from '../../Editor/Runners/PythonRunner/PythonRunner.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import EditorPanel from '../../Editor/EditorPanel/EditorPanel'
import RunnerFactory from '../../Editor/Runners/RunnerFactory'
import RunnerControls from '../../RunButton/RunnerControls';
import ThemeToggle from '../../ThemeToggle/ThemeToggle';

const Project = () => {
  const project = useSelector((state) => state.editor.project);
  const isDarkMode = useSelector((state) => state.editor.darkModeEnabled)
  const [timeoutId, setTimeoutId] = React.useState(null);

  useEffect(() => {
    if(timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(
      function() {
        const customEvent = new CustomEvent("custom", {
          bubbles: true,
          cancelable: false,
          composed: true
        });

        const webComponent = document.querySelector('editor-wc')
        webComponent.dispatchEvent(customEvent)
      }, 2000);
    setTimeoutId(id);
  }, [project]);

  return (
    <>
    <style>{":host, "+spacing.toString()}</style>
    <Style>
      { 
        styles.toString() + 
        tabStyles.toString() + 
        projectStyles.toString() + 
        buttonStyles.toString() +
        themeToggleStyles.toString() +
        runnerStyles.toString()
      }
      <div id='wc' className = {isDarkMode ? '--dark' : '--light'}>
        <div className='editor-controls'>
          <RunnerControls/>
          <ThemeToggle />
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
