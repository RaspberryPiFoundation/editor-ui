import { useSelector, connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { gql,useQuery } from '@apollo/client';
import i18n from 'i18next';
import { useRequiresUser } from '../Editor/Hooks/useRequiresUser'
import ProjectIndexHeader from '../ProjectIndexHeader/ProjectIndexHeader'
import { ProjectListTable, PROJECT_LIST_TABLE_FRAGMENT } from '../ProjectListTable/ProjectListTable'
import Button from '../Button/Button'
import { createOrUpdateProject } from '../../utils/apiCallHandler'
import { defaultPythonProject } from '../../utils/defaultProjects'
import { PlusIcon } from '../../Icons';
import RenameProjectModal from '../Modals/RenameProjectModal';
import DeleteProjectModal from '../Modals/DeleteProjectModal';
import { ProjectIndexPagination, PROJECT_INDEX_PAGINATION_FRAGMENT } from './ProjectIndexPagination.js'
import LocaleWrapper from '../LocaleWrapper/LocaleWrapper';

export const PROJECT_INDEX_QUERY = gql`
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
  const { t } = useTranslation();
  const pageSize = 8;

  useRequiresUser(isLoading, user);

  const renameProjectModalShowing = useSelector((state) => state.editor.renameProjectModalShowing)
  const deleteProjectModalShowing = useSelector((state) => state.editor.deleteProjectModalShowing)

  const onCreateProject = async () => {
    const response = await createOrUpdateProject(defaultPythonProject, user.access_token);
    const identifier = response.data.identifier;
    const locale = i18n.language;
    navigate(`/${locale}/projects/${identifier}`);
  }

  const { loading, error, data, fetchMore } = useQuery(PROJECT_INDEX_QUERY, {
    variables: { userId: user?.profile?.user, first: pageSize },
    skip: (user === undefined)
  });

  return (
    <LocaleWrapper>
      <ProjectIndexHeader>
        <Button
          className='btn--primary'
          onClickHandler={onCreateProject}
          buttonText='Create a new project'
          ButtonIcon={PlusIcon}
        />
      </ProjectIndexHeader>
      { !loading && data ?
        <>
          <ProjectListTable projectData={data.projects} />
          <ProjectIndexPagination paginationData={data.projects} fetchMore={fetchMore} pageSize={pageSize} />
        </>
        : null }
      { loading ? <p>{t('projectList.loading')}</p> : null }
      { error ? <p>{t('projectList.loadingFailed')}</p> : null }
      { renameProjectModalShowing ? <RenameProjectModal /> : null }
      { deleteProjectModalShowing ? <DeleteProjectModal /> : null }
    </LocaleWrapper>
  );
};

function mapStateToProps(state) {
  return {
    isLoading: state.auth.isLoadingUser,
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(ProjectIndex);
