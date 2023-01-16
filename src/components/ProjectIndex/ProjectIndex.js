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
import RenameProjectModal from '../Modals/RenameProjectModal';
import { showRenamedMessage } from '../../utils/Notifications';
import { useEffect } from 'react';
import DeleteProjectModal from '../Modals/DeleteProjectModal';

const ProjectIndex = (props) => {
  const history = useHistory();
  const { isLoading, user } = props;
  const { t } = useTranslation();

  useRequiresUser(isLoading, user);
  useProjectList(user);
  const projectListLoaded = useSelector((state) => state.editor.projectListLoaded);
  const renameProjectModalShowing = useSelector((state) => state.editor.renameProjectModalShowing)
  const deleteProjectModalShowing = useSelector((state) => state.editor.deleteProjectModalShowing)
  const saving = useSelector((state) => state.editor.saving)

  useEffect(() => {
    if (saving === 'success') {
      showRenamedMessage()
    }
  }, [saving])

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
      { projectListLoaded === 'success' ? <ProjectListTable /> :
        projectListLoaded === 'failed' ? <p>{t('projectList.loadingFailed')}</p> :
        <p>{t('projectList.loading')}</p> }
      { renameProjectModalShowing ? <RenameProjectModal /> : null }
      { deleteProjectModalShowing ? <DeleteProjectModal /> : null }
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
