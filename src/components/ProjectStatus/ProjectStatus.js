import "./ProjectStatus.scss";
import SaveButton from "../SaveButton/SaveButton";
import ProjectName from "../ProjectName/ProjectName";
import { useSelector } from "react-redux";

const ProjectStatus = () => {
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const user = useSelector((state) => state.auth.user);
  const saving = useSelector((state) => state.editor.saving);
  const loading = useSelector((state) => state.editor.loading);
  return (
    loading === "success" && (
      <div className="project-status">
        {lastSavedTime && user ? (
          <SaveButton saving={saving} lastSavedTime={lastSavedTime} />
        ) : null}
        <ProjectName />
      </div>
    )
  );
};

export default ProjectStatus;
