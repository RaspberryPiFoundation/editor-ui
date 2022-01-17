/* eslint-disable react-hooks/exhaustive-deps */
import './PythonRunner.css';
import React, { useEffect, useRef  } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Sk from "skulpt"
import { setError, codeRunHandled, stopCodeRun } from '../../EditorSlice'
import ErrorMessage from '../../ErrorMessage/ErrorMessage'

const PythonRunner = () => {
  const projectCode = useSelector((state) => state.editor.project.components);
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);
  const codeRunStopped = useSelector((state) => state.editor.codeRunStopped);
  const outputCanvas = useRef();
  const output = useRef();
  const domOutput = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (codeRunTriggered) {
      runCode();
      dispatch(codeRunHandled());
    }
  }, [codeRunTriggered]);

  useEffect(() => {
    if (codeRunStopped) {
      stopCode();
      dispatch(codeRunHandled());
    }
  }, [codeRunStopped]);

  const externalLibraries = {
    "./pygal/__init__.js": {
      path: process.env.PUBLIC_URL + '/pygal.js',
      dependencies : [
        'https://cdnjs.cloudflare.com/ajax/libs/highcharts/6.0.2/highcharts.js',
        'https://cdnjs.cloudflare.com/ajax/libs/highcharts/6.0.2/js/highcharts-more.js'
      ],
    }
  };

  Sk.domOutput = function(html) {
    document.querySelector('#mycanvas').insertAdjacentHTML("beforeend",html)
    return document.querySelector('#mycanvas').children[0];
  };

  const outf = (text) => {
    const node = output.current;
    node.innerText = node.innerText + text + "\n";
  }

  // const builtinRead = (file) => {
  //   console.log("Attempting file: " + Sk.ffi.remapToJs(file));
  //
  //   if (externalLibs[file] !== undefined) {
  //     return Sk.misceval.promiseToSuspension(
  //       fetch(externalLibs[file]).then(
  //         function (resp){ return resp.text(); }
  //       ));
  //   }
  //
  //   if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[file] === undefined) {
  //     throw new Error("File not found: '" + file + "'");
  //   }
  //
  //   return Sk.builtinFiles.files[file];
  // }

  const builtinRead= (x) => {
    // TODO: memoize this?
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
            new Promise(function(resolve, reject) {
                // get the main skulpt extenstion
                var request = new XMLHttpRequest();
                request.open("GET", externalLibraryInfo.path);
                request.onload = function() {
                    if (request.status === 200) {
                        resolve(request.responseText);
                    } else {
                        reject("File not found: '" + x + "'");
                    }
                };

                request.onerror = function() {
                    reject("File not found: '" + x + "'");
                }

                request.send();
            }).then(function (code) {
                if (!code) {
                    throw new Sk.builtin.ImportError("Failed to load remote module");
                }

                var promise;

                function mapUrlToPromise(path) {
                    return new Promise(function(resolve, reject) {
                        let scriptElement = document.createElement("script");
                        scriptElement.type = "text/javascript";
                        scriptElement.src = path;
                        scriptElement.async = true
                        scriptElement.onload = function() {
                            resolve(true);
                        }

                        document.body.appendChild(scriptElement);
                    });
                }

                if (externalLibraryInfo.loadDepsSynchronously) {
                    promise = (externalLibraryInfo.dependencies || []).reduce((p, url) => {
                        return p.then(() => mapUrlToPromise(url));
                    }, Promise.resolve()); // initial
                } else {
                    promise = Promise.all((externalLibraryInfo.dependencies || []).map(mapUrlToPromise));
                }

                return promise.then(function() {
                    return code;
                }).catch(function() {
                    throw new Sk.builtin.ImportError("Failed to load dependencies required");
                });
            })
        );
    }

    throw new Error("File not found: '" + x + "'");
 }
  function stopCode() {
    dispatch(stopCodeRun());
  }

  const runCode = () => {
    // clear previous output
    dispatch(setError(""));
    outputCanvas.current.innerHTML = '';
    output.current.innerHTML = '';
    domOutput.current.innerHTML = '';

    var prog = projectCode[0].content;
    Sk.configure({output:outf, read:builtinRead, killableWhile: true});
    (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'outputCanvas';
    var myPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, prog, true),{
          "*": () => {
            if (codeRunStopped) throw "Execution interrupted"
          }
        };
    });
    myPromise.then(function(mod) {
        // console.log('success');
    },
        function(err) {
        console.log(err.toString());
        dispatch(setError(err.toString()));
    });
  }

  return (
    <div className="pythonrunner-container">
      <ErrorMessage />
      <div className="pythonrunner-canvas-container">
        <div id='outputCanvas' ref={outputCanvas} className="pythonrunner-graphic" />
      </div>
      <div className="pythonrunner-console" ref={output} />
      <div id='mycanvas' ref={domOutput} />
    </div>
  );
};

export default PythonRunner;
