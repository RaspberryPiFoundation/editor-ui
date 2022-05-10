import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { setProject, setProjectLoaded } from '../../Editor/EditorSlice';
import Project from '../Project/Project'

const ProjectComponentLoader = (props) => {
  const projectLoaded = useSelector((state) => state.editor.projectLoaded);
  const { code } = props;
  const dispatch = useDispatch()

  useEffect(() => {
    const proj = {
      type: 'python',
      components: [{ name: 'main', extension: 'py', content: code }]
    }
    dispatch(setProject(proj))
    dispatch(setProjectLoaded(true))
  }, []);



  return projectLoaded === true ? (
    <>
      <Project />
    </>
  ) : (
    <>
    <p>Loading</p>
    </>
  );
};

export default ProjectComponentLoader;
