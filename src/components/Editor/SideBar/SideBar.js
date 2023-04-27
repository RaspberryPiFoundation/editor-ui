import {
  Box,
  Flex,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  usePrevious,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RiLightbulbFlashLine } from "react-icons/ri";
import { VscLibrary } from "react-icons/vsc";
// import IdeasArea from "../documentation/IdeasArea";
// import ReferenceArea from "../documentation/ReferenceArea";
// import { useRouterState } from "../router-hooks";
// import SideBarHeader from "./SideBarHeader";
// import SideBarTab from "./SideBarTab";

export const cornerSize = 32;

/**
 * The tabbed area on the left of the UI offering access to documentation,
 * files and settings.
 */
const SideBar = ({ shown, onSidebarCollapse, onSidebarExpand, ...props }) => {
  const panes = useMemo(() => {
    const result = [
      {
        id: "reference",
        title: "References",
        icon: VscLibrary,
        // contents: <ReferenceArea />,
        contents: <div>References</div>,
        color: "gray.25",
      },
      {
        id: "ideas",
        title: "Ideas",
        icon: RiLightbulbFlashLine,
        // contents: <IdeasArea />,
        contents: <div>Ideas!</div>,
        color: "gray.25",
      },
    ];
    return result;
  }, []);
  const [tabIndex, setTabIndex] = useState(1);
  const [tab, setTab] = useState("ideas");
  const [focus, setFocus] = useState(true);
  const [slug, setSlug] = useState("something");
  // const [{ tab, slug, focus }, setParams] = useRouterState();
  const tabPanelsRef = useRef(null);
  const setPanelFocus = () => {
    const activePanel = tabPanelsRef.current.querySelector(
      "[role='tabpanel']:not([hidden])"
    );
    activePanel?.focus();
  };
  useEffect(() => {
    // Initialize from the router state. Start-up and navigation.
    const tabIndex = panes.findIndex((p) => p.id === tab);
    if (tabIndex !== -1) {
      setTabIndex(tabIndex);
      onSidebarExpand();
      if (!slug || focus) {
        setPanelFocus();
      }
    }
  }, [onSidebarExpand, panes, tab, slug, focus]);

  const previouslyShown = usePrevious(shown);
  useEffect(() => {
    // Prevents the sidebar stealing focus on initial load.
    if (
      shown &&
      (!slug || focus) &&
      previouslyShown !== undefined &&
      previouslyShown !== shown
    ) {
      setPanelFocus();
    }
  }, [previouslyShown, shown, slug, focus]);

  const handleTabChange = useCallback(
    (index) => {
      setTabIndex(index);
      // setParams({ tab: panes[index]?.id });
      onSidebarExpand();
    },
    [onSidebarExpand, panes]
  );
  // const handleTabClick = useCallback(() => {
  //   // A click on a tab when it's already selected should
  //   // reset any other parameters so we go back to the top
  //   // level.
  //   if (slug) {
  //     setParams({
  //       tab,
  //     });
  //   }
  // }, [slug, tab, setParams]);

  const handleSidebarToggled = () => {
    if (tabIndex === -1) {
      const index = panes.findIndex((p) => p.id === tab);
      setTabIndex(index !== -1 ? index : 0);
      onSidebarExpand();
    } else {
      onSidebarCollapse();
    }
  };

  return (
    <Flex height="100%" direction="column" {...props} backgroundColor="gray.25">
      {/* <SideBarHeader
        sidebarShown={shown}
        onSidebarToggled={handleSidebarToggled}
      /> */}
      <Tabs
        orientation="vertical"
        size="lg"
        variant="sidebar"
        flex="1 0 auto"
        onChange={handleTabChange}
        index={tabIndex}
        isManual={true}
      >
        <TabList>
          <Box flex={1} maxHeight="8.9rem" minHeight={8}></Box>
          {/* {panes.map((pane, current) => (
            <SideBarTab
              key={pane.id}
              handleTabClick={handleTabClick}
              active={tabIndex === current}
              tabIndex={tabIndex}
              {...pane}
            />
          ))} */}
        </TabList>
        <TabPanels ref={tabPanelsRef}>
          {panes.map((p) => (
            <TabPanel key={p.id} p={0} height="100%">
              <Flex height="100%" direction="column">
                {p.contents}
              </Flex>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default SideBar;
