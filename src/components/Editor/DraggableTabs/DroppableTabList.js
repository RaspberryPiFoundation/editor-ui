import React from "react"
import { Droppable } from "react-beautiful-dnd"
import { TabList } from "react-tabs"

const DroppableTabList = ({children, index, ...otherProps}) => {
  return (
    <TabList {...otherProps }>
      <Droppable direction='horizontal' droppableId={`${index}`}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', width: '100%' }}>
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
