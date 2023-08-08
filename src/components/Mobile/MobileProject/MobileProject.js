import React from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import EditorInput from "../../Editor/EditorInput/EditorInput";
import Output from "../../Editor/Output/Output";

import "./MobileProject.scss";
import { useSelector } from "react-redux";
import { CodeIcon, PreviewIcon } from "../../../Icons";
import { useTranslation } from "react-i18next";

const MobileProject = () => {
  const projectType = useSelector((state) => state.editor.project.project_type);
  const { t } = useTranslation();

  return (
    <div className="proj-container proj-container--mobile">
      <Tabs forceRenderTabPanel={true}>
        <TabPanel>
          <EditorInput isMobile />
        </TabPanel>
        <TabPanel>
          <Output isMobile />
        </TabPanel>
        <TabList>
          <div className="mobile-nav">
            <Tab>
              <span className="react-tabs__tab-inner">
                <CodeIcon />
                {t("mobile.code")}
              </span>
            </Tab>
            <Tab>
              <span className="react-tabs__tab-inner">
                <PreviewIcon />
                {projectType === "html"
                  ? t("mobile.preview")
                  : t("mobile.output")}
              </span>
            </Tab>
          </div>
        </TabList>
      </Tabs>
    </div>
  );
};

export default MobileProject;
