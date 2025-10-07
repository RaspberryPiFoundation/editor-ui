import React, { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import EditorInput from "../../Editor/EditorInput/EditorInput";
import Output from "../../Editor/Output/Output";
import MobileProjectBar from "../MobileProjectBar/MobileProjectBar";

import "../../../assets/stylesheets/MobileProject.scss";
import { useDispatch, useSelector } from "react-redux";
import CodeIcon from "../../../assets/icons/code.svg";
import MenuIcon from "../../../assets/icons/menu.svg";
import StepsIcon from "../../../assets/icons/steps.svg";
import PreviewIcon from "../../../assets/icons/preview.svg";
import { useTranslation } from "react-i18next";
import Sidebar from "../../Menus/Sidebar/Sidebar";
import { showSidebar } from "../../../redux/EditorSlice";

const MobileProject = ({
  withSidebar,
  sidebarOptions = [],
  sidebarPlugins = [],
}) => {
  const projectType = useSelector((state) => state.editor.project.project_type);
  const sidebarShowing = useSelector((state) => state.editor.sidebarShowing);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const includesInstructions = sidebarOptions.includes("instructions");

  const [selectedTab, setSelectedTab] = useState(1);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openSidebar = () => dispatch(showSidebar());

  useEffect(() => {
    if (codeRunTriggered) {
      setSelectedTab(withSidebar ? 2 : 1);
    } else if (!sidebarShowing) {
      setSelectedTab(withSidebar ? 1 : 0);
    }
  }, [codeRunTriggered, sidebarShowing, withSidebar]);

  return (
    <div
      className="proj-container proj-editor-container proj-container--mobile"
      data-testid="mobile-project"
    >
      <Tabs
        forceRenderTabPanel={true}
        selectedIndex={selectedTab}
        onSelect={(index) => setSelectedTab(index)}
      >
        {withSidebar && (
          <TabPanel>
            <Sidebar options={sidebarOptions} plugins={sidebarPlugins} />
          </TabPanel>
        )}
        <TabPanel>
          <EditorInput />
        </TabPanel>
        <TabPanel>
          <Output />
        </TabPanel>
        <MobileProjectBar />
        <div className="react-tabs__tab-container mobile-nav">
          <TabList>
            {withSidebar && (
              <Tab onClick={openSidebar}>
                {includesInstructions ? <StepsIcon /> : <MenuIcon />}
                <span className="react-tabs__tab-text">
                  {includesInstructions ? t("mobile.steps") : t("mobile.menu")}
                </span>
              </Tab>
            )}
            <Tab>
              <CodeIcon />
              <span className="react-tabs__tab-text">{t("mobile.code")}</span>
            </Tab>
            <Tab>
              <PreviewIcon />
              <span className="react-tabs__tab-text">
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
