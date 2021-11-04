import './HtmlViewer.css';
import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux'

function HtmlViewer() {
  const codeDictionary = useSelector((state) => state.editor.code_dict)
  const projectCode = useSelector((state) => state.editor.project.components);
  const output = useRef();

  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type })
    return URL.createObjectURL(blob)
  }

  useEffect(() => {
    // TODO: get html files and handle urls for non index pages
    var indexPage = projectCode[0].content;

    var cssFiles = projectCode.reduce((arr, el) =>
      (el.lang === 'css' && arr.push(el), arr), [])
    cssFiles.forEach(cssFile => {
      var cssFileBlob = getBlobURL(cssFile.content, 'text/css');
      indexPage = indexPage.replace(`href="${cssFile.name}.css"`, `href="${cssFileBlob}"`)
    });

    var blob = getBlobURL(indexPage, 'text/html');
    output.current.src = blob;
  }, [projectCode]);

  const runCode = () => {
    // TODO: get html files and handle urls for non index pages
    var indexPage = projectCode[0].content;

    var cssFiles = projectCode.reduce((arr, el) => (el.lang === 'css' && arr.push(el), arr), [])
    cssFiles.forEach(cssFile => {
      var cssFileBlob = getBlobURL(cssFile.content, 'text/css');
      indexPage = indexPage.replace(`href="${cssFile.name}.css"`, `href="${cssFileBlob}"`)
    });

    var blob = getBlobURL(indexPage, 'text/html');
    output.current.src = blob;
  }

  return (
    <div>
      <button className="" onClick={() => runCode()}>Run</button>
      <div className="htmlv-output-container">
        <iframe id="output-frame" title="html-output-frame" ref={output} />
      </div>
    </div>
  );
}

export default HtmlViewer;
