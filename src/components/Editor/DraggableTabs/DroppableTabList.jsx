import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { TabList } from "react-tabs";

import "../../../assets/stylesheets/DraggableTabs.scss";

const DroppableTabList = ({ children, index, ...otherProps }) => {
  return (
    <TabList {...otherProps}>
      <Droppable direction="horizontal" droppableId={index.toString()}>
        {({ innerRef, droppableProps, placeholder }) => (
          <div
            className="droppable-tab-list"
            {...droppableProps}
            ref={innerRef}
          >
            {children}
            {placeholder}
          </div>
        )}
      </Droppable>
    </TabList>
  );
};

DroppableTabList.tabsRole = "TabList";

export default DroppableTabList;
