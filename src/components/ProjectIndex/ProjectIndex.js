import { useSelector, connect, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { gql, useQuery } from "@apollo/client";
import { useRequiresUser } from "../Editor/Hooks/useRequiresUser";
import ProjectIndexHeader from "../ProjectIndexHeader/ProjectIndexHeader";
import {
  ProjectListTable,
  PROJECT_LIST_TABLE_FRAGMENT,
} from "../ProjectListTable/ProjectListTable";
import Button from "../Button/Button";
import { PlusIcon } from "../../Icons";
import RenameProjectModal from "../Modals/RenameProjectModal";
import DeleteProjectModal from "../Modals/DeleteProjectModal";
import {
  ProjectIndexPagination,
  PROJECT_INDEX_PAGINATION_FRAGMENT,
} from "./ProjectIndexPagination.js";
import { showNewProjectModal } from "../Editor/EditorSlice";
import NewProjectModal from "../Modals/NewProjectModal";

export const PROJECT_INDEX_QUERY = gql`
  query ProjectIndexQuery(
    $userId: String
    $first: Int
    $last: Int
    $before: String
    $after: String
  ) {
    projects(
      userId: $userId
      first: $first
      last: $last
      before: $before
      after: $after
    ) {
      ...ProjectListTableFragment
      ...ProjectIndexPaginationFragment
    }
  }
  ${PROJECT_LIST_TABLE_FRAGMENT}
  ${PROJECT_INDEX_PAGINATION_FRAGMENT}
`;

const ProjectIndex = (props) => {
  const { isLoading, user } = props;
  const { t } = useTranslation();
  const pageSize = 8;

  useRequiresUser(isLoading, user);

  const newProjectModalShowing = useSelector(
    (state) => state.editor.newProjectModalShowing,
  );
  const renameProjectModalShowing = useSelector(
    (state) => state.editor.renameProjectModalShowing,
  );
  const deleteProjectModalShowing = useSelector(
    (state) => state.editor.deleteProjectModalShowing,
  );

  const dispatch = useDispatch();
  const onCreateProject = async () => {
    dispatch(showNewProjectModal());
  };

  const { loading, error, data, fetchMore } = useQuery(PROJECT_INDEX_QUERY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: { userId: user?.profile?.user, first: pageSize },
    skip: user === undefined,
  });

  return (
    <>
      <ProjectIndexHeader>
        <Button
          className="btn--primary"
          onClickHandler={onCreateProject}
          buttonText="Create a new project"
          ButtonIcon={PlusIcon}
          buttonIconPosition="right"
        />
      </ProjectIndexHeader>
      {!loading && data ? (
        <>
          <ProjectListTable projectData={data.projects} />
          <ProjectIndexPagination
            paginationData={data.projects}
            fetchMore={fetchMore}
            pageSize={pageSize}
          />
        </>
      ) : null}
      {loading ? <p>{t("projectList.loading")}</p> : null}
      {error ? <p>{t("projectList.loadingFailed")}</p> : null}
      {newProjectModalShowing ? <NewProjectModal /> : null}
      {renameProjectModalShowing ? <RenameProjectModal /> : null}
      {deleteProjectModalShowing ? <DeleteProjectModal /> : null}
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
