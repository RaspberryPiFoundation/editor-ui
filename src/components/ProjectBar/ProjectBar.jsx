import "../../assets/stylesheets/ProjectBar.scss";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import SaveStatus from "../SaveStatus/SaveStatus";
import DownloadIcon from "../../utils/DownloadIcon";
import ProjectName from "../ProjectName/ProjectName";
import DownloadButton from "../DownloadButton/DownloadButton";
import SaveButton from "../SaveButton/SaveButton";

const ProjectBar = () => {
  const { t } = useTranslation();

  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
  const loading = useSelector((state) => state.editor.loading);
  const saving = useSelector((state) => state.editor.saving);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);

  return (
    loading === "success" && (
      <div className="project-bar">
        {/* TODO: Look into alternative approach so we don't need hidden h1 */}
        <h1 style={{ height: 0, width: 0, overflow: "hidden" }}>
          {project.name || t("header.newProject")}
        </h1>
        {loading === "success" ? <ProjectName /> : null}
        <div className="project-bar__right">
          {loading === "success" ? (
            <div className="project-bar__btn-wrapper">
              <DownloadButton
                buttonText={t("header.download")}
                className="project-bar__btn btn--download"
                Icon={DownloadIcon}
                type="tertiary"
              />
            </div>
          ) : null}
          <div className="project-bar__btn-wrapper">
            <SaveButton className="project-bar__btn btn--save" />
          </div>
          {lastSavedTime && user ? (
            <SaveStatus saving={saving} lastSavedTime={lastSavedTime} />
          ) : null}
        </div>
      </div>
    )
  );
};

export default ProjectBar;
