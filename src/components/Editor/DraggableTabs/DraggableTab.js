import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Tab } from "react-tabs";

const DraggableTab = ({children, index, item_index}) => {
  return (
    <Draggable key={item_index} draggableId={`draggable${index}_${item_index}`} index={item_index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{userSelect: 'none', ...provided.draggableProps.style}}>
          <Tab key={item_index}>
            {children}
          </Tab>
        </div>
      )}
    </Draggable>
  )
};

DraggableTab.tabsRole = 'Tab'

export default DraggableTab
