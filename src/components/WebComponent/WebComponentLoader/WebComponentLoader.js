import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { setProject, setSenseHatAlwaysEnabled } from '../../Editor/EditorSlice';
import WebComponentProject from '../Project/WebComponentProject';

const ProjectComponentLoader = (props) => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const { code, sense_hat_always_enabled } = props;
  const dispatch = useDispatch()

  useEffect(() => {
    const proj = {
      type: 'python',
      components: [{ name: 'main', extension: 'py', content: code }]
    }
    dispatch(setSenseHatAlwaysEnabled(typeof sense_hat_always_enabled !== 'undefined'))
    dispatch(setProject(proj))
  }, [code, sense_hat_always_enabled, dispatch]);



  return projectLoaded === 'success' ? (
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
