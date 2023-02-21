import { useSelector, connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate();
  const { isLoading, user } = props;

  useRequiresUser(isLoading, user);

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
    navigate(`/projects/${identifier}`);
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
      <ProjectListTable userId={user.profile.user} />
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
