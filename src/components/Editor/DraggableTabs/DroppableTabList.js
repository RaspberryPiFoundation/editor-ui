import React from "react"
import { Droppable } from "@hello-pangea/dnd"
import { TabList } from "react-tabs"

import './DraggableTabs.scss'

const DroppableTabList = ({children, index, ...otherProps}) => {
  return (
    <TabList {...otherProps }>
      <Droppable direction='horizontal' droppableId={`${index}`}>
        {(provided) => (
          <div className = 'droppable-tab-list' {...provided.droppableProps} ref={provided.innerRef}>
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </TabList>
  )
}

DroppableTabList.tabsRole = 'TabList'

export default DroppableTabList
