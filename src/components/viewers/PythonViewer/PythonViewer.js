import './PythonViewer.css';
import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Sk from "skulpt"

function PythonViewer() {
  const code = useSelector((state) => state.editor.code)
  const outputCanvas = useRef();
  const output = useRef();

  const outf = (text) => {
    const node = output.current;
    node.innerHTML = node.innerHTML + text + "<br />";
  }

  const builtinRead = (x) => {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
  }

  const runCode = () => {
    var prog = code;
    // mypre.innerHTML = '';
    Sk.configure({output:outf, read:builtinRead});
    (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'outputCanvas';
    var myPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function(mod) {
        console.log('success');
    },
        function(err) {
        console.log(err.toString());
    });
  }

  return (
    <div>
      <button className="" onClick={() => runCode()}>Run</button>
      <div className="output-container">
        <div id='outputCanvas' ref={outputCanvas} className="graphic-wrap" />
      </div>
      <div ref={output} />
    </div>
  );
}

export default PythonViewer;
