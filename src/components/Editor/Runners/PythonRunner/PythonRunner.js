/* eslint-disable react-hooks/exhaustive-deps */
import './PythonRunner.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Sk from "skulpt"
import { setError, codeRunHandled, stopDraw, setSenseHatEnabled, triggerDraw } from '../../EditorSlice'
import ErrorMessage from '../../ErrorMessage/ErrorMessage'

import store from '../../../../app/store'
import VisualOutputPane from './VisualOutputPane';
import OutputViewToggle from './OutputViewToggle';

const PythonRunner = () => {
  const projectCode = useSelector((state) => state.editor.project.components);
  const isSplitView = useSelector((state) => state.editor.isSplitView);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);
  const codeRunStopped = useSelector((state) => state.editor.codeRunStopped);
  const drawTriggered = useSelector((state) => state.editor.drawTriggered);
  const senseHatAlwaysEnabled = useSelector((state) => state.editor.senseHatAlwaysEnabled);
  const output = useRef();
  const dispatch = useDispatch();
  const { t } = useTranslation()

  const queryParams = new URLSearchParams(window.location.search)
  const [hasVisualOutput, setHasVisualOutput] = useState(queryParams.get('show_visual_tab') === 'true' || senseHatAlwaysEnabled)

  const getInput = () => {
    const pageInput = document.getElementById("input")
    const webComponentInput = document.querySelector('editor-wc') ? document.querySelector('editor-wc').shadowRoot.getElementById("input") : null;
    return pageInput || webComponentInput
  }

  useEffect(() => {
    if (codeRunTriggered) {
      runCode();
    }
  }, [codeRunTriggered]);

  useEffect(() => {
    if (codeRunStopped && getInput()) {
      const input = getInput()
      input.removeAttribute("id")
      input.removeAttribute("contentEditable")
      dispatch(setError(t('output.errors.interrupted')));
      dispatch(codeRunHandled())
    }
  }, [codeRunStopped]);

  useEffect(() => {
    if (!codeRunTriggered && !drawTriggered) {
      if (getInput()) {
        const input = getInput()
        input.removeAttribute("id")
        input.removeAttribute("contentEditable")
      }
    }
  },
  [drawTriggered, codeRunTriggered]
  )

  const externalLibraries = {
    "./pygal/__init__.js": {
      path: `${process.env.PUBLIC_URL}/pygal.js`,
      dependencies: [
        'https://cdnjs.cloudflare.com/ajax/libs/highcharts/6.0.2/highcharts.js',
        'https://cdnjs.cloudflare.com/ajax/libs/highcharts/6.0.2/js/highcharts-more.js'
      ],
    },
    "./p5/__init__.js": {
      path: `${process.env.PUBLIC_URL}/p5-shim.js`,
      dependencies: [
        'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.1/p5.js'
      ]
    },
    "./_internal_sense_hat/__init__.js": {
      path: `${process.env.PUBLIC_URL}/_internal_sense_hat.js`
    },
    "./sense_hat.py": {
      path: `${process.env.PUBLIC_URL}/sense_hat_blob.py`
    }
  };

  const visualLibraries =[
    "./pygal/__init__.js",
    "./p5/__init__.js",
    "./_internal_sense_hat/__init__.js",
    "src/builtin/turtle/__init__.js"
  ]

  const outf = (text) => {
    if (text !== "") {
      const node = output.current;
      const div = document.createElement("span")
      div.classList.add('pythonrunner-console-output-line')
      div.innerHTML = new Option(text).innerHTML;
      node.appendChild(div);
      node.scrollTop = node.scrollHeight;
    }
  }

  const builtinRead = (x) => {

    if (x==="./_internal_sense_hat/__init__.js") {
      dispatch(setSenseHatEnabled(true))
    }

    if(x === "./p5/__init__.js") {
      dispatch(triggerDraw())
    }

    if (visualLibraries.includes(x)) {
      setHasVisualOutput(true)
    }

    let localProjectFiles = projectCode.filter((component) => component.name !== 'main').map((component) => `./${component.name}.py`);

    if (localProjectFiles.includes(x)) {
      let filename = x.slice(2, -3);
      let component = projectCode.find((x) => x.name === filename);
      if (component) {
        return component.content;
      }
    }

    if (Sk.builtinFiles !== undefined && Sk.builtinFiles["files"][x] !== undefined) {
      return Sk.builtinFiles["files"][x];
    }

    if (externalLibraries[x]) {
      var externalLibraryInfo = externalLibraries[x];
      return Sk.misceval.promiseToSuspension(
        new Promise(function (resolve, reject) {
          // get the main skulpt extenstion
          var request = new XMLHttpRequest();
          request.open("GET", externalLibraryInfo.path);
          request.onload = function () {
            if (request.status === 200) {
              resolve(request.responseText);
            } else {
              reject("File not found: '" + x + "'");
            }
          };

          request.onerror = function () {
            reject("File not found: '" + x + "'");
          }

          request.send();
        }).then(function (code) {
          if (!code) {
            throw new Sk.builtin.ImportError("Failed to load remote module");
          }

          var promise;

          function mapUrlToPromise(path) {
            // If the script is already in the DOM don't add it again.
            const existingScriptElement = document.querySelector(`script[src="${path}"]`)
            if(!existingScriptElement) {
              return new Promise(function (resolve, _reject) {
                let scriptElement = document.createElement("script");
                scriptElement.type = "text/javascript";
                scriptElement.src = path;
                scriptElement.async = true
                scriptElement.onload = function () {
                  resolve(true);
                }

                document.body.appendChild(scriptElement);
              });
            }
          }

          if (externalLibraryInfo.loadDepsSynchronously) {
            promise = (externalLibraryInfo.dependencies || []).reduce((p, url) => {
              return p.then(() => mapUrlToPromise(url));
            }, Promise.resolve()); // initial
          } else {
            promise = Promise.all((externalLibraryInfo.dependencies || []).map(mapUrlToPromise));
          }

          return promise.then(function () {
            return code;
          }).catch(function () {
            throw new Sk.builtin.ImportError("Failed to load dependencies required");
          });
        })
      );
    }

    throw new Error("File not found: '" + x + "'");
  }

  const inputSpan = () => {
    const span = document.createElement("span");
    span.setAttribute("id", "input");
    span.setAttribute("spellCheck", "false");
    span.setAttribute("class", "pythonrunner-input");
    span.setAttribute("contentEditable", "true");
    return span
  }

  const inf = function () {
    if (Sk.sense_hat) {
      Sk.sense_hat.mz_criteria.noInputEvents = false
    }
    const outputPane = output.current;
    outputPane.appendChild(inputSpan());

    const input = getInput()
    input.focus();

    return new Promise(function (resolve, reject) {
      input.addEventListener("keydown", function removeInput(e) {
        if (e.key === "Enter") {
          input.removeEventListener(e.type, removeInput)
          // resolve the promise with the value of the input field
          const answer = input.innerText;
          input.removeAttribute("id");
          input.removeAttribute("contentEditable");
          input.innerText=answer+'\n';

          document.addEventListener("keyup", function storeInput(e) {
            if (e.key === "Enter") {
              document.removeEventListener(e.type, storeInput);
              resolve(answer);
            }
          })
        }
      })
    })
  }

  const runCode = () => {
    // clear previous output
    dispatch(setError(""));
    output.current.innerHTML = '';
    dispatch(setSenseHatEnabled(false))

    var prog = projectCode[0].content;

    Sk.configure({
      inputfun: inf,
      output: outf,
      read: builtinRead,
      debugging: true,
      inputTakesPrompt: true
    });

    var myPromise = Sk.misceval.asyncToPromise(() =>
        Sk.importMainWithBody("<stdin>", false, prog, true), {
          "*": () => {
            if (store.getState().editor.codeRunStopped) {
              throw new Error(t('output.errors.interrupted'));
            }
          }
        },
    ).catch(err => {
      const message = err.message || 
        `${err.toString()} of ${err.traceback[0].filename === "<stdin>.py" ? "main.py" : err.traceback[0].filename.slice(2)}`;
      dispatch(setError(message));
      dispatch(stopDraw());
      if (getInput()) {
        const input = getInput()
        input.removeAttribute("id")
        input.removeAttribute("contentEditable")
      }
    }).finally(()=>{
      dispatch(codeRunHandled());
    });
    myPromise.then(function (_mod) {
    });
  }

  function shiftFocusToInput(e) {
    if (document.getSelection().toString().length > 0) {
      return;
    }

    const inputBox = getInput();
    if (inputBox && e.target !== inputBox) {
      const input = getInput()
      const selection = window.getSelection();
      selection.removeAllRanges();

      if (input.innerText && input.innerText.length > 0){
        const range = document.createRange();
        range.setStart(input, 1);
        range.collapse(true);
        selection.addRange(range);
      }
      input.focus()
    }
  }

  return (
    <div className={`pythonrunner-container`}>
      { isSplitView ?
        <>
          {hasVisualOutput ? <div className='output-panel output-panel--visual'>
            <Tabs forceRenderTabPanel={true}>
              <TabList>
                <Tab key={0}>{t('output.visualOutput')}</Tab>
                {!isEmbedded ? <OutputViewToggle/> : null }
              </TabList>
              <TabPanel key={0} >
                <VisualOutputPane/>
              </TabPanel>
            </Tabs>
          </div> : null}
          <div className='output-panel output-panel--text'>
            <Tabs forceRenderTabPanel={true}>
              <TabList>
                <Tab key={0}>{t('output.textOutput')}</Tab>
                { hasVisualOutput || isEmbedded ? null : <OutputViewToggle /> }
              </TabList>
              <ErrorMessage />
              <TabPanel key={0}>
                <pre className="pythonrunner-console" onClick={shiftFocusToInput} ref={output}></pre>
              </TabPanel>
            </Tabs>
          </div>
      </>
      :
      <Tabs forceRenderTabPanel={true} defaultIndex={hasVisualOutput ? 0 : 1}>
        <TabList>
          {hasVisualOutput ?
            <Tab key={0}>{t('output.visualOutput')}</Tab> : null
          }
          <Tab key={1}>{t('output.textOutput')}</Tab>
          {!isEmbedded ? <OutputViewToggle/> : null }
        </TabList>
        <ErrorMessage />
        {hasVisualOutput ?
          <TabPanel key={0} >
            <VisualOutputPane/>
          </TabPanel> : null
        }
        <TabPanel key={1}>
          <pre className="pythonrunner-console" onClick={shiftFocusToInput} ref={output}></pre>
        </TabPanel>
      </Tabs>
      }
    </div>
  );
};

export default PythonRunner;
