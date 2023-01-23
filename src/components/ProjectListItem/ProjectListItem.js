import { intlFormatDistance } from 'date-fns'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next';
import { showDeleteProjectModal, showRenameProjectModal } from '../Editor/EditorSlice';
import Button from '../Button/Button';
import editor_logo from '../../assets/editor_logo.svg'
import './ProjectListItem.scss'
import { BinIcon, PencilIcon } from '../../Icons';
import ProjectActionsMenu from '../Menus/ProjectActionsMenu/ProjectActionsMenu';

const ProjectListItem = (props) => {
  const project = props.project;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const lastSaved = intlFormatDistance(new Date(project.updated_at), Date.now(), { style: 'short' });

  const openRenameProjectModal = () => {
    dispatch(showRenameProjectModal(project))
  }

  const openDeleteProjectModal = () => {
    dispatch(showDeleteProjectModal(project))
  }

  return (
    <div className='editor-project-list__item'>
      <div className='editor-project-list__info'>
        <a className='editor-project-list__title' href={`/projects/${project.identifier}`}>
          <img className='editor-project-list__type' src={editor_logo} alt={t('header.editorLogoAltText')}/>
          <div className='editor-project-list__name'>{project.name}</div>
        </a>
        <div className='editor-project-list__updated'>{lastSaved}</div>
      </div>
      <div className='editor-project-list__actions'>
        <Button className='btn--tertiary editor-project-list__rename' buttonText={t('projectList.rename')} ButtonIcon={PencilIcon} onClickHandler={openRenameProjectModal} />
        <Button className='btn--tertiary editor-project-list__delete' buttonText={t('projectList.delete')} ButtonIcon={BinIcon} onClickHandler={openDeleteProjectModal} />
      </div>
      <ProjectActionsMenu project = {project} />
    </div>
  );
};

export default ProjectListItem;
