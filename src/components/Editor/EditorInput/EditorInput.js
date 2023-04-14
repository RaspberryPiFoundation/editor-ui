import React, { useEffect, useState } from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import { closeFile, setOpenFiles } from '../EditorSlice'
import NewInputPanelButton from '../NewInputPanelButton/NewInputPanelButton'
import { Tab, TabList, Tabs } from 'react-tabs'
import Button from '../../Button/Button'
import { CloseIcon } from '../../../Icons'

const EditorInput = () => {
  const openFiles = useSelector((state) => state.editor.openFiles)
  const components = useSelector((state) => state.editor.project.components)
  const [isMounted, setIsMounted] = useState(false)
  const dispatch = useDispatch()
  useEffect(() => {
    setIsMounted(true)
  })

  const onDragEnd = (result) => {
    if(!result.destination) return
    const { source, destination } = result
    var openFilesData = [...openFiles]

    var oldPane = [...openFilesData[source.droppableId]]
    const [removed] = oldPane.splice(source.index, 1)
    openFilesData[source.droppableId] = [...oldPane]

    var newPane = [...openFilesData[destination.droppableId]]
    newPane.splice(destination.index, 0, removed)
    openFilesData[destination.droppableId] = [...newPane]
    dispatch(setOpenFiles(openFilesData))
  }

  const closeFileTab = (e, fileName) => {
    e.stopPropagation()
    dispatch(closeFile(fileName))
  }

  return (
    <>
      <NewInputPanelButton />
      <div className='proj-editor-container'>
        <DragDropContext onDragEnd={result => onDragEnd(result)}>
          {isMounted ?
            <div style={{display: 'flex', flexDirection: 'column'}}>
              {openFiles.map((panel, index) => (
                <Tabs>
                  <TabList>
                    <Droppable direction='horizontal' droppableId={`${index}`} key={index} index={index}>
                      {(provided, snapshot) => (
                        <div tabsRole='Tab' {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex' }}>
                          {panel.map((fileName, item_index) => (
                            <Draggable key={item_index} draggableId={`draggable${index}_${item_index}`} index={item_index}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{userSelect: 'none', ...provided.draggableProps.style}}>
                                  <Tab key={item_index}>
                                    <span
                                      className={`react-tabs__tab-inner${fileName !== 'main.py'? ' react-tabs__tab-inner--split': ''}`}
                                      // ref={tabRefs.current[project.components.findIndex(file => `${file.name}.${file.extension}`===fileName)]}
                                      >
                                        {fileName}
                                        {fileName !== 'main.py' ?
                                          <Button className='btn--tertiary react-tabs__tab-inner-close-btn' label='close' onClickHandler={(e) => closeFileTab(e, fileName)} ButtonIcon={() => <CloseIcon scaleFactor={0.85}/> }/>
                                        : null
                                        }
                                    </span>
                                  </Tab>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </TabList>
                </Tabs>
              ))}
            </div> : null
          }
        </DragDropContext>
      </div>
    </>
  )
}
export default EditorInput
