import React from "react";
import SidebarPanel from "../SidebarPanel";
import ProjectImages from "./ProjectImages/ProjectImages";
import { useTranslation } from "react-i18next";

const ImagePanel = () => {
  const { t } = useTranslation();

  return (
    <SidebarPanel heading={t("imagePanel.gallery")}>
      <ProjectImages />
    </SidebarPanel>
  );
};

export default ImagePanel;
