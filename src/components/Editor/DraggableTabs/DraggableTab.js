import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { Tab } from "react-tabs";
import { setFocussedFileIndex } from "../EditorSlice";

const DraggableTab = ({children, panelIndex, fileIndex, ...otherProps}) => {
  const dispatch = useDispatch()

  const switchToFileTab = (panelIndex, fileIndex) => {
    dispatch(setFocussedFileIndex({panelIndex, fileIndex}))
  }
  
  return (
    <Draggable draggableId={`draggable${panelIndex}_${fileIndex}`} index={fileIndex}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{userSelect: 'none', ...provided.draggableProps.style}}>
          <Tab onClick = {(e) => {
            e.stopPropagation()
            switchToFileTab(panelIndex, fileIndex)
          }} {...otherProps} >
            {children}
          </Tab>
        </div>
      )}
    </Draggable>
  )
};

DraggableTab.tabsRole = 'Tab'

export default DraggableTab
