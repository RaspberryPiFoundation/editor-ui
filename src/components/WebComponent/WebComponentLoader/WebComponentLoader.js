import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { setProject, setProjectLoaded } from '../../Editor/EditorSlice';
import WebComponentProject from '../Project/WebComponentProject';

const ProjectComponentLoader = (props) => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const { code, visualoutput } = props;
  const dispatch = useDispatch()

  useEffect(() => {
    const proj = {
      type: 'python',
      components: [{ name: 'main', extension: 'py', content: code, visualoutput: visualoutput}]
    }
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
