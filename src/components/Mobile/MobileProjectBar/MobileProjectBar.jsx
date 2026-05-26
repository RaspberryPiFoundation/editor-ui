import "../../../assets/stylesheets/MobileProjectBar.scss";
import SaveStatus from "../../SaveStatus/SaveStatus";
import OfflineBadge from "../../OfflineBadge/OfflineBadge";
import { useSelector } from "react-redux";
import useIsOnline from "../../../hooks/useIsOnline";
import React from "react";

const MobileProjectBar = () => {
  const projectName = useSelector((state) => state.editor.project.name);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const offlineEnabled = useSelector((state) => state.editor.offlineEnabled);
  const readOnly = useSelector((state) => state.editor.readOnly);
  const isOnline = useIsOnline();

  return (
    <div className="mobile-project-bar">
      <p className="mobile-project-bar__name">{projectName}</p>
      {!readOnly &&
        (offlineEnabled && !isOnline ? (
          <OfflineBadge />
        ) : (
          lastSavedTime && <SaveStatus isMobile={true} />
        ))}
    </div>
  );
};

export default MobileProjectBar;
