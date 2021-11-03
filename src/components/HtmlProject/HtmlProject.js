import React from 'react';
import HtmlEditor from '../HtmlEditor/HtmlEditor'
import HtmlViewer from '../viewers/HtmlViewer/HtmlViewer'

function HtmlProject() {
  return (
    <div>
      <div>
        <h1>HTML Project</h1>
      </div>
      <HtmlEditor />
      <HtmlViewer />
    </div>
  );
}

export default HtmlProject;
