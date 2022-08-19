import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { setProject, setProjectLoaded, setSenseHatAlwaysEnabled } from '../../Editor/EditorSlice';
import WebComponentProject from '../Project/WebComponentProject';

const ProjectComponentLoader = (props) => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const { code, senseHatAlwaysEnabled } = props;
  const dispatch = useDispatch()

  useEffect(() => {
    const proj = {
      type: 'python',
      components: [{ name: 'main', extension: 'py', content: code }]
    }
    dispatch(setSenseHatAlwaysEnabled(senseHatAlwaysEnabled))
    dispatch(setProject(proj))
    dispatch(setProjectLoaded(true))
  }, []);



  return projectLoaded === true ? (
    <>
      <WebComponentProject />
    </>
  ) : (
    <>
    <p>Loading</p>
    </>
  );
};

export default ProjectComponentLoader;
