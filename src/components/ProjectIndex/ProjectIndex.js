import { useSelector, connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next';

import { useProjectList } from '../Editor/Hooks/useProjectList'
import { useRequiresUser } from '../Editor/Hooks/useRequiresUser'
import ProjectIndexHeader from '../ProjectIndexHeader/ProjectIndexHeader'
import ProjectListTable from '../ProjectListTable/ProjectListTable'
import Button from '../Button/Button'
import { createOrUpdateProject } from '../../utils/apiCallHandler'
import { defaultPythonProject } from '../../utils/defaultProjects'
import { PlusIcon } from '../../Icons';

const ProjectIndex = (props) => {
  const history = useHistory();
  const { isLoading, user } = props;
  const { t } = useTranslation();

  useRequiresUser(isLoading, user);
  useProjectList(user);
  const projectListLoaded = useSelector((state) => state.editor.projectListLoaded);

  const onCreateProject = async () => {
    const response = await createOrUpdateProject(defaultPythonProject, user.access_token);

    const identifier = response.data.identifier;
    const project_type = response.data.project_type;
    history.push(`/${project_type}/${identifier}`);
  }

  return (
    <>
      <ProjectIndexHeader>
        <Button
          className='btn--primary'
          onClickHandler={onCreateProject}
          buttonText='Create a new project'
          ButtonIcon={PlusIcon}
        />
      </ProjectIndexHeader>
      { projectListLoaded === true ? <ProjectListTable /> : <p>{t('projectList.loading')}...</p> }
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
