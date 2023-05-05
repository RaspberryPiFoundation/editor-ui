import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { useDispatch, useSelector } from "react-redux";
import { Tab } from "react-tabs";
import { setFocussedFileIndex } from "../EditorSlice";

import './DraggableTabs.scss'

const DraggableTab = ({children, panelIndex, fileIndex, ...otherProps}) => {
  const openFiles = useSelector((state) => state.editor.openFiles)
  const openFilesCount = openFiles[panelIndex].length
  const dispatch = useDispatch()

  const switchToFileTab = (panelIndex, fileIndex) => {
    dispatch(setFocussedFileIndex({panelIndex, fileIndex}))
  }

  const onKeyPress = (e, panelIndex, fileIndex) => {
    if (e.code === 'ArrowRight') {
      switchToFileTab(panelIndex, (fileIndex + 1) % openFilesCount)
    } else if (e.code === 'ArrowLeft') {
      switchToFileTab(panelIndex, (fileIndex + openFilesCount - 1) % openFilesCount )
    }
  }
  
  return (
    <Draggable  draggableId={`draggable${panelIndex}_${fileIndex}`} index={fileIndex}>
      {(provided) => (
        <div className = 'draggable-tab' ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={provided.draggableProps.style}>
          <Tab onClick = {(e) => {
            e.stopPropagation()
            switchToFileTab(panelIndex, fileIndex)
          }} onKeyDown={e => onKeyPress(e, panelIndex, fileIndex)} {...otherProps} >
            {children}
          </Tab>
        </div>
      )}
    </Draggable>
  )
};

DraggableTab.tabsRole = 'Tab'

export default DraggableTab
