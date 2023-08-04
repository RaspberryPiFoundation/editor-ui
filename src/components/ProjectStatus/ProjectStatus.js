import "./ProjectStatus.scss";
import SaveButton from "../SaveButton/SaveButton";
import ProjectName from "../ProjectName/ProjectName";
import { useSelector } from "react-redux";

// import { useTranslation } from "react-i18next";

const ProjectStatus = () => {
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const user = useSelector((state) => state.auth.user);
  const saving = useSelector((state) => state.editor.saving);
  return (
    <div className="project-status">
      <p>Project status</p>
      {lastSavedTime && user ? (
        <SaveButton saving={saving} lastSavedTime={lastSavedTime} />
      ) : null}
      <span>
        Project name <ProjectName />
      </span>
    </div>
  );
};

export default ProjectStatus;
