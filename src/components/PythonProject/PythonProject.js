import React from 'react';
import PythonEditor from '../PythonEditor/PythonEditor'
import PythonViewer from '../viewers/PythonViewer/PythonViewer'

function PythonProject() {
  return (
    <div>
      <PythonEditor />
      <PythonViewer />
    </div>
  );
}

export default PythonProject;
