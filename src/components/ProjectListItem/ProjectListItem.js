import { useDispatch } from 'react-redux'
import Button from '../Button/Button';
import { deleteProject } from '../../utils/apiCallHandler';
import { setProjectListLoaded } from '../Editor/EditorSlice';

const ProjectListItem = (props) => {
  const project = props.project;
  const user = props.user;
  const dispatch = useDispatch();

  const onClickDelete = async () => {
    await deleteProject(project.identifier, user.access_token)
    dispatch(setProjectListLoaded(false));
  }

  return (
    <div>
      {project.name || 'Unnamed project'}
      <a className='btn btn--primary' href={`/${project.project_type}/${project.identifier}`}>
        Open Project
      </a>

      <Button className='btn--primary' onClickHandler={onClickDelete} buttonText='Delete Project' confirmText='Are you sure you want to delete the project?' />

    </div>
  );
};

export default ProjectListItem;
