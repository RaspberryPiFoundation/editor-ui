/* eslint-disable react-hooks/exhaustive-deps */
import './PythonRunner.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Sk from "skulpt"
import { setError, codeRunHandled, stopDraw } from '../../EditorSlice'
import ErrorMessage from '../../ErrorMessage/ErrorMessage'

import store from '../../../../app/store'
import AstroPiModel from '../../../AstroPiModel/AstroPiModel';

const PythonRunner = () => {
  const projectCode = useSelector((state) => state.editor.project.components);
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);
  const codeRunStopped = useSelector((state) => state.editor.codeRunStopped);
  const drawTriggered = useSelector((state) => state.editor.drawTriggered);
  const senseHatAlwaysEnabled = useSelector((state) => state.editor.senseHatAlwaysEnabled);
  const outputCanvas = useRef();
  const output = useRef();
  const pygalOutput = useRef();
  const p5Output = useRef();
  const dispatch = useDispatch();

  const queryParams = new URLSearchParams(window.location.search)

  const [senseHatEnabled, setSenseHatEnabled] = useState(false);

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
      dispatch(setError("Execution interrupted"));
      dispatch(codeRunHandled())
    }
  }, [codeRunStopped]);

  useEffect(() => {
    if (!drawTriggered && p5Output.current && p5Output.current.innerHTML !== '') {
      Sk.p5.stop();
      if (getInput()) {
        const input = getInput()
        input.removeAttribute("id")
        input.removeAttribute("contentEditable")
      }
    }
  },
  [drawTriggered]
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
      setSenseHatEnabled(true)
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
    outputCanvas.current.innerHTML = '';
    output.current.innerHTML = '';
    pygalOutput.current.innerHTML = '';
    p5Output.current.innerHTML = '';

    setSenseHatEnabled(false)

    var prog = projectCode[0].content;

    Sk.configure({
      inputfun: inf,
      output: outf,
      read: builtinRead,
      debugging: true,
      inputTakesPrompt: true
    });

    Sk.p5 = {}
    Sk.p5.sketch = "p5Sketch";
    Sk.p5.assets = projectImages;

    (Sk.pygal || (Sk.pygal = {})).outputCanvas = pygalOutput.current;

    (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'outputCanvas';

    Sk.TurtleGraphics.assets = Object.assign({}, ...projectImages.map((image) => ({[`${image.name}.${image.extension}`]: image.url})))

    var myPromise = Sk.misceval.asyncToPromise(() =>
        Sk.importMainWithBody("<stdin>", false, prog, true), {
          "*": () => {
            if (store.getState().editor.codeRunStopped) {
              throw new Error("Execution interrupted");
            }
          }
        },
    ).catch(err => {
      const message = err.message || err.toString();
      console.log(message)
      dispatch(setError(message));
      if (getInput()) {
        const input = getInput()
        input.removeAttribute("id")
        input.removeAttribute("contentEditable")
      }
    }).finally(()=>{
      dispatch(codeRunHandled());
      if (p5Output.current.innerHTML === '') {
        dispatch(stopDraw());
      }
    }
    );
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
    <div className="pythonrunner-container">
      { isEmbedded ?
        <>
          {queryParams.get('show_visual_tab') === 'false' ? null : 
            <Tabs forceRenderTabPanel={true}>
              <TabList>
                <Tab key={0}>Visual Output</Tab>
              </TabList>
              <TabPanel key={0}>
                <div className='visual-output'>
                  <div id='p5Sketch' ref={p5Output} />
                  <div id='pygalOutput' ref={pygalOutput} />
                  <div className="pythonrunner-canvas-container">
                    <div id='outputCanvas' ref={outputCanvas} className="pythonrunner-graphic" />
                  </div>
                  {senseHatEnabled || senseHatAlwaysEnabled ?<AstroPiModel/>:null}
                </div>
              </TabPanel>
            </Tabs>
          }
          <Tabs forceRenderTabPanel={true}>
          <TabList>
            <Tab key={0}>Text Output</Tab>
          </TabList>
          <ErrorMessage />
          <TabPanel key={0}>
            <pre className="pythonrunner-console" onClick={shiftFocusToInput} ref={output}></pre>
          </TabPanel>
        </Tabs>
      </>
      :
        <Tabs forceRenderTabPanel={true} defaultIndex={senseHatAlwaysEnabled ? 0 : 1}>
          <TabList>
            <Tab key={0}>Visual Output</Tab>
            <Tab key={1}>Text Output</Tab>
          </TabList>
          <ErrorMessage />
          <TabPanel key={0}>
            <div className='visual-output'>
              <div id='p5Sketch' ref={p5Output} />
              <div id='pygalOutput' ref={pygalOutput} />
              <div className="pythonrunner-canvas-container">
                <div id='outputCanvas' ref={outputCanvas} className="pythonrunner-graphic" />
              </div>
              {senseHatEnabled || senseHatAlwaysEnabled ?<AstroPiModel/>:null}
            </div>
          </TabPanel>
          <TabPanel key={1}>
            <pre className="pythonrunner-console" onClick={shiftFocusToInput} ref={output}></pre>
          </TabPanel>
        </Tabs>
      }
    </div>
  );
};

export default PythonRunner;
