import { useSelector, connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useProjectList } from '../Editor/Hooks/useProjectList'
import { useRequiresUser } from '../Editor/Hooks/useRequiresUser'
import ProjectListItem from '../ProjectListItem/ProjectListItem'
import Button from '../Button/Button'
import { createProject } from '../../utils/apiCallHandler';
import { defaultPythonProject } from '../../utils/defaultProjects'

const ProjectIndex = (props) => {
  const history = useHistory();
  const { isLoading, user } = props;

  useRequiresUser(isLoading, user);
  useProjectList(user);
  const projectListLoaded = useSelector((state) => state.editor.projectListLoaded);
  const projectList = useSelector((state) => state.editor.projectList);

  const onCreateProject = async () => {
    const response = await createProject(defaultPythonProject, user.access_token);

    const identifier = response.data.identifier;
    const project_type = response.data.project_type;
    history.push(`/${project_type}/${identifier}`);
  }

  return projectListLoaded === true ? (
    <div className='main-container'>
      <div>
        <Button onClickHandler={onCreateProject} buttonText="Create Project" />
      </div>
      { projectList.map((project, i) => (
          <ProjectListItem project={project} user={user} key={i}/>
        )
      )}
    </div>
  ) : (
    <>
    <p>Loading</p>
    </>
  );
};

function mapStateToProps(state) {
  return {
    isLoading: state.auth.isLoadingUser,
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(ProjectIndex);
