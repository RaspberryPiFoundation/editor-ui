import { intlFormatDistance } from 'date-fns'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next';
import { deleteProject } from '../../utils/apiCallHandler';
import { setProjectListLoaded, showRenameProjectModal } from '../Editor/EditorSlice';
import Button from '../Button/Button';
import editor_logo from '../../assets/editor_logo.svg'
import './ProjectListItem.scss'
import { EllipsisVerticalIcon, PencilIcon } from '../../Icons';
import ContextMenu from '../Menus/ContextMenu/ContextMenu';

const ProjectListItem = (props) => {
  const project = props.project;
  const user = props.user;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const lastSaved = intlFormatDistance(new Date(project.updated_at), Date.now(), { style: 'short' });

  const onClickDelete = async () => {
    await deleteProject(project.identifier, user.access_token)
    dispatch(setProjectListLoaded(false));
  }

  const openRenameProjectModal = () => {
    dispatch(showRenameProjectModal(project))
  }

  return (
    <div className='editor-project-list__item'>
      <div className='editor-project-list__info'>
        <a className='editor-project-list__title' href={`/${project.project_type}/${project.identifier}`}>
          <img className='editor-project-list__type' src={editor_logo} alt={t('header.editorLogoAltText')}/>
          <div className='editor-project-list__name'>{project.name}</div>
        </a>
        <div className='editor-project-list__updated'>{lastSaved}</div>
      </div>
      <div className='editor-project-list__actions'>
        <Button className='btn--tertiary editor-project-list__rename' buttonText={t('projectList.rename')} ButtonIcon={PencilIcon} onClickHandler={openRenameProjectModal} />
        <Button className='editor-project-list__delete' onClickHandler={onClickDelete} buttonText='Delete' confirmText='Are you sure you want to delete the project?' />
      </div>
      <ContextMenu
          align = 'end'
          direction = 'bottom'
          menuButtonClassName = 'editor-project-list__menu'
          MenuButtonIcon = {EllipsisVerticalIcon}
          menuOptions = {[
            {
              icon: PencilIcon,
              text: t('projectList.rename'),
              action: openRenameProjectModal
            }
          ]}
          offsetX={-10}
        />
    </div>
  );
};

export default ProjectListItem;
