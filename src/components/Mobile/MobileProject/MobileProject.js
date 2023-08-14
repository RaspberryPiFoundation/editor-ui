import React, { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import EditorInput from "../../Editor/EditorInput/EditorInput";
import Output from "../../Editor/Output/Output";
import MobileProjectBar from "./../MobileProjectBar/MobileProjectBar";

import "./MobileProject.scss";
import { useSelector } from "react-redux";
import { CodeIcon, PreviewIcon } from "../../../Icons";
import { useTranslation } from "react-i18next";

const MobileProject = () => {
  const projectType = useSelector((state) => state.editor.project.project_type);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const [selectedTab, setSelectedTab] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (codeRunTriggered) {
      setSelectedTab(1);
    }
  }, [codeRunTriggered]);

  return (
    <div className="proj-container proj-editor-container proj-container--mobile">
      <Sidebar />
      <Tabs
        forceRenderTabPanel={true}
        selectedIndex={selectedTab}
        onSelect={(index) => setSelectedTab(index)}
      >
        <TabPanel>
          <EditorInput />
        </TabPanel>
        <TabPanel>
          <Output />
        </TabPanel>
        <MobileProjectBar />
        <div className="react-tabs__tab-container mobile-nav">
          <TabList>
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
          </TabList>
        </div>
      </Tabs>
    </div>
  );
};

export default MobileProject;
