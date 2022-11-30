import './Header.scss'
import { useSelector, connect, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next';

import AutosaveStatus from './AutosaveStatus';
import Button from '../Button/Button';
import { DownloadIcon, SettingsIcon, SquaresIcon } from '../../Icons';
import { remixProject, saveProject, showLoginToSaveModal } from '../Editor/EditorSlice';
import Dropdown from '../Menus/Dropdown/Dropdown';
import SettingsMenu from '../Menus/SettingsMenu/SettingsMenu';
import ProjectName from './ProjectName';
import editor_logo from '../../assets/editor_logo.svg'
import DownloadButton from './DownloadButton';
import { isOwner } from '../../utils/projectHelpers'

const Header = () => {
  const user = useSelector((state) => state.auth.user)
  const project = useSelector((state) => state.editor.project);
  const projectLoaded = useSelector((state) => state.editor.projectLoaded)
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime)

  const dispatch = useDispatch();
  const { t } = useTranslation()

  const onClickSave = async () => {
    if (isOwner(user, project)) {
      dispatch(saveProject({project: project, user: user, autosave: false}))
    } else if (user) {
      dispatch(remixProject({project: project, user: user}))
    } else {
      dispatch(showLoginToSaveModal())
    }
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
          { lastSavedTime && user ? <AutosaveStatus /> : null }
          { projectLoaded === 'success' ?
          <DownloadButton buttonText={t('header.download')} className='btn--tertiary' Icon={DownloadIcon}/>
          : null }
          <Dropdown
            ButtonIcon={SettingsIcon}
            buttonText={t('header.settings')}
            MenuContent={SettingsMenu} />
          {projectLoaded === 'success' ?
            <Button className='btn--save' onClickHandler = {onClickSave} buttonText = {t('header.save')} />
          : null }
        </div>
      </header>
    </div>
  )
};

export default Header;
