import "./ProjectBar.scss";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Autosave from "./Autosave";
import Button from "../Button/Button";
import { DownloadIcon, SaveIcon } from "../../Icons";
import { syncProject, showLoginToSaveModal } from "../Editor/EditorSlice";
import ProjectName from "./ProjectName";
import DownloadButton from "../DownloadButton/DownloadButton";
import { isOwner } from "../../utils/projectHelpers";

const ProjectBar = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
  const loading = useSelector((state) => state.editor.loading);
  const saving = useSelector((state) => state.editor.saving);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);

  const onClickSave = async () => {
    window.plausible("Save button");

    if (isOwner(user, project)) {
      dispatch(
        syncProject("save")({
          project,
          accessToken: user.access_token,
          autosave: false,
        }),
      );
    } else if (user && project.identifier) {
      dispatch(
        syncProject("remix")({ project, accessToken: user.access_token }),
      );
    } else {
      dispatch(showLoginToSaveModal());
    }
  };

  return (
    loading === "success" && (
      // <div className="project-wrapper">
      <div className="project-bar">
        {/* TODO: Look into alternative approach so we don't need hidden h1 */}
        <h1 style={{ height: 0, width: 0, overflow: "hidden" }}>
          {project.name || t("header.newProject")}
        </h1>
        {loading === "success" ? <ProjectName /> : null}
        <div className="project-bar__right">
          {loading === "success" ? (
            <DownloadButton
              buttonText={t("header.download")}
              className="btn--tertiary"
              Icon={DownloadIcon}
              buttonIconPosition="right"
            />
          ) : null}
          {loading === "success" ? (
            <Button
              className="btn--primary btn--save"
              onClickHandler={onClickSave}
              buttonText={t("header.save")}
              ButtonIcon={SaveIcon}
            />
          ) : null}
          {lastSavedTime && user ? (
            <Autosave saving={saving} lastSavedTime={lastSavedTime} />
          ) : null}
        </div>
      </div>
      // </div>
    )
  );
};

export default ProjectBar;
