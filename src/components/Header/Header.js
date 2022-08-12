import './Header.scss'
import { useSelector, connect, useDispatch } from 'react-redux'
import { toast } from 'react-toastify';
import Login from '../Login/Login'
import Button from '../Button/Button';
import { EditorLogo, RemixIcon, SettingsIcon, SquaresIcon } from '../../Icons';
import { saveProject, updateProject } from '../../utils/apiCallHandler';
import { setProjectLoaded, setProject } from '../Editor/EditorSlice';
import { useHistory } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import FontSizeSelector from '../Editor/FontSizeSelector/FontSizeSelector';
import Dropdown from '../Menus/Dropdown/Dropdown';
import SettingsMenu from '../Menus/SettingsMenu/SettingsMenu';
import ProjectName from './ProjectName';


const Header = (props) => {
  const { user } = props;
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const project = useSelector((state) => state.editor.project);

  const dispatch = useDispatch();
  let history = useHistory();

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
    <>
      { isEmbedded === false ? (
        <div className='main-container'>
          <Login user={user} />
        </div>
      ): null }
    <header className='editor-header'>
      <EditorLogo />
      { user !== null ? (
        <a href='/projects' className='project-gallery-link'>
          {<><SquaresIcon />
          <span className='editor-header__text'>My Projects</span></>}</a>
      ) : null }
      {user && (project.user_id === user.profile.user) ? (<ProjectName name={project.name} />) : (<h1>{project.name||"New Project"}</h1>)}
      <div className='editor-header__right'>
        <Dropdown
          ButtonIcon={SettingsIcon}
          buttonText='Settings'
          buttonTextClassName='editor-header__text'
          MenuContent={SettingsMenu} />

        {user !== null && project.user_id === user.profile.user ? (
          <Button className='btn--save' onClickHandler = {onClickSave} buttonText = "Save" />
        ) : null }
      </div>
    </header>
  </>
  )
};

function mapStateToProps(state) {
  return {
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(Header);
