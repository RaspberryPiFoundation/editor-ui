import './Header.scss'
import { useSelector, connect, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';
import { SettingsIcon, SquaresIcon } from '../../Icons';
import { saveProject } from '../Editor/EditorSlice';

import Dropdown from '../Menus/Dropdown/Dropdown';
import SettingsMenu from '../Menus/SettingsMenu/SettingsMenu';
import ProjectName from './ProjectName';
import editor_logo from '../../assets/editor_logo.svg'
import DownloadButton from './DownloadButton';

const Header = (props) => {
  const { user } = props;
  const project = useSelector((state) => state.editor.project);
  const projectLoaded = useSelector((state) => state.editor.projectLoaded)

  const dispatch = useDispatch();
  const { t } = useTranslation()

  const onClickSave = async () => {
    dispatch(saveProject({project: project, user: user, autosave: false}))
  }

  return (
    <div className='editor-header-wrapper'>
      <header className='editor-header'>
        <img className='editor-logo' src={editor_logo} alt={t('header.editorLogoAltText')}/>
        { user !== null ? (
          <a href='/projects' className='project-gallery-link'>
            {<><SquaresIcon />
            <span className='editor-header__text'>{t('header.projects')}</span></>}</a>
        ) : null }
        { projectLoaded === 'success' ? <ProjectName /> : null }
        <div className='editor-header__right'>
          { projectLoaded === 'success' ? <DownloadButton /> : null }
          <Dropdown
            ButtonIcon={SettingsIcon}
            buttonText={t('header.settings')}
            MenuContent={SettingsMenu} />

          {projectLoaded === 'success' && user !== null && (project.user_id === user.profile.user || !project.identifier) ? (
            <Button className='btn--save' onClickHandler = {onClickSave} buttonText = {t('header.save')} />
          ) : null }
        </div>
      </header>
    </div>
  )
};

function mapStateToProps(state) {
  return {
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(Header);
