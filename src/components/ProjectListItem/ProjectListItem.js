import { useDispatch } from 'react-redux'
import { deleteProject } from '../../utils/apiCallHandler';
import { setProjectListLoaded } from '../Editor/EditorSlice';
import Button from '../Button/Button';
import './ProjectListItem.scss'

const ProjectListItem = (props) => {
  const project = props.project;
  const user = props.user;
  const dispatch = useDispatch();

  const onClickDelete = async () => {
    await deleteProject(project.identifier, user.access_token)
    dispatch(setProjectListLoaded(false));
  }

  return (
    <li className='editor-project-list__item'>
      <a className='editor-project-list__title' href={`/${project.project_type}/${project.identifier}`}>
        {project.name || 'Unnamed project'}
      </a>

      <Button className='editor-project-list__action' onClickHandler={onClickDelete} buttonText='Delete Project' confirmText='Are you sure you want to delete the project?' />

    </li>
  );
};

export default ProjectListItem;
