import { useSelector, connect } from 'react-redux'
import { useProjectList } from '../Editor/Hooks/useProjectList'
import { useRequiresUser } from '../Editor/Hooks/useRequiresUser'

const ProjectListItem = (props) => {
  const project = props.project
  return (
    <div>
      <a href={`/${project.project_type}/${project.identifier}`}>
        {project.name}
      </a>
    </div>
  );
};

const ProjectIndex = (props) => {
  const { isLoading, user } = props;

  useRequiresUser(isLoading, user);
  useProjectList(user);
  const projectListLoaded = useSelector((state) => state.editor.projectListLoaded);
  const projectList = useSelector((state) => state.editor.projectList);

  return projectListLoaded === true ? (
    <div className='main-container'>
      { projectList.map((project, i) => (
          <ProjectListItem project={project} key={i}/>
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
