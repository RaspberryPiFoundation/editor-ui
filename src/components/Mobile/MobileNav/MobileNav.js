import React from "react";
import { Tab, TabList } from "react-tabs";

const MobileNav = () => {
  return (
    <TabList>
      <Tab>
        <span className="react-tabs__tab-inner">Code</span>
      </Tab>
      <Tab>
        <span className="react-tabs__tab-inner">Output</span>
      </Tab>
    </TabList>
  );
};

export default MobileNav;
