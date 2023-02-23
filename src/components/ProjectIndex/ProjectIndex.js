import { useSelector, connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { gql,useQuery } from '@apollo/client';

import { useRequiresUser } from '../Editor/Hooks/useRequiresUser'
import ProjectIndexHeader from '../ProjectIndexHeader/ProjectIndexHeader'
import { ProjectIndexPagination, PROJECT_INDEX_PAGINATION_FRAGMENT } from './ProjectIndexPagination.js'
import { ProjectListTable, PROJECT_LIST_TABLE_FRAGMENT } from '../ProjectListTable/ProjectListTable'
import Button from '../Button/Button'
import { createOrUpdateProject } from '../../utils/apiCallHandler'
import { defaultPythonProject } from '../../utils/defaultProjects'
import { PlusIcon } from '../../Icons';
import RenameProjectModal from '../Modals/RenameProjectModal';
import { showRenamedMessage } from '../../utils/Notifications';
import { useEffect } from 'react';
import DeleteProjectModal from '../Modals/DeleteProjectModal';

const PROJECT_INDEX_QUERY = gql`
  query ProjectIndexQuery($userId: String, $first: Int, $last: Int, $before: String, $after: String) {
    projects(userId: $userId, first: $first, last: $last, before: $before, after: $after) {
      ...ProjectListTableFragment
      ...ProjectIndexPaginationFragment
    }
  }
  ${PROJECT_LIST_TABLE_FRAGMENT}
  ${PROJECT_INDEX_PAGINATION_FRAGMENT}
`;

const ProjectIndex = (props) => {
  const navigate = useNavigate();
  const { isLoading, user } = props;
  const pageSize = 8;

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

  const { loading, error, data, fetchMore } = useQuery(PROJECT_INDEX_QUERY, {
    variables: { userId: user.profile.user, first: pageSize }
  });

  console.log(loading)
  console.log(data)

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
      { data ?
        <>
          <ProjectListTable projectData={data.projects} />
          <ProjectIndexPagination paginationData={data.projects} fetchMore={fetchMore} pageSize={pageSize} />
        </>
        : null
      }
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
