import React, { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import EditorInput from "../../Editor/EditorInput/EditorInput";
import Output from "../../Editor/Output/Output";
import MobileProjectBar from "./../MobileProjectBar/MobileProjectBar";

import "./MobileProject.scss";
import { useSelector } from "react-redux";
import { CodeIcon, PreviewIcon, MenuIcon } from "../../../Icons";
import { useTranslation } from "react-i18next";
import Sidebar from "../../Menus/Sidebar/Sidebar";

const MobileProject = () => {
  const projectType = useSelector((state) => state.editor.project.project_type);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const [selectedTab, setSelectedTab] = useState(0);
  const { t } = useTranslation();

  const [option, setOption] = useState("file");
  const toggleOption = (newOption) => {
    option !== newOption ? setOption(newOption) : setOption(null);
  };

  useEffect(() => {
    if (codeRunTriggered) {
      setSelectedTab(1);
    }
  }, [codeRunTriggered]);

  return (
    <div className="proj-container proj-editor-container proj-container--mobile">
      {option ? (
        <Tabs
          forceRenderTabPanel={true}
          selectedIndex={selectedTab}
          onSelect={(index) => setSelectedTab(index)}
        >
          <TabPanel>
            <Sidebar option={option} toggleOption={toggleOption} />
          </TabPanel>
        </Tabs>
      ) : (
        <Tabs
          forceRenderTabPanel={true}
          selectedIndex={selectedTab}
          onSelect={(index) => setSelectedTab(index)}
        >
          <TabPanel>
            <Sidebar option={option} toggleOption={toggleOption} />
          </TabPanel>
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
                  <MenuIcon />
                </span>
              </Tab>
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
      )}
    </div>
  );
};

export default MobileProject;
