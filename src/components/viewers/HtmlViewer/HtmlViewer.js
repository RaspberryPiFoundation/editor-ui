// import './HtmlViewer.css';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux'

function HtmlViewer() {
  const codeDictionary = useSelector((state) => state.editor.code_dict)
  // const outputCanvas = useRef();
  const output = useRef();

  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type })
    return URL.createObjectURL(blob)
  }

  const runCode = () => {
    // var prog = document.getElementById("yourcode").value;
    // console.log('ys')
    // console.log(output.contentWindow)
    // output.current.contentWindow.document.write(prog);

    var indexPage = codeDictionary.html.index;
    var blob = getBlobURL(indexPage, 'text/html');

    // output.current.src = "data:text/html;charset=utf-8," + escape(prog);
    output.current.src = blob;
  }

  return (
    <div>
      <button className="" onClick={() => runCode()}>Run</button>
      <div className="output-container">
        <iframe id="output-frame" title="html-output-frame" ref={output} />
      </div>
    </div>
  );
}

export default HtmlViewer;
