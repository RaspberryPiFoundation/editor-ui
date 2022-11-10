import './Header.scss'
import { useSelector, connect, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Button from '../Button/Button';
import { SettingsIcon, SquaresIcon } from '../../Icons';
import { saveProject, updateProject } from '../../utils/apiCallHandler';
import { setProjectLoaded, setProject } from '../Editor/EditorSlice';
import { useHistory } from 'react-router-dom';
import Dropdown from '../Menus/Dropdown/Dropdown';
import SettingsMenu from '../Menus/SettingsMenu/SettingsMenu';
import ProjectName from './ProjectName';

import editor_logo from '../../assets/editor_logo.svg'
import DownloadButton from './DownloadButton';


const Header = (props) => {
  const { user } = props;
  const project = useSelector((state) => state.editor.project);

  const dispatch = useDispatch();
  let history = useHistory();
  const { t } = useTranslation()

  const onClickSave = async () => {
    if (!project.identifier) {
      const response = await saveProject(project, user.access_token)
      const identifier = response.data.identifier;
      const project_type = response.data.project_type;
      dispatch(setProjectLoaded(false));
      history.push(`/${project_type}/${identifier}`)
      return;
    }

    const response = await updateProject(project, user.access_token)

    if(response.status === 200) {
      dispatch(setProject(response.data));
      toast("Project saved!", {
        position: toast.POSITION.TOP_CENTER
      });
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
        <ProjectName />
        <div className='editor-header__right'>
          <DownloadButton />
          <Dropdown
            ButtonIcon={SettingsIcon}
            buttonText={t('header.settings')}
            MenuContent={SettingsMenu} />

          {user !== null && project.user_id === user.profile.user ? (
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
