import React, { useEffect, useState } from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import { setOpenFiles } from '../EditorSlice'

const EditorInput = () => {
  const openFiles = useSelector((state) => state.editor.openFiles)
  const components = useSelector((state) => state.editor.project.components)
  // const [panels, setPanels] = useState([openFiles])
  const [isMounted, setIsMounted] = useState(false)
  // const [panels, setPanels] = useState([openFiles])
  const dispatch = useDispatch()
  useEffect(() => {
    setIsMounted(true)
  })

  const onDragEnd = (result) => {
    if(!result.destination) return
    const { source, destination } = result
    var openFilesData = [...openFiles]
    console.log(source)
    console.log(destination)
    var oldPane = [...openFilesData[source.droppableId]]
    const [removed] = oldPane.splice(source.index, 1)
    openFilesData[source.droppableId] = [...oldPane]

    var newPane = [...openFilesData[destination.droppableId]]
    newPane.splice(destination.index, 0, removed)
    openFilesData[destination.droppableId] = [...newPane]
    console.log(openFilesData)
    dispatch(setOpenFiles(openFilesData))
  }
  
  return (
    <div className='proj-editor-container'>
      <DragDropContext onDragEnd={result => onDragEnd(result)}>
        {isMounted ?
          <div style={{display: 'flex'}}>
            {openFiles.map((panel, index) => (
              <Droppable droppableId={`${index}`} key={index} index={index}>
                {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} style={{background: snapshot.isDraggingOver ? 'pink' : 'blue', width: '50%', minHeight: 500 }}>
                      {panel.map((fileName, index) => (
                        <Draggable key={`draggable${index}`} draggableId={`draggable${index}`} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{userSelect: 'none', minHeight: '50px', backgroundColor: snapshot.isDragging ? 'crimson' : 'red', ...provided.draggableProps.style}}>
                              <span>{fileName}</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                )}
              </Droppable>
            ))}
          </div> : null
        }
        
      </DragDropContext>
    </div>
  )
}
export default EditorInput
