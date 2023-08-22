import React, { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import EditorInput from "../../Editor/EditorInput/EditorInput";
import Output from "../../Editor/Output/Output";
import MobileProjectBar from "./../MobileProjectBar/MobileProjectBar";

import "./MobileProject.scss";
import { useDispatch, useSelector } from "react-redux";
import { CodeIcon, PreviewIcon, MenuIcon } from "../../../Icons";
import { useTranslation } from "react-i18next";
import Sidebar from "../../Menus/Sidebar/Sidebar";
import {
  expireJustLoaded,
  syncProject,
  showSidebar,
} from "../../Editor/EditorSlice";
import { isOwner } from "../../../utils/projectHelpers";

const MobileProject = () => {
  const projectType = useSelector((state) => state.editor.project.project_type);
  const sidebarShowing = useSelector((state) => state.editor.sidebarShowing);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const [selectedTab, setSelectedTab] = useState(0);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openSidebar = () => dispatch(showSidebar());

  useEffect(() => {
    if (codeRunTriggered) {
      setSelectedTab(1);
    }
  }, [codeRunTriggered]);

  // TODO: copy/paste autosave functionality from project code needs centralising or refactor
  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
  const justLoaded = useSelector((state) => state.editor.justLoaded);

  useEffect(() => {
    if (user && localStorage.getItem("awaitingSave")) {
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
      }
      localStorage.removeItem("awaitingSave");
      return;
    }
    let debouncer = setTimeout(() => {
      if (isOwner(user, project) && project.identifier) {
        if (justLoaded) {
          dispatch(expireJustLoaded());
        }
        dispatch(
          syncProject("save")({
            project,
            accessToken: user.access_token,
            autosave: true,
          }),
        );
      } else {
        if (justLoaded) {
          dispatch(expireJustLoaded());
        } else {
          localStorage.setItem(
            project.identifier || "project",
            JSON.stringify(project),
          );
        }
      }
    }, 2000);

    return () => clearTimeout(debouncer);
  }, [dispatch, project, user, justLoaded]);

  return sidebarShowing ? (
    <Sidebar />
  ) : (
    <div className="proj-container proj-editor-container proj-container--mobile">
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
          <span
            className="react-tabs__tab-inner mobile-nav__menu"
            onClick={openSidebar}
          >
            <MenuIcon />
          </span>
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
